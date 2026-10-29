// Deterministic tests for cloud-dispatch: `node --test skills/cloud-dispatch/tests`.
// Builtins only. Nothing here spawns `claude`, touches the network or writes outside a temp
// dir: git, spawn, the clock and the registry root are injected. The one real child process
// is `node overflow.mjs` fed malformed stdin, pointed at a temp registry via AI_REGISTRY_DIR.
//
// What is worth pinning is the promises a reader could not re-derive without a cloud run:
// (1) the sync gate compares the DEFAULT branch against origin and refuses unpushed work,
// (2) plan mode spawns nothing and --go starts exactly one launcher console and one complete
// ledger row, (3) the overflow hook ships at most six per local day, only on rate_limit, and
// never exits non-zero.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  EXIT_OK, EXIT_REFUSED, EXIT_USAGE, MAX_PROMPT_CHARS, AUTO_CAP_PER_DAY, ID_RE, LEDGER_KEYS,
  parseFrontmatter, newId, branchFor, parseGithubOrigin, LANDING_CONTRACT, composePrompt, promptWithinLimit,
  syncGate, dispatchBrief, runState, statusRows, queueAdd, queueDone, listItems, runOverflow,
  readLedger, appendJsonl, UNPUSHED_HEADING, ledgerPath, overflowLogPath, readItem, localDate,
  launchCommand, keyLaunchCommand, keyChildEnv, KEY_CHILD_STRIP, keyWorkerArgv, parseClaudeResult, keyStatus, keyBranchFor,
  lanesPath, initLanes, initialLanesConfig, laneConfig, laneState, lanesReport, recordSpend, statusFileFor,
  keyItemFileFor, rowEngine,
} from '../scripts/lib/core.mjs';
import { runKeyWorker } from '../scripts/keyworker.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OVERFLOW = path.join(HERE, '..', 'scripts', 'overflow.mjs');
const DISPATCH = path.join(HERE, '..', 'scripts', 'dispatch.mjs');
const NOW = new Date(2026, 9, 6, 14, 30, 0); // 2026-10-06 14:30 local

const ROOTS = [];
function tmp() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'cloud-dispatch-test-'));
  ROOTS.push(d);
  return d;
}
after(() => { for (const d of ROOTS) fs.rmSync(d, { recursive: true, force: true }); });

/** A fake git: a repo on GitHub whose default branch `main` is `ahead` commits ahead of origin. */
function fakeGit({ ahead = 0, origin = 'https://github.com/acme/widgets.git', dirty = false, head = 'main', headAhead = 0, symRef = true, calls = [] } = {}) {
  return (repo, args) => {
    calls.push(args.join(' '));
    const ok = (stdout = '') => ({ code: 0, stdout, stderr: '' });
    const no = (stderr = '') => ({ code: 1, stdout: '', stderr });
    const a = args.join(' ');
    if (a === 'rev-parse --show-toplevel') return ok(`${repo}\n`);
    if (a === 'remote get-url origin') return origin ? ok(`${origin}\n`) : no('no such remote');
    if (a === 'fetch origin --quiet') return ok();
    if (a === 'symbolic-ref refs/remotes/origin/HEAD') return symRef ? ok('refs/remotes/origin/main\n') : no();
    if (a === 'rev-parse --verify --quiet refs/remotes/origin/main') return ok('base\n');
    if (a === 'rev-parse refs/remotes/origin/main') return ok('0123456789abcdef0123456789abcdef01234567\n');
    if (a === 'rev-parse --verify --quiet refs/heads/main') return ok('local\n');
    if (a === 'rev-list --count refs/remotes/origin/main..refs/heads/main') return ok(`${ahead}\n`);
    if (a === 'symbolic-ref --quiet --short HEAD') return ok(`${head}\n`);
    if (a === 'rev-list --count refs/remotes/origin/main..HEAD') return ok(`${headAhead}\n`);
    if (a === 'status --porcelain') return ok(dirty ? ' M x.md\n' : '');
    if (a === 'log --oneline refs/remotes/origin/main..refs/heads/main') {
      return ok(`${Array.from({ length: ahead }, (_, i) => `c0ffee${i} unpushed commit ${i}`).join('\n')}\n`);
    }
    if (args[0] === 'ls-remote') return ok('');
    return no(`unexpected git ${a}`);
  };
}

function fakeSpawn() {
  const calls = [];
  const fn = (cmd, args, opts) => {
    calls.push({ cmd, args, opts });
    return { on() {}, unref() { calls[calls.length - 1].unrefed = true; } };
  };
  fn.calls = calls;
  return fn;
}

function writeBrief(dir, name, { body = '# Fix the widget\n\nDo the thing.\n', meta = null } = {}) {
  const fm = meta ? `---\n${Object.entries(meta).map(([k, v]) => `${k}: ${v}`).join('\n')}\n---\n` : '';
  const f = path.join(dir, name);
  fs.writeFileSync(f, fm + body);
  return f;
}

function setup() {
  const root = tmp();
  const reg = path.join(root, 'registry');
  const repo = path.join(root, 'repo');
  fs.mkdirSync(reg, { recursive: true });
  fs.mkdirSync(repo, { recursive: true });
  return { root, reg, repo };
}

const deps = (reg, extra = {}) => ({ git: fakeGit(), spawn: fakeSpawn(), now: () => NOW, registryDir: reg, platform: 'win32', launchPath: 'launch.mjs', execPath: 'node', ...extra });

// ---------------------------------------------------------------- pure

test('exit codes are 0 ok, 1 refused, 2 usage', () => {
  assert.deepEqual([EXIT_OK, EXIT_REFUSED, EXIT_USAGE], [0, 1, 2]);
});

