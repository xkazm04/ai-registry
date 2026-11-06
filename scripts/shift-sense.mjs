#!/usr/bin/env node
/**
 * shift-sense - what is this machine doing right now, in the terms /shift decides on.
 *
 *   node scripts/shift-sense.mjs --json [--seats-mb <n>]
 *   node scripts/shift-sense.mjs --until <gpu-idle|pressure|operator-idle> --timeout <s> [--seats-mb <n>]
 *
 * ## Why it exists
 *
 * This box runs video jobs for days and owes its idle CPU and RAM to research. A long-lived
 * session cannot poll cheaply, so `--until` samples every 15 s and EXITS on the event: a
 * background run wakes the session. The decisions live in lib/shift-policy.mjs; this file
 * only reads, and every reader is isolated, because a dead tool must read as null or
 * `unknown` and never as a low number. A failed sensor that reads 0 % is a benchmark
 * submitted on top of somebody's render.
 *
 * ## Read-only, on purpose
 *
 * GET only against ComfyUI and Ollama: never /free, /interrupt or a POST. The lease is
 * queried with --status and never claimed. Card memory is not queried at all: it reads
 * 51 GB on an idle card, so it could only ever mislead.
 *
 * ## Measured choices (under a video job, 2026-11-06)
 *
 * A sample must stay under 3 s. PowerShell 5.1 takes 1.6-2 s just to start here, so a
 * one-shot script carrying Get-Counter and Add-Type took 3.9-8 s. Hence the counters come
 * from typeperf (1.6 s), free disk from statfs, and PowerShell only does GetLastInputInfo
 * (2.2-2.8 s); they run in parallel. execFile rather than spawnSync, for that reason. A
 * timed-out reader kills only its own child, and an operator reading lost to the budget is
 * null, which the width rule treats as an active operator: lower, never higher.
 *
 * /queue and /history are read for counts, times and prefixes and the payload is dropped.
 * max_items=12 is what a canary needs (6 clips of one batch) without paying for the rest.
 *
 * Exits: OK when it sampled or the wait ended (event or timeout, named in the JSON);
 * FATAL on a usage error or a broken config.json.
 */

