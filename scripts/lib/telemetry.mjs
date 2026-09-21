import fs from 'node:fs';
import path from 'node:path';

export function loadIdentities(root) {
 const skills=new Set(fs.readdirSync(path.join(root,'skills'),{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>e.name));
 const subjects=new Set(),applications=new Set();
 for(const e of fs.readdirSync(path.join(root,'knowledge'),{withFileTypes:true}).filter(e=>e.isDirectory())){
  const index=JSON.parse(fs.readFileSync(path.join(root,'knowledge',e.name,'index.json'),'utf8'));
  for(const [slug,s] of Object.entries(index.subjects)){
   subjects.add(`${e.name}/${slug}`);
   const dir=path.join(root,path.dirname(s.file),'applications');
   if(fs.existsSync(dir))for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.md')))applications.add(`${e.name}/${slug}/${f.slice(0,-3)}`);
  }
 }
 const aliases=JSON.parse(fs.readFileSync(path.join(root,'identity-aliases.json'),'utf8'));
 if(aliases.schema!==1)throw new Error('unsupported identity-aliases schema');
 for(const [lane,known] of [['skills',skills],['subjects',subjects],['applications',applications]]){
  for(const [from,record] of Object.entries(aliases[lane]??{})){
   if(known.has(from)||!known.has(record.to)||typeof record.reason!=='string'||!record.reason.trim())throw new Error(`invalid ${lane} alias: ${from}`);
  }
 }
 return {skills,subjects,applications,aliases};
}
export function resolveIdentity(identities,lane,id) {
 if(identities[lane].has(id))return id;
 return identities.aliases[lane]?.[id]?.to??null;
}
const stable=(value)=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);

export function aggregateDemand(contributors,resolve=(lane,id)=>id) {
 const demandOf={},namedBy={},blockSig={},witnessed=new Set(),unresolved=[];
 const bucket=key=>demandOf[key]??={consults:0,deviations:0,deviationsSummed:0,gone:0,goneSummed:0,contributors:0};
 for(const c of contributors){
  const who=c.contributor??'(unnamed)';
  const states={},goneWithin={},citationStates={};
  for(const [bundle,obs] of Object.entries(c.bundles??{})){
   witnessed.add(bundle);
   (blockSig[bundle]??=[]).push({contributor:who,sig:stable([obs.consults??{},obs.deviations??{},obs.citations??{}])});
   for(const kind of ['consults','deviations'])for(const [slug,n] of Object.entries(obs[kind]??{})){
    const reported=`${bundle}/${slug}`,key=resolve('subjects',reported);
    if(!key){unresolved.push({contributor:who,kind,identity:reported,count:n});continue;}
    witnessed.add(key.split('/')[0]);
    (namedBy[key]??=new Set()).add(who);
    if(kind==='consults')bucket(key).consults+=n;
    else states[key]=Math.max(states[key]??0,n); // alias and current name may describe the same state
   }
   for(const [id,v] of Object.entries(obs.citations??{})){
    const reported=`${bundle}/${id}`,resolved=resolve('applications',reported);
    if(!resolved){unresolved.push({contributor:who,kind:'citations',identity:reported,counts:v});continue;}
    citationStates[resolved]=Math.max(citationStates[resolved]??0,v.gone??0);
   }
  }
   for(const [id,gone] of Object.entries(citationStates)){
    const key=id.split('/').slice(0,2).join('/');
    goneWithin[key]=(goneWithin[key]??0)+gone;
    (namedBy[key]??=new Set()).add(who);
   }
  for(const [key,n] of Object.entries(states)){const d=bucket(key);d.deviations=Math.max(d.deviations,n);d.deviationsSummed+=n;}
  for(const [key,n] of Object.entries(goneWithin)){const d=bucket(key);d.gone=Math.max(d.gone,n);d.goneSummed+=n;}
 }
 for(const [key,who] of Object.entries(namedBy))bucket(key).contributors=who.size;
 const duplicateBlocks=[];
 for(const [bundle,rows] of Object.entries(blockSig)){
  const seen=new Map();
  for(const r of rows){if(seen.has(r.sig))duplicateBlocks.push({bundle,contributors:[seen.get(r.sig),r.contributor]});else seen.set(r.sig,r.contributor);}
 }
 return {demandOf,witnessed,duplicateBlocks,unresolved};
}

export function reportAge(generatedAt,asOf,maxAgeDays=30) {
 const stamp=Date.parse(generatedAt),now=Date.parse(asOf);
 if(!Number.isFinite(now))throw new Error('invalid as-of date');
 if(!Number.isFinite(stamp))return {status:'unknown',ageDays:null};
 const ageDays=Math.floor((now-stamp)/86400000);
 return {status:ageDays<0?'future':ageDays>maxAgeDays?'stale':'within-window',ageDays};
}
