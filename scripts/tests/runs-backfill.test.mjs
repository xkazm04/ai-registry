/**
 * Tests for the run-log backfill (lib/runs-transcript.mjs + runs-backfill.mjs) and the
 * shared fold (lib/runs-aggregate.mjs + runs-report.mjs).
 *
 * Every transcript here is a fixture built in a temp dir. The real ~/.claude store is
 * never read: a test that passes against one machine's history proves nothing on the next.
 *
 * Run: node --test scripts/tests/test_runs_backfill.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runId, RUN_KEYS, EXACT_KEYS, EXACT_SCHEMA, LOCAL_REL, RECEIPT_REL, stampRow, validateLocal, validateRun, validateExact, readJsonl, runsFile, exactFile } from '../lib/runs.mjs';
import {
  encodeProjectPath, transcriptDirs, sumUsage, findAnchor, matchRun, listSessions, observedModelEffort,
} from '../lib/runs-transcript.mjs';
import { aggregateRuns, median, catalogFields, skillResolver } from '../lib/runs-aggregate.mjs';
import { backfill } from '../runs-backfill.mjs';
import { buildReport } from '../runs-report.mjs';

const SCRIPTS = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'runs-backfill-'));
const writeJsonl = (file, rows) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, rows.map((r) => `${JSON.stringify(r)}\n`).join('')); };
const ms = (iso) => Date.parse(iso);

// ---------------------------------------------------------------- fixture builders
const asst = (ts, id, usage, { model = 'claude-opus-5', effort = 'high', content = [{ type: 'text', text: 'x' }] } = {}) => ({
  type: 'assistant', timestamp: ts, sessionId: 'S', effort,
  message: { id, model, role: 'assistant', content, usage: { input_tokens: usage[0], cache_creation_input_tokens: usage[1], cache_read_input_tokens: usage[2], output_tokens: usage[3] } },
});
const skillCall = (ts, id, skill, usage = [1, 0, 0, 1]) => asst(ts, id, usage, { content: [{ type: 'tool_use', id: `tu-${id}`, name: 'Skill', input: { skill, args: '' } }] });
const userLine = (ts, content) => ({ type: 'user', timestamp: ts, message: { role: 'user', content } });

function runRow(over = {}) {
  const r = {
    schema: 'rkb-run/1', id: null, ts: '2026-09-10T10:30:00Z', started: null, project: 'demo', skill: 'spark', version: '1.4.0',
    device: 'Testbox', contributor: 'test-box', provider: 'claude', model: 'claude-opus-5', effort: 'high',
    outcome: 'shipped', difficulty: 3, result: 'did the thing', comment: 'went fine', tokensEst: 50000, ...over,
  };
  r.id = runId(r);
  return Object.fromEntries(RUN_KEYS.map((k) => [k, r[k]]));
}

/** A registry root with a one-project fleet on machine Testbox, plus a claude projects dir. */
function fixtureRegistry() {
  const base = tmp();
  const reg = path.join(base, 'registry');
  const proj = path.join(base, 'work', 'demo');
  fs.mkdirSync(reg, { recursive: true });
  fs.mkdirSync(proj, { recursive: true });
  fs.writeFileSync(path.join(reg, 'projects.json'), JSON.stringify({ machines: { Testbox: { root: base } }, projects: { demo: { checkouts: { Testbox: 'work/demo' } } } }));
  fs.writeFileSync(path.join(reg, '.machine.local.json'), JSON.stringify({ machine: 'Testbox', root: base, contributor: 'test-box' }));
  const claude = path.join(base, 'claude-projects');
  fs.mkdirSync(claude, { recursive: true });
  return { base, reg, proj, claude };
}

