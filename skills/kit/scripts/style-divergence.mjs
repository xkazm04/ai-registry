// style-divergence.mjs - per-module style divergence: raw-vs-token style usage per 100 LOC.
//
// Ranks the modules under a features root by how much of their styling bypasses the design
// system (raw type sizes, raw radii, raw colours, hand-rolled primitives), weighted and
// normalised per 100 lines. Re-derive, never inherit: run it at every gate, not once.
//
//   node style-divergence.mjs [--repo <dir>] [--config <json>] [--out <dir>] [--since 30]
//                             [--top N] [--csv | --json] [--cssw 0|1] [--grouping sub|depth:N]
//                             [--no-git]
//
// Output: a Markdown summary on stdout (or CSV / JSON), and with --out the files
// style-divergence.csv, style-divergence.md and style-divergence.json.
//
// Config keys (all optional; see lib/modules.mjs for the shared ones):
//   featuresRoot, extensions, exclude, grouping, systemPrefix   - which files, which modules
//   metrics        { name: { pattern, flags, weight } | { weight } | null }  merged over the
//                  defaults (null removes one; { weight } re-weights a default)
//   replaceMetrics true = start from an empty metric table instead of the defaults
//   palette        colour names for the palText / palFill defaults
//   phantomClasses class names that LOOK like tokens but are defined nowhere (default []).
//                  A project derives the list from its stylesheets: every `typo-*` (or
//                  equivalent) used in source that no stylesheet defines. phantomWeight = 3.
//   groups         { column: [metric, ...] } summary columns in the Markdown table
//   mdColumns      columns of the Markdown table
//   cssWeight      weight of raw values in co-located .css files (default 0)
//   sharedImport   import prefix that marks use of the system's components
//   contextMap     optional JSON { contexts: [{ name, group, file_paths[] }] } for a ctx column
//   lowConfLoc     modules under this LOC are flagged lowConf (default 300)
//
// Git is used for the file list, last-commit date and 30-day activity; without a git
// checkout (or with --no-git) the tree is walked and those columns are empty.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
  readConfigFile, mergeConfig, parseGrouping, moduleOf, isSystemModule, fileFilter, relToRoot,
  walkFiles, argReader, isMain,
} from './lib/modules.mjs';

const NL = '\n';
export const DEFAULT_PALETTE = ['gray', 'slate', 'zinc', 'neutral', 'stone', 'red', 'green', 'blue', 'amber', 'emerald', 'cyan', 'violet', 'purple', 'rose', 'orange', 'indigo', 'sky', 'teal', 'pink', 'fuchsia', 'lime', 'yellow'];

