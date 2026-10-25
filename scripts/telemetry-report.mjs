#!/usr/bin/env node
/**
 * telemetry-report - what the contributor lanes say that no score may silently absorb.
 *
 * The catalog and the librarian score named artifacts from `usage/` and `signals/`. A
 * count reported under a name that resolves to nothing here (a renamed skill, a moved
 * subject) is excluded from those scores - and without this report it would also vanish
 * from view. So this prints, as one JSON document: every report's freshness against an
 * explicit `--as-of` (unknown / future / stale / within-window, never a rewritten date),
 * the unresolved usage and signal identities with their counts, and the possible
 * duplicate bundle blocks. It decides nothing; it is the evidence an identity migration in
 * identity-aliases.json is argued from (docs/telemetry-identity.md).
 *
 * Usage:  node scripts/telemetry-report.mjs [--as-of <ISO date>]   (default: now)
 * Exit codes (scripts/lib/exit-codes.mjs): 0 reported, 2 could not run (an unreadable lane
 * file, an invalid alias map, an invalid --as-of, an unknown flag, `--as-of` with no value).
 * The flag set is closed: a mistyped `--asof 2026-01-01` that is ignored reports freshness
 * against NOW and looks like the date you asked for.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadIdentities,resolveIdentity,aggregateDemand,reportAge} from './lib/telemetry.mjs';
import {EXIT} from './lib/exit-codes.mjs';
try {
 const args=process.argv.slice(2),hint='Usage: telemetry-report.mjs [--as-of <ISO date>]';
 let given;
 if(args.includes('--help')||args.includes('-h')){console.log(hint);process.exit(EXIT.OK);}
 for(let i=0;i<args.length;i++){
  if(args[i]!=='--as-of')throw new Error(`unknown argument ${JSON.stringify(args[i])}. ${hint}`);
  given=args[++i];
  if(given===undefined||given===''||given.startsWith('--'))throw new Error(`--as-of needs a value. ${hint}`);
 }
 const root=fileURLToPath(new URL('../',import.meta.url)),ids=loadIdentities(root);
 const asOf=given??new Date().toISOString();
 const read=lane=>fs.readdirSync(path.join(root,lane)).filter(f=>f.endsWith('.json')).sort().map(f=>JSON.parse(fs.readFileSync(path.join(root,lane,f),'utf8')));
 const usage=read('usage'),signals=read('signals');
 const unresolvedUsage=[];
 for(const doc of usage)for(const [name,entry] of Object.entries(doc.skills))if(!resolveIdentity(ids,'skills',name))unresolvedUsage.push({contributor:doc.contributor,identity:name,...entry});
 const demand=aggregateDemand(signals,(lane,id)=>resolveIdentity(ids,lane,id));
 const freshness=[...usage.map(doc=>({lane:'usage',doc})),...signals.map(doc=>({lane:'signals',doc}))].map(({lane,doc})=>({lane,contributor:doc.contributor,generatedAt:doc.generatedAt,windowDays:doc.windowDays,...reportAge(doc.generatedAt,asOf)}));
 console.log(JSON.stringify({asOf,freshness,unresolvedUsage,unresolvedSignals:demand.unresolved,possibleDuplicateBlocks:demand.duplicateBlocks,interpretation:'Unresolved counts are retained here, excluded from named-artifact scores. State priority uses maxima, never sums. Report freshness does not establish content correctness.'},null,2));
}catch(error){console.error(`FATAL: ${error.message}`);process.exitCode=EXIT.FATAL;}
