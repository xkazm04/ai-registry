// check-citations makes ~170 outbound requests, so this test never lets it: a preload
// module replaces global fetch with a stub (alive for everything, 404 for the gone
// control). What is pinned is the POPULATION step, which runs before any probe.
//
// The defect: the lane was enumerated with a cwd-relative `git grep -- knowledge/`, so run
// from anywhere but the repository root it found no files and reported "git grep failed;
// cannot enumerate the population" - a broken tool, when the cause was the directory.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'check-citations.mjs');
const made = [];
after(() => { for (const d of made) fs.rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });

function stub() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-citations-'));
  made.push(dir);
  const file = path.join(dir, 'fetch-stub.mjs');
  fs.writeFileSync(file, [
    'globalThis.fetch = async (url) => ({ status: String(url).includes("does-not-exist") ? 404 : 200 });',
    '',
  ].join('\n'));
  return { dir, preload: pathToFileURL(file).href };
}

test('the population is the lane, whatever directory the checker is run from', () => {
  const { dir, preload } = stub();
  const r = spawnSync(process.execPath, ['--import', preload, script, '--json'], { cwd: dir, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const j = JSON.parse(r.stdout);
  assert.ok(j.files > 0 && j.citations >= 50, `files=${j.files} citations=${j.citations}`);
  assert.equal(j.gone, 0, 'the stub answers alive for every citation');
});
