import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { refresh, plan, apply, thresholdFor, stats, readLedger } from './lib/personas-door/contexts.mjs';
import { toFiling, filingFor, parseCards } from './lib/personas-door/ideas.mjs';
import { assertSelect } from './lib/personas-door/door.mjs';

const CLI = fileURLToPath(new URL('./personas-door.mjs', import.meta.url));
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'pdoor-'));
const git = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8' });
const put = (root, f, body = 'x' + Math.random()) => { fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true }); fs.writeFileSync(path.join(root, f), body); };

function fixture() {
  const r = tmp(); git(r, 'init', '-q'); git(r, 'config', 'user.email', 't@t'); git(r, 'config', 'user.name', 't');
  for (const f of ['src/a/one.ts', 'src/a/two.ts', 'src/b/x.ts', 'src/b/y.ts']) put(r, f);
  git(r, 'add', '-A'); git(r, 'commit', '-qm', 'base');
  const base = git(r, 'rev-parse', 'HEAD').trim();
  fs.writeFileSync(path.join(r, 'context-map.json'), JSON.stringify({
    provenance: { git_commit: base }, stats: {}, groups: [{ id: 'g1', name: 'G' }],
    contexts: [
      { id: 'c-a', name: 'alpha', group: 'G', group_id: 'g1', file_paths: ['src/a/one.ts', 'src/a/two.ts'] },
      { id: 'c-b', name: 'beta', group: 'G', group_id: 'g1', file_paths: ['src/b/x.ts', 'src/b/y.ts'] },
    ],
  }));
  return r;
}

test('refresh drops gone files, follows renames, attaches new files by directory, flags churn', () => {
  const r = fixture();
  git(r, 'mv', 'src/b/x.ts', 'src/b/x2.ts'); git(r, 'rm', '-q', 'src/b/y.ts');
  for (const f of ['src/a/n1.ts', 'src/a/n2.ts', 'src/a/n3.ts', 'src/a/n4.ts']) put(r, f);
  put(r, 'src/zzz/new.ts');
  git(r, 'add', '-A'); git(r, 'commit', '-qm', 'change');
  const rep = refresh(r);
  const map = JSON.parse(fs.readFileSync(path.join(r, 'context-map.json'), 'utf8'));
  const a = map.contexts.find((c) => c.name === 'alpha'); const b = map.contexts.find((c) => c.name === 'beta');
  assert.equal(a.file_paths.length, 6, 'four new files joined alpha by directory');
  assert.deepEqual(b.file_paths, ['src/b/x2.ts'], 'rename followed, deleted file dropped');
  assert.equal(rep.unassigned, 1, 'src/zzz has no mapped neighbour: left for the LLM');
  assert.equal(rep.flagged[0].context, 'alpha');
  assert.equal(map.provenance.git_commit, git(r, 'rev-parse', 'HEAD').trim());
  assert.ok(plan(r).packets.some((p) => p.context === 'alpha'));
});

test('--help on any verb prints usage, exits 0 and writes nothing (contexts refresh --help used to rewrite the map)', () => {
  // personas cycle 2 (2026-10-30): `contexts refresh --help` ignored the flag and rewrote context-map.json.
  const r = fixture(); put(r, 'src/a/n.ts'); git(r, 'add', '-A'); git(r, 'commit', '-qm', 'n');
  const spool = tmp(); const env = { ...process.env, PERSONAS_HANDSHAKE: path.join(spool, 'none.json'), PERSONAS_SPOOL: spool, PERSONAS_DB: path.join(spool, 'none.db') };
  const before = fs.readFileSync(path.join(r, 'context-map.json'), 'utf8');
  for (const args of [['contexts', 'refresh', '--help'], ['contexts', 'apply', '--help'], ['ideas', 'file', '--help'], ['--help']]) {
    const p = spawnSync(process.execPath, [CLI, ...args, '--repo', r], { encoding: 'utf8', env });
    assert.equal(p.status, 0, `${args.join(' ')}: ${p.stderr}`);
    assert.match(p.stdout, /usage: personas-door/);
  }
  assert.equal(fs.readFileSync(path.join(r, 'context-map.json'), 'utf8'), before, 'the map is untouched');
  assert.equal(readLedger(r).length, 0, 'no refresh ledger row');
  assert.ok(!fs.existsSync(path.join(spool, 'ideas.jsonl')), 'nothing spooled');
});

