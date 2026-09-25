// coverage.mjs - the kit's MEMORY across sessions: which modules are done, in flight, sent
// back or dead; every batch with the owner's verdict in their own words; every kit part and
// the batch that introduced it. One JSON file, written atomically, versioned by `schema`.
//
//   node coverage.mjs <command> --ledger <file> [options]
//
//   init          --inventory <file>             seed modules (never overwrites a status);
//                                                reachable===0 rows are seeded `dead`
//   status        [--next 10] [--json]           counts per status, open batches, next pending
//   open-batch    --id <id> --modules a,b [--builders x,y] [--note ...]
//   gate          --id <id>                      every module of the batch -> gated
//   close-batch   --id <id> --verdict approved|sent-back|mixed --text "<owner words>"
//                 [--approved a,b --sent-back c] [--commits sha,sha]
//   mark          --module m --status s [--reopen] [--note ...]
//   add-kit-part  --name <Name> --api "<signature>" [--batch <id>] [--by <module>] [--why "..."] [--replace]
//                 (no --batch = PROPOSED; --batch on a proposed part marks it built)
//
// Inventory: the JSON join.mjs --out writes ({ modules: [...] }), a style-divergence --json
// file, a reachability --json file, or a bare array of { module, ... }. Its order is the
// rank `status` uses for "next pending".
//
// Statuses and the legal moves (anything else exits 1 with the reason):
//   pending   -> in-batch | skipped | dead
//   in-batch  -> gated | pending | approved | sent-back | skipped
//   gated     -> approved | sent-back | in-batch
//   sent-back -> in-batch | pending | skipped
//   skipped   -> pending | in-batch
//   dead      -> pending | skipped            (revived only after the owner fixes routing)
//   approved  -> (any) only with --reopen     (an owner-approved module is not re-touched silently)
// A move to the status a module already has is a no-op, which is what makes re-runs safe.
//
// The ledger lives in the consuming project (its vault or .kit/), never in the skill.

import fs from 'node:fs';
import path from 'node:path';
import { argReader, isMain } from './lib/modules.mjs';

export const SCHEMA = 1;
export const STATUSES = ['pending', 'in-batch', 'gated', 'approved', 'sent-back', 'skipped', 'dead'];
export const TRANSITIONS = {
  pending: ['in-batch', 'skipped', 'dead'],
  'in-batch': ['gated', 'pending', 'approved', 'sent-back', 'skipped'],
  gated: ['approved', 'sent-back', 'in-batch'],
  'sent-back': ['in-batch', 'pending', 'skipped'],
  skipped: ['pending', 'in-batch'],
  dead: ['pending', 'skipped'],
  approved: [],
};
export const VERDICTS = ['approved', 'sent-back', 'mixed'];

export class LedgerError extends Error {}

/** Is from -> to legal? Returns { ok, noop, reason }. */
export function checkTransition(from, to, { reopen = false } = {}) {
  if (!STATUSES.includes(to)) return { ok: false, reason: `unknown status "${to}" (${STATUSES.join(' | ')})` };
  if (!STATUSES.includes(from)) return { ok: false, reason: `unknown current status "${from}"` };
  if (from === to) return { ok: true, noop: true };
  if (from === 'approved') return reopen ? { ok: true } : { ok: false, reason: `approved -> ${to} needs --reopen (an owner-approved module is not re-touched silently)` };
  if (TRANSITIONS[from].includes(to)) return { ok: true };
  return { ok: false, reason: `illegal transition ${from} -> ${to} (legal from ${from}: ${TRANSITIONS[from].join(', ') || 'none'})` };
}

export function emptyLedger(now) {
  return { schema: SCHEMA, created: now, updated: now, modules: {}, batches: [], kitParts: [] };
}

const clone = (x) => JSON.parse(JSON.stringify(x));

/** Extract [{ module, reachable? }] in order from any supported inventory shape. */
export function inventoryRows(inv) {
  const rows = Array.isArray(inv) ? inv : (inv.modules || inv.ranked || inv.rows || []);
  return rows.filter((r) => r && typeof r.module === 'string');
}

