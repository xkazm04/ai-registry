---
layer: application
type: application
subject: embedded-db
technique: corruption-class-response
stack: python
status: forged
verified_on: 2026-09-02
verified_against: python@3.12
---

# Corruption-class response in a Python agent gateway's session store

Read against `NousResearch/hermes-agent` at commit
`0cbc6e37ac9fce50905157805c89fae06da93845`. The store is a SQLite `state.db`
holding two data classes the recovery document names explicitly
(`docs/state-db-recovery.md`): `sessions` and `messages` are the canonical
transcript; `messages_fts*` and their sync triggers are derived search
indexes. That sentence is the classification the technique asks for, written
down before any code branches on it.

## The classifier is provenance, not message text

`SessionDB._is_structural_corruption` (`hermes_state.py:6600-6611`) reads:
everything in the `corrupt` bucket of `classify_persistence_error` that is
*not* matched by the positive FTS classifier `_is_fts_write_corruption_error`
and *not* a replaced-file case is "damage to a canonical B-tree, the schema,
or the freelist — never repairable from the live write path." Two named
positive classifiers plus a default-to-canonical fallthrough is exactly the
technique's ordering, including its instruction that absent provenance
defaults to the more dangerous reading.

The verdict travels as a type. `StateDbCorruptError` (`hermes_state.py:4412`)
subclasses `sqlite3.DatabaseError` — deliberately, so every existing
`except sqlite3.Error` degrade path keeps working — and copies
`sqlite_errorcode`/`sqlite_errorname` off the originating error
(`hermes_state.py:6634-6638`). The gateway branches on the type, not on a
string: `gateway/session.py:3993-3997` treats `StateDbReplacedError` and
`StateDbCorruptError` together as "the file underneath is gone."

## Derived damage: mark stale, drop triggers, retry without the sinks

`hermes_state.py:6920-6943` is the detach path in full: drop every FTS sync
trigger inside the open transaction, commit, set `_fts_stale`, disable the
FTS feature flags, and return `True` so the caller retries the canonical
write with the derived sinks gone. Search then serves from canonical rows
through the `LIKE` fallback (`hermes_state_search.py:1470`). The durable half
is a `state_meta` row keyed `fts_stale` (`hermes_state_common.py:811`,
written at `hermes_state_schema.py:1603-1609`), so the degradation survives
the process.

The prohibition is enforced and commented at the deferral site:
"Live write/search paths must never start a full rebuild (#97940)"
(`hermes_state_schema.py:537-539`). Rebuild authority stays with
`_recover_stale_fts` at open, under a cross-process admission lock and a
foreign-holder guard.

**Upward lesson this tree taught, kept in the technique:** the detached steady
state is not self-healing on a long-lived process. The original design cleared
the deferral "at the next open", which is fine for a short-lived CLI and never
happens for a gateway that stays up for days (#100108). The fix is
`retry_deferred_fts_recovery` (`hermes_state_schema.py:534-580`): non-blocking
admission (`timeout=0`) so a live holder is skipped, bounded doubling backoff,
no new thread — driven from an existing housekeeping tick.

## Canonical damage: `_halt_db_corrupt`

`hermes_state.py:6619-6640` sets `_db_corrupt`, records the reason, disables
the close-time checkpoint, logs the operator instruction, and raises the typed
error from the original. Later writes fail fast on the flag; the handle never
reopens (`hermes_state.py:5427`).

Two details carry the technique's fourth clause. The explicit
`PRAGMA wal_checkpoint(PASSIVE)` in `close()` is skipped on a quarantined
handle (`hermes_state.py:7057-7069`), and that is not sufficient on its own:
`sqlite3.Connection.close()` still runs SQLite's internal last-connection
checkpoint and unlinks the `-wal`/`-shm` sidecars. `_disable_close_time_checkpoint`
(`hermes_state.py:6640-6670`) sets `SQLITE_DBCONFIG_NO_CKPT_ON_CLOSE` via
`Connection.setconfig`, which Python exposes **only on 3.12+**. On 3.11 the
constant and the method are both absent, the internal checkpoint runs, and
the documented compensation is manual: copy `state.db`, `state.db-wal` and
`state.db-shm` together before restarting anything
(`docs/state-db-recovery.md`). A durability control that exists on one minor
version of the runtime and not the previous one is worth knowing before the
incident, not during it.

## The measurement behind "stopping the writes is the protection"

From the `StateDbCorruptError` docstring (`hermes_state.py:4426-4432`, field
incidents #90837 and #90950): a handle that kept writing for ~50 minutes after
the first structural error checkpointed **15 pages under the wrong page
numbers** at shutdown — page 1 received a `messages_fts_trigram_data` leaf —
turning a still-readable file into `file is not a database`. The close-time
checkpoint is named as the write that did it. This is the number the technique
carries, and it is the argument for skipping a checkpoint that every other day
of the store's life is the correct thing to do.

## Pending work has a declared elsewhere

The technique's last clause is implemented rather than assumed: on quarantine
the gateway and the agent flush path treat the store like a replaced file —
pending transcripts go to `sessions/<id>.jsonl` and the gateway
`pending_messages/` spool instead of the retry queue, and the one-shot FTS
rebuild never runs on the damaged file (`docs/state-db-recovery.md`, "Live
behavior when the file itself is corrupt"). The quarantine is per process; the
shared handle stays poisoned for every holder until a restart on a repaired or
restored file.

## Deviation

The recovery document ends with "never delete canonical rows to make a
derived-index error disappear" as operator prose in a runbook. It is a rule
about what a human may do during repair, and nothing in the code enforces it —
`hermes sessions repair` takes a backup by default, which is mitigation rather
than prevention. The technique keeps the rule at standard strength.
