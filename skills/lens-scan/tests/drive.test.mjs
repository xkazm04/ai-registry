// node --test skills/lens-scan/tests
// Pins the headless caller's door: store.mjs gaps (what is left), decide (a caller's recorded decision) and the
// compare-and-set on status, and drive.mjs planning and running against a fake CLI - no model, no blueprint.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { openStore, runStart, runEnd, measure, propose, proposals, proposalUpdate, gaps, decide, packCreate, triage, releaseCreate, releaseAdd, releaseGet } from '../scripts/store.mjs';
import { drive } from '../scripts/drive.mjs';

// Every temp dir this file makes is removed when its tests are done: on 2026-10-15 these
// suites had left hundreds in the OS temp dir (hygiene disk lane, temp-leak rows).
const madeDirs = [];
const mkdtempTracked = (prefix) => { const d = mkdtempSync(prefix); madeDirs.push(d); return d; };
after(() => { for (const d of madeDirs) rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });

const STORE = fileURLToPath(new URL('../scripts/store.mjs', import.meta.url));
const LENS = 'com.x.reg';
const structure = {
  generated_at: '2999-01-01T00:00:00.000Z', // rewritten after every measure: never the stale clock
  provenance: { context_map_generated_at: '2026-10-14T00:00:00.000000000+00:00' },
  features: [{ slug: 'a' }, { slug: 'b' }, { slug: 'c' }],
  lenses: [{ id: LENS, enabled: true, manifest: {
    fields: [{ key: 'judged', metric: { method: 'static' } }, { key: 'conf', metric: { method: 'static' } }, { key: 'label' }],
    scan: { method: 'steps', steps: [{ kind: 'script', run: 'x' }, { kind: 'skill', skill: 'conform', budget: 2 }] },
  } }],
};
function repo() {
  const root = mkdtempTracked(join(tmpdir(), 'lens-scan-drive-'));
  mkdirSync(join(root, '.ai', 'lens-scan'), { recursive: true });
  const file = join(root, '.ai', 'lens-scan', 'app-structure.json');
  writeFileSync(file, JSON.stringify(structure));
  const dbPath = join(root, '.ai', 'lens-scan', 'scan.db');
  return { root, file, dbPath, db: openStore(dbPath) };
}

test('gaps: unmeasured until a done run covers a feature, unmeasurable after, stale before the context map', () => {
  const { file, db } = repo();
  let g = gaps(db, { lens: LENS, structure: file });
  assert.deepEqual(g.metrics, ['judged', 'conf'], 'only fields with a metric block');
  assert.equal(g.totals.unmeasured, 6);
  const { id: run } = runStart(db, { phase: 'measure', lenses: LENS, features: 'a,b', knownFeatures: new Set(['a', 'b', 'c']) });
  measure(db, run, [{ feature: 'a', lens: LENS, metric: 'judged', value: 10 }, { feature: 'a', lens: LENS, metric: 'conf', value: 50 }, { feature: 'b', lens: LENS, metric: 'judged', value: 0 }]);
  runEnd(db, { run, status: 'done' });
  g = gaps(db, { lens: LENS, structure: file });
  assert.deepEqual(g.features, [{ feature: 'b', unmeasurable: ['conf'] }, { feature: 'c', unmeasured: ['judged', 'conf'] }]);
  assert.deepEqual(g.totals, { features: 3, cells: 6, measured: 3, unmeasured: 2, unmeasurable: 1, stale: 0 });
  writeFileSync(file, JSON.stringify({ ...structure, provenance: { context_map_generated_at: '2999-01-01T00:00:00.000000000+00:00' } }));
  assert.equal(gaps(db, { lens: LENS, structure: file }).totals.stale, 3);
  assert.throws(() => gaps(db, { lens: 'nope', structure: file }), /not in/);
});

