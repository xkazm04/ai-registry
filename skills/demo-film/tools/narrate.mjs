#!/usr/bin/env node
/**
 * narrate: one ElevenLabs clip per film beat, measured, so the cut is paced by the voice.
 *
 *   node tools/narrate.mjs <film-dir> [--dry] [--only id,id] [--force] [--budget 8000] [--yes]
 *
 * Reads <film-dir>/film.json (FilmScript), writes <film-dir>/audio/<beatId>.mp3 and
 * <film-dir>/audio/manifest.json (AudioManifest). Clip.file is relative to <film-dir>.
 *
 * A clip is current only while sha256(clipHashInput(line, voice, voiceId)) matches the hash in
 * the manifest and its file exists; anything else is stale and is re-synthesised (or, with
 * --dry, listed in `estimated` with an estimateMs() length).
 *
 * Voice id: script.voice.voiceId -> ELEVENLABS_VOICE_ID (env / .env chain) -> the pick a
 * previous run saved in audio/voice.json -> a pick from the account library (warm, confident
 * narrator), saved to audio/voice.json so later runs stay on the same voice.
 *
 * Exit codes: 0 ok, 1 usage/script error, 2 no API key, 3 voice library problem,
 * 4 over the character budget (re-run with --yes), 5 one or more clips failed.
 */
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

import { AudioManifest, FilmScript, clipHashInput, estimateMs, holdMs } from './src/contract.ts';
import { resolveEnv } from './lib/env.mjs';
import {
  API, fail, ffprobeMs, formatMs, loadScript, pad, padLeft, pool, postAudio, readManifest,
  sha256, withinBudget, writeManifest,
} from './lib/audio.mjs';

const CONCURRENCY = 3;
const DEFAULT_BUDGET = 8000;

export function parseArgs(argv) {
  const args = { filmDir: null, dry: false, force: false, yes: false, only: null, budget: DEFAULT_BUDGET };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--dry') args.dry = true;
    else if (a === '--force') args.force = true;
    else if (a === '--yes' || a === '-y') args.yes = true;
    else if (a === '--only' || a.startsWith('--only=')) {
      const v = a === '--only' ? argv[(i += 1)] : a.slice('--only='.length);
      if (!v) throw new Error('--only needs a comma-separated list of beat ids');
      args.only = new Set(v.split(',').map((s) => s.trim()).filter(Boolean));
    } else if (a === '--budget' || a.startsWith('--budget=')) {
      const v = a === '--budget' ? argv[(i += 1)] : a.slice('--budget='.length);
      const n = Number(v);
      if (!Number.isInteger(n) || n < 0) throw new Error(`--budget needs a non-negative integer, got ${v}`);
      args.budget = n;
    } else if (a === '--help' || a === '-h') args.help = true;
    else if (a.startsWith('-')) throw new Error(`unknown argument: ${a}`);
    else if (!args.filmDir) args.filmDir = a;
    else throw new Error(`unexpected argument: ${a}`);
  }
  return args;
}

export const clipHash = (beat, voice, voiceId) => sha256(clipHashInput(beat.line, voice, voiceId));
export const clipFile = (beatId) => `audio/${beatId}.mp3`;

/**
 * Which beats have a current clip. With no voiceId nothing can be verified, so nothing is
 * current. Returns Map<beatId, clip> of current clips.
 */
export function currentClips(script, manifest, voiceId, filmDir) {
  const current = new Map();
  if (!voiceId) return current;
  for (const beat of script.beats) {
    const clip = manifest.clips[beat.id];
    if (!clip) continue;
    if (clip.hash !== clipHash(beat, script.voice, voiceId)) continue;
    if (!existsSync(path.join(filmDir, clip.file))) continue;
    current.set(beat.id, clip);
  }
  return current;
}

// ---------------------------------------------------------------- voice library pick
const norm = (s) => String(s ?? '').trim().toLowerCase();
function labelText(v) {
  return norm([v.name, v.description, ...Object.values(v.labels ?? {})].filter(Boolean).join(' '));
}
export function narratorScore(v) {
  const t = labelText(v);
  let score = 0;
  const lang = norm(v.fine_tuning?.language ?? v.language ?? '');
  if (!lang || lang.startsWith('en')) score += 3;
  if (/english|american|british|transatlantic/.test(t)) score += 1;
  if (norm(v.category) === 'premade') score += 1;
  if (/narrat|storytell|documentar|informativ/.test(t)) score += 6;
  if (/warm|confident/.test(t)) score += 4;
  if (/calm|clear|measured|deep|professional|engaging/.test(t)) score += 2;
  if (/excited|hyped|whisper|character|child|old|meditat|asmr/.test(t)) score -= 4;
  return score;
}
export function pickNarrator(voices) {
  let best = null;
  let bestScore = -Infinity;
  for (const v of voices) {
    const s = narratorScore(v);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }
  return best;
}

