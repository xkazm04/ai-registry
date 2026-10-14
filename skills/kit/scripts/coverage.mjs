// coverage.mjs - the kit's MEMORY across sessions: which modules are done, in flight, sent
// back or dead; every batch with the owner's verdict in their own words; every kit part and
// the batch that introduced it. One JSON file, written atomically, versioned by `schema`.
//
//   node coverage.mjs <command> --ledger <file> [options]
//
//   init          --inventory <file>             seed modules (never overwrites a status);
//                                                reachable===0 rows are seeded `dead`;
//                                                system rows (join.mjs `system`) are flagged and
//                                                never offered as NEXT
//   status        [--next 10] [--json]           counts per status, open batches, next pending
//   open-batch    --id <id> --modules a,b [--builders x,y] [--note ...]
//   gate          --id <id>                      every module of the batch -> gated
//   close-batch   --id <id> --verdict approved|director-approved|sent-back|mixed --text "<words>"
//                 [--approved a,b --director-approved c --sent-back d] [--commits sha,sha]
//                 [--decisions <file>]
//                 (approved/sent-back/mixed: the OWNER's words; director-approved: the Director's
//                 decision record - gate_mode key-decisions closes batches this way, and then
//                 --decisions is REQUIRED: a numbered list "1. ...", one decision per number,
//                 "key (a)".."key (d)" marking the ones the owner answered)
//   summary-gate  --id <id> --verdict approved|sent-back|mixed --text "<owner words>"
//                 [--batches b1,b2] [--approved a,b --sent-back c]
//                 (the periodic owner gate over Director-approved batches; no --batches = every
//                 batch still awaiting one)
//   adopt         --id adopt-0 --text "<why the kit is adopted, not built>"
//                 (records an existing kit as a closed `adopt` batch; register its parts with
//                 add-kit-part --batch adopt-0)
//   mark          --module m --status s [--reopen] [--note ...]
//                 (--status done-outside needs --note "done-outside: <gate, sha>": a module already
//                 composed from the kit and approved by the owner before the ledger existed)
//   add-kit-part  --name <Name> --api "<signature>" [--batch <id>] [--by <module>] [--why "..."] [--replace]
//                 --parts <file.json> --batch <id>          (bulk: [{ name, api, why? }], all or nothing)
//                 --name <Name> [--api ...] --declined --why "<owner words or reason>"
//                 (no --batch = PROPOSED; --batch on a proposed part marks it built; --declined =
//                 the owner chose not to build it: it stops showing as KIT-GAP, and a later
//                 proposal or build of that name needs --replace)
//   status        ... [--summary-every N] [--all]          (SUMMARY-DUE at N waiting batches;
//                                                           --all lets system modules into NEXT)
//
// Inventory: the JSON join.mjs --out writes ({ modules: [...] }), a style-divergence --json
// file, a reachability --json file, or a bare array of { module, ... }. Its order is the
// rank `status` uses for "next pending".
//
// Statuses and the legal moves (anything else exits 1 with the reason):
//   pending           -> in-batch | skipped | dead | done-outside
//   in-batch          -> gated | pending | approved | director-approved | sent-back | skipped
//   gated             -> approved | director-approved | sent-back | in-batch
//   director-approved -> approved | sent-back | in-batch   (only a summary gate makes it approved)
//   sent-back         -> in-batch | pending | skipped
//   skipped           -> pending | in-batch | done-outside
//   done-outside      -> pending | in-batch     (approved outside the ledger; reopened like skipped)
//   dead              -> pending | skipped    (revived only after the owner fixes routing)
//   approved          -> (any) only with --reopen (an owner-approved module is not re-touched silently)
// A move to the status a module already has is a no-op, which is what makes re-runs safe.
//
// The ledger lives in the consuming project (its vault or .kit/), never in the skill.

import fs from 'node:fs';
import path from 'node:path';
import { argReader, isMain } from './lib/modules.mjs';

