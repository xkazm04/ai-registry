#!/usr/bin/env node
/**
 * hygiene-disk - the disk lane of `/hygiene`: what agent runs leave on this MACHINE, outside
 * any checkout's own tree, and what of it can go.
 *
 * ## Why a lane of its own
 *
 * `hygiene-scan` sweeps each checkout's delivery surface. The bytes are elsewhere. On
 * 2026-10-15 one curator night had left 337 folders in the scratch root (`<drive>/t`): a clone
 * of a fleet project per claim, each with its own `npm install`, `.next` and cargo `target`,
 * about 200 GB in thirteen hours, because the run removed the registry worktree on landing
 * and never the project clone. Beside it: 62 GB of a cargo `incremental/` cache keyed per
 * feature set, 36 GB of Claude session temp, ~100,000 test-fixture temp dirs (one suite alone
 * 19,147). Nothing in a checkout's `git status` shows any of it.
 *
 * ## Areas and classes (same vocabulary as hygiene-scan)
 *
 *   scratch      each top-level entry of the scratch root.
 *                A checkout (`.git` file or dir) is `mechanical` (remove-scratch-checkout)
 *                only when idle past --idle-hours, its dirty paths are known noise
 *                (next-env.d.ts, *.generated.ts, untracked .husky hooks, a crash *.stackdump,
 *                a whitespace- or line-ending-only diff), and its HEAD is landed: a worktree's HEAD is on a
 *                ref of its main repository other than its own branch; a clone's commits are
 *                all on its remote's default branch (`origin/HEAD`), or each commit not there
 *                has its patch-id in its fleet home. A commit only on some other remote-tracking
 *                ref (a feature branch) is NOT shown landed: this lane never fetches, so that ref
 *                may name a branch the server has since deleted (PR closed unmerged), and the
 *                clone holds the only copy. Such a clone is `operator` ("landed only on
 *                remote-tracking refs (unverified without network)").
 *                Anything else is `operator` with the reason. `hyg-*` entries belong to the
 *                hygiene dead-worker rule and are always `operator`.
 *                A plain directory named like build output (target, tgt, cargo-target-*) is
 *                `mechanical` (remove-build-output) once idle; other plain directories are
 *                `operator` after --temp-days, unlisted before.
 *   build        cargo `incremental/` crate caches in fleet checkouts untouched past
 *                --idle-hours (prune-incremental: rebuilt on demand), and build-output-named
 *                siblings of fleet checkouts (a CARGO_TARGET_DIR some session made):
 *                mechanical after --temp-days, operator before.
 *   temp         the user temp dir's top-level entries and Claude Code's per-session temp
 *                (`<tmp>/claude/<project>/<session>`): mechanical (remove-temp) when untouched
 *                --temp-days, or 48 h and at least 100 MB; past that age a checkout there (`.git`
 *                at its top) is judged by the scratch checkout rules. Name families with hundreds of
 *                members become one `operator` row (temp-leak): a test suite that never
 *                removes its mkdtemp dirs, to be fixed where it is written. A top-level temp
 *                dir still in use whose child dirs idle 48 h+ total 1 GB is one `operator` row
 *                (temp-container): per-run leftovers its tool never prunes.
 *   worktrees    cargo `target/` (and `src-tauri/target`) in every registered worktree of a fleet repo:
 *                mechanical (prune-worktree-target) once untouched --target-idle-hours (8; 1 when the
 *                drive has under 100 GB free); a primary checkout's own `target/` after
 *                --primary-target-days (3) (prune-primary-target). A directory under
 *                ~/.personas/headless-masters/worktrees/<project>/ with no `.git` that no repo lists is
 *                an orphan (remove-orphan-worktree), mechanical past --idle-hours. Source is never touched.
 *   models       local model stores (Ollama, Hugging Face, LM Studio, torch, whisper caches)
 *                over 1 GB: `operator`, report-only (operator 2026-10-15: no local models on
 *                this machine, so a store growing back is news), unless .machine.local.json says
 *                `"localModels": "wanted"`. Waste inside those stores and any `modelRoots` listed
 *                there is `operator` either way: `*.incomplete` partials (model-partial) and
 *                Ollama blobs no manifest references (model-orphan-blobs).
 *
 * `hands-off`: anything with a write or creation inside --idle-hours (`.git/index` excluded:
 * any scanner's `git status` refreshes it). Deletion goes through scripts/lib/safe-remove.mjs:
 * links and junctions are removed as links, never entered; read-only git objects are cleared.
 * `--apply` re-measures and re-classifies every mechanical row immediately before deleting it
 * and requires the same answer (same HEAD for a checkout); a changed answer is a SKIP.
 *
 * ## Usage
 *
 *   node scripts/hygiene-disk.mjs [--idle-hours 24] [--temp-days 7] [--scratch <dir>] [--out <dir>] [--json]
 *   node scripts/hygiene-disk.mjs --apply [--out <dir>]
 *   node scripts/hygiene-disk.mjs --auto [--target-idle-hours 8] [--primary-target-days 3]   # scan + apply, for a scheduler
 *   node scripts/hygiene-disk.mjs --reap <dir>... [--idle-hours 0]   # a run's own end-of-task cleanup
 *
 * `--reap` is for the run that made a scratch entry: it judges the named top-level entries of
 * the scratch root by the same rules at once (idle floor 0, since the caller just finished in
 * them), deletes what is landed and clean, and prints why it kept the rest. curator's night
 * calls it from `fin.sh` for the claim's project clones.
 *
 * Output: `<out>/disk.json` and `<out>/disk.md`; `--apply` appends to `<out>/disk-applied.jsonl`.
 * Default `<out>` is hygiene-scan's: `$(git rev-parse --git-common-dir)/hygiene/<YYYY-MM-DD>/`.
 * The scratch root defaults to `t` at the root of the drive holding the fleet root.
 *
 * Exit codes: 0 scan (or apply) completed; 2 the instrument could not run.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadFleet } from './lib/projects.mjs';
import { measureTree, removeTree } from './lib/safe-remove.mjs';
import { EXIT } from './lib/exit-codes.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const H = 3600e3;

// ---------------------------------------------------------------------------- pure rules

/** Dirty paths that are never work: regenerated on every install/dev run, hook shims, or an MSYS crash dump. */
export const NOISE = [/(^|\/)next-env\.d\.ts$/, /\.stackdump$/i, /\.generated\.ts$/, /^\.husky\/(commit-msg|prepare-commit-msg|pre-commit|pre-push)$/];
export const BUILD_OUTPUT = /(^|[-_.])(target|tgt)([-_.]|$)|^cargo-target|^node_modules$/i;
const isNoise = (p) => NOISE.some((re) => re.test(p.replace(/\\/g, '/')));

