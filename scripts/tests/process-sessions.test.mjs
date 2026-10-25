// Tests for the structure-only session summariser (scripts/lib/process-sessions.mjs).
// `node --test scripts/tests/` - builtins only; fixture lines, never the real transcript store.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { summarize, summarizeFile, cwdsIn, encode, shellKind, toolKind, PHASE } from '../lib/process-sessions.mjs';

const at = (s) => `2026-09-20T10:00:${String(s).padStart(2, '0')}.000Z`;
const user = (s, text, extra = {}) => JSON.stringify({ type: 'user', timestamp: at(s), cwd: 'C:\\kiro\\app', entrypoint: 'cli', message: { content: text }, ...extra });
const tool = (s, id, name, input = {}) => JSON.stringify({ type: 'assistant', timestamp: at(s), cwd: 'C:\\kiro\\app', message: { model: 'claude-opus-5', content: [{ type: 'tool_use', id, name, input }], usage: { input_tokens: 10, output_tokens: 5 } } });
const result = (s, id, isError = false) => JSON.stringify({ type: 'user', timestamp: at(s), message: { content: [{ type: 'tool_result', tool_use_id: id, is_error: isError, content: 'SECRET OUTPUT' }] } });
const projectOf = (cwd) => (cwd.toLowerCase().includes('kiro') ? 'app' : null);

test('a session keeps structure and never its text', () => {
  const lines = [
    user(0, 'please fix the login bug in src/secret/path.ts'),
    tool(1, 't1', 'Read', { file_path: 'C:/secret/path.ts' }),
    result(2, 't1'),
    tool(3, 't2', 'Read'), result(4, 't2'),
    tool(5, 't3', 'Edit'), result(6, 't3'),
    tool(7, 't4', 'Bash', { command: 'npm run test -- --run' }), result(8, 't4', true),
    tool(9, 't5', 'Bash', { command: 'git commit -m "secret message"' }), result(10, 't5'),
  ];
  const s = summarize(lines, { projectOf, id: 'abcd1234' });
  assert.equal(s.project, 'app');
  assert.equal(s.mode, 'interactive');
  assert.deepEqual(s.steps.map((x) => [x.k, x.n, x.e]), [['prompt', 1, 0], ['read', 2, 0], ['edit', 1, 0], ['verify', 1, 1], ['commit', 1, 0]]);
  assert.equal(s.errors, 1);
  assert.equal(s.commits, 1);
  const wire = JSON.stringify(encode([s]));
  for (const leak of ['secret', 'login', 'SECRET', 'path.ts']) assert.ok(!wire.includes(leak), `leaked "${leak}"`);
});

test('a harness command is a prompt, a skill is a skill', () => {
  const s = summarize([
    user(0, '<command-name>/model</command-name>'),
    user(1, '<command-name>/spark</command-name> build it'),
    tool(2, 'a', 'Grep'), result(3, 'a'), tool(4, 'b', 'Glob'), result(5, 'b'), tool(6, 'c', 'Edit'), result(7, 'c'),
  ], { projectOf, id: 'x' });
  assert.deepEqual(s.skills, ['spark']);
  assert.deepEqual(s.steps.slice(0, 2).map((x) => [x.k, x.x]), [['prompt', 'cmd'], ['skill', 'spark']]);
});

test('a failed commit is not a commit, and outside the fleet is dropped', () => {
  const s = summarize([user(0, 'go'), tool(1, 'c', 'Bash', { command: 'git commit -m x' }), result(2, 'c', true)], { projectOf, id: 'y' });
  assert.equal(s.commits, 0);
  const none = summarize([JSON.stringify({ type: 'user', timestamp: at(0), cwd: 'D:\\elsewhere', message: { content: 'hi' } })], { projectOf, id: 'z' });
  assert.equal(none, null);
});

test('encode drops sessions without work and caps idle in active time', () => {
  const idle = summarize([user(0, 'hi')], { projectOf, id: 'idle' });
  const busy = summarize([user(0, 'go'), tool(1, 'a', 'Read'), result(1, 'a'), tool(2, 'b', 'Edit'), result(2, 'b'), tool(3, 'c', 'Bash', { command: 'ls' }), result(3, 'c')], { projectOf, id: 'busy' });
  const out = encode([idle, busy]);
  assert.deepEqual(out.sessions.map((s) => s.id), ['busy']);
  assert.ok(out.sessions[0].active <= out.sessions[0].dur);
});

