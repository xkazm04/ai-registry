// build-fleet-map's default invocation writes librarian/fleet-map.json and .md. A flag it
// does not know must stop it before any write: on 2026-10-25 `--help` regenerated the
// published map from a secondary machine's partial fleet.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = path.join(ROOT, 'scripts', 'build-fleet-map.mjs');
const OUTS = ['fleet-map.json', 'fleet-map.md'].map((f) => path.join(ROOT, 'librarian', f));
const snapshot = () => OUTS.map((f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null));

test('--help prints usage, exits 0 and writes nothing', () => {
  const before = snapshot();
  const r = spawnSync(process.execPath, [SCRIPT, '--help'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Usage: build-fleet-map\.mjs/);
  assert.deepEqual(snapshot(), before);
});

test('an unknown argument is refused with 2 before any write', () => {
  const before = snapshot();
  for (const bad of ['--chek', '--dry-run', 'fleet']) {
    const r = spawnSync(process.execPath, [SCRIPT, bad], { cwd: ROOT, encoding: 'utf8' });
    assert.equal(r.status, 2, `${bad}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /unknown argument/);
  }
  assert.deepEqual(snapshot(), before);
});
