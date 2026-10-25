// check-currency's flags are its verdict: `--fail-on-expired` is the only thing that turns
// the report into a failure, so a mistyped one used to run the plain report and exit 0 -
// the scheduled run that exists to go red could not. These cases pin the closed flag set.
// The usage errors exit before the corpus is read; the control reads the real knowledge/
// lane, read-only.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'check-currency.mjs');
const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });

test('a mistyped flag is a usage error (2), not the plain report', () => {
  const r = run('--fail-on-expird');
  assert.equal(r.status, 2, r.stdout.slice(0, 400));
  assert.match(r.stderr, /unknown argument "--fail-on-expird"/);
});

test('a value flag without its value is a usage error (2)', () => {
  for (const args of [['--horizon'], ['--volatile', '--top'], ['--volatile', '--subject'], ['--volatile', '--subject', '--json']]) {
    const r = run(...args);
    assert.equal(r.status, 2, `${args.join(' ')}: ${r.stdout.slice(0, 200)}`);
  }
});

test('--subject and --top without --volatile are refused, not silently ignored', () => {
  for (const args of [['--subject', 'rate-limiting'], ['--top', '5']]) {
    const r = run(...args);
    assert.equal(r.status, 2, `${args.join(' ')}: ${r.stdout.slice(0, 200)}`);
    assert.match(r.stderr, /only with --volatile/);
  }
});

test('control: the declared flags still produce the report', () => {
  const r = run('--json', '--horizon', '45');
  assert.equal(r.status, 0, r.stderr);
  const j = JSON.parse(r.stdout);
  assert.equal(j.horizonDays, 45);
  assert.ok(j.totals.applications > 0);
});
