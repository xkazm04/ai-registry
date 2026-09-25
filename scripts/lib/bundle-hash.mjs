// The bundle content digest, in one place so the builder and its guard cannot
// disagree about what "the same bundle" means.
//
// Extracted from build-catalog.mjs when the digest turned out to be a property of
// the CHECKOUT rather than of the bundle: it hashed raw bytes, git hands a Windows
// clone CRLF and a Linux clone LF for the same commit, so whichever platform wrote
// catalog.json, the other one's `--check` failed. CI (Linux) sat red for weeks
// against hashes generated on a CRLF machine, and nobody could tell that red apart
// from a real staleness.
//
// Zero dependencies, like every other script in this lane.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/** The text form of the same rule, for comparing two GENERATED files rather than
 *  hashing a tree. `build-index.mjs --check` and `build-catalog.mjs --check` both
 *  compare a committed artifact against a fresh build, and both were comparing raw
 *  text — so on a Windows checkout (autocrlf hands the working tree CRLF while the
 *  generator writes LF) they reported every generated file as STALE when its content
 *  was byte-identical after normalization. Exactly the failure this module was
 *  extracted for, one layer up: a verdict that depends on the checkout. */
export const sameIgnoringNewlines = (a, b) => a.replace(/\r\n/g, '\n') === b.replace(/\r\n/g, '\n');

/** Drop the CR of every CRLF. Done on the BUFFER rather than through a utf8
 *  round-trip, so a binary file dropped into a bundle one day still hashes
 *  deterministically instead of being mangled into replacement characters first. */
export const stripCrLf = (buf) => {
  const out = Buffer.allocUnsafe(buf.length);
  let n = 0;
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 0x0d && buf[i + 1] === 0x0a) continue;
    out[n++] = buf[i];
  }
  return out.subarray(0, n);
};

/** Digest a bundle: sorted relative paths + their newline-normalized bytes, so the
 *  hash changes when content changes and NOT when the filesystem reorders a listing
 *  or a clone checks out with different line endings. Dotfiles never enter the
 *  digest — `.evidence.local.md` is a consumer-local overlay (rkb-profile §5).
 *
 *  Each field is LENGTH-PREFIXED, and that is load-bearing rather than tidy.
 *  Normalization has two failure directions and only one of them is loud. Too
 *  little, and a digest answers a question about the checkout — the CRLF bug this
 *  module was extracted for, which shows up as a false DIVERGED and is at least
 *  visible. Too much, or a serialization that is not injective, and two different
 *  bundles produce one digest — a false IN-SYNC, which is silent and is the state
 *  a sync key exists to make impossible. Concatenating `path` then `bytes` with no
 *  delimiter was the second kind: the file `ab.md` holding "X" and the file `ab.m`
 *  holding "dX" both fed the stream `ab.mdX`, and both hashed to
 *  sha256:f29ce5a2284c36dc. Length prefixes make the stream self-delimiting, so
 *  equal digests imply equal (path, content) sets.
 *
 *  The prefix carries the normalization's OWN version (`-b2`) because changing how
 *  a digest is computed changes every stored digest: a consumer holding a `sha256:`
 *  record cannot compare it to a `sha256-b2:` one and must say so rather than
 *  reporting drift that did not happen (`_laws.md#unknown-is-not-a-value`). */
export const hashBundle = (dir) => {
  const files = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (e.name.startsWith('.')) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else files.push(p);
    }
  };
  walk(dir);
  const h = crypto.createHash('sha256');
  for (const f of files.sort()) {
    const rel = Buffer.from(path.relative(dir, f).replace(/\\/g, '/'), 'utf8');
    const body = stripCrLf(fs.readFileSync(f));
    h.update(`${rel.length}:`); h.update(rel);
    h.update(`${body.length}:`); h.update(body);
  }
  return { hash: `sha256-b2:${h.digest('hex').slice(0, 16)}`, count: files.length };
};

/** The superseded `sha256:` scheme, kept ONLY so a reader can still evaluate a record
 *  written under it. A schema bump that cannot read the old schema does not migrate
 *  the corpus, it blinds it: the 120 stored review digests split 95 current / 25 drifted,
 *  and answering "cannot compare" to all of them would throw away the 25 real staleness
 *  signals to fix a collision none of them had hit. Delete this when no `sha256:` record
 *  remains; it is dated by that condition and by nothing else.
 *
 *  Do not call it for anything new — it is the ambiguous serialization, preserved on
 *  purpose. `hashBundle` is the one that answers "did this bundle change". */
export const hashBundleLegacy = (dir) => {
  const files = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (e.name.startsWith('.')) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else files.push(p);
    }
  };
  walk(dir);
  const h = crypto.createHash('sha256');
  for (const f of files.sort()) {
    h.update(path.relative(dir, f).replace(/\\/g, '/'));
    h.update(stripCrLf(fs.readFileSync(f)));
  }
  return { hash: `sha256:${h.digest('hex').slice(0, 16)}`, count: files.length };
};
