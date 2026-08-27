#!/usr/bin/env node
// scan-sweep coverage table - per-context lens coverage from scan-history.
// Reads the context map (repo root) + .claude/scan-history/scan-sweep.jsonl.
//
// Usage:
//   node coverage.mjs             # table, least-covered first (top 30)
//   node coverage.mjs --all       # every context
//   node coverage.mjs --next      # ONLY the next context the loop should take
//   node coverage.mjs --json      # machine-readable, for a caller that ranks itself
//   node coverage.mjs --map <p>   # context map at a non-default path
//
// --next implements the picker rule in SKILL.md section 1, verbatim and in one place:
// never-swept first (in map order), else smallest lens union, else oldest last sweep.
// The loop asks this script rather than re-deriving it, so the ledger and the picker
// cannot drift apart.
import { readFileSync, existsSync } from 'node:fs';

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const opt = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const all = has('--all');
const asJson = has('--json');
const nextOnly = has('--next');
const mapPath = opt('--map', 'context-map.json');

if (!existsSync(mapPath)) {
  console.error(`no context map at ${mapPath} - pass --map <path>`);
  process.exit(2);
}
const map = JSON.parse(readFileSync(mapPath, 'utf8'));
const histPath = '.claude/scan-history/scan-sweep.jsonl';
const hist = existsSync(histPath)
  ? readFileSync(histPath, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean)
  : [];

// Total lens count is read from the reference, not hardcoded: a lens added to
// lenses.md must not silently make every "22/22" row a lie.
let TOTAL_LENSES = 22;
try {
  const ref = new URL('../references/lenses.md', import.meta.url);
  const n = (readFileSync(ref, 'utf8').match(/^## [a-z-]+ /gm) ?? []).length;
  if (n > 0) TOTAL_LENSES = n;
} catch { /* keep the fallback */ }

const byScope = new Map();
for (const h of hist) {
  const e = byScope.get(h.scope) ?? { lenses: new Set(), findings: 0, fixed: 0, leads: 0, sweeps: 0, last: null, strategy: null };
  for (const k of h.lens_keys ?? []) e.lenses.add(k);
  e.findings += h.findings ?? 0; e.fixed += h.fixed ?? 0; e.leads += h.leads ?? 0; e.sweeps += 1;
  if (!e.last || h.at > e.last) { e.last = h.at; e.strategy = h.strategy ?? null; }
  byScope.set(h.scope, e);
}

const contexts = map.contexts ?? [];
const rows = contexts.map((c, order) => {
  const e = byScope.get(c.name);
  return {
    name: c.name, order,
    files: (c.file_paths ?? c.filePaths ?? []).length,
    lenses: e ? e.lenses.size : 0, sweeps: e ? e.sweeps : 0,
    findings: e ? e.findings : 0, fixed: e ? e.fixed : 0, leads: e ? e.leads : 0,
    strategy: e && e.strategy ? e.strategy : '-',
    last: e && e.last ? e.last : null,
    age: e && e.last ? Math.round((Date.now() - Date.parse(e.last)) / 86400000) + 'd' : 'never',
  };
});

// The picker: never-swept in MAP order first (so a fresh repo is walked in the
// order its author laid it out), then fewest lenses, then oldest.
const unswept = rows.filter((r) => r.sweeps === 0).sort((a, b) => a.order - b.order);
const swept = rows.filter((r) => r.sweeps > 0)
  .sort((a, b) => a.lenses - b.lenses || Date.parse(a.last) - Date.parse(b.last));
const queue = [...unswept, ...swept];
const next = queue[0] ?? null;
const reason = !next ? 'no contexts'
  : next.sweeps === 0 ? 'never swept'
  : `lens coverage ${next.lenses}/${TOTAL_LENSES}, last swept ${next.age} ago`;

if (nextOnly) {
  if (!next) { console.error('no contexts in the map'); process.exit(2); }
  if (asJson) console.log(JSON.stringify({ next: next.name, reason, lenses: next.lenses, totalLenses: TOTAL_LENSES, sweeps: next.sweeps }));
  else console.log(`${next.name}\t${reason}`);
  process.exit(0);
}

if (asJson) {
  console.log(JSON.stringify({ totalLenses: TOTAL_LENSES, contexts: rows.length, swept: rows.filter((r) => r.sweeps > 0).length, next: next && next.name, reason, rows: queue }, null, 2));
  process.exit(0);
}

const shown = all ? queue : queue.slice(0, 30);
const pad = (s, n, r) => (r ? String(s).padStart(n) : String(s).padEnd(n));
console.log(pad('CONTEXT', 36) + pad('FILES', 6, 1) + pad('LENSES', 8, 1) + pad('SWEEPS', 7, 1) + pad('FOUND', 6, 1) + pad('FIXED', 6, 1) + pad('LEADS', 6, 1) + pad('STRATEGY', 11, 1) + pad('LAST', 7, 1));
for (const r of shown) {
  console.log(pad(r.name.slice(0, 35), 36) + pad(r.files, 6, 1) + pad(r.lenses + '/' + TOTAL_LENSES, 8, 1) + pad(r.sweeps, 7, 1) + pad(r.findings, 6, 1) + pad(r.fixed, 6, 1) + pad(r.leads, 6, 1) + pad(r.strategy, 11, 1) + pad(r.age, 7, 1));
}
const covered = rows.filter((r) => r.sweeps > 0).length;
console.log('\n' + covered + '/' + rows.length + ' contexts swept; least-covered first' + (all ? '' : ' (top 30 - pass --all for every context)'));
if (next) console.log('next: ' + next.name + ' (' + reason + ')');
