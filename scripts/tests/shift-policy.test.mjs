// Tests for scripts/lib/shift-policy.mjs. Each "trap N" is a false reading measured on the
// video box this sensor guards; a false idle there means a benchmark on top of a render.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULTS, canary, clipPrefix, decide, gpuStep, loadPolicy, pressure, width } from '../lib/shift-policy.mjs';

const T = Date.parse('2026-11-06T12:00:00Z');
const iso = (ms) => new Date(ms).toISOString();

/** A quiet card with every reader healthy; each test states only what differs. */
const quiet = (over = {}) => ({
  gpuReader: 'ok', comfyReader: 'ok', historyOk: true,
  utilPct: 1, powerW: 2, comfyRunning: 0, comfyPending: 0, lastEndMs: null, clips: [],
  runningPrefix: null, runningStartMs: null, ollamaLoaded: false, leaseHolder: null, leaseKnown: true,
  cpuPct: 10, availableMb: 40000, committedMb: 90000, commitLimitMb: 160000, pageReadsPerSec: 0, diskFreeGb: 250, operatorIdleS: 7200,
  ...over,
});
const prevAt = (dwellS, state = 'settling', agoS = 15) => ({ ts: iso(T - agoS * 1000), gpu: { state, dwellS } });
const sense = (over = {}) => ({ cpuPct: 10, operatorIdleS: 7200, pressure: [], gpu: { state: 'busy' }, ...over });

test('DEFAULTS holds exactly the design keys and values', () => {
  assert.deepEqual({ ...DEFAULTS }, {
    maxSeatsPerDay: 30, attentionCap: 5, operatorIdleMin: 30, gpuIdleDwellS: 300, reviewCapGb: 5,
    minFreeDiskGb: 100, pageReadsPressure: 500, availableFloorMb: 12000, coLoadBudgetMb: 18000,
  });
});

test('loadPolicy merges over defaults and rejects unknown keys and non-numbers', () => {
  assert.equal(loadPolicy({ attentionCap: 3 }).attentionCap, 3);
  assert.equal(loadPolicy({ attentionCap: 3 }).gpuIdleDwellS, 300);
  assert.deepEqual({ ...loadPolicy() }, { ...DEFAULTS });
  assert.throws(() => loadPolicy({ attentionKap: 3 }), /unknown key "attentionKap"/);
  assert.throws(() => loadPolicy({ attentionCap: '3' }), /must be a number/);
  assert.throws(() => loadPolicy({ attentionCap: Number.NaN }), /must be a number/);
  assert.throws(() => loadPolicy({ attentionCap: null }), /must be a number/);
  assert.throws(() => loadPolicy([]), /must be an object/);
  assert.throws(() => loadPolicy(JSON.parse('{"__proto__": 1}')), /unknown key/);
});

test('trap 1: H3 sampling at util 96, 41-44 W, one running, 55 GB held is busy', () => {
  for (const powerW of [41, 44]) {
    const gpu = gpuStep(quiet({ utilPct: 96, powerW, comfyRunning: 1, memoryUsedMb: 55000 }), prevAt(0, 'busy'), DEFAULTS, T);
    assert.equal(gpu.state, 'busy');
    assert.equal(gpu.dwellS, 0);
  }
});

test('trap 2: the 8 s handover at util 5, 2.2 W and an empty queue is settling, never idle', () => {
  const gpu = gpuStep(quiet({ utilPct: 5, powerW: 2.2 }), prevAt(0, 'busy', 8), DEFAULTS, T);
  assert.equal(gpu.state, 'settling');
  assert.equal(gpu.dwellS, 8);
});

test('trap 3: idle with cached models: 51 GB used, util 1, 2 W, empty queue, dwell 301 is idle', () => {
  const gpu = gpuStep(quiet({ memoryUsedMb: 51000, vramFreeMb: 13000 }), prevAt(286), DEFAULTS, T);
  assert.equal(gpu.state, 'idle');
  assert.equal(gpu.dwellS, 301);
});

test('trap 3: card memory takes no part: any value decides the same', () => {
  const low = gpuStep(quiet({ memoryUsedMb: 10, vramFreeMb: 64000 }), prevAt(286), DEFAULTS, T);
  const high = gpuStep(quiet({ memoryUsedMb: 64000, vramFreeMb: 0 }), prevAt(286), DEFAULTS, T);
  assert.deepEqual(low, high);
  assert.ok(!('memoryUsedMb' in low) && !('vramFreeMb' in low));
});

