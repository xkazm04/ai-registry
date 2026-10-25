// node --test "skills/takeover-app/tests/*.mjs"
// Pins the P2 coverage count GATE 1 shows: source files only, a directory entry claims what is under it, per-root
// numbers, dead paths counted, uncovered directories listed largest first.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coverage } from '../scripts/coverage.mjs';

const tracked = [
  'src/app/page.tsx', 'src/app/api/pay/route.ts', 'src/lib/db.ts', 'src/lib/money.ts',
  'api/Controllers/InvoiceController.cs', 'api/Program.cs',
  'README.md', 'package.json', 'public/logo.png', 'next.config.mjs',
];
const map = { contexts: [
  { name: 'payments', file_paths: ['src/app/api/pay', 'src/lib/money.ts'] },
  { name: 'invoices', filePaths: ['api/Controllers/'] },
  { name: 'ghost', file_paths: ['src/old/thing.ts'] },
] };

test('per-root and total coverage over source files, directory entries expand, dead paths counted', () => {
  const out = coverage(tracked, map, { uncovered: true });
  assert.deepEqual(out.totals, { tracked: 7, claimed: 3, pct: 42.9, dead_paths: 1 });
  assert.deepEqual(out.roots.find((r) => r.root === 'src'), { root: 'src', tracked: 4, claimed: 2, pct: 50 });
  assert.deepEqual(out.roots.find((r) => r.root === 'api'), { root: 'api', tracked: 2, claimed: 1, pct: 50 });
  assert.deepEqual(out.roots.find((r) => r.root === '.'), { root: '.', tracked: 1, claimed: 0, pct: 0 });
  assert.deepEqual(out.uncovered.map((u) => u.dir).sort(), ['.', 'api', 'src/app', 'src/lib']);
});

test('a nested map (groups[].contexts[], ungrouped[]) claims what the flat one does', () => {
  // adopt-bp phase 0 reads this shape as v2 (Vibeman writes it), and scan-sweep and explorer
  // flatten it; read as flat it claimed nothing, and GATE 1 showed 0% for a fully mapped repo.
  const [payments, invoices, ghost] = map.contexts;
  const nested = { groups: [{ name: 'money', contexts: [payments, invoices] }], ungrouped: [ghost] };
  assert.deepEqual(coverage(tracked, nested, { uncovered: true }), coverage(tracked, map, { uncovered: true }));
  const mixed = { contexts: [payments], groups: [{ name: 'g', contexts: [invoices] }] };
  assert.equal(coverage(tracked, mixed).totals.claimed, 3);
});

test('an empty map claims nothing and still reports', () => {
  const out = coverage(tracked, {});
  assert.equal(out.totals.claimed, 0);
  assert.equal(out.totals.pct, 0);
  assert.equal('uncovered' in out, false);
});
