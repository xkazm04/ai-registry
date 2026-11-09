// query-misses: the join of a project's query log with its consult log, on fixture logs
// with fixed timestamps (no wall clock anywhere in the classification).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { classify, parseJsonl, report, benchCandidate } from '../query-misses.mjs';

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'query-misses.mjs');

function tmp(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'query-misses-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
const q = (ts, terms, hits) => ({ ts, terms: [terms], domain: null, top: 8, hits, empty: !hits.length, from: 'registry-mcp' });
const c = (ts, bundle, subject, technique = null, extra = {}) => ({ ts, bundle, subjects: [subject], techniques: technique ? [technique] : [], deviations: null, from: 'registry-query', ...extra });
const jsonl = (rows) => rows.map((r) => JSON.stringify(r)).join('\n') + '\n';

const QUERIES = [
  q('2026-11-09T10:00:00Z', 'paging cursor', ['se/table/pagination', 'se/table', 'se/list']),          // hit@1 (read at 10:01)
  q('2026-11-09T10:05:00Z', 'focus return', ['se/modal-stack', 'se/accessibility/focus']),            // hit@2 (read at 10:05, same second)
  q('2026-11-09T10:20:00Z', 'option injection', ['se/prompt-safety', 'se/table']),                     // miss -> subprocess-lifecycle
  q('2026-11-09T10:40:00Z', 'graceful drain', ['se/a']),                                              // requery (another query at 10:42 before any read)
  q('2026-11-09T10:42:00Z', 'drain inflight on sigterm', ['se/b']),                                    // abandoned (next event 10:58 is outside 10 min)
  q('2026-11-09T10:58:00Z', 'nothing', []),                                                           // abandoned (read at 11:09 is 11 min later)
];
const CONSULTS = [
  c('2026-11-09T10:01:00Z', 'se', 'table', 'pagination'),
  c('2026-11-09T10:05:00Z', 'se', 'accessibility'),
  c('2026-11-09T10:21:30Z', 'se', 'table', null, { outcome: 'missed' }),   // consult-check's miss record: not a read
  c('2026-11-09T10:22:00Z', 'se', 'subprocess-lifecycle', 'spawn-contract'),
  c('2026-11-09T11:09:00Z', 'se', 'table'),
];

test('classify: hit@k, miss with its behaviour label, requery, abandoned', () => {
  const { rows, counts } = classify(parseJsonl(jsonl(QUERIES)).rows, parseJsonl(jsonl(CONSULTS)).rows, { windowMin: 10 });
  assert.deepEqual(rows.map((r) => [r.terms[0], r.class, r.rank]), [
    ['paging cursor', 'hit', 1],
    ['focus return', 'hit', 2],
    ['option injection', 'miss', null],
    ['graceful drain', 'requery', null],
    ['drain inflight on sigterm', 'abandoned', null],
    ['nothing', 'abandoned', null],
  ]);
  assert.deepEqual(rows[2].read, { domain: 'se', subject: 'subprocess-lifecycle', technique: 'spawn-contract' }, 'the outcome:"missed" row is skipped; the label is the real read');
  assert.equal(rows[2].after_s, 120);
  assert.deepEqual(counts, { queries: 6, hit: 2, hit_at: { 1: 1, 2: 1 }, miss: 1, requery: 1, abandoned: 2 });
});

test('the window is a parameter, not the wall clock: widening it turns an abandoned query into a labelled miss', () => {
  const { rows } = classify(parseJsonl(jsonl(QUERIES)).rows, parseJsonl(jsonl(CONSULTS)).rows, { windowMin: 12 });
  assert.equal(rows[5].class, 'miss', 'an empty answer followed by a read of table at +11 min');
  assert.equal(rows[5].read.subject, 'table');
  assert.equal(rows[4].class, 'abandoned', 'the next query at +16 min is still outside the window');
  assert.equal(classify(parseJsonl(jsonl(QUERIES)).rows, parseJsonl(jsonl(CONSULTS)).rows, { windowMin: 20 }).rows[4].class, 'requery');
});

test('a read logged before the query, or out of file order, is not its answer', () => {
  const qs = parseJsonl(jsonl([q('2026-11-09T09:00:10Z', 'x', ['se/table'])])).rows;
  const cs = parseJsonl(jsonl([c('2026-11-09T09:00:05Z', 'se', 'table'), c('2026-11-09T09:30:00Z', 'se', 'table')])).rows;
  assert.equal(classify(qs, cs, { windowMin: 10 }).rows[0].class, 'abandoned');
});

test('benchCandidate shapes a labelled miss as a routing-bench row for screening', () => {
  const { rows } = classify(parseJsonl(jsonl(QUERIES)).rows, parseJsonl(jsonl(CONSULTS)).rows);
  const cand = benchCandidate(rows[2]);
  assert.deepEqual(cand.expect, { domain: 'se', subject: 'subprocess-lifecycle', technique: 'spawn-contract', alt_subjects: [] });
  assert.deepEqual(cand.terms, ['option injection']);
  assert.match(cand.note, /Screen and scrub/);
});

test('CLI: report from fixture logs, malformed lines counted; exit 2 when a log is absent or usage is bad', (t) => {
  const proj = tmp(t);
  fs.mkdirSync(path.join(proj, '.ai'));
  const run = (...a) => spawnSync(process.execPath, [SCRIPT, ...a], { encoding: 'utf8' });

  let r = run('--project-root', proj);
  assert.equal(r.status, 2, 'no logs at all');
  assert.match(r.stderr, /queries\.local\.jsonl and \.ai\/consults\.jsonl absent/);

  fs.writeFileSync(path.join(proj, '.ai', 'queries.local.jsonl'), jsonl(QUERIES) + 'not json\n');
  r = run('--project-root', proj);
  assert.equal(r.status, 2, 'consults absent');

  fs.writeFileSync(path.join(proj, '.ai', 'consults.jsonl'), jsonl(CONSULTS));
  r = run('--project-root', proj, '--json');
  assert.equal(r.status, 0, r.stderr);
  const rep = JSON.parse(r.stdout);
  assert.equal(rep.schema, 'query-misses/1');
  assert.deepEqual(rep.counts, { queries: 6, hit: 2, hit_at: { 1: 1, 2: 1 }, miss: 1, requery: 1, abandoned: 2 });
  assert.equal(rep.malformed.queries, 1);
  assert.equal(rep.candidates.length, 1);
  assert.deepEqual(report(proj).counts, rep.counts);

  r = run('--project-root', proj);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /\bmiss\s+1\s/);
  assert.match(r.stdout, /subprocess-lifecycle/);

  assert.equal(run().status, 2, 'no --project-root');
  assert.equal(run('--project-root', proj, '--window-min', '0').status, 2);
  assert.equal(run('--project-root', proj, '--bogus').status, 2);
  const before = fs.readdirSync(path.join(proj, '.ai')).sort();
  run('--project-root', proj);
  assert.deepEqual(fs.readdirSync(path.join(proj, '.ai')).sort(), before, 'writes nothing');
});
