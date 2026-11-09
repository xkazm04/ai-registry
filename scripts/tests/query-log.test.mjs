// The front door's query log: one row per search, written only into a subscribed project
// that ignores the file, and never at the cost of the search itself.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { QUERY_LOG_REL, hitAddress, queryRow, logQuery, queryLogTarget, queryLoggingDisabled } from '../lib/query-log.mjs';
import { realHandlers } from '../registry-mcp.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const CLI = path.join(ROOT, 'scripts', 'registry-query.mjs');
const ROW_KEYS = ['domain', 'empty', 'from', 'hits', 'terms', 'top', 'ts'];

function tmp(t) {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'query-log-test-')));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
/** A git checkout; `consumer` adds .ai/manifest.yaml, `ignored` adds the managed .gitignore line. */
function repo(t, { consumer = true, ignored = true } = {}) {
  const dir = tmp(t);
  assert.equal(spawnSync('git', ['-C', dir, 'init', '-q'], { encoding: 'utf8' }).status, 0);
  if (consumer) {
    fs.mkdirSync(path.join(dir, '.ai'));
    fs.writeFileSync(path.join(dir, '.ai', 'manifest.yaml'), 'knowledge:\n  domains: [software-engineering]\n');
  }
  if (ignored) fs.writeFileSync(path.join(dir, '.gitignore'), `/${QUERY_LOG_REL}\n`);
  return dir;
}
const rows = (dir) => {
  const f = path.join(dir, ...QUERY_LOG_REL.split('/'));
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
};
const cli = (cwd, args, env = {}) => spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8', env: { ...process.env, REGISTRY_CONSULT_LOG: '', REGISTRY_QUERY_LOG: '', ...env } });
const fixedNow = () => new Date('2026-11-09T10:00:00.123Z');
const RESULT = { hits: [
  { kind: 'technique', domain: 'software-engineering', subject: 'table', technique: 'pagination' },
  { kind: 'law', domain: 'software-engineering', subject: null, technique: null },
  { kind: 'subject', domain: 'software-engineering', subject: 'table', technique: null },
  ...['a', 'b', 'c', 'd'].map((s) => ({ kind: 'subject', domain: 'd', subject: s, technique: null })),
] };

test('queryRow: the documented shape, slug addresses only, at most five hits, laws left out', () => {
  const r = queryRow({ terms: ['paging rows'], domain: 'software-engineering', top: 8, result: RESULT, from: 'registry-mcp', now: fixedNow });
  assert.deepEqual(Object.keys(r).sort(), ROW_KEYS);
  assert.equal(r.ts, '2026-11-09T10:00:00Z');
  assert.deepEqual(r.hits, ['software-engineering/table/pagination', 'software-engineering/table', 'd/a', 'd/b', 'd/c']);
  assert.equal(r.empty, false);
  assert.equal(queryRow({ terms: 'x', result: { hits: [] }, from: 'registry-query', now: fixedNow }).empty, true);
  assert.equal(queryRow({ terms: 'x', result: { hits: [] }, from: 'registry-query', now: fixedNow }).domain, null);
  assert.equal(hitAddress({ kind: 'law', domain: 'x', subject: null }), null);
});

test('opt-out switches: REGISTRY_QUERY_LOG, and REGISTRY_CONSULT_LOG silences both', () => {
  for (const v of ['0', 'false', 'off', 'OFF']) {
    assert.equal(queryLoggingDisabled({ REGISTRY_QUERY_LOG: v }), true, v);
    assert.equal(queryLoggingDisabled({ REGISTRY_CONSULT_LOG: v }), true, v);
  }
  assert.equal(queryLoggingDisabled({}), false);
  assert.equal(queryLoggingDisabled({ REGISTRY_QUERY_LOG: '1' }), false);
});

test('logQuery writes only into a subscribed checkout that ignores the file', (t) => {
  const args = { env: {}, now: fixedNow, terms: ['x'], top: 8, result: RESULT, from: 'registry-query' };
  const ok = repo(t);
  assert.ok(logQuery({ ...args, cwd: ok }));
  assert.equal(rows(ok).length, 1);

  const noManifest = repo(t, { consumer: false });
  assert.equal(logQuery({ ...args, cwd: noManifest }), null);
  assert.equal(fs.existsSync(path.join(noManifest, '.ai')), false, 'no stray .ai/ in a repo that never subscribed');

  const notIgnored = repo(t, { ignored: false });
  assert.equal(queryLogTarget({ cwd: notIgnored, env: {} }), null);
  assert.equal(logQuery({ ...args, cwd: notIgnored }), null);
  assert.equal(rows(notIgnored).length, 0, 'never a stray untracked file');
  const st = spawnSync('git', ['-C', notIgnored, 'status', '--porcelain', '--untracked-files=all'], { encoding: 'utf8' }).stdout;
  assert.doesNotMatch(st, /queries/);

  assert.equal(logQuery({ ...args, cwd: ok, env: { REGISTRY_QUERY_LOG: 'off' } }), null);
  assert.equal(logQuery({ ...args, cwd: ok, env: { REGISTRY_CONSULT_LOG: '0' } }), null);
  assert.equal(logQuery({ ...args, cwd: ok, from: 'somewhere-else' }), null);
  assert.equal(rows(ok).length, 1);

  const outside = tmp(t);
  fs.mkdirSync(path.join(outside, '.ai'));
  fs.writeFileSync(path.join(outside, '.ai', 'manifest.yaml'), '');
  assert.equal(queryLogTarget({ cwd: outside, env: { ...process.env, GIT_CEILING_DIRECTORIES: path.dirname(outside) } }), null, 'outside a git checkout');
});

