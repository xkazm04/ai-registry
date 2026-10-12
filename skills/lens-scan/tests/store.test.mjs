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
