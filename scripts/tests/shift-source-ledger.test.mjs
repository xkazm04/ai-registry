import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { extractVideoIds, frontmatterOf, minedVideoIds } from '../lib/shift-source-ledger.mjs';
import { normSource } from '../run-board.mjs';

function fixture(index, notes = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'shift-ledger-'));
  const dir = path.join(root, 'librarian', 'sources');
  fs.mkdirSync(dir, { recursive: true });
  if (index !== null) fs.writeFileSync(path.join(dir, 'index.md'), index);
  for (const [name, text] of Object.entries(notes)) fs.writeFileSync(path.join(dir, name), text);
  return root;
}

test('the ledger is the union: an id only in a note\'s frontmatter counts as mined', () => {
  const root = fixture('| 2026-11-06 | [a](a.md) `youtube:AAAAAAAAAAA` | talk |\n', {
    'a.md': '---\nurl: https://www.youtube.com/watch?v=AAAAAAAAAAA\n---\n',
    'fm-only.md': '---\nsource: youtube\nurl: https://www.youtube.com/watch?v=FrontMatter\n---\n# body\n',
  });
  const mined = minedVideoIds(root);
  assert.ok(mined.has('FrontMatter'), 'the frontmatter-only id: index.md never heard of it');
  assert.ok(mined.has('AAAAAAAAAAA'));
  assert.equal(mined.size, 2);
});

test('an id an index-only row names is mined too', () => {
  const mined = minedVideoIds(fixture('`youtube:IndexOnly_1`\n', {}));
  assert.deepEqual([...mined], ['IndexOnly_1']);
});

test('a note\'s body is not the ledger: a video it merely cites was not mined', () => {
  const root = fixture('# ledger\n', { 'n.md': '---\ntitle: x\n---\nsee https://youtu.be/CitedInBody\n' });
  assert.equal(minedVideoIds(root).size, 0);
});

test('all spellings fold to the id', () => {
  const text = [
    'https://youtu.be/aaaaaaaaaa1?t=3',
    'https://www.youtube.com/watch?v=aaaaaaaaaa2&list=PLx',
    'https://www.youtube.com/watch?list=PLx&v=aaaaaaaaaa3',
    'youtube:aaaaaaaaaa4',
    'https://youtube.com/shorts/aaaaaaaaaa5',
    'https://m.youtube.com/live/aaaaaaaaaa6',
  ].join('\n');
  assert.deepEqual(extractVideoIds(text), ['aaaaaaaaaa1', 'aaaaaaaaaa2', 'aaaaaaaaaa3', 'aaaaaaaaaa4', 'aaaaaaaaaa5', 'aaaaaaaaaa6']);
});

test('a slug that happens to follow `youtube:` is not an id', () => {
  assert.deepEqual(extractVideoIds('youtube:a-much-longer-topic-slug and source: youtube\nkind: talk'), []);
});

test('ids keep their case, and two that differ only in case stay two', () => {
  const root = fixture('`youtube:AbCdEfGhIjK` `youtube:abcdefghijk`\n');
  assert.deepEqual([...minedVideoIds(root)].sort(), ['AbCdEfGhIjK', 'abcdefghijk']);
});

test('REGRESSION GUARD: run-board\'s fold is lossy, which is why this ledger does not use it', () => {
  const url = 'https://www.youtube.com/watch?v=AbCdEfGhIjK';
  assert.equal(normSource(url), 'youtube.com/video/abcdefghijk', 'a fold for comparing');
  assert.equal(normSource('https://youtu.be/AbCdEfGhIjK'), normSource(url), 'spellings still compare equal');
  assert.deepEqual(extractVideoIds(url), ['AbCdEfGhIjK'], 'the ledger reads back an id yt-dlp can use');
});

test('a missing index is an error, never "nothing has been mined"', () => {
  assert.throws(() => minedVideoIds(fixture(null)), /ENOENT/);
});

test('frontmatter reader takes the block only, and CRLF', () => {
  assert.equal(frontmatterOf('---\r\na: 1\r\n---\r\nbody'), 'a: 1');
  assert.equal(frontmatterOf('no block'), '');
});
