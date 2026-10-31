// node --test skills/scan-sweep/tests/coverage.test.mjs
// Pins the two rules scripts/coverage.mjs owns alone: the --challenge cohort
// (references/challenge.md section 2) and that challenge lenses/snapshots never
// inflate the stabilize coverage ledger.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../scripts/coverage.mjs', import.meta.url));
// Every fixture dir is registered here and removed once, after the last test in the file.
const made = [];
const scratch = () => {
  const dir = mkdtempSync(join(tmpdir(), 'scan-sweep-cov-'));
  made.push(dir);
  return dir;
};
after(() => {
  if (process.env.KEEP_TMP) return;
  for (const dir of made) rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});

const files = (n) => Array.from({ length: n }, (_, i) => `src/f${i}.ts`);

function fixture(history) {
  const dir = scratch();
  writeFileSync(join(dir, 'context-map.json'), JSON.stringify({
    contexts: [
      { name: 'tiny', group: 'G1', file_paths: files(4) },
      { name: 'big-g1', group: 'G1', file_paths: files(30) },
      { name: 'mid-g1', group: 'G1', file_paths: files(20) },
      { name: 'big-g2', group: 'G2', file_paths: files(25) },
      { name: 'done-g3', group: 'G3', file_paths: files(40) },
      { name: 'fresh-g3', group: 'G3', file_paths: files(12) },
    ],
  }));
  mkdirSync(join(dir, '.claude', 'scan-history'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'scan-history', 'scan-sweep.jsonl'), history.map((h) => JSON.stringify(h)).join('\n') + '\n');
  return dir;
}
const run = (dir, ...args) => JSON.parse(execFileSync(process.execPath, [SCRIPT, ...args, '--json'], { cwd: dir, encoding: 'utf8' }));

test('cohort: >= 10 files, one per group, never-challenged and larger first', () => {
  const dir = fixture([
    { at: '2026-09-01T00:00:00Z', scope: 'done-g3', strategy: 'challenge', lens_keys: ['architecture-challenger', 'ux-elevation'] },
  ]);
  const { cohort } = run(dir, '--challenge', '--cohort', '6');
  assert.deepEqual(cohort.map((c) => c.name), ['big-g1', 'big-g2', 'fresh-g3']);
  assert.ok(!cohort.some((c) => c.name === 'tiny'));
});

test('riders: a small context rides with its group host; an all-small group is promoted', () => {
  const dir = scratch();
  writeFileSync(join(dir, 'context-map.json'), JSON.stringify({
    contexts: [
      { name: 'host', group: 'G1', file_paths: files(20) },
      { name: 'small-a', group: 'G1', file_paths: files(3) },
      { name: 'small-b', group: 'G1', file_paths: files(4) },
      { name: 'lonely-1', group: 'G2', file_paths: files(5) },
      { name: 'lonely-2', group: 'G2', file_paths: files(7) },
      { name: 'empty', group: 'G3', file_paths: [] },
    ],
  }));
  mkdirSync(join(dir, '.claude', 'scan-history'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'scan-history', 'scan-sweep.jsonl'), '');
  const { cohort, uncovered } = run(dir, '--challenge', '--riders', '1');
  const host = cohort.find((c) => c.name === 'host');
  assert.deepEqual(host.riders.map((r) => r.name), ['small-a'], 'riders are capped and in map order');
  const promoted = cohort.find((c) => c.group === 'G2');
  assert.equal(promoted.name, 'lonely-2', 'an all-small group promotes its largest context to host');
  assert.deepEqual(promoted.riders.map((r) => r.name), ['lonely-1']);
  assert.ok(!cohort.some((c) => c.name.startsWith('small')), 'a small context is never a host while its group has a big one left');
  assert.equal(uncovered, 5, 'zero-file contexts are not owed coverage');
});

