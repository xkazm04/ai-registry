// Tests for scripts/agent-cost-band.mjs - the noise-band instrument.
//
// `node --test scripts/tests/` - builtins only; synthetic transcripts in a temp dir, never
// the real session store.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../agent-cost-band.mjs', import.meta.url));
const made = [];
after(() => { for (const d of made) fs.rmSync(d, { recursive: true, force: true }); });

/** Two workspaces of `n` sessions, each session `turns` usage lines with varied output tokens. */
function corpus(n = 8, turns = 4) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'acb-'));
  made.push(root);
  for (const [w, scale] of [['ws-a', 100], ['ws-b', 300]]) {
    fs.mkdirSync(path.join(root, w));
    for (let s = 0; s < n; s++) {
      const lines = Array.from({ length: turns }, (_, t) => JSON.stringify({ message: { usage: { output_tokens: scale + 13 * s + 7 * t } } }));
      fs.writeFileSync(path.join(root, w, `s${s}.jsonl`), `${lines.join('\n')}\n`);
    }
  }
  return root;
}
const run = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });

test('a corpus over the thresholds reports a band and an arm count per effect', () => {
  const r = run(corpus(), '--json');
  assert.equal(r.status, 0, r.stderr);
  const rep = JSON.parse(r.stdout);
  assert.equal(rep.sessions_usable, 16);
  assert.deepEqual(Object.keys(rep.replays_per_arm), ['1.21x', '1.36x', '1.63x', '2.7x']);
});

test('too few sessions is the documented answer 3, not a usage error', () => {
  const r = run(corpus(3), '--json');
  assert.equal(r.status, 3, r.stderr);
  assert.match(r.stderr, /no workspace reached --min-sessions 8/);
});

test('a threshold or effect the script cannot read is a usage error (2), never "not enough data" (3) or an empty table', () => {
  const root = corpus();
  for (const bad of [['--min-sessions', 'eight'], ['--min-sessions', '0'], ['--min-turns', 'x'], ['--effect', 'big'], ['--effect', '0.5']]) {
    const r = run(root, '--json', ...bad);
    assert.equal(r.status, 2, `${bad.join(' ')}: exit ${r.status} ${r.stderr}${r.stdout.slice(0, 80)}`);
    assert.match(r.stderr, new RegExp(bad[0]));
  }
  assert.equal(run(root, '--json', '--effect', '1.5,2').status, 0, 'a real effect list still runs');
});
