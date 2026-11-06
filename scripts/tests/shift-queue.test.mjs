import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { EXIT } from '../lib/exit-codes.mjs';
import { atomicWrite, evaluationDebt, main, nextAction, parseQueue, queuePath, readQueue, resolveTargets, senseProblems, STATUSES, withQueue } from '../shift-queue.mjs';

const NOW = Date.parse('2026-11-06T12:00:00Z');
const FRESH = '2026-11-06T11:00:00Z';
const STALE = '2026-11-05T10:00:00Z';

const sense = (width = {}, state = 'busy') => ({
  width: { research: 3, build: 0, gpuProof: 0, ...width }, gpu: { state }, pressure: [],
});
const row = (id, status, extra = {}) => ({ id, status, addedAt: FRESH, ...extra });
const heldRow = (extra = {}) => ({ id: 'h1', status: 'held', queue: 'media', render: { kind: 'proof', machine: 'Lynx', estGpuMin: 12 }, ...extra });
const base = (over = {}) => ({ sense: sense(), rows: [], plans: [], backlog: [], evalDebt: 0, machine: 'Lynx', now: NOW, ...over });
const unplannedSix = Array.from({ length: 6 }, (_, i) => row(`v${i}`, 'new'));
const approved = [row('a1', 'approved', { planId: 'p1', cluster: 'c1' }), row('a2', 'approved', { planId: 'p1', cluster: 'c1' })];
const mining = [row('m1', 'mining', { planId: 'p0', cluster: 'c9' })];

function tmpRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'shift-queue-'));
  fs.mkdirSync(path.join(root, 'librarian', 'harvest'), { recursive: true });
  fs.writeFileSync(path.join(root, 'librarian', 'harvest', 'backlog.jsonl'), '');
  fs.writeFileSync(path.join(root, 'librarian', 'harvest', 'evaluations.md'), '| date | verdict | note |\n| --- | --- | --- |\n');
  return root;
}
const capture = (root, over = {}) => {
  const out = [];
  const err = [];
  return { out, err, ctx: { root, now: () => NOW, machine: 'Lynx', log: (s) => out.push(s), err: (s) => err.push(s), ...over } };
};
const seed = (root, rows) => {
  fs.mkdirSync(path.dirname(queuePath(root)), { recursive: true });
  fs.writeFileSync(queuePath(root), rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
};

/* ------------------------------------------------------------- the ladder, rung by rung */

test('rung 1: all width zero waits, whatever else is queued', () => {
  const a = nextAction(base({ sense: { ...sense({ research: 0 }, 'idle'), pressure: ['canary'] }, rows: approved, backlog: [heldRow()], evalDebt: 9 }));
  assert.equal(a.action, 'wait');
  assert.match(a.reason, /canary/);
  assert.deepEqual(a.width, { research: 0, build: 0, gpuProof: 0 });
});

test('rung 2: an idle GPU with proof width takes the held row, ahead of everything below', () => {
  const a = nextAction(base({ sense: sense({ gpuProof: 1 }, 'idle'), rows: [...unplannedSix, ...approved], backlog: [heldRow()], evalDebt: 9 }));
  assert.equal(a.action, 'gpu-proof');
  assert.equal(a.row.id, 'h1');
});

test('proofs stay blocked on every GPU state but idle, and without proof width', () => {
  for (const state of ['busy', 'settling', 'absent', 'unknown']) {
    const a = nextAction(base({ sense: sense({ gpuProof: 1 }, state), backlog: [heldRow()] }));
    assert.notEqual(a.action, 'gpu-proof', state);
  }
  assert.notEqual(nextAction(base({ sense: sense({ gpuProof: 0 }, 'idle'), backlog: [heldRow()] })).action, 'gpu-proof');
});

test('a proof needs a held media row for this machine carrying estGpuMin', () => {
  const idle = sense({ gpuProof: 1 }, 'idle');
  const notThis = heldRow({ render: { machine: 'Fox', estGpuMin: 5 } });
  const noEstimate = heldRow({ render: { machine: 'Lynx' } });
  const notMedia = heldRow({ queue: 'code' });
  const notHeld = heldRow({ status: 'queued' });
  for (const r of [notThis, noEstimate, notMedia, notHeld]) {
    assert.notEqual(nextAction(base({ sense: idle, backlog: [r] })).action, 'gpu-proof', JSON.stringify(r));
  }
  assert.notEqual(nextAction(base({ sense: idle, backlog: [heldRow()], machine: null })).action, 'gpu-proof', 'no machine identity, no proof');
  assert.equal(nextAction(base({ sense: idle, backlog: [heldRow({ render: { machine: 'lynx', estGpuMin: 5 } })] })).action, 'gpu-proof', 'case of the machine name folds');
});

test('over the review cap the proof rung falls through to research and says why', () => {
  const idle = sense({ gpuProof: 1 }, 'idle');
  const over = (extra) => nextAction(base({ sense: idle, backlog: [heldRow()], reviewOverCap: true, ...extra }));
  assert.deepEqual([over({ rows: unplannedSix }).action, over({ rows: unplannedSix }).proofsPaused], ['pre-research', 'review-over-cap']);
  assert.deepEqual([over({ rows: approved }).action, over({ rows: approved }).proofsPaused], ['mine', 'review-over-cap']);
  assert.deepEqual([over({ evalDebt: 3 }).skill, over({ evalDebt: 3 }).proofsPaused], ['harvest evaluate', 'review-over-cap']);
  assert.deepEqual([over({}).skill, over({}).proofsPaused], ['deepen --loop', 'review-over-cap']);
  const noSeat = over({ sense: sense({ research: 0, gpuProof: 1 }, 'idle') });
  assert.deepEqual([noSeat.action, noSeat.proofsPaused], ['wait', 'review-over-cap']);
});

test('the pause flag means the cap stopped a proof, not merely that the folder is over', () => {
  for (const extra of [{ sense: sense({ gpuProof: 1 }, 'busy'), backlog: [heldRow()] }, { sense: sense({ gpuProof: 1 }, 'idle'), backlog: [] }, { sense: sense({ gpuProof: 0 }, 'idle'), backlog: [heldRow()] }]) {
    assert.equal(nextAction(base({ ...extra, reviewOverCap: true })).proofsPaused, undefined);
  }
  assert.equal(nextAction(base({ sense: sense({ gpuProof: 1 }, 'idle'), backlog: [heldRow()], reviewOverCap: false })).action, 'gpu-proof');
  assert.equal(nextAction(base({ rows: mining, sense: sense({ gpuProof: 1 }, 'idle'), backlog: [heldRow()], reviewOverCap: true })).action, 'resume', 'resume still comes first');
});

test('next measures the real review folder against the configured cap', () => {
  const root = tmpRoot();
  fs.writeFileSync(path.join(root, 'librarian', 'harvest', 'backlog.jsonl'), `${JSON.stringify(heldRow())}\n`);
  const review = path.join(root, '.ai', 'shift', 'review');
  fs.mkdirSync(review, { recursive: true });
  fs.writeFileSync(path.join(review, 'big.bin'), Buffer.alloc(4096));
  const run = () => {
    const c = capture(root, { stdin: () => JSON.stringify(sense({ gpuProof: 1 }, 'idle')) });
    assert.equal(main(['next', '--sense', '-'], c.ctx), EXIT.OK, c.err.join(''));
    return JSON.parse(c.out[0]);
  };
  assert.equal(run().action, 'gpu-proof', 'default cap is 5 GB');
  fs.writeFileSync(path.join(root, '.ai', 'shift', 'config.json'), JSON.stringify({ reviewCapGb: 0.000001 }));
  const a = run();
  assert.deepEqual([a.action, a.proofsPaused], ['filler', 'review-over-cap']);
  fs.writeFileSync(path.join(root, '.ai', 'shift', 'config.json'), JSON.stringify({ reviewCapGB: 1 }));
  const bad = capture(root, { stdin: () => JSON.stringify(sense()) });
  assert.equal(main(['next', '--sense', '-'], bad.ctx), EXIT.FATAL, 'a typo in the cap is could-not-run, never a default');
});

test('held rows are read by their documented keys: the legacy shape is not eligible', () => {
  const idle = sense({ gpuProof: 1 }, 'idle');
  const legacy = { id: 'x', status: 'held', queue: 'media', render: { run_id: 'r', arm_a: 'a', arm_b: 'b', instrument: 'i' } };
  const migrated = { id: 'x', status: 'held', queue: 'media', render: { kind: 'proof', runId: 'r', brief: 'b', arms: { a: 'a', b: 'b' }, instrument: 'i', estGpuMin: 30, machine: 'Lynx', display: null } };
  assert.notEqual(nextAction(base({ sense: idle, backlog: [legacy] })).action, 'gpu-proof');
  const a = nextAction(base({ sense: idle, backlog: [migrated] }));
  assert.equal(a.action, 'gpu-proof');
  assert.equal(a.row.render.runId, 'r');
});

test('rung 3: pre-research when unplanned passes 5, or one is older than 24 h', () => {
  assert.equal(nextAction(base({ rows: [...unplannedSix, ...approved] })).action, 'pre-research');
  assert.notEqual(nextAction(base({ rows: unplannedSix.slice(0, 5) })).action, 'pre-research', 'five is not beyond five');
  assert.equal(nextAction(base({ rows: [row('old', 'meta', { addedAt: STALE })] })).action, 'pre-research');
});

test('a draft plan waiting holds pre-research back; the ladder keeps working below it', () => {
  const plans = [{ planId: 'p9', plan: null, approved: false }];
  assert.equal(nextAction(base({ rows: unplannedSix, plans })).action, 'filler');
  assert.equal(nextAction(base({ rows: [...unplannedSix, ...approved], plans })).action, 'mine');
  assert.equal(nextAction(base({ rows: unplannedSix, plans: [{ planId: 'p9', plan: null, approved: true }] })).action, 'pre-research', 'an approved plan is not a draft');
});

test('rung 4: an approved cluster is mined, as one cluster with its plan\'s facts', () => {
  const plans = [{ planId: 'p1', approved: true, plan: { clusters: [{ id: 'c1', theme: 'T', homes: ['h'], yield: 'y', gpuProofs: [], estSeats: 2 }] } }];
  const a = nextAction(base({ rows: [...approved, row('s1', 'parked', { planId: 'p1', cluster: 'c1', reason: 'superseded by a1: x' })], plans, evalDebt: 9 }));
  assert.equal(a.action, 'mine');
  assert.deepEqual(a.cluster.videos, ['a1', 'a2'], 'a superseded sibling is not to be mined');
  assert.equal(a.cluster.theme, 'T');
});

test('rung 5: the filler ladder takes the first with work', () => {
  const queued = { id: 'q', status: 'queued' };
  assert.equal(nextAction(base({ evalDebt: 3, backlog: [queued] })).skill, 'harvest evaluate');
  assert.equal(nextAction(base({ evalDebt: 2, backlog: [queued] })).skill, 'harvest backlog');
  assert.equal(nextAction(base({ evalDebt: 2, backlog: [heldRow()] })).skill, 'deepen --loop', 'a held row is not backlog work');
});

test('a width with no research seat cannot be spent on research', () => {
  const a = nextAction(base({ sense: sense({ research: 0, build: 1 }), rows: approved }));
  assert.equal(a.action, 'wait');
  assert.match(a.reason, /research seat/);
});

test('resume outranks every working rung', () => {
  const a = nextAction(base({ sense: sense({ gpuProof: 1 }, 'idle'), rows: [...unplannedSix, ...approved, ...mining], backlog: [heldRow()], evalDebt: 9 }));
  assert.equal(a.action, 'resume');
  assert.equal(a.cluster.id, 'c9');
  assert.deepEqual(a.cluster.videos, ['m1']);
});

test('at zero width a mining cluster is named, not dispatched', () => {
  const a = nextAction(base({ sense: sense({ research: 0 }), rows: mining }));
  assert.equal(a.action, 'wait');
  assert.equal(a.resumePending[0].id, 'c9');
});

test('a mining row with no cluster still resumes', () => {
  const a = nextAction(base({ rows: [row('solo', 'mining')] }));
  assert.equal(a.action, 'resume');
  assert.deepEqual(a.cluster, { id: null, planId: null, videos: ['solo'] });
});

test('a sense without width numbers is refused: absent is never zero', () => {
  assert.ok(senseProblems({ width: { research: null, build: 0, gpuProof: 0 }, gpu: { state: 'busy' } }).length);
  assert.ok(senseProblems({ width: { research: 1, build: 0, gpuProof: 0 }, gpu: { state: 'asleep' } }).length);
  assert.ok(senseProblems(null).length);
  assert.deepEqual(senseProblems(sense()), []);
});

test('evaluation debt counts the pending verdict column, not the word anywhere', () => {
  const md = 'prose: pending\n\n| date | landing | verdict | note |\n| --- | --- | --- | --- |\n'
    + '| d | a | pending | |\n| d | b | impact-null | still pending review |\n| d | c | pending | x |\n';
  assert.equal(evaluationDebt(md), 2);
});

/* ------------------------------------------------------------- the writer */

test('a crash between temp and rename leaves the temp behind and the original intact', () => {
  const root = tmpRoot();
  const rows = [row('keep', 'new')];
  seed(root, rows);
  const crashing = { ...fs, renameSync: () => { throw new Error('power cut'); } };
  assert.throws(() => withQueue(root, (r) => { r[0].status = 'meta'; }, { fsImpl: crashing }), /power cut/);
  assert.deepEqual(readQueue(root), rows, 'the original still reads as it was');
  const left = fs.readdirSync(path.dirname(queuePath(root)));
  assert.equal(left.filter((f) => f.endsWith('.tmp')).length, 1, `temp is left behind: ${left}`);
  assert.ok(!left.some((f) => f.endsWith('.lock')), 'the lock does not outlive the crash');
  withQueue(root, (r) => { r[0].status = 'meta'; });
  assert.equal(readQueue(root)[0].status, 'meta', 'the next writer is not hurt by the debris');
});

test('an old temp is swept by the next write; a young one is left for its writer', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shift-atomic-'));
  const file = path.join(dir, 'q.jsonl');
  const old = `${file}.1.1.tmp`;
  const young = `${file}.2.1.tmp`;
  fs.writeFileSync(old, 'x');
  fs.writeFileSync(young, 'y');
  const longAgo = new Date(Date.now() - 3600 * 1000);
  fs.utimesSync(old, longAgo, longAgo);
  atomicWrite(file, 'ok');
  assert.equal(fs.readFileSync(file, 'utf8'), 'ok');
  assert.ok(!fs.existsSync(old));
  assert.ok(fs.existsSync(young));
});

