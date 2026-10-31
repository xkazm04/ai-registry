// node --test skills/lens-scan/tests
// Pins the v4 store (the takeover): where an item came from (origin, external_ref, external_url), how bad its
// problem is (tier, risk_class, ranked_by, ranked_at), the work-item kind an importer writes, the duplicate
// external_ref refusal, rank, update-external, the tier ordering and filters, and the v3 -> v4 rebuild.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import {
  openStore, runStart, propose, proposals, rank, updateExternal, decide, triage, reworkAttempt, packCreate, proposalUpdate, StoreError,
} from '../scripts/store.mjs';
import { legacyDdl } from './legacy-ddl.mjs';

const madeDirs = [];
const mkdtempTracked = (prefix) => { const d = mkdtempSync(prefix); madeDirs.push(d); return d; };
after(() => { for (const d of madeDirs) rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });

const SCRIPT = fileURLToPath(new URL('../scripts/store.mjs', import.meta.url));
const tmpDb = () => join(mkdtempTracked(join(tmpdir(), 'lens-scan-v4-')), 'nested', 'scan.db');
const cli = (db, ...args) => JSON.parse(execFileSync(process.execPath, [SCRIPT, '--db', db, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
const run$ = (db, ...args) => spawnSync(process.execPath, [SCRIPT, '--db', db, ...args], { encoding: 'utf8' });
const noNulls = (v) => !JSON.stringify(v).includes('null');
const shape = (x) => ['runs', 'measurements', 'proposals', 'activity', 'shots', 'coverage', 'packs', 'releases']
  .map((t) => x.prepare(`PRAGMA table_info(${t})`).all().map((c) => `${t}.${c.name}:${c.type}:${c.notnull}:${c.dflt_value}`).join(','));
const indexes = (x) => x.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'proposals' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map((r) => r.name);
const V4_COLS = ['origin', 'external_ref', 'external_url', 'tier', 'risk_class', 'ranked_by', 'ranked_at'];
// v5 (store-v5.test.mjs pins them): a v3 row reaches the current version, so its new columns are v4's and v5's
const V5_COLS = ['impact', 'impact_why', 'confidence', 'effort', 'score', 'score_parts', 'band', 'mvp', 'mvp_rule', 'mvp_why', 'category',
  'predicted_verdict', 'predicted_why', 'predicted_by', 'predicted_at', 'veto_until', 'proof'];
const CURRENT = 5;
const fix = (run, title, extra = {}) => ({ run, feature: 'a', lens: 'security', title, kind: 'fix', metric: 'findingsHigh', expectedDelta: -1, ...extra });
const item = (run, n, extra = {}) => ({ run, feature: 'backlog', lens: 'quality', title: `ADO ${n}`, kind: 'work-item', origin: 'ado', externalRef: `ado:${n}`, ...extra });

function store() {
  const path = tmpDb();
  const db = openStore(path);
  const { id: run } = runStart(db, { phase: 'propose', lenses: 'security', env: {} });
  return { path, db, run };
}

test('fresh: a new file carries the seven v4 columns right after triaged_from, the two v4 indexes', () => {
  const { db } = store();
  assert.equal(db.prepare('PRAGMA user_version').get().user_version, CURRENT);
  const cols = db.prepare('PRAGMA table_info(proposals)').all().map((c) => c.name);
  const at = cols.indexOf('triaged_from');
  assert.deepEqual(cols.slice(at, at + 8), ['triaged_from', ...V4_COLS], 'the v4 columns follow triaged_from, in contract order');
  assert.deepEqual(cols.slice(at + 8), V5_COLS, 'and only the v5 columns after them');
  assert.ok(['proposals_external_ref', 'proposals_tier'].every((i) => indexes(db).includes(i)));
  db.close();
});

test('migration: a v3 file becomes v4 in place - every row and id kept, origin scan, the rest omitted; one shape with a fresh file', () => {
  const path = tmpDb();
  mkdirSync(dirname(path), { recursive: true });
  const v3 = new DatabaseSync(path);
  v3.exec(legacyDdl(3));
  assert.equal(v3.prepare('PRAGMA user_version').get().user_version, 3);
  assert.ok(!v3.prepare('PRAGMA table_info(proposals)').all().some((c) => c.name === 'origin'), 'the fixture is v3');
  const at = '2026-09-01T00:00:00.000Z';
  v3.prepare(`INSERT INTO runs (id, started_at, updated_at, phase, status, lenses) VALUES ('r-1', ?, ?, 'execute', 'done', '["design"]')`).run(at, at);
  v3.prepare(`INSERT INTO packs (id, lens, n, branch, base_ref, base_sha, status, created_at, updated_at) VALUES ('k-des-1', 'design', 1, 'pack/des-1', 'main', 'b0', 'open', ?, ?)`).run(at, at);
  v3.prepare(`INSERT INTO proposals (id, run_id, feature, lens, title, standard, kind, status, decided_by, created_at, updated_at)
    VALUES ('p-aaaaaa', 'r-1', 'a', 'design', 'Upgrade', 'house:ui/t', 'baseline-upgrade', 'approved', 'operator:jane', ?, ?)`).run(at, at);
  v3.prepare(`INSERT INTO proposals (id, run_id, feature, lens, title, kind, parent_id, status, pack_id, commit_sha, triaged_by, triaged_from, risk, created_at, updated_at)
    VALUES ('p-bbbbbb', 'r-1', 'b', 'design', 'Child', 'propagation', 'p-aaaaaa', 'accepted', 'k-des-1', 'c1', 'operator:jane', 'done', 4, ?, ?)`).run(at, at);
  assert.throws(() => v3.prepare(`INSERT INTO proposals (id, run_id, feature, lens, title, kind, status, created_at, updated_at)
    VALUES ('p-cccccc', 'r-1', 'a', 'x', 't', 'work-item', 'proposed', ?, ?)`).run(at, at), /CHECK/, 'v3 refuses work-item');
  const before = v3.prepare('SELECT * FROM proposals ORDER BY id').all().map((r) => ({ ...r }));
  v3.close();

  const ro = openStore(path, { readOnly: true });
  assert.equal(ro.prepare('PRAGMA user_version').get().user_version, CURRENT, 'a reader never meets v3');
  ro.close();
  const db = openStore(path);
  const afterRows = db.prepare('SELECT * FROM proposals ORDER BY id').all();
  assert.deepEqual(afterRows.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => !V4_COLS.includes(k) && !V5_COLS.includes(k)))), before, 'every v3 column of every row is copied');
  assert.ok(afterRows.every((r) => r.origin === 'scan' && V4_COLS.slice(1).every((k) => r[k] === null)), 'origin defaults to scan, the rest NULL');
  const listed = proposals(db);
  assert.deepEqual(listed.map((p) => p.id), ['p-aaaaaa', 'p-bbbbbb']);
  assert.ok(listed.every((p) => !('tier' in p) && !('external_ref' in p)) && noNulls(listed), 'untriaged keys are omitted');
  assert.equal(listed[1].risk, 4, 'risk (the change) is untouched');
  const fresh = openStore(tmpDb());
  assert.deepEqual(shape(db), shape(fresh), 'a migrated v3 file and a fresh one have one shape');
  assert.deepEqual(indexes(db), indexes(fresh));
  fresh.close();
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all().map((r) => r.name);
  assert.ok(!tables.includes('proposals_v3'), 'nothing left behind');
  assert.equal(db.prepare('PRAGMA foreign_key_check').all().length, 0, 'the self references still resolve');
  // the widened CHECK takes a work-item; the old rows still triage
  const { id: run } = runStart(db, { phase: 'propose', lenses: 'quality', env: {} });
  assert.match(propose(db, item(run, 1)).id, /^p-/);
  assert.deepEqual(triage(db, { ids: 'p-bbbbbb', decision: 'reopen', by: 'operator:jane' }).triaged, ['p-bbbbbb']);
  db.close();
  const again = openStore(path);
  assert.equal(again.prepare('PRAGMA user_version').get().user_version, CURRENT, 'a second open is a no-op');
  assert.equal(proposals(again).length, 3);
  again.close();
});

