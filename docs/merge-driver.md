# Merge driver for generated files

Generated views (`catalog.json`, `knowledge/*/index.json`, `rules/ai-registry-*.md`,
`recipes/**/RECIPE.md`, `recipes/index.json`, `publications/index.json`,
`.claude-plugin/marketplace.json`) are views of their sources. When both sides of a
merge regenerated one, a line-by-line merge of the two views is not a view of the merged
sources. It conflicts, or it merges cleanly and is stale. The fix is to regenerate
after the merge commit exists, because bundle indexes date `changedAt` from git
history. This machinery does that so the agent does not have to.

## Pieces

| File | Role |
| --- | --- |
| `.gitattributes` | names `merge=registry-generated` for exactly `GENERATED_PATHS` (test-enforced) |
| `scripts/merge-generated.mjs` | the driver: keeps our side, appends the path to `<git-dir>/registry-regen-pending`, exits 0. For `catalog.json` it also folds the carried-forward fields (`adopters`, `applicability`, `_drift`, unowned top-level keys) three-way, so the other side's edits to them survive |
| `scripts/regen-generated.mjs` | runs the generators that own the pending paths, plus the ones that read them, in dependency order. It then commits only the changed generated paths and clears the record |
| `scripts/install-merge-driver.mjs` | opt-in: local git config plus a managed block in `post-merge`, `post-rewrite`, `post-commit` |

## Install (per checkout, opt-in)

```sh
node scripts/install-merge-driver.mjs            # --check: report state, exit 1 if missing
node scripts/install-merge-driver.mjs --install  # idempotent; chains existing hooks
node scripts/install-merge-driver.mjs --uninstall
```

Config is `--local`, and hooks resolve through `git rev-parse --git-path hooks` (the
common git dir), so one install covers every worktree. A `core.hooksPath` outside the git
dir is a tracked directory. The installer reports it and does not write there.

## Behaviour

- **Merge**: the generated paths never conflict. `post-merge` runs the regeneration
  and adds one commit, `regenerate generated files after merge`, on top of the merge.
- **Rebase / pull --rebase**: each replayed commit keeps the upstream view, so
  intermediate commits carry stale views. `post-rewrite` then regenerates once at the tip.
- **Merge stopped by an unrelated conflict**: finishing it with `git commit` fires
  `post-commit` and does not fire `post-merge` (measured, git 2.52). The `post-commit` block
  takes it. Squash merges and cherry-picks are picked up by the next `post-commit`.
- **Nothing pending**: each hook costs one `git rev-parse` and a file test, and prints nothing.
- **Shared tree**: a clean tree is rebuilt in place. A tree with any uncommitted work
  is rebuilt in a temporary worktree of HEAD, so another session's edits never reach
  a view. Results are copied back only onto generated paths that are clean against
  HEAD. A path someone else modified or staged is skipped, named, and left pending
  (exit 1).
- **The commit**: it is made with plumbing in a private index. That is the effect of
  `git commit --only`, which cannot run in `post-merge` because MERGE_HEAD still
  exists there. Other staged work stays staged and uncommitted. The commit fires no
  hooks, so it cannot recurse. Setting `REGISTRY_REGEN_ACTIVE=1` holds the hooks off.
- **Generator failure**: it prints the generator's output tail. The merge stands, the
  tree is left as the generators left it, the record stays pending, and nothing is
  committed. Re-run with `node scripts/regen-generated.mjs --commit`. With no flag (or
  `--dry-run`), the script prints the plan only.
- **Driver cannot write its record**: it exits 1, and git reports an ordinary conflict.

Cost, measured on the full registry: about 35 s for an index plus catalog
regeneration. Add about 8 s for the temporary worktree when the tree is dirty.

## A machine without the driver

The attribute is inert until the installer runs, because git config is never cloned.
Git falls back to its built-in text merge when an attribute names a driver that is not
configured. Measured on git 2.52 (and asserted by `scripts/tests/merge-generated.test.mjs`),
the same merge conflicts exactly as it did before the attribute existed. Nothing breaks,
and nothing is gained.

## Not covered

`librarian/standard.md` is stamped by `librarian-scan.mjs --stamp-weights`, but it is
mostly prose, so it merges as text. A modify/delete conflict on a generated file is
resolved by git before any driver runs, so it still conflicts.
