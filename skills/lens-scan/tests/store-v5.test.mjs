// node --test skills/lens-scan/tests
// Pins the v5 store (scan-finding/1, SKILL.md ## Finding contract): the fresh shape, the v4 -> v5 ALTER migration and
// the v1/v2/v3 chain to one shape, a concurrent first open; propose's contract fields and the stored scan-score/1 (the
// contract's reference values); the listing order; slot allocation and the run report; the mvp, precedent and trust
// verbs; the autonomy ladder the store enforces (decide --machine, veto, proof, triage --machine) and its events.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import {
  openStore, runStart, runEnd, activity, measure, propose, proposals, proposalUpdate, decide, triage, packCreate, releaseCreate,
  allocate, runReport, mvps, precedent, trust, veto, proof, sliceOf, MACHINE, SCHEMA_VERSION, StoreError,
} from '../scripts/store.mjs';
import { legacyDdl, V1_DDL } from './legacy-ddl.mjs';

const madeDirs = [];
const mkdtempTracked = (prefix) => { const d = mkdtempSync(prefix); madeDirs.push(d); return d; };
after(() => { for (const d of madeDirs) rmSync(d, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 }); });

const SCRIPT = fileURLToPath(new URL('../scripts/store.mjs', import.meta.url));
const tmpDb = () => join(mkdtempTracked(join(tmpdir(), 'lens-scan-v5-')), 'nested', 'scan.db');
const cli = (db, ...args) => JSON.parse(execFileSync(process.execPath, [SCRIPT, '--db', db, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
const run$ = (db, ...args) => spawnSync(process.execPath, [SCRIPT, '--db', db, ...args], { encoding: 'utf8' });
const noNulls = (v) => !JSON.stringify(v).includes('null');
const TABLES = ['runs', 'measurements', 'proposals', 'activity', 'shots', 'coverage', 'packs', 'releases', 'trust_events'];
const shape = (x) => TABLES.map((t) => x.prepare(`PRAGMA table_info(${t})`).all().map((c) => `${t}.${c.name}:${c.type}:${c.notnull}:${c.dflt_value}:${c.pk}`).join(','));
const indexes = (x) => x.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map((r) => r.name);
const V5_COLS = ['impact', 'impact_why', 'confidence', 'effort', 'score', 'score_parts', 'band', 'mvp', 'mvp_rule', 'mvp_why', 'category',
  'predicted_verdict', 'predicted_why', 'predicted_by', 'predicted_at', 'veto_until', 'proof'];
const BY = 'lens-scan@1.11.0:test-model';
const jane = 'operator:jane';

function store({ model = 'test-model', lenses = 'development,security' } = {}) {
  const path = tmpDb();
  const db = openStore(path);
  const { id: run } = runStart(db, { phase: 'propose', lenses, model, env: {} });
  return { path, db, run };
}
const fix = (run, title, extra = {}) => ({ run, feature: 'a', lens: 'development', title, kind: 'fix', metric: 'loc', expectedDelta: -10, ...extra });
/** A predicted item on its own feature (no precedent), in one slice. */
const predicted = (run, n, extra = {}) => fix(run, `item ${n}`, { feature: `f${n}`, lens: 'quality', category: 'product', riskClass: 'ux', size: 'S',
  predictedVerdict: 'accept', predictedWhy: 'no precedent yet', predictedBy: BY, ...extra });

// ------------------------------------------------------------------------------------------------ shape and migration
test('fresh: v5 from the DDL - the seventeen contract columns last and in order, trust_events, the score index', () => {
  const { db } = store();
  assert.equal(SCHEMA_VERSION, 5);
  assert.equal(db.prepare('PRAGMA user_version').get().user_version, 5);
  const cols = db.prepare('PRAGMA table_info(proposals)').all();
  assert.deepEqual(cols.slice(-17).map((c) => c.name), V5_COLS);
  assert.deepEqual(cols.filter((c) => ['band', 'mvp'].includes(c.name)).map((c) => [c.name, c.notnull, c.dflt_value]), [['band', 1, "'ranked'"], ['mvp', 1, '0']]);
  assert.deepEqual(db.prepare('PRAGMA table_info(trust_events)').all().map((c) => c.name), ['id', 'at', 'slice', 'from_level', 'to_level', 'reason', 'agreement', 'n', 'item_id']);
  assert.ok(['proposals_score', 'trust_events_slice'].every((i) => indexes(db).includes(i)));
  assert.throws(() => db.prepare("INSERT INTO trust_events (at, slice, from_level, to_level, reason) VALUES ('x', 's', 0, 4, 'r')").run(), /CHECK/);
  db.close();
});

test('migration: a v4 file becomes v5 by ALTER - every row and column kept, the new columns NULL or their default; one shape with a fresh file', () => {
  const path = tmpDb();
  mkdirSync(dirname(path), { recursive: true });
  const v4 = new DatabaseSync(path);
  v4.exec(legacyDdl(4));
  assert.equal(v4.prepare('PRAGMA user_version').get().user_version, 4);
  assert.ok(!v4.prepare('PRAGMA table_info(proposals)').all().some((c) => c.name === 'score'), 'the fixture is v4');
  assert.ok(!v4.prepare("SELECT 1 FROM sqlite_master WHERE name = 'trust_events'").get(), 'no trust_events in v4');
  const at = '2026-10-01T00:00:00.000Z';
  v4.prepare(`INSERT INTO runs (id, started_at, updated_at, phase, status, lenses, model) VALUES ('r-1', ?, ?, 'execute', 'done', '["design"]', 'm')`).run(at, at);
  v4.prepare(`INSERT INTO packs (id, lens, n, branch, base_ref, base_sha, status, created_at, updated_at) VALUES ('k-des-1', 'design', 1, 'pack/des-1', 'main', 'b0', 'open', ?, ?)`).run(at, at);
  v4.prepare(`INSERT INTO proposals (id, run_id, feature, lens, metric, title, kind, expected_delta, size, risk, status, decided_by, decision_note, pack_id, commit_sha,
      triaged_by, triaged_from, origin, external_ref, tier, risk_class, ranked_by, ranked_at, created_at, updated_at)
    VALUES ('p-aaaaaa', 'r-1', 'a', 'design', 'rawLiterals', 'Tokens', 'fix', -3, 'M', 4, 'accepted', 'operator:jane', 'ok', 'k-des-1', 'c1',
      'operator:jane', 'done', 'scan', NULL, 1, 'ux', 'agent:t', ?, ?, ?)`).run(at, at, at);
  v4.prepare(`INSERT INTO proposals (id, run_id, feature, lens, title, kind, status, origin, external_ref, created_at, updated_at)
    VALUES ('p-bbbbbb', 'r-1', 'b', 'quality', 'ADO 7', 'work-item', 'proposed', 'ado', 'ado:7', ?, ?)`).run(at, at);
  v4.prepare("INSERT INTO measurements (run_id, feature, lens, metric, value, measured_at, proposal_id, phase, commit_sha) VALUES ('r-1', 'a', 'design', 'rawLiterals', 5, ?, 'p-aaaaaa', 'before', 'b0')").run(at);
  const before = v4.prepare('SELECT * FROM proposals ORDER BY id').all().map((r) => ({ ...r }));
  const others = (x) => ['runs', 'packs', 'measurements'].map((t) => x.prepare(`SELECT * FROM ${t} ORDER BY 1`).all().map((r) => ({ ...r })));
  const otherRows = others(v4);
  v4.close();

  const ro = openStore(path, { readOnly: true });
  assert.equal(ro.prepare('PRAGMA user_version').get().user_version, 5, 'a reader never meets v4');
  ro.close();
  const db = openStore(path);
  const rows = db.prepare('SELECT * FROM proposals ORDER BY id').all();
  assert.deepEqual(rows.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => !V5_COLS.includes(k)))), before, 'every v4 column of every row is kept');
  assert.ok(rows.every((r) => r.band === 'ranked' && r.mvp === 0 && V5_COLS.filter((k) => !['band', 'mvp'].includes(k)).every((k) => r[k] === null)), 'unscored, unpredicted: NULL; band ranked, mvp 0');
  assert.deepEqual(others(db), otherRows, 'runs, packs and measurements untouched');
  const listed = proposals(db);
  assert.ok(listed.every((p) => !('score' in p) && !('confidence' in p)) && noNulls(listed), 'unscored rows omit score, never 0');
  const fresh = openStore(tmpDb());
  assert.deepEqual(shape(db), shape(fresh), 'a migrated v4 file and a fresh one have one shape (trust_events included)');
  assert.deepEqual(indexes(db), indexes(fresh));
  fresh.close();
  assert.equal(db.prepare('PRAGMA foreign_key_check').all().length, 0);
  db.close();
  const again = openStore(path);
  assert.equal(again.prepare('PRAGMA user_version').get().user_version, 5, 'a second open is a no-op');
  assert.equal(proposals(again).length, 2);
  again.close();
});