test('migration: a v2 file reaches v4 through the chain, one shape with a fresh file', () => {
  const path = tmpDb();
  mkdirSync(dirname(path), { recursive: true });
  const v2 = new DatabaseSync(path);
  v2.exec(legacyDdl(2));
  assert.ok(!v2.prepare('PRAGMA table_info(proposals)').all().some((c) => c.name === 'triaged_from'), 'the fixture is v2');
  const at = '2026-08-01T00:00:00.000Z';
  v2.prepare(`INSERT INTO runs (id, started_at, updated_at, phase, status, lenses) VALUES ('r-1', ?, ?, 'propose', 'done', '["design"]')`).run(at, at);
  v2.prepare(`INSERT INTO proposals (id, run_id, feature, lens, title, kind, metric, expected_delta, status, created_at, updated_at)
    VALUES ('p-dddddd', 'r-1', 'a', 'design', 'Old', 'fix', 'rawLiterals', -2, 'proposed', ?, ?)`).run(at, at);
  v2.close();
  const db = openStore(path);
  assert.equal(db.prepare('PRAGMA user_version').get().user_version, CURRENT);
  const [p] = proposals(db);
  assert.deepEqual([p.id, p.title, p.expected_delta, p.origin], ['p-dddddd', 'Old', -2, 'scan']);
  const fresh = openStore(tmpDb());
  assert.deepEqual(shape(db), shape(fresh));
  assert.deepEqual(indexes(db), indexes(fresh));
  fresh.close(); db.close();
});

