import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT } from '../lib/exit-codes.mjs';
import { mergeRuns, acquireLock, stampOf, LOCK_NAME } from '../merge-conform-runs.mjs';

const SCRIPT = fileURLToPath(new URL('../merge-conform-runs.mjs', import.meta.url));
const CTX = '11111111-aaaa-bbbb-cccc-000000000001';
const CTX2 = '11111111-aaaa-bbbb-cccc-000000000002';

/** A project with a two-context map, a code file to anchor on, and a registry with one index. */
function fixture(fn) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'merge-conform-runs-'));
  try {
    const root = path.join(base, 'project');
    const registry = path.join(base, 'registry');
    fs.mkdirSync(path.join(root, '.ai', 'conform-runs'), { recursive: true });
    fs.mkdirSync(path.join(root, 'src'), { recursive: true });
    fs.writeFileSync(path.join(root, 'src', 'limiter.ts'), 'export const a = 1;\n\nexport function limit() { return a; }\n');
    fs.mkdirSync(path.join(registry, 'knowledge', 'software-engineering'), { recursive: true });
    fs.writeFileSync(path.join(registry, 'knowledge', 'software-engineering', 'index.json'), JSON.stringify({
      subjects: { 'rate-limiting': { digest: 'sha256-b2:new', revision: 7 }, 'retry-backoff': { digest: 'sha256-b2:rb', revision: 3 } },
    }));
    const map = {
      schema: 'registry-map/1', project: 'fixture', bundleDigests: { 'software-engineering': 'x' },
      contexts: [
        { context: CTX, name: 'Limiter', subjects: [
          { subject: 'rate-limiting', bundle: 'software-engineering', score: 900, why: ['limit'], confidence: 'strong', digest: 'sha256-b2:old', revision: 6, state: 'unknown', stale: true },
          { subject: 'retry-backoff', bundle: 'software-engineering', score: 500, why: ['retry'], confidence: 'weak', digest: 'sha256-b2:rb', revision: 3 },
        ] },
        { context: CTX2, name: 'Other', subjects: [
          { subject: 'rate-limiting', bundle: 'software-engineering', score: 100, why: ['x'], confidence: 'weak', digest: 'sha256-b2:old', revision: 6,
            state: 'deviation', evidence: 'src/limiter.ts:3 buckets by user only', evaluatedAt: '2026-10-05', evaluatedAgainst: 'sha256-b2:old', evaluatedRevision: 6 },
        ] },
      ],
    };
    fs.writeFileSync(path.join(root, '.ai', 'registry-map.json'), JSON.stringify(map, null, 2) + '\n');
    return fn({ root, registry, runs: path.join(root, '.ai', 'conform-runs') });
  } finally {
    assert.ok(path.basename(base).startsWith('merge-conform-runs-'));
    fs.rmSync(base, { recursive: true, force: true });
  }
}

const writeRun = (runs, name, run) => fs.writeFileSync(path.join(runs, name), JSON.stringify(run, null, 2));
const readMap = (root) => JSON.parse(fs.readFileSync(path.join(root, '.ai', 'registry-map.json'), 'utf8'));
const pair = (map, ctx, subject) => map.contexts.find((c) => c.context === ctx).subjects.find((s) => s.subject === subject);
const verdict = (over = {}) => ({ context: CTX, subject: 'rate-limiting', bundle: 'software-engineering', state: 'conformant', evidence: 'src/limiter.ts:3 one bucket per caller key', ...over });