// ---------------------------------------------------------------- path encoding
test('encodeProjectPath replaces every non-alphanumeric char with a dash', () => {
  if (process.platform === 'win32') {
    assert.equal(encodeProjectPath('C:\\Users\\mkdol\\dolla\\ai-registry'), 'C--Users-mkdol-dolla-ai-registry');
    assert.equal(encodeProjectPath('C:\\Users\\mkdol\\.personas\\projects\\chainsonar'), 'C--Users-mkdol--personas-projects-chainsonar');
    assert.equal(encodeProjectPath('C:\\a\\b_c d'), 'C--a-b-c-d');
  } else {
    assert.equal(encodeProjectPath('/home/x/.personas/p'), '-home-x--personas-p');
    assert.equal(encodeProjectPath('/a/b_c d'), '-a-b-c-d');
  }
});

test('transcriptDirs follows worktree folders but not sibling projects sharing a prefix', () => {
  const root = tmp();
  const checkout = path.join(root, 'kp');
  const enc = encodeProjectPath(checkout);
  for (const n of [enc, `${enc}--claude-worktrees-wave`, `${enc}-tools`, 'unrelated']) fs.mkdirSync(path.join(root, 'cp', n), { recursive: true });
  const got = transcriptDirs(path.join(root, 'cp'), checkout).map((d) => path.basename(d));
  assert.deepEqual(got, [enc, `${enc}--claude-worktrees-wave`]);
});

// ---------------------------------------------------------------- usage summing
test('sumUsage counts each message.id once across repeated lines and files', () => {
  const main = [
    asst('2026-09-10T10:00:00Z', 'm1', [10, 100, 1000, 5]),
    asst('2026-09-10T10:00:01Z', 'm1', [10, 100, 1000, 5]), // same message, second content block
    asst('2026-09-10T10:01:00Z', 'm2', [1, 2, 3, 4]),
    asst('2026-09-10T11:00:00Z', 'm3', [999, 999, 999, 999]), // outside the window
  ];
  const sub = [asst('2026-09-10T10:02:00Z', 's1', [7, 0, 0, 3]), asst('2026-09-10T10:02:00Z', 'm2', [1, 2, 3, 4])];
  const t = sumUsage([main, sub], ms('2026-09-10T09:59:00Z'), ms('2026-09-10T10:30:00Z'));
  assert.deepEqual(t, { input: 18, cacheWrite: 102, cacheRead: 1003, output: 12, messages: 3 });
});

test('observedModelEffort takes the most frequent model and top-level effort, ignoring <synthetic>', () => {
  const lines = [
    asst('2026-09-10T10:00:00Z', 'a', [1, 0, 0, 1], { model: 'claude-opus-5', effort: 'high' }),
    asst('2026-09-10T10:00:01Z', 'a', [1, 0, 0, 1], { model: 'claude-opus-5', effort: 'high' }),
    asst('2026-09-10T10:00:02Z', 'b', [1, 0, 0, 1], { model: '<synthetic>', effort: 'max' }),
    asst('2026-09-10T10:00:03Z', 'c', [1, 0, 0, 1], { model: 'claude-sonnet-5', effort: 'max' }),
    asst('2026-09-10T10:00:04Z', 'd', [1, 0, 0, 1], { model: 'claude-opus-5', effort: 'max' }),
  ];
  assert.deepEqual(observedModelEffort(lines, 0, Infinity), { model: 'claude-opus-5', effort: 'max' });
});

// ---------------------------------------------------------------- anchors / windows
test('findAnchor prefers the latest Skill tool_use at or before ts; accepts plugin-scoped names', () => {
  const lines = [
    userLine('2026-09-10T09:00:00Z', '<command-name>/spark</command-name>'),
    skillCall('2026-09-10T09:10:00Z', 'k1', 'spark'),
    skillCall('2026-09-10T09:20:00Z', 'k2', 'plugin:spark'),
    skillCall('2026-09-10T09:25:00Z', 'k3', 'sparkle'), // not this skill
    skillCall('2026-09-10T11:00:00Z', 'k4', 'spark'), // after ts
  ];
  assert.deepEqual(findAnchor(lines, 'spark', ms('2026-09-10T10:30:00Z')), { kind: 'skill-call', at: ms('2026-09-10T09:20:00Z') });
});

