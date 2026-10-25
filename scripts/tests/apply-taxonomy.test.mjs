// apply-taxonomy moves knowledge, so every case here runs on a temp copy: the script reads
// ROOT from its own location, and the fixture copies it beside a synthetic knowledge/ lane.
// Nothing touches the real tree.
//
// The defect pinned: the failure flag was shared across bundles, so one bundle whose
// taxonomy could not be used made every LATER bundle skip its own work - in a dry run it
// was never reported, under --apply it was never moved - while the summary still claimed
// all of them.
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

function bundle(k, name, { taxonomy = true } = {}) {
  const b = path.join(k, name);
  fs.mkdirSync(path.join(b, 'topic', 'techniques'), { recursive: true });
  fs.writeFileSync(path.join(b, '_laws.md'), '# Laws\n');
  fs.writeFileSync(path.join(b, 'topic', 'topic.md'), '---\ntype: golden-path\n---\n\nSee [laws](../_laws.md) and [x](techniques/x.md).\n');
  fs.writeFileSync(path.join(b, 'topic', 'techniques', 'x.md'), '---\ntype: technique\n---\n\nBack to [the path](../topic.md), laws at [laws](../../_laws.md).\n');
  if (taxonomy) {
    fs.writeFileSync(path.join(b, 'taxonomy.json'), JSON.stringify({
      schema: 'rkb-taxonomy/1', bundle: name, layout: 'flat',
      categories: [{ id: 'core', title: 'Core', order: 1, subjects: ['topic'] }],
    }, null, 2));
  }
  return b;
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'apply-taxonomy-'));
  made.push(root);
  fs.mkdirSync(path.join(root, 'scripts', 'lib'), { recursive: true });
  for (const f of ['apply-taxonomy.mjs', 'lib/taxonomy.mjs']) fs.copyFileSync(path.join(SCRIPTS, f), path.join(root, 'scripts', f));
  const k = path.join(root, 'knowledge');
  // `aaa` sorts first under --all and has no taxonomy.json: it cannot be moved.
  bundle(k, 'aaa', { taxonomy: false });
  const bbb = bundle(k, 'bbb');
  return { root, bbb };
}

const run = (root, ...args) => spawnSync(process.execPath, [path.join(root, 'scripts', 'apply-taxonomy.mjs'), ...args], { encoding: 'utf8' });

test('a dry run reports every usable bundle after one that failed', () => {
  const { root } = fixture();
  const r = run(root, '--all', '--to', 'nested');
  assert.equal(r.status, 1, 'the unusable bundle still fails the run');
  assert.match(r.stderr, /aaa: taxonomy is not usable/);
  assert.match(r.stdout, /bbb → nested/);
  assert.match(r.stdout, /1 subject folder\(s\) move/);
});

test('--apply still moves a usable bundle that follows a failed one, links intact', () => {
  const { root, bbb } = fixture();
  const r = run(root, '--all', '--to', 'nested', '--apply');
  assert.equal(r.status, 1, r.stdout);
  assert.ok(fs.existsSync(path.join(bbb, 'core', 'topic', 'topic.md')), `bbb was not moved:\n${r.stdout}\n${r.stderr}`);
  assert.match(fs.readFileSync(path.join(bbb, 'core', 'topic', 'topic.md'), 'utf8'), /\]\(\.\.\/\.\.\/_laws\.md\)/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(bbb, 'taxonomy.json'), 'utf8')).layout, 'nested');
});

// A link whose file and target both stay put is not the mover's business. The rewrite
// re-expressed every resolvable link, so `techniques/x.md` became `./techniques/x.md` and a
// re-run on an already-placed tree planned 34 rewrites over 0 moves on the real corpus.
test('a re-run over a tree already at its layout plans no rewrites and writes nothing', () => {
  const { root, bbb } = fixture();
  assert.equal(run(root, 'bbb', '--to', 'nested', '--apply').status, 0);
  const file = path.join(bbb, 'core', 'topic', 'topic.md');
  const before = fs.readFileSync(file, 'utf8');
  assert.match(before, /\]\(techniques\/x\.md\)/, 'fixture keeps an un-dotted local link');
  const again = run(root, 'bbb', '--to', 'nested', '--apply');
  assert.equal(again.status, 0, again.stderr);
  assert.match(again.stdout, /0 subject folder\(s\) move, 0 file\(s\) get 0 link rewrite\(s\)/);
  assert.equal(fs.readFileSync(file, 'utf8'), before);
});

test('control: a single usable bundle moves and exits 0', () => {
  const { root, bbb } = fixture();
  const r = run(root, 'bbb', '--to', 'nested', '--apply');
  assert.equal(r.status, 0, r.stderr);
  assert.ok(fs.existsSync(path.join(bbb, 'core', 'topic', 'techniques', 'x.md')));
});