/**
 * One scratch-root checkout. `f`: { name, ageH, dirtyOther: string[], headLanded: true|false|null, why }.
 */
export function classifyCheckout(f, { idleH = 24 } = {}) {
  if (f.ageH < idleH) return { class: 'hands-off', kind: 'scratch-live', reason: `touched ${f.ageH.toFixed(1)} h ago` };
  if (/^hyg-/.test(f.name)) return { class: 'operator', kind: 'scratch-hyg-worktree', reason: "a hygiene worker's worktree: the dead-worker rule decides" };
  if (f.dirtyOther.length) return { class: 'operator', kind: 'scratch-wip', reason: `uncommitted: ${f.dirtyOther.slice(0, 3).join(', ')}${f.dirtyOther.length > 3 ? ` (+${f.dirtyOther.length - 3})` : ''}` };
  if (f.headLanded !== true) return { class: 'operator', kind: 'scratch-unlanded', reason: f.why || 'HEAD not shown to be landed' };
  return { class: 'mechanical', kind: 'remove-scratch-checkout', reason: f.why || 'landed and clean' };
}

/** One plain (non-git) scratch-root directory. */
export function classifyPlain(f, { idleH = 24, tempDays = 7 } = {}) {
  if (f.ageH < idleH) return null;
  if (BUILD_OUTPUT.test(f.name)) return { class: 'mechanical', kind: 'remove-build-output', reason: 'build output, idle' };
  if (f.ageH >= tempDays * 24) return { class: 'operator', kind: 'scratch-dir', reason: `untouched ${Math.round(f.ageH / 24)} days, content unknown` };
  return null;
}

/** One temp entry (user temp top level, or a Claude session dir). */
export function classifyTemp(f, { tempDays = 7, idleH = 24 } = {}) {
  if (f.ageH < idleH) return null; // the hands-off floor binds temp like every other area
  if (f.ageH >= tempDays * 24 || (f.ageH >= 48 && f.bytes >= 100e6)) return { class: 'mechanical', kind: 'remove-temp', reason: `untouched ${Math.round(f.ageH)} h` };
  return null;
}

/**
 * Name family of a temp entry. `fs.mkdtemp(prefix)` appends six random [A-Za-z0-9] straight
 * onto the prefix, so that tail goes first; then hashes and uuids, then counters.
 */
export function tempFamily(name) {
  return name.replace(/\.[A-Za-z]{1,5}$/, '').replace(/[A-Za-z0-9]{6}$/, '#').replace(/[0-9a-f]{8,}/gi, '#').replace(/\d+/g, '#');
}
export function leakFamilies(names, min = 200) {
  const c = new Map();
  for (const n of names) { const k = tempFamily(n); c.set(k, (c.get(k) || 0) + 1); }
  return [...c.entries()].filter(([, n]) => n >= min).sort((a, b) => b[1] - a[1]);
}

// ---------------------------------------------------------------------------- git facts

