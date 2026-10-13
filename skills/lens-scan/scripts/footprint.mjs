#!/usr/bin/env node
// lens-scan footprint - the static metrics per feature, counted from the files its contexts list
// (the code tree's file_paths). Writes through the store, method "static", with the counting rule as
// evidence; --dry prints the same rows without writing. /adopt-bp measures through measureFeatures(),
// so an onboarding baseline and every later scan are one series.
//
//   node footprint.mjs --run <id> [--structure .ai/lens-scan/app-structure.json] [--map <context-map.json>]
//                      [--root .] [--feature a,b] [--lens development|security|design|all] [--db .ai/lens-scan/scan.db] [--dry]
//
// Metrics (references/metrics.md is the catalog); --lens picks which (default development):
//   development
//     loc          non-blank lines over the feature's existing files
//     files        existing files
//     depCount     distinct bare-specifier imports (the package-name part: `@scope/name` or `name`) in
//                  .js/.jsx/.ts/.tsx/.mjs/.cjs/.mts/.cts files; relative, absolute, alias (`@/`, `~/`,
//                  `#`) and node builtin specifiers are not dependencies. Omitted when the feature has
//                  no such file.
//     testRatioPct test lines / non-test js/ts source lines * 100, one decimal, capped at 100. Test
//                  lines are the feature's own test files plus every repo test file whose stem names
//                  one of the feature's source files (`Foo.test.tsx` and `__tests__/foo.spec.ts` test
//                  `Foo.tsx`). A test file is *.test.*, *.spec.*, or under __tests__/ or tests/. Omitted
//                  when there is no non-test source line. (1.1.0: was test FILES / source files; the
//                  series breaks there, and bp's development manifest always said lines.)
//   security       over the feature's existing non-test files
//     secretHits   SECRET_PATTERNS matches (key prefixes, private-key headers, long literal credentials)
//     unsafeSinks  SINK_PATTERNS matches (eval, new Function, raw HTML injection, document.write,
//                  interpolated exec, shell: true)
//   design         over the feature's UI component files (.tsx .jsx .vue .svelte .html)
//     rawLiterals  raw colours (#hex, rgb()/rgba()) written in component files instead of tokens.
//                  Omitted when the feature has no UI component file (the design lens then does not
//                  apply to it: the result names it in `no_ui`).
// A path ending in `/`, or naming a directory, stands for every tracked file under it (git ls-files;
// the files on disk without git). A file listed but missing on disk is not counted (and is reported).
// A feature with no existing file gets no row at all: unmeasured, never 0. bundleKb is not measured
// here: chunk attribution per feature needs a stats format this script does not parse robustly, so
// --bundle-stats is refused rather than half-supported.
import { readFileSync, existsSync, statSync, readdirSync, realpathSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { builtinModules } from 'node:module';
import { join, resolve, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const CODE_RE = /\.(?:[cm]?[jt]sx?|[cm]ts)$/i;
const UI_RE = /\.(?:tsx|jsx|vue|svelte|html)$/i;
const TEST_RE = /(?:^|\/)(?:__tests__|tests)\/|\.(?:test|spec)\.[^/]+$/i;
const BUILTINS = new Set(builtinModules.flatMap((m) => [m, m.replace(/^node:/, '')]));
// import x from 'y' | import 'y' | export {x} from 'y' | require('y') | import('y')
const SPEC_RE = /(?:\bimport\s+(?:type\s+)?(?:[\w*{}\s,$]+?\s+from\s+)?|\bexport\s+(?:type\s+)?[\w*{}\s,$]+?\s+from\s+|\brequire\s*\(\s*|\bimport\s*\(\s*)(['"])([^'"\n]+)\1/g;

export const SECRET_PATTERNS = [/AKIA[0-9A-Z]{16}/g, /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
  /\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{24,}/g, /\bghp_[A-Za-z0-9]{36}\b/g, /\bxox[abpr]-[A-Za-z0-9-]{10,}/g, /\bAIza[0-9A-Za-z_-]{35}\b/g,
  /(?:password|passwd|secret|api[_-]?key)\s*[:=]\s*["'][^"'\s$`{]{12,}["']/gi];
export const SINK_PATTERNS = [/\beval\s*\(/g, /\bnew\s+Function\s*\(/g, /dangerouslySetInnerHTML/g, /\.innerHTML\s*=/g,
  /document\.write\s*\(/g, /\bexec(?:Sync)?\s*\(\s*`[^`]*\$\{/g, /\bshell\s*:\s*true\b/g];
export const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b(?![-\w])|\brgba?\s*\(\s*\d/g;

export const EVIDENCE = {
  loc: 'static: non-blank lines over the existing file_paths (footprint.mjs)',
  files: 'static: existing file_paths (footprint.mjs)',
  depCount: 'static: distinct bare-specifier package names imported by js/ts files (footprint.mjs)',
  testRatioPct: 'static: test lines (own tests + repo tests named after a source file) / non-test js/ts source lines * 100, cap 100 (footprint.mjs 1.1)',
  secretHits: 'static: SECRET_PATTERNS over non-test files (footprint.mjs --lens security)',
  unsafeSinks: 'static: SINK_PATTERNS over non-test files (footprint.mjs --lens security)',
  rawLiterals: 'static: raw #hex / rgb() colours in UI component files (footprint.mjs --lens design)',
};
export const LENS_OF = { loc: 'development', files: 'development', depCount: 'development', testRatioPct: 'development', secretHits: 'security', unsafeSinks: 'security', rawLiterals: 'design' };
const UNITS = { loc: 'lines', files: 'files', depCount: 'packages', testRatioPct: '%', secretHits: 'hits', unsafeSinks: 'sinks', rawLiterals: 'literals' };

/** The package a bare specifier names, or undefined when it is not a dependency. */
export function packageOf(spec) {
  if (!spec || /^[./]/.test(spec) || /^[A-Za-z]:/.test(spec) || /^(?:@\/|~|#)/.test(spec) || /^[a-z]+:/i.test(spec) && !spec.startsWith('node:')) return undefined;
  if (spec.startsWith('node:') || BUILTINS.has(spec.split('/')[0])) return undefined;
  const parts = spec.split('/');
  if (spec.startsWith('@')) return parts.length >= 2 && parts[0].length > 1 && parts[1] ? `${parts[0]}/${parts[1]}` : undefined;
  return parts[0];
}
export function importsOf(source) {
  const out = new Set();
  for (const m of source.matchAll(SPEC_RE)) { const p = packageOf(m[2]); if (p) out.add(p); }
  return out;
}
export const isTest = (p) => TEST_RE.test(p.replace(/\\/g, '/'));
export const nonBlank = (text) => text.split(/\r?\n/).filter((l) => l.trim() !== '').length;
/** The name a test and its subject share: `Foo.test.tsx`, `foo.spec.ts`, `__tests__/foo.ts` -> `foo`. */
export const stemOf = (p) => basename(p).replace(/\.(?:test|spec)(?=\.)/i, '').replace(/\.[^.]+$/, '').toLowerCase();
const count = (text, res) => res.reduce((n, r) => n + (text.match(r)?.length ?? 0), 0);

/**
 * Pure counting over { path, text } pairs (text undefined = missing on disk). `repoTests` are other
 * { path, text } test files of the repo, matched to the feature by stem. Returns the metrics that are
 * measurable: a key is absent when its rule has nothing to count.
 */
export function countFootprint(entries, { repoTests = [] } = {}) {
  const present = entries.filter((e) => typeof e.text === 'string');
  const missing = entries.length - present.length;
  if (!present.length) return { metrics: {}, missing };
  const metrics = { loc: present.reduce((n, e) => n + nonBlank(e.text), 0), files: present.length };
  const code = present.filter((e) => CODE_RE.test(e.path));
  if (code.length) {
    const deps = new Set();
    for (const e of code) for (const p of importsOf(e.text)) deps.add(p);
    metrics.depCount = deps.size;
  }
  const sources = code.filter((e) => !isTest(e.path));
  const srcLines = sources.reduce((n, e) => n + nonBlank(e.text), 0);
  if (srcLines > 0) {
    const stems = new Set(sources.map((e) => stemOf(e.path)));
    const tests = new Map(present.filter((e) => isTest(e.path)).map((e) => [e.path, e]));
    for (const t of repoTests) if (typeof t.text === 'string' && stems.has(stemOf(t.path))) tests.set(t.path, t);
    const testLines = [...tests.values()].reduce((n, e) => n + nonBlank(e.text), 0);
    metrics.testRatioPct = Math.min(100, Math.round((testLines / srcLines) * 1000) / 10);
  }
  return { metrics, missing };
}

/** Security and design pattern counts over the same entries; `noUi` when the design rule has nothing to read. */
export function countPatterns(entries) {
  const present = entries.filter((e) => typeof e.text === 'string' && !isTest(e.path));
  if (!present.length) return { security: {}, design: {}, noUi: true };
  const security = { secretHits: present.reduce((n, e) => n + count(e.text, SECRET_PATTERNS), 0), unsafeSinks: present.filter((e) => CODE_RE.test(e.path)).reduce((n, e) => n + count(e.text, SINK_PATTERNS), 0) };
  const ui = present.filter((e) => UI_RE.test(e.path));
  return { security, design: ui.length ? { rawLiterals: ui.reduce((n, e) => n + count(e.text, [RAW_COLOR]), 0) } : {}, noUi: !ui.length };
}

/** Every repo file (git ls-files, else a walk that skips dot-dirs and node_modules), posix and root-relative. */
export function repoFiles(root) {
  try { return execFileSync('git', ['-C', root, 'ls-files'], { encoding: 'utf8', maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'ignore'] }).split(/\r?\n/).filter(Boolean); } catch { /* not git */ }
  const out = [];
  const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { if (e.name.startsWith('.') || e.name === 'node_modules') continue; const p = join(d, e.name); if (e.isDirectory()) walk(p); else out.push(relative(root, p).split('\\').join('/')); } };
  try { walk(root); } catch { /* unreadable */ }
  return out;
}

/** A path list with directory entries expanded to the files under them. */
export function expandPaths(paths, root, files = null) {
  const out = new Set();
  let all = files;
  for (const raw of paths ?? []) {
    const p = String(raw).replace(/\\/g, '/');
    let dir = p.endsWith('/');
    if (!dir) { try { dir = statSync(resolve(root, p)).isDirectory(); } catch { /* missing: kept, counted as missing */ } }
    if (!dir) { out.add(p); continue; }
    all ??= repoFiles(root);
    const pre = p.endsWith('/') ? p : `${p}/`;
    for (const f of all) if (f.startsWith(pre)) out.add(f);
  }
  return [...out];
}

/** The file_paths of every feature, from the structure's own code tree (the names its features use). */
export function featureFiles(structure, map, root = null, files = null) {
  const tree = structure.contexts?.length ? structure.contexts : map?.contexts ?? [];
  const ctx = new Map(tree.map((c) => [c.name, c.file_paths ?? []]));
  return (structure.features ?? []).filter((f) => f.status !== 'archived').map((f) => {
    const listed = [...new Set((f.contexts ?? []).flatMap((c) => ctx.get(c) ?? []))];
    return { slug: f.slug, files: root ? expandPaths(listed, root, files) : listed };
  });
}

const read = (root, p) => {
  const full = resolve(root, p);
  try {
    if (!existsSync(full) || !statSync(full).isFile() || statSync(full).size > 2_000_000) return undefined;
    const text = readFileSync(full, 'utf8');
    return text.includes('\0') ? undefined : text;
  } catch { return undefined; }
};

/**
 * Measures features into an open store run (db null = dry). `lenses`: any of development, security,
 * design. Returns one result per feature: its metrics by key, missing_files, and no_ui when the design
 * lens has no component file to read.
 */
export function measureFeatures({ structure, map, root = '.', lenses = ['development'], only, store, db, run }) {
  const files = repoFiles(root);
  let feats = featureFiles(structure, map, root, files);
  if (only) feats = feats.filter((f) => only.has(f.slug));
  const repoTests = lenses.includes('development') ? files.filter((f) => isTest(f) && CODE_RE.test(f)) : [];
  const testCache = new Map();
  const testsFor = (stems) => repoTests.filter((t) => stems.has(stemOf(t))).map((t) => { if (!testCache.has(t)) testCache.set(t, { path: t, text: read(root, t) }); return testCache.get(t); });
  const out = [];
  for (const f of feats) {
    if (db) store.activity(db, { run, kind: 'reading', feature: f.slug, lens: lenses[0], text: `footprint: ${f.files.length} listed file(s)` });
    const entries = f.files.map((p) => ({ path: p, text: read(root, p) }));
    const stems = new Set(entries.filter((e) => CODE_RE.test(e.path) && !isTest(e.path)).map((e) => stemOf(e.path)));
    const { metrics: dev, missing } = lenses.includes('development') ? countFootprint(entries, { repoTests: testsFor(stems) }) : { metrics: {}, missing: entries.filter((e) => e.text === undefined).length };
    const pat = countPatterns(entries);
    const metrics = { ...dev, ...(lenses.includes('security') ? pat.security : {}), ...(lenses.includes('design') ? pat.design : {}) };
    const rows = Object.entries(metrics).map(([metric, value]) => ({ feature: f.slug, lens: LENS_OF[metric], metric, value, unit: UNITS[metric], method: 'static', evidence: EVIDENCE[metric] }));
    if (db && rows.length) {
      store.measure(db, run, rows);
      store.activity(db, { run, kind: 'measured', feature: f.slug, lens: lenses[0], text: rows.map((r) => `${r.metric} ${r.value}`).join(', ') });
    } else if (db) store.activity(db, { run, kind: 'note', feature: f.slug, lens: lenses[0], text: 'footprint: no listed file exists; unmeasured' });
    out.push({ feature: f.slug, ...metrics, ...(missing ? { missing_files: missing } : {}), ...(lenses.includes('design') && pat.noUi ? { no_ui: true } : {}) });
  }
  return out;
}

// ------------------------------------------------------------------------------------- cli
const HELP = readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\nimport ')[0].replace(/^#!.*\n/, '').replace(/^\/\/ ?/gm, '');

export async function main(argv) {
  const store = await import('./store.mjs');
  const a = store.parseArgs(argv);
  if (a.help) return { help: HELP };
  if (a.bundleStats !== undefined) throw new store.StoreError('--bundle-stats is not supported in v1: bundleKb stays unmeasured (references/metrics.md)', 2);
  const structPath = typeof a.structure === 'string' ? a.structure : '.ai/lens-scan/app-structure.json';
  if (!existsSync(structPath)) throw new store.StoreError(`no app-structure at ${structPath} - run structure.mjs first`, 2);
  const structure = JSON.parse(readFileSync(structPath, 'utf8'));
  const map = typeof a.map === 'string' ? JSON.parse(readFileSync(a.map, 'utf8')) : undefined;
  const root = typeof a.root === 'string' ? a.root : '.';
  const lensArg = typeof a.lens === 'string' ? a.lens : 'development';
  const lenses = lensArg === 'all' ? ['development', 'security', 'design'] : lensArg.split(',').map((s) => s.trim());
  for (const l of lenses) if (!['development', 'security', 'design'].includes(l)) throw new store.StoreError(`--lens ${l}: footprint measures development, security, design or all`, 2);
  const only = typeof a.feature === 'string' ? new Set(a.feature.split(',').map((s) => s.trim()).filter(Boolean)) : undefined;
  if (only) {
    const known = new Set((structure.features ?? []).map((f) => f.slug));
    const unknown = [...only].filter((s) => !known.has(s));
    if (unknown.length) throw new store.StoreError(`not features of the structure: ${unknown.join(', ')}`, 2);
  }
  const db = a.dry ? null : store.openStore(typeof a.db === 'string' ? a.db : store.DEFAULT_DB);
  try {
    if (db && !a.run) throw new store.StoreError('--run is required (start one with store.mjs run-start --phase measure)', 2);
    return { written: !!db, features: measureFeatures({ structure, map, root, lenses, only, store, db, run: a.run }) };
  } finally { db?.close(); }
}

// run as a script: compare real paths, so a skills folder reached through a junction or symlink still runs
if (process.argv[1] && isEntry(process.argv[1], import.meta.url)) {
  main(process.argv.slice(2)).then((out) => {
    if (out?.help) process.stdout.write(out.help);
    else process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  }).catch((e) => { process.stderr.write(`footprint: ${e.message}\n`); process.exit(e.code === 2 ? 2 : 1); });
}

function isEntry(argv1, url) {
  try { return realpathSync(resolve(argv1)) === realpathSync(fileURLToPath(url)); } catch { return resolve(argv1) === fileURLToPath(url); }
}
