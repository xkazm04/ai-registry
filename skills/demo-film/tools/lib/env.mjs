// Key and setting resolution for the demo-film tools. The API key is never printed:
// callers get the value plus WHERE it came from (a path or "environment"), and only the
// source is ever logged.
//
// Order (first hit wins, per variable):
//   1. process.env
//   2. .env files from <film-dir>/.. walking up to the git root (nearest first)
//   3. the file named by ELEVENLABS_ENV_FILE, found in process.env (relative to cwd) or in
//      one of those .env files (relative to the .env file that names it)
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/** Minimal dotenv: KEY=value, optional `export `, optional matching quotes, # comments. */
export function parseDotEnv(text) {
  const out = new Map();
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim().replace(/^export\s+/, '');
    let value = line.slice(eq + 1).trim();
    const q = value[0];
    if ((q === '"' || q === "'") && value.length > 1 && value.endsWith(q)) value = value.slice(1, -1);
    else {
      const hash = value.search(/\s#/);
      if (hash !== -1) value = value.slice(0, hash).trim();
    }
    out.set(key, value);
  }
  return out;
}

/** .env candidates: <film-dir>/.. upward, stopping at (and including) the git root. */
export function envFileChain(filmDir) {
  const files = [];
  let dir = path.resolve(filmDir, '..');
  for (;;) {
    files.push(path.join(dir, '.env'));
    if (existsSync(path.join(dir, '.git'))) break;
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return files;
}

function readEnvFile(file) {
  if (!existsSync(file)) return null;
  try {
    return parseDotEnv(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Resolve the demo-film environment for a film directory.
 * Returns { get(name) -> value|undefined, source(name) -> where it came from|undefined,
 *           key, keySource, files } where `files` lists the files that were read.
 */
export function resolveEnv(filmDir, { env = process.env, cwd = process.cwd() } = {}) {
  /** name -> { value, source } ; first writer wins */
  const vars = new Map();
  const files = [];
  const put = (k, v, source) => {
    if (v === undefined || v === '' || vars.has(k)) return;
    vars.set(k, { value: v, source });
  };
  for (const [k, v] of Object.entries(env)) put(k, v, 'environment');

  // ELEVENLABS_ENV_FILE pointers, resolved against whoever named them.
  const pointers = [];
  if (env.ELEVENLABS_ENV_FILE) pointers.push(path.resolve(cwd, env.ELEVENLABS_ENV_FILE));

  for (const file of envFileChain(filmDir)) {
    const parsed = readEnvFile(file);
    if (!parsed) continue;
    files.push(file);
    for (const [k, v] of parsed) put(k, v, file);
    const ptr = parsed.get('ELEVENLABS_ENV_FILE');
    if (ptr) pointers.push(path.resolve(path.dirname(file), ptr));
  }
  for (const file of pointers) {
    const parsed = readEnvFile(file);
    if (!parsed) continue;
    files.push(file);
    for (const [k, v] of parsed) put(k, v, file);
  }

  const key = vars.get('ELEVENLABS_API_KEY');
  return {
    get: (name) => vars.get(name)?.value,
    source: (name) => vars.get(name)?.source,
    key: key?.value,
    keySource: key?.source,
    files,
  };
}