test('frontmatter: simple key/value lines, booleans, quotes, CRLF; absent block leaves the body whole', () => {
  const { meta, body } = parseFrontmatter('---\r\ncloud_ok: true\r\nlabel: "Fix it"\r\nrepo: ../kp\r\nfrom: spark\r\n---\r\n# Body\r\n');
  assert.deepEqual(meta, { cloud_ok: true, label: 'Fix it', repo: '../kp', from: 'spark' });
  assert.match(body, /^# Body/);
  assert.equal(parseFrontmatter('---\ncloud_ok: false\n---\nx').meta.cloud_ok, false);
  const plain = parseFrontmatter('# Just a brief\n');
  assert.deepEqual(plain.meta, {});
  assert.equal(plain.body, '# Just a brief\n');
  assert.equal(plain.meta.cloud_ok, undefined);
  assert.deepEqual(parseFrontmatter('---\nno closing fence\n').meta, {});
});

test('id is YYMMDD-<6 lowercase hex> on the local date; branch is claude/cloud-<id>', () => {
  const id = newId(NOW);
  assert.match(id, ID_RE);
  assert.ok(id.startsWith('261006-'));
  assert.equal(newId(NOW, () => 'ABCDEF'), '261006-abcdef');
  assert.equal(branchFor('261006-abcdef'), 'claude/cloud-261006-abcdef');
});

test('GitHub origin parsing: https, ssh and scp forms; anything else is null', () => {
  assert.equal(parseGithubOrigin('https://github.com/acme/widgets.git'), 'acme/widgets');
  assert.equal(parseGithubOrigin('https://github.com/acme/widgets'), 'acme/widgets');
  assert.equal(parseGithubOrigin('git@github.com:acme/widgets.git'), 'acme/widgets');
  assert.equal(parseGithubOrigin('ssh://git@github.com/acme/widgets.git'), 'acme/widgets');
  assert.equal(parseGithubOrigin('https://gitlab.com/acme/widgets.git'), null);
  assert.equal(parseGithubOrigin(''), null);
});

test('landing contract names the branch, RESULT.md path and PR title; prompt limit is 24000', () => {
  const c = LANDING_CONTRACT('261006-abcdef', 'claude/cloud-261006-abcdef', 'Fix it');
  assert.match(c, /claude\/cloud-261006-abcdef/);
  assert.match(c, /\.cloud-runs\/261006-abcdef\/RESULT\.md/);
  assert.match(c, /cloud\(261006-abcdef\): Fix it/);
  assert.match(c, /never force-push/);
  assert.match(c, /Handoff/);
  const p = composePrompt('---\nnot frontmatter here\n# body', 'i', 'b', 'l');
  assert.ok(p.endsWith(`${LANDING_CONTRACT('i', 'b', 'l')}\n`));
  assert.equal(MAX_PROMPT_CHARS, 24000);
  assert.equal(promptWithinLimit('x'.repeat(24000)), true);
  assert.equal(promptWithinLimit('x'.repeat(24001)), false);
});

// ---------------------------------------------------------------- sync gate

test('sync gate refuses ahead=2 naming the count, passes ahead=0', () => {
  const refused = syncGate('repo', fakeGit({ ahead: 2 }));
  assert.equal(refused.ok, false);
  assert.match(refused.reason, /2 commit\(s\) ahead/);
  assert.match(refused.reason, /push first; the cloud clones origin only/);
  const passed = syncGate('repo', fakeGit({ ahead: 0 }));
  assert.equal(passed.ok, true);
  assert.equal(passed.ahead, 0);
  assert.equal(passed.defaultBranch, 'main');
  assert.equal(passed.base_sha, '0123456789abcdef0123456789abcdef01234567');
  assert.equal(passed.slug, 'acme/widgets');
});

test('sync gate compares the DEFAULT branch ref, not HEAD; a feature HEAD ahead only warns', () => {
  const calls = [];
  const g = syncGate('repo', fakeGit({ head: 'spark/x', headAhead: 4, calls }));
  assert.equal(g.ok, true);
  assert.ok(calls.includes('rev-list --count refs/remotes/origin/main..refs/heads/main'));
  assert.ok(g.warnings.some((w) => /spark\/x.*4 commit/.test(w)));
});

test('sync gate: non-GitHub origin refused; missing origin refused; dirty tree only warns', () => {
  const gl = syncGate('repo', fakeGit({ origin: 'https://gitlab.com/acme/widgets.git' }));
  assert.equal(gl.ok, false);
  assert.match(gl.reason, /not a GitHub URL/);
  assert.equal(syncGate('repo', fakeGit({ origin: null })).ok, false);
  const dirty = syncGate('repo', fakeGit({ dirty: true }));
  assert.equal(dirty.ok, true);
  assert.ok(dirty.warnings.some((w) => /dirty/.test(w)));
});

test('sync gate falls back to main when origin/HEAD is unset', () => {
  const g = syncGate('repo', fakeGit({ symRef: false }));
  assert.equal(g.ok, true);
  assert.equal(g.defaultBranch, 'main');
});

// ---------------------------------------------------------------- dispatch

test('plan mode spawns nothing and writes nothing', () => {
  const { root, reg, repo } = setup();
  const d = deps(reg);
  const res = dispatchBrief({ briefPath: writeBrief(root, 'b.md'), repo, go: false, deps: d });
  assert.equal(res.ok, true);
  assert.match(res.id, ID_RE);
  assert.equal(res.branch, branchFor(res.id));
  assert.equal(res.plan.label, 'Fix the widget');
  assert.equal(res.plan.model, 'opus');
  assert.equal(d.spawn.calls.length, 0);
  assert.equal(fs.existsSync(path.join(reg, '.ai')), false);
});

test('--go starts the launcher once through cmd /c start (a real console), and appends one complete ledger row', () => {
  const { root, reg, repo } = setup();
  const d = deps(reg);
  const brief = writeBrief(root, 'b.md', { meta: { label: 'Labelled', from: 'spark' } });
  const res = dispatchBrief({ briefPath: brief, repo, go: true, deps: d });
  assert.equal(res.ok, true);
  assert.equal(d.spawn.calls.length, 1);
  const call = d.spawn.calls[0];
  // a bare detached node spawn gets NUL std handles and `claude --cloud` refuses; `start` gives a TTY
  assert.equal(call.cmd, 'cmd.exe');
  assert.deepEqual(call.args.slice(0, 3), ['/d', '/c', 'start']);
  assert.match(call.args[3], /^".*\d{6}-[0-9a-f]{6}.*"$/);
  assert.ok(call.args[3].includes(res.id));
  assert.deepEqual(call.args.slice(4, 6), ['node', 'launch.mjs']);
  const [promptFile, statusFile, model] = call.args.slice(6);
  assert.equal(model, 'opus');
  assert.ok(statusFile.endsWith(`${res.id}.status.json`));
  assert.equal(call.opts.detached, true);
  assert.equal(call.opts.stdio, 'ignore');
  assert.equal(call.opts.windowsHide, true);
  assert.equal(call.opts.cwd, repo);
  assert.equal(call.unrefed, true);
  assert.ok(fs.readFileSync(promptFile, 'utf8').includes('LANDING CONTRACT'));
  const rows = readLedger(reg);
  assert.equal(rows.length, 1);
  assert.deepEqual(Object.keys(rows[0]), LEDGER_KEYS);
  assert.deepEqual(LEDGER_KEYS, ['ts', 'id', 'repo', 'origin', 'base_sha', 'label', 'from', 'model', 'mode', 'brief_sha256', 'prompt_chars', 'allow_ahead', 'engine']);
  assert.equal(rows[0].engine, 'cloud');
  assert.equal(rows[0].mode, 'explicit');
  assert.equal(rows[0].label, 'Labelled');
  assert.equal(rows[0].from, 'spark');
  assert.equal(rows[0].id, res.id);
  assert.match(rows[0].brief_sha256, /^[0-9a-f]{64}$/);
  assert.equal(rows[0].allow_ahead, false);
});

// ---------------------------------------------------------------- --allow-ahead

test('ahead=3 refuses without --allow-ahead', () => {
  const { root, reg, repo } = setup();
  const d = deps(reg, { git: fakeGit({ ahead: 3 }) });
  const res = dispatchBrief({ briefPath: writeBrief(root, 'b.md'), repo, go: true, deps: d });
  assert.equal(res.ok, false);
  assert.equal(res.exit, EXIT_REFUSED);
  assert.match(res.reason, /3 commit\(s\) ahead/);
  assert.equal(d.spawn.calls.length, 0);
  assert.equal(readLedger(reg).length, 0);
});

test('ahead=3 passes with --allow-ahead: warns, lists the unpushed commits, ledger row says allow_ahead true', () => {
  const { root, reg, repo } = setup();
  const d = deps(reg, { git: fakeGit({ ahead: 3 }) });
  const res = dispatchBrief({ briefPath: writeBrief(root, 'b.md'), repo, go: true, allowAhead: true, deps: d });
  assert.equal(res.ok, true);
  assert.equal(d.spawn.calls.length, 1);
  assert.deepEqual(res.plan.unpushed, ['c0ffee0 unpushed commit 0', 'c0ffee1 unpushed commit 1', 'c0ffee2 unpushed commit 2']);
  assert.equal(UNPUSHED_HEADING, 'the cloud will NOT see these commits');
  assert.ok(res.plan.warnings.some((w) => w.includes(UNPUSHED_HEADING)));
  const rows = readLedger(reg);
  assert.equal(rows.length, 1);
  assert.deepEqual(Object.keys(rows[0]), LEDGER_KEYS);
  assert.equal(rows[0].allow_ahead, true);
});

test('--allow-ahead shows at most 10 unpushed commits plus "and N more"', () => {
  const g = syncGate('repo', fakeGit({ ahead: 14 }), { allowAhead: true });
  assert.equal(g.ok, true);
  assert.equal(g.unpushed.length, 11);
  assert.equal(g.unpushed[9], 'c0ffee9 unpushed commit 9');
  assert.equal(g.unpushed[10], 'and 4 more');
  assert.deepEqual(syncGate('repo', fakeGit({ ahead: 0 }), { allowAhead: true }).unpushed, []);
});

test('a queue item with allow_ahead ships through overflow while the repo is ahead; one without is refused', () => {
  const { root, reg, repo } = setup();
  const t1 = new Date(NOW.getTime() - 120_000);
  const t2 = new Date(NOW.getTime() - 60_000);
  const plain = queueAdd({ briefPath: writeBrief(root, 'p.md', { meta: { cloud_ok: 'true' } }), repo, from: 'spark', registryDir: reg, now: () => t1 });
  const allowed = queueAdd({ briefPath: writeBrief(root, 'a.md', { meta: { cloud_ok: 'true' } }), repo, from: 'spark', allowAhead: true, registryDir: reg, now: () => t2 });
  assert.equal(readItem(reg, allowed.id).allow_ahead, true);
  assert.equal('allow_ahead' in readItem(reg, plain.id), false);
  const d = deps(reg, { git: fakeGit({ ahead: 3 }) });
  const out = runOverflow({ input: RATE, deps: d });
  assert.deepEqual(out.shipped, [allowed.id]);
  assert.deepEqual(out.refused, [plain.id]);
  assert.equal(d.spawn.calls.length, 1);
  const rows = readLedger(reg);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].allow_ahead, true);
  assert.equal(rows[0].mode, 'overflow');
});

