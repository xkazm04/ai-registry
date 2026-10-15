// node --test skills/lens-scan/tests
// Pins the static counting rules of scripts/footprint.mjs on a tiny fixture tree, and that an
// unmeasurable metric is omitted rather than written as 0.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { packageOf, importsOf, isTest, countFootprint, countPatterns, expandPaths, featureFiles, stemOf, main, UNITS } from '../scripts/footprint.mjs';
import { readFileSync } from 'node:fs';
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
  assert.deepEqual(r.metrics, { loc: 5, files: 3, depCount: 3, testRatioPct: 25 }, 'test lines (1) over source lines (4)');
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
  assert.deepEqual(out.features[0], { feature: 'ctx-a', loc: 3, files: 2, depCount: 2, testRatioPct: 50 });
  assert.deepEqual(out.features[1], { feature: 'ctx-b', missing_files: 1 });
  const back = openStore(dbPath);
  const rows = latest(back);
  const acts = back.prepare('SELECT kind FROM activity ORDER BY id').all().map((r) => r.kind);
  back.close();
  assert.deepEqual(rows.map((r) => [r.feature, r.metric, r.value, r.method]), [
    ['ctx-a', 'depCount', 2, 'static'], ['ctx-a', 'files', 2, 'static'], ['ctx-a', 'loc', 3, 'static'], ['ctx-a', 'testRatioPct', 50, 'static']]);
  assert.ok(rows.every((r) => r.lens === 'development' && r.evidence));
  assert.deepEqual(acts, ['reading', 'measured', 'reading', 'note']);
  await assert.rejects(main(['--run', id, '--structure', sp, '--bundle-stats', 'x.json']), /not supported/);
});

test('testRatioPct: repo tests named after a source file count; capped at 100', () => {
  const src = [{ path: 'src/editor/Editor.tsx', text: 'a\nb\nc\nd\n' }];
  const repoTests = [{ path: 'src/__tests__/editor.test.tsx', text: 'x\ny\n' }, { path: 'src/__tests__/other.test.tsx', text: 'z\n' }];
  assert.equal(countFootprint(src, { repoTests }).metrics.testRatioPct, 50, 'only the test whose stem names a source file');
  assert.equal(countFootprint(src, { repoTests: [{ path: 't/Editor.spec.ts', text: 'x\n'.repeat(9) }] }).metrics.testRatioPct, 100, 'capped');
  assert.equal(stemOf('src/__tests__/Foo.spec.ts'), 'foo');
});

test('countPatterns: secrets and sinks over non-test files, raw colours over UI files, no_ui', () => {
  const r = countPatterns([
    { path: 'src/api.ts', text: "eval(x); const k = 'AKIAABCDEFGHIJKLMNOP';\n" },
    { path: 'src/View.tsx', text: "<div style={{ color: '#ff0000', background: 'rgb(1,2,3)' }} dangerouslySetInnerHTML={h} />\n" },
    { path: 'src/api.test.ts', text: 'eval(y)\n' },
  ]);
  assert.deepEqual(r.security, { secretHits: 1, unsafeSinks: 2 });
  assert.deepEqual(r.design, { rawLiterals: 2 });
  assert.equal(countPatterns([{ path: 'src/lib.ts', text: 'x\n' }]).noUi, true);
});

test('expandPaths and featureFiles: directory entries expand; the structure code tree names win', () => {
  const dir = mkdtempSync(join(tmpdir(), 'lens-scan-expand-'));
  mkdirSync(join(dir, 'src', 'x'), { recursive: true });
  writeFileSync(join(dir, 'src', 'x', 'a.ts'), 'a\n');
  writeFileSync(join(dir, 'src', 'x', 'b.ts'), 'b\n');
  assert.deepEqual(expandPaths(['src/x/', 'src/gone.ts'], dir).sort(), ['src/gone.ts', 'src/x/a.ts', 'src/x/b.ts']);
  const structure = { contexts: [{ name: 'x-renamed', file_paths: ['src/x'] }], features: [{ slug: 'f', contexts: ['x-renamed'] }, { slug: 'old', contexts: ['x-renamed'], status: 'archived' }] };
  const map = { contexts: [{ name: 'x', file_paths: ['nope.ts'] }] };
  assert.deepEqual(featureFiles(structure, map, dir), [{ slug: 'f', files: ['src/x/a.ts', 'src/x/b.ts'] }]);
});

test('UNITS: every metric of the performance lens carries the unit references/metrics.md gives it', () => {
  const md = readFileSync(new URL('../references/metrics.md', import.meta.url), 'utf8');
  const section = md.split('\n## performance')[1].split('\n## ')[0];
  const rows = [...section.matchAll(/^\| `([a-zA-Z0-9]+)` \| ([^|]+?) \|/gm)].map((m) => [m[1], m[2].trim()]);
  assert.ok(rows.length >= 5, 'the performance table lists its metrics');
  for (const [metric, unit] of rows) assert.equal(UNITS[metric], unit, metric);
});
