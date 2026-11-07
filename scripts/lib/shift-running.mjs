/**
 * shift-running - which /shift seats are alive right now, read from .ai/shift/running.jsonl.
 *
 * WHY A LIB
 * The queue decides what to start from this ledger, and the sensor derives the RAM its slowdown
 * canary needs from it, so an operator cannot silence the canary by forgetting a flag. The queue
 * pulls in the backlog and fleet readers; the sensor has a 3 s budget per sample and needs only
 * this. Writing stays in shift-queue, which holds the lock.
 *
 * WHY A RECORD GOES STALE
 * Nothing but `done` removes a record, and a dead terminal never calls it. Past RUNNING_STALE_MS
 * a record reads as dead, so a lost seat cannot hold a lane forever. A seat that truly runs that
 * long loses only its double-dispatch guard, which is the cheaper of the two mistakes.
 */
import fs from 'node:fs';
import path from 'node:path';

export const RUNNING_STALE_MS = 6 * 3600 * 1000;

/** Which lane each seat kind spends. A closed set: an unlisted kind could hold no lane. */
export const SEAT_LANES = Object.freeze({
  miner: 'research', lander: 'research', planner: 'research', filler: 'research',
  builder: 'build', 'cpu-proof': 'build',
  proof: 'gpu',
});

/** The design's figures per lane, unmeasured for this mix. A GPU proof spends no shift RAM. */
const LANE_MB = Object.freeze({ research: 1000, build: 3400, gpu: 0 });

/** Not agent seats: they spend no plan quota, so they do not count against maxSeatsPerDay. */
export const NOT_AGENT_SEATS = Object.freeze(['proof', 'cpu-proof']);

export const runningFile = (stateDir) => path.join(stateDir, 'running.jsonl');

/** Refuses what it cannot read: an unreadable ledger is not an empty one. */
export function parseRunning(text) {
  const records = [];
  String(text).split('\n').forEach((line, i) => {
    if (!line.trim()) return;
    let r;
    try { r = JSON.parse(line); } catch { throw new Error(`running line ${i + 1}: not JSON`); }
    if (!r.key) throw new Error(`running line ${i + 1}: no key`);
    if (!Object.hasOwn(SEAT_LANES, r.kind)) throw new Error(`running ${r.key}: kind "${r.kind}" not in closed set`);
    records.push(r);
  });
  return records;
}

export const serializeRunning = (records) => records.map((r) => JSON.stringify(r)).join('\n') + (records.length ? '\n' : '');

export function readRunning(stateDir) {
  let text;
  try { text = fs.readFileSync(runningFile(stateDir), 'utf8'); } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
  return parseRunning(text);
}

/** Pure. A record nobody can date is dead: it could otherwise hold its lane forever. */
export function splitRunning(records, now) {
  const live = [];
  const stale = [];
  for (const r of records) {
    const at = Date.parse(r.startedAt);
    (Number.isFinite(at) && now - at <= RUNNING_STALE_MS ? live : stale).push(r);
  }
  return { live, stale };
}

/** Pure. The RAM the given seats are taken to hold; pass the live ones. */
export const seatsMb = (running) => running.reduce((sum, r) => sum + (LANE_MB[SEAT_LANES[r.kind]] ?? 0), 0);

/** Pure. Live seats per lane. */
export function laneCounts(running) {
  const counts = { research: 0, build: 0, gpu: 0 };
  for (const r of running) if (Object.hasOwn(SEAT_LANES, r.kind)) counts[SEAT_LANES[r.kind]] += 1;
  return counts;
}
