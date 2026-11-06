/**
 * shift-land's law, against a throwaway git repository with a fake gate. Each repo carries its own
 * copy of run-board, so its locks live in its own .git and a real shift's board is never touched.
 * The fake gate is a real child process, so the exit status is read the way the real one's is.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT } from '../lib/exit-codes.mjs';
import { FragmentRefusal, applyFragment, ledgerRule, main } from '../shift-land.mjs';

const SCRIPTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOW = Date.parse('2026-11-06T12:00:00Z');
const INDEX_MD = '# The source ledger\n\n## Mined\n\n| Date | Source |\n| --- | --- |\n| 2026-11-01 | old |\n\n## Source classes\n\nprose\n';

// Reads its orders from the file the test names, says what it saw, then exits as told.
const FAKE_GATE = `import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const orders = JSON.parse(fs.readFileSync(process.env.SHIFT_LAND_TEST_ORDERS, 'utf8'));
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
const read = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };
const common = git('rev-parse', '--git-common-dir');
fs.writeFileSync(orders.saw, JSON.stringify({
  cwd: process.cwd(),
  files: Object.fromEntries((orders.look ?? []).map((p) => [p, read(p)])),
  lock: fs.existsSync(common + '/run-board/locks/commit.lock'),
  head: git('rev-parse', 'HEAD'),
  headTree: git('rev-parse', 'HEAD^{tree}'),
}));
if (orders.moveRef) execFileSync('git', ['-C', orders.moveRef.root, 'update-ref', orders.moveRef.ref, orders.moveRef.to]);
if (orders.print) console.log(orders.print);
process.exit(orders.exit ?? 0);
`;

function run(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

/** tmp/<unique>/repo, so whatever the door leaves beside the repo is visible in tmp/<unique>. */
function makeRepo() {
  const outer = fs.mkdtempSync(path.join(os.tmpdir(), 'sland-'));
  const root = path.join(outer, 'repo');
  const write = (p, text) => {
    fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
    fs.writeFileSync(path.join(root, p), text);
  };
  fs.mkdirSync(root);
  run(root, 'init', '-q', '-b', 'main');
  run(root, 'config', 'user.name', 'test');
  run(root, 'config', 'user.email', 'test@example.com');
  write('.gitattributes', '* text=auto eol=lf\n');
  write('.gitignore', '.ai/\n');
  write('scripts/gate.mjs', FAKE_GATE);
  write('scripts/fake-gen.mjs', "import fs from 'node:fs';\nfs.writeFileSync('catalog.json', JSON.stringify(fs.readdirSync('docs').sort()) + '\\n');\n");
  fs.mkdirSync(path.join(root, 'scripts', 'lib'), { recursive: true });
  fs.copyFileSync(path.join(SCRIPTS, 'run-board.mjs'), path.join(root, 'scripts', 'run-board.mjs'));
  fs.copyFileSync(path.join(SCRIPTS, 'lib', 'exit-codes.mjs'), path.join(root, 'scripts', 'lib', 'exit-codes.mjs'));
  write('docs/a.md', 'a\n');
  write('docs/b.md', 'b\n');
  write('catalog.json', '["a.md","b.md"]\n');
  write('librarian/sources/index.md', INDEX_MD);
  write('librarian/applied.md', '| date | slug |\n| --- | --- |\n| 2026-11-01 | old |\n');
  write('librarian/harvest/backlog.jsonl', '{"id":"r1","status":"held"}\n');
  write('.claude/skills/intake/SCORECARD.md', '# Scorecard\n\n| a |\n| --- |\n| old |\n');
  write('.claude/skills/shift/LESSONS.md', '# Lessons\n\n## 0.1.0 - 2026-11-01 - old\n\n- old\n');
  run(root, 'add', '-A');
  run(root, 'commit', '-q', '-m', 'seed');
  const h = {
    outer, root, write, out: [], err: [],
    saw: path.join(outer, 'saw.json'),
    ordersFile: path.join(outer, 'orders.json'),
    messageFile: path.join(outer, 'msg.txt'),
    head: () => run(root, 'rev-parse', 'HEAD'),
    tree: (rev = 'HEAD') => run(root, 'ls-tree', '-r', '--name-only', rev).split('\n'),
    show: (p, rev = 'HEAD') => run(root, 'show', `${rev}:${p}`),
    gateSaw: () => JSON.parse(fs.readFileSync(h.saw, 'utf8')),
    json: () => JSON.parse(h.out.at(-1)),
    orders(o) { fs.writeFileSync(h.ordersFile, JSON.stringify({ saw: h.saw, ...o })); },
    door(argv, over = {}) {
      process.env.SHIFT_LAND_TEST_ORDERS = h.ordersFile;
      return main(argv, {
        root, now: () => NOW, log: (s) => h.out.push(s), err: (s) => h.err.push(s), generators: [], ...over,
      });
    },
    commit(paths, { ledgerDir, run: id = 'run-a', over } = {}) {
      return h.door(['commit', '--run', id, '--message-file', h.messageFile, ...(ledgerDir ? ['--ledger-dir', ledgerDir] : []), '--', ...paths], over);
    },
    locks: () => {
      try { return fs.readdirSync(path.join(root, '.git', 'run-board', 'locks')); } catch { return []; }
    },
    leftovers: () => fs.readdirSync(outer).filter((n) => n.startsWith('sl-')),
    worktrees: () => run(root, 'worktree', 'list', '--porcelain').split('\n').filter((l) => l.startsWith('worktree ')).length,
    fragments(files) {
      const dir = path.join(outer, `ledger-${fs.readdirSync(outer).length}`);
      for (const [target, text] of Object.entries(files)) {
        fs.mkdirSync(path.dirname(path.join(dir, target)), { recursive: true });
        fs.writeFileSync(path.join(dir, target), text);
      }
      return dir;
    },
  };
  fs.writeFileSync(h.messageFile, 'test: a landing\n');
  h.orders({ exit: 0 });
  return h;
}

