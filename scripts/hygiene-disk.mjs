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
 *                all on its remotes, or each local commit's patch-id is in its fleet home.
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
 *                removes its mkdtemp dirs, to be fixed where it is written.
 *   models       local model stores (Ollama, Hugging Face, LM Studio, torch, whisper caches)
 *                over 1 GB: `operator`, report-only (operator 2026-10-15: no local models on
 *                this machine, so a store growing back is news).
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
import { execFileSync } from 'node:child_process';
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
  if (!local.length) { f.headLanded = true; f.why = 'clone; every local ref is on its remotes'; return f; }
  const origin = urlKey(git(abs, ['remote', 'get-url', 'origin']));
  const home = homes.find((h) => h.keys.includes(origin));
  if (!home) { f.headLanded = false; f.why = `clone; ${local.length} local commits and no fleet home to check them in`; return f; }
  const oldest = git(abs, ['log', '-1', '--format=%cI', local.at(-1)]);
  const since = oldest ? new Date(Date.parse(oldest) - 86400e3).toISOString().slice(0, 10) : '2000-01-01';
  const ids = patchIdsOf(home.path, since);
  const missing = local.filter((c) => {
    const id = (git(abs, ['patch-id', '--stable'], git(abs, ['show', '--no-color', '--format=commit %H', c]) || '') || '').split(' ')[0];
    return !id || !ids.has(id);
  });
  f.headLanded = missing.length === 0;
  f.why = f.headLanded ? `clone; ${local.length} local commits, all in ${home.slug} by patch-id` : `clone; ${missing.length} of ${local.length} local commits not in ${home.slug}`;
  return f;
}

// ---------------------------------------------------------------------------- scan

const ageOf = (m, now) => (m.newestMs ? (now - m.newestMs) / H : Infinity);

function entryMeasure(abs, isFile) {
  if (!isFile) return measureTree(abs);
  const s = fs.lstatSync(abs);
  return { bytes: s.size, newestMs: Math.max(s.mtimeMs, s.birthtimeMs || 0), files: 1 };
}

export function scratchRootOf(fleetRoot) {
  return path.join(path.parse(path.resolve(fleetRoot || os.homedir())).root, 't');
}

