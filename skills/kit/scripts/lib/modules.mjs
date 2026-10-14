// lib/modules.mjs - the shared half of the kit instruments: config loading, the module
// grouping rule, the production-file filter and a tiny argv reader. Builtins only.
//
// A "module" is the unit every kit instrument counts in: divergence scores it, reachability
// says whether the app can reach it, join ranks it, coverage remembers it. All four MUST
// group a file into the same module, which is why the rule lives here and nowhere else.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_CONFIG = Object.freeze({
  // Directory (repo-relative, forward slashes) whose files are grouped into modules.
  featuresRoot: 'src/features',
  // Which files count as production UI source.
  extensions: ['.tsx'],
  exclude: '__tests__|\\.test\\.|\\.spec\\.|\\.stories\\.',
  // "sub" = feature/sub_x heuristic (see moduleOf); "depth:N" = first N directories.
  grouping: 'sub',
  // Folder(s) under featuresRoot that hold the design SYSTEM rather than a feature: a string or a
  // list (the kit plus the shared component folders, e.g. ["_components/kit", "features/shared"]).
  // System modules are measured but never offered as rebuild targets.
  systemPrefix: 'shared/',
});

/** Read a JSON config file (or return {}), merged over DEFAULT_CONFIG by the caller. */
export function readConfigFile(file) {
  if (!file) return {};
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch (e) { throw new Error(`config: cannot read ${file}: ${e.message}`); }
  try { return JSON.parse(stripJsonComments(text)); } catch (e) { throw new Error(`config: ${file} is not JSON: ${e.message}`); }
}

export function mergeConfig(over = {}) {
  return { ...DEFAULT_CONFIG, ...over };
}

/** Remove // and /* *\/ comments and trailing commas outside strings (tsconfig is JSONC). */
export function stripJsonComments(text) {
  let out = '', i = 0, inStr = false;
  while (i < text.length) {
    const c = text[i], n = text[i + 1];
    if (inStr) {
      out += c;
      if (c === '\\') { out += n ?? ''; i += 2; continue; }
      if (c === '"') inStr = false;
      i++; continue;
    }
    if (c === '"') { inStr = true; out += c; i++; continue; }
    if (c === '/' && n === '/') { while (i < text.length && text[i] !== '\n') i++; continue; }
    if (c === '/' && n === '*') { i += 2; while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++; i += 2; continue; }
    out += c; i++;
  }
  return out.replace(/,(\s*[}\]])/g, '$1');
}

/** Parse "sub" | "depth:N" into a rule object; throws on anything else. */
export function parseGrouping(rule) {
  if (rule == null || rule === 'sub') return { kind: 'sub' };
  const m = /^depth:(\d+)$/.exec(String(rule));
  if (m && +m[1] >= 1) return { kind: 'depth', n: +m[1] };
  throw new Error(`grouping: unknown rule "${rule}" (use "sub" or "depth:N", N >= 1)`);
}

/**
 * The module a file belongs to. `rel` is the path RELATIVE TO featuresRoot, forward slashes,
 * filename included (e.g. "settings/sub_admin/AdminPanel.tsx").
 *
 * Rule "sub" (the default, forged on a feature/sub_<name> layout):
 *   a.tsx                          -> "(root)"            (file directly in the root)
 *   feat/x.tsx                     -> "feat/(root)"
 *   <system>/a/x.tsx               -> "<system>/a/(root)"
 *   <system>/a/b/.../x.tsx         -> "<system>/a/b"
 *   feat/sub_a/.../x.tsx           -> "feat/sub_a"
 *   feat/a/sub_b/.../x.tsx         -> "feat/a/sub_b"
 *   feat/a/.../x.tsx               -> "feat/a"
 * Rule "depth:N": the first N directories; a file with fewer directories gets "<dirs>/(root)".
 */