test('dry-run writes nothing', () => {
  const r = fixture(); put(r, 'src/a/n.ts'); git(r, 'add', '-A'); git(r, 'commit', '-qm', 'n');
  const before = fs.readFileSync(path.join(r, 'context-map.json'), 'utf8');
  refresh(r, { write: false });
  assert.equal(fs.readFileSync(path.join(r, 'context-map.json'), 'utf8'), before);
  assert.equal(readLedger(r).length, 0);
});

test('rescans that change nothing raise that context\'s threshold; yielding ones keep it low', () => {
  const r = fixture();
  assert.equal(thresholdFor([], 'alpha').threshold, 0.25);
  const dud = [{ kind: 'rescan', context: 'alpha', changed: false }, { kind: 'rescan', context: 'alpha', changed: false }];
  assert.equal(thresholdFor(dud, 'alpha').threshold, 0.75);
  const good = [{ kind: 'rescan', context: 'alpha', changed: true }, { kind: 'rescan', context: 'alpha', changed: true }];
  assert.equal(thresholdFor(good, 'alpha').threshold, 0.25);
  const out = apply(r, { contexts: [{ name: 'alpha', description: 'd' }, { name: 'beta' }] }, { tokensEst: 1000 });
  assert.deepEqual(out.map((o) => o.changed), [true, false]);
  const s = stats(r); assert.equal(s.rescans, 2); assert.equal(s.yield, 0.5); assert.equal(s.tokensEstTotal, 1000);
});

test('apply creates a new context under a named group', () => {
  const r = fixture();
  apply(r, { newContexts: [{ name: 'gamma', group: 'G', file_paths: ['src/g.ts'] }] });
  const m = JSON.parse(fs.readFileSync(path.join(r, 'context-map.json'), 'utf8'));
  const g = m.contexts.find((c) => c.name === 'gamma'); assert.equal(g.group_id, 'g1'); assert.ok(g.id);
});

test('with the app down, cards are spooled durably, then a second file is not lost', () => {
  const spool = tmp(); const env = { ...process.env, PERSONAS_HANDSHAKE: path.join(spool, 'none.json'), PERSONAS_SPOOL: spool, PERSONAS_DB: path.join(spool, 'none.db') };
  const cards = path.join(spool, 'c.jsonl');
  fs.writeFileSync(cards, '{"title":"T1","lens":"x"}\n{"title":"T2"}\nnot json\n');
  const run = () => spawnSync(process.execPath, [CLI, 'ideas', 'file', '--file', cards, '--repo', spool], { encoding: 'utf8', env });
  const a = run(); assert.match(a.stdout, /2 queued/); assert.match(a.stderr, /line 3: not JSON/);
  assert.equal(a.status, 1, 'an unreadable line keeps the exit non-zero so the caller keeps the source file');
  const lines = fs.readFileSync(path.join(spool, 'ideas.jsonl'), 'utf8').trim().split('\n');
  assert.equal(lines.length, 2);
  const st = JSON.parse(spawnSync(process.execPath, [CLI, 'status', '--repo', spool], { encoding: 'utf8', env }).stdout);
  assert.equal(st.appUp, false); assert.equal(st.spool.ideas, 2);
  const nospool = spawnSync(process.execPath, [CLI, 'ideas', 'file', '--file', cards, '--no-spool', '--repo', spool], { encoding: 'utf8', env });
  assert.equal(nospool.status, 4, 'legacy behaviour on request: nothing queued, caller keeps the source');
});

test('card -> filing converts the 1-10 scales and defaults what is missing', () => {
  const f = toFiling({ title: ' T ', effort: 9, impact: 2, size: 'L', lane: 'B' }, 'p1', new Map([['ctx', 'cid']]));
  assert.equal(f.effort, 5); assert.equal(f.impact, 1); assert.equal(f.risk, 3); assert.match(f.reasoning, /scales defaulted: risk/);
  assert.match(f.description, /Lane B/); assert.equal(toFiling({ title: 'x', context: 'CTX' }, 'p', new Map([['ctx', 'cid']])).context_id, 'cid');
  assert.equal(parseCards('{"title":"a"}\n{}\n').unreadable.length, 1);
});