test('--go with no from writes from: null, never omits the key', () => {
  const { root, reg, repo } = setup();
  dispatchBrief({ briefPath: writeBrief(root, 'b.md'), repo, go: true, deps: deps(reg) });
  const row = readLedger(reg)[0];
  assert.ok('from' in row);
  assert.equal(row.from, null);
});

test('a composed prompt over 24000 characters is refused before anything spawns', () => {
  const { root, reg, repo } = setup();
  const d = deps(reg);
  const res = dispatchBrief({ briefPath: writeBrief(root, 'big.md', { body: 'x'.repeat(24001) }), repo, go: true, deps: d });
  assert.equal(res.ok, false);
  assert.equal(res.exit, EXIT_REFUSED);
  assert.match(res.reason, /limit is 24000/);
  assert.equal(d.spawn.calls.length, 0);
  assert.equal(readLedger(reg).length, 0);
});

test('a repo ahead of origin is refused in plan and --go alike', () => {
  const { root, reg, repo } = setup();
  for (const go of [false, true]) {
    const d = deps(reg, { git: fakeGit({ ahead: 2 }) });
    const res = dispatchBrief({ briefPath: writeBrief(root, 'b.md'), repo, go, deps: d });
    assert.equal(res.ok, false);
    assert.equal(res.exit, EXIT_REFUSED);
    assert.equal(d.spawn.calls.length, 0);
  }
  assert.equal(readLedger(reg).length, 0);
});

test('--go off Windows refuses with exit 2 and spawns nothing', () => {
  const { root, reg, repo } = setup();
  const d = deps(reg, { platform: 'linux' });
  const res = dispatchBrief({ briefPath: writeBrief(root, 'b.md'), repo, go: true, deps: d });
  assert.equal(res.ok, false);
  assert.equal(res.exit, EXIT_USAGE);
  assert.match(res.reason, /Windows console/);
  assert.equal(d.spawn.calls.length, 0);
});

test('frontmatter repo resolves relative to the brief', () => {
  const { root, reg } = setup();
  const brief = writeBrief(root, 'b.md', { meta: { repo: 'repo' } });
  const res = dispatchBrief({ briefPath: brief, go: false, deps: deps(reg) });
  assert.equal(res.plan.repo, path.join(root, 'repo'));
});

// ---------------------------------------------------------------- status

test('run state: pr > branch > failed > unknown > launching > running', () => {
  assert.equal(runState({ status: null, branchExists: false, pr: null }), 'launching');
  assert.equal(runState({ status: { exit: 3 }, branchExists: false, pr: null }), 'failed(3)');
  assert.equal(runState({ status: { exit: null, error: 'ENOENT' }, branchExists: false, pr: null }), 'failed(ENOENT)');
  assert.equal(runState({ status: { exit: 0 }, branchExists: false, pr: null }), 'running');
  assert.equal(runState({ status: { exit: 0 }, branchExists: true, pr: null }), 'branch');
  assert.equal(runState({ status: { exit: 0 }, branchExists: true, pr: { number: 7, state: 'OPEN' } }), 'pr#7 open');
  assert.equal(runState({ status: { exit: 0 }, branchExists: null, pr: null }), 'unknown');
});

test('status degrades to unknown when ls-remote and gh fail, and lists newest first', () => {
  const { reg, repo } = setup();
  appendJsonl(ledgerPath(reg), { ts: '2026-10-05T10:00:00.000Z', id: '261005-aaaaaa', repo, origin: 'https://github.com/acme/widgets.git', mode: 'explicit' });
  appendJsonl(ledgerPath(reg), { ts: '2026-10-06T10:00:00.000Z', id: '261006-bbbbbb', repo, origin: 'https://github.com/acme/widgets.git', mode: 'overflow' });
  const boom = () => { throw new Error('offline'); };
  const rows = statusRows({ registryDir: reg, git: () => ({ code: 128, stdout: '', stderr: 'fatal' }), gh: boom, hasGh: () => true });
  assert.deepEqual(rows.map((r) => r.id), ['261006-bbbbbb', '261005-aaaaaa']);
  assert.ok(rows.every((r) => r.state === 'unknown'));
  const withPr = statusRows({ registryDir: reg, git: () => ({ code: 0, stdout: 'abc\trefs/heads/x\n', stderr: '' }), gh: () => ({ code: 0, stdout: '[{"number":12,"state":"MERGED","url":"u"}]' }), hasGh: () => true });
  assert.equal(withPr[0].state, 'pr#12 merged');
});

// ---------------------------------------------------------------- queue

test('queue --add refuses a brief without cloud_ok: true, accepts one with it', () => {
  const { root, reg, repo } = setup();
  const missing = queueAdd({ briefPath: writeBrief(root, 'a.md'), repo, from: 'spark', registryDir: reg, now: () => NOW });
  assert.equal(missing.ok, false);
  assert.match(missing.reason, /cloud_ok: true/);
  const falsy = queueAdd({ briefPath: writeBrief(root, 'b.md', { meta: { cloud_ok: 'false' } }), repo, from: 'spark', registryDir: reg, now: () => NOW });
  assert.equal(falsy.ok, false);
  const ok = queueAdd({ briefPath: writeBrief(root, 'c.md', { meta: { cloud_ok: 'true' } }), repo, from: 'spark', registryDir: reg, now: () => NOW });
  assert.equal(ok.ok, true);
  assert.match(ok.id, ID_RE);
  const item = readItem(reg, ok.id);
  assert.deepEqual(Object.keys(item), ['id', 'repo', 'brief_path', 'from', 'queued_at', 'state']);
  assert.equal(item.state, 'queued');
  assert.ok(path.isAbsolute(item.brief_path));
  assert.equal(listItems(reg).length, 1);
});

test('queue --done marks an item done so overflow never ships it', () => {
  const { root, reg, repo } = setup();
  const { id } = queueAdd({ briefPath: writeBrief(root, 'c.md', { meta: { cloud_ok: 'true' } }), repo, from: 'spark', registryDir: reg, now: () => NOW });
  assert.equal(queueDone({ id, registryDir: reg }).ok, true);
  assert.equal(readItem(reg, id).state, 'done');
  assert.equal(queueDone({ id: '261006-ffffff', registryDir: reg }).ok, false);
  const d = deps(reg);
  const out = runOverflow({ input: { hook_event_name: 'StopFailure', error: 'rate_limit' }, deps: d });
  assert.deepEqual(out.shipped, []);
  assert.equal(d.spawn.calls.length, 0);
});

// ---------------------------------------------------------------- overflow

function queueN(root, reg, repo, n) {
  const ids = [];
  for (let i = 0; i < n; i += 1) {
    const t = new Date(NOW.getTime() - (n - i) * 60_000);
    const r = queueAdd({ briefPath: writeBrief(root, `q${i}.md`, { meta: { cloud_ok: 'true' } }), repo, from: 'spark', registryDir: reg, now: () => t });
    ids.push(r.id);
  }
  return ids;
}
const RATE = JSON.stringify({ hook_event_name: 'StopFailure', error: 'rate_limit', session_id: 's1', cwd: '.' });

