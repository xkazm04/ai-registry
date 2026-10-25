// narrate / music / env, offline. No network and no API key: every case either runs --dry
// or stops at a guard (budget, missing key) that fires before any request is made.
// ffmpeg/ffprobe on PATH are required (a tiny silent mp3 stands in for a synthesised clip).
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { FilmScript, clipHashInput, holdMs } from '../tools/src/contract.ts';
import { sha256 } from '../tools/lib/audio.mjs';
import { parseDotEnv, resolveEnv } from '../tools/lib/env.mjs';
import { pickNarrator } from '../tools/narrate.mjs';
import { beatEdges, musicHash, planCues, TAIL_MS } from '../tools/music.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOLS = path.resolve(HERE, '..', 'tools');
const FIXTURE = path.join(HERE, 'fixtures', 'film');

const roots = [];
after(() => {
  for (const r of roots) rmSync(r, { recursive: true, force: true });
});

/** A throwaway repo (with a .git marker so the .env walk stops there) holding a copy of the fixture film. */
function sandbox() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'demo-film-test-'));
  roots.push(root);
  mkdirSync(path.join(root, '.git'));
  const film = path.join(root, 'film');
  cpSync(FIXTURE, film, { recursive: true });
  return { root, film };
}

function cleanEnv(extra = {}) {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) if (!k.startsWith('ELEVENLABS_')) env[k] = v;
  return { ...env, ...extra };
}

function run(tool, args, env = cleanEnv(), preload = []) {
  const r = spawnSync(process.execPath, [...preload.flatMap((p) => ['--import', p]), path.join(TOOLS, tool), ...args], { encoding: 'utf8', env });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
}

/** A --import preload whose fetch always fails like a dropped connection: nothing leaves the machine. */
function offlineFetch(root) {
  const f = path.join(root, 'offline-fetch.mjs');
  writeFileSync(f, "globalThis.fetch = async (url) => { throw new TypeError(`offline stub: fetch ${url}`); };\n");
  return pathToFileURL(f).href;
}

const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));
const manifestOf = (film) => readJson(path.join(film, 'audio', 'manifest.json'));

function silentMp3(file, seconds) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', String(seconds), '-c:a', 'libmp3lame', '-b:a', '32k', file]);
}

/** Pre-seed audio/ with a clip per beat whose hash matches the CURRENT film.json (and `voiceId`). */
function seedClips(film, voiceId) {
  const script = FilmScript.parse(readJson(path.join(film, 'film.json')));
  mkdirSync(path.join(film, 'audio'), { recursive: true });
  const clips = {};
  for (const b of script.beats) {
    silentMp3(path.join(film, 'audio', `${b.id}.mp3`), 1);
    // ms deliberately wrong: narrate must re-measure the file, not trust the number.
    clips[b.id] = { file: `audio/${b.id}.mp3`, ms: 7, hash: sha256(clipHashInput(b.line, script.voice, voiceId ?? script.voice.voiceId)) };
  }
  writeFileSync(path.join(film, 'audio', 'manifest.json'), JSON.stringify({ clips, music: {}, estimated: [] }));
  return script;
}

test('dry run on the fixture: every beat estimated, the spend and held total printed', () => {
  const { film } = sandbox();
  const r = run('narrate.mjs', [film, '--dry']);
  assert.equal(r.code, 0, r.out);
  const m = manifestOf(film);
  assert.deepEqual(m.estimated, ['open', 'trade', 'close']);
  assert.deepEqual(m.clips, {});
  const script = FilmScript.parse(readJson(path.join(film, 'film.json')));
  const chars = script.beats.reduce((s, b) => s + b.line.length, 0);
  const held = script.beats.reduce((s, b) => s + holdMs(b, script.breathMs), 0);
  assert.match(r.out, new RegExp(`WOULD spend: ${chars}\\b`));
  assert.match(r.out, new RegExp(`\\(${held} ms\\) of maxMs`));
  assert.match(r.out, /open\s+\d+\s+estimated/);
});

test('editing ONE line invalidates exactly that clip; the others are measured by ffprobe', () => {
  const { film } = sandbox();
  seedClips(film);

  let r = run('narrate.mjs', [film, '--dry']);
  assert.equal(r.code, 0, r.out);
  let m = manifestOf(film);
  assert.deepEqual(m.estimated, [], 'all seeded clips are current');
  for (const id of ['open', 'trade', 'close']) {
    assert.ok(Math.abs(m.clips[id].ms - 1000) < 100, `${id} re-measured to ~1000 ms, got ${m.clips[id].ms}`);
  }
  assert.match(r.out, /WOULD spend: 0\b/);

  const filmJson = path.join(film, 'film.json');
  const script = readJson(filmJson);
  script.beats[1].line = 'The agent counters once more, and never goes past your ceiling.';
  writeFileSync(filmJson, JSON.stringify(script, null, 2));

  r = run('narrate.mjs', [film, '--dry']);
  assert.equal(r.code, 0, r.out);
  m = manifestOf(film);
  assert.deepEqual(m.estimated, ['trade']);
  assert.deepEqual(Object.keys(m.clips).sort(), ['close', 'open']);
  assert.match(r.out, /stale or unverifiable clips: trade/);
  assert.match(r.out, new RegExp(`WOULD spend: ${script.beats[1].line.length}\\b`));
});

