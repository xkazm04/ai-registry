import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkReport, parseAnchors } from '../check-anchors.mjs';

const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'check-anchors.mjs');

function tree() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-anchors-'));
  fs.mkdirSync(path.join(root, 'src'));
  fs.writeFileSync(
    path.join(root, 'src', 'gate.ts'),
    ['export const LIMIT = 12;', 'function decide(x) {', '  return x > LIMIT;', '}', '// tail'].join('\n'),
  );
  return root;
}

test('parses quoted, unquoted and ranged anchors and skips URLs', () => {
  const a = parseAnchors(
    'see `src/gate.ts:3 "return x > LIMIT"` and src/gate.ts:2-4 and https://example.com/a.md:12 and README.md:1',
  );
  assert.deepEqual(
    a.map(({ file, start, end, quote }) => ({ file, start, end, quote })),
    [
      { file: 'src/gate.ts', start: 3, end: 3, quote: 'return x > LIMIT' },
      { file: 'src/gate.ts', start: 2, end: 4, quote: null },
      { file: 'README.md', start: 1, end: 1, quote: null },
    ],
  );
});

test('verdicts: held, unquoted, moved, absent, past-eof, missing-file', () => {
  const root = tree();
  const report = [
    'src/gate.ts:3 "return x > LIMIT"',
    'src/gate.ts:1 "function decide"',
    'src/gate.ts:2 "nothing like this"',
    'src/gate.ts:40 "tail"',
    'src/nope.ts:1 "x"',
    'src/gate.ts:5',
  ].join('\n');
  const r = checkReport(report, root);
  assert.deepEqual(
    r.anchors.map((x) => x.verdict),
    ['held', 'quote-moved', 'quote-absent', 'past-eof', 'missing-file', 'unquoted'],
  );
  assert.equal(r.anchors[1].foundAt, 2);
});

test('whitespace is normalized inside a quote', () => {
  const root = tree();
  const r = checkReport('src/gate.ts:2-3 "decide(x) {   return x"', root);
  assert.equal(r.anchors[0].verdict, 'held');
});

test('exit codes: 0 all held, 1 a failing anchor, 2 usage', () => {
  const root = tree();
  const ok = path.join(root, 'ok.md');
  fs.writeFileSync(ok, 'src/gate.ts:1 "LIMIT = 12" and src/gate.ts:4');
  assert.equal(spawnSync(process.execPath, [script, ok, '--root', root]).status, 0);
  assert.equal(spawnSync(process.execPath, [script, ok, '--root', root, '--strict']).status, 1);
  const bad = path.join(root, 'bad.md');
  fs.writeFileSync(bad, 'src/gate.ts:1 "LIMIT = 13"');
  assert.equal(spawnSync(process.execPath, [script, bad, '--root', root]).status, 1);
  assert.equal(spawnSync(process.execPath, [script, bad]).status, 2);
});
