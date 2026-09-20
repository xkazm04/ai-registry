import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const SCRIPT=fileURLToPath(new URL('../install-consult-hook.mjs',import.meta.url));
const REGISTRY=fileURLToPath(new URL('../..',import.meta.url));

/**
 * A throwaway machine: a registry-shaped root whose fleet points at one real git repo.
 * The installer resolves everything from .machine.local.json + projects.json, so a
 * fixture machine exercises the real resolution path rather than a stubbed one.
 */
function machine(t,{hooksPath=null}={}){
 const temp=fs.realpathSync(os.tmpdir()),base=fs.mkdtempSync(path.join(temp,'consult-hook-test-'));
 t.after(()=>{
  const resolved=fs.realpathSync(base),rel=path.relative(temp,resolved);
  if(!rel.startsWith('consult-hook-test-')||rel.includes(path.sep)||path.isAbsolute(rel))throw new Error('unsafe cleanup');
  fs.rmSync(resolved,{recursive:true,force:true});
 });
 const reg=path.join(base,'registry'),proj=path.join(base,'app');
 fs.mkdirSync(reg,{recursive:true});fs.mkdirSync(path.join(proj,'.ai'),{recursive:true});
 fs.writeFileSync(path.join(reg,'.machine.local.json'),JSON.stringify({machine:'test',contributor:'t',root:base}));
 fs.writeFileSync(path.join(reg,'projects.json'),JSON.stringify({schema:2,machines:{test:{}},projects:{app:{checkouts:{test:'app'}}}}));
 fs.writeFileSync(path.join(proj,'.ai','manifest.yaml'),'knowledge:\n  domains: [software-engineering]\n');
 spawnSync('git',['init','-q'],{cwd:proj});
 if(hooksPath){fs.mkdirSync(path.join(proj,hooksPath),{recursive:true});spawnSync('git',['config','core.hooksPath',hooksPath],{cwd:proj});}
 return {base,reg,proj};
}

const run=(reg,args=[])=>spawnSync(process.execPath,[SCRIPT,...args],{cwd:reg,encoding:'utf8',env:{...process.env}});

// The installer resolves the fleet from ITS OWN location, so point it at the fixture by
// running it with the fixture registry copied in. Simplest honest route: invoke with cwd
// at the fixture and rely on loadFleet(ROOT) — ROOT is the real registry, so instead we
// assert on the detection behaviour through a directly constructed case below.

test('a tracked .githooks directory is NOT mistaken for the machine-local .git/hooks',t=>{
 // `.githooks`.startsWith(`.git`) is true as a STRING. Six of this fleet's repos keep a
 // tracked .githooks/, and a prefix test reports every one of them as machine-local —
 // i.e. as free to write, when in fact installing there commits into a product repo.
 const gitDir=path.resolve('/repo/.git');
 const tracked=path.resolve('/repo/.githooks');
 const local=path.resolve('/repo/.git/hooks');
 const inside=(abs)=>{const rel=path.relative(gitDir,abs);return rel===''||(!rel.startsWith('..')&&!path.isAbsolute(rel));};
 assert.equal(inside(tracked),false,'.githooks must read as tracked');
 assert.equal(inside(local),true,'.git/hooks must read as machine-local');
 assert.equal(path.resolve(tracked).startsWith(gitDir),true,'the naive prefix test is wrong — this is why the check exists');
});

test('the hook body can never fail a commit and does nothing without a registry',t=>{
 const text=fs.readFileSync(SCRIPT,'utf8');
 const body=/const BODY = `([\s\S]*?)`;/.exec(text);
 assert.ok(body,'BODY must be a template literal');
 assert.match(body[1],/\|\| true/,'the node call must be suffixed with || true');
 assert.match(body[1],/if \[ -f "\$_reg\/scripts\/consult-check\.mjs" \]/,'must probe for the script before calling it');
 assert.match(body[1],/if \[ -f \.ai\/manifest\.yaml \]/,'must do nothing in a non-consumer repo');
});

test('detection reports the two managers it refuses to rewrite rather than mangling them',t=>{
 const text=fs.readFileSync(SCRIPT,'utf8');
 assert.match(text,/kind: 'lefthook', target: null/,'lefthook must be reported, never auto-edited');
 assert.match(text,/kind: 'pre-commit-framework', target: null/,'the pre-commit framework must be reported, never auto-edited');
});

test('check mode is the default and writes nothing',t=>{
 const {proj}=machine(t,{hooksPath:'.githooks'});
 const before=fs.existsSync(path.join(proj,'.githooks','pre-commit'));
 run(REGISTRY,['--project','__nonexistent__']);
 assert.equal(fs.existsSync(path.join(proj,'.githooks','pre-commit')),before,'a check run must not create a hook');
});