/* ---------------------------------------------------------------- acceptance */

test('a green gate commits exactly the pinned tree', () => {
  const h = makeRepo();
  const before = h.head();
  h.write('docs/a.md', 'a changed\n');
  h.write('docs/new.md', 'new\n');
  h.orders({ exit: 0, look: ['docs/a.md', 'docs/new.md'] });
  assert.equal(h.commit(['docs/a.md', 'docs/new.md']), EXIT.OK, h.err.join('\n'));

  const out = h.json();
  assert.equal(out.state, 'landed');
  assert.equal(out.sha, h.head());
  assert.equal(run(h.root, 'rev-parse', 'HEAD~1'), before);
  assert.equal(run(h.root, 'rev-parse', 'HEAD^{tree}'), h.gateSaw().headTree, 'HEAD holds the tree the gate ran on');
  assert.equal(h.gateSaw().head, out.sha, 'the gated commit is the commit that landed');
  assert.deepEqual(h.gateSaw().files, { 'docs/a.md': 'a changed\n', 'docs/new.md': 'new\n' });
  assert.equal(run(h.root, 'diff', '--name-only', 'HEAD~1', 'HEAD').split('\n').sort().join(), 'docs/a.md,docs/new.md');
  assert.equal(run(h.root, 'status', '--porcelain'), '', 'index and disk agree with HEAD afterwards');
  assert.deepEqual(h.locks(), [], 'the lock is released');
  assert.match(out.gateLog, /^\.ai\/shift\/gate\/run-a-20261106T120000Z\.txt$/);
  assert.ok(fs.existsSync(path.join(h.root, out.gateLog)));
});

test('a red gate leaves HEAD and refuses', () => {
  const h = makeRepo();
  const before = h.head();
  h.write('docs/a.md', 'a changed\n');
  h.orders({ exit: 1, print: 'check-run-results: 1 violation' });
  assert.equal(h.commit(['docs/a.md']), EXIT.VIOLATIONS);
  assert.equal(h.head(), before);
  const out = h.json();
  assert.equal(out.state, 'refused');
  assert.equal(out.refused, 'gate-red');
  assert.equal(out.sha, null);
  assert.match(fs.readFileSync(path.join(h.root, out.gateLog), 'utf8'), /check-run-results: 1 violation[\s\S]*gate status=1/);
  assert.equal(fs.readFileSync(path.join(h.root, 'docs/a.md'), 'utf8'), 'a changed\n', 'the lander keeps its work');
  assert.deepEqual(h.locks(), [], 'the lock is released on refusal');
});