test('merges a verdict: conform fields only, digest and revision from the same index entry, stale cleared, file archived', () => {
  fixture(({ root, registry, runs }) => {
    writeRun(runs, 'd-1.json', { worker: 'd-1', evaluatedAt: '2026-10-09T10:00:00Z', pairs: [verdict({ techniques: [{ technique: 't', verdict: 'deviation', evidence: 'src/limiter.ts:1 x' }] })], consults: [{ bundle: 'software-engineering', subjects: ['rate-limiting'] }] });
    const r = mergeRuns({ root, registry });
    assert.equal(r.merged, 1);
    const p = pair(readMap(root), CTX, 'rate-limiting');
    assert.equal(p.state, 'conformant');
    assert.equal(p.evaluatedAt, '2026-10-09');
    assert.equal(p.evaluatedAgainst, 'sha256-b2:new');
    assert.equal(p.evaluatedRevision, 7, 'the revision comes from the index entry the digest came from, not the map build');
    assert.equal(p.stale, undefined);
    assert.equal(p.score, 900);
    assert.deepEqual(p.why, ['limit']);
    assert.ok(fs.existsSync(path.join(runs, 'merged', 'd-1.json')));
    assert.ok(!fs.existsSync(path.join(runs, 'd-1.json')));
    const detail = JSON.parse(fs.readFileSync(path.join(root, '.ai', 'conform-detail.json'), 'utf8'));
    assert.equal(detail.pairs[`${CTX}/rate-limiting`].evaluatedTs, '2026-10-09T10:00:00.000Z');
    assert.equal(r.deviations.length, 1);
    assert.equal(fs.readFileSync(path.join(root, '.ai', 'consults.jsonl'), 'utf8').trim().split('\n').length, 1);
  });
});

test('idempotent: the same run file merged twice changes nothing, and appends no second consult line', () => {
  fixture(({ root, registry, runs }) => {
    const run = { worker: 'd-2', evaluatedAt: '2026-10-09T11:00:00Z', pairs: [verdict()], consults: [{ bundle: 'software-engineering' }] };
    writeRun(runs, 'd-2.json', run);
    mergeRuns({ root, registry });
    const mapAfter = fs.readFileSync(path.join(root, '.ai', 'registry-map.json'), 'utf8');
    const detailAfter = fs.readFileSync(path.join(root, '.ai', 'conform-detail.json'), 'utf8');
    const consultsAfter = fs.readFileSync(path.join(root, '.ai', 'consults.jsonl'), 'utf8');
    // The same bytes arrive again (a retried settle, a copy restored by hand).
    writeRun(runs, 'd-2.json', run);
    const again = mergeRuns({ root, registry });
    assert.equal(again.files[0].status, 'already-merged');
    assert.equal(fs.readFileSync(path.join(root, '.ai', 'registry-map.json'), 'utf8'), mapAfter);
    assert.equal(fs.readFileSync(path.join(root, '.ai', 'conform-detail.json'), 'utf8'), detailAfter);
    assert.equal(fs.readFileSync(path.join(root, '.ai', 'consults.jsonl'), 'utf8'), consultsAfter);
    assert.ok(!fs.existsSync(path.join(runs, 'd-2.json')), 'the duplicate is cleared, not left pending');
    // A crash between the map write and the archive: the file is pending, the map already holds it.
    fs.renameSync(path.join(runs, 'merged', 'd-2.json'), path.join(runs, 'd-2.json'));
    const replay = mergeRuns({ root, registry });
    assert.equal(replay.unchanged, 1);
    assert.equal(replay.merged, 0);
    assert.equal(fs.readFileSync(path.join(root, '.ai', 'registry-map.json'), 'utf8'), mapAfter);
    assert.equal(fs.readFileSync(path.join(root, '.ai', 'conform-detail.json'), 'utf8'), detailAfter);
  });
});

test('a lock held by a LIVE merger is respected: exit 3, the map untouched, the run file still pending', () => {
  fixture(({ root, registry, runs }) => {
    writeRun(runs, 'd-3.json', { worker: 'd-3', evaluatedAt: '2026-10-09T12:00:00Z', pairs: [verdict()] });
    const before = fs.readFileSync(path.join(root, '.ai', 'registry-map.json'), 'utf8');
    // This test process is the holder: alive for the whole child run.
    fs.writeFileSync(path.join(runs, LOCK_NAME), JSON.stringify({ pid: process.pid, at: '2026-10-09T00:00:00Z' }));
    const res = spawnSync(process.execPath, [SCRIPT, root, '--registry', registry, '--json'], { encoding: 'utf8' });
    assert.equal(res.status, EXIT.CONTENDED, res.stderr);
    assert.equal(JSON.parse(res.stdout).contended, true);
    assert.equal(fs.readFileSync(path.join(root, '.ai', 'registry-map.json'), 'utf8'), before);
    assert.ok(fs.existsSync(path.join(runs, 'd-3.json')));
    assert.ok(fs.existsSync(path.join(runs, LOCK_NAME)), 'a live holder keeps its lock however old it is');
  });
});