test('trap 4: a job appearing in /history inside the window resets dwell to 0', () => {
  const gpu = gpuStep(quiet({ lastEndMs: T - 5000 }), prevAt(290), DEFAULTS, T);
  assert.equal(gpu.state, 'settling');
  assert.equal(gpu.dwellS, 0);
});

test('trap 4: a /history entry older than the window does not reset dwell', () => {
  const gpu = gpuStep(quiet({ lastEndMs: T - 400000 }), prevAt(290), DEFAULTS, T);
  assert.equal(gpu.dwellS, 305);
  assert.equal(gpu.state, 'idle');
});

test('trap 4: running, pending, ollamaLoaded, leaseHolder, util >= 15 and power >= 5 each reset dwell', () => {
  const cases = {
    comfyRunning: { comfyRunning: 1 },
    comfyPending: { comfyPending: 1 },
    ollamaLoaded: { ollamaLoaded: true },
    leaseHolder: { leaseHolder: 'trailer-day-run' },
    util: { utilPct: 15 },
    power: { powerW: 5 },
  };
  for (const [name, over] of Object.entries(cases)) {
    const gpu = gpuStep(quiet(over), prevAt(290), DEFAULTS, T);
    assert.equal(gpu.dwellS, 0, name);
    assert.notEqual(gpu.state, 'idle', name);
  }
});

test('trap 4: just under the thresholds still dwells', () => {
  const gpu = gpuStep(quiet({ utilPct: 14, powerW: 4.9 }), prevAt(290), DEFAULTS, T);
  assert.equal(gpu.state, 'idle');
});

test('trap 5: TRELLIS at util 12 for 28 s with one running is busy: the queue decides, not util', () => {
  let prev = prevAt(0, 'busy');
  for (let i = 0; i < 2; i += 1) {
    const gpu = gpuStep(quiet({ comfyRunning: 1, utilPct: 12, powerW: 3 }), prev, DEFAULTS, T + i * 14000);
    assert.equal(gpu.state, 'busy');
    prev = { ts: iso(T + i * 14000), gpu };
  }
});

test('trap 6: GPU Engine counter error or nvidia-smi failure is unknown', () => {
  const gpu = gpuStep(quiet({ gpuReader: 'error', utilPct: null, powerW: null }), prevAt(100), DEFAULTS, T);
  assert.equal(gpu.state, 'unknown');
  assert.equal(gpu.utilPct, null);
  assert.equal(gpu.powerW, null);
});

test('trap 6: unknown never advances dwell, however long, and never reads as idle', () => {
  const failed = quiet({ gpuReader: 'error', utilPct: null, powerW: null });
  assert.equal(gpuStep(failed, prevAt(100), DEFAULTS, T).dwellS, 100);
  const atThreshold = gpuStep(failed, prevAt(300, 'unknown'), DEFAULTS, T);
  assert.equal(atThreshold.state, 'unknown');
  assert.equal(atThreshold.dwellS, 300);
});

test('trap 6: the first clean sample after unknown restarts dwell: unobserved time proves nothing', () => {
  const gpu = gpuStep(quiet(), prevAt(400, 'unknown'), DEFAULTS, T);
  assert.equal(gpu.state, 'settling');
  assert.equal(gpu.dwellS, 0);
});

test('trap 6: a partial reading, a failed /history, ollama or lease is unknown, never quiet', () => {
  const cases = {
    powerNull: { powerW: null },
    historyDown: { historyOk: false },
    ollamaTimeout: { ollamaLoaded: null },
    leaseUnreadable: { leaseKnown: false },
    comfyError: { comfyReader: 'error', comfyRunning: null, comfyPending: null, historyOk: false },
  };
  for (const [name, over] of Object.entries(cases)) {
    assert.equal(gpuStep(quiet(over), prevAt(299), DEFAULTS, T).state, 'unknown', name);
  }
});

test('trap 6: positive evidence outranks a failed reader: running with nvidia-smi down is busy', () => {
  const gpu = gpuStep(quiet({ gpuReader: 'error', utilPct: null, powerW: null, comfyRunning: 1 }), prevAt(100), DEFAULTS, T);
  assert.equal(gpu.state, 'busy');
});