export const SCHEMA = 1;
export const STATUSES = ['pending', 'in-batch', 'gated', 'director-approved', 'approved', 'done-outside', 'sent-back', 'skipped', 'dead'];
export const TRANSITIONS = {
  pending: ['in-batch', 'skipped', 'dead', 'done-outside'],
  'in-batch': ['gated', 'pending', 'approved', 'director-approved', 'sent-back', 'skipped'],
  gated: ['approved', 'director-approved', 'sent-back', 'in-batch'],
  // A Director approval is not an owner approval: it waits for a summary gate, and the Director may
  // reopen his own call without --reopen.
  'director-approved': ['approved', 'sent-back', 'in-batch'],
  'sent-back': ['in-batch', 'pending', 'skipped'],
  skipped: ['pending', 'in-batch', 'done-outside'],
  // Composed from the kit and approved by the owner before adoption: evidence in the note.
  'done-outside': ['pending', 'in-batch'],
  dead: ['pending', 'skipped'],
  approved: [],
};
export const VERDICTS = ['approved', 'director-approved', 'sent-back', 'mixed'];
export const SUMMARY_VERDICTS = ['approved', 'sent-back', 'mixed'];
export const BATCH_KINDS = ['feature', 'kit'];

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
    if (cur) {
      cur.rank = i + 1;
      if (r.system === true) cur.system = true; else delete cur.system;
      return;
    }
    L.modules[r.module] = { status: r.reachable === 0 ? 'dead' : 'pending', rank: i + 1, added: now, updated: now, history: [], ...(r.system === true ? { system: true } : {}) };
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
  if (!BATCH_KINDS.includes(kind)) throw new LedgerError(`open-batch --kind must be feature or kit, got "${kind}"${kind === 'adopt' ? ' (an adopt batch is recorded by the adopt command)' : ''}`);
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
 * Split `modules` exactly across named groups ({ status: [modules] }); throws with every
 * unassigned, foreign or doubly-assigned module named. Returns [[module, status], ...].
 */
export function partition(modules, groups, what = 'batch') {
  const seen = new Map();
  const both = [];
  for (const [to, ms] of Object.entries(groups)) for (const m of ms) { if (seen.has(m)) both.push(m); else seen.set(m, to); }
  const missing = modules.filter((m) => !seen.has(m));
  const extra = [...seen.keys()].filter((m) => !modules.includes(m));
  if (missing.length || extra.length || both.length) {
    throw new LedgerError(`mixed verdict must split the ${what} exactly: ${[missing.length && 'unassigned ' + missing.join(','), extra.length && 'not in ' + what + ' ' + extra.join(','), both.length && 'in more than one group ' + both.join(',')].filter(Boolean).join('; ')}`);
  }
  return [...seen.entries()];
}

/**
 * Parse the Director's numbered decision list ("1. ...", "2) ..."; unnumbered lines continue the
 * previous item). "key (a)".."key (d)" marks a decision the owner answered. Throws when the text
 * holds no numbered item or the numbers do not run 1..n.
 */
export function parseDecisions(text) {
  const items = [];
  for (const line of String(text || '').split(/\r?\n/)) {
    const m = /^\s*(\d+)[.)]\s+(.*\S)\s*$/.exec(line);
    if (m) items.push({ n: +m[1], text: m[2] });
    else if (line.trim() && items.length) items[items.length - 1].text += ' ' + line.trim();
  }
  if (!items.length) throw new LedgerError('--decisions holds no numbered decision ("1. <decision>"): the list is what the summary gate reverses by number');
  const bad = items.findIndex((d, i) => d.n !== i + 1);
  if (bad >= 0) throw new LedgerError(`--decisions numbering must run 1..n: item ${bad + 1} is numbered ${items[bad].n}`);
  return items.map((d) => {
    const k = /\bkey\s*\(([a-d])\)/i.exec(d.text);
    return { ...d, ...(k ? { key: k[1].toLowerCase() } : {}) };
  });
}

/**
 * Close a batch. `text` is required: for approved / sent-back / mixed it is the OWNER's words,
 * verbatim (a verdict without them is a claim nobody can audit later); for director-approved
 * (gate_mode key-decisions) it is the Director's decision record, and the batch then awaits a
 * summary gate (`decided_by: director`). For "mixed", the groups must partition the modules exactly.
 */
