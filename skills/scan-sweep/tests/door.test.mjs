// node --test skills/scan-sweep/tests/door.test.mjs
// Pins the two reads SKILL.md section 2 makes through scripts/door.mjs - the recorded decisions
// (Seam A3) and the per-slice trust levels (Seam A4) - and the ladder lookup section 5 routes by.
// No Personas app is touched: a loopback server in this process plays the door through a temp HOME.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { levelFor, sliceKey, sliceMatches } from '../scripts/door.mjs';

const SCRIPT = fileURLToPath(new URL('../scripts/door.mjs', import.meta.url));
const made = [];
const scratch = (p) => { const d = mkdtempSync(join(tmpdir(), p)); made.push(d); return d; };
after(() => { for (const d of made) rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });

const DECISIONS = [{ ideaId: 'i9', title: 'Guard the queue', lens: 'error-handler', contextId: 'c1', verdict: 'rejected', reason: 'already guarded upstream', decidedBy: 'human', decidedAt: '2026-10-01T00:00:00Z' }];
const TRUST = { slices: [{ slice: 'technical|error-handler|-|S', level: 3, ceiling: 3, start: 2, agreement: 0.95, n: 20, changedAt: '2026-10-02T00:00:00Z', reason: 'earned' }], events: [] };

async function door(repo, { decisions = true, outcomeStatus = 200 } = {}) {
  const seen = [];
  const posts = [];
  const server = http.createServer(async (req, res) => {
    seen.push(req.url);
    res.setHeader('content-type', 'application/json');
    if (req.headers['x-personas-local-token'] !== 't') { res.statusCode = 401; return res.end('{}'); }
    const m = /^\/dev-tools\/ideas\/([^/]+)\/outcome$/.exec(req.url);
    if (m && req.method === 'POST') {
      let raw = ''; for await (const c of req) raw += c;
      posts.push({ id: m[1], body: JSON.parse(raw) });
      res.statusCode = outcomeStatus;
      return res.end(outcomeStatus === 200 ? JSON.stringify({ ideaId: m[1], ideaStatus: 'implemented', task: { id: 't1' } }) : 'outcome must be one of ...');
    }
    if (req.url === '/dev-tools/projects') return res.end(JSON.stringify([{ id: 'p1', name: 'repo', root_path: repo }]));
    if (req.url === '/dev-tools/contexts/p1') return res.end(JSON.stringify([{ id: 'c1', name: 'Core' }]));
    if (decisions && req.url.startsWith('/dev-tools/scan/decisions?')) return res.end(JSON.stringify({ decisions: DECISIONS }));
    if (req.url.startsWith('/dev-tools/scan/trust?')) return res.end(JSON.stringify(TRUST));
    res.statusCode = 404; res.end('{}');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { server, seen, posts, port: server.address().port };
}

function run(args, home, extra = {}) {
  return new Promise((resolve) => {
    const env = { ...process.env, HOME: home, USERPROFILE: home };
    delete env.PERSONAS_HANDSHAKE;
    delete env.PERSONAS_SPOOL;
    Object.assign(env, extra);
    const p = spawn(process.execPath, [SCRIPT, ...args], { env, windowsHide: true });
    let stdout = ''; let stderr = '';
    p.stdout.on('data', (d) => { stdout += d; });
    p.stderr.on('data', (d) => { stderr += d; });
    p.on('close', (status) => resolve({ status, stdout, stderr, json: (() => { try { return JSON.parse(stdout); } catch { return null; } })() }));
  });
}

async function fixture(opts) {
  const home = scratch('door-home-');
  const repo = scratch('door-repo-');
  const d = await door(repo, opts);
  mkdirSync(join(home, '.personas'), { recursive: true });
  writeFileSync(join(home, '.personas', 'local-http.json'), JSON.stringify({ port: d.port, token: 't' }));
  return { home, repo, ...d };
}

test('decisions: context name resolved to its id, lens and limit passed, reasons returned', async () => {
  const f = await fixture();
  try {
    const r = await run(['decisions', '--repo', f.repo, '--context', 'core', '--lens', 'error-handler', '--limit', '50'], f.home);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.json.reachable, true);
    assert.equal(r.json.scope, 'context');
    assert.ok(!('widened' in r.json));
    assert.deepEqual(r.json.decisions, DECISIONS);
    const q = f.seen.find((u) => u.startsWith('/dev-tools/scan/decisions?'));
    assert.equal(q, '/dev-tools/scan/decisions?projectId=p1&contextId=c1&lens=error-handler&limit=50');
  } finally { f.server.close(); }
});

test('decisions: an unknown context reads project-wide and says so; limit is clamped to 100', async () => {
  const f = await fixture();
  try {
    const r = await run(['decisions', '--repo', f.repo, '--context', 'nowhere', '--limit', '500'], f.home);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.json.scope, 'project');
    // personas cycle 2: all four contexts were unknown to the app and every read quietly went project-wide.
    assert.equal(r.json.widened, true, 'the widening is a flag, not only prose');
    assert.equal(r.json.note, 'scope: project (context nowhere unknown to the app) - run `personas-door contexts sync` first');
    assert.match(r.stderr, /scope: project \(context nowhere unknown to the app\)/);
    assert.ok(f.seen.includes('/dev-tools/scan/decisions?projectId=p1&limit=100'));
  } finally { f.server.close(); }
});

