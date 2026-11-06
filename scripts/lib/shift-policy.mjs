/**
 * shift-policy - the pure decisions behind /shift's sensor: is the GPU really free, is
 * the box under pressure, how many seats may run.
 *
 * ## Why this is separate from the readers
 *
 * The harm this file guards against is a false idle: a benchmark submitted into the gap
 * between two clips of somebody's multi-day video job. Every trap that produces one was
 * measured on the box this was built for, and each must stay a test fixture, so nothing
 * here touches a clock, a process or a socket. scripts/shift-sense.mjs does the reading.
 *
 * ## The rules that are not obvious
 *
 * - No duration proves idle (real gaps between jobs ran 1 s to 4 h). Idle is a dwell over
 *   ALL low signals, and any positive evidence of a tenant resets it.
 * - The queue outranks utilisation: TRELLIS runs at 12 % util for 28 s with a running job.
 * - Card memory is not an input. It reads 51 GB on an idle card holding cached models.
 * - Failure is not low. A reader that failed yields null and the state `unknown`, which
 *   never advances dwell and never reads as idle. Time nobody observed proves nothing, so
 *   the first clean sample after `unknown`, or after a sampling gap, restarts dwell at 0.
 * - Resources only LOWER the width. The attention cap is the Director's bound on how much
 *   work can be reviewed, and must never be derived from free RAM (docs of /harvest,
 *   backlog.md). All numbers are starting values, unmeasured for this mix; the canary is
 *   what makes them falsifiable.
 */

export const DEFAULTS = Object.freeze({
  maxSeatsPerDay: 30,
  attentionCap: 5,
  operatorIdleMin: 30,
  gpuIdleDwellS: 300,
  reviewCapGb: 5,
  minFreeDiskGb: 100,
  pageReadsPressure: 500,
  availableFloorMb: 12000,
  coLoadBudgetMb: 18000,
});

export const UTIL_BUSY_PCT = 15;
export const POWER_BUSY_W = 5;
/** A longer hole between samples than this is unobserved time: dwell restarts. */
export const MAX_DWELL_GAP_S = 60;
export const PAGE_READS_SUSTAIN_S = 120;
export const COMMIT_FRACTION = 0.9;
export const CANARY_RATIO = 1.3;
export const CANARY_WINDOW = 5;
export const CANARY_MIN_PRIOR = 3;
export const BUILD_WIDTH_IDLE = 4;
export const BUILD_CPU_CEILING_PCT = 40;

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** Config over DEFAULTS. A typo'd or non-numeric key throws: silently using a default would hide it. */
export function loadPolicy(partial = {}) {
  if (partial === null || typeof partial !== 'object' || Array.isArray(partial)) {
    throw new TypeError('shift policy: config must be an object');
  }
  const out = { ...DEFAULTS };
  for (const [key, value] of Object.entries(partial)) {
    if (!Object.hasOwn(DEFAULTS, key)) throw new TypeError(`shift policy: unknown key "${key}"`);
    if (num(value) === null) throw new TypeError(`shift policy: "${key}" must be a number`);
    out[key] = value;
  }
  return Object.freeze(out);
}

/**
 * The comparison group of a clip, from a SaveVideo node's `filename_prefix`.
 *
 * Real values look like `gravitone/mc-h3-OR05`, `gravitone/mc-film3-K01`,
 * `gravitone/mc-lab-A`: a folder, then a batch name, then one clip id. Clips of one batch
 * are comparable and clips of different batches are not (H3 412-502 s, LTX 6-8 min). So:
 * take the part after the last slash, then drop the last `-` segment (`mc-h3`, `mc-film3`,
 * `mc-lab`). A stem with no `-` has no clip id to remove and is its own group.
 */
export function clipPrefix(filenamePrefix) {
  if (typeof filenamePrefix !== 'string' || !filenamePrefix.trim()) return null;
  const stem = filenamePrefix.trim().split(/[\\/]/).pop();
  if (!stem) return null;
  const cut = stem.lastIndexOf('-');
  return cut > 0 ? stem.slice(0, cut) : stem;
}

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** A ratio against the median of up to CANARY_WINDOW prior clips; too few priors say nothing. */
const ratioAgainst = (current, prior) => {
  if (prior.length < CANARY_MIN_PRIOR) return null;
  const base = median(prior.slice(-CANARY_WINDOW));
  return base > 0 ? current / base : null;
};

