// node --test skills/lens-scan/tests
// Pins the store rules scripts/store.mjs owns alone: the DDL applies once, ids have their shapes,
// absent values never print as null, latest wins per key, and the skill can never decide a proposal; and (v3)
// triage's undo, `reopen`, with its refusals and the v2 -> v3 migration.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import {
  openStore, runStart, runEnd, activity, measure, propose, proposals, proposalUpdate, shot, coverage, latest, parseArgs,
  decide, triage, packCreate, packs, releaseCreate, releaseAdd, releaseUpdate, reworkAttempt, DDL_PATH,
} from '../scripts/store.mjs';

// Every temp dir this file makes is removed when its tests are done: on 2026-10-15 these
// suites had left hundreds in the OS temp dir (hygiene disk lane, temp-leak rows).
const madeDirs = [];
const mkdtempTracked = (prefix) => { const d = mkdtempSync(prefix); madeDirs.push(d); return d; };
after(() => { for (const d of madeDirs) rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });

const SCRIPT = fileURLToPath(new URL('../scripts/store.mjs', import.meta.url));
const tmpDb = () => join(mkdtempTracked(join(tmpdir(), 'lens-scan-store-')), 'nested', 'scan.db');
const noNulls = (v) => JSON.stringify(v).includes('null') === false;
const cli = (db, ...args) => JSON.parse(execFileSync(process.execPath, [SCRIPT, '--db', db, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));

test('round trip: init, run, measure, propose, update, latest - and no nulls in any output', () => {
  const path = tmpDb();
  const db = openStore(path);
  assert.equal(db.prepare('PRAGMA user_version').get().user_version, 3);
  const { id: run } = runStart(db, { phase: 'measure', lenses: 'development,security', scope: '{"feature":["a"]}' });
  assert.match(run, /^r-\d{14}-[0-9a-f]{4}$/);

  measure(db, run, { feature: 'a', lens: 'development', metric: 'loc', value: '120', unit: 'lines', method: 'static', evidence: 'x' });
  measure(db, run, [{ feature: 'a', lens: 'development', metric: 'loc', value: 90 }, { feature: 'b', lens: 'security', metric: 'findingsHigh', value: 2 }]);
  const rows = latest(db);
  assert.equal(rows.length, 2);
  assert.equal(rows.find((r) => r.feature === 'a').value, 90, 'the newer measurement wins');
  assert.ok(noNulls(rows));

  activity(db, { run, kind: 'reading', feature: 'a', text: 'reading a' });
  const { id: pid } = propose(db, { run, feature: 'a', lens: 'development', title: 'Split the editor', kind: 'fix', metric: 'loc', expectedDelta: '-30', size: 'S', risk: '3', standard: 'house:ui/table-pattern' });
  assert.match(pid, /^p-[0-9a-f]{6}$/);
  const listed = proposals(db, { status: 'proposed' });
  assert.equal(listed.length, 1);
  assert.equal(listed[0].expected_delta, -30);
  assert.ok(noNulls(listed), 'unset columns are omitted');
  assert.equal('after_value' in listed[0], false);

  // the review UI decides; the skill then executes
  db.prepare("UPDATE proposals SET status = 'approved', decided_by = 'review-ui' WHERE id = ?").run(pid);
  proposalUpdate(db, { id: pid, status: 'executing' });
  const done = proposalUpdate(db, { id: pid, status: 'done', afterValue: '61', resultSha: 'abc1234' });
  assert.equal(done.status, 'done');
  assert.equal(done.after_value, 61);

  shot(db, { run, feature: 'a', path: 'shots/a/r-1-desktop-dark.png', size: 'desktop', theme: 'dark', report: { errors: 0 } });
  const c1 = coverage(db, { run, feature: 'a', standard: 'ui/state-coverage', state: 'deviation', evidence: 'src/a.tsx:10' });
  const c2 = coverage(db, { run, feature: 'a', standard: 'ui/state-coverage', state: 'conformant' });
  assert.equal(c1.state, 'deviation');
  assert.equal(c2.state, 'conformant', 'coverage upserts per (feature, standard)');
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM coverage').get().n, 1);
  assert.equal('evidence' in c2, false);

  const ended = runEnd(db, { run, status: 'done' });
  assert.equal(ended.status, 'done');
  assert.deepEqual(ended.lenses, ['development', 'security']);
  assert.ok(ended.ended_at && ended.updated_at >= ended.started_at);
  assert.ok(noNulls(ended));
  db.close();

  // reopening an existing store does not re-apply the DDL or lose rows
  const again = openStore(path);
  assert.equal(latest(again).length, 2);
  again.close();
});

test('refusals: no placeholder values, no writes into an ended run, no self-approval', () => {
  const db = openStore(tmpDb());
  const { id: run } = runStart(db, { phase: 'propose', lenses: ['design'] });
  assert.throws(() => measure(db, run, { feature: 'a', lens: 'design', metric: 'axeViolations', value: '' }), /finite number/);
  assert.throws(() => measure(db, run, { feature: 'a', lens: 'design', metric: 'axeViolations', value: 'NaN' }), /finite number/);
  assert.throws(() => measure(db, run, { feature: 'a', lens: 'design', metric: 'Axe-Violations', value: 1 }), /camelCase/);
  assert.throws(() => propose(db, { run, feature: 'a', lens: 'design', title: 't', kind: 'fix' }), /metric it moves/);
  assert.throws(() => propose(db, { run, feature: 'a', lens: 'design', title: 't', kind: 'fix', metric: 'rawLiterals', expectedDelta: -3, standard: 'whatever' }), /standard must be/);
  assert.throws(() => propose(db, { run, feature: 'a', lens: 'design', title: 't', kind: 'propagation' }), /baseline-upgrade/);
  const { id: up } = propose(db, { run, feature: 'a', lens: 'design', title: 'Adopt the shared table', kind: 'baseline-upgrade', standard: 'house:ui/tables' });
  const { id: child } = propose(db, { run, feature: 'b', lens: 'design', title: 'Table on b', kind: 'propagation', parent: up, metric: 'rawLiterals', expectedDelta: -4 });
  assert.equal(proposals(db, { kind: 'propagation' })[0].parent_id, up);
  assert.throws(() => proposalUpdate(db, { id: child, status: 'approved' }), /human decision/);
  assert.throws(() => proposalUpdate(db, { id: child, status: 'declined' }), /human decision/);
  assert.throws(() => proposalUpdate(db, { id: child, status: 'executing' }), /cannot move/);
  assert.throws(() => shot(db, { run, feature: 'a', path: '../outside.png' }), /stays inside/);
  runEnd(db, { run, status: 'aborted' });
  assert.throws(() => activity(db, { run, kind: 'note', text: 'late' }), /running run/);
  db.close();
});

test('cli: JSON on stdout, bulk --json, exit 2 on bad input', () => {
  const db = tmpDb();
  assert.equal(cli(db, 'init').user_version, 3);
  const { id: run } = cli(db, 'run-start', '--phase', 'measure', '--lenses', 'development');
  const bulk = join(mkdtempTracked(join(tmpdir(), 'lens-scan-bulk-')), 'm.json');
  writeFileSync(bulk, JSON.stringify([{ feature: 'a', lens: 'development', metric: 'files', value: 3 }, { feature: 'a', lens: 'development', metric: 'loc', value: -0 }]));
  assert.equal(cli(db, 'measure', '--run', run, '--json', bulk).ids.length, 2);
  const neg = cli(db, 'propose', '--run', run, '--feature', 'a', '--lens', 'development', '--title', 'T', '--kind', 'fix', '--metric', 'loc', '--expected-delta', '-5');
  assert.match(neg.id, /^p-/);
  assert.equal(cli(db, 'proposals', '--status', 'proposed')[0].expected_delta, -5);
  assert.equal(cli(db, 'latest').length, 2);
  const r = spawnSync(process.execPath, [SCRIPT, '--db', db, 'measure', '--run', run, '--feature', 'a', '--lens', 'development', '--metric', 'loc', '--value', 'n/a'], { encoding: 'utf8' });
  assert.equal(r.status, 2);
  assert.equal(r.stdout, '');
});

test('parseArgs keeps negative numbers as values', () => {
  assert.deepEqual(parseArgs(['propose', '--expected-delta', '-3', '--dry']), { _: ['propose'], expectedDelta: '-3', dry: true });
});

test('run-start: BP_JOB_ID becomes the run note, a passed note is kept after it', () => {
  const db = openStore(tmpDb());
  const note = (o) => db.prepare('SELECT note FROM runs WHERE id = ?').get(runStart(db, { phase: 'measure', lenses: 'development', ...o }).id).note;
  assert.equal(note({ env: { BP_JOB_ID: 'j-1' } }), 'bp-job:j-1');
  assert.equal(note({ env: { BP_JOB_ID: 'j-2' }, note: 'rescan' }), 'bp-job:j-2 · rescan');
  assert.equal(note({ env: {}, note: 'by hand' }), 'by hand');
  assert.equal(note({ env: { BP_JOB_ID: '  ' } }), null, 'a blank job id is no job');
  const { id: failing } = runStart(db, { phase: 'measure', lenses: 'tmp.x', env: { BP_JOB_ID: 'j-3' } });
  assert.equal(runEnd(db, { run: failing, status: 'failed', note: 'no app-structure' }).note, 'bp-job:j-3 · no app-structure', 'a closing note keeps the job prefix');
  db.close();
  const path = tmpDb();
  const { id } = JSON.parse(execFileSync(process.execPath, [SCRIPT, '--db', path, 'run-start', '--phase', 'measure', '--lenses', 'tmp.x'], { encoding: 'utf8', env: { ...process.env, BP_JOB_ID: 'j-cli' } }));
  const back = openStore(path);
  assert.equal(back.prepare('SELECT note FROM runs WHERE id = ?').get(id).note, 'bp-job:j-cli', 'the CLI reads the environment');
  back.close();
});

test('run-start: a feature-list scope is recorded as {features} and checked against the structure first', () => {
  const db = openStore(tmpDb());
  const known = new Set(['a', 'b', 'c']);
  const { id } = runStart(db, { phase: 'measure', lenses: 'tmp.x', features: 'a, b,a', knownFeatures: known, env: {} });
  assert.deepEqual(JSON.parse(db.prepare('SELECT scope FROM runs WHERE id = ?').get(id).scope), { features: ['a', 'b'] });
  assert.throws(() => runStart(db, { phase: 'measure', lenses: 'tmp.x', features: 'a,zzz', knownFeatures: known }), /unknown feature slug\(s\) in scope: zzz/);
  assert.throws(() => runStart(db, { phase: 'measure', lenses: 'tmp.x', scope: '{"features":["nope"]}', knownFeatures: () => known }), /nope/, 'a JSON scope naming features is checked too');
  assert.throws(() => runStart(db, { phase: 'measure', lenses: 'tmp.x', features: 'a' }), /there is none/, 'no structure, no feature scope');
  assert.throws(() => runStart(db, { phase: 'measure', lenses: 'tmp.x', features: 'a', scope: '{}', knownFeatures: known }), /one of them/);
  let read = 0;
  runStart(db, { phase: 'measure', lenses: 'tmp.x', scope: '{"capability":"billing"}', knownFeatures: () => { read += 1; return known; } });
  assert.equal(read, 0, 'a scope that names no features never reads the structure');
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM runs').get().n, 2, 'a refused scope writes no run');
  db.close();

  // cli: --features, checked against app-structure.json beside the db; exit 2 and no row on an unknown slug
  const path = tmpDb();
  openStore(path).close();
  writeFileSync(join(path, '..', 'app-structure.json'), JSON.stringify({ features: [{ slug: 'a' }, { slug: 'b' }] }));
  assert.match(cli(path, 'run-start', '--phase', 'measure', '--lenses', 'tmp.x', '--features', 'a,b').id, /^r-/);
  const r = spawnSync(process.execPath, [SCRIPT, '--db', path, 'run-start', '--phase', 'measure', '--lenses', 'tmp.x', '--features', 'a,gone'], { encoding: 'utf8' });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /gone/);
  const back = openStore(path);
  assert.deepEqual(back.prepare('SELECT scope FROM runs').all().map((x) => JSON.parse(x.scope)), [{ features: ['a', 'b'] }]);
  back.close();
});