test('the exit status is read, not output text', () => {
  const lies = makeRepo();
  const before = lies.head();
  lies.write('docs/a.md', 'x\n');
  lies.orders({ exit: 1, print: 'gate OK - 26/26 step(s) green (all).' });
  assert.equal(lies.commit(['docs/a.md']), EXIT.VIOLATIONS);
  assert.equal(lies.head(), before, 'green words and a red status refuse');

  const alarm = makeRepo();
  alarm.write('docs/a.md', 'x\n');
  alarm.orders({ exit: 0, print: 'gate FAILED at scripts/x.mjs - exit 1' });
  assert.equal(alarm.commit(['docs/a.md']), EXIT.OK, 'red words and a zero status land');

  const fatal = makeRepo();
  fatal.write('docs/a.md', 'x\n');
  fatal.orders({ exit: 2 });
  assert.equal(fatal.commit(['docs/a.md']), EXIT.FATAL, 'a gate that could not finish keeps its own meaning');
  assert.equal(fatal.json().state, 'refused');
});

test("a sibling's dirty file is neither gated nor carried, and survives", () => {
  const h = makeRepo();
  // Bytes git would normalise, a half-written file that would turn a gate red, and an untracked one.
  const crlf = Buffer.from('half\r\nwritten \xc3\xa9\r\n', 'latin1');
  fs.writeFileSync(path.join(h.root, 'docs/b.md'), crlf);
  h.write('docs/sibling-new.md', 'in flight\n');
  h.write('librarian/applied.md', fs.readFileSync(path.join(h.root, 'librarian/applied.md'), 'utf8') + '| 2026-11-06 | sibling line |\n');
  h.write('docs/a.md', 'mine\n');
  h.orders({ exit: 0, look: ['docs/a.md', 'docs/b.md', 'docs/sibling-new.md', 'librarian/applied.md'] });

  assert.equal(h.commit(['docs/a.md']), EXIT.OK, h.err.join('\n'));
  const saw = h.gateSaw().files;
  assert.equal(saw['docs/a.md'], 'mine\n');
  assert.equal(saw['docs/b.md'], 'b\n', 'not gated');
  assert.equal(saw['docs/sibling-new.md'], null, 'not gated');
  assert.ok(!saw['librarian/applied.md'].includes('sibling line'), 'not gated');
  assert.equal(h.show('docs/b.md'), 'b', 'not carried');
  assert.ok(!h.tree().includes('docs/sibling-new.md'), 'not carried');
  assert.ok(!h.show('librarian/applied.md').includes('sibling line'), 'not carried');
  assert.deepEqual(fs.readFileSync(path.join(h.root, 'docs/b.md')), crlf, 'survives byte for byte');
  assert.equal(fs.readFileSync(path.join(h.root, 'docs/sibling-new.md'), 'utf8'), 'in flight\n');
  assert.ok(fs.readFileSync(path.join(h.root, 'librarian/applied.md'), 'utf8').includes('sibling line'));
  assert.equal(run(h.root, 'diff', '--name-only', 'HEAD', '--', 'docs/a.md'), '', 'the lander\'s own file is clean against the new HEAD');
  assert.equal(run(h.root, 'diff', '--cached', '--name-only'), '', 'the index holds HEAD');
});

test('a ledger fragment lands inside the lock in the pinned tree', () => {
  const h = makeRepo();
  const before = fs.readFileSync(path.join(h.root, 'librarian/applied.md'), 'utf8');
  const dir = h.fragments({ 'librarian/applied.md': '| 2026-11-06 | landed |\n', '.claude/skills/shift/LESSONS.md': '## 0.3.1 - 2026-11-06 - door\n\n- a lesson\n' });
  h.orders({ exit: 0, look: ['librarian/applied.md', '.claude/skills/shift/LESSONS.md'] });
  assert.equal(fs.readFileSync(path.join(h.root, 'librarian/applied.md'), 'utf8'), before, 'the shared file is not written before the landing');

  assert.equal(h.commit([], { ledgerDir: dir }), EXIT.OK, h.err.join('\n'));
  const saw = h.gateSaw();
  assert.equal(saw.lock, true, 'the gate ran inside the commit lock, so the fragment was applied inside it');
  assert.ok(saw.files['librarian/applied.md'].endsWith('| 2026-11-06 | landed |\n'));
  assert.ok(saw.files['.claude/skills/shift/LESSONS.md'].includes('## 0.3.1 - 2026-11-06 - door'));
  assert.deepEqual(h.json().ledger.sort(), ['.claude/skills/shift/LESSONS.md', 'librarian/applied.md']);
  assert.equal(run(h.root, 'status', '--porcelain'), '', 'nothing sits dirty in the shared checkout');
  assert.ok(fs.readFileSync(path.join(h.root, 'librarian/applied.md'), 'utf8').endsWith('| 2026-11-06 | landed |\n'));
});

