---
layer: application
type: application
subject: embedded-db
technique: journal-and-durability-modes
stack: rust
verified_on: 2026-09-01
verified_against: rust@1.97
applied: code
ab_verdict: better
proof: ab-paired
---

# The file-set clause, honored by name in three places and right by luck

The desktop app's primary store is a single SQLite file opened under
write-ahead journaling, and the tree already honors the file-set clause on
every axis the technique lists: the pre-migration backup copies the main
file plus its `-wal`/`-shm` siblings before any connection opens
(`src-tauri/db/src/backup.rs`), rotation deletes old backup *sets* rather
than old main files, and the permission pass restricts the sidecars along
with the store. The backup module's header even states the naming rule and
the reason it works. What it did not state is that the reason was luck.

## The structural fact

All three sites built the sidecar name with the path library's extension
swap: `with_extension("db-wal")`. That rule and SQLite's rule (append the
suffix to the whole file name) agree on exactly one class of name — a store
whose last extension is `db`. The tree's one store is named that way, so
the copy, the rotation and the permission pass were all correct, and no
test could have distinguished "correct" from "correct for this name",
because every test used the same name. The second store the application
opens under a different name is where the clause would have been honored
in intent and missed in fact — the source's own bug, one character apart.

## The paired comparison

The measurable is the number of store names for which the constructed
sidecar path equals the sidecar SQLite actually creates. A harness opened
six names under write-ahead journaling, wrote a row, and compared:

| arm | rule | correct |
|---|---|---|
| A | the tree's `with_extension("db-wal")` | 2 of 6 |
| A' | the source's shipped bug, `name + ".wal"` | 0 of 6 |
| B | append `-wal` to the full file name | 6 of 6 |

Arm A is right for `personas.db` and `v2.backup.db` and wrong for `store`,
`foo.sqlite`, `cache.db3` and `personas.db.bak`. Arm B is SQLite's own
derivation and cannot disagree with it.

## What shipped

A `sidecar_path(db_path, suffix)` helper in the db crate that appends the
suffix to the whole file name, used by the backup copy, the rotation and
the permission pass; the sidecar constant renamed from extensions to
suffixes; and the regression test the amendment prescribes —
`sidecar_path_matches_what_sqlite_writes` opens `store`, `data.sqlite` and
`personas.db` under write-ahead journaling and asserts the constructed
sidecar exists on disk. The existing rotation test passes unchanged through
the helper. Committed on the project's active branch; not pushed.

## What the realization cannot do

The engine's own sidecar-name query (a function of the open connection) is
not reachable through the app's SQLite binding, so the helper reproduces
the engine's rule rather than asking for it. If the engine ever changes the
rule, the test — not the helper — is what will notice.