test('proposals --ids: only those ids, in the order asked; an unknown id is simply absent', () => {
  const path = tmpDb();
  const db = openStore(path);
  const { id: run } = runStart(db, { phase: 'propose', lenses: 'development', env: {} });
  const mk = (t) => propose(db, { run, feature: 'a', lens: 'development', title: t, kind: 'fix', metric: 'loc', expectedDelta: -1 }).id;
  const [p1, p2, p3] = [mk('one'), mk('two'), mk('three')];
  db.prepare("UPDATE proposals SET status = 'approved' WHERE id IN (?, ?)").run(p1, p3);
  assert.deepEqual(proposals(db, { ids: `${p3},${p1},p-000000` }).map((p) => p.id), [p3, p1]);
  assert.deepEqual(proposals(db, { ids: [p2, p3], status: 'approved' }).map((p) => p.id), [p3], 'filters combine');
  assert.throws(() => proposals(db, { ids: ' , ' }), /at least one/);
  assert.deepEqual(cli(path, 'proposals', '--ids', p2).map((p) => p.title), ['two']);
  db.close();
});

// ------------------------------------------------------------------------------------- v3: reopen (the undo)
/** One running execute run, `n` approved design items, the first `built` of them built into pack k-des-1 (done). */
function train(n, built = n) {
  const path = tmpDb();
  const db = openStore(path);
  const { id: run } = runStart(db, { phase: 'execute', lenses: 'design', env: {} });
  const ids = [];
  for (let i = 0; i < n; i += 1) ids.push(propose(db, { run, feature: 'a', lens: 'design', title: `item ${i}`, kind: 'fix', metric: 'rawLiterals', expectedDelta: -2 }).id);
  decide(db, { ids, decision: 'approve', by: 'operator:jane' });
  const k = packCreate(db, { lens: 'design', short: 'DES', baseRef: 'main', baseSha: 'b0', run });
  for (const id of ids.slice(0, built)) {
    proposalUpdate(db, { id, status: 'executing', pack: k.id });
    proposalUpdate(db, { id, status: 'done', commitSha: `c-${id}` });
  }
  return { path, db, run, ids, pack: k.id };
}
const row = (db, id) => proposals(db, { ids: id })[0];
const jane = 'operator:jane';

