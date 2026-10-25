// Tests for scripts/check-hash-stability.mjs - the gate that builds one fixture twice (LF and
// CRLF) and requires one digest.
//
// Why this exists: the gate had one exit door besides success, `exit 1` ("NOT
// checkout-stable"), and anything that threw on the way - no writable temp dir, a broken
// bundle-hash import - left through Node's own uncaught-exception exit, which is also 1. So
// gate.mjs printed "(VIOLATIONS)" for a fixture that was never built. Could-not-run is 2
// here like everywhere else (lib/exit-codes.mjs); this pins it, with the clean run as the
// control.
//
// `node --test scripts/tests/check-hash-stability.test.mjs` - builtins only.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT } from '../lib/exit-codes.mjs';

const GATE = fileURLToPath(new URL('../check-hash-stability.mjs', import.meta.url));

test('the real gate is green on the real libraries', () => {
  const r = spawnSync(process.execPath, [GATE], { encoding: 'utf8' });
  assert.equal(r.status, EXIT.OK, r.stdout + r.stderr);
  assert.match(r.stdout, /checkout-stable/);
});

test('a fixture that could not be built is could-not-run (2), not a stability verdict (1)', () => {
  // os.tmpdir() reads TMPDIR on POSIX and TEMP/TMP on Windows: point all three at nothing.
  const gone = path.join(os.tmpdir(), `rkb-hash-gone-${process.pid}-${Date.now()}`);
  assert.equal(fs.existsSync(gone), false);
  const env = { ...process.env, TMPDIR: gone, TEMP: gone, TMP: gone };
  const r = spawnSync(process.execPath, [GATE], { encoding: 'utf8', env });
  assert.equal(r.status, EXIT.FATAL, r.stdout + r.stderr);
  assert.match(r.stderr, /could not run/);
  assert.doesNotMatch(r.stderr, /NOT checkout-stable/);
});
