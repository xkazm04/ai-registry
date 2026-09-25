#!/usr/bin/env node
/**
 * process-sessions - this device's development sessions as process instances, structure only.
 *
 * Reads the Claude Code transcripts of every fleet checkout on this machine and emits one
 * instance per session: step kinds, counts, errors, timing, tokens, outcome facts. Nothing
 * a person typed and nothing a command printed is kept (lib/process-sessions.mjs).
 *
 * The transcripts roll off after about 30 days; this script does not. Every session it has
 * ever summarised stays in the device cache (`.process-sessions.local.json`, gitignored by
 * `**\/.*.local.json`), so the history outlives the transcript store. A transcript is parsed
 * again only when its size or mtime changed, so a warm run only stats files.
 *
 * Consumers: the Personas Curator "Process" page (via its instrument) and the pathfinder
 * analytical skill. The output never lands in the registry's committed tree.
 *
 * Usage:  node scripts/process-sessions.mjs [--json] [--since 30d] [--project <slug>]
 *                                           [--claude-projects <dir>] [--cache <file>] [--min-work 3]
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFleet } from './lib/projects.mjs';
import { summarize, encode, SCHEMA } from './lib/process-sessions.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const CACHE_VERSION = 1;

const argv = process.argv.slice(2);
const val = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const claudeProjects = path.resolve(val('--claude-projects') ?? path.join(os.homedir(), '.claude', 'projects'));
const cacheFile = path.resolve(val('--cache') ?? path.join(ROOT, '.process-sessions.local.json'));
const since = val('--since');
const onlyProject = val('--project');
const minWork = Number(val('--min-work') ?? 3);

// A Claude Code project directory is the session's cwd with every separator turned into '-'.
const encodeDir = (p) => p.replace(/[:\\/._ ]/g, '-').toLowerCase();

const fleet = loadFleet(ROOT);
// The registry is not a member of its own fleet, but its sessions are the curation process itself.
const members = [{ slug: 'ai-registry', path: ROOT }, ...Object.values(fleet.projects ?? {}).filter((p) => p.path)];
const checkouts = members
  .map((p) => ({ slug: p.slug, abs: path.resolve(p.path).toLowerCase(), dir: encodeDir(path.resolve(p.path)) }))
  .sort((a, b) => b.abs.length - a.abs.length); // longest prefix wins (a worktree sits inside its checkout)
const projectOf = (cwd) => {
  const c = path.resolve(cwd).toLowerCase();
  const hit = checkouts.find((k) => c === k.abs || c.startsWith(k.abs + path.sep));
  return hit ? hit.slug : null;
};

let cache = { version: CACHE_VERSION, files: {} };
try {
  const raw = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  if (raw?.version === CACHE_VERSION && raw.files) cache = raw;
} catch { /* first run, or a cache from another version: rebuild */ }

let scanned = 0, parsed = 0;
if (fs.existsSync(claudeProjects)) {
  for (const d of fs.readdirSync(claudeProjects)) {
    const dl = d.toLowerCase();
    if (!checkouts.some((k) => dl === k.dir || dl.startsWith(k.dir + '-'))) continue;
    let files; try { files = fs.readdirSync(path.join(claudeProjects, d)).filter((f) => f.endsWith('.jsonl')); } catch { continue; }
    for (const f of files) {
      const fp = path.join(claudeProjects, d, f);
      let st; try { st = fs.statSync(fp); } catch { continue; }
      scanned++;
      const key = `${d}/${f}`;
      const prev = cache.files[key];
      if (prev && prev.size === st.size && prev.mtime === st.mtimeMs) continue;
      let text; try { text = fs.readFileSync(fp, 'utf8'); } catch { continue; }
      parsed++;
      const s = summarize(text.split('\n'), { projectOf, id: f.slice(0, 8) });
      cache.files[key] = { size: st.size, mtime: st.mtimeMs, session: s };
    }
  }
}
fs.writeFileSync(cacheFile, JSON.stringify(cache));

const remembered = Object.values(cache.files).map((e) => e.session).filter(Boolean);
let sessions = remembered;
if (onlyProject) sessions = sessions.filter((s) => s.project === onlyProject);
if (since) {
  const m = String(since).match(/^(\d+)d$/);
  const cut = m ? Date.now() - Number(m[1]) * 864e5 : Date.parse(since);
  if (Number.isFinite(cut)) sessions = sessions.filter((s) => s.start >= cut);
}
sessions.sort((a, b) => a.start - b.start);
const out = encode(sessions, { minWorkSteps: minWork });
// `cached` counts SESSIONS the device remembers (with work, any date, any project), including
// ones whose transcript has rolled off - not cache entries, which also hold empty transcripts.
out.source = { scanned, parsed, cached: encode(remembered, { minWorkSteps: minWork }).sessions.length, window: [out.sessions[0]?.start ?? null, out.sessions.at(-1)?.start ?? null] };

if (argv.includes('--json')) process.stdout.write(JSON.stringify(out));
else {
  const byProject = {};
  for (const s of out.sessions) byProject[s.project] = (byProject[s.project] || 0) + 1;
  console.log(`${SCHEMA}: ${out.sessions.length} sessions (${scanned} transcripts, ${parsed} parsed this run, ${out.source.cached} sessions remembered)`);
  for (const [p, n] of Object.entries(byProject).sort((a, b) => b[1] - a[1])) console.log(`  ${p.padEnd(24)} ${n}`);
}
