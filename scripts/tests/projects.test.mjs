import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {portableCheckout,validatePublicFleet,loadFleet} from '../lib/projects.mjs';
test('fleet keeps roots private and refuses absolute or escaping public checkouts',()=>{
 for(const p of ['C:/Users/example','C:relative','/home/example','../outside','ok/../../bad','\\\\host\\share'])assert.equal(portableCheckout(p),false,p);
 assert.equal(portableCheckout('code/project'),true);
 assert.equal(validatePublicFleet({schema:2,machines:{test:{root:'/private'}},projects:{}}).length,1);
});
test('missing local root reports unknown location instead of guessing from cwd',t=>{
 const temp=fs.realpathSync(os.tmpdir()),fixture=fs.mkdtempSync(path.join(temp,'registry-fleet-test-'));
 t.after(()=>{
  const resolved=fs.realpathSync(fixture),rel=path.relative(temp,resolved);
  if(!rel.startsWith('registry-fleet-test-')||rel.includes(path.sep)||path.isAbsolute(rel))throw new Error('unsafe cleanup');
  fs.rmSync(resolved,{recursive:true,force:true});
 });
 fs.writeFileSync(path.join(fixture,'.machine.local.json'),JSON.stringify({machine:'test'}));
 fs.writeFileSync(path.join(fixture,'projects.json'),JSON.stringify({schema:2,machines:{test:{}},projects:{app:{checkouts:{test:'app'}}}}));
 const fleet=loadFleet(fixture);assert.deepEqual(fleet.projects,{});assert.match(fleet.problems.join(' '),/no root/);
});
