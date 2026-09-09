#!/usr/bin/env node
import {fileURLToPath} from 'node:url';
import {installRegistry,checkInstallation} from './lib/installation.mjs';
import {EXIT} from './lib/exit-codes.mjs';
const args=process.argv.slice(2);
const value=(flag)=>{const i=args.indexOf(flag);return i<0?null:args[i+1];};
try {
 const project=value('--project'),harness=value('--harness');
 if(!project||!harness)throw new Error('Usage: --project <path> --harness codex|claude [--check | --mode development|release --skills name,... --revision ref --update]');
 const result=args.includes('--check')?checkInstallation(project,harness):installRegistry({
  registry:fileURLToPath(new URL('../',import.meta.url)),project,harness,mode:value('--mode'),
  skills:value('--skills')?.split(','),revision:value('--revision')??'HEAD',update:args.includes('--update'),
  required:value('--require')?.split(',')??['files.read'],available:value('--capabilities')?.split(',')??['files.read'],
 });
 console.log(JSON.stringify({harness,mode:result.mode,revision:result.revision,skills:Array.isArray(result.skills)?result.skills:Object.keys(result.skills),problems:result.problems??[]},null,2));
 process.exitCode=result.problems?.length?EXIT.VIOLATIONS:EXIT.OK;
}catch(error){console.error(`install-registry: ${error.message}`);process.exitCode=EXIT.FATAL;}
