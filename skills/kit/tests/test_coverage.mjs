// Deterministic tests for coverage.mjs, the kit's cross-session memory:
// `node --test skills/kit/tests`. Builtins only; ledgers are written in a temp dir.
//
// What is worth pinning: init is idempotent and never overwrites an owner's verdict; the
// transition table refuses the moves that would silently undo a decision; a verdict carries
// the owner's words; and a write never leaves half a ledger behind.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  SCHEMA, checkTransition, applyInit, applyOpenBatch, applyGate, applyCloseBatch, applyMark, applyAddKitPart,
  summarize, writeAtomic, readLedger, inventoryRows, run, LedgerError,
} from '../scripts/coverage.mjs';

const T0 = '2026-01-01T00:00:00.000Z', T1 = '2026-01-02T00:00:00.000Z';
const INV = { modules: [{ module: 'a/sub_1', reachable: 3 }, { module: 'b/sub_2', reachable: 1 }, { module: 'c/sub_3', reachable: 2 }, { module: 'dead/sub_x', reachable: 0 }] };

test('transition table: legal, no-op, illegal, reopen, unknown', () => {
  assert.deepEqual(checkTransition('pending', 'in-batch'), { ok: true });
  assert.deepEqual(checkTransition('gated', 'gated'), { ok: true, noop: true });
  assert.equal(checkTransition('pending', 'approved').ok, false, 'no verdict without a batch');
  assert.equal(checkTransition('dead', 'in-batch').ok, false, 'dead is revived to pending first');
  assert.match(checkTransition('approved', 'in-batch').reason, /--reopen/);
  assert.equal(checkTransition('approved', 'in-batch', { reopen: true }).ok, true);
  assert.equal(checkTransition('approved', 'approved').noop, true);
  assert.match(checkTransition('pending', 'done').reason, /unknown status/);
});

test('init seeds pending/dead in inventory order and is idempotent', () => {
  const r1 = applyInit(null, INV, T0);
  assert.equal(r1.ledger.schema, SCHEMA);
  assert.equal(r1.added, 4);
  assert.equal(r1.ledger.modules['dead/sub_x'].status, 'dead');
  assert.equal(r1.ledger.modules['c/sub_3'].rank, 3);
  const L = applyMark(r1.ledger, { module: 'a/sub_1', status: 'skipped' }, T1);
  // Re-init with a new order and a new module: statuses kept, ranks refreshed, new module added.
  const r2 = applyInit(L, { modules: [{ module: 'c/sub_3' }, { module: 'a/sub_1' }, { module: 'n/new' }] }, T1);
  assert.equal(r2.added, 1);
  assert.equal(r2.ledger.modules['a/sub_1'].status, 'skipped');
  assert.equal(r2.ledger.modules['c/sub_3'].rank, 1);
  assert.deepEqual(r2.stale.sort(), ['b/sub_2', 'dead/sub_x']);
  assert.deepEqual(applyInit(r2.ledger, { modules: [{ module: 'c/sub_3' }, { module: 'a/sub_1' }, { module: 'n/new' }] }, T1).ledger, r2.ledger);
  assert.throws(() => applyInit({ ...r2.ledger, schema: 99 }, INV, T1), /schema/);
  assert.throws(() => applyInit(null, { modules: [] }, T0), /no \{ module \}/);
  assert.equal(inventoryRows([{ module: 'x' }, { nope: 1 }]).length, 1);
});

test('batch lifecycle: open, gate, mixed close with verbatim words, kit parts', () => {
  let L = applyInit(null, INV, T0).ledger;
  L = applyOpenBatch(L, { id: 'b1', modules: ['a/sub_1', 'b/sub_2'], builders: ['P', 'Q'] }, T0);
  assert.equal(L.modules['a/sub_1'].status, 'in-batch');
  assert.equal(L.modules['a/sub_1'].batch, 'b1');
  assert.throws(() => applyOpenBatch(L, { id: 'b1', modules: ['c/sub_3'] }, T0), /already exists/);
  assert.throws(() => applyOpenBatch(L, { id: 'b2', modules: ['a/sub_1'] }, T0), /already in-batch/);
  assert.throws(() => applyOpenBatch(L, { id: 'b2', modules: ['zzz'] }, T0), /unknown module/);
  assert.throws(() => applyOpenBatch(L, { id: 'b2', modules: ['dead/sub_x'] }, T0), /illegal transition dead -> in-batch/);
  L = applyGate(L, { id: 'b1' }, T1);
  assert.equal(L.modules['b/sub_2'].status, 'gated');
  assert.throws(() => applyCloseBatch(L, { id: 'b1', verdict: 'approved', text: '  ' }, T1), /verbatim/);
  assert.throws(() => applyCloseBatch(L, { id: 'b1', verdict: 'mixed', text: 'x', approved: ['a/sub_1'] }, T1), /unassigned b\/sub_2/);
  assert.throws(() => applyCloseBatch(L, { id: 'b1', verdict: 'fine', text: 'x' }, T1), /verdict must be/);
  const words = 'The first one reads calm. The second still shouts - redo the header.';
  L = applyCloseBatch(L, { id: 'b1', verdict: 'mixed', text: words, approved: ['a/sub_1'], sentBack: ['b/sub_2'], commits: ['abc1234'] }, T1);
  const b = L.batches[0];
  assert.deepEqual([b.verdict, b.verdict_text, b.commits, b.closed], ['mixed', words, ['abc1234'], T1]);
  assert.equal(L.modules['a/sub_1'].status, 'approved');
  assert.equal(L.modules['b/sub_2'].status, 'sent-back');
  assert.deepEqual(L.modules['b/sub_2'].history.map((h) => h.to), ['in-batch', 'gated', 'sent-back']);
  assert.throws(() => applyGate(L, { id: 'b1' }, T1), /was closed/);
  // Approved stays approved unless reopened.
  assert.throws(() => applyMark(L, { module: 'a/sub_1', status: 'in-batch' }, T1), /--reopen/);
  assert.equal(applyMark(L, { module: 'a/sub_1', status: 'in-batch', reopen: true }, T1).modules['a/sub_1'].status, 'in-batch');
  // Kit parts.
  L = applyAddKitPart(L, { name: 'DataGrid', api: '<DataGrid rows cols />', batch: 'b1' }, T1);
  assert.throws(() => applyAddKitPart(L, { name: 'DataGrid', api: 'v2', batch: 'b1' }, T1), /--replace/);
  assert.throws(() => applyAddKitPart(L, { name: 'X', api: 'y', batch: 'nope' }, T1), /unknown batch/);
  L = applyOpenBatch(L, { id: 'b2', modules: ['b/sub_2'] }, T1);
  L = applyAddKitPart(L, { name: 'DataGrid', api: 'v2', batch: 'b2', replace: true }, T1);
  assert.deepEqual([L.kitParts[0].added_in, L.kitParts[0].changed_in, L.kitParts[0].api], ['b1', 'b2', 'v2']);
  // Summary: counts, open batches, next pending by rank.
  const s = summarize(L, 5);
  assert.equal(s.counts.approved, 1);
  assert.equal(s.counts['in-batch'], 1);
  assert.deepEqual(s.open.map((o) => o.id), ['b2']);
  assert.deepEqual(s.next, [{ module: 'c/sub_3', rank: 3 }]);
});

