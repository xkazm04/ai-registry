// Seeded canaries for check-bundles: every rule the 2026-10-25 gates scan found unenforced
// (leak keys outside concept frontmatter, subject-is-a-leaf, the lax frontmatter parser,
// optional use_when) gets its exact plant here, beside a clean control. The gate reads
// ROOT from its own location, so each case copies it into a temp tree with a minimal
// one-subject bundle and runs it there; nothing touches the real knowledge/ lane.
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

const GOLDEN = [
  '---', 'type: golden-path', 'subject: topic', 'status: draft', 'techniques: [check]', '---', '',
  '# Topic', '', 'See [the check](techniques/check.md).', '',
].join('\n');
const TECHNIQUE = (fm = ['use_when: [a gate needs a canary]']) => [
  '---', 'type: technique', 'subject: topic', 'technique: check', 'status: draft', 'laws: [law-one]', ...fm, '---', '',
  '# Check', '', 'Plant the violation, then assert the exit code.', '',
].join('\n');

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-bundles-'));
  made.push(root);
  fs.mkdirSync(path.join(root, 'scripts', 'lib'), { recursive: true });
  for (const f of ['check-bundles.mjs', 'lib/taxonomy.mjs', 'lib/exit-codes.mjs', 'lib/check-result.mjs']) {
    fs.copyFileSync(path.join(SCRIPTS, f), path.join(root, 'scripts', f));
  }
  const b = path.join(root, 'knowledge', 'demo');
  fs.mkdirSync(path.join(b, 'topic', 'techniques'), { recursive: true });
  fs.writeFileSync(path.join(b, 'index.md'), '---\nokf_version: "0.1"\nokf_bundle_name: demo\npurity: generic\n---\n\n# Demo\n');
  fs.writeFileSync(path.join(b, '_laws.md'), '# Laws\n\n## <a id="law-one"></a> law-one\n');
  fs.writeFileSync(path.join(b, 'taxonomy.json'), JSON.stringify({
    schema: 'rkb-taxonomy/1', bundle: 'demo', layout: 'flat',
    categories: [{ id: 'core', title: 'Core', order: 1, subjects: ['topic'] }],
  }, null, 2));
  fs.writeFileSync(path.join(b, 'topic', 'topic.md'), GOLDEN);
  fs.writeFileSync(path.join(b, 'topic', 'techniques', 'check.md'), TECHNIQUE());
  return { root, b };
}

const run = (root) => spawnSync(process.execPath, [path.join(root, 'scripts', 'check-bundles.mjs')], { encoding: 'utf8' });

function expectRed(plant, pattern) {
  const fx = fixture();
  plant(fx);
  const r = run(fx.root);
  assert.equal(r.status, 1, `expected a violation; stdout:\n${r.stdout}\nstderr:\n${r.stderr}`);
  assert.match(r.stderr, pattern);
}

test('control: the minimal bundle is clean', () => {
  const { root } = fixture();
  const r = run(root);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /bundle integrity OK/);
});

test('control: a dot-prefixed local overlay inside a subject is ignored', () => {
  const { root, b } = fixture();
  fs.writeFileSync(path.join(b, 'topic', '.evidence.local.md'), '---\nevidence: [x]\n---\n');
  assert.equal(run(root).status, 0);
});

// ---- (a) leak keys outside concept frontmatter
test('leak: an evidence key in index.md frontmatter fails', () => expectRed(({ b }) => {
  fs.writeFileSync(path.join(b, 'index.md'), '---\nokf_version: "0.1"\nokf_bundle_name: demo\npurity: generic\nevidence: [x]\n---\n');
}, /index\.md.*"evidence"/));

test('leak: a deviations key in _laws.md frontmatter fails', () => expectRed(({ b }) => {
  fs.writeFileSync(path.join(b, '_laws.md'), '---\ndeviations: [gap-1]\n---\n\n## <a id="law-one"></a> law-one\n');
}, /_laws\.md.*"deviations"/));

test('leak: a counter_evidence key anywhere in taxonomy.json fails', () => expectRed(({ b }) => {
  const f = path.join(b, 'taxonomy.json');
  const tx = JSON.parse(fs.readFileSync(f, 'utf8'));
  tx.categories[0].counter_evidence = ['x'];
  fs.writeFileSync(f, JSON.stringify(tx));
}, /taxonomy\.json.*"counter_evidence"/));

test('leak: a non-dot evidence.local.md fails', () => expectRed(({ b }) => {
  fs.writeFileSync(path.join(b, 'evidence.local.md'), '# local\n');
}, /evidence\.local\.md/));

// ---- (b) subject is a leaf
test('leaf: a stray .md beside the golden path fails', () => expectRed(({ b }) => {
  fs.writeFileSync(path.join(b, 'topic', 'notes.md'), '# notes\n');
}, /topic\/notes\.md.*leaf/));

