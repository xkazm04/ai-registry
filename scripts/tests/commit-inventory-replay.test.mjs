/**
 * Tests for scripts/commit-inventory-replay.mjs - the replay of a commit-inventory guard.
 *
 * Every transcript and repository here is a fixture in a temp dir; the real transcript
 * store is never read. The shell cases are the shapes observed in registry sessions:
 * a pathspec held in a variable, a message heredoc that mentions `git add`, an index-only
 * stage through `update-index --cacheinfo` with a computed hash.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  claimsOfCommand, relTo, normAbs, expandBraces, sessionFromLines, commitEvents, mapCommit,
  sessionClaims, indexClaims, verdict, selfAssert,
} from '../commit-inventory-replay.mjs';
import { encodeProjectPath } from '../lib/runs-transcript.mjs';

const SCRIPT = fileURLToPath(new URL('../commit-inventory-replay.mjs', import.meta.url));
const ROOT = 'c:/repo';
const rel = (r) => r.claims.map((c) => `${c.tier}:${relTo(c.abs, [ROOT]) ?? c.abs}`);

test('a heredoc body is lifted out, never parsed as a command', () => {
  const r = claimsOfCommand("cat > msg.txt <<'EOF'\nfix: git add evil.md\nEOF\ngit commit -F msg.txt", ROOT);
  assert.deepEqual(rel(r).filter((c) => c.includes('evil')), []);
  assert.ok(rel(r).includes('shell-write:msg.txt'));
  assert.equal(r.commitKind, 'commit');
});

test('an unquoted variable is word-split, a quoted one is not, braces expand', () => {
  const split = rel(claimsOfCommand('F="a.md b.md"; git add -- $F', ROOT));
  assert.ok(split.includes('staged:a.md') && split.includes('staged:b.md'));
  const quoted = rel(claimsOfCommand('F="a.md b.md"; git add -- "$F"', ROOT));
  assert.ok(quoted.includes('staged:a.md b.md') && !quoted.includes('staged:a.md'));
  assert.deepEqual(expandBraces('d/{x,y}.md'), ['d/x.md', 'd/y.md']);
  const braced = rel(claimsOfCommand('git add k/{x,y}.md', ROOT));
  assert.ok(braced.includes('staged:k/x.md') && braced.includes('staged:k/y.md'));
});

test('update-index keeps the path when only the hash is computed', () => {
  const r = rel(claimsOfCommand('B=$(git hash-object -w /c/t/w/catalog.json) && git update-index --cacheinfo 100644,$B,catalog.json', ROOT));
  assert.ok(r.includes('staged:catalog.json'));
});

test('shell writes: redirects, sed -i, cp into a directory, inline writeFileSync', () => {
  const r = rel(claimsOfCommand("printf x >> l/a.md 2>/dev/null && sed -i 's/a/b/' l/b.md && cp /c/t/w/rules/r.md rules/ && node -e \"require('fs').writeFileSync('l/c.json','1')\"", ROOT));
  for (const want of ['shell-write:l/a.md', 'shell-write:l/b.md', 'shell-write:rules/r.md', 'shell-write:l/c.json']) assert.ok(r.includes(want), want);
  assert.ok(!r.some((c) => c.includes('dev/null')));
});

test('broad adds authorize nothing; a cd into a subdirectory scopes git add .', () => {
  const broad = claimsOfCommand('git add -A && git commit -qam x', ROOT);
  assert.equal(broad.broad, true);
  const s = sessionFromLines('s', [[
    { type: 'assistant', timestamp: '2026-01-01T00:00:00Z', cwd: ROOT, message: { content: [{ type: 'tool_use', id: 'a', name: 'Bash', input: { command: 'git add . && cd k && git add .' } }] } },
  ]]);
  const v = verdict({ paths: ['top.md', 'k/inner.md'], index: indexClaims(sessionClaims(s).claims, [ROOT]), gens: [], cutoff: Infinity, roots: [ROOT] });
  assert.deepEqual(v.flaggedB, ['top.md']);
});

test('generator outputs count only when the generator ran before the commit', () => {
  const gens = [{ gen: 'build-catalog', ts: 10 }];
  const before = verdict({ paths: ['catalog.json'], index: indexClaims([], [ROOT]), gens, cutoff: 20, roots: [ROOT] });
  const after = verdict({ paths: ['catalog.json'], index: indexClaims([], [ROOT]), gens, cutoff: 5, roots: [ROOT] });
  assert.deepEqual(before.flaggedB, []);
  assert.deepEqual(after.flaggedB, ['catalog.json']);
  const check = claimsOfCommand('node scripts/build-catalog.mjs --check', ROOT);
  assert.deepEqual(check.gens, []);
});

test('B accepts a path only named to git add; B-strict does not', () => {
  const claims = [{ tier: 'staged', abs: normAbs(`${ROOT}/typed-from-status.md`), ts: 1 }, { tier: 'tool-write', abs: normAbs(`${ROOT}/mine.md`), ts: 1 }];
  const v = verdict({ paths: ['mine.md', 'typed-from-status.md'], index: indexClaims(claims, [ROOT]), gens: [], cutoff: 2, roots: [ROOT] });
  assert.deepEqual(v.flaggedB, []);
  assert.deepEqual(v.flaggedStrict, ['typed-from-status.md']);
});

test('relTo follows worktree conventions and leaves foreign paths unrooted', () => {
  assert.equal(relTo('c:/repo/.claude/worktrees/w1/k/a.md', ['c:/repo']), 'k/a.md');
  assert.equal(relTo('c:/t/run-1/k/a.md', ['c:/repo']), 'k/a.md');
  assert.equal(relTo('d:/elsewhere/k/a.md', ['c:/repo']), null);
});

const call = (id, ts, command, result, extra = {}) => [
  { type: 'assistant', timestamp: ts, cwd: ROOT, message: { content: [{ type: 'tool_use', id, name: 'Bash', input: { command } }] }, ...extra },
  { type: 'user', timestamp: new Date(Date.parse(ts) + 2000).toISOString(), cwd: ROOT, message: { content: [{ type: 'tool_result', tool_use_id: id, content: result }] } },
];

test('mapping: the sha beats the window, a rebased sha maps by subject, a tie is ambiguous', () => {
  const a = sessionFromLines('a', [call('x', '2026-01-01T00:00:10Z', 'git commit -qm "fix: the thing that matters"', '[main abc1234] fix: the thing that matters')]);
  const b = sessionFromLines('b', [call('y', '2026-01-01T00:00:10Z', 'git -C /c/other commit -qm "chore: unrelated"', '[main 9999999] chore: unrelated')]);
  const ev = commitEvents([a, b]);
  const bySha = mapCommit({ sha: 'abc1234def', authorDate: '2026-01-01T00:00:11Z', subject: 'fix: the thing that matters' }, ev);
  assert.equal(bySha.event.session.id, 'a'); assert.equal(bySha.evidence, 'sha');
  const rebased = mapCommit({ sha: 'fedcba9876', authorDate: '2026-01-01T00:00:11Z', subject: 'fix: the thing that matters' }, ev);
  assert.equal(rebased.event.session.id, 'a'); assert.equal(rebased.evidence, 'subject');
  const unknown = mapCommit({ sha: '0000000aaa', authorDate: '2026-01-01T00:00:11Z', subject: 'docs: something nobody typed' }, ev);
  assert.match(unknown.unmapped, /^ambiguous/);
  const none = mapCommit({ sha: '0000000aaa', authorDate: '2026-01-02T00:00:00Z', subject: 'docs: later' }, ev);
  assert.match(none.unmapped, /no commit-bearing call/);
});

test('the self-assertion passes', () => {
  assert.equal(selfAssert(), null);
});

test('end to end: a fixture repo and transcript, one clean commit and one planted foreign path', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cir-'));
  const repo = path.join(tmp, 'repo');
  fs.mkdirSync(repo);
  const g = (...a) => execFileSync('git', ['-C', repo, '-c', 'core.autocrlf=false', ...a], { encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_DATE: '2026-01-01T00:00:11Z', GIT_COMMITTER_DATE: '2026-01-01T00:00:11Z' } });
  g('init', '-q'); g('config', 'user.email', 't@example.invalid'); g('config', 'user.name', 't');
  fs.writeFileSync(path.join(repo, 'mine.md'), 'x\n');
  fs.writeFileSync(path.join(repo, 'sibling.md'), 'y\n');
  g('add', 'mine.md', 'sibling.md'); g('commit', '-qm', 'land mine and a swept sibling file');
  const sha = g('rev-parse', 'HEAD').trim();
  const projects = path.join(tmp, 'projects');
  const dir = path.join(projects, encodeProjectPath(repo));
  fs.mkdirSync(dir, { recursive: true });
  const lines = [
    { type: 'assistant', timestamp: '2026-01-01T00:00:00Z', cwd: repo, message: { content: [{ type: 'tool_use', id: 'w', name: 'Write', input: { file_path: path.join(repo, 'mine.md'), content: 'x' } }] } },
    ...call('c', '2026-01-01T00:00:10Z', 'git add mine.md && git commit -qm "land mine and a swept sibling file"', `[main ${sha.slice(0, 7)}] land mine and a swept sibling file`).map((l) => ({ ...l, cwd: repo })),
  ];
  fs.writeFileSync(path.join(dir, 's1.jsonl'), lines.map((l) => `${JSON.stringify(l)}\n`).join(''));
  const out = path.join(tmp, 'out');
  const res = spawnSync(process.execPath, [SCRIPT, '--root', repo, '--claude-projects', projects, '--sha', sha, '--out', out, '--expect', `${sha.slice(0, 8)}=sibling.md`, '--plant', `${sha.slice(0, 8)}=planted/foreign.md`], { encoding: 'utf8' });
  assert.equal(res.status, 1, res.stdout + res.stderr);
  const summary = JSON.parse(fs.readFileSync(path.join(out, 'summary.json'), 'utf8'));
  assert.equal(summary.mapped, 1);
  assert.equal(summary.expect[0].caughtB, 1);
  assert.equal(summary.expect[0].exactB, false); // the planted path is flagged too
  assert.equal(summary.plant[0].ok, true);
  const row = JSON.parse(fs.readFileSync(path.join(out, 'rows.jsonl'), 'utf8').trim());
  assert.deepEqual(row.flaggedB.sort(), ['planted/foreign.md', 'sibling.md']);
  assert.ok(row.tiers['mine.md'].includes('tool-write'));
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('--out inside the repository is refused', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cir-'));
  const repo = path.join(tmp, 'repo');
  fs.mkdirSync(repo);
  execFileSync('git', ['-C', repo, 'init', '-q']);
  const projects = path.join(tmp, 'projects');
  fs.mkdirSync(path.join(projects, encodeProjectPath(repo)), { recursive: true });
  const res = spawnSync(process.execPath, [SCRIPT, '--root', repo, '--claude-projects', projects, '--since', '2026-01-01', '--out', path.join(repo, 'rows')], { encoding: 'utf8' });
  assert.equal(res.status, 2, res.stdout + res.stderr);
  assert.match(res.stderr, /inside the repository/);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('inline code that stages by blob or writes by composition is a claim', () => {
  const blob = rel(claimsOfCommand(`node -e "
const pairs=[['librarian/applied.md','C:/t/x/rows.md']];
for (const [p,add] of pairs) { execSync('git update-index --cacheinfo 100644,'+sha+','+p); fs.appendFileSync(p, mine); }"`, ROOT));
  assert.ok(blob.includes('code-staged:librarian/applied.md'));
  assert.ok(blob.includes('code-write:librarian/applied.md'));
  const py = claimsOfCommand(`py - <<'PY'\nbase = "notes/se/"\nfor name in ["alpha", "beta"]:\n    open(base + name + ".md", "a").write("x")\nPY`, ROOT);
  const v = verdict({ paths: ['notes/se/alpha.md', 'notes/se/gamma.md'], index: indexClaims(py.claims.map((c) => ({ ...c, ts: 1 })), [ROOT]), gens: [], cutoff: 2, roots: [ROOT] });
  assert.deepEqual(v.flaggedStrict, ['notes/se/gamma.md']);
  const sh = rel(claimsOfCommand("bash <<'SH'\nprintf x > k/from-heredoc.md\nSH", ROOT));
  assert.ok(sh.includes('shell-write:k/from-heredoc.md'));
});

test('a for-loop variable fans out; a timeout wrapper does not hide the command', () => {
  const loop = rel(claimsOfCommand('for p in catalog.json k/index.json; do h=$(git hash-object -w "/c/t/w/$p"); git update-index --cacheinfo 100644,$h,$p; done', ROOT));
  assert.ok(loop.includes('staged:catalog.json') && loop.includes('staged:k/index.json'));
  const gate = claimsOfCommand('cd /c/t/w && timeout 900 node scripts/gate.mjs --lane knowledge --write', ROOT);
  assert.ok(gate.gens.includes('build-catalog'));
});

test('a script the session wrote and then ran carries its path arguments', () => {
  const lines = [
    { type: 'assistant', timestamp: '2026-01-01T00:00:00Z', cwd: ROOT, message: { content: [{ type: 'tool_use', id: 'a', name: 'Bash', input: { command: "cat > /c/t/x/stage.js <<'EOF'\nconst cp=require('child_process');cp.execFileSync('git',['update-index','--cacheinfo',m]);fs.appendFileSync(f,x)\nEOF" } }] } },
    { type: 'assistant', timestamp: '2026-01-01T00:00:05Z', cwd: ROOT, message: { content: [{ type: 'tool_use', id: 'b', name: 'Bash', input: { command: 'node /c/t/x/stage.js librarian/applied.md /c/t/x/rows.md' } }] } },
  ];
  const s = sessionFromLines('s', [lines]);
  const v = verdict({ paths: ['librarian/applied.md', 'librarian/other.md'], index: indexClaims(sessionClaims(s).claims, [ROOT]), gens: [], cutoff: Infinity, roots: [ROOT] });
  assert.deepEqual(v.flaggedB, ['librarian/other.md']);
  assert.deepEqual(v.flaggedStrict, ['librarian/other.md']);
});

test('a loop body runs once per value: cp in a loop copies each file to its own destination', () => {
  const r = rel(claimsOfCommand('D=k/s; for f in a.md t/b.md; do cp "$D/$f" "/c/t/w/$D/$f"; done', ROOT));
  assert.ok(r.includes('shell-write:k/s/a.md') && r.includes('shell-write:k/s/t/b.md'), r.join(' '));
  assert.ok(!r.some((c) => c.includes('a.md/')), r.join(' '));
});

test('a prefix assignment after a keyword does not hide the command', () => {
  const r = claimsOfCommand('cd /c/repo2 && if [ "$N" = "0" ]; then GIT_INDEX_FILE="$IDX" git commit -q -F m.txt; fi', ROOT);
  assert.equal(r.commitKind, 'commit');
  assert.equal(r.commitCwd, 'c:/repo2');
});
