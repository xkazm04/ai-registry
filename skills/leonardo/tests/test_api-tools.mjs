// Offline tests for the provider-calling tools: what they do when a response is not the
// happy path. No network and no real key, ever: every tool runs in a child process whose
// global fetch is replaced (node --import) by a stub that answers from a script and throws on
// any URL it was not told about, so a test that drifts toward a real endpoint fails instead of
// calling it. The stub appends every request it sees to a log the test reads back.
//
// A route whose body is the string 'HANG' never answers - it settles only when the caller's
// AbortSignal fires, exactly as a real fetch would. That is the deadline test: a tool that
// puts no signal on its call is killed by the harness (status null) instead of exiting.
//
//   node --test skills/leonardo/tests/test_api-tools.mjs
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TOOLS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'tools');
const roots = [];
after(() => { for (const r of roots) rmSync(r, { recursive: true, force: true }); });

// The stub: routes are [method, url-substring, status, body]; first match wins.
const STUB = `
import { appendFileSync } from 'node:fs';
const routes = JSON.parse(process.env.STUB_ROUTES);
globalThis.fetch = async (url, opts = {}) => {
  const hang = () => new Promise((_, reject) => {
    const keep = setInterval(() => {}, 1000); // a pending promise alone would let node exit 0
    const s = opts.signal;
    if (!s) return;
    const stop = () => { clearInterval(keep); reject(s.reason); };
    if (s.aborted) stop(); else s.addEventListener('abort', stop, { once: true });
  });
  const u = String(url);
  const method = (opts.method || 'GET').toUpperCase();
  const headers = Object.fromEntries(new Headers(opts.headers || {}).entries());
  appendFileSync(process.env.STUB_LOG, JSON.stringify({ method, url: u, headers }) + '\\n');
  for (const [m, part, status, body] of routes) {
    if (m === method && u.includes(part)) return body === 'HANG' ? hang() : new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });
  }
  throw new Error('offline stub: no route for ' + method + ' ' + u);
};
`;

function sandbox() {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'leonardo-test-'));
  roots.push(dir);
  writeFileSync(path.join(dir, 'stub.mjs'), STUB);
  return dir;
}