test('spool replay files a scan_sweep card on its native 1-10 scale through the skill mapping; other origins stay 1-5', () => {
  const card = { title: 'T', lens: 'error-handler', effort: 4, impact: 8, risk: 3, confidence: 'medium' };
  const sweep = filingFor(card, 'p1', new Map(), 'scan_sweep');
  assert.equal(sweep.body.impact, 8, 'never halved: the door normalizes a scan_sweep row once');
  assert.equal(sweep.body.score, 40.5, 'scan-score/1 computed by the skill mapping');
  assert.match(filingFor({ title: 'C', disposition: 'carry' }, 'p1', new Map(), 'scan_sweep').error, /carry/);
  assert.equal(filingFor(card, 'p1', new Map(), 'lens_scan').body.impact, 4, 'other origins file 1-5');
});

test('spooled outcomes (scan-sweep door.mjs outcome, app down) replay through POST /ideas/{id}/outcome and are marked done', async () => {
  // personas c2r2 (2026-10-31): the drain posted 58 outcomes through a one-off helper; the skill's verb spools when
  // the app is down, and this replay is what makes the spool worth anything.
  const spool = tmp();
  const saved = { h: process.env.PERSONAS_HANDSHAKE, s: process.env.PERSONAS_SPOOL };
  const outcomes = await import('./lib/personas-door/outcomes.mjs').catch(() => ({}));
  const posts = [];
  const server = http.createServer(async (req, res) => {
    let raw = ''; for await (const c of req) raw += c;
    if (req.headers['x-personas-local-token'] !== 't') { res.statusCode = 401; return res.end('{}'); }
    if (req.url === '/dev-tools/projects') return res.end('[]');
    const m = /^\/dev-tools\/ideas\/([^/]+)\/outcome$/.exec(req.url);
    if (m && req.method === 'POST') {
      posts.push({ id: m[1], body: JSON.parse(raw) });
      if (m[1] === 'gone') { res.statusCode = 404; return res.end('no such idea'); }
      return res.end(JSON.stringify({ ideaId: m[1], ideaStatus: 'implemented' }));
    }
    res.statusCode = 404; res.end('{}');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  try {
    process.env.PERSONAS_SPOOL = spool;
    process.env.PERSONAS_HANDSHAKE = path.join(spool, 'hs.json');
    // Written by the skill's own writer, so the two sides cannot drift on the record shape.
    const { spoolOutcome } = await import('../skills/scan-sweep/scripts/door.mjs');
    const rows = [
      { ideaId: 'i1', body: { outcome: 'delivered', commit: 'm1', note: 'n; choice: picked A over B - w' } },
      { ideaId: 'gone', body: { outcome: 'declined' } },
    ];
    for (const r of rows) spoolOutcome(r.ideaId, r.body);
    const st = JSON.parse(spawnSync(process.execPath, [CLI, 'status', '--repo', spool], { encoding: 'utf8', env: { ...process.env, PERSONAS_DB: path.join(spool, 'none.db') } }).stdout);
    assert.equal(st.spool.outcomes, 2, 'status counts queued outcomes');
    fs.writeFileSync(process.env.PERSONAS_HANDSHAKE, JSON.stringify({ port: server.address().port, token: 't' }));
    assert.equal(typeof outcomes.sync, 'function', 'lib/personas-door/outcomes.mjs exports sync');
    const r = await outcomes.sync();
    assert.deepEqual([r.drained, r.left], [1, 1]);
    assert.deepEqual(posts.map((p) => p.id), ['i1', 'gone']);
    assert.deepEqual(posts[0].body, rows[0].body, 'the spooled body is posted verbatim');
    const again = await outcomes.sync();
    assert.deepEqual(posts.slice(2).map((p) => p.id), ['gone'], 'a done row is not re-posted; a refused one stays queued with its error');
    assert.equal(again.left, 1);
  } finally {
    server.close();
    for (const [k, v] of [['PERSONAS_HANDSHAKE', saved.h], ['PERSONAS_SPOOL', saved.s]]) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
  }
});

test('sql guard admits one SELECT and nothing else', () => {
  assert.equal(assertSelect('select 1;'), 'select 1');
  for (const s of ['delete from dev_ideas', 'select 1; drop table x', 'pragma writable_schema=1']) assert.throws(() => assertSelect(s));
});
