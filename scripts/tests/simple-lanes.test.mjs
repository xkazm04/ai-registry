import test from 'node:test';
import assert from 'node:assert/strict';
import {validateNote} from '../lib/simple-lanes.mjs';
const note=(lines)=>`---\n${lines.join('\n')}\n---\n\n# A note\nBody.\n`;
test('practice identity, required fields and fixed depth are checked',()=>{
 const raw=note(['id: useful','dimension: D6','applies-when: a real trigger','future: permitted']);
 assert.deepEqual(validateNote('practices','useful/PRACTICE.md',raw),[]);
 assert.ok(validateNote('practices','other/PRACTICE.md',raw).length);
 assert.ok(validateNote('practices','group/useful/PRACTICE.md',raw).length);
 assert.ok(validateNote('practices','useful/PRACTICE.md',note(['id: useful'])).length);
});
test('memory range, kind and duplicate keys reject malformed notes',()=>{
 const fields=['kind: semantic','confidence: 0.6','source: observed'];
 assert.deepEqual(validateNote('memory','semantic/example.md',note(fields)),[]);
 for(const confidence of ['NaN','1.1','-0.2',''])assert.ok(validateNote('memory','semantic/example.md',note([fields[0],`confidence: ${confidence}`,fields[2]])).length);
 assert.ok(validateNote('memory','episodic/example.md',note(fields)).length);
 assert.ok(validateNote('memory','semantic/example.md',note([...fields,'confidence: 1.0'])).length);
});
