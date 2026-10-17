// Tests for scripts/transcript-mirror.mjs.
//
// `node --test scripts/tests/` - builtins only; synthetic files in a temp dir, never the
// real transcript store. A 16-byte chunk size makes multi-chunk and partial-chunk cases
// cheap to build.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { capture, retire, verify, restore, status, notice, guardArchive, parseSince, sessionSources, lockIsStale, pidAlive, MirrorError } from '../transcript-mirror.mjs';

const SCRIPT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..', 'transcript-mirror.mjs');
const CH = 16;
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

function setup() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'tmirror-'));
  const root = path.join(base, 'projects');
  const archive = path.join(base, 'archive');
  fs.mkdirSync(path.join(root, 'proj-a', 'sess-1', 'subagents'), { recursive: true });
  const put = (rel, data) => { const p = path.join(root, ...rel.split('/')); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, data); return p; };
  const append = (rel, data) => fs.appendFileSync(path.join(root, ...rel.split('/')), data);
  const opts = { root, archive, chunkSize: CH, configDir: path.join(base, 'no-such-config') };
  return { base, root, archive, put, append, opts, cleanup: () => fs.rmSync(base, { recursive: true, force: true }) };
}

async function restoredBytes(archive, source) {
  const out = path.join(path.dirname(archive), `out-${crypto.randomUUID()}`);
  await restore({ archive, source, out });
  const b = fs.readFileSync(out);
  fs.rmSync(out);
  return b;
}

test('capture then restore is byte-exact, including subagent subfolders and bytes that do not parse', async () => {
  const t = setup();
  try {
    const a = Buffer.from('{"a":1}\n{"b":2}\n{"c":"three"}\n{"d":4}\n');
    const junk = Buffer.from([0, 255, 13, 10, 123, 34, 0xc3, 0x28, 1, 2, 3]); // not JSON, not UTF-8
    t.put('proj-a/sess-1.jsonl', a);
    t.put('proj-a/sess-1/subagents/agent-x.jsonl', junk);
    t.put('proj-a/notes.txt', 'ignored');
    const r = await capture(t.opts);
    assert.equal(r.filesSeen, 2);
    assert.equal(r.captured, 2);
    assert.ok(r.chunksNew >= 4);
    assert.deepEqual(await restoredBytes(t.archive, 'proj-a/sess-1.jsonl'), a);
    assert.deepEqual(await restoredBytes(t.archive, 'proj-a/sess-1/subagents/agent-x.jsonl'), junk);
    const v = await verify({ archive: t.archive });
    assert.equal(v.ok, 2);
    assert.equal(v.failed, 0);
  } finally { t.cleanup(); }
});

test('an unchanged file is not recaptured', async () => {
  const t = setup();
  try {
    t.put('proj-a/s.jsonl', 'x'.repeat(40));
    await capture(t.opts);
    const r = await capture(t.opts);
    assert.equal(r.captured, 0);
    assert.equal(r.unchanged, 1);
  } finally { t.cleanup(); }
});

test('an appended file costs only its tail plus the re-stored partial chunk, and retire keeps the newest only', async () => {
  const t = setup();
  try {
    const first = Buffer.from('A'.repeat(16) + 'B'.repeat(16) + 'C'.repeat(5)); // 2 full + 5-byte partial
    t.put('proj-a/s.jsonl', first);
    await capture(t.opts);
    const tail = Buffer.from('C'.repeat(11) + 'D'.repeat(16) + 'E'.repeat(3));
    t.append('proj-a/s.jsonl', tail);
    const r2 = await capture(t.opts);
    assert.equal(r2.captured, 1);
    assert.equal(r2.chunksReused, 2, 'the two full chunks are reused');
    assert.equal(r2.chunksNew, 3, 'completed C chunk, D chunk, E partial');
    const dry = await retire({ archive: t.archive, dryRun: true });
    assert.equal(dry.retire, 1);
    assert.equal(dry.chunksUnreferenced, 1, 'the old 5-byte partial chunk');
    assert.equal(status({ archive: t.archive }).liveCaptures, 2, 'dry run changes nothing');
    const rr = await retire({ archive: t.archive });
    assert.equal(rr.retire, 1);
    const st = status({ archive: t.archive });
    assert.equal(st.liveCaptures, 1);
    assert.equal(st.chunks, 5);
    assert.deepEqual(await restoredBytes(t.archive, 'proj-a/s.jsonl'), Buffer.concat([first, tail]));
    assert.equal((await verify({ archive: t.archive })).failed, 0);
  } finally { t.cleanup(); }
});

