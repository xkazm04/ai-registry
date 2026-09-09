#!/usr/bin/env node
import fs from 'node:fs';
import {validatePublicFleet} from './lib/projects.mjs';
import {EXIT} from './lib/exit-codes.mjs';
try {
 const fleet=JSON.parse(fs.readFileSync(new URL('../projects.json',import.meta.url),'utf8'));
 const problems=validatePublicFleet(fleet);
 for(const problem of problems)console.error(problem);
 console.log(`projects: ${Object.keys(fleet.projects??{}).length} declarations, ${problems.length} violations`);
 process.exitCode=problems.length?EXIT.VIOLATIONS:EXIT.OK;
}catch(error){console.error(`FATAL: ${error.message}`);process.exitCode=EXIT.FATAL;}
