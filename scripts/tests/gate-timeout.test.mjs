// A hung gate step used to hold the CI job until GitHub's 360-minute default: gate.mjs
// spawned each step with no ceiling, and a deadlocked child prints nothing and never
// fails. These tests run the real gate.mjs against a temp tree whose first step hangs
// and prove the step is stopped, named "timed out", and exits FATAL. Check mode keeps
// going past it (the later steps still report); --fail-fast stops before the next step.
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
  fs.copyFileSync(new URL('../lib/gate-plan.mjs', import.meta.url), path.join(scripts, 'lib/gate-plan.mjs'));
  for (const [name, src] of Object.entries(sources)) fs.writeFileSync(path.join(scripts, name), src);
  return { root, gate: path.join(scripts, 'gate.mjs') };
}

function cleanup(root) {
  assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
  assert.ok(path.basename(root).startsWith('registry-gate-timeout-'));
  fs.rmSync(root, { recursive: true, force: true });
}

const run = (gate, root, env, extra = []) => spawnSync(process.execPath, [gate, '--lane', 'recipes', ...extra], {
  cwd: root, encoding: 'utf8', timeout: 20_000, env: { ...process.env, ...env },
});

// The hung step ends itself after 25s so that, if the ceiling is ever removed, the test
// fails on the outer 20s timeout without leaving an immortal orphan process behind.
const HANG = "setInterval(() => {}, 1e9); setTimeout(() => process.exit(0), 25_000);\n";
const LATER = "import fs from 'node:fs'; fs.writeFileSync('unexpected-later-step', 'ran');\n";

test('a hung step is stopped at the ceiling, named "timed out", and the run keeps going', () => {
  const { root, gate } = tree({
    'check-recipes.mjs': HANG,
    'render-recipes.mjs': LATER,
    'build-recipes-index.mjs': LATER,
  });
  try {
    // 4s, not 500 ms: the later steps run beside the hung one and must finish inside the
    // same ceiling even when the machine is saturated (a full gate run starts node slowly).
    const r = run(gate, root, { [ENV]: '4000' });
    assert.ifError(r.error);
    assert.equal(r.status, EXIT.FATAL);
    assert.match(r.stderr, /check-recipes\.mjs timed out after 4000 ms/);
    assert.doesNotMatch(r.stderr, /killed by/);
    assert.match(r.stdout, /timed-out\s+-\s+\d+\s+check-recipes\.mjs --shape-only/);
    assert.match(r.stdout, /0 violations, 1 incomplete/);
    assert.equal(fs.existsSync(path.join(root, 'unexpected-later-step')), true, 'keep-going did not run the later steps');
  } finally {
    cleanup(root);
  }
});

test('under --fail-fast a hung step stops the chain before the next step', () => {
  const { root, gate } = tree({
    'check-recipes.mjs': HANG,
    'render-recipes.mjs': LATER,
    'build-recipes-index.mjs': LATER,
  });
  try {
    const r = run(gate, root, { [ENV]: '500' }, ['--fail-fast']);
    assert.ifError(r.error);
    assert.equal(r.status, EXIT.FATAL);
    assert.match(r.stderr, /check-recipes\.mjs timed out after 500 ms/);
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
