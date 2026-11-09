// The census is an unproven judge's output, so these pin what it refuses to believe:
// a quote that is not in the cited file, a path out of its root, and an unaudited count.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { lastJsonBlock, anchor, collect, gaps, clusters, sample, auditRate, renderReport } from '../scripts/census.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'dbk-census-'));
const part = (project, relation, o = {}) => ({ id: `${project}:c:${relation}`, project, relation, kind: 'table', stack: 'react', capabilities: [], ...o });

test('lastJsonBlock takes the final block and survives bad JSON', () => {
  assert.deepEqual(lastJsonBlock('```json\n{"a":1}\n```\ntext\n```json\n{"a":2}\n```'), { a: 2 });
  assert.equal(lastJsonBlock('```json\n{nope\n```'), null);
  assert.equal(lastJsonBlock('no block'), null);
});

test('anchor: exact, moved, missing, and a path escaping its root', () => {
  const root = tmp();
  fs.writeFileSync(path.join(root, 'a.tsx'), 'one\ntwo\nthree\nfour\nfive\nsix\nseven\neight\nexport function Table\n');
  assert.equal(anchor(root, 'a.tsx', 9, 'export function Table'), 'exact');
  assert.equal(anchor(root, 'a.tsx', 1, 'export function Table'), 'moved');
  assert.equal(anchor(root, 'a.tsx', 9, 'not in the file'), 'missing');
  assert.equal(anchor(root, 'nope.tsx', 1, 'x'), 'missing');
  fs.writeFileSync(path.join(root, '..', 'dbk-outside.txt'), 'secret');
  assert.equal(anchor(root, '../dbk-outside.txt', 1, 'secret'), 'missing');
});

test('collect keeps anchored parts, drops unanchored, lists unusable contexts', () => {
  const root = tmp(), runs = tmp();
  fs.writeFileSync(path.join(root, 'a.tsx'), 'export function Table\n');
  const good = { parts: [
    { kind: 'table', relation: 'reinvents', file: 'a.tsx', line: 1, quote: 'export function Table', stack: 'react' },
    { kind: 'table', relation: 'reinvents', file: 'a.tsx', line: 1, quote: 'invented line' },
    { kind: 'table', relation: 'made-up', file: 'a.tsx', line: 1, quote: 'export function Table' },
    { kind: 'other', relation: 'no-standard', file: 'a.tsx', line: 1, quote: 'export function Table' },
  ] };
  fs.mkdirSync(path.join(runs, 'p', 'ctx'), { recursive: true });
  fs.writeFileSync(path.join(runs, 'p', 'ctx', 'last.md'), '```json\n' + JSON.stringify(good) + '\n```');
  fs.mkdirSync(path.join(runs, 'p', 'broken'), { recursive: true });
  fs.writeFileSync(path.join(runs, 'p', 'broken', 'last.md'), 'no json here');
  const c = collect(runs, { p: root });
  assert.equal(c.parts.length, 1);
  assert.equal(c.dropped, 1);
  assert.equal(c.invalid, 2);
  assert.deepEqual(c.unusable, ['p/broken']);
});

test('gaps separates the two directions', () => {
  const g = gaps([part('a', 'consumes'), part('a', 'reinvents'), part('a', 'no-standard'), part('a', 'better-than-standard')]);
  assert.deepEqual(g.a, { parts: 4, consumes: 1, inbound: 1, outbound: 2 });
});

test('clusters need three distinct projects, and consumers do not count', () => {
  const two = clusters([part('a', 'reinvents'), part('b', 'reinvents'), part('c', 'consumes')]);
  assert.equal(two[0].sharedCandidate, false);
  const three = clusters([part('a', 'reinvents'), part('a', 'reinvents'), part('b', 'no-standard'), part('c', 'reinvents')]);
  assert.equal(three[0].sharedCandidate, true);
  assert.equal(three[0].count, 4);
  const stacks = clusters([part('a', 'reinvents'), part('b', 'reinvents', { stack: 'vue' }), part('c', 'reinvents', { stack: 'svelte' })]);
  assert.ok(stacks.every((c) => !c.sharedCandidate), 'different stacks are different parts');
});

test('sample is stable and capped per project', () => {
  const ps = [...Array(9).keys()].map((i) => part('a', 'reinvents', { id: `a:${i}` }));
  assert.equal(sample(ps, 3).length, 3);
  assert.deepEqual(sample(ps, 3), sample([...ps].reverse(), 3));
});

test('audit rate, and a report that says when it is unaudited', () => {
  assert.equal(auditRate({ a: 'agree', b: 'disagree', c: 'skip' }).rate, 0.5);
  assert.equal(auditRate({}).rate, undefined);
  const census = { parts: [part('a', 'reinvents')], dropped: 2, invalid: 0, unusable: ['a/x'] };
  assert.match(renderReport(census, null), /Not audited/);
  const audited = renderReport(census, { i: 'agree', j: 'disagree' });
  assert.match(audited, /2 parts, 1 wrong \(50\.0%\)/);
  assert.doesNotMatch(audited, /Not audited/);
  assert.match(audited, /a\/x/);
});