test('leaf: a subdirectory inside a subject fails', () => expectRed(({ b }) => {
  fs.mkdirSync(path.join(b, 'topic', 'drafts'));
  fs.writeFileSync(path.join(b, 'topic', 'drafts', 'x.md'), '# x\n');
}, /topic\/drafts\/.*leaf/));

test('leaf: a subdirectory inside techniques/ fails', () => expectRed(({ b }) => {
  fs.mkdirSync(path.join(b, 'topic', 'techniques', 'old'));
  fs.writeFileSync(path.join(b, 'topic', 'techniques', 'old', 'x.md'), '# x\n');
}, /techniques\/old\//));

test('leaf: a non-markdown file inside techniques/ fails', () => expectRed(({ b }) => {
  fs.writeFileSync(path.join(b, 'topic', 'techniques', 'check.txt'), 'x\n');
}, /techniques\/check\.txt/));

// ---- (c) the frontmatter parser
test('parser: an unclosed [ fails', () => expectRed(({ b }) => {
  fs.writeFileSync(path.join(b, 'topic', 'techniques', 'check.md'),
    TECHNIQUE(['use_when: [a gate needs a canary']));
}, /unclosed/));

test('parser: a duplicate key fails', () => expectRed(({ b }) => {
  fs.writeFileSync(path.join(b, 'topic', 'techniques', 'check.md'),
    TECHNIQUE(['use_when: [a gate needs a canary]', 'status: forged']));
}, /duplicate key "status"/));

test('parser: a garbage line fails', () => expectRed(({ b }) => {
  fs.writeFileSync(path.join(b, 'topic', 'techniques', 'check.md'),
    TECHNIQUE(['use_when: [a gate needs a canary]', 'this line is not yaml']));
}, /not a key, list item or comment/));

test('parser: comments, blank lines and block lists stay legal', () => {
  const { root, b } = fixture();
  fs.writeFileSync(path.join(b, 'topic', 'techniques', 'check.md'),
    TECHNIQUE(['# why this technique exists', '', 'use_when:', '  - a gate needs a canary', '  - a floor is missing']));
  assert.equal(run(root).status, 0);
});

// ---- (b2) only the gitignored overlay shape is local. .gitignore ignores `**/.*.local.md`
// and `**/.*.local.json`; any other dot-named file or folder is tracked and published, so
// the gate must read it. It used to skip every dot entry as "a local overlay".
test('dot entries: a tracked dot file inside a subject is not an overlay and fails the leaf rule', () => expectRed(({ b }) => {
  fs.writeFileSync(path.join(b, 'topic', '.notes.md'), '# notes\n');
}, /topic\/\.notes\.md.*leaf/));

test('dot entries: an evidence key in a tracked dot file fails the leak rule', () => expectRed(({ b }) => {
  fs.writeFileSync(path.join(b, 'topic', '.notes.md'), '---\nevidence: [src/private.ts:12]\n---\n');
}, /topic\/\.notes\.md: published frontmatter declares "evidence"/));

test('dot entries: a dot folder inside a subject fails the leaf rule', () => expectRed(({ b }) => {
  fs.mkdirSync(path.join(b, 'topic', '.drafts'));
  fs.writeFileSync(path.join(b, 'topic', '.drafts', 'x.md'), '# x\n');
}, /topic\/\.drafts\/.*leaf/));

test('dot entries: a dot file inside techniques/ fails', () => expectRed(({ b }) => {
  fs.writeFileSync(path.join(b, 'topic', 'techniques', '.old.md'), '# old\n');
}, /techniques\/\.old\.md/));

test('dot entries: a NUL byte in a tracked dot file outside any subject fails file health', () => expectRed(({ b }) => {
  fs.mkdirSync(path.join(b, '.archive'));
  fs.writeFileSync(path.join(b, '.archive', '.kept.md'), 'a\u0000b\n');
}, /\.archive\/\.kept\.md: contains 1 NUL byte/));

test('control: the gitignored overlay shapes (.x.local.md, .x.local.json) stay ignored', () => {
  const { root, b } = fixture();
  fs.writeFileSync(path.join(b, 'topic', '.evidence.local.md'), '---\nevidence: [x]\n---\n');
  fs.writeFileSync(path.join(b, 'topic', 'techniques', '.check.local.json'), '{"evidence":["x"]}');
  const r = run(root);
  assert.equal(r.status, 0, r.stderr);
});

// ---- (d) use_when on techniques
test('use_when: a technique without one fails', () => expectRed(({ b }) => {
  fs.writeFileSync(path.join(b, 'topic', 'techniques', 'check.md'), TECHNIQUE([]));
}, /use_when/));

test('use_when: an empty list fails', () => expectRed(({ b }) => {
  fs.writeFileSync(path.join(b, 'topic', 'techniques', 'check.md'), TECHNIQUE(['use_when: []']));
}, /use_when/));
