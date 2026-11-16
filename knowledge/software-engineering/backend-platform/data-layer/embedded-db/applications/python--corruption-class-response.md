---
layer: application
type: application
subject: embedded-db
technique: corruption-class-response
stack: python
status: forged
verified_on: 2026-11-16
refresh_by: 2026-12-29
verified_against: python@3.14
---

# Corruption-class response in a Python agent gateway's session store

First read against `NousResearch/hermes-agent` at commit
`0cbc6e37ac9fce50905157805c89fae06da93845`; re-resolved on 2026-09-23 against
`9d799e0531c24c7f6015f45ca27e05022c3db81a`, and every anchor below was
re-resolved again on 2026-11-16 against
`4162ecf11f611400fa6e5c42d2f360188ce50b39` (HEAD, 2026-11-15; `.python-version`
reads `3.14`, `pyproject.toml:15` admits `>=3.11,<3.15`). The store is a
SQLite `state.db` holding two data classes the recovery document names
explicitly (`website/docs/developer-guide/state-db-recovery.md:14-15`):
`sessions` and `messages` are the canonical transcript; `messages_fts*` and
their sync triggers are derived search indexes. That sentence is the
classification the technique asks for, written down before any code branches
on it.

## The classifier is provenance, not message text

`SessionDB._is_structural_corruption_error` (`hermes_state.py:1344-1353`)
reads: a `sqlite3.DatabaseError` that is not already a `StateDbCorruptError`,
that `classify_persistence_error` puts in the `corrupt` bucket and that is
*not* matched by the positive FTS classifier `_is_fts_write_corruption_error`
is "canonical B-tree/schema/freelist damage, never repairable from the live
write path." The write path runs the checks in the technique's order
(`hermes_state.py:1123-1139`): a replaced-file check first, then the derived
detach, then "What survives both checks is structural damage: quarantine."
Two named positive classifiers plus a default-to-canonical fallthrough,
including the instruction that absent provenance defaults to the more
dangerous reading.

The FTS classifier is one function, `is_fts_scoped_corruption_error`
(`hermes_state_errors.py:122-144`), shared by the write-repair gate (whose
`_is_fts_write_corruption_error` at `hermes_state_fts.py:324-330` only
delegates to it), the gateway transcript retry and `classify_persistence_error`
(#96038, #97794): "A known result code outranks prose" —
`SQLITE_CORRUPT_VTAB` is FTS-scoped, bare `SQLITE_CORRUPT` / `SQLITE_NOTADB`
"carry no object scope" and fail closed, and message text decides only when no
result code exists (Python < 3.11, RPC-wrapped strings). That is the
technique's warning about engine-reworded message text, answered in code. The
engine's own result-code page says a virtual table "might" return
`SQLITE_CORRUPT_VTAB` (https://www.sqlite.org/rescode.html, opened
2026-11-16), so the code is a positive signal, never a complete one; a
derived fault that surfaces as bare `SQLITE_CORRUPT` lands on the canonical
side, which is the direction the technique wants the error to fall.

The verdict travels as a type. `StateDbCorruptError`
(`hermes_state_errors.py:241-256`) subclasses `sqlite3.DatabaseError` "so every
degrade path keeps working", and `_halt_db_corrupt` copies
`sqlite_errorcode`/`sqlite_errorname` off the originating error
(`hermes_state.py:1375-1377`). The gateway branches on the type, not on a
string: `gateway/session_transcript.py:308-312` treats `StateDbReplacedError`
and `StateDbCorruptError` together and diverts the transcript.

## Derived damage: mark stale, drop triggers, retry without the sinks

`_enter_fts_fail_open` (`hermes_state_fts.py:332-391`) is the detach path in
full: the durable `state_meta` row keyed `fts_stale` (`FTS_STALE_KEY`,
`hermes_state_common.py:1164`) is written *inside the same* `BEGIN IMMEDIATE`
transaction as the trigger drop (`:358-368`) — "Breadcrumb + trigger drop
commit atomically: once triggers are absent the index has a gap of unknown
extent, so nobody may reinstall them without a full rebuild." Then it sets
`_fts_stale`, disables the FTS feature flags, and returns `True` so the caller
retries the canonical write with the derived sinks gone. Two refinements since
the last read: a busy write lock is now waited out on the caller's write
budget rather than the connection's 1 s busy timeout (the usual holder is a
sibling detaching the same index), and the quarantine check is re-run on every
attempt, because "a sibling may quarantine the file while we wait for the
lock" (`:350-352`). Search then serves from canonical rows through the `LIKE`
fallback (`hermes_state_search.py:1204-1207`). The degradation survives the
process through that row.

