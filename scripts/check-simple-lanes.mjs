#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateNote } from './lib/simple-lanes.mjs';
import { EXIT } from './lib/exit-codes.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const failures=[];
let count=0;
try {
  for(const lane of ['practices','memory']) {
    let laneCount=0;
    const visit=(dir,relative='')=>{
      for(const e of fs.readdirSync(dir,{withFileTypes:true})) {
        if(e.name.startsWith('.'))continue;
        const rel=relative?`${relative}/${e.name}`:e.name;
        const file=path.join(dir,e.name);
        if(e.isSymbolicLink()) {failures.push(`${lane}/${rel}: symlinks are not published notes`);continue;}
        if(e.isDirectory()){visit(file,rel);continue;}
        if(lane==='practices' ? e.name!=='PRACTICE.md' : !e.name.endsWith('.md')||rel==='_index.md')continue;
        const raw=fs.readFileSync(file,'utf8');
        laneCount++;count++;
        for(const p of validateNote(lane,rel,raw))failures.push(`${lane}/${rel}: ${p}`);
        if(lane==='practices') {
          for(const m of raw.matchAll(/\]\((starter\/[^)#]+)(?:#[^)]*)?\)/g)) {
            const target=path.resolve(dir,m[1]);
            const within=path.relative(dir,target);
            if(within.startsWith('..')||path.isAbsolute(within)||!fs.existsSync(target))failures.push(`${lane}/${rel}: unresolved starter ${m[1]}`);
          }
        }
      }
    };
    visit(path.join(root,lane));
    if(!laneCount)throw new Error(`${lane} is empty; no notes checked`);
  }
  for(const failure of failures)console.error(failure);
  console.log(`practice and memory contracts: ${count} notes; ${failures.length} violations`);
  process.exitCode=failures.length?EXIT.VIOLATIONS:EXIT.OK;
}catch(error){console.error(`simple-lanes FATAL: ${error.message}`);process.exitCode=EXIT.FATAL;}
