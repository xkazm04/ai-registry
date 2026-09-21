// Tests for the skill run log: the contract (scripts/lib/runs.mjs), its writer
// (scripts/log-run.mjs) and its gate (scripts/check-runs.mjs).
//
// `node --test scripts/tests/` - builtins only, no network, no install.
//
// Nothing here writes into the real usage/runs/. The writer and the gate both honour
// REGISTRY_RUNS_ROOT (a stand-in registry root for the runs lane only), so every append
// and every planted row lands in a temp directory. Identity still resolves from this
// checkout's machine file; tests that need a device skip when the checkout has none (a
// CI runner has no .machine.local.json).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  SCHEMA, RUN_KEYS, LIMITS, validateRun, runId, leaksIn, assertLeakScanner, resolveIdentity, PENDING_REL,
} from '../lib/runs.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const LOG_RUN = path.join(ROOT, 'scripts', 'log-run.mjs');
const CHECK_RUNS = path.join(ROOT, 'scripts', 'check-runs.mjs');
const IDENTITY = resolveIdentity({ cwd: ROOT, registryRoot: ROOT });
const DEVICE = IDENTITY.device;
const noDevice = DEVICE ? false : 'this checkout has no machine identity (.machine.local.json)';

const tmp = (tag) => fs.mkdtempSync(path.join(os.tmpdir(), `rkb-runs-${tag}-`));

function goodRow(over = {}) {
  const row = {
    schema: SCHEMA, id: null, ts: '2026-09-21T10:11:12.345Z', started: '2026-09-21T09:00:00Z',
    project: 'personas', skill: 'spark', version: '1.3.2', device: 'Fox', contributor: 'mkdol-dev-box',
    provider: 'claude', model: 'claude-opus-5', effort: 'high', outcome: 'shipped', difficulty: 3,
    result: 'shipped the run log', comment: 'Went fine; see https://example.com/x for the source.', tokensEst: 1200,
    ...over,
  };
  if (!('id' in over)) row.id = runId(row);
  return row;
}

const run = (script, args, { cwd = ROOT, env = {} } = {}) =>
  spawnSync(process.execPath, [script, ...args], { cwd, env: { ...process.env, ...env }, encoding: 'utf8' });

const VALID_FLAGS = [
  '--skill', 'spark', '--version', '1.3.2', '--outcome', 'shipped', '--difficulty', '2',
  '--result', 'did the thing', '--comment', 'straightforward', '--provider', 'claude', '--model', 'claude-opus-5',
];

// ------------------------------------------------------------------ the contract
test('validateRun accepts a good row, in RUN_KEYS order', () => {
  const row = goodRow();
  assert.deepEqual(Object.keys(row), RUN_KEYS);
  assert.deepEqual(validateRun(row), []);
});

test('validateRun rejects each bad field class, naming the field', () => {
  const cases = [
    [{ outcome: 'done' }, /^outcome/],
    [{ provider: 'anthropic' }, /^provider/],
    [{ difficulty: 6 }, /^difficulty/],
    [{ difficulty: '3' }, /^difficulty/],
    [{ ts: '2026-09-21 10:00' }, /^ts/],
    [{ started: '2026-09-22T00:00:00Z' }, /started is after ts/],
    [{ project: 'Personas' }, /^project/],
    [{ skill: 'ai-registry:spark' }, /^skill/],
    [{ version: 'v1' }, /^version/],
    [{ device: 'Fox box' }, /^device/],
    [{ model: '' }, /^model/],
    [{ result: 'x'.repeat(LIMITS.result + 1) }, /^result is \d+ chars/],
    [{ comment: 'x'.repeat(LIMITS.comment + 1) }, /^comment is \d+ chars/],
    [{ result: 'two\nlines' }, /^result must be one line/],
    [{ comment: 'wrote C:\\Users\\x\\notes' }, /^comment contains a Windows path/],
    [{ tokensEst: -1 }, /^tokensEst/],
  ];
  for (const [over, re] of cases) {
    const problems = validateRun(goodRow(over));
    assert.ok(problems.some((p) => re.test(p)), `${JSON.stringify(over).slice(0, 60)} -> ${JSON.stringify(problems)}`);
  }
  const extra = { ...goodRow(), extra: 1 };
  assert.ok(validateRun(extra).includes('unknown key "extra"'));
  const missing = goodRow(); delete missing.effort;
  assert.ok(validateRun(missing).includes('missing key "effort"'));
  assert.ok(validateRun(goodRow({ id: 'Fox-wrong' })).includes('id must equal runId(row)'));
});

