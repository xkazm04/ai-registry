// The census is an unproven judge's output, so these pin what it refuses to believe:
// a quote that is not in the cited file, a path out of its root, and an unaudited count.
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { makeRuleFound, quotedInFile, lastJsonBlock, anchor, collect, gaps, clusters, sample, auditRate, renderReport, wasReturned, commandOutputs, coverageOf, applyAdjudication, applyRejudge, applyConfirm, applyRepeat, applySettle, dedupe, isSharedPart, sampleByRelation, goldenRow, goldenCensus, goldenScore, poolScores, evaluateGate, BAR, normalizeRule, builtOnSummary } from '../scripts/census.mjs';


// Every temp dir a test makes is removed when the file's tests end.
const made = [];
after(() => { for (const d of made) fs.rmSync(d, { recursive: true, force: true }); });
const tmp = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'dbk-census-')); made.push(d); return d; };
const part = (project, relation, o = {}) => ({ id: `${project}:c:${relation}`, project, relation, kind: 'table', stack: 'react', capabilities: [], ...o });

test('lastJsonBlock takes the final block and survives bad JSON', () => {
  assert.deepEqual(lastJsonBlock('```json\n{"a":1}\n```\ntext\n```json\n{"a":2}\n```'), { a: 2 });
  assert.equal(lastJsonBlock('```json\n{nope\n```'), null);
  assert.equal(lastJsonBlock('no block'), null);
});

test('anchor: exact, moved, missing, and a path escaping its root', () => {
  const root = path.join(tmp(), 'root'); // nested, so the escaping file below stays inside the temp dir
  fs.mkdirSync(root);
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
  const harm = { trigger: 'T', harm: 'a reviewer sees stale rows', guards: 'stale rows after a failed load' };
  const out = applyRejudge(census, [
    { id: 'a', verdict: 'reinvents', rule: 'a real rule', ...harm },
    { id: 'b', verdict: 'reinvents', rule: 'an invented rule', ...harm },
    { id: 'c', verdict: 'not-governed', why: 'scope: terminal output' },
    { id: 'd', verdict: 'follows' },
    { id: 'z', verdict: 'not-governed' },
  ], (p, rule) => rule === 'a real rule', (p, q) => q === 'T');
  assert.deepEqual(out.rejudge, { checked: 4, upheld: 1, follows: 1, notGoverned: 1, unbacked: 1, noHarm: 0, unchecked: 1 });
  assert.equal(out.parts[0].trigger, 'T');
  const by = Object.fromEntries(out.parts.map((p) => [p.id, p]));
  assert.equal(by.a.relation, 'reinvents');
  assert.deepEqual(by.a.missed, ['a real rule']);
  assert.equal(by.b.relation, 'unverified', 'a claim nobody could back is not a clean bill');
  assert.equal(by.c.relation, 'not-governed');
  assert.equal(by.c.accusedOf, 'table');
  assert.equal(by.d.relation, 'consumes');
  assert.equal(by.e.relation, 'reinvents', 'no verdict clears nothing');
  assert.equal(by.z.relation, 'consumes', 'only reinvents are rejudged');
});