async function listVoices(apiKey) {
  const res = await fetch(`${API}/voices`, { headers: { 'xi-api-key': apiKey } });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    fail(3, `GET /v1/voices failed: ${res.status} ${res.statusText} ${body.slice(0, 300)}`);
  }
  const json = await res.json();
  const voices = Array.isArray(json.voices) ? json.voices : [];
  if (voices.length === 0) fail(3, 'the account library returned no voices');
  return voices;
}

async function savedVoice(filmDir) {
  const file = path.join(filmDir, 'audio', 'voice.json');
  if (!existsSync(file)) return null;
  try {
    const v = JSON.parse(await readFile(file, 'utf8'));
    return typeof v.voiceId === 'string' && v.voiceId ? v : null;
  } catch {
    return null;
  }
}

/** Local voice id sources only (no network). */
async function localVoiceId(script, env, filmDir) {
  if (script.voice.voiceId) return { voiceId: script.voice.voiceId, from: 'film.json voice.voiceId' };
  const fromEnv = env.get('ELEVENLABS_VOICE_ID');
  if (fromEnv) return { voiceId: fromEnv, from: `ELEVENLABS_VOICE_ID (${env.source('ELEVENLABS_VOICE_ID')})` };
  const saved = await savedVoice(filmDir);
  if (saved) return { voiceId: saved.voiceId, from: `audio/voice.json (${saved.name ?? 'saved pick'})` };
  return null;
}

// ---------------------------------------------------------------- report
export function summarise(script, manifest) {
  const rows = script.beats.map((b) => {
    const clip = manifest.clips[b.id];
    const measured = clip && !manifest.estimated.includes(b.id);
    const ms = measured ? clip.ms : estimateMs(b.line);
    return { id: b.id, ms, kind: measured ? 'measured' : 'estimated', hold: holdMs(b, script.breathMs, measured ? clip.ms : undefined) };
  });
  return { rows, totalMs: rows.reduce((s, r) => s + r.hold, 0) };
}

function printSummary(script, manifest) {
  const { rows, totalMs } = summarise(script, manifest);
  const w = Math.max(6, ...rows.map((r) => r.id.length + 2));
  console.log(`${pad('beat', w)}${padLeft('ms', 7)}  ${pad('timing', 10)}${padLeft('hold ms', 8)}`);
  for (const r of rows) console.log(`${pad(r.id, w)}${padLeft(r.ms, 7)}  ${pad(r.kind, 10)}${padLeft(r.hold, 8)}`);
  console.log('');
  console.log(`film length (sum of holds): ${formatMs(totalMs)} (${totalMs} ms) of maxMs ${script.maxMs} ms`);
  if (totalMs > script.maxMs) {
    console.log(`WARN: the film is ${totalMs - script.maxMs} ms over script.maxMs; cut lines or settles.`);
  }
  return totalMs;
}