// A hook that exports GIT_DIR makes `git -C <dir>` answer for a different repository
// (2026-09-19: fixtures wrote into real repos). Deletions are decided on these answers, so
// the repository-selecting variables never reach git from here.
const GIT_ENV = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^GIT_(DIR|WORK_TREE|INDEX_FILE|COMMON_DIR|OBJECT_DIRECTORY|ALTERNATE_OBJECT_DIRECTORIES|NAMESPACE|CEILING_DIRECTORIES)$/.test(k)));
const git = (cwd, args, input) => {
  // trimEnd only: `status --porcelain` starts with a status column that may be a space
  // (" M a.txt"); trimming the front turns a.txt into .txt (LESSONS 2026-09-26, 2026-09-30).
  try { return execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', input, env: GIT_ENV, stdio: [input == null ? 'ignore' : 'pipe', 'pipe', 'ignore'], timeout: 300_000, maxBuffer: 256 << 20 }).trimEnd(); } catch { return null; }
};
const quiet = (cwd, args) => { try { execFileSync('git', ['-C', cwd, ...args], { stdio: 'ignore', env: GIT_ENV, timeout: 300_000 }); return true; } catch { return false; } };
const urlKey = (u) => (u || '').toLowerCase().replace(/\\/g, '/').replace(/\.git$/, '').replace(/\/+$/, '');

function fleetHomes(fleet) {
  const homes = [];
  for (const p of Object.values(fleet.projects ?? {})) {
    if (!p.path || !fs.existsSync(path.join(p.path, '.git'))) continue;
    homes.push({ slug: p.slug, path: p.path, keys: [urlKey(p.path), urlKey(git(p.path, ['remote', 'get-url', 'origin']))].filter(Boolean) });
  }
  homes.push({ slug: 'ai-registry', path: ROOT, keys: [urlKey(ROOT), urlKey(git(ROOT, ['remote', 'get-url', 'origin']))].filter(Boolean) });
  return homes;
}

const patchCache = new Map();
function patchIdsOf(home, since) {
  // keyed on the home's ref tips too: a commit landing there mid-run must not meet a stale set
  const tips = git(home, ['for-each-ref', '--format=%(objectname)', 'refs/heads', 'refs/remotes']) || '';
  const key = `${home}|${since}|${crypto.createHash('sha1').update(tips).digest('hex')}`;
  if (!patchCache.has(key)) {
    const log = git(home, ['log', '--all', `--since=${since}`, '-p', '--no-color', '--format=commit %H']);
    const ids = new Set();
    if (log) for (const l of (git(home, ['patch-id', '--stable'], log) || '').split('\n')) if (l) ids.add(l.split(' ')[0]);
    patchCache.set(key, ids);
  }
  return patchCache.get(key);
}

/** Facts for one checkout in the scratch root. Never writes. */
export function checkoutFacts(abs, homes) {
  const head = git(abs, ['rev-parse', 'HEAD']);
  const porcelain = git(abs, ['status', '--porcelain', '--untracked-files=normal']);
  const f = { head, dirtyOther: [], headLanded: null, why: null, mainRepo: null };
  if (head == null || porcelain == null) { f.why = 'git could not read it'; f.dirtyOther = ['(unreadable)']; return f; }
  const lines = porcelain.split('\n').filter(Boolean); // split before trimming: the first line's status column starts with a space
  const untracked = lines.filter((l) => l.startsWith('??')).map((l) => l.slice(3));
  const modified = lines.filter((l) => !l.startsWith('??')).map((l) => l.slice(3));
  f.dirtyOther.push(...untracked.filter((p) => !isNoise(p)));
  const realMods = modified.filter((p) => !isNoise(p));
  // Against HEAD, not the index: a plain `git diff` skips staged changes, so `git add`ed work read as noise.
  if (realMods.length && !quiet(abs, ['diff', 'HEAD', '--quiet', '--ignore-all-space', '--ignore-cr-at-eol'])) f.dirtyOther.push(...realMods);
  const dotGit = path.join(abs, '.git');
  if (fs.statSync(dotGit).isFile()) {
    const gd = (fs.readFileSync(dotGit, 'utf8').match(/gitdir:\s*(.+)/) || [])[1]?.trim();
    const m = gd && /^(.*?)[\\/]\.git[\\/]worktrees[\\/]/i.exec(gd);
    f.mainRepo = m ? m[1] : null;
    if (!f.mainRepo || !fs.existsSync(f.mainRepo)) { f.why = 'worktree of a repository that is gone'; return f; }
    const own = git(abs, ['rev-parse', '--abbrev-ref', 'HEAD']);
    const refs = (git(f.mainRepo, ['for-each-ref', '--contains', head, '--format=%(refname:short)', 'refs/heads', 'refs/remotes']) || '').split('\n').filter((r) => r && r !== own);
    f.headLanded = refs.length > 0;
    f.why = f.headLanded ? `worktree; HEAD on ${refs[0]}` : 'worktree; HEAD on no other ref of its repository';
    return f;
  }
  // Every ref, not HEAD alone: deleting a clone deletes its side branches, tags and stash too.
  // A listing that failed is not an empty one.
  const listed = git(abs, ['rev-list', '--all', '--not', '--remotes']);
  if (listed == null) { f.headLanded = false; f.why = 'clone; git could not list its local commits'; return f; }
  const local = listed.split('\n').filter(Boolean);
  // A remote-tracking ref is a memory of the last fetch, and this lane never fetches: a feature
  // branch deleted on the server (PR closed unmerged) still sits in refs/remotes/origin/. Only
  // the default branch's history is durable, so commits on remote-tracking refs but not on the
  // default's remote-tracking ref are "remote-only": unverified, like the unpushed ones.
  const up = defaultUpstream(abs);
  const listedRemote = git(abs, ['rev-list', '--remotes', ...(up ? ['--not', up] : [])]);
  if (listedRemote == null) { f.headLanded = false; f.why = 'clone; git could not list its remote-tracking commits'; return f; }
  const remoteOnly = listedRemote.split('\n').filter(Boolean);
  if (!local.length && !remoteOnly.length) { f.headLanded = true; f.why = `clone; every ref is on ${up ? up.replace(/^refs\/remotes\//, '') : 'its remotes'}`; return f; }
  const remoteWhy = (n) => `landed only on remote-tracking refs (unverified without network): ${n} commits not on ${up ? up.replace(/^refs\/remotes\//, '') : 'a default branch'}`;
  const origin = urlKey(git(abs, ['remote', 'get-url', 'origin']));
  const home = homes.find((h) => h.keys.includes(origin));
  if (!home) {
    f.headLanded = false;
    f.why = local.length ? `clone; ${local.length} local commits and no fleet home to check them in` : remoteWhy(remoteOnly.length);
    return f;
  }
  if (!local.length && remoteOnly.length > MAX_REMOTE_ONLY_PROBE) { f.headLanded = false; f.why = remoteWhy(remoteOnly.length); return f; }
  const dates = [local.at(-1), remoteOnly.at(-1)].filter(Boolean).map((c) => Date.parse(git(abs, ['log', '-1', '--format=%cI', c]) || ''));
  const oldest = Math.min(...dates);
  const since = Number.isFinite(oldest) ? new Date(oldest - 86400e3).toISOString().slice(0, 10) : '2000-01-01';
  const ids = patchIdsOf(home.path, since);
  const lacks = (c) => {
    const id = (git(abs, ['patch-id', '--stable'], git(abs, ['show', '--no-color', '--format=commit %H', c]) || '') || '').split(' ')[0];
    return !id || !ids.has(id);
  };
  const missing = local.filter(lacks);
  if (missing.length) { f.headLanded = false; f.why = `clone; ${missing.length} of ${local.length} local commits not in ${home.slug}`; return f; }
  const missingRemote = remoteOnly.length > MAX_REMOTE_ONLY_PROBE ? remoteOnly : remoteOnly.filter(lacks);
  if (missingRemote.length) { f.headLanded = false; f.why = remoteWhy(missingRemote.length); return f; }
  f.headLanded = true;
  f.why = `clone; ${local.length} local${remoteOnly.length ? ` and ${remoteOnly.length} remote-tracking-only` : ''} commits, all in ${home.slug} by patch-id`;
  return f;
}

/** Past this many remote-only commits the patch-id probe (two git processes each) is not worth it. */
const MAX_REMOTE_ONLY_PROBE = 200;

/** The clone's default branch as the last fetch knew it (`refs/remotes/origin/HEAD`, else main/master), or null. */
function defaultUpstream(abs) {
  const sym = git(abs, ['symbolic-ref', '-q', 'refs/remotes/origin/HEAD']);
  return [sym, 'refs/remotes/origin/main', 'refs/remotes/origin/master'].filter(Boolean).find((r) => quiet(abs, ['rev-parse', '--verify', '-q', `${r}^{commit}`])) || null;
}

// ---------------------------------------------------------------------------- scan

const ageOf = (m, now) => (m.newestMs ? (now - m.newestMs) / H : Infinity);

/**
 * measureTree ages a tree by its files only, so an empty or links-only directory came back
 * with no time at all and ageOf read it as infinitely old: a directory made a second ago was
 * a mechanical delete. The root's own mtime and birthtime count too (an entry created or
 * removed in it moves them).
 */
function measure(abs) {
  const m = measureTree(abs);
  if (m.missing || m.rootIsLink) return m;
  try { const s = fs.lstatSync(abs); m.newestMs = Math.max(m.newestMs, s.mtimeMs, s.birthtimeMs || 0); } catch { /* gone: stays unageable */ }
  return m;
}

function entryMeasure(abs, isFile) {
  if (!isFile) return measure(abs);
  const s = fs.lstatSync(abs);
  return { bytes: s.size, newestMs: Math.max(s.mtimeMs, s.birthtimeMs || 0), files: 1 };
}

/**
 * `t` at the root of the drive holding the fleet. loadFleet does not return the machine root,
 * so a fleet is located by its checkouts (they sit under that root); no checkouts, the home drive.
 */
export function scratchRootOf(fleetOrRoot) {
  const at = typeof fleetOrRoot === 'string' ? fleetOrRoot : Object.values(fleetOrRoot?.projects ?? {}).find((p) => p?.path)?.path;
  return path.join(path.parse(path.resolve(at || os.homedir())).root, 't');
}

/** The whole plan. `tmp` and `home` default to this machine's; tests pass fixtures. Never writes. */
/** Cargo build output inside a checkout. 2026-11-01/02: one worktree's `target/` was 36-137 GB, 75% of it PDB + incremental. */
export const TARGET_DIRS = ['target', path.join('src-tauri', 'target')];
export const TARGET_IDLE_H = 8;          // a secondary worktree's target untouched this long is rebuilt on demand
export const TARGET_IDLE_LOW_DISK_H = 1; // the same floor once the drive is short of space
export const PRIMARY_TARGET_DAYS = 3;    // a primary checkout's target: slower to rebuild, so a longer floor
export const LOW_DISK_BYTES = 100e9;

/**
 * Repos outside the fleet that still build here (2026-11-02: CastleControl, in no projects.json, held
 * 450 GB of worktree targets the lane never saw). `.machine.local.json` `buildRoots` lists directories
 * (relative to its `root`, or absolute) whose immediate children that are git checkouts get the same
 * build-output rules. Absolute roots stay in that gitignored file, never in a published one.
 */
export function buildRepos(fleet, machineFile = path.join(ROOT, '.machine.local.json')) {
  let cfg; try { cfg = JSON.parse(fs.readFileSync(machineFile, 'utf8')); } catch { return []; }
  const base = cfg.root ? path.resolve(cfg.root) : os.homedir();
  const out = [];
  for (const r of Array.isArray(cfg.buildRoots) ? cfg.buildRoots : []) {
    const dir = path.resolve(base, String(r));
    let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of ents) { const abs = path.join(dir, e.name); if (e.isDirectory() && !e.isSymbolicLink() && fs.existsSync(path.join(abs, '.git'))) out.push(abs); }
  }
  return out;
}

