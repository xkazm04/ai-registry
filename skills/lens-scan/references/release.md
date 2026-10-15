# Release - shipping accepted items (lens-scan 1.5.0)

`/lens-scan release --id rel-<version> [--finish]`. The step after Execute and a
person's triage: the items a person **accepted** are cherry-picked from their packs onto
`release/<version>`, gated, re-measured and opened as one pull request into the default
branch. `--finish`, run once that PR is merged, tags it and ships the GitHub release.

Every store command below is `node ${CLAUDE_SKILL_DIR}/scripts/store.mjs <command>`, exactly
as `store.mjs --help` lists it. The agent never writes SQL and never moves an item a person
owns except the one move this procedure names (a cherry-pick conflict -> `rework`).


**Registry-target items never ship in a product release.** Their pack lives in the ai-registry
checkout, so the product's release branch cannot cherry-pick them. `release-add` leaves them
out (an item whose body starts `target: registry` is skipped with reason `registry-target`),
and they land through the registry's own flow.

## Who runs it, and the rules that never bend

- **Claude Code runs it, with the user's own `gh` login.** No token is read, stored or
  passed: `gh` and `git push` use whatever the user is signed in as.
- **Worktrees only.** The release branch and the pack branches are checked out in worktrees
  under `.ai/lens-scan/work/release/<version>` (gitignored, beside the store). **Never a
  checkout, a reset or a cherry-pick in the main working tree**, never touch its index.
- **Never `git stash`, never `git add -A`, never a force push** (`--force`,
  `--force-with-lease`, `+refspec`), never `git push --delete` or a remote branch delete.
  Stage only the files a step names.
- **Any failure stops the procedure.** `release-update --release rel-x --status failed
  --error "<what, one line>"`, then end with `lens-scan release failed: <what>`. The person
  decides; a failed release is retried from step 1 (`--status building --from failed`).
- Headless rules hold as for every mode (SKILL.md, Headless): never end the turn while work
  runs, never stop to ask.

## Before anything: the refusals

0. `gh auth status` must exit 0. Else: `release-update --release rel-x --status failed --error
   "gh not authenticated"` and end with `lens-scan refused: gh not authenticated`.
   Then read the release: `release --id rel-x`. It must be `draft` or `failed` (no `--finish`),
   `pr-open` or `merged` (`--finish`); its `items` are the ones a caller added with
   `release-add` (only `accepted` items with no release join, while it is draft or building).
   No items: refuse with `lens-scan refused: rel-x has no items`, leave the release as it is.
   Refuse, too, when the base checkout has **tracked uncommitted changes** in a file the
   release touches: `git diff --name-only HEAD` (tracked, staged or not) intersected with the
   files of every item's commit (`git show --name-only --format= <commit_sha>`). Untracked
   files are other work and never block it. Say `lens-scan refused: uncommitted changes in
   <files>`, set the release failed with that error; never stash them away.

## Cut (`/lens-scan release --id rel-x`)

1. **Building.** `release-update --release rel-x --status building --from draft` (`--from
   failed` on a retry). Fetch (`git fetch origin`). The worktree:
   - `release/<version>` does not exist locally or on origin: `git worktree add -b
     release/<version> .ai/lens-scan/work/release/<version> origin/<default branch>`, and
     record its base: `release-update --release rel-x --base-sha <sha of that commit>`;
   - it exists: `git worktree add .ai/lens-scan/work/release/<version> release/<version>`
     (a retry continues where the last attempt stopped; commits already on it are kept).
   The default branch is `gh repo view --json defaultBranchRef`, else `main`. Follow the
   [Lane B](../../scan-sweep/references/ab-lane.md) doctrine for `node_modules` (a junction,
   never `npm ci` through it; unlink it before `git worktree remove`).
2. **Cherry-pick** each item's `commit_sha` in order: by pack id, and inside a pack in pack
   order (the order the commits stack on `pack/<short>-<n>`: `git log --reverse --format=%H
   <pack base_sha>..pack/<short>-<n>`). An item whose commit is already on the branch (a
   retry; `git log release/<version> --grep "Lens-Item: <p-id>"`) is skipped. Use
   `git cherry-pick -x <sha>`; the `Lens-Item:` and `Lens-Pack:` trailers ride along.
   **On a conflict:** note the conflicted files (`git diff --name-only --diff-filter=U`),
   `git cherry-pick --abort`, and send the item back:
   `triage --ids <p> --decision rework --by skill:lens-scan --note "conflict on release/<v>: <files>"`.
   Then continue with the next item. It leaves the release, and its rebuild is a later
   execute's (SKILL.md, Rework).
   `triage` lets the release run (`--by skill:lens-scan`) take a conflicted item out of a
   `building` release; a person's triage still leaves only a draft one. So does a
   person's undo (`triage --decision reopen`, back to the item's `triaged_from`): it is
   refused `in-release` once the release left draft, so a building release never loses
   an item under the run except by this conflict move.
   An item whose `commit_sha` is missing (a `failed` item accepted with a note that never
   got a commit) cannot ship: fail the release naming it.
