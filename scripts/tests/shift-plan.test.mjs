import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { EXIT } from '../lib/exit-codes.mjs';
import { applySync, classifyUrl, LIST_FILE, main, PACE_MS, parseList, renderPlanHtml, transcriptOutcome, validatePlan } from '../shift-plan.mjs';
import { queuePath, readQueue } from '../shift-queue.mjs';

const NOW = Date.parse('2026-11-06T12:00:00Z');
const ISO = new Date(NOW).toISOString();
const V1 = 'AAAAAAAAAA1';
const V2 = 'BBBBBBBBBB2';
const V3 = 'CCCCCCCCCC3';
const MINED = 'MinedVideo1';
const url = (id) => `https://www.youtube.com/watch?v=${id}`;
const HOME = 'knowledge/dom/cat/subj/subj.md';

function tmpRoot(listText) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'shift-plan-'));
  const sources = path.join(root, 'librarian', 'sources');
  fs.mkdirSync(sources, { recursive: true });
  fs.writeFileSync(path.join(sources, 'index.md'), `\`youtube:${MINED}\`\n`);
  fs.mkdirSync(path.join(root, 'knowledge', 'dom', 'cat', 'subj', 'techniques'), { recursive: true });
  fs.writeFileSync(path.join(root, HOME), '# subj\n');
  fs.writeFileSync(path.join(root, 'knowledge', 'dom', 'cat', 'subj', 'techniques', 'tech.md'), '# tech\n');
  fs.writeFileSync(path.join(root, 'knowledge', 'dom', 'index.json'), JSON.stringify({ subjects: { subj: { file: HOME, techniques: [{ slug: 'tech' }] } } }));
  if (listText !== undefined) {
    fs.mkdirSync(path.join(root, '.ai'), { recursive: true });
    fs.writeFileSync(path.join(root, LIST_FILE), listText);
  }
  return root;
}

function harness(root, over = {}) {
  const h = { out: [], err: [], sleeps: [], calls: [], ingests: [] };
  h.ctx = {
    root,
    now: () => NOW,
    sleep: (ms) => h.sleeps.push(ms),
    log: (s) => h.out.push(s),
    err: (s) => h.err.push(s),
    ytdlp: (args) => { h.calls.push(args); return args[0] === '--version' ? { status: 0, stdout: '2026.10.21' } : { status: 1, stderr: 'unexpected call' }; },
    ...over,
  };
  return h;
}

