/**
 * check-skills `--since <ref>` version discipline, against a throwaway git repo.
 *
 * The canary for the 2026-10-25 gates scan: `--since` diffed `ref...HEAD` only, so
 * `--since HEAD` examined nothing and `--since <ref>` skipped every dirty or
 * untracked file once one committed change existed. Each case plants the exact
 * shape the probe found and asserts the exit code directly; the clean control and
 * the bumped edit assert 0 so a gate that goes red on everything also fails here.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));

const skillMd = (name, version, body = 'Do the thing.') => [
  '---',
  `name: ${name}`,
  `description: "Fixture skill ${name} for the version-discipline test."`,
  'category: other',
  'memory: none',
  `version: ${version}`,
  '---',
  '',
  `# ${name}`,
  '',
  body,
  '',
].join('\n');

function fixture(t) {
  const tmp = fs.realpathSync(os.tmpdir());
  const dir = fs.mkdtempSync(path.join(tmp, 'check-skills-version-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.copyFileSync(path.join(ROOT, 'scripts/check-skills.mjs'), path.join(dir, 'scripts/check-skills.mjs'));
  fs.cpSync(path.join(ROOT, 'scripts/lib'), path.join(dir, 'scripts/lib'), { recursive: true });
  for (const name of ['alpha', 'beta']) {
    fs.mkdirSync(path.join(dir, 'skills', name), { recursive: true });
    fs.writeFileSync(path.join(dir, 'skills', name, 'SKILL.md'), skillMd(name, '1.0.0'));
  }
  const git = (...args) => execFileSync('git', ['-C', dir, '-c', 'core.autocrlf=false', ...args], { encoding: 'utf8' });
  git('init', '-q');
  git('config', 'user.email', 't@example.invalid');
  git('config', 'user.name', 't');
  git('add', '-A');
  git('commit', '-qm', 'base');
  const base = git('rev-parse', 'HEAD').trim();
  const write = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), text);
  };
  const commit = (msg) => { git('add', '-A'); git('commit', '-qm', msg); };
  const run = (...args) => {
    const r = spawnSync(process.execPath, ['scripts/check-skills.mjs', ...args], { cwd: dir, encoding: 'utf8' });
    if (r.error) throw r.error;
    return r;
  };
  return { base, write, commit, run };
}

test('control: a clean tree under --since HEAD reports 0 changed and exits 0', (t) => {
  const f = fixture(t);
  const r = f.run('--since', 'HEAD');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /version discipline: 0 changed skill/);
});

test('an unbumped committed edit AND an unbumped dirty edit both fail under --since <ref>', (t) => {
  const f = fixture(t);
  f.write('skills/alpha/SKILL.md', skillMd('alpha', '1.0.0', 'Committed change.'));
  f.commit('alpha unbumped');
  f.write('skills/beta/SKILL.md', skillMd('beta', '1.0.0', 'Dirty change.'));
  const r = f.run('--since', f.base);
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /skills\/alpha: content changed/);
  assert.match(r.stderr, /skills\/beta: content changed/, 'dirty work beside a committed change must not be skipped');
});

test('a dirty-only unbumped edit fails under --since HEAD', (t) => {
  const f = fixture(t);
  f.write('skills/beta/SKILL.md', skillMd('beta', '1.0.0', 'Dirty change.'));
  const r = f.run('--since', 'HEAD');
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /skills\/beta: content changed \(SKILL\.md\)/);
});

test('an untracked file inside a skill counts as content under --since HEAD', (t) => {
  const f = fixture(t);
  f.write('skills/alpha/references/new.md', '# new reference\n');
  const r = f.run('--since', 'HEAD');
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /skills\/alpha: content changed \(references\/new\.md\)/);
});

// git prints a path with a non-ASCII byte C-quoted (`"skills/alpha/caf\303\251.md"`)
// unless asked for -z, and a quoted line never matches `^skills/`. Measured 2026-10-25:
// an unbumped committed edit to `references/café.md` reported `0 changed skill(s)`, exit 0.
test('a non-ASCII file name counts as content, committed or untracked', (t) => {
  const f = fixture(t);
  f.write('skills/alpha/references/café.md', '# committed\n');
  f.commit('alpha non-ascii reference, unbumped');
  f.write('skills/beta/references/über.md', '# untracked\n');
  const r = f.run('--since', f.base);
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /skills\/alpha: content changed \(references\/café\.md\)/);
  assert.match(r.stderr, /skills\/beta: content changed \(references\/über\.md\)/);
});

test('bumped committed and dirty edits pass; a LESSONS.md append needs no bump', (t) => {
  const f = fixture(t);
  f.write('skills/alpha/SKILL.md', skillMd('alpha', '1.0.1', 'Committed change.'));
  f.commit('alpha bumped');
  f.write('skills/beta/SKILL.md', skillMd('beta', '1.1.0', 'Dirty change.'));
  f.write('skills/alpha/LESSONS.md', '# Lessons\n\n## 1.0.1 - 2026-10-25 - fixture\n\n- a lesson\n');
  const r = f.run('--since', f.base);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /version discipline: 2 changed skill/);
});

test('a version that goes backwards in the working tree fails', (t) => {
  const f = fixture(t);
  f.write('skills/alpha/SKILL.md', skillMd('alpha', '0.9.0', 'Dirty change.'));
  const r = f.run('--since', 'HEAD');
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /version went BACKWARDS/);
});

test('an unresolvable --since ref is could-not-run (exit 2)', (t) => {
  const f = fixture(t);
  const r = f.run('--since', 'no-such-ref');
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stderr, /does not resolve/);
});

// The CI half of the same gap: the version step sat under `if: pull_request` while
// work lands on main by push, and a skipped step reads as a green job. Text-level on
// purpose (no YAML parser here); comment lines are stripped before matching.
test('CI binds version discipline to push as well as pull_request, in every workflow that runs it', () => {
  for (const [file, checks] of [
    ['registry.yml', ['check-skills', 'check-recipes']],
    ['skills.yml', ['check-skills']],
    ['recipes.yml', ['check-recipes']],
  ]) {
    const raw = fs.readFileSync(path.join(ROOT, '.github/workflows', file), 'utf8');
    const content = raw.split(/\r?\n/).filter((l) => !l.trim().startsWith('#')).join('\n');
    assert.doesNotMatch(content, /^\s*if:.*pull_request/m, `${file}: a PR-only condition skips version discipline on push`);
    assert.match(content, /github\.event\.before/, `${file}: push must compare against github.event.before`);
    assert.match(content, /^\s*push:/m, `${file}: no push trigger`);
    for (const c of checks) assert.ok(content.includes(`node scripts/${c}.mjs --since "$BASE_SHA"`), `${file}: ${c} --since is not run`);
  }
});
