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
  applyAddKitParts, applyAdopt, applySummaryGate, awaitingSummary, partition, parseDecisions,
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

test('declined kit part: stops being a gap, refuses a silent re-proposal or build, re-run safe', () => {
  let L = applyInit(null, INV, T0).ledger;
  L = applyAddKitPart(L, { name: 'RowsCapFill', api: '<Rows capFill />', by: 'home/sub_cockpit', why: 'fill the short list' }, T0);
  assert.equal(summarize(L).proposedKitParts.length, 1);
  assert.throws(() => applyAddKitPart(L, { name: 'RowsCapFill', declined: true }, T1), /--why/);
  assert.throws(() => applyAddKitPart(L, { name: 'RowsCapFill', declined: true, why: 'x', batch: 'b1' }, T1), /exclude each other/);
  L = applyAddKitPart(L, { name: 'RowsCapFill', declined: true, why: 'keep as proposed without resolving any concern' }, T1);
  const k = L.kitParts[0];
  assert.deepEqual([k.status, k.api, k.by, k.declined, k.declined_why], ['declined', '<Rows capFill />', 'home/sub_cockpit', T1, 'keep as proposed without resolving any concern']);
  const s = summarize(L);
  assert.equal(s.proposedKitParts.length, 0, 'a declined part is not a KIT-GAP');
  assert.deepEqual(s.declinedKitParts, [{ name: 'RowsCapFill', why: 'keep as proposed without resolving any concern' }]);
  assert.equal(s.kitParts, 0, 'declined parts do not count as kit parts');
  assert.deepEqual(applyAddKitPart(L, { name: 'RowsCapFill', declined: true, why: 'again' }, T1), L, 're-declining is a no-op');
  assert.throws(() => applyAddKitPart(L, { name: 'RowsCapFill', api: 'y', by: 'x' }, T1), /declined .*--replace/);
  L = applyOpenBatch(L, { id: 'grow-1', modules: [], kind: 'kit' }, T1);
  assert.throws(() => applyAddKitPart(L, { name: 'RowsCapFill', api: 'y', batch: 'grow-1' }, T1), /declined/);
  const built = applyAddKitPart(L, { name: 'RowsCapFill', api: 'y', batch: 'grow-1', replace: true }, T1).kitParts[0];
  assert.deepEqual([built.status, built.added_in, built.declined], ['built', 'grow-1', undefined], 'new owner words revive it');
  // A pre-emptive decline (never proposed) and a refused decline of a built part.
  L = applyAddKitPart(L, { name: 'Carousel', declined: true, why: 'owner: no carousels' }, T1);
  assert.equal(L.kitParts.find((p) => p.name === 'Carousel').status, 'declined');
  L = applyAddKitPart(L, { name: 'Grid', api: '<Grid />', batch: 'grow-1' }, T1);
  assert.throws(() => applyAddKitPart(L, { name: 'Grid', declined: true, why: 'x' }, T1), /is built/);
});

test('adopt: an existing kit becomes a closed adopt batch and its parts register in bulk', () => {
  let L = applyInit(null, INV, T0).ledger;
  assert.throws(() => applyAdopt(L, { id: 'adopt-0', text: ' ' }, T0), /--text/);
  L = applyAdopt(L, { id: 'adopt-0', text: 'kit built outside the skill, adopted' }, T0);
  const b = L.batches[0];
  assert.deepEqual([b.kind, b.closed, b.verdict, b.modules], ['adopt', T0, 'registered', []]);
  assert.throws(() => applyAdopt(L, { id: 'adopt-0', text: 'x' }, T0), /already exists/);
  assert.throws(() => applyOpenBatch(L, { id: 'a1', modules: [], kind: 'adopt' }, T0), /adopt command/);
  const parts = [{ name: 'Panel', api: '<Panel title>{children}</Panel>', why: 'section surface' }, { name: 'Kpi', api: '<Kpi label value delta? />' }];
  assert.throws(() => applyAddKitParts(L, { parts, batch: null }, T0), /--batch/);
  assert.throws(() => applyAddKitParts(L, { parts: [parts[0], parts[0]], batch: 'adopt-0' }, T0), /twice: Panel/);
  // All or nothing: one bad row leaves the input untouched and names the row index and the JSON key.
  assert.throws(() => applyAddKitParts(L, { parts: [...parts, { name: 'Bad' }], batch: 'adopt-0' }, T0), /--parts row 2 \("Bad"\): missing JSON key "api"/);
  assert.throws(() => applyAddKitParts(L, { parts: [{ api: 'x' }], batch: 'adopt-0' }, T0), /--parts row 0: missing JSON key "name"/);
  assert.throws(() => applyAddKitParts(L, { parts: ['Panel'], batch: 'adopt-0' }, T0), /--parts row 0: not an object/);
  assert.equal(L.kitParts.length, 0);
  L = applyAddKitParts(L, { parts, batch: 'adopt-0' }, T0);
  assert.deepEqual(L.kitParts.map((x) => [x.name, x.status, x.added_in]), [['Panel', 'built', 'adopt-0'], ['Kpi', 'built', 'adopt-0']]);
  assert.equal(L.kitParts[0].why, 'section surface');
  assert.throws(() => applyAddKitParts(L, { parts, batch: 'adopt-0' }, T0), /--parts row 0 \("Panel"\): kit part "Panel" already recorded/);
  assert.equal(summarize(L).kitParts, 2);
  // A first feature batch can follow in the same session.
  L = applyOpenBatch(L, { id: 'feature-1', modules: ['a/sub_1'] }, T1);
  assert.equal(L.modules['a/sub_1'].status, 'in-batch');
});

