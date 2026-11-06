// Tests for scripts/shift-sense.mjs: the parsers against output captured from a live box,
// the isolation of each reader, and the wait loop on an injected clock. Nothing here
// contacts ComfyUI, Ollama or the GPU: every process and socket is a fixture.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { DEFAULTS, loadPolicy } from '../lib/shift-policy.mjs';
import {
  NVIDIA_ARGS, appendSense, countSeatsToday, eventFired, openingEvent, parseHistory, parseLease, parseNvidia, parseQueue,
  parseTypeperf, readSample, readTail, resolveGravitone, runUntil, seatContext,
} from '../shift-sense.mjs';

const SCRIPT = fileURLToPath(new URL('../shift-sense.mjs', import.meta.url));

function tempDir(t) {
  const dir = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'shift-sense-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

// Shapes captured from ComfyUI during a video job, graphs trimmed to the node that matters.
const graph = (prefix) => ({ 92: { class_type: 'SaveVideo', inputs: { filename_prefix: prefix } }, 7: { class_type: 'KSampler', inputs: {} } });
const entry = (prefix, start, end, outcome = 'execution_success') => ({
  prompt: [41, 'id', graph(prefix), { client_id: 'c', create_time: start - 5 }, ['92']],
  outputs: {},
  status: {
    status_str: outcome === 'execution_success' ? 'success' : 'error',
    completed: outcome === 'execution_success',
    messages: [
      ['execution_start', { prompt_id: 'id', timestamp: start }],
      ['execution_cached', { nodes: [], prompt_id: 'id', timestamp: start + 17 }],
      [outcome, { prompt_id: 'id', timestamp: end }],
    ],
  },
  meta: {},
});

test('parseNvidia reads utilisation and power; [N/A] and error text are null, never 0', () => {
  assert.deepEqual(parseNvidia('96, 39.63\r\n'), { utilPct: 96, powerW: 39.63 });
  assert.deepEqual(parseNvidia('5, [N/A]\n'), { utilPct: 5, powerW: null });
  assert.deepEqual(parseNvidia('[Unknown Error], [Unknown Error]'), { utilPct: null, powerW: null });
  assert.deepEqual(parseNvidia('NVIDIA-SMI has failed'), { utilPct: null, powerW: null });
  assert.deepEqual(parseNvidia(''), { utilPct: null, powerW: null });
});

test('trap 3: card memory and vram_free are not even read', () => {
  const asked = NVIDIA_ARGS.join(' ');
  assert.match(asked, /-i 0/);
  assert.match(asked, /utilization\.gpu,power\.draw/);
  assert.doesNotMatch(asked, /memory/);
});

const TYPEPERF = [
  '',
  '"(PDH-CSV 4.0)","\\\\ARCHEMOND\\Processor(_Total)\\% Processor Time","\\\\ARCHEMOND\\Memory\\Available MBytes","\\\\ARCHEMOND\\Memory\\Committed Bytes","\\\\ARCHEMOND\\Memory\\Commit Limit","\\\\ARCHEMOND\\Memory\\Page Reads/sec"',
  '"11/06/2026 13:13:14.843","12.311448","41469.000000","90292633600.000000","165519564800.000000","0.986660"',
  'Exiting, please wait...',
  'The command completed successfully.',
].join('\r\n');

test('parseTypeperf matches on the trailing counter name, not the host prefix', () => {
  assert.deepEqual(parseTypeperf(TYPEPERF), { cpuPct: 12.3, availableMb: 41469, committedMb: 86110, commitLimitMb: 157852, pageReadsPerSec: 1 });
  assert.equal(parseTypeperf(TYPEPERF.replaceAll('ARCHEMOND', 'other-box')).availableMb, 41469);
});

test('parseTypeperf gives null for a blank column and for no output at all', () => {
  const blank = TYPEPERF.replace('"0.986660"', '" "');
  assert.equal(parseTypeperf(blank).pageReadsPerSec, null);
  assert.equal(parseTypeperf(blank).availableMb, 41469);
  assert.deepEqual(parseTypeperf(''), { cpuPct: null, availableMb: null, committedMb: null, commitLimitMb: null, pageReadsPerSec: null });
});

test('parseQueue counts and names the running batch', () => {
  const running = [49, 'id', graph('gravitone/mc-h3-OR03'), { client_id: 'c', create_time: 1793966804518 }, ['92']];
  assert.deepEqual(parseQueue(JSON.stringify({ queue_running: [running], queue_pending: [] })), {
    comfyRunning: 1, comfyPending: 0, runningPrefix: 'mc-h3', runningCreateMs: 1793966804518,
  });
  assert.deepEqual(parseQueue('{"queue_running":[],"queue_pending":[]}'), { comfyRunning: 0, comfyPending: 0, runningPrefix: null, runningCreateMs: null });
  assert.throws(() => parseQueue('{}'));
});

test('parseHistory: clip time is start to success; the newest end counts any outcome', () => {
  const out = parseHistory(JSON.stringify({
    a: entry('gravitone/mc-h3-OR05', 1000000, 1462000),
    b: entry('gravitone/mc-h3-SS05', 1500000, 1600000, 'execution_error'),
  }));
  assert.deepEqual(out.clips, [{ prefix: 'mc-h3', clipS: 462, endMs: 1462000 }]);
  assert.equal(out.lastEndMs, 1600000);
});

test('parseHistory: an image job has an end but no clip; an empty history has neither', () => {
  const still = entry('x', 1000, 2000);
  still.prompt[2] = { 9: { class_type: 'SaveImage', inputs: { filename_prefix: 'intake/p0-s101' } } };
  assert.deepEqual(parseHistory(JSON.stringify({ a: still })), { lastEndMs: 2000, clips: [] });
  assert.deepEqual(parseHistory('{}'), { lastEndMs: null, clips: [] });
});

test('parseLease: real shapes for free, held, a dead holder and an expired heartbeat', () => {
  assert.equal(parseLease('{"holder": null, "stale": null, "queue": [], "reclaims": 4}'), null);
  const held = (stale) => JSON.stringify({ holder: { tenant: 'trailer-day-run', engine: 'comfy', pid: 7 }, stale, queue: [], reclaims: 4 });
  assert.equal(parseLease(held(null)), 'trailer-day-run');
  assert.equal(parseLease(held('holder-gone')), null);
  assert.equal(parseLease(held('heartbeat-expired')), 'trailer-day-run');
  assert.throws(() => parseLease('{}'));
  assert.throws(() => parseLease('gpu lease: free'));
});

test('countSeatsToday counts the current local date only and survives torn lines', () => {
  const now = new Date(2026, 10, 6, 12, 0).getTime();
  const lines = [
    JSON.stringify({ ts: new Date(2026, 10, 6, 0, 1).toISOString(), kind: 'research' }),
    JSON.stringify({ ts: new Date(2026, 10, 6, 23, 59).getTime(), kind: 'build' }),
    JSON.stringify({ ts: new Date(2026, 10, 5, 23, 59).toISOString(), kind: 'research' }),
    JSON.stringify({ kind: 'no timestamp' }),
    '{"ts":"2026-11',
    '',
  ].join('\n');
  assert.equal(countSeatsToday(lines, now), 2);
  assert.equal(countSeatsToday('', now), 0);
});

const healthyRun = (over = {}) => async (cmd, args) => {
  if (over[cmd]) return over[cmd];
  if (cmd === 'nvidia-smi') { assert.deepEqual(args, [...NVIDIA_ARGS]); return { ok: true, stdout: '1, 2.0\n' }; }
  if (cmd === 'typeperf') return { ok: true, stdout: TYPEPERF };
  if (cmd === 'powershell') return { ok: true, stdout: '7200000\r\n' };
  if (cmd === 'python') return { ok: true, stdout: '{"holder": null, "stale": null, "queue": [], "reclaims": 0}' };
  throw new Error(`unexpected ${cmd}`);
};
const healthyFetch = (over = {}) => async (url) => {
  const key = Object.keys(over).find((k) => url.includes(k));
  if (key) return over[key];
  if (url.includes('/queue')) return { status: 'ok', body: '{"queue_running":[],"queue_pending":[]}' };
  if (url.includes('/history')) return { status: 'ok', body: '{}' };
  if (url.includes('/api/ps')) return { status: 'ok', body: '{"models":[]}' };
  throw new Error(`unexpected ${url}`);
};

test('readers: only GET-style reads reach the injected fetch, and /history is bounded', async () => {
  const urls = [];
  const spy = async (url) => { urls.push(url); return healthyFetch()(url); };
  await readSample({ run: healthyRun(), fetchText: spy });
  assert.ok(urls.some((u) => /\/history\?max_items=\d+$/.test(u)));
  assert.ok(!urls.some((u) => /\/free|\/interrupt|\/prompt/.test(u)));
});

test('readers: a healthy box gives a clean sample', async () => {
  const s = await readSample({ run: healthyRun(), fetchText: healthyFetch(), checkout: 'somewhere' });
  assert.equal(s.gpuReader, 'ok');
  assert.equal(s.comfyReader, 'ok');
  assert.equal(s.historyOk, true);
  assert.equal(s.ollamaLoaded, false);
  assert.equal(s.leaseKnown, true);
  assert.equal(s.operatorIdleS, 7200);
  assert.equal(s.availableMb, 41469);
});

test('readers: a missing nvidia-smi is absent; a failing one is error; neither reads 0', async () => {
  const missing = await readSample({ run: healthyRun({ 'nvidia-smi': { ok: false, missing: true, stdout: '' } }), fetchText: healthyFetch() });
  assert.equal(missing.gpuReader, 'absent');
  assert.equal(missing.utilPct, null);
  const failing = await readSample({ run: healthyRun({ 'nvidia-smi': { ok: false, stdout: '' } }), fetchText: healthyFetch() });
  assert.equal(failing.gpuReader, 'error');
  assert.equal(failing.utilPct, null);
  const garbage = await readSample({ run: healthyRun({ 'nvidia-smi': { ok: true, stdout: 'Failed to initialize NVML' } }), fetchText: healthyFetch() });
  assert.equal(garbage.gpuReader, 'error');
});

test('readers: refused ComfyUI is absent, a timeout or junk is error, and each isolates', async () => {
  const refused = await readSample({ run: healthyRun(), fetchText: healthyFetch({ '/queue': { status: 'absent' }, '/history': { status: 'absent' } }) });
  assert.equal(refused.comfyReader, 'absent');
  assert.equal(refused.comfyRunning, null);
  assert.equal(refused.gpuReader, 'ok');
  const junk = await readSample({ run: healthyRun(), fetchText: healthyFetch({ '/queue': { status: 'ok', body: '<html>' } }) });
  assert.equal(junk.comfyReader, 'error');
  const noHistory = await readSample({ run: healthyRun(), fetchText: healthyFetch({ '/history': { status: 'error' } }) });
  assert.equal(noHistory.comfyReader, 'ok');
  assert.equal(noHistory.historyOk, false);
});

test('readers: Ollama refused means nothing loaded; a timeout means we do not know', async () => {
  const refused = await readSample({ run: healthyRun(), fetchText: healthyFetch({ '/api/ps': { status: 'absent' } }) });
  assert.equal(refused.ollamaLoaded, false);
  const timeout = await readSample({ run: healthyRun(), fetchText: healthyFetch({ '/api/ps': { status: 'error' } }) });
  assert.equal(timeout.ollamaLoaded, null);
  const loaded = await readSample({ run: healthyRun(), fetchText: healthyFetch({ '/api/ps': { status: 'ok', body: '{"models":[{"name":"m"}]}' } }) });
  assert.equal(loaded.ollamaLoaded, true);
});

test('readers: no gravitone here is no lease and no error; a failing lease.py is not known', async () => {
  const none = await readSample({ run: healthyRun(), fetchText: healthyFetch(), checkout: null });
  assert.deepEqual([none.leaseHolder, none.leaseKnown], [null, true]);
  const failed = await readSample({ run: healthyRun({ python: { ok: false, stdout: '' } }), fetchText: healthyFetch(), checkout: 'x' });
  assert.deepEqual([failed.leaseHolder, failed.leaseKnown], [null, false]);
  const junk = await readSample({ run: healthyRun({ python: { ok: true, stdout: 'Traceback' } }), fetchText: healthyFetch(), checkout: 'x' });
  assert.equal(junk.leaseKnown, false);
});

test('readers: failed counters and a lost operator reading are null, never 0', async () => {
  const s = await readSample({
    run: healthyRun({ typeperf: { ok: false, stdout: '' }, powershell: { ok: false, stdout: '' } }),
    fetchText: healthyFetch(),
  });
  for (const key of ['cpuPct', 'availableMb', 'committedMb', 'commitLimitMb', 'pageReadsPerSec', 'operatorIdleS']) {
    assert.equal(s[key], null, key);
  }
  const negative = await readSample({ run: healthyRun({ powershell: { ok: true, stdout: '-1' } }), fetchText: healthyFetch() });
  assert.equal(negative.operatorIdleS, null);
});

test('resolveGravitone: no entry on this machine is null without error', () => {
  const load = () => ({ machine: 'Lynx', projects: {} });
  assert.equal(resolveGravitone('r', { load }), null);
  assert.equal(resolveGravitone('r', { load: () => ({ machine: 'Lynx', projects: { gravitone: { exists: false, path: 'p' } } }) }), null);
});

test('resolveGravitone: a worktree with no machine identity asks the main checkout', () => {
  const load = (root) => (root === 'main'
    ? { machine: 'Lynx', projects: { gravitone: { exists: true, path: 'grav' } } }
    : { machine: null, projects: {} });
  assert.equal(resolveGravitone('wt', { load, mainRoot: () => 'main' }), 'grav');
  assert.equal(resolveGravitone('wt', { load, mainRoot: () => null }), null);
});

test('appendSense rotates past the limit and keeps exactly one .1', (t) => {
  const dir = tempDir(t);
  const file = path.join(dir, 'state', 'sense.jsonl');
  appendSense(file, { n: 1 }, 20);
  appendSense(file, { n: 2 }, 20);
  assert.equal(fs.existsSync(`${file}.1`), false);
  appendSense(file, { n: 3 }, 20);
  assert.deepEqual(readTail(`${file}.1`), [{ n: 1 }, { n: 2 }]);
  assert.deepEqual(readTail(file), [{ n: 3 }]);
  appendSense(file, { n: 4 }, 20);
  appendSense(file, { n: 5 }, 20);
  assert.deepEqual(readTail(`${file}.1`), [{ n: 3 }, { n: 4 }]);
  assert.deepEqual(readTail(file), [{ n: 5 }]);
  assert.deepEqual(fs.readdirSync(path.dirname(file)).sort(), ['sense.jsonl', 'sense.jsonl.1']);
});

test('readTail: a missing file is empty; a window into a large file drops the torn line', (t) => {
  const dir = tempDir(t);
  assert.deepEqual(readTail(path.join(dir, 'none')), []);
  const file = path.join(dir, 'f');
  fs.writeFileSync(file, `${JSON.stringify({ a: 'x'.repeat(100) })}\n{"b":1}\n{"torn`);
  assert.deepEqual(readTail(file, 20), [{ b: 1 }]);
});

test('eventFired names each event; a null operator reading never fires operator-idle', () => {
  const base = { gpu: { state: 'busy' }, pressure: [], operatorIdleS: null };
  assert.equal(eventFired('gpu-idle', base, DEFAULTS), false);
  assert.equal(eventFired('gpu-idle', { ...base, gpu: { state: 'idle' } }, DEFAULTS), true);
  assert.equal(eventFired('pressure', { ...base, pressure: ['disk'] }, DEFAULTS), true);
  assert.equal(eventFired('operator-idle', base, DEFAULTS), false);
  assert.equal(eventFired('operator-idle', { ...base, operatorIdleS: 1800 }, DEFAULTS), true);
});

const quietRaw = {
  gpuReader: 'ok', comfyReader: 'ok', historyOk: true, utilPct: 1, powerW: 2, comfyRunning: 0, comfyPending: 0,
  lastEndMs: null, clips: [], ollamaLoaded: false, leaseHolder: null, leaseKnown: true, operatorIdleS: 7200,
};
const fakeTime = (start = Date.parse('2026-11-06T12:00:00Z')) => {
  let at = start;
  return { clock: () => at, sleep: async (ms) => { at += ms; } };
};

test('runUntil: times out with event timeout after the deadline and writes sense.jsonl', async (t) => {
  const stateDir = tempDir(t);
  const { clock, sleep } = fakeTime();
  const start = clock();
  const out = await runUntil({
    event: 'gpu-idle', timeoutS: 30, stateDir, policy: DEFAULTS, clock, sleep,
    sample: async () => ({ ...quietRaw, comfyRunning: 1 }),
  });
  assert.equal(out.event, 'timeout');
  assert.equal(out.gpu.state, 'busy');
  assert.equal(clock() - start, 30000);
  const records = readTail(path.join(stateDir, 'sense.jsonl'));
  assert.equal(records.length, 3);
  assert.ok(!('event' in records[0]));
});

test('runUntil: exits on the event: a quiet card dwells through 15 s samples to idle', async (t) => {
  const stateDir = tempDir(t);
  const { clock, sleep } = fakeTime();
  const start = clock();
  const out = await runUntil({ event: 'gpu-idle', timeoutS: 3600, stateDir, policy: DEFAULTS, clock, sleep, sample: async () => quietRaw });
  assert.equal(out.event, 'gpu-idle');
  assert.equal(out.gpu.state, 'idle');
  assert.equal(out.gpu.dwellS, 300);
  assert.equal(clock() - start, 300000);
});

test('runUntil: resumes dwell from a recent sense.jsonl, and counts seats from seats.jsonl', async (t) => {
  const stateDir = tempDir(t);
  const { clock, sleep } = fakeTime();
  fs.writeFileSync(path.join(stateDir, 'sense.jsonl'), `${JSON.stringify({ ts: new Date(clock() - 15000).toISOString(), gpu: { state: 'settling', dwellS: 100 } })}\n`);
  fs.writeFileSync(path.join(stateDir, 'seats.jsonl'), `${JSON.stringify({ ts: clock(), kind: 'research' })}\n`.repeat(30));
  const out = await runUntil({ event: 'operator-idle', timeoutS: 30, stateDir, policy: DEFAULTS, clock, sleep, sample: async () => quietRaw });
  assert.equal(out.event, 'operator-idle');
  assert.equal(out.gpu.dwellS, 115);
  assert.deepEqual(out.width, { research: 0, build: 0, gpuProof: 0 });
});

test('runUntil: a log that cannot be written is reported and the wait still ends', async (t) => {
  const dir = tempDir(t);
  const blocked = path.join(dir, 'file-not-dir');
  fs.writeFileSync(blocked, 'x');
  const warned = [];
  const { clock, sleep } = fakeTime();
  const out = await runUntil({
    event: 'pressure', timeoutS: 1, stateDir: blocked, policy: loadPolicy({}), clock, sleep,
    sample: async () => ({ ...quietRaw, diskFreeGb: 1 }), warn: (m) => warned.push(m),
  });
  assert.equal(out.event, 'pressure');
  assert.equal(warned.length, 1);
});

const roomy = { ...quietRaw, cpuPct: 10, availableMb: 40000 };
const script = (samples) => {
  let i = 0;
  return async () => samples[Math.min(i++, samples.length - 1)];
};
const untilOpening = (stateDir, samples, timeoutS = 60) => runUntil({
  event: 'opening', timeoutS, stateDir, policy: DEFAULTS, ...fakeTime(), sample: script(samples),
});

test('opening: nothing changing against the first sample is a timeout, even with the card already idle', async (t) => {
  assert.equal((await untilOpening(tempDir(t), [{ ...roomy, comfyRunning: 1 }])).event, 'timeout');
  const dir = tempDir(t);
  const stamp = new Date(Date.parse('2026-11-06T12:00:00Z') - 15000).toISOString();
  fs.writeFileSync(path.join(dir, 'sense.jsonl'), `${JSON.stringify({ ts: stamp, gpu: { state: 'idle', dwellS: 400 } })}\n`);
  const out = await untilOpening(dir, [roomy]);
  assert.equal(out.gpu.state, 'idle');
  assert.equal(out.event, 'timeout');
});

test('opening: a lane rising is width-up', async (t) => {
  const out = await untilOpening(tempDir(t), [{ ...roomy, comfyRunning: 1, operatorIdleS: 60 }, { ...roomy, comfyRunning: 1, operatorIdleS: 1800 }]);
  assert.equal(out.event, 'width-up');
  assert.equal(out.width.research, 5);
});

test('opening: a lane falling is no event', async (t) => {
  const out = await untilOpening(tempDir(t), [{ ...roomy, comfyRunning: 1 }, { ...roomy, comfyRunning: 1, operatorIdleS: 60 }], 30);
  assert.equal(out.event, 'timeout');
  assert.equal(out.width.research, 3);
});

test('opening: the GPU reaching idle is gpu-idle', async (t) => {
  const out = await runUntil({ event: 'opening', timeoutS: 3600, stateDir: tempDir(t), policy: DEFAULTS, ...fakeTime(), sample: async () => roomy });
  assert.equal(out.event, 'gpu-idle');
  assert.equal(out.gpu.state, 'idle');
});

test('opening: pressure appearing is pressure, and pressure clearing is pressure-cleared', async (t) => {
  const appeared = await untilOpening(tempDir(t), [roomy, { ...roomy, diskFreeGb: 1 }]);
  assert.equal(appeared.event, 'pressure');
  const cleared = await untilOpening(tempDir(t), [{ ...roomy, diskFreeGb: 1 }, roomy]);
  assert.equal(cleared.event, 'pressure-cleared', 'named over the width rise it causes');
});

test('openingEvent compares against the first sample only', () => {
  const s = (over = {}) => ({ pressure: [], gpu: { state: 'busy' }, width: { research: 3, build: 0, gpuProof: 0 }, ...over });
  assert.equal(openingEvent(s(), s()), null);
  assert.equal(openingEvent(s({ pressure: ['disk'] }), s({ pressure: ['canary'] })), null, 'still under pressure');
  assert.equal(openingEvent(s(), s({ width: { research: 3, build: 1, gpuProof: 0 } })), 'width-up');
  assert.equal(openingEvent(s({ gpu: { state: 'idle' } }), s({ gpu: { state: 'idle' } })), null);
});

const led = (kind, key, startedAt) => `${JSON.stringify({ key, kind, cluster: null, startedAt })}\n`;

test('seats default to the running ledger: research 1000, build 3400, proof 0, stale none', (t) => {
  const dir = tempDir(t);
  const now = Date.parse('2026-11-06T12:00:00Z');
  const fresh = new Date(now - 60000).toISOString();
  const old = new Date(now - 7 * 3600 * 1000).toISOString();
  assert.deepEqual(seatContext(dir, now), { shiftSeatsMb: 0 }, 'no ledger is no seats');
  fs.writeFileSync(path.join(dir, 'running.jsonl'), led('miner', 'v1', fresh) + led('builder', 'b', fresh) + led('proof', 'proof:r', fresh) + led('miner', 'v2', old));
  assert.deepEqual(seatContext(dir, now), { shiftSeatsMb: 4400 });
  assert.deepEqual(seatContext(dir, now, 0), { shiftSeatsMb: 0 }, 'an explicit value wins, zero included');
  assert.deepEqual(seatContext(dir, now, 9000), { shiftSeatsMb: 9000 });
});

test('an unreadable ledger arms the canary: failure is not low', (t) => {
  const dir = tempDir(t);
  fs.writeFileSync(path.join(dir, 'running.jsonl'), '{"torn');
  const warned = [];
  assert.deepEqual(seatContext(dir, Date.now(), null, (m) => warned.push(m)), { shiftSeatsMb: 0, seatsActive: true });
  assert.equal(warned.length, 1);
});

test('runUntil: the canary fires from ledger seats, with no --seats-mb, and re-reads the ledger each sample', async (t) => {
  const dir = tempDir(t);
  const { clock, sleep } = fakeTime();
  const T0 = clock();
  const slow = { ...roomy, comfyRunning: 1, runningPrefix: 'mc-h3', clips: [400, 400, 400, 400, 400, 524].map((clipS, i) => ({ prefix: 'mc-h3', clipS, endMs: T0 - (6 - i) * 500000 })) };
  const quietOut = await runUntil({ event: 'pressure', timeoutS: 1, stateDir: dir, policy: DEFAULTS, clock, sleep, sample: async () => slow });
  assert.equal(quietOut.event, 'timeout', 'no seat of ours: not our pressure');
  fs.writeFileSync(path.join(dir, 'running.jsonl'), led('miner', 'v1', new Date(clock()).toISOString()));
  const out = await runUntil({ event: 'pressure', timeoutS: 1, stateDir: dir, policy: DEFAULTS, clock, sleep, sample: async () => slow });
  assert.equal(out.event, 'pressure');
  assert.ok(out.pressure.includes('canary'));
});

const cli = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8', timeout: 10000 });

test('CLI: usage errors exit FATAL before any sampling', () => {
  for (const args of [[], ['--nope'], ['--until', 'noon', '--timeout', '5'], ['--until', 'gpu-idle'], ['--until', 'gpu-idle', '--timeout', 'x'], ['--json', '--seats-mb', '-1']]) {
    const r = cli(...args);
    assert.equal(r.status, 2, args.join(' '));
    assert.match(r.stderr, /shift-sense:/);
    assert.equal(r.stdout, '');
  }
});
