// The pure half of /straighten's map instruments: which modified maps a run may commit,
// which commits would rewrite line endings, and whether a parallel merge stamped what
// conform section 4 requires (conform LESSONS 1.8.2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canonical, sameGenerated, parseMapText, judgementOf, judgementDiff, classifyMap,
  parseLsFilesEol, eolHazard, subjectIndex, verifyMerged,
} from '../scripts/map-compare.mjs';

const pair = (subject, extra = {}) => ({ subject, bundle: 'se', score: 100, why: ['x'], digest: 'd-1', revision: 3, confidence: 'strong', state: 'unknown', ...extra });
const map = ({ generatedAt = '2026-10-14T07:00:00Z', projectSha = 'aaa', stats = { staleVerdicts: 0 }, contexts, orphans = [] } = {}) => ({
  schema: 'rkb-registry-map/1', project: 'p', generatedAt, projectSha, bundleDigests: { se: 'b-1' }, stats,
  contexts: contexts ?? [
    { context: 'c1', name: 'Auth', subjects: [pair('rate-limiting', { state: 'deviation', evidence: 'src/a.ts:4 x', evaluatedAt: '2026-10-01', evaluatedAgainst: 'd-1', evaluatedRevision: 3 }), pair('logging')] },
    { context: 'c2', name: 'Billing', subjects: [pair('idempotency')] },
  ],
  orphans,
});

test('canonical ignores key order at every depth', () => {
  assert.equal(canonical({ b: 1, a: { d: [1, { y: 2, x: 1 }], c: null } }), canonical({ a: { c: null, d: [1, { x: 1, y: 2 }] }, b: 1 }));
  assert.notEqual(canonical({ a: [1, 2] }), canonical({ a: [2, 1] }));
});

test('parseMapText reads a BOM and CRLF copy as the same document', () => {
  const doc = map();
  const text = '﻿' + JSON.stringify(doc, null, 2).replace(/\n/g, '\r\n');
  assert.ok(sameGenerated(parseMapText(text), doc));
});

test('a working copy equal to HEAD apart from the stamps is current', () => {
  const head = map();
  const working = map({ generatedAt: '2026-10-14T09:00:00Z', projectSha: 'bbb' });
  assert.equal(classifyMap({ working, rebuilt: null, head }).class, 'current');
});

test('a working copy equal to the rebuild from HEAD is generator-dirty', () => {
  const head = map({ stats: { staleVerdicts: 0 } });
  const rebuilt = map({ generatedAt: '2026-10-14T10:00:00Z', stats: { staleVerdicts: 2 } });
  const working = map({ generatedAt: '2026-10-14T08:00:00Z', stats: { staleVerdicts: 2 } });
  const r = classifyMap({ working, rebuilt, head });
  assert.equal(r.class, 'generator-dirty');
  assert.match(r.reason, /equal to a rebuild/);
});

test('generator-owned fields alone never make a map dirty (the registry moved since the fleet rebuild)', () => {
  const head = map();
  const working = map({ stats: { staleVerdicts: 6 } });
  working.contexts[0].subjects[1].score = 98.5;
  working.contexts[0].subjects[0].stale = true;
  const rebuilt = map({ stats: { staleVerdicts: 15 } });
  rebuilt.contexts[0].subjects[0].digest = 'd-2';
  rebuilt.contexts[0].subjects[0].revision = 4;
  const r = classifyMap({ working, rebuilt, head });
  assert.equal(r.class, 'generator-dirty');
  assert.match(r.reason, /only generator-owned fields differ/);
});

test('a verdict written in the working copy keeps the map dirty', () => {
  const head = map();
  const rebuilt = map();
  const working = map();
  working.contexts[1].subjects[0] = pair('idempotency', { state: 'conformant', evidence: 'src/b.ts:9 y', evaluatedAt: '2026-10-14', evaluatedAgainst: 'd-1', evaluatedRevision: 3 });
  const r = classifyMap({ working, rebuilt, head });
  assert.equal(r.class, 'dirty');
  assert.deepEqual(r.diffs.map((d) => [d.key, d.kind]), [['c2|se|idempotency', 'added']]);
});

test('a changed evidence line, a pair added by /conform and an adopted orphan are all judgement', () => {
  const base = map({ orphans: [{ context: 'gone', name: 'Old', subjects: [pair('caching', { state: 'deviation', evidence: 'src/c.ts:1 z', evaluatedAt: '2026-09-01' })] }] });
  const next = structuredClone(base);
  next.contexts[0].subjects[0].evidence = 'src/a.ts:5 moved';
  next.contexts[1].subjects.push(pair('connector-catalog', { source: 'conform' }));
  const adopted = next.orphans.pop().subjects[0];
  next.contexts[1].subjects.push({ ...adopted, source: 'conform', adoptedFrom: 'gone' });
  const kinds = Object.fromEntries(judgementDiff(judgementOf(base), judgementOf(next)).map((d) => [d.key, d.kind]));
  assert.deepEqual(kinds, {
    'c1|se|rate-limiting': 'changed',
    'orphan:gone|se|caching': 'removed',
    'c2|se|connector-catalog': 'added',
    'c2|se|caching': 'added',
  });
});