test('a lock whose holder is dead is taken over, and released after the merge', () => {
  fixture(({ root, registry, runs }) => {
    writeRun(runs, 'd-4.json', { worker: 'd-4', evaluatedAt: '2026-10-09T12:00:00Z', pairs: [verdict()] });
    fs.writeFileSync(path.join(runs, LOCK_NAME), JSON.stringify({ pid: 2 ** 30, at: new Date().toISOString() }));
    const res = spawnSync(process.execPath, [SCRIPT, root, '--registry', registry, '--json'], { encoding: 'utf8' });
    assert.equal(res.status, EXIT.OK, res.stderr);
    assert.equal(JSON.parse(res.stdout).merged, 1);
    assert.ok(!fs.existsSync(path.join(runs, LOCK_NAME)));
  });
});

test('acquireLock: a second taker waits, then reports the holder', () => {
  fixture(({ runs }) => {
    const lockPath = path.join(runs, LOCK_NAME);
    const first = acquireLock(lockPath);
    assert.equal(first.ok, true);
    const second = acquireLock(lockPath, { waitMs: 50, pollMs: 10 });
    assert.equal(second.ok, false);
    assert.equal(second.holder.pid, process.pid);
    first.release();
    assert.equal(acquireLock(lockPath).ok, true);
  });
});

test('conflicting verdicts on one pair: the newer wins whatever the file order, and the older is recorded', () => {
  fixture(({ root, registry, runs }) => {
    // File names sort the NEWER verdict first, so arrival order and time order disagree.
    writeRun(runs, 'a-newer.json', { worker: 'w-new', evaluatedAt: '2026-10-09T15:00:00Z', pairs: [verdict({ state: 'deviation', evidence: 'src/limiter.ts:3 still buckets by user id' })] });
    writeRun(runs, 'b-older.json', { worker: 'w-old', evaluatedAt: '2026-10-09T09:00:00Z', pairs: [verdict({ state: 'conformant' })] });
    const r = mergeRuns({ root, registry });
    const p = pair(readMap(root), CTX, 'rate-limiting');
    assert.equal(p.state, 'deviation');
    assert.equal(r.conflicts.length, 1);
    assert.equal(r.conflicts[0].kept.state, 'deviation');
    assert.equal(r.conflicts[0].lost.state, 'conformant');
    const sup = JSON.parse(fs.readFileSync(path.join(root, '.ai', 'conform-detail.json'), 'utf8')).pairs[`${CTX}/rate-limiting`].superseded;
    assert.equal(sup.length, 1);
    assert.equal(sup[0].state, 'conformant');
    assert.equal(sup[0].worker, 'w-old');
  });
});

test('an incoming verdict older than the one the map holds never overwrites it, and is recorded', () => {
  fixture(({ root, registry, runs }) => {
    // CTX2's pair was judged deviation on 2026-10-05; this run judged it a week earlier.
    writeRun(runs, 'old-wave.json', { worker: 'c0928', evaluatedAt: '2026-09-28', pairs: [verdict({ context: CTX2, state: 'conformant' })] });
    const r = mergeRuns({ root, registry });
    const p = pair(readMap(root), CTX2, 'rate-limiting');
    assert.equal(p.state, 'deviation');
    assert.equal(p.evaluatedAt, '2026-10-05');
    assert.equal(r.older, 1);
    const entry = JSON.parse(fs.readFileSync(path.join(root, '.ai', 'conform-detail.json'), 'utf8')).pairs[`${CTX2}/rate-limiting`];
    assert.equal(entry.superseded[0].state, 'conformant');
    // And reapplying it is still a no-op on the record: superseded entries are not duplicated.
    mergeRuns({ root, registry, reapply: true });
    const again = JSON.parse(fs.readFileSync(path.join(root, '.ai', 'conform-detail.json'), 'utf8')).pairs[`${CTX2}/rate-limiting`];
    assert.equal(again.superseded.length, 1);
  });
});