test('overflow with 8 queued ships 6 oldest first and leaves 2 queued', () => {
  const { root, reg, repo } = setup();
  const ids = queueN(root, reg, repo, 8);
  const d = deps(reg);
  const out = runOverflow({ input: RATE, deps: d });
  assert.equal(out.acted, true);
  assert.deepEqual(out.shipped, ids.slice(0, 6));
  assert.equal(out.capped, 2);
  assert.equal(d.spawn.calls.length, 6);
  const states = listItems(reg).map((i) => i.state);
  assert.deepEqual(states, ['dispatched', 'dispatched', 'dispatched', 'dispatched', 'dispatched', 'dispatched', 'queued', 'queued']);
  assert.ok(listItems(reg).slice(0, 6).every((i) => ID_RE.test(i.dispatch_id)));
  const rows = readLedger(reg);
  assert.equal(rows.length, 6);
  assert.ok(rows.every((r) => r.mode === 'overflow'));
  const log = fs.readFileSync(overflowLogPath(reg), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  assert.equal(log.length, 1);
  assert.deepEqual(Object.keys(log[0]), ['ts', 'session_id', 'shipped', 'refused', 'capped']);
  assert.equal(log[0].session_id, 's1');
  // a second rate limit the same day ships nothing more
  const again = runOverflow({ input: RATE, deps: d });
  assert.deepEqual(again.shipped, []);
  assert.equal(again.capped, 2);
  assert.equal(d.spawn.calls.length, 6);
});

test('overflow on error "overloaded" (or any other event) ships nothing and logs nothing', () => {
  const { root, reg, repo } = setup();
  queueN(root, reg, repo, 3);
  const d = deps(reg);
  for (const input of [
    { hook_event_name: 'StopFailure', error: 'overloaded' },
    { hook_event_name: 'Stop', error: 'rate_limit' },
  ]) {
    const out = runOverflow({ input: JSON.stringify(input), deps: d });
    assert.equal(out.acted, false);
  }
  assert.equal(d.spawn.calls.length, 0);
  assert.equal(fs.existsSync(overflowLogPath(reg)), false);
  assert.ok(listItems(reg).every((i) => i.state === 'queued'));
});

test('the daily cap counts only TODAY\'s overflow rows', () => {
  const { root, reg, repo } = setup();
  const yesterday = new Date(NOW.getTime() - 24 * 3600_000);
  for (let i = 0; i < 6; i += 1) appendJsonl(ledgerPath(reg), { ts: yesterday.toISOString(), id: `x${i}`, mode: 'overflow' });
  for (let i = 0; i < 4; i += 1) appendJsonl(ledgerPath(reg), { ts: NOW.toISOString(), id: `e${i}`, mode: 'explicit' });
  for (let i = 0; i < 4; i += 1) appendJsonl(ledgerPath(reg), { ts: NOW.toISOString(), id: `o${i}`, mode: 'overflow' });
  assert.notEqual(localDate(yesterday), localDate(NOW));
  queueN(root, reg, repo, 5);
  const d = deps(reg);
  const out = runOverflow({ input: RATE, deps: d });
  assert.equal(out.shipped.length, AUTO_CAP_PER_DAY - 4);
  assert.equal(out.capped, 3);
});

test('a refused item becomes refused with its reason and does not count against the cap', () => {
  const { root, reg, repo } = setup();
  const ids = queueN(root, reg, repo, 8);
  let n = 0;
  // the first two dispatches see a repo ahead of origin
  const git = (r, args) => fakeGit({ ahead: args.join(' ').startsWith('rev-list --count refs/remotes/origin/main..refs/heads') && (n += 1) <= 2 ? 2 : 0 })(r, args);
  const d = deps(reg, { git });
  const out = runOverflow({ input: RATE, deps: d });
  assert.deepEqual(out.refused, ids.slice(0, 2));
  assert.deepEqual(out.shipped, ids.slice(2, 8));
  assert.equal(out.capped, 0);
  const first = readItem(reg, ids[0]);
  assert.equal(first.state, 'refused');
  assert.match(first.reason, /push first/);
});

test('a failed git fetch defers the item (still queued) instead of refusing it for good', () => {
  // `refused` is terminal: nothing in queue.mjs moves an item back to `queued`. A fetch that fails
  // because the network blinked at rate-limit time says nothing about the brief.
  const { root, reg, repo } = setup();
  const ids = queueN(root, reg, repo, 2);
  let fetches = 0;
  const git = (r, args) => (args.join(' ') === 'fetch origin --quiet' && (fetches += 1) === 1
    ? { code: 128, stdout: '', stderr: 'fatal: unable to access github.com: Could not resolve host' }
    : fakeGit()(r, args));
  const out = runOverflow({ input: RATE, deps: deps(reg, { git }) });
  assert.deepEqual(out.refused, [], 'a transient fetch failure is not a refusal');
  assert.deepEqual(out.shipped, [ids[1]], 'the next item still ships');
  assert.deepEqual(out.deferred, [ids[0]]);
  assert.equal(readItem(reg, ids[0]).state, 'queued', 'the next rate-limit stop retries it');
  // A refusal the brief or the repo owns is still terminal.
  const sync = syncGate('repo', fakeGit({ origin: 'https://gitlab.com/a/b.git' }));
  assert.equal(sync.transient, undefined);
});

test('queue --done refuses an id that is not a queue id, before it touches any file', () => {
  const { reg } = setup();
  const outside = path.join(reg, '.ai', 'victim.json');
  fs.mkdirSync(path.dirname(outside), { recursive: true });
  fs.writeFileSync(outside, JSON.stringify({ state: 'keep' }));
  const r = queueDone({ id: '../victim', registryDir: reg });
  assert.equal(r.ok, false);
  assert.match(r.reason, /not a queue id/);
  assert.deepEqual(JSON.parse(fs.readFileSync(outside, 'utf8')), { state: 'keep' }, 'a path-shaped id never reaches a file outside the queue');
});

test('overflow off Windows leaves items queued (environment, not the item, is at fault)', () => {
  const { root, reg, repo } = setup();
  queueN(root, reg, repo, 2);
  const out = runOverflow({ input: RATE, deps: deps(reg, { platform: 'linux' }) });
  assert.deepEqual(out.shipped, []);
  assert.deepEqual(out.refused, []);
  assert.match(out.error, /Windows console/);
  assert.ok(listItems(reg).every((i) => i.state === 'queued'));
});

test('overflow.mjs exits 0 on malformed, empty and non-matching stdin', () => {
  const { reg } = setup();
  for (const input of ['not json {', '', '{"hook_event_name":"StopFailure","error":"overloaded"}', 'null', '[]']) {
    const r = spawnSync(process.execPath, [OVERFLOW], { input, encoding: 'utf8', env: { ...process.env, AI_REGISTRY_DIR: reg }, timeout: 30_000 });
    assert.equal(r.status, 0, `stdin ${JSON.stringify(input)} -> ${r.status} ${r.stderr}`);
  }
  assert.equal(fs.existsSync(path.join(reg, '.ai')), false);
});

// ---------------------------------------------------------------- key lane (1.2.0)
// The promises worth pinning: a key plan spawns nothing and shows the lane; every lane refusal
// fires before anything spawns; the worker child gets the lane's key as ANTHROPIC_API_KEY and no
// other Anthropic credential; --lanes sums real spend per lane; and no output ever carries a key.

const SECRET = 'sk-ant-test-NOT-A-REAL-KEY-0001';
const LANE = { keyEnv: 'ANTHROPIC_KEY_LANE_REGISTRY', budgetUsd: 100, expires: '2026-11-12', perRunUsd: 15, maxConcurrent: 3, model: 'claude-opus-5-5', effort: 'high' };
function writeLanes(reg, lanes) {
  fs.mkdirSync(path.join(reg, '.ai'), { recursive: true });
  fs.writeFileSync(lanesPath(reg), JSON.stringify({ lanes }));
}
const keyDeps = (reg, extra = {}) => deps(reg, { env: { ANTHROPIC_KEY_LANE_REGISTRY: SECRET }, workerPath: 'keyworker.mjs', worktreeRoot: path.join(reg, 'wt'), ...extra });
const keyDispatch = (root, repo, d, extra = {}) => dispatchBrief({ briefPath: writeBrief(root, 'k.md', { meta: { label: 'Review one subject', from: 'librarian' } }), repo, engine: 'key', lane: 'registry', deps: d, ...extra });
const noSecret = (x) => assert.equal(JSON.stringify(x).includes(SECRET), false, 'a key value leaked into an output');

test('--lanes-init writes registry, cloud and overlord with zero budget and empty expiry, and refuses a second time', () => {
  const { reg } = setup();
  const r = initLanes({ registryDir: reg });
  assert.equal(r.ok, true);
  const cfg = JSON.parse(fs.readFileSync(lanesPath(reg), 'utf8'));
  assert.deepEqual(cfg, initialLanesConfig());
  assert.deepEqual(Object.keys(cfg.lanes), ['registry', 'cloud', 'overlord']);
  assert.deepEqual(cfg.lanes.overlord, { keyEnv: 'ANTHROPIC_KEY_LANE_OVERLORD', budgetUsd: 0, expires: '', perRunUsd: 15, maxConcurrent: 3, model: 'claude-opus-5-5', effort: 'high' });
  fs.writeFileSync(lanesPath(reg), '{"lanes":{"registry":{"budgetUsd":500}}}');
  const again = initLanes({ registryDir: reg });
  assert.equal(again.ok, false);
  assert.match(again.reason, /already exists/);
  assert.equal(JSON.parse(fs.readFileSync(lanesPath(reg), 'utf8')).lanes.registry.budgetUsd, 500, 'an operator budget is never overwritten');
});

test('a missing lane file or a missing lane refuses "lane <x> not configured"; keyEnv must be an ANTHROPIC_KEY_LANE_* name', () => {
  const { root, reg, repo } = setup();
  const d = keyDeps(reg);
  const none = keyDispatch(root, repo, d);
  assert.equal(none.ok, false);
  assert.equal(none.exit, EXIT_REFUSED);
  assert.equal(none.reason, 'lane registry not configured in .ai/credit-lanes.local.json');
  writeLanes(reg, { overlord: LANE });
  assert.equal(keyDispatch(root, repo, d).reason, 'lane registry not configured in .ai/credit-lanes.local.json');
  writeLanes(reg, { registry: { ...LANE, keyEnv: 'ANTHROPIC_API_KEY' } });
  assert.match(laneConfig(reg, 'registry').reason, /ANTHROPIC_KEY_LANE_\*/);
  assert.equal(keyDispatch(root, repo, d).ok, false);
  assert.equal(d.spawn.calls.length, 0);
  assert.equal(dispatchBrief({ briefPath: writeBrief(root, 'k.md'), repo, engine: 'key', deps: d }).exit, EXIT_USAGE, '--engine key without --lane is usage');
});

test('acceptance a: a key plan spawns nothing, writes nothing, and shows lane, remaining and keyEnv set|unset', () => {
  const { root, reg, repo } = setup();
  writeLanes(reg, { registry: LANE });
  const before = fs.readdirSync(path.join(reg, '.ai'));
  const d = keyDeps(reg);
  const res = keyDispatch(root, repo, d);
  assert.equal(res.ok, true);
  assert.equal(res.branch, keyBranchFor(res.id));
  assert.equal(res.branch, `claude/key-${res.id}`);
  assert.equal(res.plan.engine, 'key');
  assert.equal(res.plan.model, 'claude-opus-5-5');
  assert.equal(res.plan.effort, 'high');
  assert.equal(res.plan.lane.lane, 'registry');
  assert.equal(res.plan.lane.remaining, 100);
  assert.equal(res.plan.lane.keyEnv, 'set');
  assert.deepEqual(res.plan.lane.refusals, []);
  assert.match(res.plan.prompt, /key\(\d{6}-[0-9a-f]{6}\): Review one subject/);
  assert.equal(d.spawn.calls.length, 0);
  assert.deepEqual(fs.readdirSync(path.join(reg, '.ai')), before, 'a plan writes no prompt, item or ledger row');
  noSecret(res);
  const unset = keyDispatch(root, repo, keyDeps(reg, { env: {} }));
  assert.equal(unset.plan.lane.keyEnv, 'unset');
  // --model and --effort override the lane for one run
  const over = keyDispatch(root, repo, keyDeps(reg), { model: 'sonnet', effort: 'low' });
  assert.equal(over.plan.model, 'sonnet');
  assert.equal(over.plan.effort, 'low');
});

test('acceptance a (CLI): the printed key plan names lane, remaining and keyEnv, exits 1 on a refusal and never prints the key', () => {
  const { root, reg, repo } = setup();
  writeLanes(reg, { registry: LANE });
  const brief = writeBrief(root, 'k.md');
  const env = { ...process.env, AI_REGISTRY_DIR: reg, GIT_CEILING_DIRECTORIES: root };
  delete env.NODE_TEST_CONTEXT;
  delete env.ANTHROPIC_KEY_LANE_REGISTRY;
  const cli = (extraEnv) => spawnSync(process.execPath, [DISPATCH, '--brief', brief, '--repo', repo, '--engine', 'key', '--lane', 'registry'], { encoding: 'utf8', env: { ...env, ...extraEnv }, timeout: 30_000 });
  const unset = cli({});
  assert.equal(unset.status, EXIT_REFUSED, unset.stderr);
  assert.match(unset.stdout, /lane {6}registry {2}keyEnv: unset \(ANTHROPIC_KEY_LANE_REGISTRY\)/);
  assert.match(unset.stdout, /remaining \$100\.00/);
  assert.match(unset.stderr, /ANTHROPIC_KEY_LANE_REGISTRY is unset or empty/);
  // with the key set the lane passes; the temp repo is not a git repo, so the sync gate still refuses
  const set = cli({ ANTHROPIC_KEY_LANE_REGISTRY: SECRET });
  assert.equal(set.status, EXIT_REFUSED);
  assert.match(set.stdout, /keyEnv: set/);
  assert.match(set.stderr, /not a git repository/);
  for (const r of [unset, set]) assert.equal(`${r.stdout}${r.stderr}`.includes(SECRET), false);
  assert.deepEqual(fs.readdirSync(path.join(reg, '.ai')), ['credit-lanes.local.json'], 'nothing spawned, nothing written');
  // --lanes prints the lane and keyEnv: set, never the value
  const lanes = spawnSync(process.execPath, [DISPATCH, '--lanes'], { encoding: 'utf8', env: { ...env, ANTHROPIC_KEY_LANE_REGISTRY: SECRET }, timeout: 30_000 });
  assert.equal(lanes.status, EXIT_OK, lanes.stderr);
  assert.match(lanes.stdout, /registry .*remaining \$100\.00 .*keyEnv: set/);
  assert.equal(lanes.stdout.includes(SECRET), false);
});

test('acceptance b: keyEnv unset or empty refuses with exit 1 and spawns nothing', () => {
  const { root, reg, repo } = setup();
  writeLanes(reg, { registry: LANE });
  for (const env of [{}, { ANTHROPIC_KEY_LANE_REGISTRY: '' }]) {
    const d = keyDeps(reg, { env });
    for (const go of [false, true]) {
      const res = keyDispatch(root, repo, d, { go });
      assert.equal(res.ok, false);
      assert.equal(res.exit, EXIT_REFUSED);
      assert.match(res.reason, /ANTHROPIC_KEY_LANE_REGISTRY is unset or empty/);
    }
    assert.equal(d.spawn.calls.length, 0);
  }
  assert.equal(readLedger(reg).length, 0);
});

test('acceptance b: an expired lane refuses; the expiry day itself and an empty expires do not', () => {
  const { root, reg, repo } = setup();
  writeLanes(reg, { registry: { ...LANE, expires: '2026-10-05' } }); // NOW is 2026-10-06 local
  const d = keyDispatch(root, repo, keyDeps(reg), { go: true });
  assert.equal(d.ok, false);
  assert.equal(d.exit, EXIT_REFUSED);
  assert.match(d.reason, /lane registry expired on 2026-10-05/);
  for (const expires of ['2026-10-06', '']) {
    writeLanes(reg, { registry: { ...LANE, expires } });
    assert.equal(keyDispatch(root, repo, keyDeps(reg)).ok, true, `expires ${JSON.stringify(expires)}`);
  }
  writeLanes(reg, { registry: { ...LANE, expires: '12/11/2026' } });
  assert.match(keyDispatch(root, repo, keyDeps(reg)).reason, /expires must be "" or YYYY-MM-DD/);
});

test('acceptance b: remaining < perRunUsd refuses (budget 0 refuses every run until the operator sets one)', () => {
  const { root, reg, repo } = setup();
  writeLanes(reg, { registry: { ...LANE, budgetUsd: 0 } });
  const zero = keyDispatch(root, repo, keyDeps(reg), { go: true });
  assert.equal(zero.ok, false);
  assert.equal(zero.exit, EXIT_REFUSED);
  assert.match(zero.reason, /\$0 available .* perRunUsd \$15/);
  writeLanes(reg, { registry: { ...LANE, budgetUsd: 40 } });
  appendJsonl(ledgerPath(reg), { engine: 'manual', lane: 'registry', cost_usd: 26, label: 'earlier', ts: NOW.toISOString() });
  const low = keyDispatch(root, repo, keyDeps(reg), { go: true });
  assert.equal(low.ok, false);
  assert.equal(low.plan.lane.remaining, 14);
  assert.match(low.reason, /\$14 available/);
  writeLanes(reg, { registry: { ...LANE, budgetUsd: 41 } });
  assert.equal(keyDispatch(root, repo, keyDeps(reg)).ok, true, 'remaining 15 == perRunUsd 15 passes');
});

test('acceptance b: running >= maxConcurrent refuses; a key row with a status file is no longer running', () => {
  const { root, reg, repo } = setup();
  writeLanes(reg, { registry: { ...LANE, budgetUsd: 1000, maxConcurrent: 2 } });
  for (const id of ['261006-000001', '261006-000002']) appendJsonl(ledgerPath(reg), { ts: NOW.toISOString(), id, engine: 'key', lane: 'registry' });
  const d = keyDeps(reg);
  const full = keyDispatch(root, repo, d, { go: true });
  assert.equal(full.ok, false);
  assert.equal(full.exit, EXIT_REFUSED);
  assert.match(full.reason, /2 running worker\(s\); maxConcurrent is 2/);
  assert.equal(d.spawn.calls.length, 0);
  fs.mkdirSync(path.dirname(statusFileFor(reg, 'x')), { recursive: true });
  fs.writeFileSync(statusFileFor(reg, '261006-000001'), JSON.stringify({ exit: 0, cost_usd: 9, ended: NOW.toISOString() }));
  const ok = keyDispatch(root, repo, keyDeps(reg));
  assert.equal(ok.ok, true);
  assert.equal(ok.plan.lane.running, 1);
  assert.equal(ok.plan.lane.spent, 9);
});

test('a running worker holds perRunUsd of the budget, so concurrent runs cannot overspend it', () => {
  const st = laneState({ name: 'registry', lane: { ...LANE, budgetUsd: 40 }, rows: [{ id: 'a', engine: 'key', lane: 'registry' }], env: { ANTHROPIC_KEY_LANE_REGISTRY: SECRET }, today: '2026-10-06' });
  assert.equal(st.remaining, 40);
  assert.equal(st.reserved, 15);
  assert.equal(st.available, 25);
  assert.deepEqual(st.refusals, []);
  const tight = laneState({ name: 'registry', lane: { ...LANE, budgetUsd: 29 }, rows: [{ id: 'a', engine: 'key', lane: 'registry' }], env: { ANTHROPIC_KEY_LANE_REGISTRY: SECRET }, today: '2026-10-06' });
  assert.equal(tight.remaining, 29, 'remaining alone would pass');
  assert.match(tight.refusals.join(' '), /\$14 available .* minus \$15 held for 1 running/);
});

test('a key row with no status file past the cutoff is lost: no slot held, charged its full perRunUsd', () => {
  const now = Date.parse('2026-10-29T20:00:00Z');
  const rows = [
    { id: 'old', engine: 'key', lane: 'registry', ts: '2026-10-29T12:00:00Z' },
    { id: 'new', engine: 'key', lane: 'registry', ts: '2026-10-29T19:00:00Z' },
  ];
  const st = laneState({ name: 'registry', lane: { ...LANE, budgetUsd: 100, maxConcurrent: 1 }, rows, env: { ANTHROPIC_KEY_LANE_REGISTRY: SECRET }, today: '2026-10-29', now });
  assert.equal(st.lost, 1);
  assert.equal(st.running, 1);
  assert.equal(st.spent, 15);
  assert.equal(runState({ status: null, branchExists: false, pr: null, engine: 'key', lost: true }), 'lost');
  assert.equal(runState({ status: null, branchExists: false, pr: null, engine: 'key' }), 'running');
});

test('keyChildEnv drops every name in KEY_CHILD_STRIP, the OAuth token and provider switches included', () => {
  const parent = { PATH: '/bin', ANTHROPIC_KEY_LANE_REGISTRY: SECRET };
  for (const k of KEY_CHILD_STRIP) parent[k] = 'x';
  const env = keyChildEnv(parent, 'ANTHROPIC_KEY_LANE_REGISTRY');
  for (const k of KEY_CHILD_STRIP.filter((n) => n !== 'ANTHROPIC_API_KEY')) assert.equal(k in env, false, k);
  for (const k of ['CLAUDE_CODE_OAUTH_TOKEN', 'CLAUDE_CODE_USE_BEDROCK', 'CLAUDE_CODE_USE_VERTEX', 'CLAUDE_CODE_USE_FOUNDRY']) assert.ok(KEY_CHILD_STRIP.includes(k), k);
  assert.equal(env.ANTHROPIC_API_KEY, SECRET);
});

test('acceptance c: keyChildEnv carries the lane key as ANTHROPIC_API_KEY and no lane var, AUTH_TOKEN, BASE_URL or NODE_TEST_CONTEXT', () => {
  const parent = {
    PATH: '/bin', HOME: '/h', ANTHROPIC_KEY_LANE_REGISTRY: SECRET, ANTHROPIC_KEY_LANE_OVERLORD: 'sk-other', ANTHROPIC_KEY_LANE_CLOUD: 'sk-cloud',
    ANTHROPIC_AUTH_TOKEN: 'tok', ANTHROPIC_BASE_URL: 'https://proxy', NODE_TEST_CONTEXT: 'child-v8', ANTHROPIC_API_KEY: 'sk-stale',
    Anthropic_Base_Url: 'https://mixed-case',
  };
  const env = keyChildEnv(parent, 'ANTHROPIC_KEY_LANE_REGISTRY');
  assert.equal(env.ANTHROPIC_API_KEY, SECRET);
  assert.deepEqual(Object.keys(env).filter((k) => k.toUpperCase().startsWith('ANTHROPIC_KEY_LANE_')), []);
  for (const k of ['ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_BASE_URL', 'NODE_TEST_CONTEXT', 'Anthropic_Base_Url']) assert.equal(k in env, false, k);
  assert.equal(env.PATH, '/bin');
  assert.equal(env.HOME, '/h');
  assert.equal(parent.ANTHROPIC_KEY_LANE_REGISTRY, SECRET, 'the parent env is not mutated');
  assert.equal(parent.NODE_TEST_CONTEXT, 'child-v8');
});

test('acceptance d: keyWorkerArgv is exactly the headless argv, and the cloud launchCommand is unchanged', () => {
  assert.deepEqual(keyWorkerArgv(LANE), ['-p', '--model', 'claude-opus-5-5', '--effort', 'high', '--max-budget-usd', '15', '--output-format', 'json', '--permission-mode', 'bypassPermissions']);
  assert.equal(keyWorkerArgv(LANE).some((a) => /LANDING|prompt/i.test(a)), false, 'the prompt goes on stdin, never in argv');
  // the 1.1.x cloud launcher, byte for byte
  assert.deepEqual(launchCommand({ id: '261006-abcdef', execPath: 'node', launchPath: 'launch.mjs', promptFile: 'p.txt', statusFile: 's.json', model: 'opus', cwd: 'repo' }), {
    command: 'cmd.exe',
    args: ['/d', '/c', 'start', '"cloud-261006-abcdef"', 'node', 'launch.mjs', 'p.txt', 's.json', 'opus'],
    options: { cwd: 'repo', detached: true, stdio: 'ignore', windowsHide: true },
  });
  assert.deepEqual(keyLaunchCommand({ id: '261006-abcdef', execPath: 'node', workerPath: 'keyworker.mjs', itemFile: 'i.json', cwd: 'repo' }), {
    command: 'cmd.exe',
    args: ['/d', '/c', 'start', '"key-261006-abcdef"', 'node', 'keyworker.mjs', 'i.json'],
    options: { cwd: 'repo', detached: true, stdio: 'ignore', windowsHide: true },
  });
  // the default engine is still cloud: same branch, same contract, same launcher
  const { root, reg, repo } = setup();
  const res = dispatchBrief({ briefPath: writeBrief(root, 'b.md'), repo, go: false, deps: deps(reg) });
  assert.equal(res.plan.engine, 'cloud');
  assert.equal(res.branch, branchFor(res.id));
  assert.ok(res.plan.prompt.endsWith(`${LANDING_CONTRACT(res.id, res.branch, 'Fix the widget')}\n`));
  assert.deepEqual(res.plan.launch.args.slice(4, 6), ['node', 'launch.mjs']);
});

test('key --go opens keyworker in a new console with an item naming the key variable, never its value, and one compact ledger row', () => {
  const { root, reg, repo } = setup();
  writeLanes(reg, { registry: LANE });
  const d = keyDeps(reg);
  const res = keyDispatch(root, repo, d, { go: true });
  assert.equal(res.ok, true, res.reason);
  assert.equal(d.spawn.calls.length, 1);
  const call = d.spawn.calls[0];
  assert.equal(call.cmd, 'cmd.exe');
  assert.deepEqual(call.args.slice(0, 3), ['/d', '/c', 'start']);
  assert.equal(call.args[3], `"key-${res.id}"`);
  assert.deepEqual(call.args.slice(4), ['node', 'keyworker.mjs', keyItemFileFor(reg, res.id)]);
  assert.equal(call.unrefed, true);
  const item = JSON.parse(fs.readFileSync(res.itemFile, 'utf8'));
  assert.equal(item.keyEnv, 'ANTHROPIC_KEY_LANE_REGISTRY');
  assert.equal(item.branch, `claude/key-${res.id}`);
  assert.equal(item.worktree, path.join(reg, 'wt', `cd-${res.id}`));
  assert.equal(item.defaultBranch, 'main');
  assert.equal(item.perRunUsd, 15);
  noSecret(item);
  assert.match(fs.readFileSync(res.promptFile, 'utf8'), /git push -u origin claude\/key-/);
  assert.equal(listItems(reg).length, 0, 'a key item is not an overflow queue item');
  const rows = readLedger(reg);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].engine, 'key');
  assert.equal(rows[0].lane, 'registry');
  assert.equal(rows[0].from, 'librarian');
  assert.equal(Object.values(rows[0]).includes(null), false, 'absent values are omitted, never null');
  assert.equal('cost_usd' in rows[0], false, 'cost is unknown at launch');
  noSecret(rows);
});