test('two runs in sequence over one shared ledger both land with no deadlock', () => {
  const h = makeRepo();
  const a = h.fragments({ 'librarian/applied.md': '| 2026-11-06 | from a |\n', 'librarian/sources/index.md': '| 2026-11-06 | from a |\n' });
  const b = h.fragments({ 'librarian/applied.md': '| 2026-11-06 | from b |\n', 'librarian/sources/index.md': '| 2026-11-06 | from b |\n' });
  assert.equal(h.commit([], { ledgerDir: a, run: 'run-a' }), EXIT.OK, h.err.join('\n'));
  assert.equal(h.commit([], { ledgerDir: b, run: 'run-b' }), EXIT.OK, h.err.join('\n'));
  assert.ok(h.show('librarian/applied.md').endsWith('| 2026-11-06 | from a |\n| 2026-11-06 | from b |'));
  const rows = h.show('librarian/sources/index.md').split('\n');
  const at = rows.indexOf('| --- | --- |');
  assert.deepEqual(rows.slice(at + 1, at + 4), ['| 2026-11-06 | from b |', '| 2026-11-06 | from a |', '| 2026-11-01 | old |'], 'newest first, under the table');
  assert.equal(run(h.root, 'status', '--porcelain'), '');
});

test('a moved HEAD refuses', () => {
  const h = makeRepo();
  const other = run(h.root, 'commit-tree', 'HEAD^{tree}', '-p', 'HEAD', '-m', 'a sibling got here first');
  h.write('docs/a.md', 'mine\n');
  h.orders({ exit: 0, moveRef: { root: h.root, ref: 'refs/heads/main', to: other } });
  assert.equal(h.commit(['docs/a.md']), EXIT.CONTENDED);
  assert.equal(h.head(), other, 'never overwritten');
  assert.equal(h.json().refused, 'head-moved');
  assert.deepEqual(h.locks(), []);
});

test('a temporary worktree is removed on failure', () => {
  const h = makeRepo();
  h.write('docs/a.md', 'mine\n');
  h.orders({ exit: 1 });
  assert.equal(h.commit(['docs/a.md']), EXIT.VIOLATIONS);
  assert.ok(h.gateSaw().cwd.split(/[\\/]/).pop().startsWith('sl-'), 'the gate ran in the short checkout');
  assert.deepEqual(h.leftovers(), []);
  assert.equal(h.worktrees(), 1);

  h.orders({ exit: 0 });
  assert.equal(h.commit(['docs/a.md'], { over: { generators: [{ script: 'missing-gen.mjs', paths: ['catalog.json'] }] } }), EXIT.VIOLATIONS);
  assert.equal(h.json().refused, 'generator-failed');
  assert.deepEqual(h.leftovers(), [], 'a generator failure too');
  assert.equal(h.worktrees(), 1);
});

/* ---------------------------------------------------------------- push acceptance */

function liveLander(h, startedAt = new Date(NOW - 60000).toISOString()) {
  fs.mkdirSync(path.join(h.root, '.ai', 'shift'), { recursive: true });
  fs.writeFileSync(path.join(h.root, '.ai', 'shift', 'running.jsonl'), `${JSON.stringify({ key: 'land:p/c', kind: 'lander', cluster: 'c', startedAt })}\n`);
}

function withOrigin(h) {
  const bare = path.join(h.outer, 'origin.git');
  run(h.outer, 'init', '-q', '--bare', '-b', 'main', bare);
  run(h.root, 'remote', 'add', 'origin', bare);
  run(h.root, 'push', '-q', 'origin', 'main');
  return bare;
}

const aheadCommit = (h) => {
  h.write('docs/a.md', `ahead ${fs.readdirSync(h.outer).length}\n`);
  run(h.root, 'add', 'docs/a.md');
  run(h.root, 'commit', '-q', '-m', 'ahead');
};

const PUSH = ['push', '--remote', 'origin', '--branch', 'main'];

test('push refuses with a live lander', () => {
  const h = makeRepo();
  const bare = withOrigin(h);
  aheadCommit(h);
  liveLander(h);
  const remoteBefore = run(bare, 'rev-parse', 'main');
  assert.equal(h.door(PUSH), EXIT.CONTENDED);
  assert.equal(h.json().refused, 'lander-live');
  assert.deepEqual(h.json().landers, ['land:p/c']);
  assert.equal(run(bare, 'rev-parse', 'main'), remoteBefore);
  assert.deepEqual(h.locks(), []);
});