/** Registered worktrees of a repo, primary first. [] when git cannot say. */
function worktreesOf(repo) {
  const out = git(repo, ['worktree', 'list', '--porcelain']);
  if (!out) return [];
  return out.split(/\r?\n/).filter((l) => l.startsWith('worktree ')).map((l) => path.resolve(l.slice(9).trim()));
}

/**
 * Build output that regenerates. A secondary worktree's `target/` is the dominant disk cost (every
 * worktree builds its own), a primary's is kept longer, and a headless-run directory that holds no
 * `.git` is an orphan: the app that made it dropped the worktree registration and kept the files.
 * Nothing here touches source: only `target/` (or the whole orphan) goes, once it is idle.
 */
export function scanBuildOutput({ fleet, add, now, targetIdleH, primaryTargetDays, idleH, home, extraRepos = [] }) {
  const known = new Set();
  const seenTargets = new Set();
  const repoPaths = [...Object.values(fleet.projects ?? {}).map((p) => p.path), ...extraRepos];
  for (const repo of repoPaths) {
    if (!repo || !fs.existsSync(repo)) continue;
    const wts = worktreesOf(repo);
    const primary = path.resolve(repo).toLowerCase();
    for (const wt of wts.length ? wts : [path.resolve(repo)]) {
      known.add(wt.toLowerCase());
      const isPrimary = wt.toLowerCase() === primary;
      for (const rel of TARGET_DIRS) {
        const t = path.join(wt, rel);
        if (seenTargets.has(t.toLowerCase()) || !fs.existsSync(t)) continue;
        seenTargets.add(t.toLowerCase());
        const m = measure(t);
        if (m.rootIsLink) continue;
        const ageH = ageOf(m, now);
        if (!Number.isFinite(ageH)) continue;
        if (isPrimary) {
          if (ageH >= primaryTargetDays * 24) add('build', t, m, { class: 'mechanical', kind: 'prune-primary-target', reason: `primary checkout's build output untouched ${Math.round(ageH / 24)} days` });
        } else if (ageH >= targetIdleH) {
          add('build', t, m, { class: 'mechanical', kind: 'prune-worktree-target', reason: `worktree build output untouched ${ageH.toFixed(1)} h` });
        }
      }
    }
  }
  const headless = path.join(home, '.personas', 'headless-masters', 'worktrees');
  if (fs.existsSync(headless)) {
    for (const proj of fs.readdirSync(headless, { withFileTypes: true })) {
      if (!proj.isDirectory() || proj.isSymbolicLink()) continue;
      for (const h of fs.readdirSync(path.join(headless, proj.name), { withFileTypes: true })) {
        const abs = path.join(headless, proj.name, h.name);
        if (!h.isDirectory() || h.isSymbolicLink() || fs.existsSync(path.join(abs, '.git')) || known.has(abs.toLowerCase())) continue;
        const m = measure(abs);
        const ageH = ageOf(m, now);
        if (ageH >= idleH) add('build', abs, m, { class: 'mechanical', kind: 'remove-orphan-worktree', reason: `headless-run directory with no .git, in no repository's worktree list, untouched ${Math.round(ageH)} h` });
      }
    }
  }
}

