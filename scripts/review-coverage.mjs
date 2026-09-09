#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {hashBundle} from './lib/bundle-hash.mjs';
import {EXIT} from './lib/exit-codes.mjs';

// Review decisions remain in existing subject notes. This only checks their
// coverage and currency; it cannot determine whether their reasoning is sound.
try {
 const root=fileURLToPath(new URL('../',import.meta.url));
 const rows=[],errors=[];
 const dispositions=new Set(['keep','clarify','split','merge','deprecate','reverify']);
 for(const d of fs.readdirSync(path.join(root,'knowledge'),{withFileTypes:true}).filter(e=>e.isDirectory())){
  const index=JSON.parse(fs.readFileSync(path.join(root,'knowledge',d.name,'index.json'),'utf8'));
  for(const [slug,subject] of Object.entries(index.subjects)){
   const id=`${d.name}/${slug}`,dir=path.join(root,path.dirname(subject.file));
   const note=`librarian/subjects/${id}.md`,file=path.join(root,note);
   const raw=fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';
   const matches=[...raw.matchAll(/<!-- architecture-review:v1 -->\s*```json\s*([\s\S]*?)\s*```/g)];
   const row={id,category:subject.category,note,state:'pending'};
   if(matches.length){
    let r;try{r=JSON.parse(matches.at(-1)[1]);}catch{errors.push(`${id}: invalid review JSON`);rows.push({...row,state:'invalid'});continue;}
    const expected=[`${slug}.md`,...['techniques','applications'].flatMap(lane=>fs.existsSync(path.join(dir,lane))?fs.readdirSync(path.join(dir,lane)).filter(f=>f.endsWith('.md')).map(f=>`${lane}/${f}`):[])].sort();
    const current=r.digest===hashBundle(dir).hash;
    if(r.subject!==id||!/^\d{4}-\d{2}-\d{2}$/.test(r.date??'')||!dispositions.has(r.disposition)||!/^[a-f0-9]{7,40}$/.test(r.baseline??'')||!/^sha256:[a-f0-9]{16}$/.test(r.digest??'')||!r.counterexamples?.length||!r.sources?.length)errors.push(`${id}: incomplete review metadata`);
    if(current&&JSON.stringify(Object.keys(r.documents??{}).sort())!==JSON.stringify(expected))errors.push(`${id}: document decisions do not match the complete subject`);
    for(const [name,decision] of Object.entries(r.documents??{}))if(!dispositions.has(decision.disposition)||!decision.reason?.trim())errors.push(`${id}/${name}: missing disposition or reason`);
    row.state=current?'reviewed':'stale';
    row.disposition=r.disposition;row.date=r.date;
   }
   rows.push(row);
  }
 }
 const counts=Object.fromEntries(['pending','reviewed','stale','invalid'].map(state=>[state,rows.filter(r=>r.state===state).length]));
 if(process.argv.includes('--json'))console.log(JSON.stringify({counts,errors,subjects:rows,interpretation:'Reviewed means a complete, current decision record exists, not that source claims or runtime behavior are all verified.'},null,2));
 else {console.log(`Architecture decisions: ${rows.length} subjects; ${Object.entries(counts).map(([k,v])=>`${v} ${k}`).join(', ')}`);for(const e of errors)console.error(e);}
 process.exitCode=errors.length||(process.argv.includes('--require-complete')&&counts.reviewed!==rows.length)?EXIT.VIOLATIONS:EXIT.OK;
}catch(error){console.error(`FATAL: ${error.message}`);process.exitCode=EXIT.FATAL;}
