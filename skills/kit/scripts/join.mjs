// join.mjs - the INVENTORY: divergence x reachability x coverage, one row per module.
//
//   node join.mjs --divergence <style-divergence.csv|.json> --reach <reachability.json>
//                 [--ledger <coverage.json>] [--order debt|visibility|easy] [--visible a,b,c]
//                 [--status pending,sent-back] [--top N] [--all] [--json] [--out <file.json>]
//
// Each row: module, system, score, debt, loc, files, reachable/reachFiles, ratio, last,
// c30, status. Only LIVE modules (reachable > 0, or unknown to the reachability run) are
// ranked; dead ones are counted and listed after, because a module nobody can open is a
// routing question, not a rebuild target. --all ranks everything.
//
// Orders:
//   debt        highest debt first (score * loc / 100: where the most raw styling lives)
//   visibility  modules matching a --visible prefix first, in the order the prefixes are
//               given, then the rest by debt. Use it for the surfaces the owner opens daily.
//   easy        smallest non-zero debt first, then fewest LOC: quick, low-risk batches that
//               prove the kit before the heavy modules. Zero-debt modules sort last.
//
// --out writes the full inventory (every module, ranked rows first) as JSON; coverage.mjs
// init --inventory reads that file.

import fs from 'node:fs';
import { argReader, isMain } from './lib/modules.mjs';

/** Parse one CSV line whose fields are JSON literals or bare values (style-divergence's CSV). */
export function parseCsvLine(line) {
  const out = [];
  const re = /\s*("(?:[^"\\]|\\.)*"|[^,]*)\s*(,|$)/y;
  let i = 0;
  while (i <= line.length) {
    re.lastIndex = i;
    const m = re.exec(line);
    if (!m) break;
    out.push(m[1]);
    if (m[2] === '') break;
    i = re.lastIndex;
  }
  return out.map((f) => {
    if (f.startsWith('"')) { try { return JSON.parse(f); } catch { return f.slice(1, -1).replace(/""/g, '"'); } }
    if (f === 'true' || f === 'false') return f === 'true';
    if (f !== '' && !Number.isNaN(+f)) return +f;
    return f;
  });
}

export function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (!lines.length) return [];
  const head = parseCsvLine(lines[0]).map(String);
  return lines.slice(1).map((l) => { const v = parseCsvLine(l); return Object.fromEntries(head.map((h, i) => [h, v[i]])); });
}

/** Divergence rows from a CSV or JSON text (JSON = style-divergence --json, or an array). */
export function parseDivergence(text) {
  const t = text.trimStart();
  if (t.startsWith('{') || t.startsWith('[')) {
    const j = JSON.parse(t);
    return Array.isArray(j) ? j : (j.modules || j.rows || []);
  }
  return parseCsv(text);
}

/** Join divergence rows, reachability modules and ledger modules into inventory rows. */
export function joinInventory(divRows, reachModules = [], ledger = null) {
  const reach = new Map(reachModules.map((r) => [r.module, r]));
  const led = ledger?.modules || null;
  return divRows.map((d) => {
    const r = reach.get(d.module);
    const ratio = r ? +(r.reachable / Math.max(r.files, 1)).toFixed(2) : null;
    return {
      module: d.module, system: d.system === true || d.system === 'true', score: +d.score || 0, debt: +d.debt || 0,
      loc: +d.loc || 0, files: +d.files || 0,
      reachable: r ? r.reachable : null, reachFiles: r ? r.files : null, ratio,
      live: r ? r.reachable > 0 : true,
      last: d.last || '', c30: +d.c30 || 0,
      status: led ? (led[d.module]?.status || 'untracked') : '-',
    };
  });
}

const byDebt = (a, b) => b.debt - a.debt || b.score - a.score || a.module.localeCompare(b.module);