test('push does not count a stale lander as live', () => {
  const h = makeRepo();
  withOrigin(h);
  aheadCommit(h);
  liveLander(h, new Date(NOW - 7 * 3600 * 1000).toISOString());
  assert.equal(h.door(PUSH), EXIT.OK, h.out.join('\n'));
});

test('push refuses with a dirty tree', () => {
  const h = makeRepo();
  const bare = withOrigin(h);
  aheadCommit(h);
  h.write('docs/b.md', 'dirty\n');
  const remoteBefore = run(bare, 'rev-parse', 'main');
  assert.equal(h.door(PUSH), EXIT.VIOLATIONS);
  assert.equal(h.json().refused, 'tree-dirty');
  assert.equal(run(bare, 'rev-parse', 'main'), remoteBefore);
});

test('push refuses when HEAD is not ahead', () => {
  const h = makeRepo();
  withOrigin(h);
  assert.equal(h.door(PUSH), EXIT.VIOLATIONS);
  assert.equal(h.json().refused, 'not-ahead');
});

test('push gates, rebases over a moved remote, and pushes the gated commit; untracked files stay', () => {
  const h = makeRepo();
  const bare = withOrigin(h);
  const other = path.join(h.outer, 'other');
  run(h.outer, 'clone', '-q', bare, other);
  run(other, 'config', 'user.name', 't');
  run(other, 'config', 'user.email', 't@example.com');
  fs.writeFileSync(path.join(other, 'docs', 'c.md'), 'remote\n');
  run(other, 'add', 'docs/c.md');
  run(other, 'commit', '-q', '-m', 'remote moved');
  run(other, 'push', '-q', 'origin', 'main');
  aheadCommit(h);
  h.write('docs/untracked.md', 'sibling\n');
  h.orders({ exit: 0, look: ['docs/c.md', 'docs/untracked.md'] });

  assert.equal(h.door(PUSH), EXIT.OK, h.out.join('\n') + h.err.join('\n'));
  const out = h.json();
  assert.equal(out.state, 'pushed');
  assert.equal(run(bare, 'rev-parse', 'main'), h.head());
  assert.equal(out.sha, h.head());
  assert.equal(h.gateSaw().head, out.sha, 'the pushed commit is the gated one');
  assert.equal(h.gateSaw().files['docs/c.md'], 'remote\n', 'the gate saw the rebased tree');
  assert.equal(h.gateSaw().files['docs/untracked.md'], null, 'an untracked file is not gated');
  assert.ok(fs.existsSync(path.join(h.root, 'docs/untracked.md')));
  assert.deepEqual(h.leftovers(), []);
});

test('push leaves the remote alone on a red gate', () => {
  const h = makeRepo();
  const bare = withOrigin(h);
  aheadCommit(h);
  const remoteBefore = run(bare, 'rev-parse', 'main');
  h.orders({ exit: 1 });
  assert.equal(h.door(PUSH), EXIT.VIOLATIONS);
  assert.equal(h.json().refused, 'gate-red');
  assert.equal(run(bare, 'rev-parse', 'main'), remoteBefore);
  assert.deepEqual(h.leftovers(), []);
});

test('a real rebase conflict aborts and reports, and the checkout stays on its own commit', () => {
  const h = makeRepo();
  const bare = withOrigin(h);
  const other = path.join(h.outer, 'other');
  run(h.outer, 'clone', '-q', bare, other);
  run(other, 'config', 'user.name', 't');
  run(other, 'config', 'user.email', 't@example.com');
  fs.writeFileSync(path.join(other, 'docs', 'a.md'), 'the other side\n');
  run(other, 'add', 'docs/a.md');
  run(other, 'commit', '-q', '-m', 'remote moved');
  run(other, 'push', '-q', 'origin', 'main');
  aheadCommit(h);
  const mine = h.head();
  assert.equal(h.door(PUSH), EXIT.VIOLATIONS);
  assert.equal(h.json().refused, 'rebase-failed');
  assert.deepEqual(h.json().conflicts, ['docs/a.md']);
  assert.equal(h.head(), mine);
  assert.equal(fs.existsSync(path.join(h.root, '.git', 'rebase-merge')), false);
});

/* ---------------------------------------------------------------- the checkout update */

