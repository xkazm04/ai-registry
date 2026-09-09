import assert from 'node:assert/strict';
import test from 'node:test';
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