test('a rewritten (non-prefix) file keeps both captures', async () => {
  const t = setup();
  try {
    t.put('proj-a/s.jsonl', 'A'.repeat(20));
    await capture(t.opts);
    t.put('proj-a/s.jsonl', 'Z'.repeat(40));
    await capture(t.opts);
    const r = await retire({ archive: t.archive });
    assert.equal(r.retire, 0);
    assert.equal(r.keptOlderNotPrefix['chunk-list'], 1);
  } finally { t.cleanup(); }
});

test('a changed byte inside the partial last chunk is caught by the partial-chunk hash', async () => {
  const t = setup();
  try {
    t.put('proj-a/s.jsonl', 'A'.repeat(16) + 'xyz');
    await capture(t.opts);
    t.put('proj-a/s.jsonl', 'A'.repeat(16) + 'xQz' + 'more bytes here');
    await capture(t.opts);
    const r = await retire({ archive: t.archive });
    assert.equal(r.retire, 0);
    assert.equal(r.keptOlderNotPrefix['partial-chunk'], 1);
  } finally { t.cleanup(); }
});

test('an older record whose whole-file hash disagrees with its chunks is not retired', async () => {
  const t = setup();
  try {
    t.put('proj-a/s.jsonl', 'A'.repeat(16) + 'xyz');
    await capture(t.opts);
    t.append('proj-a/s.jsonl', 'more');
    await capture(t.opts);
    const log = path.join(t.archive, 'captures.jsonl');
    const rows = fs.readFileSync(log, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    rows[0].sha256 = sha(Buffer.from('something else'));
    fs.writeFileSync(log, rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
    const r = await retire({ archive: t.archive });
    assert.equal(r.retire, 0);
    assert.equal(r.keptOlderNotPrefix['whole-hash'], 1);
  } finally { t.cleanup(); }
});

test('the newest capture survives retire when its source is gone, and still restores', async () => {
  const t = setup();
  try {
    const p = t.put('proj-a/gone.jsonl', 'hello world, then the harness deletes me\n');
    await capture(t.opts);
    fs.rmSync(p);
    const r = await retire({ archive: t.archive });
    assert.equal(r.retire, 0);
    assert.equal(r.liveAfter, 1);
    assert.equal(status({ archive: t.archive, root: t.root }).sourcesGoneFromRoot, 1);
    assert.equal((await restoredBytes(t.archive, 'proj-a/gone.jsonl')).toString(), 'hello world, then the harness deletes me\n');
  } finally { t.cleanup(); }
});

test('retire refuses when the newer capture has a corrupt chunk', async () => {
  const t = setup();
  try {
    t.put('proj-a/s.jsonl', 'A'.repeat(16) + 'B'.repeat(4));
    await capture(t.opts);
    t.append('proj-a/s.jsonl', 'B'.repeat(12) + 'C'.repeat(8));
    await capture(t.opts);
    // corrupt the newer capture's second chunk (the completed B chunk)
    const h = sha(Buffer.from('B'.repeat(16)));
    const cp = path.join(t.archive, 'chunks', h.slice(0, 2), `${h}.br`);
    fs.writeFileSync(cp, Buffer.from('not brotli'));
    const r = await retire({ archive: t.archive });
    assert.equal(r.retire, 0);
    assert.match(Object.keys(r.keptOlderNotPrefix)[0], /container-chunk/);
    const v = await verify({ archive: t.archive });
    assert.equal(v.failed, 1);
    await assert.rejects(restore({ archive: t.archive, source: 'proj-a/s.jsonl', out: path.join(t.base, 'o') }), MirrorError);
    assert.equal(fs.existsSync(path.join(t.base, 'o')), false, 'a failed restore leaves no file');
  } finally { t.cleanup(); }
});

test('the budget pauses new captures, evicts nothing, and exits 3 from the CLI', async () => {
  const t = setup();
  try {
    t.put('proj-a/old.jsonl', crypto.randomBytes(64));
    await capture(t.opts);
    const before = status({ archive: t.archive });
    const later = t.put('proj-a/new.jsonl', crypto.randomBytes(256));
    fs.utimesSync(later, new Date(), new Date(Date.now() + 1000));
    const r = await capture({ ...t.opts, budgetBytes: before.storedBytes + 40 });
    assert.equal(r.paused, true);
    assert.equal(r.captured, 0);
    assert.equal(r.notCapturedAtPause, 1);
    const after = status({ archive: t.archive });
    assert.equal(after.captures, 1);
    assert.equal(after.chunks, before.chunks, 'the paused file left no chunks and nothing old was evicted');
    const cli = spawnSync(process.execPath, [SCRIPT, 'capture', '--root', t.root, '--archive', t.archive, '--budget-gb', String((before.storedBytes + 40) / 1e9)], { encoding: 'utf8' });
    assert.equal(cli.status, 3);
    assert.equal(JSON.parse(cli.stdout).paused, true);
  } finally { t.cleanup(); }
});

test('an archive inside a git work tree, inside the root, or inside the harness dir is refused', async () => {
  const t = setup();
  try {
    const repo = path.join(t.base, 'repo');
    fs.mkdirSync(path.join(repo, '.git'), { recursive: true });
    assert.throws(() => guardArchive(path.join(repo, 'deep', 'archive'), {}), /git work tree/);
    const wt = path.join(t.base, 'wt');
    fs.mkdirSync(wt);
    fs.writeFileSync(path.join(wt, '.git'), 'gitdir: elsewhere\n');
    assert.throws(() => guardArchive(path.join(wt, 'archive'), {}), /git work tree/);
    assert.throws(() => guardArchive(path.join(t.root, 'archive'), { root: t.root }), /overlap/);
    assert.throws(() => guardArchive(path.join(t.base, 'cfg', 'mirror'), { configDir: path.join(t.base, 'cfg') }), /harness config dir/);
    await assert.rejects(capture({ ...t.opts, archive: path.join(repo, 'archive') }), MirrorError);
    assert.equal(fs.existsSync(path.join(repo, 'archive')), false, 'nothing written on refusal');
    const cli = spawnSync(process.execPath, [SCRIPT, 'capture', '--root', t.root, '--archive', path.join(repo, 'a')], { encoding: 'utf8' });
    assert.equal(cli.status, 1);
  } finally { t.cleanup(); }
});

test('a lock held by another run is refused, not broken', async () => {
  const t = setup();
  try {
    t.put('proj-a/s.jsonl', 'abc');
    await capture(t.opts);
    fs.writeFileSync(path.join(t.archive, '.lock'), '{}');
    await assert.rejects(capture(t.opts), /locked/);
    assert.equal(fs.existsSync(path.join(t.archive, '.lock')), true);
  } finally { t.cleanup(); }
});

test('--since keeps only recently modified files', async () => {
  const t = setup();
  try {
    const old = t.put('proj-a/old.jsonl', 'old');
    t.put('proj-a/new.jsonl', 'new');
    const tenDays = new Date(Date.now() - 10 * 86400e3);
    fs.utimesSync(old, tenDays, tenDays);
    const r = await capture({ ...t.opts, since: '7d' });
    assert.equal(r.filesSeen, 1);
    assert.equal(parseSince('2h', 10 * 3600e3), 8 * 3600e3);
    assert.throws(() => parseSince('soon'), MirrorError);
  } finally { t.cleanup(); }
});

test('a stale lock (its run is gone, or over 6 h old) is broken; a live one is not', async () => {
  const t = setup();
  try {
    t.put('proj-a/s.jsonl', 'abc');
    await capture(t.opts);
    const lock = path.join(t.archive, '.lock');
    const dead = spawnSync(process.execPath, ['-e', '']).pid;
    assert.equal(pidAlive(dead), false);
    fs.writeFileSync(lock, JSON.stringify({ pid: dead, at: new Date().toISOString() }));
    assert.equal(lockIsStale(lock), true);
    t.append('proj-a/s.jsonl', 'def');
    assert.equal((await capture(t.opts)).captured, 1, 'a dead run does not block the mirror');
    assert.equal(fs.existsSync(lock), false, 'the new run released its own lock');
    fs.writeFileSync(lock, JSON.stringify({ pid: process.pid, at: new Date().toISOString() }));
    await assert.rejects(capture(t.opts), (e) => e instanceof MirrorError && e.code === 'LOCKED');
    const old = new Date(Date.now() - 7 * 3600e3);
    fs.utimesSync(lock, old, old);
    assert.equal(lockIsStale(lock), true, 'no run lasts 6 h, so an old lock is stale even if its pid was reused');
    assert.equal((await capture(t.opts)).unchanged, 1);
  } finally { t.cleanup(); }
});

test('sessionSources takes one transcript and its subagent folder, and nothing outside --root', () => {
  const t = setup();
  try {
    const main = t.put('proj-a/sess-1.jsonl', 'm');
    t.put('proj-a/sess-1/subagents/agent-1.jsonl', 's1');
    t.put('proj-a/sess-1/subagents/agent-1.meta.json', '{}');
    t.put('proj-a/sess-2.jsonl', 'other session');
    assert.deepEqual(sessionSources(t.root, main).map((s) => s.src).sort(), ['proj-a/sess-1.jsonl', 'proj-a/sess-1/subagents/agent-1.jsonl']);
    assert.deepEqual(sessionSources(t.root, path.join(t.base, 'elsewhere.jsonl')), []);
    assert.deepEqual(sessionSources(t.root, path.join(t.root, 'proj-a', 'notes.txt')), []);
  } finally { t.cleanup(); }
});

test('capture --hook reads the session-end JSON on stdin, captures that session only, and logs the run', () => {
  const t = setup();
  try {
    const main = t.put('proj-a/sess-1.jsonl', 'one');
    t.put('proj-a/sess-1/subagents/agent-1.jsonl', 'sub');
    t.put('proj-a/sess-2.jsonl', 'two');
    const cli = (args, input) => spawnSync(process.execPath, [SCRIPT, ...args, '--root', t.root, '--archive', t.archive], { encoding: 'utf8', input });
    const r = cli(['capture', '--hook'], JSON.stringify({ session_id: 'sess-1', transcript_path: main, hook_event_name: 'SessionEnd', reason: 'other' }));
    assert.equal(r.status, 0, r.stderr);
    const out = JSON.parse(r.stdout);
    assert.equal(out.scope, 'session');
    assert.equal(out.captured, 2);
    const runs = fs.readFileSync(path.join(t.archive, 'runs.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    assert.equal(runs.length, 1);
    assert.equal(runs[0].scope, 'session');
    assert.equal(runs[0].exit, 0);
    const junk = cli(['capture', '--hook'], 'not json');
    assert.equal(junk.status, 0);
    assert.equal(junk.stdout, '', 'unusable hook input is not a mirror failure and writes nothing');
  } finally { t.cleanup(); }
});

test('notice is silent when healthy and speaks for a pause, a failure, a missed sweep, or no archive', async () => {
  const t = setup();
  try {
    const runsFile = path.join(t.archive, 'runs.jsonl');
    assert.match(notice({ archive: t.archive })[0], /no archive/);
    t.put('proj-a/s.jsonl', 'abc');
    await capture(t.opts);
    const now = Date.now();
    const iso = (ms) => new Date(ms).toISOString();
    const write = (rows) => fs.writeFileSync(runsFile, rows.map((x) => JSON.stringify(x)).join('\n') + '\n');
    const sweep = { command: 'capture', scope: 'all', exit: 0, at: iso(now - 3600e3), budgetBytes: 40e9, storedBytesAfter: 4e9 };
    write([sweep]);
    assert.deepEqual(notice({ archive: t.archive, now }), []);
    write([sweep, { command: 'capture', scope: 'session', exit: 1, code: 'LOCKED', at: iso(now), error: 'locked' }]);
    assert.deepEqual(notice({ archive: t.archive, now }), [], 'a run that met a live lock is not news');
    write([sweep, { command: 'capture', scope: 'all', exit: 3, at: iso(now), budgetBytes: 40e9, storedBytesAfter: 40e9, notCapturedAtPause: 12 }]);
    assert.match(notice({ archive: t.archive, now }).join(' '), /paused at its budget .*12 transcripts/);
    write([sweep, { command: 'capture', scope: 'session', exit: 1, code: 'ENOSPC', at: iso(now), error: 'no space left on device' }]);
    assert.match(notice({ archive: t.archive, now }).join(' '), /failed .*no space left/);
    write([{ ...sweep, at: iso(now - 48 * 3600e3) }, { command: 'capture', scope: 'session', exit: 0, at: iso(now) }]);
    assert.match(notice({ archive: t.archive, now }).join(' '), /no whole-store capture since/, 'session captures do not prove the sweep runs');
    write([{ ...sweep, storedBytesAfter: 37e9 }]);
    assert.match(notice({ archive: t.archive, now }).join(' '), /93% of its 40.0 GB budget/);
    write([sweep, { command: 'verify', exit: 1, failed: 2, at: iso(now) }]);
    assert.match(notice({ archive: t.archive, now }).join(' '), /2 damaged captures/);
    write([sweep]);
    const quiet = spawnSync(process.execPath, [SCRIPT, 'notice', '--archive', t.archive], { encoding: 'utf8' });
    assert.equal(quiet.status, 0);
    assert.equal(quiet.stdout, '');
    const loud = spawnSync(process.execPath, [SCRIPT, 'notice', '--archive', path.join(t.base, 'none')], { encoding: 'utf8' });
    assert.equal(loud.status, 0, 'a notice never fails the session');
    const j = JSON.parse(loud.stdout);
    assert.match(j.systemMessage, /no archive/);
    assert.equal(j.hookSpecificOutput.hookEventName, 'SessionStart');
  } finally { t.cleanup(); }
});

test('the CLI logs a refused run but never writes into a refused or absent archive', async () => {
  const t = setup();
  try {
    t.put('proj-a/s.jsonl', crypto.randomBytes(64));
    await capture(t.opts);
    fs.writeFileSync(path.join(t.archive, '.lock'), JSON.stringify({ pid: process.pid, at: new Date().toISOString() }));
    const locked = spawnSync(process.execPath, [SCRIPT, 'capture', '--root', t.root, '--archive', t.archive], { encoding: 'utf8' });
    assert.equal(locked.status, 1);
    fs.rmSync(path.join(t.archive, '.lock'));
    const row = JSON.parse(fs.readFileSync(path.join(t.archive, 'runs.jsonl'), 'utf8').trim().split('\n').at(-1));
    assert.equal(row.code, 'LOCKED');
    const repo = path.join(t.base, 'repo');
    fs.mkdirSync(path.join(repo, '.git'), { recursive: true });
    spawnSync(process.execPath, [SCRIPT, 'capture', '--root', t.root, '--archive', path.join(repo, 'a')], { encoding: 'utf8' });
    assert.equal(fs.existsSync(path.join(repo, 'a')), false);
  } finally { t.cleanup(); }
});

test('retire removes chunk writes a killed run left half-done', async () => {
  const t = setup();
  try {
    t.put('proj-a/s.jsonl', 'A'.repeat(20));
    await capture(t.opts);
    const sub = fs.readdirSync(path.join(t.archive, 'chunks'))[0];
    const tmp = path.join(t.archive, 'chunks', sub, 'deadbeef.br.123.tmp');
    fs.writeFileSync(tmp, 'partial');
    assert.equal((await retire({ archive: t.archive, dryRun: true })).tmpLeftovers, 1);
    assert.equal(fs.existsSync(tmp), true, 'dry run deletes nothing');
    await retire({ archive: t.archive });
    assert.equal(fs.existsSync(tmp), false);
    assert.equal((await verify({ archive: t.archive })).failed, 0);
  } finally { t.cleanup(); }
});