test('a queue with an unknown status or a torn line refuses to load', () => {
  assert.throws(() => parseQueue('{"id":"a","status":"declined"}\n'), /closed set/);
  assert.throws(() => parseQueue('{"id":"a"'), /not JSON/);
  assert.throws(() => parseQueue('{"id":"a","status":"new"}\n{"id":"a","status":"new"}\n'), /duplicate/);
  assert.deepEqual(STATUSES, ['new', 'meta', 'transcript', 'no-transcript', 'planned', 'approved', 'mining', 'landed', 'parked']);
});

/* ------------------------------------------------------------- cli */

test('next reads a sense file, the queue and the ledger, and prints one JSON action', () => {
  const root = tmpRoot();
  seed(root, approved);
  const file = path.join(root, 'sense.json');
  fs.writeFileSync(file, JSON.stringify(sense()));
  const { out, ctx } = capture(root);
  assert.equal(main(['next', '--sense', file], ctx), EXIT.OK);
  assert.equal(out.length, 1);
  assert.equal(JSON.parse(out[0]).action, 'mine');
});

test('next takes the sense from stdin and refuses a bad one as could-not-run', () => {
  const root = tmpRoot();
  const a = capture(root, { stdin: () => JSON.stringify(sense({ research: 0 })) });
  assert.equal(main(['next', '--sense', '-'], a.ctx), EXIT.OK);
  assert.equal(JSON.parse(a.out[0]).action, 'wait');
  const b = capture(root, { stdin: () => 'not json' });
  assert.equal(main(['next', '--sense', '-'], b.ctx), EXIT.FATAL);
  const c = capture(root, { stdin: () => '{"width":{}}' });
  assert.equal(main(['next', '--sense', '-'], c.ctx), EXIT.FATAL);
  assert.equal(main(['next'], capture(root).ctx), EXIT.FATAL);
});