test('findAnchor falls back to a command tag when no Skill call exists', () => {
  const lines = [userLine('2026-09-10T09:00:00Z', '<command-message>intake</command-message>\n<command-name>/intake</command-name>'), asst('2026-09-10T09:01:00Z', 'a', [1, 0, 0, 1])];
  assert.deepEqual(findAnchor(lines, 'intake', ms('2026-09-10T10:00:00Z')), { kind: 'command-tag', at: ms('2026-09-10T09:00:00Z') });
  assert.equal(findAnchor(lines, 'spark', ms('2026-09-10T10:00:00Z')), null);
});

function sessionDir(claude, checkout, id, lines, subs = {}) {
  const dir = path.join(claude, encodeProjectPath(checkout));
  writeJsonl(path.join(dir, `${id}.jsonl`), lines);
  for (const [name, sl] of Object.entries(subs)) writeJsonl(path.join(dir, id, 'subagents', `${name}.jsonl`), sl);
  return dir;
}

test('matchRun: skill-call window, subagent usage included, model/effort from main session', () => {
  const { claude, proj } = fixtureRegistry();
  const dir = sessionDir(claude, proj, 'sess-1', [
    asst('2026-09-10T09:00:00Z', 'pre', [500, 500, 500, 500]), // before the skill started
    skillCall('2026-09-10T10:00:00Z', 'k', 'spark', [10, 20, 30, 40]),
    asst('2026-09-10T10:10:00Z', 'w', [1, 2, 3, 4]),
    asst('2026-09-10T10:10:00Z', 'w', [1, 2, 3, 4]),
    asst('2026-09-10T10:31:00Z', 'post', [9, 9, 9, 9]),
  ], { 'agent-a': [asst('2026-09-10T10:05:00Z', 'sa', [100, 0, 0, 50], { model: 'claude-haiku-5' })] });
  const sessions = listSessions([dir]);
  const res = matchRun(runRow(), sessions, { schema: EXACT_SCHEMA });
  assert.ok(res.exact, JSON.stringify(res));
  assert.deepEqual(res.exact, {
    schema: EXACT_SCHEMA, id: runRow().id, session: 'sess-1', model: 'claude-opus-5', effort: 'high',
    input: 111, cacheWrite: 22, cacheRead: 33, output: 94, matched: 'skill-call',
  });
  assert.deepEqual(validateExact(res.exact), []);
});

test('matchRun: command-tag anchor, started-only window, and no anchor without started is unmatched', () => {
  const { claude, proj } = fixtureRegistry();
  const dir = sessionDir(claude, proj, 'sess-2', [
    userLine('2026-09-10T10:00:00Z', '<command-name>/spark</command-name>'),
    asst('2026-09-10T10:01:00Z', 'a', [1, 1, 1, 1]),
    asst('2026-09-10T10:29:00Z', 'b', [2, 2, 2, 2]),
  ]);
  const sessions = listSessions([dir]);
  assert.equal(matchRun(runRow(), sessions, { schema: EXACT_SCHEMA }).exact.matched, 'command-tag');

  const other = runRow({ skill: 'forge' });
  const none = matchRun(other, sessions, { schema: EXACT_SCHEMA });
  assert.ok(none.unmatched, 'no anchor and no started must not invent a span');

  const withStart = runRow({ skill: 'forge', started: '2026-09-10T10:15:00Z' });
  const w = matchRun(withStart, sessions, { schema: EXACT_SCHEMA });
  assert.equal(w.exact.matched, 'window');
  assert.equal(w.exact.input, 2, 'only the message after started counts');
});

