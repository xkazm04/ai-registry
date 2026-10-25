import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { lockBreakable, runLiveness, breakIfUnchanged, lockFingerprint, createLock, withClaimGate } from './run-board.mjs';

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

/* ---------------------------------------------------------------- takeover (2026-10-14) */

// Measured before this fix: 24 processes contending one lock whose holder was dead got
// it granted to 3 to 6 of them at once in 5 of 12 trials, because a breaker deleted the
// lock by name after judging it, and a faster breaker had already replaced it.

function tmpLock() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-lock-'));
  return { dir, file: path.join(dir, 'commit.lock') };
}
const lockRecord = (runId, acquiredAt) => JSON.stringify({ runId, pid: 1, acquiredAt, ttl: TTL }, null, 2) + '\n';
const DEAD = '2026-01-01T00:00:00.000Z';

test('REGRESSION: a breaker never deletes a lock taken after it judged the old one', () => {
  const { dir, file } = tmpLock();
  fs.writeFileSync(file, lockRecord('ghost', DEAD));
  const judged = lockFingerprint(file);                                  // B judges the dead holder
  fs.unlinkSync(file);                                                   // A breaks it ...
  assert.equal(createLock(file, lockRecord('rA', new Date().toISOString())), true); // ... and takes it
  assert.equal(breakIfUnchanged(file, judged), 'changed');               // B acts on a stale judgement
  assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).runId, 'rA');
  // positive control: the takeover as it stood (a bare unlink after the judgement) deletes A's lock
  const legacyTakeover = (f) => fs.unlinkSync(f);
  legacyTakeover(file);
  assert.equal(fs.existsSync(file), false);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('an unchanged lock is broken, even one too corrupt to parse', () => {
  const { dir, file } = tmpLock();
  fs.writeFileSync(file, '{ not json');
  assert.equal(breakIfUnchanged(file, lockFingerprint(file)), 'broken');
  assert.equal(fs.existsSync(file), false);
  assert.equal(fs.existsSync(file + '.break'), false, 'the takeover gate is released');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('a breaker that finds the gate held waits, and a crashed breaker\'s gate expires', () => {
  const { dir, file } = tmpLock();
  fs.writeFileSync(file, lockRecord('ghost', DEAD));
  const judged = lockFingerprint(file);
  fs.writeFileSync(file + '.break', '');                                // a live breaker is inside
  assert.equal(breakIfUnchanged(file, judged), 'busy');
  assert.equal(fs.existsSync(file), true);
  const old = new Date(Date.now() - 60_000);
  fs.utimesSync(file + '.break', old, old);                             // ... and it crashed there
  assert.equal(breakIfUnchanged(file, judged), 'busy');                 // this call clears the stale gate
  assert.equal(breakIfUnchanged(file, judged), 'broken');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('a lock is never visible without its content, and a held lock refuses a second create', () => {
  // The other half of the same race: a lock created empty and written a moment later was
  // read as "no acquiredAt", judged breakable, and deleted by a contender.
  const { dir, file } = tmpLock();
  assert.equal(createLock(file, lockRecord('rA', new Date().toISOString())), true);
  assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).runId, 'rA');
  assert.equal(createLock(file, lockRecord('rB', new Date().toISOString())), false);
  assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).runId, 'rA');
  assert.deepEqual(fs.readdirSync(dir).filter((f) => f.endsWith('.new')), [], 'no temp file is left behind');
  fs.rmSync(dir, { recursive: true, force: true });
});

/* ---------------------------------------------------------------- claim gate (2026-10-14) */

// Measured before this fix, 32 trials of 8 concurrent `claim` processes naming one source:
// 30 trials granted it to 2-5 runs at once (96 grants for 32 trials); naming one subject,
// 29 trials granted it to 2-6 runs. Claim read the board, decided, then wrote its record,
// with a `git` subprocess inside that window. After: exactly one grant in every trial.

function tmpGate() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-gate-'));
  return { dir, gate: path.join(dir, 'claim.gate') };
}

