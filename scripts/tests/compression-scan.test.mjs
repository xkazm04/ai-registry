// compression-scan's arguments. A typo'd --domain filtered every bundle away and the run
// then reported "lane "entry" came back empty. THE CLASSIFIER IS BROKEN." (exit 2) - a
// misdirection that sends the operator to debug an instrument that works. A --top with no
// number became NaN and printed an EMPTY worklist with exit 0. Both are usage errors and
// are refused before the corpus is walked. The script reads its tree from its own location,
// so each case runs a copy of it over a five-document fixture.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROSE = 'the cache is warm and the prefix is resident in it so the next call is cheap and fast';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'compression-scan-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.copyFileSync(path.join(SCRIPTS, 'compression-scan.mjs'), path.join(root, 'scripts', 'compression-scan.mjs'));
  const put = (rel, body) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), body);
  };
  put('rules/ai-registry-demo.md', `# demo\n\n${PROSE}\n`);
  put('knowledge/demo/_laws.md', `# laws\n\n${PROSE}\n`);
  put('knowledge/demo/core/topic/topic.md', `# topic\n\n${PROSE}\n\n${PROSE}\n`);
  put('knowledge/demo/core/topic/techniques/rule.md', `# rule\n\n${PROSE}\n`);
  put('knowledge/demo/core/topic/applications/node--rule.md', '# node\n\nsome stack text\n');
  return (...args) => spawnSync(process.execPath, [path.join(root, 'scripts', 'compression-scan.mjs'), ...args], { encoding: 'utf8' });
}

test('control: --json --top 2 --domain demo ranks the fixture (exit 0)', (t) => {
  const r = fixture(t)('--json', '--top', '2', '--domain', 'demo');
  assert.equal(r.status, 0, r.stderr);
  const out = JSON.parse(r.stdout);
  assert.equal(out.documents, 5);
  assert.equal(out.worklist.length, 2);
});

test('an unknown --domain is a usage error naming the known bundles, not a broken classifier', (t) => {
  const r = fixture(t)('--domain', 'dmeo');
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stderr, /unknown --domain "dmeo"/);
  assert.match(r.stderr, /known: demo/);
  assert.doesNotMatch(r.stderr, /CLASSIFIER IS BROKEN/);
});

// knowledge.yml runs `--self-test && <the scan>`: the flag must parse, and mean self-test only.
test('--self-test runs the self-test alone (exit 0) and walks nothing', (t) => {
  const r = fixture(t)('--self-test');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /self-test passed/);
  assert.doesNotMatch(r.stdout, /WORKLIST/);
});

for (const args of [['--top'], ['--top', 'ten'], ['--top', '0'], ['--top', '--json'], ['--domain'], ['--show'], ['--shwo', 'x']]) {
  test(`${args.join(' ')} is a usage error (exit 2), not a silent default`, (t) => {
    const r = fixture(t)(...args);
    assert.equal(r.status, 2, `${args.join(' ')}: ${r.stdout}`);
    assert.match(r.stderr, /usage: node scripts\/compression-scan\.mjs/);
  });
}