test('matchRun: two parallel sessions are ambiguous unless exactly one ran log-run', () => {
  const { claude, proj } = fixtureRegistry();
  const lines = [skillCall('2026-09-10T10:00:00Z', 'k', 'spark'), asst('2026-09-10T10:29:00Z', 'z', [1, 0, 0, 1])];
  sessionDir(claude, proj, 'sa', lines);
  const dir = sessionDir(claude, proj, 'sb', [...lines.map((l) => ({ ...l, message: { ...l.message, id: `b-${l.message.id}` } }))]);
  assert.match(matchRun(runRow(), listSessions([dir]), { schema: EXACT_SCHEMA }).unmatched, /ambiguous/);
  sessionDir(claude, proj, 'sb', [...lines, asst('2026-09-10T10:29:30Z', 'lr', [1, 0, 0, 1], { content: [{ type: 'tool_use', name: 'Bash', input: { command: 'node ../registry/scripts/log-run.mjs --skill spark' } }] })]);
  assert.equal(matchRun(runRow(), listSessions([dir]), { schema: EXACT_SCHEMA }).exact.session, 'sb');
});

/** What an agent without the script writes by hand: LOCAL_REQUIRED and nothing else. */
const agentRow = (over = {}) => ({
  ts: '2026-09-10T10:30:00Z', skill: 'spark', outcome: 'shipped', difficulty: 3,
  result: 'did the thing', comment: 'went fine', provider: 'claude', model: 'claude-opus-5', ...over,
});
const receipt = (dir, skills, harness = 'claude') => {
  fs.mkdirSync(path.join(dir, '.ai'), { recursive: true });
  fs.writeFileSync(path.join(dir, RECEIPT_REL), JSON.stringify({ schema: 1, installations: { [harness]: { mode: 'release', skills: Object.fromEntries(Object.entries(skills).map(([k, v]) => [k, { version: v }])) } } }));
};
const laneSkill = (reg, name, version) => {
  fs.mkdirSync(path.join(reg, 'skills', name), { recursive: true });
  fs.writeFileSync(path.join(reg, 'skills', name, 'SKILL.md'), `---\nname: ${name}\nversion: ${version}\n---\n# ${name}\n`);
};

// ---------------------------------------------------------------- local stamping
test('stampRow fills device/contributor/project/version from the stamp, computes id, writes contract key order', () => {
  const s = stampRow(agentRow(), { device: 'Testbox', contributor: 'test-box', project: 'demo', version: '1.4.0' });
  assert.deepEqual(validateLocal(agentRow()), []);
  assert.deepEqual(Object.keys(s), RUN_KEYS);
  assert.equal(s.device, 'Testbox');
  assert.equal(s.contributor, 'test-box');
  assert.equal(s.id, 'Testbox-20260910T103000Z-spark');
  assert.deepEqual(s, runRow({ tokensEst: null, effort: null }));
  assert.deepEqual(validateRun(s), []);
});

