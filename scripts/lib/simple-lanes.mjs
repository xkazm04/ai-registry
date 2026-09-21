import { parseFrontmatter } from './skills-lane.mjs';

export function validateNote(lane, relative, raw) {
  const problems=[];
  const doc=parseFrontmatter(raw);
  if(!doc) return ['missing frontmatter'];
  const {fm,body}=doc;
  const keys=[...doc.raw.matchAll(/^([A-Za-z_][A-Za-z0-9_-]*):/gm)].map((m)=>m[1]);
  if(new Set(keys).size!==keys.length) problems.push('duplicate frontmatter key');
  if(/[^\x00-\x7F]/.test(doc.raw)) problems.push('frontmatter must be ASCII');
  if(!body.trim()) problems.push('empty body');
  const required=(k)=>{if(typeof fm[k]!=='string'||!fm[k].trim())problems.push(`missing ${k}`);};
  const parts=relative.split('/');
  if(lane==='practices') {
    if(parts.length!==2||parts[1]!=='PRACTICE.md')problems.push('expected <slug>/PRACTICE.md');
    required('id');required('dimension');required('applies-when');
    if(fm.id!==parts[0])problems.push('id does not match folder');
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fm.id??''))problems.push('id is not kebab-case');
    if(!/^D[1-9]\d*$/.test(fm.dimension??''))problems.push('dimension must be D followed by a positive integer');
  } else if(lane==='memory') {
    if(parts.length!==2||!parts[1].endsWith('.md'))problems.push('expected <kind>/<slug>.md');
    required('kind');required('confidence');required('source');
    if(!['episodic','semantic','procedural','summary'].includes(fm.kind))problems.push('unknown memory kind');
    if(fm.kind!==parts[0])problems.push('kind does not match folder');
    if(typeof fm.confidence!=='string'||!/^(?:0(?:\.\d+)?|1(?:\.0+)?)$/.test(fm.confidence))problems.push('confidence must be between 0 and 1');
    if('namespace' in fm)required('namespace');
  } else throw new Error(`unknown lane: ${lane}`);
  return problems;
}
