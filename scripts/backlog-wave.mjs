#!/usr/bin/env node
/**
 * backlog-wave - pick the next measurable wave from the untriaged backlog ledger.
 *
 * WHY
 * `/harvest backlog` lands untriaged candidates on a measured verdict instead of an
 * operator's pick. The ledger (`librarian/harvest/backlog.jsonl`) holds ~1,100 rows;
 * choosing a wave by hand from it is the "top three by title" failure intake's
 * reference-wave rule exists to end. Three rules make a wave safe to run unattended,
 * and every one is a thing a person skimming the ledger would get wrong:
 *
 *   1. A CONVERGENCE CLUSTER travels as one unit. Two sources that reached one rule are
 *      one landing, not two - two workers would draft duplicate techniques.
 *   2. A TENSION GROUP travels as one unit. Items that contradict each other are
 *      measured head-to-head, so the loop can never land both sides of a disagreement.
 *   3. AT MOST ONE UNIT PER HOME SUBJECT per wave. Workers only propose, so they do not
 *      collide on files - but parallel proposals against one golden path come back
 *      overlapping, and the director would merge contradictory drafts.
 *
 * COMMANDS
 *   next   [--size 8] [--home-prefix <domain/...>]   print the next wave as JSON units
 *   mark   <id>[,<id>...] <status> [--mode m] [--verdict v] [--commit sha]
 *   status                                          counts by status, mode and verdict
 *
 * CLOSED SETS
 *   status : queued measuring landed not-better unmeasurable covered held
 *   mode   : code experiment blind-ab simulation
 *   verdict: better not-better unmeasurable
 *
 * ASSERTS ITSELF FIRST: the wave builder is run against an in-memory fixture with a
 * known answer (a cluster merged, a tension kept whole, a home deduplicated) before it
 * touches the ledger. A broken builder exits FATAL instead of printing a plausible wave.
 *
 * EXIT 0 ok · 1 usage or validation error · 2 self-check failed or ledger unreadable
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEDGER = path.join(ROOT, 'librarian/harvest/backlog.jsonl');

export const STATUS = ['queued', 'measuring', 'landed', 'not-better', 'unmeasurable', 'covered', 'held'];
export const MODE = ['code', 'experiment', 'blind-ab', 'simulation'];
export const VERDICT = ['better', 'not-better', 'unmeasurable'];

export function parseLedger(text) {
  const rows = [];
  text.split('\n').forEach((line, i) => {
    if (!line.trim()) return;
    let r;
    try { r = JSON.parse(line); } catch { throw new Error(`ledger line ${i + 1}: not JSON`); }
    if (!r.id) throw new Error(`ledger line ${i + 1}: no id`);
    if (!STATUS.includes(r.status)) throw new Error(`ledger ${r.id}: status "${r.status}" not in closed set`);
    rows.push(r);
  });
  const ids = new Set();
  for (const r of rows) { if (ids.has(r.id)) throw new Error(`ledger: duplicate id ${r.id}`); ids.add(r.id); }
  return rows;
}

/** Build units from queued rows: a cluster or tension group is one unit, else one item. */
export function buildUnits(rows) {
  const queued = rows.filter((r) => r.status === 'queued');
  const byId = new Map(queued.map((r) => [r.id, r]));
  const seen = new Set();
  const units = [];
  for (const r of queued) {
    if (seen.has(r.id)) continue;
    let members = [r];
    let kind = 'item';
    let key = r.id;
    if (r.tension) {
      kind = 'tension';
      key = r.tension;
      members = queued.filter((x) => x.tension === r.tension);
    } else if (r.convergence && r.convergence.length) {
      kind = 'convergence';
      key = r.convergence[0];
      members = queued.filter((x) => (x.convergence || []).includes(key) && !x.tension);
    }
    members.forEach((m) => seen.add(m.id));
    const notes = new Set(members.map((m) => m.note));
    const top = Math.max(...members.map((m) => m.score));
    // independent sources earn the same +2 the merge rule gives; a tension is urgent
    // because two sides are waiting on one measurement.
    const bonus = kind === 'convergence' && notes.size >= 2 ? 2 : kind === 'tension' ? 1 : 0;
    const lead = [...members].sort((a, b) => b.score - a.score)[0];
    units.push({
      unit: key, kind, priority: top + bonus, sources: notes.size,
      home: lead.home || '', ids: members.map((m) => m.id), lead: lead.id,
    });
  }
  units.sort((a, b) => b.priority - a.priority || b.sources - a.sources || a.unit.localeCompare(b.unit));
  return { units, byId };
}

const homeKey = (h) => (h || '').replace(/\s+/g, '').toLowerCase();