// ---------------------------------------------------------------- end to end
test('backfill drains local rows, measures once, and a second run appends nothing', () => {
  const { reg, proj, claude } = fixtureRegistry();
  const logged = runRow({ ts: '2026-09-10T12:00:00Z', skill: 'forge' });
  writeJsonl(runsFile(reg, 'Testbox'), [logged, runRow({ ts: '2026-09-10T12:05:00Z', provider: 'openai', model: 'gpt-x' })]);
  receipt(proj, { spark: '1.4.0' });
  const local = agentRow(); // hand-written: no device, id, version or project
  const invalid = { ...agentRow({ ts: '2026-09-10T10:40:00Z' }), outcome: 'great' };
  writeJsonl(path.join(proj, LOCAL_REL), [local, invalid]);
  sessionDir(claude, proj, 'sess-e2e', [
    skillCall('2026-09-10T10:00:00Z', 'k1', 'spark', [10, 0, 100, 5]),
    asst('2026-09-10T10:20:00Z', 'a1', [1, 0, 0, 1]),
    userLine('2026-09-10T11:50:00Z', '<command-name>/forge</command-name>'),
    asst('2026-09-10T11:55:00Z', 'a2', [3, 0, 0, 3]),
    userLine('2026-09-10T12:00:01Z', 'log-run tool result'), // the session outlives its log-run call
  ]);
  const quiet = () => {};

  const first = backfill({ registryRoot: reg, claudeProjects: claude, log: quiet });
  assert.equal(first.drained, 1);
  assert.equal(first.drainInvalid.length, 1);
  assert.equal(first.written, 2);
  assert.deepEqual(first.matched, { 'skill-call': 1, 'command-tag': 1, window: 0 });
  assert.equal(first.skippedNonClaude, 1);
  assert.deepEqual(first.unmatched, []);

  const log = readJsonl(runsFile(reg, 'Testbox')).rows;
  assert.equal(log.length, 3);
  assert.equal(log[2].id, 'Testbox-20260910T103000Z-spark');
  assert.equal(log[2].device, 'Testbox');
  assert.equal(log[2].contributor, 'test-box');
  assert.equal(log[2].project, 'demo', 'project = the fleet slug of the checkout the file sits in');
  assert.equal(log[2].version, '1.4.0', 'version from the installation receipt of the checkout');
  assert.deepEqual(validateRun(log[2]), []);
  const left = readJsonl(path.join(proj, LOCAL_REL)).rows;
  assert.equal(left.length, 1, 'only the invalid row stays local');
  assert.equal(left[0].outcome, 'great');

  const side = readJsonl(exactFile(reg, 'Testbox')).rows;
  assert.equal(side.length, 2);
  for (const x of side) { assert.deepEqual(Object.keys(x), EXACT_KEYS); assert.deepEqual(validateExact(x), []); }

  const second = backfill({ registryRoot: reg, claudeProjects: claude, log: quiet });
  assert.equal(second.written, 0);
  assert.equal(second.drained, 0);
  assert.equal(second.alreadyExact, 2);
  assert.equal(readJsonl(exactFile(reg, 'Testbox')).rows.length, 2);
  assert.equal(readJsonl(runsFile(reg, 'Testbox')).rows.length, 3);
});

test('backfill --dry-run writes nothing and leaves the local file in place', () => {
  const { reg, proj, claude } = fixtureRegistry();
  writeJsonl(path.join(proj, LOCAL_REL), [{ ...runRow(), id: null, device: null }]);
  sessionDir(claude, proj, 's', [skillCall('2026-09-10T10:00:00Z', 'k', 'spark'), userLine('2026-09-10T10:30:01Z', 'log-run tool result')]);
  const r = spawnSync(process.execPath, [path.join(SCRIPTS, 'runs-backfill.mjs'), '--dry-run', '--root', reg, '--claude-projects', claude], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /DRY RUN/);
  assert.match(r.stdout, /would write Testbox-20260910T103000Z-spark: skill-call/);
  assert.equal(fs.existsSync(runsFile(reg, 'Testbox')), false);
  assert.equal(fs.existsSync(exactFile(reg, 'Testbox')), false);
  assert.equal(readJsonl(path.join(proj, LOCAL_REL)).rows.length, 1);
});

test('backfill without a machine identity is FATAL (exit 2)', () => {
  const base = tmp();
  const r = spawnSync(process.execPath, [path.join(SCRIPTS, 'runs-backfill.mjs'), '--dry-run', '--root', base, '--claude-projects', base], { encoding: 'utf8' });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /no identity/);
});

// ---------------------------------------------------------------- aggregation / report
test('median rounds the mean of the middle pair', () => {
  assert.equal(median([]), null);
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([1, 2]), 2); // 1.5 rounds up
  assert.equal(median([10, 20, 30, 41]), 25);
});

