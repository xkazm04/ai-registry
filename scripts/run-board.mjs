#!/usr/bin/env node
/**
 * run-board - the claim board a dozen parallel research sessions read to stay out of
 * each other's way.
 *
 * The registry is a SHARED WRITE TARGET. `/intake`, `/harvest`, `/deepen`, `/forge` and
 * `/reconcile` all land into the same bundles, append to the same ledgers, regenerate the
 * same index and catalog, and commit on the same branch. One session at a time, that is
 * fine. A dozen at once, and the failure modes are not hypothetical - they have all been
 * observed in this repo's own ledger: a sibling's branch switched mid-run, a directory-wide
 * `git add` swept another session's in-flight instrument into a commit, a parallel session
 * landed a subject that Phase 4's map had already declared absent, and a scratch sweep
 * deleted a neighbour's clone.
 *
 * The design rule, and it is the only one that scales: EVERY RUN WRITES ONLY ITS OWN FILE.
 * There is no shared board document to append to, because a shared append is exactly the
 * race the board exists to prevent. The board you read is this script collating a
 * directory of single-writer records. Anything that genuinely must be serialized -
 * regenerating the index, appending to a ledger, committing - takes a named lock, which is
 * an atomic exclusive file create and nothing cleverer.
 *
 * The board lives in the git COMMON directory, not the working tree:
 *
 *   $(git rev-parse --git-common-dir)/run-board/
 *
 * That location is deliberate and load-bearing. It is shared by every `git worktree` of
 * this repository, so sessions isolated into worktrees still see each other; it can never
 * be committed, staged, or swept by a pathspec; and it needs no `.gitignore` entry to stay
 * out of a diff. Operational state about runs is not registry content.
 *
 * Records are advisory. This is a coordination board, not a permission system: it cannot
 * stop a session from writing where it should not, it can only make the collision VISIBLE
 * before the write, which is all a cooperating fleet needs. A liar on the board is a
 * broken session, not a threat model.
 *
 * Usage:
 *   node scripts/run-board.mjs claim  --skill intake --source <url|slug> [--run <id>]
 *                                     [--subject <addr>]... [--path <p>]... [--project <slug>]...
 *                                     [--domain <d>]... [--scratch <dir>] [--force]
 *   node scripts/run-board.mjs beat   --run <id> [--phase <p>] [--status <s>]
 *                                     [--subject <addr>]... [--path <p>]... [--project <slug>]...
 *   node scripts/run-board.mjs list   [--json] [--all]
 *   node scripts/run-board.mjs check  --run <id> <path-or-subject>...
 *   node scripts/run-board.mjs lock   <name> --run <id> [--wait [secs]] [--ttl <secs>]
 *   node scripts/run-board.mjs unlock <name> --run <id>
 *   node scripts/run-board.mjs release --run <id>
 *   node scripts/run-board.mjs gc
 *
 * Exit codes, which differ on purpose because they lead to opposite next moves:
 *   0  clear - nothing else holds what you asked about
 *   1  the instrument itself failed (bad arguments, unreadable board)
 *   3  CONTENDED - a live sibling holds the source, the subject, the path, or the lock.
 *      Not an error. It is the answer, and the caller decides: wait, re-scope, or proceed
 *      knowing who else is in the file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

/* ---------------------------------------------------------------- board location */

function boardDir() {
  let common;
  try {
    common = execFileSync('git', ['rev-parse', '--git-common-dir'], {
      cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    common = '.git';
  }
  if (!path.isAbsolute(common)) common = path.resolve(ROOT, common);
  return path.join(common, 'run-board');
}

const BOARD = boardDir();
const RUNS = path.join(BOARD, 'runs');
const LOCKS = path.join(BOARD, 'locks');

function ensure() {
  fs.mkdirSync(RUNS, { recursive: true });
  fs.mkdirSync(LOCKS, { recursive: true });
}

/* ---------------------------------------------------------------- tiny helpers */

// Liveness here is measured in TIME, never in process liveness, and the reason matters.
// Each of these commands is a one-shot `node` invocation that exits the instant it
// returns - the AGENT SESSION is the run, not the process that wrote the record. A
// pid-based check would therefore declare every holder dead a millisecond after it
// acquired, which turns the lock into a no-op and the board into a list of ghosts. The
// pid is recorded because it is occasionally useful to a human reading the board; it
// decides nothing.
const STALE_MIN = 45;          // no heartbeat this long => the run is presumed abandoned
const LOCK_TTL_S = 900;        // a lock older than this is breakable, loudly

function nowISO() { return new Date().toISOString(); }
function ageMin(iso) { return (Date.now() - Date.parse(iso)) / 60000; }
function sleep(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }

/** Write-temp-then-rename. A reader never sees a half-written record. */
function writeJSON(file, obj) {
  const tmp = file + '.' + process.pid + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2) + '\n');
  fs.renameSync(tmp, file);
}

