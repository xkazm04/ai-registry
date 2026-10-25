// research-ingest over sources that never leave the machine: files in a temp dir and, where
// the web branch is the subject, a loopback HTTP server. Nothing here reaches the network -
// a youtube or public URL is never passed to the script.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../research-ingest.mjs', import.meta.url));

/** A loopback server answering each path from `routes` (path -> html, or null to hang). */
async function loopback(t, routes) {
  const srv = http.createServer((req, res) => {
    const body = routes[req.url];
    if (body === null) return; // never answers
    res.writeHead(body === undefined ? 404 : 200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(body ?? 'not found');
  });
  await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
  t.after(() => { srv.closeAllConnections(); srv.close(); });
  return `http://127.0.0.1:${srv.address().port}`;
}
/** The script as a child that does not block this process's event loop (the server lives here). */
const runAsync = (args) => new Promise((resolve) => {
  const c = spawn(process.execPath, [SCRIPT, ...args]);
  let stdout = '';
  let stderr = '';
  c.stdout.on('data', (d) => { stdout += d; });
  c.stderr.on('data', (d) => { stderr += d; });
  const kill = setTimeout(() => c.kill(), 30000);
  c.on('exit', (status) => { clearTimeout(kill); resolve({ status, stdout, stderr }); });
});
const page = (head) => `<html><head>${head}</head><body><p>${'word '.repeat(400)}</p></body></html>`;

function workdir(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'research-ingest-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
const run = (args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8', timeout: 30000 });

test('control: a thin file exits 3 (the source is thin, the instrument worked)', (t) => {
  const dir = workdir(t);
  fs.writeFileSync(path.join(dir, 'thin.txt'), 'three little words');
  const r = run([path.join(dir, 'thin.txt'), '--out', path.join(dir, 'out')]);
  assert.equal(r.status, 3, r.stderr);
  assert.match(r.stderr, /SOURCE TOO THIN: 3 words < --min-words 300/);
});

test('an unknown flag or a second source refuses (exit 2) and names it', (t) => {
  const dir = workdir(t);
  const thin = path.join(dir, 'thin.txt');
  fs.writeFileSync(thin, 'three little words');
  const out = path.join(dir, 'out');
  // a typo of --min-words used to be dropped, and its value read as a second, ignored source
  let r = run([thin, '--out', out, '--min-word', '1']);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /--min-word\b/);
  // a typo BEFORE the source made the typo's value the source
  r = run(['--outdir', dir, thin]);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /--outdir/);
  r = run([thin, path.join(dir, 'other.txt'), '--out', out]);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /one source/);
  assert.ok(!fs.existsSync(out), 'a refused invocation writes nothing');
});

test('a path that is not a regular file is an instrument failure (exit 2), not a crash (exit 1)', (t) => {
  const dir = workdir(t);
  const r = run([dir, '--out', path.join(dir, 'out')]);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /research-ingest FATAL: .*not a regular file/);
  assert.doesNotMatch(r.stderr, /\n\s+at /, 'no stack trace');
});

test('VTT cue metadata is not transcript: hour-less timings and named cue ids are dropped', (t) => {
  const dir = workdir(t);
  const out = path.join(dir, 'out');
  const ingest = (name, body) => {
    fs.writeFileSync(path.join(dir, name), body);
    const r = run([path.join(dir, name), '--out', out, '--min-words', '1', '--json']);
    assert.equal(r.status, 0, r.stderr);
    return { meta: JSON.parse(r.stdout), text: fs.readFileSync(JSON.parse(r.stdout).path, 'utf8') };
  };
  // control: YouTube's own shape, hours present, numeric cue ids
  const yt = ingest('yt.vtt', 'WEBVTT\n\n1\n00:00:01.000 --> 00:00:04.000\nhello there friend\n\n2\n00:00:31.000 --> 00:00:34.000\nsecond cue words\n');
  assert.equal(yt.text, '[00:00:01] hello there friend\n[00:00:31] second cue words');
  // the WebVTT spec makes hours optional and cue ids free text
  const bare = ingest('bare.vtt', 'WEBVTT\n\nintro\n00:01.000 --> 00:04.000 align:start\nhello there friend\n\nchapter-two\n00:31.500 --> 00:34.000\nsecond cue words\n');
  assert.equal(bare.text, '[00:00:01] hello there friend\n[00:00:31] second cue words');
  assert.equal(bare.meta.words, yt.meta.words, 'same transcript, same count (16 before: timings and ids counted)');
});