test('aggregateRuns labels the basis: exact only when it covers at least half the runs', () => {
  const rows = [
    runRow({ ts: '2026-09-10T10:00:00Z', tokensEst: 1000, difficulty: 2 }),
    runRow({ ts: '2026-09-10T11:00:00Z', tokensEst: 3000, difficulty: 3, outcome: 'partial' }),
    runRow({ ts: '2026-09-10T12:00:00Z', tokensEst: null, difficulty: 4 }),
    runRow({ ts: '2026-09-10T13:00:00Z', tokensEst: 5000, difficulty: 4, version: '1.3.0' }),
  ];
  const ex = (row, fresh, cr) => [row.id, { schema: EXACT_SCHEMA, id: row.id, session: 's', model: 'claude-opus-5', effort: 'high', input: fresh, cacheWrite: 0, cacheRead: cr, output: 0, matched: 'skill-call' }];
  // One measured run of three at 1.4.0: exact does not speak for half -> estimate.
  let agg = aggregateRuns(rows, new Map([ex(rows[0], 700, 9)]));
  const v14 = agg['spark@1.4.0'];
  assert.equal(v14.runs, 3);
  assert.deepEqual(v14.outcomes, { shipped: 2, partial: 1 });
  assert.equal(v14.difficulty, 3);
  assert.equal(v14.medianExact, 700); assert.equal(v14.exactCount, 1);
  assert.equal(v14.medianEst, 2000); assert.equal(v14.estCount, 2);
  assert.equal(v14.tokens, 2000); assert.equal(v14.tokensBasis, 'estimate');
  assert.equal(v14.medianCacheRead, 9);
  assert.equal(v14.entries.length, 3);
  assert.deepEqual(Object.keys(v14.entries[0]), ['ts', 'project', 'outcome', 'difficulty', 'result', 'comment']);
  // Two of three measured -> exact.
  agg = aggregateRuns(rows, new Map([ex(rows[0], 700, 9), ex(rows[2], 900, 11)]));
  assert.equal(agg['spark@1.4.0'].tokens, 800);
  assert.equal(agg['spark@1.4.0'].tokensBasis, 'exact');
  // By skill (the catalog's grouping) folds versions together.
  const bySkill = aggregateRuns(rows, new Map(), { by: 'skill' });
  assert.equal(bySkill.spark.runs, 4);
  assert.deepEqual(catalogFields(bySkill.spark), { runs30d: 4, outcomes30d: { shipped: 3, partial: 1 }, difficulty30d: 3.3, tokensMedian30d: 3000, tokensBasis30d: 'estimate' });
  assert.deepEqual(catalogFields(undefined), { runs30d: 0, outcomes30d: {}, difficulty30d: null, tokensMedian30d: null, tokensBasis30d: null });
});

test('buildReport reads every device file plus sidecars and honours --since/--skill/--device', () => {
  const { reg } = fixtureRegistry();
  const a = runRow({ ts: '2026-09-10T10:00:00Z', tokensEst: 100 });
  const b = { ...runRow({ ts: '2026-09-11T10:00:00Z', tokensEst: 300, device: 'Wolf' }) }; b.id = runId(b);
  const old = runRow({ ts: '2026-06-01T10:00:00Z', skill: 'forge' });
  writeJsonl(runsFile(reg, 'Testbox'), [a, old]);
  writeJsonl(runsFile(reg, 'Wolf'), [b]);
  writeJsonl(exactFile(reg, 'Testbox'), [{ schema: EXACT_SCHEMA, id: a.id, session: 's', model: 'claude-opus-5', effort: 'high', input: 10, cacheWrite: 20, cacheRead: 5, output: 30, matched: 'skill-call' }]);
  const now = ms('2026-09-20T00:00:00Z');
  const rep = buildReport({ registryRoot: reg, sinceDays: 30, now });
  assert.equal(rep.schema, 'rkb-runs-report/1');
  assert.deepEqual(Object.keys(rep.skills), ['spark@1.4.0']);
  const s = rep.skills['spark@1.4.0'];
  assert.equal(s.runs, 2);
  assert.deepEqual(s.devices, ['Testbox', 'Wolf']);
  assert.equal(s.medianExact, 60); assert.equal(s.exactCount, 1);
  assert.equal(s.tokens, 60); assert.equal(s.tokensBasis, 'exact', 'one of two measured is half');
  assert.equal(buildReport({ registryRoot: reg, sinceDays: 30, now, device: 'Wolf' }).skills['spark@1.4.0'].runs, 1);
  assert.deepEqual(Object.keys(buildReport({ registryRoot: reg, sinceDays: 200, now, skill: 'forge' }).skills), ['forge@1.4.0']);

  const empty = spawnSync(process.execPath, [path.join(SCRIPTS, 'runs-report.mjs'), '--root', tmp()], { encoding: 'utf8' });
  assert.equal(empty.status, 0);
  assert.match(empty.stdout, /empty/);
});