test('acceptance e: --lanes sums cost_usd over key and manual rows per lane; rows without engine read as cloud', () => {
  const { reg } = setup();
  writeLanes(reg, { registry: { ...LANE, budgetUsd: 200 }, overlord: { ...LANE, keyEnv: 'ANTHROPIC_KEY_LANE_OVERLORD', budgetUsd: 50, expires: '2026-10-01' } });
  const old = { ts: NOW.toISOString(), id: '261001-aaaaaa', mode: 'explicit', lane: 'registry', cost_usd: 999 }; // pre-1.2.0: a cloud row
  assert.equal(rowEngine(old), 'cloud');
  appendJsonl(ledgerPath(reg), old);
  appendJsonl(ledgerPath(reg), { ts: NOW.toISOString(), id: '261006-000001', engine: 'key', lane: 'registry' });
  appendJsonl(ledgerPath(reg), { ts: NOW.toISOString(), id: '261006-000002', engine: 'key', lane: 'registry' }); // still running
  appendJsonl(ledgerPath(reg), { ts: NOW.toISOString(), id: '261006-000003', engine: 'cloud', lane: 'registry', cost_usd: 500 });
  fs.mkdirSync(path.dirname(statusFileFor(reg, 'x')), { recursive: true });
  fs.writeFileSync(statusFileFor(reg, '261006-000001'), JSON.stringify(keyStatus({ exit: 0, cost_usd: 12.5, session_id: 's', ended: NOW.toISOString() })));
  assert.equal(recordSpend({ lane: 'registry', cost: '7.25', label: 'hand run', registryDir: reg, now: () => NOW }).ok, true);
  assert.equal(recordSpend({ lane: 'overlord', cost: 30, label: 'overlord session', registryDir: reg, now: () => NOW }).ok, true);
  const rep = lanesReport({ registryDir: reg, env: { ANTHROPIC_KEY_LANE_REGISTRY: SECRET }, now: () => NOW });
  assert.equal(rep.ok, true);
  const byName = Object.fromEntries(rep.lanes.map((l) => [l.lane, l]));
  assert.equal(byName.registry.spent, 19.75, 'the key row status cost plus the manual row; cloud rows never count');
  assert.equal(byName.registry.remaining, 180.25);
  assert.equal(byName.registry.running, 1);
  assert.equal(byName.registry.keyEnv, 'set');
  assert.equal(byName.overlord.spent, 30);
  assert.equal(byName.overlord.remaining, 20);
  assert.equal(byName.overlord.keyEnv, 'unset');
  assert.equal(byName.overlord.expired, true);
  assert.equal(byName.overlord.running, 0);
  noSecret(rep);
});