test('trap 7: no nvidia-smi and no ComfyUI is absent; gpuProof 0; research still computed', () => {
  const out = decide(
    quiet({ gpuReader: 'absent', comfyReader: 'absent', utilPct: null, powerW: null, comfyRunning: null, comfyPending: null, historyOk: false }),
    [], DEFAULTS, { now: T },
  );
  assert.equal(out.gpu.state, 'absent');
  assert.equal(out.gpu.dwellS, null);
  assert.equal(out.width.gpuProof, 0);
  assert.equal(out.width.research, 5);
});

test('trap 7: nvidia-smi present but failing, or ComfyUI alone gone, is not absent', () => {
  const noComfy = { comfyReader: 'absent', comfyRunning: null, comfyPending: null, historyOk: false };
  assert.equal(gpuStep(quiet({ gpuReader: 'error', utilPct: null, powerW: null, ...noComfy }), null, DEFAULTS, T).state, 'unknown');
  assert.equal(gpuStep(quiet(noComfy), null, DEFAULTS, T).state, 'unknown');
});

test('trap 8: ComfyUI unreachable but util 90 is busy: another tenant', () => {
  const gpu = gpuStep(quiet({ comfyReader: 'absent', comfyRunning: null, comfyPending: null, historyOk: false, utilPct: 90, powerW: 40 }), prevAt(100), DEFAULTS, T);
  assert.equal(gpu.state, 'busy');
  assert.equal(gpu.comfyRunning, null);
});

const clips = (prefix, seconds) => seconds.map((clipS, i) => ({ prefix, clipS, endMs: T - (seconds.length - i) * 500000 }));

test('trap 9: ratio 1.31 on the running prefix with seats active is pressure canary', () => {
  const sample = quiet({ runningPrefix: 'mc-h3', comfyRunning: 1, clips: clips('mc-h3', [410, 400, 395, 405, 390, 524]) });
  const out = decide(sample, [], DEFAULTS, { now: T, seatsActive: true, shiftSeatsMb: 2000 });
  assert.deepEqual(out.canary, { prefix: 'mc-h3', ratio: 1.31 });
  assert.ok(out.pressure.includes('canary'));
  assert.deepEqual(out.width, { research: 0, build: 0, gpuProof: 0 });
});

test('trap 9: the clip in flight trips the canary before it finishes', () => {
  const sample = quiet({ runningPrefix: 'mc-h3', runningStartMs: T - 524000, clips: clips('mc-h3', [410, 400, 400, 400, 390]) });
  const got = canary(sample, T);
  assert.equal(got.prefix, 'mc-h3');
  assert.ok(Math.abs(got.ratio - 1.31) < 0.001);
});

test('trap 9: with no seats active a slow clip is reported but is not our pressure', () => {
  const sample = quiet({ runningPrefix: 'mc-h3', clips: clips('mc-h3', [400, 400, 400, 400, 400, 524]) });
  const out = decide(sample, [], DEFAULTS, { now: T });
  assert.equal(out.canary.ratio, 1.31);
  assert.deepEqual(out.pressure, []);
});

test('trap 9: ratio 1.30 does not fire', () => {
  const sample = quiet({ runningPrefix: 'mc-h3', clips: clips('mc-h3', [400, 400, 400, 400, 400, 520]) });
  assert.deepEqual(decide(sample, [], DEFAULTS, { now: T, seatsActive: true }).pressure, []);
});

test('trap 9: a ratio from fewer than 3 prior clips is canary null', () => {
  const twoPrior = quiet({ runningPrefix: 'mc-h3', runningStartMs: T - 999000, clips: clips('mc-h3', [400, 400]) });
  assert.equal(decide(twoPrior, [], DEFAULTS, { now: T, seatsActive: true }).canary, null);
  const threeFinished = quiet({ runningPrefix: 'mc-h3', clips: clips('mc-h3', [400, 400, 999]) });
  assert.equal(canary(threeFinished, T), null);
});

test('trap 9: other prefixes are not compared; nothing running is canary null', () => {
  const sample = quiet({ runningPrefix: 'mc-h3', clips: [...clips('mc-film3', [100, 100, 100, 100, 100]), ...clips('mc-h3', [400, 999])] });
  assert.equal(canary(sample, T), null);
  assert.equal(canary(quiet({ clips: clips('mc-h3', [400, 400, 400, 400]) }), T), null);
});