/** Take units in priority order, skipping any whose home subject is already in the wave. */
export function pickWave(rows, { size = 8, homePrefix = '' } = {}) {
  const { units } = buildUnits(rows);
  const wave = [];
  const homes = new Set();
  for (const u of units) {
    if (wave.length >= size) break;
    if (homePrefix && !u.home.startsWith(homePrefix)) continue;
    const k = homeKey(u.home);
    if (k && homes.has(k)) continue; // an unhomed item (NONE) never blocks another
    if (k) homes.add(k);
    wave.push(u);
  }
  return wave;
}

function selfCheck() {
  const fx = [
    { id: 'a', note: 'n1', score: 7, home: 'se/x', status: 'queued', convergence: ['c01'] },
    { id: 'b', note: 'n2', score: 6, home: 'se/x', status: 'queued', convergence: ['c01'] },
    { id: 'c', note: 'n3', score: 9, home: 'se/y', status: 'queued', tension: 't01' },
    { id: 'd', note: 'n4', score: 4, home: 'se/z', status: 'queued', tension: 't01' },
    { id: 'e', note: 'n5', score: 8, home: 'se/y', status: 'queued' },
    { id: 'f', note: 'n6', score: 10, home: '', status: 'landed' },
    { id: 'g', note: 'n7', score: 5, home: '', status: 'queued' },
  ];
  const w = pickWave(fx, { size: 8 });
  const got = w.map((u) => `${u.unit}:${u.ids.join('+')}`).join(' ');
  // tension t01 (9+1=10) first; cluster c01 (7+2=9, 2 sources) merged; e skipped (home se/y
  // already taken by the tension's lead); landed f excluded; unhomed g kept.
  const want = 't01:c+d c01:a+b g:g';
  if (got !== want) {
    console.error(`FATAL self-check: wave builder returned "${got}", expected "${want}"`);
    process.exit(2);
  }
}

function load() {
  if (!fs.existsSync(LEDGER)) { console.error(`FATAL: ${LEDGER} missing`); process.exit(2); }
  try { return parseLedger(fs.readFileSync(LEDGER, 'utf8')); }
  catch (e) { console.error(`FATAL: ${e.message}`); process.exit(2); }
}

function arg(argv, name, dflt) {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : dflt;
}

function main(argv) {
  selfCheck();
  const cmd = argv[0];
  if (cmd === 'next') {
    const rows = load();
    const wave = pickWave(rows, { size: Number(arg(argv, '--size', 8)), homePrefix: arg(argv, '--home-prefix', '') });
    const byId = new Map(rows.map((r) => [r.id, r]));
    const out = wave.map((u) => ({ ...u, items: u.ids.map((id) => {
      const r = byId.get(id);
      return { id, note: r.note, title: r.title, claim: r.claim, score: r.score, shape: r.shape, home: r.home, checked: r.checked };
    }) }));
    console.log(JSON.stringify({ wave: out, queued_left: rows.filter((r) => r.status === 'queued').length }, null, 1));
    return 0;
  }
  if (cmd === 'mark') {
    const ids = (argv[1] || '').split(',').filter(Boolean);
    const status = argv[2];
    const mode = arg(argv, '--mode', undefined);
    const verdict = arg(argv, '--verdict', undefined);
    const commit = arg(argv, '--commit', undefined);
    if (!ids.length || !STATUS.includes(status)) { console.error(`usage: mark <id,...> <${STATUS.join('|')}> ...`); return 1; }
    if (mode && !MODE.includes(mode)) { console.error(`mode must be one of ${MODE.join('|')}`); return 1; }
    if (verdict && !VERDICT.includes(verdict)) { console.error(`verdict must be one of ${VERDICT.join('|')}`); return 1; }
    const rows = load();
    const byId = new Map(rows.map((r) => [r.id, r]));
    const missing = ids.filter((id) => !byId.has(id));
    if (missing.length) { console.error(`unknown id(s): ${missing.join(', ')}`); return 1; }
    const today = new Date().toISOString().slice(0, 10);
    for (const id of ids) {
      const r = byId.get(id);
      Object.assign(r, { status, updated: today });
      if (mode !== undefined) r.mode = mode;
      if (verdict !== undefined) r.verdict = verdict;
      if (commit !== undefined) r.commit = commit;
    }
    fs.writeFileSync(LEDGER, rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
    console.log(`marked ${ids.length} -> ${status}`);
    return 0;
  }
  if (cmd === 'status') {
    const rows = load();
    const count = (k) => rows.reduce((m, r) => ((m[r[k] || '-'] = (m[r[k] || '-'] || 0) + 1), m), {});
    console.log(JSON.stringify({ total: rows.length, status: count('status'), mode: count('mode'), verdict: count('verdict') }, null, 1));
    return 0;
  }
  console.error('usage: backlog-wave.mjs next [--size N] [--home-prefix P] | mark <ids> <status> [...] | status');
  return 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