test('a dry run that cannot resolve the voice keeps the clips it cannot verify (no re-spend later)', () => {
  // The voice id came from ELEVENLABS_VOICE_ID when the clips were made; a later --dry in a shell
  // without it cannot verify them. It must time them by estimate WITHOUT erasing their records:
  // erased, the next real run sees no prior clip and pays to synthesise every line again.
  const { film } = sandbox();
  const filmJson = path.join(film, 'film.json');
  const script = readJson(filmJson);
  delete script.voice.voiceId;
  writeFileSync(filmJson, JSON.stringify(script, null, 2));
  seedClips(film, 'envVoice01');

  let r = run('narrate.mjs', [film, '--dry']);
  assert.equal(r.code, 0, r.out);
  let m = manifestOf(film);
  assert.deepEqual(m.estimated, ['open', 'trade', 'close'], 'unverifiable clips are timed by estimate');
  assert.deepEqual(Object.keys(m.clips).sort(), ['close', 'open', 'trade'], 'their records survive the dry run');

  r = run('narrate.mjs', [film, '--dry'], cleanEnv({ ELEVENLABS_VOICE_ID: 'envVoice01' }));
  assert.equal(r.code, 0, r.out);
  m = manifestOf(film);
  assert.deepEqual(m.estimated, [], 'with the voice back, every clip is current again');
  assert.match(r.out, /WOULD spend: 0\b/);
});

test('a voice settings change invalidates every clip', () => {
  const { film } = sandbox();
  seedClips(film);
  const filmJson = path.join(film, 'film.json');
  const script = readJson(filmJson);
  script.voice.settings.stability = 0.3;
  writeFileSync(filmJson, JSON.stringify(script, null, 2));
  const r = run('narrate.mjs', [film, '--dry']);
  assert.equal(r.code, 0, r.out);
  assert.deepEqual(manifestOf(film).estimated, ['open', 'trade', 'close']);
});

test('over budget exits 4 before any key lookup or request', () => {
  const { film } = sandbox();
  const r = run('narrate.mjs', [film, '--budget', '10']);
  assert.equal(r.code, 4, r.out);
  assert.match(r.out, /over the 10 character budget/);
  assert.doesNotMatch(r.out, /key:/);
});

test('--only limits the spend to the named beats; an unknown id exits 1', () => {
  const { film } = sandbox();
  const r = run('narrate.mjs', [film, '--only', 'close', '--budget', '10']);
  assert.equal(r.code, 4, r.out);
  assert.match(r.out, /1 clip\(s\) to synthesise, 23 characters/);
  assert.equal(run('narrate.mjs', [film, '--only', 'nope', '--dry']).code, 1);
});

test('within budget but no key anywhere exits 2', () => {
  const { film } = sandbox();
  const r = run('narrate.mjs', [film]);
  assert.equal(r.code, 2, r.out);
  assert.match(r.out, /ELEVENLABS_API_KEY not found/);
});

test('all clips current: a real run needs no key and never prints one', () => {
  const { root, film } = sandbox();
  seedClips(film);
  writeFileSync(path.join(root, '.env'), 'ELEVENLABS_API_KEY=sk_test_never_print_me\n');
  const r = run('narrate.mjs', [film]);
  assert.equal(r.code, 0, r.out);
  assert.doesNotMatch(r.out, /sk_test_never_print_me/);
  assert.deepEqual(manifestOf(film).estimated, []);
});

test('an invalid film.json exits 1 with the contract path', () => {
  const { film } = sandbox();
  const filmJson = path.join(film, 'film.json');
  const script = readJson(filmJson);
  delete script.maxMs;
  writeFileSync(filmJson, JSON.stringify(script));
  const r = run('narrate.mjs', [film, '--dry']);
  assert.equal(r.code, 1);
  assert.match(r.out, /maxMs/);
});

// ---------------------------------------------------------------- env
test('parseDotEnv: export, quotes, comments', () => {
  const m = parseDotEnv('# c\nexport A=1\nB="two words"\nC=three # note\nD=\'q\'\nbad line\n');
  assert.equal(m.get('A'), '1');
  assert.equal(m.get('B'), 'two words');
  assert.equal(m.get('C'), 'three');
  assert.equal(m.get('D'), 'q');
  assert.equal(m.has('bad line'), false);
});