test('work-item: no metric or delta, an origin other than scan, an external-ref with the origin prefix; the tier and class checked', () => {
  const { db, run } = store();
  const { id } = propose(db, item(run, 1234, { externalUrl: 'https://dev.azure.com/o/p/_workitems/edit/1234', tier: '1', riskClass: 'reliability' }));
  const [p] = proposals(db, { ids: id });
  assert.deepEqual([p.kind, p.origin, p.external_ref, p.external_url, p.tier, p.risk_class], ['work-item', 'ado', 'ado:1234', 'https://dev.azure.com/o/p/_workitems/edit/1234', 1, 'reliability']);
  assert.ok(!('metric' in p) && !('expected_delta' in p) && !('ranked_by' in p) && noNulls(p));
  assert.throws(() => propose(db, item(run, 2, { origin: undefined })), /work-item is imported/, 'origin scan (the default) is refused');
  assert.throws(() => propose(db, item(run, 2, { origin: 'scan', externalRef: 'scan:2' })), /work-item is imported/);
  assert.throws(() => propose(db, item(run, 2, { externalRef: undefined })), /work-item is imported/, 'no external-ref is refused');
  assert.throws(() => propose(db, item(run, 2, { externalRef: '2' })), /<origin>:<id>/);
  assert.throws(() => propose(db, item(run, 2, { externalRef: 'sweep:2' })), /ado:<id>/, 'the prefix is the origin');
  assert.throws(() => propose(db, item(run, 2, { externalRef: 'ado:' })), /<origin>:<id>/);
  assert.throws(() => propose(db, item(run, 2, { origin: 'jira', externalRef: 'jira:2' })), /must be one of scan, ado, sweep/);
  assert.throws(() => propose(db, item(run, 2, { tier: 4 })), /integer 0-3/);
  assert.throws(() => propose(db, item(run, 2, { tier: '1.5' })), /integer 0-3/);
  assert.throws(() => propose(db, item(run, 2, { riskClass: 'security' })), /must be one of secret, authz/);
  assert.throws(() => propose(db, fix(run, 'no metric', { metric: undefined })), /metric it moves/, 'a fix still needs its metric');
  // a scan-origin fix may carry a tier from the triage rubric
  const { id: f } = propose(db, fix(run, 'Rotate the leaked key', { tier: 0, riskClass: 'secret' }));
  assert.deepEqual([proposals(db, { ids: f })[0].tier, proposals(db, { ids: f })[0].origin], [0, 'scan']);
  db.close();
});

