// Tests for scripts/measure-large-reads.mjs - the whole-file-read instrument over the harness's
// session transcripts.
//
// `node --test scripts/tests/` - builtins only. --root points at a fixture transcript store with
// one session and one 400-line file, so the real ~/.claude/projects is never read. Refusals are
// asserted on their MESSAGE as well as the exit code (a missing --root also exits 2).

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../measure-large-reads.mjs', import.meta.url));
const made = [];
after(() => { for (const d of made) fs.rmSync(d, { recursive: true, force: true }); });

/** A transcript store holding one session that Reads a 400-line file in full. */
function fixture() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'measure-large-reads-'));
  made.push(base);
  const big = path.join(base, 'big.txt');
  fs.writeFileSync(big, `${Array.from({ length: 400 }, (_, i) => `line ${i}`).join('\n')}\n`);
  const store = path.join(base, 'projects');
  fs.mkdirSync(path.join(store, 'demo'), { recursive: true });
  const line = { type: 'assistant', message: { content: [{ type: 'tool_use', name: 'Read', input: { file_path: big } }] } };
  fs.writeFileSync(path.join(store, 'demo', 's1.jsonl'), `${JSON.stringify(line)}\n`);
  return store;
}
const run = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });

test('--min is honoured: a 400-line whole read is large above a 350 floor and not above 500', () => {
  const store = fixture();
  const at350 = run('--root', store, '--json');
  assert.equal(at350.status, 0, at350.stderr);
  assert.equal(JSON.parse(at350.stdout).totals.large, 1);
  const at500 = run('--root', store, '--min', '500', '--json');
  assert.equal(at500.status, 0, at500.stderr);
  assert.equal(JSON.parse(at500.stdout).totals.large, 0);
});

test('a non-numeric or non-integer --min/--cap/--top exits 2 instead of counting every read as large', () => {
  const store = fixture();
  for (const [flag, bad] of [['--min', 'abc'], ['--min', '1.5'], ['--min', '-3'], ['--cap', '0'], ['--top', 'x']]) {
    const r = run('--root', store, flag, bad);
    assert.equal(r.status, 2, `${flag} ${bad}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, new RegExp(`${flag} must be an integer`));
  }
});

test('an unknown flag and a value-flag with no value exit 2', () => {
  const store = fixture();
  const typo = run('--root', store, '--josn');
  assert.equal(typo.status, 2, typo.stdout + typo.stderr);
  assert.match(typo.stderr, /unknown argument "--josn"/);
  const bare = run('--root', store, '--min');
  assert.equal(bare.status, 2, bare.stdout + bare.stderr);
  assert.match(bare.stderr, /--min needs a value/);
  const swallowed = run('--root', store, '--project', '--json');
  assert.equal(swallowed.status, 2, swallowed.stdout + swallowed.stderr);
  assert.match(swallowed.stderr, /--project needs a value/);
  // A trailing --root must not fall back to the real transcript store.
  const noRoot = run('--json', '--root');
  assert.equal(noRoot.status, 2, noRoot.stdout + noRoot.stderr);
  assert.match(noRoot.stderr, /--root needs a value/);
});
