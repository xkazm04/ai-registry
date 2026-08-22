---
layer: application
type: application
subject: embedded-db
technique: journal-and-durability-modes
stack: c
verified_on: 2026-08-22
---

# Journal and durability modes in SQLite itself (C)

The engine most embedded applications sign this contract *with*, read as an
implementation of the contract. Citations are against SQLite **3.54.0**
(`VERSION`), commit `45f4f1c` (2026-08-22) of `sqlite/sqlite` on GitHub — an
official read-only mirror of the canonical Fossil trunk at `sqlite.org/src`, so
that hash is the mirror's, not an upstream check-in id. External tree, so the pin
is in prose rather than `verified_against`, a stack runtime version.

## 1. The file set is a locking argument, and it is public API

Rollback journaling names a `<db>-journal` sidecar once at open
(`src/pager.c:4969`); WAL appends frames to `<db>-wal` (`:4983`) plus a
memory-mapped `<db>-shm` wal-index kept *in the same directory as the database*,
since elsewhere two processes may end up with "different files for shared
memory ... resulting in database corruption" (`src/os_unix.c:4921-4933`). The
file-set clause is a correctness argument here, not an afterthought — and the
set is public API: `sqlite3_filename_database()`, `_journal()`, `_wal()`
(`src/sqlite.h.in:4131-4133`) over `sqlite3_db_filename()` (`:4115-4124`).

## 2. The mode is in the file; the sync level is not

Journal mode is **persisted in the database header**: byte 19 of page 1 is the
write-format version, `2` means WAL, and that byte is what makes `btree.c` open
the WAL on first read of page 1 (`src/btree.c:3371-3374`) — so WAL is sticky
across processes, inherited by every connection, tool, and backup script.
`PRAGMA synchronous` is the opposite, and the source says so: "Changing the
local value does not make changes to the disk file and the default value will be
restored the next time the database is opened" (`src/pragma.c:1127-1130`).
**The two halves of one contract have opposite persistence**: set both at first
run and you have durably signed half and transiently signed the other, so the
sync clause must be re-asserted on every connection the pool manufactures
([connection-pooling](../techniques/connection-pooling.md)) — though the engine
does derive a default sync level from the discovered mode where the application
has not chosen (`src/btree.c:3377`,`:3385`,`:3285-3287`).

The four rungs live in one function under a fifty-line comment that is the best
statement of the technique's "honesty knob" anywhere (`src/pager.c:3615-3665`;
code `:3666-3712`; ladder `src/pager.h:116-120`). Rollback: OFF never syncs,
NORMAL once, FULL twice around the `nRec` header write, EXTRA also fsyncing the
directory after unlink (`:3679-3691`). Under WAL the words shift: NORMAL does
**no sync at ordinary commit at all**, only around checkpoints (`:3645-3653`).

## 3. Checkpointing is maintenance, with an aggressiveness ladder

Commits live only in the sidecar until a checkpoint backfills them
(`src/wal.c:18-25`). The shipped automatic pass fires at `nFrame` frames
(`src/main.c:2502-2514`), armed at open with `SQLITE_DEFAULT_WAL_AUTOCHECKPOINT`
= **1000** pages (`src/main.c:3715`; `src/sqliteLimit.h:168-170`) — a
*commit-time* trigger on the writer's own thread, the opposite of a quiet window
([quiet-window-maintenance](../techniques/quiet-window-maintenance.md)).
Aggressiveness is PASSIVE, FULL, RESTART, TRUNCATE (`src/sqlite.h.in:10256-10260`).
"Long-lived read snapshots pin the journal" is literally `mxSafeFrame`: the
checkpointer walks the reader marks and clamps the backfill horizon to the
oldest live reader (`src/wal.c:2233-2251`), and `SQLITE_BUSY` from a live reader
is **reset to `SQLITE_OK`** (`:2346-2350`) — only non-PASSIVE modes surface the
shortfall (`:2358-2362`). Call PASSIVE, check only the return code, and you
cannot tell a full checkpoint from one blocked by your own leaked reader. Nor is
sidecar removal automatic: the last connection unlinks `-wal`/`-shm` only if its
closing checkpoint fully succeeded and persistent-WAL is off (`:2519-2565`;
`src/os_unix.c:4183-4184`).

## 4. Assert at boot — possible, never mandatory

`PRAGMA journal_mode` is a **query that also sets**: `OP_JournalMode` writes the
final effective mode name into the result register unconditionally
(`src/vdbe.c:8315-8321`), so the technique's assertion is one string comparison
on the returned row — deliberate, because the silent fallbacks it warns about
are all here: WAL on a VFS without shared memory (`xShmMap` absent, or `noLock`)
reverts with no error (`src/vdbe.c:8265-8273`; `src/pager.c:7611-7615`), as does
WAL on a temp or in-memory database (`:8269`; `src/pager.c:7443-7448`).

### Deviations

1. **The fallback has no diagnostic channel.** SQLite logs
   `SQLITE_WARNING_AUTOINDEX` for a transient planner inefficiency
   (`src/sqlite.h.in:578`; `src/where.c:1056`) — but "you asked for WAL and got
   DELETE," which silently changes concurrency model, backup scope, and crash
   semantics, emits nothing. Discard the pragma's row, as nearly every wrapper
   does, and nothing anywhere can tell you.
2. **The sync half cannot be asserted in the same statement.** `PRAGMA
   synchronous=FULL` returns **no rows** (`src/pragma.c:1133-1134` vs the setter
   at `:1139-1145`), and an unrecognized value is not an error: `getSafetyLevel`
   falls through to its `dflt` (`:72-92`, `return dflt` at `:91`) with the call
   site passing `dflt=1` (`:1140`), so `synchronous=FULLL` yields NORMAL.
3. **`journal_mode=OFF` is default-reachable** — the one mode with no crash
   guarantee is blocked only under `SQLITE_Defensive` (`src/pragma.c:753-757`).

## 5. Test the contract, don't cite it

`src/test6.c` is a VFS shim that buffers writes in memory and, on `xSync`,
simulates a power cut by writing an arbitrary subset of buffered pages, omitting
others, and corrupting overlapped sectors per simulated device characteristics
and sector size (`:46-91`). The Tcl harness drives it with `crashsql -delay N
-file test.db-journal` (`test/crash.test:73-111`), asserting an `md5sum`
signature survives (`:33-40`) at a repeat count of 100 (`:30`). Across 10
`crash*.test` and 42 `wal*.test` files, every guarantee above has a crash test.

## Reconciliation summary

Confirmed: both journaling families, sidecar set named and exposed as API; a
four-rung sync ladder whose WAL semantics are documented apart from its rollback
semantics; the effective journal mode returned by the pragma, so a boot
assertion is one comparison; checkpoint aggressiveness as an explicit spectrum
with reader pinning as the real constraint; crash consistency as an executed
harness. Deviations: the silent WAL-to-rollback fallback has no log or warning
channel despite one existing for lesser hazards; `PRAGMA synchronous` neither
echoes its effective value nor rejects a typo, and does not persist across opens
while the journal mode does; `journal_mode=OFF` is default-reachable. Not
present by scope: writing the choice down with its reasons, and the file-set
clause reaching the embedder's backup, export, and reset paths — which a library
cannot own, and which is why they go unsigned.