test('--in-flight: a scouted-but-unclosed run keeps its hosts and riders out of the next cohort', () => {
  const dir = fixture([]);
  writeFileSync(join(dir, 'inflight.json'), JSON.stringify({ cohort: [{ name: 'big-g1', riders: [{ name: 'tiny' }] }] }));
  const plain = run(dir, '--challenge').cohort.map((c) => c.name);
  assert.ok(plain.includes('big-g1'), 'non-vacuity: without --in-flight the host is picked');
  const next = run(dir, '--challenge', '--in-flight', join(dir, 'inflight.json'));
  assert.ok(!next.cohort.some((c) => c.name === 'big-g1' || c.riders.some((r) => r.name === 'tiny')), 'in-flight host and rider are skipped');
  assert.ok(next.cohort.some((c) => c.name === 'mid-g1'), 'the group falls to its next unchallenged context');
});

test('cohort: --group lifts the one-per-group rule inside that group', () => {
  const { cohort } = run(fixture([]), '--challenge', '--group', 'G1');
  assert.deepEqual(cohort.map((c) => c.name), ['big-g1', 'mid-g1']);
});

test('challenge snapshots and lenses never count as stabilize coverage', () => {
  const dir = fixture([
    { at: '2026-09-01T00:00:00Z', scope: 'big-g2', strategy: 'challenge', lens_keys: ['architecture-challenger', 'ux-elevation'], findings: 2, fixed: 2 },
  ]);
  const out = run(dir);
  const row = out.rows.find((r) => r.name === 'big-g2');
  assert.equal(row.sweeps, 0, 'a challenge run must not make a context read as swept');
  assert.equal(row.lenses, 0);
  const ref = readFileSync(new URL('../references/lenses.md', import.meta.url), 'utf8');
  const all = (ref.match(/^## [a-z-]+ /gm) ?? []).length;
  const challenge = (ref.match(/^Group: challenge\s*$/gm) ?? []).length;
  assert.ok(challenge >= 2, 'the two challenge lenses are declared');
  assert.equal(run(dir, '--next').totalLenses, all - challenge, 'denominator excludes the Group: challenge lenses');
});

test('the lens count is derived from the reference headings, never a hardcoded number', () => {
  const dir = fixture([]);
  const shipped = readFileSync(new URL('../references/lenses.md', import.meta.url), 'utf8');
  const headings = (shipped.match(/^## [a-z-]+ /gm) ?? []).length;
  assert.ok(headings >= 30, `the shipped reference has ${headings} lens sections`);
  assert.notEqual(run(dir, '--next').totalLenses, 22, 'non-vacuity: the old fallback number is not what the shipped file yields');
  // A reference with three sections, one of them challenge: the denominator follows the file.
  const ref = join(dir, 'lenses.md');
  writeFileSync(ref, ['# x', '', '## alpha — A', '', 'Group: technical', '', '## beta — B', '', 'Group: user', '', '## gamma — G', '', 'Group: challenge', ''].join('\n'));
  assert.equal(run(dir, '--next', '--lenses', ref).totalLenses, 2);
  // An unreadable reference fails loudly instead of printing a guessed denominator.
  let status = 0;
  try { execFileSync(process.execPath, [SCRIPT, '--next', '--json', '--lenses', join(dir, 'missing.md')], { cwd: dir, encoding: 'utf8', stdio: 'pipe' }); } catch (e) { status = e.status; }
  assert.equal(status, 2);
});

test('--history reads a ledger outside the cwd (the main checkout\'s, when the worktree\'s copy is ignored)', () => {
  // personas 2026-10-30: .claude/scan-history/ was gitignored and lived in a worktree, so the ledger died
  // with it. SKILL.md section 10 now keeps it in the main checkout; the picker must be able to read it there.
  const dir = fixture([]);
  const main = scratch();
  const ledger = join(main, 'scan-sweep.jsonl');
  writeFileSync(ledger, `${JSON.stringify({ at: '2026-10-30T00:00:00Z', scope: 'tiny', strategy: 'stabilize', lens_keys: ['error-handler'] })}\n`);
  assert.equal(run(dir).rows.find((r) => r.name === 'tiny').sweeps, 0, 'non-vacuity: the cwd ledger is empty');
  assert.equal(run(dir, '--history', ledger).rows.find((r) => r.name === 'tiny').sweeps, 1);
});

test('--help prints usage and exits 0 without reading the map or printing the table', () => {
  // personas cycle 2: `coverage.mjs --help` printed the coverage table.
  const dir = scratch(); // no context map here: a help that read it would exit 2
  const out = execFileSync(process.execPath, [SCRIPT, '--help'], { cwd: dir, encoding: 'utf8' });
  assert.match(out, /usage: coverage\.mjs/);
  assert.doesNotMatch(out, /CONTEXT\s+FILES/);
});

// A git repo whose history carries two sweep rounds the ledger lost (the worktree holding it was removed).
function gitFixture() {
  const dir = fixture([]);
  const git = (...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_DATE: process.env.GIT_DATE, GIT_COMMITTER_DATE: process.env.GIT_DATE } });
  const commit = (msg, date) => {
    process.env.GIT_DATE = date;
    writeFileSync(join(dir, 'f.txt'), `${msg}\n${date}\n`);
    git('add', 'f.txt');
    git('-c', 'user.name=t', '-c', 'user.email=t@example.com', 'commit', '-q', '-m', msg);
  };
  git('init', '-q');
  commit('chore: initial', '2026-10-01T10:00:00Z');
  commit('fix(big-g1): guard the null row\n\nLens: error-handler', '2026-10-29T10:00:00Z');
  commit('test(big-g1): pin the guard', '2026-10-29T11:00:00Z');
  commit('fix(tiny): copy', '2026-10-30T09:00:00Z');
  commit('fix(not-a-context): ignored', '2026-10-30T09:30:00Z');
  delete process.env.GIT_DATE;
  return dir;
}

test('--rebuild-from-git reconstructs one sweep row per context per day, marked reconstructed, with no lens coverage', () => {
  const dir = gitFixture();
  const out = execFileSync(process.execPath, [SCRIPT, '--rebuild-from-git'], { cwd: dir, encoding: 'utf8' });
  const rows = out.trim().split('\n').map((l) => JSON.parse(l));
  assert.deepEqual(rows.map((r) => [r.scope, r.at.slice(0, 10), r.commits]), [['big-g1', '2026-10-29', 2], ['tiny', '2026-10-30', 1]]);
  for (const r of rows) {
    assert.equal(r.reconstructed, true);
    assert.deepEqual(r.lens_keys, [], 'git history does not say which lenses read the context');
    assert.equal(r.strategy, 'reconstructed');
  }
  // Nothing written without --write: the ledger is still empty.
  assert.equal(run(dir).rows.find((r) => r.name === 'big-g1').sweeps, 0);
});

test('--rebuild-from-git --write appends the rows once; the picker then stops re-picking those contexts as never swept', () => {
  const dir = gitFixture();
  execFileSync(process.execPath, [SCRIPT, '--rebuild-from-git', '--write'], { cwd: dir, encoding: 'utf8' });
  execFileSync(process.execPath, [SCRIPT, '--rebuild-from-git', '--write'], { cwd: dir, encoding: 'utf8' });
  const ledger = readFileSync(join(dir, '.claude', 'scan-history', 'scan-sweep.jsonl'), 'utf8').trim().split('\n').filter(Boolean);
  assert.equal(ledger.length, 2, 'a second rebuild adds nothing it already wrote');
  const r = run(dir);
  assert.equal(r.rows.find((x) => x.name === 'big-g1').sweeps, 1);
  assert.equal(r.rows.find((x) => x.name === 'big-g1').lenses, 0);
  assert.notEqual(r.next, 'big-g1', 'a reconstructed context is swept; never-swept ones come first');
});
