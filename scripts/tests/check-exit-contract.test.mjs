// Tests for scripts/check-exit-contract.mjs - the gate that reads exit calls against the
// declaration in scripts/lib/exit-codes.mjs.
//
// Why this exists: the gate's literal regex could not see an exit code carried by a
// variable, so transcript-mirror shipped "paused at budget" on the retry code (3) with no
// ledger entry and a green gate. These cases plant that shape and require the detector to
// flag it when undeclared and pass it once declared, so the blind spot cannot reopen
// quietly. The last case runs the real gate over the real tree.
//
// `node --test scripts/tests/check-exit-contract.test.mjs` - builtins only.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { exitSites, judgeSite } from '../check-exit-contract.mjs';
import { KNOWN_COLLISIONS } from '../lib/exit-codes.mjs';

const GATE = fileURLToPath(new URL('../check-exit-contract.mjs', import.meta.url));
// Assembled so this file's own text holds no exit call for anything to mistake for one.
const EXIT_CALL = 'process.' + 'exit';

/** Verdicts for every site of a planted script, as "code:reason-or-ok". */
function verdicts(src, base, collisions) {
  return exitSites(src).map((s) => ({ code: s.code, why: judgeSite(s, base, collisions) }));
}

test('a const-bound ternary yielding 3 is flagged when undeclared', () => {
  const src = `const exit = cond ? 3 : 0;\n${EXIT_CALL}(exit);\n`;
  const sites = exitSites(src);
  assert.deepEqual(sites.map((s) => s.code).sort(), [0, 3]);
  assert.ok(sites.every((s) => s.computed));
  const v = verdicts(src, 'planted.mjs', []);
  assert.equal(v.find((x) => x.code === 3).why?.includes('computed value'), true);
  assert.equal(v.find((x) => x.code === 0).why, null);
});

test('the same script passes once its code-3 meaning is declared', () => {
  const src = `const exit = cond ? 3 : 0;\n${EXIT_CALL}(exit);\n`;
  const declared = [{ script: 'planted.mjs', code: 3, means: 'x', conflictsWith: 'y' }];
  assert.ok(verdicts(src, 'planted.mjs', declared).every((x) => x.why === null));
  // A declaration for another script does not excuse this one.
  assert.notEqual(verdicts(src, 'other.mjs', declared).find((x) => x.code === 3).why, null);
});

test('an inline ternary and a nested ternary resolve every branch', () => {
  assert.deepEqual(exitSites(`${EXIT_CALL}(failed ? 1 : 0);`).map((s) => s.code).sort(), [0, 1]);
  const nested = `const exit = (r.a === 'v' && r.f) ? 1 : (r.a === 'c' && r.p) ? 3 : 0;\n${EXIT_CALL}(exit);`;
  assert.deepEqual(exitSites(nested).map((s) => s.code).sort(), [0, 1, 3]);
});

test('a computed undeclared code is flagged even without code 3', () => {
  const v = verdicts(`const exit = bad ? 41 : 0;\n${EXIT_CALL}(exit);`, 'planted.mjs', []);
  assert.match(v.find((x) => x.code === 41).why, /does not name/);
});

test('a bare EXIT name, 0/1/2 computed, and unresolvable arguments are not findings', () => {
  assert.equal(exitSites(`${EXIT_CALL}(EXIT.CONTENDED);`).length, 0);
  assert.ok(verdicts(`const e = a ? 2 : b ? 1 : 0;\n${EXIT_CALL}(e);`, 'p.mjs', []).every((x) => x.why === null));
  const opaque = exitSites(`${EXIT_CALL}(main(argv));`);
  assert.equal(opaque.length, 0);
  assert.equal(opaque.opaque.length, 1);
});

test('a literal declared code still passes as before', () => {
  assert.equal(verdicts(`${EXIT_CALL}(3);`, 'planted.mjs', [])[0].why, null);
  assert.match(verdicts(`${EXIT_CALL}(9);`, 'planted.mjs', [])[0].why, /does not name/);
});

test('the ledger names both scripts that carry a second meaning on 3', () => {
  const owned = KNOWN_COLLISIONS.filter((c) => c.code === 3).map((c) => c.script);
  assert.ok(owned.includes('agent-cost-band.mjs'));
  assert.ok(owned.includes('transcript-mirror.mjs'));
});

test('the real tree passes the real gate and reports its computed sites', () => {
  const r = spawnSync(process.execPath, [GATE], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /exit contract OK/);
  assert.match(r.stdout, /\d+ of those site\(s\) are computed/);
});
