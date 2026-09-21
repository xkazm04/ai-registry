import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

// The render-proof instruments run inside Blender's bundled Python. Each carries a self-test on a
// planted control; this runs them when Blender exists and SKIPS (never passes) when it does not,
// so CI without Blender reports the gap instead of certifying instruments it never ran.
const DIR=fileURLToPath(new URL('../../.claude/skills/intake/references/render-proof/',import.meta.url));
const CANDIDATES=[process.env.BLENDER,'C:/Program Files/Blender Foundation/Blender 4.2/blender.exe','/Applications/Blender.app/Contents/MacOS/Blender','/usr/bin/blender'].filter(Boolean);
const BLENDER=CANDIDATES.find((p)=>{try{return fs.statSync(p).isFile();}catch{return false;}});
function selftest(script,marker){
 const r=spawnSync(BLENDER,['--background','--factory-startup','--python-exit-code','2','--python',path.join(DIR,script),'--','--selftest'],{encoding:'utf8',timeout:300000});
 const line=(r.stdout||'').split(/\r?\n/).find((l)=>l.startsWith(marker));
 return {status:r.status,result:line?JSON.parse(line.slice(marker.length+1)):null,tail:(r.stdout||'').slice(-800)+(r.stderr||'').slice(-400)};
}
for(const [script,marker] of [['rig_check.py','RIGCHECK_SELFTEST'],['sheet_distance.py','SHEETDIST_SELFTEST'],['pose_sheet.py','POSESHEET_SELFTEST']]){
 test(`${script} passes its planted-control self-test`,{skip:BLENDER?false:'Blender not found (set BLENDER to run the render-proof instruments)'},()=>{
  const {status,result,tail}=selftest(script,marker);
  assert.ok(result,`no ${marker} line; output tail:\n${tail}`);
  assert.equal(result.selftest,'ok',JSON.stringify(result.problems));
  assert.equal(status,0);
 });
}
test('rig_check self-test proves every finding code on the dirty fixture',{skip:BLENDER?false:'Blender not found'},()=>{
 const {result}=selftest('rig_check.py','RIGCHECK_SELFTEST');
 assert.equal(result.clean_verdict,'clean');
 for(const code of ['UNWEIGHTED','RIGID_SHARE','RIGID_DRIFT','TEAR'])assert.ok(result.dirty_codes.includes(code),code);
});