test('decide: a caller decision is recorded with who, only on proposed items; status moves are compare-and-set', () => {
  const { db } = repo();
  const { id: run } = runStart(db, { phase: 'propose', lenses: LENS });
  const p1 = propose(db, { run, feature: 'a', lens: LENS, title: 't1', kind: 'fix', metric: 'conf', expectedDelta: 10 }).id;
  const p2 = propose(db, { run, feature: 'b', lens: LENS, title: 't2', kind: 'fix', metric: 'conf', expectedDelta: 10 }).id;
  assert.throws(() => decide(db, { ids: p1, decision: 'approve', by: 'someone' }), /<kind>:<name>/);
  assert.throws(() => decide(db, { ids: p1, decision: 'approve' }), /--by is required/);
  const r = decide(db, { ids: `${p1},p-000000`, decision: 'approve', by: 'operator:jane' });
  assert.deepEqual(r.decided, [p1]);
  assert.deepEqual(r.skipped, [{ id: 'p-000000', status: 'not-found' }]);
  assert.equal(proposals(db, { ids: p1 })[0].decided_by, 'operator:jane');
  assert.deepEqual(decide(db, { ids: p1, decision: 'decline', by: 'operator:jane' }).skipped, [{ id: p1, status: 'approved' }], 'a decided item is never re-decided');
  assert.throws(() => proposalUpdate(db, { id: p2, status: 'approved' }), /human decision/);
  // two executors read `approved`; the second write loses
  proposalUpdate(db, { id: p1, status: 'executing' });
  assert.throws(() => proposalUpdate(db, { id: p1, status: 'executing' }), /cannot move/);
});

// The fake CLI: reads the prompt, opens a run noted bp-job:<BP_JOB_ID> and, for a measure, writes `judged` for the
// scoped features; for an execute, moves each approved id to done. It never decides anything.
const FAKE = `
import { readFileSync } from 'node:fs';
import { openStore, runStart, runEnd, measure, propose, proposalUpdate, proposals, releaseUpdate, reworkAttempt } from ${JSON.stringify(pathToFileURL(STORE).href)};
const prompt = readFileSync(0, 'utf8').trim();
const db = openStore('.ai/lens-scan/scan.db');
// a release: building -> (a measure run noted with the release) -> pr-open; --finish: merged -> tagged
const rel = prompt.match(/^\\/lens-scan release --id (\\S+)( --finish)?$/);
if (rel) {
  if (rel[2]) {
    releaseUpdate(db, { release: rel[1], status: 'merged', from: 'pr-open' });
    releaseUpdate(db, { release: rel[1], status: 'tagged', from: 'merged' });
  } else {
    releaseUpdate(db, { release: rel[1], status: 'building' });
    const { id } = runStart(db, { phase: 'measure', lenses: 'x', note: 'release ' + rel[1] });
    if (process.env.FAKE_DIE) process.exit(1); // dies mid-build: the release stays building, the run running
    runEnd(db, { run: id, status: 'done' });
    releaseUpdate(db, { release: rel[1], status: 'pr-open', prUrl: 'https://example.test/pr/1' });
  }
  console.log('fake release', prompt);
  process.exit(0);
}
// a propagation: one child per site (here: features b and c) under the named upgrade, judged against its house line
const pg = prompt.match(/^\\/lens-scan propagate --lens (\\S+) --proposals (\\S+)$/);
if (pg) {
  const up = proposals(db, { ids: pg[2] })[0];
  const { id } = runStart(db, { phase: 'propagate', lenses: pg[1] });
  for (const f of ['b', 'c']) propose(db, { run: id, feature: f, lens: pg[1], title: 'site ' + f, kind: 'propagation', parent: up.id, standard: up.standard });
  runEnd(db, { run: id, status: 'done' });
  console.log('fake propagate', prompt);
  process.exit(0);
}
const m = prompt.match(/^\\/lens-scan (measure|propose|execute) --lens (\\S+)(?: --scope (\\S+))?|^\\/lens-scan execute --proposals (\\S+)(?: --base \\S+)?$/);
const phase = m[1] ?? 'execute';
const { id } = runStart(db, { phase, lenses: m[2] ?? 'x', features: m[3], scope: m[4] ? { proposals: m[4].split(',') } : undefined, knownFeatures: new Set(['a', 'b', 'c']) });
if (phase === 'measure') measure(db, id, m[3].split(',').map((f) => ({ feature: f, lens: m[2], metric: 'judged', value: 1 })));
if (m[4]) for (let p of proposals(db, { ids: m[4] })) {
  if (p.status === 'rework') p = proposals(db, { ids: reworkAttempt(db, { id: p.id, run: id }).id })[0]; // the rebuild is a new attempt
  if (p.status === 'approved') proposalUpdate(db, { id: p.id, status: 'executing' });
  if (process.env.FAKE_DIE) process.exit(1); // the session dies mid-build: the run stays running, the item executing
  proposalUpdate(db, { id: p.id, status: 'done', resultSha: 'abc1234' }); // a cut-off item is reconciled, never re-claimed
}
runEnd(db, { run: id, status: 'done' });
console.log('fake done', prompt);
`;

