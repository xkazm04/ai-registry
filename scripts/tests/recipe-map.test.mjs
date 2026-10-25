// recipe-map's `none` is the verdict /assay acts on ("the corpus lacks this work"), so it may
// only be given for a term that was actually compared against the recipes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = path.join(ROOT, 'scripts', 'recipe-map.mjs');
const HAS_INDEX = fs.existsSync(path.join(ROOT, 'recipes', 'index.json'));
const run = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { cwd: ROOT, encoding: 'utf8' });

test('a term with no matchable word is NOT SEARCHED, never NONE', { skip: !HAS_INDEX && 'recipes/index.json absent' }, () => {
  // Tokens need 3+ letters and no stopwords: "UX" and "the" compare against nothing.
  for (const term of ['UX', 'the of']) {
    const r = run(term);
    assert.equal(r.status, 0, r.stderr);
    assert.doesNotMatch(r.stdout, /->\s+NONE/, term);
    assert.doesNotMatch(r.stdout, /corpus lacks this work/, term);
    assert.match(r.stdout, /->\s+NOT SEARCHED/, term);
  }
  const j = JSON.parse(run('--json', 'UX', 'dunning').stdout);
  assert.deepEqual(j.results.map((x) => x.verdict === 'unsearched'), [true, false]);
});

test('a searched term with no hit is still NONE', { skip: !HAS_INDEX && 'recipes/index.json absent' }, () => {
  const j = JSON.parse(run('--json', 'zzqxv wwkpj').stdout);
  assert.equal(j.results[0].verdict, 'none');
});