test('key-decisions: director-approved close, mixed split, summary gate over N batches', () => {
  assert.equal(checkTransition('in-batch', 'director-approved').ok, true);
  assert.equal(checkTransition('gated', 'director-approved').ok, true);
  assert.equal(checkTransition('pending', 'director-approved').ok, false, 'no approval without a batch');
  assert.equal(checkTransition('director-approved', 'in-batch').ok, true, 'the Director may reopen his own call');
  assert.equal(checkTransition('director-approved', 'approved').ok, true);
  assert.equal(checkTransition('director-approved', 'pending').ok, false);
  let L = applyInit(null, INV, T0).ledger;
  L = applyOpenBatch(L, { id: 'f1', modules: ['a/sub_1', 'b/sub_2'] }, T0);
  assert.throws(() => applyCloseBatch(L, { id: 'f1', verdict: 'director-approved', text: '' }, T0), /decision record/);
  assert.throws(() => applyCloseBatch(L, { id: 'f1', verdict: 'director-approved', text: 'D: ok' }, T0), /needs --decisions/);
  L = applyCloseBatch(L, { id: 'f1', verdict: 'director-approved', text: 'D: both compose from Panel; no key decision', decisions: '1. Panel for both headers\n2. Kept the tint\n', commits: ['abc1234'] }, T0);
  assert.deepEqual(L.batches[0].decisions, [{ n: 1, text: 'Panel for both headers' }, { n: 2, text: 'Kept the tint' }]);
  assert.deepEqual(L.batches[0].commits, ['abc1234']);
  assert.deepEqual([L.batches[0].decided_by, L.batches[0].summary], ['director', null]);
  assert.equal(L.modules['a/sub_1'].status, 'director-approved');
  L = applyOpenBatch(L, { id: 'f2', modules: ['c/sub_3'] }, T0);
  assert.throws(() => applyCloseBatch(L, { id: 'f2', verdict: 'mixed', text: 'D: c ok', directorApproved: ['c/sub_3'] }, T0), /needs --decisions/);
  L = applyCloseBatch(L, { id: 'f2', verdict: 'mixed', text: 'D: c ok', directorApproved: ['c/sub_3'], decisions: '1. Rows over cards (key (d), owner chose rows)' }, T0);
  assert.equal(L.batches[1].decisions[0].key, 'd');
  assert.deepEqual(L.batches[1].split, { approved: [], 'sent-back': [], 'director-approved': ['c/sub_3'] });
  // An owner-decided batch never awaits a summary.
  L = applyInit(L, { modules: [...INV.modules, { module: 'e/sub_5' }] }, T0).ledger;
  L = applyOpenBatch(L, { id: 'f3', modules: ['e/sub_5'] }, T0);
  L = applyCloseBatch(L, { id: 'f3', verdict: 'approved', text: 'owner: fine' }, T0);
  assert.equal(L.batches[2].decided_by, 'owner');
  assert.deepEqual(awaitingSummary(L).map((b) => b.id), ['f1', 'f2']);
  const s = summarize(L, 10, { summaryEvery: 3 });
  assert.equal(s.counts['director-approved'], 3);
  assert.equal(s.summaryDue, false);
  assert.equal(summarize(L, 10, { summaryEvery: 2 }).summaryDue, true);
  assert.deepEqual(s.awaitingSummary.map((b) => [b.id, b.modules.length]), [['f1', 2], ['f2', 1]]);
  // Summary gate: refusals, a subset, then a mixed verdict over the rest.
  assert.throws(() => applySummaryGate(L, { id: 's1', verdict: 'director-approved', text: 'x' }, T1), /verdict must be/);
  assert.throws(() => applySummaryGate(L, { id: 's1', verdict: 'approved', text: '' }, T1), /verbatim/);
  assert.throws(() => applySummaryGate(L, { id: 's1', batches: ['f3'], verdict: 'approved', text: 'x' }, T1), /not awaiting.*owner/);
  assert.throws(() => applySummaryGate(L, { id: 's1', verdict: 'mixed', text: 'x', approved: ['a/sub_1'] }, T1), /unassigned b\/sub_2,c\/sub_3/);
  const one = applySummaryGate(L, { id: 's0', batches: ['f2'], verdict: 'approved', text: 'ok' }, T1);
  assert.deepEqual(awaitingSummary(one).map((b) => b.id), ['f1'], 'a summary may cover a subset');
  const words = 'Reads as one app. b still shouts: redo its header.';
  L = applySummaryGate(L, { id: 's1', verdict: 'mixed', text: words, approved: ['a/sub_1', 'c/sub_3'], sentBack: ['b/sub_2'] }, T1);
  assert.deepEqual(['a/sub_1', 'b/sub_2', 'c/sub_3'].map((m) => L.modules[m].status), ['approved', 'sent-back', 'approved']);
  assert.deepEqual(L.modules['b/sub_2'].history.at(-1), { from: 'director-approved', to: 'sent-back', at: T1, batch: 'f1', note: 'summary s1' });
  assert.deepEqual(L.summaries[0], { id: 's1', at: T1, batches: ['f1', 'f2'], modules: ['a/sub_1', 'b/sub_2', 'c/sub_3'], verdict: 'mixed', verdict_text: words, split: { approved: ['a/sub_1', 'c/sub_3'], 'sent-back': ['b/sub_2'] } });
  assert.deepEqual(L.batches.map((b) => b.summary), ['s1', 's1', undefined]);
  assert.equal(awaitingSummary(L).length, 0);
  assert.throws(() => applySummaryGate(L, { id: 's2', verdict: 'approved', text: 'x' }, T1), /no Director-approved batch/);
  assert.throws(() => applySummaryGate(L, { id: 's1', verdict: 'approved', text: 'x' }, T1), /already exists/);
});

