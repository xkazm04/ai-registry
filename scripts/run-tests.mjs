#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { classifyCheckResult } from './lib/check-result.mjs';
const dir=fileURLToPath(new URL('./tests/',import.meta.url));
const tests=fs.readdirSync(dir).filter((f)=>f.endsWith('.test.mjs')).sort().map((f)=>path.join(dir,f));
if(!tests.length)throw new Error('No tooling tests found');
const result=classifyCheckResult(spawnSync(process.execPath,['--test',...tests],{stdio:'inherit'}));
if(result.reason)console.error(result.reason);
process.exitCode=result.code;