/** Rank inventory rows. `visible` is a list of module prefixes (visibility order only). */
export function rankInventory(rows, order = 'debt', visible = []) {
  const L = [...rows];
  if (order === 'debt') return L.sort(byDebt);
  if (order === 'easy') {
    return L.sort((a, b) => (a.debt === 0) - (b.debt === 0) || a.debt - b.debt || a.loc - b.loc || a.module.localeCompare(b.module));
  }
  if (order === 'visibility') {
    const rank = (m) => { const i = visible.findIndex((p) => m === p || m.startsWith(p.endsWith('/') ? p : p + '/')); return i < 0 ? Infinity : i; };
    return L.sort((a, b) => rank(a.module) - rank(b.module) || byDebt(a, b));
  }
  throw new Error(`order: unknown "${order}" (debt | visibility | easy)`);
}

/** The full inventory: ranked live rows first (with rank), then the rest. */
export function buildInventory(rows, { order = 'debt', visible = [], all = false, statuses = null } = {}) {
  const keep = (r) => (all || r.live) && (!statuses || statuses.includes(r.status));
  const ranked = rankInventory(rows.filter(keep), order, visible).map((r, i) => ({ rank: i + 1, ...r }));
  const rest = rows.filter((r) => !keep(r)).sort(byDebt).map((r) => ({ rank: null, ...r }));
  return { order, visible, ranked, rest };
}

function fmt(inv, top) {
  const cols = ['rank', 'module', 'score', 'debt', 'loc', 'reach', 'last', 'c30', 'status'];
  const cell = (r, c) => c === 'reach' ? (r.reachable == null ? '?' : `${r.reachable}/${r.reachFiles}`) : r[c];
  const lines = ['| ' + cols.join(' | ') + ' |', '|' + '---|'.repeat(cols.length)];
  for (const r of inv.ranked.slice(0, top)) lines.push('| ' + cols.map((c) => cell(r, c)).join(' | ') + ' |');
  const dead = inv.rest.filter((r) => !r.live);
  const head = `inventory: ${inv.ranked.length} ranked (order=${inv.order}${inv.visible.length ? ' visible=' + inv.visible.join(',') : ''}), ${dead.length} dead, ${inv.rest.length - dead.length} filtered`;
  const tail = dead.length ? ['', 'dead (routing questions, not rebuild targets): ' + dead.map((r) => r.module).join(', ')] : [];
  return [head, '', ...lines, ...tail].join('\n');
}

function main(argv) {
  const a = argReader(argv);
  const divFile = a.get('--divergence'), reachFile = a.get('--reach');
  if (!divFile) throw new Error('--divergence <csv|json> is required');
  const div = parseDivergence(fs.readFileSync(divFile, 'utf8'));
  if (!div.length) throw new Error(`${divFile}: no module rows`);
  const reach = reachFile ? JSON.parse(fs.readFileSync(reachFile, 'utf8')).modules || [] : [];
  if (!reachFile) console.error('join: no --reach given; every module is treated as live');
  const ledFile = a.get('--ledger');
  const ledger = ledFile && fs.existsSync(ledFile) ? JSON.parse(fs.readFileSync(ledFile, 'utf8')) : null;
  const visible = (a.get('--visible', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
  const order = a.get('--order', visible.length ? 'visibility' : 'debt');
  if (order === 'visibility' && !visible.length) throw new Error('--order visibility needs --visible a,b,c');
  const statuses = a.has('--status') ? a.get('--status').split(',').map((s) => s.trim()) : null;
  const inv = buildInventory(joinInventory(div, reach, ledger), { order, visible, all: a.has('--all'), statuses });
  const full = { generated: new Date().toISOString(), divergence: divFile, reach: reachFile || null, ...inv, modules: [...inv.ranked, ...inv.rest] };
  if (a.get('--out')) fs.writeFileSync(a.get('--out'), JSON.stringify(full, null, 1));
  if (a.has('--json')) console.log(JSON.stringify(full, null, 1));
  else console.log(fmt(inv, +a.get('--top', 30)));
}

if (isMain(import.meta.url)) {
  try { main(process.argv.slice(2)); } catch (e) { console.error('join: ' + e.message); process.exit(2); }
}
