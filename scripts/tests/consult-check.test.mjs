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

test('a project declaring two bundles is routed inside both, not cut to the corpus-wide top 3 first',t=>{
 // research-map took one --domain, so with two declared bundles it ran unscoped, kept the top 3
 // per term across ALL bundles, and only then dropped the undeclared ones. "grants", "eligibility",
 // "scoring" each top out in grant-funding / recruiting / llm-observability, so nothing survived and
 // the run reported "0 governing subject(s), all read" - a pass over a change it never routed.
 const root=project(t,{contexts:[],ledger:''});
 fs.writeFileSync(path.join(root,'.ai','manifest.yaml'),'knowledge:\n  domains: [software-engineering, localization]\n');
 fs.writeFileSync(path.join(root,'.ai','registry-map.json'),JSON.stringify({schema:'rkb-registry-map/1',project:'fixture',domains:['software-engineering','localization'],contexts:[]}));
 const {out}=run(root,'src/grants/EligibilityScoring.tsx',['--no-record']);
 assert.equal(out.unmapped,1);
 assert.ok(out.missed.length>0,'an unmapped change in a declared bundle must route to something');
 for(const m of out.missed)assert.ok(['software-engineering','localization'].includes(m.bundle),`${m.subject} is from undeclared ${m.bundle}`);
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

test('a commit of only the conform ledger is skipped and records no miss',t=>{
 // Measured 2026-10-12: every unattended conform commit drew a `missed` row, which dirtied the
 // ledger, which the next commit carried - a loop of false misses.
 const root=project(t,{contexts:[ctx('ai',['.ai'],['knowledge-registry'])],ledger:''});
 const {status,out}=run(root,'.ai/registry-map.json,.ai/conform-detail.json,.ai/consults.jsonl,.ai/conform-runs/merged/x.json');
 assert.equal(status,0);
 assert.equal(out.skipped,'conform-ledger-only');
 assert.equal(fs.readFileSync(path.join(root,'.ai','consults.jsonl'),'utf8'),'');
});

test('the printed remedy is a front-door read per subject, never the bundle index',t=>{
 // docs/query-lane.md: an agent never Reads, greps or slices index.json. The remedy used to say
 // "the golden path is subjects[<slug>].file in the bundle index" and to pass every slug to
 // research-map as ONE comma-joined term.
 const root=project(t,{contexts:[ctx('tables',['app/table'],['table','audit-logging'])],ledger:''});
 const r=spawnSync(process.execPath,[SCRIPT,'--project',root,'--paths','app/table/Grid.tsx','--no-record'],{encoding:'utf8'});
 assert.equal(r.status,0);
 for(const s of ['table','audit-logging'])assert.match(r.stdout,new RegExp(`scripts/registry-query\\.mjs --subject ${s}\\b`),s);
 assert.doesNotMatch(r.stdout,/index/i,'no instruction may route through index.json');
 assert.doesNotMatch(r.stdout,/research-map\.mjs "[^"]*,/,'no comma-joined single term');
});

test('a git that cannot answer is a stated reason, never "nothing staged"',t=>{
 // "Every input degrades to a stated reason, never to a silent pass." A non-repo, or a bad
 // --since ref, used to read as an empty diff: "nothing staged", skipped:"no-paths", exit 0.
 const root=project(t,{contexts:[ctx('tables',['app/table'],['table'])],ledger:''});
 // The ceiling keeps git from finding a repository ABOVE the temp dir on a runner that has one.
 const env={...process.env,GIT_CEILING_DIRECTORIES:path.dirname(root)};
 const call=(extra)=>spawnSync(process.execPath,[SCRIPT,'--project',root,'--no-record',...extra],{encoding:'utf8',env});
 const notRepo=call(['--json']);
 assert.equal(notRepo.status,0,'never blocks a commit');
 const j=JSON.parse(notRepo.stdout);
 assert.equal(j.skipped,'git-failed');
 assert.match(j.reason,/git diff/);
 assert.doesNotMatch(call([]).stdout,/nothing staged/);
 assert.match(call([]).stdout,/could not list the changed paths/);
 spawnSync('git',['init','-q'],{cwd:root});
 assert.equal(JSON.parse(call(['--since','no-such-ref','--json']).stdout).skipped,'git-failed');
 assert.equal(call(['--since','no-such-ref','--exit-code']).status,2,'under --exit-code a check that could not run is FATAL, not a pass');
 assert.equal(JSON.parse(call(['--json']).stdout).skipped,'no-paths','a real repo with nothing staged is still "no-paths"');
});

test('a conform-ledger path beside real code still checks the code',t=>{
 const root=project(t,{contexts:[ctx('tables',['app/table'],['table'])],ledger:''});
 const {out}=run(root,'.ai/registry-map.json,app/table/Grid.tsx',['--no-record']);
 assert.deepEqual(out.missed.map(m=>m.subject),['table']);
});
