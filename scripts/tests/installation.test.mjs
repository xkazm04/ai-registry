import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {installRegistry,checkInstallation} from '../lib/installation.mjs';

test('installation pins releases, follows development, switches explicitly and preserves unmanaged files',t=>{
 const temp=fs.realpathSync(os.tmpdir());
 const fixture=fs.mkdtempSync(path.join(temp,'registry-install-test-'));
 t.after(()=>{
  // Remove junctions first: never recurse through a discovery link on Windows.
  for(const project of ['consumer','unmanaged'])for(const name of ['alpha','beta']){
   const p=path.join(fixture,project,'.agents/skills',name);
   if(fs.existsSync(p)&&fs.lstatSync(p).isSymbolicLink())fs.unlinkSync(p);
  }
  const resolved=fs.realpathSync(fixture),rel=path.relative(temp,resolved);
  if(!rel.startsWith('registry-install-test-')||rel.includes(path.sep)||path.isAbsolute(rel))throw new Error('unsafe cleanup');
  fs.rmSync(resolved,{recursive:true,force:true});
 });
 const registry=path.join(fixture,'source'),project=path.join(fixture,'consumer');
 fs.mkdirSync(project);fs.mkdirSync(registry);
 const git=(...args)=>execFileSync('git',['-C',registry,...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
 git('init');git('config','user.name','Fixture');git('config','user.email','fixture@example.invalid');
 const write=(name,version)=>{fs.mkdirSync(path.join(registry,'skills',name),{recursive:true});fs.writeFileSync(path.join(registry,'skills',name,'SKILL.md'),`---\nname: ${name}\nversion: ${version}\ndescription: Fixture skill\n---\nDo the fixture.\n`);};
 write('alpha','1.0.0');write('beta','1.0.0');git('add','.');git('commit','-m','baseline');
 const baseline=git('rev-parse','HEAD');
 const options={registry,project,harness:'codex',mode:'release',skills:['alpha','beta']};
 assert.throws(()=>installRegistry({...options,required:['web.read']}),/missing capabilities/);
 assert.equal(fs.existsSync(path.join(project,'.agents')),false);
 installRegistry(options);
 const installed=path.join(project,'.agents/skills/alpha/SKILL.md');
 const old=fs.readFileSync(installed,'utf8');
 write('alpha','1.1.0');
 assert.equal(fs.readFileSync(installed,'utf8'),old,'release ignores development edits');
 assert.deepEqual(checkInstallation(project,'codex').problems,[]);
 assert.throws(()=>installRegistry(options),/use --update/);
 git('add','.');git('commit','-m','upgrade');
 installRegistry({...options,update:true});
 assert.match(fs.readFileSync(installed,'utf8'),/1\.1\.0/);
 installRegistry({...options,revision:baseline,update:true});
 assert.equal(fs.readFileSync(installed,'utf8'),old,'explicit rollback restores baseline');
 fs.appendFileSync(installed,'Edited snapshot\n');
 assert.equal(checkInstallation(project,'codex').problems.length,1);
 assert.throws(()=>installRegistry({...options,update:true}),/release was edited/);
 fs.writeFileSync(installed,old);
 installRegistry({...options,mode:'development',update:true});
 write('alpha','1.2.0');assert.match(fs.readFileSync(installed,'utf8'),/1\.2\.0/);
 const unmanaged=path.join(fixture,'unmanaged');
 fs.mkdirSync(path.join(unmanaged,'.agents/skills/alpha'),{recursive:true});
 fs.writeFileSync(path.join(unmanaged,'.agents/skills/alpha/local.txt'),'preserve');
 assert.throws(()=>installRegistry({...options,project:unmanaged,update:true}),/unmanaged/);
 assert.equal(fs.readFileSync(path.join(unmanaged,'.agents/skills/alpha/local.txt'),'utf8'),'preserve');
 // A cache conflict in the second skill must leave the first link unchanged.
 const currentTarget=fs.realpathSync(path.dirname(installed));
 const conflict=path.join(project,'.ai/registry-releases',baseline,'beta','extra.txt');
 fs.writeFileSync(conflict,'conflict');
 assert.throws(()=>installRegistry({...options,revision:baseline,update:true}),/unexpected files/);
 assert.equal(fs.realpathSync(path.dirname(installed)),currentTarget);
});
