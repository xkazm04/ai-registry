import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkReport, parseAnchors } from '../check-anchors.mjs';

// Every temp dir this file makes is removed when its tests are done: on 2026-10-15 these
// suites had left hundreds in the OS temp dir (hygiene disk lane, temp-leak rows).
const madeDirs = [];
const mkdtempTracked = (prefix) => { const d = fs.mkdtempSync(prefix); madeDirs.push(d); return d; };
after(() => { for (const d of madeDirs) fs.rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });

const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'check-anchors.mjs');

function tree() {
  const root = mkdtempTracked(path.join(os.tmpdir(), 'check-anchors-'));
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

// A ratio or a version tag is not a file. The corpus carries 40 of these (`4.11:1`
// contrast, `qwen3.8:27`), and each one parsed as an anchor to a file named `4.11`, so a
// clean document checked with --root failed as missing-file.
test('a number-dot-number before a colon is not an anchor; an extension with a letter still is', () => {
  const a = parseAnchors('WCAG asks 4.5:1 and the tag qwen2.5:14 ran at 1.25:1, see clip.mp4:3 and src/gate.ts:3');
  assert.deepEqual(a.map(({ file, start }) => `${file}:${start}`), ['clip.mp4:3', 'src/gate.ts:3']);
  const root = tree();
  const prose = path.join(root, 'prose.md');
  fs.writeFileSync(prose, 'Body text needs a contrast of 4.5:1, per src/gate.ts:1 "LIMIT = 12".\n');
  const r = spawnSync(process.execPath, [script, prose, '--root', root], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /anchors=1 held=1/);
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

// Seeded canary (2026-10-25 gates scan): a report with no anchors read green under
// --strict, the mode whose contract is that every claim carries a quoted anchor.
test('--strict over a report with zero anchors is could-not-run (2); plain mode stays a note (0)', () => {
  const root = tree();
  const none = path.join(root, 'none.md');
  fs.writeFileSync(none, 'No anchors in this report, just prose citing the gate.\n');
  const strict = spawnSync(process.execPath, [script, none, '--root', root, '--strict'], { encoding: 'utf8' });
  assert.equal(strict.status, 2);
  assert.match(strict.stderr, /walked 0 anchors/);
  assert.equal(spawnSync(process.execPath, [script, none, '--root', root]).status, 0);
  // control: a strict report whose anchors are all quoted and held still passes
  const held = path.join(root, 'held.md');
  fs.writeFileSync(held, 'src/gate.ts:1 "LIMIT = 12"\n');
  assert.equal(spawnSync(process.execPath, [script, held, '--root', root, '--strict']).status, 0);
});
