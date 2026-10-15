// Tests for scripts/lib/safe-remove.mjs - builtins only, synthetic trees in a temp dir.
// The junction and symlink cases are the point: a link inside a deleted tree is removed as
// a link and the tree it points at survives byte for byte.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { measureTree, removeTree } from '../lib/safe-remove.mjs';

function setup() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'saferm-'));
  const victim = path.join(base, 'victim');
  const outside = path.join(base, 'outside');
  fs.mkdirSync(path.join(victim, 'a', 'b'), { recursive: true });
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(victim, 'a', 'b', 'f.txt'), 'x'.repeat(100));
  fs.writeFileSync(path.join(victim, 'top.bin'), Buffer.alloc(50));
  fs.writeFileSync(path.join(outside, 'precious.txt'), 'keep me');
  return { base, victim, outside, cleanup: () => fs.rmSync(base, { recursive: true, force: true }) };
}

function dirLink(target, link) {
  if (process.platform === 'win32') execFileSync('cmd', ['/c', 'mklink', '/J', link, target], { stdio: 'ignore' });
  else fs.symlinkSync(target, link, 'dir');
}

test('removeTree deletes a tree and counts what it freed', () => {
  const t = setup();
  try {
    const m = measureTree(t.victim);
    assert.equal(m.files, 2);
    assert.equal(m.bytes, 150);
    const r = removeTree(t.victim);
    assert.equal(r.errors, 0);
    assert.equal(r.bytesFreed, 150);
    assert.equal(fs.existsSync(t.victim), false);
  } finally { t.cleanup(); }
});

test('a directory junction or symlink inside the tree is removed as a link, its target survives', () => {
  const t = setup();
  try {
    dirLink(t.outside, path.join(t.victim, 'a', 'node_modules'));
    const m = measureTree(t.victim);
    assert.equal(m.links, 1, 'the link is counted, not entered');
    assert.equal(m.bytes, 150, 'the target bytes are not counted');
    const r = removeTree(t.victim);
    assert.equal(r.errors, 0, JSON.stringify(r.firstErrors));
    assert.equal(r.links, 1);
    assert.equal(fs.existsSync(t.victim), false);
    assert.equal(fs.readFileSync(path.join(t.outside, 'precious.txt'), 'utf8'), 'keep me');
  } finally { t.cleanup(); }
});

test('a root that is itself a link is unlinked, never emptied', () => {
  const t = setup();
  try {
    const link = path.join(t.base, 'link-root');
    dirLink(t.outside, link);
    assert.equal(measureTree(link).rootIsLink, true);
    removeTree(link);
    assert.equal(fs.existsSync(link), false);
    assert.equal(fs.existsSync(path.join(t.outside, 'precious.txt')), true);
  } finally { t.cleanup(); }
});

test('read-only files (git objects) are deleted', () => {
  const t = setup();
  try {
    const ro = path.join(t.victim, 'a', 'pack.pack');
    fs.writeFileSync(ro, 'pack');
    fs.chmodSync(ro, 0o444);
    const r = removeTree(t.victim);
    assert.equal(r.errors, 0, JSON.stringify(r.firstErrors));
    assert.equal(fs.existsSync(t.victim), false);
  } finally { t.cleanup(); }
});

test('keepRoot and keepFirstLevelDirs leave the structure, dryRun touches nothing', () => {
  const t = setup();
  try {
    const dry = removeTree(t.victim, { dryRun: true });
    assert.equal(dry.bytesFreed, 150);
    assert.equal(fs.existsSync(path.join(t.victim, 'a', 'b', 'f.txt')), true);
    removeTree(t.victim, { keepFirstLevelDirs: true });
    assert.deepEqual(fs.readdirSync(t.victim), ['a'], 'first-level folder kept, its contents and the root file gone');
    assert.deepEqual(fs.readdirSync(path.join(t.victim, 'a')), []);
    fs.writeFileSync(path.join(t.victim, 'again.txt'), 'y');
    removeTree(t.victim, { keepRoot: true });
    assert.deepEqual(fs.readdirSync(t.victim), []);
  } finally { t.cleanup(); }
});

test('measureTree never lets .git/index set the newest write (a scanner\'s git status refreshes it)', () => {
  const t = setup();
  try {
    const clone = path.join(t.base, 'clone');
    fs.mkdirSync(path.join(clone, '.git'), { recursive: true });
    fs.writeFileSync(path.join(clone, '.git', 'index'), 'fresh');
    const m = measureTree(clone);
    assert.equal(m.files, 1);
    assert.equal(m.newestMs, 0);
    fs.writeFileSync(path.join(clone, 'work.txt'), 'w');
    assert.ok(measureTree(clone).newestMs > Date.now() - 60e3, 'any other file does');
    assert.equal(measureTree(path.join(t.base, 'nope')).missing, true);
  } finally { t.cleanup(); }
});