/** The default metric table: [RegExp, weight]. Order is the column order. */
export function defaultMetrics(palette = DEFAULT_PALETTE, phantomClasses = [], phantomWeight = 3) {
  const PAL = '(?:' + palette.join('|') + ')';
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // An empty list compiles to a pattern that can never match, so the column still exists.
  const phantom = phantomClasses.length ? new RegExp('\\b(?:' + phantomClasses.map(esc).join('|') + ')\\b', 'g') : /(?!)/g;
  return {
    rawText: [/\btext-(?:xs|sm|base|lg|xl|2xl|3xl)\b/g, 3], arbText: [/\btext-\[\d+(?:\.\d+)?(?:px|rem|em)\]/g, 2],
    typoOverride: [/\btypo-[a-z-]+[^\x22\x60]*?\btext-(?:xs|sm|base|lg|xl|2xl|3xl|\[\d)/g, 2],
    arbOther: [/\b(?:rounded|shadow|tracking|leading)-\[/g, 1.5], rawRadius: [/\brounded-(?:sm|md|lg|xl|2xl|3xl)\b/g, 1.5], bareRounded: [/(?<![\w-])rounded(?![\w-])/g, 1],
    roundFull: [/\brounded-full\b/g, 0], rawShadow: [/\bshadow-(?:sm|md|lg|xl)\b/g, 2],
    dimText: [/\btext-foreground\/[0-8]\d\b/g, 0.5], mutedFg: [/\btext-muted-foreground\b/g, 1],
    opacityDim: [/\btext-foreground\b(?!\/)[^\x22\x60]*?\bopacity-[1-8]\d\b|\bopacity-[1-8]\d\b[^\x22\x60]*?\btext-foreground\b(?!\/)/g, 0.5],
    rawBW: [/\b(?:text|bg|border|ring)-(?:white|black)\b/g, 1.5], hex: [/(?<![&\w])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g, 0.5], rgba: [/\brgba?\(/g, 0.5],
    palText: [new RegExp('[^-\\w]text-' + PAL + '-[0-9]', 'g'), 0.3], palFill: [new RegExp('(?:bg|border|ring|from|to|via)-' + PAL + '-[0-9]', 'g'), 0.2],
    button: [/<button\b/g, 0.25], overlay: [/\bfixed inset-0\b/g, 3], nativeTitle: [/<[a-z][a-z0-9]*\b[^<>]*?\stitle=[{\x22]/g, 0.5],
    pulseSpin: [/\banimate-(?:pulse|spin)\b/g, 0.75], select: [/<select\b/g, 2], table: [/<table\b/g, 2], tablist: [/role=.tablist/g, 2],
    clipboard: [/navigator\.clipboard/g, 3], toFixed: [/\.toFixed\(/g, 0.5], toLocale: [/toLocaleString\(/g, 0.5], styleObj: [/style=\{\{/g, 0.3],
    phantomTypo: [phantom, phantomWeight],
    // Adoption signals: weight 0, counted so a reader sees the token side too.
    typo: [/\btypo-[a-z]/g, 0], radiusTok: [/\brounded-(?:interactive|input|card|modal)\b/g, 0], elev: [/\bshadow-elevation-/g, 0],
    lazy: [/\blazy\(/g, 0], suspense: [/<Suspense\b/g, 0], routeSkel: [/RouteChunkSkeleton/g, 0], unifiedTable: [/\bUnifiedTable\b/g, 0],
    reveal: [/\bRevealItem\b/g, 0], modCache: [/createModuleCache/g, 0], virt: [/react-virtual|@tanstack\/virtual|useVirtualizer|react-window/g, 0],
  };
}

export const DEFAULT_GROUPS = {
  typeRaw: ['rawText', 'arbText', 'typoOverride', 'phantomTypo'],
  radius: ['rawRadius', 'bareRounded'],
  muted: ['mutedFg', 'dimText', 'opacityDim'],
  colour: ['rawBW', 'hex', 'rgba'],
  prims: ['overlay', 'select', 'table', 'tablist', 'clipboard'],
};
export const DEFAULT_MD_COLUMNS = ['module', 'score', 'debt', 'loc', 'big', 'newFiles', 'last', 'c30', 'typeRaw', 'radius', 'muted', 'colour', 'palText', 'prims', 'nativeTitle', 'pulseSpin', 'styleObj', 'cssRaw', 'sharedPer100'];

/** Resolve the metric table from config: { name: [RegExp(global), weight] }. */
export function buildMetrics(cfg = {}) {
  const base = cfg.replaceMetrics ? {} : defaultMetrics(cfg.palette || DEFAULT_PALETTE, cfg.phantomClasses || [], cfg.phantomWeight ?? 3);
  const out = { ...base };
  for (const [k, v] of Object.entries(cfg.metrics || {})) {
    if (v === null) { delete out[k]; continue; }
    if (typeof v !== 'object') throw new Error(`metrics.${k}: expected { pattern, flags, weight } or null`);
    let re = out[k]?.[0];
    if (v.pattern != null) {
      const flags = String(v.flags || 'g');
      re = new RegExp(v.pattern, flags.includes('g') ? flags : flags + 'g');
    }
    if (!re) throw new Error(`metrics.${k}: no pattern and no default to re-weight`);
    const w = v.weight ?? out[k]?.[1] ?? 0;
    if (typeof w !== 'number' || !Number.isFinite(w)) throw new Error(`metrics.${k}: weight must be a number`);
    out[k] = [re, w];
  }
  return out;
}

/** Count every metric in one source text. */
export function countMetrics(src, metrics) {
  const o = {};
  for (const [k, [re]] of Object.entries(metrics)) o[k] = (src.match(re) || []).length;
  return o;
}

/** Weighted raw usage per 100 LOC. `o` carries metric counts, loc and optionally cssRaw. */
export function scoreOf(o, metrics, cssWeight = 0) {
  const raw = Object.entries(metrics).reduce((s, [k, [, w]]) => s + w * (o[k] || 0), 0) + cssWeight * (o.cssRaw || 0);
  return raw * 100 / Math.max(o.loc || 0, 1);
}

/** Debt = the score converted back to weighted occurrences: score * loc / 100. */
export function debtOf(score, loc) { return Math.round(score * loc / 100); }

const CSSRE = /font-size:\s*[\d.]+(?:px|rem)|#[0-9a-fA-F]{3,8}\b|rgba?\(/g;

function sharedImportRe(prefix) {
  const esc = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('import\\s+(?:type\\s+)?(?:\\{([^}]*)\\}|(\\w+))\\s*from\\s*[\\x22\\x27]' + esc, 'g');
}

function defaultSharedImport(cfg) {
  const root = cfg.featuresRoot.replace(/^src\//, '').replace(/\/+$/, '');
  const sys = String(cfg.systemPrefix || '').replace(/\/+$/, '');
  return '@/' + (root ? root + '/' : '') + (sys ? sys + '/' : '') + 'components/';
}

/**
 * Analyse a repository. `io` may override { git, read, list } for tests; by default git is
 * used when the repo is a git checkout and the tree is walked otherwise.
 * Returns { files, since, rows, cohorts, weights, metrics }.
 */
export function analyze(repo, cfgIn = {}, opts = {}) {
  const cfg = mergeConfig(cfgIn);
  const rule = parseGrouping(cfg.grouping);
  const metrics = buildMetrics(cfg);
  const groups = cfg.groups || DEFAULT_GROUPS;
  const cssW = +(cfg.cssWeight ?? 0);
  const days = +(opts.since ?? 30);
  const now = opts.now ?? Date.now();
  const root = cfg.featuresRoot.replace(/\/+$/, '');
  const read = (f) => fs.readFileSync(path.join(repo, f), 'utf8');
  let useGit = !opts.noGit;
  const git = (...a) => execFileSync('git', a, { cwd: repo, encoding: 'utf8', maxBuffer: 3e8, stdio: ['ignore', 'pipe', 'ignore'] });
  if (useGit) { try { git('rev-parse', '--is-inside-work-tree'); } catch { useGit = false; } }
  const tree = useGit ? git('ls-files', root).split(NL).filter(Boolean) : walkFiles(repo, root);
  const isProd = fileFilter(cfg);
  const files = tree.filter(isProd), css = tree.filter((f) => f.endsWith('.css'));
  const modOf = (f) => moduleOf(relToRoot(f, root) ?? f, rule, cfg.systemPrefix);

  const ctxOf = {};
  if (cfg.contextMap !== null) {
    try { for (const c of JSON.parse(read(cfg.contextMap || 'context-map.json')).contexts) for (const p of (c.file_paths || [])) ctxOf[p] = c.name + ' [' + c.group + ']'; } catch { /* optional */ }
  }
  const IMP = sharedImportRe(cfg.sharedImport || defaultSharedImport(cfg));
  const since = new Date(now - days * 864e5).toISOString().slice(0, 10);
  const added = new Set(useGit ? git('log', '--diff-filter=A', '--since=' + since, '--name-only', '--format=', '--', root).split(NL).filter(Boolean) : []);
  const mods = {}, coh = { recent: { loc: 0 }, older: { loc: 0 } };
  const keys = Object.keys(metrics);

  for (const f of files) {
    const src = read(f), loc = src.split(NL).length, id = modOf(f), c = ctxOf[f] || '(unmapped)', h = added.has(f) ? coh.recent : coh.older;
    const m = mods[id] ??= { module: id, files: 0, loc: 0, big: 0, newFiles: 0, cssLines: 0, cssRaw: 0, cx: {}, sh: new Set(), shImp: 0, list: [] };
    m.files++; m.loc += loc; h.loc += loc; if (loc > 200) m.big++; if (added.has(f)) m.newFiles++; m.list.push(f); m.cx[c] = (m.cx[c] || 0) + 1;
    const cnt = countMetrics(src, metrics);
    for (const k of keys) { m[k] = (m[k] || 0) + cnt[k]; h[k] = (h[k] || 0) + cnt[k]; }
    for (const x of src.matchAll(IMP)) { m.shImp++; (x[1] || x[2]).split(',').map((s) => s.trim().split(/\s+as\s+/)[0].replace(/^type\s+/, '')).filter(Boolean).forEach((n) => m.sh.add(n)); }
  }
  for (const f of css) {
    const m = mods[modOf(f)]; if (!m) continue;
    const s = read(f); m.cssLines += s.split(NL).length; m.cssRaw += (s.match(CSSRE) || []).length;
  }
  const lowConfLoc = cfg.lowConfLoc ?? 300;
  const rows = Object.values(mods).map((m) => {
    const p = m.module.endsWith('(root)') ? m.list : [root + '/' + m.module], sc = scoreOf(m, metrics, cssW);
    const grp = Object.fromEntries(Object.entries(groups).map(([g, ks]) => [g, ks.reduce((s, k) => s + (m[k] || 0), 0)]));
    return {
      ...m, score: +sc.toFixed(2), debt: debtOf(sc, m.loc), system: isSystemModule(m.module, cfg.systemPrefix),
      last: useGit ? git('log', '-1', '--format=%cs', '--', ...p).trim() : '',
      c30: useGit ? git('log', '--since=' + since, '--format=%h', '--', ...p).split(NL).filter(Boolean).length : 0,
      ...grp, sharedDistinct: m.sh.size, sharedPer100: +(m.shImp * 100 / m.loc).toFixed(2),
      ctx: Object.entries(m.cx).sort((a, b) => b[1] - a[1])[0][0], lowConf: m.loc < lowConfLoc,
    };
  }).sort((a, b) => b.score - a.score);

  const per = (o, k) => +((o[k] || 0) * 100 / o.loc).toFixed(2);
  const cohorts = Object.fromEntries(Object.entries(coh).map(([k, o]) => [k, { loc: o.loc, score: +scoreOf(o, metrics, cssW).toFixed(2), ...Object.fromEntries(keys.map((x) => [x, per(o, x)])) }]));
  const weights = Object.entries(metrics).filter(([, [, w]]) => w).map(([k, [, w]]) => k + '=' + w).join(' ') + ' cssRaw=' + cssW;
  return { files: files.length, since, rows, cohorts, weights, metrics, mdColumns: cfg.mdColumns || DEFAULT_MD_COLUMNS, featuresRoot: root, systemPrefix: cfg.systemPrefix, useGit };
}

/** Render the three output formats from an analyze() result. */
export function render(res, top = 999) {
  const cols = ['module', 'system', 'score', 'debt', 'files', 'loc', 'big', 'newFiles', 'last', 'c30', ...Object.keys(res.metrics), 'cssLines', 'cssRaw', 'sharedDistinct', 'sharedPer100', 'lowConf', 'ctx'];
  const csv = [cols.join(','), ...res.rows.map((r) => cols.map((c) => JSON.stringify(r[c] ?? '')).join(','))].join(NL);
  const mc = res.mdColumns;
  const table = (L) => ['| # | ' + mc.join(' | ') + ' |', '|' + '---|'.repeat(mc.length + 1), ...L.map((r) => '| ' + r.rank + ' | ' + mc.map((c) => r[c]).join(' | ') + ' |')].join(NL);
  const feat = res.rows.filter((r) => !r.system).map((r, i) => ({ ...r, rank: i + 1 }));
  const sys = res.rows.filter((r) => r.system).map((r, i) => ({ ...r, rank: 'S' + (i + 1) }));
  const md = 'files=' + res.files + ' modules=' + res.rows.length + ' since=' + res.since + NL + 'cohorts per 100 LOC: ' + JSON.stringify(res.cohorts) + NL + 'weights: ' + res.weights + NL + NL + '## Feature modules' + NL + table(feat.slice(0, top)) + NL + NL + '## ' + (res.systemPrefix || 'system/') + ' (system) modules' + NL + table(sys.slice(0, top));
  const json = JSON.stringify({
    featuresRoot: res.featuresRoot, files: res.files, since: res.since, weights: res.weights, cohorts: res.cohorts,
    modules: res.rows.map(({ sh, cx, list, shImp, ...r }) => ({ ...r, sharedNames: [...sh].sort(), fileList: list })),
  }, null, 1);
  return { csv, md, json };
}

function main(argv) {
  const a = argReader(argv);
  const repo = path.resolve(a.get('--repo', process.cwd()));
  const cfg = readConfigFile(a.get('--config'));
  if (a.has('--cssw')) cfg.cssWeight = +a.get('--cssw');
  if (a.has('--grouping')) cfg.grouping = a.get('--grouping');
  const top = +a.get('--top', 999), out = a.get('--out', null);
  const res = analyze(repo, cfg, { since: +a.get('--since', 30), noGit: a.has('--no-git') });
  if (res.files === 0) { console.error(`style-divergence: no production files under ${res.featuresRoot} in ${repo} - check featuresRoot / extensions`); process.exit(2); }
  const { csv, md, json } = render(res, top);
  if (out) {
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, 'style-divergence.csv'), csv);
    fs.writeFileSync(path.join(out, 'style-divergence.md'), md);
    fs.writeFileSync(path.join(out, 'style-divergence.json'), json);
  }
  if (a.has('--json')) console.log(json);
  else if (a.has('--csv')) console.log(csv);
  // 7 = summary (3) + blank + section heading + table head + separator, then `top` rows.
  // (The forge-era original sliced at 4 + top and so printed top - 3 rows.)
  else console.log(md.split(NL).slice(0, 7 + Math.min(top, 25)).join(NL));
}

if (isMain(import.meta.url)) {
  try { main(process.argv.slice(2)); } catch (e) { console.error('style-divergence: ' + e.message); process.exit(2); }
}
