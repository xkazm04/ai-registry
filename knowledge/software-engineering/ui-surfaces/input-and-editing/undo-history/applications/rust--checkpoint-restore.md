---
layer: application
type: application
subject: undo-history
technique: checkpoint-restore
stack: rust
verified_on: 2026-10-31
verified_against: rust@1
---

# Turn snapshots for web-build projects — non-destructive restore over a repo

`src-tauri/src/webbuild/versions.rs` implements the technique's core for
Studio-built projects, using the project's own git repository as the
checkpoint store (scaffolded projects are repos already — the module header
notes create-next-app runs `git init`).

## Capture at a boundary of meaning

`commit_snapshot(project_dir, summary)` (`:23-34`) runs after each build
turn: `git add -A` + `git commit` with a message minted from the turn's
summary first line (`"athena: …"`, truncated to 72 chars). This is
per-boundary capture in its purest form — one checkpoint per completed unit
of work, never per timer — and each checkpoint gets identity and provenance
for free: a content-addressed sha, a timestamp, and a boundary-naming label,
surfaced by `list_versions` (`:37-63`, newest-first, capped at 40) as
`{sha, message, when}`.

## Restore is a forward move

`restore(project_dir, sha)` (`:67-84`) is `git checkout <sha> -- .` —
**files only**. Its own doc comment states the property the technique is
built around: "git history is kept, so the next turn simply commits forward
from here. Non-destructive to history." Restoring an old snapshot does not
truncate the snapshots after it; the timeline stays append-only, and the
restore itself becomes durable the moment the next turn commits. Browsing
old states is therefore free — the exploration-surface property. Input is
validated before touching the shell (`:69-71`, sha must be short-hex-shaped)
— the one door does its own gating.

The consuming surface, `src/features/studio/StudioVersions.tsx`, lists the
snapshots and restores on click with no confirmation dialog (`:30-36`,
`:61-65`) — correct *because* the mechanics are structurally safe; the
comment at `:7-9` sells it as "a safe go-back".

## Deviations (reported, standard kept)

- **Capture failure is silent.** Both commands in `commit_snapshot` discard
  their results (`let _ = …`). "Degrades silently when git isn't available"
  is the stated intent, but the effect is that a project whose snapshots
  stopped committing (hook failure, index lock, repo corruption) looks
  identical to one that's fully protected — the user consults the version
  list only at the moment they need it, which is exactly when an empty net
  is most expensive. The `_laws` failure-not-empty-success shape, on the
  capture side.
- **No pre-restore capture at restore time.** The technique's "applying C
  captures the current state first" is here an *invariant*, not an action:
  the pre-restore state is safe only because every turn ends committed. Any
  uncommitted drift between turns (a manual edit in the project dir) is
  overwritten by `checkout -- .` with no trace. A `commit_snapshot(dir,
  "before restore")` as the first line of `restore` would close the gap for
  one cheap call.
- **Retention is delegated to the repo, display-capped at 40.** No thinning,
  no pinning — acceptable here because git never evicts. Contrast the
  repo's own counter-example, `src-tauri/db/src/backup.rs`: `MAX_BACKUPS =
  3` sets rotated per *boot*, which — per the measured census in
  `docs/concepts/golden-paths/undo-persisted-operation.md` §0 — discarded
  every pre-incident database snapshot within two hours and eleven minutes
  on the day one was needed. Same product, both retention policies; the
  boot-rotating one is what the technique's thinning-and-pinning rule
  exists to prevent.

## Re-checked 2026-10-31 at personas@22260d77

The module was rewritten, and **both deviations above are now closed**:

- **Snapshots no longer commit to the owner's branch.** `commit_snapshot`
  (`versions.rs:33-48`) writes to a private ref, `SNAPSHOT_REF =
  "refs/athena/snapshots"` (`:20`), through the engine's
  `git_checkpoint::snapshot_worktree`. The branch, index and hooks are
  untouched; the module header (`:5-10`) records why: Studio also opens repos
  it did not create. The message is still `"athena: …"`, truncated to 72
  chars (`:43-44`).
- **Capture failure is no longer silent.** `commit_snapshot` returns
  `Result<Option<String>, AppError>`. `Ok(None)` means not a repo or nothing
  changed, and a snapshot failure is an `Err` (`:45-47`). The first
  deviation is resolved.
- **Restore captures first and refuses if it cannot.** `restore`
  (`:102-122`) validates the id (`:104-106`) and then runs
  `commit_snapshot(project_dir, "before restore").await?` (`:107`), the exact
  line this document proposed, before `git restore --overlay --source <sha>
  --worktree -- .`. `--overlay` never deletes files added after the snapshot.
  The second deviation is resolved.
- `list_versions` (`:52-91`) still caps at 40, newest-first. It reads the
  private ref, or `HEAD` for a project snapshotted before the ref existed.
- **`StudioVersions.tsx` now confirms before restoring.** It renders a
  `ConfirmDialog` and keeps it open on failure (`:49-60`). Its header comment
  (`:11-18`) says the confirm guards a mis-click and must not claim
  permanence, because the backend's pre-restore snapshot makes the restore
  undoable. The "no confirmation dialog" observation above no longer holds.
- `backup.rs` still rotates per boot (`MAX_BACKUPS = 3`, `:47`). Since then,
  `MIN_BACKUPS = 2` is always kept and a byte cap applies (`:21-30,:44-47`),
  so the boot-rotating counter-example stands.
