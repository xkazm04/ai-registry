import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT=fileURLToPath(new URL('../..',import.meta.url));
const AGE=path.join(ROOT,'scripts','check-coverage-age.mjs');
const CONVERGE=path.join(ROOT,'scripts','converge.mjs');
const REPORT=path.join(ROOT,'librarian','fleet-coverage.md');

/** Swap the real report for a fixture, restore it whatever happens. */
function withReport(t,contents){
 const had=fs.existsSync(REPORT);
 const backup=had?fs.readFileSync(REPORT,'utf8'):null;
 t.after(()=>{
  if(backup===null)fs.rmSync(REPORT,{force:true});
  else fs.writeFileSync(REPORT,backup,'utf8');
 });
 if(contents===null)fs.rmSync(REPORT,{force:true});
 else {fs.mkdirSync(path.dirname(REPORT),{recursive:true});fs.writeFileSync(REPORT,contents,'utf8');}
}
const age=(args=[])=>spawnSync(process.execPath,[AGE,...args],{encoding:'utf8'});

test('a fresh report passes the gate',t=>{
 withReport(t,`# x\n\ngenerated: ${new Date().toISOString()} · machine: test\n`);
 assert.equal(age().status,0);
});

test('a stale report fails, and says nobody looked rather than that the fleet is broken',t=>{
 withReport(t,'# x\n\ngenerated: 2020-01-01T00:00:00Z · machine: test\n');
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
