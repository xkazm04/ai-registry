import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT } from '../lib/exit-codes.mjs';

const GATE = fileURLToPath(new URL('../gate.mjs', import.meta.url));
const gate = (...args) => spawnSync(process.execPath, [GATE, ...args], { encoding: 'utf8' });

test('unfiltered CI delegates to the local validation plan and both version checks',()=>{
 const source=fs.readFileSync(new URL('../../.github/workflows/registry.yml',import.meta.url),'utf8');
 const content=source.split('\n').filter((line)=>!line.trim().startsWith('#')).join('\n');
 assert.doesNotMatch(content,/^\s*(paths|paths-ignore):/m);
 assert.match(content,/run: node scripts\/gate\.mjs --all/);
 assert.match(content,/node scripts\/check-skills\.mjs --since "\$BASE_SHA"/);
 assert.match(content,/node scripts\/check-recipes\.mjs --since "\$BASE_SHA"/);
});

// gate.mjs used to keep two hand-written lists, the lane rows and ALL. It now declares
// each step once in one PLAN table and derives both, so they cannot drift - but this still
// holds the derivation to account: CI runs only --all, so a step in a lane but not in
// --all is a gate nobody's PR ever meets, and a step in --all that no lane names is one
// no contributor can run on its own. The union is derived here from the rows.
test('--all is exactly the union of the lane rows, each step once', () => {
  const r = gate('--list');
  assert.equal(r.status, EXIT.OK, r.stdout + r.stderr);
  const plan = JSON.parse(r.stdout);
  assert.ok(plan.all.length > 0 && Object.keys(plan.lanes).length > 0, 'an empty plan proves nothing');
  assert.equal(new Set(plan.all).size, plan.all.length, `a step runs twice under --all: ${plan.all}`);
  const union = new Set(Object.values(plan.lanes).flat());
  assert.deepEqual([...plan.all].sort(), [...union].sort(), 'ALL and the union of LANES disagree');
});

// A typo'd mode flag used to be ignored: `--lane knowledge --wirte` ran the check row and
// printed green, and the contributor believed the index was regenerated.
test('an unknown argument is could-not-run before any step starts', () => {
  for (const args of [['--lane', 'scripts', '--wirte'], ['--all', '--lsit'], ['--lane', 'recipes', 'extra']]) {
    const r = gate(...args);
    assert.equal(r.status, EXIT.FATAL, `${args.join(' ')}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /unknown argument/);
    assert.doesNotMatch(r.stdout, /^--- node/m, `${args.join(' ')} started a step`);
  }
});

// One plan, not two lists: each lane row is --all filtered, so every row is a subsequence
// of --all in the same order, and the source no longer carries an ALL or LANES literal.
test('every lane row is --all filtered to the lane, in --all order', () => {
  const plan = JSON.parse(gate('--list').stdout);
  for (const [lane, row] of Object.entries(plan.lanes)) {
    assert.deepEqual(row, plan.all.filter((id) => row.includes(id)), `lane ${lane} is not --all filtered`);
  }
  const source = fs.readFileSync(GATE, 'utf8');
  assert.doesNotMatch(source, /^const ALL\s*=/m, 'a hand-written ALL list is back');
  assert.doesNotMatch(source, /^const LANES\s*=\s*\{/m, 'a hand-written LANES table is back');
});

// registry.yaml declares each lane's gate script. A lane whose row does not run its own
// declared gate is a lane `--lane <name>` reports green without ever checking. Read line
// by line (two-space lane key, four-space `gate:`), not with a YAML parser.
test("every lane's registry.yaml gate script is in that lane's row", () => {
  const plan = JSON.parse(gate('--list').stdout);
  const yaml = fs.readFileSync(new URL('../../registry.yaml', import.meta.url), 'utf8');
  const declared = [];
  let inLanes = false;
  let lane = null;
  for (const line of yaml.split(/\r?\n/)) {
    if (/^\S/.test(line) && !line.startsWith('#')) { inLanes = /^lanes:\s*$/.test(line); lane = null; continue; }
    if (!inLanes) continue;
    const key = line.match(/^ {2}([A-Za-z][\w-]*):\s*$/);
    if (key) { lane = key[1]; continue; }
    const g = line.match(/^ {4}gate:\s*(\S+)\s*$/);
    if (g && lane) declared.push([lane, g[1].replace(/^scripts\//, '')]);
  }
  assert.ok(declared.length >= 5, `read too few lane gates from registry.yaml: ${JSON.stringify(declared)}`);
  for (const [lane, script] of declared) {
    assert.ok(plan.lanes[lane], `registry.yaml lane "${lane}" has no gate row`);
    assert.ok(plan.lanes[lane].some((id) => id.split(' ')[0] === script), `lane "${lane}" row does not run its declared gate ${script}`);
  }
});

test('--list runs nothing and names every step by script and arguments', () => {
  const plan = JSON.parse(gate('--list').stdout);
  assert.ok(plan.all.includes('check-public-paths.mjs --self-test'));
  assert.ok(plan.all.includes('check-public-paths.mjs'));
  assert.ok(plan.lanes.scripts.includes('run-tests.mjs'));
});