test('an accusation without a checkable trigger is not believed', () => {
  const census = { parts: ['none', 'fake', 'thin', 'far', 'ok'].map((id) => part('p', 'reinvents', { id, file: 'src/T.tsx' })) };
  const seen = [];
  const codeFound = (p, q, file) => { seen.push(file); return q === 'fetch(url)' && (file === 'src/T.tsx' || file === 'src/api.ts'); };
  const out = applyRejudge(census, [
    { id: 'none', verdict: 'reinvents', rule: 'R', harm: 'a user waits on a frozen table', guards: 'a frozen table while rows load' },
    { id: 'fake', verdict: 'reinvents', rule: 'R', trigger: 'invented()', harm: 'a user waits on a frozen table', guards: 'a frozen table while rows load' },
    { id: 'thin', verdict: 'reinvents', rule: 'R', trigger: 'fetch(url)', harm: 'bad' },
    { id: 'far', verdict: 'reinvents', rule: 'R', trigger: 'fetch(url)', triggerFile: 'src\\api.ts:12', harm: 'a user waits on a frozen table', guards: 'a frozen table while rows load' },
    { id: 'ok', verdict: 'reinvents', rule: 'R', trigger: 'fetch(url)', harm: 'a user waits on a frozen table', guards: 'a frozen table while rows load' },
  ], () => true, codeFound);
  assert.deepEqual([out.rejudge.upheld, out.rejudge.noHarm], [2, 3]);
  const by = Object.fromEntries(out.parts.map((p) => [p.id, p]));
  assert.equal(by.none.relation, 'unverified');
  assert.equal(by.fake.rejudged, 'no-harm');
  assert.equal(by.far.triggerFile, 'src\\api.ts:12');
  assert.ok(seen.includes('src/api.ts'), 'a trigger file is normalized before it is read');
  const rep = applyRepeat({ parts: [{ ...by.ok }, { ...by.far, id: 'far2' }] }, [{ id: 'ok', verdict: 'reinvents', rule: 'R' }, { id: 'far2', verdict: 'reinvents', rule: 'R', trigger: 'fetch(url)', harm: 'a user waits on a frozen table', guards: 'a frozen table while rows load' }], () => true, codeFound);
  assert.deepEqual(rep.repeat, { checked: 2, agreed: 1, contested: 1, unchecked: 0 }, 'the second judge must show the harm too');
});

test('a rule quote survives the shell turning an em dash into a hyphen', () => {
  assert.equal(normalizeRule('restores it \u2014 overlay gone'), normalizeRule('restores it - overlay gone'));
  assert.equal(normalizeRule('restores it \u2014 overlay gone'), normalizeRule('restores it ? overlay gone'));
});

test('a code quote survives a mangled character, but not a line that is not there', () => {
  const root = tmp();
  fs.writeFileSync(path.join(root, 'a.tsx'), '  <td>{ticks ? `${d.score} \u00b7 ${ticks.line}` : d.score}</td>\n');
  assert.equal(quotedInFile(root, 'a.tsx', '<td>{ticks ? `${d.score} \u0007 ${ticks.line}` : d.score}</td>'), true);
  assert.equal(quotedInFile(root, 'a.tsx', '<td>{somethingElse}</td>'), false);
  assert.equal(quotedInFile(root, '../a.tsx', '<td>'), false);
});

test('an accusation may quote only its accuse list, while a compliment may quote the whole standard', () => {
  const dir = tmp();
  fs.mkdirSync(path.join(dir, 'techniques'));
  fs.writeFileSync(path.join(dir, 'table.md'), 'Real table semantics with a caption that names the data.\n');
  fs.writeFileSync(path.join(dir, 'techniques', 'pagination.md'), 'A table without a bound on its row window has decided to fail.\n');
  const found = makeRuleFound({ x: { follow: [dir], accuse: [path.join(dir, 'techniques', 'pagination.md')] }, y: [dir] });
  assert.equal(found({ id: 'x' }, 'A table without a bound on its row window has decided to fail.'), true);
  assert.equal(found({ id: 'x' }, 'Real table semantics with a caption that names the data.'), false);
  assert.equal(found({ id: 'x' }, 'Real table semantics with a caption that names the data.', 'follow'), true);
  assert.equal(found({ id: 'y' }, 'Real table semantics with a caption that names the data.'), true, 'a plain list is both');
});

test('a part merged away still scores through the row that absorbed it', () => {
  const merged = dedupe({ parts: ['1', '2'].map((id) => part('p', 'reinvents', { id, file: 'a', name: 'n', anchor: 'exact' })) });
  const s = goldenScore(merged, [{ id: '1', accept: ['reinvents'] }, { id: '2', accept: ['reinvents'] }]);
  assert.equal(s.correct, 2);
});

test('normalizeRule ignores markup and line wrapping', () => {
  assert.equal(normalizeRule('A **list** when\n  there is `one`'), normalizeRule('a list when there is one'));
});

test('a salt draws a different sample', () => {
  const ps = [...Array(40).keys()].map((i) => part('a', 'reinvents', { id: `a:${i}` }));
  assert.notDeepEqual(sample(ps, 5).map((p) => p.id), sample(ps, 5, 'r2').map((p) => p.id));
});

