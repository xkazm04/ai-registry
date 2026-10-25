// check-citation-dates defaulted its root to a cwd-relative `knowledge`, so run from
// anywhere but the repository root it was could-not-run ("root does not exist"). The
// default is now the lane beside the script; an explicit --path stays relative to the
// caller, because the caller typed it. Reads the real knowledge/ lane, read-only.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'check-citation-dates.mjs');
const made = [];
after(() => { for (const d of made) fs.rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });
const tmp = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'citation-dates-')); made.push(d); return d; };

test('the default root is the lane, whatever directory the checker is run from', () => {
  const r = spawnSync(process.execPath, [script, '--json'], { cwd: tmp(), encoding: 'utf8' });
  assert.notEqual(r.status, 2, r.stderr);
  const j = JSON.parse(r.stdout);
  assert.ok(j.census.files > 1000, `walked ${j.census.files} files`);
});

test('an explicit --path is the caller\'s, relative to the caller', () => {
  const dir = tmp();
  fs.mkdirSync(path.join(dir, 'notes'));
  fs.writeFileSync(path.join(dir, 'notes', 'a.md'), 'As shown in arXiv:2501.04227 (ICLR 2023).\n');
  const r = spawnSync(process.execPath, [script, '--path', 'notes'], { cwd: dir, encoding: 'utf8' });
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /IMPOSSIBLE/);
});
