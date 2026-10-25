// The generated-file merge driver, its regeneration step and its installer, exercised in
// throwaway git repos. Nothing here reads or writes the real checkout's config or hooks:
// every repo is a temp dir, git runs with no system or global config, and the generator
// set is replaced (REGISTRY_REGEN_GENERATORS, test-only) by a fake one-line generator.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { GENERATORS, GENERATED_PATHS, EXCLUDED, COMMIT_MESSAGE, PENDING_NAME, selectGenerators, globToRegExp } from '../regen-generated.mjs';
import { foldCatalog, CATALOG_OWNED, CATALOG_SKILL_CARRIED } from '../merge-generated.mjs';

const SCRIPTS = fileURLToPath(new URL('..', import.meta.url));
const REGISTRY = path.resolve(SCRIPTS, '..');
const INSTALLER = path.join(SCRIPTS, 'install-merge-driver.mjs');

const FAKE_GEN = `import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const src = path.join(root, 'src');
const out = {};
for (const f of fs.readdirSync(src).sort()) out[f] = fs.readFileSync(path.join(src, f), 'utf8').trim();
fs.mkdirSync(path.join(root, 'gen'), { recursive: true });
fs.writeFileSync(path.join(root, 'gen', 'out.json'), JSON.stringify(out) + '\\n');
`;
const FAKE_SET = JSON.stringify([{ script: 'fake-gen.mjs', paths: ['gen/*.json'] }]);