test('dedupe keeps the accusing row and flags a part two surveys read differently', () => {
  const row = (id, relation, name = 'WhyChip') => part('p', relation, { id, file: 'a.tsx', name, anchor: 'exact' });
  const out = dedupe({ parts: [row('1', 'consumes'), row('2', 'reinvents'), row('3', 'reinvents', 'other'), row('4', 'reinvents', 'other')] });
  assert.equal(out.parts.length, 2);
  assert.deepEqual(out.deduped, { merged: 2, disputed: 1 });
  assert.equal(out.parts[0].id, '2');
  assert.deepEqual(out.parts[0].disputed, ['consumes', 'reinvents']);
  assert.equal(out.parts[1].disputed, undefined);
});

test('a framework primitive is not a shared part', () => {
  assert.equal(isSharedPart('react/useMemo'), false);
  assert.equal(isSharedPart('next/dynamic; react/Suspense'), false);
  assert.equal(isSharedPart('react/Suspense, src/components/shared/OrgTabGap'), true);
  assert.equal(isSharedPart('@react-pdf/renderer'), true);
  assert.equal(isSharedPart(null), false);
});

test('confirm needs a real rule and a real line to keep a consumes', () => {
  const ids = ['ok', 'norule', 'nocode', 'breaks', 'hook', 'kit', 'none'];
  const parts = ids.map((id) => part('p', 'consumes', { id, subject: 'table' }));
  parts[4].builtOn = 'react/useMemo'; parts[5].builtOn = 'src/kit/DataTable';
  parts.push(part('p', 'consumes', { id: 'thin', builtOn: 'src/kit/Modal', subject: null }));
  const out = applyConfirm({ parts }, [
    { id: 'ok', verdict: 'follows', rule: 'R', evidence: 'E' }, { id: 'norule', verdict: 'follows', rule: 'bad', evidence: 'E' },
    { id: 'nocode', verdict: 'follows', rule: 'R', evidence: 'bad' }, { id: 'breaks', verdict: 'reinvents', rule: 'R', trigger: 'E', harm: 'a caller gets a silent zero', guards: 'a failure read as zero' },
    { id: 'hook', verdict: 'not-governed' }, { id: 'kit', verdict: 'not-governed' }, { id: 'thin', verdict: 'not-governed' },
  ], (p, r) => r === 'R', (p, q) => q === 'E');
  const by = Object.fromEntries(out.parts.map((p) => [p.id, p]));
  assert.deepEqual(out.confirm, { checked: 6, confirmed: 1, reinvents: 1, builtOn: 1, notGoverned: 1, unbacked: 2, noHarm: 0, unchecked: 1 });
  assert.equal(by.ok.relation, 'consumes');
  assert.equal(by.norule.relation, 'unverified');
  assert.equal(by.nocode.relation, 'unverified');
  assert.equal(by.breaks.relation, 'reinvents');
  assert.equal(by.hook.relation, 'not-governed');
  assert.equal(by.kit.relation, 'consumes');
  assert.equal(by.kit.subject, null);
  assert.equal(by.thin.confirmed, undefined, 'a thin use with no subject is not sent to confirm');
  assert.equal(by.none.relation, 'consumes', 'no verdict clears nothing');
});

test('a second judge must agree, with a verifiable rule, to keep an accusation', () => {
  const parts = ['a', 'b', 'c', 'd'].map((id) => part('p', 'reinvents', { id, rejudged: 'upheld' })).concat(part('p', 'reinvents', { id: 'old' }));
  const h = { trigger: 'T', harm: 'a caller gets a silent zero', guards: 'a failure read as zero' };
  const out = applyRepeat({ parts }, [{ id: 'a', verdict: 'reinvents', rule: 'R', ...h }, { id: 'b', verdict: 'not-governed' }, { id: 'c', verdict: 'reinvents', rule: 'bad', ...h }, { id: 'old', verdict: 'not-governed' }], (p, r) => r === 'R', (p, q) => q === 'T');
  assert.deepEqual(out.repeat, { checked: 3, agreed: 1, contested: 2, unchecked: 1 });
  const by = Object.fromEntries(out.parts.map((p) => [p.id, p.relation]));
  assert.deepEqual(by, { a: 'reinvents', b: 'unverified', c: 'unverified', d: 'reinvents', old: 'reinvents' });
});