function run(dir, tool, args, routes, env = {}, killMs = undefined) {
  const log = path.join(dir, 'requests.jsonl');
  writeFileSync(log, '');
  const clean = {};
  for (const [k, v] of Object.entries(process.env)) if (!/API_KEY|BASE_URL|IMAGE_MODEL/.test(k)) clean[k] = v;
  const r = spawnSync(process.execPath, ['--import', pathToFileURL(path.join(dir, 'stub.mjs')).href, path.resolve(TOOLS, tool), ...args], {
    encoding: 'utf8',
    timeout: killMs,
    env: { ...clean, STUB_ROUTES: JSON.stringify(routes), STUB_LOG: log, ...env },
  });
  const requests = readFileSync(log, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  return { code: r.status, signal: r.signal, out: r.stdout, err: r.stderr, requests };
}

// ------------------------------------------------------------------ leonardo-gpt-image
const SUBMIT = { generate: { generationId: 'gen-0000-1111', status: 'COMPLETE' }, images: ['https://cdn.leonardo.ai/u/a.png', 'https://cdn.leonardo.ai/u/b.png'] };

test('gpt-image: every download failing is a failure, and the paid generation is NOT deleted', () => {
  const dir = sandbox();
  const out = path.join(dir, 'card.png');
  const r = run(dir, 'leonardo-gpt-image.mjs', ['generate', '--prompt', 'p', '--output', out], [
    ['POST', '/v2/generations', 200, SUBMIT],
    ['GET', 'cdn.leonardo.ai', 503, 'busy'],
    ['DELETE', '/v1/generations/', 200, {}],
  ], { LEONARDO_API_KEY: 'k_test' });
  assert.notEqual(r.code, 0, `zero images written must not exit 0: ${r.out}${r.err}`);
  assert.doesNotMatch(r.out, /"success": true/);
  assert.equal(r.requests.filter((q) => q.method === 'DELETE').length, 0, 'the generation stays in the cloud so the images can be fetched again');
  assert.match(r.err, /gen-0000-1111/, 'the failure names the generation to recover');
});

test('gpt-image: a partial download keeps the generation and lists what failed', () => {
  const dir = sandbox();
  const out = path.join(dir, 'card.png');
  const r = run(dir, 'leonardo-gpt-image.mjs', ['generate', '--prompt', 'p', '--output', out], [
    ['POST', '/v2/generations', 200, SUBMIT],
    ['GET', 'cdn.leonardo.ai/u/a.png', 200, 'PNGDATA'],
    ['GET', 'cdn.leonardo.ai/u/b.png', 503, 'busy'],
    ['DELETE', '/v1/generations/', 200, {}],
  ], { LEONARDO_API_KEY: 'k_test' });
  assert.equal(r.code, 0, r.err);
  const res = JSON.parse(r.out);
  assert.equal(res.outputs.length, 1);
  assert.equal(existsSync(path.join(dir, 'card-1.png')), true);
  assert.deepEqual(res.failed.map((f) => f.url), ['https://cdn.leonardo.ai/u/b.png']);
  assert.equal(res.cleaned, false);
  assert.equal(r.requests.filter((q) => q.method === 'DELETE').length, 0);
});

// ------------------------------------------------------------------ Gemini key placement
// A key in the query string is in every proxy log, access log and error that prints the URL;
// the Gemini API takes it in the x-goog-api-key header. Both Gemini callers must use the header.
const GEMINI_OK = { candidates: [{ content: { parts: [{ text: '{"score": 7, "defects": "none"}' }] } }] };
const noKeyInUrl = (requests) => requests.filter((q) => q.url.includes('generativelanguage') || q.url.includes(':generateContent'));

test('gemini-recognize sends the key in the x-goog-api-key header, never in the URL', () => {
  const dir = sandbox();
  const img = path.join(dir, 'in.png');
  writeFileSync(img, 'PNG');
  const r = run(dir, 'gemini-recognize.mjs', ['--input', img, '--prompt', 'describe'], [
    ['POST', ':generateContent', 200, GEMINI_OK],
  ], { GEMINI_API_KEY: 'g_secret_test' });
  assert.equal(r.code, 0, r.err);
  const calls = noKeyInUrl(r.requests);
  assert.equal(calls.length, 1);
  assert.doesNotMatch(calls[0].url, /g_secret_test|[?&]key=/);
  assert.equal(calls[0].headers['x-goog-api-key'], 'g_secret_test');
});

test('leonardo-image generate-best rates candidates with the key in the header, never in the URL', () => {
  const dir = sandbox();
  const r = run(dir, 'leonardo-image.mjs', ['generate-best', '--prompt', 'p', '--output', path.join(dir, 'best.png'), '--candidates', '1'], [
    ['POST', '/generations', 200, { sdGenerationJob: { generationId: 'gen-best-0001' } }],
    ['GET', '/generations/gen-best-0001', 200, { generations_by_pk: { status: 'COMPLETE', generated_images: [{ id: 'img1', url: 'https://cdn.leonardo.ai/u/c.png' }] } }],
    ['GET', 'cdn.leonardo.ai', 200, 'PNGDATA'],
    ['POST', ':generateContent', 200, GEMINI_OK],
    ['DELETE', '/generations/gen-best-0001', 200, {}],
  ], { LEONARDO_API_KEY: 'k_test', GEMINI_API_KEY: 'g_secret_test' });
  assert.equal(r.code, 0, r.err);
  assert.equal(JSON.parse(r.out).winnerScore, 7);
  const calls = noKeyInUrl(r.requests);
  assert.equal(calls.length, 1);
  assert.doesNotMatch(calls[0].url, /g_secret_test|[?&]key=/);
  assert.equal(calls[0].headers['x-goog-api-key'], 'g_secret_test');
});

// ------------------------------------------------------------------ leonardo-image help text
// Derived from the code, not restated: the commands are the switch's case labels, the flags are
// the option keys the code reads. Help that omits a command, or a header that advertises a flag
// nothing reads (`--transparent`, which SKILL.md says Lucid Origin does not support), misdirects.
test('leonardo-image: the help lists every command and the header advertises only flags the code reads', () => {
  const src = readFileSync(path.join(TOOLS, 'leonardo-image.mjs'), 'utf8');
  const commands = [...src.matchAll(/^\s*case '([a-z-]+)':/gm)].map((m) => m[1]);
  assert.ok(commands.length >= 4, `found the switch: ${commands}`);
  const dir = sandbox();
  const r = run(dir, 'leonardo-image.mjs', [], []);
  assert.equal(r.code, 1);
  for (const c of commands) assert.match(r.err, new RegExp(`\\b${c}\\b`), `the no-command help names "${c}"`);
  const header = /\/\*\*([\s\S]*?)\*\//.exec(src)[1];
  const body = src.slice(src.indexOf('*/') + 2);
  for (const [, flag] of header.matchAll(/--([a-z][a-z-]*)/g)) {
    const read = new RegExp(`(args|opts)(\\.${flag.replace(/-/g, '_')}\\b|\\['${flag}'\\])`).test(body);
    assert.ok(read, `the header advertises --${flag} but the code never reads it`);
  }
});

test('gpt-image: all downloads landing still cleans the cloud generation up', () => {
  const dir = sandbox();
  const r = run(dir, 'leonardo-gpt-image.mjs', ['generate', '--prompt', 'p', '--output', path.join(dir, 'c.png')], [
    ['POST', '/v2/generations', 200, SUBMIT],
    ['GET', 'cdn.leonardo.ai', 200, 'PNGDATA'],
    ['DELETE', '/v1/generations/gen-0000-1111', 200, {}],
  ], { LEONARDO_API_KEY: 'k_test' });
  assert.equal(r.code, 0, r.err);
  assert.equal(JSON.parse(r.out).cleaned, true);
  assert.equal(r.requests.filter((q) => q.method === 'DELETE').length, 1);
});

// ------------------------------------------------------------------ provider deadlines
// A provider that accepts the connection and never answers must end the run, not hang it.
// Each tool is given a 1 s deadline through its env knob and a route that never answers; the
// harness kills it at KILL_MS, so a tool with no signal fails here as a null status.
const MOTIONIZE_TOOLS = path.resolve(TOOLS, '..', '..', 'motionize', 'tools');
const KILL_MS = 20000;
const DEADLINE_ENV = { LEONARDO_FETCH_TIMEOUT_MS: '1000', MOTIONIZE_FETCH_TIMEOUT_MS: '1000' };

function assertDeadline(r, what) {
  assert.equal(r.signal, null, `${what}: hung until the harness killed it (${r.signal})`);
  assert.notEqual(r.code, 0, `${what}: a stalled provider must not exit 0: ${r.out}${r.err}`);
  assert.match(r.err, /no response within 1000 ms/, `${what}: the failure names the deadline`);
}

const LEO_GEN = ['POST', '/generations', 200, { sdGenerationJob: { generationId: 'gen-dl-0001' } }];
const LEO_DONE = ['GET', '/generations/gen-dl-0001', 200, { generations_by_pk: { status: 'COMPLETE', generated_images: [{ id: 'i1', url: 'https://cdn.leonardo.ai/u/d.png' }] } }];

test('deadline: leonardo-image generate ends when the submit never answers', () => {
  const dir = sandbox();
  const r = run(dir, 'leonardo-image.mjs', ['generate', '--prompt', 'p', '--output', path.join(dir, 'o.png')], [
    ['POST', '/generations', 200, 'HANG'],
  ], { LEONARDO_API_KEY: 'k_test', ...DEADLINE_ENV }, KILL_MS);
  assertDeadline(r, 'leonardo-image submit');
});

test('deadline: leonardo-image generate ends when the image download stalls', () => {
  const dir = sandbox();
  const r = run(dir, 'leonardo-image.mjs', ['generate', '--prompt', 'p', '--output', path.join(dir, 'o.png')], [
    LEO_GEN, LEO_DONE, ['GET', 'cdn.leonardo.ai', 200, 'HANG'],
  ], { LEONARDO_API_KEY: 'k_test', ...DEADLINE_ENV }, KILL_MS);
  assertDeadline(r, 'leonardo-image download');
});

test('deadline: a stalled Gemini rating degrades to score null, like a Gemini error status does', () => {
  const dir = sandbox();
  const r = run(dir, 'leonardo-image.mjs', ['generate-best', '--prompt', 'p', '--output', path.join(dir, 'b.png'), '--candidates', '1'], [
    LEO_GEN, LEO_DONE, ['GET', 'cdn.leonardo.ai', 200, 'PNGDATA'],
    ['POST', ':generateContent', 200, 'HANG'],
    ['DELETE', '/generations/gen-dl-0001', 200, {}],
  ], { LEONARDO_API_KEY: 'k_test', GEMINI_API_KEY: 'g_test', ...DEADLINE_ENV }, KILL_MS);
  assert.equal(r.signal, null, 'generate-best hung on the rating call');
  assert.equal(r.code, 0, r.err);
  assert.equal(JSON.parse(r.out).winnerScore, null);
  assert.match(r.err, /score=n\/a/);
});

test('deadline: gpt-image ends when the v2 submit never answers', () => {
  const dir = sandbox();
  const r = run(dir, 'leonardo-gpt-image.mjs', ['generate', '--prompt', 'p', '--output', path.join(dir, 'o.png')], [
    ['POST', '/v2/generations', 200, 'HANG'],
  ], { LEONARDO_API_KEY: 'k_test', ...DEADLINE_ENV }, KILL_MS);
  assertDeadline(r, 'gpt-image submit');
});

test('deadline: gpt-image treats a stalled download as a failed one and keeps the generation', () => {
  const dir = sandbox();
  const r = run(dir, 'leonardo-gpt-image.mjs', ['generate', '--prompt', 'p', '--output', path.join(dir, 'o.png')], [
    ['POST', '/v2/generations', 200, SUBMIT],
    ['GET', 'cdn.leonardo.ai', 200, 'HANG'],
    ['DELETE', '/v1/generations/', 200, {}],
  ], { LEONARDO_API_KEY: 'k_test', ...DEADLINE_ENV }, KILL_MS);
  assert.equal(r.signal, null, 'gpt-image hung on a stalled download');
  assert.notEqual(r.code, 0);
  assert.match(r.err, /every image download failed/);
  assert.match(r.err, /no response within 1000 ms/, 'the failed list says why');
  assert.equal(r.requests.filter((q) => q.method === 'DELETE').length, 0, 'the generation is kept');
});

test('deadline: openai-image generate and edit end when the Images API never answers', () => {
  const dir = sandbox();
  const gen = run(dir, 'openai-image.mjs', ['generate', '--prompt', 'p', '--output', path.join(dir, 'o.png')], [
    ['POST', '/images/generations', 200, 'HANG'],
  ], { OPENAI_API_KEY: 'sk_test', ...DEADLINE_ENV }, KILL_MS);
  assertDeadline(gen, 'openai-image generate');
  const img = path.join(dir, 'in.png');
  writeFileSync(img, 'PNG');
  const edit = run(dir, 'openai-image.mjs', ['edit', '--prompt', 'p', '--image', img, '--output', path.join(dir, 'e.png')], [
    ['POST', '/images/edits', 200, 'HANG'],
  ], { OPENAI_API_KEY: 'sk_test', ...DEADLINE_ENV }, KILL_MS);
  assertDeadline(edit, 'openai-image edit');
});

test('deadline: qwen-image ends when the task submit never answers', () => {
  const dir = sandbox();
  const r = run(dir, 'qwen-image.mjs', ['generate', '--prompt', 'p', '--output', path.join(dir, 'o.png')], [
    ['POST', 'image-synthesis', 200, 'HANG'],
  ], { QWEN_API_KEY: 'q_test', ...DEADLINE_ENV }, KILL_MS);
  assertDeadline(r, 'qwen-image submit');
});

test('deadline: qwen-image ends when a task poll never answers', () => {
  const dir = sandbox();
  const r = run(dir, 'qwen-image.mjs', ['generate', '--prompt', 'p', '--output', path.join(dir, 'o.png')], [
    ['POST', 'image-synthesis', 200, { output: { task_id: 't-1' } }],
    ['GET', '/api/v1/tasks/t-1', 200, 'HANG'],
  ], { QWEN_API_KEY: 'q_test', ...DEADLINE_ENV }, KILL_MS);
  assertDeadline(r, 'qwen-image poll');
});

test('deadline: gemini-recognize ends when generateContent never answers', () => {
  const dir = sandbox();
  const img = path.join(dir, 'in.png');
  writeFileSync(img, 'PNG');
  const r = run(dir, 'gemini-recognize.mjs', ['--input', img, '--prompt', 'describe'], [
    ['POST', ':generateContent', 200, 'HANG'],
  ], { GEMINI_API_KEY: 'g_test', ...DEADLINE_ENV }, KILL_MS);
  assertDeadline(r, 'gemini-recognize');
});

test('deadline: motionize qwen-recognize ends when chat/completions never answers', () => {
  const dir = sandbox();
  const img = path.join(dir, 'in.png');
  writeFileSync(img, 'PNG');
  const r = run(dir, path.join(MOTIONIZE_TOOLS, 'qwen-recognize.mjs'), ['--input', img, '--prompt', 'describe'], [
    ['POST', 'chat/completions', 200, 'HANG'],
  ], { QWEN_API_KEY: 'q_test', ...DEADLINE_ENV }, KILL_MS);
  assertDeadline(r, 'qwen-recognize');
});

// demo-film's narrate.mjs listVoices has the same deadline (VOICES_TIMEOUT_MS) but cannot be
// driven here: the tool imports zod through contract.ts, absent in this checkout, so it is
// covered by code review only until test_narrate.mjs can run.
