// research-ingest over sources that never leave the machine: files in a temp dir and, where
// the web branch is the subject, a loopback HTTP server. Nothing here reaches the network -
// a youtube or public URL is never passed to the script.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../research-ingest.mjs', import.meta.url));

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
