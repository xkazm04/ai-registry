import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT=fileURLToPath(new URL('../..',import.meta.url));
const CONVERGE=path.join(ROOT,'scripts','converge.mjs');
const REPORT=path.join(ROOT,'librarian','fleet-coverage.md');
const REPORT_AT_LOAD=fs.existsSync(REPORT)?fs.statSync(REPORT):null;

/**
 * A temp registry root holding a COPY of the gate and a fixture report. The gate reads its
 * report from its own location, so the copy reads the fixture - and the tracked report in
 * this checkout is never written. (It used to be swapped in place and restored in t.after,
 * which rewrote a published file on every test run.)
 */
let fixtureRoot=null;
function withReport(t,contents){
 const temp=fs.realpathSync(os.tmpdir());
 const root=fs.mkdtempSync(path.join(temp,'converge-test-'));
 t.after(()=>{
  const rel=path.relative(temp,fs.realpathSync(root));
  if(!rel.startsWith('converge-test-')||rel.includes(path.sep))throw new Error('unsafe cleanup');
  fs.rmSync(root,{recursive:true,force:true});
 });
 fs.mkdirSync(path.join(root,'scripts','lib'),{recursive:true});
 for(const f of ['check-coverage-age.mjs','lib/exit-codes.mjs','lib/check-result.mjs'])fs.copyFileSync(path.join(ROOT,'scripts',f),path.join(root,'scripts',f));
 if(contents!==null){fs.mkdirSync(path.join(root,'librarian'));fs.writeFileSync(path.join(root,'librarian','fleet-coverage.md'),contents,'utf8');}
 fixtureRoot=root;
}
const age=(args=[])=>spawnSync(process.execPath,[path.join(fixtureRoot,'scripts','check-coverage-age.mjs'),...args],{encoding:'utf8'});

test('a fresh report passes the gate',t=>{
 withReport(t,`# x\n\ngenerated: ${new Date().toISOString()} · machine: test · projects declared: 3\n`);
 assert.equal(age().status,0);
});

test('a stale report fails, and says nobody looked rather than that the fleet is broken',t=>{
 withReport(t,'# x\n\ngenerated: 2020-01-01T00:00:00Z · machine: test · projects declared: 3\n');
 const r=age();
 assert.equal(r.status,1);
 assert.match(r.stderr,/does NOT mean the fleet is broken/);
});

test('a missing report fails rather than passing on absence',t=>{
 withReport(t,null);
 assert.equal(age().status,1);
});

test('a report with no readable stamp is FATAL, never a pass',t=>{
 // failure-not-empty-success: an instrument that cannot read its input has found nothing,
 // which is not the same as there being nothing to find.
 withReport(t,'# x\n\nno stamp here at all\n');
 const r=age();
 assert.equal(r.status,2);
 assert.match(r.stderr,/cannot be established/);
});

test('--max-age must be a positive number, not silently defaulted',t=>{
 withReport(t,`# x\n\ngenerated: ${new Date().toISOString()}\n`);
 assert.equal(age(['--max-age','nonsense']).status,2);
});

test('converge --dry-run runs no phase and writes no report',t=>{
 const before=fs.existsSync(REPORT)?fs.readFileSync(REPORT,'utf8'):null;
 const r=spawnSync(process.execPath,[CONVERGE,'--dry-run','--only','maps'],{encoding:'utf8'});
 // Either it ran (machine present) or it refused for want of identity; neither may write.
 assert.ok(r.status===0||r.status===2,`unexpected exit ${r.status}`);
 const after=fs.existsSync(REPORT)?fs.readFileSync(REPORT,'utf8'):null;
 assert.equal(after,before,'a dry run must not touch the report');
});

test('the report never carries a consumer path — the librarian lane is public',t=>{
 if(!fs.existsSync(REPORT)){t.skip('no report generated on this machine');return;}
 const text=fs.readFileSync(REPORT,'utf8');
 assert.ok(!/[A-Za-z]:[\\/]Users/.test(text),'no absolute Windows path may appear');
 assert.ok(!/\/home\/[a-z]/.test(text),'no absolute POSIX home path may appear');
 assert.ok(!/\.ai\/registry-map\.json/.test(text)||!/[A-Za-z]:/.test(text),'no checkout-qualified path may appear');
});

