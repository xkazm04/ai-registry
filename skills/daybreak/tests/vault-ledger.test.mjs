import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { appendRun, safeJoin, lastSweeps } from '../scripts/vault-ledger.mjs';

const vault = () => fs.mkdtempSync(path.join(os.tmpdir(), 'dbk-vault-'));
const clock = (iso) => () => new Date(iso);

test('same-day second append gets suffix -2 and never overwrites', () => {
  const v = vault();
  const now = clock('2030-01-05T10:00:00Z');
  const a = appendRun({ vault: v, record: { project: 'p', n: 1 }, now });
  const b = appendRun({ vault: v, record: { project: 'p', n: 2 }, now });
  assert.equal(path.basename(a), '2030-01-05.md');
  assert.equal(path.basename(b), '2030-01-05-2.md');
  assert.match(fs.readFileSync(a, 'utf8'), /"n":1/);
  const lines = fs.readFileSync(path.join(v, 'Daybreak', 'ledger.jsonl'), 'utf8').trim().split('\n');
  assert.equal(lines.length, 2);
});

test('refuses a path escaping Daybreak/', () => {
  const v = vault();
  assert.throws(() => safeJoin(v, 'runs', '..', '..', 'evil.md'), /outside Daybreak/);
  assert.throws(() => safeJoin(v, '..', 'x'), /outside Daybreak/);
  assert.doesNotThrow(() => safeJoin(v, 'runs', 'ok.md'));
});

test('last-sweeps returns the newest ts per project', () => {
  const v = vault();
  appendRun({ vault: v, record: { project: 'a' }, now: clock('2030-01-01T00:00:00Z') });
  appendRun({ vault: v, record: { project: 'a' }, now: clock('2030-01-09T00:00:00Z') });
  appendRun({ vault: v, record: { project: 'b' }, now: clock('2030-01-03T00:00:00Z') });
  const s = lastSweeps(v);
  assert.equal(s.a, '2030-01-09T00:00:00.000Z');
  assert.equal(s.b, '2030-01-03T00:00:00.000Z');
  assert.deepEqual(lastSweeps(vault()), {});
});
