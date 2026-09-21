import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {parseFrontmatter} from './skills-lane.mjs';

export const HARNESSES={codex:{skills:'.agents/skills',overlay:'.agents'},claude:{skills:'.claude/skills',overlay:'.claude'}};
export const CAPABILITIES=['files.read','files.write','process.run','git.read','git.write','web.read','agents.delegate','media.generate','external.write'];
export function missingCapabilities(required,available) {
  for(const c of [...required,...available])if(!CAPABILITIES.includes(c))throw new Error(`unknown capability: ${c}`);
  return required.filter((c)=>!available.includes(c));
}
const git=(root,args)=>execFileSync('git',['-C',root,...args],{maxBuffer:32*1024*1024});
const exists=(p)=>{try{fs.lstatSync(p);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}};
function directory(root,relative) {
  let current=root;
  for(const part of relative.split('/')) {
    if(!part||part==='.'||part==='..')throw new Error('invalid installation directory');
    current=path.join(current,part);
    if(exists(current)) {
      if(fs.lstatSync(current).isSymbolicLink()||!fs.statSync(current).isDirectory())throw new Error(`installation parent is not an owned directory: ${relative}`);
    }else fs.mkdirSync(current);
  }
  return current;
}
export function treeDigest(dir) {
  const hash=crypto.createHash('sha256');
  const visit=(base,rel='')=>{
    for(const e of fs.readdirSync(base,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'en'))) {
      const next=rel?`${rel}/${e.name}`:e.name;
      if(e.isSymbolicLink())throw new Error(`nested symlink in skill: ${next}`);
      if(e.isDirectory())visit(path.join(base,e.name),next);
      else {hash.update(next+'\0');hash.update(fs.readFileSync(path.join(base,e.name)));hash.update('\0');}
    }
  };
  visit(dir);return hash.digest('hex');
}

