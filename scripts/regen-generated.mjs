#!/usr/bin/env node
/**
 * regen-generated - rebuild the registry's generated views after a merge, and commit
 * ONLY them.
 *
 * Why it exists. Repo law says generated files are rebuilt by their generators, never
 * hand-edited, and that bundle indexes are rebuilt AFTER the merge commit (their
 * `changedAt` comes from git history). Every agent that merged main did that by hand:
 * resolve conflicts in JSON nobody should read, rerun four generators, commit. The
 * merge driver (merge-generated.mjs) now keeps one side and leaves a pending record in
 * the git dir; the hooks call this script; this script does the rest, once, correctly.
 *
 * This file is also the ONE declaration of the generated set (GENERATORS below). The
 * `merge=registry-generated` lines in .gitattributes are asserted equal to it by
 * scripts/tests/merge-generated.test.mjs, and the scripts in it are asserted equal to
 * the generator steps of scripts/gate.mjs (every step with a write mode), less the
 * exclusions named in EXCLUDED with their reasons.
 *
 * Order is dependency order, derived from what each generator reads:
 *   build-index            knowledge/ sources            -> knowledge/<d>/index.json
 *   build-knowledge-rules  reads every index.json        -> rules/ai-registry-*.md
 *   render-recipes         recipe.json                   -> recipes/.../RECIPE.md
 *   build-recipes-index    recipe.json                   -> recipes/index.json
 *   build-publications-index publication.json           -> publications/index.json
 *   build-catalog          reads index.json meta + lanes -> catalog.json
 *   build-marketplace      skills/ frontmatter           -> .claude-plugin/marketplace.json
 * Only the generators whose outputs are pending run, plus the ones that read those
 * outputs. A generated file changed on ONE side of a merge never reaches the driver:
 * git takes that side's copy whole, and it is as fresh as that side's sources. The
 * pending record is therefore the whole detection - no diff of source lanes is needed.
 *
 * The working tree is shared by concurrent sessions, so this NEVER regenerates over
 * someone's uncommitted edits. A clean tree is rebuilt in place. Anything else is
 * rebuilt in a temporary worktree of HEAD (the generators read the working tree, and
 * subject-revision stamps a dirty subject with today's date), then copied back only
 * onto generated paths that are clean against HEAD. The commit carries exactly those
 * paths, built with plumbing in a private index (the effect of `git commit --only`):
 * every other staged path stays staged and uncommitted. A generated path someone else
 * has modified or staged is skipped and named, and stays pending.
 *
 * Usage:
 *   node scripts/regen-generated.mjs              # plan only (same as --dry-run)
 *   node scripts/regen-generated.mjs --commit     # regenerate and commit what changed
 *   node scripts/regen-generated.mjs --commit --all   # every generator, pending or not
 *   --hook <post-merge|post-rewrite|post-commit> [--hook-arg <$1>]   (hooks only: quiet
 *        when nothing is pending, defers while a merge/rebase/pick is still in progress)
 *
 * TEST-ONLY: REGISTRY_REGEN_GENERATORS='[{"script":"x.mjs","paths":["gen/*.json"]}]'
 * replaces GENERATORS, so the tests can drive a fake generator in a temp repo.
 * REGISTRY_REGEN_ACTIVE=1 holds everything off: the hook blocks and this script exit at
 * once. The commit this script makes is plumbing and fires no hooks, so it cannot
 * recurse either way; the variable is for an operator (or a test) who wants a merge to
 * leave its pending record for a later, explicit --commit.
 *
 * Exits 0 when it committed or found nothing to do (or deferred), 1 when it had to
 * leave a generated path behind, 2 when a generator or a git step failed.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';
import { PENDING_NAME } from './merge-generated.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

export { PENDING_NAME };
export const COMMIT_MESSAGE = 'regenerate generated files after merge';

/** The generated set, in dependency order. `reads` names generators whose output it reads. */
export const GENERATORS = Object.freeze([
  { script: 'build-index.mjs', paths: ['knowledge/*/index.json'] },
  { script: 'build-knowledge-rules.mjs', paths: ['rules/ai-registry-*.md'], reads: ['build-index.mjs'] },
  { script: 'render-recipes.mjs', paths: ['recipes/**/RECIPE.md'] },
  { script: 'build-recipes-index.mjs', paths: ['recipes/index.json'] },
  { script: 'build-publications-index.mjs', paths: ['publications/index.json'] },
  { script: 'build-catalog.mjs', paths: ['catalog.json'], reads: ['build-index.mjs'] },
  { script: 'build-marketplace.mjs', paths: ['.claude-plugin/marketplace.json'] },
]);

