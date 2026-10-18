#!/usr/bin/env node
/**
 * music: one instrumental ElevenLabs music clip per script.music.cues[] entry (max 3).
 *
 *   node tools/music.mjs <film-dir> [--dry] [--force] [--yes] [--budget-ms 120000]
 *
 * Run after narrate: a cue's length is the span between its from/to edges on the timeline of
 * holds (holdMs per beat from audio/manifest.json, estimates where a beat has no clip), plus a
 * 2000 ms tail for the fade. Writes <film-dir>/audio/music-<cueId>.mp3 and manifest.music.
 *
 * Endpoint (verified against the ElevenLabs API reference, 2026-10-18):
 *   POST https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128
 *   { prompt, music_length_ms (3000..600000), model_id, force_instrumental: true }
 * model_id defaults to music_v2_5; override with ELEVENLABS_MUSIC_MODEL.
 *
 * Staleness: hash = sha256(prompt|lengthMs|model). A narration change that moves an edge
 * changes lengthMs, so the cue is regenerated.
 *
 * Exit codes: 0 ok, 1 usage/script error, 2 no API key, 4 over the music budget
 * (total ms to generate > --budget-ms, default 120000; re-run with --yes), 5 a cue failed.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

import { AudioManifest, FilmScript, holdMs } from './src/contract.ts';
import { resolveEnv } from './lib/env.mjs';
import { isMain } from './lib/entry.mjs';
import {
  API, fail, ffprobeMs, formatMs, loadScript, pad, padLeft, postAudio, readManifest, sha256,
  withinBudget, writeManifest,
} from './lib/audio.mjs';

export const TAIL_MS = 2000;
export const MAX_CUES = 3;
export const MIN_MUSIC_MS = 3000;
export const MAX_MUSIC_MS = 600000;
export const DEFAULT_MUSIC_MODEL = 'music_v2_5';
export const MUSIC_ENDPOINT = `${API}/music`;
const DEFAULT_BUDGET_MS = 120000;

export function parseArgs(argv) {
  const args = { filmDir: null, dry: false, force: false, yes: false, budgetMs: DEFAULT_BUDGET_MS };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--dry') args.dry = true;
    else if (a === '--force') args.force = true;
    else if (a === '--yes' || a === '-y') args.yes = true;
    else if (a === '--budget-ms' || a.startsWith('--budget-ms=')) {
      const v = a === '--budget-ms' ? argv[(i += 1)] : a.slice('--budget-ms='.length);
      const n = Number(v);
      if (!Number.isInteger(n) || n < 0) throw new Error(`--budget-ms needs a non-negative integer, got ${v}`);
      args.budgetMs = n;
    } else if (a === '--help' || a === '-h') args.help = true;
    else if (a.startsWith('-')) throw new Error(`unknown argument: ${a}`);
    else if (!args.filmDir) args.filmDir = a;
    else throw new Error(`unexpected argument: ${a}`);
  }
  return args;
}

/** Beat edges on the hold timeline: Map<beatId, {start, end}> in ms from film start. */
export function beatEdges(script, manifest) {
  const edges = new Map();
  let t = 0;
  for (const b of script.beats) {
    const clip = manifest.clips[b.id];
    const clipMs = clip && !manifest.estimated.includes(b.id) ? clip.ms : undefined;
    const h = holdMs(b, script.breathMs, clipMs);
    edges.set(b.id, { start: t, end: t + h });
    t += h;
  }
  return edges;
}

/** Cue plan: [{cue, fromMs, toMs, lengthMs}]; throws on unknown beats or an empty span. */
export function planCues(script, manifest) {
  const cues = script.music?.cues ?? [];
  if (cues.length > MAX_CUES) throw new Error(`${cues.length} music cues; the guard is ${MAX_CUES}`);
  const edges = beatEdges(script, manifest);
  return cues.map((cue) => {
    const at = (e) => {
      const b = edges.get(e.beat);
      if (!b) throw new Error(`cue ${cue.id}: unknown beat ${e.beat}`);
      return b[e.edge];
    };
    const fromMs = at(cue.from);
    const toMs = at(cue.to);
    if (toMs <= fromMs) throw new Error(`cue ${cue.id}: "to" (${toMs} ms) is not after "from" (${fromMs} ms)`);
    const lengthMs = Math.min(MAX_MUSIC_MS, Math.max(MIN_MUSIC_MS, toMs - fromMs + TAIL_MS));
    return { cue, fromMs, toMs, lengthMs };
  });
}

