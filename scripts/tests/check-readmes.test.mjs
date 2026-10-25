// check-readmes exit contract. The 2026-10-25 gates probe found three greens that
// measured nothing or hid a finding: no fleet bridge swept 0 documents and exited 0,
// `--json` never exited non-zero, and the fleet was read from the caller's cwd. Each case
// below plants one of those and asserts the exit code directly; each has a clean control.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const SCRIPT = path.join(root, 'scripts/check-readmes.mjs');

function scratch(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-readmes-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
/** A project whose landing document passes every measure. */
function goodProject(dir) {
  fs.mkdirSync(path.join(dir, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'README.md'), [
    '# Demo', '', '| Page | What |', '|---|---|', '| [Guide](docs/guide.md) | everything |', '', 'Short prose.', '',
  ].join('\n'));
  fs.writeFileSync(path.join(dir, 'docs/guide.md'), `${'word '.repeat(200)}\n`);
  return dir;
}
/** A project whose landing document routes nowhere (one finding). */
function badProject(dir) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'README.md'), '# Demo\n\n```sh\nrun it\n```\n\nSome prose.\n');
  return dir;
}
/** A copy of the script in a registry with no machine bridge. */
function bridgeless(t) {
  const dir = scratch(t);
  fs.cpSync(path.join(root, 'scripts/lib'), path.join(dir, 'scripts/lib'), { recursive: true });
  fs.copyFileSync(SCRIPT, path.join(dir, 'scripts/check-readmes.mjs'));
  return dir;
}
const run = (script, args, cwd = root) => spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' });

test('--path: a clean project exits 0, a project with findings exits 1', (t) => {
  const dir = scratch(t);
  assert.equal(run(SCRIPT, ['--path', goodProject(path.join(dir, 'good'))]).status, 0);
  assert.equal(run(SCRIPT, ['--path', badProject(path.join(dir, 'bad'))]).status, 1);
});

test('--json exits 1 on findings and 0 when clean', (t) => {
  const dir = scratch(t);
  const bad = run(SCRIPT, ['--json', '--path', badProject(path.join(dir, 'bad'))]);
  assert.equal(bad.status, 1);
  assert.equal(JSON.parse(bad.stdout).results[0].findings.length, 1);
  assert.equal(run(SCRIPT, ['--json', '--path', goodProject(path.join(dir, 'good'))]).status, 0);
});

test('no fleet bridge is could-not-run (exit 2), in table and --json form', (t) => {
  const reg = bridgeless(t);
  const script = path.join(reg, 'scripts/check-readmes.mjs');
  const r = run(script, []);
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stderr, /walked 0 projects/);
  assert.equal(run(script, ['--json']).status, 2);
});

test('the fleet resolves from the registry root, not the cwd', (t) => {
  // cwd holds a working bridge to a clean project; the script's own registry has none.
  const cwd = scratch(t);
  goodProject(path.join(cwd, 'fleet', 'demo'));
  fs.writeFileSync(path.join(cwd, '.machine.local.json'), JSON.stringify({ machine: 'box', root: path.join(cwd, 'fleet') }));
  fs.writeFileSync(path.join(cwd, 'projects.json'), JSON.stringify({ projects: { demo: { checkouts: { box: 'demo' } } } }));
  const reg = bridgeless(t);
  assert.equal(run(path.join(reg, 'scripts/check-readmes.mjs'), [], cwd).status, 2);
  // Control: the same bridge placed at the script's registry root is swept and clean.
  fs.copyFileSync(path.join(cwd, '.machine.local.json'), path.join(reg, '.machine.local.json'));
  fs.copyFileSync(path.join(cwd, 'projects.json'), path.join(reg, 'projects.json'));
  const ok = run(path.join(reg, 'scripts/check-readmes.mjs'), [], os.tmpdir());
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(ok.stdout, /1 landing document\(s\) swept, 0 with findings/);
});

// The router-vs-destinations ratio summed one destination once per LINK, so a page routed
// from two rows counted twice and a front page could out-weigh its destinations unseen.
// A link with an #anchor did not count as a route at all.
test('a destination routed twice counts once; an #anchor link still routes', (t) => {
  const dir = path.join(scratch(t), 'p');
  fs.mkdirSync(path.join(dir, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'docs/guide.md'), `${'word '.repeat(150)}\n`);
  const front = `${'prose '.repeat(10)}\n`.repeat(20).split('\n').slice(0, 14).join('\n');
  fs.writeFileSync(path.join(dir, 'README.md'), [
    '# Demo', '', '| Page | What |', '|---|---|', '| [Guide](docs/guide.md) | a |', '| [Again](docs/guide.md) | b |', '', front, '',
  ].join('\n'));
  const r = run(SCRIPT, ['--json', '--path', dir]);
  const res = JSON.parse(r.stdout).results[0];
  assert.equal(res.routedPages, 1);
  assert.equal(res.routedWords, 150);
  // An anchor-only routing table is still a routing table.
  fs.writeFileSync(path.join(dir, 'README.md'), ['# Demo', '', '| Page | What |', '|---|---|', '| [Install](docs/guide.md#install) | a |', '', 'Short prose.', ''].join('\n'));
  const anchored = JSON.parse(run(SCRIPT, ['--json', '--path', dir]).stdout).results[0];
  assert.equal(anchored.routedPages, 1);
  assert.equal(anchored.routedWords, 150);
  fs.writeFileSync(path.join(dir, 'README.md'), [
    '# Demo', '', '| Page | What |', '|---|---|', '| [Guide](docs/guide.md) | a |', '| [Again](docs/guide.md) | b |', '', front, '',
  ].join('\n'));
  assert.ok(res.words > 150 && res.words < 300, `fixture words ${res.words} must sit between the true and the doubled routed count`);
  assert.equal(r.status, 1, 'the front page out-weighs its one destination; the doubled count hid that');
});

test('--path with no directory is could-not-run (exit 2)', () => {
  assert.equal(run(SCRIPT, ['--path']).status, 2);
  assert.equal(run(SCRIPT, ['--path', '--json']).status, 2);
});