// The tracked report is published state, and other sessions commit beside this suite. A
// test that writes it - even one that restores it in t.after - can be captured mid-swap
// by a sibling's commit, and a killed run leaves the fixture in place of the real file.
test('the suite never writes the tracked librarian/fleet-coverage.md', () => {
  const now = fs.existsSync(REPORT) ? fs.statSync(REPORT) : null;
  assert.equal(now?.mtimeMs ?? null, REPORT_AT_LOAD?.mtimeMs ?? null, 'the real report was rewritten by a test');
});

/**
 * A temp registry root with a COPY of converge.mjs and stub phase scripts that exit with
 * a chosen status, so a phase failure can be produced without touching any real fleet
 * script or project.
 */
let ran=()=>[];
function convergeFixture(t,stubs){
 const temp=fs.realpathSync(os.tmpdir());
 const root=fs.mkdtempSync(path.join(temp,'converge-test-'));
 t.after(()=>{
  const rel=path.relative(temp,fs.realpathSync(root));
  if(!rel.startsWith('converge-test-')||rel.includes(path.sep))throw new Error('unsafe cleanup');
  fs.rmSync(root,{recursive:true,force:true});
 });
 fs.mkdirSync(path.join(root,'scripts','lib'),{recursive:true});
 for(const f of ['converge.mjs','lib/projects.mjs','lib/exit-codes.mjs'])fs.copyFileSync(path.join(ROOT,'scripts',f),path.join(root,'scripts',f));
 // Each stub leaves a marker beside itself, so a test can tell which phases actually ran.
 for(const [name,status] of Object.entries(stubs))fs.writeFileSync(path.join(root,'scripts',name),`import fs from 'node:fs';\nfs.writeFileSync(new URL('./ran-${name}.txt',import.meta.url),'');\nprocess.exitCode=${status};\n`);
 ran=()=>fs.readdirSync(path.join(root,'scripts')).filter((f)=>f.startsWith('ran-')).sort();
 fs.writeFileSync(path.join(root,'projects.json'),JSON.stringify({schema:2,machines:{T:{}},projects:{app:{checkouts:{T:'work/app'}}}}));
 fs.writeFileSync(path.join(root,'.machine.local.json'),JSON.stringify({machine:'T',root}));
 fs.mkdirSync(path.join(root,'work','app'),{recursive:true});
 return (...args)=>spawnSync(process.execPath,[path.join(root,'scripts','converge.mjs'),...args],{encoding:'utf8'});
}

test('control: phases that succeed leave no note',t=>{
 const run=convergeFixture(t,{'leads-collect.mjs':0,'signals-collect.mjs':0,'build-fleet-map.mjs':0});
 for(const phase of ['leads','signals','fleet-map']){
  const r=run('--only',phase);
  assert.equal(r.status,0,r.stderr);
  assert.doesNotMatch(r.stdout,/exited/,phase);
 }
});

test('a phase whose script fails is recorded, not passed over (maps already was)',t=>{
 const run=convergeFixture(t,{'leads-collect.mjs':2,'signals-collect.mjs':2,'build-fleet-map.mjs':2});
 for(const [phase,script] of [['leads','leads-collect.mjs'],['signals','signals-collect.mjs'],['fleet-map','build-fleet-map.mjs']]){
  const r=run('--only',phase);
  assert.match(r.stdout,new RegExp(`! ${script.replace('.','\.')} exited 2`),phase);
 }
});

test('an unknown argument or --only phase is refused before any phase runs (the default run writes)',t=>{
 const run=convergeFixture(t,{'build-registry-map.mjs':0,'leads-collect.mjs':0,'signals-collect.mjs':0,'build-fleet-map.mjs':0});
 for(const args of [['--chek'],['--only','map'],['--only']]){
  const r=run(...args);
  assert.equal(r.status,2,`${args.join(' ')}: ${r.stdout}`);
  assert.match(r.stderr,/converge: /);
 }
 assert.deepEqual(ran(),[],'no phase ran');
});