function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function loadRuns() {
  ensure();
  const out = [];
  for (const f of fs.readdirSync(RUNS)) {
    if (!f.endsWith('.json')) continue;
    const rec = readJSON(path.join(RUNS, f));
    if (!rec || !rec.runId) continue;
    rec._file = path.join(RUNS, f);
    rec._staleMin = Math.round(ageMin(rec.heartbeatAt || rec.startedAt));
    // A record is LIVE while its heartbeat is recent. A run that crashed leaves a stale
    // record behind for up to STALE_MIN and is then reaped by `gc` - the cost of that
    // window is one over-cautious sibling, which is the cheap direction to be wrong in.
    rec._live = rec.status !== 'done' && rec._staleMin < STALE_MIN;
    out.push(rec);
  }
  return out.sort((a, b) => String(a.startedAt).localeCompare(String(b.startedAt)));
}

/** Normalise a claim token so `knowledge/x/y/z.md` and `x/y/z` compare equal. */
function norm(s) {
  return String(s).trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '').toLowerCase();
}

/**
 * One identity for one SOURCE, however it was spelled. `norm` folds case and
 * trailing slashes, which is right for subjects and paths and wrong for URLs:
 * measured 2026-09-02, the SAME SOURCE check missed three of four spellings
 * of one repository (`.git` suffix, `www.` prefix, a query string), so two
 * terminals could mine one repo at once. A URL folds to host + path with the
 * scheme, `www.`, `.git`, query and fragment removed; anything that is not a
 * URL falls back to `norm`. The fold is deliberately narrow — a different
 * path is a different source (`openbao/openbao` vs `openbao/openbao-plugins`).
 *
 * Dropping the query was right for the repository the 2026-09-02 fix measured
 * and catastrophic for the class this skill mines most: measured 2026-09-04,
 * EVERY `youtube.com/watch?v=...` folded to `youtube.com/watch`, so any two
 * concurrent video runs collided and no two videos could ever be told apart.
 * That fails in both directions at once — a false SAME SOURCE on every video
 * pair, and (because `youtu.be/<id>` keeps its id in the path) a MISSED
 * collision between the two spellings of one video. A check that cries wolf on
 * every video teaches the operator to `--force` past it, which disables it for
 * the whole class. So hosts whose identity lives in the query are folded
 * explicitly to that identity, and the query stays dropped everywhere else.
 */
const VIDEO_ID_PARAM = { 'youtube.com': 'v', 'm.youtube.com': 'v', 'music.youtube.com': 'v' };

function normSource(s) {
  const raw = String(s).trim().replace(/\\/g, '/');
  // Catch ONLY the parse: a source that is not a URL is a path or a dispatch
  // slug and folds with `norm`. Wrapping the whole body would turn any bug
  // below into a silent fallback that still returns a plausible-looking token
  // — which is how a broken fold reports agreement instead of failing.
  let u;
  try { u = new URL(raw); } catch { return norm(raw); }
  {
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    const p = u.pathname.replace(/\/+$/, '').replace(/\.git$/i, '').toLowerCase();

    // A video's identity is its id, however the URL spells it. Both spellings
    // fold to one token so `youtu.be/<id>` and `watch?v=<id>` compare equal.
    const idParam = VIDEO_ID_PARAM[host];
    if (idParam && p === '/watch') {
      const id = u.searchParams.get(idParam);
      if (id) return 'youtube.com/video/' + id.toLowerCase();
    }
    if (host === 'youtu.be' && p.length > 1) return 'youtube.com/video/' + p.slice(1);
    if (idParam && (p.startsWith('/shorts/') || p.startsWith('/embed/') || p.startsWith('/live/'))) {
      return 'youtube.com/video/' + p.split('/')[2];
    }

    return host + p;
  }
}

/** Do two claim tokens touch? Prefix containment in either direction counts. */
function touches(a, b) {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  return x === y || x.startsWith(y + '/') || y.startsWith(x + '/');
}

/* ---------------------------------------------------------------- args */

const argv = process.argv.slice(2);
const cmd = argv[0];

