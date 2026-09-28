---
layer: application
type: application
subject: embedded-db
technique: corruption-class-response
stack: python
status: forged
verified_on: 2026-09-23
refresh_by: 2026-11-05
verified_against: python@3.12
---

# Corruption-class response in a Python agent gateway's session store

First read against `NousResearch/hermes-agent` at commit
`0cbc6e37ac9fce50905157805c89fae06da93845`; every anchor below was re-resolved
on 2026-09-23 against `9d799e0531c24c7f6015f45ca27e05022c3db81a` (HEAD, after
the structural split of `hermes_state.py` into `hermes_state_*.py` modules and
the fold of the root `docs/` tree into the Docusaurus site). The store is a
SQLite `state.db` holding two data classes the recovery document names
explicitly (`website/docs/developer-guide/state-db-recovery.md:14-15`):
`sessions` and `messages` are the canonical transcript; `messages_fts*` and
their sync triggers are derived search indexes. That sentence is the
classification the technique asks for, written down before any code branches
on it.

## The classifier is provenance, not message text

`SessionDB._is_structural_corruption_error` (`hermes_state.py:1256-1265`)
reads: a `sqlite3.DatabaseError` that `classify_persistence_error` puts in the
`corrupt` bucket and that is *not* matched by the positive FTS classifier
`_is_fts_write_corruption_error` is "canonical B-tree/schema/freelist damage,
never repairable from the live write path." The write path runs the checks in
the technique's order (`hermes_state.py:1043-1056`): a replaced-file check
first, then the derived detach, then "What survives both checks is structural
damage: quarantine." Two named positive classifiers plus a
default-to-canonical fallthrough, including the instruction that absent
provenance defaults to the more dangerous reading.

