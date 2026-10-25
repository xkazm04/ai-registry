/**
 * check-recipes `--since <ref>` version discipline, against a throwaway git repo.
 *
 * The canary for the 2026-10-25 gates scan: `--since` diffed `ref...HEAD` only and
 * refused just the "dirty, nothing committed" shape, so an unbumped dirty recipe
 * beside a committed one reported `recipes lane OK`. Two real recipes are copied
 * in; edits go to `examples/` (content, but outside the rendered view) so shape
 * stays clean and only version discipline can turn the run red. `--shape-only`
 * skips the index freshness subprocess, which is not under test here.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const A = 'recipes/software_engineering/engineering-records/skill-library-audit';
const B = 'recipes/creative_design/audio/audio-briefing-production';

function fixture(t) {
  const tmp = fs.realpathSync(os.tmpdir());
  const dir = fs.mkdtempSync(path.join(tmp, 'check-recipes-version-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, 'scripts'));
  for (const file of ['check-recipes.mjs', 'render-recipes.mjs']) {
    fs.copyFileSync(path.join(ROOT, 'scripts', file), path.join(dir, 'scripts', file));
  }
  fs.cpSync(path.join(ROOT, 'scripts/lib'), path.join(dir, 'scripts/lib'), { recursive: true });
  for (const rel of [A, B]) fs.cpSync(path.join(ROOT, rel), path.join(dir, rel), { recursive: true });
  const git = (...args) => execFileSync('git', ['-C', dir, '-c', 'core.autocrlf=false', ...args], { encoding: 'utf8' });
  git('init', '-q');
  git('config', 'user.email', 't@example.invalid');
  git('config', 'user.name', 't');
  git('add', '-A');
  git('commit', '-qm', 'base');
  const base = git('rev-parse', 'HEAD').trim();
  const touch = (rel, name = 'fixture-note.md') => {
    fs.mkdirSync(path.join(dir, rel, 'examples'), { recursive: true });
    fs.appendFileSync(path.join(dir, rel, 'examples', name), '\nA content change.\n');
  };
  const bump = (rel, version) => {
    const file = path.join(dir, rel, 'recipe.json');
    const obj = JSON.parse(fs.readFileSync(file, 'utf8'));
    obj.version = version;
    fs.writeFileSync(file, `${JSON.stringify(obj, null, 2)}\n`);
    const r = spawnSync(process.execPath, ['scripts/render-recipes.mjs'], { cwd: dir, encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
  };
  const commit = (msg) => { git('add', '-A'); git('commit', '-qm', msg); };
  const run = (...args) => {
    const r = spawnSync(process.execPath, ['scripts/check-recipes.mjs', '--shape-only', ...args], { cwd: dir, encoding: 'utf8' });
    if (r.error) throw r.error;
    return r;
  };
  return { base, touch, bump, commit, run };
}

test('control: a clean tree under --since HEAD reports 0 changed and exits 0', (t) => {
  const f = fixture(t);
  const r = f.run('--since', 'HEAD');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /version discipline: 0 changed recipe/);
});

test('an unbumped committed edit AND an unbumped dirty edit both fail under --since <ref>', (t) => {
  const f = fixture(t);
  f.touch(A, 'codebase.md');
  f.commit('A unbumped');
  f.touch(B, 'deepgram.md');
  const r = f.run('--since', f.base);
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /skill-library-audit: content changed/);
  assert.match(r.stderr, /audio-briefing-production: content changed/, 'dirty work beside a committed change must not be skipped');
});

test('a dirty-only unbumped edit fails under --since HEAD (was exit 2, now examined)', (t) => {
  const f = fixture(t);
  f.touch(B, 'deepgram.md');
  const r = f.run('--since', 'HEAD');
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /audio-briefing-production: content changed \(examples\/deepgram\.md\)/);
});

test('an untracked file inside a recipe counts as content under --since HEAD', (t) => {
  const f = fixture(t);
  f.touch(A, 'brand-new.md');
  const r = f.run('--since', 'HEAD');
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /skill-library-audit: content changed \(examples\/brand-new\.md\)/);
});

test('bumped committed and dirty edits pass', (t) => {
  const f = fixture(t);
  f.touch(A, 'codebase.md');
  f.bump(A, '0.3.2');
  f.commit('A bumped');
  f.touch(B, 'deepgram.md');
  f.bump(B, '0.3.0');
  const r = f.run('--since', f.base);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /version discipline: 2 changed recipe/);
});

test('an unresolvable --since ref is could-not-run (exit 2)', (t) => {
  const f = fixture(t);
  const r = f.run('--since', 'no-such-ref');
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stderr, /does not resolve/);
});
