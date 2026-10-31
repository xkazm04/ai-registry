// node --test skills/lens-scan/tests
// Pins the v2 store (the release train): the v1 -> v2 migration, triage with its refusals, packs settling and
// closing, rework attempts, releases as compare-and-set chains, and the before/after pairing `compare` reads.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import {
  openStore, runStart, measure, propose, proposals, proposalUpdate, shot, latest, decide,
  triage, reworkAttempt, packCreate, packUpdate, packs, releaseCreate, releaseAdd, releaseUpdate, releases, releaseGet, releaseItems, compare,
} from '../scripts/store.mjs';
import { V1_DDL } from './legacy-ddl.mjs';

// Every temp dir this file makes is removed when its tests are done: on 2026-10-15 these
// suites had left hundreds in the OS temp dir (hygiene disk lane, temp-leak rows).
const madeDirs = [];
const mkdtempTracked = (prefix) => { const d = mkdtempSync(prefix); madeDirs.push(d); return d; };
after(() => { for (const d of madeDirs) rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });

const SCRIPT = fileURLToPath(new URL('../scripts/store.mjs', import.meta.url));
const tmpDb = () => join(mkdtempTracked(join(tmpdir(), 'lens-scan-v2-')), 'nested', 'scan.db');
const cli = (db, ...args) => JSON.parse(execFileSync(process.execPath, [SCRIPT, '--db', db, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));

// The v1 DDL as it shipped lives in legacy-ddl.mjs (V1_DDL): the migration is tested against the real v1 shape.

/** A store with one running execute run and `n` approved proposals of lens design. */
function seed(n = 3) {
  const path = tmpDb();
  const db = openStore(path);
  const { id: run } = runStart(db, { phase: 'execute', lenses: 'design', env: {} });
  const ids = [];
  for (let i = 0; i < n; i += 1) ids.push(propose(db, { run, feature: 'a', lens: 'design', title: `item ${i}`, kind: 'fix', metric: 'rawLiterals', expectedDelta: -2 }).id);
  decide(db, { ids, decision: 'approve', by: 'operator:jane' });
  return { path, db, run, ids };
}
/** Builds `ids` into a fresh pack: each executing then done (or failed) with its own commit. */
function build(db, run, ids, { fail = [] } = {}) {
  const k = packCreate(db, { lens: 'design', short: 'DES', baseRef: 'main', baseSha: 'b0', run });
  for (const id of ids) {
    proposalUpdate(db, { id, status: 'executing', pack: k.id });
    proposalUpdate(db, { id, status: fail.includes(id) ? 'failed' : 'done', commitSha: `c-${id}`,
      ...(fail.includes(id) ? { run, failure: { stage: 'after', reason: 'rawLiterals did not move', evidence: 'measure rawLiterals 4 -> 4' } } : {}) });
  }
  return k;
}
const status = (db, id) => db.prepare('SELECT status FROM proposals WHERE id = ?').get(id).status;

test('migration: a v1 file becomes v2 in place, rows kept, new statuses and columns usable; a second open is a no-op', () => {
  const path = tmpDb();
  mkdirSync(dirname(path), { recursive: true });
  const v1 = new DatabaseSync(path);
  v1.exec(V1_DDL);
  const at = '2026-01-01T00:00:00.000Z';
  v1.prepare(`INSERT INTO runs (id, started_at, updated_at, phase, status, lenses) VALUES ('r-1', ?, ?, 'propose', 'done', '["design"]')`).run(at, at);
  v1.prepare(`INSERT INTO proposals (id, run_id, feature, lens, title, standard, kind, status, decided_by, after_value, result_sha, created_at, updated_at)
    VALUES ('p-aaaaaa', 'r-1', 'a', 'design', 'Up', 'house:ui/t', 'baseline-upgrade', 'done', 'blueprint', 3, 'abc', ?, ?)`).run(at, at);
  v1.prepare(`INSERT INTO proposals (id, run_id, feature, lens, title, kind, parent_id, status, created_at, updated_at)
    VALUES ('p-bbbbbb', 'r-1', 'b', 'design', 'Child', 'propagation', 'p-aaaaaa', 'proposed', ?, ?)`).run(at, at);
  v1.prepare(`INSERT INTO measurements (run_id, feature, lens, metric, value, measured_at) VALUES ('r-1', 'a', 'design', 'rawLiterals', 7, ?)`).run(at);
  v1.prepare(`INSERT INTO shots (run_id, feature, path, captured_at) VALUES ('r-1', 'a', 'shots/x.png', ?)`).run(at);
  assert.throws(() => v1.prepare(`UPDATE proposals SET status = 'accepted' WHERE id = 'p-aaaaaa'`).run(), /CHECK/, 'v1 refuses the new statuses');
  v1.close();

  // a read-only open migrates first, so a reader never meets v1
  const ro = openStore(path, { readOnly: true });
  assert.equal(ro.prepare('PRAGMA user_version').get().user_version, 5, 'v1 goes straight to the current version');
  ro.close();

  const db = openStore(path);
  assert.equal(db.prepare('PRAGMA user_version').get().user_version, 5);
  const rows = proposals(db);
  assert.deepEqual(rows.map((p) => [p.id, p.status]), [['p-aaaaaa', 'done'], ['p-bbbbbb', 'proposed']]);
  assert.equal(rows[0].decided_by, 'blueprint');
  assert.equal(rows[0].result_sha, 'abc');
  assert.equal(rows[0].after_value, 3);
  assert.equal(rows[1].parent_id, 'p-aaaaaa');
  assert.ok(!('pack_id' in rows[0]) && !('triaged_by' in rows[0]), 'old rows get NULL in the new columns, omitted in JSON');
  assert.equal(latest(db)[0].value, 7);
  const cols = (t) => db.prepare(`PRAGMA table_info(${t})`).all().map((c) => c.name);
  assert.ok(['proposal_id', 'phase', 'commit_sha'].every((c) => cols('measurements').includes(c)));
  assert.ok(['proposal_id', 'phase'].every((c) => cols('shots').includes(c)));
  assert.equal(cols('proposals').length, 53, 'proposals carries the 21 v1 + 7 v2 + 1 v3 + 7 v4 + 17 v5 columns');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all().map((r) => r.name);
  assert.deepEqual(tables.filter((t) => t !== 'sqlite_sequence'), ['activity', 'coverage', 'measurements', 'packs', 'proposals', 'releases', 'runs', 'shots', 'trust_events'], 'no proposals_v1 left behind');
  const idx = db.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'proposals' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map((r) => r.name);
  assert.deepEqual(idx, ['proposals_external_ref', 'proposals_pack', 'proposals_release', 'proposals_score', 'proposals_tier', 'proposals_updated']);
  assert.deepEqual(triage(db, { ids: 'p-aaaaaa', decision: 'accept', by: 'operator:jane' }).triaged, ['p-aaaaaa'], 'the widened CHECK takes accepted');
  assert.ok(db.prepare('PRAGMA foreign_keys').get().foreign_keys, 'foreign keys are back on');
  db.close();

  const again = openStore(path);
  assert.equal(proposals(again).length, 2, 'a v2 file opened again is untouched');
  assert.equal(status(again, 'p-aaaaaa'), 'accepted');
  again.close();
  assert.equal(cli(path, 'init').user_version, 5);
});

test('a fresh v2 file and a migrated v1 file have the same schema', () => {
  const fresh = openStore(tmpDb());
  const path = tmpDb();
  mkdirSync(dirname(path), { recursive: true });
  const v1 = new DatabaseSync(path); v1.exec(V1_DDL); v1.close();
  const mig = openStore(path);
  const shape = (db) => ['runs', 'measurements', 'proposals', 'activity', 'shots', 'coverage', 'packs', 'releases']
    .map((t) => db.prepare(`PRAGMA table_info(${t})`).all().map((c) => `${t}.${c.name}:${c.type}:${c.notnull}`).join(','));
  assert.deepEqual(shape(mig), shape(fresh));
  fresh.close(); mig.close();
});

test('triage: every path, refusals, note-required, and the pack settling to triaged', () => {
  const { db, run, ids } = seed(5);
  const [a, b, c, d, e] = ids;
  // d stays approved and is never built; e is built and failed
  const k = build(db, run, [a, b, c, e], { fail: [e] });
  assert.deepEqual(k, { id: 'k-des-1', n: 1, branch: 'pack/des-1' });
  assert.equal(proposals(db, { ids: a })[0].commit_sha, `c-${a}`);
  assert.equal(proposals(db, { pack: k.id }).length, 4);

  assert.throws(() => triage(db, { ids: a, decision: 'accept', by: 'jane' }), /kind>:<name>/);
  assert.throws(() => triage(db, { ids: a, decision: 'ship', by: 'operator:jane' }), /must be one of/);

  // accept: done -> accepted; failed only with a note
  let r = triage(db, { ids: [a, e, d, 'p-000000'], decision: 'accept', by: 'operator:jane' });
  assert.deepEqual(r.triaged, [a]);
  assert.deepEqual(r.skipped, [{ id: e, status: 'failed', reason: 'note-required' }, { id: d, status: 'approved' }, { id: 'p-000000', status: 'not-found' }]);
  assert.equal(triage(db, { ids: e, decision: 'accept', by: 'operator:jane', note: '   ' }).skipped[0].reason, 'note-required', 'a blank note is no note');
  r = triage(db, { ids: e, decision: 'accept', by: 'operator:jane', note: 'good enough, the gap is upstream' });
  assert.deepEqual(r.triaged, [e]);
  const pe = proposals(db, { ids: e })[0];
  assert.equal(pe.triage_note, 'good enough, the gap is upstream');
  assert.equal(pe.triaged_by, 'operator:jane');
  assert.ok(pe.triaged_at);

  // rework: done|failed|accepted -> rework; never from proposed/approved
  assert.deepEqual(triage(db, { ids: [b, e], decision: 'rework', by: 'operator:jane' }).triaged, [b, e]);
  assert.deepEqual(triage(db, { ids: d, decision: 'rework', by: 'operator:jane' }).skipped, [{ id: d, status: 'approved' }]);
  assert.equal(packs(db, { lens: 'design' })[0].status, 'open', 'c is still done: the pack is not triaged yet');

  // descope: from done and approved; the last built item leaving settles the pack in the same call
  r = triage(db, { ids: [c, d], decision: 'descope', by: 'agent:personas', note: 'out of scope' });
  assert.deepEqual(r.triaged, [c, d]);
  assert.deepEqual(r.packs_triaged, [k.id]);
  assert.equal(packs(db)[0].status, 'triaged');
  assert.deepEqual(packs(db)[0].items, { accepted: 1, descoped: 1, rework: 2 });
  assert.deepEqual(triage(db, { ids: b, decision: 'descope', by: 'operator:jane' }).triaged, [b], 'descope takes a rework item');
  assert.deepEqual(triage(db, { ids: c, decision: 'descope', by: 'operator:jane' }).skipped, [{ id: c, status: 'descoped' }], 'descoped is final for triage');
  assert.deepEqual(triage(db, { ids: a, decision: 'accept', by: 'operator:jane' }).skipped, [{ id: a, status: 'accepted' }]);

  // the skill can never write a person's move
  for (const s of ['accepted', 'rework', 'descoped', 'released']) assert.throws(() => proposalUpdate(db, { id: a, status: s }), /never writes it/);
  db.close();
});

test('pack-create allocates per lens; pack-update is a compare-and-set; items join open packs only', () => {
  const { db, run, ids } = seed(1);
  assert.deepEqual(packCreate(db, { lens: 'design', short: 'DES', baseRef: 'main', baseSha: 's' }), { id: 'k-des-1', n: 1, branch: 'pack/des-1' });
  assert.deepEqual(packCreate(db, { lens: 'design', short: 'DES', baseRef: 'release/1.4.0', baseSha: 's', run }), { id: 'k-des-2', n: 2, branch: 'pack/des-2' });
  assert.equal(packCreate(db, { lens: 'security', short: 'SEC', baseRef: 'main', baseSha: 's' }).n, 1, 'n counts per lens');
  assert.throws(() => packCreate(db, { lens: 'dev', short: 'DES', baseRef: 'main', baseSha: 's' }), /belongs to lens design/);
  assert.throws(() => packCreate(db, { lens: 'design', short: 'D-S', baseRef: 'main', baseSha: 's' }), /--short/);
  assert.throws(() => packCreate(db, { lens: 'design', short: 'DES', baseRef: 'main' }), /--base-sha is required/);
  assert.throws(() => packCreate(db, { lens: 'design', short: 'DES', baseRef: 'main', baseSha: 's', run: 'r-nope' }), /does not exist/);

  assert.equal(packUpdate(db, { pack: 'k-des-1', status: 'triaged' }).status, 'triaged');
  assert.throws(() => packUpdate(db, { pack: 'k-des-1', status: 'triaged', from: 'open' }), /is triaged, not open/, 'a stale --from loses');
  assert.throws(() => proposalUpdate(db, { id: ids[0], pack: 'k-des-1' }), /items join an open pack only/);
  assert.throws(() => proposalUpdate(db, { id: ids[0], pack: 'k-nope' }), /does not exist/);
  assert.equal(packUpdate(db, { pack: 'k-des-1', status: 'closed', from: 'triaged' }).status, 'closed');
  assert.throws(() => packUpdate(db, { pack: 'k-des-1', status: 'open' }), /closed cannot move to open/);
  assert.deepEqual(packs(db, { status: 'open' }).map((k) => k.id), ['k-des-2', 'k-sec-1']);
  db.close();
});

test('rework-attempt: a fresh approved copy linked by attempt_of; the reworked row stays', () => {
  const { db, run, ids: [a, b] } = seed(2);
  build(db, run, [a, b]);
  triage(db, { ids: a, decision: 'rework', by: 'operator:jane', note: 'wrong token' });
  assert.throws(() => reworkAttempt(db, { id: b, run }), /is done; only an item triaged rework/);
  const r = reworkAttempt(db, { id: a, run });
  assert.equal(r.attempt_of, a);
  assert.match(r.id, /^p-[0-9a-f]{6}$/);
  const [old, neu] = [proposals(db, { ids: a })[0], proposals(db, { ids: r.id })[0]];
  assert.equal(old.status, 'rework');
  assert.equal(neu.status, 'approved');
  assert.equal(neu.attempt_of, a);
  assert.equal(neu.decided_by, 'operator:jane');
  assert.equal(neu.run_id, run);
  for (const k of ['pack_id', 'commit_sha', 'after_value', 'result_sha', 'release_id', 'triaged_by', 'triage_note']) assert.ok(!(k in neu), `${k} is not copied`);
  assert.equal(neu.title, old.title);
  assert.throws(() => reworkAttempt(db, { id: a, run }), /already has its rebuild/);
  // the rebuild goes through the normal build, into a new pack
  const k2 = packCreate(db, { lens: 'design', short: 'DES', baseRef: 'main', baseSha: 'b1' });
  proposalUpdate(db, { id: r.id, status: 'executing', pack: k2.id });
  assert.equal(proposalUpdate(db, { id: r.id, status: 'done', commitSha: 'c2' }).commit_sha, 'c2');
  db.close();
});

test('release: create, add, the compare-and-set chain, stale --from, and tagged shipping items and closing packs', () => {
  const { db, run, ids: [a, b, c, d] } = seed(4);
  build(db, run, [a, b, c]);
  triage(db, { ids: [a, b], decision: 'accept', by: 'operator:jane' });
  triage(db, { ids: c, decision: 'descope', by: 'operator:jane' });

  const rel = releaseCreate(db, { version: '1.4.1', by: 'operator:jane', baseSha: 'm0' });
  assert.deepEqual({ id: rel.id, branch: rel.branch, status: rel.status, created_by: rel.created_by }, { id: 'rel-1.4.1', branch: 'release/1.4.1', status: 'draft', created_by: 'operator:jane' });
  assert.ok(!('pr_url' in rel) && !('tag' in rel));
  assert.throws(() => releaseCreate(db, { version: '1.4.1', by: 'operator:jane' }), /already exists/);
  assert.throws(() => releaseCreate(db, { version: 'v1.5', by: 'operator:jane' }), /semver/);
  assert.throws(() => releaseCreate(db, { version: '1.5.0', by: 'jane' }), /kind>:<name>/);

  let r = releaseAdd(db, { release: rel.id, ids: [a, b, c, d] });
  assert.deepEqual(r.added, [a, b]);
  assert.deepEqual(r.skipped, [{ id: c, status: 'descoped' }, { id: d, status: 'approved' }]);
  assert.deepEqual(releaseAdd(db, { release: rel.id, ids: a }).skipped, [{ id: a, status: 'accepted', reason: 'already-in' }]);

  // a draft release lets an item leave it by rework; a later one does not
  triage(db, { ids: b, decision: 'rework', by: 'operator:jane' });
  assert.ok(!('release_id' in proposals(db, { ids: b })[0]), 'leaving accepted leaves the draft release');
  assert.deepEqual(releaseItems(db, { release: rel.id }).map((p) => p.id), [a]);

  assert.throws(() => releaseUpdate(db, { release: rel.id, status: 'merged' }), /draft cannot move to merged/);
  assert.equal(releaseUpdate(db, { release: rel.id, status: 'building', from: 'draft' }).status, 'building');
  assert.throws(() => releaseUpdate(db, { release: rel.id, status: 'building', from: 'draft' }), /is building, not draft/, 'a stale --from loses');
  assert.deepEqual(triage(db, { ids: a, decision: 'descope', by: 'operator:jane' }).skipped, [{ id: a, status: 'accepted', reason: 'in-release' }]);
  assert.equal(releaseUpdate(db, { release: rel.id, status: 'pr-open', prUrl: 'https://x/pr/1' }).pr_url, 'https://x/pr/1');
  assert.throws(() => releaseAdd(db, { release: rel.id, ids: a }), /draft or building release only/);
  assert.equal(releaseUpdate(db, { release: rel.id, notes: '## 1.4.1' }).notes, '## 1.4.1', 'fields alone, status kept');
  releaseUpdate(db, { release: rel.id, status: 'merged', from: 'pr-open' });

  // b is in rework: the pack is not all released|descoped|declined yet, so it stays
  r = releaseUpdate(db, { release: rel.id, status: 'tagged' });
  assert.equal(r.tag, 'v1.4.1', 'the tag defaults to v<version>');
  assert.deepEqual(r.released, [a]);
  assert.deepEqual(r.packs_closed, []);
  assert.equal(status(db, a), 'released');
  assert.throws(() => releaseUpdate(db, { release: rel.id, status: 'failed' }), /tagged cannot move to failed/);
  assert.equal(releaseUpdate(db, { release: releaseCreate(db, { version: '2.0.0', by: 'operator:jane' }).id, status: 'failed', error: 'cherry-pick conflict' }).error, 'cherry-pick conflict');
  db.close();

  // close-on-tag: a pack whose items end released|descoped
  const { db: db2, run: run2, ids: [x, y] } = seed(2);
  const k2 = build(db2, run2, [x, y]);
  triage(db2, { ids: x, decision: 'accept', by: 'operator:jane' });
  triage(db2, { ids: y, decision: 'descope', by: 'operator:jane' });
  const r2 = releaseCreate(db2, { version: '0.1.0', by: 'operator:jane' }).id;
  releaseAdd(db2, { release: r2, ids: x });
  for (const s of ['building', 'pr-open', 'merged']) releaseUpdate(db2, { release: r2, status: s });
  const tagged = releaseUpdate(db2, { release: r2, status: 'tagged', tag: 'v0.1.0' });
  assert.deepEqual(tagged.packs_closed, [k2.id]);
  assert.equal(packs(db2)[0].status, 'closed');
  const got = releaseGet(db2, { id: r2 });
  assert.equal(got.status, 'tagged');
  assert.deepEqual(got.items.map((p) => [p.id, p.status]), [[x, 'released']]);
  assert.deepEqual(releases(db2, { status: 'tagged' }).map((z) => z.id), [r2]);
  db2.close();
});

test('compare: before/after measurements per item and shots paired by (theme, size); after readings stay out of latest', () => {
  const { db, run, ids: [a, b] } = seed(2);
  const k = build(db, run, [a, b]);
  const m = (o) => measure(db, run, { feature: 'a', lens: 'design', metric: 'rawLiterals', unit: 'count', ...o });
  m({ value: 12 }); // the feature's own reading
  m({ value: 12, proposal: a, phase: 'before', commitSha: 'b0' });
  m({ value: 9, proposal: a, phase: 'after', commitSha: `c-${a}` });
  assert.throws(() => m({ value: 1, proposal: a }), /go together/);
  assert.throws(() => m({ value: 1, phase: 'after' }), /go together/);
  assert.throws(() => m({ value: 1, proposal: a, phase: 'later' }), /must be one of/);
  assert.throws(() => m({ value: 1, proposal: 'p-000000', phase: 'after' }), /does not exist/);
  assert.equal(latest(db, { feature: 'a' })[0].value, 12, 'an after reading lives on the pack branch, not in latest');

  const s = (o) => shot(db, { run, feature: 'a', proposal: a, ...o });
  s({ path: 'shots/a-b-dark-desktop.png', theme: 'dark', size: 'desktop', phase: 'before' });
  s({ path: 'shots/a-a-dark-desktop.png', theme: 'dark', size: 'desktop', phase: 'after', report: { errors: 0 } });
  s({ path: 'shots/a-a2-dark-desktop.png', theme: 'dark', size: 'desktop', phase: 'after' });
  s({ path: 'shots/a-b-light-mobile.png', theme: 'light', size: 'mobile', phase: 'before' });
  shot(db, { run, feature: 'a', path: 'shots/unlinked.png', theme: 'dark', size: 'desktop' });

  // Two proposals seeded in one millisecond tie on created_at and fall back to their random ids: find by id.
  const byId = new Map(compare(db, { pack: k.id }).map((x) => [x.proposal.id, x]));
  const [ca, cb] = [byId.get(a), byId.get(b)];
  assert.equal(ca.proposal.id, a);
  assert.deepEqual(ca.before.map((x) => [x.value, x.commit_sha]), [[12, 'b0']]);
  assert.deepEqual(ca.after.map((x) => [x.value, x.commit_sha]), [[9, `c-${a}`]]);
  assert.equal(ca.shots.length, 2);
  const dark = ca.shots.find((p) => p.theme === 'dark');
  assert.equal(dark.size, 'desktop');
  assert.equal(dark.before.path, 'shots/a-b-dark-desktop.png');
  assert.equal(dark.after.path, 'shots/a-a2-dark-desktop.png', 'the latest capture of a phase wins');
  const light = ca.shots.find((p) => p.theme === 'light');
  assert.ok(light.before && !('after' in light), 'an unpaired side is absent, never null');
  assert.deepEqual([cb.before, cb.after, cb.shots], [[], [], []]);
  assert.deepEqual(compare(db, { ids: `${b},p-000000,${a}` }).map((x) => x.proposal.id).sort(), [a, b].sort());
  assert.throws(() => compare(db, {}), /one of them/);
  assert.throws(() => compare(db, { pack: 'k-nope' }), /does not exist/);
  assert.ok(!JSON.stringify(compare(db, { ids: a })).includes('null'));
  db.close();
});

test('cli: the new commands print JSON; bad input exits 2, a refused move exits 1', () => {
  const path = tmpDb();
  const { id: run } = cli(path, 'run-start', '--phase', 'execute', '--lenses', 'design');
  const p = cli(path, 'propose', '--run', run, '--feature', 'a', '--lens', 'design', '--title', 'T', '--kind', 'fix', '--metric', 'rawLiterals', '--expected-delta', '-1').id;
  cli(path, 'decide', '--ids', p, '--decision', 'approve', '--by', 'operator:jane');
  const k = cli(path, 'pack-create', '--lens', 'design', '--short', 'DES', '--base-ref', 'main', '--base-sha', 'b0', '--run', run);
  assert.deepEqual(k, { id: 'k-des-1', n: 1, branch: 'pack/des-1' });
  cli(path, 'proposal-update', '--id', p, '--status', 'executing', '--pack', k.id);
  cli(path, 'proposal-update', '--id', p, '--status', 'done', '--commit-sha', 'c1');
  assert.equal(cli(path, 'measure', '--run', run, '--feature', 'a', '--lens', 'design', '--metric', 'rawLiterals', '--value', '3', '--proposal', p, '--phase', 'after', '--commit-sha', 'c1').ids.length, 1);
  assert.equal(cli(path, 'shot', '--run', run, '--feature', 'a', '--path', 'shots/x.png', '--theme', 'dark', '--size', 'desktop', '--proposal', p, '--phase', 'after').id, 1);
  assert.equal(cli(path, 'compare', '--ids', p)[0].after[0].value, 3);
  const t = cli(path, 'triage', '--ids', p, '--decision', 'accept', '--by', 'operator:jane', '--note', 'ok');
  assert.deepEqual(t, { decision: 'accepted', by: 'operator:jane', triaged: [p], skipped: [], packs_triaged: [k.id] });
  assert.equal(cli(path, 'packs', '--lens', 'design')[0].status, 'triaged');
  assert.equal(cli(path, 'release-create', '--version', '1.0.0', '--by', 'operator:jane').id, 'rel-1.0.0');
  assert.deepEqual(cli(path, 'release-add', '--release', 'rel-1.0.0', '--ids', p).added, [p]);
  assert.equal(cli(path, 'release-update', '--release', 'rel-1.0.0', '--status', 'building', '--from', 'draft').status, 'building');
  const stale = spawnSync(process.execPath, [SCRIPT, '--db', path, 'release-update', '--release', 'rel-1.0.0', '--status', 'building', '--from', 'draft'], { encoding: 'utf8' });
  assert.equal(stale.status, 1);
  assert.match(stale.stderr, /not draft/);
  assert.equal(stale.stdout, '');
  const badv = spawnSync(process.execPath, [SCRIPT, '--db', path, 'release-create', '--version', 'one', '--by', 'operator:jane'], { encoding: 'utf8' });
  assert.equal(badv.status, 2);
  assert.equal(cli(path, 'release', '--id', 'rel-1.0.0').items[0].id, p);
  assert.equal(cli(path, 'release-items', '--release', 'rel-1.0.0')[0].release_id, 'rel-1.0.0');
  assert.equal(cli(path, 'releases', '--status', 'building').length, 1);
  assert.equal(cli(path, 'pack-update', '--pack', k.id, '--status', 'open', '--from', 'triaged').status, 'open');
  assert.equal(cli(path, 'proposals', '--pack', k.id)[0].id, p);
  assert.deepEqual(cli(path, 'triage', '--ids', p, '--decision', 'rework', '--by', 'operator:jane').skipped, [{ id: p, status: 'accepted', reason: 'in-release' }]);
  const rw = spawnSync(process.execPath, [SCRIPT, '--db', path, 'rework-attempt', '--id', p, '--run', run], { encoding: 'utf8' });
  assert.equal(rw.status, 1);
});


test('release run: a conflicted item leaves a building release (skill only); registry-target items never join', () => {
  const { db, run, ids: [a, b] } = seed(2);
  build(db, run, [a, b]);
  triage(db, { ids: [a, b], decision: 'accept', by: 'operator:jane' });
  const rel = releaseCreate(db, { version: '2.0.0', by: 'operator:jane' });
  releaseAdd(db, { release: rel.id, ids: [a, b] });
  releaseUpdate(db, { release: rel.id, status: 'building', from: 'draft' });
  // a person cannot pull an item out of a building release
  assert.deepEqual(triage(db, { ids: a, decision: 'rework', by: 'operator:jane' }).skipped, [{ id: a, status: 'accepted', reason: 'in-release' }]);
  // the release run sends its conflicted item back, and it leaves the release
  assert.deepEqual(triage(db, { ids: a, decision: 'rework', by: 'skill:lens-scan', note: 'conflict on release/2.0.0: x.ts' }).triaged, [a]);
  assert.deepEqual(releaseItems(db, { release: rel.id }).map((p) => p.id), [b]);

  const { db: db2, run: run2, ids: [c] } = seed(1);
  db2.prepare("UPDATE proposals SET body = 'target: registry\nregister the project' WHERE id = ?").run(c);
  build(db2, run2, [c]);
  triage(db2, { ids: c, decision: 'accept', by: 'operator:jane' });
  const rel2 = releaseCreate(db2, { version: '0.1.0', by: 'operator:jane' });
  assert.deepEqual(releaseAdd(db2, { release: rel2.id, ids: c }).skipped, [{ id: c, status: 'accepted', reason: 'registry-target' }]);
  db.close(); db2.close(); // an open handle keeps Windows from removing the temp dir
});