import { execFile, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { EXIT, installCrashDoor } from './lib/exit-codes.mjs';
import { loadFleet } from './lib/projects.mjs';
import { clipPrefix, decide, loadPolicy } from './lib/shift-policy.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COMFY = 'http://127.0.0.1:8188';
const OLLAMA = 'http://127.0.0.1:11434';
const HISTORY_ITEMS = 12;
const INTERVAL_MS = 15000;
const ROTATE_BYTES = 20 * 1024 * 1024;
const TAIL_BYTES = 64 * 1024;
const HISTORY_KEEP = 40;
export const EVENTS = Object.freeze(['gpu-idle', 'pressure', 'operator-idle']);

/** Utilisation and power only. `-i 0` because the NPU is row 2. */
export const NVIDIA_ARGS = Object.freeze(['-i', '0', '--query-gpu=utilization.gpu,power.draw', '--format=csv,noheader,nounits']);
const COUNTERS = Object.freeze({
  cpuPct: '\\Processor(_Total)\\% Processor Time',
  availableMb: '\\Memory\\Available MBytes',
  committedBytes: '\\Memory\\Committed Bytes',
  commitLimitBytes: '\\Memory\\Commit Limit',
  pageReadsPerSec: '\\Memory\\Page Reads/sec',
});
const IDLE_SCRIPT = `Add-Type -TypeDefinition 'using System;using System.Runtime.InteropServices;public static class ShiftIdle{[StructLayout(LayoutKind.Sequential)]struct L{public uint s;public uint t;}[DllImport("user32.dll")]static extern bool GetLastInputInfo(ref L l);public static long Ms(){L l=new L();l.s=8;if(!GetLastInputInfo(ref l))return -1;return (long)(uint)((uint)Environment.TickCount-l.t);}}'
[ShiftIdle]::Ms()`;

const finite = (v) => {
  const n = typeof v === 'number' ? v : Number.parseFloat(v);
  return Number.isFinite(n) ? n : null;
};
const round1 = (v) => (v === null ? null : Math.round(v * 10) / 10);

// --- parsers: pure, each pinned by a fixture of real output ------------------------------------------

/** `96, 39.63`. `[N/A]` and error text parse to null, never 0. */
export function parseNvidia(stdout) {
  const [util, power] = String(stdout).trim().split(/\r?\n/)[0].split(',').map((s) => s.trim());
  const isNumber = (s) => /^\d+(\.\d+)?$/.test(s ?? '');
  return { utilPct: isNumber(util) ? Number(util) : null, powerW: isNumber(power) ? Number(power) : null };
}

const quoted = (line) => [...line.matchAll(/"([^"]*)"/g)].map((m) => m[1]);

/** typeperf's CSV: paths carry the host and locale, so columns are matched on the trailing counter name. */
export function parseTypeperf(stdout) {
  const lines = String(stdout).split(/\r?\n/);
  const at = lines.findIndex((l) => l.startsWith('"(PDH-CSV'));
  const nulls = { cpuPct: null, availableMb: null, committedMb: null, commitLimitMb: null, pageReadsPerSec: null };
  if (at < 0) return nulls;
  const header = quoted(lines[at]).map((h) => h.toLowerCase());
  const row = quoted(lines[at + 1] ?? '');
  const read = (key) => {
    const tail = COUNTERS[key].slice(COUNTERS[key].lastIndexOf('\\')).toLowerCase();
    const col = header.findIndex((h) => h.endsWith(tail));
    return col < 0 ? null : finite(row[col]);
  };
  const toMb = (bytes) => (bytes === null ? null : Math.round(bytes / 1048576));
  return {
    cpuPct: round1(read('cpuPct')),
    availableMb: read('availableMb'),
    committedMb: toMb(read('committedBytes')),
    commitLimitMb: toMb(read('commitLimitBytes')),
    pageReadsPerSec: round1(read('pageReadsPerSec')),
  };
}

const saveVideoPrefix = (graph) => {
  for (const node of Object.values(graph ?? {})) {
    if (node?.class_type === 'SaveVideo') return clipPrefix(node.inputs?.filename_prefix);
  }
  return null;
};

/** Counts, and the running job's batch and submit time. The graph is not kept. */
export function parseQueue(text) {
  const q = JSON.parse(text);
  if (!Array.isArray(q?.queue_running) || !Array.isArray(q?.queue_pending)) throw new TypeError('not a /queue payload');
  const running = q.queue_running[0];
  return {
    comfyRunning: q.queue_running.length,
    comfyPending: q.queue_pending.length,
    runningPrefix: running ? saveVideoPrefix(running[2]) : null,
    runningCreateMs: finite(running?.[3]?.create_time),
  };
}

/**
 * The newest job end of any outcome (dwell), and finished clips of SaveVideo jobs (canary).
 * Clip time is execution_start to execution_success, so time spent queued does not count.
 */
export function parseHistory(text) {
  const h = JSON.parse(text);
  if (h === null || typeof h !== 'object' || Array.isArray(h)) throw new TypeError('not a /history payload');
  let lastEndMs = null;
  const clips = [];
  for (const entry of Object.values(h)) {
    const messages = entry?.status?.messages ?? [];
    let start = null;
    let success = null;
    for (const [name, data] of messages) {
      const at = finite(data?.timestamp);
      if (at === null) continue;
      lastEndMs = lastEndMs === null ? at : Math.max(lastEndMs, at);
      if (name === 'execution_start') start = at;
      if (name === 'execution_success') success = at;
    }
    const prefix = saveVideoPrefix(entry?.prompt?.[2]);
    if (prefix && start !== null && success !== null) clips.push({ prefix, clipS: (success - start) / 1000, endMs: success });
  }
  return { lastEndMs, clips };
}

/** `lease.py --status --json`. A dead holder is no tenant; an expired heartbeat on a live pid still is. */
export function parseLease(stdout) {
  const st = JSON.parse(stdout);
  if (st === null || typeof st !== 'object' || !('holder' in st)) throw new TypeError('not a lease status');
  if (!st.holder || st.stale === 'holder-gone') return null;
  return st.holder.tenant ?? 'unnamed tenant';
}

/** seats.jsonl lines for the current local date. A line nobody can date does not count. */
export function countSeatsToday(text, now) {
  const day = (ms) => { const d = new Date(ms); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
  const today = day(now);
  let n = 0;
  for (const line of String(text).split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const { ts } = JSON.parse(line);
      const at = typeof ts === 'number' ? ts : Date.parse(ts);
      if (Number.isFinite(at) && day(at) === today) n += 1;
    } catch { /* a torn last line is not a seat */ }
  }
  return n;
}

// --- readers: each isolated, each failure null, never a throw ----------------------------------------

function exec(cmd, args, { timeoutMs, cwd } = {}) {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout: timeoutMs, cwd, windowsHide: true, encoding: 'utf8', maxBuffer: 1024 * 1024 }, (err, stdout) => {
      resolve({ ok: !err, missing: err?.code === 'ENOENT', stdout: stdout ?? '' });
    });
  });
}

