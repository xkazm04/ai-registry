---
layer: application
type: application
subject: migrations
technique: pre-migration-snapshots
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.96
---

# Pre-migration snapshots of the primary database

The snapshot gate lives in `src-tauri/db/src/backup.rs` and is called from
`init_db` at `src-tauri/db/src/lib.rs:387` — before the connection pool
opens the file, which is the load-bearing ordering: at that moment the
process holds no handle, so a plain file copy is consistent
(`backup.rs:78-81` documents exactly this reasoning).

## What the standard's clauses look like here

- **Sidecars copied with the main file** (`backup.rs:63-69`, `:155-171`).
  `SIDECAR_SUFFIXES = ["-wal", "-shm"]`; the module doc knows *why*:
  the write-ahead journal holds any not-yet-checkpointed transactions from
  the previous session. A failed sidecar copy degrades honestly — the main
  copy alone is "a valid database as of its last checkpoint" and the
  warning says the tail may be absent (`:161-170`).
- **Fresh installs skipped** (`:83-86`) — no user data to protect, and no
  `backups/` litter. Zero pending protection produces zero snapshots.
- **Rotation named at creation** (`:198`, `rotate_backups` at `:268-329`):
  keep the newest `MAX_BACKUPS = 3` sets, delete main file *plus* sidecars
  together (`delete_set`, `:247-263`) — the reaper deletes whole sets, exactly the
  standard's torn-restore clause.
- **Naming carries ordering, defensively**: `personas-<UTC stamp>-<nn>.db`
  with the counter chosen as max+1, not first-free-slot (`:98-138`) — a
  reused low slot would make the newest backup sort oldest and be rotated
  out by its own rotation pass. UTC avoids DST-fold ordering glitches.
  Lexicographic order == chronological order is what rotation sorts by.
- **Tests exercise creation and rotation** (`src-tauri/db/src/lib.rs:2852`
  ff.): five same-second backups, sidecar siblings asserted per set,
  survivor count pinned.

## The priced deviations

The module doc (`backup.rs:12-38`) is a model of *documenting* a trade the
standard would spell differently:

1. **Every-boot snapshots, not pending-gated.** "There is no schema-version
   counter in this codebase … so there is no cheap 'will this boot actually
   change the schema?' signal. We back up on EVERY boot of an existing
   database instead." This is the ledger-less consequence the technique
   names: the rotation window ages in boots, not migration boundaries.
   With `MAX_BACKUPS = 3`, three restarts after a bad migration rotate away
   the last pre-migration copy — the restart-storm sizing concern applies
   here literally (a crash-restart storm is even called out at `:99` as the
   reason for the same-second counter).
2. **Best-effort, never blocks boot** (`:36-38`, every failure path returns
   `None` with a `tracing::warn!`): "A failed backup must never be worse
   than the risk it protects against." Defensible under the technique's
   failed-copy policy *because* the design cannot know what is pending —
   but the skipped-snapshot fact is only a log warning; it is not carried
   into any later migration-failure report, so "chain failed AND there was
   no snapshot" would be discovered, not known.
3. **No verification-open of the copy.** The one hard clause present is
   negative-space: a failed main-file copy deletes the truncated partial
   rather than leaving it "masquerading as a backup" (`:147-149`). But no
   path opens the finished copy read-only or integrity-checks it; the gate
   never looks at recoverability itself.
4. **The restore path is prose, not code.** The module doc (`:8-10`) says a
   botched boot "can always be recovered by copying the newest backup back
   over personas.db" — correct mechanics, but there is no in-product or
   test-exercised restore; it will be executed for the first time by a
   support case. The snapshot name carries a timestamp but no schema
   version (nothing to carry — no version exists), so "which release can
   open this backup" is answerable only from the timestamp.

## The second database has no gate at all

The standard's hardest lesson here is an absence: the knowledge-base /
companion store (`personas_data.db`, schemas in
`src-tauri/db/src/lib.rs` around `:739` / `:766`) migrates via hand-appended
ALTERs with **no snapshot, no runner, no guards** — one product, two
stores, one of them outside every protection this technique describes. A
transplant reader should check their own system for exactly this: the
snapshot contract tends to cover the store everyone thinks of as "the
database" and miss its younger siblings.

Re-checked 2026-10-31 at personas@22260d77c9: the gate is the same, its
surroundings are not, and two of the priced deviations have moved.

- **Rotation is now a count-plus-bytes budget** (`04b4c2b7f4`): boot sets keep
  the newest `MIN_BACKUPS = 2` unconditionally and up to `MAX_BACKUPS = 3` while
  the kept sets fit in `MAX_BACKUP_BYTES` (768 MiB, `backup.rs:43-52`), and any
  other `.db` in `backups/` ages out after 14 days. For a large store this
  makes deviation 1's restart-storm window *shorter*: two boots, not three.
- **A quarantined store holds rotation.** If the previous session ended
  quarantined, the snapshot is taken and nothing is rotated (`:178-196`), so
  slow structural damage can no longer rotate the last good copy away.
- **Deviation 4 is reversed in code.** `src-tauri/db/src/restore.rs` lists every
  set, opens each read-only and probes it with `PRAGMA quick_check(1)`
  (`:115`, `:172-210`), takes a choice as a marker beside the store
  (`request_restore`, `:284`), and `init_db` applies it before the pool opens
  (`lib.rs:395`); its tests exercise damage → offer → restore. No caller of
  `request_restore` or `offer_for` was found outside the db crate at this
  commit, so whether the operator can reach it from the product is not
  established here.
- **Deviation 3 is partly answered.** That probe is the verification-open
  the standard asks for, but it runs when the list is read, not when the copy
  is made; the snapshot path itself still never opens its copy.
- Deviation 2 and the second-database finding stand: failures are still
  warn-and-continue, and `init_user_db` still applies its ALTERs with no
  snapshot and no runner.