test('a dirty file a landing would clobber: HEAD stays moved, the file is named, its bytes survive', () => {
  const h = makeRepo();
  // Another session (a non-shift /intake) holds an uncommitted line in the ledger this landing appends to.
  const theirs = `${fs.readFileSync(path.join(h.root, 'librarian/applied.md'), 'utf8')}| 2026-11-06 | a sibling's line |\n`;
  h.write('librarian/applied.md', theirs);
  h.write('docs/a.md', 'mine\n');
  const dir = h.fragments({ 'librarian/applied.md': '| 2026-11-06 | landed |\n' });
  const before = h.head();

  assert.equal(h.commit(['docs/a.md'], { ledgerDir: dir }), EXIT.VIOLATIONS);
  const out = h.json();
  assert.equal(out.state, 'landed-dirty-checkout');
  assert.equal(out.sha, h.head(), 'HEAD stays moved');
  assert.notEqual(h.head(), before);
  assert.deepEqual(out.dirty, [{ path: 'librarian/applied.md', reason: 'dirty with different content' }]);
  assert.match(out.message, /librarian\/applied\.md/);
  assert.equal(fs.readFileSync(path.join(h.root, 'librarian/applied.md'), 'utf8'), theirs, 'the sibling\'s bytes survive');
  assert.ok(h.show('librarian/applied.md').endsWith('| 2026-11-06 | landed |'));
  assert.equal(run(h.root, 'diff', '--cached', '--name-only'), '', 'the index agrees with HEAD');
  assert.equal(fs.readFileSync(path.join(h.root, 'docs/a.md'), 'utf8'), 'mine\n');
  assert.equal(run(h.root, 'diff', '--name-only'), 'librarian/applied.md');
  assert.deepEqual(h.locks(), []);
});

test('generated files are rebuilt in the checkout, gated, and written to a clean shared checkout', () => {
  const h = makeRepo();
  h.write('docs/c.md', 'c\n');
  h.orders({ exit: 0, look: ['catalog.json'] });
  const generators = [{ script: 'fake-gen.mjs', paths: ['catalog.json'] }];
  assert.equal(h.commit(['docs/c.md'], { over: { generators } }), EXIT.OK, h.err.join('\n'));
  assert.deepEqual(h.json().regenerated, ['catalog.json']);
  assert.equal(h.gateSaw().files['catalog.json'], '["a.md","b.md","c.md"]\n', 'gated with the regenerated view');
  assert.equal(h.show('catalog.json'), '["a.md","b.md","c.md"]');
  assert.equal(fs.readFileSync(path.join(h.root, 'catalog.json'), 'utf8'), '["a.md","b.md","c.md"]\n');
  assert.equal(run(h.root, 'status', '--porcelain'), '');
  assert.equal(h.gateSaw().head, h.head());
  assert.equal(run(h.root, 'log', '-1', '--format=%s'), 'test: a landing');
});

test('a named deletion lands, and an unchanged sibling path keeps its stat', () => {
  const h = makeRepo();
  fs.rmSync(path.join(h.root, 'docs/a.md'));
  assert.equal(h.commit(['docs/a.md']), EXIT.OK, h.err.join('\n'));
  assert.ok(!h.tree().includes('docs/a.md'));
  assert.equal(run(h.root, 'status', '--porcelain'), '');
});

/* ---------------------------------------------------------------- refusals */

test('a shared ledger, a generated file, a directory and a stray path are refused by name', () => {
  const h = makeRepo();
  const before = h.head();
  h.write('docs/a.md', 'x\n');
  const generators = [{ script: 'fake-gen.mjs', paths: ['catalog.json'] }];
  for (const [p, why] of [
    ['librarian/applied.md', /fragment/],
    ['.claude/skills/shift/LESSONS.md', /fragment/],
    ['catalog.json', /generated/],
    ['docs', /directory/],
    ['docs/nope.md', /neither on disk nor in HEAD/],
    ['../outside.md', /not a path inside/],
  ]) {
    assert.equal(h.commit(['docs/a.md', p], { over: { generators } }), EXIT.VIOLATIONS, p);
    const out = h.json();
    assert.equal(out.refused, 'path-refused', p);
    assert.equal(out.path, p);
    assert.match(out.message, why);
  }
  assert.equal(h.head(), before);
  assert.deepEqual(h.locks(), []);
});