test('a write that fails returns null and never throws', (t) => {
  const proj = repo(t);
  fs.mkdirSync(path.join(proj, ...QUERY_LOG_REL.split('/'))); // the log path is a directory: append throws
  assert.equal(logQuery({ cwd: proj, env: {}, terms: ['x'], top: 8, result: RESULT, from: 'registry-query' }), null);
});

test('MCP registry_query logs one row per search into the caller project; reads do not', async (t) => {
  const proj = repo(t);
  const h = realHandlers(ROOT, { cwd: () => proj, env: {}, log: () => {} });
  const r = await h.registry_query({ terms: 'paged list cursor offset versus keyset', domain: 'software-engineering', top: 3 });
  assert.notEqual(r.isError, true);
  const got = rows(proj);
  assert.equal(got.length, 1);
  assert.deepEqual(Object.keys(got[0]).sort(), ROW_KEYS);
  assert.deepEqual(got[0].terms, ['paged list cursor offset versus keyset']);
  assert.equal(got[0].domain, 'software-engineering');
  assert.equal(got[0].top, 3);
  assert.equal(got[0].from, 'registry-mcp');
  assert.equal(got[0].empty, r.structuredContent.hits.length === 0);
  assert.ok(got[0].hits.length <= 5);
  assert.ok(got[0].hits.every((a) => /^[a-z0-9-]+\/[a-z0-9-]+(\/[a-z0-9-]+)?$/.test(a)), `addresses, never paths: ${got[0].hits}`);
  await h.registry_query({ terms: ['a', 'b'] });
  assert.equal(rows(proj).length, 2);
  assert.equal(rows(proj)[1].top, 8, 'the default top is recorded');
  await h.registry_read({ path: 'knowledge/software-engineering/ui-surfaces/data-display/table/techniques/client-server-split.md' });
  assert.equal(rows(proj).length, 2, 'a read is a consult, not a query');

  const off = realHandlers(ROOT, { cwd: () => proj, env: { REGISTRY_QUERY_LOG: '0' }, log: () => {} });
  await off.registry_query({ terms: 'table' });
  assert.equal(rows(proj).length, 2, 'opt-out');

  const plain = repo(t, { consumer: false });
  await realHandlers(ROOT, { cwd: () => plain, env: {}, log: () => {} }).registry_query({ terms: 'table' });
  assert.equal(fs.existsSync(path.join(plain, '.ai')), false, 'no manifest, no row');

  const broken = repo(t);
  fs.mkdirSync(path.join(broken, ...QUERY_LOG_REL.split('/')));
  const answered = await realHandlers(ROOT, { cwd: () => broken, env: {}, log: () => {} }).registry_query({ terms: 'table' });
  assert.notEqual(answered.isError, true, 'a failed write never fails the search');
});

test('CLI plain query logs one row; --read, --subject, opt-out, unignored path and no manifest do not', (t) => {
  const proj = repo(t);
  const r = cli(proj, ['paged list cursor offset versus keyset', '--top', '4']);
  assert.equal(r.status, 0, r.stderr);
  const got = rows(proj);
  assert.equal(got.length, 1);
  assert.deepEqual(Object.keys(got[0]).sort(), ROW_KEYS);
  assert.equal(got[0].from, 'registry-query');
  assert.equal(got[0].top, 4);
  assert.equal(got[0].domain, null);

  assert.equal(cli(proj, ['--subject', 'table']).status, 0);
  assert.equal(cli(proj, ['--read', 'knowledge/software-engineering/ui-surfaces/data-display/table/techniques/client-server-split.md', '--max-tokens', '50']).status, 0);
  assert.equal(rows(proj).length, 1, 'opening a document is not a search');
  assert.equal(cli(proj, ['table'], { REGISTRY_QUERY_LOG: '0' }).status, 0);
  assert.equal(rows(proj).length, 1, 'opt-out');

  const notIgnored = repo(t, { ignored: false });
  assert.equal(cli(notIgnored, ['table']).status, 0);
  assert.equal(rows(notIgnored).length, 0, 'path not ignored');
  const plain = repo(t, { consumer: false });
  assert.equal(cli(plain, ['table']).status, 0);
  assert.equal(fs.existsSync(path.join(plain, '.ai')), false, 'no manifest');

  const broken = repo(t);
  fs.mkdirSync(path.join(broken, ...QUERY_LOG_REL.split('/')));
  const b = cli(broken, ['table']);
  assert.equal(b.status, 0, 'a failed write never fails the search');
  assert.match(b.stdout, /hit\(s\)|no match/);
});
