import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {hashBundle} from '../lib/bundle-hash.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url)),temp=fs.realpathSync(os.tmpdir());
function fixture(t,{subjects=true}={}){
 const fixture=fs.mkdtempSync(path.join(temp,'registry-review-test-'));
 t.after(()=>{
  const resolved=fs.realpathSync(fixture),rel=path.relative(temp,resolved);
  if(!rel.startsWith('registry-review-test-')||rel.includes(path.sep)||path.isAbsolute(rel))throw new Error('unsafe cleanup');
  fs.rmSync(resolved,{recursive:true,force:true});
 });
 fs.mkdirSync(path.join(fixture,'scripts/lib'),{recursive:true});
 for(const p of ['review-coverage.mjs','lib/bundle-hash.mjs','lib/exit-codes.mjs','lib/check-result.mjs'])fs.copyFileSync(path.join(root,'scripts',p),path.join(fixture,'scripts',p));
 const dir=path.join(fixture,'knowledge/domain/topic');fs.mkdirSync(path.join(dir,'techniques'),{recursive:true});
 fs.writeFileSync(path.join(dir,'topic.md'),'A scoped rule.\n');
 fs.writeFileSync(path.join(dir,'techniques/check.md'),'Check the rule.\n');
 fs.writeFileSync(path.join(fixture,'knowledge/domain/index.json'),JSON.stringify({subjects:subjects?{topic:{file:'knowledge/domain/topic/topic.md',category:'test'}}:{}}));
 const note=path.join(fixture,'librarian/subjects/domain/topic.md');fs.mkdirSync(path.dirname(note),{recursive:true});
 const run=(...args)=>spawnSync(process.execPath,['scripts/review-coverage.mjs',...args],{cwd:fixture,encoding:'utf8'});
 return {fixture,dir,note,run};
}
const complete=(dir)=>({subject:'domain/topic',date:'2026-09-09',baseline:'1234567',digest:hashBundle(dir).hash,disposition:'keep',counterexamples:['Counterexample considered'],sources:['Fixture source'],documents:{'topic.md':{disposition:'keep',reason:'Fixture reason'},'techniques/check.md':{disposition:'keep',reason:'Fixture reason'}}});
test('review completion requires every document and becomes stale when content changes',t=>{
 const {dir,note,run}=fixture(t);
 assert.equal(run('--require-complete').status,1,'absence cannot become completion');
 const record=complete(dir);delete record.documents['techniques/check.md'];
 const save=()=>fs.writeFileSync(note,'<!-- architecture-review:v1 -->\n```json\n'+JSON.stringify(record)+'\n```\n');
 save();assert.equal(run('--require-complete').status,1,'a missing technique decision blocks completion');
 record.documents['techniques/check.md']={disposition:'keep',reason:'Fixture reason'};save();assert.equal(run('--require-complete').status,0);
 fs.appendFileSync(path.join(dir,'topic.md'),'Changed rule.\n');assert.equal(run('--require-complete').status,1,'old decision cannot cover changed bytes');
 assert.equal(run().status,0,'a stale record is report-only by design without --require-complete');
});
// Seeded canaries from the 2026-10-25 gates scan: each record shape below was present,
// unread and green. Every case keeps the valid record beside the plant so the only
// difference from the control is the plant itself.
const valid=(dir)=>'<!-- architecture-review:v1 -->\n```json\n'+JSON.stringify(complete(dir))+'\n```\n';
test('control: a complete current record passes',t=>{
 const {dir,note,run}=fixture(t);fs.writeFileSync(note,valid(dir));
 const r=run('--require-complete');assert.equal(r.status,0,r.stderr);
});
test('an unrecognized marker version with broken JSON is an error',t=>{
 const {dir,note,run}=fixture(t);fs.writeFileSync(note,valid(dir)+'\n<!-- architecture-review:v2 -->\n```json\n{broken\n```\n');
 const r=run();assert.equal(r.status,1);assert.match(r.stderr,/unrecognized review marker/);
});
test('a v1 marker over a fence tagged JSON (not json) is an error',t=>{
 const {dir,note,run}=fixture(t);fs.writeFileSync(note,valid(dir)+'\n<!-- architecture-review:v1 -->\n```JSON\n'+JSON.stringify(complete(dir))+'\n```\n');
 const r=run();assert.equal(r.status,1);assert.match(r.stderr,/not followed by a ```json fence/);
});
test('a broken record in an orphan note is an error; a readable one is history',t=>{
 const {dir,note,run}=fixture(t);fs.writeFileSync(note,valid(dir));
 const orphan=path.join(path.dirname(note),'renamed-away.md');
 fs.writeFileSync(orphan,'<!-- architecture-review:v1 -->\n```json\n{"subject":"domain/renamed-away"}\n```\n');
 assert.equal(run().status,0,'a readable orphan record is kept history, not an error');
 fs.writeFileSync(orphan,'<!-- architecture-review:v1 -->\n```json\n{"subject": broken\n```\n');
 const r=run();assert.equal(r.status,1);assert.match(r.stderr,/renamed-away \(orphan note\): invalid review JSON/);
});
// A live note keeps its superseded records above the current one (89 of 533 notes carry two
// or more). Only the last was ever parsed, so a broken earlier record read green, while the
// same record in an orphan note was an error. History is history in both places.
test('a broken earlier record in a live note is an error, as it is in an orphan note',t=>{
 const {dir,note,run}=fixture(t);
 fs.writeFileSync(note,'<!-- architecture-review:v1 -->\n```json\n{"subject": broken\n```\n\n'+valid(dir));
 const r=run();assert.equal(r.status,1,r.stdout);assert.match(r.stderr,/domain\/topic: superseded record 1 of 2 is invalid review JSON/);
});
test('control: a readable superseded record above a current one passes',t=>{
 const {dir,note,run}=fixture(t);
 fs.writeFileSync(note,'<!-- architecture-review:v1 -->\n```json\n{"subject":"domain/topic","date":"2026-01-01"}\n```\n\n'+valid(dir));
 const r=run('--require-complete');assert.equal(r.status,0,r.stderr);
});
test('zero subjects is could-not-run, not complete coverage',t=>{
 const {run}=fixture(t,{subjects:false});
 for(const args of [[],['--require-complete'],['--json']]){const r=run(...args);assert.equal(r.status,2,`args ${args}: ${r.stderr}`);assert.match(r.stderr,/walked 0 subjects/);}
});