function get(url, timeoutMs) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (r) => { if (!settled) { settled = true; resolve(r); } };
    const req = http.get(url, { agent: false, timeout: timeoutMs }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => done(res.statusCode === 200 ? { status: 'ok', body: Buffer.concat(chunks).toString('utf8') } : { status: 'error' }));
      res.on('error', () => done({ status: 'error' }));
    });
    const timer = setTimeout(() => { req.destroy(); done({ status: 'error' }); }, timeoutMs);
    timer.unref();
    req.on('timeout', () => { req.destroy(); done({ status: 'error' }); });
    req.on('error', (e) => done({ status: e.code === 'ECONNREFUSED' ? 'absent' : 'error' }));
  });
}

async function readNvidia(run) {
  const r = await run('nvidia-smi', [...NVIDIA_ARGS], { timeoutMs: 2500 });
  if (r.missing) return { gpuReader: 'absent', utilPct: null, powerW: null };
  if (!r.ok) return { gpuReader: 'error', utilPct: null, powerW: null };
  const parsed = parseNvidia(r.stdout);
  return { gpuReader: parsed.utilPct === null ? 'error' : 'ok', ...parsed };
}

async function readComfy(fetchText) {
  const down = (comfyReader) => ({
    comfyReader, comfyRunning: null, comfyPending: null, runningPrefix: null, runningStartMs: null,
    historyOk: false, lastEndMs: null, clips: [],
  });
  const [queue, history] = await Promise.all([
    fetchText(`${COMFY}/queue`, 2000),
    fetchText(`${COMFY}/history?max_items=${HISTORY_ITEMS}`, 2000),
  ]);
  if (queue.status !== 'ok') return down(queue.status);
  let q;
  try { q = parseQueue(queue.body); } catch { return down('error'); }
  let h = { historyOk: false, lastEndMs: null, clips: [] };
  if (history.status === 'ok') {
    try { h = { historyOk: true, ...parseHistory(history.body) }; } catch { /* stays not ok */ }
  }
  // One job at a time: a job submitted while another ran cannot have started before that one ended.
  const runningStartMs = q.runningCreateMs === null ? null : Math.max(q.runningCreateMs, h.lastEndMs ?? 0);
  return {
    comfyReader: 'ok', comfyRunning: q.comfyRunning, comfyPending: q.comfyPending,
    runningPrefix: q.runningPrefix, runningStartMs, ...h,
  };
}

/** Connection refused means no server, so nothing loaded. Anything else means we do not know. */
async function readOllama(fetchText) {
  const r = await fetchText(`${OLLAMA}/api/ps`, 1500);
  if (r.status === 'absent') return false;
  if (r.status !== 'ok') return null;
  try {
    const models = JSON.parse(r.body).models;
    return Array.isArray(models) ? models.length > 0 : null;
  } catch { return null; }
}

