import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { classifyCheckResult } from '../lib/check-result.mjs';
import { EXIT } from '../lib/exit-codes.mjs';

test('a blocked subprocess is an execution failure, not a stale artifact', () => {
  const result = classifyCheckResult({ error: new Error('spawnSync node EPERM'), status: null });
  assert.equal(result.code, EXIT.FATAL);
  assert.match(result.reason, /EPERM/);
});

test('a killed or incomplete checker cannot establish freshness', () => {
  for (const result of [{ signal: 'SIGTERM', status: null }, { status: null }, { status: 2 }, { status: 97 }]) {
    assert.equal(classifyCheckResult(result).code, EXIT.FATAL);
  }
});

test('a completed checker distinguishes valid content from violations', () => {
  assert.equal(classifyCheckResult({ status: 0 }).code, EXIT.OK);
  assert.equal(classifyCheckResult({ status: 1 }).code, EXIT.VIOLATIONS);
});

test('the real gate reports undeclared child exits as incomplete and stops the chain', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-gate-exit-'));
  try {
    const scripts = path.join(root, 'scripts');
    fs.mkdirSync(path.join(scripts, 'lib'), { recursive: true });
    fs.copyFileSync(new URL('../gate.mjs', import.meta.url), path.join(scripts, 'gate.mjs'));
    fs.copyFileSync(new URL('../lib/exit-codes.mjs', import.meta.url), path.join(scripts, 'lib/exit-codes.mjs'));
    fs.writeFileSync(path.join(scripts, 'check-recipes.mjs'), 'process.exit(97);\n');
    const later = "import fs from 'node:fs'; fs.writeFileSync('unexpected-later-step', 'ran');\n";
    fs.writeFileSync(path.join(scripts, 'render-recipes.mjs'), later);
    fs.writeFileSync(path.join(scripts, 'build-recipes-index.mjs'), later);
    const result = spawnSync(process.execPath, [path.join(scripts, 'gate.mjs'), '--lane', 'recipes'], {
      cwd: root, encoding: 'utf8', timeout: 10_000,
    });
    assert.ifError(result.error);
    assert.equal(result.status, EXIT.FATAL);
    assert.match(result.stderr, /exit 97.*undeclared code/);
    assert.match(result.stderr, /0 step\(s\) passed before it; 2 not run/);
    assert.equal(fs.existsSync(path.join(root, 'unexpected-later-step')), false);
  } finally {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith('registry-gate-exit-'));
    fs.rmSync(root, { recursive: true, force: true });
  }
});