/** The whole plan. `tmp` and `home` default to this machine's; tests pass fixtures. Never writes. */
export function scan({ fleet, idleH, tempDays, scratch, now = Date.now(), tmp = os.tmpdir(), home = os.homedir() }) {
  const rows = [];
  const homes = fleetHomes(fleet);
  const add = (area, abs, m, c, extra = {}) => rows.push({ area, path: abs, bytes: m.bytes, ageH: Number.isFinite(ageOf(m, now)) ? +ageOf(m, now).toFixed(1) : null, ...c, ...extra });

  // scratch root
  if (fs.existsSync(scratch)) {
    for (const e of fs.readdirSync(scratch, { withFileTypes: true })) {
      if (!e.isDirectory() || e.isSymbolicLink()) continue;
      const abs = path.join(scratch, e.name);
      const m = measureTree(abs);
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
          const m = measureTree(abs);
          if (ageOf(m, now) >= idleH) add('build', abs, m, { class: 'mechanical', kind: 'prune-incremental', reason: `incremental cache untouched ${Math.round(ageOf(m, now))} h` });
        }
      }
    }
  }
  for (const parent of parents) {
    for (const e of fs.readdirSync(parent, { withFileTypes: true })) {
      const abs = path.join(parent, e.name);
      if (!e.isDirectory() || e.isSymbolicLink() || projectPaths.has(abs.toLowerCase()) || !BUILD_OUTPUT.test(e.name) || fs.existsSync(path.join(abs, '.git'))) continue;
      const m = measureTree(abs);
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
    if (!c) return;
    if (isDir && fs.existsSync(path.join(abs, '.git'))) {
      const f = checkoutFacts(abs, homes);
      add('temp', abs, m, classifyCheckout({ name, ageH: ageOf(m, now), ...f }, { idleH }), { head: f.head, mainRepo: f.mainRepo });
    } else add('temp', abs, m, { ...c, kind }, { isFile: !isDir });
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

  // model stores
  for (const d of [path.join(home, '.ollama', 'models'), path.join(home, '.cache', 'huggingface'), path.join(home, '.cache', 'lm-studio'), path.join(home, '.lmstudio', 'models'), path.join(home, '.cache', 'torch'), path.join(home, '.cache', 'whisper')]) {
    if (!fs.existsSync(d)) continue;
    const m = measureTree(d);
    if (m.bytes >= 1e9) add('models', d, m, { class: 'operator', kind: 'model-store', reason: 'local model store (operator 2026-10-15: none wanted on this machine)' });
  }
  return rows;
}

// ---------------------------------------------------------------------------- apply

function reclassify(row, { fleet, idleH, tempDays, now = Date.now() }) {
  if (!fs.existsSync(row.path)) return { skip: 'gone' };
  const m = row.isFile ? entryMeasure(row.path, true) : measureTree(row.path);
  if (m.rootIsLink) return { skip: 'became a link' };
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
  else if (row.kind === 'remove-temp' || row.kind === 'remove-session-temp') c = classifyTemp({ ageH, bytes: m.bytes }, { tempDays, idleH }) ? { kind: row.kind } : null;
  if (!c || (c.kind !== row.kind)) return { skip: `no longer ${row.kind}${c ? ` (now ${c.kind})` : ''}` };
  return { ok: true, bytes: m.bytes };
}

// ---------------------------------------------------------------------------- report

const GB = (b) => (b == null ? '-' : (b / 1e9).toFixed(1));
function renderMarkdown(plan) {
  const lines = [`# Disk lane - ${plan.generatedAt.slice(0, 16)}`, '', `Free: ${GB(plan.freeBytes)} GB. Scratch root: \`${plan.scratch}\`.`, '', '| area | class | kind | rows | GB |', '|---|---|---|---|---|'];
  const g = new Map();
  for (const r of plan.rows) { const k = `${r.area}|${r.class}|${r.kind}`; const x = g.get(k) || { n: 0, b: 0 }; x.n++; x.b += r.bytes || 0; g.set(k, x); }
  for (const [k, x] of [...g.entries()].sort((a, b) => b[1].b - a[1].b)) { const [a, c, kind] = k.split('|'); lines.push(`| ${a} | ${c} | ${kind} | ${x.n} | ${GB(x.b)} |`); }
  const mech = plan.rows.filter((r) => r.class === 'mechanical').reduce((a, r) => a + (r.bytes || 0), 0);
  lines.push('', `Mechanical total: ${GB(mech)} GB.`, '', '## Operator rows', '');
  for (const r of plan.rows.filter((x) => x.class === 'operator').sort((a, b) => (b.bytes || 0) - (a.bytes || 0)).slice(0, 40)) lines.push(`- \`${r.path}\` ${GB(r.bytes)} GB - ${r.kind}: ${r.reason}`);
  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------- main

function main() {
  const argv = process.argv.slice(2);
  const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
  const fleet = loadFleet(ROOT);
  // --reap needs no fleet: without one, a clone holding local commits is simply not shown landed
  if (!fleet.machine && !argv.includes('--reap')) { console.error(`FATAL: ${fleet.problems.join('; ')}`); process.exit(EXIT.FATAL); }
  const idleH = Number(opt('idle-hours', 24));
  const tempDays = Number(opt('temp-days', 7));
  const common = git(ROOT, ['rev-parse', '--path-format=absolute', '--git-common-dir']) ?? path.join(ROOT, '.git');
  const outDir = path.resolve(opt('out', path.join(common, 'hygiene', new Date().toISOString().slice(0, 10))));
  fs.mkdirSync(outDir, { recursive: true });
  const planPath = path.join(outDir, 'disk.json');

  if (argv.includes('--reap')) {
    // A run's own end-of-task cleanup (curator's fin.sh): the named scratch-root entries, judged
    // by the same rules right now, idle floor 0 because the caller just finished in them.
    const scratch = path.resolve(opt('scratch', scratchRootOf(os.homedir())));
    const reapIdle = Number(opt('idle-hours', 0));
    const targets = [];
    for (let i = argv.indexOf('--reap') + 1; i < argv.length && !argv[i].startsWith('--'); i++) targets.push(argv[i]);
    const ledger = path.join(outDir, 'disk-applied.jsonl');
    const homes = fleetHomes(fleet);
    for (const t of targets) {
      const abs = path.resolve(t);
      let res;
      if (path.dirname(abs).toLowerCase() !== scratch.toLowerCase()) res = { done: false, skipped: `not a top-level entry of the scratch root ${scratch}` };
      else if (!fs.existsSync(abs)) res = { done: false, skipped: 'gone' };
      else {
        const m = measureTree(abs);
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

  if (argv.includes('--apply')) {
    if (!fs.existsSync(planPath)) { console.error(`FATAL: no disk plan at ${planPath} - scan first`); process.exit(EXIT.FATAL); }
    const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
    const ledger = path.join(outDir, 'disk-applied.jsonl');
    const tally = { done: 0, skipped: 0, freed: 0 };
    const prune = new Set();
    for (const row of plan.rows.filter((r) => r.class === 'mechanical')) {
      const v = reclassify(row, { fleet, idleH: plan.idleHours, tempDays: plan.tempDays });
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

  const scratch = path.resolve(opt('scratch', scratchRootOf(fleet.root ?? os.homedir())));
  const rows = scan({ fleet, idleH, tempDays, scratch });
  let freeBytes = null;
  try { const s = fs.statfsSync(scratch && fs.existsSync(scratch) ? scratch : os.homedir()); freeBytes = s.bavail * s.bsize; } catch { /* unknown */ }
  const plan = { generatedAt: new Date().toISOString(), idleHours: idleH, tempDays, scratch, freeBytes, rows };
  fs.writeFileSync(planPath, JSON.stringify(plan, null, 2));
  const md = renderMarkdown(plan);
  fs.writeFileSync(path.join(outDir, 'disk.md'), md);
  process.stdout.write(argv.includes('--json') ? JSON.stringify(plan, null, 2) : md + `\nplan: ${planPath}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (e) { console.error(`FATAL: ${e.stack}`); process.exit(EXIT.FATAL); }
}