export const musicHash = (prompt, lengthMs, model) => sha256([prompt, lengthMs, model].join('|'));
export const musicFile = (cueId) => `audio/music-${cueId}.mp3`;

export async function main(argv = process.argv.slice(2)) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (err) {
    fail(1, err.message);
  }
  if (args.help || !args.filmDir) {
    console.log('node tools/music.mjs <film-dir> [--dry] [--force] [--yes] [--budget-ms 120000]');
    process.exit(args.help ? 0 : 1);
  }
  const filmDir = path.resolve(args.filmDir);
  const script = await loadScript(filmDir, FilmScript);
  const manifest = await readManifest(filmDir, AudioManifest);
  if (Object.keys(manifest.clips).length === 0) {
    console.log('note: no narration clips in audio/manifest.json; cue lengths use estimates (run narrate first).');
  }
  let plan;
  try {
    plan = planCues(script, manifest);
  } catch (err) {
    fail(1, err.message);
  }
  if (plan.length === 0) {
    console.log('film.json has no music cues; nothing to do.');
    return 0;
  }

  const env = resolveEnv(filmDir);
  const model = env.get('ELEVENLABS_MUSIC_MODEL') ?? DEFAULT_MUSIC_MODEL;
  const music = {};
  const todo = [];
  for (const p of plan) {
    const hash = musicHash(p.cue.prompt, p.lengthMs, model);
    const prior = manifest.music[p.cue.id];
    const current = prior && prior.hash === hash && existsSync(path.join(filmDir, prior.file));
    if (current && !args.force) music[p.cue.id] = prior;
    else todo.push({ ...p, hash });
  }

  console.log(`${pad('cue', 12)}${padLeft('from', 8)}${padLeft('to', 8)}${padLeft('length', 9)}  state`);
  for (const p of plan) {
    const state = music[p.cue.id] ? 'current' : 'to generate';
    console.log(`${pad(p.cue.id, 12)}${padLeft(p.fromMs, 8)}${padLeft(p.toMs, 8)}${padLeft(p.lengthMs, 9)}  ${state}`);
  }
  const spendMs = todo.reduce((s, p) => s + p.lengthMs, 0);
  console.log(`\nmodel ${model}; ${todo.length} cue(s) to generate, ${formatMs(spendMs)} (${spendMs} ms) of music (budget ${args.budgetMs} ms).`);

  // Cues dropped from the script leave the manifest; their files stay on disk.
  if (args.dry) {
    console.log('dry run: nothing sent.');
    return 0;
  }
  if (!withinBudget(spendMs, args.budgetMs, args.yes)) {
    fail(4, `${spendMs} ms of music is over the ${args.budgetMs} ms budget. Re-run with --yes to spend it.`);
  }

  const failures = [];
  if (todo.length) {
    if (!env.key) fail(2, 'ELEVENLABS_API_KEY not found (environment, .env chain, or ELEVENLABS_ENV_FILE).');
    console.log(`key: ELEVENLABS_API_KEY from ${env.keySource}`);
    for (const p of todo) {
      const rel = musicFile(p.cue.id);
      const file = path.join(filmDir, rel);
      try {
        await postAudio({
          url: `${MUSIC_ENDPOINT}?output_format=mp3_44100_128`,
          apiKey: env.key,
          file,
          body: { prompt: p.cue.prompt, music_length_ms: p.lengthMs, model_id: model, force_instrumental: true },
        });
        const ms = await ffprobeMs(file);
        music[p.cue.id] = { file: rel, ms, hash: p.hash };
        console.log(`  ok   ${pad(p.cue.id, 12)} ${ms} ms`);
      } catch (err) {
        failures.push(p.cue.id);
        console.error(`  FAIL ${pad(p.cue.id, 12)} ${String(err?.message ?? err)}`);
      }
    }
  }
  // Re-read so a concurrent narrate result is not overwritten with the copy read at start.
  const latest = await readManifest(filmDir, AudioManifest);
  await writeManifest(filmDir, { ...latest, music }, AudioManifest);
  if (failures.length) fail(5, `${failures.length} cue(s) failed: ${failures.join(', ')}`);
  return 0;
}

if (isMain(import.meta.url)) {
  main().catch((err) => {
    console.error(String(err?.stack ?? err));
    process.exit(1);
  });
}