test('trap 9: clipPrefix removes the trailing clip id from real SaveVideo prefixes', () => {
  assert.equal(clipPrefix('gravitone/mc-h3-OR05'), 'mc-h3');
  assert.equal(clipPrefix('gravitone/mc-film3-K01'), 'mc-film3');
  assert.equal(clipPrefix('gravitone/mc-lab-A'), 'mc-lab');
  assert.equal(clipPrefix('solo'), 'solo');
  assert.equal(clipPrefix(''), null);
  assert.equal(clipPrefix(undefined), null);
});

const reads = (values, stepS = 15, end = T) => values.map((pageReadsPerSec, i) => ({
  ts: iso(end - (values.length - i) * stepS * 1000), pageReadsPerSec,
}));
const atT = (over) => ({ ts: iso(T), ...over });

test('trap 10: pageReads above threshold for >= 2 consecutive minutes fires', () => {
  const history = reads(Array(8).fill(900));
  assert.deepEqual(pressure(atT({ pageReadsPerSec: 900 }), DEFAULTS, history), ['page-reads']);
});

test('trap 10: a single spike, or under 2 minutes, does not fire', () => {
  assert.deepEqual(pressure(atT({ pageReadsPerSec: 1199 }), DEFAULTS, []), []);
  assert.deepEqual(pressure(atT({ pageReadsPerSec: 900 }), DEFAULTS, reads(Array(7).fill(900))), []);
});

test('trap 10: a dip inside the window breaks the run, and so does a sampling gap', () => {
  const dipped = reads([900, 900, 900, 100, 900, 900, 900, 900]);
  assert.deepEqual(pressure(atT({ pageReadsPerSec: 900 }), DEFAULTS, dipped), []);
  const gapped = reads(Array(4).fill(900), 120);
  assert.deepEqual(pressure(atT({ pageReadsPerSec: 900 }), DEFAULTS, gapped.slice(0, 1).concat(reads([900], 15))), []);
});

test('trap 10: pageReads null never fires, in the sample or inside the run', () => {
  assert.deepEqual(pressure(atT({ pageReadsPerSec: null }), DEFAULTS, reads(Array(8).fill(900))), []);
  assert.deepEqual(pressure(atT({ pageReadsPerSec: 900 }), DEFAULTS, reads(Array(8).fill(null))), []);
});

test('trap 10: available under floor, commit over 90 % and disk under minimum each give their own string', () => {
  assert.deepEqual(pressure(atT({ availableMb: 11999 }), DEFAULTS), ['available']);
  assert.deepEqual(pressure(atT({ committedMb: 91, commitLimitMb: 100 }), DEFAULTS), ['commit']);
  assert.deepEqual(pressure(atT({ diskFreeGb: 99.9 }), DEFAULTS), ['disk']);
  assert.deepEqual(pressure(atT({ availableMb: 12000, committedMb: 90, commitLimitMb: 100, diskFreeGb: 100 }), DEFAULTS), []);
  assert.deepEqual(pressure(atT({ availableMb: 1, committedMb: 95, commitLimitMb: 100, diskFreeGb: 1 }), DEFAULTS), ['available', 'commit', 'disk']);
});

test('trap 10: absent readings never fire', () => {
  assert.deepEqual(pressure(atT({ availableMb: null, committedMb: null, commitLimitMb: null, diskFreeGb: null }), DEFAULTS), []);
});

test('width: seat cap reached closes everything, even on an idle card', () => {
  assert.deepEqual(width(sense({ gpu: { state: 'idle' } }), DEFAULTS, 30, 0), { research: 0, build: 0, gpuProof: 0 });
});

test('width: pressure closes everything', () => {
  assert.deepEqual(width(sense({ gpu: { state: 'idle' }, pressure: ['disk'] }), DEFAULTS, 0, 0), { research: 0, build: 0, gpuProof: 0 });
});