test('a gitignored path is refused, and a new skill may name its first LESSONS.md', () => {
  const h = makeRepo();
  h.write('.ai/x.md', 'x\n');
  assert.equal(h.commit(['.ai/x.md']), EXIT.VIOLATIONS);
  assert.equal(h.json().refused, 'path-refused');
  h.write('.claude/skills/brand-new/LESSONS.md', '# Lessons\n');
  assert.equal(h.commit(['.claude/skills/brand-new/LESSONS.md']), EXIT.OK, h.out.join('\n'));
});

test('a path a live sibling claims is refused, naming the sibling', () => {
  const h = makeRepo();
  execFileSync(process.execPath, ['scripts/run-board.mjs', 'claim', '--skill', 'shift', '--source', 'other', '--run', 'sibling', '--path', 'docs/a.md'], { cwd: h.root, stdio: 'ignore' });
  h.write('docs/a.md', 'x\n');
  assert.equal(h.commit(['docs/a.md']), EXIT.VIOLATIONS);
  assert.match(h.json().message, /sibling/);
  assert.equal(h.json().refused, 'path-refused');
});

test('one fragment that cannot apply refuses the whole landing', () => {
  const h = makeRepo();
  const before = h.head();
  h.write('docs/a.md', 'mine\n');
  const dir = h.fragments({ 'librarian/applied.md': '| 2026-11-06 | fine |\n', '.claude/skills/shift/LESSONS.md': '- a bare bullet\n' });
  assert.equal(h.commit(['docs/a.md'], { ledgerDir: dir }), EXIT.VIOLATIONS);
  assert.equal(h.json().refused, 'fragment-refused');
  assert.equal(h.head(), before);
  assert.equal(fs.existsSync(h.saw), false, 'no gate was spent');
});

test('a fragment for a file that is no ledger, and a re-run after landing, are refused', () => {
  const h = makeRepo();
  const stray = h.fragments({ 'docs/a.md': 'x\n' });
  assert.equal(h.commit([], { ledgerDir: stray }), EXIT.VIOLATIONS);
  assert.match(h.json().message, /not a shared ledger/);

  const dir = h.fragments({ 'librarian/applied.md': '| 2026-11-06 | once |\n' });
  assert.equal(h.commit([], { ledgerDir: dir }), EXIT.OK, h.out.join('\n'));
  assert.equal(h.commit([], { ledgerDir: dir }), EXIT.VIOLATIONS);
  assert.match(h.json().message, /already holds/);
  assert.equal(h.show('librarian/applied.md').split('once').length, 2, 'not doubled');
});

test("a sources row naming a sibling's note not in the tree refuses; naming the note lands", () => {
  const h = makeRepo();
  const row = '| 2026-11-06 | [title](2026-11-06-theirs.md) |\n';
  const dir = h.fragments({ 'librarian/sources/index.md': row });
  h.write('librarian/sources/2026-11-06-theirs.md', '# a note on disk, not in this landing\n');
  assert.equal(h.commit([], { ledgerDir: dir }), EXIT.VIOLATIONS);
  assert.match(h.json().message, /2026-11-06-theirs\.md/);
  assert.equal(h.commit(['librarian/sources/2026-11-06-theirs.md'], { ledgerDir: dir }), EXIT.OK, h.out.join('\n'));
});

test('nothing to land is refused; no flag overrides the gate', () => {
  const h = makeRepo();
  assert.equal(h.commit(['docs/a.md']), EXIT.VIOLATIONS);
  assert.equal(h.json().refused, 'nothing-to-land');
  for (const flag of ['--force', '--no-verify', '--skip-gate']) {
    assert.equal(h.door(['commit', flag, '--run', 'x', '--message-file', h.messageFile, '--', 'docs/a.md']), EXIT.FATAL, flag);
    assert.match(h.err.at(-2) ?? h.err.at(-1), /unknown flag/);
  }
});

test('a run that already holds the lock is refused, and its lock stays its own', () => {
  const h = makeRepo();
  execFileSync(process.execPath, ['scripts/run-board.mjs', 'lock', 'commit', '--run', 'run-a'], { cwd: h.root, stdio: 'ignore' });
  h.write('docs/a.md', 'x\n');
  assert.equal(h.commit(['docs/a.md']), EXIT.FATAL);
  assert.equal(h.json().refused, 'lock-already-held');
  assert.deepEqual(h.locks(), ['commit.lock']);
});