test('drive: status starts nothing; cover chunks by the conform budget; execute approves only on --approve-proposed --by', async () => {
  const { root, dbPath, db } = repo();
  const { id: run } = runStart(db, { phase: 'propose', lenses: LENS });
  const p1 = propose(db, { run, feature: 'a', lens: LENS, title: 't1', kind: 'fix', metric: 'conf', expectedDelta: 10 }).id;
  runEnd(db, { run, status: 'done' });
  db.close();
  const fake = join(root, 'fake-claude.mjs');
  writeFileSync(fake, FAKE);
  const env = { ...process.env, LENS_SCAN_CLAUDE_BIN: fake };
  const quiet = process.stderr.write;
  process.stderr.write = () => true;
  try {
    const st = await drive(['status', '--lens', LENS, '--root', root], env);
    assert.equal(st.jobs, undefined);
    assert.equal(st.gaps.length, 3);

    const cov = await drive(['cover', '--lens', LENS, '--root', root], env);
    assert.deepEqual(cov.plan, [`/lens-scan measure --lens ${LENS} --scope a,b`, `/lens-scan measure --lens ${LENS} --scope c`, `/lens-scan propose --lens ${LENS}`]);
    assert.ok(cov.ok, JSON.stringify(cov.jobs));
    assert.ok(cov.jobs.every((j) => /^r-/.test(j.run)), 'each job found its run by the note');
    assert.equal(cov.after.totals.unmeasured, 0);
    assert.equal(cov.after.totals.unmeasurable, 3, 'conf was never written: reported, not re-run');
    assert.equal((await drive(['cover', '--lens', LENS, '--root', root, '--no-propose', '--dry'], env)).plan.length, 0);
    assert.equal((await drive(['cover', '--lens', LENS, '--root', root, '--retry', '--dry'], env)).plan.length, 3);

    const none = await drive(['execute', '--lens', LENS, '--root', root], env);
    assert.deepEqual(none.plan, [], 'nothing approved, nothing built');
    await assert.rejects(drive(['execute', '--lens', LENS, '--root', root, '--approve-proposed'], env), /--by/);
    const ex = await drive(['execute', '--lens', LENS, '--root', root, '--approve-proposed', '--by', 'agent:test'], env);
    assert.deepEqual(ex.approved, [p1]);
    assert.equal(ex.items[0].status, 'done');
    assert.equal(ex.items[0].result_sha, 'abc1234');
    const ro = openStore(dbPath, { readOnly: true });
    assert.equal(proposals(ro, { ids: p1 })[0].decided_by, 'agent:test');
    ro.close();
  } finally { process.stderr.write = quiet; }
});

