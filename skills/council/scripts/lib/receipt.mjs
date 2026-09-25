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

// ------------------------------------------------------------- span honesty
//
// A span is inherited from the consuming repo's own map of features to code, and that map
// can be wrong - in the first real run two of twenty-five paths were: 454 lines of tests
// pinning a module that was NOT in the span, and a declared API surface with no route
// behind it. The digest gives whatever the map names the authority of a measurement, and
// nothing in the method would ever have noticed.
//
// So the receipt DISCLOSES what it noticed about the span's shape. These are disclosures,
// never refusals: a span is a product decision, and an instrument that refused one would be
// deciding what a subject is. They are reported so a person can judge the map.
//
// THE HEURISTIC, STATED IN FULL because a heuristic nobody can audit is a claim:
//
//   A file is a TEST when its path contains a `test/ tests/ __tests__/ spec/ specs/`
//   segment, or its basename matches `*.test.*`, `*.spec.*`, `test_*.{py,js,ts,mjs}` or
//   `*_test.{go,py,rs,js,ts,mjs}`.
//
//   Its SUBJECT MODULE is found by reading the file and taking every RELATIVE specifier in
//   it - anything quoted that starts `./` or `../`, plus Python's `from .x import` - and
//   resolving each against the test file's directory, trying the specifier as written, then
//   a small extension list, then `<spec>/index.<ext>`. A `foo.test.ts` additionally tries
//   its sibling `foo.ts`.
//
//   The file is an ORPHAN when at least one specifier RESOLVED to a real file and NOT ONE
//   of the resolved files is inside the span. A test whose specifiers resolve to nothing -
//   a package import, a generated path, a language this heuristic does not read - is NOT
//   reported: absence of evidence is not evidence, and a false orphan would send a Director
//   hunting a map error that is not there.

export const TEST_DIR_RE = /(^|\/)(tests?|__tests__|specs?)\//i;
export const TEST_FILE_RE = /(\.(test|spec)\.[A-Za-z0-9]+|^test_[^/]+\.(py|mjs|cjs|js|jsx|ts|tsx)|_test\.(go|py|rs|mjs|cjs|js|ts))$/i;
/** Extensions tried when resolving a relative specifier that carries none. */
export const RESOLVE_EXTS = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py', '.rs', '.go'];

/** Is this repo-relative path a test file, by the heuristic above? */
export function isTestFile(rel) {
  const p = normalizeSpanPath(rel);
  return TEST_DIR_RE.test(p) || TEST_FILE_RE.test(p.split('/').pop() ?? '');
}

/** Every relative specifier in `text`: quoted `./x` / `../x`, plus python `from .x import`. */
export function relativeSpecifiers(text) {
  const out = [];
  for (const m of String(text).matchAll(/['"`](\.\.?\/[^'"`\n]+)['"`]/g)) out.push(m[1]);
  for (const m of String(text).matchAll(/^[ \t]*from[ \t]+(\.+)([\w.]*)[ \t]+import[ \t]/gm)) {
    const up = '../'.repeat(Math.max(0, m[1].length - 1)) || './';
    out.push(`${up}${m[2].replace(/\./g, '/')}`);
  }
  return [...new Set(out)];
}

const existsFile = (root, rel) => {
  try { return fs.statSync(path.join(root, rel)).isFile(); } catch { return false; }
};

/**
 * The repo-relative paths a test file's relative specifiers actually resolve to on disk.
 * Empty means "could not tell", which is a different answer from "resolved elsewhere".
 */
export function resolveTestSubjects(root, testRel) {
  let text;
  try { text = fs.readFileSync(path.join(root, testRel), 'utf8'); } catch { return []; }
  const dir = path.posix.dirname(testRel);
  const specs = relativeSpecifiers(text);
  // `foo.test.ts` -> `foo.ts`: the convention that needs no import to be readable.
  const base = testRel.split('/').pop() ?? '';
  const sibling = base.replace(/\.(test|spec)(\.[A-Za-z0-9]+)$/i, '$2');
  if (sibling !== base) specs.push(`./${sibling}`);

  const found = new Set();
  for (const spec of specs) {
    let joined;
    try { joined = normalizeSpanPath(path.posix.normalize(path.posix.join(dir, spec))); } catch { continue; }
    for (const ext of RESOLVE_EXTS) {
      if (ext && /\.[A-Za-z0-9]+$/.test(joined)) continue;
      const cand = `${joined}${ext}`;
      if (existsFile(root, cand)) { found.add(cand); break; }
      const idx = `${joined}/index${ext || '.ts'}`;
      if (ext === '' && existsFile(root, idx)) { found.add(idx); break; }
    }
  }
  return [...found].sort();
}

/**
 * Disclosures about the span's shape. `files` is the expanded, repo-relative file list.
 * Pure of judgement: it reports, it never refuses and it never edits the span.
 */
export function spanDisclosures(root, files) {
  const inSpan = new Set(files);
  const tests = files.filter(isTestFile);
  const orphanTests = [];
  for (const t of tests) {
    const subjects = resolveTestSubjects(root, t);
    if (!subjects.length) continue;                       // could not tell - not an orphan
    if (subjects.some((s) => inSpan.has(s))) continue;    // its subject is in the span
    orphanTests.push({ path: t, subjects });
  }
  return {
    test_file_count: tests.length,
    source_file_count: files.length - tests.length,
    orphan_tests: orphanTests,
    tests_outnumber_sources: tests.length > files.length - tests.length,
  };
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
  // The disclosures are computed from the same expanded file list the digest is built over,
  // and they are ADDITIVE: `span_digest` does not read them, so a receipt written before
  // they existed still compares byte for byte against one written after.
  const disclosures = spanDisclosures(root, entries.map((e) => e.path));
  return {
    head_sha: String(headSha ?? '').trim() || null,
    spanned_paths: declared,
    span_digest: spanDigest(entries),
    file_count: entries.length,
    missing,
    ...disclosures,
    files: entries,
  };
}