test('next does not read an unreadable ledger as an empty one', () => {
  const root = tmpRoot();
  fs.rmSync(path.join(root, 'librarian', 'harvest', 'evaluations.md'));
  const { ctx } = capture(root, { stdin: () => JSON.stringify(sense()) });
  assert.equal(main(['next', '--sense', '-'], ctx), EXIT.FATAL);
});

test('mark moves one video, or the live members of a cluster', () => {
  const root = tmpRoot();
  seed(root, [...approved, row('s1', 'parked', { planId: 'p1', cluster: 'c1', reason: 'superseded by a1: x' })]);
  assert.equal(main(['mark', 'c1', 'mining'], capture(root).ctx), EXIT.OK);
  assert.deepEqual(readQueue(root).map((r) => r.status), ['mining', 'mining', 'parked']);
  assert.equal(main(['mark', 'a1', 'parked', '--reason', 'operator asked'], capture(root).ctx), EXIT.OK);
  assert.equal(readQueue(root)[0].reason, 'operator asked');
});

test('mark refuses a status outside the set, a reasonless park and an unknown target', () => {
  const root = tmpRoot();
  seed(root, approved);
  for (const args of [['mark', 'a1', 'declined'], ['mark', 'a1', 'parked'], ['mark', 'nope', 'mining'], ['mark'], ['mark', 'a1', 'mining', '--why', 'x']]) {
    assert.equal(main(args, capture(root).ctx), EXIT.FATAL, JSON.stringify(args));
  }
  assert.deepEqual(readQueue(root).map((r) => r.status), ['approved', 'approved']);
});

