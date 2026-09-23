// Tests for the structure-only session summariser (scripts/lib/process-sessions.mjs).
// `node --test scripts/tests/` - builtins only; fixture lines, never the real transcript store.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarize, encode, shellKind, toolKind, PHASE } from '../lib/process-sessions.mjs';

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