test('drive: a session that dies leaves its run aborted, and the next execute reconciles the item it cut off', async () => {
  const { root, dbPath, db } = repo();
  const { id: run } = runStart(db, { phase: 'propose', lenses: LENS });
  const p1 = propose(db, { run, feature: 'a', lens: LENS, title: 't1', kind: 'fix', metric: 'conf', expectedDelta: 10 }).id;
  runEnd(db, { run, status: 'done' });
  decide(db, { ids: p1, decision: 'approve', by: 'operator:jane' });
  db.close();
  const fake = join(root, 'fake-claude.mjs');
  writeFileSync(fake, FAKE);
  const quiet = process.stderr.write;
  process.stderr.write = () => true;
  try {
    const died = await drive(['execute', '--lens', LENS, '--root', root], { ...process.env, LENS_SCAN_CLAUDE_BIN: fake, FAKE_DIE: '1' });
    assert.equal(died.ok, false);
    assert.equal(died.items[0].status, 'executing');
    const ro = openStore(dbPath, { readOnly: true });
    assert.equal(ro.prepare('SELECT status FROM runs WHERE id = ?').get(died.jobs[0].run).status, 'aborted', 'drive closed the dead run');
    ro.close();
    const again = await drive(['execute', '--lens', LENS, '--root', root], { ...process.env, LENS_SCAN_CLAUDE_BIN: fake });
    assert.deepEqual(again.cut_off, [p1]);
    assert.equal(again.items[0].status, 'done');
  } finally { process.stderr.write = quiet; }
});

test('drive: triage and compare pass through to the store; execute passes --base and rebuilds a named rework item', async () => {
  const { root, db } = repo();
  const { id: run } = runStart(db, { phase: 'propose', lenses: LENS });
  const p1 = propose(db, { run, feature: 'a', lens: LENS, title: 't1', kind: 'fix', metric: 'conf', expectedDelta: 10 }).id;
  const p2 = propose(db, { run, feature: 'b', lens: LENS, title: 't2', kind: 'fix', metric: 'conf', expectedDelta: 10 }).id;
  runEnd(db, { run, status: 'done' });
  decide(db, { ids: `${p1},${p2}`, decision: 'approve', by: 'operator:jane' });
  const { id: ex } = runStart(db, { phase: 'execute', lenses: LENS });
  const k = packCreate(db, { lens: LENS, short: 'REG', baseRef: 'main', baseSha: 'b0b0b0b', run: ex });
  assert.equal(k.branch, 'pack/reg-1');
  measure(db, ex, [{ feature: 'a', lens: LENS, metric: 'conf', value: 40, proposal: p1, phase: 'before', commit_sha: 'b0b0b0b' }]);
  for (const [p, sha, st] of [[p1, 'c1c1c1c', 'done'], [p2, 'c2c2c2c', 'failed']]) {
    proposalUpdate(db, { id: p, status: 'executing', pack: k.id });
    proposalUpdate(db, { id: p, status: st, commitSha: sha, resultSha: sha, ...(st === 'done' ? { afterValue: 50 } : {}) });
  }
  measure(db, ex, [{ feature: 'a', lens: LENS, metric: 'conf', value: 50, proposal: p1, phase: 'after', commit_sha: 'c1c1c1c' }]);
  runEnd(db, { run: ex, status: 'done' });
  db.close();
  const fake = join(root, 'fake-claude.mjs');
  writeFileSync(fake, FAKE);
  const env = { ...process.env, LENS_SCAN_CLAUDE_BIN: fake };
  const quiet = process.stderr.write;
  process.stderr.write = () => true;
  try {
    const cmp = await drive(['compare', '--pack', k.id, '--root', root], env);
    assert.ok(cmp.ok);
    const c1 = cmp.result.find((x) => x.proposal.id === p1);
    assert.deepEqual([c1.before[0].value, c1.after[0].value, c1.after[0].commit_sha], [40, 50, 'c1c1c1c']);
    await assert.rejects(drive(['compare', '--root', root], env), /one of them/);

    const tr = await drive(['triage', '--ids', `${p1},${p2}`, '--decision', 'accept', '--by', 'operator:jane', '--root', root], env);
    assert.deepEqual(tr.result.triaged, [p1]);
    assert.deepEqual(tr.result.skipped, [{ id: p2, status: 'failed', reason: 'note-required' }], 'a failed item is accepted only with a note');
    const rw = await drive(['triage', '--ids', p2, '--decision', 'rework', '--by', 'operator:jane', '--note', 'keep the old empty state', '--root', root], env);
    assert.deepEqual(rw.result.triaged, [p2]);
    assert.deepEqual(rw.result.packs_triaged, [k.id], 'nothing left building: the pack is triaged');
    await assert.rejects(drive(['triage', '--ids', p1, '--decision', 'accept', '--by', 'nobody', '--root', root], env), /<kind>:<name>/);

    const dry = await drive(['execute', '--lens', LENS, '--root', root, '--ids', p2, '--base', 'release/1.2.0', '--dry'], env);
    assert.deepEqual(dry.plan, [`/lens-scan execute --proposals ${p2} --base release/1.2.0`]);
    await assert.rejects(drive(['execute', '--lens', LENS, '--root', root, '--base', 'x;rm'], env), /--base/);
    await assert.rejects(drive(['cover', '--lens', LENS, '--root', root, '--base', 'main'], env), /belongs to execute/);
    assert.deepEqual((await drive(['execute', '--lens', LENS, '--root', root, '--dry'], env)).plan, [], 'rework is rebuilt only when named');
    const re = await drive(['execute', '--lens', LENS, '--root', root, '--ids', p2], env);
    assert.ok(re.ok, JSON.stringify(re.jobs));
    assert.equal(re.items[0].status, 'rework', 'the reworked row stays rework');
    assert.equal(re.attempts.length, 1);
    assert.equal(re.attempts[0].attempt_of, p2);
    assert.equal(re.attempts[0].status, 'done');
  } finally { process.stderr.write = quiet; }
});