test('a modified map that cannot be rebuilt is treated as work in progress', () => {
  const head = map();
  const working = map({ stats: { staleVerdicts: 9 } });
  assert.equal(classifyMap({ working, rebuilt: null, head }).class, 'dirty');
});

test('an untracked map is generator-dirty only when it holds no judgement', () => {
  const empty = map({ contexts: [{ context: 'c1', name: 'A', subjects: [pair('x')] }] });
  assert.equal(classifyMap({ working: empty, rebuilt: null, head: null }).class, 'generator-dirty');
  assert.equal(classifyMap({ working: map(), rebuilt: null, head: null }).class, 'dirty');
});

test('parseLsFilesEol reads git ls-files --eol rows', () => {
  assert.deepEqual(parseLsFilesEol('i/lf    w/crlf  attr/text=auto        \t.ai/registry-map.json'),
    { index: 'lf', worktree: 'crlf', attr: 'text=auto', path: '.ai/registry-map.json' });
  assert.deepEqual(parseLsFilesEol('i/crlf  w/crlf  attr/                 \t.ai/registry-map.json'),
    { index: 'crlf', worktree: 'crlf', attr: '', path: '.ai/registry-map.json' });
  assert.equal(parseLsFilesEol(''), null);
});

test('eolHazard: a CRLF index or an unnormalized CRLF working copy rewrites every line', () => {
  assert.equal(eolHazard({ index: 'lf', worktree: 'lf', attr: 'text=auto' }, 'true'), null);
  assert.equal(eolHazard({ index: 'lf', worktree: 'crlf', attr: 'text=auto' }, null), null);
  assert.equal(eolHazard({ index: 'lf', worktree: 'crlf', attr: '' }, 'true'), null);
  assert.match(eolHazard({ index: 'lf', worktree: 'crlf', attr: '' }, 'false'), /store it as is/);
  assert.match(eolHazard({ index: 'lf', worktree: 'crlf', attr: '-text' }, null), /store it as is/);
  assert.match(eolHazard({ index: 'crlf', worktree: 'lf', attr: 'text=auto' }, 'true'), /rewrite every line/);
  assert.equal(eolHazard(null, 'false'), null);
});

test('verifyMerged passes rows stamped with the subject digest and revision, stale cleared', () => {
  const m = map();
  const row = m.contexts[0].subjects[0];
  Object.assign(row, { state: 'conformant', evidence: 'src/a.ts:9 fixed', evaluatedAgainst: 'd-2', evaluatedRevision: 4 });
  const index = subjectIndex({ se: { subjects: { 'rate-limiting': { digest: 'd-2', revision: 4 } } } });
  const runPairs = [{ context: 'c1', subject: 'rate-limiting', bundle: 'se', state: 'conformant', evidence: 'src/a.ts:9 fixed' }];
  const r = verifyMerged({ map: m, index, runPairs });
  assert.equal(r.pass, true);
  assert.equal(r.checked, 1);
});

test('verifyMerged fails the bundle digest, a missing revision and a leftover stale flag (the 1.8.2 defects)', () => {
  const m = map();
  const row = m.contexts[0].subjects[0];
  Object.assign(row, { state: 'conformant', evidence: 'src/a.ts:9 fixed', evaluatedAgainst: 'b-1', stale: true });
  delete row.evaluatedRevision;
  const index = subjectIndex({ se: { subjects: { 'rate-limiting': { digest: 'd-2', revision: 4 } } } });
  const r = verifyMerged({ map: m, index, runPairs: [{ context: 'Auth', subject: 'rate-limiting', state: 'conformant', evidence: 'src/a.ts:9 fixed' }] });
  assert.equal(r.pass, false);
  assert.equal(r.wrongDigest.length, 1);
  assert.equal(r.missingRevision.length, 1);
  assert.deepEqual(r.stillStale, ['rate-limiting @ Auth']);
});

test('verifyMerged lists verdicts the map does not hold as notApplied, and unknowns not at all', () => {
  const m = map();
  const index = subjectIndex({ se: { subjects: { 'rate-limiting': { digest: 'd-1', revision: 3 } } } });
  const r = verifyMerged({ map: m, index, runPairs: [
    { context: 'c1', subject: 'rate-limiting', state: 'conformant', evidence: 'src/a.ts:1 skipped by the anchor floor' },
    { context: 'c2', subject: 'idempotency', state: 'unknown', evidence: '' },
  ] });
  assert.deepEqual(r.notApplied, ['rate-limiting @ Auth']);
  assert.equal(r.checked, 0);
  assert.equal(r.pass, false, 'a wave that applied nothing is not a pass');
});