test('an app without the endpoint is unreachable for this purpose (exit 3), so the caller falls back', async () => {
  const f = await fixture({ decisions: false });
  try {
    const r = await run(['decisions', '--repo', f.repo], f.home);
    assert.equal(r.status, 3);
    assert.equal(r.json.reachable, false);
    assert.match(r.json.reason, /no decisions endpoint/);
  } finally { f.server.close(); }
});

test('no handshake: exit 3 with reachable false; unregistered repo: exit 4', async () => {
  const r = await run(['trust', '--repo', scratch('door-repo-')], scratch('door-home-'));
  assert.equal(r.status, 3);
  assert.equal(r.json.reachable, false);
  const f = await fixture();
  try {
    const u = await run(['trust', '--repo', scratch('door-other-')], f.home);
    assert.equal(u.status, 4);
    assert.equal(u.json.registered, false);
  } finally { f.server.close(); }
});

test('trust: slices and events passed through', async () => {
  const f = await fixture();
  try {
    const r = await run(['trust', '--repo', f.repo, '--slice', 'product|feature-scout|-|M'], f.home);
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(r.json.slices, TRUST.slices);
    assert.ok(f.seen.includes(`/dev-tools/scan/trust?projectId=p1&slice=${encodeURIComponent('product|feature-scout|-|M')}`));
  } finally { f.server.close(); }
});

// ---- outcome (D6, D8): the director's post of what happened to an approved card -------------------------------

const spoolOf = (home) => join(home, '.personas', 'spool', 'outcomes.jsonl');
const readSpoolRows = (home) => { try { return readFileSync(spoolOf(home), 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; } };

test('outcome: POSTs to /ideas/{id}/outcome with the token; commit, figures and the director\'s choice reach the body', async () => {
  // personas c2r2 (2026-10-31): 58 outcomes went through a one-off helper because no script had the verb, and the
  // director's Lane C product choice (986a9e7b: no Undo on Build now, over cancel-on-undo) lived only in a merge message.
  const f = await fixture();
  try {
    const choice = { picked: 'no Undo on Build now', rejected: 'cancel the queued task on undo', why: 'cancelling is harder to take back' };
    const r = await run(['outcome', '986a9e7b', '--outcome', 'delivered', '--commit', 'a393580dc9', '--branch', 'scan/c2r2', '--note', 'better; undo offered -> none',
      '--figures', JSON.stringify({ before: 'undo offered', after: 'none', control_value: '1 failed / 36' }), '--choice', JSON.stringify(choice)], f.home);
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual([r.json.posted, r.json.ideaId], [true, '986a9e7b']);
    assert.equal(f.posts.length, 1);
    const b = f.posts[0].body;
    assert.deepEqual([b.outcome, b.commit, b.branch], ['delivered', 'a393580dc9', 'scan/c2r2']);
    assert.deepEqual(b.figures, { before: 'undo offered', after: 'none', control_value: '1 failed / 36', choice });
    assert.equal(b.note, 'better; undo offered -> none; choice: picked no Undo on Build now over cancel the queued task on undo - cancelling is harder to take back',
      'the app stores note, not figures: the choice must survive in the note');
  } finally { f.server.close(); }
});

test('outcome: app down (no handshake, or a stale one) spools durably, exit 0; --no-spool exits 3', async () => {
  const home = scratch('door-home-');
  const r = await run(['outcome', 'i9', '--outcome', 'declined', '--note', 'fp: Before did not reproduce'], home);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual([r.json.posted, r.json.spooled], [false, true]);
  const rows = readSpoolRows(home);
  assert.equal(rows.length, 1);
  assert.deepEqual([rows[0].state, rows[0].ideaId, rows[0].body.outcome], ['queued', 'i9', 'declined']);
  // stale handshake: the file outlived the app (connection refused) - as down as a missing one
  const stale = scratch('door-home-');
  const dead = http.createServer(); await new Promise((ok) => dead.listen(0, '127.0.0.1', ok)); const port = dead.address().port; await new Promise((ok) => dead.close(ok));
  mkdirSync(join(stale, '.personas'), { recursive: true });
  writeFileSync(join(stale, '.personas', 'local-http.json'), JSON.stringify({ port, token: 't' }));
  const s = await run(['outcome', 'i9', '--outcome', 'blocked'], stale);
  assert.equal(s.status, 0, s.stderr);
  assert.equal(readSpoolRows(stale).length, 1);
  const n = await run(['outcome', 'i9', '--outcome', 'blocked', '--no-spool'], scratch('door-home-'));
  assert.equal(n.status, 3);
});

test('outcome: an invalid post is refused before anything is sent or spooled (exit 2); an app refusal is exit 1, not spooled', async () => {
  const f = await fixture();
  try {
    for (const args of [
      ['outcome', 'i9', '--outcome', 'done'],
      ['outcome', 'i9', '--outcome', 'already_delivered'],
      ['outcome', '--outcome', 'delivered'],
      ['outcome', 'i9', '--outcome', 'delivered', '--figures', '{not json'],
      ['outcome', 'i9', '--outcome', 'delivered', '--choice', '{"picked":"A"}'],
    ]) {
      const r = await run(args, f.home);
      assert.equal(r.status, 2, `${args.join(' ')}: ${r.stdout}`);
    }
    assert.equal(f.posts.length, 0);
    assert.equal(readSpoolRows(f.home).length, 0);
  } finally { f.server.close(); }
  const g = await fixture({ outcomeStatus: 400 });
  try {
    const r = await run(['outcome', 'i9', '--outcome', 'delivered'], g.home);
    assert.equal(r.status, 1);
    assert.equal(r.json.posted, false);
    assert.equal(readSpoolRows(g.home).length, 0, 'a refusal is not an outage: replaying it would only be refused again');
  } finally { g.server.close(); }
});

test('outcome --help is side-effect free: no request, no spool', async () => {
  const f = await fixture();
  try {
    const r = await run(['outcome', 'i9', '--outcome', 'delivered', '--help'], f.home);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /door\.mjs outcome <idea-id>/);
    assert.deepEqual([f.seen.length, readSpoolRows(f.home).length], [0, 0]);
  } finally { f.server.close(); }
});