export function scan({ fleet, idleH, tempDays, scratch, now = Date.now(), tmp = os.tmpdir(), home = os.homedir(), targetIdleH = TARGET_IDLE_H, primaryTargetDays = PRIMARY_TARGET_DAYS, extraRepos = [], models = {} }) {
  const rows = [];
  const homes = fleetHomes(fleet);
  const add = (area, abs, m, c, extra = {}) => rows.push({ area, path: abs, bytes: m.bytes, ageH: Number.isFinite(ageOf(m, now)) ? +ageOf(m, now).toFixed(1) : null, ...c, ...extra });
  scanBuildOutput({ fleet, add, now, targetIdleH, primaryTargetDays, idleH, home, extraRepos });

  // scratch root
  if (fs.existsSync(scratch)) {
    for (const e of fs.readdirSync(scratch, { withFileTypes: true })) {
      if (!e.isDirectory() || e.isSymbolicLink()) continue;
      const abs = path.join(scratch, e.name);
      const m = measure(abs);
      const ageH = ageOf(m, now);
      if (fs.existsSync(path.join(abs, '.git'))) {
        if (ageH < idleH) { add('scratch', abs, m, classifyCheckout({ name: e.name, ageH, dirtyOther: [], headLanded: null }, { idleH })); continue; }
        const f = checkoutFacts(abs, homes);
        add('scratch', abs, m, classifyCheckout({ name: e.name, ageH, ...f }, { idleH }), { head: f.head, mainRepo: f.mainRepo });
      } else {
        const c = classifyPlain({ name: e.name, ageH }, { idleH, tempDays });
        if (c) add('scratch', abs, m, c);
      }
    }
  }

  // build caches in and beside fleet checkouts
  const parents = new Set();
  const projectPaths = new Set();
  for (const p of Object.values(fleet.projects ?? {})) {
    if (!p.path || !fs.existsSync(p.path)) continue;
    projectPaths.add(path.resolve(p.path).toLowerCase());
    parents.add(path.dirname(path.resolve(p.path)));
    for (const t of [path.join(p.path, 'target'), path.join(p.path, 'src-tauri', 'target')]) {
      for (const prof of ['debug', 'release']) {
        const inc = path.join(t, prof, 'incremental');
        if (!fs.existsSync(inc)) continue;
        for (const c of fs.readdirSync(inc, { withFileTypes: true })) {
          if (!c.isDirectory()) continue;
          const abs = path.join(inc, c.name);
          const m = measure(abs);
          if (ageOf(m, now) >= idleH) add('build', abs, m, { class: 'mechanical', kind: 'prune-incremental', reason: `incremental cache untouched ${Math.round(ageOf(m, now))} h` });
        }
      }
    }
  }
  for (const parent of parents) {
    for (const e of fs.readdirSync(parent, { withFileTypes: true })) {
      const abs = path.join(parent, e.name);
      if (!e.isDirectory() || e.isSymbolicLink() || projectPaths.has(abs.toLowerCase()) || !BUILD_OUTPUT.test(e.name) || fs.existsSync(path.join(abs, '.git'))) continue;
      const m = measure(abs);
      const ageH = ageOf(m, now);
      if (ageH < idleH) continue;
      add('build', abs, m, ageH >= tempDays * 24
        ? { class: 'mechanical', kind: 'remove-build-output', reason: `out-of-tree build output untouched ${Math.round(ageH / 24)} days` }
        : { class: 'operator', kind: 'build-output', reason: `out-of-tree build output untouched ${Math.round(ageH)} h; mechanical after ${tempDays} days` });
    }
  }

  // temp. A checkout parked in temp (a worker's worktree, a clone) is judged by the checkout
  // rules once it is past the temp age: its age says nothing about whether its work is elsewhere.
  const addTemp = (abs, isDir, name, kind) => {
    let m; try { m = entryMeasure(abs, !isDir); } catch { return; }
    const c = classifyTemp({ ageH: ageOf(m, now), bytes: m.bytes }, { tempDays, idleH });
    if (!c) { if (isDir && kind === 'remove-temp') staleContainer(abs); return; }
    if (isDir && fs.existsSync(path.join(abs, '.git'))) {
      const f = checkoutFacts(abs, homes);
      add('temp', abs, m, classifyCheckout({ name, ageH: ageOf(m, now), ...f }, { idleH }), { head: f.head, mainRepo: f.mainRepo });
    } else add('temp', abs, m, { ...c, kind }, { isFile: !isDir });
  };
  // A temp dir one tool reuses per run (bp's lens-serve keeps one mirror per worktree under
  // <tmp>/bp-lens) is touched by every run, so its own age never passes the floor while the
  // children of gone worktrees pile up: 15.8 GB of 30 orphan mirrors on 2026-11-02. Its stale
  // children are reported, never deleted: only the owning tool knows which child is still wanted.
  const staleContainer = (abs) => {
    let kids; try { kids = fs.readdirSync(abs, { withFileTypes: true }); } catch { return; }
    let bytes = 0, count = 0, newest = 0;
    for (const k of kids) {
      if (!k.isDirectory() || k.isSymbolicLink()) continue;
      const km = measure(path.join(abs, k.name));
      const kAge = ageOf(km, now);
      if (kAge < Math.max(48, idleH)) continue;
      bytes += km.bytes; count++; newest = Math.max(newest, km.newestMs || 0);
    }
    if (bytes >= 1e9) rows.push({ area: 'temp', path: abs, bytes, ageH: newest ? +((now - newest) / H).toFixed(1) : null, count, class: 'operator', kind: 'temp-container', reason: `${count} child dirs untouched 48 h+ inside a dir still in use: per-run leftovers its tool never prunes; fix the tool, or delete the stale children` });
  };
  const claudeTmp = path.join(tmp, 'claude');
  const names = [];
  for (const e of fs.readdirSync(tmp, { withFileTypes: true })) {
    if (e.name.toLowerCase() === 'claude' || e.isSymbolicLink()) continue;
    names.push(e.name);
    addTemp(path.join(tmp, e.name), e.isDirectory(), e.name, 'remove-temp');
  }
  if (fs.existsSync(claudeTmp)) {
    for (const proj of fs.readdirSync(claudeTmp, { withFileTypes: true })) {
      if (!proj.isDirectory() || proj.isSymbolicLink()) continue;
      // a session dir can vanish between the two listings (a live session cleans up)
      let sessions; try { sessions = fs.readdirSync(path.join(claudeTmp, proj.name), { withFileTypes: true }); } catch { continue; }
      for (const s of sessions) {
        if (s.isSymbolicLink()) continue;
        addTemp(path.join(claudeTmp, proj.name, s.name), s.isDirectory(), s.name, 'remove-session-temp');
      }
    }
  }
  for (const [family, n] of leakFamilies(names)) rows.push({ area: 'temp', path: path.join(tmp, family), class: 'operator', kind: 'temp-leak', reason: `${n} entries named like this: a process (usually a test suite) never removes its temp dirs`, bytes: null, ageH: null, count: n });

  // model stores. The size row is news only where the operator wants no local models (the
  // 2026-10-15 ruling); a machine that hosts them on purpose says `"localModels": "wanted"` in
  // .machine.local.json. Waste inside any store is reported either way: an abandoned partial
  // download, or Ollama blobs no manifest references (2026-11-02, Lynx: 47 GB of `.incomplete`
  // and a 40 GB blob store whose manifests had been deleted).
  const stores = [path.join(home, '.ollama', 'models'), path.join(home, '.cache', 'huggingface'), path.join(home, '.cache', 'lm-studio'), path.join(home, '.lmstudio', 'models'), path.join(home, '.cache', 'torch'), path.join(home, '.cache', 'whisper')];
  for (const d of stores) {
    if (!fs.existsSync(d) || models.wanted) continue;
    const m = measure(d);
    if (m.bytes >= 1e9) add('models', d, m, { class: 'operator', kind: 'model-store', reason: 'local model store (operator 2026-10-15: none wanted on this machine)' });
  }
  for (const root of [...stores, ...(models.roots ?? [])]) for (const w of modelWaste(root, now)) rows.push({ area: 'models', class: 'operator', ...w });
  return rows;
}

