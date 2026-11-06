import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { EXIT } from '../lib/exit-codes.mjs';
import { RUNNING_STALE_MS, atomicWrite, evaluationDebt, freeSlots, main, nextPlan, parseQueue, queuePath, readQueue, readReports, resolveTargets, seatsMb, senseProblems, STATUSES, withQueue, withRunning } from '../shift-queue.mjs';
import { readRunning, splitRunning } from '../lib/shift-running.mjs';

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
const live = (key, kind, startedAt = FRESH) => ({ key, kind, cluster: null, startedAt });
const did = (p, name) => p.actions.filter((a) => a.action === name);

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
const seats = (root) => fs.readFileSync(path.join(root, '.ai', 'shift', 'seats.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));

/* ------------------------------------------------------------- the plan */

test('a verdict pending on an audio run, a held graphical row, an approved cluster and an idle GPU gives gpu-proof AND mine in one plan', () => {
  const audio = heldRow({ id: 'audio', render: { kind: 'proof', runId: 'audio-run', machine: 'Lynx', estGpuMin: 5 } });
  const graphical = heldRow({ id: 'graphical', render: { kind: 'proof', runId: 'gfx-run', machine: 'Lynx', estGpuMin: 12 } });
  const p = nextPlan(base({ sense: sense({ gpuProof: 1 }, 'idle'), rows: approved, backlog: [audio, graphical], pendingVerdicts: ['audio-run'] }));
  assert.deepEqual(p.actions.map((a) => a.action), ['gpu-proof', 'mine', 'mine', 'filler']);
  assert.equal(did(p, 'gpu-proof')[0].row.id, 'graphical', 'the proof awaiting an ear neither re-runs nor holds the next one back');
  assert.deepEqual(did(p, 'mine').map((a) => a.video), ['a1', 'a2']);
  assert.ok(did(p, 'mine').every((a) => a.startCluster === true));
  assert.deepEqual(p.waitingOnOperator, [{ kind: 'verdict', id: 'audio-run', reason: 'sealed, awaiting the blind pick' }]);
  assert.equal(p.reason, undefined);
});

test('the plan has the wire shape, and free is width minus live seats per lane', () => {
  const running = [live('v9', 'miner'), live('b', 'builder'), live('proof:r', 'proof')];
  const w = { research: 3, build: 1, gpuProof: 1 };
  const p = nextPlan(base({ sense: { width: w, gpu: { state: 'idle' }, pressure: [] }, running }));
  assert.deepEqual(Object.keys(p), ['width', 'free', 'running', 'actions', 'waitingOnOperator']);
  assert.deepEqual(p.free, { research: 2, build: 0, gpuProof: 0 });
  assert.deepEqual(p.running, running);
  assert.deepEqual(freeSlots({ research: 1, build: 0, gpuProof: 0 }, [live('a', 'miner'), live('b', 'miner')]).research, 0, 'never below zero');
});

test('every action names the seat to record', () => {
  const p = nextPlan(base({ sense: sense({ gpuProof: 1, build: 1 }, 'idle'), rows: [...unplannedSix, ...approved], backlog: [heldRow({ render: { kind: 'proof', runId: 'r', machine: 'Lynx', estGpuMin: 1 } }), heldRow({ id: 'c', render: { machine: 'Lynx', device: 'cpu' } })] }));
  assert.deepEqual(p.actions.map((a) => [a.action, a.kind, a.key]), [
    ['gpu-proof', 'proof', 'proof:r'], ['cpu-proof', 'cpu-proof', 'proof:c'], ['pre-research', 'planner', 'plan:new'], ['mine', 'miner', 'a1'], ['mine', 'miner', 'a2'],
  ]);
});

test('every width zero: no actions, a reason naming the mining clusters, and a running seat stays', () => {
  const running = [live('m1', 'miner')];
  const p = nextPlan(base({ sense: { ...sense({ research: 0 }, 'idle'), pressure: ['canary'] }, rows: [...approved, ...mining], backlog: [heldRow()], evalDebt: 9, running }));
  assert.deepEqual(p.actions, []);
  assert.match(p.reason, /canary/);
  assert.match(p.reason, /p0\/c9/);
  assert.deepEqual(p.running, running);
  assert.deepEqual(p.width, { research: 0, build: 0, gpuProof: 0 });
});

test('proofs stay blocked on every GPU state but idle, and without proof width', () => {
  for (const state of ['busy', 'settling', 'absent', 'unknown']) {
    assert.deepEqual(did(nextPlan(base({ sense: sense({ gpuProof: 1 }, state), backlog: [heldRow()] })), 'gpu-proof'), [], state);
  }
  assert.deepEqual(did(nextPlan(base({ sense: sense({ gpuProof: 0 }, 'idle'), backlog: [heldRow()] })), 'gpu-proof'), []);
});

test('a live proof holds the GPU lane', () => {
  assert.deepEqual(did(nextPlan(base({ sense: sense({ gpuProof: 1 }, 'idle'), backlog: [heldRow()], running: [live('proof:x', 'proof')] })), 'gpu-proof'), []);
});

test('a proof needs a held media row for this machine carrying estGpuMin', () => {
  const idle = sense({ gpuProof: 1 }, 'idle');
  const notThis = heldRow({ render: { machine: 'Fox', estGpuMin: 5 } });
  const noEstimate = heldRow({ render: { machine: 'Lynx' } });
  const notMedia = heldRow({ queue: 'code' });
  const notHeld = heldRow({ status: 'queued' });
  for (const r of [notThis, noEstimate, notMedia, notHeld]) {
    assert.deepEqual(did(nextPlan(base({ sense: idle, backlog: [r] })), 'gpu-proof'), [], JSON.stringify(r));
  }
  assert.deepEqual(did(nextPlan(base({ sense: idle, backlog: [heldRow()], machine: null })), 'gpu-proof'), [], 'no machine identity, no proof');
  assert.equal(did(nextPlan(base({ sense: idle, backlog: [heldRow({ render: { machine: 'lynx', estGpuMin: 5 } })] })), 'gpu-proof').length, 1, 'case of the machine name folds');
});

test('a sealed or judged run never re-runs; the next eligible row goes instead', () => {
  const idle = sense({ gpuProof: 1 }, 'idle');
  const a = heldRow({ id: 'a', render: { runId: 'run-a', machine: 'Lynx', estGpuMin: 5 } });
  const b = heldRow({ id: 'b', render: { runId: 'run-b', machine: 'Lynx', estGpuMin: 5 } });
  assert.equal(did(nextPlan(base({ sense: idle, backlog: [a, b], verdicts: ['run-a'] })), 'gpu-proof')[0].row.id, 'b');
  assert.deepEqual(did(nextPlan(base({ sense: idle, backlog: [a, b], pendingVerdicts: ['run-a'], verdicts: ['run-b'] })), 'gpu-proof'), []);
});

test('device cpu leaves the GPU lane: a cpu-proof comes from free.build, one at a time, and needs no idle card', () => {
  const cpu = (id, runId) => heldRow({ id, render: { kind: 'proof', runId, machine: 'Lynx', device: 'cpu' } });
  const busy = sense({ build: 1 }, 'busy');
  assert.deepEqual(did(nextPlan(base({ sense: busy, backlog: [cpu('a', 'ra'), cpu('b', 'rb')] })), 'cpu-proof').map((x) => x.row.id), ['a']);
  assert.deepEqual(did(nextPlan(base({ sense: sense({ build: 0 }, 'busy'), backlog: [cpu('a', 'ra')] })), 'cpu-proof'), [], 'no build width');
  assert.deepEqual(did(nextPlan(base({ sense: sense({ build: 4 }, 'busy'), backlog: [cpu('a', 'ra')], running: [live('proof:z', 'cpu-proof')] })), 'cpu-proof'), [], 'one at a time');
  assert.deepEqual(did(nextPlan(base({ sense: busy, backlog: [cpu('a', 'ra'), cpu('b', 'rb')], pendingVerdicts: ['ra'], verdicts: ['rb'] })), 'cpu-proof'), [], 'also skips sealed and judged runs');
  assert.deepEqual(did(nextPlan(base({ sense: busy, backlog: [cpu('a', 'ra')], machine: 'Fox' })), 'cpu-proof'), [], 'another machine\'s row');
  const idle = nextPlan(base({ sense: sense({ gpuProof: 1, build: 1 }, 'idle'), backlog: [cpu('a', 'ra')] }));
  assert.deepEqual([did(idle, 'gpu-proof').length, did(idle, 'cpu-proof').length], [0, 1], 'device cpu never takes the GPU lane');
});

test('a cpu-proof spends the build slot, so harvest evaluate does not also take it', () => {
  const cpu = heldRow({ id: 'c', render: { runId: 'r', machine: 'Lynx', device: 'cpu' } });
  const p = nextPlan(base({ sense: sense({ build: 1 }), backlog: [cpu], evalDebt: 3 }));
  assert.deepEqual(p.free.build, 1, 'free is what the lane had before this plan');
  const filler = did(p, 'filler')[0];
  assert.deepEqual([filler.skill, filler.evaluateHeld], ['deepen --loop', 'no build width']);
});

test('over the review cap proofs pause and research carries on', () => {
  const idle = sense({ gpuProof: 1 }, 'idle');
  const over = (extra) => nextPlan(base({ sense: idle, backlog: [heldRow()], reviewOverCap: true, ...extra }));
  assert.deepEqual([did(over({ rows: approved }), 'mine').length, over({ rows: approved }).proofsPaused], [2, 'review-over-cap']);
  assert.deepEqual(did(over({}), 'gpu-proof'), []);
  const noSeat = over({ sense: sense({ research: 0, gpuProof: 1 }, 'idle') });
  assert.deepEqual([noSeat.actions, noSeat.proofsPaused], [[], 'review-over-cap']);
  const cpu = nextPlan(base({ sense: sense({ build: 1 }), backlog: [heldRow({ render: { machine: 'Lynx', device: 'cpu' } })], reviewOverCap: true }));
  assert.deepEqual([did(cpu, 'cpu-proof'), cpu.proofsPaused], [[], 'review-over-cap'], 'a cpu proof makes renders nobody reviewed too');
});

test('the pause flag means the cap stopped a proof, not merely that the folder is over', () => {
  for (const extra of [{ sense: sense({ gpuProof: 1 }, 'busy'), backlog: [heldRow()] }, { sense: sense({ gpuProof: 1 }, 'idle'), backlog: [] }, { sense: sense({ gpuProof: 0 }, 'idle'), backlog: [heldRow()] }]) {
    assert.equal(nextPlan(base({ ...extra, reviewOverCap: true })).proofsPaused, undefined);
  }
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
  assert.equal(did(run(), 'gpu-proof').length, 1, 'default cap is 5 GB');
  fs.writeFileSync(path.join(root, '.ai', 'shift', 'config.json'), JSON.stringify({ reviewCapGb: 0.000001 }));
  const a = run();
  assert.deepEqual([did(a, 'gpu-proof').length, did(a, 'filler').length, a.proofsPaused], [0, 1, 'review-over-cap']);
  fs.writeFileSync(path.join(root, '.ai', 'shift', 'config.json'), JSON.stringify({ reviewCapGB: 1 }));
  const bad = capture(root, { stdin: () => JSON.stringify(sense()) });
  assert.equal(main(['next', '--sense', '-'], bad.ctx), EXIT.FATAL, 'a typo in the cap is could-not-run, never a default');
});

test('held rows are read by their documented keys: the legacy shape is not eligible', () => {
  const idle = sense({ gpuProof: 1 }, 'idle');
  const legacy = { id: 'x', status: 'held', queue: 'media', render: { run_id: 'r', arm_a: 'a', arm_b: 'b', instrument: 'i' } };
  const migrated = { id: 'x', status: 'held', queue: 'media', render: { kind: 'proof', runId: 'r', brief: 'b', arms: { a: 'a', b: 'b' }, instrument: 'i', estGpuMin: 30, machine: 'Lynx', display: null } };
  assert.deepEqual(did(nextPlan(base({ sense: idle, backlog: [legacy] })), 'gpu-proof'), []);
  const [a] = did(nextPlan(base({ sense: idle, backlog: [migrated] })), 'gpu-proof');
  assert.equal(a.row.render.runId, 'r');
});

/* --- research: mining clusters */

test('a mining cluster mines each video with no report and no live seat', () => {
  const rows = ['v1', 'v2', 'v3'].map((id) => row(id, 'mining', { planId: 'p', cluster: 'c' }));
  const p = nextPlan(base({ rows, reports: new Set(['c/v1']), running: [live('v2', 'miner')], sense: sense({ research: 3 }) }));
  assert.deepEqual(did(p, 'mine').map((a) => a.video), ['v3']);
  assert.equal(did(p, 'mine')[0].startCluster, undefined);
  assert.deepEqual(p.free, { research: 2, build: 0, gpuProof: 0 });
});

test('no report and a width limit: only as many miners as there are slots', () => {
  const rows = ['v1', 'v2', 'v3'].map((id) => row(id, 'mining', { planId: 'p', cluster: 'c' }));
  assert.equal(did(nextPlan(base({ rows, sense: sense({ research: 2 }) })), 'mine').length, 2);
});

test('every video reported and nothing live is land, which replaces resume', () => {
  const p = nextPlan(base({ rows: mining, reports: new Set(['c9/m1']) }));
  assert.deepEqual(did(p, 'land').map((a) => [a.key, a.kind, a.cluster.id]), [['land:p0/c9', 'lander', 'c9']]);
  assert.deepEqual(did(p, 'mine'), []);
  assert.ok(!p.actions.some((a) => a.action === 'resume'));
});

test('a live lander, or a miner still writing, keeps the landing from starting twice or early', () => {
  assert.deepEqual(did(nextPlan(base({ rows: mining, reports: new Set(['c9/m1']), running: [live('land:p0/c9', 'lander')] })), 'land'), []);
  assert.deepEqual(did(nextPlan(base({ rows: mining, reports: new Set(['c9/m1']), running: [live('m1', 'miner')] })), 'land'), []);
});

test('a live seat in one cluster never blocks another: siblings and approved clusters still start', () => {
  const rows = [...mining, row('n1', 'mining', { planId: 'p0', cluster: 'c8' }), ...approved];
  const p = nextPlan(base({ rows, running: [live('m1', 'miner')], sense: sense({ research: 4 }) }));
  assert.deepEqual(did(p, 'mine').map((a) => a.video), ['n1', 'a1', 'a2']);
});

test('a mining row with no cluster still mines, and files under its own id', () => {
  const rows = [row('solo', 'mining')];
  const [a] = did(nextPlan(base({ rows })), 'mine');
  assert.deepEqual(a.cluster, { id: null, planId: null, videos: ['solo'] });
  assert.equal(did(nextPlan(base({ rows, reports: new Set(['solo/solo']) })), 'land')[0].key, 'land:none/solo');
});

test('a waiting cluster is never resumed: it is listed, and everything else proceeds', () => {
  const rows = [row('w1', 'waiting', { planId: 'p0', cluster: 'c7', reason: 'verdict on run-a' }), row('w2', 'waiting', { planId: 'p0', cluster: 'c7', reason: 'verdict on run-a' }), ...approved];
  const p = nextPlan(base({ rows, reports: new Set(['c7/w1', 'c7/w2']) }));
  assert.deepEqual(did(p, 'land'), []);
  assert.deepEqual(did(p, 'mine').map((a) => a.video), ['a1', 'a2']);
  assert.deepEqual(p.waitingOnOperator, [{ kind: 'cluster', id: 'p0/c7', reason: 'verdict on run-a' }]);
});

test('a video marked waiting leaves its siblings free to land', () => {
  const rows = [row('w', 'waiting', { planId: 'p', cluster: 'c', reason: 'r' }), row('m', 'mining', { planId: 'p', cluster: 'c' })];
  assert.equal(did(nextPlan(base({ rows, reports: new Set(['c/m']) })), 'land').length, 1);
});

/* --- research: pre-research, approved, filler, in that order */

test('research fills in order: mining, pre-research, approved, filler, one slot each', () => {
  const rows = [...mining, ...unplannedSix, ...approved];
  const p = (research) => nextPlan(base({ rows, sense: sense({ research }) })).actions.map((a) => a.action);
  assert.deepEqual(p(1), ['mine']);
  assert.deepEqual(p(2), ['mine', 'pre-research']);
  assert.deepEqual(p(3), ['mine', 'pre-research', 'mine']);
  assert.deepEqual(p(5), ['mine', 'pre-research', 'mine', 'mine', 'filler']);
  assert.equal(nextPlan(base({ rows, sense: sense({ research: 5 }) })).actions.at(-1).width, 1);
});

test('pre-research when unplanned passes 5, or one is older than 24 h', () => {
  const has = (o) => did(nextPlan(base(o)), 'pre-research').length === 1;
  assert.ok(has({ rows: [...unplannedSix, ...approved] }));
  assert.ok(!has({ rows: unplannedSix.slice(0, 5) }), 'five is not beyond five');
  const [a] = did(nextPlan(base({ rows: [row('old', 'meta', { addedAt: STALE })] })), 'pre-research');
  assert.deepEqual([a.unplanned, a.olderThan24h, a.key], [1, 1, 'plan:new']);
});

test('a draft plan holds back pre-research only: mining and filler go on, and it is listed', () => {
  const plans = [{ planId: 'p9', plan: null, approved: false }];
  const a = nextPlan(base({ rows: unplannedSix, plans }));
  assert.deepEqual(a.actions.map((x) => x.action), ['filler']);
  assert.deepEqual(a.waitingOnOperator, [{ kind: 'plan', id: 'p9', reason: 'draft plan awaiting approval' }]);
  assert.deepEqual(did(nextPlan(base({ rows: [...unplannedSix, ...approved], plans })), 'mine').length, 2);
  assert.equal(did(nextPlan(base({ rows: unplannedSix, plans: [{ planId: 'p9', plan: null, approved: true }] })), 'pre-research').length, 1, 'an approved plan is not a draft');
});

test('a live planner holds back a second pre-research', () => {
  assert.deepEqual(did(nextPlan(base({ rows: unplannedSix, running: [live('plan:new', 'planner')] })), 'pre-research'), []);
});

test('an approved cluster is mined per video, with its plan\'s facts, and superseded siblings left out', () => {
  const plans = [{ planId: 'p1', approved: true, plan: { clusters: [{ id: 'c1', theme: 'T', homes: ['h'], yield: 'y', gpuProofs: [], estSeats: 2 }] } }];
  const p = nextPlan(base({ rows: [...approved, row('s1', 'parked', { planId: 'p1', cluster: 'c1', reason: 'superseded by a1: x' })], plans, evalDebt: 9 }));
  const mines = did(p, 'mine');
  assert.deepEqual(mines.map((a) => a.video), ['a1', 'a2']);
  assert.deepEqual(mines[0].cluster.videos, ['a1', 'a2']);
  assert.equal(mines[0].cluster.theme, 'T');
});

test('clusters are not held back to finish another: several start together, in queue order', () => {
  const rows = [...approved, row('b1', 'approved', { planId: 'p1', cluster: 'c2' })];
  assert.deepEqual(did(nextPlan(base({ rows })), 'mine').map((a) => a.video), ['a1', 'a2', 'b1']);
  assert.deepEqual(did(nextPlan(base({ rows, sense: sense({ research: 2 }) })), 'mine').map((a) => a.video), ['a1', 'a2']);
});

test('an approved video already seated or reported is not started again', () => {
  const p = nextPlan(base({ rows: approved, running: [live('a1', 'miner')], reports: new Set(['c1/a2']) }));
  assert.deepEqual(did(p, 'mine'), []);
  const landed = nextPlan(base({ rows: approved, reports: new Set(['c1/a1', 'c1/a2']) }));
  assert.equal(did(landed, 'land')[0].startCluster, true, 'a crash before the mark still lands');
});

test('filler takes the first with work, at the slots left', () => {
  const queued = { id: 'q', status: 'queued' };
  const built = sense({ build: 1 });
  const fillerOf = (o) => did(nextPlan(base(o)), 'filler')[0];
  assert.deepEqual([fillerOf({ sense: built, evalDebt: 3, backlog: [queued] }).skill, fillerOf({ sense: built, evalDebt: 3 }).debt], ['harvest evaluate', 3]);
  assert.equal(fillerOf({ sense: built, evalDebt: 2, backlog: [queued] }).skill, 'harvest backlog');
  assert.equal(fillerOf({ evalDebt: 2, backlog: [heldRow()] }).skill, 'deepen --loop', 'a held row is not backlog work');
  assert.equal(fillerOf({ evalDebt: 2 }).width, 3);
  assert.equal(fillerOf({ evalDebt: 2 }).key, 'filler:deepen --loop');
});

test('harvest evaluate is never offered at build 0: it says it was held', () => {
  const queued = { id: 'q', status: 'queued' };
  const a = did(nextPlan(base({ evalDebt: 9, backlog: [queued] })), 'filler')[0];
  assert.deepEqual([a.skill, a.evaluateHeld], ['harvest backlog', 'no build width']);
  const b = did(nextPlan(base({ evalDebt: 9, sense: sense({ build: 1 }), running: [live('b', 'builder')] })), 'filler')[0];
  assert.deepEqual([b.skill, b.evaluateHeld], ['deepen --loop', 'no build width'], 'a live builder took the width');
  assert.equal(did(nextPlan(base({ evalDebt: 2 })), 'filler')[0].evaluateHeld, undefined, 'no debt, nothing held');
});

test('a live filler holds back another; a full research lane offers no filler', () => {
  assert.deepEqual(did(nextPlan(base({ running: [live('filler:deepen --loop', 'filler')] })), 'filler'), []);
  assert.deepEqual(did(nextPlan(base({ sense: sense({ research: 1 }), rows: mining })), 'filler'), []);
});

test('an empty plan says why', () => {
  assert.match(nextPlan(base({ sense: sense({ research: 0, build: 1 }), rows: approved })).reason, /research seat/);
  const full = nextPlan(base({ sense: sense({ research: 1 }), running: [live('x', 'miner')] }));
  assert.deepEqual(full.actions, []);
  assert.match(full.reason, /full/);
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
  assert.deepEqual(STATUSES, ['new', 'meta', 'transcript', 'no-transcript', 'planned', 'approved', 'mining', 'waiting', 'landed', 'parked']);
});

/* ------------------------------------------------------------- cli */

test('next reads a sense file, the queue and the ledger, and prints one JSON plan', () => {
  const root = tmpRoot();
  seed(root, approved);
  const file = path.join(root, 'sense.json');
  fs.writeFileSync(file, JSON.stringify(sense()));
  const { out, ctx } = capture(root);
  assert.equal(main(['next', '--sense', file], ctx), EXIT.OK);
  assert.equal(out.length, 1);
  assert.deepEqual(did(JSON.parse(out[0]), 'mine').map((a) => a.video), ['a1', 'a2']);
});

test('next takes the sense from stdin and refuses a bad one as could-not-run', () => {
  const root = tmpRoot();
  const a = capture(root, { stdin: () => JSON.stringify(sense({ research: 0 })) });
  assert.equal(main(['next', '--sense', '-'], a.ctx), EXIT.OK);
  assert.deepEqual(JSON.parse(a.out[0]).actions, []);
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

test('mining survives a restart: state, reports, live seats and sealed runs are all read from disk', () => {
  const root = tmpRoot();
  seed(root, [...mining, row('m2', 'mining', { planId: 'p0', cluster: 'c9' }), row('m3', 'mining', { planId: 'p0', cluster: 'c9' })]);
  const state = path.join(root, '.ai', 'shift');
  fs.mkdirSync(path.join(state, 'runs', 'c9'), { recursive: true });
  fs.writeFileSync(path.join(state, 'runs', 'c9', 'm1.md'), 'report');
  fs.writeFileSync(path.join(state, 'runs', 'stray.md'), 'not a cluster');
  assert.equal(main(['seat', 'miner', '--key', 'm2', '--cluster', 'c9'], capture(root).ctx), EXIT.OK);
  fs.mkdirSync(path.join(state, 'review', 'items', 'run-a', 'triage'), { recursive: true });
  fs.writeFileSync(path.join(state, 'review', 'items', 'run-a', 'triage', 'key.json'), '{}');
  const { out, ctx } = capture(root, { stdin: () => JSON.stringify(sense()) });
  assert.equal(main(['next', '--sense', '-'], ctx), EXIT.OK);
  const p = JSON.parse(out[0]);
  assert.deepEqual(did(p, 'mine').map((a) => a.video), ['m3']);
  assert.deepEqual(p.running.map((r) => r.key), ['m2']);
  assert.deepEqual(p.waitingOnOperator.map((w) => w.id), ['run-a']);
  assert.deepEqual([...readReports(root)], ['c9/m1']);
});

test('next treats a run with a verdict as done, sealed or not, after clean removed its media', () => {
  const root = tmpRoot();
  fs.writeFileSync(path.join(root, 'librarian', 'harvest', 'backlog.jsonl'), `${JSON.stringify(heldRow({ render: { runId: 'run-a', machine: 'Lynx', estGpuMin: 1 } }))}\n`);
  const item = path.join(root, '.ai', 'shift', 'review', 'items', 'run-a');
  fs.mkdirSync(item, { recursive: true });
  fs.writeFileSync(path.join(item, 'verdict.json'), '{}');
  const { out, ctx } = capture(root, { stdin: () => JSON.stringify(sense({ gpuProof: 1 }, 'idle')) });
  assert.equal(main(['next', '--sense', '-'], ctx), EXIT.OK);
  const p = JSON.parse(out[0]);
  assert.deepEqual(did(p, 'gpu-proof'), []);
  assert.deepEqual(p.waitingOnOperator, []);
});

test('waiting needs a reason, is a closed-set status, and a cluster mark reaches it', () => {
  const root = tmpRoot();
  seed(root, approved);
  assert.equal(main(['mark', 'c1', 'waiting'], capture(root).ctx), EXIT.FATAL);
  assert.equal(main(['mark', 'c1', 'waiting', '--reason', ' '], capture(root).ctx), EXIT.FATAL);
  assert.equal(main(['mark', 'c1', 'waiting', '--reason', 'verdict on run-a'], capture(root).ctx), EXIT.OK);
  assert.deepEqual(readQueue(root).map((r) => [r.status, r.reason]), [['waiting', 'verdict on run-a'], ['waiting', 'verdict on run-a']]);
  const l = capture(root);
  assert.equal(main(['list', '--status', 'waiting', '--json'], l.ctx), EXIT.OK);
  assert.equal(l.out.length, 2);
  assert.equal(main(['mark', 'c1', 'mining'], capture(root).ctx), EXIT.OK);
  assert.deepEqual(readQueue(root).map((r) => [r.status, r.reason]), [['mining', undefined], ['mining', undefined]], 'the operator answered: it mines on');
});

/* ------------------------------------------------------------- the running ledger */

test('seat --key records it running with its cluster, and counts the seat', () => {
  const root = tmpRoot();
  assert.equal(main(['seat', 'miner', '--key', 'v1', '--cluster', 'c1'], capture(root).ctx), EXIT.OK);
  assert.deepEqual(readRunning(path.join(root, '.ai', 'shift')), [{ key: 'v1', kind: 'miner', cluster: 'c1', startedAt: new Date(NOW).toISOString() }]);
  assert.deepEqual(seats(root).map((s) => s.kind), ['miner']);
});

test('a duplicate live key refuses, exit 2: a double dispatch, with no second seat counted', () => {
  const root = tmpRoot();
  assert.equal(main(['seat', 'miner', '--key', 'v1'], capture(root).ctx), EXIT.OK);
  const c = capture(root);
  assert.equal(main(['seat', 'lander', '--key', 'v1'], c.ctx), EXIT.FATAL);
  assert.match(c.err.join(''), /double dispatch: v1/);
  assert.equal(seats(root).length, 1);
  assert.equal(readRunning(path.join(root, '.ai', 'shift')).length, 1);
});

test('a stale key does not refuse: the work can be picked up again', () => {
  const root = tmpRoot();
  assert.equal(main(['seat', 'miner', '--key', 'v1'], capture(root, { now: () => NOW - RUNNING_STALE_MS - 1 }).ctx), EXIT.OK);
  assert.equal(main(['seat', 'miner', '--key', 'v1'], capture(root).ctx), EXIT.OK);
  const records = readRunning(path.join(root, '.ai', 'shift'));
  assert.deepEqual(records.map((r) => r.startedAt), [new Date(NOW).toISOString()]);
});

test('proof and cpu-proof hold their lanes but are not agent seats', () => {
  const root = tmpRoot();
  assert.equal(main(['seat', 'miner', '--key', 'v1'], capture(root).ctx), EXIT.OK);
  assert.equal(main(['seat', 'proof', '--key', 'proof:r1'], capture(root).ctx), EXIT.OK);
  assert.equal(main(['seat', 'cpu-proof', '--key', 'proof:r2'], capture(root).ctx), EXIT.OK);
  assert.deepEqual(seats(root).map((s) => s.kind), ['miner']);
  assert.equal(readRunning(path.join(root, '.ai', 'shift')).length, 3);
  assert.equal(main(['seat', 'proof'], capture(root).ctx), EXIT.FATAL, 'it would record nothing');
});

test('seat refuses an unknown kind with a key, --cluster without a key, and an empty key', () => {
  const root = tmpRoot();
  for (const args of [['seat', 'wizard', '--key', 'k'], ['seat', 'miner', '--cluster', 'c'], ['seat', 'miner', '--key', ' '], ['seat', 'miner', '--key']]) {
    assert.equal(main(args, capture(root).ctx), EXIT.FATAL, args.join(' '));
  }
});

test('done removes the key; an unknown key is a clear error and changes nothing', () => {
  const root = tmpRoot();
  main(['seat', 'filler', '--key', 'filler:harvest backlog'], capture(root).ctx);
  main(['seat', 'miner', '--key', 'v1'], capture(root).ctx);
  const c = capture(root);
  assert.equal(main(['done', 'nope'], c.ctx), EXIT.FATAL);
  assert.match(c.err.join(''), /no running seat has the key nope/);
  assert.equal(main(['done', 'filler:harvest backlog'], capture(root).ctx), EXIT.OK);
  assert.deepEqual(readRunning(path.join(root, '.ai', 'shift')).map((r) => r.key), ['v1']);
  assert.equal(main(['done'], capture(root).ctx), EXIT.FATAL);
});

test('a record past 6 h reads as dead: it holds no lane, and list-running prints both', () => {
  const root = tmpRoot();
  seed(root, [row('v1', 'mining', { planId: 'p', cluster: 'c' })]);
  main(['seat', 'miner', '--key', 'v1'], capture(root, { now: () => NOW - RUNNING_STALE_MS - 1 }).ctx);
  main(['seat', 'builder', '--key', 'b'], capture(root).ctx);
  const j = capture(root);
  assert.equal(main(['list-running', '--json'], j.ctx), EXIT.OK);
  const { live: alive, stale } = JSON.parse(j.out[0]);
  assert.deepEqual([alive.map((r) => r.key), stale.map((r) => r.key)], [['b'], ['v1']]);
  const t = capture(root);
  assert.equal(main(['list-running'], t.ctx), EXIT.OK);
  assert.match(t.out.join('\n'), /b\tbuilder\t-\t.*\tlive/);
  assert.match(t.out.join('\n'), /v1\tminer\t-\t.*\tstale/);
  const n = capture(root, { stdin: () => JSON.stringify(sense()) });
  assert.equal(main(['next', '--sense', '-'], n.ctx), EXIT.OK);
  assert.deepEqual(did(JSON.parse(n.out[0]), 'mine').map((a) => a.video), ['v1'], 'a dead terminal does not hold the video');
  const at = NOW - RUNNING_STALE_MS;
  assert.equal(splitRunning([{ startedAt: new Date(at).toISOString() }], NOW).live.length, 1, 'exactly 6 h is still live');
  assert.equal(splitRunning([{ startedAt: 'never' }], NOW).stale.length, 1, 'undatable is dead');
});

test('seatsMb: research kinds 1000, build kinds 3400, a GPU proof 0', () => {
  assert.equal(seatsMb([]), 0);
  assert.equal(seatsMb(['miner', 'lander', 'planner', 'filler'].map((k) => live(k, k))), 4000);
  assert.equal(seatsMb([live('b', 'builder'), live('c', 'cpu-proof')]), 6800);
  assert.equal(seatsMb([live('p', 'proof')]), 0);
});

test('a crash in a running write leaves the ledger as it was, and no lock', () => {
  const root = tmpRoot();
  main(['seat', 'miner', '--key', 'v1'], capture(root).ctx);
  const crashing = { ...fs, renameSync: () => { throw new Error('power cut'); } };
  assert.throws(() => withRunning(root, (r) => { r.length = 0; }, { fsImpl: crashing }), /power cut/);
  assert.deepEqual(readRunning(path.join(root, '.ai', 'shift')).map((r) => r.key), ['v1']);
  assert.ok(!fs.readdirSync(path.dirname(queuePath(root))).some((f) => f.endsWith('.lock')));
});

test('a torn running ledger refuses next and seat: unreadable is not empty', () => {
  const root = tmpRoot();
  fs.mkdirSync(path.join(root, '.ai', 'shift'), { recursive: true });
  fs.writeFileSync(path.join(root, '.ai', 'shift', 'running.jsonl'), '{"key"');
  assert.equal(main(['seat', 'miner', '--key', 'v1'], capture(root).ctx), EXIT.FATAL);
  assert.equal(main(['next', '--sense', '-'], capture(root, { stdin: () => JSON.stringify(sense()) }).ctx), EXIT.FATAL);
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

test('a repository row waits for RAM to spare, and every video goes first', () => {
  const video = { id: 'vid', status: 'approved', planId: 'p', cluster: 'c-video', addedAt: FRESH };
  const repo = { id: 'gh-a-b', kind: 'repo', status: 'approved', planId: 'q', cluster: 'c-repo', addedAt: FRESH };
  const at = (availableMb, research = 2) => ({ ...sense({ research }), availableMb });
  const mined = (p) => p.actions.filter((a) => a.action === 'mine').map((a) => a.video);

  assert.deepEqual(mined(nextPlan(base({ sense: at(19999), rows: [repo, video] }))), ['vid']);
  assert.deepEqual(mined(nextPlan(base({ sense: at(20000), rows: [repo, video] }))), ['vid', 'gh-a-b']);
  assert.deepEqual(mined(nextPlan(base({ sense: at(20000, 1), rows: [repo, video] }))), ['vid']);
  // A null reading is not spare.
  assert.deepEqual(mined(nextPlan(base({ sense: at(null), rows: [repo] }))), []);
  // A repository cluster already mining also waits, and its lander is not held back.
  const started = { ...repo, status: 'mining' };
  assert.deepEqual(mined(nextPlan(base({ sense: at(1000), rows: [started] }))), []);
  const landing = nextPlan(base({ sense: at(1000), rows: [started], reports: new Set(['c-repo/gh-a-b']) }));
  assert.equal(landing.actions.find((a) => a.action === 'land')?.key, 'land:q/c-repo');
});

/* ---------------------------------------------------------------- plan digest */

const digestRows = () => [
  row('m1', 'mining', { planId: 'p1', cluster: 'live' }),
  row('m2', 'approved', { planId: 'p1', cluster: 'live' }),
  row('n1', 'approved', { planId: 'p1', cluster: 'fresh' }),
  row('o1', 'approved', { planId: 'p2', cluster: 'other' }),
];
const digestPlans = (digest) => [{ planId: 'p1', plan: null, approved: true, digest }, { planId: 'p2', plan: null, approved: true, digest: 'match' }];
const wide = sense({ research: 5 });

test('plan digest match: next starts its videos and owes nothing', () => {
  const p = nextPlan(base({ sense: wide, rows: digestRows(), plans: digestPlans('match') }));
  assert.deepEqual(did(p, 'mine').map((a) => a.video).sort(), ['m1', 'm2', 'n1', 'o1']);
  assert.deepEqual(p.waitingOnOperator, []);
  assert.equal(p.note, undefined);
});

test('plan digest mismatch: no new video from that plan, owed once, and a mining cluster goes on', () => {
  const p = nextPlan(base({ sense: wide, rows: digestRows(), plans: digestPlans('mismatch') }));
  const videos = did(p, 'mine').map((a) => a.video).sort();
  assert.ok(!videos.includes('n1'), 'a cluster not yet started does not start');
  assert.ok(videos.includes('m1') && videos.includes('m2'), 'a mining cluster is unaffected');
  assert.ok(videos.includes('o1'), 'another plan is unaffected');
  assert.deepEqual(p.waitingOnOperator, [{ kind: 'plan', id: 'p1', reason: 'plan changed after approval' }]);
});

test('plan digest mismatch: a live seat and a landing of a mining cluster are unaffected', () => {
  const rows = [row('m1', 'mining', { planId: 'p1', cluster: 'live' })];
  const reported = nextPlan(base({ sense: wide, rows, plans: digestPlans('mismatch'), reports: new Set(['live/m1']) }));
  assert.equal(did(reported, 'land').length, 1);
  const seated = nextPlan(base({ sense: wide, rows, plans: digestPlans('mismatch'), running: [{ key: 'm1', kind: 'miner', startedAt: FRESH }] }));
  assert.equal(did(seated, 'mine').length, 0);
  assert.deepEqual(seated.running.map((r) => r.key), ['m1']);
});

test('plan digest legacy: keeps working, and the two plans share one note', () => {
  const plans = [{ planId: 'p1', plan: null, approved: true, digest: 'legacy' }, { planId: 'p2', plan: null, approved: true, digest: 'legacy' }];
  const p = nextPlan(base({ sense: wide, rows: digestRows(), plans }));
  assert.deepEqual(did(p, 'mine').map((a) => a.video).sort(), ['m1', 'm2', 'n1', 'o1']);
  assert.deepEqual(p.waitingOnOperator, []);
  assert.match(p.note, /legacy.*p1, p2/);
});

test('plan digest mismatch is still owed when every width is zero', () => {
  const p = nextPlan(base({ sense: sense({ research: 0 }), rows: digestRows(), plans: digestPlans('mismatch') }));
  assert.deepEqual(p.actions, []);
  assert.deepEqual(p.waitingOnOperator, [{ kind: 'plan', id: 'p1', reason: 'plan changed after approval' }]);
});
