// Seek-stability lint (ported from stat-reel): the kit's Remotion sources are clean, and a planted
// clock / RNG / state / CSS animation in a consumer local/ hero is caught.
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { KIT_REMOTION, lintSources, sourceFiles } from '../tools/check.mjs';

test('scans the kit Remotion tree', () => {
  const files = sourceFiles(KIT_REMOTION);
  for (const f of ['Film.tsx', 'timeline.ts', 'Callout.tsx', 'DeviceFrame.tsx', 'index.tsx']) assert.ok(files.some((x) => x.endsWith(f)), f);
});

test('the kit is frame-pure', () => {
  assert.deepEqual(lintSources([KIT_REMOTION]), []);
});

test('planted violations in a local hero are each caught; comments may name them', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'df-lint-'));
  try {
    const src = [
      '// Math.random and useState are banned (this comment is fine)',
      'export const a = Math.random();',
      'export const b = Date.now();',
      "import { useState, useEffect } from 'react';",
      "export const s = { animation: 'spin 1s' };",
      'setTimeout(() => 0, 1);',
    ];
    writeFileSync(path.join(dir, 'index.tsx'), src.join('\n'));
    const hits = lintSources([dir]);
    for (const n of ['Math.random', 'Date.now', 'useEffect', 'useState', 'CSS animation', 'setTimeout/setInterval'])
      assert.ok(hits.some((h) => h.includes(` ${n}: `)), n);
    assert.ok(!hits.some((h) => /index\.tsx:1 /.test(h)), 'comment line not flagged');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
