// node --test skills/scan-sweep/tests/entry-link.test.mjs
// Why: every path SKILL.md prints runs a script through the skill LINK (.claude/skills/scan-sweep is a
// junction/symlink into the registry). On 2026-10-30 (personas, 4.9.0) door.mjs and rank.mjs exited 0
// with NO output through it - their main-guard compared process.argv[1] (the link path) with
// import.meta.url (Node resolves the main module to its real path), so `main` never ran and
// trust.json came out empty. This test invokes every CLI script through a junction in a temp dir and
// asserts real output, so a silent no-op cannot come back.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, symlinkSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL = fileURLToPath(new URL('..', import.meta.url));
const made = [];
const scratch = (p) => { const d = mkdtempSync(join(tmpdir(), p)); made.push(d); return d; };
after(() => { for (const d of made) rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });

/** A temp dir holding `scan-sweep` -> the real skill dir (a junction on Windows, a symlink elsewhere). */
function linked() {
  const dir = scratch('scan-sweep-link-');
  const link = join(dir, 'scan-sweep');
  symlinkSync(SKILL, link, 'junction');
  return link;
}

function run(script, args, { home, cwd } = {}) {
  const env = { ...process.env };
  if (home) Object.assign(env, { HOME: home, USERPROFILE: home, PERSONAS_HANDSHAKE: join(home, '.personas', 'local-http.json') });
  return spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', env, cwd, windowsHide: true });
}

test('door.mjs through the link: the CLI runs (no handshake -> reachable:false JSON, exit 3), not a silent exit 0', () => {
  const link = linked();
  const home = scratch('scan-sweep-link-home-');
  const r = run(join(link, 'scripts', 'door.mjs'), ['trust', '--repo', home], { home });
  assert.notEqual(r.stdout.trim(), '', `no output through the link (exit ${r.status}): the main-guard did not fire`);
  assert.equal(JSON.parse(r.stdout).reachable, false);
  assert.equal(r.status, 3);
});

test('rank.mjs through the link: the CLI ranks and prints its summary', () => {
  const link = linked();
  const dir = scratch('scan-sweep-link-rank-');
  const file = join(dir, 'f.jsonl');
  writeFileSync(file, `${JSON.stringify({ lens: 'a', title: 'one', impact: 5, effort: 2 })}\n`);
  const r = run(join(link, 'scripts', 'rank.mjs'), ['--file', file, '--cap', '4', '--json']);
  assert.equal(r.status, 0, r.stderr);
  assert.notEqual(r.stdout.trim(), '', 'no output through the link: the main-guard did not fire');
  assert.equal(JSON.parse(r.stdout).ranked, 1);
});

test('coverage.mjs through the link: prints the table', () => {
  const link = linked();
  const dir = scratch('scan-sweep-link-cov-');
  writeFileSync(join(dir, 'context-map.json'), JSON.stringify({ contexts: [{ name: 'core', group: 'G', file_paths: ['a.mjs'] }] }));
  mkdirSync(join(dir, '.claude', 'scan-history'), { recursive: true });
  const r = run(join(link, 'scripts', 'coverage.mjs'), ['--json'], { cwd: dir });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(r.stdout).contexts, 1);
});

test('approvals.mjs through the link: argument checking runs (usage, exit 2)', () => {
  const link = linked();
  const r = run(join(link, 'scripts', 'approvals.mjs'), []);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /usage: approvals\.mjs/);
});