test('backfill drains local files in project worktrees and the registry, and names a project mismatch', () => {
  const { reg, proj, claude } = fixtureRegistry();
  const inWt = { ...runRow({ ts: '2026-09-10T10:00:00Z' }), id: null, device: null };
  const inReg = { ...runRow({ ts: '2026-09-10T11:00:00Z', project: 'ai-registry', skill: 'forge' }), id: null, device: null };
  writeJsonl(path.join(proj, '.claude', 'worktrees', 'wave', LOCAL_REL), [inWt]);
  writeJsonl(path.join(reg, LOCAL_REL), [inReg]);
  const s = backfill({ registryRoot: reg, claudeProjects: claude, log: () => {} });
  assert.equal(s.drained, 2);
  assert.equal(s.localFiles, 2);
  assert.deepEqual(s.drainProjectMismatch, []);
  assert.equal(readJsonl(path.join(proj, '.claude', 'worktrees', 'wave', LOCAL_REL)).rows.length, 0);
  assert.equal(readJsonl(path.join(reg, LOCAL_REL)).rows.length, 0);
  // No transcripts in the fixture: both drained rows are reported unmatched, not invented.
  assert.equal(s.unmatched.length, 2);
  assert.equal(s.written, 0);

  const odd = { ...runRow({ ts: '2026-09-10T12:00:00Z', project: 'wave' }), id: null, device: null };
  writeJsonl(path.join(proj, LOCAL_REL), [odd]);
  const s2 = backfill({ registryRoot: reg, claudeProjects: claude, log: () => {} });
  assert.deepEqual(s2.drainProjectMismatch.map((d) => [d.project, d.foundIn]), [['wave', 'demo']]);
});