test('a cluster id reused across plans is refused until the plan is named', () => {
  const rows = [row('a', 'approved', { planId: 'p1', cluster: 'c1' }), row('b', 'approved', { planId: 'p2', cluster: 'c1' })];
  assert.match(resolveTargets(rows, 'c1').error, /several plans/);
  assert.deepEqual(resolveTargets(rows, 'p2/c1').rows.map((r) => r.id), ['b']);
});

test('landed removes that cluster\'s transcripts, and only theirs', () => {
  const root = tmpRoot();
  seed(root, [...approved, row('other', 'transcript')]);
  for (const id of ['a1', 'other']) {
    fs.mkdirSync(path.join(root, '.ai', 'shift', 'transcripts', id), { recursive: true });
    fs.writeFileSync(path.join(root, '.ai', 'shift', 'transcripts', id, `${id}.clean.txt`), 'text');
  }
  assert.equal(main(['mark', 'c1', 'landed'], capture(root).ctx), EXIT.OK);
  assert.ok(!fs.existsSync(path.join(root, '.ai', 'shift', 'transcripts', 'a1')));
  assert.ok(fs.existsSync(path.join(root, '.ai', 'shift', 'transcripts', 'other')));
});

test('mining survives a restart: state is read from disk, and next reports it first', () => {
  const root = tmpRoot();
  seed(root, [...approved, ...mining]);
  const { out, ctx } = capture(root, { stdin: () => JSON.stringify(sense()) });
  assert.equal(main(['next', '--sense', '-'], ctx), EXIT.OK);
  const a = JSON.parse(out[0]);
  assert.equal(a.action, 'resume');
  assert.equal(readQueue(root).find((r) => r.id === 'm1').status, 'mining');
});

test('list filters and seat appends', () => {
  const root = tmpRoot();
  seed(root, [...approved, ...mining]);
  const l = capture(root);
  assert.equal(main(['list', '--status', 'mining', '--json'], l.ctx), EXIT.OK);
  assert.deepEqual(l.out.map((s) => JSON.parse(s).id), ['m1']);
  assert.equal(main(['list', '--status', 'bogus'], capture(root).ctx), EXIT.FATAL);
  assert.equal(main(['seat', 'miner'], capture(root).ctx), EXIT.OK);
  assert.equal(main(['seat', 'planner'], capture(root).ctx), EXIT.OK);
  const seats = fs.readFileSync(path.join(root, '.ai', 'shift', 'seats.jsonl'), 'utf8').trim().split('\n').map((s) => JSON.parse(s));
  assert.deepEqual(seats.map((s) => s.kind), ['miner', 'planner']);
  assert.equal(seats[0].ts, new Date(NOW).toISOString());
  assert.equal(main(['seat'], capture(root).ctx), EXIT.FATAL);
  assert.equal(main([], capture(root).ctx), EXIT.FATAL);
});
