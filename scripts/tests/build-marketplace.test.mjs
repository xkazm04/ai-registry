// build-marketplace: the plugin entry is what a consumer's harness shows for each skill.
// The description was cut with .slice(0, 400) - mid-word, with no mark that anything was
// cut (measured 2026-10-25: 33 of 43 entries truncated, 25 of them ending inside a word).
// The script resolves its lane from its own location, so each case runs a copy of it over
// a fixture lane.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function fixture(t, skills) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'marketplace-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'scripts', 'lib'), { recursive: true });
  fs.copyFileSync(path.join(SCRIPTS, 'build-marketplace.mjs'), path.join(root, 'scripts', 'build-marketplace.mjs'));
  for (const f of ['skills-lane.mjs', 'bundle-hash.mjs', 'exit-codes.mjs']) fs.copyFileSync(path.join(SCRIPTS, 'lib', f), path.join(root, 'scripts', 'lib', f));
  for (const [name, description] of Object.entries(skills)) {
    fs.mkdirSync(path.join(root, 'skills', name), { recursive: true });
    fs.writeFileSync(path.join(root, 'skills', name, 'SKILL.md'), `---\nname: ${name}\nversion: 1.0.0\ndescription: ${JSON.stringify(description)}\n---\n\n# ${name}\n`);
  }
  const run = (...args) => spawnSync(process.execPath, [path.join(root, 'scripts', 'build-marketplace.mjs'), ...args], { encoding: 'utf8' });
  const read = () => JSON.parse(fs.readFileSync(path.join(root, '.claude-plugin', 'marketplace.json'), 'utf8'));
  return { root, run, read };
}

// --check named only VERSION drift. A description, category or tags edit made the file
// STALE with not one line saying which plugin or field - the reader had to diff by hand.
test('--check names the plugin and the field that drifted, not only versions', (t) => {
  const { root, run } = fixture(t, { alpha: 'First.', beta: 'Second.' });
  assert.equal(run().status, 0);
  const file = path.join(root, '.claude-plugin', 'marketplace.json');
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  doc.plugins[1].description = 'Edited by hand.';
  doc.plugins[1].category = 'elsewhere';
  fs.writeFileSync(file, `${JSON.stringify(doc, null, 2)}\n`);
  const r = run('--check');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /beta: description, category differ/);
  assert.doesNotMatch(r.stderr, /alpha:/);
});

const LONG =`${'Mine an external source for craft that belongs in the recipes lane. '.repeat(7)}Tail words here.`;

// Only `--check` was read; `--chek` or `--help` rewrote marketplace.json.
test('an unknown argument is a usage error (2) and writes nothing; --help prints usage (0)', (t) => {
  const { root, run } = fixture(t, { demo: 'A demo skill.' });
  for (const args of [['--chek'], ['--check', 'x']]) {
    const r = run(...args);
    assert.equal(r.status, 2, `${args}: ${r.stdout}`);
    assert.match(r.stderr, /unknown argument/);
  }
  const h = run('--help');
  assert.equal(h.status, 0, h.stderr);
  assert.match(h.stdout, /usage: node scripts\/build-marketplace\.mjs \[--check\]/);
  assert.ok(!fs.existsSync(path.join(root, '.claude-plugin')), 'nothing written');
});

test('a short description is carried verbatim; the lane builds and checks fresh', (t) => {
  const { run, read } = fixture(t, { demo: 'A demo skill.' });
  assert.equal(run().status, 0);
  assert.equal(read().plugins[0].description, 'A demo skill.');
  assert.equal(run('--check').status, 0);
});

test('a long description is cut at a word boundary, marked with an ellipsis, within 400', (t) => {
  assert.ok(LONG.length > 400);
  const { run, read } = fixture(t, { demo: LONG });
  assert.equal(run().status, 0);
  const d = read().plugins[0].description;
  assert.ok(d.length <= 400, `length ${d.length}`);
  assert.ok(d.endsWith('…'), `no ellipsis: ${JSON.stringify(d.slice(-20))}`);
  const kept = d.slice(0, -1);
  assert.ok(LONG.startsWith(kept), 'the kept text is a prefix of the source');
  assert.match(LONG.slice(kept.length), /^\s/, 'the cut falls on whitespace, not inside a word');
});
