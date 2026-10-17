// Shared helpers for narrate.mjs and music.mjs: ffprobe durations, hashes, the manifest
// file, the spend guard, a small worker pool and the ElevenLabs POST with one retry.
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export const API = 'https://api.elevenlabs.io/v1';

export const sha256 = (s) => createHash('sha256').update(String(s)).digest('hex');

/** Duration of a media file in integer milliseconds (ffprobe on PATH). */
export async function ffprobeMs(file) {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file,
  ]);
  const seconds = Number.parseFloat(stdout.trim());
  if (!Number.isFinite(seconds)) throw new Error(`ffprobe gave no duration for ${file}`);
  return Math.round(seconds * 1000);
}

export const manifestPath = (filmDir) => path.join(filmDir, 'audio', 'manifest.json');

/** The manifest on disk, validated against the contract; an empty one when absent or invalid. */
export async function readManifest(filmDir, AudioManifest) {
  const file = manifestPath(filmDir);
  if (existsSync(file)) {
    try {
      const parsed = AudioManifest.safeParse(JSON.parse(await readFile(file, 'utf8')));
      if (parsed.success) return parsed.data;
      console.error(`warn: ${file} does not match the contract; starting from an empty manifest`);
    } catch {
      console.error(`warn: ${file} is not JSON; starting from an empty manifest`);
    }
  }
  return { clips: {}, music: {}, estimated: [] };
}

export async function writeManifest(filmDir, manifest, AudioManifest) {
  const clean = AudioManifest.parse(manifest);
  await mkdir(path.join(filmDir, 'audio'), { recursive: true });
  await writeFile(manifestPath(filmDir), `${JSON.stringify(clean, null, 2)}\n`);
  return clean;
}

/** Spend guard: true when the run may spend `amount` against `budget`. */
export const withinBudget = (amount, budget, yes) => yes || amount <= budget;

export async function pool(items, limit, worker) {
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const i = next;
      next += 1;
      if (i >= items.length) return;
      await worker(items[i], i);
    }
  });
  await Promise.all(runners);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * POST JSON to an ElevenLabs endpoint and write the audio body to `file`.
 * One retry on a network error, 429 or 5xx (honouring retry-after). The key goes in the
 * header only and never into an error message.
 */
export async function postAudio({ url, apiKey, body, file, fetchImpl = fetch }) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let res;
    try {
      res = await fetchImpl(url, {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
        body: JSON.stringify(body),
      });
    } catch (err) {
      if (attempt === 0) {
        await sleep(2000);
        continue;
      }
      throw err;
    }
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length === 0) throw new Error('the API returned an empty body');
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, buf);
      return;
    }
    const retryable = res.status === 429 || res.status >= 500;
    const text = await res.text().catch(() => '');
    if (retryable && attempt === 0) {
      const after = Number(res.headers.get('retry-after'));
      await sleep(Number.isFinite(after) && after > 0 ? after * 1000 : 3000);
      continue;
    }
    throw new Error(`${res.status} ${res.statusText} ${text.slice(0, 300)}`);
  }
}

// ---------------------------------------------------------------- report helpers
export const pad = (s, n) => String(s).padEnd(n);
export const padLeft = (s, n) => String(s).padStart(n);
export function formatMs(ms) {
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function fail(code, message) {
  console.error(message);
  process.exit(code);
}

/** Read and validate <film-dir>/film.json. Exits 1 with the zod issues when invalid. */
export async function loadScript(filmDir, FilmScript) {
  const file = path.join(filmDir, 'film.json');
  if (!existsSync(file)) fail(1, `no film.json in ${filmDir}`);
  let raw;
  try {
    raw = JSON.parse(await readFile(file, 'utf8'));
  } catch (err) {
    fail(1, `${file} is not JSON: ${err.message}`);
  }
  const parsed = FilmScript.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    fail(1, `${file} does not match the FilmScript contract:\n${issues}`);
  }
  const ids = new Set();
  for (const b of parsed.data.beats) {
    if (!/^[A-Za-z0-9._-]+$/.test(b.id)) fail(1, `beat id ${JSON.stringify(b.id)} must be [A-Za-z0-9._-] (it names a file)`);
    if (ids.has(b.id)) fail(1, `duplicate beat id ${b.id}`);
    ids.add(b.id);
  }
  return parsed.data;
}