test('drive: release runs the session to pr-open, --finish to tagged; a dead session leaves the release failed', async () => {
  const { root, dbPath, db } = repo();
  const { id: run } = runStart(db, { phase: 'propose', lenses: LENS });
  const p1 = propose(db, { run, feature: 'a', lens: LENS, title: 't1', kind: 'fix', metric: 'conf', expectedDelta: 10 }).id;
  runEnd(db, { run, status: 'done' });
  decide(db, { ids: p1, decision: 'approve', by: 'operator:jane' });
  const { id: ex } = runStart(db, { phase: 'execute', lenses: LENS });
  const k = packCreate(db, { lens: LENS, short: 'REG', baseRef: 'main', baseSha: 'b0b0b0b', run: ex });
  proposalUpdate(db, { id: p1, status: 'executing', pack: k.id });
  proposalUpdate(db, { id: p1, status: 'done', commitSha: 'c1c1c1c', afterValue: 50 });
  runEnd(db, { run: ex, status: 'done' });
  triage(db, { ids: p1, decision: 'accept', by: 'operator:jane' });
  releaseCreate(db, { version: '1.2.0', by: 'operator:jane' });
  releaseAdd(db, { release: 'rel-1.2.0', ids: p1 });
  db.close();
  const fake = join(root, 'fake-claude.mjs');
  writeFileSync(fake, FAKE);
  const env = { ...process.env, LENS_SCAN_CLAUDE_BIN: fake };
  const quiet = process.stderr.write;
  process.stderr.write = () => true;
  try {
    await assert.rejects(drive(['release', '--id', 'rel-1.2', '--root', root], env), /rel-<semver>/);
    await assert.rejects(drive(['release', '--id', 'rel-1.2.0', '--finish', '--root', root], env), /starts from pr-open or merged/);
    const dry = await drive(['release', '--id', 'rel-1.2.0', '--root', root, '--dry'], env);
    assert.deepEqual(dry.plan, ['/lens-scan release --id rel-1.2.0']);
    assert.equal(dry.jobs, undefined);

    const died = await drive(['release', '--id', 'rel-1.2.0', '--root', root], { ...env, FAKE_DIE: '1' });
    assert.equal(died.ok, false);
    assert.equal(died.after.status, 'failed', 'a session that died mid-build leaves the release failed, not building');
    assert.match(died.after.error, /ended by drive/);
    const ro = openStore(dbPath, { readOnly: true });
    assert.equal(ro.prepare('SELECT status FROM runs WHERE id = ?').get(died.jobs[0].run).status, 'aborted');
    ro.close();

    const cut = await drive(['release', '--id', 'rel-1.2.0', '--root', root], env); // a failed release is retried
    assert.ok(cut.ok, JSON.stringify(cut.jobs));
    assert.equal(cut.after.status, 'pr-open');
    assert.equal(cut.after.pr_url, 'https://example.test/pr/1');
    assert.match(cut.jobs[0].run, /^r-/, 'the release session found its run by the job note');

    const fin = await drive(['release', '--id', 'rel-1.2.0', '--finish', '--root', root], env);
    assert.ok(fin.ok, JSON.stringify(fin.jobs));
    assert.equal(fin.after.status, 'tagged');
    assert.equal(fin.after.tag, 'v1.2.0');
    assert.deepEqual(fin.after.items, [{ id: p1, status: 'released', commit_sha: 'c1c1c1c' }]);
    const r2 = openStore(dbPath, { readOnly: true });
    assert.equal(releaseGet(r2, { id: 'rel-1.2.0' }).status, 'tagged');
    assert.equal(r2.prepare('SELECT status FROM packs WHERE id = ?').get(k.id).status, 'closed');
    r2.close();
  } finally { process.stderr.write = quiet; }
});