test('duplicate external_ref: refused (exit 1) with {refused, existing} on stdout; nothing written', () => {
  const { path, db, run } = store();
  const { id } = propose(db, item(run, 77));
  let err;
  try { propose(db, item(run, 77, { title: 'again' })); } catch (e) { err = e; }
  assert.ok(err instanceof StoreError && err.code === 1, 'a store rule refusal');
  assert.equal(err.detail.existing, id);
  assert.match(err.detail.refused, /ado:77/);
  assert.equal(proposals(db).length, 1);
  db.close();
  const r = run$(path, 'propose', '--run', run, '--feature', 'backlog', '--lens', 'quality', '--title', 'dup', '--kind', 'work-item', '--origin', 'ado', '--external-ref', 'ado:77');
  assert.equal(r.status, 1);
  assert.deepEqual(JSON.parse(r.stdout), { refused: 'duplicate external_ref ado:77', existing: id });
  assert.match(r.stderr, /already proposal/);
  const ok = cli(path, 'propose', '--run', run, '--feature', 'backlog', '--lens', 'quality', '--title', 'new', '--kind', 'work-item', '--origin', 'sweep', '--external-ref', 'sweep:77', '--tier', '2');
  assert.match(ok.id, /^p-/, 'a different ref (here another origin) is a new item');
});

test('rank: tier, class, by and at at any status, the note only when given; risk untouched; refusals', () => {
  const { path, db, run } = store();
  const { id } = propose(db, fix(run, 'Scope the tenant query', { risk: 6 }));
  decide(db, { ids: id, decision: 'decline', by: 'operator:jane', note: 'later' });
  const r = rank(db, { id, tier: '0', riskClass: 'authz', by: 'agent:takeover' });
  assert.deepEqual(r, { id, tier: 0, risk_class: 'authz' });
  let [p] = proposals(db, { ids: id });
  assert.deepEqual([p.status, p.tier, p.risk_class, p.ranked_by, p.risk], ['declined', 0, 'authz', 'agent:takeover', 6]);
  assert.ok(p.ranked_at && !('triage_note' in p), 'no note, no triage_note');
  rank(db, { id, tier: 1, riskClass: 'data', note: 'IDOR only behind the admin flag' });
  [p] = proposals(db, { ids: id });
  assert.deepEqual([p.tier, p.risk_class, p.triage_note, 'ranked_by' in p], [1, 'data', 'IDOR only behind the admin flag', false]);
  assert.throws(() => rank(db, { id, riskClass: 'data' }), /--tier is required/);
  assert.throws(() => rank(db, { id, tier: 1 }), /--risk-class is required/);
  assert.throws(() => rank(db, { id, tier: 9, riskClass: 'data' }), /integer 0-3/);
  assert.throws(() => rank(db, { id, tier: 1, riskClass: 'data', by: 'jane' }), /kind>:<name>/);
  assert.throws(() => rank(db, { id: 'p-000000', tier: 1, riskClass: 'data' }), (e) => e.code === 1 && /does not exist/.test(e.message));
  db.close();
  assert.deepEqual(cli(path, 'rank', '--id', id, '--tier', '2', '--risk-class', 'perf', '--by', 'operator:jane'), { id, tier: 2, risk_class: 'perf' });
  assert.equal(run$(path, 'rank', '--id', id, '--tier', '2', '--risk-class', 'speed').status, 2);
});

test('update-external: refreshes an imported item; refused for a scan item; nothing to update is bad input', () => {
  const { path, db, run } = store();
  const { id } = propose(db, item(run, 5, { body: 'old body' }));
  const { id: own } = propose(db, fix(run, 'own'));
  const before = proposals(db, { ids: id })[0];
  const out = updateExternal(db, { id, title: 'ADO 5 renamed', body: 'new body', externalUrl: 'https://x/_workitems/edit/5' });
  assert.deepEqual([out.title, out.body, out.external_url, out.external_ref, out.status], ['ADO 5 renamed', 'new body', 'https://x/_workitems/edit/5', 'ado:5', 'proposed']);
  assert.ok(out.updated_at >= before.updated_at);
  assert.equal(updateExternal(db, { id, title: 'only the title' }).body, 'new body', 'absent fields keep their value');
  assert.throws(() => updateExternal(db, { id: own, title: 'x' }), (e) => e.code === 1 && /origin scan/.test(e.message));
  assert.throws(() => updateExternal(db, { id }), /nothing to update/);
  assert.throws(() => updateExternal(db, { id: 'p-000000', title: 'x' }), /does not exist/);
  db.close();
  const bodyFile = join(mkdtempTracked(join(tmpdir(), 'lens-scan-v4-body-')), 'b.md');
  writeFileSync(bodyFile, 'from the file');
  assert.equal(cli(path, 'update-external', '--id', id, '--body-file', bodyFile).body, 'from the file');
  assert.equal(run$(path, 'update-external', '--id', own, '--title', 'x').status, 1);
});