/**
 * Slowdown canary: is the running batch slower than itself, right now?
 *
 * sample.clips = finished clips {prefix, clipS, endMs}; sample.runningPrefix and
 * sample.runningStartMs describe the job in flight. Two readings, the worse one wins:
 * the clip in flight (elapsed vs its last 5, which catches a slowdown before it finishes
 * but starts every clip near 0) and the last finished clip (vs the 5 before it, which
 * keeps the signal over a clip boundary). Same prefix only.
 */
export function canary(sample, now) {
  const prefix = sample.runningPrefix ?? null;
  if (!prefix) return null;
  const mine = (sample.clips ?? [])
    .filter((c) => c.prefix === prefix && num(c.clipS) !== null)
    .sort((a, b) => a.endMs - b.endMs)
    .map((c) => c.clipS);
  const readings = [];
  if (mine.length) readings.push(ratioAgainst(mine.at(-1), mine.slice(0, -1)));
  if (num(sample.runningStartMs) !== null && num(now) !== null) {
    readings.push(ratioAgainst(Math.max(0, now - sample.runningStartMs) / 1000, mine));
  }
  const known = readings.filter((r) => r !== null);
  if (!known.length) return null;
  return { prefix, ratio: Math.max(...known) };
}

/**
 * One step of the GPU state machine. `sample` is the raw reading, `prev` the previous
 * sense record ({ts, gpu}) or null, `now` epoch ms. Returns the `gpu` object of the sense
 * output. Readers report 'ok', 'absent' (not installed, connection refused) or 'error'.
 */
export function gpuStep(sample, prev, policy, now) {
  const utilPct = num(sample.utilPct);
  const powerW = num(sample.powerW);
  const comfyRunning = num(sample.comfyRunning);
  const comfyPending = num(sample.comfyPending);
  const ollamaLoaded = typeof sample.ollamaLoaded === 'boolean' ? sample.ollamaLoaded : null;
  const leaseHolder = sample.leaseHolder ?? null;
  const fields = { utilPct, powerW, comfyRunning, comfyPending, ollamaLoaded, leaseHolder };
  const result = (state, dwellS) => ({ state, dwellS, ...fields });

  if (sample.gpuReader === 'absent' && sample.comfyReader === 'absent') return result('absent', null);

  // Positive evidence beats a failed reader: a running queue with nvidia-smi down is still busy.
  const busy = comfyRunning > 0 || comfyPending > 0 || ollamaLoaded === true || leaseHolder !== null
    || (utilPct !== null && utilPct >= UTIL_BUSY_PCT) || (powerW !== null && powerW >= POWER_BUSY_W);
  if (busy) return result('busy', 0);

  const prevGpu = prev?.gpu ?? null;
  const heldDwell = num(prevGpu?.dwellS) ?? 0;
  const provablyQuiet = sample.gpuReader === 'ok' && sample.comfyReader === 'ok' && sample.historyOk === true
    && utilPct !== null && powerW !== null && comfyRunning !== null && comfyPending !== null
    && ollamaLoaded !== null && sample.leaseKnown === true;
  if (!provablyQuiet) return result('unknown', heldDwell);

  const elapsedS = prevGpu ? (now - toMs(prev.ts)) / 1000 : null;
  let dwell = 0;
  if (prevGpu && prevGpu.state !== 'unknown' && prevGpu.state !== 'absent'
    && elapsedS !== null && elapsedS >= 0 && elapsedS <= MAX_DWELL_GAP_S) {
    dwell = heldDwell + elapsedS;
  }
  const lastEnd = num(sample.lastEndMs);
  if (lastEnd !== null && lastEnd > now - dwell * 1000) dwell = 0;
  dwell = Math.round(dwell);
  return result(dwell >= policy.gpuIdleDwellS ? 'idle' : 'settling', dwell);
}

const toMs = (ts) => (typeof ts === 'number' ? ts : Date.parse(ts));

/** Sustained paging only: a single spike (1199/s at a handover) is the normal cost of a model swap. */
function pageReadsSustained(sample, policy, history) {
  const over = (r) => num(r?.pageReadsPerSec) !== null && r.pageReadsPerSec > policy.pageReadsPressure;
  if (!over(sample)) return false;
  const newest = toMs(sample.ts);
  let later = newest;
  let earliest = newest;
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const at = toMs(history[i].ts);
    if (!over(history[i]) || !(later - at <= MAX_DWELL_GAP_S * 1000) || at > later) break;
    earliest = at;
    later = at;
  }
  return newest - earliest >= PAGE_READS_SUSTAIN_S * 1000;
}