test('og:title survives an apostrophe and either attribute order', async (t) => {
  const base = await loopback(t, {
    '/control': page('<title>Plain title</title>'),
    '/apostrophe': page(`<meta property="og:title" content="Don't panic: a guide"><title>x</title>`),
    '/reversed': page('<meta content="Content first" property="og:title"><title>Fallback</title>'),
    '/single': page(`<meta property='og:title' content='Say "hi"'>`),
  });
  const dir = workdir(t);
  const titleOf = async (p) => {
    const r = await runAsync([`${base}${p}`, '--out', path.join(dir, 'out'), '--json']);
    assert.equal(r.status, 0, r.stderr);
    return JSON.parse(r.stdout).title;
  };
  assert.equal(await titleOf('/control'), 'Plain title');
  assert.equal(await titleOf('/apostrophe'), "Don't panic: a guide");
  assert.equal(await titleOf('/reversed'), 'Content first');
  assert.equal(await titleOf('/single'), 'Say "hi"');
});

test('a server that never answers is an instrument failure inside --timeout, not a hang', async (t) => {
  const base = await loopback(t, { '/hang': null });
  const dir = workdir(t);
  const started = Date.now();
  const r = await runAsync([`${base}/hang`, '--out', path.join(dir, 'out'), '--timeout', '1']);
  assert.equal(r.status, 2, `status ${r.status}; ${r.stderr}`);
  assert.match(r.stderr, /timed out after 1s/);
  assert.ok(Date.now() - started < 15000, 'returned well inside the harness kill');
  const bad = await runAsync([`${base}/hang`, '--out', path.join(dir, 'out'), '--timeout', '0']);
  assert.equal(bad.status, 2);
  assert.match(bad.stderr, /--timeout/);
});

test('--min-words that is not a whole number refuses (exit 2) instead of silencing the thin check', (t) => {
  const dir = workdir(t);
  fs.writeFileSync(path.join(dir, 'thin.txt'), 'three little words');
  for (const bad of [['--min-words', 'abc'], ['--min-words'], ['--min-words', '-5'], ['--min-words', '1.5']]) {
    const r = run([path.join(dir, 'thin.txt'), '--out', path.join(dir, 'out'), ...bad]);
    assert.equal(r.status, 2, `${bad.join(' ')}: ${r.stderr}`);
    assert.match(r.stderr, /--min-words/);
  }
  assert.equal(run([path.join(dir, 'thin.txt'), '--out', path.join(dir, 'out'), '--min-words', '2']).status, 0);
});

test('a client-rendered script shell is an instrument failure (exit 2), a short static essay stays thin (exit 3)', async (t) => {
  // The shell is what a SPA serves: a state blob and bundle tags around an empty mount point.
  const shell = `<html><head><title>App</title><script>window.__STATE__=${JSON.stringify('x'.repeat(6000))};</script></head><body><div id="root">Loading...</div><script src="/bundle.js"></script></body></html>`;
  // ~300 bytes of real prose, no script: the SOURCE is thin, the fetch was fine.
  const essay = `<html><head><title>Short essay</title></head><body><p>${'A short static essay that says its piece plainly and then stops, with nothing hidden behind a script. '.repeat(3)}</p></body></html>`;
  // A normal article that also inlines a big script bundle: words clear the floor, so the share does not matter.
  const heavy = `<html><head><title>Heavy</title><script>${'var a=1;'.repeat(2500)}</script></head><body><p>${'word '.repeat(400)}</p></body></html>`;
  const base = await loopback(t, { '/shell': shell, '/essay': essay, '/normal': page('<title>Normal</title>'), '/heavy': heavy });
  const dir = workdir(t);
  const ingest = (p) => runAsync([`${base}${p}`, '--out', path.join(dir, 'out')]);

  const s = await ingest('/shell');
  assert.equal(s.status, 2, s.stderr);
  assert.match(s.stderr, /page is a script shell \(rendered client-side\)/);
  assert.match(s.stderr, /static rendering/);
  assert.doesNotMatch(s.stderr, /SOURCE TOO THIN/);

  const e = await ingest('/essay');
  assert.equal(e.status, 3, e.stderr);
  assert.match(e.stderr, /SOURCE TOO THIN/);

  assert.equal((await ingest('/normal')).status, 0);
  const h = await ingest('/heavy');
  assert.equal(h.status, 0, h.stderr);
});
