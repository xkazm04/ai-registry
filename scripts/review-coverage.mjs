#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {hashBundle, hashBundleLegacy} from './lib/bundle-hash.mjs';
import {EXIT} from './lib/exit-codes.mjs';
import {requirePopulation} from './lib/check-result.mjs';

// Review decisions remain in existing subject notes. This only checks their
// coverage and currency; it cannot determine whether their reasoning is sound.
//
// It also refuses to read past what it cannot parse. The 2026-10-25 gates scan found
// three ways a record could be present and unread, all green: a marker this reader does
// not know (`architecture-review:v2`), a v1 marker over a fence that is not exactly
// ```json (```JSON), and a broken record in a note whose subject no longer exists, which
// was never opened. Each is now an error. Zero subjects is FATAL: a coverage report over
// nothing is not complete coverage. Stale records stay report-only by design: a subject
// that moved under its decision is review work owed, not a defect in the record.
const MARKER=/<!--\s*architecture-review\b[^>]*-->/g;
const V1='<!-- architecture-review:v1 -->';
const FENCED=/<!-- architecture-review:v1 -->\s*```json\s*([\s\S]*?)\s*```/g;
// Every marker in a note is either a v1 marker over a ```json fence, or an error.
function readRecords(raw,id,errors){
 for(const m of raw.matchAll(MARKER))if(m[0]!==V1)errors.push(`${id}: unrecognized review marker ${m[0]} - this reader knows only ${V1}`);
 const markers=raw.split(V1).length-1,fenced=[...raw.matchAll(FENCED)];
 if(fenced.length!==markers)errors.push(`${id}: ${markers-fenced.length} v1 marker(s) not followed by a \`\`\`json fence - the record cannot be read`);
 return fenced;
}
try {
 const root=fileURLToPath(new URL('../',import.meta.url));
 const rows=[],errors=[],known=new Set();
 const dispositions=new Set(['keep','clarify','split','merge','deprecate','reverify']);
 for(const d of fs.readdirSync(path.join(root,'knowledge'),{withFileTypes:true}).filter(e=>e.isDirectory())){
  const index=JSON.parse(fs.readFileSync(path.join(root,'knowledge',d.name,'index.json'),'utf8'));
  for(const [slug,subject] of Object.entries(index.subjects)){
   const id=`${d.name}/${slug}`,dir=path.join(root,path.dirname(subject.file));
   known.add(id);
   const note=`librarian/subjects/${id}.md`,file=path.join(root,note);
   const raw=fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';
   const matches=readRecords(raw,id,errors);
   const row={id,category:subject.category,note,state:'pending'};
   if(matches.length){
    let r;try{r=JSON.parse(matches.at(-1)[1]);}catch{errors.push(`${id}: invalid review JSON`);rows.push({...row,state:'invalid'});continue;}
    const expected=[`${slug}.md`,...['techniques','applications'].flatMap(lane=>fs.existsSync(path.join(dir,lane))?fs.readdirSync(path.join(dir,lane)).filter(f=>f.endsWith('.md')).map(f=>`${lane}/${f}`):[])].sort();
    // A record written under the superseded scheme is still readable: compare it with
    // the scheme it was written under, not with the current one. Answering "cannot
    // compare" would have been honest and lossy — it would have discarded the 25 real
    // staleness signals among the 120 stored records to fix a collision none of them
    // had hit. The digest's own prefix says which function to use.
    const legacyDigest=/^sha256:[a-f0-9]{16}$/.test(r.digest??'');
    const current=r.digest===(legacyDigest?hashBundleLegacy(dir):hashBundle(dir)).hash;
    if(r.subject!==id||!/^\d{4}-\d{2}-\d{2}$/.test(r.date??'')||!dispositions.has(r.disposition)||!/^[a-f0-9]{7,40}$/.test(r.baseline??'')||!/^sha256(-b2)?:[a-f0-9]{16}$/.test(r.digest??'')||!r.counterexamples?.length||!r.sources?.length)errors.push(`${id}: incomplete review metadata`);
    if(current&&JSON.stringify(Object.keys(r.documents??{}).sort())!==JSON.stringify(expected))errors.push(`${id}: document decisions do not match the complete subject`);
    for(const [name,decision] of Object.entries(r.documents??{}))if(!dispositions.has(decision.disposition)||!decision.reason?.trim())errors.push(`${id}/${name}: missing disposition or reason`);
    row.state=current?'reviewed':'stale';
    row.disposition=r.disposition;row.date=r.date;
   }
   rows.push(row);
  }
 }
 const floor=requirePopulation(rows.length,'subjects across knowledge/*/index.json');
 if(floor.code!==EXIT.OK){console.error(`FATAL: review-coverage ${floor.reason}`);process.exitCode=EXIT.FATAL;}
 else{
  // Notes whose subject is gone (renamed, merged, deleted) are never matched above. A
  // record in one is history and stays, but it must still be readable history.
  const orphans=[],base=path.join(root,'librarian','subjects');
  const walk=(p)=>{for(const e of fs.readdirSync(p,{withFileTypes:true})){const q=path.join(p,e.name);if(e.isDirectory())walk(q);else if(e.name.endsWith('.md')){
   const id=path.relative(base,q).split(path.sep).join('/').replace(/\.md$/,'');if(known.has(id))continue;
   const raw=fs.readFileSync(q,'utf8');if(!/architecture-review/.test(raw))continue;
   orphans.push(id);
   for(const m of readRecords(raw,`${id} (orphan note)`,errors)){try{JSON.parse(m[1]);}catch{errors.push(`${id} (orphan note): invalid review JSON`);}}
  }}};
  if(fs.existsSync(base))walk(base);
  const counts=Object.fromEntries(['pending','reviewed','stale','invalid'].map(state=>[state,rows.filter(r=>r.state===state).length]));
  if(process.argv.includes('--json'))console.log(JSON.stringify({counts,orphanRecords:orphans,errors,subjects:rows,interpretation:'Reviewed means a complete, current decision record exists, not that source claims or runtime behavior are all verified.'},null,2));
  else {console.log(`Architecture decisions: ${rows.length} subjects; ${Object.entries(counts).map(([k,v])=>`${v} ${k}`).join(', ')}; ${orphans.length} orphan note(s) carrying a record`);for(const e of errors)console.error(e);}
  process.exitCode=errors.length||(process.argv.includes('--require-complete')&&counts.reviewed!==rows.length)?EXIT.VIOLATIONS:EXIT.OK;
 }
}catch(error){console.error(`FATAL: ${error.message}`);process.exitCode=EXIT.FATAL;}