test('--record appends {engine:"manual", lane, cost_usd, label, ts} and refuses an unconfigured lane or a bad cost', () => {
  const { reg } = setup();
  writeLanes(reg, { overlord: { ...LANE, keyEnv: 'ANTHROPIC_KEY_LANE_OVERLORD' } });
  const r = recordSpend({ lane: 'overlord', cost: '3.5', label: 'overlord sim', registryDir: reg, now: () => NOW });
  assert.equal(r.ok, true);
  const rows = readLedger(reg);
  assert.deepEqual(rows, [{ engine: 'manual', lane: 'overlord', cost_usd: 3.5, label: 'overlord sim', ts: NOW.toISOString() }]);
  assert.equal(recordSpend({ lane: 'cloud', cost: 1, label: 'x', registryDir: reg }).reason, 'lane cloud not configured in .ai/credit-lanes.local.json');
  for (const cost of ['abc', '-1', '', 'NaN']) assert.equal(recordSpend({ lane: 'overlord', cost, label: 'x', registryDir: reg }).ok, false, cost);
  assert.equal(recordSpend({ lane: 'overlord', cost: 1, label: ' ', registryDir: reg }).ok, false);
  assert.equal(readLedger(reg).length, 1);
});

test('--status joins a key row on claude/key-<id>, shows engine, lane and cost, and skips manual rows', () => {
  const { reg, repo } = setup();
  const origin = 'https://github.com/acme/widgets.git';
  appendJsonl(ledgerPath(reg), { ts: '2026-10-05T10:00:00.000Z', id: '261005-aaaaaa', repo, origin, mode: 'explicit' });
  appendJsonl(ledgerPath(reg), { ts: '2026-10-06T10:00:00.000Z', id: '261006-bbbbbb', engine: 'key', lane: 'registry', repo, origin, mode: 'explicit' });
  appendJsonl(ledgerPath(reg), { engine: 'manual', lane: 'registry', cost_usd: 2, label: 'm', ts: '2026-10-06T11:00:00.000Z' });
  fs.mkdirSync(path.dirname(statusFileFor(reg, 'x')), { recursive: true });
  fs.writeFileSync(statusFileFor(reg, '261006-bbbbbb'), JSON.stringify({ exit: 0, cost_usd: 8.1, ended: 'x' }));
  const lsRemote = [];
  const prHeads = [];
  const rows = statusRows({
    registryDir: reg,
    git: (r, args) => { lsRemote.push(args.at(-1)); return { code: 0, stdout: args.at(-1).includes('key-') ? 'abc\tref\n' : '', stderr: '' }; },
    gh: (args) => { prHeads.push(args[args.indexOf('--head') + 1]); return { code: 0, stdout: args.includes('claude/key-261006-bbbbbb') ? '[{"number":4,"state":"OPEN","url":"u"}]' : '[]' }; },
    hasGh: () => true,
  });
  assert.deepEqual(rows.map((r) => r.id), ['261006-bbbbbb', '261005-aaaaaa']);
  assert.deepEqual(prHeads, ['claude/key-261006-bbbbbb', 'claude/cloud-261005-aaaaaa']);
  assert.ok(lsRemote.includes('refs/heads/claude/key-261006-bbbbbb'));
  assert.equal(rows[0].engine, 'key');
  assert.equal(rows[0].branch, 'claude/key-261006-bbbbbb');
  assert.equal(rows[0].state, 'pr#4 open');
  assert.equal(rows[0].cost_usd, 8.1);
  assert.equal(rows[1].engine, 'cloud');
  assert.equal(runState({ status: null, branchExists: false, pr: null, engine: 'key' }), 'running');
  assert.equal(runState({ status: { exit: 0 }, branchExists: null, pr: null, engine: 'key' }), 'ended');
  assert.equal(runState({ status: { exit: 1 }, branchExists: false, pr: null, engine: 'key' }), 'failed(1)');
});

