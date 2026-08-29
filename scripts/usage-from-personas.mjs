#!/usr/bin/env node
/**
 * usage-from-personas — bootstrap writer for the `usage/` lane from a Personas installation.
 *
 * The Personas desktop app already counts every skill invocation it can see (it mines the
 * harness's session transcripts into `skill_usage_events`) and already ships the writer for
 * this lane (`dev_tools_write_registry_usage`, run from Dev Tools once the registry is
 * paired). This script is the SAME query, run from the registry side, for the case where
 * the app is installed but the pairing has not been clicked yet - so the lane can carry its
 * first honest counts today instead of waiting on a UI step. It reads the app's SQLite
 * database READ-ONLY (node:sqlite, no dependency), groups by skill name ALONE (the privacy
 * contract: no project, no path, no session), and writes `usage/<contributor>.json`.
 *
 * Once the app is paired, let the app be the writer and retire this; two writers for one
 * contributor file is the failure the per-contributor shape exists to prevent, which is
 * why this script refuses to overwrite a file whose `app` is not its own unless --force.
 *
 *   node scripts/usage-from-personas.mjs --contributor=<id> [--db=<path>] [--force]
 *
 * Default db: %APPDATA%/com.personas.desktop/personas.db (Windows) or ~/.local/share/... -
 * pass --db when it lives elsewhere. Window: 30 days, matching the lane and the app.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadBridge } from './lib/projects.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'usage');
const WINDOW_DAYS = 30;
const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const force = process.argv.includes('--force');

let bridgeContributor = null;
try { bridgeContributor = loadBridge(ROOT).contributor ?? null; } catch { /* no machine file: --contributor required */ }
const contributor = String(arg('contributor') ?? bridgeContributor ?? '').trim();
if (!/^[a-z0-9][a-z0-9-]*$/.test(contributor)) {
  console.error('FATAL: --contributor=<id> ([a-z0-9-], non-identifying) is required (or "contributor" in .machine.local.json).');
  process.exit(2);
}

const defaultDb = process.platform === 'win32'
  ? path.join(process.env.APPDATA ?? path.join(os.homedir(), 'AppData', 'Roaming'), 'com.personas.desktop', 'personas.db')
  : path.join(os.homedir(), '.local', 'share', 'com.personas.desktop', 'personas.db');
const dbPath = arg('db') ?? defaultDb;
if (!fs.existsSync(dbPath)) {
  console.error(`FATAL: no Personas database at ${dbPath} - pass --db=<path>. Refusing to write a usage file from nothing.`);
  process.exit(2);
}

let DatabaseSync;
try { ({ DatabaseSync } = await import('node:sqlite')); } catch {
  console.error('FATAL: node:sqlite is not available in this Node (needs >= 22.5). Pair the registry in the app and use its writer instead.');
  process.exit(2);
}

const db = new DatabaseSync(dbPath, { readOnly: true });
let rows;
try {
  rows = db.prepare(
    `SELECT skill_name, COUNT(*) AS invokes, MAX(occurred_at) AS last_used
       FROM skill_usage_events
      WHERE event = 'invoke' AND occurred_at >= datetime('now', ?)
      GROUP BY skill_name ORDER BY skill_name`,
  ).all(`-${WINDOW_DAYS} days`);
} catch (e) {
  console.error(`FATAL: the query failed (${e.message}) - is this a Personas database with skill_usage_events?`);
  process.exit(2);
} finally { db.close(); }

// The app counts every slash command the harness logged, built-ins included (`/clear`,
// `/compact`...). A usage file is about SKILLS, so keep a name only when something on this
// machine publishes it as one: the registry lane, the registry's own .claude/skills, or a
// skill directory in a connected project (the local bridge). Nothing else is a skill id.
const known = new Set();
const addSkillDirs = (dir) => { try { for (const e of fs.readdirSync(dir, { withFileTypes: true })) if (e.isDirectory()) known.add(e.name); } catch { /* absent dir */ } };
addSkillDirs(path.join(ROOT, 'skills'));
addSkillDirs(path.join(ROOT, '.claude', 'skills'));
addSkillDirs(path.join(os.homedir(), '.claude', 'skills'));
try {
  for (const p of Object.values(loadBridge(ROOT).projects)) if (p?.path) addSkillDirs(path.join(p.path, '.claude', 'skills'));
} catch { /* no fleet resolvable: the lane alone decides */ }

// A plugin-installed skill may be logged as "<plugin>:<skill>"; fold it onto the bare
// name so one skill is one row.
const skills = {};
let droppedNotSkills = 0;
for (const r of rows) {
  const raw = String(r.skill_name ?? '').trim();
  const name = raw.includes(':') ? raw.split(':').pop() : raw;
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) continue; // the lane's name shape; anything else is not a skill id
  if (!known.has(name)) { droppedNotSkills += 1; continue; }
  const e = (skills[name] ??= { invokes: 0 });
  e.invokes += Number(r.invokes) || 0;
  if (r.last_used) {
    const iso = `${String(r.last_used).trim().replace(' ', 'T')}Z`;
    if (!e.lastUsed || iso > e.lastUsed) e.lastUsed = iso;
  }
}

const out = path.join(OUT_DIR, `${contributor}.json`);
if (fs.existsSync(out) && !force) {
  try {
    const prev = JSON.parse(fs.readFileSync(out, 'utf8'));
    if (prev.app && prev.app !== 'personas') {
      console.error(`FATAL: ${path.relative(ROOT, out)} was written by "${prev.app}" - two writers on one contributor file. Pass --force to take it over deliberately.`);
      process.exit(2);
    }
  } catch { /* unreadable previous file: overwrite is the honest move */ }
}
const doc = {
  schema: 'rkb-usage/1',
  contributor,
  // The counts ARE the Personas installation's counts; this script is the pen, the app's
  // own writer produces the identical document once the registry is paired in it.
  app: 'personas',
  generatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
  windowDays: WINDOW_DAYS,
  skills,
};
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(doc, null, 2)}\n`);
const total = Object.values(skills).reduce((n, s) => n + s.invokes, 0);
console.log(`usage/${contributor}.json written - ${Object.keys(skills).length} skill(s), ${total} invocation(s) in the last ${WINDOW_DAYS}d (from ${path.basename(dbPath)}); ${droppedNotSkills} logged command name(s) dropped as not-a-skill`);
console.log('next: node scripts/check-usage.mjs && node scripts/build-catalog.mjs');
