// node --test skills/lens-scan/tests
// Pins the static counting rules of scripts/footprint.mjs on a tiny fixture tree, and that an
// unmeasurable metric is omitted rather than written as 0.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { packageOf, importsOf, isTest, countFootprint, main } from '../scripts/footprint.mjs';
import { openStore, runStart, latest } from '../scripts/store.mjs';

test('packageOf: bare specifiers only, package-name part', () => {
  assert.equal(packageOf('react'), 'react');
  assert.equal(packageOf('react-dom/client'), 'react-dom');
  assert.equal(packageOf('@tauri-apps/api/core'), '@tauri-apps/api');
  for (const s of ['./x', '../x', '/abs', '@/lib/x', '~/x', '#internal', 'node:fs', 'fs', 'path/posix', 'C:/x', 'virtual:mod']) assert.equal(packageOf(s), undefined, s);
});

test('importsOf: import, export-from, require, dynamic import, multi-line', () => {
  const src = [
    "import React from 'react';",
    "import type { X } from \"zod\";",
    "import {\n  a,\n  b,\n} from 'lodash/fp';",
    "import './side-effect.css';",
    "export { y } from '@scope/pkg/sub';",
    "const fs = require('fs');",
    "const m = await import('dayjs');",
    "import { z } from '@/local';",
  ].join('\n');
  assert.deepEqual([...importsOf(src)].sort(), ['@scope/pkg', 'dayjs', 'lodash', 'react', 'zod']);
});

test('isTest', () => {
  for (const p of ['src/a.test.ts', 'src/a.spec.tsx', 'src/__tests__/a.ts', 'tests/a.rs']) assert.ok(isTest(p), p);
  for (const p of ['src/attest.ts', 'src/latest/a.ts', 'src/contest.tsx']) assert.ok(!isTest(p), p);
});

test('countFootprint: loc, files, depCount, testRatioPct; absent when unmeasurable', () => {
  const r = countFootprint([
    { path: 'src/a.ts', text: "import x from 'x';\n\nexport const a = 1;\n" },
    { path: 'src/b.tsx', text: "import y from 'y';\nimport x from 'x';\n" },
    { path: 'src/a.test.ts', text: "import t from 'vitest';\n" },
    { path: 'src/gone.ts', text: undefined },
  ]);
  assert.deepEqual(r.metrics, { loc: 5, files: 3, depCount: 3, testRatioPct: 50 });
  assert.equal(r.missing, 1);
  const rust = countFootprint([{ path: 'src/lib.rs', text: 'fn main() {}\n' }]);
  assert.deepEqual(rust.metrics, { loc: 1, files: 1 }, 'no js/ts file: depCount and testRatioPct are unmeasured');
  assert.deepEqual(countFootprint([{ path: 'x.ts', text: undefined }]).metrics, {}, 'nothing on disk: no metric at all');
});

test('cli: writes through the store; --dry writes nothing', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'lens-scan-footprint-'));
  mkdirSync(join(dir, 'src'));
  writeFileSync(join(dir, 'src', 'a.ts'), "import r from 'react';\nexport default r;\n");
  writeFileSync(join(dir, 'src', 'a.test.ts'), "import { test } from 'vitest';\n");
  const structure = {
    $schema: 'app-structure/3', version: 3, project: { slug: 'x', name: 'X' },
    contexts: [{ name: 'ctx-a', file_paths: ['src/a.ts', 'src/a.test.ts'] }, { name: 'ctx-b', file_paths: ['src/missing.ts'] }],
    features: [{ slug: 'ctx-a', name: 'A', contexts: ['ctx-a'] }, { slug: 'ctx-b', name: 'B', contexts: ['ctx-b'] }],
  };
  const sp = join(dir, 'app-structure.json');
  writeFileSync(sp, JSON.stringify(structure));
  const dbPath = join(dir, 'scan.db');
  const db = openStore(dbPath);
  const { id } = runStart(db, { phase: 'measure', lenses: 'development' });
  db.close();
  const dry = await main(['--structure', sp, '--root', dir, '--db', dbPath, '--dry']);
  assert.equal(dry.written, false);
  const out = await main(['--run', id, '--structure', sp, '--root', dir, '--db', dbPath]);
  assert.deepEqual(out.features[0], { feature: 'ctx-a', loc: 3, files: 2, depCount: 2, testRatioPct: 100 });
  assert.deepEqual(out.features[1], { feature: 'ctx-b', missing_files: 1 });
  const back = openStore(dbPath);
  const rows = latest(back);
  const acts = back.prepare('SELECT kind FROM activity ORDER BY id').all().map((r) => r.kind);
  back.close();
  assert.deepEqual(rows.map((r) => [r.feature, r.metric, r.value, r.method]), [
    ['ctx-a', 'depCount', 2, 'static'], ['ctx-a', 'files', 2, 'static'], ['ctx-a', 'loc', 3, 'static'], ['ctx-a', 'testRatioPct', 100, 'static']]);
  assert.ok(rows.every((r) => r.lens === 'development' && r.evidence));
  assert.deepEqual(acts, ['reading', 'measured', 'reading', 'note']);
  await assert.rejects(main(['--run', id, '--structure', sp, '--bundle-stats', 'x.json']), /not supported/);
});
