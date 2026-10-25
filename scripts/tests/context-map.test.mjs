// context-map.json is the partition /scan-sweep, /architect and /perfect walk over the
// registry's own code. A script that no context claims is a script no sweep ever reads,
// and nothing would say so: the coverage table just stays green over a smaller tree. So
// every tracked code file under scripts/ and a lane skill's scripts/tests/tools must be
// claimed by exactly one context, and every claimed path must still exist.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CODE = /\.(mjs|js|ts|tsx|py)$/;
const IN_SCOPE = (f) => CODE.test(f) && (f.startsWith('scripts/') || /^skills\/[^/]+\/(scripts|tests|tools)\//.test(f));

test('context-map claims every tracked code file exactly once, and only files that exist', () => {
  const map = JSON.parse(fs.readFileSync(path.join(ROOT, 'context-map.json'), 'utf8'));
  const owner = new Map();
  for (const c of map.contexts) {
    assert.ok(map.groups.some((g) => g.name === c.group), `${c.name}: group ${c.group} is declared`);
    for (const f of c.file_paths) {
      assert.ok(!owner.has(f), `${f} is claimed by ${owner.get(f)} and ${c.name}`);
      owner.set(f, c.name);
      assert.ok(fs.existsSync(path.join(ROOT, f)), `${c.name} claims ${f}, which does not exist`);
    }
    for (const e of c.entry_points ?? []) assert.ok(c.file_paths.includes(e), `${c.name}: entry point ${e} is one of its files`);
  }
  let tracked;
  try {
    tracked = execFileSync('git', ['ls-files', 'scripts', 'skills'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch {
    return; // not a git checkout (a tarball): the existence half above still ran
  }
  const unclaimed = tracked.filter(IN_SCOPE).filter((f) => !owner.has(f));
  assert.deepEqual(unclaimed, [], 'unclaimed code files - add each to the context it belongs to in context-map.json');
});