test('a golden row needs a truth when the audit disagreed, and replays the survey claim', () => {
  const p = part('p', 'not-governed', { id: 'x', surveyRelation: 'reinvents', surveySubject: 'table', surveyMissed: ['m'] });
  assert.throws(() => goldenRow(p, 'disagree', undefined), /no truth/);
  const row = goldenRow(p, 'disagree', ['reinvents']);
  assert.deepEqual([row.relation, row.subject, row.accept], ['reinvents', 'table', ['reinvents']]);
  assert.deepEqual(goldenRow(p, 'agree').accept, ['not-governed']);
  assert.equal(goldenCensus([row]).parts[0].accept, undefined, 'the answer never reaches the judges');
});

test('an accusation that does not name what its rule guards against is not believed', () => {
  const out = applyRejudge({ parts: [part('p', 'reinvents', { id: 'a' })] }, [{ id: 'a', verdict: 'reinvents', rule: 'R', trigger: 'T', harm: 'a reviewer sees stale rows' }], () => true, (p, q) => q === 'T');
  assert.equal(out.rejudge.noHarm, 1);
});

test('a borderline golden row needs its acceptable answers, and one without them is set aside', () => {
  const p = part('p', 'unverified', { id: 'x' });
  assert.throws(() => goldenRow(p, 'agree'), /borderline/);
  assert.deepEqual(goldenRow(p, 'agree', ['not-governed', 'reinvents']).accept, ['not-governed', 'reinvents']);
  const s = goldenScore({ parts: [part('p', 'consumes', { id: 'x' }), part('p', 'consumes', { id: 'y' })] }, [{ id: 'x', accept: ['unverified'] }, { id: 'y', accept: ['consumes'] }]);
  assert.deepEqual([s.rows, s.borderline, s.correct, s.accuracy], [1, 1, 1, 1]);
});

test('a settling judge counts only when backed, never accuses, and unsure stays unsettled', () => {
  const ids = ['acc', 'accNoTrace', 'fol', 'folNoLine', 'ng', 'ngVague', 'unsure', 'none'];
  const parts = ids.map((id) => part('p', 'unverified', { id, subject: null, accusedOf: 'retry-backoff' }));
  const out = applySettle({ parts }, [
    { id: 'acc', verdict: 'reinvents', rule: 'R', trigger: 'T', harm: 'a caller gets a silent zero', guards: 'a failure read as zero' },
    { id: 'accNoTrace', verdict: 'reinvents', rule: 'R' },
    { id: 'fol', verdict: 'follows', rule: 'R', evidence: 'E' },
    { id: 'folNoLine', verdict: 'follows', rule: 'R', evidence: 'nope' },
    { id: 'ng', verdict: 'not-governed', why: 'scope: a CLI that prints and exits' },
    { id: 'ngVague', verdict: 'not-governed', why: 'does not apply' },
    { id: 'unsure', verdict: 'unsure', why: 'depends on how many repos an org has' },
  ], (p, r) => r === 'R', (p, q) => q === 'T' || q === 'E');
  assert.deepEqual(out.settle, { checked: 7, wouldAccuse: 2, follows: 1, notGoverned: 1, unsure: 1, unbacked: 2, unchecked: 1 });
  const by = Object.fromEntries(out.parts.map((p) => [p.id, p]));
  assert.equal(by.acc.relation, 'unverified', 'a third judge never makes an accusation');
  assert.equal(by.acc.settled, 'would-accuse');
  assert.equal(by.fol.relation, 'consumes');
  assert.equal(by.ng.relation, 'not-governed');
  for (const id of ['accNoTrace', 'folNoLine', 'ngVague', 'unsure', 'none']) assert.equal(by[id].relation, 'unverified', id);
});

