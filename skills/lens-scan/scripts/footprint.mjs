#!/usr/bin/env node
// lens-scan footprint - the static development metrics per feature, counted from the files its
// contexts list (context-map file_paths). Writes through the store, method "static", with the
// counting rule as evidence; --dry prints the same rows without writing.
//
//   node footprint.mjs --run <id> [--structure .ai/lens-scan/app-structure.json] [--map <context-map.json>]
//                      [--root .] [--feature a,b] [--db .ai/lens-scan/scan.db] [--dry]
//
// Metrics (references/metrics.md is the catalog):
//   loc          non-blank lines over the feature's existing files
//   files        existing files
//   depCount     distinct bare-specifier imports (the package-name part: `@scope/name` or `name`) in
//                .js/.jsx/.ts/.tsx/.mjs/.cjs/.mts/.cts files; relative, absolute, alias (`@/`, `~/`,
//                `#`) and node builtin specifiers are not dependencies. Omitted when the feature has
//                no such file.
//   testRatioPct test files / non-test source files * 100, one decimal; a test file is *.test.*,
//                *.spec.*, or under a __tests__/ or tests/ directory. Omitted when there is no
//                non-test source file.
// A file listed in file_paths but missing on disk is not counted (and is reported). A feature with
// no existing file gets no row at all: unmeasured, never 0. bundleKb is not measured here: chunk
// attribution per feature needs a stats format this script does not parse robustly, so
// --bundle-stats is refused rather than half-supported.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CODE_RE = /\.(?:[cm]?[jt]sx?|[cm]ts)$/i;
const TEST_RE = /(?:^|\/)(?:__tests__|tests)\/|\.(?:test|spec)\.[^/]+$/i;
const BUILTINS = new Set(builtinModules.flatMap((m) => [m, m.replace(/^node:/, '')]));
// import x from 'y' | import 'y' | export {x} from 'y' | require('y') | import('y')
const SPEC_RE = /(?:\bimport\s+(?:type\s+)?(?:[\w*{}\s,$]+?\s+from\s+)?|\bexport\s+(?:type\s+)?[\w*{}\s,$]+?\s+from\s+|\brequire\s*\(\s*|\bimport\s*\(\s*)(['"])([^'"\n]+)\1/g;

export const EVIDENCE = {
  loc: 'static: non-blank lines over the existing file_paths (footprint.mjs)',
  files: 'static: existing file_paths (footprint.mjs)',
  depCount: 'static: distinct bare-specifier package names imported by js/ts files (footprint.mjs)',
  testRatioPct: 'static: test files (*.test.*, *.spec.*, __tests__/, tests/) / non-test source files * 100 (footprint.mjs)',
};
const UNITS = { loc: 'lines', files: 'files', depCount: 'packages', testRatioPct: '%' };

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

/**
 * Pure counting over { path, text } pairs (text undefined = missing on disk). Returns the metrics
 * that are measurable: a key is absent when its rule has nothing to count.
 */
export function countFootprint(entries) {
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
  const tests = present.filter((e) => isTest(e.path)).length;
  const sources = code.filter((e) => !isTest(e.path)).length;
  if (sources > 0) metrics.testRatioPct = Math.round((tests / sources) * 1000) / 10;
  return { metrics, missing };
}

/** The file_paths of every feature, from the structure's features and the context tree. */
export function featureFiles(structure, map) {
  const ctx = new Map((map?.contexts ?? structure.contexts ?? []).map((c) => [c.name, c.file_paths ?? []]));
  return (structure.features ?? []).map((f) => ({ slug: f.slug, files: [...new Set((f.contexts ?? []).flatMap((c) => ctx.get(c) ?? []))] }));
}

const read = (root, p) => {
  const full = resolve(root, p);
  try {
    if (!existsSync(full) || !statSync(full).isFile()) return undefined;
    const text = readFileSync(full, 'utf8');
    return text.includes('\0') ? undefined : text;
  } catch { return undefined; }
};

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
  const only = typeof a.feature === 'string' ? new Set(a.feature.split(',').map((s) => s.trim()).filter(Boolean)) : undefined;
  let feats = featureFiles(structure, map);
  if (only) {
    const unknown = [...only].filter((s) => !feats.some((f) => f.slug === s));
    if (unknown.length) throw new store.StoreError(`not features of the structure: ${unknown.join(', ')}`, 2);
    feats = feats.filter((f) => only.has(f.slug));
  }
  const db = a.dry ? null : store.openStore(typeof a.db === 'string' ? a.db : store.DEFAULT_DB);
  try {
    if (db && !a.run) throw new store.StoreError('--run is required (start one with store.mjs run-start --phase measure)', 2);
    const out = [];
    for (const f of feats) {
      if (db) store.activity(db, { run: a.run, kind: 'reading', feature: f.slug, lens: 'development', text: `footprint: ${f.files.length} listed file(s)` });
      const { metrics, missing } = countFootprint(f.files.map((p) => ({ path: p, text: read(root, join(p)) })));
      const rows = Object.entries(metrics).map(([metric, value]) => ({ feature: f.slug, lens: 'development', metric, value, unit: UNITS[metric], method: 'static', evidence: EVIDENCE[metric] }));
      if (db && rows.length) {
        store.measure(db, a.run, rows);
        store.activity(db, { run: a.run, kind: 'measured', feature: f.slug, lens: 'development', text: rows.map((r) => `${r.metric} ${r.value}`).join(', ') });
      } else if (db) store.activity(db, { run: a.run, kind: 'note', feature: f.slug, lens: 'development', text: 'footprint: no listed file exists; unmeasured' });
      out.push({ feature: f.slug, ...metrics, ...(missing ? { missing_files: missing } : {}) });
    }
    return { written: !!db, features: out };
  } finally { db?.close(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((out) => {
    if (out?.help) process.stdout.write(out.help);
    else process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  }).catch((e) => { process.stderr.write(`footprint: ${e.message}\n`); process.exit(e.code === 2 ? 2 : 1); });
}
