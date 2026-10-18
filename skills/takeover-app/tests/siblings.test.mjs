// node --test "skills/takeover-app/tests/*.mjs"
// Pins the preflight: a required sibling missing stops the run (exit 1) with the fix, an optional one is reported
// with its fallback, project scope wins over user scope, and a user-scope-only passport-onboard carries the
// stale-copy warning.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolveSiblings, SIBLINGS } from '../scripts/siblings.mjs';

const made = [];
const tmp = (p) => { const d = mkdtempSync(join(tmpdir(), p)); made.push(d); return d; };
after(() => { for (const d of made) rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });
const skill = (dir, name, version = '1.0.0') => {
  mkdirSync(join(dir, name), { recursive: true });
  writeFileSync(join(dir, name, 'SKILL.md'), `---\nname: ${name}\nversion: ${version}\n---\n`);
};
const SCRIPT = fileURLToPath(new URL('../scripts/siblings.mjs', import.meta.url));

test('every required sibling at project scope, passport only at user scope -> ok, with the stale-copy note', () => {
  const root = tmp('takeover-sib-'), home = tmp('takeover-home-');
  for (const s of SIBLINGS.filter((x) => x.required)) skill(join(root, '.claude/skills'), s.name);
  skill(join(home, '.claude/skills'), 'passport-onboard', '0.9.0');
  skill(join(home, '.claude/skills'), 'lens-scan', '0.1.0');
  const out = resolveSiblings({ root, home });
  assert.equal(out.missing, undefined);
  assert.deepEqual(out.resolved['lens-scan'], { scope: 'project', version: '1.0.0' }, 'project scope wins');
  assert.equal(out.resolved['passport-onboard'].scope, 'user');
  assert.match(out.notes[0], /passport-onboard resolves only at user scope/);
  assert.deepEqual(out.optional_missing.map((m) => m.name).sort(), ['project-populate', 'scan-sweep']);
});

test('a missing required sibling stops the run: exit 1 and the fix names it', () => {
  const root = tmp('takeover-sib-'), home = tmp('takeover-home-');
  skill(join(root, '.claude/skills'), 'onboarding');
  const r = spawnSync(process.execPath, [SCRIPT, '--product-root', root, '--home', home], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  const out = JSON.parse(r.stdout);
  assert.deepEqual(out.missing.map((m) => m.name), ['adopt-bp', 'lens-scan', 'perfect']);
  assert.match(out.fix, /link-registry\.mjs/);
});
