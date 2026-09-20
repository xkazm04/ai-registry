import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const SCRIPT=fileURLToPath(new URL('../consult-check.mjs',import.meta.url));

/** A minimal consuming project: a manifest, a map, and whatever ledger the case needs. */
function project(t,{contexts=[],ledger=null}={}){
 const temp=fs.realpathSync(os.tmpdir()),root=fs.mkdtempSync(path.join(temp,'consult-check-test-'));
 t.after(()=>{
  const resolved=fs.realpathSync(root),rel=path.relative(temp,resolved);
  if(!rel.startsWith('consult-check-test-')||rel.includes(path.sep)||path.isAbsolute(rel))throw new Error('unsafe cleanup');
  fs.rmSync(resolved,{recursive:true,force:true});
 });
 fs.mkdirSync(path.join(root,'.ai'));
 fs.writeFileSync(path.join(root,'.ai','manifest.yaml'),'knowledge:\n  domains: [software-engineering]\n');
 fs.writeFileSync(path.join(root,'.ai','registry-map.json'),JSON.stringify({schema:'rkb-registry-map/1',project:'fixture',domains:['software-engineering'],contexts}));
 if(ledger!==null)fs.writeFileSync(path.join(root,'.ai','consults.jsonl'),ledger);
 return root;
}

const run=(root,paths,extra=[])=>{
 const r=spawnSync(process.execPath,[SCRIPT,'--project',root,'--paths',paths,'--json',...extra],{encoding:'utf8'});
 return {status:r.status,out:JSON.parse(r.stdout)};
};

const ctx=(name,paths,subjects)=>({context:name,name,paths,subjects:subjects.map(s=>({subject:s,bundle:'software-engineering',score:500,confidence:'strong',state:'unknown'}))});
const row=(o)=>JSON.stringify({ts:new Date().toISOString(),bundle:'software-engineering',techniques:[],deviations:0,...o})+'\n';

test('a recorded MISS can never count as coverage on the next run',t=>{
 // The trap this pins: consult-check writes `outcome:"missed"` rows into the same ledger
 // it reads. If those rows counted, the instrument would certify itself after one run and
 // every subsequent commit would report full coverage having read nothing.
 const root=project(t,{contexts:[ctx('tables',['app/table'],['table'])],ledger:row({subjects:['table'],outcome:'missed',from:'consult-check'})});
 const {out}=run(root,'app/table/Grid.tsx',['--no-record']);
 assert.deepEqual(out.missed.map(m=>m.subject),['table']);
 assert.deepEqual(out.met,[]);
});

test('a row with no outcome counts as a consult — the 215 rows already on disk predate the field',t=>{
 const root=project(t,{contexts:[ctx('tables',['app/table'],['table'])],ledger:row({subjects:['table']})});
 const {out}=run(root,'app/table/Grid.tsx',['--no-record']);
 assert.deepEqual(out.met,['table']);
 assert.deepEqual(out.missed,[]);
});

test('a consult older than the window does not cover a change made today',t=>{
 const stale=JSON.stringify({ts:'2026-01-01T00:00:00Z',bundle:'software-engineering',subjects:['table'],techniques:[],deviations:0})+'\n';
 const root=project(t,{contexts:[ctx('tables',['app/table'],['table'])],ledger:stale});
 const {out}=run(root,'app/table/Grid.tsx',['--no-record']);
 assert.deepEqual(out.missed.map(m=>m.subject),['table']);
});

test('the deepest matching context wins, so a narrow owner is not buried by a broad one',t=>{
 const root=project(t,{contexts:[ctx('broad',['app'],['app-shell']),ctx('narrow',['app/table'],['table'])],ledger:''});
 const {out}=run(root,'app/table/Grid.tsx',['--no-record']);
 const subjects=out.missed.map(m=>m.subject);
 assert.ok(subjects.includes('table'),'narrow context must govern');
 assert.ok(!subjects.includes('app-shell'),'broad context must not also claim the file');
});

test('a path in no context is routed, not silently passed — this is the new-code hole',t=>{
 // The knowledge-sync clause 18 skills carry routes ONLY through the map, so a file in
 // no context resolves to no subject and reports success. One project carries 160 such
 // contexts. Here the router must still produce a governing subject.
 const root=project(t,{contexts:[ctx('other',['server'],['data-access'])],ledger:''});
 const {out}=run(root,'src/ui/InvoiceTable.tsx',['--no-record']);
 assert.equal(out.unmapped,1);
 assert.ok(out.missed.some(m=>m.subject==='table'&&m.via==='router'),`router should reach table, got ${JSON.stringify(out.missed)}`);
});

test('never blocks a commit: a miss exits 0 unless --exit-code is asked for',t=>{
 const root=project(t,{contexts:[ctx('tables',['app/table'],['table'])],ledger:''});
 assert.equal(run(root,'app/table/Grid.tsx',['--no-record']).status,0);
 assert.equal(run(root,'app/table/Grid.tsx',['--no-record','--exit-code']).status,1);
});

test('a miss is recorded as one row per bundle, slugs only, and the ledger stays parseable',t=>{
 const root=project(t,{contexts:[ctx('tables',['app/table'],['table'])],ledger:''});
 run(root,'app/table/Grid.tsx');
 const lines=fs.readFileSync(path.join(root,'.ai','consults.jsonl'),'utf8').split('\n').filter(Boolean);
 assert.equal(lines.length,1);
 const parsed=JSON.parse(lines[0]);
 assert.equal(parsed.outcome,'missed');
 assert.deepEqual(parsed.subjects,['table']);
 // The signals lane is PUBLIC and its gate refuses paths. A miss row must carry none.
 assert.ok(!JSON.stringify(parsed).includes('app/table'),'a recorded row must not carry a path');
});

test('a repository that never subscribed is left alone rather than reported on',t=>{
 const temp=fs.realpathSync(os.tmpdir()),root=fs.mkdtempSync(path.join(temp,'consult-check-test-'));
 t.after(()=>{
  const resolved=fs.realpathSync(root),rel=path.relative(temp,resolved);
  if(!rel.startsWith('consult-check-test-')||rel.includes(path.sep)||path.isAbsolute(rel))throw new Error('unsafe cleanup');
  fs.rmSync(resolved,{recursive:true,force:true});
 });
 const {status,out}=run(root,'anything.ts');
 assert.equal(status,0);
 assert.equal(out.skipped,'no-manifest');
});
