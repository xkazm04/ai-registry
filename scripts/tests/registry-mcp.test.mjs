import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { TOOLS, SUPPORTED_PROTOCOL_VERSIONS, SERVER_VERSION, RECHECK_MS, validateArgs, ledgerArgv, realHandlers, renderResult } from '../registry-mcp.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const SCRIPT = path.join(ROOT, 'scripts', 'registry-mcp.mjs');
const TOOL_NAMES = ['registry_query', 'registry_read', 'registry_subject', 'registry_ledger'];

const rpc = (id, method, params) => ({ jsonrpc: '2.0', id, method, ...(params === undefined ? {} : { params }) });
const init = (id, protocolVersion) => rpc(id, 'initialize', { protocolVersion, capabilities: {}, clientInfo: { name: 'test', version: '0' } });

/** Spawn a server, feed it lines, close stdin; return parsed stdout lines (asserting every one is JSON-RPC). */
function session(argv, messages, { env = {}, timeout = 120_000 } = {}) {
  const input = messages.map((m) => (typeof m === 'string' ? m : JSON.stringify(m))).join('\n') + '\n';
  const r = spawnSync(process.execPath, argv, { input, encoding: 'utf8', timeout, env: { ...process.env, ...env } });
  assert.equal(r.error, undefined, `spawn failed: ${r.error}`);
  const lines = r.stdout.split('\n').filter((l) => l.length);
  const out = lines.map((l) => {
    let m;
    assert.doesNotThrow(() => { m = JSON.parse(l); }, `stdout carried a non-JSON line: ${l.slice(0, 200)}`);
    assert.equal(m.jsonrpc, '2.0', `stdout carried a non-JSON-RPC object: ${l.slice(0, 200)}`);
    assert.ok('result' in m || 'error' in m, `stdout carried something that is not a response: ${l.slice(0, 200)}`);
    return m;
  });
  return { status: r.status, stderr: r.stderr, out, byId: new Map(out.map((m) => [m.id, m])) };
}

/** A temp dir removed when the test ends: every run-tests pass used to leave three behind. */
function tempDir(t, prefix = 'registry-mcp-') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test('real server: version negotiation, tools/list, errors, and nothing but JSON-RPC on stdout', () => {
  const s = session([SCRIPT, '--root', ROOT], [
    init(1, '2025-06-18'),
    { jsonrpc: '2.0', method: 'notifications/initialized' },
    init(2, '1999-01-01'),
    rpc(3, 'tools/list', {}),
    rpc(4, 'ping'),
    rpc(5, 'resources/list', {}),
    rpc(6, 'tools/call', { name: 'registry_query', arguments: {} }),
    rpc(7, 'tools/call', { name: 'no_such_tool', arguments: {} }),
    rpc(8, 'tools/call', { name: 'registry_query', arguments: { terms: 'x', top: 0 } }),
    rpc(9, 'tools/call', { name: 'registry_read', arguments: { path: 'a.md', bogus: 1 } }),
    '{not json',
    { jsonrpc: '2.0', method: 'notifications/unknown-thing' },
    init(10, '2024-11-05'),
  ]);
  assert.equal(s.status, 0, s.stderr);

  const r1 = s.byId.get(1).result;
  assert.equal(r1.protocolVersion, '2025-06-18', 'a supported version is echoed');
  assert.deepEqual(r1.capabilities, { tools: { listChanged: false } });
  assert.deepEqual(r1.serverInfo, { name: 'ai-registry', version: SERVER_VERSION });
  assert.match(r1.instructions, /registry_query/);
  assert.equal(s.byId.get(2).result.protocolVersion, SUPPORTED_PROTOCOL_VERSIONS[0], 'an unsupported version gets the newest');
  assert.equal(s.byId.get(10).result.protocolVersion, '2024-11-05');

  const tools = s.byId.get(3).result.tools;
  assert.deepEqual(tools.map((t) => t.name), TOOL_NAMES);
  for (const t of tools) {
    assert.equal(t.inputSchema.type, 'object', `${t.name} input schema`);
    assert.ok(t.inputSchema.required.length >= 1, `${t.name} declares required params`);
    assert.ok(t.description.length > 80, `${t.name} has a description written for a choosing agent`);
  }
  assert.equal(tools[0].outputSchema.properties.schema.const, 'registry-query/1');

  assert.deepEqual(s.byId.get(4).result, {});
  assert.equal(s.byId.get(5).error.code, -32601);
  // Bad arguments are tool results the model can read and correct (MCP 2025-11-25);
  // an unknown tool is still a protocol error.
  for (const id of [6, 8, 9]) assert.equal(s.byId.get(id).result.isError, true, `request ${id}`);
  assert.match(s.byId.get(6).result.content[0].text, /terms/);
  assert.equal(s.byId.get(7).error.code, -32602);
  const parseErr = s.out.find((m) => m.id === null);
  assert.equal(parseErr.error.code, -32700);
  // 10 requests + 1 parse error; the two notifications got no reply.
  assert.equal(s.out.length, 11);
});

