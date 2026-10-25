import test from 'node:test';
import assert from 'node:assert/strict';
import {validateNote} from '../lib/simple-lanes.mjs';
const note=(lines)=>`---\n${lines.join('\n')}\n---\n\n# A note\nBody.\n`;
test('practice identity, required fields and fixed depth are checked',()=>{
 const raw=note(['id: useful','dimension: D6','applies-when: a real trigger','future: permitted']);
 assert.deepEqual(validateNote('practices','useful/PRACTICE.md',raw),[]);
 assert.ok(validateNote('practices','other/PRACTICE.md',raw).length);
 assert.ok(validateNote('practices','group/useful/PRACTICE.md',raw).length);
 assert.ok(validateNote('practices','useful/PRACTICE.md',note(['id: useful'])).length);
});
test('memory range, kind and duplicate keys reject malformed notes',()=>{
 const fields=['kind: semantic','confidence: 0.6','source: observed'];
 assert.deepEqual(validateNote('memory','semantic/example.md',note(fields)),[]);
 for(const confidence of ['NaN','1.1','-0.2',''])assert.ok(validateNote('memory','semantic/example.md',note([fields[0],`confidence: ${confidence}`,fields[2]])).length);
 assert.ok(validateNote('memory','episodic/example.md',note(fields)).length);
 assert.ok(validateNote('memory','semantic/example.md',note([...fields,'confidence: 1.0'])).length);
});

// ---- the CLI over a planted tree: every probe plant from the 2026-10-25 gates scan
// (misnamed notes the walker used to skip in silence) must exit 1, the clean control 0,
// and an empty lane 2. Each plant is applied to a fresh copy of the clean tree.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkLanes } from '../check-simple-lanes.mjs';

const SCRIPT = fileURLToPath(new URL('../check-simple-lanes.mjs', import.meta.url));
const practice = note(['id: useful', 'dimension: D6', 'applies-when: a real trigger']);
const memoryNote = note(['kind: semantic', 'confidence: 0.6', 'source: observed']);

function tree(t, plant = () => {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'simple-lanes-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const put = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  };
  put('practices/useful/PRACTICE.md', `${practice}See [the starter](starter/AGENTS.md).\n`);
  put('practices/useful/starter/AGENTS.md', '# starter\n');
  put('practices/useful/starter/.github/workflows/ci.yml', 'on: push\n');
  put('memory/_index.md', '# index\n');
  put('memory/semantic/example.md', memoryNote);
  plant(root, put);
  return root;
}
const cli = (root) => spawnSync(process.execPath, [SCRIPT, '--root', root], { encoding: 'utf8' });

test('clean control: the planted tree passes, starter dot-folders and _index.md included', (t) => {
  const r = cli(tree(t));
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /2 notes; 0 violations/);
});

const plants = {
  'memory note with .MD': (root, put) => put('memory/semantic/other.MD', memoryNote),
  'memory note with .markdown': (root, put) => put('memory/semantic/other.markdown', memoryNote),
  'non-md file deep in memory': (root, put) => put('memory/semantic/sub/notes.txt', 'x\n'),
  'memory note under a dot-dir': (root, put) => put('memory/.drafts/other.md', memoryNote),
  'memory dot-file': (root, put) => put('memory/semantic/.other.md', memoryNote),
  'lowercase practice.md': (root, put) => put('practices/second/practice.md', practice.replace('useful', 'second')),
  'practice dir without PRACTICE.md': (root, put) => put('practices/second/README.md', '# x\n'),
  'stray file beside PRACTICE.md': (root, put) => put('practices/useful/notes.md', '# x\n'),
  'practice under a dot-dir': (root, put) => put('practices/.wip/PRACTICE.md', practice),
  'dot-folder beside starter': (root, put) => put('practices/useful/.github/x.yml', 'on: push\n'),
};
for (const [name, plant] of Object.entries(plants)) {
  test(`plant exits 1: ${name}`, (t) => {
    const root = tree(t, plant);
    const r = cli(root);
    assert.equal(r.status, 1, `${r.stdout}\n${r.stderr}`);
    assert.ok(checkLanes(root).failures.length >= 1);
  });
}

test('could-not-run: an empty or missing lane exits 2', (t) => {
  const empty = tree(t, (root) => fs.rmSync(path.join(root, 'memory'), { recursive: true }));
  fs.mkdirSync(path.join(empty, 'memory'));
  assert.equal(cli(empty).status, 2);
  const missing = tree(t, (root) => fs.rmSync(path.join(root, 'practices'), { recursive: true }));
  assert.equal(cli(missing).status, 2);
});

test('CLI: an unknown argument exits 2 before any read; --help exits 0; the plain --root run keeps its exit', (t) => {
  const planted = tree(t);
  assert.equal(cli(planted).status, 0);
  const run = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
  for (const bad of [['--bogus'], ['--since=x'], ['--rot', planted], ['--root'], ['--root', '--bogus'], ['--root', planted, '--bogus'], ['extra']]) {
    const r = run(...bad);
    assert.equal(r.status, 2, `${bad.join(' ')} -> ${r.status}: ${r.stdout}${r.stderr}`);
  }
  const h = run('--help');
  assert.equal(h.status, 0, h.stderr);
  assert.match(h.stdout, /usage: node scripts\/check-simple-lanes\.mjs/);
});
