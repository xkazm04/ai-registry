// reachability.mjs - which module files the running app can actually reach.
//
// Walks the static and dynamic import graph from the app entry and prints, per module (the
// same unit style-divergence.mjs scores, via lib/modules.mjs), how many of its production
// files are reachable. A module the app cannot reach is not a revitalization target; it is
// a routing question for the owner. Rebuilding one nobody can open is the failure this
// instrument exists to prevent.
//
//   node reachability.mjs [--repo <dir>] [--config <json>] [--entry <file>]... [--alias @=src]...
//                         [--floor 50] [--grouping sub|depth:N] [--json]
//
// Entry: --entry (repeatable), else config.entry (string or list), else the first that
// exists of src/main.tsx, src/main.ts, src/index.tsx, src/index.ts, src/main.jsx,
// src/index.jsx, src/main.js, src/index.js, then the <script type="module" src> of index.html.
// An .html entry is expanded to its module scripts.
//
// Resolution: aliases (--alias KEY=DIR, repeatable; config.aliases { KEY: DIR }; plus
// compilerOptions.paths from tsconfig.json, or jsconfig.json, when present; when nothing
// declares one, "@" -> "src"), relative paths, the extensions in config.resolveExtensions and
// index files, and a TS-ESM "./x.js" that names x.ts. `import ... from`, `export ... from`,
// `import('...')`, side-effect `import '...'` and `require('...')` all count. Type-only imports
// count too (conservative: they never make a file unreachable). Tests and stories are not
// entries. Bare package specifiers are ignored.
//
// Fail-loud: walking fewer than --floor files (default 50) exits 2, because a resolver
// that follows nothing reports every module dead and looks exactly like a finding.

import fs from 'node:fs';
import path from 'node:path';
import {
  readConfigFile, mergeConfig, parseGrouping, moduleOf, fileFilter, relToRoot, walkFiles,
  stripJsonComments, argReader, isMain,
} from './lib/modules.mjs';

export const DEFAULT_RESOLVE_EXT = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '/index.ts', '/index.tsx', '/index.js', '/index.jsx', '/index.mjs'];
export const DEFAULT_ENTRIES = ['src/main.tsx', 'src/main.ts', 'src/index.tsx', 'src/index.ts', 'src/main.jsx', 'src/index.jsx', 'src/main.js', 'src/index.js'];