test('shell and tool kinds', () => {
  assert.equal(shellKind('cargo test --lib'), 'verify');
  assert.equal(shellKind('git push origin main'), 'push');
  assert.equal(shellKind('npx vite build'), 'build');
  assert.equal(shellKind('git status'), 'git');
  assert.equal(toolKind('mcp__claude-in-chrome__navigate'), 'browser');
  assert.equal(PHASE.commit, 'ship');
});

// ---- discovery and attribution: read every folder, attribute by the records' cwd ----

const rec = (s, cwd, extra = {}) => JSON.stringify({ type: 'assistant', timestamp: at(s), cwd, message: { content: [{ type: 'tool_use', id: `r${s}`, name: 'Read', input: {} }] }, ...extra });
// a fixture fleet: C:\kiro\other is a checkout, C:\t\wt-* a worktree of `app`, C:\own a repo outside the fleet
const projectOfB = (cwd) => (cwd.toLowerCase().startsWith('c:\\kiro\\other') ? 'other' : null);
const placeOfB = (cwd) => {
  const l = cwd.toLowerCase();
  if (l.startsWith('c:\\t\\wt')) return { slug: 'app', via: 'worktree' };
  if (l.startsWith('c:\\own')) return { repo: 'c:\\own\\.git' };
  return null;
};
const fileOf = (cwds) => cwds.map((c, i) => rec(i, c));

test('a session launched in a checkout keeps the old rule\'s answer, whatever it visits later', () => {
  const lines = fileOf(['C:\\kiro\\other\\src', 'C:\\t\\wt-1', 'C:\\t\\wt-1', 'C:\\own', 'C:\\own']);
  const r = summarizeFile(lines, { projectOf: projectOfB, placeOf: placeOfB, id: 'a' });
  assert.equal(r.session.project, 'other');
  assert.equal(r.via, 'checkout');
  assert.equal(r.session.project, summarize(lines, { projectOf: projectOfB, id: 'a' }).project, 'positive control: the old entry point agrees');
});

test('a session launched in a fleet worktree is that repo\'s, and the old entry point never saw it', () => {
  const lines = fileOf(['C:\\t\\wt-2', 'C:\\t\\wt-2', 'C:\\kiro\\other']);
  const r = summarizeFile(lines, { projectOf: projectOfB, placeOf: placeOfB, id: 'b' });
  assert.deepEqual([r.disp, r.via, r.session.project, r.session.wt], ['read', 'worktree', 'app', 1]);
  assert.equal(summarize(fileOf(['C:\\t\\wt-2']), { projectOf: projectOfB, id: 'b' }), null);
  assert.equal(summarizeFile(fileOf(['C:\\t\\wt-2']), { projectOf: projectOfB, id: 'b' }).disp, 'outside-fleet');
});

test('launched outside the fleet: the records vote, and a repo outside the fleet can outvote', () => {
  const p = { projectOf: projectOfB, placeOf: placeOfB, id: 'v' };
  // launched in the home folder (no repository), then works in a checkout
  const home = summarizeFile(fileOf(['C:\\Users\\me', 'C:\\Users\\me', 'C:\\Users\\me', 'C:\\kiro\\other', 'C:\\kiro\\other']), p);
  assert.deepEqual([home.disp, home.via, home.session.project], ['read', 'vote', 'other']);
  // a run in its own repo that reads one fleet file is not fleet work - the old rule took it
  const visit = fileOf(['C:\\own', 'C:\\own', 'C:\\own', 'C:\\kiro\\other\\skills']);
  assert.equal(summarizeFile(visit, p).disp, 'outside-fleet');
  assert.equal(summarize(visit, { projectOf: projectOfB, id: 'v' }).project, 'other', 'positive control: the old rule attributes it');
  // ties go to the first seen
  assert.equal(summarizeFile(fileOf(['C:\\own', 'C:\\own', 'C:\\kiro\\other', 'C:\\kiro\\other']), p).disp, 'outside-fleet');
  assert.equal(summarizeFile(fileOf(['C:\\x', 'C:\\kiro\\other', 'C:\\kiro\\other', 'C:\\own', 'C:\\own']), p).session.project, 'other');
});

test('every transcript gets exactly one disposition', () => {
  const p = { projectOf, id: 'd' };
  assert.equal(summarizeFile([], p).disp, 'empty');
  assert.equal(summarizeFile([''], p).disp, 'empty');
  assert.equal(summarizeFile([JSON.stringify({ type: 'summary', summary: 'x' })], p).disp, 'empty');
  assert.equal(summarizeFile(['{not json', 'garbage'], p).disp, 'unparseable');
  assert.equal(summarizeFile([rec(0, 'D:\\elsewhere')], p).disp, 'outside-fleet');
  assert.equal(summarizeFile([user(0, 'hi')], p).disp, 'read');
  // a sidechain cwd does not attribute (as before)
  assert.equal(summarizeFile([rec(0, 'C:\\kiro\\app', { isSidechain: true })], p).disp, 'empty');
});

