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
} from '../scripts/lib/core.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OVERFLOW = path.join(HERE, '..', 'scripts', 'overflow.mjs');
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
  assert.deepEqual(LEDGER_KEYS, ['ts', 'id', 'repo', 'origin', 'base_sha', 'label', 'from', 'model', 'mode', 'brief_sha256', 'prompt_chars', 'allow_ahead']);
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
