// clock.mjs - the hackathon's wall clock: when the next builder session ends, and how to say it.
//
// WHY pure and separate: the clock is the hackathon. A builder that is restarted too late, killed
// after the deadline, or relaunched forever after a seat limit wastes the one resource the format
// is about, and none of that is visible until hours into a run. So the planner takes `now` as an
// argument and the tests walk it across a whole clock in milliseconds.
//
// Session kinds:
//   long mode    - `full` (first session, to the deadline), `continuation` (the seat stopped early
//                  with outcome completed: a new session to the deadline), `resume` (the last session
//                  errored, timed out early or the host died: a new session to the deadline).
//   sprints mode - `baseline` (first session, to started + baselineFrac * total), `sprint` (to
//                  min(deadline, now + sprintMin)), `resume` (the last session errored or the host
//                  died: to the baseline end while it is still ahead, else to the next sprint end).
//                  A sprint that times out at its planned end is the normal end of a sprint.
// Stop when less than 10 minutes remain, when the seat's own sessions reach maxSessions, after a
// seat limit, or when the builder declared the entry done (.hackathon/DONE).
//
// Sessions the HOST ended (interrupted: the host process died) and seat-limit sessions do not count
// toward maxSessions: in 1.0.0's first run a host death spent one of a short-session seat's six.

import { KEY_OUTCOMES } from './funding.mjs';

export const MIN_SESSION_MS = 10 * 60 * 1000;
// A key outcome (credit night: the key ran dry, hit the night's cap, was refused or rate-limited)
// ended the session for the funding's sake, not the seat's. It resumes - on the subscription once
// the night has switched - and does not count toward maxSessions.
const RESUME_AFTER = new Set(['errored', 'timed-out', 'interrupted', 'unavailable', ...KEY_OUTCOMES]);
const SPRINT_RESUME_AFTER = new Set(['errored', 'interrupted', 'unavailable', ...KEY_OUTCOMES]);
const NOT_THE_SEATS = new Set(['interrupted', 'seat-limit', ...KEY_OUTCOMES]);
const QUICK_DONE_S = 5 * 60;

/** Sessions that count toward max_sessions: an array of { outcome } drops host-ended ones; a number counts as is. */
export const countedSessions = (sessions) => (Array.isArray(sessions) ? sessions.filter((q) => !NOT_THE_SEATS.has(q?.outcome)).length : Number(sessions) || 0);

/** { plan: { end, kind } | null, reason } - the reason says why a run stopped. */
export function planSessionWhy({ mode = 'long', started, deadline, now, baselineFrac = 0.35, sprintMin = 60, sessions = 0, maxSessions = 6, lastOutcome = null, resumeLimit = false, declaredDone = null }) {
  const n = countedSessions(sessions);
  const total = Array.isArray(sessions) ? sessions.length : n; // the first session is the first one run, counted or not
  // The builder said it is finished: no continuation sessions that only re-read the log.
  if (declaredDone) return { plan: null, reason: `the builder declared the entry done${typeof declaredDone === 'string' && declaredDone.trim() ? `: ${declaredDone.trim().slice(0, 160)}` : ''}` };
  // The same, unsaid: a builder that finishes two sessions in a row within minutes has nothing left
  // it wants to do (1.0.0: a seat that called itself done burned four 1-4 min continuations).
  const tail = Array.isArray(sessions) ? sessions.slice(-2) : [];
  if (tail.length === 2 && tail.every((q) => q?.outcome === 'completed' && q.wall_s != null && q.wall_s < QUICK_DONE_S)) {
    return { plan: null, reason: 'the builder ended two sessions in a row within 5 min - nothing left it wants to do' };
  }
  // A seat limit stops the entry; only the host's explicit `run --resume-limited` after the reset
  // turns it into one resume (never a retry loop - a fresh limit stops it again).
  if (lastOutcome === 'seat-limit' && !resumeLimit) return { plan: null, reason: 'the seat hit its usage limit' };
  if (lastOutcome === 'seat-limit') lastOutcome = 'interrupted';
  if (n >= maxSessions) return { plan: null, reason: `${n} session(s) reached max_sessions ${maxSessions}` };
  if (deadline - now < MIN_SESSION_MS) return { plan: null, reason: now >= deadline ? 'the clock ran out' : 'less than 10 min left on the clock' };
  const clamp = (t) => Math.min(t, deadline);
  if (mode === 'sprints') {
    const baselineEnd = clamp(started + baselineFrac * (deadline - started));
    if (total === 0) return { plan: { end: baselineEnd > now ? baselineEnd : clamp(now + sprintMin * 60000), kind: 'baseline' }, reason: null };
    if (SPRINT_RESUME_AFTER.has(lastOutcome)) {
      return { plan: { end: baselineEnd - now >= MIN_SESSION_MS ? baselineEnd : clamp(now + sprintMin * 60000), kind: 'resume' }, reason: null };
    }
    return { plan: { end: clamp(now + sprintMin * 60000), kind: 'sprint' }, reason: null };
  }
  if (total === 0) return { plan: { end: deadline, kind: 'full' }, reason: null };
  if (RESUME_AFTER.has(lastOutcome) || !lastOutcome) return { plan: { end: deadline, kind: 'resume' }, reason: null };
  return { plan: { end: deadline, kind: 'continuation' }, reason: null };
}

export const planSession = (args) => planSessionWhy(args).plan;

const pad = (n) => String(n).padStart(2, '0');

/** ISO 8601 in local time with its offset: 2026-10-28T13:45:00+01:00. */
export function isoLocal(ms) {
  const d = new Date(ms);
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const a = Math.abs(off);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${pad(Math.floor(a / 60))}:${pad(a % 60)}`;
}

export const hhmm = (ms) => { const d = new Date(ms); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };

/** `ISO (HH:MM)` - what a brief prints for a time. */
export const stamp = (ms) => `${isoLocal(ms)} (${hhmm(ms)})`;

/** 7800000 -> "2 h 10 min"; 300000 -> "5 min". */
export function humanDuration(ms) {
  const total = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** The line at the top of BUILDER.md that tells a seat which session this is. */
export function sessionLine({ kind, n, sprintNo = n, now, end, deadline, lastOutcome = null }) {
  const left = humanDuration(deadline - now);
  switch (kind) {
    case 'full': return `Session ${n} of a long run: you have the whole clock.`;
    case 'continuation': return `Session ${n} (continuation): you stopped with ${left} left. Read .hackathon/HACKLOG.md, then keep mastering - the clock is the point.`;
    case 'baseline': return `Sprint 1 - baseline: this session ends at ${hhmm(end)}; reach the baseline before then.`;
    case 'sprint': return `Sprint ${sprintNo}: this session ends at ${hhmm(end)} and the hackathon at ${hhmm(deadline)}. Read .hackathon/HACKLOG.md, then spend this sprint on mastery - commit before ${hhmm(end)}.`;
    case 'resume': return `Session ${n} (resume): the previous session ended early (${lastOutcome ?? 'host stopped'}) with ${left} left on the clock. Read .hackathon/HACKLOG.md and \`git log\`, then pick up where it stopped. This session ends at ${hhmm(end)}.`;
    default: return '';
  }
}
