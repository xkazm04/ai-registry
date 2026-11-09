// build-readme: README.md's lane table, lane count and maintenance-skills list are derived
// from registry.yaml and .claude/skills/, and --check fails on a stale block, a dead path
// or a marker that is not there exactly once - without rewriting the README.
// Each case runs the real script with --root against a small synthetic checkout.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { build } from '../build-readme.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const script = path.join(root, 'scripts', 'build-readme.mjs');

const REGISTRY = `registry: 1
lanes:
  alpha:
    path: alpha/
    holds: Alpha things, one per file, folded over
      two lines.
    status: Real.
    spec: docs/alpha.md
    gate: scripts/check-alpha.mjs
    depth: fixed   # alpha/<slug>.md
  beta:
    path: beta/
    holds: Beta things.
    status: Seed.
    spec: docs/beta.md
    depth: nested
`;

const README = `# fixture

<!-- generated: lanes - by scripts/build-readme.mjs from registry.yaml; edit the source, then re-run -->
stale
<!-- /generated: lanes -->

Hand-written prose stays.

## Layout

\`\`\`
README.md
registry.yaml             # the declaration
.claude/skills/           # the skills that maintain THIS registry: /old
alpha/<slug>.md           # placeholder, skipped
rules/x-*.md              # glob
.machine.local.json       # GITIGNORED: machine state
\`\`\`

### Skills

<!-- generated: maintenance-skills - by scripts/build-readme.mjs from .claude/skills/; edit the source, then re-run -->
old
<!-- /generated: maintenance-skills -->
More prose.
`;

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'build-readme-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const put = (rel, text = '') => { fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true }); fs.writeFileSync(path.join(dir, rel), text); };
  put('registry.yaml', REGISTRY);
  put('README.md', README);
  put('alpha/README.md', '# alpha');
  put('beta/.keep');
  put('docs/alpha.md');
  put('docs/beta.md');
  put('rules/x-one.md');
  put('.claude/skills/zeta/SKILL.md');
  put('.claude/skills/alef/SKILL.md');
  fs.mkdirSync(path.join(dir, '.claude/skills/not-a-skill'));
  return dir;
}
const run = (dir, ...args) => spawnSync(process.execPath, [script, '--root', dir, ...args], { encoding: 'utf8' });
const readme = (dir) => fs.readFileSync(path.join(dir, 'README.md'), 'utf8');
const edit = (dir, rel, fn) => fs.writeFileSync(path.join(dir, rel), fn(fs.readFileSync(path.join(dir, rel), 'utf8')));

test('one write makes --check green; a second write changes nothing; prose outside the blocks is untouched', (t) => {
  const dir = fixture(t);
  assert.equal(run(dir, '--check').status, 1, 'stale before the first write');
  const w1 = run(dir);
  assert.equal(w1.status, 0, w1.stderr);
  const after = readme(dir);
  assert.match(after, /The repository carries two lanes, declared in/);
  assert.match(after, /\| \[`alpha\/`\]\(alpha\/README\.md\) \| Alpha things, one per file, folded over two lines\. \| Real\. \|/);
  assert.match(after, /\| \[`beta\/`\]\(docs\/beta\.md\) \| Beta things\. \| Seed\. \|/, 'no README: the spec is the link');
  assert.match(after, /: alef, and zeta\.\n<!-- \/generated: maintenance-skills -->/);
  assert.match(after, /^\.claude\/skills\/ {11}# the skills that maintain THIS registry: \/alef \/zeta$/m);
  const strip = (s) => s.replace(/<!-- generated: ([a-z-]+) [^\n]*-->\n[\s\S]*?<!-- \/generated: \1 -->/g, '[$1]').replace(/THIS registry:.*$/m, 'THIS registry:');
  assert.equal(strip(after), strip(README), 'text outside the blocks is byte-identical');
  const c = run(dir, '--check');
  assert.equal(c.status, 0, c.stderr);
  assert.equal(run(dir).status, 0);
  assert.equal(readme(dir), after, 'second write is a no-op');
});

test('adding a lane to registry.yaml without regenerating fails --check (exit 1)', (t) => {
  const dir = fixture(t);
  run(dir);
  edit(dir, 'registry.yaml', (s) => `${s}  gamma:\n    path: beta/\n    holds: Gamma.\n    status: New.\n    spec: docs/beta.md\n    depth: fixed\n`);
  const r = run(dir, '--check');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /generated block\(s\) are stale/);
});