export function applyCloseBatch(ledger, { id, verdict, text, commits = [], approved = [], directorApproved = [], sentBack = [], decisions = null }, now) {
  const L = clone(ledger);
  const b = openBatch(L, id);
  if (!VERDICTS.includes(verdict)) throw new LedgerError(`verdict must be one of ${VERDICTS.join(' | ')}`);
  if (!text || !String(text).trim()) {
    throw new LedgerError(verdict === 'director-approved'
      ? 'close-batch --verdict director-approved needs --text "<the Director\'s decision record>"'
      : 'close-batch needs --text "<the owner\'s words, verbatim>"');
  }
  const plan = verdict === 'mixed'
    ? partition(b.modules, { approved, 'director-approved': directorApproved, 'sent-back': sentBack })
    : b.modules.map((m) => [m, verdict]);
  for (const [m, to] of plan) {
    const t = checkTransition(L.modules[m].status, to);
    if (!t.ok) throw new LedgerError(`${m}: ${t.reason}`);
  }
  const byDirector = plan.some(([, to]) => to === 'director-approved') || (verdict === 'director-approved');
  if (byDirector && decisions == null) throw new LedgerError('a director-approved close needs --decisions <file>: the numbered decision list (gate-kit.md), key decisions marked "key (a)".."key (d)"');
  const decided = decisions == null ? null : (Array.isArray(decisions) ? decisions : parseDecisions(decisions));
  for (const [m, to] of plan) move(L, m, to, now, { batch: id });
  Object.assign(b, { closed: now, verdict, verdict_text: String(text), commits: [...b.commits, ...commits], decided_by: byDirector ? 'director' : 'owner' });
  if (byDirector) b.summary = null;
  if (decided) b.decisions = decided;
  if (verdict === 'mixed') {
    b.split = { approved: [...approved], 'sent-back': [...sentBack] };
    if (directorApproved.length) b.split['director-approved'] = [...directorApproved];
  }
  L.updated = now;
  return L;
}

/** Closed batches the Director decided that no summary gate has covered yet, oldest first. */
export function awaitingSummary(ledger) {
  return ledger.batches.filter((b) => b.closed && b.decided_by === 'director' && !b.summary);
}

/**
 * The periodic owner gate over Director-approved batches (gate_mode key-decisions): one family
 * image covering N batches, one verdict in the owner's words. Moves every module of those batches
 * still `director-approved` to approved / sent-back (mixed: split exactly) and stamps each batch
 * with the summary id. Without `batches`, it covers every batch awaiting a summary.
 */
export function applySummaryGate(ledger, { id, batches = [], verdict, text, approved = [], sentBack = [] }, now) {
  const L = clone(ledger);
  L.summaries = L.summaries || [];
  if (!id) throw new LedgerError('summary-gate needs --id');
  if (L.summaries.some((s) => s.id === id)) throw new LedgerError(`summary gate "${id}" already exists`);
  if (!SUMMARY_VERDICTS.includes(verdict)) throw new LedgerError(`summary-gate verdict must be one of ${SUMMARY_VERDICTS.join(' | ')}`);
  if (!text || !String(text).trim()) throw new LedgerError('summary-gate needs --text "<the owner\'s words, verbatim>"');
  const waiting = awaitingSummary(L);
  let covered;
  if (batches.length) {
    covered = batches.map((bid) => {
      const b = L.batches.find((x) => x.id === bid);
      if (!b) throw new LedgerError(`unknown batch "${bid}"`);
      if (!waiting.includes(b)) throw new LedgerError(`batch "${bid}" is not awaiting a summary gate (${b.closed ? (b.summary ? `covered by ${b.summary}` : `decided by ${b.decided_by || 'owner'}`) : 'still open'})`);
      return b;
    });
  } else covered = waiting;
  if (!covered.length) throw new LedgerError('no Director-approved batch awaits a summary gate');
  const modules = [...new Set(covered.flatMap((b) => b.modules))].filter((m) => L.modules[m] && L.modules[m].status === 'director-approved');
  const plan = verdict === 'mixed' ? partition(modules, { approved, 'sent-back': sentBack }, 'summary') : modules.map((m) => [m, verdict]);
  for (const [m, to] of plan) move(L, m, to, now, { batch: covered.find((b) => b.modules.includes(m)).id, note: `summary ${id}` });
  for (const b of covered) b.summary = id;
  L.summaries.push({ id, at: now, batches: covered.map((b) => b.id), modules, verdict, verdict_text: String(text), ...(verdict === 'mixed' ? { split: { approved: [...approved], 'sent-back': [...sentBack] } } : {}) });
  L.updated = now;
  return L;
}

