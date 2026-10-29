// git.mjs - the small git surface /hackathon needs, and the one safe way it removes a worktree.
//
// WHY a helper and not execFileSync everywhere: most git calls here are allowed to fail (no
// upstream, a branch that already exists, a hook that rejects a snapshot commit) and the caller
// decides what a failure means, so every call returns { ok, out, err, code } instead of throwing.
//
// WHY removeWorktree never calls `git worktree remove`: on Git for Windows it descends into the
// node_modules junctions a setup step creates and deletes what they point at (608 tracked files of
// a primary checkout, 2026-10-20). The tree goes through the vendored safe-remove (links unlinked,
// never entered), then `git worktree prune` drops the admin entry.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { removeTree, measureTree } from './safe-remove.mjs';

export function git(cwd, args, { input } = {}) {
  const r = spawnSync('git', ['-C', cwd, ...args], { encoding: 'utf8', input, maxBuffer: 256 * 1024 * 1024, windowsHide: true });
  return { ok: r.status === 0, code: r.status, out: (r.stdout ?? '').trim(), err: (r.stderr ?? '').trim() || (r.error ? r.error.message : '') };
}

export function gitOrThrow(cwd, args) {
  const r = git(cwd, args);
  if (!r.ok) throw new Error(`git ${args.join(' ')} failed in ${cwd}: ${r.err || `exit ${r.code}`}`);
  return r.out;
}

/**
 * Pure: `text` of an info/exclude file with `line` present exactly once. Returns the new text and
 * whether it changed, so a second prepare leaves the file byte-identical.
 */
export function addExcludeLine(text, line = '.hackathon/') {
  const src = String(text ?? '');
  const has = src.split(/\r?\n/).some((l) => l.trim() === line);
  if (has) return { text: src, changed: false };
  const sep = src === '' || src.endsWith('\n') ? '' : '\n';
  return { text: `${src}${sep}${line}\n`, changed: true };
}

/** The repository's common git dir (shared by every worktree), absolute. */
export function commonDir(repo) {
  return path.resolve(repo, gitOrThrow(repo, ['rev-parse', '--git-common-dir']));
}

/** Append `.hackathon/` to <common dir>/info/exclude once. Returns true when the file changed. */
export function ensureExcluded(repo, line = '.hackathon/') {
  const file = path.join(commonDir(repo), 'info', 'exclude');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const { text, changed } = addExcludeLine(before, line);
  if (changed) fs.writeFileSync(file, text);
  return changed;
}

/** Registered worktrees of `repo`: [{ path, head, branch, detached, locked }]. */
export function listWorktrees(repo) {
  const r = git(repo, ['worktree', 'list', '--porcelain']);
  if (!r.ok) return [];
  return r.out.split(/\r?\n\r?\n/).filter(Boolean).map((block) => {
    const get = (k) => block.match(new RegExp(`^${k} (.+)$`, 'm'))?.[1] ?? null;
    return { path: get('worktree'), head: get('HEAD'), branch: get('branch'), detached: /^detached$/m.test(block), locked: /^locked/m.test(block) };
  });
}

const same = (a, b) => path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();

export const isRegistered = (repo, wt) => listWorktrees(repo).some((w) => w.path && same(w.path, wt));

/** Uncommitted paths in a worktree, untracked included (status.showUntrackedFiles=no must not hide them). */
export function dirtyFiles(wt) {
  const r = git(wt, ['--no-optional-locks', 'status', '--porcelain', '--untracked-files=all']);
  if (!r.ok) return null;
  return r.out ? r.out.split(/\r?\n/) : [];
}

export const treeSize = (dir) => measureTree(dir);

/**
 * Remove one linked worktree of `repo` safely. Refuses a path that is not a registered linked
 * worktree, a locked one, and - unless allowDirty - one with uncommitted changes.
 * Returns { removed, refused?, dirty?, stats }.
 */
export function removeWorktree(repo, wt, { allowDirty = false, dryRun = false } = {}) {
  if (!fs.existsSync(wt)) {
    git(repo, ['worktree', 'prune']);
    return { removed: false, refused: `${wt} does not exist (pruned any stale entry)` };
  }
  const dotGit = fs.lstatSync(path.join(wt, '.git'), { throwIfNoEntry: false });
  if (!dotGit?.isFile()) return { removed: false, refused: `${wt} is not a linked worktree (its .git is not a file)` };
  const entry = listWorktrees(repo).find((w) => w.path && same(w.path, wt));
  if (!entry) return { removed: false, refused: `${wt} is not registered with ${repo}` };
  if (entry.locked) return { removed: false, refused: `${wt} is locked` };
  const dirty = dirtyFiles(wt) ?? [];
  if (dirty.length && !allowDirty) return { removed: false, refused: `${wt} has ${dirty.length} uncommitted change(s)`, dirty };
  const stats = removeTree(wt, { dryRun });
  if (dryRun) return { removed: false, dryRun: true, dirty, stats };
  if (fs.existsSync(wt)) return { removed: false, refused: `could not empty ${wt} (${stats.errors} error(s): ${stats.firstErrors.join('; ')})`, dirty, stats };
  git(repo, ['worktree', 'prune']);
  return { removed: true, dirty, stats };
}
