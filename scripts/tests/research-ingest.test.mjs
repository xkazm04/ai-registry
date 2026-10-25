// research-ingest over sources that never leave the machine: files in a temp dir and, where
// the web branch is the subject, a loopback HTTP server. Nothing here reaches the network -
// a youtube or public URL is never passed to the script.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../research-ingest.mjs', import.meta.url));

function workdir(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'research-ingest-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
const run = (args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8', timeout: 30000 });

test('control: a thin file exits 3 (the source is thin, the instrument worked)', (t) => {
  const dir = workdir(t);
  fs.writeFileSync(path.join(dir, 'thin.txt'), 'three little words');
  const r = run([path.join(dir, 'thin.txt'), '--out', path.join(dir, 'out')]);
  assert.equal(r.status, 3, r.stderr);
  assert.match(r.stderr, /SOURCE TOO THIN: 3 words < --min-words 300/);
});

test('--min-words that is not a whole number refuses (exit 2) instead of silencing the thin check', (t) => {
  const dir = workdir(t);
  fs.writeFileSync(path.join(dir, 'thin.txt'), 'three little words');
  for (const bad of [['--min-words', 'abc'], ['--min-words'], ['--min-words', '-5'], ['--min-words', '1.5']]) {
    const r = run([path.join(dir, 'thin.txt'), '--out', path.join(dir, 'out'), ...bad]);
    assert.equal(r.status, 2, `${bad.join(' ')}: ${r.stderr}`);
    assert.match(r.stderr, /--min-words/);
  }
  assert.equal(run([path.join(dir, 'thin.txt'), '--out', path.join(dir, 'out'), '--min-words', '2']).status, 0);
});
