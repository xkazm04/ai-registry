#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadIdentities,resolveIdentity,aggregateDemand,reportAge} from './lib/telemetry.mjs';
import {EXIT} from './lib/exit-codes.mjs';
try {
 const root=fileURLToPath(new URL('../',import.meta.url)),ids=loadIdentities(root);
 const args=process.argv.slice(2),at=args.indexOf('--as-of');
 const asOf=at<0?new Date().toISOString():args[at+1];
 const read=lane=>fs.readdirSync(path.join(root,lane)).filter(f=>f.endsWith('.json')).sort().map(f=>JSON.parse(fs.readFileSync(path.join(root,lane,f),'utf8')));
 const usage=read('usage'),signals=read('signals');
 const unresolvedUsage=[];
 for(const doc of usage)for(const [name,entry] of Object.entries(doc.skills))if(!resolveIdentity(ids,'skills',name))unresolvedUsage.push({contributor:doc.contributor,identity:name,...entry});
 const demand=aggregateDemand(signals,(lane,id)=>resolveIdentity(ids,lane,id));
 const freshness=[...usage.map(doc=>({lane:'usage',doc})),...signals.map(doc=>({lane:'signals',doc}))].map(({lane,doc})=>({lane,contributor:doc.contributor,generatedAt:doc.generatedAt,windowDays:doc.windowDays,...reportAge(doc.generatedAt,asOf)}));
 console.log(JSON.stringify({asOf,freshness,unresolvedUsage,unresolvedSignals:demand.unresolved,possibleDuplicateBlocks:demand.duplicateBlocks,interpretation:'Unresolved counts are retained here, excluded from named-artifact scores. State priority uses maxima, never sums. Report freshness does not establish content correctness.'},null,2));
}catch(error){console.error(`FATAL: ${error.message}`);process.exitCode=EXIT.FATAL;}