test('a held claim gate keeps a second claimer out, and a free one lets it in', () => {
  const { dir, gate } = tmpGate();
  fs.writeFileSync(gate, '{"pid":1}\n');                               // a live claimer is inside
  let ran = false;
  assert.deepEqual(withClaimGate(gate, () => { ran = true; }, { waitS: 0.2 }), { timedOut: true });
  assert.equal(ran, false, 'the decision never ran while another claimer held the gate');
  // positive control: the same call with the gate free runs the decision and releases it
  fs.unlinkSync(gate);
  assert.deepEqual(withClaimGate(gate, () => 'decided', { waitS: 0.2 }), { value: 'decided' });
  assert.equal(fs.existsSync(gate), false, 'the gate is released after the decision');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('a gate left by a crashed claimer is reclaimed, and released even when the decision throws', () => {
  const { dir, gate } = tmpGate();
  fs.writeFileSync(gate, '{"pid":1}\n');
  const old = new Date(Date.now() - 60_000);
  fs.utimesSync(gate, old, old);
  assert.deepEqual(withClaimGate(gate, () => 'decided', { waitS: 2 }), { value: 'decided' });
  assert.throws(() => withClaimGate(gate, () => { throw new Error('boom'); }, { waitS: 2 }), /boom/);
  assert.equal(fs.existsSync(gate), false);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('a holder whose gate was reclaimed never deletes the next holder\'s gate', () => {
  const { dir, gate } = tmpGate();
  withClaimGate(gate, () => {
    fs.unlinkSync(gate);                                                // judged stale and broken ...
    assert.equal(createLock(gate, '{"pid":2}\n'), true);                // ... and taken by the next claimer
  });
  assert.equal(fs.readFileSync(gate, 'utf8'), '{"pid":2}\n', 'the next holder still holds its gate');
  // positive control: a release by name, as a bare unlink, deletes the next holder's gate
  fs.unlinkSync(gate);
  assert.equal(fs.existsSync(gate), false);
  fs.rmSync(dir, { recursive: true, force: true });
});

/** A throwaway repo carrying a copy of this run-board, so its board resolves to
 *  <tmp>/.git/run-board and never to a live one. GIT_* is scrubbed: a hook's GIT_DIR
 *  would otherwise point the copy at the real repository's board. */
function throwawayBoard() {
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-claim-'));
  execFileSync('git', ['init', '-q'], { cwd: dir, env, stdio: 'ignore' });
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.copyFileSync(fileURLToPath(new URL('./run-board.mjs', import.meta.url)), path.join(dir, 'scripts', 'run-board.mjs'));
  const claim = (args) => new Promise((resolve) => {
    const p = spawn(process.execPath, [path.join(dir, 'scripts', 'run-board.mjs'), 'claim', '--skill', 'intake', ...args], { cwd: dir, env });
    let out = '', err = '';
    p.stdout.on('data', (d) => { out += d; });
    p.stderr.on('data', (d) => { err += d; });
    p.on('close', (code) => resolve({ code, out, err }));
  });
  const runs = () => fs.readdirSync(path.join(dir, '.git', 'run-board', 'runs')).filter((f) => f.endsWith('.json'));
  return { dir, claim, runs };
}

/** Run any run-board command on a throwaway board (same isolation as `claim` above). */
function boardCmd(dir, args) {
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [path.join(dir, 'scripts', 'run-board.mjs'), ...args], { cwd: dir, env });
    let out = '', err = '';
    p.stdout.on('data', (d) => { out += d; });
    p.stderr.on('data', (d) => { err += d; });
    p.on('close', (code) => resolve({ code, out, err }));
  });
}

test('REGRESSION: beat --subject names a live sibling that already holds the subject', async () => {
  // /intake Phase 4 and /harvest claim subjects with `beat --subject`, not `claim`. Before,
  // beat added the subject without looking: a second run "claimed" a subject a live sibling
  // held and was told nothing, while `claim` with the same subject is refused.
  const { dir, claim } = throwawayBoard();
  try {
    const subject = 'software-engineering/engineering-process/standards-and-gates/quality-gates';
    assert.equal((await claim(['--source', 'https://github.com/acme/a', '--run', 'holder', '--subject', subject])).code, 0);
    assert.equal((await claim(['--source', 'https://github.com/acme/b', '--run', 'late'])).code, 0);
    const doc = 'knowledge/' + subject + '/quality-gates.md';
    const r = await boardCmd(dir, ['beat', '--run', 'late', '--phase', '4', '--subject', doc]);
    assert.equal(r.code, 0, 'beat stays advisory: the exit code is unchanged');
    assert.match(r.err, /warn: OVERLAP\s+holder holds software-engineering\/.*quality-gates \(yours: knowledge\/.*quality-gates\.md\)/);
    // positive control: a subject nobody holds beats silently
    const quiet = await boardCmd(dir, ['beat', '--run', 'late', '--subject', 'software-engineering/x/y/unheld']);
    assert.equal(quiet.code, 0);
    assert.doesNotMatch(quiet.err, /OVERLAP/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('REGRESSION: lock refuses a --ttl or --wait that is not a positive number', async () => {
  // Before: `--ttl -5` was stored as the lock's ttl, so `ageS > ttl` held from the first
  // millisecond and any contender broke a lock its holder took a moment earlier; `--ttl abc`
  // and `--wait abc` silently became 900 and 600.
  const { dir } = throwawayBoard();
  try {
    for (const args of [['--ttl', '-5'], ['--ttl', 'abc'], ['--ttl', '0'], ['--wait', 'abc'], ['--wait', '-1']]) {
      const r = await boardCmd(dir, ['lock', 'commit', '--run', 'a', ...args]);
      assert.equal(r.code, 1, args.join(' ') + ': ' + r.out + r.err);
      assert.match(r.err, new RegExp(args[0] + ' must be a positive number of seconds'));
    }
    assert.equal(fs.existsSync(path.join(dir, '.git', 'run-board', 'locks', 'commit.lock')), false, 'no lock was taken');
    // positive control: a real ttl takes the lock, and a contender is CONTENDED, not handed it
    assert.equal((await boardCmd(dir, ['lock', 'commit', '--run', 'a', '--ttl', '60'])).code, 0);
    assert.equal((await boardCmd(dir, ['lock', 'commit', '--run', 'b'])).code, 3);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('REGRESSION: a misspelled flag is refused, never written as a claim of nothing', async () => {
  // Before: `claim --subjet X` was granted with no subject at all, so every later `check X`
  // by a sibling printed `clear` - a false all-clear the claimer believed it had prevented.
  const { dir, claim, runs } = throwawayBoard();
  try {
    const bad = await claim(['--source', 'https://github.com/acme/a', '--run', 'typo', '--subjet', 'se/x/y/z']);
    assert.equal(bad.code, 1, bad.out + bad.err);
    assert.match(bad.err, /unknown flag --subjet for claim/);
    assert.equal(fs.existsSync(path.join(dir, '.git', 'run-board', 'runs')) ? runs().length : 0, 0, 'no record was written');
    for (const args of [['beat', '--run', 'typo', '--phse', '4'], ['check', '--rnu', 'typo', 'se/x'], ['lock', 'commit', '--run', 'typo', '--ttl-s', '60'], ['list', '--jsn']]) {
      const r = await boardCmd(dir, args);
      assert.equal(r.code, 1, args.join(' ') + ': ' + r.out + r.err);
      assert.match(r.err, new RegExp('unknown flag ' + args.find((a) => a.startsWith('--') && !['--run'].includes(a))));
    }
    // positive control: every flag the usage block documents is still accepted
    const ok = await claim(['--source', 'https://github.com/acme/b', '--run', 'good', '--subject', 'se/x/y/z', '--path', 'p', '--project', 'pr', '--domain', 'd', '--scratch', 's', '--phase', '1', '--status', 'active']);
    assert.equal(ok.code, 0, ok.err);
    assert.equal((await boardCmd(dir, ['beat', '--run', 'good', '--phase', '2', '--status', 'active', '--subject', 'se/x/y/z', '--path', 'p', '--project', 'pr', '--domain', 'd', '--scratch', 's'])).code, 0);
    assert.equal((await boardCmd(dir, ['list', '--json', '--all'])).code, 0);
    assert.equal((await boardCmd(dir, ['check', '--run', 'good', 'se/x'])).code, 0);
    assert.equal((await boardCmd(dir, ['lock', 'commit', '--run', 'good', '--wait', '5', '--ttl', '60'])).code, 0);
    assert.equal((await boardCmd(dir, ['unlock', 'commit', '--run', 'good', '--force'])).code, 0);
    assert.equal((await boardCmd(dir, ['release', '--run', 'good'])).code, 0);
    assert.equal((await boardCmd(dir, ['gc'])).code, 0);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

async function racedClaims(argsFor, n = 8) {
  const { dir, claim, runs } = throwawayBoard();
  const res = await Promise.all(Array.from({ length: n }, (_, i) => claim(argsFor(i))));
  for (const r of res.filter((x) => x.code === 0)) {
    const board = /board\s+(.+)/.exec(r.out)[1].trim();
    assert.ok(path.resolve(board).toLowerCase().startsWith(path.resolve(dir).toLowerCase()), 'claimed on the throwaway board only');
  }
  const granted = res.filter((r) => r.code === 0).length;
  const contended = res.filter((r) => r.code === 3 && /^CONTENDED - \d+ collision\(s\) with live siblings:/.test(r.err)).length;
  const records = runs().length;
  fs.rmSync(dir, { recursive: true, force: true });
  return { granted, contended, records };
}

test('REGRESSION: concurrent claims of one source grant it exactly once', async () => {
  for (let t = 0; t < 3; t++) {
    const r = await racedClaims((i) => ['--source', 'https://github.com/acme/widget', '--run', 't' + t + '-c' + i]);
    assert.deepEqual(r, { granted: 1, contended: 7, records: 1 }, 'trial ' + t);
  }
});

test('REGRESSION: concurrent claims of one subject from different sources grant it exactly once', async () => {
  const subject = 'software-engineering/engineering-process/standards-and-gates/quality-gates';
  for (let t = 0; t < 3; t++) {
    const r = await racedClaims((i) => ['--source', 'https://github.com/acme/src-' + i, '--subject', subject, '--run', 't' + t + '-c' + i]);
    assert.deepEqual(r, { granted: 1, contended: 7, records: 1 }, 'trial ' + t);
  }
});
