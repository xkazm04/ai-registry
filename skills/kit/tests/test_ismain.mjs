// isMain must recognise a script run through a LINKED skill directory (the registry's normal install:
// .claude/skills/kit -> <registry>/skills/kit). The first version compared resolved paths, so every
// linked run was a silent no-op with exit 0 - found in the first real run on a consumer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { isMain } from '../scripts/lib/modules.mjs';

test('isMain is true for the same file reached through a directory link', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-ismain-'));
  const real = path.join(dir, 'real');
  fs.mkdirSync(real);
  const file = path.join(real, 'x.mjs');
  fs.writeFileSync(file, '');
  const link = path.join(dir, 'link');
  try {
    fs.symlinkSync(real, link, 'junction');
  } catch {
    t.skip('cannot create a directory link here');
    return;
  }
  try {
    assert.equal(isMain(pathToFileURL(file).href, path.join(link, 'x.mjs')), true);
    assert.equal(isMain(pathToFileURL(file).href, path.join(real, 'other.mjs')), false);
    assert.equal(isMain(pathToFileURL(file).href, undefined), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('a script run through a link actually runs (fails loud on a missing input)', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-ismain-run-'));
  const link = path.join(dir, 'kit');
  const skillDir = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
  try {
    fs.symlinkSync(skillDir, link, 'junction');
  } catch {
    t.skip('cannot create a directory link here');
    return;
  }
  try {
    const r = spawnSync(process.execPath, [path.join(link, 'scripts', 'join.mjs'), '--divergence', path.join(dir, 'missing.csv'), '--reach', path.join(dir, 'missing.json')], { encoding: 'utf8' });
    assert.notEqual(r.status, 0, `join through a link must fail on a missing input, got exit ${r.status}`);
  } finally {
    fs.rmSync(link, { recursive: true, force: true });
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