test('sliceKey writes absent parts as -, patterns match per part', () => {
  assert.equal(sliceKey({ category: 'technical', lens: 'code-optimizer', size: 'S' }), 'technical|code-optimizer|-|S');
  assert.ok(sliceMatches('product|*|*|*', 'product|feature-scout|-|M'));
  assert.ok(!sliceMatches('product|*|*', 'product|feature-scout|-|M'), 'a pattern has four parts');
});

test('levelFor: door level wins, start by category otherwise, ceilings and local demotions apply', () => {
  const up = { reachable: true, slices: TRUST.slices };
  const earned = levelFor({ category: 'technical', lens: 'error-handler', size: 'S' }, up);
  assert.deepEqual([earned.level, earned.source, earned.lane_a_ok, earned.auto_decide], [3, 'door', true, true]);
  const fresh = levelFor({ category: 'product', lens: 'feature-scout', size: 'M' }, up);
  assert.deepEqual([fresh.level, fresh.source, fresh.lane_a_ok, fresh.auto_decide], [0, 'start', false, false]);
  assert.equal(levelFor({ category: 'technical', lens: 'error-handler', size: 'S', risk_class: 'authz' }, up).level, 1, 'authz never above L1');
  assert.equal(levelFor({ category: 'technical', lens: 'error-handler', size: 'S' }, { ...up, frozen: ['technical|error-handler|*|*'] }).source, 'frozen');
  assert.equal(levelFor({ category: 'technical', lens: 'error-handler', size: 'S' }, { ...up, start: { technical: 1 } }).level, 1, 'an overlay lowering is a local ceiling');
  const strict = levelFor({ category: 'technical', lens: 'x', size: 'S' }, { ...up, strict: true });
  assert.deepEqual([strict.level, strict.effective, strict.lane_a_ok, strict.auto_decide], [2, 1, false, true], 'the fp counter demotes one level locally');
  assert.equal(levelFor({ lens: 'x' }, up).level, 0, 'unknown category: no autonomy');
  const esc = levelFor({ category: 'technical', lens: 'error-handler', size: 'S', gate: 'irreversible' }, up);
  assert.deepEqual([esc.level, esc.lane_a_ok, esc.auto_decide], [3, false, false], 'a Lane C escalation stays the human\'s');
});

test('levelFor: door unreachable - category start, autoDecide asked from L1', () => {
  const t = levelFor({ category: 'technical', lens: 'x', size: 'S' }, { reachable: false });
  assert.deepEqual([t.level, t.source, t.lane_a_ok, t.auto_decide], [2, 'unreachable', true, true]);
  const p = levelFor({ category: 'product', lens: 'x', size: 'S' }, { reachable: false });
  assert.deepEqual([p.level, p.auto_decide], [0, false]);
});
