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

// ---- inbound links: markdown OUTSIDE the bundle that points INTO a subject being moved.
//
// The mover's file map is per bundle, so a docs/ page or a sibling bundle linking into a moved
// subject was invisible to it - and so was the post-condition. Measured on the real corpus a
// flat move would have broken 45 of them (1 cross-bundle, 11 docs/, 33 librarian/) while
// reporting a clean move.
const DOC = '# Doc\n\nRead [the topic](../knowledge/bbb/topic/topic.md#sec) and [x](../knowledge/bbb/topic/techniques/x.md).\n\n' +
  '```md\n[quoted](../knowledge/bbb/topic/topic.md)\n```\n\nInline `[q](../knowledge/bbb/topic/topic.md)` stays prose. [web](https://example.com/a.md)\n';

function withInbound() {
  const fx = fixture();
  fs.mkdirSync(path.join(fx.root, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(fx.root, 'docs', 'x.md'), DOC);
  // A second bundle linking into bbb. It has no taxonomy.json, so only `bbb` is run.
  const ccc = path.join(fx.root, 'knowledge', 'ccc');
  fs.mkdirSync(path.join(ccc, 'topic'), { recursive: true });
  fs.writeFileSync(path.join(ccc, 'topic', 'topic.md'), 'Cross: [b](../../bbb/topic/topic.md) and [laws](../../bbb/_laws.md).\n');
  return { ...fx, ccc };
}

/** Relative links outside code that do not resolve, across every markdown file under root. */
function brokenLinks(root) {
  const bad = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!e.name.endsWith('.md')) continue;
      const src = fs.readFileSync(p, 'utf8').replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
      for (const m of src.matchAll(/\]\(([^)\s]+)\)/g)) {
        const t = m[1].split('#')[0];
        if (!t || /^(https?:|mailto:)/.test(m[1])) continue;
        if (!fs.existsSync(path.resolve(path.dirname(p), t))) bad.push(`${path.relative(root, p)} -> ${m[1]}`);
      }
    }
  };
  walk(root);
  return bad;
}

test('a dry run counts and names every inbound link from outside the bundle, and touches nothing', () => {
  const { root } = withInbound();
  assert.deepEqual(brokenLinks(root), [], 'fixture starts with no broken link');
  const r = run(root, 'bbb', '--to', 'nested');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /3 inbound link\(s\) from 2 file\(s\) outside the bundle point into moved files/);
  assert.match(r.stdout, /docs\/x\.md {2}->/);
  assert.match(r.stdout, /knowledge\/ccc\/topic\/topic\.md {2}->/);
  assert.match(r.stdout, /3 inbound link rewrite\(s\) from outside the bundle across 1 bundle/);
  assert.equal(fs.readFileSync(path.join(root, 'docs', 'x.md'), 'utf8'), DOC, 'dry run wrote nothing');
});

test('--apply rewrites inbound links through the same round trip and leaves 0 broken', () => {
  const { root, ccc } = withInbound();
  const r = run(root, 'bbb', '--to', 'nested', '--apply');
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.deepEqual(brokenLinks(root), [], 'no link anywhere in the fixture is broken after the move');
  const doc = fs.readFileSync(path.join(root, 'docs', 'x.md'), 'utf8');
  assert.match(doc, /\]\(\.\.\/knowledge\/bbb\/core\/topic\/topic\.md#sec\)/, 'anchor survives the rewrite');
  assert.match(doc, /\]\(\.\.\/knowledge\/bbb\/core\/topic\/techniques\/x\.md\)/);
  // Quoted prose is not the mover's to edit: the fence and the inline span keep the old path.
  assert.match(doc, /```md\n\[quoted\]\(\.\.\/knowledge\/bbb\/topic\/topic\.md\)\n```/);
  assert.match(doc, /`\[q\]\(\.\.\/knowledge\/bbb\/topic\/topic\.md\)`/);
  assert.match(doc, /\(https:\/\/example\.com\/a\.md\)/);
  const cross = fs.readFileSync(path.join(ccc, 'topic', 'topic.md'), 'utf8');
  assert.match(cross, /\]\(\.\.\/\.\.\/bbb\/core\/topic\/topic\.md\)/);
  // A file that did not move is left exactly as written.
  assert.match(cross, /\]\(\.\.\/\.\.\/bbb\/_laws\.md\)/);
});

test('inbound links are found through git as well as the fallback walk, untracked files included', (t) => {
  const { root } = withInbound();
  const git = (...a) => spawnSync('git', a, { cwd: root, encoding: 'utf8' });
  if (git('init', '-q').status !== 0) return t.skip('git unavailable');
  git('add', 'knowledge/bbb');
  // docs/x.md and knowledge/ccc stay untracked: `git ls-files -co` must still see them.
  const r = run(root, 'bbb', '--to', 'nested', '--apply');
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.deepEqual(brokenLinks(root), []);
  assert.match(fs.readFileSync(path.join(root, 'docs', 'x.md'), 'utf8'), /knowledge\/bbb\/core\/topic\/topic\.md#sec/);
});

test('a re-run over an already-placed tree reports no inbound links', () => {
  const { root } = withInbound();
  assert.equal(run(root, 'bbb', '--to', 'nested', '--apply').status, 0);
  const again = run(root, 'bbb', '--to', 'nested');
  assert.equal(again.status, 0, again.stderr);
  assert.doesNotMatch(again.stdout, /inbound link\(s\) from/);
  assert.match(again.stdout, /0 inbound link rewrite\(s\)/);
});

test('control: a bundle nothing outside links into reports no inbound links', () => {
  const { root } = fixture();
  const r = run(root, 'bbb', '--to', 'nested');
  assert.equal(r.status, 0, r.stderr);
  assert.doesNotMatch(r.stdout, /inbound link\(s\) from/);
});

test('control: a single usable bundle moves and exits 0', () => {
  const { root, bbb } = fixture();
  const r = run(root, 'bbb', '--to', 'nested', '--apply');
  assert.equal(r.status, 0, r.stderr);
  assert.ok(fs.existsSync(path.join(bbb, 'core', 'topic', 'techniques', 'x.md')));
});