test('the key landing contract names claude/key-<id>, key(<id>): <label>, gh, and fences the worker in its worktree', () => {
  const c = LANDING_CONTRACT('261006-abcdef', 'claude/key-261006-abcdef', 'Fix it', 'key');
  assert.match(c, /key\(261006-abcdef\): Fix it/);
  assert.match(c, /git push -u origin claude\/key-261006-abcdef/);
  assert.match(c, /gh pr create/);
  assert.match(c, /\.cloud-runs\/261006-abcdef\/RESULT\.md/);
  assert.match(c, /Never write outside this worktree/);
  assert.match(c, /never force-push/);
  assert.doesNotMatch(LANDING_CONTRACT('i', 'b', 'l'), /worktree/, 'the cloud contract is untouched');
});

test('parseClaudeResult reads total_cost_usd, session_id and is_error; keyStatus omits unknown keys', () => {
  assert.deepEqual(parseClaudeResult('{"type":"result","total_cost_usd":3.21,"session_id":"abc","is_error":false,"result":"done"}'), { cost_usd: 3.21, session_id: 'abc', is_error: false });
  assert.deepEqual(parseClaudeResult('noise\n{"total_cost_usd":1,"session_id":"z","is_error":true}\n'), { cost_usd: 1, session_id: 'z', is_error: true });
  assert.deepEqual(parseClaudeResult(''), {});
  assert.deepEqual(parseClaudeResult('not json'), {});
  assert.deepEqual(keyStatus({ exit: 0, error: undefined, cost_usd: undefined, session_id: 's', ended: 'e' }), { exit: 0, session_id: 's', ended: 'e' });
  assert.deepEqual(Object.keys(keyStatus({ exit: 1, error: 'x', cost_usd: 2, session_id: 's', ended: 'e' })), ['exit', 'error', 'cost_usd', 'session_id', 'ended']);
});