/**
 * Regenerable-or-dead bytes inside a model store: `*.incomplete` partial downloads (Hugging Face)
 * untouched 72 h, and an Ollama store (a `blobs/` beside a `manifests` dir) whose manifests name none
 * of its blobs. Both are operator rows: a model is the operator's call even when it is waste.
 */
export function modelWaste(root, now = Date.now()) {
  const out = [];
  if (!fs.existsSync(root)) return out;
  let partial = 0, partialN = 0;
  const ollama = [];
  const stack = [root];
  while (stack.length) {
    const d = stack.pop();
    let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { continue; }
    const isOllama = es.some((e) => e.isDirectory() && e.name === 'blobs') && es.some((e) => e.isDirectory() && /^manifests/.test(e.name));
    if (isOllama) ollama.push(d);
    for (const e of es) {
      const p = path.join(d, e.name);
      if (e.isSymbolicLink()) continue;
      // an Ollama blobs/ holds only sha256-* layers; a Hugging Face hub blobs/ holds its partials
      if (e.isDirectory()) { if (!(isOllama && e.name === 'blobs')) stack.push(p); continue; }
      if (!e.name.endsWith('.incomplete')) continue;
      try { const s = fs.lstatSync(p); if ((now - s.mtimeMs) / H >= 72) { partial += s.size; partialN++; } } catch { /* gone */ }
    }
  }
  if (partialN) out.push({ path: root, bytes: partial, ageH: null, count: partialN, kind: 'model-partial', reason: `${partialN} partial download(s) (*.incomplete) untouched 72 h+: an interrupted pull; delete them` });
  for (const store of ollama) {
    const refs = new Set();
    const ms = [];
    for (const e of fs.readdirSync(store, { withFileTypes: true })) if (e.isDirectory() && /^manifests/.test(e.name)) ms.push(path.join(store, e.name));
    while (ms.length) {
      const d = ms.pop();
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) { ms.push(p); continue; }
        try { for (const x of fs.readFileSync(p, 'utf8').match(/sha256[:-][0-9a-f]{64}/g) ?? []) refs.add(x.replace(':', '-')); } catch { /* unreadable manifest: counts as none */ }
      }
    }
    let bytes = 0, n = 0;
    for (const b of fs.readdirSync(path.join(store, 'blobs'), { withFileTypes: true })) {
      if (!b.isFile() || refs.has(b.name)) continue;
      try { bytes += fs.lstatSync(path.join(store, 'blobs', b.name)).size; n++; } catch { /* gone */ }
    }
    if (bytes >= 1e9) out.push({ path: path.join(store, 'blobs'), bytes, ageH: null, count: n, kind: 'model-orphan-blobs', reason: `${n} Ollama blob(s) no manifest references: a removed model's layers; delete them (\`ollama rm\` normally does)` });
  }
  return out;
}

// ---------------------------------------------------------------------------- apply

