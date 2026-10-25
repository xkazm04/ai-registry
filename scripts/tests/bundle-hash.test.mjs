// lib/bundle-hash: the digest is a property of the bundle, never of the checkout. It already
// normalises line endings; the ORDER the files are streamed in is the other byte-affecting
// property, and it was taken from a sort over absolute NATIVE paths. Windows separates with
// `\` (0x5C) and POSIX with `/` (0x2F), so a folder `a/` and a file `a0.md` sort one way on
// one platform and the other way on the other ('/' < '0' < '\'), and the same commit hashed
// to two digests. The canonical order is the one written in the stream: the relative POSIX
// path, compared by code unit. The oracle below spells the stream out by hand, so the test
// pins the format, not just "whatever hashBundle does today".
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { hashBundle } from '../lib/bundle-hash.mjs';

function tree(t, files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bundle-hash-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const [rel, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), body);
  }
  return dir;
}

/** The b2 stream, written out: `<len>:<posix rel path><len>:<bytes>` per file, in the given order. */
function oracle(ordered) {
  const h = crypto.createHash('sha256');
  for (const [rel, body] of ordered) {
    const r = Buffer.from(rel, 'utf8');
    const b = Buffer.from(body, 'utf8');
    h.update(`${r.length}:`); h.update(r);
    h.update(`${b.length}:`); h.update(b);
  }
  return `sha256-b2:${h.digest('hex').slice(0, 16)}`;
}

test('control: a flat bundle hashes to the oracle stream', (t) => {
  const dir = tree(t, { 'a.md': 'X', 'b.md': 'Y' });
  assert.equal(hashBundle(dir).hash, oracle([['a.md', 'X'], ['b.md', 'Y']]));
});

test('files stream in relative POSIX order, whatever the platform separator', (t) => {
  // '/' (0x2F) < '0' (0x30) < '\' (0x5C): a native-path sort on Windows put a0.md first.
  const dir = tree(t, { 'a/b.md': 'X', 'a0.md': 'Y', 'aB.md': 'Z' });
  const r = hashBundle(dir);
  assert.equal(r.count, 3);
  assert.equal(r.hash, oracle([['a/b.md', 'X'], ['a0.md', 'Y'], ['aB.md', 'Z']]));
});

test('dot entries never enter the digest', (t) => {
  const dir = tree(t, { 'a.md': 'X', '.evidence.local.md': 'private', '.d/x.md': 'private' });
  assert.equal(hashBundle(dir).hash, oracle([['a.md', 'X']]));
});