const SPEC = /(?:import|export)\s[^'"`]*?from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|import\s+['"]([^'"]+)['"]|\brequire\(\s*['"]([^'"]+)['"]\s*\)/g;

/** Every module specifier in a source text, in order. */
export function extractSpecifiers(src) {
  const out = [];
  for (const m of src.matchAll(SPEC)) out.push(m[1] || m[2] || m[3] || m[4]);
  return out;
}

/** "@=src" -> ["@", "src"]; throws on a malformed pair. */
export function parseAliasArg(s) {
  const i = s.indexOf('=');
  if (i <= 0 || i === s.length - 1) throw new Error(`alias: expected KEY=DIR, got "${s}"`);
  return [s.slice(0, i), s.slice(i + 1)];
}

/**
 * compilerOptions.paths from a tsconfig text -> { KEY: DIR } (repo-relative).
 * "@/*": ["./src/*"] becomes "@" -> "src"; an exact key "x": ["./lib/x.ts"] stays exact
 * (marked by a trailing "$" on the key).
 */
export function parseTsconfigPaths(text, tsconfigDirRel = '.') {
  let json;
  try { json = JSON.parse(stripJsonComments(text)); } catch { return {}; }
  const co = json.compilerOptions || {};
  const base = path.posix.normalize(path.posix.join(tsconfigDirRel, co.baseUrl || '.'));
  const out = {};
  for (const [k, v] of Object.entries(co.paths || {})) {
    const target = Array.isArray(v) ? v[0] : v;
    if (typeof target !== 'string') continue;
    if (k.endsWith('/*') && (target.endsWith('/*') || target === '*')) out[k.slice(0, -2)] = path.posix.normalize(path.posix.join(base, target === '*' ? '.' : target.slice(0, -2)));
    else if (!k.includes('*')) out[k + '$'] = path.posix.normalize(path.posix.join(base, target));
  }
  return out;
}

/** The module script sources of an HTML page, repo-relative to the page's directory. */
export function entriesFromHtml(html, htmlRel = 'index.html') {
  const dir = path.posix.dirname(htmlRel);
  const out = [];
  for (const m of html.matchAll(/<script\b[^>]*\bsrc\s*=\s*['"]([^'"]+)['"][^>]*>/gi)) {
    const src = m[1];
    if (/^[a-z]+:\/\//i.test(src)) continue;
    out.push(src.startsWith('/') ? src.slice(1) : path.posix.normalize(path.posix.join(dir, src)));
  }
  return out;
}

/**
 * A resolver for one repo. `aliases` is { KEY: DIR } (DIR repo-relative); a key ending in "$"
 * matches only exactly. `isFile(abs)` is injectable for tests.
 */
export function createResolver({ repo, aliases = {}, extensions = DEFAULT_RESOLVE_EXT, isFile }) {
  const exists = isFile || ((p) => { try { return fs.statSync(p).isFile(); } catch { return false; } });
  const keys = Object.keys(aliases).sort((a, b) => b.length - a.length);
  const tryBase = (base) => {
    // path.normalize: "dir" + "/index.ts" is a mixed-separator path on Windows, and a reached
    // set keyed by one spelling never matches a file listed under the other.
    for (const e of extensions) { const p = path.normalize(base + e); if (exists(p)) return p; }
    // TS ESM: "./x.js" written in source for a file that is x.ts / x.tsx on disk.
    const m = /\.(m?)jsx?$/.exec(base);
    if (m) {
      const stem = base.slice(0, -m[0].length);
      for (const e of m[1] ? ['.mts'] : ['.ts', '.tsx']) { const p = path.normalize(stem + e); if (exists(p)) return p; }
    }
    return null;
  };
  return function resolve(fromFile, spec) {
    let base = null;
    for (const k of keys) {
      if (k.endsWith('$')) { if (spec === k.slice(0, -1)) { base = path.join(repo, aliases[k]); break; } continue; }
      if (spec === k || spec.startsWith(k + '/')) { base = path.join(repo, aliases[k], spec.slice(k.length + 1)); break; }
    }
    if (base == null) {
      if (spec.startsWith('.')) base = path.resolve(path.dirname(fromFile), spec);
      else if (spec.startsWith('/')) base = path.join(repo, spec.slice(1));
      else return null;
    }
    return tryBase(base.split('?')[0]);
  };
}

/** Breadth of the import graph from entries (absolute paths). Returns the Set of reached files. */
export function walkGraph(entries, resolve, read) {
  const seen = new Set();
  const queue = [...entries];
  while (queue.length) {
    const f = queue.pop();
    if (seen.has(f)) continue;
    seen.add(f);
    if (!/\.(tsx?|mts|mjs|jsx?)$/.test(f)) continue;
    let src;
    try { src = read(f); } catch { continue; }
    for (const spec of extractSpecifiers(src)) {
      const r = resolve(f, spec);
      if (r && !seen.has(r)) queue.push(r);
    }
  }
  return seen;
}

/**
 * Group production files (repo-relative) into modules with reachable counts.
 * `reached` is a Set of repo-relative forward-slash paths.
 */
export function groupReachability(files, reached, { featuresRoot = 'src/features', rule = { kind: 'sub' }, systemPrefix = 'shared/' } = {}) {
  const rows = {};
  for (const rel of files) {
    const r2 = relToRoot(rel, featuresRoot);
    if (r2 == null) continue;
    const m = moduleOf(r2, rule, systemPrefix);
    const r = (rows[m] ??= { module: m, files: 0, reachable: 0, unreachable: [] });
    r.files++;
    if (reached.has(rel)) r.reachable++; else r.unreachable.push(rel);
  }
  return Object.values(rows).sort((a, b) => a.reachable / a.files - b.reachable / b.files);
}

/** Collect aliases: CLI pairs win over config, config over tsconfig/jsconfig, "@"->"src" last. */
export function collectAliases(repo, cliPairs = [], cfgAliases = {}) {
  let ts = {};
  for (const name of ['tsconfig.json', 'jsconfig.json']) {
    const p = path.join(repo, name);
    if (fs.existsSync(p)) { ts = parseTsconfigPaths(fs.readFileSync(p, 'utf8'), '.'); if (Object.keys(ts).length) break; }
  }
  const out = { ...ts, ...cfgAliases, ...Object.fromEntries(cliPairs.map(parseAliasArg)) };
  if (!Object.keys(out).length) out['@'] = 'src';
  return out;
}

/** Resolve the entry list (repo-relative). */
export function findEntries(repo, requested = []) {
  const list = requested.length ? requested : (() => {
    const hit = DEFAULT_ENTRIES.find((e) => fs.existsSync(path.join(repo, e)));
    return hit ? [hit] : (fs.existsSync(path.join(repo, 'index.html')) ? ['index.html'] : []);
  })();
  const out = [];
  for (const e of list) {
    if (e.endsWith('.html')) {
      const p = path.join(repo, e);
      if (!fs.existsSync(p)) throw new Error(`entry ${e} does not exist`);
      out.push(...entriesFromHtml(fs.readFileSync(p, 'utf8'), e));
    } else out.push(e);
  }
  return { requested: list, files: out };
}

export function analyzeReachability(repo, cfgIn = {}, opts = {}) {
  const cfg = mergeConfig(cfgIn);
  const rule = parseGrouping(cfg.grouping);
  const requested = opts.entries?.length ? opts.entries : [].concat(cfg.entry || []);
  const { requested: entryNames, files: entryFiles } = findEntries(repo, requested);
  if (!entryFiles.length) throw new Error('no entry found - pass --entry <file>');
  for (const e of entryFiles) if (!fs.existsSync(path.join(repo, e))) throw new Error(`entry ${e} does not exist`);
  const aliases = collectAliases(repo, opts.aliasPairs || [], cfg.aliases || {});
  const resolve = createResolver({ repo, aliases, extensions: cfg.resolveExtensions || DEFAULT_RESOLVE_EXT });
  const seenAbs = walkGraph(entryFiles.map((e) => path.join(repo, e)), resolve, (f) => fs.readFileSync(f, 'utf8'));
  const reached = new Set([...seenAbs].map((p) => path.relative(repo, p).split(path.sep).join('/')));
  const isProd = fileFilter(cfg);
  const files = walkFiles(repo, cfg.featuresRoot).filter((f) => isProd(f));
  const modules = groupReachability(files, reached, { featuresRoot: cfg.featuresRoot, rule, systemPrefix: cfg.systemPrefix });
  return { entry: entryNames[0], entries: entryNames, aliases, walked: seenAbs.size, modules };
}

function main(argv) {
  const a = argReader(argv);
  const repo = path.resolve(a.get('--repo', process.cwd()));
  const cfg = readConfigFile(a.get('--config'));
  if (a.has('--grouping')) cfg.grouping = a.get('--grouping');
  const floor = +(a.get('--floor', cfg.floor ?? 50));
  const res = analyzeReachability(repo, cfg, { entries: a.all('--entry'), aliasPairs: a.all('--alias') });
  if (res.walked < floor) {
    console.error(`reachability: walked only ${res.walked} files from ${res.entries.join(', ')} - the resolver is broken, not the app small (floor ${floor}; lower it with --floor for a genuinely small app)`);
    process.exit(2);
  }
  if (!res.modules.length) { console.error(`reachability: no production files under ${mergeConfig(cfg).featuresRoot}`); process.exit(2); }
  const list = res.modules;
  if (a.has('--json')) { console.log(JSON.stringify(res, null, 1)); return; }
  const dead = list.filter((r) => r.reachable === 0);
  const partial = list.filter((r) => r.reachable > 0 && r.reachable < r.files);
  console.log(`walked ${res.walked} files from ${res.entries.join(', ')}; ${list.length} modules; ${dead.length} fully unreachable; ${partial.length} partly reachable`);
  for (const r of dead) console.log(`DEAD     ${r.module} (${r.files} files)`);
  for (const r of partial.slice(0, 40)) console.log(`PARTIAL  ${r.module} ${r.reachable}/${r.files}`);
}

if (isMain(import.meta.url)) {
  try { main(process.argv.slice(2)); } catch (e) { console.error('reachability: ' + e.message); process.exit(2); }
}
