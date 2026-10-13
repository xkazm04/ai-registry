// node --test skills/lens-scan/tests
// Pins the store rules scripts/store.mjs owns alone: the DDL applies once, ids have their shapes,
// absent values never print as null, latest wins per key, and the skill can never decide a proposal.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  openStore, runStart, runEnd, activity, measure, propose, proposals, proposalUpdate, shot, coverage, latest, parseArgs,
} from '../scripts/store.mjs';

const SCRIPT = fileURLToPath(new URL('../scripts/store.mjs', import.meta.url));
const tmpDb = () => join(mkdtempSync(join(tmpdir(), 'lens-scan-store-')), 'nested', 'scan.db');
const noNulls = (v) => JSON.stringify(v).includes('null') === false;
const cli = (db, ...args) => JSON.parse(execFileSync(process.execPath, [SCRIPT, '--db', db, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));

test('round trip: init, run, measure, propose, update, latest - and no nulls in any output', () => {
  const path = tmpDb();
  const db = openStore(path);
  assert.equal(db.prepare('PRAGMA user_version').get().user_version, 1);
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
  assert.equal(cli(db, 'init').user_version, 1);
  const { id: run } = cli(db, 'run-start', '--phase', 'measure', '--lenses', 'development');
  const bulk = join(mkdtempSync(join(tmpdir(), 'lens-scan-bulk-')), 'm.json');
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