async function readCounters(run) {
  const r = await run('typeperf', [...Object.values(COUNTERS), '-sc', '1'], { timeoutMs: 2700 });
  return parseTypeperf(r.ok ? r.stdout : '');
}

async function readOperatorIdle(run) {
  const encoded = Buffer.from(IDLE_SCRIPT, 'utf16le').toString('base64');
  const r = await run('powershell', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded], { timeoutMs: 2800 });
  if (!r.ok) return null;
  const ms = finite(r.stdout.trim());
  return ms === null || ms < 0 ? null : Math.round(ms / 1000);
}

function readDiskFreeGb(root) {
  try {
    const s = fs.statfsSync(root);
    return Math.round((s.bavail * s.bsize) / 1e8) / 10;
  } catch { return null; }
}

/**
 * This machine's gravitone checkout, or null. A linked worktree has no .machine.local.json
 * (it is gitignored), so with no identity here the main checkout answers: "no fleet" in a
 * worktree must not read as "no lease on this machine".
 */
export function resolveGravitone(root, { load = loadFleet, mainRoot = mainCheckout } = {}) {
  let fleet = load(root);
  if (!fleet.machine) {
    const main = mainRoot(root);
    if (main && path.resolve(main) !== path.resolve(root)) fleet = load(main);
  }
  const project = fleet.projects?.gravitone;
  return project?.exists ? project.path : null;
}

function mainCheckout(root) {
  const r = spawnSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { cwd: root, encoding: 'utf8', windowsHide: true });
  return r.status === 0 ? path.dirname(r.stdout.trim()) : null;
}

/** Holder name or null, and whether we know. A checkout that cannot answer is not a free card. */
async function readLease(run, checkout) {
  if (!checkout) return { leaseHolder: null, leaseKnown: true };
  const r = await run('python', ['pipeline/gpu/lease.py', '--status', '--json'], { timeoutMs: 2500, cwd: checkout });
  if (!r.ok) return { leaseHolder: null, leaseKnown: false };
  try { return { leaseHolder: parseLease(r.stdout), leaseKnown: true }; } catch { return { leaseHolder: null, leaseKnown: false }; }
}

/** One raw sample for decide(). `checkout` is resolved once by the caller: the fleet does not move mid-wait. */
export async function readSample({ root = ROOT, checkout = null, run = exec, fetchText = get } = {}) {
  const [nvidia, comfy, ollamaLoaded, counters, operatorIdleS, lease] = await Promise.all([
    readNvidia(run), readComfy(fetchText), readOllama(fetchText), readCounters(run), readOperatorIdle(run), readLease(run, checkout),
  ]);
  return { ...counters, diskFreeGb: readDiskFreeGb(root), operatorIdleS, ...nvidia, ...comfy, ollamaLoaded, ...lease };
}

// --- state files -------------------------------------------------------------------------------------

