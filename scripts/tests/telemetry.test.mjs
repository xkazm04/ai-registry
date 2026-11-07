import test from 'node:test';
import assert from 'node:assert/strict';
import {aggregateDemand,resolveIdentity,reportAge} from '../lib/telemetry.mjs';
test('duplicate state cannot inflate priority while events and uncertainty remain visible',()=>{
 const a={contributor:'a',bundles:{domain:{consults:{topic:4},deviations:{topic:7},citations:{'topic/stack--tech':{gone:2}}}}};
 const b={...a,contributor:'b'};
 const result=aggregateDemand([a,b]);
 assert.deepEqual(result.demandOf['domain/topic'],{consults:8,deviations:7,deviationsSummed:14,gone:2,goneSummed:4,contributors:2});
 assert.equal(result.duplicateBlocks.length,1);
});
test('aliases resolve explicitly and unresolved counts survive reporting',()=>{
 const ids={subjects:new Set(['domain/current']),applications:new Set(),aliases:{subjects:{'domain/old':{to:'domain/current',reason:'fixture migration'}}}};
 const result=aggregateDemand([{contributor:'a',bundles:{domain:{deviations:{old:3,current:3,unknown:8}}}}],(lane,id)=>resolveIdentity(ids,lane,id));
 assert.equal(result.demandOf['domain/current'].deviationsSummed,3);
 assert.equal(result.unresolved[0].count,8);
 assert.equal(resolveIdentity(ids,'subjects','domain/unknown'),null);
});
test('freshness distinguishes missing, old and future evidence without changing its date',()=>{
 assert.equal(reportAge('2026-01-01','2026-09-09').status,'stale');
 assert.equal(reportAge('2026-09-08','2026-09-09').status,'within-window');
 assert.equal(reportAge('2026-09-10','2026-09-09').status,'future');
 assert.equal(reportAge('unknown','2026-09-09').status,'unknown');
});
test('telemetry-report refuses an unknown flag and a valueless --as-of instead of reporting against now',async()=>{
 const {spawnSync}=await import('node:child_process'),{fileURLToPath}=await import('node:url');
 const script=fileURLToPath(new URL('../telemetry-report.mjs',import.meta.url));
 const run=(...a)=>spawnSync(process.execPath,[script,...a],{encoding:'utf8'});
 const typo=run('--asof','2026-01-01');
 assert.equal(typo.status,2,typo.stdout+typo.stderr);
 assert.match(typo.stderr,/unknown argument "--asof"/);
 const bare=run('--as-of');
 assert.equal(bare.status,2,bare.stdout+bare.stderr);
 assert.match(bare.stderr,/--as-of needs a value/);
 const ok=run('--as-of','2026-10-01');
 assert.equal(ok.status,0,ok.stderr);
 assert.equal(JSON.parse(ok.stdout).asOf,'2026-10-01');
});

test('runLaneStatus: committed rows per device with newest-row age, pending rows across checkouts, null without a fleet',async()=>{
 const fs=await import('node:fs'),os=await import('node:os'),path=await import('node:path');
 const {runLaneStatus}=await import('../lib/runs-aggregate.mjs');
 const base=fs.mkdtempSync(path.join(os.tmpdir(),'telemetry-runs-'));
 try{
  const reg=path.join(base,'reg'),a=path.join(base,'a'),b=path.join(base,'b');
  fs.mkdirSync(path.join(reg,'usage','runs'),{recursive:true});
  fs.writeFileSync(path.join(reg,'usage','runs','Box.jsonl'),'{"ts":"2026-09-01T00:00:00Z"}\n{"ts":"2026-10-30T00:00:00Z"}\n');
  fs.writeFileSync(path.join(reg,'usage','runs','Box.exact.jsonl'),'{"id":"x"}\n');
  fs.writeFileSync(path.join(reg,'usage','runs','Old.jsonl'),'{"ts":"2026-01-01T00:00:00Z"}\n');
  for(const d of [a,b])fs.mkdirSync(path.join(d,'.ai'),{recursive:true});
  fs.writeFileSync(path.join(a,'.ai','skill-runs.local.jsonl'),'{"ts":"2026-10-01T00:00:00Z"}\n{"ts":"2026-10-05T00:00:00Z"}\nnot json\n');
  const sources=[{slug:'a',path:a},{slug:'b',path:b},{slug:'gone',path:path.join(base,'gone')}];
  const r=runLaneStatus(reg,'2026-11-07',sources);
  assert.deepEqual(r.committed.map(c=>[c.device,c.rows,c.newest,c.status]),[['Box',2,'2026-10-30T00:00:00Z','within-window'],['Old',1,'2026-01-01T00:00:00Z','stale']]);
  assert.equal(r.pending.rows,2);
  assert.equal(r.pending.unparseable,1);
  assert.equal(r.pending.files,1);
  assert.equal(r.pending.oldest,'2026-10-01T00:00:00Z');
  assert.equal(r.pending.status,'stale');
  assert.equal(runLaneStatus(reg,'2026-10-20',sources).pending.status,'within-window');
  assert.deepEqual(r.pending.byProject,[{project:'a',rows:2}]);
  assert.equal(runLaneStatus(reg,'2026-11-07',null).pending,null,'no fleet is unknown, not zero');
  assert.deepEqual(runLaneStatus(path.join(base,'empty'),'2026-11-07',[]).committed,[]);
 }finally{fs.rmSync(base,{recursive:true,force:true});}
});

test('telemetry-report prints a runLane block with counts only',async()=>{
 const {spawnSync}=await import('node:child_process'),{fileURLToPath}=await import('node:url');
 const script=fileURLToPath(new URL('../telemetry-report.mjs',import.meta.url));
 const r=spawnSync(process.execPath,[script,'--as-of','2026-11-07'],{encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);
 const lane=JSON.parse(r.stdout).runLane;
 assert.ok(Array.isArray(lane.committed));
 assert.ok(lane.pending===null||Number.isInteger(lane.pending.rows));
 assert.doesNotMatch(JSON.stringify(lane),/[A-Za-z]:[\/]/,'no checkout path in the report');
});
