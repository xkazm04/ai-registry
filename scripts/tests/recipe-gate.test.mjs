import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root=fileURLToPath(new URL('../../',import.meta.url));

test('recipe gate repairs stale views but never regenerates malformed source', (t)=>{
 const temp=fs.realpathSync(os.tmpdir());
 const fixture=fs.mkdtempSync(path.join(temp,'registry-recipe-test-'));
 t.after(()=>{
  const resolved=fs.realpathSync(fixture);
  const rel=path.relative(temp,resolved);
  if(!rel.startsWith('registry-recipe-test-')||rel.includes(path.sep)||path.isAbsolute(rel))throw new Error('unsafe fixture cleanup');
  fs.rmSync(resolved,{recursive:true,force:true});
 });
 fs.mkdirSync(path.join(fixture,'scripts'));
 for(const file of ['gate.mjs','check-recipes.mjs','render-recipes.mjs','build-recipes-index.mjs']) fs.copyFileSync(path.join(root,'scripts',file),path.join(fixture,'scripts',file));
 fs.cpSync(path.join(root,'scripts/lib'),path.join(fixture,'scripts/lib'),{recursive:true});
 const recipe='recipes/software_engineering/engineering-records/skill-library-audit';
 fs.cpSync(path.join(root,recipe),path.join(fixture,recipe),{recursive:true});
 fs.writeFileSync(path.join(fixture,'recipes/index.json'),'{}\n');
 const run=(args=[])=>{
  const r=spawnSync(process.execPath,['scripts/gate.mjs','--lane','recipes',...args],{cwd:fixture,encoding:'utf8'});
  if(r.error)throw r.error;
  return r;
 };
 assert.equal(run().status,1);
 let r=run(['--write']);assert.equal(r.status,0,r.stderr);
 assert.equal(run().status,0);
 const view=path.join(fixture,recipe,'RECIPE.md');
 const original=fs.readFileSync(view,'utf8');
 fs.writeFileSync(view,original.replace('## Guidance','## WRONG GUIDANCE'));
 assert.equal(run().status,1,'prose-only drift must fail even with identical metadata');
 assert.equal(run(['--write']).status,0);
 assert.equal(fs.readFileSync(view,'utf8'),original);
 const file=path.join(fixture,recipe,'recipe.json');
 const obj=JSON.parse(fs.readFileSync(file,'utf8'));delete obj.slug;
 fs.writeFileSync(file,JSON.stringify(obj));
 assert.equal(run(['--write']).status,1);
 assert.equal(fs.readFileSync(view,'utf8'),original,'invalid source must not overwrite view');
});
