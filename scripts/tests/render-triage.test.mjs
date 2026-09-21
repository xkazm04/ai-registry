import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const script=fileURLToPath(new URL('../render-triage.mjs',import.meta.url));
const run=(...args)=>spawnSync(process.execPath,[script,...args],{encoding:'utf8'});
function fixture(t){
 const temp=fs.realpathSync(os.tmpdir()),dir=fs.mkdtempSync(path.join(temp,'render-triage-test-'));
 t.after(()=>{
  const rel=path.relative(temp,fs.realpathSync(dir));
  if(!rel.startsWith('render-triage-test-')||rel.includes(path.sep))throw new Error('unsafe cleanup');
  fs.rmSync(dir,{recursive:true,force:true});
 });
 fs.mkdirSync(path.join(dir,'renders'));
 for(const f of ['shot1-armA.mp4','shot1-armB.mp4','sheet.png'])fs.writeFileSync(path.join(dir,'renders',f),Buffer.alloc(1024,f));
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({run:'intake-test1',question:'which?',variable:'prompt',
  pairs:[{id:'shot1',brief:'the mist clears',discrimination:{between:20,within:4,metric:'test'},arms:{A:{file:'renders/shot1-armA.mp4',prompt:'Style: anime cel shading. the mist clears'},B:{file:'renders/shot1-armB.mp4',prompt:'the mist clears, camera pushes in'}}}],
  showcase:[{file:'renders/sheet.png',caption:'character sheet'}]}));
 return dir;
}
test('sheet is blind: neutral names, sealed key, no arm file or prompt in the page',t=>{
 const dir=fixture(t),r=run('sheet',dir);assert.equal(r.status,0,r.stderr);
 const html=fs.readFileSync(path.join(dir,'triage','index.html'),'utf8'),key=JSON.parse(fs.readFileSync(path.join(dir,'triage','key.json'),'utf8'));
 assert.deepEqual(Object.values(key.pairs.shot1).sort(),['A','B']);
 assert.doesNotMatch(html,/armA|armB|Style: anime/);
 assert.ok(fs.existsSync(path.join(dir,'triage','shot1-X.mp4'))&&fs.existsSync(path.join(dir,'triage','shot1-Y.mp4')));
});
test('a brief shared by every arm is not a leak; a prompt unique to one arm still is',t=>{
 const dir=fixture(t),mf=path.join(dir,'manifest.json'),m=JSON.parse(fs.readFileSync(mf,'utf8'));
 m.pairs[0].brief='the mist clears slowly over the island';
 m.pairs[0].arms.B.prompt='the mist clears slowly over the island';
 m.pairs[0].arms.A.prompt='Style: anime cel shading. the mist clears slowly over the island';
 fs.writeFileSync(mf,JSON.stringify(m));
 assert.equal(run('sheet',dir).status,0);
 m.pairs[0].brief=m.pairs[0].arms.A.prompt;fs.writeFileSync(mf,JSON.stringify(m));
 const r=run('sheet',dir);assert.equal(r.status,2);assert.match(r.stderr,/prompt of arm A/);
});
test('a pair whose arms do not clear the seed-noise floor, or carry no floor, never reaches the operator',t=>{
 const dir=fixture(t),mf=path.join(dir,'manifest.json'),m=JSON.parse(fs.readFileSync(mf,'utf8'));
 m.pairs[0].discrimination={between:5,within:4};fs.writeFileSync(mf,JSON.stringify(m));
 let r=run('sheet',dir);assert.equal(r.status,2);assert.match(r.stderr,/same process/);
 assert.ok(!fs.existsSync(path.join(dir,'triage','index.html')));
 assert.equal(run('sheet',dir,'--allow-indistinct').status,0);
 delete m.pairs[0].discrimination;fs.writeFileSync(mf,JSON.stringify(m));
 r=run('sheet',dir);assert.equal(r.status,2);assert.match(r.stderr,/no discrimination record/);
});
test('reveal maps the operator label to the arm through the key',t=>{
 const dir=fixture(t);run('sheet',dir);
 const key=JSON.parse(fs.readFileSync(path.join(dir,'triage','key.json'),'utf8'));
 assert.equal(run('reveal',dir,'shot1=X').status,0);
 assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'verdict.json'),'utf8')).pairs.shot1.arm,key.pairs.shot1.X);
 assert.equal(run('reveal',dir,'shot1=Q').status,2);
});
test('clean refuses before a verdict, then removes media and run-named paths only',t=>{
 const dir=fixture(t);run('sheet',dir);
 const comfy=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'render-triage-test-comfy-'));
 t.after(()=>fs.rmSync(comfy,{recursive:true,force:true}));
 fs.writeFileSync(path.join(comfy,'intake-test1_ref.png'),'x');fs.writeFileSync(path.join(comfy,'someone-else.png'),'x');
 assert.equal(run('clean',dir,'--also',comfy).status,2);
 run('reveal',dir,'shot1=tie');
 const r=run('clean',dir,'--also',comfy);assert.equal(r.status,0,r.stderr);
 assert.ok(!fs.existsSync(path.join(dir,'renders','shot1-armA.mp4')));
 assert.ok(!fs.existsSync(path.join(comfy,'intake-test1_ref.png')));
 assert.ok(fs.existsSync(path.join(comfy,'someone-else.png')));
 assert.ok(fs.existsSync(path.join(dir,'verdict.json')));
 const stray=path.join(dir,'unrelated.txt');fs.writeFileSync(stray,'x');
 assert.equal(run('clean',dir,'--also',stray).status,2);
});