test('drain: receipt version beats lane version, lane fills in, no version stays local; foreign device stays; duplicates dropped', () => {
  const { reg, proj, claude } = fixtureRegistry();
  laneSkill(reg, 'spark', '1.0.0');
  laneSkill(reg, 'forge', '3.1.0');
  receipt(proj, { spark: '2.0.0' });
  const dup = runRow({ ts: '2026-09-10T09:00:00Z', version: '2.0.0' });
  writeJsonl(runsFile(reg, 'Testbox'), [dup]);
  const rows = [
    agentRow({ ts: '2026-09-10T10:00:00Z' }), // spark: receipt 2.0.0 beats lane 1.0.0
    agentRow({ ts: '2026-09-10T10:10:00Z', skill: 'forge' }), // forge: not in receipt -> lane 3.1.0
    agentRow({ ts: '2026-09-10T10:20:00Z', skill: 'mystery' }), // nowhere -> stays
    agentRow({ ts: '2026-09-10T10:30:00Z', device: 'Wolf' }), // another machine -> stays
    agentRow({ ts: '2026-09-10T10:40:00Z', device: 'Testbox', contributor: 'someone-else', version: '0.9.0' }), // own device: stamp wins on contributor, row wins on version
    { ...agentRow({ ts: '2026-09-10T09:00:00Z' }), version: '2.0.0' }, // already in the log
  ];
  writeJsonl(path.join(proj, LOCAL_REL), rows);
  const s = backfill({ registryRoot: reg, claudeProjects: claude, log: () => {} });
  assert.equal(s.drained, 3);
  assert.equal(s.drainDuplicates, 1);
  assert.deepEqual(s.drainInvalid.map((d) => d.skill), ['mystery']);
  assert.match(s.drainInvalid[0].problems[0], /^no version/);
  assert.deepEqual(s.drainForeign.map((d) => d.problems[0]), ['device "Wolf" is not this machine (Testbox)']);
  const log = readJsonl(runsFile(reg, 'Testbox')).rows;
  assert.deepEqual(log.slice(1).map((r) => [r.skill, r.version, r.contributor, r.id]), [
    ['spark', '2.0.0', 'test-box', 'Testbox-20260910T100000Z-spark'],
    ['forge', '3.1.0', 'test-box', 'Testbox-20260910T101000Z-forge'],
    ['spark', '0.9.0', 'test-box', 'Testbox-20260910T104000Z-spark'],
  ]);
  for (const r of log) assert.deepEqual(validateRun(r), []);
  const left = readJsonl(path.join(proj, LOCAL_REL)).rows;
  assert.deepEqual(left.map((r) => r.skill + (r.device ? `@${r.device}` : '')), ['mystery', 'spark@Wolf']);
  // Once the unstampable rows are gone, the file is empty.
  writeJsonl(path.join(proj, LOCAL_REL), []);
  fs.appendFileSync(path.join(proj, LOCAL_REL), `${JSON.stringify(agentRow({ ts: '2026-09-10T11:00:00Z' }))}\n`);
  const s2 = backfill({ registryRoot: reg, claudeProjects: claude, log: () => {} });
  assert.equal(s2.drained, 1);
  assert.equal(fs.readFileSync(path.join(proj, LOCAL_REL), 'utf8'), '');
});

test('aggregation folds an aliased skill into its new name; an unknown name keeps its own', () => {
  const { reg } = fixtureRegistry();
  laneSkill(reg, 'forge-next', '2.0.0');
  fs.mkdirSync(path.join(reg, 'knowledge'), { recursive: true });
  fs.writeFileSync(path.join(reg, 'identity-aliases.json'), JSON.stringify({ schema: 1, skills: { forge: { to: 'forge-next', reason: 'renamed' } }, subjects: {}, applications: {} }));
  const resolve = skillResolver(reg);
  assert.equal(resolve('forge'), 'forge-next');
  assert.equal(resolve('forge-next'), 'forge-next');
  assert.equal(resolve('mystery'), 'mystery');
  const rows = [
    runRow({ ts: '2026-09-10T10:00:00Z', skill: 'forge', version: '1.0.0' }),
    runRow({ ts: '2026-09-11T10:00:00Z', skill: 'forge-next', version: '2.0.0' }),
    runRow({ ts: '2026-09-12T10:00:00Z', skill: 'mystery' }),
  ];
  const bySkill = aggregateRuns(rows, new Map(), { by: 'skill', resolveSkill: resolve });
  assert.deepEqual(Object.keys(bySkill), ['forge-next', 'mystery']);
  assert.equal(bySkill['forge-next'].runs, 2);
  assert.equal(bySkill['forge-next'].skill, 'forge-next');
  assert.deepEqual(bySkill['forge-next'].versions, ['1.0.0', '2.0.0']);
  // Default resolver is identity: fixture rows aggregate as logged.
  assert.deepEqual(Object.keys(aggregateRuns(rows, new Map(), { by: 'skill' })), ['forge', 'forge-next', 'mystery']);
  // The report reads the registry's alias map itself, and --skill matches the resolved name.
  writeJsonl(runsFile(reg, 'Testbox'), rows);
  const rep = buildReport({ registryRoot: reg, sinceDays: 30, now: ms('2026-09-20T00:00:00Z'), skill: 'forge-next' });
  assert.deepEqual(Object.keys(rep.skills), ['forge-next@1.0.0', 'forge-next@2.0.0']);
});
