// Per-subject `revision` / `changedAt`, derived from git and emitted beside `digest` in
// every bundle's index.json.
//
// The digest is IDENTITY: it says whether a consumer's verdict was made against the
// subject as it is now. It cannot say how FAR behind that verdict is - two digests do
// not order. `revision` is ORDERING: a monotonic count of the commits that touched the
// subject's folder, so a consumer that stored the revision it judged against can
// compute `revisionsBehind = revision - evaluatedRevision`. `changedAt` is the date of
// the commit that last moved the folder, for a human reading the same row. Neither one
// replaces the digest as the sync key (docs/subject-revisions.md).
//
// Definition, per subject directory:
//
//   revision  = `git rev-list --count HEAD -- <dir>`   (+1 if <dir> is dirty vs HEAD)
//   changedAt = `git log -1 --format=%cs -- <dir>`     (today, UTC, if <dir> is dirty)
//
// The +1 rule is what makes `--check` idempotent on both sides of the commit that
// changes a subject: while the edit is uncommitted the index already carries the number
// the commit will produce, so the index written alongside the edit is still current
// once both land. (The date is the one field that can shift, when the commit lands on a
// later UTC day than the index was written; that is a regenerate, not a defect.)
//
// ## Why this is not two spawns per subject
//
// Two spawns per subject is 836 for the corpus, measured at 72 s on Windows. Instead the
// whole commit graph is read twice - once for parents and dates, once for the paths each
// commit changed against EACH parent - and git's default history simplification is
// replayed per directory in memory (revision.c `try_to_simplify_commit`): a commit is
// counted when the directory's tree differs from every parent; a merge whose directory
// tree equals some parent's is not counted and only the FIRST such parent is followed,
// so the other side of that merge is never walked. Replaying it, rather than
// approximating it with one pathspec-limited walk, is what makes the numbers equal to
// `rev-list --count -- <dir>` at merges: the approximation was off by one or two on
// 29 of 418 subjects (measured 2026-09-06), and a consumer computing revisionsBehind
// cannot tell an off-by-one from a real landing.
//
// `git log -m` emits one path list per parent but SUPPRESSES a parent whose diff is
// empty, header included, so a merge with fewer lists than parents cannot say which
// parent each list belongs to. Those (8 of 49 merges here) are resolved with one batched
// `git diff-tree --stdin` against the first parents. Spawns: 1 (probe) + 2 (graph,
// paths) + 1 (that batch) + 1 (status) = 5, in about 1 s on Windows. Validated against
// per-directory `rev-list --count` and `log -1` over all 418 subjects: identical.
//
// ## Fallback
//
// A shallow checkout (CI checks out depth 1) or a missing git would count a history
// that is not there. Then the PREVIOUS index's values are carried forward unchanged,
// one warning names the fallback, and a subject with no previous value gets `null` for
// both. A shallow count is never emitted - `1` from a depth-1 clone would be a confident
// wrong answer, and a consumer computing revisionsBehind would trust it.
//
// Zero dependencies, like every other script in this lane.
import { spawnSync } from 'node:child_process';
import path from 'node:path';

/** Env override for exercising the fallback without a shallow clone:
 *  `AI_REGISTRY_REVISIONS=carry-forward node scripts/build-index.mjs`. Test-only. */
export const FALLBACK_ENV = 'AI_REGISTRY_REVISIONS';

const git = (root, args) => {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 });
  if (r.error || r.status !== 0) return null;
  return r.stdout;
};

const toPosix = (p) => p.replace(/\\/g, '/');

/** Repo-relative POSIX path of `dir`, with a trailing slash so prefix tests cannot
 *  match a sibling that merely starts with the same characters (`rate-limit/` vs
 *  `rate-limiting/`). */
const relKey = (root, dir) => `${toPosix(path.relative(root, dir))}/`;

/**
 * Why git-derived values cannot be produced here, or null when they can.
 * Exported so a caller can decide before it builds anything.
 */
export function revisionFallbackReason(root) {
  if (process.env[FALLBACK_ENV] === 'carry-forward') return `${FALLBACK_ENV}=carry-forward is set`;
  const probe = git(root, ['rev-parse', '--is-inside-work-tree', '--is-shallow-repository']);
  if (probe === null) return 'git is unavailable or this is not a git checkout';
  const [inside, shallow] = probe.trim().split(/\r?\n/);
  if (inside !== 'true') return 'git is unavailable or this is not a git checkout';
  if (shallow === 'true') return 'this is a shallow checkout (history is truncated)';
  return null;
}

/**
 * Derive `{ revision, changedAt }` for each subject directory.
 *
 * @param {string} root      repository root (the directory git runs in)
 * @param {string[]} dirs    absolute subject directories
 * @param {object} [opts]
 * @param {Map<string, {revision: number|null, changedAt: string|null}>} [opts.previous]
 *        the last index's values keyed by absolute directory, used only by the fallback
 * @param {string} [opts.today]   `YYYY-MM-DD` used for dirty subjects (default: UTC today)
 * @param {(msg: string) => void} [opts.warn]   receives the one fallback warning
 * @returns {{ values: Map<string, {revision: number|null, changedAt: string|null}>,
 *             fallback: string|null, spawns: number }}
 */