test('proposals: ordered by tier with untriaged last, then created_at, id; --origin, --tier, --untriaged filters', () => {
  const { path, db, run } = store();
  const ids = {};
  ids.untriagedOld = propose(db, fix(run, 'u1')).id;
  ids.t3 = propose(db, fix(run, 't3', { tier: 3, riskClass: 'ux' })).id;
  ids.ado2 = propose(db, item(run, 2, { tier: 2 })).id;
  ids.untriagedNew = propose(db, item(run, 9)).id;
  ids.t0 = propose(db, fix(run, 't0', { tier: 0, riskClass: 'money' })).id;
  ids.sweep0 = propose(db, item(run, 3, { origin: 'sweep', externalRef: 'sweep:3', tier: 0 })).id;
  // created_at ties at ms resolution are broken by id; make the order unambiguous
  const stamp = db.prepare('UPDATE proposals SET created_at = ? WHERE id = ?');
  Object.values(ids).forEach((id, i) => stamp.run(`2026-10-0${i + 1}T00:00:00.000Z`, id));
  assert.deepEqual(proposals(db).map((p) => p.id), [ids.t0, ids.sweep0, ids.ado2, ids.t3, ids.untriagedOld, ids.untriagedNew], 'tier ASC, NULL last');
  assert.deepEqual(proposals(db, { origin: 'ado' }).map((p) => p.id), [ids.ado2, ids.untriagedNew]);
  assert.deepEqual(proposals(db, { origin: 'scan' }).map((p) => p.id), [ids.t0, ids.t3, ids.untriagedOld]);
  assert.deepEqual(proposals(db, { tier: '0' }).map((p) => p.id), [ids.t0, ids.sweep0]);
  assert.deepEqual(proposals(db, { untriaged: true }).map((p) => p.id), [ids.untriagedOld, ids.untriagedNew]);
  assert.deepEqual(proposals(db, { untriaged: true, origin: 'ado' }).map((p) => p.id), [ids.untriagedNew]);
  assert.deepEqual(proposals(db, { ids: [ids.untriagedNew, ids.t0] }).map((p) => p.id), [ids.untriagedNew, ids.t0], '--ids keeps the order asked');
  assert.throws(() => proposals(db, { tier: 1, untriaged: true }), /pass one/);
  assert.throws(() => proposals(db, { tier: 5 }), /integer 0-3/);
  assert.throws(() => proposals(db, { origin: 'jira' }), /must be one of/);
  db.close();
  assert.deepEqual(cli(path, 'proposals', '--untriaged').map((p) => p.id), [ids.untriagedOld, ids.untriagedNew]);
  assert.deepEqual(cli(path, 'proposals', '--tier', '0', '--origin', 'sweep').map((p) => p.id), [ids.sweep0]);
  assert.equal(run$(path, 'proposals', '--tier', '0', '--untriaged').status, 2);
});

test('rework-attempt: the rebuild keeps origin, link and severity, never the external_ref', () => {
  const path = tmpDb();
  const db = openStore(path);
  const { id: run } = runStart(db, { phase: 'execute', lenses: 'quality', env: {} });
  const { id } = propose(db, item(run, 11, { externalUrl: 'https://x/11', tier: 1, riskClass: 'reliability' }));
  decide(db, { ids: id, decision: 'approve', by: 'operator:jane' });
  const k = packCreate(db, { lens: 'quality', short: 'QUA', baseRef: 'main', baseSha: 'b0', run });
  proposalUpdate(db, { id, status: 'executing', pack: k.id });
  proposalUpdate(db, { id, status: 'done', commitSha: 'c1' });
  triage(db, { ids: id, decision: 'rework', by: 'operator:jane', note: 'again' });
  const { id: next } = reworkAttempt(db, { id, run });
  const [p] = proposals(db, { ids: next });
  assert.deepEqual([p.origin, p.external_url, p.tier, p.risk_class, 'external_ref' in p], ['ado', 'https://x/11', 1, 'reliability', false]);
  db.close();
});