test('real server refuses a root with no knowledge lane, on stderr, with FATAL', (t) => {
  const tmp = tempDir(t);
  const r = spawnSync(process.execPath, [SCRIPT, '--root', tmp], { input: '', encoding: 'utf8' });
  assert.equal(r.status, 2);
  assert.equal(r.stdout, '');
  assert.match(r.stderr, /no knowledge\/ lane/);
});

test('injected fake handlers round-trip text + structuredContent through a child process', (t) => {
  const tmp = tempDir(t);
  const fixture = path.join(tmp, 'fake-server.mjs');
  fs.writeFileSync(fixture, `
import { createServer, serveStdio, guardStdout } from ${JSON.stringify(pathToFileURL(SCRIPT).href)};
guardStdout();
console.log('a stray log that must not reach stdout');
const result = { schema: 'registry-query/1', terms: ['x'], hits: [{ rank: 1, score: 2.5, kind: 'technique', domain: 'd', subject: 's', technique: 't', path: 'knowledge/d/s/techniques/t.md', gist: 'T - a gist.', use_when: ['when x'], why: ['use_when:"x"'] }], truncated: false, tokens: 40, empty_reason: null };
const handlers = {
  registry_query: async (a) => ({ content: [{ type: 'text', text: 'fake:' + JSON.stringify(a.terms) }], structuredContent: result }),
  registry_read: async () => { throw new Error('registry-query: readDoc not implemented'); },
};
await serveStdio(createServer({ handlers, log: () => {} }));
`);
  const s = session([fixture], [
    init(1, '2025-11-25'),
    rpc(2, 'tools/call', { name: 'registry_query', arguments: { terms: ['green audit', 'accessible'], top: 3 } }),
    rpc(3, 'tools/call', { name: 'registry_read', arguments: { path: 'knowledge/x.md' } }),
    rpc(4, 'tools/call', { name: 'registry_subject', arguments: { subject: 's' } }),
  ]);
  assert.equal(s.status, 0, s.stderr);
  assert.match(s.stderr, /stray log/);
  const r2 = s.byId.get(2).result;
  assert.deepEqual(r2.content, [{ type: 'text', text: 'fake:["green audit","accessible"]' }]);
  assert.equal(r2.structuredContent.hits[0].path, 'knowledge/d/s/techniques/t.md');
  assert.equal(r2.isError, undefined);
  const r3 = s.byId.get(3).result;
  assert.equal(r3.isError, true, 'a tool failure is a result, not a protocol error');
  assert.match(r3.content[0].text, /not implemented/);
  assert.equal(s.byId.get(4).result.isError, true, 'a tool with no handler is a tool failure');
});