export function deriveSubjectRevisions(root, dirs, opts = {}) {
  const warn = opts.warn ?? ((m) => console.error(m));
  const values = new Map();

  const fallback = revisionFallbackReason(root);
  if (fallback) {
    const prev = opts.previous ?? new Map();
    let carried = 0;
    for (const d of dirs) {
      const p = prev.get(d);
      const has = p && typeof p.revision === 'number';
      if (has) carried += 1;
      values.set(d, { revision: has ? p.revision : null, changedAt: has ? p.changedAt ?? null : null });
    }
    warn(
      `subject-revision WARNING: ${fallback}; revision/changedAt CARRIED FORWARD from the ` +
        `previous index for ${carried}/${dirs.length} subject(s), null for the rest. ` +
        'Nothing was counted - a truncated history must not be reported as a small one.',
    );
    return { values, fallback, spawns: 1 };
  }
  let spawns = 1;

  const dirKeys = dirs.map((d) => relKey(root, d));
  const byKey = new Map(dirKeys.map((k, i) => [k, dirs[i]]));
  const keyIndex = new Map(dirKeys.map((k, i) => [k, i]));
  // Which subject (by index) owns a repo-relative path: look up each ancestor folder of
  // the path (a handful of Map hits) rather than testing 418 prefixes per line - the
  // walk hands over ~45k lines, and the linear scan was two thirds of the wall time.
  // A subject's own folder never nests another subject, so the first hit is the only one.
  const ownerOf = (file) => {
    for (let i = file.indexOf('/'); i !== -1; i = file.indexOf('/', i + 1)) {
      const hit = keyIndex.get(file.slice(0, i + 1));
      if (hit !== undefined) return hit;
    }
    return -1;
  };
  const graph = readGraph(root);                       // 1 spawn
  const touched = readTouched(root, graph, ownerOf);   // 1 spawn + per-ambiguous-merge
  spawns += 2 + touched.extraSpawns;
  const lastByKey = replay(graph, touched.byCommit, dirKeys.length);

  // Dirtiness vs HEAD. `--untracked-files=all` so a new folder is reported file by file
  // rather than as one collapsed `?? dir/` entry (which would map, but a new file inside
  // an existing subject is never collapsed and must be seen too).
  const lane = commonDir(dirs.map((d) => toPosix(path.relative(root, d)))) || '.';
  const status = git(root, ['status', '--porcelain', '--untracked-files=all', '--', lane]);
  spawns += 1;
  if (status === null) throw new Error('subject-revision: git status failed');
  const dirty = new Set();
  for (const line of status.split('\n')) {
    if (line.length < 4) continue;
    // `XY path` or `XY old -> new` for renames; both sides of a rename are touched.
    for (const p of line.slice(3).split(' -> ')) {
      const i = ownerOf(toPosix(p.trim().replace(/^"|"$/g, '')));
      if (i >= 0) dirty.add(i);
    }
  }

  const today = opts.today ?? new Date().toISOString().slice(0, 10);
  for (const [k, i] of keyIndex) {
    const isDirty = dirty.has(i);
    const r = lastByKey[i];
    values.set(byKey.get(k), {
      revision: r.count + (isDirty ? 1 : 0),
      changedAt: isDirty ? today : r.date,
    });
  }
  return { values, fallback: null, spawns };
}

// ---------------------------------------------------------------- the graph

/** Every commit reachable from HEAD in log order: `{ order, byHash }` where each entry
 *  is `{ hash, date, ts, parents }`. */
function readGraph(root) {
  const out = git(root, ['log', '--format=%H%x00%cs%x00%ct%x00%P']);
  if (out === null) throw new Error('subject-revision: git log failed after the shallow check passed');
  const order = [];
  const byHash = new Map();
  for (const line of out.split('\n')) {
    if (!line) continue;
    const [hash, date, ts, parents] = line.split('\x00');
    const c = { hash, date, ts: Number(ts), parents: parents ? parents.split(' ') : [], pos: order.length };
    order.push(c);
    byHash.set(hash, c);
  }
  if (!order.length) throw new Error('subject-revision: git log returned no commits');
  return { order, byHash };
}

/**
 * For each commit, one Set of subject indexes per parent (index 0 for the root commit's
 * diff against the empty tree): the subjects whose folder differs between that parent
 * and the commit. A commit absent from `-m --name-only` output changed nothing against
 * any parent, and a parent pass absent from a present commit changed nothing against
 * that parent - EXCEPT that git suppresses empty passes without saying which parent
 * they were, so a merge with fewer passes than parents is resolved separately: all
 * two-parent cases in one `diff-tree --stdin` spawn, an octopus per parent.
 */
