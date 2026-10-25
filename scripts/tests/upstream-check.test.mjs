// upstream-check --exit-code is the wake-trigger form (librarian SKILL.md, "Scheduling"):
// a caller reads the integer and nothing else. The script's own doctrine is that a probe
// error is "never a quiet not due", so a run whose probes could not answer must not exit
// with the code that means "nothing due". These cases run a COPY of the script over a
// one-note fixture registry, with PATH pointing at an empty directory so `gh` is absent:
// every probe fails offline, and no network is reached.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function fixture(fn) {
  const temp = fs.realpathSync(os.tmpdir());
  const root = fs.mkdtempSync(path.join(temp, 'upstream-check-test-'));
  try {
    fs.mkdirSync(path.join(root, 'scripts'));
    fs.copyFileSync(path.join(SCRIPTS, 'upstream-check.mjs'), path.join(root, 'scripts', 'upstream-check.mjs'));
    fs.mkdirSync(path.join(root, 'librarian', 'sources'), { recursive: true });
    // Tier 2 (shipped: 1), pinned, not a catalogue: eligible, so it is probed.
    fs.writeFileSync(path.join(root, 'librarian', 'sources', '2026-01-01-demo.md'),
      '---\nurl: https://github.com/example/demo\ncommit: 0123456789abcdef0123456789abcdef01234567\nshipped: 1\n---\n# demo\n');
    const noTools = path.join(root, 'empty-path');
    fs.mkdirSync(noTools);
    const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => k.toUpperCase() !== 'PATH'));
    env.PATH = noTools;
    const run = (...args) => spawnSync(process.execPath, [path.join(root, 'scripts', 'upstream-check.mjs'), ...args], { encoding: 'utf8', env });
    fn({ run });
  } finally {
    const rel = path.relative(temp, fs.realpathSync(root));
    if (!rel.startsWith('upstream-check-test-') || rel.includes(path.sep)) throw new Error('unsafe cleanup');
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('control: --offline --exit-code probes nothing, so nothing errored and nothing is due', () => {
  fixture(({ run }) => {
    const r = run('--offline', '--exit-code', '--json');
    assert.equal(r.status, 0, r.stderr);
    assert.equal(JSON.parse(r.stdout).totals.eligible, 1, 'fixture premise: the note is eligible');
  });
});

test('--exit-code over probes that all errored is could-not-run (2), not "nothing due" (0)', () => {
  fixture(({ run }) => {
    const r = run('--exit-code', '--json');
    const doc = JSON.parse(r.stdout);
    assert.equal(doc.totals.errors, 1, 'premise: with gh absent the probe errors');
    assert.equal(doc.totals.due, 0);
    assert.equal(r.status, 2, r.stderr);
    assert.match(r.stderr, /could not be probed/);
  });
});
