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
