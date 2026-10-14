#!/usr/bin/env node
// explorer pick - rank (context, lens) pairs that NEITHER explorer NOR scan-sweep has run.
//
// Reads, all read-only:
//   - the context map (flat `contexts: [...]` or grouped `groups: [{contexts: [...]}]`)
//   - explorer's coverage ledger: <vault>/<vault_subdir>/coverage.md (+ sweeps/ for legacy rows)
//   - scan-sweep's history: .claude/scan-history/scan-sweep.jsonl (its per-context lens_keys)
//   - lens-scan's store, when present: .ai/lens-scan/scan.db (node:sqlite, optional)
//
// Usage (run from the consuming repo, or pass --repo):
//   node pick.mjs                     # ranked table (top 10), then the `pick:` line to quote
//   node pick.mjs --top 25 | --all    # more rows
//   node pick.mjs --category sec      # only pairs for one lens
//   node pick.mjs --json              # machine-readable
//   node pick.mjs --repo <dir> --map <path> --vault <dir> --history <path>
//
// A lens here is one of explorer's eight categories. A scan-sweep lens key counts as
// that category having run when SWEEP_LENS maps it (references/probes.md, "Lens
// vocabulary"). Exit 0 with a pick, 2 when nothing could be ranked.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';

// Canonical order doubles as the tie-break: the lenses with the highest measured
// yield in explorer's ledger come first.
export const CATEGORIES = ['bug', 'sec', 'quality', 'perf', 'ui', 'a11y', 'dx', 'i18n'];

// scan-sweep lens key -> explorer category. Keys with no explorer analogue
// (feature-scout, monetization-advisor, growth-hacker, ...) are deliberately absent:
// they never mark an explorer lens as run. The second half of some rows are keys older
// scan-sweep versions wrote (bug-hunter, ui-perfectionist, security, ...).
export const SWEEP_LENS = {
  bug: ['bounty-hunter', 'error-handler', 'parity-auditor', 'observability-auditor', 'bug-hunter', 'error-handling'],
  sec: ['security-auditor', 'security'],
  quality: ['architecture-analyst', 'tech-debt-tracker', 'documentation-auditor'],
  perf: ['code-optimizer', 'performance'],
  ui: ['ux-reviewer', 'visual-craft', 'state-coverage', 'mobile-specialist', 'ui-perfectionist', 'design-tokens', 'motion'],
  a11y: ['accessibility-checker'],
  dx: ['test-strategist', 'dependency-auditor', 'devops-optimizer'],
  i18n: ['copy-auditor'],
};

// lens-scan lens id -> explorer category.
export const LENS_SCAN = { security: 'sec', design: 'ui', development: 'quality', accessibility: 'a11y', performance: 'perf' };

const UI_FILE = /\.(tsx|jsx|vue|svelte|html|css|scss|astro)$/i;
// Relevance: how strongly a context's own words suggest a lens has surface there.
const RELEVANCE = {
  bug: /state|sync|parse|retry|race|cache|queue|job|transaction|webhook|import/i,
  sec: /auth|token|session|secret|permission|role|admin|webhook|tenant|org|credential|api|route|upload/i,
  quality: /lib|core|engine|model|service|shared|util/i,
  perf: /query|render|list|cache|stream|batch|index|pagin|virtual|search|feed|dashboard/i,
  ui: /component|page|view|modal|layout|panel|form|card|tab/i,
  a11y: /component|page|form|modal|dialog|button|menu|keyboard/i,
  dx: /test|script|cli|config|build|tool|fixture|harness/i,
  i18n: /locale|i18n|intl|messages|translat|copy/i,
};