test('pure functions do not mutate their input', () => {
  const L = applyInit(null, INV, T0).ledger;
  const before = JSON.stringify(L);
  applyOpenBatch(L, { id: 'b1', modules: ['a/sub_1'] }, T1);
  applyMark(L, { module: 'c/sub_3', status: 'skipped' }, T1);
  assert.equal(JSON.stringify(L), before);
});

test('atomic write, schema guard and the CLI runner end to end', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-cov-'));
  try {
    const file = path.join(dir, 'nested', 'coverage.json');
    const inv = path.join(dir, 'inv.json');
    fs.writeFileSync(inv, JSON.stringify(INV));
    const quiet = () => {};
    run(['init', '--ledger', file, '--inventory', inv], T0, quiet);
    run(['init', '--ledger', file, '--inventory', inv], T0, quiet);
    run(['open-batch', '--ledger', file, '--id', 'b1', '--modules', 'a/sub_1,c/sub_3'], T1, quiet);
    run(['close-batch', '--ledger', file, '--id', 'b1', '--verdict', 'approved', '--text', 'ship it'], T1, quiet);
    const L = readLedger(file);
    assert.equal(L.modules['c/sub_3'].status, 'approved');
    assert.equal(L.batches[0].verdict_text, 'ship it');
    assert.deepEqual(fs.readdirSync(path.dirname(file)), ['coverage.json'], 'no temp file left behind');
    // A refused command leaves the file byte-identical.
    const bytes = fs.readFileSync(file, 'utf8');
    assert.throws(() => run(['mark', '--ledger', file, '--module', 'a/sub_1', '--status', 'pending'], T1, quiet), LedgerError);
    assert.throws(() => run(['mark', '--ledger', file, '--module', 'ghost', '--status', 'pending'], T1, quiet), /unknown module/);
    assert.equal(fs.readFileSync(file, 'utf8'), bytes);
    // Status prints without writing.
    const out = [];
    run(['status', '--ledger', file, '--next', '1'], T1, (s) => out.push(s));
    assert.match(out[0], /^4 modules {2}pending=1 .*approved=2 .*dead=1/);
    assert.equal(fs.readFileSync(file, 'utf8'), bytes);
    // Foreign schema is refused, missing ledger is explained.
    writeAtomic(file, { ...L, schema: 2 });
    assert.throws(() => readLedger(file), /schema 2/);
    assert.throws(() => run(['status', '--ledger', path.join(dir, 'none.json')], T1, quiet), /run init first/);
    assert.throws(() => run(['frobnicate', '--ledger', file], T1, quiet), /schema 2|unknown command/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('kit parts: proposed without a batch, then built by a batch; summary lists open proposals', async () => {
  const { applyInit, applyOpenBatch, applyAddKitPart, summarize } = await import('../scripts/coverage.mjs');
  const now = '2026-09-25T00:00:00.000Z';
  let L = applyInit(null, { modules: [{ module: 'a/sub_x', rank: 1 }] }, now).ledger;
  L = applyAddKitPart(L, { name: 'Crumbs', api: '<Crumbs items label>', by: 'teams/sub_factory', why: 'drill trail' }, now);
  let s = summarize(L);
  assert.equal(s.proposedKitParts.length, 1);
  assert.equal(L.kitParts[0].status, 'proposed');
  assert.throws(() => applyAddKitPart(L, { name: 'Crumbs', api: 'x' }, now), /already recorded/);
  assert.throws(() => applyOpenBatch(L, { id: 'grow-0', modules: [] }, now), /--kind kit/);
  L = applyOpenBatch(L, { id: 'grow-1', modules: [], kind: 'kit' }, now);
  L = applyAddKitPart(L, { name: 'Crumbs', api: '<Crumbs items label>', batch: 'grow-1' }, now);
  assert.equal(L.kitParts[0].status, 'built');
  assert.equal(L.kitParts[0].added_in, 'grow-1');
  s = summarize(L);
  assert.equal(s.proposedKitParts.length, 0);
});