test('argument validation and the ledger flag mapping', () => {
  const [q, , , l] = TOOLS;
  assert.equal(validateArgs(q, { terms: 'a' }), null);
  assert.equal(validateArgs(q, { terms: ['a', 'b'], domain: 'x', top: 3, budget_tokens: 500 }), null);
  assert.match(validateArgs(q, { terms: [] }), /terms/);
  assert.match(validateArgs(q, { terms: 'a', top: 1.5 }), /integer/);
  assert.match(validateArgs(l, { command: 'drop', file: 'x.md' }), /one of/);
  assert.match(validateArgs(l, { command: 'rows', file: 'x.md', since: '2026-1-1' }), /since/);
  assert.deepEqual(
    ledgerArgv({ command: 'rows', where: ['Verdict~better', 'Date=2026-10-01'], since: '2026-10-01', last: 2, fields: 'Date,Verdict', table: 0, max_tokens: 300, cursor: 'c', json: true }, 'l.md'),
    ['rows', 'l.md', '--where', 'Verdict~better', '--where', 'Date=2026-10-01', '--since', '2026-10-01', '--last', '2', '--fields', 'Date,Verdict', '--table', '0', '--max-tokens', '300', '--cursor', 'c', '--json'],
  );
  assert.deepEqual(ledgerArgv({ command: 'prose', after_table: true, last_paragraphs: 1 }, 'l.md'), ['prose', 'l.md', '--last-paragraphs', '1', '--after-table']);
});

test('registry_ledger runs ledger-read in-process and refuses paths it must not serve', async (t) => {
  const tmp = tempDir(t);
  fs.mkdirSync(path.join(tmp, 'librarian'));
  fs.writeFileSync(path.join(tmp, 'librarian', 'applied.md'), '# L\n\n| Date | Verdict |\n| --- | --- |\n| 2026-10-01 | better |\n| 2026-10-02 | worse |\n');
  fs.writeFileSync(path.join(tmp, 'notes.local.md'), '| a |\n| --- |\n| b |\n');
  const h = realHandlers(tmp, { log: () => {} });
  const r = await h.registry_ledger({ command: 'rows', file: 'librarian/applied.md', where: ['Verdict~better'], json: true });
  const j = JSON.parse(r.content[0].text);
  assert.equal(j.matched, 1);
  assert.equal(j.items[0].fields.Verdict, 'better');
  const schema = await h.registry_ledger({ command: 'schema', file: 'librarian/applied.md' });
  assert.match(schema.content[0].text, /columns: Date \| Verdict/);
  await assert.rejects(h.registry_ledger({ command: 'rows', file: '../x.md' }), /escapes/);
  await assert.rejects(h.registry_ledger({ command: 'rows', file: 'notes.local.md' }), /local/);
  await assert.rejects(h.registry_ledger({ command: 'rows', file: path.join(tmp, 'librarian', 'applied.md') }), /absolute/);
  await assert.rejects(h.registry_ledger({ command: 'rows', file: 'librarian/missing.md' }), /no such ledger/);
});

test('registry_ledger holds the containment registry_read holds: no link out of the checkout, no *.LOCAL.* in any case', async (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-mcp-'));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-mcp-outside-'));
  t.after(() => { fs.rmSync(tmp, { recursive: true, force: true }); fs.rmSync(outside, { recursive: true, force: true }); });
  fs.mkdirSync(path.join(tmp, 'librarian'));
  fs.writeFileSync(path.join(outside, 'private.md'), '| secret |\n| --- |\n| s3cr3t |\n');
  fs.writeFileSync(path.join(tmp, 'librarian', 'Notes.LOCAL.md'), '| a |\n| --- |\n| b |\n');
  const h = realHandlers(tmp, { log: () => {} });
  await assert.rejects(h.registry_ledger({ command: 'rows', file: 'librarian/Notes.LOCAL.md' }), /local/);
  try { fs.symlinkSync(path.join(outside, 'private.md'), path.join(tmp, 'librarian', 'linked.md'), 'file'); } catch (e) { return t.skip(`cannot create a symlink here (${e.code})`); }
  await assert.rejects(h.registry_ledger({ command: 'rows', file: 'librarian/linked.md' }), /outside the registry/);
});

