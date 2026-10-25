// apply-skill-clauses --check: every clause a skill carries must appear exactly once. The
// 2026-10-25 gates probe planted a second stamped block and an unmarked copy of the
// heading, and both passed, because the check compared only the first marked block.
// The script resolves its lane from its own location, so each case runs a copy of it in a
// temp registry holding the real templates and the real SKILL.md files (read-only use of
// the tree), then plants one defect.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));

function registry(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-clauses-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.cpSync(path.join(root, 'scripts/lib'), path.join(dir, 'scripts/lib'), { recursive: true });
  fs.copyFileSync(path.join(root, 'scripts/apply-skill-clauses.mjs'), path.join(dir, 'scripts/apply-skill-clauses.mjs'));
  fs.cpSync(path.join(root, 'docs/skill-clauses'), path.join(dir, 'docs/skill-clauses'), { recursive: true });
  for (const e of fs.readdirSync(path.join(root, 'skills'), { withFileTypes: true })) {
    const src = path.join(root, 'skills', e.name, 'SKILL.md');
    if (!e.isDirectory() || !fs.existsSync(src)) continue;
    fs.mkdirSync(path.join(dir, 'skills', e.name), { recursive: true });
    fs.copyFileSync(src, path.join(dir, 'skills', e.name, 'SKILL.md'));
  }
  return dir;
}
const check = (dir) => spawnSync(process.execPath, [path.join(dir, 'scripts/apply-skill-clauses.mjs'), '--check'], { encoding: 'utf8' });
const skillFile = (dir, name) => path.join(dir, 'skills', name, 'SKILL.md');
const edit = (file, fn) => fs.writeFileSync(file, fn(fs.readFileSync(file, 'utf8')));
const block = (text, id) => new RegExp(`<!-- clause: ${id} v\\d+ [^\\n]*-->\\r?\\n[\\s\\S]*?<!-- /clause: ${id} -->`).exec(text)[0];

test('clean control: the copied lane checks clean', (t) => {
  const r = check(registry(t));
  assert.equal(r.status, 0, r.stderr);
});

test('a second, drifted stamped block fails --check (exit 1)', (t) => {
  const dir = registry(t);
  edit(skillFile(dir, 'architect'), (s) => `${s.trimEnd()}\n\n${block(s, 'skill-reflection').replace('## Skill Reflection\n', '## Skill Reflection\nA drifted extra line.\n').replace('## Skill Reflection\r\n', '## Skill Reflection\r\nA drifted extra line.\r\n')}\n`);
  const r = check(dir);
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /architect: clause skill-reflection must appear exactly once - found 2 open marker/);
});

test('an unmarked copy of a clause heading fails --check (exit 1)', (t) => {
  const dir = registry(t);
  edit(skillFile(dir, 'spark'), (s) => s.replace(/\r?\n---\r?\n/, '\n---\n\n## Knowledge sync\n\nA hand-written copy.\n'));
  const r = check(dir);
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stderr, /spark: clause knowledge-sync must appear exactly once - found 1 open marker\(s\), 1 close marker\(s\), 2/);
});

test('a heading quoted inside fenced code is not a second copy', (t) => {
  const dir = registry(t);
  edit(skillFile(dir, 'spark'), (s) => s.replace(/\r?\n---\r?\n/, '\n---\n\n```md\n## Knowledge sync\n```\n'));
  assert.equal(check(dir).status, 0);
});

// A template is prose, and prose may say `$&` or `$'` (a shell or regex example). Re-stamping
// went through String.replace with the rendered block as a STRING replacement, so those
// sequences expanded to the matched old block / the rest of the file, and --check then
// reported the freshly stamped skill stale forever.
test('a template carrying $-replacement sequences stamps literally and then checks clean', (t) => {
  const dir = registry(t);
  const tpl = path.join(dir, 'docs/skill-clauses/skill-reflection.md');
  edit(tpl, (s) => `${s.trimEnd()}\n\nLiteral: $& and $' and $$ stay as written.\n`);
  const w = spawnSync(process.execPath, [path.join(dir, 'scripts/apply-skill-clauses.mjs')], { encoding: 'utf8' });
  assert.equal(w.status, 0, w.stderr);
  assert.match(fs.readFileSync(skillFile(dir, 'architect'), 'utf8'), /Literal: \$& and \$' and \$\$ stay as written\./);
  const r = check(dir);
  assert.equal(r.status, 0, r.stderr);
});

test('--bump with no level is a usage error (exit 2), not a silent stamp without a bump', (t) => {
  const dir = registry(t);
  const before = fs.readFileSync(skillFile(dir, 'architect'), 'utf8');
  const r = spawnSync(process.execPath, [path.join(dir, 'scripts/apply-skill-clauses.mjs'), '--bump'], { encoding: 'utf8' });
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /--bump takes minor\|patch/);
  assert.equal(fs.readFileSync(skillFile(dir, 'architect'), 'utf8'), before);
});

test('write mode refuses to rewrite a duplicated skill and exits 1', (t) => {
  const dir = registry(t);
  const file = skillFile(dir, 'architect');
  edit(file, (s) => `${s.trimEnd()}\n\n${block(s, 'skill-reflection')}\n`);
  const before = fs.readFileSync(file, 'utf8');
  const r = spawnSync(process.execPath, [path.join(dir, 'scripts/apply-skill-clauses.mjs')], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.equal(fs.readFileSync(file, 'utf8'), before);
});