// ---------------------------------------------------------------- keyworker

function workerFixture({ env = { ANTHROPIC_KEY_LANE_REGISTRY: SECRET, ANTHROPIC_AUTH_TOKEN: 'tok', NODE_TEST_CONTEXT: 'x' }, machine = true, claude = { status: 0, stdout: '{"total_cost_usd":4.2,"session_id":"sess-1","is_error":false}' }, removeOk = true } = {}) {
  const { root, reg, repo } = setup();
  if (machine) fs.writeFileSync(path.join(repo, '.machine.local.json'), '{"fleetRoot":"x"}');
  const id = '261006-abcdef';
  const wt = path.join(root, 'wt', `cd-${id}`);
  fs.mkdirSync(path.join(reg, '.ai', 'cloud-queue'), { recursive: true });
  const promptFile = path.join(reg, '.ai', 'cloud-queue', `${id}.prompt.txt`);
  fs.writeFileSync(promptFile, 'THE PROMPT');
  const item = { id, engine: 'key', lane: 'registry', keyEnv: 'ANTHROPIC_KEY_LANE_REGISTRY', repo, defaultBranch: 'main', branch: `claude/key-${id}`, worktree: wt, model: 'claude-opus-5-5', effort: 'high', perRunUsd: 15, label: 'l', promptFile, statusFile: statusFileFor(reg, id), registryDir: reg };
  const itemFile = keyItemFileFor(reg, id);
  fs.writeFileSync(itemFile, JSON.stringify(item));
  const gitCalls = [];
  const git = (r, args) => {
    gitCalls.push(args.join(' '));
    if (args[0] === 'rev-parse') return { code: 0, stdout: `${repo}\n`, stderr: '' };
    if (args[0] === 'worktree') fs.mkdirSync(wt, { recursive: true });
    return { code: 0, stdout: '', stderr: '' };
  };
  const spawns = [];
  let machineSeen = null;
  const spawnSyncFake = (cmd, args, opts) => { spawns.push({ cmd, args, opts }); machineSeen = fs.existsSync(path.join(wt, '.machine.local.json')); return { status: claude.status, stdout: claude.stdout, signal: null }; };
  const removed = [];
  const removeWorktree = (w, r) => { removed.push([w, r]); return removeOk ? { ok: true } : { ok: false, reason: 'worktree has uncommitted changes' }; };
  return { reg, repo, wt, item, itemFile, gitCalls, spawns, removed, git, spawnSyncFake, removeWorktree, env, machineSeen: () => machineSeen };
}

test('keyworker: worktree from origin with no tracking, claude -p without a shell on stdin with the key env, status written, worktree removed', () => {
  const f = workerFixture();
  const logs = [];
  const out = runKeyWorker(f.itemFile, { git: f.git, spawnSync: f.spawnSyncFake, env: f.env, now: () => NOW, removeWorktree: f.removeWorktree, log: (m) => logs.push(m) });
  assert.deepEqual(f.gitCalls, ['rev-parse --show-toplevel', 'fetch origin --quiet', `worktree add --no-track -b claude/key-261006-abcdef ${f.wt} origin/main`]);
  assert.equal(f.spawns.length, 1);
  const s = f.spawns[0];
  assert.equal(s.cmd, 'claude');
  assert.deepEqual(s.args, keyWorkerArgv(f.item));
  assert.equal(s.opts.cwd, f.wt);
  assert.equal(s.opts.input, 'THE PROMPT');
  assert.equal(s.opts.shell, undefined, 'no shell: nothing in the prompt is interpreted');
  assert.equal(s.opts.env.ANTHROPIC_API_KEY, SECRET);
  for (const k of ['ANTHROPIC_KEY_LANE_REGISTRY', 'ANTHROPIC_AUTH_TOKEN', 'NODE_TEST_CONTEXT']) assert.equal(k in s.opts.env, false, k);
  assert.equal(f.machineSeen(), true, '.machine.local.json is copied in before the worker starts');
  assert.equal(fs.existsSync(path.join(f.wt, '.machine.local.json')), false, 'and deleted before cleanup, or the tree reads dirty');
  const status = JSON.parse(fs.readFileSync(f.item.statusFile, 'utf8'));
  assert.deepEqual(status, { exit: 0, cost_usd: 4.2, session_id: 'sess-1', ended: NOW.toISOString() });
  assert.deepEqual(out.status, status);
  assert.deepEqual(f.removed, [[f.wt, f.reg]]);
  noSecret(logs);
});

test('keyworker: an unset key writes an error status and never creates a worktree or spawns', () => {
  const f = workerFixture({ env: {} });
  const out = runKeyWorker(f.itemFile, { git: f.git, spawnSync: f.spawnSyncFake, env: f.env, now: () => NOW, removeWorktree: f.removeWorktree, log: () => {} });
  assert.match(out.status.error, /ANTHROPIC_KEY_LANE_REGISTRY is unset or empty/);
  assert.equal(out.status.exit, undefined, 'exit null is omitted, never written as null');
  assert.deepEqual(f.gitCalls, []);
  assert.equal(f.spawns.length, 0);
  assert.deepEqual(f.removed, []);
  assert.equal(runState({ status: out.status, branchExists: false, pr: null, engine: 'key' }), `failed(${out.status.error})`);
});

test('keyworker: a failed claude run records the error and its cost; a refused cleanup keeps the worktree and says why', () => {
  const f = workerFixture({ machine: false, claude: { status: 1, stdout: '{"total_cost_usd":15.01,"session_id":"s2","is_error":true}' }, removeOk: false });
  const out = runKeyWorker(f.itemFile, { git: f.git, spawnSync: f.spawnSyncFake, env: f.env, now: () => NOW, removeWorktree: f.removeWorktree, log: () => {} });
  assert.equal(out.status.exit, 1);
  assert.equal(out.status.error, 'claude exited 1');
  assert.equal(out.status.cost_usd, 15.01);
  assert.equal(out.status.cleanup_error, 'worktree has uncommitted changes');
  assert.equal(out.cleanup.ok, false);
  assert.deepEqual(JSON.parse(fs.readFileSync(f.item.statusFile, 'utf8')), out.status);
});