test('leak scanner allows https URLs and rejects Windows/POSIX paths and emails', () => {
  assert.doesNotThrow(() => assertLeakScanner());
  assert.deepEqual(leaksIn('see https://github.com/x/y and http://a.example/b'), []);
  assert.deepEqual(leaksIn('C:\\Users\\me\\x'), ['a Windows path']);
  assert.deepEqual(leaksIn('D:/work/repo'), ['a Windows path']);
  assert.deepEqual(leaksIn('in /home/me/repo'), ['a POSIX home/system path']);
  assert.deepEqual(leaksIn('(/Users/me/x)'), ['a POSIX home/system path']);
  assert.deepEqual(leaksIn('mail me@example.com'), ['an email address']);
});

test('runId is stable and drops sub-second precision', () => {
  const a = goodRow();
  assert.equal(runId(a), 'Fox-20260921T101112Z-spark');
  assert.equal(runId(goodRow({ ts: '2026-09-21T10:11:12.999Z' })), runId(a));
  assert.equal(runId(goodRow({ ts: '2026-09-21T12:11:12+02:00' })), runId(a));
});

// ------------------------------------------------------------------ the writer
test('log-run appends exactly one valid line and prints its id', { skip: noDevice }, () => {
  const dest = tmp('write');
  const r = run(LOG_RUN, VALID_FLAGS, { env: { REGISTRY_RUNS_ROOT: dest } });
  assert.equal(r.status, 0, r.stderr);
  const file = path.join(dest, 'usage', 'runs', `${DEVICE}.jsonl`);
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  assert.equal(lines.length, 1);
  const row = JSON.parse(lines[0]);
  assert.deepEqual(Object.keys(row), RUN_KEYS);
  assert.deepEqual(validateRun(row), []);
  assert.equal(row.project, 'ai-registry');
  assert.match(r.stdout, new RegExp(`^run logged: ${row.id} -> usage/runs/${DEVICE}\\.jsonl`, 'm'));
  // The gate accepts what the writer wrote.
  const g = run(CHECK_RUNS, [], { env: { REGISTRY_RUNS_ROOT: dest } });
  assert.equal(g.status, 0, g.stdout + g.stderr);
});