function flag(name) { return argv.includes('--' + name); }
function one(name, dflt = null) {
  const i = argv.indexOf('--' + name);
  return i === -1 || !argv[i + 1] || argv[i + 1].startsWith('--') ? dflt : argv[i + 1];
}
function many(name) {
  const out = [];
  argv.forEach((a, i) => {
    if (a === '--' + name && argv[i + 1] && !argv[i + 1].startsWith('--')) out.push(argv[i + 1]);
  });
  return out;
}
function positionals() {
  const out = [];
  for (let i = 1; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      if (argv[i + 1] && !argv[i + 1].startsWith('--')) i++;
      continue;
    }
    out.push(argv[i]);
  }
  return out;
}

function die(msg, code = 1) { console.error('FATAL: ' + msg); process.exit(code); }

function gitBranch() {
  try {
    return execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch { return null; }
}

/* ---------------------------------------------------------------- commands */

function slugify(s) {
  return String(s).toLowerCase().replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '').slice(0, 40) || 'run';
}

function runFile(id) { return path.join(RUNS, id.replace(/[^a-z0-9._-]/gi, '_') + '.json'); }

function cmdClaim() {
  const skill = one('skill') || die('claim needs --skill (intake|harvest|deepen|forge|reconcile|...)');
  const source = one('source') || die('claim needs --source (the url, path or dispatch slug being mined)');
  const runId = one('run') || (new Date().toISOString().slice(0, 10) + '-' + slugify(skill) + '-' + slugify(source) + '-' + process.pid);
  ensure();

  const siblings = loadRuns().filter((r) => r._live && r.runId !== runId);
  const conflicts = [];

  for (const s of siblings) {
    if (normSource(s.source) === normSource(source)) {
      conflicts.push('SAME SOURCE   ' + s.runId + ' is already mining ' + s.source + ' (phase ' + (s.phase || '?') + ', ' + s._staleMin + 'm since heartbeat)');
    }
  }
  const mine = [...many('subject'), ...many('path'), ...many('project')];
  for (const s of siblings) {
    const theirs = [...(s.claims && s.claims.subjects || []), ...(s.claims && s.claims.paths || []), ...(s.claims && s.claims.projects || [])];
    for (const m of mine) {
      for (const t of theirs) if (touches(m, t)) conflicts.push('OVERLAP       ' + s.runId + ' holds ' + t + ' (yours: ' + m + ')');
    }
  }

  const existing = readJSON(runFile(runId));
  const rec = {
    runId,
    skill,
    source,
    status: one('status') || 'active',
    phase: one('phase') || (existing ? existing.phase : '0'),
    pid: process.pid,
    branch: gitBranch(),
    scratch: one('scratch') || (existing && existing.scratch) || null,
    startedAt: (existing && existing.startedAt) || nowISO(),
    heartbeatAt: nowISO(),
    domains: [...new Set([...(existing && existing.domains || []), ...many('domain')])],
    claims: {
      subjects: [...new Set([...(existing && existing.claims && existing.claims.subjects || []), ...many('subject')])],
      paths: [...new Set([...(existing && existing.claims && existing.claims.paths || []), ...many('path')])],
      projects: [...new Set([...(existing && existing.claims && existing.claims.projects || []), ...many('project')])],
    },
  };

  if (conflicts.length && !flag('force')) {
    console.error('CONTENDED - ' + conflicts.length + ' collision(s) with live siblings:');
    for (const c of conflicts) console.error('  ' + c);
    console.error('\nThe claim was NOT written. Re-scope, wait, or re-run with --force and say so in the note.');
    process.exit(3);
  }
  writeJSON(runFile(runId), rec);
  for (const c of conflicts) console.log('warn: ' + c);
  console.log('claimed ' + runId);
  console.log('board   ' + BOARD);
  console.log('live    ' + siblings.length + ' sibling run(s)');
  return 0;
}

function cmdBeat() {
  const runId = one('run') || die('beat needs --run <id>');
  const rec = readJSON(runFile(runId));
  if (!rec) die('no record for run ' + runId + ' - claim it first', 1);
  rec.heartbeatAt = nowISO();
  rec.pid = process.pid;
  rec.branch = gitBranch();
  if (one('phase')) rec.phase = one('phase');
  if (one('status')) rec.status = one('status');
  if (one('scratch')) rec.scratch = one('scratch');
  rec.claims = rec.claims || { subjects: [], paths: [], projects: [] };
  rec.claims.subjects = [...new Set([...(rec.claims.subjects || []), ...many('subject')])];
  rec.claims.paths = [...new Set([...(rec.claims.paths || []), ...many('path')])];
  rec.claims.projects = [...new Set([...(rec.claims.projects || []), ...many('project')])];
  rec.domains = [...new Set([...(rec.domains || []), ...many('domain')])];
  writeJSON(runFile(runId), rec);
  console.log('beat ' + runId + ' phase=' + rec.phase + ' status=' + rec.status);
  return 0;
}


