// research-map's empty verdict. "PRIOR ART: none. The corpus has never heard of this" is the
// one answer a caller acts on directly (it licenses proposing a new subject), so it must only
// be printed when the corpus was actually searched for the term and returned nothing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = path.join(ROOT, 'scripts', 'research-map.mjs');
const HAS_CORPUS = fs.existsSync(path.join(ROOT, 'knowledge'));
const run = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { cwd: ROOT, encoding: 'utf8' });
const NEVER_HEARD = /never heard of this/;

test('a term with no matchable word is reported as unsearched, never as absent', { skip: !HAS_CORPUS && 'knowledge/ absent' }, () => {
  // "CI" is two letters, under the three-letter floor, so nothing was looked up - while the
  // corpus does carry ci-execution-trust and cicd-monitoring.
  const r = run('CI');
  assert.equal(r.status, 0, r.stderr);
  assert.doesNotMatch(r.stdout, NEVER_HEARD);
  assert.match(r.stdout, /no matchable word/);
  const j = JSON.parse(run('CI', '--json').stdout);
  assert.equal(j.results[0].unsearched, true);
  assert.equal(JSON.parse(run('rate limiting', '--json').stdout).results[0].unsearched, false);
});

test('--top must be a positive integer; a bad value is a usage error, not an empty corpus', { skip: !HAS_CORPUS && 'knowledge/ absent' }, () => {
  for (const bad of [['--top', 'x'], ['--top', '0'], ['--top', '-2'], ['--top']]) {
    const r = run('rate limiting', ...bad);
    assert.equal(r.status, 2, `${bad.join(' ')}: ${r.stdout}`);
    assert.doesNotMatch(r.stdout, NEVER_HEARD, bad.join(' '));
    assert.match(r.stderr, /--top must be a positive integer/);
  }
  const ok = run('rate limiting', '--top', '2');
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /top 2\)/);
});

test('the closing caveat names what was matched: technique use_when by default, golden-path use_when under --deep', { skip: !HAS_CORPUS && 'knowledge/ absent' }, () => {
  // The default pass scores technique use_when from the index (every technique carries it), and
  // the caveat used to omit it - a reader of "slugs, law statements" under-trusts the result.
  const plain = run('rate limiting').stdout.replace(/\s+/g, ' ');
  assert.match(plain, /Matching is over slugs, law statements, technique use_when and NOT document bodies/);
  const deep = run('rate limiting', '--deep').stdout.replace(/\s+/g, ' ');
  assert.match(deep, /Matching is over slugs, law statements, technique use_when, golden-path use_when and NOT document bodies/);
});

test('--domain takes a comma list and scopes BEFORE the top-N cut', { skip: !HAS_CORPUS && 'knowledge/ absent' }, () => {
  const j = JSON.parse(run('scoring', '--domain', 'software-engineering,localization', '--top', '3', '--json').stdout);
  assert.deepEqual(j.scanned.bundles, ['localization', 'software-engineering']);
  assert.ok(j.results[0].hits.length > 0);
  for (const h of j.results[0].hits) assert.ok(['software-engineering', 'localization'].includes(h.domain), h.domain);
  const none = run('scoring', '--domain', 'no-such-bundle');
  assert.equal(none.status, 2);
  assert.match(none.stderr, /matching --domain no-such-bundle/);
});

test('a real empty still says so', { skip: !HAS_CORPUS && 'knowledge/ absent' }, () => {
  const r = run('zzqxv wwkpj');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, NEVER_HEARD);
});