export function reclassify(row, { fleet, idleH, tempDays, now = Date.now(), targetIdleH = TARGET_IDLE_H, primaryTargetDays = PRIMARY_TARGET_DAYS }) {
  if (!fs.existsSync(row.path)) return { skip: 'gone' };
  const m = row.isFile ? entryMeasure(row.path, true) : measure(row.path);
  if (m.rootIsLink) return { skip: 'became a link' };
  // The scan sent anything holding a .git to the checkout rules; a plain row that holds one
  // now is a checkout made since, and only a re-scan may judge it.
  if (!row.isFile && row.kind !== 'remove-scratch-checkout' && fs.existsSync(path.join(row.path, '.git'))) return { skip: 'now holds a .git - a checkout since the scan; re-scan' };
  const ageH = ageOf(m, now);
  let c;
  if (row.kind === 'remove-scratch-checkout') {
    if (ageH < idleH) return { skip: `touched ${ageH.toFixed(1)} h ago` };
    const f = checkoutFacts(row.path, fleetHomes(fleet));
    if (f.head !== row.head) return { skip: `HEAD moved to ${String(f.head).slice(0, 8)}` };
    c = classifyCheckout({ name: path.basename(row.path), ageH, ...f }, { idleH });
  } else if (row.kind === 'remove-build-output' && row.area === 'scratch') c = classifyPlain({ name: path.basename(row.path), ageH }, { idleH, tempDays });
  else if (row.kind === 'remove-build-output') c = ageH >= tempDays * 24 ? { kind: 'remove-build-output' } : null;
  else if (row.kind === 'prune-incremental') c = ageH >= idleH ? { kind: 'prune-incremental' } : null;
  else if (row.kind === 'prune-worktree-target') c = ageH >= targetIdleH ? { kind: row.kind } : null;
  else if (row.kind === 'prune-primary-target') c = ageH >= primaryTargetDays * 24 ? { kind: row.kind } : null;
  else if (row.kind === 'remove-orphan-worktree') c = ageH >= idleH ? { kind: row.kind } : null;
  else if (row.kind === 'remove-temp' || row.kind === 'remove-session-temp') c = classifyTemp({ ageH, bytes: m.bytes }, { tempDays, idleH }) ? { kind: row.kind } : null;
  if (!c || (c.kind !== row.kind)) return { skip: `no longer ${row.kind}${c ? ` (now ${c.kind})` : ''}` };
  return { ok: true, bytes: m.bytes };
}

// ---------------------------------------------------------------------------- report

