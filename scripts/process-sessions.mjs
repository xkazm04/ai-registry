#!/usr/bin/env node
/**
 * process-sessions - this device's development sessions as process instances, structure only.
 *
 * Reads EVERY Claude Code transcript on this machine (every folder of the store, top-level
 * `*.jsonl`) and emits one instance per fleet session: step kinds, counts, errors, timing,
 * tokens, outcome facts. Nothing a person typed and nothing a command printed is kept
 * (lib/process-sessions.mjs).
 *
 * Discovery is never scoped by folder: the folder name is the cwd the session STARTED in, and a
 * session started in the home folder, a temp dir or a short-path worktree can still be fleet
 * work. Attribution comes from the cwd the records themselves carry (lib `summarizeFile`):
 *   1. the first record's cwd: a fleet checkout, longest prefix wins (the original rule, which
 *      is the launch checkout for every session the folder-scoped version read); else a
 *      worktree registered in a fleet repo (`<common git dir>/worktrees/<name>/gitdir`, what
 *      `git worktree list` reads, including prunable entries whose directory is gone); else the
 *      nearest `.git` on disk above the cwd: a `.git` FILE pointing into a fleet repo's git dir,
 *      or a clone whose `origin` URL equals a fleet checkout's;
 *   2. launched anywhere else: each record's cwd votes for the repository it lies in, and a
 *      fleet repo wins only with more votes than any repository outside the fleet.
 * Anything else is `outside-fleet`; nothing is attributed by a folder's name.
 * Every discovered transcript gets one disposition (read / outside-fleet / empty / unparseable /
 * in-flight), so "N sessions" comes with an account of what was not read and why.
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
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadFleet } from './lib/projects.mjs';
import { summarizeFile, cwdsIn, encode, SCHEMA, DISPOSITIONS } from './lib/process-sessions.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const CACHE_VERSION = 1;
// A transcript written to this recently is a live session: it is read and reported (the
// operator's current session should show), but counted `in-flight` because its summary is
// provisional - its size will change and the next run parses it again.
const IN_FLIGHT_MS = 120_000;

const argv = process.argv.slice(2);
const val = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const claudeProjects = path.resolve(val('--claude-projects') ?? path.join(os.homedir(), '.claude', 'projects'));
const cacheFile = path.resolve(val('--cache') ?? path.join(ROOT, '.process-sessions.local.json'));
const since = val('--since');
const onlyProject = val('--project');
const minWork = Number(val('--min-work') ?? 3);

const norm = (p) => path.resolve(p).toLowerCase();
const readText = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };
/** The git common dir of a working tree (its own `.git` dir, or the main repo's for a worktree). */
function commonDirOf(dir) {
  const g = path.join(dir, '.git');
  let st; try { st = fs.statSync(g); } catch { return null; }
  if (st.isDirectory()) return g;
  const m = (readText(g) ?? '').match(/^gitdir:\s*(.+)$/m);
  if (!m) return null;
  const gitdir = path.resolve(dir, m[1].trim());
  const common = readText(path.join(gitdir, 'commondir'));
  return common ? path.resolve(gitdir, common.trim()) : gitdir;
}
const originOf = (common) => {
  const m = (readText(path.join(common, 'config')) ?? '').match(/\[remote "origin"\][^[]*?\burl\s*=\s*(\S+)/);
  return m ? m[1].toLowerCase().replace(/\/+$/, '').replace(/\.git$/, '') : null;
};

const fleet = loadFleet(ROOT);
// The registry is not a member of its own fleet, but its sessions are the curation process
// itself. It is named by its MAIN working tree, so a run from any worktree attributes alike.
const rootCommon = commonDirOf(ROOT);
const registryPath = rootCommon && path.basename(rootCommon).toLowerCase() === '.git' ? path.dirname(rootCommon) : ROOT;
const members = [{ slug: 'ai-registry', path: registryPath }, ...Object.values(fleet.projects ?? {}).filter((p) => p.path)];
const checkouts = members
  .map((p) => ({ slug: p.slug, abs: norm(p.path) }))
  .sort((a, b) => b.abs.length - a.abs.length); // longest prefix wins (a worktree sits inside its checkout)
const under = (c, list) => list.find((k) => c === k.abs || c.startsWith(k.abs + path.sep));
const projectOf = (cwd) => under(norm(cwd), checkouts)?.slug ?? null;

// Fleet repos as git sees them: common dir, origin, and every registered worktree.
const repos = [];
const worktrees = [];
for (const m of members) {
  const common = commonDirOf(m.path);
  if (!common) continue;
  repos.push({ slug: m.slug, common: norm(common), origin: originOf(common) });
  let names = []; try { names = fs.readdirSync(path.join(common, 'worktrees')); } catch { /* no worktrees */ }
  for (const n of names) {
    const gd = readText(path.join(common, 'worktrees', n, 'gitdir'));
    if (gd?.trim()) worktrees.push({ slug: m.slug, abs: norm(path.dirname(path.resolve(gd.trim()))) });
  }
}
worktrees.sort((a, b) => b.abs.length - a.abs.length);
const fleetKey = crypto.createHash('sha1').update(JSON.stringify([checkouts, repos.map((r) => [r.slug, r.common, r.origin])])).digest('hex').slice(0, 12);

/**
 * Where a cwd outside every checkout lies: `{ slug, via }` in a worktree or clone of a fleet repo,
 * `{ repo }` in a repository outside the fleet, or in a directory that no longer exists and no
 * repository holds (a deleted temp worktree or clone of SOMETHING: it votes as its topmost
 * missing directory, since its work cannot be shown to be fleet work); null in an existing
 * directory no repository holds (the home folder, a launch pad). The key is used only as a vote
 * key in memory. Never by name.
 */
const placeMemo = new Map();
function placeOf(cwd) {
  const c = norm(cwd);
  if (placeMemo.has(c)) return placeMemo.get(c);
  let r = null;
  const w = under(c, worktrees);
  if (w) r = { slug: w.slug, via: 'worktree' };
  else {
    let gone = null;
    // Walk the path as recorded, not the lowercased key: on a case-sensitive file system the
    // lowercased path does not exist, and every worktree and clone would read as vanished.
    for (let q = path.resolve(cwd); ; q = path.dirname(q)) {
      if (!fs.existsSync(q)) { gone = norm(q); if (path.dirname(q) === q) break; continue; }
      const dotGit = path.join(q, '.git');
      if (fs.existsSync(dotGit)) {
        // A `.git` file names its git dir; inside a fleet repo's git dir it is that repo's
        // worktree even after `git worktree prune` dropped the registration.
        const link = (readText(dotGit) ?? '').match(/^gitdir:\s*(.+)$/m);
        const gd = link ? norm(path.resolve(q, link[1].trim())) : null;
        const linked = gd && repos.find((x) => gd === x.common || gd.startsWith(x.common + path.sep));
        const common = commonDirOf(q);
        const origin = common && originOf(common);
        const cloned = !linked && origin && repos.find((x) => x.origin && x.origin === origin);
        if (linked) r = { slug: linked.slug, via: 'git-link' };
        else if (cloned) r = { slug: cloned.slug, via: 'clone' };
        else r = { repo: common ? norm(common) : gd ?? norm(q) };
        break; // the nearest repository decides, fleet or not
      }
      if (path.dirname(q) === q) break;
    }
    if (!r && gone) r = { repo: gone };
  }
  placeMemo.set(c, r);
  return r;
}
const resolves = (cwd) => projectOf(cwd) != null || placeOf(cwd)?.slug != null;

let cache = { version: CACHE_VERSION, files: {} };
try {
  const raw = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  if (raw?.version === CACHE_VERSION && raw.files) cache = raw;
} catch { /* first run, or a cache from another version: rebuild */ }
// An `outside-fleet` verdict is only as good as the fleet it was judged against.
const fleetChanged = cache.fleet !== fleetKey;
cache.fleet = fleetKey;

const now = Date.now();
const dispositions = Object.fromEntries(DISPOSITIONS.map((d) => [d, 0]));
const via = {};
let scanned = 0, parsed = 0, prescanned = 0;
if (fs.existsSync(claudeProjects)) {
  for (const d of fs.readdirSync(claudeProjects)) {
    let files; try { files = fs.readdirSync(path.join(claudeProjects, d)).filter((f) => f.endsWith('.jsonl')); } catch { continue; }
    for (const f of files) {
      const fp = path.join(claudeProjects, d, f);
      let st; try { st = fs.statSync(fp); } catch { continue; }
      scanned++;
      const key = `${d}/${f}`;
      let entry = cache.files[key];
      const stale = !entry || entry.size !== st.size || entry.mtime !== st.mtimeMs
        || (!entry.disp && !entry.session) // a cache from before dispositions: judge it again
        || (entry.disp === 'outside-fleet' && fleetChanged);
      if (stale) {
        let buf; try { buf = fs.readFileSync(fp); } catch { buf = null; }
        if (!buf) entry = { disp: 'unparseable' }; // unreadable now; not cached, tried again next run
        else {
          const cwds = cwdsIn(buf);
          if (cwds.length && !cwds.some(resolves)) {
            prescanned++;
            entry = { size: st.size, mtime: st.mtimeMs, session: null, disp: 'outside-fleet' };
          } else {
            parsed++;
            const r = summarizeFile(buf.toString('utf8').split('\n'), { projectOf, placeOf, id: f.slice(0, 8) });
            entry = { size: st.size, mtime: st.mtimeMs, session: r.session, disp: r.disp, ...(r.via ? { via: r.via } : {}) };
          }
          cache.files[key] = entry;
        }
      }
      const disp = entry.disp ?? (entry.session ? 'read' : 'outside-fleet');
      dispositions[st.mtimeMs > now - IN_FLIGHT_MS ? 'in-flight' : disp]++;
      if (entry.session) via[entry.via ?? 'checkout'] = (via[entry.via ?? 'checkout'] || 0) + 1;
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
// `dispositions` accounts for every transcript discovered THIS run (they sum to `scanned`);
// `via` says which rule attributed the discovered transcripts that hold a session.
out.source = { scanned, parsed, prescanned, cached: encode(remembered, { minWorkSteps: minWork }).sessions.length,
  window: [out.sessions[0]?.start ?? null, out.sessions.at(-1)?.start ?? null], dispositions, via };

if (argv.includes('--json')) process.stdout.write(JSON.stringify(out));
else {
  const byProject = {};
  for (const s of out.sessions) byProject[s.project] = (byProject[s.project] || 0) + 1;
  console.log(`${SCHEMA}: ${out.sessions.length} sessions (${scanned} transcripts, ${parsed} parsed this run, ${out.source.cached} sessions remembered)`);
  console.log(`  dispositions: ${DISPOSITIONS.map((d) => `${d} ${dispositions[d]}`).join(', ')}`);
  for (const [p, n] of Object.entries(byProject).sort((a, b) => b[1] - a[1])) console.log(`  ${p.padEnd(24)} ${n}`);
}