test('migration: v1, v2 and v3 files reach v5 through the chain, each one shape with a fresh file', () => {
  const fresh = openStore(tmpDb());
  for (const v of [1, 2, 3]) {
    const path = tmpDb();
    mkdirSync(dirname(path), { recursive: true });
    const old = new DatabaseSync(path);
    old.exec(v === 1 ? V1_DDL : legacyDdl(v));
    assert.equal(old.prepare('PRAGMA user_version').get().user_version, v);
    const at = '2026-07-01T00:00:00.000Z';
    old.prepare(`INSERT INTO runs (id, started_at, updated_at, phase, status, lenses) VALUES ('r-1', ?, ?, 'propose', 'done', '["design"]')`).run(at, at);
    old.prepare(`INSERT INTO proposals (id, run_id, feature, lens, title, kind, metric, expected_delta, status, created_at, updated_at)
      VALUES ('p-dddddd', 'r-1', 'a', 'design', 'Old', 'fix', 'rawLiterals', -2, 'proposed', ?, ?)`).run(at, at);
    old.close();
    const db = openStore(path);
    assert.equal(db.prepare('PRAGMA user_version').get().user_version, 5, `v${v} reaches v5`);
    const [p] = proposals(db);
    assert.deepEqual([p.id, p.title, p.expected_delta, p.origin, p.band, p.mvp, 'score' in p], ['p-dddddd', 'Old', -2, 'scan', 'ranked', 0, false]);
    assert.deepEqual(shape(db), shape(fresh), `a migrated v${v} file and a fresh one have one shape`);
    assert.deepEqual(indexes(db), indexes(fresh));
    db.close();
  }
  fresh.close();
});