function move(L, module, to, now, { reopen = false, batch = null, note = null } = {}) {
  const m = L.modules[module];
  if (!m) throw new LedgerError(`unknown module "${module}" - run init with an inventory that contains it`);
  const t = checkTransition(m.status, to, { reopen });
  if (!t.ok) throw new LedgerError(`${module}: ${t.reason}`);
  if (t.noop) return false;
  m.history = m.history || [];
  m.history.push({ from: m.status, to, at: now, ...(batch ? { batch } : {}), ...(note ? { note } : {}) });
  m.status = to;
  if (batch) m.batch = batch;
  m.updated = now;
  return true;
}

/** Seed modules from an inventory. Existing statuses are never overwritten; ranks are refreshed. */
export function applyInit(ledger, inv, now) {
  const L = ledger ? clone(ledger) : emptyLedger(now);
  if (L.schema !== SCHEMA) throw new LedgerError(`ledger schema ${L.schema} is not ${SCHEMA} - refusing to touch it`);
  const rows = inventoryRows(inv);
  if (!rows.length) throw new LedgerError('inventory has no { module } rows');
  let added = 0;
  rows.forEach((r, i) => {
    const cur = L.modules[r.module];
    if (cur) { cur.rank = i + 1; return; }
    L.modules[r.module] = { status: r.reachable === 0 ? 'dead' : 'pending', rank: i + 1, added: now, updated: now, history: [] };
    added++;
  });
  const inInv = new Set(rows.map((r) => r.module));
  const stale = Object.keys(L.modules).filter((m) => !inInv.has(m));
  L.updated = now;
  return { ledger: L, added, kept: rows.length - added, stale };
}

export function applyOpenBatch(ledger, { id, modules = [], builders = [], note = null, kind = 'feature' }, now) {
  const L = clone(ledger);
  if (!id) throw new LedgerError('open-batch needs --id');
  if (kind !== 'feature' && kind !== 'kit') throw new LedgerError(`open-batch --kind must be feature or kit, got "${kind}"`);
  // A kit batch (/kit grow) builds kit parts, not modules: it may carry no module at all.
  if (kind === 'feature' && !modules?.length) throw new LedgerError('open-batch needs --modules a,b (or --kind kit for a kit batch)');
  if (L.batches.some((b) => b.id === id)) throw new LedgerError(`batch "${id}" already exists`);
  const unknown = modules.filter((m) => !L.modules[m]);
  if (unknown.length) throw new LedgerError(`unknown module(s): ${unknown.join(', ')}`);
  for (const m of modules) {
    const t = checkTransition(L.modules[m].status, 'in-batch');
    if (!t.ok || t.noop) throw new LedgerError(`${m}: ${t.noop ? `already in-batch (${L.modules[m].batch})` : t.reason}`);
  }
  for (const m of modules) move(L, m, 'in-batch', now, { batch: id, note });
  L.batches.push({ id, kind, modules: [...modules], builders: [...builders], opened: now, closed: null, verdict: null, verdict_text: null, commits: [], ...(note ? { note } : {}) });
  L.updated = now;
  return L;
}

function openBatch(L, id) {
  const b = L.batches.find((x) => x.id === id);
  if (!b) throw new LedgerError(`unknown batch "${id}"`);
  if (b.closed) throw new LedgerError(`batch "${id}" was closed ${b.closed} with verdict ${b.verdict}`);
  return b;
}

export function applyGate(ledger, { id }, now) {
  const L = clone(ledger);
  const b = openBatch(L, id);
  for (const m of b.modules) move(L, m, 'gated', now, { batch: id });
  b.gated = now;
  L.updated = now;
  return L;
}

/**
 * Close a batch with the owner's verdict. `text` is the owner's words, verbatim, and is
 * required: a verdict without them is a claim nobody can audit later.
 * For "mixed", approved + sentBack must partition the batch's modules exactly.
 */