test('log-run rejects bad input with exit 1, names the field, writes nothing', { skip: noDevice }, () => {
  const dest = tmp('reject');
  const bad = [
    [['--outcome', 'done'], /outcome must be one of/],
    [['--difficulty', '7'], /difficulty must be an integer 1-5/],
    [['--provider', 'anthropic'], /provider must be one of/],
    [['--result', 'x'.repeat(LIMITS.result + 1)], /result is \d+ chars/],
    [['--comment', 'edited C:\\Users\\me\\file'], /comment contains a Windows path/],
    [['--comment', 'mail a@b.co'], /comment contains an email address/],
  ];
  for (const [over, re] of bad) {
    const args = [...VALID_FLAGS];
    args[args.indexOf(over[0]) + 1] = over[1];
    const r = run(LOG_RUN, args, { env: { REGISTRY_RUNS_ROOT: dest } });
    assert.equal(r.status, 1, `${over.join(' ')}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, re);
  }
  assert.equal(fs.existsSync(path.join(dest, 'usage')), false);
});

test('log-run reports a missing required flag and an unknown flag', () => {
  const r = run(LOG_RUN, VALID_FLAGS.slice(2), { env: { REGISTRY_RUNS_ROOT: tmp('missing') } });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /missing skill/);
  const u = run(LOG_RUN, ['--bogus', 'x']);
  assert.equal(u.status, 2);
});

test('log-run defaults --version from SKILL.md and strips a scoped skill name', { skip: noDevice }, () => {
  const fm = fs.readFileSync(path.join(ROOT, 'skills', 'spark', 'SKILL.md'), 'utf8').match(/^version:\s*(\S+)/m)[1];
  const args = VALID_FLAGS.filter((_, i, a) => a[i] !== '--version' && a[i - 1] !== '--version');
  args[args.indexOf('--skill') + 1] = 'ai-registry:spark';
  const r = run(LOG_RUN, [...args, '--dry-run']);
  assert.equal(r.status, 0, r.stderr);
  const row = JSON.parse(r.stdout.split('\n')[1]);
  assert.equal(row.skill, 'spark');
  assert.equal(row.version, fm);
  // A .claude/skills lane skill resolves too.
  const lane = fs.readdirSync(path.join(ROOT, '.claude', 'skills'))[0];
  const r2 = run(LOG_RUN, [...args.map((a) => (a === 'ai-registry:spark' ? lane : a)), '--dry-run']);
  assert.equal(r2.status, 0, r2.stderr);
  assert.match(JSON.parse(r2.stdout.split('\n')[1]).version, /^\d+\.\d+/);
  // An unknown skill with no --version must be told to pass one.
  const r3 = run(LOG_RUN, [...args.map((a) => (a === 'ai-registry:spark' ? 'no-such-skill' : a)), '--dry-run']);
  assert.equal(r3.status, 1);
  assert.match(r3.stderr, /pass --version/);
  // An explicit --version wins.
  const r4 = run(LOG_RUN, [...args, '--version', '9.9.9', '--dry-run']);
  assert.equal(JSON.parse(r4.stdout.split('\n')[1]).version, '9.9.9');
});

test('log-run --dry-run writes nothing', { skip: noDevice }, () => {
  const dest = tmp('dry');
  const r = run(LOG_RUN, [...VALID_FLAGS, '--dry-run'], { env: { REGISTRY_RUNS_ROOT: dest } });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^dry run/);
  assert.equal(fs.existsSync(path.join(dest, 'usage')), false);
});

test('log-run --json supplies long text; flags override it', { skip: noDevice }, () => {
  const dir = tmp('json');
  const f = path.join(dir, 'row.json');
  fs.writeFileSync(f, JSON.stringify({ comment: 'from the file', outcome: 'partial', difficulty: 4 }));
  const args = VALID_FLAGS.filter((_, i, a) => !['--comment', '--outcome'].includes(a[i]) && !['--comment', '--outcome'].includes(a[i - 1]));
  const r = run(LOG_RUN, [...args, '--json', f, '--dry-run']);
  assert.equal(r.status, 0, r.stderr);
  const row = JSON.parse(r.stdout.split('\n')[1]);
  assert.equal(row.comment, 'from the file');
  assert.equal(row.outcome, 'partial');
  assert.equal(row.difficulty, 2, 'the --difficulty flag overrides the file');
});

test('log-run --pending writes to <cwd>/.ai with device and id left for backfill', () => {
  const cwd = tmp('pending');
  const r = run(LOG_RUN, [...VALID_FLAGS, '--pending', '--project', 'demo'], { cwd });
  assert.equal(r.status, 0, r.stderr);
  const file = path.join(cwd, PENDING_REL);
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  assert.equal(lines.length, 1);
  const row = JSON.parse(lines[0]);
  assert.deepEqual(Object.keys(row), RUN_KEYS);
  assert.equal(row.device, null);
  assert.equal(row.id, null);
  assert.equal(row.project, 'demo');
  assert.match(r.stdout, /runs-backfill/);
});

// ------------------------------------------------------------------ the gate
function lane(files) {
  const root = tmp('lane');
  const dir = path.join(root, 'usage', 'runs');
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, lines] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), lines.map((l) => (typeof l === 'string' ? l : JSON.stringify(l))).join('\n') + '\n');
  return root;
}
const gate = (root) => run(CHECK_RUNS, [], { env: { REGISTRY_RUNS_ROOT: root } });
const exactRow = (id) => ({ schema: 'rkb-run-exact/1', id, session: 's1', model: 'claude-opus-5', effort: null, input: 1, cacheWrite: 2, cacheRead: 3, output: 4, matched: 'skill-call' });

test('check-runs passes an absent lane and a good one', () => {
  assert.equal(gate(tmp('absent')).status, 0);
  const a = goodRow();
  const b = goodRow({ ts: '2026-09-21T11:00:00Z', skill: 'forge' });
  const r = gate(lane({ 'Fox.jsonl': [a, b], 'Fox.exact.jsonl': [exactRow(a.id)] }));
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /3 row\(s\)/);
});

test('check-runs fails each planted defect with file:line', () => {
  const a = goodRow();
  const cases = [
    [{ 'Fox.jsonl': [a, goodRow({ comment: 'see /home/me/x' })] }, /Fox\.jsonl:2: comment contains a POSIX/],
    [{ 'Fox.jsonl': [a, '{not json'] }, /Fox\.jsonl:2: not valid JSON/],
    [{ 'Fox.jsonl': [a, a] }, /Fox\.jsonl:2: duplicate id/],
    [{ 'Fox.jsonl': [goodRow({ device: 'Wolf' })] }, /Fox\.jsonl:1: device "Wolf" does not match/],
    [{ 'Nobody.jsonl': [goodRow({ device: 'Nobody' })] }, /"Nobody" is not a machine/],
    [{ 'Fox.jsonl': [a], 'Fox.exact.jsonl': [exactRow('Fox-20200101T000000Z-x')] }, /has no row in usage\/runs\/Fox\.jsonl/],
    [{ 'Fox.jsonl': [a], 'Fox.exact.jsonl': [{ ...exactRow(a.id), matched: 'guess' }] }, /Fox\.exact\.jsonl:1: matched must be/],
    [{ 'Fox.jsonl': [a], 'notes.txt': ['hi'] }, /notes\.txt: unexpected file/],
  ];
  for (const [files, re] of cases) {
    const r = gate(lane(files));
    assert.equal(r.status, 1, `${Object.keys(files)}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, re);
  }
});