The prohibition is enforced and commented at both ends: the write path says
"detach the derived indexes atomically and retry (never rebuild here)"
(`hermes_state.py:1132-1133`), and the deferred-recovery docstring says "live
write/search paths must never start a full rebuild" (`hermes_state_schema.py:559-571`,
#97940). Rebuild authority stays with `_recover_stale_fts` at open
(`hermes_state_schema.py:543-557`), under a cross-process admission lock and a
foreign-holder guard.

**Upward lesson this tree taught, kept in the technique:** the detached steady
state is not self-healing on a long-lived process. The original design cleared
the deferral "at the next open", which is fine for a short-lived CLI and never
happens for a gateway that opens `state.db` "once for days" (#100108). The fix
is `retry_deferred_fts_recovery` (`hermes_state_schema.py:559-615`):
non-blocking admission (`timeout=0`) so a live holder is skipped, bounded
doubling backoff, no new thread — driven from an existing housekeeping tick
(`gateway/run.py:4355`). A quarantined handle never runs the retry ("never run
FTS DDL/DML against a damaged image", `:573-579`), and the backoff resets when
the blocking holder set changes, so a capped backoff cannot idle for an hour
after the other service stopped (#106393, `:584-591`).

## Canonical damage: `_halt_db_corrupt`

`hermes_state.py:1359-1378` sets `_db_corrupt`, records the reason, publishes
the file-level verdict (below), disables the close-time checkpoint, logs the
operator instruction (naming `hermes sessions recover --source <db>
--inspect-only`), and raises the typed error from the original. Later writes
fail fast on the flag (`_raise_if_db_corrupt`, `:1453-1462`); the handle does
not reopen onto the same file (`hermes_state.py:999-1006`: "a quarantined
handle must never hand a fresh connection to a damaged file") — the guard now
admits one exception, a file that was *replaced* underneath the handle
(`:1001`), which is the restore the operator was told to perform.

Two details carry the technique's fourth clause. The explicit
`PRAGMA wal_checkpoint(PASSIVE)` in `close()` is skipped on a quarantined
handle (`hermes_state.py:1570-1577`, via `_quarantine_reason`, `:1482-1495`),
and that is not sufficient on its own: `sqlite3.Connection.close()` still runs
SQLite's internal last-connection checkpoint and unlinks the `-wal`/`-shm`
sidecars. `_disable_close_time_checkpoint` (`hermes_state.py:1380-1410`) sets
`SQLITE_DBCONFIG_NO_CKPT_ON_CLOSE` via `Connection.setconfig`, which Python
exposes **only on 3.12+** ("Added in version 3.12",
https://docs.python.org/3/library/sqlite3.html, opened 2026-11-16; the
engine's default is checkpoint-on-close enabled,
https://www.sqlite.org/c3ref/c_dbconfig_defensive.html), and logs at ERROR
when `setconfig` itself fails. On 3.11 the constant and the method are both
absent, the internal checkpoint runs, and the documented compensation is still
manual: copy `state.db`, `state.db-wal` and `state.db-shm` together before
restarting anything (`state-db-recovery.md:51-57`). The error docstring now
states why that is bounded: post-quarantine the internal checkpoint "can only
carry pre-corruption committed frames, since no further writes are accepted"
(`hermes_state_errors.py:250-255`). A durability control that exists on one
minor version of the runtime and not the previous one is worth knowing before
the incident, not during it.

The tree has a 3.11 answer for a *neighbouring* class, and it is worth not
confusing the two: when a handle's WAL generation was deleted or replaced
underneath it, a runtime without `setconfig` retires the exact connection
**unclosed** through interpreter shutdown (`_settle_lost_generation_locked`,
`hermes_state.py:1419-1451`; `_prepare_connection_retirement`,
`hermes_state_dbfile.py:38-61`, which requires CPython `ctypes`; bound at open,
`hermes_state.py:668-671`). That path is gated on generation loss
(`hermes_state.py:1562-1569`); a structurally corrupt handle on 3.11 still
closes and still takes SQLite's one internal checkpoint.

## The verdict belongs to the file, not to the handle (new since 2026-09-23)

The first two reads described the quarantine as a property of one shared
handle. The tree now keys it on the **file**. `hermes_state_health.py` is "one
process-wide latch per state.db path" (`:1-20`): `_halt_db_corrupt` publishes
into it first (`hermes_state.py:1363-1365`, `mark_storage_corrupt`,
`hermes_state_health.py:60-72`), every other handle in the process checks it
before touching SQLite (`_raise_if_db_corrupt(storage=True)`,
`hermes_state.py:1456-1461`, re-checked inside the detach loop), and **readers
publish too**: a pooled reader that meets structural damage latches the path
(`hermes_state.py:1183`, `:1189`), because "a reader is often the only
observer". Readiness, `/api/status` and the session-list endpoints read the
same latch (`gateway/readiness.py:33`, `hermes_cli/web_routers/sessions.py:240`),
so the health surfaces and the write path cannot disagree.

Two properties of the latch are the technique's amendment in one module. It is
keyed on the path, so a second handle opened to the same file in the same
process is refused without having seen an error of its own. And it lives
outside the file: "No marker is written to disk: the file it would describe is
the one that is damaged" (`hermes_state_health.py:17-19`). It never clears on
its own and resets with the process (`reset_storage_state` is for tests and a
verified in-process recovery, `:95-99`). The derived-damage marker sits
*inside* the store because the canonical structure that holds it is sound; the
canonical verdict cannot, and the tree draws that line explicitly.

## The measurement behind "stopping the writes is the protection"

From the recovery document (`state-db-recovery.md:47-51`) and the quarantine
test module's docstring (`tests/hermes_state/test_state_db_corrupt_quarantine.py:1-10`,
field class #90837): a handle that kept writing for ~50 minutes after the
first structural error checkpointed **15 pages under the wrong page numbers**
at shutdown — page 1 received a `messages_fts_trigram_data` leaf — turning a
still-readable file into one that no longer opened. One field incident (n=1),
stated as such in both places. The `StateDbCorruptError` docstring keeps the
15-page figure and names the close-time checkpoint as the write that did it.
This is the number the technique carries, and it is the argument for skipping
a checkpoint that every other day of the store's life is the correct thing to
do.

## Pending work has a declared elsewhere

The technique's last clause is implemented rather than assumed: on quarantine
the gateway and the agent flush path treat the store like a replaced file —
pending transcripts go to `sessions/<id>.jsonl` and the gateway
`pending_messages/` spool instead of the retry queue, and the one-shot FTS
rebuild never runs on the damaged file (`state-db-recovery.md:59-62`, under
"Live behavior when the file itself is corrupt", `:35`; the gateway side is
the diversion at `gateway/session_transcript.py:308-312`, the agent side
`agent/session_persistence.py:466`). The quarantine is per process
(`state-db-recovery.md:62-64`) and stays until a restart on a repaired or
restored file.

## Deviation

The recovery document ends with "never delete canonical rows to make a
derived-index error disappear" (`state-db-recovery.md:110-111`) as operator
prose in a runbook. It is a rule about what a human may do during repair, and
nothing in the code enforces it — `hermes sessions repair` takes a backup by
default (`hermes_cli/sessions_cmd.py:155`, opt-out `--no-backup` declared at
`hermes_cli/console_engine.py:716`), which is mitigation rather than
prevention. The technique keeps the rule at standard strength.

## Currency - 2026-11-16

Re-resolved against `4162ecf1` (2026-11-15) from a shallow clone, so the
commit distance from `9d799e05` was not counted. Every quotation above was
found in the tree; every claim held; the anchors were re-pinned. What moved:

- The quarantine became a **file-keyed, process-wide latch held outside the
  file** (`hermes_state_health.py`), which readers publish into and the health
  surfaces read. The technique's "per process, poisons the shared handle" was
  amended from this tree plus an independent blind-lane answer (subject note,
  2026-11-16).
- The reopen refusal gained an exception for a replaced file
  (`hermes_state.py:1001`).
- The detach waits out a busy lock on the write budget and re-checks the
  quarantine every attempt (`hermes_state_fts.py:340-352`).
- `_STATE_DB_CORRUPT_MSG` and the error docstring now say the 3.11 internal
  checkpoint can carry only pre-corruption frames.
- `.python-version` moved from 3.12 to 3.14; the 3.11 branches are still live
  because `requires-python` admits 3.11.

Our own anchors corrected: `StateDbCorruptError`, `FTS_STALE_KEY`, the
transcript diversion and the `--no-backup` reference all pointed at lines that
had moved (the flag is declared in `console_engine.py`; `sessions_cmd.py` only
reads it). `refresh_by` is kept as an override, on the same 43-day span as the
2026-09-23 pass: the claims are line-anchored in a tree that moves by hundreds
of commits a day, far faster than the Python stack clock assumes.

## Currency - 2026-09-23

The 2026-09-17 note recorded that the tree had been refactored by 34.4% of its
non-test source two days after the first read, and that a re-scan against the
merged tree was owed. It was run on 2026-09-23 against `9d799e05` (13,043
commits past the first pin): every claim re-resolved, the anchors were
re-pinned, and nothing the application asserts was contradicted. What moved:
`hermes_state.py` split into ~28 `hermes_state_*.py` modules, the classifier
method's name corrected (`_is_structural_corruption_error` at both pins; the
first read dropped the suffix), the recovery document moved under
`website/docs/developer-guide/`, the FTS provenance rule consolidated into one
shared function, the deferred retry gained a quarantine guard and a
holder-change backoff reset, and a 3.11 unclosed-retirement path appeared for
lost WAL generations (a neighbouring class, not this one). The first read's
anchor for the stale marker pointed at an open-time write; the detach path
writes it atomically with the trigger drop, at both pins.
