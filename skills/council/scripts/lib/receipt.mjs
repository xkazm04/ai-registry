// receipt - what the council actually looked at, as a number.
//
// A verdict that cannot name the bytes it judged is a verdict nobody can re-run.
// The receipt pins two things: the repository revision (`head_sha`, supplied by the
// caller - this module never shells out) and a content digest over the spanned paths.
//
// THE DIGEST IS A CROSS-LANGUAGE CONTRACT. A consumer written in another language
// recomputes it to decide whether a stored verdict still describes the tree, so the
// algorithm is stated here in full and changed only by versioning the whole receipt:
//
//   1. Expand every spanned path to the regular files under it, relative to the root.
//   2. Normalise each path to POSIX separators, no leading "./", never absolute,
//      never escaping the root.
//   3. Per file, the line `<path>\0<sha256 hex of the file bytes>`.
//   4. Sort the lines by their byte order, join with "\n" (no trailing newline).
//   5. `span_digest` = sha256 hex of that string, UTF-8 encoded.
//
// Worked vector, small enough to check by hand and the one a port must reproduce:
// a tree holding `a.txt` = "alpha\n" and `b/c.txt` = "beta\n" digests to
// 5af9f997a477dcc29084a755099b65288e13751fa3436d69482e6dacb00f4081
// (the two file hashes being b6a98d9c... and f2c82dec...).
//
// Builtins only; no dependency, no spawn.

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/** Directories that are never part of a span: they are build or tool state, not the work. */
export const SPAN_SKIP_DIRS = new Set(['.git', 'node_modules', 'target', 'dist', '.next', '.venv', '__pycache__']);

export const sha256Hex = (data) => createHash('sha256').update(data).digest('hex');

/**
 * A spanned path is a repo-relative POSIX path. Anything that could reach outside the
 * root is refused here rather than sanitised: a path the council cannot name is a path
 * it must not read.
 */
export function normalizeSpanPath(p) {
  const raw = String(p ?? '').trim();
  if (!raw) throw new Error('empty spanned path');
  if (path.isAbsolute(raw) || /^[A-Za-z]:[\\/]/.test(raw)) throw new Error(`spanned path must be repo-relative: ${raw}`);
  const posix = raw.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
  if (!posix || posix === '.') throw new Error(`spanned path resolves to the root: ${raw}`);
  if (posix.split('/').some((seg) => seg === '..')) throw new Error(`spanned path escapes the root: ${raw}`);
  return posix;
}

/** Every regular file under `rel`, repo-relative and POSIX, sorted. `rel` may be a file. */
export function expandSpan(root, rel) {
  const relPosix = normalizeSpanPath(rel);
  const abs = path.join(root, relPosix);
  let st;
  try { st = fs.statSync(abs); } catch { return []; }
  if (st.isFile()) return [relPosix];
  if (!st.isDirectory()) return [];
  const out = [];
  const walk = (dirAbs, dirRel) => {
    for (const e of fs.readdirSync(dirAbs, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (SPAN_SKIP_DIRS.has(e.name)) continue;
        walk(path.join(dirAbs, e.name), `${dirRel}/${e.name}`);
      } else if (e.isFile()) {
        out.push(`${dirRel}/${e.name}`);
      }
    }
  };
  walk(abs, relPosix);
  return out.sort();
}

/** `[{ path, sha256 }]` -> the span digest. Step 3-5 of the contract above. */
export function spanDigest(entries) {
  const lines = entries.map((e) => `${normalizeSpanPath(e.path)}\0${String(e.sha256)}`).sort();
  return sha256Hex(Buffer.from(lines.join('\n'), 'utf8'));
}

/**
 * Build the receipt. `paths` are the declared span (files or directories); the returned
 * `spanned_paths` is the DECLARATION, deduplicated and sorted - the file list behind it is
 * an implementation detail of the digest, and publishing it would leak a tree's shape.
 *
 * `missing` is reported, never silently dropped: a span naming a path that is not there is
 * a broken span, and an empty span is refused outright so a digest over nothing can never
 * read as a digest over a clean tree.
 */
export function buildReceipt({ root, paths, headSha }) {
  const declared = [...new Set((paths ?? []).map(normalizeSpanPath))].sort();
  if (!declared.length) throw new Error('a receipt over an empty span is not a receipt');
  const files = [];
  const missing = [];
  for (const rel of declared) {
    const expanded = expandSpan(root, rel);
    if (!expanded.length) { missing.push(rel); continue; }
    for (const f of expanded) files.push(f);
  }
  const seen = new Set();
  const entries = [];
  for (const f of files.sort()) {
    if (seen.has(f)) continue;
    seen.add(f);
    entries.push({ path: f, sha256: sha256Hex(fs.readFileSync(path.join(root, f))) });
  }
  if (!entries.length) throw new Error(`the span matched no files: ${declared.join(', ')}`);
  return {
    head_sha: String(headSha ?? '').trim() || null,
    spanned_paths: declared,
    span_digest: spanDigest(entries),
    file_count: entries.length,
    missing,
    files: entries,
  };
}
