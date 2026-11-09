#!/usr/bin/env node
/**
 * vault-ledger - append-only run records in the Obsidian vault's Daybreak/ folder.
 *
 * WHY: daybreak learns across runs, and the memory lives in the operator's vault, not in
 * the registry (run output is machine-local and private). Two runs on one day must never
 * overwrite each other, and a bad slug must never write outside Daybreak/.
 *
 *   node vault-ledger.mjs append-run --record <json-file> [--note <md-file>]
 *   node vault-ledger.mjs last-sweeps
 *
 * Vault root: env DAYBREAK_VAULT, else the first vault in %APPDATA%/obsidian/obsidian.json.
 * Layout: Daybreak/runs/<YYYY-MM-DD[-n]>.md and Daybreak/ledger.jsonl (one JSON line per run).
 * A run record is {ts, project, ...}; absent values are omitted, never 0.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { EXIT, installCrashDoor } from '../../../scripts/lib/exit-codes.mjs';

export function vaultRoot(env = process.env) {
  if (env.DAYBREAK_VAULT) return env.DAYBREAK_VAULT;
  const appData = env.APPDATA ?? path.join(os.homedir(), 'AppData', 'Roaming');
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(appData, 'obsidian', 'obsidian.json'), 'utf8'));
    const first = Object.values(cfg.vaults ?? {})[0];
    if (first?.path) return first.path;
  } catch { /* fall through */ }
  return null;
}

/** Resolve a path under <vault>/Daybreak, refusing anything that escapes it. */
export function safeJoin(vault, ...parts) {
  const base = path.resolve(vault, 'Daybreak');
  const target = path.resolve(base, ...parts);
  const rel = path.relative(base, target);
  if (rel === '..' || rel.startsWith('..' + path.sep) || path.isAbsolute(rel)) {
    throw new Error(`refusing to write outside Daybreak/: ${parts.join('/')}`);
  }
  return target;
}

const ymd = (d) => d.toISOString().slice(0, 10);

/** Write a new note named <date>.md, <date>-2.md, ... never overwriting (wx flag). */
export function appendRun({ vault, record, note = '', now = () => new Date() }) {
  if (!vault) throw new Error('no vault: set DAYBREAK_VAULT');
  const date = ymd(now());
  const runsDir = safeJoin(vault, 'runs');
  fs.mkdirSync(runsDir, { recursive: true });
  let file = null;
  for (let n = 1; n < 1000 && !file; n++) {
    const name = n === 1 ? `${date}.md` : `${date}-${n}.md`;
    const p = safeJoin(vault, 'runs', name);
    try {
      fs.writeFileSync(p, `# Daybreak ${date}\n\n${note}\n\n\`\`\`json\n${JSON.stringify(record)}\n\`\`\`\n`, { flag: 'wx' });
      file = p;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
    }
  }
  if (!file) throw new Error('no free run note name today');
  const line = JSON.stringify({ ts: now().toISOString(), ...record });
  fs.appendFileSync(safeJoin(vault, 'ledger.jsonl'), line + '\n');
  return file;
}

/** Write a new note in Daybreak/<dir>/ named <date>[-n].md, never overwriting. */
export function writeNewNote({ vault, dir, title, body, now = () => new Date() }) {
  const date = ymd(now());
  fs.mkdirSync(safeJoin(vault, dir), { recursive: true });
  for (let n = 1; n < 1000; n++) {
    const p = safeJoin(vault, dir, n === 1 ? `${date}.md` : `${date}-${n}.md`);
    try {
      fs.writeFileSync(p, `# ${title} ${date}\n\n${body}\n`, { flag: 'wx' });
      return p;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
    }
  }
  throw new Error(`no free note name today in ${dir}`);
}

/** A census reads and fixes nothing, so it must not reset a project's sweep age. */
export const lastSweeps = (vault) => latestBy(vault, (r) => r.strategy !== 'census');
export const lastCensuses = (vault) => latestBy(vault, (r) => r.strategy === 'census');

/** Latest ts per project from ledger.jsonl among matching records. Returns {slug: isoDate}. */
function latestBy(vault, keep) {
  const out = {};
  if (!vault) return out;
  let text = '';
  try { text = fs.readFileSync(safeJoin(vault, 'ledger.jsonl'), 'utf8'); } catch { return out; }
  for (const l of text.split('\n')) {
    if (!l.trim()) continue;
    let r;
    try { r = JSON.parse(l); } catch { continue; }
    if (!r.project || !r.ts || !keep(r)) continue;
    if (!out[r.project] || r.ts > out[r.project]) out[r.project] = r.ts;
  }
  return out;
}

function main() {
  installCrashDoor();
  const [cmd, ...rest] = process.argv.slice(2);
  const arg = (n) => { const i = rest.indexOf(n); return i >= 0 ? rest[i + 1] : null; };
  const vault = vaultRoot();
  if (!vault) { console.error('FATAL: no vault (set DAYBREAK_VAULT)'); process.exit(EXIT.FATAL); }
  if (cmd === 'append-run') {
    const rec = arg('--record');
    if (!rec) { console.error('usage: append-run --record <json-file> [--note <md-file>]'); process.exit(EXIT.FATAL); }
    const record = JSON.parse(fs.readFileSync(rec, 'utf8'));
    const noteFile = arg('--note');
    console.log(appendRun({ vault, record, note: noteFile ? fs.readFileSync(noteFile, 'utf8') : '' }));
    process.exit(EXIT.OK);
  }
  if (cmd === 'last-sweeps') {
    console.log(JSON.stringify(lastSweeps(vault), null, 2));
    process.exit(EXIT.OK);
  }
  console.error('usage: vault-ledger.mjs append-run|last-sweeps');
  process.exit(EXIT.FATAL);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
