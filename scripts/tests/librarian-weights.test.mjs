// librarian-scan --check-weights / --stamp-weights. The 2026-10-25 gates probe found a
// second, drifted stamped block passing (only the first was read) and a CRLF standard.md
// reading as drift. The script resolves librarian/standard.md from its own location, so
// each case runs a copy of it in a temp registry holding a copy of the real standard.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const OPEN = '<!-- weights: stamped by scripts/librarian-scan.mjs --weights; edit the script, then re-stamp -->';
const CLOSE = '<!-- /weights -->';

function registry(t, mutate = (s) => s) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'librarian-weights-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.cpSync(path.join(root, 'scripts/lib'), path.join(dir, 'scripts/lib'), { recursive: true });
  fs.copyFileSync(path.join(root, 'scripts/librarian-scan.mjs'), path.join(dir, 'scripts/librarian-scan.mjs'));
  fs.mkdirSync(path.join(dir, 'knowledge'));
  fs.mkdirSync(path.join(dir, 'skills'));
  fs.writeFileSync(path.join(dir, 'identity-aliases.json'), JSON.stringify({ schema: 1 }));
  fs.mkdirSync(path.join(dir, 'librarian'));
  const standard = fs.readFileSync(path.join(root, 'librarian/standard.md'), 'utf8').replace(/\r\n/g, '\n');
  fs.writeFileSync(path.join(dir, 'librarian/standard.md'), mutate(standard));
  return dir;
}
const run = (dir, flag) => spawnSync(process.execPath, [path.join(dir, 'scripts/librarian-scan.mjs'), flag], { encoding: 'utf8' });
const standardOf = (dir) => fs.readFileSync(path.join(dir, 'librarian/standard.md'), 'utf8');
const stampedBlock = (s) => s.slice(s.indexOf(OPEN), s.indexOf(CLOSE) + CLOSE.length);
const drifted = (s) => `${s}\n${stampedBlock(s).replace(/\| (\d+)/, (m, n) => `| ${Number(n) + 7}`)}\n`;

test('clean control: an LF copy of the standard checks clean (exit 0)', (t) => {
  const r = run(registry(t), '--check-weights');
  assert.equal(r.status, 0, r.stderr);
});

test('a CRLF standard.md is not drift (exit 0), and stamping keeps its CRLF', (t) => {
  const dir = registry(t, (s) => s.replace(/\n/g, '\r\n'));
  assert.equal(run(dir, '--check-weights').status, 0);
  fs.writeFileSync(path.join(dir, 'librarian/standard.md'), standardOf(dir).replace(/\| (\d+)/, '| 999'));
  assert.equal(run(dir, '--check-weights').status, 1, 'a real drift still fails under CRLF');
  assert.equal(run(dir, '--stamp-weights').status, 0);
  assert.equal(run(dir, '--check-weights').status, 0);
  assert.ok(!/[^\r]\n/.test(standardOf(dir)), 'every line still ends in CRLF');
});

test('a second, drifted stamped block fails --check-weights (exit 1)', (t) => {
  const dir = registry(t, drifted);
  const r = run(dir, '--check-weights');
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /2 open and 2 close weights marker/);
});

test('--stamp-weights refuses to guess over two blocks (exit 2) and writes nothing', (t) => {
  const dir = registry(t, drifted);
  const before = standardOf(dir);
  assert.equal(run(dir, '--stamp-weights').status, 2);
  assert.equal(standardOf(dir), before);
});