test('reopen: accepted, rework and descoped go back to the status they left; the pack reopens; one step deep', () => {
  const { db, ids: [a, b, c], pack } = train(3);
  triage(db, { ids: a, decision: 'accept', by: jane });
  triage(db, { ids: b, decision: 'rework', by: jane, note: 'tighten the gap' });
  const last = triage(db, { ids: c, decision: 'descope', by: jane, note: 'out of scope' });
  assert.deepEqual(last.packs_triaged, [pack]);
  assert.ok(!('packs_reopened' in last), 'only a reopen answers packs_reopened');
  assert.equal(row(db, a).triaged_from, 'done', 'every move records the status it left');
  assert.equal(row(db, b).triaged_from, 'done');

  const r = triage(db, { ids: [a, b, c], decision: 'reopen', by: 'operator:joe' });
  assert.equal(r.decision, 'reopened');
  assert.deepEqual(r.triaged, [a, b, c]);
  assert.deepEqual(r.skipped, []);
  assert.deepEqual(r.packs_reopened, [pack], 'an item back at done moves its triaged pack to open');
  assert.equal(packs(db)[0].status, 'open');
  for (const id of [a, b, c]) {
    const p = row(db, id);
    assert.equal(p.status, 'done');
    assert.ok(!('triage_note' in p) && !('triaged_from' in p), 'the note and triaged_from are cleared, omitted in JSON');
    assert.equal(p.triaged_by, 'operator:joe');
  }
  assert.ok(noNulls(r));
  // one step deep: a second undo has nothing to go back to
  assert.deepEqual(triage(db, { ids: a, decision: 'reopen', by: jane }).skipped, [{ id: a, status: 'done' }]);
  triage(db, { ids: a, decision: 'accept', by: jane });
  triage(db, { ids: a, decision: 'rework', by: jane });
  assert.equal(row(db, a).triaged_from, 'accepted');
  assert.deepEqual(triage(db, { ids: a, decision: 'reopen', by: jane }).triaged, [a]);
  assert.equal(row(db, a).status, 'accepted', 'a rework from accepted reopens to accepted');
  assert.deepEqual(triage(db, { ids: a, decision: 'reopen', by: jane }).skipped, [{ id: a, status: 'accepted', reason: 'no-prior-status' }]);
  db.close();
});

