// Seeded canary for build-knowledge-rules (2026-10-25 gates scan): on a lane with zero
// bundles, `--check` compared the access rule alone, called the rules current and exited
// 0. The generator reads knowledge/ from its own location, so each case copies it into a
// temp tree; the control is one synthetic bundle, written then checked.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const made = [];
after(() => { for (const d of made) fs.rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });

function fixture({ bundle }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'knowledge-rules-'));
  made.push(root);
  fs.mkdirSync(path.join(root, 'scripts', 'lib'), { recursive: true });
  for (const f of ['build-knowledge-rules.mjs', 'lib/bundle-hash.mjs', 'lib/exit-codes.mjs', 'lib/check-result.mjs']) {
    fs.copyFileSync(path.join(SCRIPTS, f), path.join(root, 'scripts', f));
  }
  fs.mkdirSync(path.join(root, 'knowledge'));
  if (bundle) {
    fs.mkdirSync(path.join(root, 'knowledge', 'demo'));
    fs.writeFileSync(path.join(root, 'knowledge', 'demo', 'index.json'), JSON.stringify({
      meta: { categories: ['core'], subjects: 1, techniques: 0, applications: 0 },
      subjects: { topic: { category: 'core', file: 'knowledge/demo/core/topic/topic.md' } },
    }));
  }
  const run = (...args) => spawnSync(process.execPath, [path.join(root, 'scripts', 'build-knowledge-rules.mjs'), ...args], { encoding: 'utf8' });
  return { root, run };
}

test('control: one bundle, written then checked, is current (0)', () => {
  const { root, run } = fixture({ bundle: true });
  assert.equal(run().status, 0);
  const r = run('--check');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /rules are current/);
  assert.ok(fs.existsSync(path.join(root, 'rules', 'ai-registry-demo.md')));
});

// The per-bundle card is always-on text, and it must agree with the access rule beside it:
// that rule (and registry_subject's own description) says a slug is opened through the
// front door and index.json is never read. The card used to send the reader to index.json.
test('the per-bundle card routes a slug through the front door, never through index.json', () => {
  const { root, run } = fixture({ bundle: true });
  assert.equal(run().status, 0);
  const card = fs.readFileSync(path.join(root, 'rules', 'ai-registry-demo.md'), 'utf8');
  assert.doesNotMatch(card, /resolve one through `index\.json`/);
  assert.match(card, /registry_subject/);
  assert.match(card, /registry-query\.mjs --subject <slug>/);
  const access = fs.readFileSync(path.join(root, 'rules', 'ai-registry-access.md'), 'utf8');
  assert.match(access, /never Read, grep or slice it/, 'the access rule this card defers to still forbids reading index.json');
});

// Two generators print a bundle's title: build-catalog (readFm: frontmatter only, trailing
// comment and quotes stripped) and this one, which matched the key anywhere in index.md and
// kept quotes and comments verbatim. Same field, one source, two answers.
test('the card title is read like the catalog reads it: frontmatter only, unquoted, uncommented', () => {
  const { root, run } = fixture({ bundle: true });
  fs.writeFileSync(path.join(root, 'knowledge', 'demo', 'index.md'),
    '---\nokf_version: 0.1\nokf_bundle_title: "Demo bundle" # shown on cards\n---\n\n# Demo\n');
  assert.equal(run().status, 0);
  const card = fs.readFileSync(path.join(root, 'rules', 'ai-registry-demo.md'), 'utf8');
  assert.equal(card.split('\n')[0], '# Demo bundle - the subjects this registry carries');
  fs.writeFileSync(path.join(root, 'knowledge', 'demo', 'index.md'),
    '---\nokf_version: 0.1\n---\n\nExample in prose:\nokf_bundle_title: Not the title\n');
  assert.equal(run().status, 0);
  const fallback = fs.readFileSync(path.join(root, 'rules', 'ai-registry-demo.md'), 'utf8');
  assert.equal(fallback.split('\n')[0], '# demo - the subjects this registry carries', 'a body line is not frontmatter');
});

test('zero bundles is could-not-run (2), in check and in write mode, and writes nothing', () => {
  const { root, run } = fixture({ bundle: false });
  fs.mkdirSync(path.join(root, 'rules'));
  fs.writeFileSync(path.join(root, 'rules', 'ai-registry-demo.md'), 'a rule that must survive an empty read\n');
  for (const args of [['--check'], []]) {
    const r = run(...args);
    assert.equal(r.status, 2, `args ${args}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /walked 0 bundles/);
  }
  assert.ok(fs.existsSync(path.join(root, 'rules', 'ai-registry-demo.md')), 'an empty read must not delete rules as orphans');
});
