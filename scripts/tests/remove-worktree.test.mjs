// Tests for scripts/remove-worktree.mjs - the refusals are the safety, so each one is pinned
// against a throwaway repository with a linked worktree in a temp dir. Git runs with no
// system or global config, so a developer's own settings cannot change what "clean" means.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../remove-worktree.mjs', import.meta.url));

function sandbox(t) {
  const temp = fs.realpathSync(os.tmpdir());
  const base = fs.mkdtempSync(path.join(temp, 'rm-wt-test-'));
  t.after(() => {
    const rel = path.relative(temp, fs.realpathSync(base));
    if (!rel.startsWith('rm-wt-test-') || rel.includes(path.sep)) throw new Error('unsafe cleanup');
    fs.rmSync(base, { recursive: true, force: true });
  });
  const globalCfg = path.join(base, 'gitconfig');
  fs.writeFileSync(globalCfg, '[user]\n\tname = t\n\temail = t@example.invalid\n[init]\n\tdefaultBranch = main\n');
  const env = { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: globalCfg };
  for (const k of Object.keys(env)) if (k.startsWith('GIT_') && !['GIT_CONFIG_NOSYSTEM', 'GIT_CONFIG_GLOBAL'].includes(k)) delete env[k];
  const repo = path.join(base, 'repo');
  const wt = path.join(base, 'wt');
  const git = (cwd, ...a) => execFileSync('git', a, { cwd, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  fs.mkdirSync(repo);
  git(repo, 'init', '-q');
  fs.writeFileSync(path.join(repo, 'tracked.txt'), 't\n');
  fs.writeFileSync(path.join(repo, '.gitignore'), 'node_modules\n');
  git(repo, 'add', '.'); git(repo, 'commit', '-qm', 'base');
  git(repo, 'worktree', 'add', '-q', '-b', 'side', wt);
  const run = (...args) => {
    const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd: base, env, encoding: 'utf8' });
    return { status: r.status, out: r.stdout ?? '', err: r.stderr ?? '' };
  };
  const listed = () => git(repo, 'worktree', 'list', '--porcelain').split(/\r?\n/).filter((l) => l.startsWith('worktree ')).length;
  return { base, repo, wt, git, run, listed };
}

test('a clean linked worktree is removed and pruned; the primary is untouched', (t) => {
  const s = sandbox(t);
  assert.equal(s.listed(), 2);
  const r = s.run(s.wt);
  assert.equal(r.status, 0, r.out + r.err);
  assert.equal(fs.existsSync(s.wt), false);
  assert.equal(s.listed(), 1, 'the admin entry is pruned');
  assert.equal(fs.readFileSync(path.join(s.repo, 'tracked.txt'), 'utf8'), 't\n');
});

test('a modified tracked file refuses, and the worktree stays whole', (t) => {
  const s = sandbox(t);
  fs.writeFileSync(path.join(s.wt, 'tracked.txt'), 'edited\n');
  const r = s.run(s.wt);
  assert.equal(r.status, 1, r.out + r.err);
  assert.match(r.err, /refused: worktree has uncommitted changes/);
  assert.equal(fs.readFileSync(path.join(s.wt, 'tracked.txt'), 'utf8'), 'edited\n');
});

test('an untracked file refuses', (t) => {
  const s = sandbox(t);
  fs.writeFileSync(path.join(s.wt, 'new.txt'), 'only copy\n');
  const r = s.run(s.wt);
  assert.equal(r.status, 1, r.out + r.err);
  assert.equal(fs.readFileSync(path.join(s.wt, 'new.txt'), 'utf8'), 'only copy\n');
});

test('a locked worktree refuses', (t) => {
  const s = sandbox(t);
  s.git(s.repo, 'worktree', 'lock', s.wt);
  const r = s.run(s.wt);
  assert.equal(r.status, 1, r.out + r.err);
  assert.match(r.err, /locked/);
  assert.equal(fs.existsSync(path.join(s.wt, 'tracked.txt')), true);
});

test('the primary checkout is refused: its .git is a directory, not a link file', (t) => {
  const s = sandbox(t);
  const r = s.run(s.repo);
  assert.equal(r.status, 1, r.out + r.err);
  assert.match(r.err, /not a linked worktree/);
  assert.equal(fs.existsSync(path.join(s.repo, 'tracked.txt')), true);
});

test('a directory that is not registered as a worktree is refused', (t) => {
  const s = sandbox(t);
  const stray = path.join(s.base, 'stray');
  fs.mkdirSync(stray);
  fs.writeFileSync(path.join(stray, '.git'), `gitdir: ${path.join(s.repo, '.git', 'worktrees', 'wt')}\n`);
  fs.writeFileSync(path.join(stray, 'keep.txt'), 'k\n');
  const r = s.run(stray);
  assert.equal(r.status, 1, r.out + r.err);
  assert.equal(fs.existsSync(path.join(stray, 'keep.txt')), true);
});

test('a link inside the worktree is unlinked, and what it points at survives', (t) => {
  const s = sandbox(t);
  const outside = path.join(s.base, 'shared-store');
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(outside, 'precious.txt'), 'keep me');
  const link = path.join(s.wt, 'node_modules');
  if (process.platform === 'win32') execFileSync('cmd', ['/c', 'mklink', '/J', link, outside], { stdio: 'ignore' });
  else fs.symlinkSync(outside, link, 'dir');
  const r = s.run(s.wt);
  assert.equal(r.status, 0, r.out + r.err);
  assert.equal(fs.existsSync(s.wt), false);
  assert.equal(fs.readFileSync(path.join(outside, 'precious.txt'), 'utf8'), 'keep me');
});

test('--dry-run deletes nothing, and no target is a usage error', (t) => {
  const s = sandbox(t);
  const dry = s.run(s.wt, '--dry-run');
  assert.equal(dry.status, 0, dry.out + dry.err);
  assert.equal(fs.existsSync(path.join(s.wt, 'tracked.txt')), true);
  assert.equal(s.listed(), 2);
  assert.equal(s.run().status, 2);
});