test('reopen: a descope from the backlog (proposed, approved) goes back to the backlog', () => {
  const { db, run, ids: [a] } = train(1, 0);
  const p = propose(db, { run, feature: 'a', lens: 'design', title: 'later', kind: 'fix', metric: 'rawLiterals', expectedDelta: -1 }).id;
  triage(db, { ids: [a, p], decision: 'descope', by: jane });
  const r = triage(db, { ids: [a, p], decision: 'reopen', by: jane });
  assert.deepEqual(r.triaged, [a, p]);
  assert.deepEqual(r.packs_reopened, []);
  assert.equal(row(db, a).status, 'approved');
  assert.equal(row(db, p).status, 'proposed');
  db.close();
});

test('reopen: refused no-prior-status, in-release, rebuilt, pack-closed; a draft release lets the item go', () => {
  const { db, run, ids: [a, b, c, d] } = train(4);
  // a pre-v3 decision (triaged_from NULL) has nothing to reopen to
  triage(db, { ids: a, decision: 'accept', by: jane });
  db.prepare('UPDATE proposals SET triaged_from = NULL WHERE id = ?').run(a);
  assert.deepEqual(triage(db, { ids: a, decision: 'reopen', by: jane }).skipped, [{ id: a, status: 'accepted', reason: 'no-prior-status' }]);
  // in a draft release: the undo takes it out
  triage(db, { ids: b, decision: 'accept', by: jane });
  releaseCreate(db, { version: '1.0.0', by: jane });
  assert.deepEqual(releaseAdd(db, { release: 'rel-1.0.0', ids: b }).added, [b]);
  assert.deepEqual(triage(db, { ids: b, decision: 'reopen', by: jane }).triaged, [b]);
  assert.ok(!('release_id' in row(db, b)), 'reopen leaves a draft release');
  // in a release past draft: refused
  triage(db, { ids: b, decision: 'accept', by: jane });
  releaseAdd(db, { release: 'rel-1.0.0', ids: b });
  releaseUpdate(db, { release: 'rel-1.0.0', status: 'building' });
  assert.deepEqual(triage(db, { ids: b, decision: 'reopen', by: jane }).skipped, [{ id: b, status: 'accepted', reason: 'in-release' }]);
  assert.equal(row(db, b).release_id, 'rel-1.0.0');
  // a rework with its rebuild: refused
  triage(db, { ids: c, decision: 'rework', by: jane, note: 'again' });
  reworkAttempt(db, { id: c, run });
  assert.deepEqual(triage(db, { ids: c, decision: 'reopen', by: jane }).skipped, [{ id: c, status: 'rework', reason: 'rebuilt' }]);
  // a closed pack never opens again
  triage(db, { ids: d, decision: 'descope', by: jane });
  db.prepare("UPDATE packs SET status = 'closed'").run();
  assert.deepEqual(triage(db, { ids: d, decision: 'reopen', by: jane }).skipped, [{ id: d, status: 'descoped', reason: 'pack-closed' }]);
  assert.deepEqual(triage(db, { ids: 'p-000000', decision: 'reopen', by: jane }).skipped, [{ id: 'p-000000', status: 'not-found' }]);
  db.close();
});