The FTS classifier was already result-code-first at the first pin; what
changed since is that it became one function.
`is_fts_scoped_corruption_error` (`hermes_state_errors.py:100-122`) is now the
one rule shared by the write-repair gate, the gateway transcript retry and
`classify_persistence_error` (#96038, #97794), where the first pin kept the
write-gate copy as a private static method: "A known result code outranks
prose" — `SQLITE_CORRUPT_VTAB` is FTS-scoped, bare `SQLITE_CORRUPT` /
`SQLITE_NOTADB` "carry no object scope" and fail closed, and message text
decides only when no result code exists (Python < 3.11, RPC-wrapped strings).
That is the technique's warning about engine-reworded message text, answered
in code.

The verdict travels as a type. `StateDbCorruptError`
(`hermes_state_errors.py:194-208`) subclasses `sqlite3.DatabaseError` "so every
degrade path keeps working", and `_halt_db_corrupt` copies
`sqlite_errorcode`/`sqlite_errorname` off the originating error
(`hermes_state.py:1284-1287`). The gateway branches on the type, not on a
string: `gateway/session_transcript.py:253-257` treats `StateDbReplacedError`
and `StateDbCorruptError` together and diverts the transcript.

## Derived damage: mark stale, drop triggers, retry without the sinks

`_enter_fts_fail_open` (`hermes_state_fts.py:353-405`) is the detach path in
full: the durable `state_meta` row keyed `fts_stale` (`FTS_STALE_KEY`,
`hermes_state_common.py:905`) is written *inside the same* `BEGIN IMMEDIATE`
transaction as the trigger drop (as it already was at the first pin, which
this application previously cited to a separate open-time write site) —
"Breadcrumb + trigger drop commit atomically: once triggers are absent the
index has a gap of unknown extent, so nobody may reinstall them without a full
rebuild." Then it sets `_fts_stale`, disables the FTS feature flags, and
returns `True` so the caller retries the canonical write with the derived
sinks gone. Search then serves from canonical rows through the `LIKE`
fallback (`hermes_state_search.py:1088-1091`). The degradation survives the
process through that row.

The prohibition is enforced and commented at both ends: the write path says
"detach the derived indexes atomically and retry (never rebuild here)"
(`hermes_state.py:1050-1051`), and the deferred-recovery docstring says "live
write/search paths must never start a full rebuild" (`hermes_state_schema.py:572-582`,
#97940). Rebuild authority stays with `_recover_stale_fts` at open
(`hermes_state_schema.py:556-570`), under a cross-process admission lock and a
foreign-holder guard.

**Upward lesson this tree taught, kept in the technique:** the detached steady
state is not self-healing on a long-lived process. The original design cleared
the deferral "at the next open", which is fine for a short-lived CLI and never
happens for a gateway that opens `state.db` "once for days" (#100108). The fix
is `retry_deferred_fts_recovery` (`hermes_state_schema.py:572-631`):
non-blocking admission (`timeout=0`) so a live holder is skipped, bounded
doubling backoff, no new thread — driven from an existing housekeeping tick.
Two refinements landed since the first read: a quarantined handle never runs
the retry at all ("never run FTS DDL/DML against a damaged image",
`:585-591`), and the backoff resets when the blocking holder set changes, so a
capped backoff cannot idle for an hour after the other service stopped
(#106393, `:597-604`).

## Canonical damage: `_halt_db_corrupt`

`hermes_state.py:1271-1287` sets `_db_corrupt`, records the reason, disables
the close-time checkpoint, logs the operator instruction (naming
`hermes sessions recover --source <db> --inspect-only`), and raises the typed
error from the original. Later writes fail fast on the flag
(`_raise_if_db_corrupt`, `:1362-1364`); the handle never reopens
(`hermes_state.py:916-922`: "a quarantined handle must never hand a fresh
connection to a damaged file").

Two details carry the technique's fourth clause. The explicit
`PRAGMA wal_checkpoint(PASSIVE)` in `close()` is skipped on a quarantined
handle (`hermes_state.py:1472-1478`, via `_quarantine_reason`, `:1384-1392`),
and that is not sufficient on its own: `sqlite3.Connection.close()` still runs
SQLite's internal last-connection checkpoint and unlinks the `-wal`/`-shm`
sidecars. `_disable_close_time_checkpoint` (`hermes_state.py:1289-1317`) sets
`SQLITE_DBCONFIG_NO_CKPT_ON_CLOSE` via `Connection.setconfig`, which Python
exposes **only on 3.12+**, and logs at ERROR when `setconfig` itself
fails. On 3.11 the constant and the method are
both absent, the internal checkpoint runs, and the documented compensation is
still manual: copy `state.db`, `state.db-wal` and `state.db-shm` together
before restarting anything (`state-db-recovery.md:52-57`). A durability
control that exists on one minor version of the runtime and not the previous
one is worth knowing before the incident, not during it.

The tree has since built a 3.11 answer for a *neighbouring* class, and it is
worth not confusing the two: when a handle's WAL generation was deleted or
replaced underneath it, a runtime without `setconfig` retires the exact
connection **unclosed** through interpreter shutdown
(`_settle_lost_generation_locked`, `hermes_state.py:1328-1360`;
`_prepare_connection_retirement`, `hermes_state_dbfile.py:37-60`, which
requires CPython `ctypes`). That path is gated on generation loss
(`hermes_state.py:1464-1471`); a structurally corrupt handle on 3.11 still
closes and still takes SQLite's one internal checkpoint.

## The measurement behind "stopping the writes is the protection"

From the recovery document (`state-db-recovery.md:46-51`) and the quarantine
test module's docstring (`tests/hermes_state/test_state_db_corrupt_quarantine.py:1-10`,
field class #90837): a handle that kept writing for ~50 minutes after the
first structural error checkpointed **15 pages under the wrong page numbers**
at shutdown — page 1 received a `messages_fts_trigram_data` leaf — turning a
still-readable file into one that no longer opened. The `StateDbCorruptError`
docstring keeps the 15-page figure and names the close-time checkpoint as the
write that did it. This is the number the technique carries, and it is the
argument for skipping a checkpoint that every other day of the store's life is
the correct thing to do.

## Pending work has a declared elsewhere

The technique's last clause is implemented rather than assumed: on quarantine
the gateway and the agent flush path treat the store like a replaced file —
pending transcripts go to `sessions/<id>.jsonl` and the gateway
`pending_messages/` spool instead of the retry queue, and the one-shot FTS
rebuild never runs on the damaged file (`state-db-recovery.md:59-64`, "Live
behavior when the file itself is corrupt"; the gateway side is the diversion
at `gateway/session_transcript.py:255-257`). The quarantine is per process; the
shared handle stays poisoned for every holder until a restart on a repaired or
restored file.

## Deviation

The recovery document ends with "never delete canonical rows to make a
derived-index error disappear" (`state-db-recovery.md:109-111`) as operator
prose in a runbook. It is a rule about what a human may do during repair, and
nothing in the code enforces it — `hermes sessions repair` takes a backup by
default (`hermes_cli/sessions_cmd.py:115`, opt-out `--no-backup`), which is
mitigation rather than prevention. The technique keeps the rule at standard
strength.

## Currency - 2026-09-23

The 2026-09-17 note recorded that the tree had been refactored by 34.4% of its
non-test source two days after the first read, and that a re-scan against the
merged tree was owed. It was run on 2026-09-23 against `9d799e05` (13,043
commits past the first pin): every claim above re-resolved, the anchors were
re-pinned, and nothing the application asserts was contradicted. What moved:
`hermes_state.py` split into ~28 `hermes_state_*.py` modules, the classifier
method's name corrected here (`_is_structural_corruption_error` at both pins;
the first read dropped the suffix), the recovery document moved
under `website/docs/developer-guide/`, the FTS provenance rule consolidated
into one shared function, the deferred retry gained a quarantine guard and a
holder-change backoff reset, and a 3.11 unclosed-retirement path appeared for
lost WAL generations (a neighbouring class, not this one). The first read's
anchor for the stale marker pointed at an open-time write; the detach path
writes it atomically with the trigger drop, at both pins. `refresh_by` is kept as an override, on the
original six-week window: the claims are line-anchored in a tree that moves
by hundreds of commits a day, far faster than the Python stack clock assumes.
