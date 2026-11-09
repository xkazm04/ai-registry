// The census is an unproven judge's output, so these pin what it refuses to believe:
// a quote that is not in the cited file, a path out of its root, and an unaudited count.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { lastJsonBlock, anchor, collect, gaps, clusters, sample, auditRate, renderReport, wasReturned, commandOutputs, coverageOf, applyAdjudication, applyRejudge, normalizeRule, builtOnSummary } from '../scripts/census.mjs';

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

test('collect refuses an unbacked consumes and is not confused by the manifest', () => {
  const root = tmp(), runs = tmp();
  fs.writeFileSync(path.join(root, 'a.tsx'), 'export function Table\n');
  const row = { kind: 'table', relation: 'consumes', file: 'a.tsx', line: 1, quote: 'export function Table' };
  fs.mkdirSync(path.join(runs, 'p', 'c1'), { recursive: true });
  fs.writeFileSync(path.join(runs, 'p', 'manifest.json'), JSON.stringify({ tracked: 3, scoped: 1, chunks: [{ id: 'c1', files: ['a.tsx'] }] }));
  fs.writeFileSync(path.join(runs, 'p', 'c1', 'last.md'), '```json\n' + JSON.stringify({ parts: [row, { ...row, builtOn: 'ag-grid' }, { ...row, subject: 'table' }] }) + '\n```');
  fs.writeFileSync(path.join(runs, 'p', 'c1', 'events.jsonl'), JSON.stringify({ type: 'item.completed', item: { type: 'command_execution', aggregated_output: 'export function Table' } }) + '\n');
  const c = collect(runs, { p: root });
  assert.equal(c.parts.length, 2);
  assert.equal(c.invalid, 1);
  assert.deepEqual(c.unusable, []);
  assert.equal(c.parts[0].builtOn, 'ag-grid');
  assert.equal(c.coverage.p.read, 1);
});

test('coverage counts a file only when its content came back', () => {
  const root = tmp(), slug = tmp();
  fs.writeFileSync(path.join(root, 'seen.ts'), 'const shortOne = 1;\nexport function seenFunctionName() {}\n');
  fs.writeFileSync(path.join(root, 'unseen.ts'), 'export function neverReturnedToCodex() {}\n');
  fs.writeFileSync(path.join(root, 'tiny.ts'), 'x\n');
  fs.mkdirSync(path.join(slug, 'c1'));
  fs.writeFileSync(path.join(slug, 'c1', 'events.jsonl'), JSON.stringify({ type: 'item.completed', item: { type: 'command_execution', command: 'cat unseen.ts', aggregated_output: 'export function seenFunctionName() {}' } }) + '\nnot json\n');
  const got = coverageOf(root, { tracked: 9, scoped: 3, chunks: [{ id: 'c1', files: ['seen.ts', 'unseen.ts', 'tiny.ts'] }, { id: 'never-ran', files: [] }] }, slug);
  assert.deepEqual(got, { tracked: 9, scoped: 3, read: 1, missed: 1, trivial: 1 });
});

test('wasReturned uses a share of ASCII lines, so a mangled line cannot hide a read file', () => {
  const file = 'export const aLongEnoughLine = 1;\nexport const anotherLongLine = 2;\nconst note = "em — dash, the longest line in this file by some distance";\n';
  assert.equal(wasReturned(file, 'export const aLongEnoughLine = 1;\nexport const anotherLongLine = 2;\nconst note = "em ? dash"'), true);
  assert.equal(wasReturned(file, 'export const aLongEnoughLine = 1;'), true, 'one of two ASCII lines is half');
  assert.equal(wasReturned(file, 'unrelated output'), false);
  assert.equal(wasReturned('x\ny\n', 'anything'), null);
});

test('commandOutputs reads only command results', () => {
  assert.equal(commandOutputs(JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'no' } })), '');
});

test('adjudication moves only no-standard parts, and counts what it could not check', () => {
  const census = { parts: [part('a', 'no-standard', { id: 'n1' }), part('a', 'no-standard', { id: 'n2' }), part('a', 'no-standard', { id: 'n3' }), part('a', 'no-standard', { id: 'n4' }), part('a', 'reinvents', { id: 'r1' })] };
  const out = applyAdjudication(census, [
    { id: 'n1', verdict: 'reinvents', standard: 's/t', missed: ['rule'] },
    { id: 'n2', verdict: 'consumes', standard: 's/u' },
    { id: 'n3', verdict: 'no-standard' },
    { id: 'r1', verdict: 'consumes' },
    { id: 'n4', verdict: 'nonsense' },
  ]);
  assert.deepEqual(out.adjudication, { checked: 3, reinvents: 1, consumes: 1, kept: 1, unchecked: 1 });
  assert.equal(out.parts[0].relation, 'reinvents');
  assert.equal(out.parts[0].subject, 's/t');
  assert.equal(out.parts[4].relation, 'reinvents');
  assert.equal(census.parts[0].relation, 'no-standard', 'input untouched');
});

test('rejudge upholds only a verifiable rule, and leaves an unreached part accused', () => {
  const census = { parts: ['a', 'b', 'c', 'd', 'e'].map((id) => part('p', 'reinvents', { id, subject: 'table', missed: ['old'] })).concat(part('p', 'consumes', { id: 'z' })) };
  const out = applyRejudge(census, [
    { id: 'a', verdict: 'reinvents', rule: 'a real rule' },
    { id: 'b', verdict: 'reinvents', rule: 'an invented rule' },
    { id: 'c', verdict: 'not-governed', why: 'scope: terminal output' },
    { id: 'd', verdict: 'follows' },
    { id: 'z', verdict: 'not-governed' },
  ], (p, rule) => rule === 'a real rule');
  assert.deepEqual(out.rejudge, { checked: 4, upheld: 1, follows: 1, notGoverned: 1, unbacked: 1, unchecked: 1 });
  const by = Object.fromEntries(out.parts.map((p) => [p.id, p]));
  assert.equal(by.a.relation, 'reinvents');
  assert.deepEqual(by.a.missed, ['a real rule']);
  assert.equal(by.b.relation, 'no-standard');
  assert.equal(by.c.accusedOf, 'table');
  assert.equal(by.d.relation, 'consumes');
  assert.equal(by.e.relation, 'reinvents', 'no verdict clears nothing');
  assert.equal(by.z.relation, 'consumes', 'only reinvents are rejudged');
});

test('normalizeRule ignores markup and line wrapping', () => {
  assert.equal(normalizeRule('A **list** when\n  there is `one`'), normalizeRule('a list when there is one'));
});

test('a salt draws a different sample', () => {
  const ps = [...Array(40).keys()].map((i) => part('a', 'reinvents', { id: `a:${i}` }));
  assert.notDeepEqual(sample(ps, 5).map((p) => p.id), sample(ps, 5, 'r2').map((p) => p.id));
});

test('builtOnSummary separates from-scratch parts', () => {
  const [row] = builtOnSummary([part('a', 'reinvents', { builtOn: null }), part('a', 'consumes', { builtOn: 'kit/DataTable' })]);
  assert.deepEqual(row, { kind: 'table', parts: 2, scratch: 1, on: { 'kit/DataTable': 1 } });
});

test('sample takes from every relation before repeating one', () => {
  const ps = [...Array(9).keys()].map((i) => part('a', 'reinvents', { id: `a:${i}` })).concat(part('a', 'consumes', { id: 'rare' }));
  assert.ok(sample(ps, 2).some((p) => p.id === 'rare'));
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