function sandbox(t) {
  const temp = fs.realpathSync(os.tmpdir());
  const base = fs.mkdtempSync(path.join(temp, 'merge-gen-test-'));
  t.after(() => {
    const rel = path.relative(temp, fs.realpathSync(base));
    if (!rel.startsWith('merge-gen-test-') || rel.includes(path.sep)) throw new Error('unsafe cleanup');
    fs.rmSync(base, { recursive: true, force: true });
  });
  const globalCfg = path.join(base, 'gitconfig');
  fs.writeFileSync(globalCfg, '[user]\n\tname = t\n\temail = t@example.invalid\n[init]\n\tdefaultBranch = main\n');
  const env = {
    ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: globalCfg,
    REGISTRY_REGEN_GENERATORS: FAKE_SET, REGISTRY_REGEN_ACTIVE: '',
  };
  delete env.REGISTRY_REGEN_ACTIVE;
  const repo = path.join(base, 'repo');
  const sh = (cmd, args, { extraEnv = {}, cwd = repo } = {}) => {
    const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', env: { ...env, ...extraEnv } });
    return { status: r.status, out: r.stdout ?? '', err: r.stderr ?? '', all: `${r.stdout ?? ''}${r.stderr ?? ''}` };
  };
  const git = (...args) => sh('git', args);
  const ok = (...args) => { const r = git(...args); assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.all}`); return r.out.trim(); };
  const node = (script, args = [], opts) => sh(process.execPath, [path.join(repo, 'scripts', script), ...args], opts);
  const write = (rel, text) => { fs.mkdirSync(path.dirname(path.join(repo, rel)), { recursive: true }); fs.writeFileSync(path.join(repo, rel), text); };
  const read = (rel) => fs.readFileSync(path.join(repo, rel), 'utf8');
  const gen = () => assert.equal(node('fake-gen.mjs').status, 0);
  return { base, repo, env, sh, git, ok, node, write, read, gen };
}

/**
 * base -> `side` changes src/a.txt, `main` changes src/b.txt; each regenerates and commits
 * source + generated together, as an agent does today. gen/out.json is ONE line, so the
 * two regenerations always collide textually.
 */
function diverged(t, { install = true, conflictOther = false } = {}) {
  const s = sandbox(t);
  fs.mkdirSync(s.repo);
  s.ok('init', '-q');
  for (const f of ['merge-generated.mjs', 'regen-generated.mjs', 'install-merge-driver.mjs', 'lib/exit-codes.mjs']) {
    s.write(`scripts/${f}`, fs.readFileSync(path.join(SCRIPTS, f), 'utf8'));
  }
  s.write('scripts/fake-gen.mjs', FAKE_GEN);
  s.write('.gitattributes', '* text=auto eol=lf\ngen/*.json merge=registry-generated\n');
  s.write('src/a.txt', 'a0\n'); s.write('src/b.txt', 'b0\n'); s.write('other.txt', 'o0\n');
  s.gen(); s.ok('add', '-A'); s.ok('commit', '-qm', 'base');
  s.ok('checkout', '-qb', 'side');
  s.write('src/a.txt', 'a1\n'); if (conflictOther) s.write('other.txt', 'side\n');
  s.gen(); s.ok('commit', '-qam', 'side: a1');
  s.ok('checkout', '-q', 'main');
  s.write('src/b.txt', 'b1\n'); if (conflictOther) s.write('other.txt', 'main\n');
  s.gen(); s.ok('commit', '-qam', 'main: b1');
  if (install) {
    const r = s.sh(process.execPath, [INSTALLER, '--install', '--repo', s.repo]);
    assert.equal(r.status, 0, r.all);
  }
  return s;
}

const FRESH = '{"a.txt":"a1","b.txt":"b1"}\n';
const pendingPath = (s) => path.join(s.ok('rev-parse', '--absolute-git-dir'), PENDING_NAME);
const filesOf = (s, rev) => s.ok('show', '--name-only', '--format=', rev).split('\n').filter(Boolean);

test('premise and fallback: an attribute naming an UNCONFIGURED driver conflicts like a plain text merge', (t) => {
  const s = diverged(t, { install: false });
  const r = s.git('merge', '--no-edit', 'side');
  assert.notEqual(r.status, 0, 'without the driver the merge must stop');
  assert.deepEqual(s.ok('diff', '--name-only', '--diff-filter=U').split('\n'), ['gen/out.json']);
  assert.match(s.read('gen/out.json'), /^<<<<<<< /m, 'git fell back to its text merge and wrote markers');
});

test('with the driver the merge completes and post-merge commits only the regenerated path', (t) => {
  const s = diverged(t);
  const r = s.git('merge', '--no-edit', 'side');
  assert.equal(r.status, 0, r.all);
  assert.equal(s.ok('log', '-1', '--format=%s'), COMMIT_MESSAGE);
  assert.equal(s.ok('rev-list', '--parents', '-n1', 'HEAD~1').split(' ').length, 3, 'HEAD~1 is the merge commit');
  assert.equal(s.ok('rev-list', '--parents', '-n1', 'HEAD').split(' ').length, 2, 'the regen commit has one parent');
  assert.equal(s.ok('rev-list', '--count', 'HEAD'), '5', 'base, side, main, merge, ONE regen commit');
  assert.deepEqual(filesOf(s, 'HEAD'), ['gen/out.json']);
  assert.equal(s.read('gen/out.json'), FRESH);
  assert.equal(fs.existsSync(pendingPath(s)), false, 'pending cleared');
  assert.equal(s.ok('status', '--porcelain'), '');
});

test('a staged unrelated file stays staged, and uncommitted source edits are not baked in', (t) => {
  const s = diverged(t);
  // Merge with the hooks held off, so the regeneration runs later, beside other work.
  const m = s.sh('git', ['merge', '--no-edit', 'side'], { extraEnv: { REGISTRY_REGEN_ACTIVE: '1' } });
  assert.equal(m.status, 0, m.all);
  assert.ok(fs.existsSync(pendingPath(s)), 'the driver recorded the path');
  s.write('notes.txt', 'someone else\n'); s.ok('add', 'notes.txt');
  s.write('src/a.txt', 'DIRTY\n');
  const r = s.node('regen-generated.mjs', ['--commit']);
  assert.equal(r.status, 0, r.all);
  assert.match(r.out, /isolated worktree/);
  assert.deepEqual(filesOf(s, 'HEAD'), ['gen/out.json']);
  assert.equal(s.ok('show', 'HEAD:gen/out.json') + '\n', FRESH, 'built from HEAD, not from the dirty tree');
  assert.equal(s.ok('diff', '--cached', '--name-only'), 'notes.txt', 'still staged, not committed');
  assert.equal(s.read('src/a.txt'), 'DIRTY\n', 'the edit is untouched');
  assert.equal(s.ok('worktree', 'list', '--porcelain').split('\n').filter((l) => l.startsWith('worktree ')).length, 1, 'temp worktree removed');
});

test('a generated path someone else modified is left alone and stays pending', (t) => {
  const s = diverged(t);
  s.sh('git', ['merge', '--no-edit', 'side'], { extraEnv: { REGISTRY_REGEN_ACTIVE: '1' } });
  s.write('gen/out.json', 'hand edit\n');
  const r = s.node('regen-generated.mjs', ['--commit']);
  assert.equal(r.status, 1, r.all);
  assert.match(r.err, /LEFT 1 generated path/);
  assert.equal(s.read('gen/out.json'), 'hand edit\n');
  assert.equal(fs.readFileSync(pendingPath(s), 'utf8'), 'gen/out.json\n');
});

test('rebase: the driver keeps ours per pick and post-rewrite regenerates once at the tip', (t) => {
  const s = diverged(t);
  s.ok('checkout', '-q', 'side');
  const r = s.git('rebase', 'main');
  assert.equal(r.status, 0, r.all);
  assert.equal(s.ok('log', '-1', '--format=%s'), COMMIT_MESSAGE);
  assert.equal(s.ok('rev-parse', '--abbrev-ref', 'HEAD'), 'side', 'committed on the branch, not a detached HEAD');
  assert.equal(s.ok('log', '--format=%s', 'main..side').split('\n').filter((l) => l === COMMIT_MESSAGE).length, 1);
  assert.equal(s.read('gen/out.json'), FRESH);
  assert.equal(fs.existsSync(path.join(s.ok('rev-parse', '--absolute-git-dir'), 'rebase-merge')), false);
  assert.equal(fs.existsSync(pendingPath(s)), false);
});

test('a merge stopped by an unrelated conflict regenerates when `git commit` finishes it', (t) => {
  const s = diverged(t, { conflictOther: true });
  const m = s.git('merge', '--no-edit', 'side');
  assert.notEqual(m.status, 0);
  assert.deepEqual(s.ok('diff', '--name-only', '--diff-filter=U').split('\n'), ['other.txt'], 'only the hand-written file conflicts');
  s.write('other.txt', 'resolved\n'); s.ok('add', 'other.txt');
  const c = s.git('commit', '--no-edit');
  assert.equal(c.status, 0, c.all);
  assert.equal(s.ok('log', '-1', '--format=%s'), COMMIT_MESSAGE, 'post-commit took it (post-merge does not fire here)');
  assert.equal(s.read('gen/out.json'), FRESH);
});

test('no recursion, and silence when nothing is pending', (t) => {
  const s = diverged(t);
  assert.equal(s.git('merge', '--no-edit', 'side').status, 0);
  const before = s.ok('rev-list', '--count', 'HEAD');
  const c = s.git('commit', '-q', '--allow-empty', '-m', 'next');
  assert.equal(c.status, 0);
  assert.equal(c.all.trim(), '', 'hooks print nothing with nothing pending');
  assert.equal(Number(s.ok('rev-list', '--count', 'HEAD')), Number(before) + 1, 'exactly the one commit');
  const again = s.node('regen-generated.mjs', ['--commit']);
  assert.equal(again.status, 0, again.all);
  assert.match(again.out, /already fresh/);
  assert.equal(s.ok('log', '-1', '--format=%s'), 'next');
  const dry = s.node('regen-generated.mjs', ['--dry-run']);
  assert.match(dry.out, /would run, in order: fake-gen\.mjs/);
});

test('installer: check, idempotent install, chained foreign hook, shared by worktrees, clean uninstall', (t) => {
  const s = diverged(t, { install: false });
  const inst = (...a) => s.sh(process.execPath, [INSTALLER, ...a, '--repo', s.repo]);
  const hooks = path.resolve(s.repo, s.ok('rev-parse', '--git-path', 'hooks'));
  fs.mkdirSync(hooks, { recursive: true });
  const foreign = '#!/bin/sh\necho foreign >> "$(git rev-parse --git-common-dir)/foreign.log"\n';
  fs.writeFileSync(path.join(hooks, 'post-merge'), foreign);

  assert.equal(inst('--check').status, 1, 'not installed yet');
  assert.equal(inst('--install').status, 0);
  const once = fs.readFileSync(path.join(hooks, 'post-merge'), 'utf8');
  assert.equal(inst('--install').status, 0);
  assert.equal(fs.readFileSync(path.join(hooks, 'post-merge'), 'utf8'), once, 'idempotent');
  assert.ok(once.startsWith(foreign), 'the foreign hook is kept, first');
  assert.equal(once.split('# BEGIN ai-registry regen-generated').length, 2, 'one block');
  assert.equal(inst('--check').status, 0);
  assert.equal(s.ok('config', '--local', 'merge.registry-generated.driver'), 'node scripts/merge-generated.mjs %O %A %B %P');

  // A linked worktree resolves to the same hooks and config: one install covers it.
  const wt = path.join(s.base, 'wt');
  s.ok('worktree', 'add', '-q', wt, 'side');
  const wtGit = (...a) => s.sh('git', a, { cwd: wt });
  assert.equal(path.resolve(wt, wtGit('rev-parse', '--git-path', 'hooks').out.trim()), hooks);
  const merged = wtGit('merge', '--no-edit', 'main');
  assert.equal(merged.status, 0, merged.all);
  assert.equal(wtGit('log', '-1', '--format=%s').out.trim(), COMMIT_MESSAGE);
  assert.equal(fs.readFileSync(path.join(wt, 'gen', 'out.json'), 'utf8'), FRESH);
  assert.ok(fs.existsSync(path.resolve(s.repo, s.ok('rev-parse', '--git-common-dir'), 'foreign.log')), 'the chained foreign hook still ran');
  s.ok('worktree', 'remove', '--force', wt);

  assert.equal(inst('--uninstall').status, 0);
  assert.equal(fs.readFileSync(path.join(hooks, 'post-merge'), 'utf8'), foreign, 'only our block removed');
  assert.equal(fs.existsSync(path.join(hooks, 'post-rewrite')), false, 'a hook we created is deleted');
  assert.equal(s.git('config', '--local', '--get', 'merge.registry-generated.driver').status, 1);
  assert.equal(inst('--check').status, 1);
});

test('installer: a tracked core.hooksPath is a partial install, never reported as installed', (t) => {
  // Before: --install set the driver, wrote no hook (the dir is tracked), and still exited 0
  // with "installed. Merges ... now ... regenerate after" - while every merge from then on
  // kept ours and left its pending record for a hook that does not exist.
  const s = diverged(t, { install: false });
  s.ok('config', 'core.hooksPath', '.githooks');
  const r = s.sh(process.execPath, [INSTALLER, '--install', '--repo', s.repo]);
  assert.equal(r.status, 1, r.all);
  assert.doesNotMatch(r.out, /now keep ours and regenerate after/);
  assert.match(r.out, /hooks NOT installed/);
  assert.equal(fs.existsSync(path.join(s.repo, '.githooks')), false, 'the tracked dir is not written');
  // positive control: the same repo without the tracked hooksPath installs and exits 0
  s.ok('config', '--unset', 'core.hooksPath');
  assert.equal(s.sh(process.execPath, [INSTALLER, '--install', '--repo', s.repo]).status, 0);
});

test('.gitattributes names the driver for exactly the exported generated set', () => {
  const text = fs.readFileSync(path.join(REGISTRY, '.gitattributes'), 'utf8');
  const named = text.split('\n').map((l) => /^(\S+)\s+merge=registry-generated\s*$/.exec(l)).filter(Boolean).map((m) => m[1]);
  assert.deepEqual([...named].sort(), [...GENERATED_PATHS].sort());
});

test('the generator set is gate.mjs\'s write-mode steps, less the named exclusions', () => {
  const gate = fs.readFileSync(path.join(SCRIPTS, 'gate.mjs'), 'utf8');
  const writers = [...gate.matchAll(/step\('([^']+)',\s*\{[^}]*\bwrite:/g)].map((m) => m[1]);
  assert.ok(writers.length >= 7, 'found the gate\'s generator steps');
  const expected = writers.filter((w) => !(w in EXCLUDED));
  assert.deepEqual([...GENERATORS.map((g) => g.script)].sort(), [...new Set(expected)].sort());
  for (const g of GENERATORS) assert.ok(fs.existsSync(path.join(SCRIPTS, g.script)), g.script);
});

test('selection runs the owners of pending paths plus the generators that read them', () => {
  const pick = (paths) => selectGenerators(GENERATORS, paths).map((g) => g.script);
  assert.deepEqual(pick(['catalog.json']), ['build-catalog.mjs']);
  assert.deepEqual(pick(['knowledge/software-engineering/index.json']), ['build-index.mjs', 'build-knowledge-rules.mjs', 'build-catalog.mjs']);
  assert.deepEqual(pick(['recipes/a/b/c/RECIPE.md']), ['render-recipes.mjs']);
  assert.equal(pick(['somewhere/else.json']).length, GENERATORS.length, 'unknown path: run everything');
  assert.equal(pick([]).length, GENERATORS.length);
  assert.ok(globToRegExp('knowledge/*/index.json').test('knowledge/x/index.json'));
  assert.ok(!globToRegExp('knowledge/*/index.json').test('knowledge/x/y/index.json'));
});

test('catalog fold takes carried fields only the other side changed, and keeps ours on a clash', () => {
  const base = { schema: 1, generatedAt: 'g0', skills: [{ name: 'a', adopters: [], contentHash: 'h0' }, { name: 'b', adopters: ['x'] }] };
  const ours = { schema: 1, generatedAt: 'g0', skills: [{ name: 'a', adopters: [], contentHash: 'OURS' }, { name: 'b', adopters: ['ours'] }] };
  const theirs = { schema: 2, generatedAt: 'g0', skills: [{ name: 'a', adopters: ['p@1'], contentHash: 'THEIRS' }, { name: 'b', adopters: ['theirs'] }, { name: 'c', adopters: ['q'] }] };
  const { doc, changed, clashes } = foldCatalog(base, ours, theirs);
  assert.equal(changed, true);
  assert.equal(doc.schema, 2, 'carried top-level key only they changed');
  assert.deepEqual(doc.skills[0], { name: 'a', adopters: ['p@1'], contentHash: 'OURS' }, 'derived field stays ours; carried one folds');
  assert.deepEqual(doc.skills[1].adopters, ['ours']);
  assert.deepEqual(clashes, ['skills[b].adopters']);
  assert.equal(doc.skills[2].name, 'c', 'a skill only they have keeps its row for the rebuild');
});

test('the fold\'s carried fields are the ones build-catalog.mjs actually carries', () => {
  const src = fs.readFileSync(path.join(SCRIPTS, 'build-catalog.mjs'), 'utf8');
  const carried = new Set([...src.matchAll(/\bold\.(\w+)/g)].map((m) => m[1]));
  assert.deepEqual([...carried].sort(), [...CATALOG_SKILL_CARRIED].sort());
  const block = src.slice(src.indexOf('const next = {'), src.indexOf('};', src.indexOf('const next = {')));
  const owned = new Set();
  for (const line of block.split('\n').slice(1)) {
    const kv = /^\s+(\w+):\s*(.*)$/.exec(line);
    if (kv) { if (!kv[2].startsWith('catalog.')) owned.add(kv[1]); continue; }
    for (const id of line.split(',').map((x) => x.trim()).filter((x) => /^\w+$/.test(x))) owned.add(id);
  }
  assert.deepEqual([...owned].sort(), [...CATALOG_OWNED].sort());
});