export function applyCloseBatch(ledger, { id, verdict, text, commits = [], approved = [], sentBack = [] }, now) {
  const L = clone(ledger);
  const b = openBatch(L, id);
  if (!VERDICTS.includes(verdict)) throw new LedgerError(`verdict must be one of ${VERDICTS.join(' | ')}`);
  if (!text || !String(text).trim()) throw new LedgerError('close-batch needs --text "<the owner\'s words, verbatim>"');
  let plan;
  if (verdict === 'mixed') {
    const all = new Set([...approved, ...sentBack]);
    const missing = b.modules.filter((m) => !all.has(m));
    const extra = [...all].filter((m) => !b.modules.includes(m));
    const both = approved.filter((m) => sentBack.includes(m));
    if (missing.length || extra.length || both.length) {
      throw new LedgerError(`mixed verdict must split the batch exactly: ${[missing.length && 'unassigned ' + missing.join(','), extra.length && 'not in batch ' + extra.join(','), both.length && 'in both ' + both.join(',')].filter(Boolean).join('; ')}`);
    }
    plan = [...approved.map((m) => [m, 'approved']), ...sentBack.map((m) => [m, 'sent-back'])];
  } else plan = b.modules.map((m) => [m, verdict]);
  for (const [m, to] of plan) {
    const t = checkTransition(L.modules[m].status, to);
    if (!t.ok) throw new LedgerError(`${m}: ${t.reason}`);
  }
  for (const [m, to] of plan) move(L, m, to, now, { batch: id });
  Object.assign(b, { closed: now, verdict, verdict_text: String(text), commits: [...b.commits, ...commits] });
  if (verdict === 'mixed') b.split = { approved: [...approved], 'sent-back': [...sentBack] };
  L.updated = now;
  return L;
}

export function applyMark(ledger, { module, status, reopen = false, note = null }, now) {
  const L = clone(ledger);
  if (!module || !status) throw new LedgerError('mark needs --module and --status');
  // Leaving a batch by hand (abandon, skip) is legal; the batch record keeps its module list.
  move(L, module, status, now, { reopen, note });
  L.updated = now;
  return L;
}

/**
 * Record a kit part. With --batch it is BUILT in that batch; without, it is PROPOSED (a builder asked for
 * it and did not hand-roll it) - the method runs /kit grow before the next feature batch while any
 * proposed part is open. A proposal carries who asked (--by) and why (--why).
 */
export function applyAddKitPart(ledger, { name, api, batch = null, replace = false, by = null, why = null }, now) {
  const L = clone(ledger);
  if (!name || !api) throw new LedgerError('add-kit-part needs --name and --api (and --batch when the part is built)');
  if (batch && !L.batches.some((b) => b.id === batch)) throw new LedgerError(`unknown batch "${batch}"`);
  const i = L.kitParts.findIndex((k) => k.name === name);
  const prev = i >= 0 ? L.kitParts[i] : null;
  if (prev && !replace && !(prev.status === 'proposed' && batch)) {
    throw new LedgerError(`kit part "${name}" already recorded (${prev.status || 'built'}); pass --replace to change it, or --batch to mark a proposal built`);
  }
  const rec = batch
    ? { ...(prev || {}), name, api, status: 'built', added_in: prev && prev.status !== 'proposed' ? prev.added_in : batch, updated: now, ...(prev && prev.status !== 'proposed' ? { changed_in: batch } : {}) }
    : { name, api, status: 'proposed', proposed: now, by, why, updated: now };
  if (i >= 0) L.kitParts[i] = rec; else L.kitParts.push(rec);
  L.updated = now;
  return L;
}

/** Counts per status, open batches and the next N pending modules by rank. */
export function summarize(ledger, next = 10) {
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const m of Object.values(ledger.modules)) counts[m.status] = (counts[m.status] || 0) + 1;
  const byRank = (a, b) => (a[1].rank ?? Infinity) - (b[1].rank ?? Infinity) || a[0].localeCompare(b[0]);
  const pend = Object.entries(ledger.modules).filter(([, m]) => m.status === 'pending' || m.status === 'sent-back').sort(byRank);
  return {
    total: Object.keys(ledger.modules).length, counts,
    open: ledger.batches.filter((b) => !b.closed).map((b) => ({ id: b.id, modules: b.modules, opened: b.opened, gated: b.gated || null })),
    sentBack: pend.filter(([, m]) => m.status === 'sent-back').map(([k]) => k),
    next: pend.filter(([, m]) => m.status === 'pending').slice(0, next).map(([k, m]) => ({ module: k, rank: m.rank ?? null })),
    batches: ledger.batches.length, kitParts: ledger.kitParts.length,
    proposedKitParts: ledger.kitParts.filter((k) => k.status === 'proposed').map((k) => ({ name: k.name, api: k.api, by: k.by || null })),
  };
}