test('drive: cover --features measures exactly the named features; propagate runs one session per landed upgrade', async () => {
  const { root, dbPath, db } = repo();
  const { id: run } = runStart(db, { phase: 'propose', lenses: LENS });
  const up = propose(db, { run, feature: 'a', lens: LENS, title: 'one table pattern', kind: 'baseline-upgrade', standard: 'house:table/sticky-head' }).id;
  const open = propose(db, { run, feature: 'b', lens: LENS, title: 'not landed', kind: 'baseline-upgrade', standard: 'house:form/inline-error' }).id;
  runEnd(db, { run, status: 'done' });
  decide(db, { ids: up, decision: 'approve', by: 'operator:jane' });
  proposalUpdate(db, { id: up, status: 'executing' });
  proposalUpdate(db, { id: up, status: 'done', resultSha: 'abc1234' });
  db.close();
  const fake = join(root, 'fake-claude.mjs');
  writeFileSync(fake, FAKE);
  const env = { ...process.env, LENS_SCAN_CLAUDE_BIN: fake };
  const quiet = process.stderr.write;
  process.stderr.write = () => true;
  try {
    const cov = await drive(['cover', '--lens', LENS, '--root', root, '--features', 'c,a', '--no-propose'], env);
    assert.deepEqual(cov.plan, [`/lens-scan measure --lens ${LENS} --scope c,a`], 'the named features, in one run by the conform budget');
    assert.ok(cov.ok, JSON.stringify(cov.jobs));
    const again = await drive(['cover', '--lens', LENS, '--root', root, '--features', 'a', '--dry'], env);
    assert.deepEqual(again.plan, [`/lens-scan measure --lens ${LENS} --scope a`, `/lens-scan propose --lens ${LENS}`], 'a measured feature is re-measured when named');
    await assert.rejects(drive(['cover', '--lens', LENS, '--root', root, '--features', 'a,zz'], env), /not in the app-structure: zz/);
    await assert.rejects(drive(['cover', '--lens', LENS, '--root', root, '--features'], env), /at least one feature/);
    await assert.rejects(drive(['execute', '--lens', LENS, '--root', root, '--features', 'a'], env), /belongs to cover/);

    const all = await drive(['propagate', '--lens', LENS, '--root', root, '--dry'], env);
    assert.deepEqual(all.plan, [`/lens-scan propagate --lens ${LENS} --proposals ${up}`], 'only the landed upgrade');
    await assert.rejects(drive(['propagate', '--lens', LENS, '--root', root, '--ids', open], env), (e) => e.code === 1 && /not landed/.test(e.message));
    await assert.rejects(drive(['propagate', '--lens', LENS, '--root', root, '--ids', 'p-000000'], env), /not a baseline-upgrade/);
    await assert.rejects(drive(['propagate', '--lens', LENS, '--root', root, '--standard', 'house:none/x'], env), /no baseline-upgrade/);
    await assert.rejects(drive(['propagate', '--lens', LENS, '--root', root, '--standard', 'house:x;rm'], env), /house line/);
    await assert.rejects(drive(['cover', '--lens', LENS, '--root', root, '--standard', 'house:table/sticky-head'], env), /belongs to propagate/);
    const pr = await drive(['propagate', '--lens', LENS, '--root', root, '--standard', 'house:table/sticky-head'], env);
    assert.ok(pr.ok, JSON.stringify(pr.jobs));
    assert.match(pr.jobs[0].run, /^r-/, 'the propagation session found its run by the job note');
    assert.deepEqual(pr.children.map((c) => [c.parent, c.feature, c.status]), [[up, 'b', 'proposed'], [up, 'c', 'proposed']], 'children wait for a person');
    const ro = openStore(dbPath, { readOnly: true });
    assert.equal(ro.prepare('SELECT phase FROM runs WHERE id = ?').get(pr.jobs[0].run).phase, 'propagate');
    ro.close();
  } finally { process.stderr.write = quiet; }
});

