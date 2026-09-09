import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('unfiltered CI delegates to the local validation plan and both version checks',()=>{
 const source=fs.readFileSync(new URL('../../.github/workflows/registry.yml',import.meta.url),'utf8');
 const content=source.split('\n').filter((line)=>!line.trim().startsWith('#')).join('\n');
 assert.doesNotMatch(content,/^\s*(paths|paths-ignore):/m);
 assert.match(content,/run: node scripts\/gate\.mjs --all/);
 assert.match(content,/node scripts\/check-skills\.mjs --since "\$BASE_SHA"/);
 assert.match(content,/node scripts\/check-recipes\.mjs --since "\$BASE_SHA"/);
});