/**
 * Record an existing kit as an `adopt` batch (/kit adopt): closed at birth, no modules, the reason
 * in `verdict_text`. Its parts are then registered with add-kit-part --batch <id>.
 */
export function applyAdopt(ledger, { id, text }, now) {
  const L = clone(ledger);
  if (!id) throw new LedgerError('adopt needs --id (e.g. adopt-0)');
  if (!text || !String(text).trim()) throw new LedgerError('adopt needs --text "<why this kit is adopted rather than built>"');
  if (L.batches.some((b) => b.id === id)) throw new LedgerError(`batch "${id}" already exists`);
  L.batches.push({ id, kind: 'adopt', modules: [], builders: [], opened: now, closed: now, verdict: 'registered', verdict_text: String(text), commits: [] });
  L.updated = now;
  return L;
}

export function applyMark(ledger, { module, status, reopen = false, note = null }, now) {
  const L = clone(ledger);
  if (!module || !status) throw new LedgerError('mark needs --module and --status');
  // Leaving a batch by hand (abandon, skip) is legal; the batch record keeps its module list.
  if (status === 'done-outside' && !(note && String(note).trim())) {
    throw new LedgerError('mark --status done-outside needs --note "done-outside: <gate, sha>" - the evidence that the owner approved it outside the ledger');
  }
  move(L, module, status, now, { reopen, note });
  L.updated = now;
  return L;
}

/**
 * Record a kit part. With --batch it is BUILT in that batch; without, it is PROPOSED (a builder asked for
 * it and did not hand-roll it) - the method runs /kit grow before the next feature batch while any
 * proposed part is open. A proposal carries who asked (--by) and why (--why).
 */
export function applyAddKitPart(ledger, { name, api, batch = null, replace = false, by = null, why = null, declined = false }, now) {
  const L = clone(ledger);
  const i = L.kitParts.findIndex((k) => k.name === name);
  const prev = i >= 0 ? L.kitParts[i] : null;
  if (declined) {
    // The owner chose not to build it: the gap stops reappearing, and the reason is kept.
    if (!name) throw new LedgerError('add-kit-part --declined needs --name');
    if (batch) throw new LedgerError('--declined and --batch exclude each other: a declined part is not built');
    if (!why || !String(why).trim()) throw new LedgerError('add-kit-part --declined needs --why "<the owner\'s words or the reason>"');
    if (prev && prev.status === 'declined') return L; // re-run safe
    if (prev && prev.status !== 'proposed') throw new LedgerError(`kit part "${name}" is built (added in ${prev.added_in}); removing a built part is a kit batch, not a decline`);
    const rec = { ...(prev || {}), name, api: api || (prev && prev.api) || null, status: 'declined', declined: now, declined_why: String(why), updated: now };
    if (i >= 0) L.kitParts[i] = rec; else L.kitParts.push(rec);
    L.updated = now;
    return L;
  }
  if (!name || !api) throw new LedgerError('add-kit-part needs --name and --api (and --batch when the part is built)');
  if (batch && !L.batches.some((b) => b.id === batch)) throw new LedgerError(`unknown batch "${batch}"`);
  if (prev && prev.status === 'declined' && !replace) {
    throw new LedgerError(`kit part "${name}" was declined ${prev.declined}: ${prev.declined_why} - pass --replace only on new owner words`);
  }
  if (prev && prev.status !== 'declined' && !replace && !(prev.status === 'proposed' && batch)) {
    throw new LedgerError(`kit part "${name}" already recorded (${prev.status || 'built'}); pass --replace to change it, or --batch to mark a proposal built`);
  }
  const wasBuilt = prev && prev.status !== 'proposed' && prev.status !== 'declined';
  const rec = batch
    ? { ...(prev || {}), name, api, status: 'built', added_in: wasBuilt ? prev.added_in : batch, updated: now, ...(wasBuilt ? { changed_in: batch } : {}), ...(why ? { why } : {}) }
    : { name, api, status: 'proposed', proposed: now, by, why, updated: now };
  if (!wasBuilt && rec.status === 'built') { delete rec.declined; delete rec.declined_why; }
  if (i >= 0) L.kitParts[i] = rec; else L.kitParts.push(rec);
  L.updated = now;
  return L;
}

