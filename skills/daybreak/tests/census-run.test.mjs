// The first pilot finished clean over 18% of the source, so scope is what these pin.
import test from 'node:test';
import assert from 'node:assert/strict';
import { inScope, partition, subjectsFor, standardFiles } from '../scripts/census-run.mjs';

test('standardFiles finds the golden path and the cited technique, or nothing', () => {
  const search = () => [{ subject: 'table', technique: 'pagination', path: 'knowledge/x/table/techniques/pagination.md' }];
  assert.deepEqual(standardFiles('table/pagination', search, () => true), { dir: 'knowledge/x/table', files: ['knowledge/x/table/table.md', 'knowledge/x/table/techniques/pagination.md'] });
  assert.deepEqual(standardFiles('table', search, (f) => f.endsWith('table.md')).files, ['knowledge/x/table/table.md']);
  assert.equal(standardFiles('nothing-here', search, () => true), null);
  assert.equal(standardFiles(null, search, () => true), null);
});

test('product source is in scope; tests, generated code and tooling dirs are not', () => {
  for (const f of ['src/components/kit/DataTable.tsx', 'src/lib/db/client.ts', 'scripts/build.mjs', 'app/main.py']) assert.equal(inScope(f), true, f);
  for (const f of ['src/a.test.ts', 'src/a.spec.tsx', 'src/types.d.ts', 'src/__tests__/a.ts', 'tests/a.ts', 'e2e/a.ts', '.claude/x.mjs', 'node_modules/a/b.js', 'dist/a.js', 'README.md', 'data.json', 'src/a.stories.tsx']) assert.equal(inScope(f), false, f);
});

test('partition keeps every file exactly once, under both budgets', () => {
  const files = [...Array(95).keys()].map((i) => ({ path: `src/d${i % 7}/f${i}.ts`, bytes: 5000 }));
  const chunks = partition(files, { maxFiles: 30, maxBytes: 100000 });
  assert.deepEqual(chunks.flatMap((c) => c.files).sort(), files.map((f) => f.path).sort());
  for (const c of chunks) { assert.ok(c.files.length <= 30); assert.ok(c.bytes <= 100000); }
  assert.equal(new Set(chunks.map((c) => c.id)).size, chunks.length);
});

test('an oversized file is kept, alone', () => {
  const chunks = partition([{ path: 'a/big.ts', bytes: 900000 }, { path: 'a/small.ts', bytes: 10 }], { maxBytes: 1000 });
  assert.equal(chunks.length, 2);
  assert.deepEqual(chunks[0].files, ['a/big.ts']);
});

test('subjectsFor matches by file or directory, keeps the best score, and caps', () => {
  const contexts = [
    { paths: ['src/a/x.ts'], subjects: [{ subject: 's1', score: 5 }, { subject: 's2', score: 1 }] },
    { paths: ['src/a/other.ts'], subjects: [{ subject: 's1', score: 9 }] },
    { paths: ['lib/none.ts'], subjects: [{ subject: 'far', score: 99 }] },
  ];
  const got = subjectsFor({ files: ['src/a/x.ts'] }, contexts);
  assert.deepEqual(got.map((s) => s.subject), ['s1', 's2']);
  assert.equal(got[0].score, 9);
  assert.equal(subjectsFor({ files: ['src/a/x.ts'] }, contexts, 1).length, 1);
  assert.deepEqual(subjectsFor({ files: ['q/z.ts'] }, contexts), []);
});