test('renderResult prints the CLI compact form and an honest empty', () => {
  const r = { schema: 'registry-query/1', terms: ['x'], truncated: true, tokens: 30, empty_reason: null, hits: [{ rank: 1, score: 1, kind: 'technique', domain: 'se', subject: 'accessibility', technique: 'a11y-verification', path: 'knowledge/se/a/techniques/a11y-verification.md', gist: 'A11y verification - a green audit\nis not proof.', use_when: ['one', 'two'], why: [] }] };
  assert.equal(renderResult(r).split('\n')[0], '1. technique se/accessibility/a11y-verification - A11y verification - a green audit is not proof.');
  assert.match(renderResult(r), /\n {3}knowledge\/se\/a\/techniques\/a11y-verification\.md \| when: one; two\n/);
  assert.match(renderResult(r), /truncated/);
  assert.equal(renderResult({ ...r, hits: [], empty_reason: 'no match' }), 'no match: no match\n');
});

test('real core over the real corpus: registry_query returns a hit (skipped while the core is a stub)', (t) => {
  if (!fs.existsSync(path.join(ROOT, 'knowledge'))) return t.skip('no knowledge/ lane in this checkout');
  const s = session([SCRIPT, '--root', ROOT], [
    init(1, '2025-11-25'),
    rpc(2, 'tools/call', { name: 'registry_query', arguments: { terms: 'deciding whether a green audit means accessible', top: 5 } }),
    rpc(3, 'tools/call', { name: 'registry_subject', arguments: { subject: 'accessibility' } }),
  ], { timeout: 180_000 });
  assert.equal(s.status, 0, s.stderr);
  const r = s.byId.get(2).result;
  if (r.isError && /not implemented/.test(r.content[0].text)) {
    return t.skip('scripts/lib/registry-query.mjs is still the stub (query/loadProjection throw "not implemented"); re-run after WP-A lands');
  }
  assert.notEqual(r.isError, true, r.content[0].text);
  const res = r.structuredContent;
  assert.equal(res.schema, 'registry-query/1');
  assert.ok(res.hits.length > 0, `no hits: ${res.empty_reason}`);
  for (const h of res.hits) assert.ok(fs.existsSync(path.join(ROOT, h.path)), `hit path does not exist: ${h.path}`);
  assert.ok(res.hits.some((h) => h.subject === 'accessibility'), `accessibility not in the top 5: ${res.hits.map((h) => h.path).join(', ')}`);
  assert.match(r.content[0].text, /^1\. /);
  const card = s.byId.get(3).result;
  assert.notEqual(card.isError, true, card.content[0].text);
  assert.match(card.content[0].text, /a11y-verification/);
});

test('the periodic recheck reloads the projection only when a bundle fingerprint moved', async (t) => {
  // Every RECHECK_MS the server re-ran loadProjection, re-parsing every cached bundle (~350 ms on
  // this corpus) when a fingerprint walk (~240 ms) already says nothing changed.
  const tmp = tempDir(t);
  const idx = path.join(tmp, 'knowledge', 'demo', 'index.json');
  fs.mkdirSync(path.dirname(idx), { recursive: true });
  fs.writeFileSync(idx, JSON.stringify({ subjects: {}, laws: {} }));
  const logs = [];
  let clock = 0;
  const h = realHandlers(tmp, { log: (m) => logs.push(m), now: () => clock });
  const loads = () => logs.filter((m) => /^projection loaded/.test(m)).length;
  await h.registry_query({ terms: 'anything' });
  assert.equal(loads(), 1, 'first call loads');
  clock += RECHECK_MS;
  await h.registry_query({ terms: 'anything' });
  assert.equal(loads(), 1, 'an unchanged tree is not reloaded at the recheck');
  fs.writeFileSync(idx, JSON.stringify({ subjects: {}, laws: {}, meta: { moved: true } }));
  clock += RECHECK_MS;
  await h.registry_query({ terms: 'anything' });
  assert.equal(loads(), 2, 'a moved fingerprint reloads');
});