/** Bulk registration ([{ name, api, why? }]) against one batch - all or nothing (adopt-0 registers a whole kit). */
export function applyAddKitParts(ledger, { parts, batch, replace = false }, now) {
  if (!Array.isArray(parts) || !parts.length) throw new LedgerError('--parts must be a JSON array of { name, api, why? }');
  if (!batch) throw new LedgerError('add-kit-part --parts needs --batch <id> (bulk registers built parts)');
  parts.forEach((p, i) => {
    const where = `--parts row ${i}${p && typeof p.name === 'string' ? ` ("${p.name}")` : ''}`;
    if (!p || typeof p !== 'object' || Array.isArray(p)) throw new LedgerError(`${where}: not an object - each row is { "name": "...", "api": "...", "why": "..." }`);
    for (const k of ['name', 'api']) if (typeof p[k] !== 'string' || !p[k].trim()) throw new LedgerError(`${where}: missing JSON key "${k}" (a non-empty string)`);
  });
  const names = parts.map((p) => p.name);
  const dup = names.filter((n, k) => names.indexOf(n) !== k);
  if (dup.length) throw new LedgerError(`--parts names a part twice: ${[...new Set(dup)].join(', ')}`);
  let L = ledger;
  parts.forEach((p, i) => {
    try { L = applyAddKitPart(L, { name: p.name, api: p.api, batch, replace, why: p.why || null }, now); } catch (e) { throw new LedgerError(`--parts row ${i} ("${p.name}"): ${e.message}`); }
  });
  return L === ledger ? clone(ledger) : L;
}

/**
 * Counts per status, open batches, the next N pending modules by rank, open kit gaps, and the
 * Director-approved batches awaiting a summary gate (`summaryDue` once `summaryEvery` of them wait).
 */