test('width: an active or unknown operator gives research 1, build 0', () => {
  assert.deepEqual(width(sense({ operatorIdleS: 60 }), DEFAULTS, 0, 0), { research: 1, build: 0, gpuProof: 0 });
  assert.deepEqual(width(sense({ operatorIdleS: null }), DEFAULTS, 0, 0), { research: 1, build: 0, gpuProof: 0 });
  assert.equal(width(sense({ operatorIdleS: 1799 }), DEFAULTS, 0, 0).build, 0);
  assert.equal(width(sense({ operatorIdleS: 1800 }), DEFAULTS, 0, 0).build, 1);
});

test('width: GPU busy: research from the co-load budget, capped by attentionCap, floored at 0', () => {
  assert.equal(width(sense(), DEFAULTS, 0, 0).research, 5);
  assert.equal(width(sense(), DEFAULTS, 0, 15000).research, 3);
  assert.equal(width(sense(), DEFAULTS, 0, 14500).research, 3);
  assert.equal(width(sense(), DEFAULTS, 0, 18000).research, 0);
  assert.equal(width(sense(), DEFAULTS, 0, 30000).research, 0);
  assert.equal(width(sense(), loadPolicy({ coLoadBudgetMb: 100000 }), 0, 0).research, 5);
});

test('width: GPU busy: build 1 only when cpu is known and under 40', () => {
  assert.equal(width(sense({ cpuPct: 39.9 }), DEFAULTS, 0, 0).build, 1);
  assert.equal(width(sense({ cpuPct: 40 }), DEFAULTS, 0, 0).build, 0);
  assert.equal(width(sense({ cpuPct: null }), DEFAULTS, 0, 0).build, 0);
});

test('width: GPU idle: build up to 4, never over attentionCap, gpuProof 1', () => {
  assert.deepEqual(width(sense({ gpu: { state: 'idle' } }), DEFAULTS, 0, 0), { research: 5, build: 4, gpuProof: 1 });
  assert.equal(width(sense({ gpu: { state: 'idle' } }), loadPolicy({ attentionCap: 2 }), 0, 0).build, 2);
});

test('width: gpuProof is 1 only on idle', () => {
  for (const state of ['busy', 'settling', 'unknown', 'absent']) {
    assert.equal(width(sense({ gpu: { state } }), DEFAULTS, 0, 0).gpuProof, 0, state);
  }
});

test('width: settling and unknown do not widen build past the busy row', () => {
  for (const state of ['settling', 'unknown']) {
    assert.equal(width(sense({ gpu: { state } }), DEFAULTS, 0, 0).build, 1, state);
  }
});

test('decide: returns the wire shape, absent numerics as null and never 0', () => {
  const out = decide({ gpuReader: 'error', comfyReader: 'error' }, [], DEFAULTS, { now: T });
  assert.deepEqual(Object.keys(out), ['ts', 'cpuPct', 'availableMb', 'committedMb', 'commitLimitMb', 'pageReadsPerSec', 'diskFreeGb', 'operatorIdleS', 'gpu', 'canary', 'pressure', 'width']);
  assert.deepEqual(Object.keys(out.gpu), ['state', 'dwellS', 'utilPct', 'powerW', 'comfyRunning', 'comfyPending', 'ollamaLoaded', 'leaseHolder']);
  assert.equal(out.ts, iso(T));
  assert.equal(out.cpuPct, null);
  assert.equal(out.diskFreeGb, null);
  assert.equal(out.gpu.state, 'unknown');
  assert.equal(out.gpu.utilPct, null);
  assert.equal(out.gpu.comfyRunning, null);
  assert.equal(out.gpu.ollamaLoaded, null);
  assert.equal(out.canary, null);
});

test('decide: dwell carries through history and a gap restarts it', () => {
  const step = decide(quiet(), [{ ts: iso(T - 15000), pageReadsPerSec: 0, gpu: { state: 'settling', dwellS: 30 } }], DEFAULTS, { now: T });
  assert.equal(step.gpu.dwellS, 45);
  const gap = decide(quiet(), [{ ts: iso(T - 7200000), pageReadsPerSec: 0, gpu: { state: 'settling', dwellS: 290 } }], DEFAULTS, { now: T });
  assert.equal(gap.gpu.dwellS, 0);
  assert.equal(gap.gpu.state, 'settling');
});

test('decide: a lower gpuIdleDwellS from config is honoured', () => {
  const gpu = gpuStep(quiet(), prevAt(50), loadPolicy({ gpuIdleDwellS: 60 }), T);
  assert.equal(gpu.state, 'idle');
});