/** gate.mjs write-mode steps that are deliberately NOT in the merge-driver set. */
export const EXCLUDED = Object.freeze({
  'librarian-scan.mjs':
    '--stamp-weights rewrites one block inside librarian/standard.md, a hand-written document; ' +
    'keeping one side of it would discard the other side\'s prose, so it merges as text.',
});

/** Every gitattributes pattern the driver owns. .gitattributes must list exactly these. */
export const GENERATED_PATHS = Object.freeze(GENERATORS.flatMap((g) => g.paths));

/** gitattributes-style glob: `*` stays inside one segment, `**` crosses them. */
export function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') {
      if (glob[i + 2] === '/') { re += '(?:.*/)?'; i += 2; } else { re += '.*'; i += 1; }
    } else if (c === '*') re += '[^/]*';
    else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

/**
 * Which generators to run for a set of pending paths: the ones owning them, plus every
 * generator that reads one of those (transitively). Unknown or no paths: all of them.
 */
export function selectGenerators(generators, pendingPaths) {
  if (!pendingPaths.length) return [...generators];
  const owners = new Set();
  for (const p of pendingPaths) {
    const g = generators.find((x) => x.paths.some((glob) => globToRegExp(glob).test(p)));
    if (!g) return [...generators];
    owners.add(g.script);
  }
  let grew = true;
  while (grew) {
    grew = false;
    for (const g of generators) {
      if (!owners.has(g.script) && (g.reads ?? []).some((r) => owners.has(r))) { owners.add(g.script); grew = true; }
    }
  }
  return generators.filter((g) => owners.has(g.script));
}

// ---------------------------------------------------------------- git helpers
// Long knowledge paths exceed MAX_PATH on Windows; a temp worktree must be able to hold them.
const GIT_ENV = process.platform === 'win32'
  ? { GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'core.longpaths', GIT_CONFIG_VALUE_0: 'true' }
  : {};
function git(cwd, args, extraEnv = {}) {
  const r = spawnSync('git', args, {
    cwd, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, env: { ...process.env, ...GIT_ENV, ...extraEnv },
  });
  return { ok: r.status === 0, out: r.stdout ?? '', err: (r.stderr ?? '').trim() || (r.error?.message ?? '') };
}
function mustGit(cwd, args, extraEnv) {
  const r = git(cwd, args, extraEnv);
  if (!r.ok) throw new Error(`git ${args.join(' ')} failed: ${r.err}`);
  return r.out;
}

