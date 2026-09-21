import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lockBreakable, runLiveness } from './run-board.mjs';

// The board's staleness window is 45 minutes and its default lock ttl is 900s.
const STALE_S = 45 * 60;
const TTL = 900;

/** The predicate as it stood before 2026-09-17, replicated here so the regression
 *  test carries its own positive control: every assertion below that matters must be
 *  shown to come out DIFFERENTLY under the old rule, or it is not testing the fix. */
const legacyBreakable = ({ ageS, holderLive, beatSinceAcquire, ttl = TTL }) =>
  !holderLive || (ageS > ttl && !beatSinceAcquire);

test('REGRESSION: a quiet-but-live holder keeps a lock it took one second ago', () => {
  // The witnessed 2026-09-07 incident. A run deep in a long task reports at
  // transitions, so its heartbeat aged past the window while it worked - and then it
  // took the commit lock. The acquire is a record its process wrote; the stale
  // heartbeat is only its own report about itself.
  const state = { ageS: 1, holderLive: false, beatSinceAcquire: false, ttl: TTL };
  assert.equal(lockBreakable(state).breakable, false);
  // positive control: the old rule handed this lock away
  assert.equal(legacyBreakable(state), true);
});

test('a fresh acquire holds even at the far edge of the staleness window', () => {
  const state = { ageS: STALE_S - 1, holderLive: false, beatSinceAcquire: true, ttl: STALE_S * 2 };
  assert.equal(lockBreakable(state).breakable, false);
  assert.equal(legacyBreakable(state), true);
});

test('reclaim still terminates: past the staleness window, a dead holder loses it', () => {
  const r = lockBreakable({ ageS: STALE_S + 1, holderLive: false, beatSinceAcquire: false, ttl: STALE_S * 2 });
  assert.equal(r.breakable, true);
  assert.equal(r.ownerGone, true);
});

test('reclaim terminates sooner through the ttl branch than through the window', () => {
  // A holder that crashed at the acquire never beats again: the ttl branch fires at
  // 900s, well before the 45-minute window, so the fix does not slow the common crash.
  const r = lockBreakable({ ageS: TTL + 1, holderLive: false, beatSinceAcquire: false, ttl: TTL });
  assert.equal(r.breakable, true);
  assert.equal(r.pastTtlAndQuiet, true);
});

test('the 2026-09-03 rule survives: a live-but-wedged holder past ttl is breakable', () => {
  // holderLive is true (it is beating) but it has not beaten since it took the lock,
  // so it is not moving inside the guarded section.
  const r = lockBreakable({ ageS: TTL + 1, holderLive: true, beatSinceAcquire: false, ttl: TTL });
  assert.equal(r.breakable, true);
  assert.equal(r.ownerGone, false);
  assert.equal(r.pastTtlAndQuiet, true);
});

test('a live holder that has beaten inside the guarded section is never broken', () => {
  const r = lockBreakable({ ageS: TTL * 10, holderLive: true, beatSinceAcquire: true, ttl: TTL });
  assert.equal(r.breakable, false);
});

test('an unreadable acquiredAt does not protect a dead holder', () => {
  // ageS is NaN when the lock file carries no parseable acquiredAt. That must not be
  // read as "acquired recently", or a corrupt lock becomes permanent.
  assert.equal(lockBreakable({ ageS: NaN, holderLive: false, beatSinceAcquire: false, ttl: TTL }).breakable, true);
});

test('a negative age does not protect a dead holder either', () => {
  // A lock stamped in the future, from a clock that stepped backwards. An instant is
  // re-evaluated against a movable clock; it may not be the thing that grants immunity.
  assert.equal(lockBreakable({ ageS: -5000, holderLive: false, beatSinceAcquire: false, ttl: TTL }).breakable, true);
});

test('ttl falls back to the default when the lock recorded none', () => {
  assert.equal(lockBreakable({ ageS: TTL + 1, holderLive: false, beatSinceAcquire: false, ttl: undefined }).pastTtlAndQuiet, true);
  assert.equal(lockBreakable({ ageS: TTL - 1, holderLive: true, beatSinceAcquire: false, ttl: undefined }).pastTtlAndQuiet, false);
});

// ---- the other half of the same incident: `check` reporting a live sibling clear ----

/** Liveness as it stood before 2026-09-17: the heartbeat alone. */
const legacyLive = ({ status, staleMin }) => status !== 'done' && staleMin < 45;

test('REGRESSION: a quiet run holding a fresh lock is live to check()', () => {
  const state = { status: 'running', staleMin: 46, lockAgeS: 1 };
  const r = runLiveness(state);
  assert.equal(r.live, true);
  assert.equal(r.by, 'lock');
  // positive control: the old rule called this run stale, so check() printed `clear`
  // for its paths in the same second it held the commit lock.
  assert.equal(legacyLive(state), false);
});

test('a heartbeat inside the window is still the cheap answer, and says so', () => {
  const r = runLiveness({ status: 'running', staleMin: 1, lockAgeS: Infinity });
  assert.equal(r.live, true);
  assert.equal(r.by, 'heartbeat');
});

test('a run holding no lock and gone quiet is stale, as before', () => {
  const state = { status: 'running', staleMin: 46, lockAgeS: Infinity };
  assert.equal(runLiveness(state).live, false);
  assert.equal(runLiveness(state).by, 'stale');
  assert.equal(legacyLive(state), false); // unchanged by the fix
});

test('a stale lock does not resurrect a stale run', () => {
  assert.equal(runLiveness({ status: 'running', staleMin: 120, lockAgeS: 45 * 60 + 1 }).live, false);
});

test('done outranks every kind of evidence', () => {
  // A released run that somehow still has a lock file on disk is not live; the lock is
  // the thing that is wrong, and `gc` is what removes it.
  assert.equal(runLiveness({ status: 'done', staleMin: 0, lockAgeS: 0 }).live, false);
  assert.equal(runLiveness({ status: 'done', staleMin: 0, lockAgeS: 0 }).by, 'done');
});

test('a lock stamped in the future does not make a stale run live', () => {
  assert.equal(runLiveness({ status: 'running', staleMin: 99, lockAgeS: -10 }).live, false);
});

test('the two predicates agree about the incident', () => {
  // One run, one moment: heartbeat 46 minutes old, commit lock taken 1 second ago.
  // Both halves must now protect it, or the sibling gets one of the two wrong answers.
  assert.equal(runLiveness({ status: 'running', staleMin: 46, lockAgeS: 1 }).live, true);
  assert.equal(lockBreakable({ ageS: 1, holderLive: false, beatSinceAcquire: false, ttl: TTL }).breakable, false);
});
