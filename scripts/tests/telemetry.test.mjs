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
