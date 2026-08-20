---
layer: application
type: application
subject: usage-limit-governance
technique: concurrent-admission-integrity
stack: rust
status: forged
verified_on: 2026-08-20
---

# Rust: atomic admission in LightTrack's two store backends

LightTrack enforces the same admission semantics over two backends — an
embedded SQLite store and a Postgres store — through one shared evaluator,
with each backend supplying its own critical section.

## The shared evaluator

`evaluate_admission` (crates/store/src/lib.rs:419-455) is the single
decision function both backends call: it skips non-matching scoped rules
entirely ("a scoped rule the candidate doesn't match can neither count it
nor reject it", lib.rs:435), folds the candidate's `event_contribution`
into each applicable `(window, scope)` total *before* comparing
(lib.rs:442 — prospective usage, so the boundary event cannot slip), and
stamps `shedding` per rule. `Admission::from_statuses` (lib.rs:358-380)
derives one verdict: hard stop (`rejects_ingest`) outranks shed, and the
retry hint comes from whichever rejection is in force — "a hard stop
outranks a shed, since it is the longer wait" (lib.rs:357).

## Postgres: advisory lock over serializable

`crates/store-pg/src/admission.rs:1-19` documents the choice the technique
argues for, as a lived trade-off: a plain transaction is not enough
("under READ COMMITTED two concurrent transactions both read pre-burst
usage and both insert"), and SERIALIZABLE "would instead abort each other,
turning a traffic burst into a retry storm on the ingest path (and every
retry re-reads the whole window)". Instead, `lock_project`
(admission.rs:38-45) takes `pg_advisory_xact_lock(hashtextextended($1, 0))`
as the transaction's **first** statement: per-project critical section,
deterministic 64-bit key from the project id, released by commit/rollback
with "no leak path if the connection dies mid-transaction". Different
projects never block each other; same-project bursts queue — "the cost of
a burst is latency, not lost enforcement" (admission.rs:14-19).

`usage_in_tx` (admission.rs:57-97) reads rolling usage *inside* the locked
transaction, windowed on `received_at`, "never the client `ts`" — the
server-clock rule from the accounting substrate.

## Batch packing cannot bypass a cap

`insert_events_checked` (admission.rs:164-239) runs the whole batch in one
transaction, so each item's usage read sees the batch's prior accepted
inserts: "the next item's usage read runs in the same transaction and
therefore sees them, so a caller cannot bypass a cap by packing events
into one request" (admission.rs:169-170). Each item runs in its own
SAVEPOINT because Postgres aborts the enclosing transaction on any
statement error — "without one, a single duplicate id (23505) would
poison every following item" (admission.rs:166-168). Multi-project
batches take their advisory locks in sorted, deduped project order
(admission.rs:189-199) — a total lock order kept deadlock-free even
though "a batch is single-project by construction today; this keeps that
from being a load-bearing assumption". A failed final commit fails every
item: "All-or-nothing beats a torn batch the client can't detect"
(admission.rs:235).

## SQLite: the connection lock is the section — and says where it ends

The embedded backend's incremental usage cache
(crates/store/src/sqlite/usage_cache.rs) is "updated under the *same*
connection lock as the insert... so the check-count-insert critical
section is preserved: a concurrent burst cannot read one stale total and
race past a cap" (usage_cache.rs:21-23). The module header also declares
the coherence boundary honestly: cursor-based loading (`rowid > seen`)
picks up any other process's committed appends, but "what the cache cannot
observe is another process's *admission decision*... so a configured cap
is only strictly honored with one API process per SQLite database (the
repo's deployment stance)" (usage_cache.rs:30-34) — the declared-topology
rule stated in the module operators will actually read.

## The rejection stays counted

A rejected event is never inserted (admission.rs:136-141 inserts only
when `admission.admitted`), and `crates/api/src/rejections.rs:1-12`
explains why the gap must be closed elsewhere: storing the rejected event
"would corrupt the usage/cost rollups every cap is evaluated against",
but "an observability tool going blind exactly when limits bite is a
product flaw". The in-process ledger keys by
`(project, metric, window, scope)` (rejections.rs:33-35) — scope included
so a scoped and a project-wide cap keep separate tallies — and declares
its honesty bounds in the type: "best-effort and process-local by
design... a rolling 'what did limits reject lately' view, not an audit
log — that honesty is acceptable for v1, and the `/v1/limits/status`
docs say so" (rejections.rs:10-12).
