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
  for (const file of ['check-recipes.mjs', 'render-recipes.mjs', 'build-recipes-index.mjs']) {
    fs.copyFileSync(path.join(ROOT, 'scripts', file), path.join(dir, 'scripts', file));
  }
  fs.cpSync(path.join(ROOT, 'scripts/lib'), path.join(dir, 'scripts/lib'), { recursive: true });
  for (const rel of [A, B]) fs.cpSync(path.join(ROOT, rel), path.join(dir, rel), { recursive: true });
  // The flagless form also runs the index freshness check, so the fixture carries a fresh index.
  const built = spawnSync(process.execPath, ['scripts/build-recipes-index.mjs'], { cwd: dir, encoding: 'utf8' });
  assert.equal(built.status, 0, built.stderr);
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
  return { dir, base, touch, bump, commit, run };
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

// git C-quotes a path with a non-ASCII byte unless asked for -z, and the quoted line
// never matched `^recipes/`: an unbumped example named `café.md` was 0 changed recipes.
test('a non-ASCII file name counts as content, committed or untracked', (t) => {
  const f = fixture(t);
  f.touch(A, 'café.md');
  f.commit('A non-ascii example, unbumped');
  f.touch(B, 'über.md');
  const r = f.run('--since', f.base);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /skill-library-audit: content changed \(examples\/café\.md\)/);
  assert.match(r.stderr, /audio-briefing-production: content changed \(examples\/über\.md\)/);
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

// Copy that has to stay true: X1 moved the CI step to push AND pull_request, and gate.mjs
// says so; this gate still told the reader "CI runs it on every pull request". And a
// backwards version named only the new number, where check-skills names both.
test('the report says where version discipline runs, and a backwards version names both numbers', (t) => {
  const f = fixture(t);
  const plain = f.run();
  assert.equal(plain.status, 0, plain.stderr);
  assert.match(plain.stdout, /version discipline: NOT run \(--shape-only alone; run flagless for the working tree against the branch base, or pass --since <ref>\)/);
  f.touch(A, 'codebase.md');
  f.bump(A, '0.2.0');
  const r = f.run('--since', 'HEAD');
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /version went BACKWARDS, 0\.3\.1 -> 0\.2\.0/);
});

test('an unresolvable --since ref is could-not-run (exit 2)', (t) => {
  const f = fixture(t);
  const r = f.run('--since', 'no-such-ref');
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stderr, /does not resolve/);
});

// Closed flag set: `--since=x` or a typo'd `--snce` used to be ignored and the run exited
// 0 on a population the caller did not ask for. The fixture's `run` always adds --shape-only,
// so this spawns the script directly.
test('check-recipes refuses an unknown or malformed argument with exit 2 and answers --help with 0', (t) => {
  const f = fixture(t);
  const raw = (...args) => spawnSync(process.execPath, ['scripts/check-recipes.mjs', ...args], { cwd: f.dir, encoding: 'utf8' });
  assert.equal(raw('--shape-only').status, 0, 'plain shape-only run keeps its current exit');
  for (const bad of [['--bogus'], ['--since=HEAD'], ['--snce', 'HEAD'], ['--since'], ['--since', '--shape-only'], ['HEAD'], ['--shape-only', '--bogus']]) {
    const r = raw(...bad);
    assert.equal(r.status, 2, `${bad.join(' ')} -> ${r.status}: ${r.stdout}${r.stderr}`);
  }
  const h = raw('--help');
  assert.equal(h.status, 0, h.stderr);
  assert.match(h.stdout, /usage: node scripts\/check-recipes\.mjs/);
});