test('the gate holds the unverified pile to its own limit', () => {
  const audit = {};
  const parts = [];
  for (const r of ['reinvents', 'consumes', 'unverified']) for (let i = 0; i < 10; i++) { audit[`${r}${i}`] = r === 'unverified' && i < 4 ? 'disagree' : 'agree'; parts.push(part('p', r, { id: `${r}${i}` })); }
  const g = evaluateGate({ parts }, audit, { runs: 3, accuracy: 0.9, inboundPrecision: 1 });
  assert.deepEqual(g.failures, ['unverified 4/10 wrong, limit 30%']);
});

test('golden score: an abstention is not correct, and no-standard equals not-governed', () => {
  const rows = [{ id: 'a', accept: ['reinvents'] }, { id: 'b', accept: ['no-standard'] }, { id: 'c', accept: ['reinvents'] }, { id: 'd', accept: ['consumes'] }];
  const census = { parts: [part('p', 'reinvents', { id: 'a' }), part('p', 'not-governed', { id: 'b' }), part('p', 'unverified', { id: 'c' }), part('p', 'reinvents', { id: 'd' })] };
  const s = goldenScore(census, rows);
  assert.deepEqual([s.correct, s.abstained, s.wrong.length, s.accuracy], [2, 1, 1, 0.5]);
  assert.equal(s.inboundPrecision, 0.5);
});

test('the gate names each failure and passes only a full, accurate audit', () => {
  const mk = (rel, n, bad) => Object.fromEntries([...Array(n).keys()].map((i) => [`${rel}${i}`, i < bad ? 'disagree' : 'agree']));
  const census = (a) => ({ parts: Object.keys(a).map((id) => part('p', id.replace(/\d+$/, ''), { id })) });
  const golden = { runs: 3, accuracy: 0.9, inboundPrecision: 1 };
  const good = { ...mk('reinvents', 10, 1), ...mk('consumes', 10, 2), ...mk('no-standard', 10, 2) };
  assert.equal(evaluateGate(census(good), good, golden).pass, true);
  const small = { ...mk('reinvents', 8, 0), ...mk('consumes', 8, 0) };
  assert.match(evaluateGate(census(small), small, golden).failures.join(), /audited 16/);
  const bad = { ...good, ...mk('reinvents', 10, 2) };
  assert.match(evaluateGate(census(bad), bad, golden).failures.join(), /reinvents 2\/10/);
  assert.match(evaluateGate(census(good), good, null).failures.join(), /no golden/);
  assert.match(evaluateGate(census(good), good, { runs: 3, accuracy: 0.5, inboundPrecision: 1 }).failures.join(), /golden accuracy/);
  assert.equal(BAR.minAudited, 30);
});

test('sampleByRelation fills every relation up to n', () => {
  const ps = [...Array(12).keys()].map((i) => part('a', 'reinvents', { id: `r${i}` })).concat(part('a', 'unverified', { id: 'u' }));
  const got = sampleByRelation(ps, 5);
  assert.equal(got.filter((p) => p.relation === 'reinvents').length, 5);
  assert.equal(got.filter((p) => p.relation === 'unverified').length, 1);
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
  assert.deepEqual(g.a, { parts: 4, consumes: 1, inbound: 1, outbound: 2, local: 0, unverified: 0 });
  assert.deepEqual(gaps([part('a', 'not-governed'), part('a', 'unverified')]).a, { parts: 2, consumes: 0, inbound: 0, outbound: 0, local: 1, unverified: 1 });
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

test('poolScores reads three runs row by row, and the gate wants three', () => {
  const s = (correct, inbound, inboundCorrect) => ({ rows: 100, correct, abstained: 0, inbound, inboundCorrect, accuracy: correct / 100 });
  const p = poolScores([s(83, 24, 20), s(86, 25, 23), s(83, 25, 22)]);
  assert.equal(p.runs, 3);
  assert.equal(p.correct, 252);
  assert.equal(p.accuracy, 252 / 300);
  assert.equal(p.inboundPrecision, 65 / 74);
  const one = { ...s(90, 10, 10), inboundPrecision: 1 };
  const parts = [];
  assert.match(evaluateGate({ parts }, {}, one).failures.join(), /from 1 run.s., need 3/);
  assert.doesNotMatch(evaluateGate({ parts }, {}, { ...one, runs: 3 }).failures.join(), /fresh runs/);
});
