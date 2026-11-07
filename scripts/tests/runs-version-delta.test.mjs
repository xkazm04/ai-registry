/**
 * Tests for the version-over-version view of runs-report (--skill X): semver ordering,
 * per-version mix, measured and estimated tokens kept apart, and the insufficient rule.
 * The lane is a fixture in os.tmpdir(); the real usage/runs/ is never read.
 */
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildReport } from '../runs-report.mjs';
import { versionDeltas, compareSemver, MIN_RUNS_FOR_VERSION_DELTA } from '../lib/runs-aggregate.mjs';

const made = [];
after(() => { for (const d of made) fs.rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });
const NOW = Date.parse('2026-11-01T00:00:00Z');
let n = 0;
const row = (version, outcome, difficulty, tokensEst, over = {}) => ({
  schema: 'rkb-run/1', id: `r${n++}`, ts: `2026-10-${String(1 + (n % 27)).padStart(2, '0')}T10:00:00Z`, project: 'demo', skill: 'spark', version,
  device: 'Box', provider: 'claude', outcome, difficulty, tokensEst, ...over,
});
const exact = (id, output) => ({ schema: 'rkb-run-exact/1', id, session: 's', model: 'm', effort: 'high', input: 0, cacheWrite: 0, cacheRead: 5, output, matched: 'skill-call' });

function lane() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'runs-vdelta-'));
  made.push(root);
  // 1.9.0: 4 runs; 1.10.0: 4 runs (semver, not lexical, order); 2.0.0: 2 runs = insufficient; other skill ignored.
  const rows = [
    row('1.9.0', 'shipped', 4, 100), row('1.9.0', 'shipped', 4, 120), row('1.9.0', 'failed', 5, 140), row('1.9.0', 'partial', 3, 160),
    row('1.10.0', 'shipped', 2, 80), row('1.10.0', 'shipped', 3, 90), row('1.10.0', 'shipped', 3, 100), row('1.10.0', 'parked', 4, 110),
    row('2.0.0', 'shipped', 1, 10), row('2.0.0', 'aborted', 1, 10),
    row('1.10.0', 'shipped', 1, 1, { skill: 'other' }),
  ];
  fs.mkdirSync(path.join(root, 'usage', 'runs'), { recursive: true });
  fs.writeFileSync(path.join(root, 'usage', 'runs', 'Box.jsonl'), rows.map((r) => `${JSON.stringify(r)}\n`).join(''));
  // Measured tokens exist for the two 1.10.0 shipped runs and 1.9.0's first two: exact medians 200 vs 150.
  const sidecar = [exact(rows[0].id, 190), exact(rows[1].id, 210), exact(rows[4].id, 140), exact(rows[5].id, 160)];
  fs.writeFileSync(path.join(root, 'usage', 'runs', 'Box.exact.jsonl'), sidecar.map((r) => `${JSON.stringify(r)}\n`).join(''));
  return root;
}

test('versions sort by semver, the insufficient one is marked, and deltas are later minus earlier', () => {
  const rep = buildReport({ registryRoot: lane(), sinceDays: 365, skill: 'spark', now: NOW });
  const vd = rep.versionDelta;
  assert.equal(vd.minRuns, MIN_RUNS_FOR_VERSION_DELTA);
  assert.equal(MIN_RUNS_FOR_VERSION_DELTA, 3);
  assert.deepEqual(vd.versions.map((v) => [v.version, v.runs, v.insufficient]), [['1.9.0', 4, false], ['1.10.0', 4, false], ['2.0.0', 2, true]]);
  const [a, b, c] = vd.versions;
  assert.deepEqual(a.outcomes, { shipped: 2, partial: 1, 'no-op': 0, parked: 0, failed: 1, aborted: 0 });
  assert.equal(a.shippedShare, 0.5);
  assert.equal(b.shippedShare, 0.75);
  assert.equal(a.difficultyMedian, 4);
  assert.equal(b.difficultyMedian, 3);
  assert.deepEqual(a.tokensExact, { median: 200, n: 2 });
  assert.deepEqual(b.tokensExact, { median: 150, n: 2 });
  assert.deepEqual(a.tokensEstimate, { median: 130, n: 4 });
  assert.deepEqual(b.tokensEstimate, { median: 95, n: 4 });
  assert.deepEqual(c.tokensExact, { median: null, n: 0 });
  assert.deepEqual(vd.deltas[0], {
    from: '1.9.0', to: '1.10.0', insufficient: false,
    shippedShare: 0.25, difficultyMedian: -1, tokensExact: -50, tokensEstimate: -35,
  });
  assert.equal(vd.deltas[1].insufficient, true);
  assert.equal(vd.deltas[1].shippedShare, undefined, 'no delta claim against an insufficient version');
});

test('measured and estimated medians are never mixed: a version with no measured runs has no measured delta', () => {
  const stats = {
    'x@1.0.0': { versions: ['1.0.0'], runs: 3, outcomes: { shipped: 3 }, entries: [{ difficulty: 2 }, { difficulty: 2 }, { difficulty: 2 }], medianExact: 100, exactCount: 3, medianEst: 999, estCount: 3 },
    'x@1.1.0': { versions: ['1.1.0'], runs: 3, outcomes: { shipped: 3 }, entries: [{ difficulty: 2 }, { difficulty: 2 }, { difficulty: 2 }], medianExact: null, exactCount: 0, medianEst: 500, estCount: 3 },
  };
  const d = versionDeltas(stats).deltas[0];
  assert.equal(d.tokensExact, null);
  assert.equal(d.tokensEstimate, -499);
});

test('minRuns is the threshold: exactly N runs is sufficient, N-1 is not', () => {
  const mk = (runs) => ({ versions: ['1.0.0'], runs, outcomes: {}, entries: [], medianExact: null, exactCount: 0, medianEst: null, estCount: 0 });
  const v = versionDeltas({ a: { ...mk(2), versions: ['1.0.0'] }, b: { ...mk(3), versions: ['1.1.0'] } }, { minRuns: 3 }).versions;
  assert.deepEqual(v.map((x) => x.insufficient), [true, false]);
});

test('without --skill there is no versionDelta; compareSemver orders numerically with prereleases below releases', () => {
  const root = lane();
  assert.equal(buildReport({ registryRoot: root, sinceDays: 365, now: NOW }).versionDelta, undefined);
  assert.ok(compareSemver('1.10.0', '1.9.0') > 0);
  assert.ok(compareSemver('1.0.0-rc.1', '1.0.0') < 0);
  assert.equal(compareSemver('1.2', '1.2.0'), 0);
});

test('the CLI prints the version section and --json carries versionDelta', () => {
  const root = lane();
  const script = fileURLToPath(new URL('../runs-report.mjs', import.meta.url));
  const text = spawnSync(process.execPath, [script, '--root', root, '--skill', 'spark', '--since', '3650d'], { encoding: 'utf8' });
  assert.equal(text.status, 0, text.stderr);
  assert.match(text.stdout, /# versions, oldest to newest/);
  assert.match(text.stdout, /2\.0\.0.*\[insufficient\]/);
  assert.match(text.stdout, /1\.9\.0 -> 1\.10\.0: shipped share \+25 pts/);
  assert.match(text.stdout, /1\.10\.0 -> 2\.0\.0: insufficient/);
  const json = spawnSync(process.execPath, [script, '--root', root, '--skill', 'spark', '--since', '3650d', '--json'], { encoding: 'utf8' });
  assert.equal(JSON.parse(json.stdout).versionDelta.versions.length, 3);
});