test('cwdsIn reads every distinct cwd in order without parsing records, escapes intact', () => {
  const buf = Buffer.from([
    JSON.stringify({ cwd: 'C:\\a "q"\\b', x: 1 }),
    JSON.stringify({ cwd: 'C:\\kiro\\app', message: { content: 'text mentioning "cwd":"C:\\fake" inline' } }),
    JSON.stringify({ cwd: 'C:\\a "q"\\b' }),
    '{"cwd":"C:\\\\x\\\\', // a cut-off line yields nothing
  ].join('\n'));
  assert.deepEqual(cwdsIn(buf), ['C:\\a "q"\\b', 'C:\\kiro\\app']);
  assert.deepEqual(cwdsIn(Buffer.from('')), []);
});

// The script end to end, on a fixture store: discovery reads every folder, attribution comes
// from the records' cwd, every transcript gets a disposition, and nothing path-like is kept.
const SCRIPT = fileURLToPath(new URL('../process-sessions.mjs', import.meta.url));
const ROOT = path.resolve(path.dirname(SCRIPT), '..');
const commonDir = (() => {
  const g = path.join(ROOT, '.git');
  if (fs.statSync(g).isDirectory()) return g;
  const gitdir = path.resolve(ROOT, fs.readFileSync(g, 'utf8').match(/gitdir:\s*(.+)/)[1].trim());
  const cd = path.join(gitdir, 'commondir');
  return fs.existsSync(cd) ? path.resolve(gitdir, fs.readFileSync(cd, 'utf8').trim()) : gitdir;
})();
const origin = (fs.readFileSync(path.join(commonDir, 'config'), 'utf8').match(/\[remote "origin"\][^[]*?\burl\s*=\s*(\S+)/) || [])[1];

test('the script reads every folder and accounts for every transcript', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ps-disc-'));
  try {
    const store = path.join(tmp, 'projects');
    // a pruned worktree whose directory survives: a .git FILE pointing into the registry's git dir
    const linked = path.join(tmp, 'linked'); fs.mkdirSync(linked);
    fs.writeFileSync(path.join(linked, '.git'), `gitdir: ${path.join(commonDir, 'worktrees', 'gone-xyz')}\n`);
    // a clone of the registry (same origin), and a repo that is not fleet
    const clone = path.join(tmp, 'clone'); fs.mkdirSync(path.join(clone, '.git'), { recursive: true });
    fs.writeFileSync(path.join(clone, '.git', 'config'), `[remote "origin"]\n\turl = ${origin ?? 'https://example.invalid/none'}\n`);
    const foreign = path.join(tmp, 'foreign'); fs.mkdirSync(path.join(foreign, '.git'), { recursive: true });
    fs.writeFileSync(path.join(foreign, '.git', 'config'), '[remote "origin"]\n\turl = https://example.invalid/not-fleet.git\n');
    const work = (cwd, s0 = 0) => [user(s0, 'SECRET PROMPT', { cwd }), rec(s0 + 1, cwd), rec(s0 + 2, cwd), rec(s0 + 3, cwd)].join('\n');
    const put = (dir, name, body, old = true) => {
      fs.mkdirSync(path.join(store, dir), { recursive: true });
      const f = path.join(store, dir, `${name}.jsonl`);
      fs.writeFileSync(f, body);
      if (old) { const t = new Date(Date.now() - 3600e3); fs.utimesSync(f, t, t); }
    };
    put('C--elsewhere', '11111111-in-checkout', work(path.join(ROOT, 'scripts')));
    put('C--Users-home', '22222222-launched-home', [rec(0, 'C:\\Users\\home'), work(path.join(ROOT, 'docs'), 1)].join('\n'));
    put('C--tmp-linked', '33333333-git-link', work(linked));
    put('C--tmp-clone', '44444444-clone', work(path.join(clone, 'src')));
    put('C--tmp-foreign', '55555555-foreign', [work(foreign), rec(9, path.join(ROOT, 'skills'))].join('\n'));
    // a vanished temp dir (never created here) holds most of the work: not provably fleet work
    put('C--tmp-gone', '99999999-vanished', [work(path.join(tmp, 'vanished', 'wt')), rec(9, path.join(ROOT, 'skills'))].join('\n'));
    put('C--tmp-foreign', '66666666-empty', '');
    put('C--tmp-foreign', '77777777-garbage', 'not json\n{also not');
    put('C--tmp-live', '88888888-live', work(path.join(ROOT, 'scripts')), false);
    const cache = path.join(tmp, 'cache.json');
    const run = () => JSON.parse(execFileSync(process.execPath, [SCRIPT, '--json', '--min-work', '1', '--claude-projects', store, '--cache', cache], { encoding: 'utf8' }));
    const out = run();
    const d = out.source.dispositions;
    assert.equal(out.source.scanned, 9);
    assert.equal(Object.values(d).reduce((a, b) => a + b, 0), out.source.scanned, 'dispositions account for every transcript');
    assert.deepEqual(d, { read: origin ? 4 : 3, 'outside-fleet': origin ? 2 : 3, empty: 1, unparseable: 1, 'in-flight': 1 });
    const ids = Object.fromEntries(out.sessions.map((s) => [s.id, s.project]));
    assert.equal(ids['11111111'], 'ai-registry');
    assert.equal(ids['22222222'], 'ai-registry', 'launched elsewhere, cwd later inside the checkout');
    assert.equal(ids['33333333'], 'ai-registry', 'a .git file into the registry git dir');
    if (origin) assert.equal(ids['44444444'], 'ai-registry', 'a clone with the registry origin');
    assert.equal(ids['55555555'], undefined, 'a run in a non-fleet repo that visits the registry once is not registry work');
    assert.equal(ids['99999999'], undefined, 'work in a vanished directory outvotes one registry visit');
    assert.equal(ids['88888888'], 'ai-registry', 'an in-flight session is read and shown');
    // structure only: no prompt text and no path in the output or the cache
    for (const blob of [JSON.stringify(out), fs.readFileSync(cache, 'utf8')]) {
      for (const leak of ['SECRET', path.basename(tmp), 'Users\\\\home']) assert.ok(!blob.includes(leak), `leaked ${leak}`);
    }
    // warm: nothing parsed again, same answer; the cache outlives the transcript
    const warm = run();
    assert.equal(warm.source.parsed, 0);
    assert.deepEqual(warm.source.dispositions, d);
    fs.rmSync(path.join(store, 'C--elsewhere'), { recursive: true });
    const rolled = run();
    assert.equal(rolled.source.scanned, 8);
    assert.ok(rolled.sessions.some((s) => s.id === '11111111'), 'a rolled-off transcript stays remembered');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('an unreadable device cache is reported and never overwritten - it is the only copy of rolled-off history', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ps-cache-'));
  try {
    const store = path.join(tmp, 'projects', 'C--x');
    fs.mkdirSync(store, { recursive: true });
    const cwd = path.join(ROOT, 'scripts');
    const f = path.join(store, 'aaaaaaaa-one.jsonl');
    fs.writeFileSync(f, [user(0, 'hi', { cwd }), rec(1, cwd), rec(2, cwd), rec(3, cwd)].join('\n'));
    const old = new Date(Date.now() - 3600e3); fs.utimesSync(f, old, old);
    const cache = path.join(tmp, 'cache.json');
    // A torn write (a killed run, a full disk) leaves the cache half-written.
    const torn = '{"version":1,"files":{"C--gone/bbbbbbbb.jsonl":{"size":10,"mtime":1,"disp":"read","session":{"id":"bbbbbbbb"';
    fs.writeFileSync(cache, torn);
    const r = spawnSync(process.execPath, [SCRIPT, '--json', '--min-work', '1', '--claude-projects', path.join(tmp, 'projects'), '--cache', cache], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    assert.equal(JSON.parse(r.stdout).source.scanned, 1, 'the read path still reports what it can see');
    assert.match(r.stderr, /cache .* is unreadable .* not written/);
    assert.equal(fs.readFileSync(cache, 'utf8'), torn, 'the damaged cache is left for recovery, not replaced by this run');
    // A healthy cache is replaced whole, through a temp file that does not stay behind.
    fs.rmSync(cache);
    const ok = spawnSync(process.execPath, [SCRIPT, '--json', '--min-work', '1', '--claude-projects', path.join(tmp, 'projects'), '--cache', cache], { encoding: 'utf8' });
    assert.equal(ok.status, 0, ok.stderr);
    assert.equal(JSON.parse(fs.readFileSync(cache, 'utf8')).version, 1);
    assert.deepEqual(fs.readdirSync(tmp).filter((n) => n.includes('.tmp')), [], 'no temp file left beside the cache');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