const GB = (b) => (b == null ? '-' : (b / 1e9).toFixed(1));
export function renderMarkdown(plan) {
  const lines = [`# Disk lane - ${plan.generatedAt.slice(0, 16)}`, '', `Free: ${GB(plan.freeBytes)} GB. Scratch root: \`${plan.scratch}\`.`, '', '| area | class | kind | rows | GB |', '|---|---|---|---|---|'];
  const g = new Map();
  for (const r of plan.rows) { const k = `${r.area}|${r.class}|${r.kind}`; const x = g.get(k) || { n: 0, b: 0 }; x.n++; x.b += r.bytes || 0; g.set(k, x); }
  for (const [k, x] of [...g.entries()].sort((a, b) => b[1].b - a[1].b)) { const [a, c, kind] = k.split('|'); lines.push(`| ${a} | ${c} | ${kind} | ${x.n} | ${GB(x.b)} |`); }
  const mech = plan.rows.filter((r) => r.class === 'mechanical').reduce((a, r) => a + (r.bytes || 0), 0);
  lines.push('', `Mechanical total: ${GB(mech)} GB.`, '', '## Operator rows', '');
  const ops = plan.rows.filter((x) => x.class === 'operator').sort((a, b) => (b.bytes || 0) - (a.bytes || 0));
  for (const r of ops.slice(0, 40)) lines.push(`- \`${r.path}\` ${GB(r.bytes)} GB - ${r.kind}: ${r.reason}`);
  if (ops.length > 40) lines.push(`- ... ${ops.length - 40} more operator rows in disk.json`);
  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------- main

const OPTIONS = { 'idle-hours': 'number', 'temp-days': 'number', 'target-idle-hours': 'number', 'primary-target-days': 'number', scratch: 'value', out: 'value', json: 'flag', apply: 'flag', auto: 'flag', reap: 'list' };

/**
 * Strict argv. This tool deletes, so an option it does not know is refused rather than
 * ignored (`--apply --dry-run` used to apply), and a window that is not a non-negative number
 * is refused rather than read as NaN, which every `age < floor` comparison answers false:
 * `--idle-hours 24h` used to switch the liveness floor off. Throws a usage message.
 */
export function parseArgs(argv) {
  const o = { reap: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const name = a.startsWith('--') ? a.slice(2) : null;
    const kind = name && Object.hasOwn(OPTIONS, name) ? OPTIONS[name] : null;
    if (!kind) throw new Error(name ? `unknown option ${a}` : `unexpected argument ${a}`);
    if (kind === 'flag') { o[name] = true; continue; }
    if (kind === 'list') { o.reap = []; while (i + 1 < argv.length && !argv[i + 1].startsWith('--')) o.reap.push(argv[++i]); continue; }
    const v = argv[i + 1];
    if (v == null || v.startsWith('--')) throw new Error(`${a} needs a value`);
    i++;
    if (kind === 'number') {
      const n = Number(v);
      if (v.trim() === '' || !Number.isFinite(n) || n < 0) throw new Error(`${a} must be a non-negative number, got "${v}"`);
      o[name] = n;
    } else o[name] = v;
  }
  return o;
}

function main() {
  let args;
  try { args = parseArgs(process.argv.slice(2)); } catch (e) {
    console.error(`FATAL: ${e.message}\nusage: hygiene-disk.mjs [--idle-hours N] [--temp-days N] [--scratch <dir>] [--out <dir>] [--json] | --apply [--out <dir>] | --reap <dir>... [--idle-hours N]`);
    process.exit(EXIT.FATAL);
  }
  const opt = (n, d) => args[n] ?? d;
  const fleet = loadFleet(ROOT);
  // --reap needs no fleet: without one, a clone holding local commits is simply not shown landed
  if (!fleet.machine && !args.reap) { console.error(`FATAL: ${fleet.problems.join('; ')}`); process.exit(EXIT.FATAL); }
  const idleH = opt('idle-hours', 24);
  const tempDays = opt('temp-days', 7);
  const primaryTargetDays = opt('primary-target-days', PRIMARY_TARGET_DAYS);
  const common = git(ROOT, ['rev-parse', '--path-format=absolute', '--git-common-dir']) ?? path.join(ROOT, '.git');
  const outDir = path.resolve(opt('out', path.join(common, 'hygiene', new Date().toISOString().slice(0, 10))));
  fs.mkdirSync(outDir, { recursive: true });
  const planPath = path.join(outDir, 'disk.json');

  if (args.reap) {
    // A run's own end-of-task cleanup (curator's fin.sh): the named scratch-root entries, judged
    // by the same rules right now, idle floor 0 because the caller just finished in them.
    const scratch = path.resolve(opt('scratch', scratchRootOf(fleet)));
    const reapIdle = opt('idle-hours', 0);
    const targets = args.reap;
    const ledger = path.join(outDir, 'disk-applied.jsonl');
    const homes = fleetHomes(fleet);
    for (const t of targets) {
      const abs = path.resolve(t);
      let res;
      if (path.dirname(abs).toLowerCase() !== scratch.toLowerCase()) res = { done: false, skipped: `not a top-level entry of the scratch root ${scratch}` };
      else if (!fs.existsSync(abs)) res = { done: false, skipped: 'gone' };
      else {
        const m = measure(abs);
        const ageH = ageOf(m, Date.now());
        let c, f = {};
        if (m.rootIsLink) c = { class: 'operator', reason: 'is a link' };
        else if (fs.existsSync(path.join(abs, '.git'))) { f = checkoutFacts(abs, homes); c = classifyCheckout({ name: path.basename(abs), ageH, ...f }, { idleH: reapIdle }); }
        else c = BUILD_OUTPUT.test(path.basename(abs)) && ageH >= reapIdle ? { class: 'mechanical', kind: 'remove-build-output', reason: 'build output' } : { class: 'operator', reason: 'plain directory, content unknown' };
        if (c.class !== 'mechanical') res = { done: false, skipped: `${c.kind || c.class}: ${c.reason}` };
        else {
          const r = removeTree(abs);
          if (f.mainRepo) git(f.mainRepo, ['worktree', 'prune']);
          res = { done: r.errors === 0, freed: r.bytesFreed, errors: r.errors, firstErrors: r.firstErrors.slice(0, 2) };
        }
      }
      const row = { at: new Date().toISOString(), area: 'scratch', kind: 'reap', path: abs, ...res };
      fs.appendFileSync(ledger, JSON.stringify(row) + '\n');
      console.log(JSON.stringify(row));
    }
    return;
  }

  if (args.apply) {
    if (!fs.existsSync(planPath)) { console.error(`FATAL: no disk plan at ${planPath} - scan first`); process.exit(EXIT.FATAL); }
    const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
    const ledger = path.join(outDir, 'disk-applied.jsonl');
    const tally = { done: 0, skipped: 0, freed: 0 };
    const prune = new Set();
    for (const row of plan.rows.filter((r) => r.class === 'mechanical')) {
      const v = reclassify(row, { fleet, idleH: plan.idleHours, tempDays: plan.tempDays, targetIdleH: plan.targetIdleHours, primaryTargetDays: plan.primaryTargetDays });
      let res;
      if (!v.ok) res = { done: false, skipped: v.skip };
      else if (row.isFile) { try { fs.unlinkSync(row.path); res = { done: true, freed: v.bytes }; } catch (e) { res = { done: false, skipped: e.code }; } }
      else {
        const r = removeTree(row.path);
        res = { done: r.errors === 0, freed: r.bytesFreed, errors: r.errors, firstErrors: r.firstErrors.slice(0, 2), ...(r.errors ? { skipped: 'partly removed (locked files)' } : {}) };
        if (row.mainRepo) prune.add(row.mainRepo);
      }
      res.done ? tally.done++ : tally.skipped++;
      tally.freed += res.freed || 0;
      fs.appendFileSync(ledger, JSON.stringify({ at: new Date().toISOString(), area: row.area, kind: row.kind, path: row.path, ...res }) + '\n');
    }
    for (const repo of prune) git(repo, ['worktree', 'prune']);
    console.log(`disk apply: ${tally.done} done, ${tally.skipped} skipped, ${GB(tally.freed)} GB freed -> ${ledger}`);
    return;
  }

  const scratch = path.resolve(opt('scratch', scratchRootOf(fleet)));
  let machineCfg = {}; try { machineCfg = JSON.parse(fs.readFileSync(path.join(ROOT, '.machine.local.json'), 'utf8')); } catch { /* none: defaults */ }
  const models = { wanted: machineCfg.localModels === 'wanted', roots: (machineCfg.modelRoots ?? []).map((r) => path.resolve(r)) };
  let freeBytes = null;
  try { const s = fs.statfsSync(scratch && fs.existsSync(scratch) ? scratch : os.homedir()); freeBytes = s.bavail * s.bsize; } catch { /* unknown */ }
  // a drive short of space shortens the floor for build output: it is what refills the drive
  const lowDisk = freeBytes != null && freeBytes < LOW_DISK_BYTES;
  const targetIdleH = opt('target-idle-hours', lowDisk ? TARGET_IDLE_LOW_DISK_H : TARGET_IDLE_H);
  const rows = scan({ fleet, idleH, tempDays, scratch, targetIdleH, primaryTargetDays, extraRepos: buildRepos(fleet), models });
  const plan = { generatedAt: new Date().toISOString(), idleHours: idleH, tempDays, targetIdleHours: targetIdleH, primaryTargetDays, lowDisk, scratch, freeBytes, rows };
  fs.writeFileSync(planPath, JSON.stringify(plan, null, 2));
  const md = renderMarkdown(plan);
  fs.writeFileSync(path.join(outDir, 'disk.md'), md);
  process.stdout.write(args.json ? JSON.stringify(plan, null, 2) : md + `\nplan: ${planPath}\n`);
  if (args.auto) {
    // the unattended janitor: scan, then apply what that scan judged mechanical
    const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--apply', '--out', outDir], { stdio: 'inherit' });
    if (r.status !== 0) process.exit(EXIT.FATAL);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (e) { console.error(`FATAL: ${e.stack}`); process.exit(EXIT.FATAL); }
}