export function installRegistry({registry,project,harness,mode,skills,revision='HEAD',update=false,required=['files.read'],available=['files.read']}) {
  const adapter=HARNESSES[harness];
  if(!adapter||!['development','release'].includes(mode))throw new Error('choose harness codex|claude and mode development|release');
  if(!Array.isArray(skills)||!skills.length||skills.some((s)=>!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)))throw new Error('skills must be a nonempty list of kebab-case names');
  if(new Set(skills).size!==skills.length)throw new Error('duplicate selected skill');
  const missing=missingCapabilities(required,available);
  if(missing.length)throw new Error(`unsupported task; missing capabilities: ${missing.join(', ')}`);
  const source=fs.realpathSync(registry),targetRoot=fs.realpathSync(project);
  const commit=git(source,['rev-parse','--verify','--end-of-options',`${revision}^{commit}`]).toString().trim();
  // Read and validate all requested source material before changing discovery.
  const plans=[];
  for(const name of skills) {
    let files=null;
    let raw;
    if(mode==='release') {
      const rows=git(source,['ls-tree','-r','-z',commit,'--',`skills/${name}/`]).toString().split('\0').filter(Boolean);
      if(!rows.length)throw new Error(`skill absent from revision: ${name}`);
      files=rows.map((row)=>{
        const [meta,file]=row.split('\t');const [fileMode,type,oid]=meta.split(' ');
        if(type!=='blob'||fileMode==='120000'||!file.startsWith(`skills/${name}/`))throw new Error(`unsupported release entry: ${file}`);
        const relative=file.slice(`skills/${name}/`.length);
        if(relative.split('/').some((p)=>p==='..'||!p))throw new Error('invalid release path');
        return {relative,data:git(source,['cat-file','blob',oid])};
      });
      raw=files.find((f)=>f.relative==='SKILL.md')?.data.toString('utf8');
    }else raw=fs.readFileSync(path.join(source,'skills',name,'SKILL.md'),'utf8');
    const fm=raw&&parseFrontmatter(raw)?.fm;
    if(!fm||fm.name!==name||!fm.version)throw new Error(`invalid skill metadata: ${name}`);
    plans.push({name,version:fm.version,files});
  }
  const stateDir=directory(targetRoot,'.ai');
  const stateFile=path.join(stateDir,'registry-installation.local.json');
  if(exists(stateFile)&&fs.lstatSync(stateFile).isSymbolicLink())throw new Error('installation receipt must not be a symlink');
  const state=exists(stateFile)?JSON.parse(fs.readFileSync(stateFile,'utf8')):{schema:1,installations:{}};
  if(state.schema!==1||!state.installations)throw new Error('unsupported installation receipt');
  const previous=state.installations[harness];
  const discovery=directory(targetRoot,adapter.skills);
  for(const p of plans) {
    const link=path.join(discovery,p.name);
    if(exists(link)) {
      const old=previous?.skills?.[p.name];
      if(!old||!fs.lstatSync(link).isSymbolicLink()||fs.realpathSync(link)!==fs.realpathSync(old.target))throw new Error(`refusing to replace unmanaged installation: ${p.name}`);
      if(previous.mode==='release'&&treeDigest(old.target)!==old.digest)throw new Error(`installed release was edited: ${p.name}`);
      if(!update)throw new Error(`already installed: ${p.name}; use --update to switch explicitly`);
    }
  }
  const entries={...previous?.skills};
  // Modes/revisions apply to the entire selected installation, never to an accidental mix.
  if(previous&&Object.keys(entries).some((name)=>!skills.includes(name)))throw new Error('select all previously managed skills when updating an installation');
  for(const p of plans) {
    let destination=path.join(source,'skills',p.name);
    if(mode==='release') {
      destination=directory(targetRoot,`.ai/registry-releases/${commit}/${p.name}`);
      const wanted=new Set(p.files.map((f)=>f.relative));
      // Existing snapshots are immutable. Reuse requires byte equality.
      const actual=[];
      const scan=(dir,rel='')=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){const r=rel?`${rel}/${e.name}`:e.name;if(e.isSymbolicLink())throw new Error('symlink in release cache');if(e.isDirectory())scan(path.join(dir,e.name),r);else actual.push(r);}};
      scan(destination);
      if(actual.some((f)=>!wanted.has(f)))throw new Error(`release cache contains unexpected files: ${p.name}`);
      for(const file of p.files) {
        const full=path.join(destination,file.relative);
        if(exists(full)) {if(!fs.readFileSync(full).equals(file.data))throw new Error(`modified release cache: ${p.name}/${file.relative}`);}
        else {const parent=path.posix.dirname(file.relative);if(parent!=='.')directory(destination,parent);fs.writeFileSync(full,file.data,{flag:'wx'});}
      }
    }
    p.destination=destination;
    entries[p.name]={version:p.version,target:destination,digest:mode==='release'?treeDigest(destination):null};
  }
  state.installations[harness]={source,revision:commit,mode,required,available,skills:entries};
  // Prepare every snapshot before changing discovery. Keep old links until the
  // complete switch and receipt succeed, so ordinary failures can be rolled back.
  const transaction=crypto.randomUUID();
  const switched=[];
  const receiptPending=path.join(stateDir,`.registry-${transaction}.json`);
  try {
    fs.writeFileSync(receiptPending,JSON.stringify(state,null,2)+'\n',{flag:'wx'});
    for(const p of plans) {
      const link=path.join(discovery,p.name);
      const pending=path.join(discovery,`.registry-${p.name}-${transaction}`);
      const backup=path.join(discovery,`.previous-${p.name}-${transaction}`);
      const operation={link,pending,backup,saved:false,installed:false};
      switched.push(operation);
      fs.symlinkSync(p.destination,pending,process.platform==='win32'?'junction':'dir');
      if(exists(link)){fs.renameSync(link,backup);operation.saved=true;}
      fs.renameSync(pending,link);operation.installed=true;
    }
    fs.renameSync(receiptPending,stateFile);
  } catch(error) {
    for(const op of switched.reverse()) {
      if(op.installed)fs.unlinkSync(op.link);
      if(op.saved)fs.renameSync(op.backup,op.link);
      if(exists(op.pending))fs.unlinkSync(op.pending);
    }
    if(exists(receiptPending))fs.unlinkSync(receiptPending);
    throw error;
  }
  for(const op of switched)if(op.saved)fs.unlinkSync(op.backup);
  return state.installations[harness];
}

export function checkInstallation(project,harness) {
  const root=fs.realpathSync(project),adapter=HARNESSES[harness];
  if(!adapter)throw new Error('unknown harness');
  const state=JSON.parse(fs.readFileSync(path.join(root,'.ai/registry-installation.local.json'),'utf8')).installations[harness];
  if(!state)throw new Error('no installation receipt for this harness');
  const problems=[];
  for(const [name,entry] of Object.entries(state.skills)) {
    const link=path.join(root,adapter.skills,name);
    if(!exists(link)||!fs.lstatSync(link).isSymbolicLink()||fs.realpathSync(link)!==fs.realpathSync(entry.target))problems.push(`${name}: discovery target differs`);
    else if(state.mode==='release'&&treeDigest(entry.target)!==entry.digest)problems.push(`${name}: release content was edited`);
  }
  return {mode:state.mode,revision:state.revision,skills:Object.keys(state.skills),problems};
}