3. **Gates and numbers.** Run the overlay's `## Gates` in the release worktree, verbatim. A
   red gate fails the release (its command and the first failing line in the error). Then
   re-measure the touched features (every item's feature, through every item's lens) on the
   release head: `run-start --phase measure --lenses <lens,...> --features <f,...> --note
   "release rel-x at <head sha>"` (with `BP_JOB_ID` the note becomes `bp-job:<id> · release
   rel-x at <sha>`), each metric by the method it was measured with (static scripts with the
   release worktree as root, probes per [metrics.md](metrics.md#probes), the harness per
   SKILL.md), plain rows with `--commit-sha <head sha>` and no `--proposal`, then `run-end`.
   These are the numbers of what ships; the per-item before/after stays as Execute recorded it.
4. **Release notes**, markdown, written to `.ai/lens-scan/work/release/<version>.md`:
   - per shipped item: the title, the lens, the feature, `before -> after unit` (from
     `compare --ids <p>`: the before and after readings of its metric; say "stacked" when
     the pack held earlier items), the person's `triage_note` (**always** for an item that
     was accepted from `failed`: that note is why a red item ships), and the commit
     (`<short sha>` on the release branch, and the pack it came from);
   - the items sent to rework by a conflict, with their files;
   - the gates' result, one line per gate, and the release-head measurement run id.
   Store them: `release-update --release rel-x --notes "<the markdown>"` (pass the file's
   content as the argument; `--notes` takes text, not a path).
5. **Pull request.** `git push -u origin release/<version>` (from the release worktree; a
   plain push, never forced), then
   `gh pr create --base <default branch> --head release/<version> --title "Release <version>" --body-file <notes file>`.
   `release-update --release rel-x --status pr-open --pr-url <url>`. End the session with the
   URL; the merge is a person's.

## Finish (`/lens-scan release --id rel-x --finish`)

6. After the PR is merged:
   - `gh pr view <pr_url> --json state,mergeCommit`. `state` must be `MERGED`; anything
     else ends with `lens-scan refused: <pr_url> is <state>` and changes nothing.
   - `release-update --release rel-x --status merged --from pr-open` (skip it when the
     release already reads `merged`: a finish that was cut off continues here).
   - `git fetch origin`, `git tag v<version> <mergeCommit.oid>` (an annotated tag only if
     the repo's existing `v*` tags are annotated), `git push origin v<version>`.
   - `gh release create v<version> --title "<version>" --notes-file <notes file>` (rewrite
     the file from the release's stored `notes` when it is gone).
   - `release-update --release rel-x --status tagged --from merged --tag v<version>`. The
     store moves the release's `accepted` items to `released` and closes every pack left
     with only released, descoped or declined items, in one transaction: its output names
     them (`released`, `packs_closed`).
   - **Clean up**: remove the release worktree and the worktrees of the closed packs
     (`git worktree list`; unlink `node_modules` first), and delete the **local** branches
     `pack/<short>-<n>` of the closed packs (`git branch -D`, worktree removed first). The
     release branch and any remote branch stay: never delete a remote branch this flow
     did not create, and a merged `release/<version>` is the repo's to prune.

## Version suggestion (for callers such as bp)

The caller creates the release (`release-create --version <v> --by <kind:name>`); this is
how it suggests `<v>`:

- The latest tag: `git tag --list 'v*' --sort=-v:refname`, the first line, `v` stripped.
- From it, by the accepted items that will ship: every item a `fix` -> bump **patch**;
  any `baseline-upgrade`, or an item whose body marks a new capability (a line
  `capability: new`) -> bump **minor**. Major is a person's call, never suggested.
- No `v*` tag: the manifest's version as it stands (`package.json` `version`, else
  `Cargo.toml` `[package] version`, else `tauri.conf.json` `version`), else `0.1.0`.

## Reporting

End with: the release id and status, the branch, base and head sha, each shipped item
(`p-id  commit  metric before -> after unit`), the rework list with files, the gates, the
release-head measurement run id, and the PR URL (cut) or tag and release URL (finish).
