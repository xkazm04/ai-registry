// librarian-scan --check-weights / --stamp-weights. The 2026-10-25 gates probe found a
// second, drifted stamped block passing (only the first was read) and a CRLF standard.md
// reading as drift. The script resolves librarian/standard.md from its own location, so
// each case runs a copy of it in a temp registry holding a copy of the real standard.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const OPEN = '<!-- weights: stamped by scripts/librarian-scan.mjs --weights; edit the script, then re-stamp -->';
const CLOSE = '<!-- /weights -->';

function registry(t, mutate = (s) => s) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'librarian-weights-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.cpSync(path.join(root, 'scripts/lib'), path.join(dir, 'scripts/lib'), { recursive: true });
  fs.copyFileSync(path.join(root, 'scripts/librarian-scan.mjs'), path.join(dir, 'scripts/librarian-scan.mjs'));
  fs.mkdirSync(path.join(dir, 'knowledge'));
  fs.mkdirSync(path.join(dir, 'skills'));
  fs.writeFileSync(path.join(dir, 'identity-aliases.json'), JSON.stringify({ schema: 1 }));
  fs.mkdirSync(path.join(dir, 'librarian'));
  const standard = fs.readFileSync(path.join(root, 'librarian/standard.md'), 'utf8').replace(/\r\n/g, '\n');
  fs.writeFileSync(path.join(dir, 'librarian/standard.md'), mutate(standard));
  return dir;
}
const run = (dir, ...flags) => spawnSync(process.execPath, [path.join(dir, 'scripts/librarian-scan.mjs'), ...flags], { encoding: 'utf8' });

/**
 * One bundle, one subject, so the SCAN half runs to completion (an empty knowledge/ exits 2
 * before any scoring, which would let a broken case pass for the wrong reason).
 * `apps` maps an application file name to its frontmatter lines.
 */
function bundle(dir, apps = { 'node--a.md': ['stack: node', 'verified_on: 2026-01-01'] }) {
  const subj = path.join(dir, 'knowledge/demo/alpha');
  fs.mkdirSync(path.join(subj, 'techniques'), { recursive: true });
  fs.mkdirSync(path.join(subj, 'applications'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'knowledge/demo/index.json'), JSON.stringify({ subjects: { alpha: { file: 'knowledge/demo/alpha/alpha.md' } } }));
  fs.writeFileSync(path.join(subj, 'alpha.md'), '---\nslug: alpha\nstatus: forged\n---\nbody\n');
  for (const t of ['t1', 't2', 't3', 't4']) fs.writeFileSync(path.join(subj, 'techniques', `${t}.md`), `---\nuse_when: [a case]\n---\nbody\n`);
  for (const [f, fm] of Object.entries(apps)) fs.writeFileSync(path.join(subj, 'applications', f), `---\n${fm.join('\n')}\n---\nbody\n`);
  return dir;
}
const scan = (dir) => {
  const r = run(dir, '--json');
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout).subjects.find((s) => s.id === 'demo/alpha');
};
const isoIn = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

test('control: the fixture bundle scans (exit 0)', (t) => {
  assert.equal(scan(bundle(registry(t))).applications, 1);
});

test('the at-risk window is check-currency\'s: 0 through 30 days left inclusive, then expired', (t) => {
  const at = (days) => scan(bundle(registry(t), { 'node--a.md': ['stack: node', `refresh_by: ${isoIn(days)}`] }));
  for (const [days, expired, atRisk] of [[31, 0, 0], [30, 0, 1], [0, 0, 1], [-1, 1, 0]]) {
    const s = at(days);
    assert.deepEqual([s.expired, s.atRisk], [expired, atRisk], `refresh_by in ${days} day(s)`);
  }
});

test('a quoted scalar reads as its value, as check-currency reads it', (t) => {
  const s = scan(bundle(registry(t), {
    'node--a.md': ['stack: "node"', `refresh_by: "${isoIn(400)}"`, "verified_on: '2026-01-01'"],
    // recent on purpose: with no refresh_by this one rides the derived clock, and a fixed
    // 2026-02-01 would be expired by now and fail the assertion below for the wrong reason
    'node--b.md': ['stack: node', `verified_on: ${isoIn(-5)}`],
  }));
  assert.equal(s.expired, 0, 'a quoted future clock is not expired');
  assert.deepEqual(s.stacks, ['node'], 'one stack, however it is spelled');
  assert.equal(s.oldestVerifiedOn, '2026-01-01');
});

test('an unknown argument refuses (exit 2): a typo of --check-weights must not run the scan and pass', (t) => {
  const dir = bundle(registry(t));
  for (const args of [['--check-weight'], ['--jsn'], ['--top', 'abc'], ['--top'], ['--top', '0'], ['--domain']]) {
    const r = run(dir, ...args);
    assert.equal(r.status, 2, `${args.join(' ')}: exit ${r.status}\n${r.stdout.slice(0, 200)}`);
    assert.match(r.stderr, /librarian-scan/);
  }
  assert.equal(run(dir, '--top', '3', '--domain', 'demo').status, 0);
});
const standardOf = (dir) => fs.readFileSync(path.join(dir, 'librarian/standard.md'), 'utf8');
const stampedBlock = (s) => s.slice(s.indexOf(OPEN), s.indexOf(CLOSE) + CLOSE.length);
const drifted = (s) => `${s}\n${stampedBlock(s).replace(/\| (\d+)/, (m, n) => `| ${Number(n) + 7}`)}\n`;

test('clean control: an LF copy of the standard checks clean (exit 0)', (t) => {
  const r = run(registry(t), '--check-weights');
  assert.equal(r.status, 0, r.stderr);
});

test('a CRLF standard.md is not drift (exit 0), and stamping keeps its CRLF', (t) => {
  const dir = registry(t, (s) => s.replace(/\n/g, '\r\n'));
  assert.equal(run(dir, '--check-weights').status, 0);
  fs.writeFileSync(path.join(dir, 'librarian/standard.md'), standardOf(dir).replace(/\| (\d+)/, '| 999'));
  assert.equal(run(dir, '--check-weights').status, 1, 'a real drift still fails under CRLF');
  assert.equal(run(dir, '--stamp-weights').status, 0);
  assert.equal(run(dir, '--check-weights').status, 0);
  assert.ok(!/[^\r]\n/.test(standardOf(dir)), 'every line still ends in CRLF');
});

test('a second, drifted stamped block fails --check-weights (exit 1)', (t) => {
  const dir = registry(t, drifted);
  const r = run(dir, '--check-weights');
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /2 open and 2 close weights marker/);
});

test('--stamp-weights refuses to guess over two blocks (exit 2) and writes nothing', (t) => {
  const dir = registry(t, drifted);
  const before = standardOf(dir);
  assert.equal(run(dir, '--stamp-weights').status, 2);
  assert.equal(standardOf(dir), before);
});
