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
  return { dir, base, write, commit, run };
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

// ---- shape: frontmatter outside the lane's YAML subset. The shared parser drops or misreads
// such a line without a word, so `description: >-` measured as the string ">" and passed
// the 1,536-character routing cap at any length.
const withFrontmatter = (name, lines) => ['---', `name: ${name}`, ...lines, 'category: other', 'memory: none', 'version: 1.0.0', '---', '', `# ${name}`, ''].join('\n');

test('shape: a block-scalar description fails, even when the folded text is over the routing cap', (t) => {
  const f = fixture(t);
  f.write('skills/alpha/SKILL.md', withFrontmatter('alpha', ['description: >-', `  ${'word '.repeat(400).trim()}`]));
  f.commit('alpha folded description');
  const r = f.run();
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /skills\/alpha\/SKILL\.md:3: `description: >-` is a YAML block scalar/);
});

test('shape: an unindented list item fails; indented and inline lists pass', (t) => {
  const f = fixture(t);
  f.write('skills/alpha/SKILL.md', withFrontmatter('alpha', ['description: "Fixture skill alpha."', 'tags:', '- one', '- two']));
  f.write('skills/beta/SKILL.md', withFrontmatter('beta', ['description: "Fixture skill beta."', 'tags:', '  - one', 'argument-hint: [a, b]']));
  f.commit('list shapes');
  const r = f.run();
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /skills\/alpha\/SKILL\.md:5: frontmatter line "- one" is outside the lane's YAML subset/);
  assert.doesNotMatch(r.stderr, /skills\/beta/);
});

