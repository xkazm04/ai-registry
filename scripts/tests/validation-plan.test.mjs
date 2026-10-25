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

// gate.mjs keeps two hand-written lists: the lane rows, and ALL, "the union, in the order CI
// reaches each job". CI runs only ALL, so a step added to a lane and forgotten in ALL is a
// gate nobody's PR ever meets - and a step in ALL that no lane names is one no contributor
// can run on its own. The union is derived here from the rows, not read off ALL.
test('--all is exactly the union of the lane rows, each step once', () => {
  const r = gate('--list');
  assert.equal(r.status, EXIT.OK, r.stdout + r.stderr);
  const plan = JSON.parse(r.stdout);
  assert.ok(plan.all.length > 0 && Object.keys(plan.lanes).length > 0, 'an empty plan proves nothing');
  assert.equal(new Set(plan.all).size, plan.all.length, `a step runs twice under --all: ${plan.all}`);
  const union = new Set(Object.values(plan.lanes).flat());
  assert.deepEqual([...plan.all].sort(), [...union].sort(), 'ALL and the union of LANES disagree');
});

test('--list runs nothing and names every step by script and arguments', () => {
  const plan = JSON.parse(gate('--list').stdout);
  assert.ok(plan.all.includes('check-public-paths.mjs --self-test'));
  assert.ok(plan.all.includes('check-public-paths.mjs'));
  assert.ok(plan.lanes.scripts.includes('run-tests.mjs'));
});