/** Reclaim is a judgement about the OWNER, not about elapsed time. A deadline that fires
 *  on age alone supersedes a slow-but-live owner before it can publish, and under steady
 *  arrivals that becomes a self-sustaining stampede; the same deadline also makes the
 *  fleet serve out a ttl that a DEAD owner will never use. The board already collects the
 *  evidence for both directions - a heartbeat - so the decision reads it. */
function holderRunLive(held) {
  if (!held || !held.runId) return false;
  const rec = readJSON(runFile(held.runId));
  if (!rec || rec.status === 'done') return false;
  return ageMin(rec.heartbeatAt || rec.startedAt) < STALE_MIN;
}

/** Has the holder beaten at or since the moment it took this lock? A beat that predates
 *  the acquire proves the run was alive once, not that it is still moving inside the
 *  guarded section - which is what keeps a live-but-wedged holder from holding forever. */
function holderBeatSinceAcquire(held) {
  const rec = readJSON(runFile(held.runId || ''));
  if (!rec) return false;
  const beat = Date.parse(rec.heartbeatAt || rec.startedAt || 0);
  const took = Date.parse(held.acquiredAt || 0);
  return Number.isFinite(beat) && Number.isFinite(took) && beat >= took;
}

function lockFile(name) { return path.join(LOCKS, name.replace(/[^a-z0-9._-]/gi, '_') + '.lock'); }

function readLocks() {
  ensure();
  const out = [];
  for (const f of fs.readdirSync(LOCKS)) {
    if (!f.endsWith('.lock')) continue;
    const rec = readJSON(path.join(LOCKS, f)) || {};
    rec.name = f.replace(/\.lock$/, '');
    rec._ageS = (Date.now() - Date.parse(rec.acquiredAt || 0)) / 1000;
    rec._breakable = rec._ageS > (rec.ttl || LOCK_TTL_S);
    out.push(rec);
  }
  return out;
}

function cmdList() {
  const runs = loadRuns().filter((r) => flag('all') || r._live);
  if (flag('json')) { console.log(JSON.stringify(runs, null, 2)); return 0; }
  const locks = readLocks();
  if (!runs.length) {
    console.log('board: no live runs.   [' + BOARD + ']');
  } else {
    console.log('board: ' + runs.length + ' run(s)   [' + BOARD + ']\n');
    for (const r of runs) {
      const tag = r._live ? (r._staleMin > STALE_MIN / 2 ? 'QUIET' : 'live ') : 'stale';
      console.log('  [' + tag + '] ' + r.runId);
      console.log('          skill=' + r.skill + ' phase=' + r.phase + ' branch=' + r.branch + ' pid=' + r.pid + ' beat=' + r._staleMin + 'm ago');
      console.log('          source: ' + r.source);
      const c = r.claims || {};
      if (c.subjects && c.subjects.length) console.log('          subjects: ' + c.subjects.join(', '));
      if (c.paths && c.paths.length) console.log('          paths:    ' + c.paths.join(', '));
      if (c.projects && c.projects.length) console.log('          projects: ' + c.projects.join(', '));
    }
  }
  if (locks.length) {
    console.log('\nlocks:');
    for (const l of locks) {
      console.log('  ' + l.name.padEnd(12) + ' held by ' + l.runId + ' for ' + Math.round(l._ageS) + 's' + (l._breakable ? '  <- BREAKABLE (past its ttl)' : ''));
    }
  }
  return 0;
}

function cmdCheck() {
  const runId = one('run');
  const targets = positionals();
  if (!targets.length) die('check needs at least one path or subject address');
  const siblings = loadRuns().filter((r) => r._live && r.runId !== runId);
  const hits = [];
  for (const s of siblings) {
    const theirs = [...(s.claims && s.claims.subjects || []), ...(s.claims && s.claims.paths || []), ...(s.claims && s.claims.projects || [])];
    for (const t of targets) for (const held of theirs) if (touches(t, held)) hits.push({ t, held, s });
  }
  if (!hits.length) { console.log('clear: no live sibling holds ' + targets.length + ' target(s).'); return 0; }
  console.error('CONTENDED - ' + hits.length + ' target(s) held by a live sibling:');
  for (const h of hits) console.error('  ' + h.t + '\n    held as ' + h.held + ' by ' + h.s.runId + ' (' + h.s.skill + ', phase ' + h.s.phase + ', ' + h.s._staleMin + 'm since heartbeat)');
  process.exit(3);
}

