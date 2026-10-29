// Shared access to a local Personas install for skills that must not depend on the app RUNNING.
//   reads  -> the app database, opened read-only (WAL-safe; never a second writer)
//   writes -> the app's own HTTP door when it is up, else a durable spool replayed by `sync`
// Zero dependencies: node:sqlite (node >= 22.5) and global fetch.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const HANDSHAKE = () => process.env.PERSONAS_HANDSHAKE || path.join(os.homedir(), '.personas', 'local-http.json');
export const SPOOL_DIR = () => process.env.PERSONAS_SPOOL || path.join(os.homedir(), '.personas', 'spool');

export function dbPath() {
  if (process.env.PERSONAS_DB) return process.env.PERSONAS_DB;
  const id = 'com.personas.desktop';
  if (process.platform === 'win32') return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), id, 'personas.db');
  if (process.platform === 'darwin') return path.join(os.homedir(), 'Library', 'Application Support', id, 'personas.db');
  return path.join(process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share'), id, 'personas.db');
}

export const norm = (p) => String(p ?? '').replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();

/** Open the app DB read-only. Returns null (never throws) when there is no DB or no node:sqlite. */
export async function openRO() {
  const p = dbPath();
  if (!fs.existsSync(p)) return null;
  try {
    const { DatabaseSync } = await import('node:sqlite');
    const db = new DatabaseSync(p, { readOnly: true });
    db.exec('PRAGMA busy_timeout = 5000');
    return db;
  } catch { return null; }
}

/** SELECT-only guard for the `sql` subcommand. The connection is read-only anyway; this fails fast and legibly. */
export function assertSelect(sql) {
  const s = String(sql).trim().replace(/;+\s*$/, '');
  if (!/^(select|with|pragma\s+table_info)\b/i.test(s) || /;/.test(s)) throw new Error('only a single SELECT/WITH statement is allowed');
  return s;
}

export async function query(sql, params = []) {
  const db = await openRO();
  if (!db) throw new Error(`no readable Personas database at ${dbPath()}`);
  try { return db.prepare(assertSelect(sql)).all(...params); } finally { db.close(); }
}

export async function findProject(repo) {
  const db = await openRO();
  if (!db) return null;
  try {
    const rows = db.prepare('SELECT id, name, root_path FROM dev_projects').all();
    return rows.find((r) => norm(r.root_path) === norm(repo)) ?? null;
  } catch { return null; } finally { db.close(); }
}

export function handshake() {
  try {
    const h = JSON.parse(fs.readFileSync(HANDSHAKE(), 'utf8'));
    return h && h.port && h.token ? h : null;
  } catch { return null; }
}

/** One call through the dev-tools door. Throws on non-2xx. */
export async function call(method, route, body, { timeoutMs = 20000 } = {}) {
  const h = handshake();
  if (!h) throw Object.assign(new Error('Personas is not running (no handshake)'), { code: 'APP_DOWN' });
  let res;
  try {
    res = await fetch(`http://127.0.0.1:${h.port}/dev-tools${route}`, {
      method,
      headers: { 'content-type': 'application/json', 'x-personas-local-token': h.token },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) { throw Object.assign(new Error(`Personas did not answer (${e.message})`), { code: 'APP_DOWN' }); }
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${route} -> ${res.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

export async function appUp() {
  try { await call('GET', '/projects', undefined, { timeoutMs: 1500 }); return true; } catch { return false; }
}

// ---- spool: append-only JSONL, latest line per id wins (same convention as the appmaster journal)
export const spoolFile = (name) => path.join(SPOOL_DIR(), `${name}.jsonl`);

export function appendSpool(name, rec) {
  fs.mkdirSync(SPOOL_DIR(), { recursive: true });
  fs.appendFileSync(spoolFile(name), JSON.stringify(rec) + '\n');
}

export function readSpool(name) {
  let raw; try { raw = fs.readFileSync(spoolFile(name), 'utf8'); } catch { return []; }
  const m = new Map();
  for (const l of raw.split('\n')) {
    if (!l.trim()) continue;
    try { const r = JSON.parse(l); m.set(r.id, { ...(m.get(r.id) ?? {}), ...r }); } catch { /* torn line: skip, earlier line intact */ }
  }
  return [...m.values()];
}

export const pending = (name) => readSpool(name).filter((r) => r.state !== 'done');
export const mintId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
