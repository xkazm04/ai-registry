/**
 * mine-routing-queries - the miner must see the front door, and its consult-missed
 * pattern must match what consult-check actually prints.
 *
 * WHY THIS TEST EXISTS. The miner (scripts/experiments/mine-routing-queries.mjs) recognised
 * only `node research-map.mjs` and index.json slices, so after the registry-query front door
 * (docs/query-lane.md) became the documented first step it mined sessions to nothing, and its
 * consult-missed branch matched the word "missed", which consult-check's text never prints
 * (it says "were not read" / "recorded as a miss") and which on --json output is only the
 * junk line `"missed": [`. This pins the extractors against a SYNTHETIC transcript written
 * below - never copied from a real session, which would carry private paths and prompts -
 * and runs the file once as a CLI to prove it still is one.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  mineTranscript, researchMapTerms, registryQueryCalls, mcpQueryTerms, consultMissRows, docsInCall, worthMining,
} from '../experiments/mine-routing-queries.mjs';

const MINER = fileURLToPath(new URL('../experiments/mine-routing-queries.mjs', import.meta.url));

// ---------------------------------------------------------------- synthetic transcript
const SUBJECT_DOC = 'knowledge/demo-domain/demo-tax/rate-limiting/rate-limiting.md';
const TECH_DOC = 'knowledge/demo-domain/demo-tax/rate-limiting/techniques/retry-budget.md';
const OTHER_TECH = 'knowledge/demo-domain/demo-tax/idempotency/techniques/dedupe-key.md';

let n = 0;
const use = (name, input) => {
  n += 1;
  return { id: `toolu_${n}`, name, input };
};
const assistant = (tool) => JSON.stringify({
  type: 'assistant',
  timestamp: `2026-01-01T00:00:${String(n).padStart(2, '0')}Z`,
  message: { role: 'assistant', content: [{ type: 'tool_use', id: tool.id, name: tool.name, input: tool.input }] },
});
const result = (tool, text) => JSON.stringify({
  type: 'user',
  message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: tool.id, content: [{ type: 'text', text }] }] },
});

const CONSULT_JSON = JSON.stringify({
  project: 'demo-project',
  paths: 2,
  unmapped: 0,
  met: ['already-read'],
  missed: [
    { subject: 'rate-limiting', bundle: 'demo-domain', via: 'map', confidence: 'high', state: 'unknown' },
    { subject: 'idempotency', bundle: 'demo-domain', via: 'router', confidence: null, state: null },
  ],
}, null, 1);

const CONSULT_TEXT = [
  '',
  '  consult-check: 2 subject(s) govern this change and were not read.',
  '    rate-limiting                      demo-domain   (high)',
  '    idempotency                        demo-domain   (unmapped path, routed)',
  '    note: router fell back',
  '',
  '    read them (each card lists the techniques; then --read the one that fits):',
  '      node <registry>/scripts/registry-query.mjs --subject rate-limiting --domain demo-domain',
  '    recorded as a miss. This never blocks a commit.',
  '',
].join('\n');

function buildTranscript() {
  n = 0;
  const lines = [];
  const add = (tool, out) => {
    lines.push(assistant(tool));
    if (out != null) lines.push(result(tool, out));
  };
  // 1. CLI front door: a query, then --read of a technique.
  add(use('Bash', { command: 'cd /work/app && node scripts/registry-query.mjs "deciding how to cap retries on a flaky upstream" --domain demo-domain --top 5 2>&1' }), '[3 hits]');
  add(use('Bash', { command: `node scripts/registry-query.mjs --read ${TECH_DOC} --section "How it works"` }), '[doc]');
  // 2. MCP front door with a server prefix: registry_query, then registry_read.
  add(use('mcp__demo-server__registry_query', { terms: ['picking a dedupe key for webhooks', 'exactly once delivery'], domain: 'demo-domain' }), '{"hits":[]}');
  add(use('mcp__demo-server__registry_read', { path: OTHER_TECH }), '[doc]');
  // 3. An unprefixed MCP name with a bare string.
  add(use('registry_query', { terms: 'when a green audit does not mean accessible' }), '{"hits":[]}');
  // 4. --subject is an opener card, not a query.
  add(use('Bash', { command: 'node scripts/registry-query.mjs --subject rate-limiting --domain demo-domain' }), '[card]');
  // 5. consult-check, JSON form, then a read of the missed subject.
  add(use('Bash', { command: 'node scripts/consult-check.mjs --project /work/app --json' }), CONSULT_JSON);
  add(use('Read', { file_path: SUBJECT_DOC }), '[doc]');
  // 6. consult-check, text form.
  add(use('Bash', { command: 'node scripts/consult-check.mjs --project /work/app' }), CONSULT_TEXT);
  // 7. The old door still works.
  add(use('Bash', { command: 'node scripts/research-map.mjs "queue backpressure" --domain demo-domain' }), '[rows]');
  // 8. A grep that merely mentions the script is not a call.
  add(use('Bash', { command: 'grep -n registry-query.mjs docs/query-lane.md' }), '[match]');
  return lines.join('\n') + '\n';
}

const TRANSCRIPT = buildTranscript();
const byKind = (cands, kind) => cands.filter((c) => c.kind === kind);

// ---------------------------------------------------------------- tests
test('the synthetic transcript is worth mining', () => {
  assert.equal(worthMining(TRANSCRIPT), true);
  assert.equal(worthMining('{"type":"user","message":"hello"}\n'), false);
});

test('a registry-query CLI call is a candidate and --read labels it', () => {
  const cands = byKind(mineTranscript(TRANSCRIPT, { session: 's1' }), 'registry-query').filter((c) => c.surface === 'cli');
  assert.equal(cands.length, 1, 'the --read and --subject calls are openers, not queries');
  const c = cands[0];
  assert.deepEqual(c.terms, ['deciding how to cap retries on a flaky upstream']);
  assert.equal(c.domain, 'demo-domain');
  assert.deepEqual(c.label, { domain: 'demo-domain', subject: 'rate-limiting', technique: 'retry-budget' });
  assert.equal(c.opened[0].via, 'registry-query --read');
  assert.equal(c.session, 's1');
});

test('an MCP registry_query call (prefixed or bare) is a candidate and registry_read labels it', () => {
  const cands = byKind(mineTranscript(TRANSCRIPT), 'registry-query').filter((c) => c.surface === 'mcp');
  assert.equal(cands.length, 2);
  const [prefixed, bare] = cands;
  assert.deepEqual(prefixed.terms, ['picking a dedupe key for webhooks', 'exactly once delivery']);
  assert.equal(prefixed.domain, 'demo-domain');
  assert.deepEqual(prefixed.label, { domain: 'demo-domain', subject: 'idempotency', technique: 'dedupe-key' });
  assert.equal(prefixed.opened[0].via, 'registry_read');
  assert.deepEqual(bare.terms, ['when a green audit does not mean accessible']);
});

test('consult-check JSON yields one candidate per missed subject, and not the junk "missed": [ line', () => {
  const cands = byKind(mineTranscript(TRANSCRIPT), 'consult-missed');
  const fromJson = cands.slice(0, 2);
  assert.deepEqual(fromJson.map((c) => c.subject), ['rate-limiting', 'idempotency']);
  assert.deepEqual(fromJson.map((c) => c.bundle), ['demo-domain', 'demo-domain']);
  assert.ok(cands.every((c) => !/missed/.test(c.terms[0])), 'no candidate may carry the junk "missed": [ line');
  assert.deepEqual(fromJson[0].label, { domain: 'demo-domain', subject: 'rate-limiting', technique: null });
});

test('consult-check text output yields its rows too (it never says "missed")', () => {
  assert.equal(/\bmissed\b/i.test(CONSULT_TEXT), false, 'precondition: the old pattern cannot match this text');
  assert.deepEqual(consultMissRows(CONSULT_TEXT), [
    { subject: 'rate-limiting', bundle: 'demo-domain' },
    { subject: 'idempotency', bundle: 'demo-domain' },
  ]);
  const cands = byKind(mineTranscript(TRANSCRIPT), 'consult-missed');
  assert.equal(cands.length, 4, 'two rows from the JSON call and two from the text call');
});

test('a consult-check run with nothing missed, or nothing parseable, yields no rows', () => {
  assert.deepEqual(consultMissRows('consult-check: 2 path(s), 1 governing subject(s), all read in the last 240m.'), []);
  assert.deepEqual(consultMissRows(JSON.stringify({ met: ['x'], missed: [] })), []);
  assert.deepEqual(consultMissRows(undefined), []);
});

test('the older extractors still work, and a grep that names the script is no call', () => {
  const all = mineTranscript(TRANSCRIPT);
  const rm = byKind(all, 'research-map');
  assert.deepEqual(rm.map((c) => c.terms), [['queue backpressure']]);
  assert.equal(all.length, 8, '1 cli + 2 mcp + 4 consult rows + 1 research-map');
  assert.deepEqual(registryQueryCalls('grep -n registry-query.mjs docs/query-lane.md'), []);
  assert.deepEqual(researchMapTerms('node scripts/research-map.mjs "a b" --terms "c,d" --top 3').map((c) => c.terms), [['a b', 'c', 'd']]);
});

test('registryQueryCalls: positional + --terms, valued flags are not terms, openers are skipped', () => {
  assert.deepEqual(
    registryQueryCalls('node scripts/registry-query.mjs "rate limiting" --terms "retry budget, backoff" --domain d1 --top 3 --budget 900 --kinds technique --json'),
    [{ terms: ['rate limiting', 'retry budget', 'backoff'], flags: ['--terms', '--domain', '--top', '--budget', '--kinds', '--json'], domain: 'd1' }],
  );
  assert.deepEqual(registryQueryCalls(`node scripts/registry-query.mjs --read ${TECH_DOC}`), []);
  assert.deepEqual(registryQueryCalls('node scripts/registry-query.mjs --subject rate-limiting'), []);
});

test('mcpQueryTerms and docsInCall read the MCP shapes', () => {
  assert.deepEqual(mcpQueryTerms({ terms: 'one phrase' }), ['one phrase']);
  assert.deepEqual(mcpQueryTerms({ terms: ['a', ' ', 'b'] }), ['a', 'b']);
  assert.deepEqual(mcpQueryTerms({}), []);
  const docs = docsInCall({ name: 'mcp__any__registry_read', input: { path: TECH_DOC } });
  assert.equal(docs.length, 1);
  assert.equal(docs[0].subject, 'rate-limiting');
  assert.equal(docs[0].technique, 'retry-budget');
  assert.deepEqual(docsInCall({ name: 'mcp__any__registry_read', input: { path: 'docs/query-lane.md' } }), []);
});

test('it is still a CLI: --root over a temp transcript tree prints the candidates and exits 0', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mine-rq-'));
  try {
    fs.mkdirSync(path.join(root, 'proj'), { recursive: true });
    fs.writeFileSync(path.join(root, 'proj', 'session.jsonl'), TRANSCRIPT);
    const r = spawnSync(process.execPath, [MINER, '--root', root], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const out = JSON.parse(r.stdout);
    assert.equal(out.schema, 'routing-candidates/1');
    assert.equal(out.summary.files_scanned, 1);
    assert.equal(out.summary.by_kind['registry-query'], 3);
    assert.equal(out.summary.by_kind['consult-missed'], 4);
    assert.equal(out.summary.by_kind['research-map'], 1);
    assert.equal(out.candidates[0].session, 'proj/session.jsonl');

    const missing = spawnSync(process.execPath, [MINER, '--root', path.join(root, 'nope')], { encoding: 'utf8' });
    assert.equal(missing.status, 2, 'a missing root is FATAL (2), not a crash');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