function readTouched(root, graph, ownerOf) {
  const out = git(root, ['log', '-m', '--no-renames', '--name-only', '--format=%x01%H']);
  if (out === null) throw new Error('subject-revision: git log -m failed');
  const passes = new Map(); // hash -> Set<number>[]
  for (const block of out.split('\x01')) {
    if (!block) continue;
    const nl = block.indexOf('\n');
    const hash = (nl === -1 ? block : block.slice(0, nl)).trim();
    const set = new Set();
    for (const line of (nl === -1 ? '' : block.slice(nl + 1)).split('\n')) {
      const file = line.trim();
      if (!file) continue;
      const i = ownerOf(file);
      if (i >= 0) set.add(i);
    }
    if (!passes.has(hash)) passes.set(hash, []);
    passes.get(hash).push(set);
  }

  const byCommit = new Map();
  let extraSpawns = 0;
  const EMPTY = new Set();
  const twoParent = []; // ambiguous merges with exactly two parents: one batched spawn
  for (const c of graph.order) {
    const got = passes.get(c.hash) ?? [];
    const n = Math.max(c.parents.length, 1);
    if (got.length === n || got.length === 0) {
      byCommit.set(c.hash, got.length ? got : Array.from({ length: n }, () => EMPTY));
    } else if (c.parents.length === 2 && got.length === 1) {
      twoParent.push(c);
    } else {
      // An octopus merge with suppressed passes: ask per parent. None exist here today.
      byCommit.set(c.hash, c.parents.map((p) => {
        extraSpawns += 1;
        const d = git(root, ['diff-tree', '-r', '--name-only', '--no-renames', p, c.hash]);
        if (d === null) throw new Error(`subject-revision: git diff-tree ${p} ${c.hash} failed`);
        return pathsToSubjects(d, ownerOf);
      }));
    }
  }
  if (twoParent.length) {
    // One line per merge, "<merge> <first parent>": diff-tree prints the merge's hash
    // as a header only when that diff is non-empty. Present -> the one pass git showed
    // was the first parent's (the second parent's was the suppressed empty one);
    // absent -> the reverse. No output is parsed beyond the headers.
    extraSpawns += 1;
    const r = spawnSync('git', ['diff-tree', '--stdin', '-r', '--name-only', '--no-renames'], {
      cwd: root, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024,
      input: twoParent.map((c) => `${c.hash} ${c.parents[0]}\n`).join(''),
    });
    if (r.error || r.status !== 0) throw new Error('subject-revision: git diff-tree --stdin failed');
    const firstDiffers = new Set(r.stdout.split('\n').map((l) => l.trim()).filter((l) => /^[0-9a-f]{40}$/.test(l)));
    for (const c of twoParent) {
      const [only] = passes.get(c.hash);
      byCommit.set(c.hash, firstDiffers.has(c.hash) ? [only, EMPTY] : [EMPTY, only]);
    }
  }
  return { byCommit, extraSpawns };
}

/** The subject indexes owning any path in a newline-separated list. */
function pathsToSubjects(text, ownerOf) {
  const set = new Set();
  for (const line of text.split('\n')) {
    const file = line.trim();
    if (!file) continue;
    const i = ownerOf(file);
    if (i >= 0) set.add(i);
  }
  return set;
}

/**
 * Replay git's default history simplification once per subject: from HEAD, a commit
 * counts when the subject's folder differs from EVERY parent; a merge equal to some
 * parent's folder is skipped and only the first such parent is followed. `date` is the
 * newest counted commit's committer date, which is what `git log -1 -- <dir>` prints.
 */
function replay(graph, byCommit, nSubjects) {
  const result = Array.from({ length: nSubjects }, () => ({ count: 0, date: null, ts: -1, pos: Infinity }));
  const head = graph.order[0].hash;
  for (let s = 0; s < nSubjects; s++) {
    const r = result[s];
    const seen = new Set();
    const stack = [head];
    while (stack.length) {
      const h = stack.pop();
      if (seen.has(h)) continue;
      seen.add(h);
      const c = graph.byHash.get(h);
      if (!c) continue; // a parent outside the walk: cannot happen in a full clone
      const diffs = byCommit.get(h);
      const parents = c.parents;
      if (parents.length <= 1) {
        if (diffs[0].has(s)) hit(r, c);
        if (parents.length) stack.push(parents[0]);
        continue;
      }
      const same = parents.findIndex((_, i) => !diffs[i].has(s));
      if (same >= 0) { stack.push(parents[same]); continue; }
      hit(r, c);
      for (const p of parents) stack.push(p);
    }
  }
  return result;
}

function hit(r, c) {
  r.count += 1;
  // Newest committer timestamp wins; equal timestamps fall back to log order.
  if (c.ts > r.ts || (c.ts === r.ts && c.pos < r.pos)) { r.ts = c.ts; r.pos = c.pos; r.date = c.date; }
}

/** Deepest directory common to every (POSIX, relative) path. */
function commonDir(paths) {
  if (!paths.length) return '';
  let parts = paths[0].split('/');
  for (const p of paths.slice(1)) {
    const q = p.split('/');
    let i = 0;
    while (i < parts.length && i < q.length && parts[i] === q[i]) i++;
    parts = parts.slice(0, i);
  }
  return parts.join('/');
}