test('drive: an unknown flag is refused before any session starts (a --dry-run typo is not a real run)', async () => {
  const { root, dbPath, db } = repo();
  const { id: run } = runStart(db, { phase: 'propose', lenses: LENS });
  const p1 = propose(db, { run, feature: 'a', lens: LENS, title: 't1', kind: 'fix', metric: 'conf', expectedDelta: 10 }).id;
  runEnd(db, { run, status: 'done' });
  decide(db, { ids: p1, decision: 'approve', by: 'operator:jane' });
  db.close();
  const fake = join(root, 'fake-claude.mjs');
  writeFileSync(fake, FAKE);
  const env = { ...process.env, LENS_SCAN_CLAUDE_BIN: fake };
  const quiet = process.stderr.write;
  process.stderr.write = () => true;
  try {
    await assert.rejects(drive(['execute', '--lens', LENS, '--root', root, '--dry-run'], env), (e) => e.code === 2 && /unknown flag --dry-run/.test(e.message));
    await assert.rejects(drive(['cover', '--lens', LENS, '--root', root, '--feature', 'a'], env), (e) => e.code === 2 && /unknown flag --feature\b/.test(e.message));
    await assert.rejects(drive(['status', '--lens', LENS, '--root', root, '--timeout', '5'], env), /unknown flag --timeout\b/);
    const ro = openStore(dbPath, { readOnly: true });
    assert.equal(ro.prepare('SELECT COUNT(*) AS n FROM runs').get().n, 1, 'no session ran: only the fixture run exists');
    assert.equal(proposals(ro, { ids: p1 })[0].status, 'approved', 'the approved item was not built');
    ro.close();
    // execute --ids names items of the lens, as propagate --ids does: a typo or another lens's id is refused, never
    // an empty plan that reports ok
    await assert.rejects(drive(['execute', '--lens', LENS, '--root', root, '--ids', `${p1},p-000000`], env), (e) => e.code === 2 && /not an item of lens com\.x\.reg: p-000000/.test(e.message));
    const w = openStore(dbPath);
    const { id: r2 } = runStart(w, { phase: 'propose', lenses: 'other' });
    const other = propose(w, { run: r2, feature: 'a', lens: 'other', title: 'o', kind: 'baseline-upgrade' }).id;
    runEnd(w, { run: r2, status: 'done' });
    w.close();
    await assert.rejects(drive(['execute', '--lens', LENS, '--root', root, '--ids', other, '--dry'], env), new RegExp(`not an item of lens ${LENS.replace(/\./g, '\\.')}: ${other}`));
    // every documented flag is still accepted
    const ok = await drive(['execute', '--lens', LENS, '--root', root, '--dry', '--ids', p1, '--batch', '2', '--timeout-min', '30', '--model', 'm1'], env);
    assert.deepEqual(ok.plan, [`/lens-scan execute --proposals ${p1}`]);
  } finally { process.stderr.write = quiet; }
});