export function moduleOf(rel, rule = { kind: 'sub' }, systemPrefix = 'shared/') {
  const s = rel.split('/').filter(Boolean);
  // The longest system prefix (one or more segments) that holds this file, if any.
  const sys = systemPrefixes(systemPrefix).find((p) => (rel + '/').startsWith(p + '/') && s.length > p.split('/').length);
  if (rule.kind === 'depth') {
    const dirs = s.slice(0, -1);
    if (dirs.length === 0) return '(root)';
    const m = dirs.length < rule.n ? dirs.join('/') + '/(root)' : dirs.slice(0, rule.n).join('/');
    // A depth too shallow to see a nested system folder (depth:1 over "_components/kit") would fold
    // the kit into its parent: the system prefix itself is the module then.
    const plain = m.replace(/\/\(root\)$/, '');
    if (sys && sys !== plain && sys.startsWith(plain + '/')) return sys;
    return m;
  }
  if (s.length === 1) return '(root)';
  if (sys) {
    const rest = s.slice(sys.split('/').length);
    if (rest.length === 1) return `${sys}/(root)`;
    return rest.length >= 3 ? `${sys}/${rest[0]}/${rest[1]}` : `${sys}/${rest[0]}/(root)`;
  }
  const [ft, a, b] = s;
  if (s.length === 2) return ft + '/(root)';
  if (a.startsWith('sub_')) return `${ft}/${a}`;
  if (s.length >= 4 && b.startsWith('sub_')) return `${ft}/${a}/${b}`;
  return `${ft}/${a}`;
}

/**
 * `systemPrefix` as a list: a string, a comma-separated string or an array (the kit plus the
 * shared component folders), normalised without trailing slashes, longest first.
 */
export function systemPrefixes(systemPrefix) {
  const raw = Array.isArray(systemPrefix) ? systemPrefix : String(systemPrefix ?? '').split(',');
  return [...new Set(raw.map((p) => String(p).trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')).filter(Boolean))]
    .sort((a, b) => b.length - a.length || a.localeCompare(b));
}

/** Is `module` part of the design system (vs a feature)? Any listed prefix counts. */
export function isSystemModule(module, systemPrefix = 'shared/') {
  return systemPrefixes(systemPrefix).some((p) => module === p || module.startsWith(p + '/'));
}

/** Build a predicate for production source files from config (extensions + exclude regex). */
export function fileFilter(cfg) {
  const exts = (cfg.extensions || DEFAULT_CONFIG.extensions).map(String);
  const ex = cfg.exclude ? new RegExp(cfg.exclude) : null;
  return (f) => exts.some((e) => f.endsWith(e)) && !(ex && ex.test(f));
}

/** Path relative to featuresRoot, or null when the file is outside it. */
export function relToRoot(repoRel, featuresRoot) {
  const root = featuresRoot.replace(/\\/g, '/').replace(/\/+$/, '');
  const f = repoRel.replace(/\\/g, '/');
  if (root === '' || root === '.') return f;
  return f.startsWith(root + '/') ? f.slice(root.length + 1) : null;
}

/** Recursively list files under dir (repo-relative, forward slashes). Skips node_modules and dot dirs. */
export function walkFiles(repo, dir) {
  const out = [];
  const abs = path.join(repo, dir);
  if (!fs.existsSync(abs)) return out;
  const rec = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) rec(p);
      else if (e.isFile()) out.push(path.relative(repo, p).split(path.sep).join('/'));
    }
  };
  rec(abs);
  return out.sort();
}

/** Minimal argv reader: value of a flag, all values of a repeatable flag, and booleans. */
export function argReader(argv) {
  return {
    get(k, d) { const i = argv.indexOf(k); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; },
    all(k) { const r = []; argv.forEach((a, i) => { if (a === k && i + 1 < argv.length) r.push(argv[i + 1]); }); return r; },
    has(k) { return argv.includes(k); },
  };
}

/** True when the module file is being run directly (not imported by a test). */
export function isMain(metaUrl, argv1 = process.argv[1]) {
  if (!argv1) return false;
  // Real paths on BOTH sides: a consumer runs the script through a linked skill directory
  // (.claude/skills/kit -> registry), so the invoked path and import.meta.url name the same file
  // by different paths. Comparing resolved paths made every linked run a silent no-op exit 0.
  const real = (p) => { try { return fs.realpathSync.native(p); } catch { return path.resolve(p); } };
  return real(fileURLToPath(metaUrl)).toLowerCase() === real(argv1).toLowerCase();
}