export function slug(s) {
  return String(s ?? '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const toList = (v) => (Array.isArray(v) ? v : v ? [v] : []);

// Both map shapes, in map order. crossRefs = own refs + inbound refs; a grouped map
// with no per-context refs falls back to its group's degree in `relationships`.
export function flattenContexts(map) {
  const flat = (map.contexts ?? []).map((c) => ({ ...c, group: c.group ?? null }));
  const grouped = (map.groups ?? []).flatMap((g) => (g.contexts ?? []).map((c) => ({ ...c, group: g.name })));
  const ungrouped = Array.isArray(map.ungrouped) ? map.ungrouped.filter((c) => c && c.name).map((c) => ({ ...c, group: null })) : [];
  const all = [...flat, ...grouped, ...ungrouped];
  const inbound = new Map();
  for (const c of all) for (const r of toList(c.cross_refs ?? c.crossRefs)) inbound.set(r, (inbound.get(r) ?? 0) + 1);
  const rels = Array.isArray(map.relationships) ? map.relationships : [];
  return all.map((c, order) => {
    const files = toList(c.file_paths ?? c.filePaths);
    const own = toList(c.cross_refs ?? c.crossRefs).length;
    const inb = (inbound.get(c.name) ?? 0) + (c.id ? inbound.get(c.id) ?? 0 : 0);
    const groupDegree = c.group ? rels.filter((r) => r && (r.source === c.group || r.target === c.group)).length : 0;
    const perContext = own + inb > 0;
    const text = [c.name, c.description, toList(c.keywords).join(' '), c.api_surface, toList(c.apiRoutes).join(' ')].filter(Boolean).join(' ');
    return {
      name: c.name, group: c.group, order, files: files.length,
      uiFiles: files.filter((f) => UI_FILE.test(f)).length,
      crossRefs: perContext ? own + inb : groupDegree,
      crossRefSource: perContext ? 'context' : groupDegree ? 'group' : 'none',
      text,
    };
  });
}

// Overlay frontmatter: just the keys the picker needs.
export function parseOverlay(md) {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(md ?? '');
  const out = { vault: [], vault_subdir: 'Explorer', context_map: null };
  if (!fm) return out;
  const get = (k) => { const m = new RegExp(`^${k}:\\s*(.*?)\\s*(?:#.*)?$`, 'm').exec(fm[1]); return m ? m[1] : null; };
  const unq = (s) => s.replace(/^["']|["']$/g, '');
  const v = get('vault');
  if (v) {
    if (v.startsWith('[')) { try { out.vault = JSON.parse(v); } catch { out.vault = v.slice(1, -1).split(',').map((s) => unq(s.trim())).filter(Boolean); } }
    else out.vault = [unq(v)];
  }
  const sub = get('vault_subdir');
  if (sub !== null) out.vault_subdir = unq(sub);
  const cm = get('context_map');
  if (cm) out.context_map = unq(cm);
  return out;
}

// coverage.md rows. Format (SKILL.md Phase 9f):
//   ### <area-slug>  (optional trailing note)
//   - Last visited: YYYY-MM-DD
//   - Contexts: <exact map name> | <exact map name>
//   - Lenses: bug 2026-10-14, sec 2026-10-14, quality 2026-08-29
// A row with no `Lenses:` line is a legacy row (lenses: null).
export function parseCoverage(md) {
  const rows = [];
  for (const sec of String(md ?? '').split(/^### /m).slice(1)) {
    const head = sec.split(/\r?\n/, 1)[0].trim();
    const s = head.split(/\s+/)[0];
    if (!s) continue;
    const last = /^- Last visited:\s*(\d{4}-\d{2}-\d{2})/m.exec(sec);
    const ctx = /^- Contexts:\s*(.+?)\s*$/m.exec(sec);
    const lens = /^- Lenses:\s*(.+?)\s*$/m.exec(sec);
    let lenses = null;
    if (lens) {
      lenses = new Map();
      for (const part of lens[1].split(',')) {
        const m = /^\s*([a-z0-9-]+)(?:\s+(\d{4}-\d{2}-\d{2}))?/i.exec(part);
        if (m && CATEGORIES.includes(m[1].toLowerCase())) lenses.set(m[1].toLowerCase(), m[2] ?? (last ? last[1] : null));
      }
    }
    rows.push({ slug: s, last: last ? last[1] : null, contexts: ctx ? ctx[1].split('|').map((x) => x.trim()).filter(Boolean) : null, lenses });
  }
  return rows;
}

// Legacy backfill: the categories a sweep note's items carried, plus a `lenses: [...]`
// frontmatter list when the note has one. Inferred, and reported as such.
export function parseSweepCategories(md) {
  const out = new Set();
  const fm = /^lenses:\s*\[([^\]]*)\]/m.exec(md ?? '');
  if (fm) for (const x of fm[1].split(',')) { const k = x.trim().replace(/^["']|["']$/g, '').toLowerCase(); if (CATEGORIES.includes(k)) out.add(k); }
  for (const m of String(md ?? '').matchAll(/Category \/ Severity \/ Effort:\**\s*([a-z0-9]+)\s*\//gi)) {
    const k = m[1].toLowerCase();
    if (CATEGORIES.includes(k)) out.add(k);
  }
  return out;
}

// state.md active claims younger than 2 hours.
export function parseClaims(md, now = Date.now()) {
  const out = new Set();
  const text = String(md ?? '');
  const start = text.search(/^## Active[ \t]*$/m);
  const rest = start < 0 ? '' : text.slice(start).replace(/^## Active[ \t]*$/m, '');
  const end = rest.search(/^## /m);
  const active = end < 0 ? rest : rest.slice(0, end);
  for (const m of active.matchAll(/^- \*\*(.+?)\*\*.*?claimed_at:\s*([^,\s]+)/gm)) {
    const t = Date.parse(m[2]);
    if (!Number.isNaN(t) && now - t < 2 * 3600 * 1000) out.add(slug(m[1]));
  }
  return out;
}

// scan-sweep.jsonl -> Map<scope, {keys:Set, noSurface:Set, rounds, last}>. Challenge rounds
// are excluded, as scan-sweep's own coverage.mjs excludes them. `lens_no_surface` holds the
// keys a round pointed at the context and found nothing to judge (a string, or {key|lens}).
export function parseHistory(jsonl) {
  const out = new Map();
  for (const line of String(jsonl ?? '').split('\n')) {
    if (!line.trim()) continue;
    let h; try { h = JSON.parse(line); } catch { continue; }
    if (!h || !h.scope || h.strategy === 'challenge') continue;
    const e = out.get(h.scope) ?? { keys: new Set(), noSurface: new Set(), rounds: 0, last: null };
    for (const k of h.lens_keys ?? []) e.keys.add(k);
    for (const k of h.lens_no_surface ?? []) {
      const key = typeof k === 'string' ? k : k && (k.key ?? k.lens);
      if (key) e.noSurface.add(key);
    }
    e.rounds += 1;
    if (h.at && (!e.last || h.at > e.last)) e.last = h.at;
    out.set(h.scope, e);
  }
  return out;
}

// Coverage rows -> Map<context name, {lenses: Map<lens,date>, last, inferred, rows}>.
// A row resolves through its `Contexts:` list, else its slug against a context name,
// else against a group name (all of that group's contexts).
export function resolveRows(rows, contexts, inferredFor = () => null) {
  const byName = new Map(contexts.map((c) => [c.name.toLowerCase(), c]));
  const out = new Map();
  const unresolved = [];
  for (const r of rows) {
    let targets = [];
    if (r.contexts) targets = r.contexts.map((n) => byName.get(n.toLowerCase())).filter(Boolean);
    if (!targets.length) targets = contexts.filter((c) => slug(c.name) === r.slug);
    if (!targets.length) targets = contexts.filter((c) => c.group && slug(c.group) === r.slug);
    if (!targets.length) { unresolved.push(r.slug); continue; }
    let lenses = r.lenses;
    let inferred = false;
    if (!lenses) {
      const cats = inferredFor(r.slug) ?? new Set();
      lenses = new Map([...cats].map((k) => [k, r.last]));
      inferred = true;
    }
    for (const c of targets) {
      const e = out.get(c.name) ?? { lenses: new Map(), last: null, inferred: false, rows: [] };
      for (const [k, d] of lenses) if (!e.lenses.has(k) || (d && d > e.lenses.get(k))) e.lenses.set(k, d);
      if (r.last && (!e.last || r.last > e.last)) e.last = r.last;
      e.inferred = e.inferred || inferred;
      e.rows.push(r.slug);
      out.set(c.name, e);
    }
  }
  return { byContext: out, unresolved };
}

// 0..2: the context's own words (name, description, keywords, API surface - never file
// paths, where every path says lib/ or components/) plus, for ui/a11y, a UI-file majority.
export function relevance(lens, c) {
  let r = RELEVANCE[lens].test(c.text) ? 1 : 0;
  if ((lens === 'ui' || lens === 'a11y') && c.files && c.uiFiles / c.files >= 0.5) r += 1;
  return r;
}

export function hasSurface(lens, c) {
  if (lens === 'ui' || lens === 'a11y') return c.uiFiles > 0;
  if (lens === 'i18n') return c.uiFiles > 0 || RELEVANCE.i18n.test(c.text);
  return c.files > 0;
}

// The pure ranking. One row per context that still has an uncovered lens with surface.
export function rank({ contexts, explorer = new Map(), sweep = new Map(), lensScan = new Map(), claimed = new Set(), category = null }) {
  const firstRun = explorer.size === 0;
  const lenses = category ? [category] : CATEGORIES;
  const rows = [];
  const fullyCovered = [];
  for (const c of contexts) {
    if (claimed.has(slug(c.name)) || (c.group && claimed.has(slug(c.group)))) continue;
    const ex = explorer.get(c.name);
    const sw = sweep.get(c.name);
    const ls = lensScan.get(c.name);
    const covered = {};
    for (const l of CATEGORIES) {
      const by = [];
      if (ex && ex.lenses.has(l)) by.push(ex.inferred ? 'explorer(inferred)' : 'explorer');
      if (sw) for (const k of SWEEP_LENS[l]) if (sw.keys.has(k)) by.push(`scan-sweep:${k}`);
      if (ls && ls.has(l)) by.push('lens-scan');
      if (by.length) covered[l] = by;
    }
    // No surface: the map shows none (ui/a11y without UI files), or a scan-sweep round
    // recorded a mapped key under lens_no_surface for this context.
    const noSurfaceBy = {};
    for (const l of lenses) {
      if (covered[l]) continue;
      if (!hasSurface(l, c)) { noSurfaceBy[l] = 'map'; continue; }
      const k = sw && sw.noSurface ? SWEEP_LENS[l].find((x) => sw.noSurface.has(x)) : null;
      if (k) noSurfaceBy[l] = `scan-sweep:${k}`;
    }
    const noSurface = Object.keys(noSurfaceBy);
    const open = lenses.filter((l) => !covered[l] && !noSurfaceBy[l])
      .sort((a, b) => relevance(b, c) - relevance(a, c) || CATEGORIES.indexOf(a) - CATEGORIES.indexOf(b));
    if (!open.length) { fullyCovered.push(c.name); continue; }
    rows.push({
      context: c.name, group: c.group, lens: open[0], alsoOpen: open.slice(1), noSurface, noSurfaceBy,
      files: c.files, crossRefs: c.crossRefs, crossRefSource: c.crossRefSource,
      coveredCount: Object.keys(covered).length, covered,
      explorerLast: ex ? ex.last : null, explorerInferred: ex ? ex.inferred : false,
      sweepRounds: sw ? sw.rounds : 0, sweepLast: sw && sw.last ? sw.last.slice(0, 10) : null,
      lensScan: ls ? [...ls] : null, order: c.order,
    });
  }
  const tier = (r) => (r.files >= 3 ? 0 : 1);
  rows.sort(firstRun
    ? (a, b) => tier(a) - tier(b) || b.crossRefs - a.crossRefs || a.coveredCount - b.coveredCount || a.order - b.order
    : (a, b) => tier(a) - tier(b) || a.coveredCount - b.coveredCount
      || (a.explorerLast ?? '').localeCompare(b.explorerLast ?? '') || b.crossRefs - a.crossRefs || a.order - b.order);
  return { firstRun, rows, fullyCovered };
}

export function why(r) {
  const ex = r.explorerLast ? `explorer ${r.explorerLast}${r.explorerInferred ? ' (lenses inferred)' : ''}` : 'explorer never';
  const swLenses = [...new Set(Object.values(r.covered).flat().filter((s) => s.startsWith('scan-sweep:')).map((s) => s.slice(11)))];
  const sw = r.sweepRounds ? `scan-sweep ${r.sweepRounds} round(s), last ${r.sweepLast}` : 'scan-sweep never';
  const ls = r.lensScan ? `lens-scan ${r.lensScan.join(',') || '-'}` : null;
  const cov = Object.keys(r.covered).length ? `ran: ${Object.keys(r.covered).join(',')}` : 'ran: none';
  const ns = Object.entries(r.noSurfaceBy ?? {}).filter(([, by]) => by !== 'map').map(([l, by]) => `${l} (${by})`);
  return [ex, sw, ls, cov, ns.length ? `no surface: ${ns.join(',')}` : null, r.alsoOpen.length ? `also open: ${r.alsoOpen.join(',')}` : null].filter(Boolean).join('; ') + (swLenses.length ? ` [${swLenses.length} sweep key(s)]` : '');
}

// The one line Phase 2b quotes verbatim: the pair, and why, citing both ledgers.
export function pickLine(r) {
  return `pick: ${r.context} / ${r.lens} - ${why(r)}`;
}

async function readLensScan(dbPath, contexts) {
  const out = new Map();
  if (!existsSync(dbPath)) return { out, status: 'absent' };
  try {
    const { DatabaseSync } = await import('node:sqlite');
    const db = new DatabaseSync(dbPath, { readOnly: true });
    const rows = db.prepare('SELECT DISTINCT feature, lens FROM measurements').all();
    db.close();
    const bySlug = new Map(contexts.map((c) => [slug(c.name), c.name]));
    let matched = 0;
    for (const { feature, lens } of rows) {
      const name = bySlug.get(slug(feature));
      const cat = LENS_SCAN[lens];
      if (!name || !cat) continue;
      matched++;
      const s = out.get(name) ?? new Set(); s.add(cat); out.set(name, s);
    }
    return { out, status: `${rows.length} (feature, lens) pair(s), ${matched} matched a context` };
  } catch (e) {
    return { out, status: `present, not read (${e.message.split('\n')[0]})` };
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const has = (f) => argv.includes(f);
  const opt = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
  const repo = resolve(opt('--repo', '.'));
  const at = (p) => (isAbsolute(p) ? p : join(repo, p));
  const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);

  const overlay = parseOverlay(read(join(repo, '.claude/explorer/config.md')));
  const mapPath = at(opt('--map', overlay.context_map ?? 'context-map.json'));
  if (!existsSync(mapPath)) { console.error(`no context map at ${mapPath} - pass --map <path>`); process.exit(2); }
  const contexts = flattenContexts(JSON.parse(readFileSync(mapPath, 'utf8')));

  // Explorer dir: --vault (vault root or the Explorer dir itself), else the overlay's
  // first existing candidate, else the <repo>/.explorer fallback.
  const sub = overlay.vault_subdir;
  const cands = opt('--vault', null) ? [opt('--vault')] : [...overlay.vault, join(repo, '.explorer')];
  let exDir = null;
  for (const v of cands) {
    if (existsSync(join(v, 'coverage.md'))) { exDir = v; break; }
    if (existsSync(join(v, sub, 'coverage.md'))) { exDir = join(v, sub); break; }
  }
  const covMd = exDir ? read(join(exDir, 'coverage.md')) : null;
  const sweepsDir = exDir ? join(exDir, 'sweeps') : null;
  const sweepFiles = sweepsDir && existsSync(sweepsDir) ? readdirSync(sweepsDir).filter((f) => f.endsWith('.md')) : [];
  const inferredFor = (s) => {
    const cats = new Set();
    for (const f of sweepFiles) if (f.replace(/\.md$/, '').endsWith(`-${s}`)) for (const k of parseSweepCategories(read(join(sweepsDir, f)))) cats.add(k);
    return cats;
  };
  const covRows = parseCoverage(covMd);
  const { byContext: explorer, unresolved } = resolveRows(covRows, contexts, inferredFor);
  const claimed = exDir ? parseClaims(read(join(exDir, 'state.md'))) : new Set();

  const histPath = at(opt('--history', '.claude/scan-history/scan-sweep.jsonl'));
  const histText = read(histPath);
  const sweep = parseHistory(histText);
  const lensScan = await readLensScan(at('.ai/lens-scan/scan.db'), contexts);

  const category = opt('--category', null);
  if (category && !CATEGORIES.includes(category)) { console.error(`--category must be one of ${CATEGORIES.join(', ')}`); process.exit(2); }
  const result = rank({ contexts, explorer, sweep, lensScan: lensScan.out, claimed, category });
  const top = has('--all') ? result.rows.length : Math.max(1, Number(opt('--top', '10')) || 10);
  const known = new Set(contexts.map((c) => c.name));
  const sources = {
    map: `${mapPath} (${contexts.length} contexts)`,
    explorer: exDir ? `${join(exDir, 'coverage.md')} (${covRows.length} row(s) -> ${explorer.size} context(s); ${[...explorer.values()].filter((e) => e.inferred).length} lens-inferred from sweep notes${unresolved.length ? `; unresolved: ${unresolved.join(', ')}` : ''})` : 'no coverage.md found (first explorer run)',
    scanSweep: histText ? `${histPath} (${[...sweep.values()].reduce((n, e) => n + e.rounds, 0)} round(s) over ${sweep.size} scope(s); ${[...sweep.keys()].filter((k) => !known.has(k)).length} scope(s) not in the map)` : `absent (${histPath})`,
    lensScan: lensScan.status,
  };

  if (has('--json')) {
    console.log(JSON.stringify({ repo, sources, mode: result.firstRun ? 'first-run' : 'lens-coverage', next: result.rows[0] ? { context: result.rows[0].context, lens: result.rows[0].lens, pickLine: pickLine(result.rows[0]) } : null, rows: result.rows.slice(0, top), fullyCovered: result.fullyCovered, claimed: [...claimed] }, null, 2));
    process.exit(result.rows.length ? 0 : 2);
  }
  console.log(`map:        ${sources.map}`);
  console.log(`explorer:   ${sources.explorer}`);
  console.log(`scan-sweep: ${sources.scanSweep}`);
  console.log(`lens-scan:  ${sources.lensScan}`);
  console.log(`mode:       ${result.firstRun ? 'first explorer run - contexts with >= 3 files and the most cross-references first' : 'fewest lenses run by either loop first, then oldest explorer visit'}${category ? `; lens ${category} only` : ''}\n`);
  const pad = (s, n, r) => (r ? String(s).padStart(n) : String(s).padEnd(n));
  console.log(pad('#', 3) + pad('CONTEXT', 38) + pad('LENS', 8) + pad('FILES', 6, 1) + pad('XREF', 6, 1) + pad('RAN', 5, 1) + '  WHY');
  result.rows.slice(0, top).forEach((r, i) => {
    console.log(pad(i + 1, 3) + pad(r.context.slice(0, 37), 38) + pad(r.lens, 8) + pad(r.files, 6, 1) + pad(r.crossRefs + (r.crossRefSource === 'group' ? 'g' : ''), 6, 1) + pad(`${r.coveredCount}/8`, 5, 1) + '  ' + why(r));
  });
  console.log(`\n${result.rows.length} context(s) with an open lens; ${result.fullyCovered.length} fully covered${claimed.size ? `; ${claimed.size} claimed, skipped` : ''}. XREF 'g' = group-level relationships.`);
  if (result.rows[0]) console.log(pickLine(result.rows[0]));
  process.exit(result.rows.length ? 0 : 2);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main();