/**
 * The pressure strings: `page-reads`, `available`, `commit`, `disk`, `canary`. A null
 * reading never fires. `sample.canary` and `sample.seatsActive` feed the last one; a slow
 * clip with no seat of ours running is not ours to answer for. `history` is earlier sense
 * records, oldest first.
 */
export function pressure(sample, policy, history = []) {
  const out = [];
  if (pageReadsSustained(sample, policy, history)) out.push('page-reads');
  const available = num(sample.availableMb);
  if (available !== null && available < policy.availableFloorMb) out.push('available');
  const committed = num(sample.committedMb);
  const limit = num(sample.commitLimitMb);
  if (committed !== null && limit !== null && committed > COMMIT_FRACTION * limit) out.push('commit');
  const disk = num(sample.diskFreeGb);
  if (disk !== null && disk < policy.minFreeDiskGb) out.push('disk');
  if (sample.seatsActive && num(sample.canary?.ratio) !== null && sample.canary.ratio > CANARY_RATIO) out.push('canary');
  return out;
}

/**
 * The design's width rule; every branch only lowers. Pressure or the seat cap close
 * everything. An unknown operator counts as active and an unknown CPU as high, the lower
 * reading each time. `settling`, `unknown` and `absent` take the busy row: only a proven
 * idle card widens build.
 */
export function width(sense, policy, seatsToday = 0, shiftSeatsMb = 0) {
  const closed = { research: 0, build: 0, gpuProof: 0 };
  if (seatsToday >= policy.maxSeatsPerDay || sense.pressure.length > 0) return closed;
  const budget = Math.floor((policy.coLoadBudgetMb - (num(shiftSeatsMb) ?? 0)) / 1000);
  const research = Math.max(0, Math.min(policy.attentionCap, budget));
  const gpuProof = sense.gpu.state === 'idle' ? 1 : 0;
  const operatorIdleS = num(sense.operatorIdleS);
  if (operatorIdleS === null || operatorIdleS < policy.operatorIdleMin * 60) {
    return { research: Math.min(1, research), build: 0, gpuProof };
  }
  if (sense.gpu.state === 'idle') {
    return { research, build: Math.min(BUILD_WIDTH_IDLE, policy.attentionCap), gpuProof };
  }
  const cpuPct = num(sense.cpuPct);
  const build = cpuPct !== null && cpuPct < BUILD_CPU_CEILING_PCT ? Math.min(1, policy.attentionCap) : 0;
  return { research, build, gpuProof };
}

/**
 * The full sense output. `history` is earlier sense records, oldest first. ctx: `now`
 * epoch ms, `seatsToday`, `shiftSeatsMb` (RAM of seats running), `seatsActive` (defaults
 * to shiftSeatsMb > 0).
 */
export function decide(sample, history = [], policy = DEFAULTS, ctx = {}) {
  const now = ctx.now;
  const ts = new Date(now).toISOString();
  const shiftSeatsMb = num(ctx.shiftSeatsMb) ?? 0;
  const seatsActive = ctx.seatsActive ?? shiftSeatsMb > 0;
  const gpu = gpuStep(sample, history.at(-1) ?? null, policy, now);
  const rawCanary = canary(sample, now);
  const sense = {
    ts,
    cpuPct: num(sample.cpuPct),
    availableMb: num(sample.availableMb),
    committedMb: num(sample.committedMb),
    commitLimitMb: num(sample.commitLimitMb),
    pageReadsPerSec: num(sample.pageReadsPerSec),
    diskFreeGb: num(sample.diskFreeGb),
    operatorIdleS: num(sample.operatorIdleS),
    gpu,
    canary: rawCanary && { prefix: rawCanary.prefix, ratio: Math.round(rawCanary.ratio * 100) / 100 },
    pressure: pressure({ ...sample, ts, canary: rawCanary, seatsActive }, policy, history),
  };
  sense.width = width(sense, policy, ctx.seatsToday ?? 0, shiftSeatsMb);
  return sense;
}
