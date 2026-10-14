// node --test skills/lens-scan/tests
// Pins the headless caller's door: store.mjs gaps (what is left), decide (a caller's recorded decision) and the
// compare-and-set on status, and drive.mjs planning and running against a fake CLI - no model, no blueprint.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { openStore, runStart, runEnd, measure, propose, proposals, proposalUpdate, gaps, decide } from '../scripts/store.mjs';
import { drive } from '../scripts/drive.mjs';

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
  const root = mkdtempSync(join(tmpdir(), 'lens-scan-drive-'));
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
import { openStore, runStart, runEnd, measure, proposalUpdate, proposals } from ${JSON.stringify(pathToFileURL(STORE).href)};
const prompt = readFileSync(0, 'utf8').trim();
const db = openStore('.ai/lens-scan/scan.db');
const m = prompt.match(/^\\/lens-scan (measure|propose|execute) --lens (\\S+)(?: --scope (\\S+))?|^\\/lens-scan execute --proposals (\\S+)/);
const phase = m[1] ?? 'execute';
const { id } = runStart(db, { phase, lenses: m[2] ?? 'x', features: m[3], knownFeatures: new Set(['a', 'b', 'c']) });
if (phase === 'measure') measure(db, id, m[3].split(',').map((f) => ({ feature: f, lens: m[2], metric: 'judged', value: 1 })));
if (m[4]) for (const p of proposals(db, { ids: m[4] })) if (p.status === 'approved') { proposalUpdate(db, { id: p.id, status: 'executing' }); proposalUpdate(db, { id: p.id, status: 'done', resultSha: 'abc1234' }); }
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