/** Porcelain v1 -z, for the given pathspecs: [{ xy, file }]. Renames are not expected here. */
function status(cwd, pathspecs) {
  const out = mustGit(cwd, ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--', ...pathspecs]);
  const rows = [];
  const parts = out.split('\0');
  for (let i = 0; i < parts.length; i++) {
    const e = parts[i];
    if (!e) continue;
    const xy = e.slice(0, 2);
    rows.push({ xy, file: e.slice(3) });
    if (xy[0] === 'R' || xy[0] === 'C') i += 1; // skip the rename source
  }
  return rows;
}

/**
 * Commit exactly `files` (their working-tree content) on top of HEAD, touching no other
 * index entry. This is what `git commit --only` does, built from plumbing because the
 * porcelain cannot run here: post-merge fires while MERGE_HEAD still exists, and
 * `git commit` would then refuse a partial commit or record a second merge parent.
 * Plumbing also fires no commit hooks, so the commit cannot re-enter this script.
 * Returns the new commit id, or null when the files already match HEAD.
 */
function commitOnly(root, gitDir, files) {
  const head = mustGit(root, ['rev-parse', '--verify', 'HEAD']).trim();
  const tmpIndex = path.join(gitDir, `registry-regen-index-${process.pid}`);
  const env = { GIT_INDEX_FILE: tmpIndex };
  try {
    mustGit(root, ['read-tree', head], env);
    mustGit(root, ['update-index', '--add', '--remove', '--', ...files], env);
    const tree = mustGit(root, ['write-tree'], env).trim();
    if (tree === mustGit(root, ['rev-parse', `${head}^{tree}`]).trim()) return null;
    const commit = mustGit(root, ['commit-tree', tree, '-p', head, '-m', COMMIT_MESSAGE]).trim();
    // The real index learns the new blobs for these paths only, as `--only` leaves it;
    // every other entry - another session's staged work included - is not read or written.
    mustGit(root, ['update-index', '--add', '--remove', '--', ...files]);
    // Compare-and-swap: a HEAD that moved while the generators ran is not overwritten.
    mustGit(root, ['update-ref', '-m', `regen-generated: ${COMMIT_MESSAGE}`, 'HEAD', commit, head]);
    return commit;
  } finally {
    fs.rmSync(tmpIndex, { force: true });
  }
}

function generatorList() {
  const raw = process.env.REGISTRY_REGEN_GENERATORS;
  if (!raw) return GENERATORS;
  const list = JSON.parse(raw);
  if (!Array.isArray(list) || !list.every((g) => g && typeof g.script === 'string' && Array.isArray(g.paths))) {
    throw new Error('REGISTRY_REGEN_GENERATORS must be a JSON array of {script, paths[]}');
  }
  return list;
}

// ---------------------------------------------------------------- main
function main(argv) {
  if (process.env.REGISTRY_REGEN_ACTIVE) return EXIT.OK; // our own commit's hooks
  const flag = (n) => argv.includes(n);
  const value = (n) => { const i = argv.indexOf(n); return i === -1 ? null : argv[i + 1] ?? ''; };
  if (flag('--help') || flag('-h')) {
    console.log('usage: node scripts/regen-generated.mjs [--dry-run | --commit] [--all] [--hook <name> [--hook-arg <arg>]]');
    return EXIT.OK;
  }
  const commit = flag('--commit') && !flag('--dry-run');
  const hook = value('--hook');
  const hookArg = value('--hook-arg') ?? '';
  const say = (msg) => console.log(`regen-generated: ${msg}`);

  let generators;
  try { generators = generatorList(); } catch (err) { console.error(`regen-generated FATAL: ${err.message}`); return EXIT.FATAL; }

  let gitDir;
  try { gitDir = mustGit(ROOT, ['rev-parse', '--absolute-git-dir']).trim(); } catch (err) {
    console.error(`regen-generated FATAL: ${err.message}`);
    return EXIT.FATAL;
  }
  const pendingFile = path.join(gitDir, PENDING_NAME);
  const pendingText = fs.existsSync(pendingFile) ? fs.readFileSync(pendingFile, 'utf8') : '';
  const pending = [...new Set(pendingText.split(/\r?\n/).map((s) => s.trim().replace(/\\/g, '/')).filter(Boolean))];

  // A hook with nothing pending is the common case. It prints nothing.
  if (hook && !pending.length) return EXIT.OK;

  // Never commit into the middle of another operation; the pending record waits for the
  // hook that fires when it finishes. Measured on git 2.52: post-merge runs while
  // MERGE_HEAD still exists (the merge commit is already made), and post-rewrite runs
  // while rebase-merge/ still exists (HEAD already back on the branch), so each of those
  // hooks may ignore its own marker. A squash merge (post-merge $1 = 1) has made no
  // commit yet: post-commit takes it when the squash is committed.
  const ignore = new Set(hook === 'post-merge' ? ['MERGE_HEAD'] : hook === 'post-rewrite' ? ['rebase-merge', 'rebase-apply'] : []);
  const busy = ['MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD', 'rebase-merge', 'rebase-apply']
    .filter((n) => !ignore.has(n) && fs.existsSync(path.join(gitDir, n)));
  if (busy.length || (hook === 'post-merge' && hookArg === '1')) {
    if (!hook) say(`deferred: ${busy.length ? `${busy.join(', ')} present` : 'squash merge'}; nothing done, pending kept.`);
    return EXIT.OK;
  }

  const selected = flag('--all') ? [...generators] : selectGenerators(generators, pending);
  const pathspecs = selected.flatMap((g) => g.paths).map((p) => `:(glob)${p}`);

  if (!commit) {
    say(`pending: ${pending.length ? pending.join(', ') : '(none)'}`);
    say(`would run, in order: ${selected.map((g) => g.script).join(' -> ')}`);
    say(`would commit any change under: ${selected.flatMap((g) => g.paths).join(', ')}`);
    say('plan only; nothing regenerated. Re-run with --commit.');
    return EXIT.OK;
  }

  // ---- where to build
  let tree = ROOT;
  let temp = null;
  const cleanup = () => {
    if (!temp) return;
    const r = git(ROOT, ['worktree', 'remove', '--force', temp]);
    if (!r.ok) { fs.rmSync(temp, { recursive: true, force: true }); git(ROOT, ['worktree', 'prune']); }
    temp = null;
  };
  try {
    const dirty = mustGit(ROOT, ['status', '--porcelain', '--untracked-files=all']).trim() !== '';
    if (dirty) {
      temp = fs.mkdtempSync(path.join(os.tmpdir(), 'rrg-'));
      mustGit(ROOT, ['worktree', 'add', '--detach', '--quiet', temp, 'HEAD']);
      tree = temp;
    }
    say(`regenerating ${selected.length} generator(s) ${dirty ? 'in an isolated worktree of HEAD (the tree has uncommitted work)' : 'in place'}`);

    // ---- run the generators, stopping at the first failure
    for (const g of selected) {
      const started = Date.now();
      const r = spawnSync(process.execPath, [path.join(tree, 'scripts', g.script), ...(g.args ?? [])], {
        cwd: tree, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: { ...process.env, ...GIT_ENV },
      });
      if (r.status !== EXIT.OK) {
        const tail = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim().split('\n').slice(-15).join('\n');
        console.error(`regen-generated: ${g.script} FAILED (exit ${r.status ?? r.signal ?? r.error?.message}).`);
        if (tail) console.error(tail.replace(/^/gm, '  | '));
        console.error(dirty
          ? 'regen-generated: your working tree was not touched (the build ran in a temporary worktree).'
          : 'regen-generated: the tree is left exactly as the generators left it; nothing was committed.');
        console.error('regen-generated: the merge itself stands. Pending kept; fix the cause, then run:');
        console.error('  node scripts/regen-generated.mjs --commit');
        cleanup();
        return EXIT.FATAL;
      }
      say(`  ${g.script} ok (${((Date.now() - started) / 1000).toFixed(1)}s)`);
    }

    // ---- what changed, and what may be carried back
    const changed = status(tree, pathspecs);
    const take = [];
    const skipped = [];
    // Someone else's edit or staged copy of a generated path: never overwrite it.
    const busyHere = temp ? new Set(status(ROOT, pathspecs).map((r) => r.file)) : new Set();
    for (const { xy, file } of changed) {
      if (temp) {
        if (busyHere.has(file)) { skipped.push(file); continue; }
        const dst = path.join(ROOT, file);
        if (xy.includes('D')) fs.rmSync(dst, { force: true });
        else { fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(path.join(tree, file), dst); }
      }
      take.push({ file });
    }
    cleanup();

    const keepPending = () => { if (skipped.length) fs.writeFileSync(pendingFile, `${skipped.join('\n')}\n`); };
    const files = take.map((t) => t.file);
    const sha = files.length ? commitOnly(ROOT, gitDir, files) : null;
    fs.rmSync(pendingFile, { force: true });
    keepPending();
    if (!sha) say(skipped.length ? 'nothing committed.' : 'generated files are already fresh; nothing to commit.');
    else say(`committed ${sha.slice(0, 9)} "${COMMIT_MESSAGE}" - ${files.length} generated path(s): ${files.slice(0, 6).join(', ')}${files.length > 6 ? ', ...' : ''}`);
    if (skipped.length) {
      console.error(`regen-generated: LEFT ${skipped.length} generated path(s) alone - modified or staged in this working tree by someone else:`);
      for (const s of skipped) console.error(`  - ${s}`);
      console.error('regen-generated: they stay pending; run `node scripts/regen-generated.mjs --commit` once that work lands.');
      return EXIT.VIOLATIONS;
    }
    return EXIT.OK;
  } catch (err) {
    cleanup();
    console.error(`regen-generated FATAL: ${err.message}`);
    console.error('regen-generated: the merge itself stands; pending kept.');
    return EXIT.FATAL;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  process.exitCode = main(process.argv.slice(2));
}