// ---------------------------------------------------------------- main
export async function main(argv = process.argv.slice(2)) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (err) {
    fail(1, err.message);
  }
  if (args.help || !args.filmDir) {
    console.log('node tools/narrate.mjs <film-dir> [--dry] [--only id,id] [--force] [--budget 8000] [--yes]');
    process.exit(args.help ? 0 : 1);
  }
  const filmDir = path.resolve(args.filmDir);
  const script = await loadScript(filmDir, FilmScript);
  if (args.only) {
    const known = new Set(script.beats.map((b) => b.id));
    for (const id of args.only) if (!known.has(id)) fail(1, `--only names an unknown beat: ${id}`);
  }
  const inScope = (b) => !args.only || args.only.has(b.id);

  const env = resolveEnv(filmDir);
  const prior = await readManifest(filmDir, AudioManifest);
  let voice = await localVoiceId(script, env, filmDir);

  // Without --dry and without a local voice id, the library pick needs the key first.
  let apiKey;
  const needKey = () => {
    if (!env.key) {
      fail(2, 'ELEVENLABS_API_KEY not found (environment, .env files from the film dir up to the git root, or ELEVENLABS_ENV_FILE).');
    }
    console.log(`key: ELEVENLABS_API_KEY from ${env.keySource}`);
    return env.key;
  };
  if (!voice && !args.dry) {
    apiKey = needKey();
    const pick = pickNarrator(await listVoices(apiKey));
    if (!pick) fail(3, 'no voice in the account library to cast the narrator');
    await mkdir(path.join(filmDir, 'audio'), { recursive: true });
    await writeFile(path.join(filmDir, 'audio', 'voice.json'), `${JSON.stringify({ voiceId: pick.voice_id, name: pick.name }, null, 2)}\n`);
    voice = { voiceId: pick.voice_id, from: `library pick ${pick.name} (saved to audio/voice.json)` };
  }
  console.log(voice ? `voice: ${voice.voiceId} from ${voice.from}; model ${script.voice.model}` : 'voice: unresolved (dry run, no voiceId); existing clips cannot be verified');

  const current = currentClips(script, prior, voice?.voiceId, filmDir);
  const todo = script.beats.filter((b) => inScope(b) && (args.force || !current.has(b.id)));
  const chars = todo.reduce((s, b) => s + b.line.length, 0);
  const stale = script.beats.filter((b) => prior.clips[b.id] && !current.has(b.id)).map((b) => b.id);
  if (stale.length) console.log(`stale or unverifiable clips: ${stale.join(', ')}`);

  // Re-measure current clips: the file on disk is the truth, not the number we wrote last time.
  const clips = {};
  for (const [id, clip] of current) {
    let ms = clip.ms;
    try {
      ms = await ffprobeMs(path.join(filmDir, clip.file));
    } catch (err) {
      console.error(`warn: ffprobe failed on ${clip.file} (${err.message}); keeping manifest ms`);
    }
    if (ms > 0) clips[id] = { ...clip, ms };
  }

  if (args.dry) {
    const manifest = await writeManifest(
      filmDir,
      { clips, music: prior.music, estimated: script.beats.filter((b) => !clips[b.id]).map((b) => b.id) },
      AudioManifest,
    );
    console.log(`dry run: ${todo.length} clip(s) to synthesise, ElevenLabs characters it WOULD spend: ${chars} (budget ${args.budget})`);
    console.log('');
    printSummary(script, manifest);
    return 0;
  }

  console.log(`${todo.length} clip(s) to synthesise, ${chars} characters to spend (budget ${args.budget}).`);
  if (!withinBudget(chars, args.budget, args.yes)) {
    fail(4, `${chars} characters is over the ${args.budget} character budget. Re-run with --yes to spend it, or --budget N.`);
  }

  const failures = [];
  if (todo.length) {
    apiKey ??= needKey();
    const s = script.voice.settings;
    await pool(todo, CONCURRENCY, async (beat) => {
      const rel = clipFile(beat.id);
      const file = path.join(filmDir, rel);
      try {
        await postAudio({
          url: `${API}/text-to-speech/${encodeURIComponent(voice.voiceId)}?output_format=mp3_44100_128`,
          apiKey,
          file,
          body: {
            text: beat.line,
            model_id: script.voice.model,
            voice_settings: { stability: s.stability, similarity_boost: s.similarity, style: s.style, use_speaker_boost: true },
          },
        });
        const ms = await ffprobeMs(file);
        clips[beat.id] = { file: rel, ms, hash: clipHash(beat, script.voice, voice.voiceId) };
        console.log(`  ok   ${pad(beat.id, 12)} ${beat.line.length} chars, ${ms} ms`);
      } catch (err) {
        failures.push(beat.id);
        console.error(`  FAIL ${pad(beat.id, 12)} ${String(err?.message ?? err)}`);
      }
    });
    console.log('');
  }

  const manifest = await writeManifest(
    filmDir,
    { clips, music: prior.music, estimated: script.beats.filter((b) => !clips[b.id]).map((b) => b.id) },
    AudioManifest,
  );
  printSummary(script, manifest);
  if (failures.length) fail(5, `\n${failures.length} clip(s) failed: ${failures.join(', ')}`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(String(err?.stack ?? err));
    process.exit(1);
  });
}