test('a new maintenance skill without regenerating fails --check (exit 1)', (t) => {
  const dir = fixture(t);
  run(dir);
  fs.mkdirSync(path.join(dir, '.claude/skills/mid'));
  fs.writeFileSync(path.join(dir, '.claude/skills/mid/SKILL.md'), '');
  assert.equal(run(dir, '--check').status, 1);
});

test('a layout line naming a path that does not exist fails --check (exit 1)', (t) => {
  const dir = fixture(t);
  run(dir);
  edit(dir, 'README.md', (s) => s.replace('registry.yaml             # the declaration\n', 'registry.yaml             # the declaration\nscripts/gone.mjs# nothing here\n'));
  const r = run(dir, '--check');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /names a path that does not exist - layout line \d+: scripts\/gone\.mjs/);
});

test('a glob in the layout with no match is a dead path', (t) => {
  const dir = fixture(t);
  run(dir);
  fs.rmSync(path.join(dir, 'rules/x-one.md'));
  const r = run(dir, '--check');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /rules\/x-\*\.md/);
});

test('a lane whose spec does not exist is a dead path in the lane table', (t) => {
  const dir = fixture(t);
  fs.rmSync(path.join(dir, 'docs/beta.md'));
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /lane table: docs\/beta\.md/);
});

test('a duplicated marker exits 1 and does not rewrite the README', (t) => {
  const dir = fixture(t);
  edit(dir, 'README.md', (s) => `${s}\n<!-- generated: lanes - by scripts/build-readme.mjs from registry.yaml; edit the source, then re-run -->\nx\n<!-- /generated: lanes -->\n`);
  const before = readme(dir);
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /block "lanes" must appear exactly once - found 2 open marker\(s\), 2 close marker\(s\)/);
  assert.equal(readme(dir), before, 'not rewritten');
});

test('a missing marker exits 1 and does not rewrite the README', (t) => {
  const dir = fixture(t);
  edit(dir, 'README.md', (s) => s.replace('<!-- /generated: maintenance-skills -->\n', ''));
  const before = readme(dir);
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /block "maintenance-skills" must appear exactly once - found 1 open marker\(s\), 0 close marker\(s\)/);
  assert.equal(readme(dir), before, 'not rewritten');
});

test('a second layout skills line exits 1 without rewriting', (t) => {
  const dir = fixture(t);
  edit(dir, 'README.md', (s) => s.replace('README.md\nregistry.yaml', 'README.md\n.claude/skills/ # the skills that maintain THIS registry: /x\nregistry.yaml'));
  const before = readme(dir);
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /exactly one "\.claude\/skills\/ .*" line - found 2/);
  assert.equal(readme(dir), before);
});

test('registry.yaml outside the reader subset is "could not run" (exit 2), naming the line', (t) => {
  const dir = fixture(t);
  edit(dir, 'registry.yaml', (s) => s.replace('    status: Seed.\n', '    status: |\n      Seed.\n'));
  const r = run(dir, '--check');
  assert.equal(r.status, 2);
  assert.match(r.stderr, /registry\.yaml:14: block scalars/);
});

test('a lane with no status is "could not run" (exit 2)', (t) => {
  const dir = fixture(t);
  edit(dir, 'registry.yaml', (s) => s.replace('    status: Seed.\n', ''));
  const r = run(dir, '--check');
  assert.equal(r.status, 2);
  assert.match(r.stderr, /lane "beta" has no `status`/);
});

test('an unknown argument is refused (exit 2)', () => {
  const r = spawnSync(process.execPath, [script, '--wirte'], { encoding: 'utf8' });
  assert.equal(r.status, 2);
});

test("this repository's README is current with registry.yaml and .claude/skills/", () => {
  const text = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  const { text: next, problems } = build(root, text);
  assert.deepEqual(problems, []);
  assert.equal(next, text.replace(/\r\n/g, '\n'), 'run node scripts/build-readme.mjs');
});
