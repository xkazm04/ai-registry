// node --test skills/scan-sweep/tests/coverage.test.mjs
// Pins the two rules scripts/coverage.mjs owns alone: the --challenge cohort
// (references/challenge.md section 2) and that challenge lenses/snapshots never
// inflate the stabilize coverage ledger.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../scripts/coverage.mjs', import.meta.url));
const files = (n) => Array.from({ length: n }, (_, i) => `src/f${i}.ts`);

function fixture(history) {
  const dir = mkdtempSync(join(tmpdir(), 'scan-sweep-cov-'));
  writeFileSync(join(dir, 'context-map.json'), JSON.stringify({
    contexts: [
      { name: 'tiny', group: 'G1', file_paths: files(4) },
      { name: 'big-g1', group: 'G1', file_paths: files(30) },
      { name: 'mid-g1', group: 'G1', file_paths: files(20) },
      { name: 'big-g2', group: 'G2', file_paths: files(25) },
      { name: 'done-g3', group: 'G3', file_paths: files(40) },
      { name: 'fresh-g3', group: 'G3', file_paths: files(12) },
    ],
  }));
  mkdirSync(join(dir, '.claude', 'scan-history'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'scan-history', 'scan-sweep.jsonl'), history.map((h) => JSON.stringify(h)).join('\n') + '\n');
  return dir;
}
const run = (dir, ...args) => JSON.parse(execFileSync(process.execPath, [SCRIPT, ...args, '--json'], { cwd: dir, encoding: 'utf8' }));

test('cohort: >= 10 files, one per group, never-challenged and larger first', () => {
  const dir = fixture([
    { at: '2026-09-01T00:00:00Z', scope: 'done-g3', strategy: 'challenge', lens_keys: ['architecture-challenger', 'ux-elevation'] },
  ]);
  const { cohort } = run(dir, '--challenge', '--cohort', '6');
  assert.deepEqual(cohort.map((c) => c.name), ['big-g1', 'big-g2', 'fresh-g3']);
  assert.ok(!cohort.some((c) => c.name === 'tiny'));
});

test('cohort: --group lifts the one-per-group rule inside that group', () => {
  const { cohort } = run(fixture([]), '--challenge', '--group', 'G1');
  assert.deepEqual(cohort.map((c) => c.name), ['big-g1', 'mid-g1']);
});

test('challenge snapshots and lenses never count as stabilize coverage', () => {
  const dir = fixture([
    { at: '2026-09-01T00:00:00Z', scope: 'big-g2', strategy: 'challenge', lens_keys: ['architecture-challenger', 'ux-elevation'], findings: 2, fixed: 2 },
  ]);
  const out = run(dir);
  const row = out.rows.find((r) => r.name === 'big-g2');
  assert.equal(row.sweeps, 0, 'a challenge run must not make a context read as swept');
  assert.equal(row.lenses, 0);
  const ref = readFileSync(new URL('../references/lenses.md', import.meta.url), 'utf8');
  const all = (ref.match(/^## [a-z-]+ /gm) ?? []).length;
  const challenge = (ref.match(/^Group: challenge\s*$/gm) ?? []).length;
  assert.ok(challenge >= 2, 'the two challenge lenses are declared');
  assert.equal(run(dir, '--next').totalLenses, all - challenge, 'denominator excludes the Group: challenge lenses');
});