// The flagless form used to print "version discipline: NOT run" and exit 0 on an unbumped
// edit; check-skills already checks the working tree and index against HEAD by default.
// `--shape-only` alone stays shape-only (gate.mjs runs it before regenerating).
test('flagless check-recipes checks dirty and untracked edits against HEAD; --shape-only alone does not', (t) => {
  const f = fixture(t);
  const raw = (...args) => spawnSync(process.execPath, ['scripts/check-recipes.mjs', ...args], { cwd: f.dir, encoding: 'utf8' });
  const clean = raw();
  assert.equal(clean.status, 0, `clean control: ${clean.stdout}${clean.stderr}`);
  assert.match(clean.stdout, /version discipline: 0 changed recipe\(s\), uncommitted against HEAD/);
  f.touch(A, 'codebase.md');
  const dirty = raw();
  assert.equal(dirty.status, 1, dirty.stdout);
  assert.match(dirty.stderr, /skill-library-audit: content changed \(examples\/codebase\.md\)/);
  const shape = raw('--shape-only');
  assert.equal(shape.status, 0, `--shape-only alone must not run the version check: ${shape.stderr}`);
  assert.match(shape.stdout, /version discipline: NOT run/);
});

// ---- the flagless base. Against plain HEAD, every uncommitted edit made after a recipe's first
// bumped commit on a branch read as "unbumped". The flagless base is now the branch's upstream,
// else origin/main, else HEAD (the same default check-skills uses), printed. `--shape-only`
// alone stays shape-only.
function withRemote(t, f, { upstream }) {
  const bare = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'check-recipes-remote-'));
  t.after(() => fs.rmSync(bare, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', ['-C', f.dir, '-c', 'core.autocrlf=false', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  execFileSync('git', ['init', '-q', '--bare', bare]);
  git('remote', 'add', 'origin', bare);
  git('checkout', '-q', '-b', 'feat');
  if (upstream) git('push', '-q', '-u', 'origin', 'feat');
  else git('push', '-q', 'origin', 'HEAD:refs/heads/main');
  const raw = (...args) => spawnSync(process.execPath, ['scripts/check-recipes.mjs', ...args], { cwd: f.dir, encoding: 'utf8' });
  // The flagless form also checks index freshness, and the index records versions and hashes.
  raw.reindex = () => assert.equal(spawnSync(process.execPath, ['scripts/build-recipes-index.mjs'], { cwd: f.dir, encoding: 'utf8' }).status, 0);
  return raw;
}

test('flagless: a dirty edit after the branch already bumped the recipe against its upstream passes', (t) => {
  const f = fixture(t);
  const raw = withRemote(t, f, { upstream: true });
  f.touch(A, 'codebase.md');
  f.bump(A, '0.3.2');
  raw.reindex();
  f.commit('recipe A bumped');
  f.touch(A, 'follow-up.md'); // dirty, no further bump
  raw.reindex();
  const r = raw();
  assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
  assert.match(r.stdout, /version discipline: 1 changed recipe\(s\), changed against origin\/feat \(branch upstream;/);
  const old = raw('--since', 'HEAD'); // the previous base: the same tree is red
  assert.equal(old.status, 1, old.stdout);
  assert.match(old.stderr, /skill-library-audit: content changed/);
});

test('flagless: an unbumped recipe edited dirty still fails against the upstream', (t) => {
  const f = fixture(t);
  const raw = withRemote(t, f, { upstream: true });
  f.touch(A, 'codebase.md');
  f.bump(A, '0.3.2');
  raw.reindex();
  f.commit('recipe A bumped');
  f.touch(B, 'dirty.md');
  raw.reindex();
  const r = raw();
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /audio-briefing-production: content changed/);
  assert.doesNotMatch(r.stderr, /skill-library-audit: content changed/);
});

test('flagless: with no upstream, origin/main is the base; --shape-only alone still skips versions', (t) => {
  const f = fixture(t);
  const raw = withRemote(t, f, { upstream: false });
  f.touch(A, 'codebase.md');
  f.bump(A, '0.3.2');
  raw.reindex();
  f.commit('recipe A bumped');
  f.touch(A, 'follow-up.md');
  raw.reindex();
  const r = raw();
  assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
  assert.match(r.stdout, /changed against origin\/main \(origin\/main;/);
  f.touch(B, 'dirty.md');
  raw.reindex();
  assert.equal(raw().status, 1);
  const shape = raw('--shape-only');
  assert.equal(shape.status, 0, shape.stderr);
  assert.match(shape.stdout, /version discipline: NOT run/);
});
