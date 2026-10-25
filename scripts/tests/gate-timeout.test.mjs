// A hung gate step used to hold the CI job until GitHub's 360-minute default: gate.mjs
// spawned each step with no ceiling, and a deadlocked child prints nothing and never
// fails. These tests run the real gate.mjs against a temp tree whose first step hangs
// and prove the step is stopped, named "timed out", and exits FATAL before the next step.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { EXIT } from '../lib/exit-codes.mjs';

const ENV = 'GATE_STEP_TIMEOUT_MS';

// A copy of gate.mjs in a temp tree, with the recipes lane's three scripts replaced by
// the given sources. Returns { root, gate } and the caller removes the root.
function tree(sources) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-gate-timeout-'));
  const scripts = path.join(root, 'scripts');
  fs.mkdirSync(path.join(scripts, 'lib'), { recursive: true });
  fs.copyFileSync(new URL('../gate.mjs', import.meta.url), path.join(scripts, 'gate.mjs'));
  fs.copyFileSync(new URL('../lib/exit-codes.mjs', import.meta.url), path.join(scripts, 'lib/exit-codes.mjs'));
  for (const [name, src] of Object.entries(sources)) fs.writeFileSync(path.join(scripts, name), src);
  return { root, gate: path.join(scripts, 'gate.mjs') };
}

function cleanup(root) {
  assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
  assert.ok(path.basename(root).startsWith('registry-gate-timeout-'));
  fs.rmSync(root, { recursive: true, force: true });
}

const run = (gate, root, env) => spawnSync(process.execPath, [gate, '--lane', 'recipes'], {
  cwd: root, encoding: 'utf8', timeout: 20_000, env: { ...process.env, ...env },
});

// The hung step ends itself after 25s so that, if the ceiling is ever removed, the test
// fails on the outer 20s timeout without leaving an immortal orphan process behind.
const HANG = "setInterval(() => {}, 1e9); setTimeout(() => process.exit(0), 25_000);\n";
const LATER = "import fs from 'node:fs'; fs.writeFileSync('unexpected-later-step', 'ran');\n";

test('a hung step is stopped at the ceiling, named "timed out", and the chain stops', () => {
  const { root, gate } = tree({
    'check-recipes.mjs': HANG,
    'render-recipes.mjs': LATER,
    'build-recipes-index.mjs': LATER,
  });
  try {
    const r = run(gate, root, { [ENV]: '500' });
    assert.ifError(r.error);
    assert.equal(r.status, EXIT.FATAL);
    assert.match(r.stderr, /check-recipes\.mjs timed out after 500 ms/);
    assert.doesNotMatch(r.stderr, /killed by/);
    assert.equal(fs.existsSync(path.join(root, 'unexpected-later-step')), false);
  } finally {
    cleanup(root);
  }
});

test('a step that finishes inside the ceiling is unaffected', () => {
  const { root, gate } = tree({
    'check-recipes.mjs': 'process.exit(0);\n',
    'render-recipes.mjs': 'process.exit(0);\n',
    'build-recipes-index.mjs': 'process.exit(0);\n',
  });
  try {
    const r = run(gate, root, { [ENV]: '10000' });
    assert.ifError(r.error);
    assert.equal(r.status, EXIT.OK);
    assert.match(r.stdout, /gate OK - 3\/3/);
  } finally {
    cleanup(root);
  }
});

test('a malformed ceiling is refused, never read as "no ceiling"', () => {
  const { root, gate } = tree({
    'check-recipes.mjs': 'process.exit(0);\n',
    'render-recipes.mjs': LATER,
    'build-recipes-index.mjs': LATER,
  });
  try {
    for (const bad of ['0', '-5', 'abc', '1.5']) {
      const r = run(gate, root, { [ENV]: bad });
      assert.ifError(r.error);
      assert.equal(r.status, EXIT.FATAL, `${ENV}=${bad}`);
      assert.match(r.stderr, new RegExp(ENV));
    }
    assert.equal(fs.existsSync(path.join(root, 'unexpected-later-step')), false);
  } finally {
    cleanup(root);
  }
});
