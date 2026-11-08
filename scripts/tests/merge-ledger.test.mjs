import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeLedger, LedgerConflict } from '../merge-ledger.mjs';

const row = (id, extra = {}) => JSON.stringify({ id, status: 'queued', ...extra });
const jl = (...r) => `${r.join('\n')}\n`;

test('backlog: both sides append different rows, both survive, upstream order first', () => {
  const base = jl(row('a'));
  const ours = jl(row('a'), row('up'));
  const theirs = jl(row('a'), row('mine1'), row('mine2'));
  assert.equal(mergeLedger('librarian/harvest/backlog.jsonl', base, ours, theirs), jl(row('a'), row('up'), row('mine1'), row('mine2')));
});

test('backlog: the incoming side replaces a row in place by id', () => {
  const base = jl(row('a'), row('b'));
  const ours = jl(row('a'), row('b'), row('up'));
  const theirs = jl(row('a'), row('b', { status: 'held' }));
  assert.equal(mergeLedger('librarian/harvest/backlog.jsonl', base, ours, theirs), jl(row('a'), row('b', { status: 'held' }), row('up')));
});

test('backlog: both sides changing one id differently is a conflict, the same change is not', () => {
  const base = jl(row('a'));
  assert.throws(() => mergeLedger('librarian/harvest/backlog.jsonl', base, jl(row('a', { status: 'landed' })), jl(row('a', { status: 'held' }))), LedgerConflict);
  const same = jl(row('a', { status: 'held' }));
  assert.equal(mergeLedger('librarian/harvest/backlog.jsonl', base, same, same), same);
});

test('sources index: incoming rows go under the Mined delimiter, upstream rows stay', () => {
  const head = '# Sources\n\n## Mined\n\n| date | note |\n| --- | --- |\n';
  const base = `${head}| 1 | old |\n`;
  const ours = `${head}| 3 | up |\n| 1 | old |\n`;
  const theirs = `${head}| 2 | mine |\n| 1 | old |\n`;
  assert.equal(mergeLedger('librarian/sources/index.md', base, ours, theirs), `${head}| 2 | mine |\n| 3 | up |\n| 1 | old |\n`);
});

test('scorecard: both sides append a row at the end, both survive', () => {
  const base = '| run | x |\n| --- | --- |\n| r0 | 0 |\n';
  const ours = `${base}| up | 1 |\n`;
  const theirs = `${base}| mine | 2 |\n`;
  assert.equal(mergeLedger('.claude/skills/intake/SCORECARD.md', base, ours, theirs), `${base}| up | 1 |\n| mine | 2 |\n`);
});

test('lessons: an appended block lands after upstream; an edit that is not an append conflicts', () => {
  const base = '# Lessons\n\n## 1.0 - a\n- x\n';
  const ours = `${base}\n## 1.1 - up\n- y\n`;
  const theirs = `${base}\n## 1.2 - mine\n- z\n`;
  assert.equal(mergeLedger('skills/perfect/LESSONS.md', base, ours, theirs), `${ours}\n## 1.2 - mine\n- z\n`);
  assert.throws(() => mergeLedger('skills/perfect/LESSONS.md', base, ours, '# Lessons\n\n## 1.0 - a\n- changed\n'), LedgerConflict);
});

test('a path that is not a ledger is refused', () => {
  assert.throws(() => mergeLedger('README.md', 'a', 'b', 'c'), LedgerConflict);
});
