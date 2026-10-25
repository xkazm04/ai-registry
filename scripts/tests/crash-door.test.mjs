// crash-door.test - an uncaught throw must leave as FATAL (2), never as VIOLATIONS (1).
//
// Node exits 1 on an uncaught exception or rejection, and exit-codes.mjs spends 1 on "ran
// and found what it looks for". A TypeError in a checker was therefore printed by gate.mjs as
// "(VIOLATIONS)": a crash read as a content verdict. installCrashDoor() is the opt-in that
// maps the two crash events onto EXIT.FATAL. Three layers pin it: planted crashes prove the
// door works, a control proves an explicit exit(1) is left alone, and a canary walks the real
// gate chain so a step added without the door cannot ship.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT } from '../lib/exit-codes.mjs';

const SCRIPTS = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const EXIT_CODES_URL = new URL('../lib/exit-codes.mjs', import.meta.url).href;

/** Plant `body` as a script that imports exit-codes, optionally opens the door, and run it. */
function plant(body, { door = true } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'crash-door-'));
  try {
    const file = path.join(dir, 'planted.mjs');
    const imports = door ? 'installCrashDoor, EXIT' : 'EXIT';
    fs.writeFileSync(file, `import { ${imports} } from '${EXIT_CODES_URL}';\n${door ? 'installCrashDoor();\n' : ''}${body}\n`);
    return spawnSync(process.execPath, [file], { encoding: 'utf8' });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const CRASHES = {
  'a synchronous JSON.parse throw': "JSON.parse('{not json');",
  'a rejected top-level await': "await Promise.reject(new Error('rejected await'));",
  'a TypeError (undefined.map)': 'const rows = undefined; rows.map((r) => r);',
  'an unawaited rejection': "Promise.reject(new Error('floating rejection'));",
  'a throw from a later tick': "setTimeout(() => { throw new Error('late throw'); }, 5);",
};

for (const [label, body] of Object.entries(CRASHES)) {
  test(`${label} exits FATAL and says so`, () => {
    const r = plant(body);
    assert.equal(r.status, EXIT.FATAL, r.stderr);
    assert.match(r.stderr, /^FATAL: planted\.mjs crashed: /m);
    assert.match(r.stderr, /\n\s+at /, 'the stack follows the one-line summary');
  });
}

test('without the door the same crashes still exit 1 (the premise being fixed)', () => {
  for (const body of Object.values(CRASHES)) assert.equal(plant(body, { door: false }).status, 1);
});

test('a non-Error rejection is reported, not swallowed', () => {
  const r = plant("Promise.reject('plain string');");
  assert.equal(r.status, EXIT.FATAL);
  assert.match(r.stderr, /FATAL: planted\.mjs crashed: plain string/);
});

test('an explicit process.exit(1) still exits 1 with the door open', () => {
  const r = plant("console.error('found something'); process.exit(EXIT.VIOLATIONS);");
  assert.equal(r.status, EXIT.VIOLATIONS);
  assert.doesNotMatch(r.stderr, /FATAL/);
});

test('process.exitCode = 1 and a clean exit are untouched', () => {
  assert.equal(plant('process.exitCode = EXIT.VIOLATIONS;').status, EXIT.VIOLATIONS);
  assert.equal(plant('process.exitCode = EXIT.OK;').status, EXIT.OK);
});

test('a caught throw that the script turns into exit 1 is not a crash', () => {
  const r = plant("try { JSON.parse('{'); } catch { process.exit(EXIT.VIOLATIONS); }");
  assert.equal(r.status, EXIT.VIOLATIONS);
});

test('installing twice registers the handlers once', () => {
  const r = plant(`installCrashDoor();\nconsole.log(process.listenerCount('uncaughtException'), process.listenerCount('unhandledRejection'));`);
  assert.equal(r.status, EXIT.OK);
  assert.equal(r.stdout.trim(), '1 1');
});

test('importing exit-codes installs nothing: the door is opt-in', () => {
  const r = spawnSync(process.execPath, ['--input-type=module', '-e',
    `import '${EXIT_CODES_URL}'; console.log(process.listenerCount('uncaughtException'), process.listenerCount('unhandledRejection'));`], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout.trim(), '0 0');
});

test('every step of the real gate chain installs the crash door', () => {
  const listed = spawnSync(process.execPath, [path.join(SCRIPTS, 'gate.mjs'), '--list'], { encoding: 'utf8' });
  assert.equal(listed.status, 0, listed.stderr);
  const steps = JSON.parse(listed.stdout);
  const scripts = new Set();
  for (const step of [...steps.all, ...Object.values(steps.lanes).flat()]) scripts.add(step.trim().split(/\s+/)[0]);
  assert.ok(scripts.size >= 20, `expected the whole chain, got ${scripts.size} script(s)`);
  const missing = [];
  for (const script of [...scripts].sort()) {
    const src = fs.readFileSync(path.join(SCRIPTS, script), 'utf8');
    const imported = /import\s*\{[^}]*\binstallCrashDoor\b[^}]*\}\s*from\s*'\.\/lib\/exit-codes\.mjs'/.test(src);
    const called = /^[ \t]*installCrashDoor\(\);/m.test(src);
    if (!imported || !called) missing.push(script);
  }
  assert.deepEqual(missing, [], `gate step(s) without installCrashDoor(): ${missing.join(', ')}`);
});