test('key resolution: environment, then the .env chain, then ELEVENLABS_ENV_FILE relative to its .env', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'demo-film-env-'));
  roots.push(root);
  const repo = path.join(root, 'paypal');
  const kp = path.join(root, 'kp');
  mkdirSync(path.join(repo, '.git'), { recursive: true });
  mkdirSync(path.join(repo, 'film'));
  mkdirSync(kp);
  writeFileSync(path.join(repo, '.env'), 'ELEVENLABS_ENV_FILE=../kp/.env.local\nOTHER=x\n');
  writeFileSync(path.join(kp, '.env.local'), 'ELEVENLABS_API_KEY=sk_from_pointer\n');

  const viaPointer = resolveEnv(path.join(repo, 'film'), { env: {} });
  assert.equal(viaPointer.key, 'sk_from_pointer');
  assert.equal(viaPointer.keySource, path.join(kp, '.env.local'));

  const viaEnv = resolveEnv(path.join(repo, 'film'), { env: { ELEVENLABS_API_KEY: 'sk_env' } });
  assert.equal(viaEnv.key, 'sk_env');
  assert.equal(viaEnv.keySource, 'environment');

  writeFileSync(path.join(repo, '.env'), 'ELEVENLABS_API_KEY=sk_repo\nELEVENLABS_ENV_FILE=../kp/.env.local\n');
  const viaRepo = resolveEnv(path.join(repo, 'film'), { env: {} });
  assert.equal(viaRepo.key, 'sk_repo', 'a key in the .env chain beats the pointer file');
  assert.equal(viaRepo.keySource, path.join(repo, '.env'));

  const viaEnvPointer = resolveEnv(path.join(root, 'elsewhere', 'film'), { env: { ELEVENLABS_ENV_FILE: path.join(kp, '.env.local') }, cwd: root });
  assert.equal(viaEnvPointer.key, 'sk_from_pointer');
});

test('library pick prefers a warm, confident English narrator', () => {
  const pick = pickNarrator([
    { voice_id: 'a', name: 'Kid', labels: { description: 'excited character', language: 'en' } },
    { voice_id: 'b', name: 'Sam', labels: { description: 'warm confident narrator', accent: 'american' }, category: 'premade' },
    { voice_id: 'c', name: 'Ana', labels: { description: 'calm' }, fine_tuning: { language: 'es' } },
  ]);
  assert.equal(pick.voice_id, 'b');
});

// ---------------------------------------------------------------- music
test('cue length is the hold span between its edges plus the fade tail', () => {
  const script = FilmScript.parse(readJson(path.join(FIXTURE, 'film.json')));
  const manifest = { clips: { open: { file: 'audio/open.mp3', ms: 3000, hash: 'h' } }, music: {}, estimated: ['trade', 'close'] };
  const edges = beatEdges(script, manifest);
  const holds = script.beats.map((b) => holdMs(b, script.breathMs, b.id === 'open' ? 3000 : undefined));
  assert.equal(edges.get('open').end, holds[0]);
  assert.equal(edges.get('close').end, holds[0] + holds[1] + holds[2]);
  const [p] = planCues(script, manifest);
  assert.equal(p.lengthMs, holds[0] + holds[1] + holds[2] + TAIL_MS);

  const backwards = { ...script, music: { cues: [{ ...script.music.cues[0], from: { beat: 'close', edge: 'end' }, to: { beat: 'open', edge: 'start' } }] } };
  assert.throws(() => planCues(backwards, manifest), /not after/);
  assert.notEqual(musicHash('p', 1000, 'music_v2_5'), musicHash('p', 1001, 'music_v2_5'));
});

test('music --dry reports cue lengths and sends nothing; over its budget exits 4', () => {
  const { film } = sandbox();
  const dry = run('music.mjs', [film, '--dry']);
  assert.equal(dry.code, 0, dry.out);
  assert.match(dry.out, /bed\s+0\s+\d+\s+\d+\s+to generate/);
  assert.match(dry.out, /dry run: nothing sent/);
  const over = run('music.mjs', [film, '--budget-ms', '1']);
  assert.equal(over.code, 4, over.out);
});

test('music --force whose regeneration fails keeps the current cue (as narrate keeps a current clip)', () => {
  const { root, film } = sandbox();
  const script = FilmScript.parse(readJson(path.join(film, 'film.json')));
  const base = { clips: {}, music: {}, estimated: script.beats.map((b) => b.id) };
  const [p] = planCues(script, base);
  mkdirSync(path.join(film, 'audio'), { recursive: true });
  silentMp3(path.join(film, 'audio', 'music-bed.mp3'), 1);
  const bed = { file: 'audio/music-bed.mp3', ms: 1000, hash: musicHash(p.cue.prompt, p.lengthMs, 'music_v2_5') };
  writeFileSync(path.join(film, 'audio', 'manifest.json'), JSON.stringify({ ...base, music: { bed } }));

  const r = run('music.mjs', [film, '--force', '--yes'], cleanEnv({ ELEVENLABS_API_KEY: 'sk_test_offline' }), [offlineFetch(root)]);
  assert.equal(r.code, 5, r.out);
  assert.match(r.out, /offline stub/, 'the request went to the stub, not the network');
  assert.deepEqual(manifestOf(film).music.bed, bed, 'a failed regeneration must not erase the cue that was current');
});