test('floors: unknown never overwrites, a blank-line anchor is refused, a half-written file waits, no pair is added', () => {
  fixture(({ root, registry, runs }) => {
    writeRun(runs, 'f.json', { worker: 'f', evaluatedAt: '2026-10-09T10:00:00Z', pairs: [
      verdict({ context: CTX2, state: 'unknown' }),
      verdict({ subject: 'retry-backoff', evidence: 'src/limiter.ts:2 blank' }),
      verdict({ subject: 'no-such-subject' }),
      verdict({ context: 'Limiter', subject: 'retry-backoff', state: 'not-applicable', evidence: 'src/limiter.ts:3 no retry loop here' }),
    ] });
    fs.writeFileSync(path.join(runs, 'partial.json'), '{"worker": "p", "pairs": [');
    const r = mergeRuns({ root, registry });
    const map = readMap(root);
    assert.equal(pair(map, CTX2, 'rate-limiting').state, 'deviation', 'unknown left the verdict alone');
    assert.equal(pair(map, CTX, 'retry-backoff').state, 'not-applicable', 'a context named exactly resolves');
    assert.equal(map.contexts[0].subjects.length, 2, 'no pair added');
    assert.equal(r.merged, 1);
    assert.equal(r.skipped.length, 2);
    assert.equal(r.files.find((f) => f.file === 'partial.json').status, 'incomplete');
    assert.ok(fs.existsSync(path.join(runs, 'partial.json')), 'a half-written file is left for the next merge');
  });
});

test('--only merges just the named file; --reapply restores verdicts a revert took away', () => {
  fixture(({ root, registry, runs }) => {
    const pristine = fs.readFileSync(path.join(root, '.ai', 'registry-map.json'), 'utf8');
    writeRun(runs, 'x.json', { worker: 'x', evaluatedAt: '2026-10-09T10:00:00Z', pairs: [verdict()] });
    writeRun(runs, 'y.json', { worker: 'y', evaluatedAt: '2026-10-09T10:00:00Z', pairs: [verdict({ subject: 'retry-backoff', state: 'deviation', evidence: 'src/limiter.ts:1 no backoff' })] });
    const r = mergeRuns({ root, registry, only: ['x.json'] });
    assert.equal(r.merged, 1);
    assert.ok(fs.existsSync(path.join(runs, 'y.json')));
    mergeRuns({ root, registry });
    const merged = fs.readFileSync(path.join(root, '.ai', 'registry-map.json'), 'utf8');
    // Something reverts the tracked map (a hook stash that failed to restore, a checkout).
    fs.writeFileSync(path.join(root, '.ai', 'registry-map.json'), pristine);
    const back = mergeRuns({ root, registry, reapply: true });
    assert.equal(back.merged, 2);
    assert.equal(fs.readFileSync(path.join(root, '.ai', 'registry-map.json'), 'utf8'), merged);
  });
});

test('bad input is FATAL (exit 2), not a silent zero', () => {
  fixture(({ root, registry }) => {
    fs.writeFileSync(path.join(root, '.ai', 'registry-map.json'), '{"contexts": 1}');
    const res = spawnSync(process.execPath, [SCRIPT, root, '--registry', registry], { encoding: 'utf8' });
    assert.equal(res.status, EXIT.FATAL);
    const noRoot = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
    assert.equal(noRoot.status, EXIT.FATAL);
  });
});

test('stampOf orders a date-only stamp at the start of its day', () => {
  assert.equal(stampOf('2026-10-09'), Date.parse('2026-10-09T00:00:00Z'));
  assert.ok(stampOf('2026-10-09T00:00:01Z') > stampOf('2026-10-09'));
  assert.equal(stampOf(''), null);
  assert.equal(stampOf('not a date'), null);
});