test('partition names every fault', () => {
  assert.deepEqual(partition(['a', 'b'], { x: ['a'], y: ['b'] }), [['a', 'x'], ['b', 'y']]);
  assert.throws(() => partition(['a', 'b'], { x: ['a', 'z'], y: ['a'] }), /unassigned b; not in batch z; in more than one group a/);
});

test('CLI: adopt, bulk parts from a file, declined, director close and summary gate end to end', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-cov2-'));
  try {
    const file = path.join(dir, 'coverage.json');
    const inv = path.join(dir, 'inv.json');
    const parts = path.join(dir, 'parts.json');
    fs.writeFileSync(inv, JSON.stringify(INV));
    fs.writeFileSync(parts, JSON.stringify([{ name: 'Panel', api: '<Panel />' }, { name: 'Kpi', api: '<Kpi />' }]));
    const quiet = () => {};
    run(['init', '--ledger', file, '--inventory', inv], T0, quiet);
    run(['adopt', '--ledger', file, '--id', 'adopt-0', '--text', 'existing kit'], T0, quiet);
    run(['add-kit-part', '--ledger', file, '--batch', 'adopt-0', '--parts', parts], T0, quiet);
    run(['add-kit-part', '--ledger', file, '--name', 'Carousel', '--declined', '--why', 'owner: no'], T0, quiet);
    run(['open-batch', '--ledger', file, '--id', 'f1', '--modules', 'a/sub_1'], T0, quiet);
    const dec = path.join(dir, 'decisions.md');
    fs.writeFileSync(dec, '1. Panel header\n2. key (b): removed the old filter bar\n   (owner: "yes")\n');
    assert.throws(() => run(['close-batch', '--ledger', file, '--id', 'f1', '--verdict', 'director-approved', '--text', 'D: ok'], T0, quiet), /--decisions/);
    assert.throws(() => run(['close-batch', '--ledger', file, '--id', 'f1', '--verdict', 'director-approved', '--text', 'D: ok', '--decisions', path.join(dir, 'nope.md')], T0, quiet), /--decisions .*nope/);
    run(['close-batch', '--ledger', file, '--id', 'f1', '--verdict', 'director-approved', '--text', 'D: ok', '--decisions', dec, '--commits', 'abc,def'], T0, quiet);
    const closed = readLedger(file).batches.find((b) => b.id === 'f1');
    assert.deepEqual(closed.commits, ['abc', 'def']);
    assert.deepEqual(closed.decisions[1], { n: 2, text: 'key (b): removed the old filter bar (owner: "yes")', key: 'b' });
    const out = [];
    run(['status', '--ledger', file, '--summary-every', '1'], T1, (x) => out.push(x));
    assert.match(out[0], /director-approved=1 .*kitParts=2 declined=1/);
    assert.ok(out.some((l) => /^SUMMARY-DUE 1 Director-approved batch\(es\) await the owner: f1\(1\)/.test(l)), out.join('\n'));
    assert.ok(!out.some((l) => l.startsWith('KIT-GAP')));
    run(['summary-gate', '--ledger', file, '--id', 's1', '--verdict', 'approved', '--text', 'yes'], T1, quiet);
    const L = readLedger(file);
    assert.equal(L.modules['a/sub_1'].status, 'approved');
    assert.equal(L.summaries[0].verdict_text, 'yes');
    const bytes = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(parts, '{not json');
    assert.throws(() => run(['add-kit-part', '--ledger', file, '--batch', 'adopt-0', '--parts', parts], T1, quiet), /--parts/);
    assert.equal(fs.readFileSync(file, 'utf8'), bytes);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('parseDecisions: numbered items, continuation lines, key letters, refusals', () => {
  assert.deepEqual(parseDecisions('intro line\n1. A\n   more of A\n2) key (C): B'), [{ n: 1, text: 'A more of A' }, { n: 2, text: 'key (C): B', key: 'c' }]);
  assert.throws(() => parseDecisions(''), /no numbered decision/);
  assert.throws(() => parseDecisions('- a bullet\n- another'), /no numbered decision/);
  assert.throws(() => parseDecisions('1. a\n3. c'), /item 2 is numbered 3/);
});

test('system modules: flagged by init, never NEXT unless all; done-outside needs evidence', () => {
  const inv = { modules: [{ module: '_components/kit/(root)', system: true }, { module: 'a/sub_1' }, { module: 'b/sub_2' }] };
  let L = applyInit(null, inv, T0).ledger;
  assert.equal(L.modules['_components/kit/(root)'].system, true);
  assert.equal('system' in L.modules['a/sub_1'], false);
  assert.deepEqual(summarize(L).next.map((n) => n.module), ['a/sub_1', 'b/sub_2'], 'the kit is never offered as NEXT');
  assert.deepEqual(summarize(L, 10, { all: true }).next.map((n) => n.module), ['_components/kit/(root)', 'a/sub_1', 'b/sub_2']);
  // Re-init refreshes the flag both ways and stays idempotent.
  const inv2 = { modules: [{ module: '_components/kit/(root)' }, { module: 'a/sub_1', system: true }, { module: 'b/sub_2' }] };
  const L2 = applyInit(L, inv2, T1).ledger;
  assert.equal('system' in L2.modules['_components/kit/(root)'], false);
  assert.equal(L2.modules['a/sub_1'].system, true);
  assert.deepEqual(applyInit(L2, inv2, T1).ledger, L2);
  // done-outside: approved before the ledger existed, with the evidence in the note.
  assert.throws(() => applyMark(L, { module: 'a/sub_1', status: 'done-outside' }, T1), /--note/);
  L = applyMark(L, { module: 'a/sub_1', status: 'done-outside', note: 'done-outside: gate 3, 1a2b3c4' }, T1);
  assert.equal(L.modules['a/sub_1'].status, 'done-outside');
  assert.equal(L.modules['a/sub_1'].history[0].note, 'done-outside: gate 3, 1a2b3c4');
  assert.deepEqual(summarize(L).next.map((n) => n.module), ['b/sub_2']);
  assert.equal(summarize(L).counts['done-outside'], 1);
  assert.equal(checkTransition('done-outside', 'in-batch').ok, true);
  assert.equal(checkTransition('done-outside', 'approved').ok, false);
  assert.equal(checkTransition('skipped', 'done-outside').ok, true);
  assert.equal(checkTransition('in-batch', 'done-outside').ok, false, 'a module built in a batch closes by verdict, not by mark');
});