function cmdLock() {
  const name = positionals()[0] || die('lock needs a name, e.g. `lock commit --run <id>`');
  const runId = one('run') || die('lock needs --run <id>');
  const ttl = Number(one('ttl')) || LOCK_TTL_S;
  const waitS = flag('wait') ? (Number(one('wait')) || 600) : 0;
  ensure();
  const file = lockFile(name);
  const deadline = Date.now() + waitS * 1000;

  for (;;) {
    try {
      const fd = fs.openSync(file, 'wx');                     // atomic: create-or-fail
      fs.writeFileSync(fd, JSON.stringify({ runId, pid: process.pid, acquiredAt: nowISO(), ttl }, null, 2) + '\n');
      fs.closeSync(fd);
      console.log("acquired lock '" + name + "' for " + runId + ' (ttl ' + ttl + 's)');
      console.log('RELEASE IT: node scripts/run-board.mjs unlock ' + name + ' --run ' + runId);
      return 0;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      const held = readJSON(file) || {};
      if (held.runId === runId) { console.log("lock '" + name + "' already held by " + runId + ' (reentrant, no-op)'); return 0; }
      const ageS = (Date.now() - Date.parse(held.acquiredAt || 0)) / 1000;
      // Two independent reasons to reclaim, and neither is "the clock ran out" alone:
      // the owner is gone, or the owner is past its ttl with no beat since it acquired.
      // A demonstrably-working owner is never superseded on age.
      const ownerGone = !holderRunLive(held);
      const pastTtlAndQuiet = ageS > (held.ttl || LOCK_TTL_S) && !holderBeatSinceAcquire(held);
      const breakable = ownerGone || pastTtlAndQuiet;
      if (breakable) {
        console.error("warn: breaking lock '" + name + "' held by " + held.runId + ' (' + Math.round(ageS) + 's old; ' + (ownerGone ? 'holder has no recent heartbeat' : 'past ttl with no beat since it acquired') + ').');
        try { fs.unlinkSync(file); } catch { /* a racing breaker won; loop and retry */ }
        continue;
      }
      if (Date.now() >= deadline) {
        console.error("CONTENDED - lock '" + name + "' held by " + held.runId + ' (pid ' + held.pid + ', ' + Math.round(ageS) + 's old).');
        if (!waitS) console.error('  Retry with --wait <secs> to block, or do the unserialized part of your work first.');
        process.exit(3);
      }
      sleep(3000);
    }
  }
}

function cmdUnlock() {
  const name = positionals()[0] || die('unlock needs a name');
  const runId = one('run') || die('unlock needs --run <id>');
  const file = lockFile(name);
  const held = readJSON(file);
  if (!held) { console.log("lock '" + name + "' was not held."); return 0; }
  if (held.runId !== runId && !flag('force')) {
    console.error("CONTENDED - lock '" + name + "' is held by " + held.runId + ', not ' + runId + '. Use --force only if you know that run is dead.');
    process.exit(3);
  }
  fs.unlinkSync(file);
  console.log("released lock '" + name + "'");
  return 0;
}

function cmdRelease() {
  const runId = one('run') || die('release needs --run <id>');
  const file = runFile(runId);
  for (const l of readLocks()) {
    if (l.runId === runId) { fs.unlinkSync(lockFile(l.name)); console.log("released dangling lock '" + l.name + "'"); }
  }
  if (!fs.existsSync(file)) { console.log('no record for ' + runId + '; nothing to release.'); return 0; }
  fs.unlinkSync(file);
  console.log('released ' + runId);
  return 0;
}

function cmdGc() {
  let n = 0;
  for (const r of loadRuns()) {
    if (r._live) continue;
    fs.unlinkSync(r._file); n++;
    console.log('reaped ' + r.runId + ' (status ' + r.status + ', ' + r._staleMin + 'm since heartbeat)');
  }
  for (const l of readLocks()) {
    if (!l._breakable) continue;
    fs.unlinkSync(lockFile(l.name)); n++;
    console.log("reaped lock '" + l.name + "' (holder " + l.runId + ')');
  }
  console.log(n ? 'gc: reaped ' + n + '.' : 'gc: nothing to reap.');
  return 0;
}

/* ---------------------------------------------------------------- entry */

const TABLE = {
  claim: cmdClaim, beat: cmdBeat, update: cmdBeat, list: cmdList, status: cmdList,
  check: cmdCheck, lock: cmdLock, unlock: cmdUnlock, release: cmdRelease, gc: cmdGc,
};

if (!cmd || cmd === '--help' || cmd === '-h' || !TABLE[cmd]) {
  const header = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0].replace(/^#!.*\n/, '');
  console.error(header);
  process.exit(cmd && cmd !== '--help' && cmd !== '-h' ? 1 : 0);
}
process.exit(TABLE[cmd]() || 0);
