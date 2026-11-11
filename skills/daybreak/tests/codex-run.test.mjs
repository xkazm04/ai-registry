import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(here, '..', 'scripts', 'codex-run.mjs');


// Every temp dir a test makes is removed when the file's tests end.
const made = [];
after(() => { for (const d of made) fs.rmSync(d, { recursive: true, force: true }); });
const tmp = (p) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), `dbk-${p}-`)); made.push(d); return d; };

// A stub codex: behaviour chosen by STUB_MODE. Records its argv for the argument test.
function makeStub(dir) {
  const file = path.join(dir, 'stub-codex.mjs');
  fs.writeFileSync(file, `
import fs from 'node:fs';
const mode = process.env.STUB_MODE;
fs.writeFileSync(new URL('./stub-argv.json', import.meta.url), JSON.stringify(process.argv.slice(2)));
const out = (o) => console.log(JSON.stringify(o));
out({ type: 'thread.started', thread_id: 'sess-123' });
process.stdin.resume();
process.stdin.on('end', () => {
  if (mode === 'sleep') { setInterval(() => {}, 1000); return; }
  if (mode === 'crash') { console.error('boom'); process.exit(1); }
  if (mode === 'done') fs.writeFileSync('changed.txt', 'x');
  out({ type: 'item.completed', item: { type: 'agent_message', text: 'finished' } });
  out({ type: 'turn.completed', usage: {} });
});
if (mode === 'sleep') setInterval(() => {}, 1000);
`);
  return file;
}

function runCli(mode, extra = []) {
  const dir = tmp(mode);
  const cwd = path.join(dir, 'repo');
  fs.mkdirSync(cwd);
  spawnSync('git', ['init', '-q'], { cwd });
  fs.writeFileSync(path.join(cwd, 'seed.txt'), 's');
  const brief = path.join(dir, 'brief.md');
  fs.writeFileSync(brief, 'do the thing');
  const runDir = path.join(dir, 'run');
  const r = spawnSync(process.execPath, [script, '--cwd', cwd, '--brief', brief, '--run-dir', runDir, ...extra], {
    env: { ...process.env, DAYBREAK_CODEX_BIN: makeStub(dir), STUB_MODE: mode },
    encoding: 'utf8',
    timeout: 60000,
  });
  const result = JSON.parse(fs.readFileSync(path.join(runDir, 'result.json'), 'utf8'));
  return { r, result, runDir, cwd };
}

test('done: a changed file, exit 0, session id and last message captured', () => {
  const { r, result, runDir, cwd } = runCli('done');
  assert.equal(r.status, 0);
  assert.equal(result.class, 'done');
  assert.equal(result.sessionId, 'sess-123');
  assert.ok(result.filesChanged.includes('changed.txt'));
  assert.equal(fs.readFileSync(path.join(runDir, 'last.md'), 'utf8'), 'finished');
  assert.match(fs.readFileSync(path.join(runDir, 'events.jsonl'), 'utf8'), /thread\.started/);
  const argv = JSON.parse(fs.readFileSync(path.join(path.dirname(cwd), 'stub-argv.json'), 'utf8'));
  assert.ok(argv.includes('model_reasoning_effort=medium'));
  assert.ok(argv.includes('gpt-6.1-sol'));
  assert.ok(argv.every((a) => !/\s/.test(a)));
});

test('no-diff: completes cleanly but changes nothing, exit 12', () => {
  const { r, result } = runCli('nodiff');
  assert.equal(r.status, 12);
  assert.equal(result.class, 'no-diff');
});

test('read sandbox: no diff is expected, so it is done', () => {
  const { r, result } = runCli('nodiff', ['--sandbox', 'read']);
  assert.equal(r.status, 0);
  assert.equal(result.class, 'done');
});

test('crash: exit 1 from codex, exit 11', () => {
  const { r, result } = runCli('crash');
  assert.equal(r.status, 11);
  assert.equal(result.class, 'crash');
  assert.equal(result.exitCode, 1);
});

test('timeout: a sleeping child is killed, result.json still written, exit 10', () => {
  const { r, result } = runCli('sleep', ['--timeout-min', '0.03']);
  assert.equal(r.status, 10);
  assert.equal(result.class, 'timeout');
  assert.equal(result.sessionId, 'sess-123');
});

test('resume puts the id in the argument list and sandbox in -c', async () => {
  const { buildArgs } = await import('../scripts/codex-run.mjs');
  const a = buildArgs({ resume: 'abc', sandbox: 'write' });
  assert.deepEqual(a.slice(0, 3), ['exec', 'resume', 'abc']);
  assert.ok(a.includes('sandbox_mode=workspace-write'));
  assert.ok(!a.includes('-s'));
});
