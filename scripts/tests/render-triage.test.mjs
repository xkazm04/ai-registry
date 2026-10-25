import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {indistinct} from '../render-triage.mjs';
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
 const r=run('sheet',dir,'--reseal');assert.equal(r.status,2);assert.match(r.stderr,/prompt of arm A/);
});
test('a pair whose arms do not clear the seed-noise floor, or carry no floor, never reaches the operator',t=>{
 const dir=fixture(t),mf=path.join(dir,'manifest.json'),m=JSON.parse(fs.readFileSync(mf,'utf8'));
 m.pairs[0].discrimination={between:5,within:4};fs.writeFileSync(mf,JSON.stringify(m));
 let r=run('sheet',dir);assert.equal(r.status,2);assert.match(r.stderr,/same process/);
 assert.ok(!fs.existsSync(path.join(dir,'triage','index.html')));
 assert.equal(run('sheet',dir,'--allow-indistinct').status,0);
 delete m.pairs[0].discrimination;fs.writeFileSync(mf,JSON.stringify(m));
 r=run('sheet',dir,'--reseal');assert.equal(r.status,2);assert.match(r.stderr,/no discrimination record/);
});
test('identical arms (between 0) and negative distances never clear the floor',()=>{
 const p=(between,within)=>({id:'p',discrimination:{between,within}});
 assert.equal(indistinct(p(20,4)),null,'control: 5x clears');
 assert.equal(indistinct(p(3,0)),null,'no seed noise and distinct arms clears');
 assert.match(indistinct(p(0,0))??'',/identical|same process/);
 assert.match(indistinct(p(-5,1))??'',/negative/);
 assert.match(indistinct(p(5,-1))??'',/negative/);
});
test('the sheet carries the ratio, and a refused pair is labelled rather than hidden',t=>{
 const dir=fixture(t),mf=path.join(dir,'manifest.json'),m=JSON.parse(fs.readFileSync(mf,'utf8'));
 // A pair that CLEARS the floor still prints its ratio, so the operator always sees it.
 assert.equal(run('sheet',dir).status,0);
 let html=fs.readFileSync(path.join(dir,'triage','index.html'),'utf8');
 assert.match(html,/discrimination 5\.00x/);
 assert.doesNotMatch(html,/may not author a landing/);
 // A REFUSED pair, shown under --allow-indistinct, says so on the page: the gate withholds
 // the landing, not the look, and the operator cannot overrule a number nobody showed them.
 m.pairs[0].discrimination={between:5,within:4};fs.writeFileSync(mf,JSON.stringify(m));
 assert.equal(run('sheet',dir,'--allow-indistinct','--reseal').status,0);
 html=fs.readFileSync(path.join(dir,'triage','index.html'),'utf8');
 assert.match(html,/discrimination 1\.25x/);
 assert.match(html,/may not author a landing/);
 // ...and it is still blind.
 assert.doesNotMatch(html,/armA|armB/);
});
test('reveal maps the operator label to the arm through the key',t=>{
 const dir=fixture(t);run('sheet',dir);
 const key=JSON.parse(fs.readFileSync(path.join(dir,'triage','key.json'),'utf8'));
 assert.equal(run('reveal',dir,'shot1=X').status,0);
 assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'verdict.json'),'utf8')).pairs.shot1.arm,key.pairs.shot1.X);
 assert.equal(run('reveal',dir,'shot1=Q').status,2);
});
test('reveal never overwrites a recorded verdict unless --force says so',t=>{
 const dir=fixture(t);run('sheet',dir);
 assert.equal(run('reveal',dir,'shot1=X').status,0);
 const vf=path.join(dir,'verdict.json'),first=fs.readFileSync(vf,'utf8');
 const r=run('reveal',dir,'shot1=tie');
 assert.equal(r.status,2);assert.match(r.stderr,/verdict\.json already/);
 assert.equal(fs.readFileSync(vf,'utf8'),first,'the recorded judgement is untouched');
 assert.equal(run('reveal',dir,'shot1=tie','--force').status,0);
 assert.equal(JSON.parse(fs.readFileSync(vf,'utf8')).pairs.shot1.arm,'tie');
});
test('reveal refuses a pick for a pair the manifest does not hold',t=>{
 const dir=fixture(t);run('sheet',dir);
 const r=run('reveal',dir,'shot1=X','shto1=Y');
 assert.equal(r.status,2);assert.match(r.stderr,/shto1/);
 assert.ok(!fs.existsSync(path.join(dir,'verdict.json')));
 const twice=run('reveal',dir,'shot1=X','shot1=Y');
 assert.equal(twice.status,2,'two picks for one pair is not a decision');assert.match(twice.stderr,/shot1/);
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
test('clean matches the run id as a whole token: another run whose id merely starts with it survives',t=>{
 const dir=fixture(t);run('sheet',dir);run('reveal',dir,'shot1=tie');
 const comfy=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'render-triage-test-comfy-'));
 t.after(()=>fs.rmSync(comfy,{recursive:true,force:true}));
 // run is intake-test1: intake-test10 and intake-test1b are other runs, not this one
 for(const f of ['intake-test1_ref.png','intake-test1-depth.exr','intake-test10_ref.png','intake-test1b.png'])fs.writeFileSync(path.join(comfy,f),'x');
 const other=path.join(comfy,'renders-intake-test10');fs.mkdirSync(other);fs.writeFileSync(path.join(other,'keep.png'),'x');
 const mine=path.join(comfy,'renders-intake-test1');fs.mkdirSync(mine);fs.writeFileSync(path.join(mine,'gone.png'),'x');
 const r=run('clean',dir,'--also',comfy,'--also',other,'--also',mine);assert.equal(r.status,0,r.stderr);
 assert.deepEqual(fs.readdirSync(comfy).sort(),['intake-test10_ref.png','intake-test1b.png','renders-intake-test10']);
 assert.ok(fs.existsSync(path.join(other,'keep.png')));
});
test('clean refuses a manifest whose run id is empty: an empty prefix matches every file',t=>{
 const dir=fixture(t),mf=path.join(dir,'manifest.json'),m=JSON.parse(fs.readFileSync(mf,'utf8'));
 m.run='';fs.writeFileSync(mf,JSON.stringify(m));
 const comfy=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'render-triage-test-comfy-'));
 t.after(()=>fs.rmSync(comfy,{recursive:true,force:true}));
 fs.writeFileSync(path.join(comfy,'someone-else.png'),'x');
 const r=run('clean',dir,'--also',comfy,'--force');
 assert.equal(r.status,2);assert.match(r.stderr,/run id/);
 assert.ok(fs.existsSync(path.join(comfy,'someone-else.png')));
});
test('a second sheet over a sealed key exits 2 and leaves key and page untouched; --reseal replaces both',t=>{
 const dir=fixture(t),kf=path.join(dir,'triage','key.json'),pf=path.join(dir,'triage','index.html');
 assert.equal(run('sheet',dir).status,0);
 const key=fs.readFileSync(kf,'utf8'),page=fs.readFileSync(pf,'utf8');
 // Labels are shuffled by crypto.randomInt, so a bare re-run flips them about half the time;
 // twelve refused re-runs that all leave the bytes alone cannot be luck.
 for(let i=0;i<12;i++){
  const r=run('sheet',dir);assert.equal(r.status,2);assert.match(r.stderr,/--reseal/);
  assert.equal(fs.readFileSync(kf,'utf8'),key,'the sealed key is untouched');
  assert.equal(fs.readFileSync(pf,'utf8'),page,'the page the operator read is untouched');
 }
 // The operator's X/Y still decodes through the key they were shown.
 assert.equal(run('reveal',dir,'shot1=X').status,0);
 assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'verdict.json'),'utf8')).pairs.shot1.arm,JSON.parse(key).pairs.shot1.X);
 const re=run('sheet',dir,'--reseal');assert.equal(re.status,0,re.stderr);
 const k2=JSON.parse(fs.readFileSync(kf,'utf8')),p2=fs.readFileSync(pf,'utf8');
 assert.notEqual(k2.sheet,JSON.parse(key).sheet,'a new sheet id');
 assert.match(page,new RegExp('Sheet '+JSON.parse(key).sheet));assert.match(p2,new RegExp('Sheet '+k2.sheet));
 assert.doesNotMatch(p2,/armA|armB/);
});