test('migration: a v2 file becomes v3 in place (one column, rows kept), the same shape as a fresh file; cli reopen', () => {
  // the v2 DDL is the v3 one without its last column
  const v2ddl = readFileSync(DDL_PATH, 'utf8').replace(/,\s*-- v3\s*\n\s*triaged_from[^\n]*/, '').replace('PRAGMA user_version = 3;', 'PRAGMA user_version = 2;');
  const path = tmpDb();
  mkdirSync(dirname(path), { recursive: true });
  const v2 = new DatabaseSync(path);
  v2.exec(v2ddl);
  assert.equal(v2.prepare('PRAGMA user_version').get().user_version, 2);
  assert.ok(!v2.prepare('PRAGMA table_info(proposals)').all().some((c) => c.name === 'triaged_from'), 'the fixture is v2');
  const at = '2026-10-01T00:00:00.000Z';
  v2.prepare(`INSERT INTO runs (id, started_at, updated_at, phase, status, lenses) VALUES ('r-1', ?, ?, 'execute', 'done', '["design"]')`).run(at, at);
  v2.prepare(`INSERT INTO packs (id, lens, n, branch, base_ref, base_sha, status, created_at, updated_at) VALUES ('k-des-1', 'design', 1, 'pack/des-1', 'main', 'b0', 'open', ?, ?)`).run(at, at);
  v2.prepare(`INSERT INTO proposals (id, run_id, feature, lens, title, kind, status, pack_id, commit_sha, triaged_by, created_at, updated_at)
    VALUES ('p-aaaaaa', 'r-1', 'a', 'design', 'Old call', 'fix', 'accepted', 'k-des-1', 'c1', 'operator:jane', ?, ?)`).run(at, at);
  v2.prepare(`INSERT INTO proposals (id, run_id, feature, lens, title, kind, status, pack_id, commit_sha, created_at, updated_at)
    VALUES ('p-bbbbbb', 'r-1', 'a', 'design', 'Built', 'fix', 'done', 'k-des-1', 'c2', ?, ?)`).run(at, at);
  v2.close();

  const ro = openStore(path, { readOnly: true });
  assert.equal(ro.prepare('PRAGMA user_version').get().user_version, 3, 'a reader never meets v2');
  ro.close();
  const db = openStore(path);
  assert.deepEqual(proposals(db).map((p) => [p.id, p.status, p.commit_sha, p.triaged_from]), [['p-aaaaaa', 'accepted', 'c1', undefined], ['p-bbbbbb', 'done', 'c2', undefined]]);
  const shape = (x) => ['runs', 'measurements', 'proposals', 'activity', 'shots', 'coverage', 'packs', 'releases']
    .map((t) => x.prepare(`PRAGMA table_info(${t})`).all().map((c) => `${t}.${c.name}:${c.type}:${c.notnull}`).join(','));
  const fresh = openStore(tmpDb());
  assert.deepEqual(shape(db), shape(fresh), 'a migrated v2 file and a fresh one have one shape');
  fresh.close();
  db.close();
  const again = openStore(path);
  assert.equal(again.prepare('PRAGMA user_version').get().user_version, 3, 'a second open is a no-op');
  again.close();

  // the pre-v3 call has no prior status; a v3 call reopens through the cli
  assert.equal(cli(path, 'triage', '--ids', 'p-aaaaaa', '--decision', 'reopen', '--by', 'operator:jane').skipped[0].reason, 'no-prior-status');
  assert.deepEqual(cli(path, 'triage', '--ids', 'p-bbbbbb', '--decision', 'accept', '--by', 'operator:jane').packs_triaged, ['k-des-1']);
  const r = cli(path, 'triage', '--ids', 'p-bbbbbb', '--decision', 'reopen', '--by', 'operator:jane');
  assert.deepEqual([r.decision, r.triaged, r.packs_reopened], ['reopened', ['p-bbbbbb'], ['k-des-1']]);
  const no = spawnSync(process.execPath, [SCRIPT, '--db', path, 'triage', '--ids', 'p-bbbbbb', '--decision', 'undo', '--by', 'operator:jane'], { encoding: 'utf8' });
  assert.equal(no.status, 2);
  assert.match(no.stderr, /accept, rework, descope, reopen/);
});