// ---- shape: the two named files, by exact case. A `lessons.md` is never read on a
// case-sensitive disk (0 lessons, no heading check) and is read under the wrong name on a
// case-insensitive one; `SKILL.MD` slipped the old check because it tested `.md` first.
test('shape: a LESSONS.md or SKILL.md in the wrong case fails', async (t) => {
  const f = fixture(t);
  f.write('skills/alpha/lessons.md', '# Lessons\n\n## 1.0.0 - 2026-10-25 - fixture\n\n- a lesson\n');
  f.commit('lowercase lessons');
  const r = f.run();
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /skills\/alpha\/lessons\.md: the lessons file must be named exactly LESSONS\.md/);
  const { subResourceFindings } = await import(new URL('../lib/skills-lane.mjs', import.meta.url));
  const fake = (rel) => subResourceFindings({ rel: 'skills/x', files: [{ rel, dir: false, size: 1 }] }).fails;
  assert.equal(fake('SKILL.MD').length, 1);
  assert.equal(fake('Lessons.MD').length, 1);
  assert.deepEqual(fake('SKILL.md'), []);
  assert.deepEqual(fake('LESSONS.md'), []);
  assert.deepEqual(fake('references/lessons.md'), [], 'only the top-level names are reserved');
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

// An unreadable LESSONS.md (here: a directory of that name) used to throw out of
// readSkill, and check-skills read the throw as "skills/ cannot be read" - exit 2 for
// the whole lane. The defect is one skill's, so it must fail that skill by name (exit 1).
test('a LESSONS.md that is a directory fails that skill by name, not the whole lane', (t) => {
  const f = fixture(t);
  const ctl = f.run();
  assert.equal(ctl.status, 0, `control must be green: ${ctl.stderr}`);
  fs.mkdirSync(path.join(f.dir, 'skills/alpha/LESSONS.md'));
  const r = f.run();
  assert.equal(r.status, 1, `${r.stdout}${r.stderr}`);
  assert.match(r.stderr, /skills\/alpha\/LESSONS\.md: cannot be read/);
  assert.doesNotMatch(r.stderr, /FATAL/);
});

// Closed flag set: an argument the CLI does not know used to be ignored, so
// `--since=origin/main` ran the flagless population and exited 0.
test('check-skills refuses an unknown or malformed argument with exit 2 and answers --help with 0', (t) => {
  const f = fixture(t);
  assert.equal(f.run().status, 0, 'plain run keeps its current exit');
  for (const bad of [['--bogus'], ['--since=HEAD'], ['--snce', 'HEAD'], ['--since'], ['--since', '--bogus'], ['HEAD']]) {
    const r = f.run(...bad);
    assert.equal(r.status, 2, `${bad.join(' ')} -> ${r.status}: ${r.stdout}${r.stderr}`);
  }
  const h = f.run('--help');
  assert.equal(h.status, 0, h.stderr);
  assert.match(h.stdout, /usage: node scripts\/check-skills\.mjs/);
});

// ---- the flagless base. Against plain HEAD, every uncommitted edit made after a skill's first
// bumped commit on a branch read as "unbumped" (the bump was already in HEAD), and two sweep
// rounds hit it. The flagless base is now the branch's upstream, else origin/main, else HEAD:
// the population `--since <that ref>` already checks, with the chosen base printed.
function remote(f, { upstream }) {
  const bare = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'check-skills-remote-'));
  const git = (...args) => execFileSync('git', ['-C', f.dir, '-c', 'core.autocrlf=false', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  execFileSync('git', ['init', '-q', '--bare', bare]);
  git('remote', 'add', 'origin', bare);
  git('checkout', '-q', '-b', 'feat');
  // `upstream` true: feat tracks origin/feat. False: only origin/main exists and feat tracks nothing.
  if (upstream) git('push', '-q', '-u', 'origin', 'feat');
  else git('push', '-q', 'origin', 'HEAD:refs/heads/main');
  return () => fs.rmSync(bare, { recursive: true, force: true });
}

test('flagless: a dirty edit after the branch already bumped the skill against its upstream passes', (t) => {
  const f = fixture(t);
  t.after(remote(f, { upstream: true }));
  f.write('skills/alpha/SKILL.md', skillMd('alpha', '1.0.1', 'Committed change.'));
  f.commit('alpha bumped');
  f.write('skills/alpha/SKILL.md', skillMd('alpha', '1.0.1', 'Committed change, then a dirty follow-up.'));
  const r = f.run();
  assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
  assert.match(r.stdout, /version discipline: 1 changed skill\(s\), changed against origin\/feat \(branch upstream;/);
  // Against HEAD, the old base, the same tree is red: this is the control that gives the pass meaning.
  const old = f.run('--since', 'HEAD');
  assert.equal(old.status, 1, old.stdout);
  assert.match(old.stderr, /skills\/alpha: content changed/);
});

test('flagless: an unbumped skill edited dirty still fails against the upstream', (t) => {
  const f = fixture(t);
  t.after(remote(f, { upstream: true }));
  f.write('skills/alpha/SKILL.md', skillMd('alpha', '1.0.1', 'Committed change.'));
  f.commit('alpha bumped');
  f.write('skills/beta/SKILL.md', skillMd('beta', '1.0.0', 'Dirty, unbumped.'));
  const r = f.run();
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /skills\/beta: content changed/);
  assert.doesNotMatch(r.stderr, /skills\/alpha: content changed/);
});

test('flagless: with no upstream, origin/main is the base', (t) => {
  const f = fixture(t);
  t.after(remote(f, { upstream: false }));
  f.write('skills/alpha/SKILL.md', skillMd('alpha', '1.0.1', 'Committed change.'));
  f.commit('alpha bumped');
  f.write('skills/alpha/SKILL.md', skillMd('alpha', '1.0.1', 'Dirty follow-up.'));
  const r = f.run();
  assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
  assert.match(r.stdout, /changed against origin\/main \(origin\/main;/);
  // ...and a branch commit that never bumped is caught, as it would be by CI's --since.
  f.write('skills/beta/SKILL.md', skillMd('beta', '1.0.0', 'Committed, unbumped.'));
  f.commit('beta unbumped');
  assert.equal(f.run().status, 1);
});

test('flagless: with neither upstream nor origin/main the base is HEAD, and says so', (t) => {
  const f = fixture(t);
  const r = f.run();
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /uncommitted against HEAD \(no upstream and no origin\/main resolve\)/);
});

test('flagless: an upstream whose history is unrelated to HEAD is skipped, not fatal', (t) => {
  const f = fixture(t);
  const bare = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'check-skills-unrelated-'));
  t.after(() => fs.rmSync(bare, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', ['-C', f.dir, '-c', 'core.autocrlf=false', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  execFileSync('git', ['init', '-q', '--bare', bare]);
  git('remote', 'add', 'origin', bare);
  // An orphan commit pushed as origin/main shares no ancestor with the fixture's HEAD.
  const home = git('rev-parse', '--abbrev-ref', 'HEAD').trim();
  git('checkout', '-q', '--orphan', 'other');
  git('commit', '-q', '--allow-empty', '-m', 'unrelated');
  git('push', '-q', 'origin', 'other:refs/heads/main');
  git('checkout', '-q', '-f', home);
  const r = f.run();
  assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
  assert.match(r.stdout, /uncommitted against HEAD \(no upstream and no origin\/main resolve\)/);
});
