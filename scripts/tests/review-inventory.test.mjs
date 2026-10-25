// review-inventory is one of the three verify commands AGENTS.md names, and the checkout it
// runs in hosts concurrent sessions: a tracked file deleted in the working tree (a move in
// flight, a sibling's unstaged removal) used to throw ENOENT out of lstat and turn the whole
// inventory into FATAL. It now counts such entries and says so. Runs on a temp git repo.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const made = [];
after(() => { for (const d of made) fs.rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });

const git = (cwd, ...args) => {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`);
};

function repo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'review-inventory-'));
  made.push(root);
  fs.mkdirSync(path.join(root, 'scripts', 'lib'), { recursive: true });
  for (const f of ['review-inventory.mjs', 'lib/exit-codes.mjs']) fs.copyFileSync(path.join(SCRIPTS, f), path.join(root, 'scripts', f));
  fs.mkdirSync(path.join(root, 'docs'));
  fs.writeFileSync(path.join(root, 'docs', 'kept.md'), '# kept\n');
  fs.writeFileSync(path.join(root, 'docs', 'gone.md'), '# gone\n');
  git(root, 'init', '-q');
  git(root, 'add', '.');
  git(root, '-c', 'user.email=t@example.invalid', '-c', 'user.name=t', '-c', 'commit.gpgsign=false', 'commit', '-q', '-m', 'fixture');
  return root;
}

const run = (root) => spawnSync(process.execPath, [path.join(root, 'scripts', 'review-inventory.mjs')], { cwd: root, encoding: 'utf8' });

test('a tracked file missing from the working tree is counted, not fatal', () => {
  const root = repo();
  fs.rmSync(path.join(root, 'docs', 'gone.md'));
  const r = run(root);
  assert.equal(r.status, 0, r.stderr);
  const j = JSON.parse(r.stdout);
  assert.deepEqual(j.missingFromWorkingTree, ['docs/gone.md']);
  assert.equal(j.groups.find((g) => g.path === 'docs').files, 1);
});

test('control: a clean checkout reports no missing entries', () => {
  const r = run(repo());
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(r.stdout).missingFromWorkingTree, []);
});