test('a detached checkout and a mid-merge checkout are refused', () => {
  const h = makeRepo();
  h.write('docs/a.md', 'x\n');
  fs.writeFileSync(path.join(h.root, '.git', 'MERGE_HEAD'), `${h.head()}\n`);
  assert.equal(h.commit(['docs/a.md']), EXIT.CONTENDED);
  assert.equal(h.json().refused, 'checkout-busy');
  fs.rmSync(path.join(h.root, '.git', 'MERGE_HEAD'));
  run(h.root, 'checkout', '-q', '--detach');
  assert.equal(h.commit(['docs/a.md']), EXIT.FATAL);
  assert.equal(h.json().refused, 'detached-head');
});

/* ---------------------------------------------------------------- the rules, pure */

test('ledgerRule knows the five shapes and nothing else', () => {
  assert.equal(ledgerRule('librarian/sources/index.md'), 'sources-index');
  assert.equal(ledgerRule('librarian/applied.md'), 'table-rows');
  assert.equal(ledgerRule('librarian/harvest/backlog.jsonl'), 'backlog');
  assert.equal(ledgerRule('.claude/skills/intake/SCORECARD.md'), 'scorecard');
  assert.equal(ledgerRule('.claude/skills/intake/LESSONS.md'), 'lessons');
  assert.equal(ledgerRule('skills/x/LESSONS.md'), 'lessons');
  assert.equal(ledgerRule('librarian/sources/2026-note.md'), null);
  assert.equal(ledgerRule('docs/LESSONS.md'), null);
});

test('sources rows go under the Mined delimiter, never at the end of the file', () => {
  const out = applyFragment('librarian/sources/index.md', INDEX_MD, '| 2026-11-06 | one |\r\n| 2026-11-06 | two |\r\n');
  assert.ok(out.includes('| --- | --- |\n| 2026-11-06 | one |\n| 2026-11-06 | two |\n| 2026-11-01 | old |\n'));
  assert.ok(out.endsWith('prose\n'));
  assert.throws(() => applyFragment('librarian/sources/index.md', '# no table\n', '| a |\n'), FragmentRefusal);
  assert.throws(() => applyFragment('librarian/sources/index.md', INDEX_MD, 'not a row\n'), FragmentRefusal);
});

test('a scorecard fragment opens with a row and may carry its stage line', () => {
  const out = applyFragment('.claude/skills/intake/SCORECARD.md', '| old |\n', '| new |\n\n**weakest stage: test**\n');
  assert.equal(out, '| old |\n| new |\n\n**weakest stage: test**\n');
  assert.throws(() => applyFragment('.claude/skills/intake/SCORECARD.md', '| old |\n', 'prose first\n'), FragmentRefusal);
});

test('a lessons fragment is its own block, set off by a blank line', () => {
  const out = applyFragment('.claude/skills/x/LESSONS.md', '# L\n', '## 1 - d - s\n\n- b\n');
  assert.equal(out, '# L\n\n## 1 - d - s\n\n- b\n');
  assert.throws(() => applyFragment('.claude/skills/x/LESSONS.md', '# L\n', '- bare\n'), FragmentRefusal);
  assert.throws(() => applyFragment('.claude/skills/x/LESSONS.md', out, '## 1 - d - s\n\n- b\n'), /already holds/);
});

test('a backlog fragment appends a new id, replaces a known one in place, and must stay a valid ledger', () => {
  const led = '{"id":"a","status":"held"}\n{"id":"b","status":"held"}\n';
  const out = applyFragment('librarian/harvest/backlog.jsonl', led, '{"id":"a","status":"queued"}\n{"id":"c","status":"held"}\n');
  assert.equal(out, '{"id":"a","status":"queued"}\n{"id":"b","status":"held"}\n{"id":"c","status":"held"}\n');
  assert.throws(() => applyFragment('librarian/harvest/backlog.jsonl', led, '{"id":"a","status":"held"}\n'), /already holds/);
  assert.throws(() => applyFragment('librarian/harvest/backlog.jsonl', led, '{"status":"held"}\n'), /no id/);
  assert.throws(() => applyFragment('librarian/harvest/backlog.jsonl', led, 'not json\n'), /not JSON/);
  assert.throws(() => applyFragment('librarian/harvest/backlog.jsonl', led, '{"id":"z","status":"nonsense"}\n'), /closed set/);
});

test('the door is a script with a usage line, and an unknown command is could-not-run', () => {
  const r = spawnSync(process.execPath, [path.join(SCRIPTS, 'shift-land.mjs'), 'nonsense'], { encoding: 'utf8' });
  assert.equal(r.status, EXIT.FATAL);
  assert.match(r.stderr, /usage:/);
});