/** Read a ledger; throws LedgerError on a missing file, bad JSON or a foreign schema. */
export function readLedger(file) {
  if (!fs.existsSync(file)) throw new LedgerError(`no ledger at ${file} - run init first`);
  let L;
  try { L = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { throw new LedgerError(`${file} is not JSON: ${e.message}`); }
  if (L.schema !== SCHEMA) throw new LedgerError(`${file}: schema ${L.schema} is not ${SCHEMA} - refusing to touch it`);
  return L;
}

/** Write via a temp file in the same directory + rename, so a crash never leaves half a ledger. */
export function writeAtomic(file, data) {
  const dir = path.dirname(path.resolve(file));
  fs.mkdirSync(dir, { recursive: true });
  const tmp = path.join(dir, `.${path.basename(file)}.${process.pid}.${Date.now()}.tmp`);
  fs.writeFileSync(tmp, JSON.stringify(data, null, 1) + '\n');
  try { fs.renameSync(tmp, file); } catch (e) { try { fs.unlinkSync(tmp); } catch { /* gone */ } throw e; }
}

const list = (s) => (s || '').split(',').map((x) => x.trim()).filter(Boolean);

export function run(argv, now = new Date().toISOString(), log = console.log) {
  const cmd = argv[0];
  const a = argReader(argv.slice(1));
  const file = a.get('--ledger');
  if (!cmd || cmd.startsWith('--')) throw new LedgerError('usage: coverage.mjs <init|status|open-batch|gate|close-batch|mark|add-kit-part> --ledger <file> ...');
  if (!file) throw new LedgerError('--ledger <file> is required');
  if (cmd === 'init') {
    const invFile = a.get('--inventory');
    if (!invFile) throw new LedgerError('init needs --inventory <file>');
    const inv = JSON.parse(fs.readFileSync(invFile, 'utf8'));
    const prev = fs.existsSync(file) ? readLedger(file) : null;
    const r = applyInit(prev, inv, now);
    writeAtomic(file, r.ledger);
    log(`init: ${r.added} added, ${r.kept} kept (statuses untouched)${r.stale.length ? `, ${r.stale.length} in ledger but not in inventory: ${r.stale.slice(0, 10).join(', ')}${r.stale.length > 10 ? ', ...' : ''}` : ''}`);
    return r.ledger;
  }
  const L = readLedger(file);
  let N;
  switch (cmd) {
    case 'status': {
      const s = summarize(L, +a.get('--next', 10));
      if (a.has('--json')) { log(JSON.stringify(s, null, 1)); return L; }
      log(`${s.total} modules  ` + STATUSES.map((k) => `${k}=${s.counts[k]}`).join('  ') + `  batches=${s.batches} kitParts=${s.kitParts}`);
      for (const b of s.open) log(`OPEN     ${b.id}${b.gated ? ' (gated)' : ''}: ${b.modules.join(', ')}`);
      if (s.sentBack.length) log(`SENTBACK ${s.sentBack.join(', ')}`);
      for (const k of s.proposedKitParts) log(`KIT-GAP  ${k.name}  ${k.api}${k.by ? `  (asked by ${k.by})` : ''}  -> run /kit grow first`);
      for (const n of s.next) log(`NEXT     #${n.rank ?? '?'} ${n.module}`);
      return L;
    }
    case 'open-batch': N = applyOpenBatch(L, { id: a.get('--id'), modules: list(a.get('--modules')), builders: list(a.get('--builders')), note: a.get('--note', null), kind: a.get('--kind', 'feature') }, now); break;
    case 'gate': N = applyGate(L, { id: a.get('--id') }, now); break;
    case 'close-batch': N = applyCloseBatch(L, { id: a.get('--id'), verdict: a.get('--verdict'), text: a.get('--text'), commits: list(a.get('--commits')), approved: list(a.get('--approved')), sentBack: list(a.get('--sent-back')) }, now); break;
    case 'mark': N = applyMark(L, { module: a.get('--module'), status: a.get('--status'), reopen: a.has('--reopen'), note: a.get('--note', null) }, now); break;
    case 'add-kit-part': N = applyAddKitPart(L, { name: a.get('--name'), api: a.get('--api'), batch: a.get('--batch', null), replace: a.has('--replace'), by: a.get('--by', null), why: a.get('--why', null) }, now); break;
    default: throw new LedgerError(`unknown command "${cmd}"`);
  }
  writeAtomic(file, N);
  log(`${cmd}: ok`);
  return N;
}

if (isMain(import.meta.url)) {
  try { run(process.argv.slice(2)); } catch (e) { console.error('coverage: ' + e.message); process.exit(e instanceof LedgerError ? 1 : 2); }
}