const seedRows = (root, rows) => {
  fs.mkdirSync(path.dirname(queuePath(root)), { recursive: true });
  fs.writeFileSync(queuePath(root), rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
};
const metaJson = (id, extra = {}) => JSON.stringify({ id, upload_date: '20261101', duration: 600, channel: `ch-${id}`, title: `t|${id}`, description: 'line one\nline|two', ...extra });
const row = (id, status, extra = {}) => ({ id, url: url(id), status, addedAt: ISO, channel: `ch-${id}`, title: `t-${id}`, ...extra });
const cluster = (over = {}) => ({ id: 'c1', theme: 'theme', videos: [V1, V2], voices: 2, homes: [HOME], yield: 'a technique', superseded: [], gpuProofs: [], estSeats: 1, ...over });
const plan = (clusters = [cluster()], over = {}) => ({ planId: 'p1', createdAt: ISO, clusters, ...over });
const check = (p, over = {}) => validatePlan(p, {
  rows: [row(V1, 'transcript'), row(V2, 'meta')], universe: new Set([V1, V2]), isHome: (h) => h === HOME, ...over,
});

/* ------------------------------------------------------------- list */

test('list parsing: note, strike, blanks, comments, fragments', () => {
  const { entries, invalid } = parseList([
    '# the list',
    '',
    `${url(V1)}   # worth a look`,
    `- ${url(V2)} # changed my mind`,
    `-${url(V3)}`,
    `https://youtu.be/${V1}#t=30`,
    'https://www.youtube.com/playlist?list=PLabcDEF',
    'https://example.com/not-youtube',
    'https://www.youtube.com/@somechannel',
    `${url(V1)} trailing words`,
  ].join('\r\n'));
  assert.deepEqual(entries.map((e) => [e.id ?? e.list, !!e.struck, e.note ?? null]), [
    [V1, false, 'worth a look'], [V2, true, 'changed my mind'], [V3, true, null], [V1, false, null], ['PLabcDEF', false, null],
  ]);
  assert.equal(entries[4].kind, 'playlist');
  assert.deepEqual(invalid.map((b) => b.line), [8, 9, 10]);
});

test('video and playlist ids keep their case through classification', () => {
  assert.equal(classifyUrl('https://WWW.YouTube.com/watch?v=AbCdEfGhIjK').id, 'AbCdEfGhIjK');
  assert.equal(classifyUrl('https://youtu.be/AbCdEfGhIjK?si=x').url, url('AbCdEfGhIjK'));
  assert.equal(classifyUrl('https://www.youtube.com/playlist?list=PLaBc').list, 'PLaBc');
  assert.equal(classifyUrl(`${url(V1)}&list=PLx`).kind, 'video', 'a video in a playlist is that video');
});

/* ------------------------------------------------------------- sync */

test('a missing list is not an error: it says how to create one', () => {
  const root = tmpRoot();
  const h = harness(root);
  assert.equal(main(['sync'], h.ctx), EXIT.OK);
  assert.match(h.out.join('\n'), /youtube-intake\.local\.md/);
  assert.ok(!fs.existsSync(queuePath(root)));
});

test('sync adds new, parks mined and struck, and never touches the list file', () => {
  const list = `${url(V1)} # note one\n${url(MINED)}\n- ${url(V2)}\n`;
  const root = tmpRoot(list);
  assert.equal(main(['sync'], harness(root).ctx), EXIT.OK);
  const byId = Object.fromEntries(readQueue(root).map((r) => [r.id, r]));
  assert.equal(byId[V1].status, 'new');
  assert.equal(byId[V1].note, 'note one');
  assert.deepEqual([byId[MINED].status, byId[MINED].reason], ['parked', 'already-mined']);
  assert.deepEqual([byId[V2].status, byId[V2].reason], ['parked', 'operator-struck']);
  assert.equal(fs.readFileSync(path.join(root, LIST_FILE), 'utf8'), list);
});

test('sync is idempotent: a second run writes the same bytes, even a day later', () => {
  const root = tmpRoot(`${url(V1)}\n${url(MINED)}\n- ${url(V2)}\n`);
  main(['sync'], harness(root).ctx);
  const first = fs.readFileSync(queuePath(root), 'utf8');
  const h = harness(root, { now: () => NOW + 86400000 });
  assert.equal(main(['sync'], h.ctx), EXIT.OK);
  assert.equal(fs.readFileSync(queuePath(root), 'utf8'), first);
  assert.match(h.out[0], /"added":0,"parked":0,"restored":0/);
});

test('sync expands playlists through yt-dlp, paced, and a struck playlist needs no network', () => {
  const root = tmpRoot('https://www.youtube.com/playlist?list=PLone # batch\nhttps://www.youtube.com/playlist?list=PLtwo\n- https://www.youtube.com/playlist?list=PLgone\n');
  const h = harness(root);
  h.ctx.ytdlp = (args) => {
    h.calls.push(args);
    assert.equal(args[0], '--flat-playlist');
    return args.at(-1).includes('PLone') ? { status: 0, stdout: `${V1}\n${MINED}\nNA\n` } : { status: 0, stdout: `${V1}\n${V2}\n` };
  };
  assert.equal(main(['sync'], h.ctx), EXIT.OK);
  assert.equal(h.calls.length, 2);
  assert.deepEqual(h.sleeps, [PACE_MS]);
  const rows = readQueue(root);
  assert.deepEqual(rows.map((r) => r.id), [V1, MINED, V2]);
  assert.equal(rows[0].note, 'batch');
});

test('striking a playlist later parks what it brought, and work already started stays', () => {
  const rows = [row(V1, 'meta', { list: 'PLx' }), row(V2, 'mining', { list: 'PLx' }), row(V3, 'landed', { list: 'PLx' })];
  const c = applySync(rows, { videos: [], struckIds: new Set(), struckLists: new Set(['PLx']), mined: new Set(), iso: ISO });
  assert.deepEqual(rows.map((r) => r.status), ['parked', 'mining', 'landed']);
  assert.deepEqual(c.struckTooLate, [V2, V3]);
});

test('taking a strike back restores the row; another reason for parking is not disturbed', () => {
  const rows = [row(V1, 'parked', { reason: 'operator-struck' }), row(V2, 'parked', { reason: 'operator-struck-cluster' })];
  applySync(rows, { videos: [{ id: V1 }, { id: V2 }], struckIds: new Set(), struckLists: new Set(), mined: new Set(), iso: ISO });
  assert.equal(rows[0].status, 'meta');
  assert.equal(rows[0].reason, undefined);
  assert.equal(rows[1].status, 'parked');
});

test('a video mined by a sibling since the last sync is parked, a landed one is left alone', () => {
  const rows = [row(V1, 'approved'), row(V2, 'landed')];
  applySync(rows, { videos: [], struckIds: new Set(), struckLists: new Set(), mined: new Set([V1, V2]), iso: ISO });
  assert.deepEqual(rows.map((r) => [r.status, r.reason]), [['parked', 'already-mined'], ['landed', undefined]]);
});

test('an unusable list line is reported as a finding and the good lines still land', () => {
  const root = tmpRoot(`${url(V1)}\nhttps://example.com/x\n`);
  const h = harness(root);
  assert.equal(main(['sync'], h.ctx), EXIT.VIOLATIONS);
  assert.match(h.err.join('\n'), /line 2/);
  assert.equal(readQueue(root).length, 1);
});

test('a failed playlist expansion exits could-not-run, keeping the rest', () => {
  const root = tmpRoot(`${url(V1)}\nhttps://www.youtube.com/playlist?list=PLbad\n`);
  const h = harness(root, { ytdlp: () => ({ status: 1, stderr: 'ERROR: playlist does not exist' }) });
  assert.equal(main(['sync'], h.ctx), EXIT.FATAL);
  assert.equal(readQueue(root).length, 1);
});

/* ------------------------------------------------------------- meta */

test('meta paces at least 8 s, survives delimiters and newlines, and sets status', () => {
  const root = tmpRoot();
  seedRows(root, [row(V1, 'new', { channel: undefined }), row(V2, 'new', { channel: undefined }), row(V3, 'parked', { reason: 'x' })]);
  const h = harness(root);
  h.ctx.ytdlp = (args) => {
    if (args[0] === '--version') return { status: 0, stdout: 'v' };
    h.calls.push(args);
    assert.ok(args.includes('--skip-download'));
    const id = args.at(-1).split('v=')[1];
    return { status: 0, stdout: `${metaJson(id)}\n` };
  };
  assert.equal(main(['meta'], h.ctx), EXIT.OK);
  assert.deepEqual(h.sleeps, [PACE_MS]);
  assert.ok(PACE_MS >= 8000);
  const r = readQueue(root)[0];
  assert.deepEqual([r.status, r.title, r.channel, r.date, r.duration, r.description],
    ['meta', `t|${V1}`, `ch-${V1}`, '2026-11-01', 600, 'line one\nline|two']);
  assert.equal(h.calls.length, 2, 'the parked row costs no call');
});

test('meta --limit stops there, and refuses a bad value', () => {
  const root = tmpRoot();
  seedRows(root, [row(V1, 'new'), row(V2, 'new')]);
  const h = harness(root, { ytdlp: (args) => (args[0] === '--version' ? { status: 0 } : { status: 0, stdout: metaJson(V1) }) });
  assert.equal(main(['meta', '--limit', '1'], h.ctx), EXIT.OK);
  assert.deepEqual(readQueue(root).map((r) => r.status), ['meta', 'new']);
  assert.equal(main(['meta', '--limit', 'x'], harness(root).ctx), EXIT.FATAL);
});

test('meta backs off exponentially on 429 and "Sign in", then succeeds', () => {
  const root = tmpRoot();
  seedRows(root, [row(V1, 'new')]);
  const answers = [
    { status: 1, stderr: 'ERROR: HTTP Error 429: Too Many Requests' },
    { status: 1, stderr: "ERROR: Sign in to confirm you're not a bot" },
    { status: 0, stdout: metaJson(V1) },
  ];
  const h = harness(root, { ytdlp: (args) => (args[0] === '--version' ? { status: 0 } : answers.shift()) });
  assert.equal(main(['meta'], h.ctx), EXIT.OK);
  assert.deepEqual(h.sleeps, [PACE_MS * 2, PACE_MS * 4]);
  assert.equal(readQueue(root)[0].status, 'meta');
});

test('a throttle that will not lift stops the run: no calls wasted, progress kept', () => {
  const root = tmpRoot();
  seedRows(root, [row(V1, 'new'), row(V2, 'new'), row(V3, 'new')]);
  let n = 0;
  const h = harness(root, {
    ytdlp: (args) => {
      if (args[0] === '--version') return { status: 0 };
      n++;
      return n === 1 ? { status: 0, stdout: metaJson(V1) } : { status: 1, stderr: 'HTTP Error 429' };
    },
  });
  assert.equal(main(['meta'], h.ctx), EXIT.FATAL);
  assert.deepEqual(readQueue(root).map((r) => r.status), ['meta', 'new', 'new']);
  assert.equal(n, 1 + 5, 'one good call, then the first try and four retries; V3 is never called');
  assert.match(h.err.join(''), /throttling/);
});

test('a kill mid-run loses only the video in flight', () => {
  const root = tmpRoot();
  seedRows(root, [row(V1, 'new'), row(V2, 'new')]);
  let n = 0;
  const h = harness(root, {
    ytdlp: (args) => {
      if (args[0] === '--version') return { status: 0 };
      if (++n === 2) throw new Error('killed');
      return { status: 0, stdout: metaJson(V1) };
    },
  });
  assert.equal(main(['meta'], h.ctx), EXIT.FATAL);
  assert.deepEqual(readQueue(root).map((r) => r.status), ['meta', 'new']);
});

test('a dead video is parked; a stray failure stays new with the error; the run goes on', () => {
  const root = tmpRoot();
  seedRows(root, [row(V1, 'new'), row(V2, 'new'), row(V3, 'new')]);
  const answers = [{ status: 1, stderr: 'ERROR: [youtube] x: Video unavailable' }, { status: 1, stderr: 'ERROR: something odd' }, { status: 0, stdout: metaJson(V3) }];
  const h = harness(root, { ytdlp: (args) => (args[0] === '--version' ? { status: 0 } : answers.shift()) });
  assert.equal(main(['meta'], h.ctx), EXIT.OK);
  const rows = readQueue(root);
  assert.equal(rows[0].status, 'parked');
  assert.match(rows[0].reason, /^unavailable/);
  assert.deepEqual([rows[1].status, rows[1].metaError], ['new', 'ERROR: something odd']);
  assert.equal(rows[2].status, 'meta');
});

test('no yt-dlp is could-not-run, never an empty queue', () => {
  const root = tmpRoot();
  seedRows(root, [row(V1, 'new')]);
  const h = harness(root, { ytdlp: () => ({ status: null, error: new Error('ENOENT') }) });
  assert.equal(main(['meta'], h.ctx), EXIT.FATAL);
  assert.equal(main(['transcripts'], h.ctx), EXIT.FATAL);
});

/* ------------------------------------------------------------- transcripts */

test('ingest exits map to queue statuses, with the reason', () => {
  const root = path.resolve('some-root');
  const ok = transcriptOutcome({ status: 0, stdout: JSON.stringify({ path: path.join('.ai', 'shift', 'transcripts', V1, `${V1}.clean.txt`), words: 900 }) }, root);
  assert.deepEqual(ok, { status: 'transcript', transcriptPath: `.ai/shift/transcripts/${V1}/${V1}.clean.txt`, words: 900 });
  assert.deepEqual(transcriptOutcome({ status: 3, stdout: '{}' }, root), { status: 'no-transcript', reason: 'thin' });
  assert.match(transcriptOutcome({ status: 2, stderr: 'research-ingest FATAL: yt-dlp wrote no captions for x\n  hint' }, root).reason, /^yt-dlp wrote no captions/);
  assert.match(transcriptOutcome({ status: 2, stderr: 'research-ingest FATAL: no captions\n Last error: HTTP Error 429' }, root).reason, /^throttled: /);
  assert.equal(transcriptOutcome({ status: null, error: new Error('ETIMEDOUT') }, root).reason, 'ETIMEDOUT');
});

test('transcripts is serial and paced, one failure blocks nothing, --limit bounds it', () => {
  const root = tmpRoot();
  seedRows(root, [row(V1, 'meta'), row(V2, 'meta'), row(V3, 'meta')]);
  const h = harness(root);
  h.ctx.ingest = (u, out) => {
    h.ingests.push([u, out.split(path.sep).join('/')]);
    return h.ingests.length === 1
      ? { status: 2, stderr: 'research-ingest FATAL: yt-dlp wrote no captions' }
      : { status: 0, stdout: JSON.stringify({ path: path.join(out, 'x.clean.txt'), words: 500 }) };
  };
  assert.equal(main(['transcripts', '--limit', '2'], h.ctx), EXIT.OK);
  assert.deepEqual(h.ingests[0], [url(V1), `.ai/shift/transcripts/${V1}`]);
  assert.deepEqual(h.sleeps, [PACE_MS]);
  assert.deepEqual(readQueue(root).map((r) => r.status), ['no-transcript', 'transcript', 'meta']);
});

test('a throttled video gets another turn; a video with no captions has had its answer', () => {
  const root = tmpRoot();
  seedRows(root, [row(V1, 'no-transcript', { reason: 'throttled: 429' }), row(V2, 'no-transcript', { reason: 'no captions' })]);
  const h = harness(root);
  h.ctx.ingest = (u, out) => { h.ingests.push(u); return { status: 0, stdout: JSON.stringify({ path: path.join(out, 'x.clean.txt'), words: 500 }) }; };
  assert.equal(main(['transcripts'], h.ctx), EXIT.OK);
  assert.deepEqual(h.ingests, [url(V1)]);
  const r = readQueue(root)[0];
  assert.equal(r.status, 'transcript');
  assert.equal(r.reason, undefined);
});

/* ------------------------------------------------------------- brief */

test('brief caps description and transcript, carries the note, skips the rest', () => {
  const root = tmpRoot();
  const tp = `.ai/shift/transcripts/${V1}/${V1}.clean.txt`;
  fs.mkdirSync(path.dirname(path.join(root, tp)), { recursive: true });
  fs.writeFileSync(path.join(root, tp), Array.from({ length: 2000 }, (_, i) => `w${i}`).join(' '));
  seedRows(root, [
    row(V1, 'transcript', { transcriptPath: tp, description: 'd'.repeat(2000), note: 'my note', date: '2026-11-01', duration: 60 }),
    row(V2, 'no-transcript', { reason: 'thin' }),
    row(V3, 'meta'),
    row('NewNoMeta01', 'new'),
    row(MINED, 'parked', { reason: 'already-mined' }),
  ]);
  const h = harness(root);
  assert.equal(main(['brief'], h.ctx), EXIT.OK);
  assert.match(h.out[0], /^\.ai\/shift\/plans\/plan-20261106-120000\/input\.json$/);
  const input = JSON.parse(fs.readFileSync(path.join(root, h.out[0]), 'utf8'));
  assert.deepEqual(input.videos.map((v) => v.id), [V1, V2, V3]);
  const v = input.videos[0];
  assert.equal(v.description.length, 800);
  assert.equal(v.transcriptOpening.split(' ').length, 1500);
  assert.equal(v.note, 'my note');
  assert.deepEqual(Object.keys(v).filter((k) => ['id', 'title', 'channel', 'date', 'duration'].includes(k)).length, 5);
  assert.equal(input.videos[1].reason, 'thin');
  assert.equal(input.videos[1].transcriptOpening, null);
  assert.match(h.err.join(''), /1 video\(s\) still have no metadata/);
});

test('a second brief in the same second does not overwrite the first', () => {
  const root = tmpRoot();
  seedRows(root, [row(V1, 'meta')]);
  const a = harness(root);
  const b = harness(root);
  main(['brief'], a.ctx);
  main(['brief'], b.ctx);
  assert.notEqual(a.out[0], b.out[0]);
});

test('brief with nothing to plan writes nothing', () => {
  const root = tmpRoot();
  const h = harness(root);
  assert.equal(main(['brief'], h.ctx), EXIT.OK);
  assert.ok(!fs.existsSync(path.join(root, '.ai', 'shift', 'plans')));
});

/* ------------------------------------------------------------- validate */

test('a correct plan has no violations', () => {
  assert.deepEqual(check(plan()), []);
});

test('voices counts authors, not videos: wrong count refused', () => {
  const v = check(plan([cluster({ voices: 3 })]));
  assert.ok(v.some((x) => /voices is 3 but its videos have 2 distinct/.test(x)), v.join('\n'));
});

test('two videos from one channel are one voice, however the name is cased', () => {
  const rows = [row(V1, 'meta', { channel: 'Same Channel' }), row(V2, 'meta', { channel: ' same channel ' })];
  assert.deepEqual(check(plan([cluster({ voices: 1 })]), { rows }), []);
  assert.ok(check(plan([cluster({ voices: 2 })]), { rows }).length);
});

test('a superseded video does not count as a voice', () => {
  const rows = [row(V1, 'meta'), row(V2, 'meta')];
  const c = cluster({ videos: [V1], voices: 1, superseded: [{ video: V2, by: V1, reason: 'newer covers it' }] });
  assert.deepEqual(check(plan([c]), { rows }), []);
  assert.ok(check(plan([{ ...c, voices: 2 }]), { rows }).some((x) => /voices/.test(x)));
});

test('a video with no recorded channel cannot be counted, so it is a violation', () => {
  const rows = [row(V1, 'new', { channel: null }), row(V2, 'meta')];
  assert.ok(check(plan(), { rows }).some((x) => /no recorded channel/.test(x)));
});

test('an orphan video is refused', () => {
  const v = check(plan([cluster({ videos: [V1], voices: 1 })]));
  assert.ok(v.some((x) => x.includes(`orphan video ${V2}`)), v.join('\n'));
});

test('a video in two places, or one the plan was not asked about, is refused', () => {
  const twice = check(plan([cluster(), cluster({ id: 'c2', videos: [V1], voices: 1 })]));
  assert.ok(twice.some((x) => x.includes(`video ${V1} appears 2 times`)), twice.join('\n'));
  const both = check(plan([cluster({ superseded: [{ video: V1, by: V2, reason: 'r' }] })]));
  assert.ok(both.some((x) => x.includes(`video ${V1} appears 2 times`)));
  const extra = check(plan([cluster({ videos: [V1, V2, V3], voices: 2 })]), { rows: [row(V1, 'meta'), row(V2, 'meta'), row(V3, 'meta', { channel: `ch-${V1}` })] });
  assert.ok(extra.some((x) => x.includes(`video ${V3} is not a video this plan`)));
});

test('a bad home is refused', () => {
  const v = check(plan([cluster({ homes: ['knowledge/dom/guessed/path.md'] })]));
  assert.ok(v.some((x) => /is not a file any research-map hit returns/.test(x)), v.join('\n'));
});

test('cluster and plan keys are exact', () => {
  const { estSeats, ...noSeats } = cluster();
  assert.ok(check(plan([noSeats])).some((x) => /missing key "estSeats"/.test(x)));
  assert.ok(check(plan([{ ...cluster(), score: 9 }])).some((x) => /unknown key "score"/.test(x)));
  assert.ok(check({ ...plan(), extra: 1 }).some((x) => /unknown key "extra"/.test(x)));
  assert.ok(check(plan([cluster(), cluster({ videos: [], voices: 0 })])).some((x) => /duplicate cluster id/.test(x)));
  assert.ok(check(plan([cluster({ superseded: [{ video: 'x', by: V1 }] })])).some((x) => /missing key "reason"/.test(x)));
  assert.ok(check('nope').length);
});

test('a supersession must name a kept video or something already mined, and give a reason', () => {
  const rows = [row(V1, 'meta'), row(V2, 'meta')];
  const c = (by, reason = 'r') => cluster({ videos: [V1], voices: 1, superseded: [{ video: V2, by, reason }] });
  assert.ok(check(plan([c('nobody-here')]), { rows }).some((x) => /neither a kept video/.test(x)));
  assert.deepEqual(check(plan([c(MINED)]), { rows, mined: new Set([MINED]) }), []);
  assert.ok(check(plan([c(V1, ' ')]), { rows }).some((x) => /reason must not be blank/.test(x)));
});

/* ------------------------------------------------------------- the CLI through a real plan */

function plannedRoot(clusters = [cluster({ id: 'c1', videos: [V1], voices: 1 }), cluster({ id: 'c2', videos: [V2], voices: 1, homes: [] })]) {
  const root = tmpRoot();
  seedRows(root, [row(V1, 'transcript'), row(V2, 'meta'), row(V3, 'no-transcript', { reason: 'thin', channel: `ch-${V1}` })]);
  const h = harness(root);
  main(['brief'], h.ctx);
  const planId = h.out[0].split('/')[3];
  const file = path.join(root, '.ai', 'shift', 'plans', planId, 'plan.json');
  fs.writeFileSync(file, JSON.stringify(plan(clusters, { planId })));
  return { root, planId, file };
}
const withV3 = () => [
  cluster({ id: 'c1', videos: [V1], voices: 1, superseded: [{ video: V3, by: V1, reason: 'same talk, newer' }] }),
  cluster({ id: 'c2', videos: [V2], voices: 1, homes: [`knowledge/dom/cat/subj/techniques/tech.md`] }),
];

test('validate reads the real index: subject and technique files pass, exit 1 lists the rest', () => {
  const { root, file } = plannedRoot(withV3());
  const good = harness(root);
  assert.equal(main(['validate', file], good.ctx), EXIT.OK, good.out.join('\n'));
  const bad = JSON.parse(fs.readFileSync(file, 'utf8'));
  bad.clusters[0].homes = ['knowledge/dom/cat/nope/nope.md'];
  bad.clusters[1].voices = 7;
  fs.writeFileSync(file, JSON.stringify(bad));
  const h = harness(root);
  assert.equal(main(['validate', file], h.ctx), EXIT.VIOLATIONS);
  assert.match(h.out.join('\n'), /2 violation/);
  assert.equal(main(['validate', path.join(root, 'absent.json')], harness(root).ctx), EXIT.FATAL);
  fs.writeFileSync(file, '{oops');
  assert.equal(main(['validate', file], harness(root).ctx), EXIT.VIOLATIONS);
});

test('a video synced after the brief does not orphan the plan already drawn from it', () => {
  const { root, file } = plannedRoot(withV3());
  const rows = readQueue(root);
  seedRows(root, [...rows, row('LateArrival', 'meta')]);
  assert.equal(main(['validate', file], harness(root).ctx), EXIT.OK);
});

test('render writes a local decision-first page and marks the videos planned', () => {
  const { root, planId } = plannedRoot(withV3());
  const h = harness(root);
  assert.equal(main(['render', planId], h.ctx), EXIT.OK, h.out.join('\n'));
  const html = fs.readFileSync(path.join(root, h.out[0]), 'utf8');
  assert.ok(html.indexOf('<table') < html.indexOf('approve '), 'decision before command');
  assert.ok(html.indexOf('approve ') < html.indexOf('<h2>Stats'), 'stats last');
  assert.match(html, /same talk, newer/);
  assert.doesNotMatch(html, /<(?:link|script|img)\b|src=/, 'no external assets');
  assert.deepEqual(readQueue(root).map((r) => r.status), ['planned', 'planned', 'planned']);
  assert.equal(main(['render', planId], harness(root).ctx), EXIT.OK, 'still valid once its videos are planned');
});

test('render escapes what YouTube wrote', () => {
  const html = renderPlanHtml(plan([cluster({ theme: '<script>x</script>' })]), [row(V1, 'meta', { title: '<img src=x onerror=y>' })]);
  assert.doesNotMatch(html, /<script>|<img/);
});

test('render and approve refuse a plan that fails validate, and leave the queue alone', () => {
  const { root, planId, file } = plannedRoot(withV3());
  const bad = JSON.parse(fs.readFileSync(file, 'utf8'));
  bad.clusters[0].voices = 9;
  fs.writeFileSync(file, JSON.stringify(bad));
  const before = fs.readFileSync(queuePath(root), 'utf8');
  assert.equal(main(['render', planId], harness(root).ctx), EXIT.VIOLATIONS);
  assert.equal(main(['approve', planId], harness(root).ctx), EXIT.VIOLATIONS);
  assert.equal(fs.readFileSync(queuePath(root), 'utf8'), before);
  assert.ok(!fs.existsSync(path.join(path.dirname(file), 'approved.json')));
  assert.equal(main(['render', '../evil'], harness(root).ctx), EXIT.FATAL, 'a planId is not a path');
});

test('approve: kept approved, struck cluster parked, superseded parked with who and why, none declined', () => {
  const { root, planId } = plannedRoot(withV3());
  main(['render', planId], harness(root).ctx);
  assert.equal(main(['approve', planId, '--strike', 'c2'], harness(root).ctx), EXIT.OK);
  const byId = Object.fromEntries(readQueue(root).map((r) => [r.id, r]));
  assert.deepEqual([byId[V1].status, byId[V1].cluster, byId[V1].planId], ['approved', 'c1', planId]);
  assert.deepEqual([byId[V2].status, byId[V2].reason], ['parked', 'operator-struck-cluster']);
  assert.deepEqual([byId[V3].status, byId[V3].reason], ['parked', `superseded by ${V1}: same talk, newer`]);
  assert.doesNotMatch(fs.readFileSync(queuePath(root), 'utf8'), /declined/);
});

test('approve twice changes nothing; an unknown strike changes nothing', () => {
  const { root, planId } = plannedRoot(withV3());
  assert.equal(main(['approve', planId, '--strike', 'nope'], harness(root).ctx), EXIT.FATAL);
  assert.deepEqual(readQueue(root).map((r) => r.status), ['transcript', 'meta', 'no-transcript']);
  assert.equal(main(['approve', planId], harness(root).ctx), EXIT.OK);
  const before = fs.readFileSync(queuePath(root), 'utf8');
  const h = harness(root);
  assert.equal(main(['approve', planId, '--strike', 'c1'], h.ctx), EXIT.OK);
  assert.match(h.out[0], /already approved/);
  assert.equal(fs.readFileSync(queuePath(root), 'utf8'), before);
});

test('approve does not resurrect a video the operator struck after the brief', () => {
  const { root, planId } = plannedRoot(withV3());
  const rows = readQueue(root);
  rows[1] = { ...rows[1], status: 'parked', reason: 'operator-struck' };
  seedRows(root, rows);
  assert.equal(main(['approve', planId], harness(root).ctx), EXIT.OK);
  assert.deepEqual([readQueue(root)[1].status, readQueue(root)[1].reason], ['parked', 'operator-struck']);
});

test('status counts every status in the closed set, zeros included', () => {
  const root = tmpRoot();
  seedRows(root, [row(V1, 'new'), row(V2, 'new'), row(V3, 'parked', { reason: 'r' })]);
  const h = harness(root);
  assert.equal(main(['status'], h.ctx), EXIT.OK);
  const s = JSON.parse(h.out[0]);
  assert.equal(s.total, 3);
  assert.deepEqual(s.status, { new: 2, meta: 0, transcript: 0, 'no-transcript': 0, planned: 0, approved: 0, mining: 0, landed: 0, parked: 1 });
});

test('usage errors are could-not-run', () => {
  const root = tmpRoot();
  for (const args of [[], ['bogus'], ['sync', '--nope'], ['validate'], ['render'], ['approve'], ['approve', 'no-such-plan']]) {
    assert.equal(main(args, harness(root).ctx), EXIT.FATAL, JSON.stringify(args));
  }
});