export function summarize(ledger, next = 10, { summaryEvery = 0, all = false } = {}) {
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const m of Object.values(ledger.modules)) counts[m.status] = (counts[m.status] || 0) + 1;
  const byRank = (a, b) => (a[1].rank ?? Infinity) - (b[1].rank ?? Infinity) || a[0].localeCompare(b[0]);
  // System modules (the kit, shared folders) change in kit batches, never as NEXT feature work.
  const pend = Object.entries(ledger.modules).filter(([, m]) => (m.status === 'pending' || m.status === 'sent-back') && (all || !m.system)).sort(byRank);
  const waiting = awaitingSummary(ledger).map((b) => ({ id: b.id, kind: b.kind || 'feature', modules: b.modules.filter((m) => ledger.modules[m] && ledger.modules[m].status === 'director-approved') }));
  return {
    total: Object.keys(ledger.modules).length, counts,
    open: ledger.batches.filter((b) => !b.closed).map((b) => ({ id: b.id, modules: b.modules, opened: b.opened, gated: b.gated || null })),
    sentBack: pend.filter(([, m]) => m.status === 'sent-back').map(([k]) => k),
    next: pend.filter(([, m]) => m.status === 'pending').slice(0, next).map(([k, m]) => ({ module: k, rank: m.rank ?? null })),
    batches: ledger.batches.length,
    kitParts: ledger.kitParts.filter((k) => k.status !== 'proposed' && k.status !== 'declined').length,
    proposedKitParts: ledger.kitParts.filter((k) => k.status === 'proposed').map((k) => ({ name: k.name, api: k.api, by: k.by || null })),
    declinedKitParts: ledger.kitParts.filter((k) => k.status === 'declined').map((k) => ({ name: k.name, why: k.declined_why || null })),
    awaitingSummary: waiting,
    summaryDue: summaryEvery > 0 && waiting.length >= summaryEvery,
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
const readText = (file, flag) => {
  if (file == null) return null;
  try { return fs.readFileSync(file, 'utf8'); } catch (e) { throw new LedgerError(`${flag} ${file}: ${e.message}`); }
};

export function run(argv, now = new Date().toISOString(), log = console.log) {
  const cmd = argv[0];
  const a = argReader(argv.slice(1));
  const file = a.get('--ledger');
  if (!cmd || cmd.startsWith('--')) throw new LedgerError('usage: coverage.mjs <init|status|open-batch|gate|close-batch|summary-gate|adopt|mark|add-kit-part> --ledger <file> ...');
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
      const s = summarize(L, +a.get('--next', 10), { summaryEvery: +a.get('--summary-every', 0), all: a.has('--all') });
      if (a.has('--json')) { log(JSON.stringify(s, null, 1)); return L; }
      log(`${s.total} modules  ` + STATUSES.map((k) => `${k}=${s.counts[k]}`).join('  ') + `  batches=${s.batches} kitParts=${s.kitParts}${s.declinedKitParts.length ? ` declined=${s.declinedKitParts.length}` : ''}`);
      for (const b of s.open) log(`OPEN     ${b.id}${b.gated ? ' (gated)' : ''}: ${b.modules.join(', ')}`);
      if (s.sentBack.length) log(`SENTBACK ${s.sentBack.join(', ')}`);
      if (s.awaitingSummary.length) log(`${s.summaryDue ? 'SUMMARY-DUE' : 'SUMMARY '} ${s.awaitingSummary.length} Director-approved batch(es) await the owner: ${s.awaitingSummary.map((b) => `${b.id}(${b.modules.length})`).join(', ')}${s.summaryDue ? '  -> present the summary gate before the next batch' : ''}`);
      for (const k of s.proposedKitParts) log(`KIT-GAP  ${k.name}  ${k.api}${k.by ? `  (asked by ${k.by})` : ''}  -> run /kit grow first`);
      for (const n of s.next) log(`NEXT     #${n.rank ?? '?'} ${n.module}`);
      return L;
    }
    case 'open-batch': N = applyOpenBatch(L, { id: a.get('--id'), modules: list(a.get('--modules')), builders: list(a.get('--builders')), note: a.get('--note', null), kind: a.get('--kind', 'feature') }, now); break;
    case 'gate': N = applyGate(L, { id: a.get('--id') }, now); break;
    case 'close-batch': N = applyCloseBatch(L, { id: a.get('--id'), verdict: a.get('--verdict'), text: a.get('--text'), commits: list(a.get('--commits')), approved: list(a.get('--approved')), directorApproved: list(a.get('--director-approved')), sentBack: list(a.get('--sent-back')), decisions: readText(a.get('--decisions', null), '--decisions') }, now); break;
    case 'summary-gate': N = applySummaryGate(L, { id: a.get('--id'), batches: list(a.get('--batches')), verdict: a.get('--verdict'), text: a.get('--text'), approved: list(a.get('--approved')), sentBack: list(a.get('--sent-back')) }, now); break;
    case 'adopt': N = applyAdopt(L, { id: a.get('--id'), text: a.get('--text') }, now); break;
    case 'mark': N = applyMark(L, { module: a.get('--module'), status: a.get('--status'), reopen: a.has('--reopen'), note: a.get('--note', null) }, now); break;
    case 'add-kit-part': {
      const partsFile = a.get('--parts', null);
      if (partsFile) {
        let parts;
        try { parts = JSON.parse(fs.readFileSync(partsFile, 'utf8')); } catch (e) { throw new LedgerError(`--parts ${partsFile}: ${e.message}`); }
        N = applyAddKitParts(L, { parts, batch: a.get('--batch', null), replace: a.has('--replace') }, now);
      } else {
        N = applyAddKitPart(L, { name: a.get('--name'), api: a.get('--api'), batch: a.get('--batch', null), replace: a.has('--replace'), by: a.get('--by', null), why: a.get('--why', null), declined: a.has('--declined') }, now);
      }
      break;
    }
    default: throw new LedgerError(`unknown command "${cmd}"`);
  }
  writeAtomic(file, N);
  log(`${cmd}: ok`);
  return N;
}

if (isMain(import.meta.url)) {
  try { run(process.argv.slice(2)); } catch (e) { console.error('coverage: ' + e.message); process.exit(e instanceof LedgerError ? 1 : 2); }
}