test('concurrent first open: parallel openers of one v4 file and of one new file all see v5, nothing lost', async () => {
  const v4path = tmpDb();
  mkdirSync(dirname(v4path), { recursive: true });
  const v4 = new DatabaseSync(v4path);
  v4.exec(legacyDdl(4));
  v4.prepare(`INSERT INTO runs (id, started_at, updated_at, phase, status, lenses) VALUES ('r-1', 'x', 'x', 'propose', 'done', '["d"]')`).run();
  v4.prepare(`INSERT INTO proposals (id, run_id, feature, lens, title, kind, status, created_at, updated_at) VALUES ('p-1', 'r-1', 'a', 'd', 't', 'fix', 'proposed', 'x', 'x')`).run();
  v4.close();
  const newPath = tmpDb();
  const open = (p) => new Promise((done) => {
    const c = spawn(process.execPath, [SCRIPT, '--db', p, 'init'], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    c.stdout.on('data', (d) => { out += d; }); c.stderr.on('data', (d) => { err += d; });
    c.on('close', (code) => done({ code, out, err }));
  });
  const results = await Promise.all([...Array(4)].flatMap(() => [open(v4path), open(newPath)]));
  for (const r of results) {
    assert.equal(r.code, 0, r.err);
    assert.equal(JSON.parse(r.out).user_version, 5);
  }
  for (const p of [v4path, newPath]) {
    const db = openStore(p);
    assert.equal(db.prepare('PRAGMA user_version').get().user_version, 5);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name = 'trust_events'").get().n, 1);
    db.close();
  }
  const db = openStore(v4path);
  assert.deepEqual(proposals(db).map((p) => p.id), ['p-1'], 'the v4 row survived the race');
  db.close();
});

// ------------------------------------------------------------------------------------------------ propose and score
test('propose: the store computes scan-score/1 - the contract reference values - and refuses a caller-supplied score', () => {
  const { path, db, run } = store();
  const cases = [
    [{ impact: 10, confidence: 'high', effort: 1, risk: 1 }, 95],
    [{ impact: 8, confidence: 'medium', size: 'M', risk: 3 }, 40.5], // effort 4 from size M
    [{ impact: 3, confidence: 'high', size: 'XS', risk: 1 }, 28.5],
    [{ impact: 5, confidence: 'low', effort: 10, risk: 10 }, 6.9],
  ];
  for (const [i, [f, want]] of cases.entries()) {
    const { id, score } = propose(db, fix(run, `t${i}`, f));
    assert.equal(score, want);
    const [p] = proposals(db, { ids: id });
    assert.equal(p.score, want);
    assert.deepEqual(Object.keys(p.score_parts), ['impact', 'confidence_w', 'effort_div', 'risk_factor', 'formula']);
    assert.equal(p.score_parts.formula, 'scan-score/1');
    assert.equal(p.effort, f.effort ?? { M: 4, XS: 1 }[f.size]);
  }
  // unscored: no impact (or no effort) -> no score, never 0
  const { id: u, score: us } = propose(db, fix(run, 'unscored', { size: 'S', confidence: 'high' }));
  assert.equal(us, undefined);
  const [up] = proposals(db, { ids: u });
  assert.ok(!('score' in up) && !('score_parts' in up) && up.effort === 2 && noNulls(up));
  assert.ok(!('score' in proposals(db, { ids: propose(db, fix(run, 'no effort', { impact: 7 })).id })[0]), 'impact without effort is unscored');
  assert.throws(() => propose(db, fix(run, 'x', { impact: 5, effort: 2, score: 99 })), /computed by the store/);
  assert.throws(() => propose(db, fix(run, 'x', { scoreParts: '{}' })), /computed by the store/);
  db.close();
  const r = run$(path, 'propose', '--run', run, '--feature', 'a', '--lens', 'development', '--title', 'T', '--kind', 'fix', '--metric', 'loc', '--expected-delta', '-1', '--impact', '5', '--effort', '2', '--score', '50');
  assert.equal(r.status, 2);
  const ok = cli(path, 'propose', '--run', run, '--feature', 'a', '--lens', 'development', '--title', 'T', '--kind', 'fix', '--metric', 'loc', '--expected-delta', '-1',
    '--impact', '8', '--confidence', 'medium', '--size', 'M', '--risk', '3', '--category', 'technical', '--impact-why', 'every build pays it');
  assert.equal(ok.score, 40.5);
  const [p] = cli(path, 'proposals', '--ids', ok.id);
  assert.deepEqual([p.category, p.impact_why, p.band, p.mvp], ['technical', 'every build pays it', 'ranked', 0]);
  assert.equal(typeof p.score_parts, 'object', 'score_parts prints as an object');
});

test('propose: contract field checks - scales, text caps, MVP rules, one MVP per lens per run', () => {
  const { db, run } = store();
  for (const impact of [0, 11, 2.5, 'x']) assert.throws(() => propose(db, fix(run, 'x', { impact })), /integer 1-10|finite number/);
  assert.throws(() => propose(db, fix(run, 'x', { effort: 0 })), /integer 1-10/);
  assert.throws(() => propose(db, fix(run, 'x', { confidence: 'sure' })), /must be one of low, medium, high/);
  assert.throws(() => propose(db, fix(run, 'x', { category: 'ux' })), /technical, product/);
  assert.throws(() => propose(db, fix(run, 'x', { impactWhy: 'x'.repeat(201) })), /at most 200/);
  assert.throws(() => propose(db, fix(run, 'x', { impactWhy: '' })), /required/, 'absent is omitted, never ""');
  assert.throws(() => propose(db, fix(run, 'x', { band: 'top' })), /ranked, reserve/);
  assert.throws(() => propose(db, fix(run, 'x', { mvpRule: 'top-score' })), /belong to the MVP/);
  assert.throws(() => propose(db, fix(run, 'x', { mvp: 'true', mvpRule: 'override' })), /says why/);
  assert.throws(() => propose(db, fix(run, 'x', { mvp: 'true', band: 'reserve' })), /never reserve/);
  assert.throws(() => propose(db, fix(run, 'x', { mvp: 'maybe' })), /true or false/);
  const { id } = propose(db, fix(run, 'mvp', { mvp: 'true', impact: 5, effort: 2 }));
  assert.equal(proposals(db, { ids: id })[0].mvp_rule, 'top-score');
  assert.throws(() => propose(db, fix(run, 'second', { mvp: true })), (e) => e.code === 1 && /already has lens development's MVP/.test(e.message));
  assert.match(propose(db, fix(run, 'other lens', { lens: 'security', metric: 'findingsHigh', mvp: true, mvpRule: 'override', mvpWhy: 'the stop-ship one' })).id, /^p-/);
  db.close();
});

test('propose: a prediction - who made it, defaulted from the run; and it must quote the precedent when one exists', () => {
  const { db, run } = store();
  assert.throws(() => propose(db, fix(run, 'x', { predictedVerdict: 'accept' })), /says why/);
  assert.throws(() => propose(db, fix(run, 'x', { predictedWhy: 'because' })), /belong to a --predicted-verdict/);
  assert.throws(() => propose(db, fix(run, 'x', { predictedVerdict: 'maybe', predictedWhy: 'w' })), /accept, reject, defer/);
  assert.throws(() => propose(db, fix(run, 'x', { predictedVerdict: 'accept', predictedWhy: 'w', predictedBy: 'claude' })), /<skill>@<version>:<model>/);
  assert.throws(() => propose(db, fix(run, 'x', { predictedVerdict: 'accept', predictedWhy: 'x'.repeat(301) })), /at most 300/);
  const { id: first } = propose(db, fix(run, 'Split the god module', { predictedVerdict: 'accept', predictedWhy: 'no precedent yet' }));
  const [p] = proposals(db, { ids: first });
  assert.equal(p.predicted_by, `lens-scan@${p.predicted_by.split('@')[1].split(':')[0]}:test-model`);
  assert.ok(p.predicted_at, 'predicted_at is stamped');
  // a person declines it: the next prediction on the same feature and lens must name it
  decide(db, { ids: first, decision: 'decline', by: jane, note: 'not this quarter' });
  assert.throws(() => propose(db, fix(run, 'Split it again', { predictedVerdict: 'reject', predictedWhy: 'looks like noise' })), new RegExp(`quote the closest by id.*${first}|${first}`));
  assert.match(propose(db, fix(run, 'Split it again', { predictedVerdict: 'reject', predictedWhy: `${first} was declined: "not this quarter"` })).id, /^p-/);
  assert.match(propose(db, fix(run, 'elsewhere', { feature: 'b', predictedVerdict: 'accept', predictedWhy: 'other feature, no precedent' })).id, /^p-/, 'another feature has no precedent');
  db.close();
  const { db: d2, run: r2 } = store({ model: null });
  assert.throws(() => propose(d2, fix(r2, 'x', { predictedVerdict: 'accept', predictedWhy: 'w' })), /names no model/);
  d2.close();
});

test('proposals: tier first, ranked before reserve, score high first, unscored last, then age', () => {
  const { db, run } = store();
  const ids = {};
  ids.low = propose(db, fix(run, 'low', { impact: 2, effort: 5 })).id;
  ids.unscored = propose(db, fix(run, 'unscored')).id;
  ids.high = propose(db, fix(run, 'high', { impact: 9, effort: 2, confidence: 'high' })).id;
  ids.reserve = propose(db, fix(run, 'reserve high', { impact: 10, effort: 1, confidence: 'high', band: 'reserve' })).id;
  ids.tier0 = propose(db, fix(run, 'tier0 low', { impact: 1, effort: 10, tier: 0, riskClass: 'secret' })).id;
  assert.deepEqual(proposals(db).map((p) => p.id), [ids.tier0, ids.high, ids.low, ids.unscored, ids.reserve]);
  assert.deepEqual(proposals(db, { band: 'reserve' }).map((p) => p.id), [ids.reserve]);
  assert.deepEqual(proposals(db, { lens: 'development', run }).length, 5);
  db.close();
});

// ------------------------------------------------------------------------------------------------ allocation, report, mvp
test('allocate: an MVP per lens first, then the cap by score across lenses, the rest reserve - filed, not discarded; the run report', () => {
  const { path, db, run } = store({ lenses: 'development,security,design' });
  const d = [9, 7, 6, 3].map((impact) => propose(db, fix(run, `dev ${impact}`, { impact, effort: 1, confidence: 'high' })).id);
  const s = propose(db, fix(run, 'sec low', { lens: 'security', metric: 'findingsHigh', impact: 2, effort: 5 })).id;
  propose(db, { run, feature: 'backlog', lens: 'development', title: 'ADO 1', kind: 'work-item', origin: 'ado', externalRef: 'ado:1' });
  activity(db, { run, kind: 'error', lens: 'design', text: 'lens skipped: no harness mapping' });
  const rep = allocate(db, { run, cap: 3, tokens: '{"development": 12000}' });
  const byId = Object.fromEntries(proposals(db).map((p) => [p.id, p]));
  assert.deepEqual([d[0], d[1], d[2], d[3], s].map((id) => [byId[id].band, byId[id].mvp]), [['ranked', 1], ['ranked', 0], ['reserve', 0], ['reserve', 0], ['ranked', 1]],
    'dev MVP + sec MVP + one slot by score; the rest reserve');
  assert.equal(byId[d[0]].mvp_rule, 'top-score');
  assert.deepEqual(rep, {
    run, cap: 3, ranked: 3, reserve: 2,
    lenses: [
      { lens: 'development', ranked: 2, reserve: 2, mvp: { id: d[0], title: 'dev 9', score: 64.1, mvp_rule: 'top-score' }, tokens: 12000 },
      { lens: 'security', ranked: 1, reserve: 0, mvp: { id: s, title: 'sec low', score: 5.2, mvp_rule: 'top-score' } },
    ],
    skipped: [{ lens: 'design', why: 'no harness mapping' }],
  });
  assert.equal(proposals(db).find((p) => p.kind === 'work-item').band, 'ranked', 'a work-item takes no slot and is not touched');
  // an override MVP stands; re-allocating moves the rest around it
  db.prepare("UPDATE proposals SET mvp = 0, mvp_rule = NULL WHERE id = ?").run(d[0]);
  db.prepare("UPDATE proposals SET mvp = 1, mvp_rule = 'override', mvp_why = 'the stop-ship one' WHERE id = ?").run(d[3]);
  allocate(db, { run, cap: 3 });
  const again = Object.fromEntries(proposals(db).map((p) => [p.id, p]));
  assert.deepEqual([again[d[3]].mvp, again[d[3]].mvp_rule, again[d[3]].band, again[d[0]].mvp, again[d[0]].band], [1, 'override', 'ranked', 0, 'ranked']);
  assert.equal(again[d[1]].band, 'reserve');
  assert.throws(() => allocate(db, { run, cap: 0 }), /integer >= 1/);
  assert.throws(() => allocate(db, { run, tokens: '[1]' }), /--tokens is JSON/);
  runEnd(db, { run, status: 'done' });
  assert.throws(() => allocate(db, { run }), /running run/);
  db.close();
  // the read-only report and the mvp verb (Seam B2)
  assert.deepEqual(cli(path, 'run-report', '--run', run).lenses.map((l) => l.lens), ['development', 'security']);
  const m = cli(path, 'mvp', '--run', run);
  assert.deepEqual(m, { mvps: [
    { lens: 'development', proposal_id: d[3], title: 'dev 3', score: 21.4, mvp_rule: 'override', mvp_why: 'the stop-ship one' },
    { lens: 'security', proposal_id: s, title: 'sec low', score: 5.2, mvp_rule: 'top-score' },
  ] });
  assert.deepEqual(cli(path, 'mvp', '--lens', 'security').mvps.map((x) => x.proposal_id), [s]);
  assert.deepEqual(cli(join(mkdtempTracked(join(tmpdir(), 'lens-scan-v5-none-')), 'scan.db'), 'mvp'), { mvps: [] }, 'no store: an empty answer');
});

test('mvp: without --run, each lens\'s latest run that named one', () => {
  const { db, run } = store();
  const old = propose(db, fix(run, 'old', { impact: 5, effort: 1 })).id;
  allocate(db, { run });
  runEnd(db, { run, status: 'done' });
  db.prepare("UPDATE runs SET started_at = '2026-01-01T00:00:00.000Z' WHERE id = ?").run(run);
  const { id: r2 } = runStart(db, { phase: 'propose', lenses: 'development', model: 'm', env: {} });
  const fresh = propose(db, fix(r2, 'new', { impact: 2, effort: 9 })).id;
  allocate(db, { run: r2 });
  assert.deepEqual(mvps(db).mvps.map((m) => m.proposal_id), [fresh]);
  assert.deepEqual(mvps(db, { run }).mvps.map((m) => m.proposal_id), [old]);
  db.close();
});

// ------------------------------------------------------------------------------------------------ precedent
test('precedent: decided items of the feature and lens, newest first, with notes; brief.ts-shaped advice', () => {
  const { path, db, run } = store();
  const a = propose(db, fix(run, 'Extract the parser')).id;
  const b = propose(db, fix(run, 'Cache the AST', { standard: 'perf/memoize' })).id;
  const c = propose(db, fix(run, 'Same standard elsewhere', { feature: 'z', standard: 'perf/memoize' })).id;
  propose(db, fix(run, 'still open'));
  decide(db, { ids: a, decision: 'approve', by: jane, note: 'yes' });
  decide(db, { ids: [b, c], decision: 'decline', by: 'operator:bob', note: 'no caching here' });
  db.prepare('UPDATE proposals SET decided_at = ? WHERE id = ?').run('2026-10-01T00:00:00.000Z', a);
  const p = precedent(db, { feature: 'a', lens: 'development' });
  assert.deepEqual(p.rows.map((r) => r.id), [b, a], 'newest first, open items never');
  assert.deepEqual([p.rows[0].verdict, p.rows[0].note, p.rows[0].by, p.rows[0].match], ['declined', 'no caching here', 'operator:bob', 'same lens']);
  assert.deepEqual([p.approved, p.declined, p.advice.say], [1, 1, 'proceed']);
  const s = precedent(db, { feature: 'a', lens: 'development', standard: 'perf/memoize' });
  assert.ok(s.rows.some((r) => r.id === c && r.match === 'same standard'));
  assert.equal(s.advice.say, 'ask');
  assert.match(s.advice.why, /no caching here/);
  const t = precedent(db, { feature: 'a', lens: 'development', title: 'cache the ast!' });
  assert.equal(t.rows[0].match, 'same idea');
  assert.equal(t.advice.say, 'withdraw');
  assert.equal(precedent(db, { feature: 'a', lens: 'development', limit: 1 }).rows.length, 1);
  assert.throws(() => precedent(db, { feature: 'a', lens: 'development', limit: 99 }), /1-50/);
  assert.ok(noNulls(p));
  db.close();
  assert.equal(cli(path, 'precedent', '--feature', 'a', '--lens', 'development').rows.length, 2);
  const none = cli(join(mkdtempTracked(join(tmpdir(), 'lens-scan-v5-none-')), 'scan.db'), 'precedent', '--feature', 'a', '--lens', 'x');
  assert.deepEqual([none.rows, none.advice.say], [[], 'proceed']);
});

// ------------------------------------------------------------------------------------------------ the autonomy ladder
test('trust: start levels by category and ceilings; slices with history only unless asked; no store is never created', () => {
  const { path, db, run } = store();
  propose(db, predicted(run, 1, { category: 'technical', lens: 'development', riskClass: 'debt', size: 'M' }));
  propose(db, predicted(run, 2, { category: 'technical', lens: 'security', riskClass: 'secret', size: 'S', metric: 'secretHits' }));
  propose(db, predicted(run, 3));
  propose(db, fix(run, 'unpredicted', { category: 'technical' }));
  const t = trust(db);
  assert.deepEqual(t.slices, [
    { slice: 'product|quality|ux|S', level: 0, ceiling: 1, start: 0, n: 0 },
    { slice: 'technical|development|debt|M', level: 2, ceiling: 2, start: 2, n: 0 },
    { slice: 'technical|security|secret|S', level: 1, ceiling: 1, start: 1, n: 0 },
  ]);
  assert.deepEqual(t.events, []);
  assert.deepEqual(trust(db, { slice: 'technical|design|-|-' }).slices, [{ slice: 'technical|design|-|-', level: 2, ceiling: 2, start: 2, n: 0 }], 'asked for: reported without history');
  assert.deepEqual(trust(db, { slice: '-|x|-|-' }).slices[0].level, 0, 'no category starts at L0');
  assert.equal(trust(db, { start: 'technical=1' }).slices.find((s) => s.slice.startsWith('technical|development')).level, 1, 'the overlay lowers a start');
  assert.equal(trust(db, { start: 'product=2' }).slices[0].level, 0, '...and never raises one');
  assert.throws(() => trust(db, { slice: 'technical|x' }), /--slice is/);
  assert.throws(() => trust(db, { start: 'technical=9' }), /--start is/);
  db.close();
  const c = cli(path, 'trust', '--slice', 'product|quality|ux|S');
  assert.deepEqual(Object.keys(c), ['slices', 'events']);
  const missing = join(mkdtempTracked(join(tmpdir(), 'lens-scan-v5-none-')), 'x', 'scan.db');
  assert.deepEqual(cli(missing, 'trust'), { slices: [], events: [] });
  assert.ok(!existsSync(missing), 'trust never creates a store');
});

test('trust: a slice earns a level at >= 90 % agreement over its last 20 human-decided items, to its ceiling; every transition an event', () => {
  const { path, db, run } = store();
  const ids = [];
  for (let i = 0; i < 20; i += 1) ids.push(propose(db, predicted(run, i, { predictedVerdict: i < 2 ? 'reject' : 'accept' })).id);
  // 19 decided: below the minimum window, whatever the agreement
  decide(db, { ids: ids.slice(0, 19), decision: 'approve', by: jane });
  let s = trust(db).slices[0];
  assert.deepEqual([s.level, s.n, s.agreement], [0, 19, 0.895]);
  decide(db, { ids: ids[19], decision: 'approve', by: jane });
  s = trust(db).slices[0];
  assert.deepEqual([s.level, s.n, s.agreement, s.reason], [1, 0, undefined, 'promote: agreement'], 'promoted; the window reset');
  const [e] = trust(db).events;
  assert.deepEqual([e.slice, e.from, e.to, e.agreement, e.n], ['product|quality|ux|S', 0, 1, 0.9, 20]);
  assert.ok(e.at && !('itemId' in e));
  // product's ceiling is L1 in lens-scan: twenty more agreeing decisions do not move it
  const more = [];
  for (let i = 20; i < 40; i += 1) more.push(propose(db, predicted(run, i)).id);
  db.prepare('UPDATE trust_events SET at = ?').run('2026-01-01T00:00:00.000Z');
  decide(db, { ids: more, decision: 'approve', by: jane });
  s = trust(db).slices[0];
  assert.deepEqual([s.level, s.ceiling, s.n, s.agreement], [1, 1, 20, 1]);
  assert.equal(trust(db).events.length, 1);
  db.close();
  assert.equal(cli(path, 'trust').events[0].reason, 'promote: agreement');
});

test('decide --machine: L1 records the predicted verdict with a 24 h veto window; refused at L0, for defer and unpredicted', () => {
  const { path, db, run } = store();
  const prod = propose(db, predicted(run, 1)).id; // product: L0
  const tech = propose(db, predicted(run, 2, { category: 'technical', lens: 'development', riskClass: 'debt' })).id; // L2
  const rej = propose(db, predicted(run, 3, { category: 'technical', lens: 'development', riskClass: 'debt', predictedVerdict: 'reject' })).id;
  const def = propose(db, predicted(run, 4, { category: 'technical', lens: 'development', riskClass: 'debt', predictedVerdict: 'defer' })).id;
  const bare = propose(db, fix(run, 'bare', { category: 'technical' })).id;
  const r = decide(db, { ids: [prod, tech, rej, def, bare, 'p-000000'], machine: true });
  assert.equal(r.by, MACHINE);
  assert.deepEqual(r.decided.map((d) => [d.id, d.status, d.level]), [[tech, 'approved', 2], [rej, 'declined', 2]]);
  assert.ok(Date.parse(r.decided[0].veto_until) - Date.now() > 23.9 * 3600e3);
  assert.deepEqual(r.skipped, [
    { id: prod, status: 'proposed', reason: 'refused: slice product|quality|ux|S is L0' },
    { id: def, status: 'proposed', reason: 'defer: waits for a person' },
    { id: bare, status: 'proposed', reason: 'unpredicted' },
    { id: 'p-000000', status: 'not-found' },
  ]);
  const [p] = proposals(db, { ids: tech });
  assert.deepEqual([p.decided_by, p.status], [MACHINE, 'approved']);
  assert.match(p.decision_note, /^machine L2 \(technical\|development\|debt\|S\): no precedent yet/);
  // a caller can never claim the machine; the machine never takes a decision/by/note
  assert.throws(() => decide(db, { ids: prod, decision: 'approve', by: 'machine:lens-scan' }), /never claimed by a caller/);
  assert.throws(() => decide(db, { ids: prod, machine: true, decision: 'approve' }), /takes no --decision/);
  assert.throws(() => triage(db, { ids: tech, decision: 'accept', by: 'machine:x' }), /never claimed/);
  assert.throws(() => releaseCreate(db, { version: '1.0.0', by: MACHINE }), /never claimed/, 'a release stays a person\'s');
  db.close();
  const c = cli(path, 'decide', '--machine', '--ids', prod);
  assert.equal(c.skipped[0].reason, 'refused: slice product|quality|ux|S is L0');
});

test('reversals demote: the store veto, bp\'s raw veto write, a person deciding a vetoed item, a descope of a machine approval', () => {
  const { path, db, run } = store();
  const tech = (n) => propose(db, predicted(run, n, { category: 'technical', lens: 'development', riskClass: 'debt' })).id;
  const slice = 'technical|development|debt|S';
  const [a, b, c] = [tech(1), tech(2), tech(3)];
  decide(db, { ids: [a, b, c], machine: true });
  // 1. the store's veto, inside the window
  assert.throws(() => veto(db, { id: a, by: MACHINE, reason: 'x' }), /never claimed/);
  const v = veto(db, { id: a, by: jane, reason: 'not now' });
  assert.deepEqual([v.status, v.vetoed], ['proposed', 'approved']);
  let [p] = proposals(db, { ids: a });
  assert.deepEqual([p.status, p.decision_note], ['proposed', 'veto: not now']);
  let t = trust(db, { slice });
  assert.deepEqual([t.slices[0].level, t.events.at(-1).reason, t.events.at(-1).itemId, t.events.at(-1).from, t.events.at(-1).to], [1, `demote: reversal ${a}`, a, 2, 1]);
  assert.throws(() => veto(db, { id: a, by: jane, reason: 'again' }), /not decided by a machine|is proposed/);
  // the machine never decides a vetoed item again; a person deciding it does not demote twice
  assert.equal(decide(db, { ids: a, machine: true }).skipped[0].reason, 'vetoed: a person decides');
  decide(db, { ids: a, decision: 'decline', by: jane });
  assert.equal(trust(db, { slice }).events.length, 1);
  // 2. bp's write (Seam B2): status back to proposed, decision_note veto: - seen on the next trust read
  db.prepare("UPDATE proposals SET status = 'proposed', decision_note = 'veto: wrong call', updated_at = ? WHERE id = ?").run(new Date().toISOString(), b);
  t = trust(db, { slice });
  assert.deepEqual([t.slices[0].level, t.events.at(-1).reason], [0, `demote: reversal ${b}`]);
  // 3. a descope of a machine approval before its build (after the window, the veto's door is triage)
  db.prepare("UPDATE proposals SET veto_until = '2026-01-01T00:00:00.000Z' WHERE id = ?").run(c);
  assert.throws(() => veto(db, { id: c, by: jane, reason: 'late' }), /window closed/);
  triage(db, { ids: c, decision: 'descope', by: jane, note: 'not wanted' });
  t = trust(db, { slice });
  assert.deepEqual([t.slices[0].level, t.events.at(-1).reason, t.events.length], [0, `demote: reversal ${c}`, 3], 'at L0 the event still resets the window');
  // at L0 the machine is refused in that slice
  assert.match(decide(db, { ids: tech(4), machine: true }).skipped[0].reason, /is L0/);
  db.close();
  assert.equal(cli(path, 'trust', '--slice', slice).slices[0].level, 0);
});

/** A built technical item in an L2 slice with its before/after readings, ready for a proof. */
function built(db, run, n, extra = {}) {
  const id = propose(db, predicted(run, n, { category: 'technical', lens: 'development', riskClass: 'debt', metric: 'dupSites', ...extra })).id;
  decide(db, { ids: id, decision: 'approve', by: jane });
  const k = packCreate(db, { lens: extra.lens ?? 'development', short: 'DEV', baseRef: 'main', baseSha: 'b0', run });
  proposalUpdate(db, { id, status: 'executing', pack: k.id });
  measure(db, run, [{ feature: `f${n}`, lens: 'development', metric: extra.metric ?? 'dupSites', value: 6, method: 'static', proposal: id, phase: 'before', commit_sha: 'b0' },
    { feature: `f${n}`, lens: 'development', metric: extra.metric ?? 'dupSites', value: 2, method: 'static', proposal: id, phase: 'after', commit_sha: 'h1' }]);
  proposalUpdate(db, { id, status: 'done', commitSha: 'h1', afterValue: 2 });
  return id;
}
const goodProof = (extra = {}) => ({ metric: 'dupSites', method: 'static', unit: 'sites', before: 6, after: 2, verdict: 'better', control: 'red', control_value: 6, base_sha: 'b0', head_sha: 'h1',
  gates: { 'npm test': 0 }, ...extra });

test('proof: tied to the recorded readings; a red control only where one exists, and it must read worse', () => {
  const { path, db, run } = store();
  const id = built(db, run, 1);
  assert.throws(() => proof(db, { id, proof: goodProof({ method: 'judgement' }) }), /no red control/);
  assert.throws(() => proof(db, { id, proof: goodProof({ method: 'probe' }) }), /no red control/);
  assert.throws(() => proof(db, { id, proof: goodProof({ control_value: undefined }) }), /names control_value/);
  assert.throws(() => proof(db, { id, proof: goodProof({ control_value: 2 }) }), /did not read red/, 'a control that reads the after proves nothing');
  assert.throws(() => proof(db, { id, proof: goodProof({ control_value: 1 }) }), /did not read red/);
  assert.throws(() => proof(db, { id, proof: goodProof({ before: 7 }) }), /recorded before reading/);
  assert.throws(() => proof(db, { id, proof: goodProof({ after: 6, control_value: undefined, control: 'absent' }) }), /did not move/);
  assert.throws(() => proof(db, { id, proof: goodProof({ control: 'absent' }) }), /belongs to a red control/);
  assert.throws(() => proof(db, { id, proof: goodProof({ extra: 1 }) }), /proof keys are/);
  assert.throws(() => proof(db, { id, proof: goodProof({ verdict: 'great' }) }), /better, not-better, inconclusive/);
  const out = proof(db, { id, proof: goodProof() });
  assert.deepEqual(out.proof, goodProof());
  assert.deepEqual(proposals(db, { ids: id })[0].proof, goodProof(), 'stored and printed as an object');
  const unbuilt = propose(db, fix(run, 'not built')).id;
  assert.throws(() => proof(db, { id: unbuilt, proof: goodProof() }), (e) => e.code === 1 && /built item/.test(e.message));
  db.close();
  const f = join(mkdtempTracked(join(tmpdir(), 'lens-scan-v5-proof-')), 'p.json');
  writeFileSync(f, JSON.stringify(goodProof({ verdict: 'inconclusive', control: 'absent', control_value: undefined })));
  assert.equal(cli(path, 'proof', '--id', id, '--json', f).proof.verdict, 'inconclusive');
});

test('triage --machine (L2): accepts a done technical item in an L2 slice only on a better proof with a red control', () => {
  const { db, run } = store();
  const ok = built(db, run, 1);
  proof(db, { id: ok, proof: goodProof() });
  const absent = built(db, run, 2);
  proof(db, { id: absent, proof: goodProof({ control: 'absent', control_value: undefined }) });
  const noProof = built(db, run, 3);
  const secret = built(db, run, 4, { riskClass: 'secret' });
  proof(db, { id: secret, proof: goodProof() });
  const product = built(db, run, 5, { category: 'product' });
  proof(db, { id: product, proof: goodProof() });
  const r = triage(db, { ids: [ok, absent, noProof, secret, product], machine: true });
  assert.deepEqual(r.triaged.map((x) => [x.id, x.level]), [[ok, 2]]);
  assert.deepEqual(r.skipped.map((s) => [s.id, s.reason]), [
    [absent, 'proof better, control absent: a person triages'],
    [noProof, 'no proof'],
    [secret, 'refused: slice technical|development|secret|S is L1'],
    [product, 'category product: a person triages'],
  ]);
  const [p] = proposals(db, { ids: ok });
  assert.deepEqual([p.status, p.triaged_by, p.triaged_from], ['accepted', MACHINE, 'done']);
  assert.ok(p.veto_until && /red control 6/.test(p.triage_note));
  assert.throws(() => triage(db, { ids: ok, machine: true, by: jane }), /takes no --decision, --by or --note/);
  // a person reworking the machine's accept reverses it: the slice drops to L1, and the next one waits
  triage(db, { ids: ok, decision: 'rework', by: jane, note: 'wrong fix' });
  const slice = sliceOf(p);
  assert.equal(trust(db, { slice }).slices[0].level, 1);
  const next = built(db, run, 6);
  proof(db, { id: next, proof: goodProof() });
  assert.match(triage(db, { ids: next, machine: true }).skipped[0].reason, /is L1/);
  db.close();
});

test('proof re-measured not-better on a landed item demotes its slice', () => {
  const { db, run } = store();
  const id = built(db, run, 1);
  proof(db, { id, proof: goodProof() });
  triage(db, { ids: id, decision: 'accept', by: jane });
  const before = trust(db).events.length;
  // a later re-measure of the item's metric at its commit reads worse than the base
  measure(db, run, { feature: 'f1', lens: 'development', metric: 'dupSites', value: 6.5, method: 'static', proposal: id, phase: 'after', commit_sha: 'h1' });
  const out = proof(db, { id, proof: goodProof({ after: 6.5, verdict: 'not-better', control: 'absent', control_value: undefined }) });
  assert.equal(out.demoted, 'technical|development|debt|S');
  const t = trust(db, { slice: out.demoted });
  assert.equal(t.events.length, before + 1);
  assert.deepEqual([t.slices[0].level, t.events.at(-1).reason, t.events.at(-1).itemId], [1, `demote: not-better ${id}`, id]);
  db.close();
});

// ------------------------------------------------------------------------------------------------ --lenses all
test('run-start --lenses all: every enabled lens with a scan method, recorded in full; the rest skipped with why', () => {
  const dir = mkdtempTracked(join(tmpdir(), 'lens-scan-v5-all-'));
  const path = join(dir, 'scan.db');
  const metric = (key) => ({ key, type: 'integer', metric: { better: 'down', method: 'judgement' } });
  writeFileSync(join(dir, 'app-structure.json'), JSON.stringify({
    features: [{ slug: 'a' }],
    lenses: [
      { id: 'development', manifest: { fields: [metric('dupSites')] } },
      { id: 'design', enabled: false, manifest: { fields: [metric('rawLiterals')] } },
      { id: 'business', manifest: { fields: [metric('x')] } },
      { id: 'tmp.drop-moment', manifest: { scan: { method: 'judgement', instructions: 'Count the drops.' }, fields: [metric('drops')] } },
    ],
  }));
  const r = cli(path, 'run-start', '--phase', 'measure', '--lenses', 'all');
  assert.deepEqual(r.lenses, ['development', 'tmp.drop-moment']);
  assert.deepEqual(r.skipped, [{ id: 'business', why: 'no scan method (not a built-in, no scan block)' }]);
  const db = openStore(path);
  assert.deepEqual(JSON.parse(db.prepare('SELECT lenses FROM runs WHERE id = ?').get(r.id).lenses), ['development', 'tmp.drop-moment']);
  assert.throws(() => runStart(db, { phase: 'measure', lenses: 'all,development', knownLenses: { lenses: [], skipped: [] }, env: {} }), /name no other lens/);
  assert.throws(() => runStart(db, { phase: 'measure', lenses: 'all', env: {} }), /reads the app-structure/);
  assert.throws(() => runStart(db, { phase: 'measure', lenses: 'all', knownLenses: { lenses: [], skipped: [{ id: 'x', why: 'none' }] }, env: {} }), /no enabled lens/);
  db.close();
  assert.equal(run$(join(mkdtempTracked(join(tmpdir(), 'lens-scan-v5-nostruct-')), 'scan.db'), 'run-start', '--phase', 'measure', '--lenses', 'all').status, 2);
});

// ------------------------------------------------------------------------------------------------ bp's first self-scan (2026-10-30)
// Shapes copied from bp's store after its first --lens all cover/propose/execute (runs r-..1737, r-..7d95, r-..9286).

test('H-L1 proof: its method is the method its readings were recorded with; a static item reaches L2 on a red control, absent waits', () => {
  const { db, run } = store();
  // a judged before/after (bp: every proof was judgement, control absent) cannot claim a static instrument to earn red
  const judged = built(db, run, 1);
  db.prepare("UPDATE measurements SET method = 'judgement' WHERE proposal_id = ?").run(judged);
  assert.throws(() => proof(db, { id: judged, proof: goodProof() }), /recorded with method judgement/);
  assert.equal(proof(db, { id: judged, proof: goodProof({ method: 'judgement', control: 'absent', control_value: undefined }) }).proof.method, 'judgement');
  // before and after read by different methods are no comparison
  const mixed = built(db, run, 2);
  db.prepare("UPDATE measurements SET method = 'judgement' WHERE proposal_id = ? AND phase = 'after'").run(mixed);
  assert.throws(() => proof(db, { id: mixed, proof: goodProof() }), /before was read by static and its after by judgement/);
  // a static reading with control absent is answered with the control it still owes
  const owed = built(db, run, 3);
  const o = proof(db, { id: owed, proof: goodProof({ control: 'absent', control_value: undefined }) });
  assert.match(o.control_owed, /static reading: re-seed the defect/);
  assert.equal(proof(db, { id: judged, proof: goodProof({ method: 'judgement', control: 'absent', control_value: undefined }) }).control_owed, undefined, 'judgement owes none');
  // reachable: the static item with its red control is machine-accepted; the one with control absent waits
  const red = built(db, run, 4);
  proof(db, { id: red, proof: goodProof() });
  const r = triage(db, { ids: [red, owed], machine: true });
  assert.deepEqual(r.triaged.map((x) => x.id), [red]);
  assert.deepEqual(r.skipped.map((s) => [s.id, s.reason]), [[owed, 'proof better, control absent: a person triages']]);
  db.close();
});

test('H-L2 proof: the gates the item ran and whether its after is stacked are recorded; the machine accepts only gated, isolated proofs', () => {
  const { db, run } = store();
  const id = built(db, run, 1);
  assert.throws(() => proof(db, { id, proof: goodProof({ gates: { 'npm test': 'green' } }) }), /gates is \{"<command>": <exit code>\}/);
  assert.throws(() => proof(db, { id, proof: goodProof({ gates: [] }) }), /gates is \{"<command>": <exit code>\}/);
  assert.throws(() => proof(db, { id, proof: goodProof({ stacked: 'yes' }) }), /stacked is true or false/);
  const ungated = built(db, run, 2);
  proof(db, { id: ungated, proof: goodProof({ gates: undefined }) });
  const none = built(db, run, 3);
  proof(db, { id: none, proof: goodProof({ gates: {} }) });
  const red = built(db, run, 4);
  proof(db, { id: red, proof: goodProof({ gates: { 'npm run typecheck': 0, 'npm run check': 1 } }) });
  const stacked = built(db, run, 5);
  proof(db, { id: stacked, proof: goodProof({ stacked: true }) });
  proof(db, { id, proof: goodProof({ stacked: false }) });
  assert.deepEqual(proposals(db, { ids: stacked })[0].proof.stacked, true, 'stored as given');
  const r = triage(db, { ids: [id, ungated, none, red, stacked], machine: true });
  assert.deepEqual(r.triaged.map((x) => x.id), [id]);
  assert.deepEqual(r.skipped.map((s) => [s.id, s.reason]), [
    [ungated, 'no gates recorded on the proof: a person triages'],
    [none, 'no gates recorded on the proof: a person triages'],
    [red, 'gate npm run check exited 1: a person triages'],
    [stacked, 'after stacked on earlier items of the pack: a person triages'],
  ]);
  db.close();
});

test('H-L3 decide --machine: a reserve item and one above the auto size (default M) wait for a person', () => {
  const { db, run } = store();
  const tech = (n, extra) => propose(db, predicted(run, n, { category: 'technical', lens: 'development', riskClass: 'debt', ...extra })).id;
  const ranked = tech(1);
  const reserve = tech(2, { band: 'reserve', size: 'S' });
  const large = tech(3, { size: 'L' });
  const xl = tech(4, { size: 'XL' });
  const r = decide(db, { ids: [ranked, reserve, large, xl], machine: true });
  assert.deepEqual(r.decided.map((d) => d.id), [ranked]);
  assert.deepEqual(r.skipped.map((s) => [s.id, s.reason]), [
    [reserve, 'band reserve: a person decides'],
    [large, 'size L above the auto size M: a person decides'],
    [xl, 'size XL above the auto size M: a person decides'],
  ]);
  // the overlay's auto_max_size may raise it
  assert.deepEqual(decide(db, { ids: [large, xl], machine: true, maxSize: 'L' }).decided.map((d) => d.id), [large]);
  assert.throws(() => decide(db, { ids: xl, machine: true, maxSize: 'XXL' }), /--max-size is one of XS, S, M, L, XL/);
  db.close();
});

test('H-L4 trust: a person\'s triage of a machine-decided item is a human verdict - accept agrees, rework or descope disagrees (bp: 7 accepts, n was 0)', () => {
  const { db, run } = store({ lenses: 'quality,security,business,development,operations' });
  // bp's execute r-..9286: each item machine-approved (L1), built, then triaged by a person
  const shape = [['quality', 'S', 'accept'], ['security', 'XS', 'accept'], ['business', 'XS', 'accept'], ['development', 'S', 'accept'],
    ['business', 'XS', 'accept'], ['operations', 'S', 'accept'], ['development', 'L', 'accept'], ['quality', 'XS', 'rework']];
  const ids = shape.map(([lens, size], i) => {
    const id = propose(db, predicted(run, i, { category: 'technical', lens, size, riskClass: undefined, metric: 'dupSites' })).id;
    assert.equal(decide(db, { ids: id, machine: true, maxSize: 'L' }).decided.length, 1);
    proposalUpdate(db, { id, status: 'executing' });
    proposalUpdate(db, { id, status: 'done', commitSha: `h${i}` });
    return id;
  });
  shape.forEach(([, , d], i) => triage(db, { ids: ids[i], decision: d, by: 'human:kazdan', note: d === 'rework' ? 'fix the instrument first' : 'calibration' }));
  const t = Object.fromEntries(trust(db).slices.map((s) => [s.slice, [s.n, s.agreement]]));
  assert.deepEqual(t['technical|business|-|XS'], [2, 1]);
  assert.deepEqual(t['technical|development|-|L'], [1, 1]);
  assert.deepEqual(t['technical|quality|-|S'], [1, 1]);
  assert.deepEqual(t['technical|quality|-|XS'], [1, 0], 'a rework of a machine-decided build disagrees');
  assert.equal(Object.values(t).reduce((n, [k]) => n + k, 0), 8, 'every human triage counts once');
  // the release run's own conflict rework (skill:*) is no person's verdict; nor is a machine's own triage
  const auto = propose(db, predicted(run, 9, { category: 'technical', lens: 'security', size: 'XS', riskClass: undefined, metric: 'dupSites' })).id;
  decide(db, { ids: auto, machine: true });
  proposalUpdate(db, { id: auto, status: 'executing' });
  proposalUpdate(db, { id: auto, status: 'done', commitSha: 'h9' });
  triage(db, { ids: auto, decision: 'rework', by: 'skill:lens-scan', note: 'conflict on release/1.0.0' });
  assert.deepEqual(trust(db, { slice: 'technical|security|-|XS' }).slices[0].n, 1);
  // a descope of a machine-decided built item is a disagreement too
  const des = propose(db, predicted(run, 10, { category: 'technical', lens: 'operations', size: 'S', riskClass: undefined, metric: 'dupSites' })).id;
  decide(db, { ids: des, machine: true });
  proposalUpdate(db, { id: des, status: 'executing' });
  proposalUpdate(db, { id: des, status: 'done', commitSha: 'h10' });
  triage(db, { ids: des, decision: 'descope', by: 'human:kazdan' });
  assert.deepEqual(trust(db, { slice: 'technical|operations|-|S' }).slices[0].n, 2);
  assert.deepEqual(trust(db, { slice: 'technical|operations|-|S' }).slices[0].agreement, 0.5);
  db.close();
});

test('H-L5 allocate: with no cap named, the cap scales with the run\'s lenses - max(10, 2 x lenses)', () => {
  const lenses = ['business', 'design', 'development', 'operations', 'performance', 'quality', 'security'];
  const { db, run } = store({ lenses: lenses.join(',') });
  // bp's propose r-..7d95: 11 findings over 7 lenses came back 10 ranked + 1 reserve
  for (let i = 0; i < 16; i += 1) propose(db, fix(run, `f ${i}`, { feature: `f${i}`, lens: lenses[i % 6], impact: 5, confidence: 'medium', size: 'S' }));
  const r = allocate(db, { run });
  assert.equal(r.cap, 14);
  assert.deepEqual([r.ranked, r.reserve], [14, 2]);
  assert.equal(allocate(db, { run, cap: 10 }).ranked, 10, 'the overlay\'s propose_cap, when named, stands');
  db.close();
  const one = store({ lenses: 'development' });
  propose(one.db, fix(one.run, 'x', { impact: 5, size: 'S' }));
  assert.equal(allocate(one.db, { run: one.run }).cap, 10, 'never under the default');
  one.db.close();
});

test('H-L6 proof: a secondary reading credits an instrument repair the primary metric cannot (p-c9c46b: brokenTests 1 -> 1, checks 0 -> 28)', () => {
  const { db, run } = store();
  const id = built(db, run, 1, { metric: 'brokenTests' });
  db.prepare("UPDATE measurements SET value = 1 WHERE proposal_id = ?").run(id);
  db.prepare("UPDATE proposals SET status = 'failed' WHERE id = ?").run(id); // did not move its metric: the commit stays, failed
  const primary = { metric: 'brokenTests', method: 'static', unit: 'tests', before: 1, after: 1, verdict: 'not-better', control: 'absent', base_sha: 'b0', head_sha: 'h1', gates: { 'npm run check': 0 } };
  const sec = { metric: 'checksRun', unit: 'checks', before: 0, after: 28, better: 'up' };
  assert.throws(() => proof(db, { id, proof: { ...primary, secondary: [sec] } }), /record the secondary readings first/, 'a secondary number is a recorded reading too');
  measure(db, run, [{ feature: 'f1', lens: 'development', metric: 'checksRun', value: 0, method: 'static', proposal: id, phase: 'before', commit_sha: 'b0' },
    { feature: 'f1', lens: 'development', metric: 'checksRun', value: 28, method: 'static', proposal: id, phase: 'after', commit_sha: 'h1' }]);
  assert.throws(() => proof(db, { id, proof: { ...primary, secondary: [{ ...sec, after: 27 }] } }), /secondary checksRun after 27 is not the item's recorded after reading \(28\)/);
  assert.throws(() => proof(db, { id, proof: { ...primary, secondary: [{ ...sec, better: 'more' }] } }), /secondary\.better is up or down/);
  assert.throws(() => proof(db, { id, proof: { ...primary, secondary: [{ ...sec, metric: 'brokenTests' }] } }), /secondary names a metric other than the proof's/);
  const out = proof(db, { id, proof: { ...primary, secondary: [sec] } });
  assert.deepEqual(out.proof.secondary, [{ ...sec, verdict: 'better' }], 'the store states the secondary verdict; the primary verdict stands');
  assert.equal(out.proof.verdict, 'not-better');
  // triage: the machine never accepts on a secondary reading; a person accepting the failed item names it in the note
  assert.deepEqual(triage(db, { ids: id, machine: true }).skipped, [{ id, status: 'failed' }]);
  assert.equal(triage(db, { ids: id, decision: 'accept', by: jane }).skipped[0].reason, 'note-required');
  assert.deepEqual(triage(db, { ids: id, decision: 'accept', by: jane, note: 'instrument repaired: checksRun 0 -> 28' }).triaged, [id]);
  db.close();
});

test('H-L7 lessons: a run\'s project lessons live in the store (activity note `lesson:`), never appended to the overlay by the run', () => {
  const { path, db, run } = store();
  activity(db, { run, kind: 'note', text: 'lesson: 2026-10-30 a pack worktree cannot serve the web app; use lens-serve' });
  activity(db, { run, kind: 'note', text: 'p-1: proposed, not approved' });
  runEnd(db, { run, status: 'done' });
  db.close();
  const l = cli(path, 'lessons');
  assert.deepEqual(l.lessons.map((x) => [x.run, x.text]), [[run, '2026-10-30 a pack worktree cannot serve the web app; use lens-serve']]);
  assert.deepEqual(cli(path, 'lessons', '--run', 'r-none').lessons, []);
});

test('StoreError codes: bad input exits 2, a store rule 1', () => {
  const { db, run } = store();
  try { propose(db, fix(run, 'x', { impact: 99 })); } catch (e) { assert.ok(e instanceof StoreError && e.code === 2); }
  db.close();
});