export function readTail(file, bytes = TAIL_BYTES) {
  let fd;
  try {
    fd = fs.openSync(file, 'r');
    const { size } = fs.fstatSync(fd);
    const length = Math.min(size, bytes);
    const buf = Buffer.alloc(length);
    fs.readSync(fd, buf, 0, length, size - length);
    const lines = buf.toString('utf8').split('\n');
    if (size > length) lines.shift();
    const records = [];
    for (const line of lines) {
      if (!line.trim()) continue;
      try { records.push(JSON.parse(line)); } catch { /* a torn line is not a record */ }
    }
    return records;
  } catch { return []; } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

/** Append one record, rotating first when it would cross the limit. Keeps exactly one `.1`. */
export function appendSense(file, record, limit = ROTATE_BYTES) {
  const line = `${JSON.stringify(record)}\n`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let size = 0;
  try { size = fs.statSync(file).size; } catch { /* first write */ }
  if (size > 0 && size + Buffer.byteLength(line) > limit) fs.renameSync(file, `${file}.1`);
  fs.appendFileSync(file, line);
}

export function eventFired(name, sense, policy) {
  if (name === 'gpu-idle') return sense.gpu.state === 'idle';
  if (name === 'pressure') return sense.pressure.length > 0;
  if (name === 'operator-idle') return sense.operatorIdleS !== null && sense.operatorIdleS >= policy.operatorIdleMin * 60;
  throw new TypeError(`unknown event ${name}`);
}

const readSeats = (stateDir, now) => {
  try { return countSeatsToday(fs.readFileSync(path.join(stateDir, 'seats.jsonl'), 'utf8'), now); } catch { return 0; }
};

/**
 * The wait loop, with its clock and readers injected. A record that cannot be written is
 * reported and the wait goes on: losing the log must not lose the wake-up.
 */
export async function runUntil({ event, timeoutS, stateDir, policy, seatsMb = 0, sample, clock = Date.now, sleep = delay, intervalMs = INTERVAL_MS, warn = () => {} }) {
  const file = path.join(stateDir, 'sense.jsonl');
  const history = readTail(file);
  const deadline = clock() + timeoutS * 1000;
  for (;;) {
    const raw = await sample();
    const now = clock();
    const sense = decide(raw, history, policy, { now, seatsToday: readSeats(stateDir, now), shiftSeatsMb: seatsMb });
    try { appendSense(file, sense); } catch (e) { warn(`shift-sense: could not write ${file}: ${e.message}`); }
    history.push(sense);
    if (history.length > HISTORY_KEEP) history.shift();
    if (eventFired(event, sense, policy)) return { ...sense, event };
    const left = deadline - clock();
    if (left <= 0) return { ...sense, event: 'timeout' };
    await sleep(Math.min(intervalMs, left));
  }
}

const delay = (ms) => new Promise((r) => { setTimeout(r, ms); });

function parseArgs(argv) {
  const opts = { json: false, until: null, timeoutS: null, seatsMb: 0 };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--json') opts.json = true;
    else if (a === '--until') opts.until = argv[++i];
    else if (a === '--timeout') opts.timeoutS = Number(argv[++i]);
    else if (a === '--seats-mb') opts.seatsMb = Number(argv[++i]);
    else return { error: `unknown argument ${a}` };
  }
  if (opts.until !== null) {
    if (!EVENTS.includes(opts.until)) return { error: `--until takes one of ${EVENTS.join(', ')}` };
    if (!Number.isFinite(opts.timeoutS) || opts.timeoutS <= 0) return { error: '--until needs --timeout <seconds>' };
  } else if (!opts.json) return { error: 'expected --json or --until' };
  if (!Number.isFinite(opts.seatsMb) || opts.seatsMb < 0) return { error: '--seats-mb takes a number of MB' };
  return opts;
}

async function main() {
  installCrashDoor('shift-sense.mjs');
  const opts = parseArgs(process.argv.slice(2));
  if (opts.error) {
    console.error(`shift-sense: ${opts.error}`);
    console.error('usage: shift-sense.mjs --json | --until <gpu-idle|pressure|operator-idle> --timeout <s> [--seats-mb <n>]');
    process.exitCode = EXIT.FATAL;
    return;
  }
  const stateDir = path.join(ROOT, '.ai', 'shift');
  let policy;
  try {
    const configFile = path.join(stateDir, 'config.json');
    policy = loadPolicy(fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, 'utf8')) : {});
  } catch (e) {
    console.error(`shift-sense: .ai/shift/config.json: ${e.message}`);
    process.exitCode = EXIT.FATAL;
    return;
  }
  const checkout = resolveGravitone(ROOT);
  const sample = () => readSample({ root: ROOT, checkout });
  let out;
  if (opts.until) {
    out = await runUntil({
      event: opts.until, timeoutS: opts.timeoutS, stateDir, policy, seatsMb: opts.seatsMb, sample,
      warn: (m) => console.error(m),
    });
  } else {
    const raw = await sample();
    const now = Date.now();
    out = decide(raw, readTail(path.join(stateDir, 'sense.jsonl')), policy, { now, seatsToday: readSeats(stateDir, now), shiftSeatsMb: opts.seatsMb });
  }
  console.log(JSON.stringify(out));
  process.exitCode = EXIT.OK;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();
