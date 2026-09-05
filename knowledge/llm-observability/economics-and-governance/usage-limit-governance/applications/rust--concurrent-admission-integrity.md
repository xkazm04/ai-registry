---
layer: application
type: application
subject: usage-limit-governance
technique: concurrent-admission-integrity
stack: rust
status: forged
verified_on: 2026-09-05
verified_against: rust@1.96
---

# Rust: atomic admission in LightTrack's two store backends

LightTrack (read at commit `828dfb4`, 2026-09-05; toolchain pinned to
1.96.1 by `rust-toolchain.toml`, which its CI reads rather than naming a
version) enforces the same admission semantics over two backends — an
embedded SQLite store and a Postgres store — through one shared evaluator,
with each backend supplying its own critical section.

## The shared evaluator

`evaluate_admission` (crates/store/src/lib.rs:554-596) is the single
decision function both backends call: it skips expired rules and
non-matching scoped rules entirely ("a scoped rule the candidate doesn't
match can neither count it nor reject it", lib.rs:576), folds the
candidate's `event_contribution` into each applicable `(window, scope)`
total *before* comparing (lib.rs:580-587 — prospective usage, so the
boundary event cannot slip), and stamps `shedding` per rule (lib.rs:593).
`Admission::from_statuses` (lib.rs:489-500) derives one verdict: hard stop
(`rejects_ingest`) outranks shed, and the retry hint comes from whichever
rejection is in force — "a hard stop outranks a shed, since it is the
longer wait" (lib.rs:492).

## Postgres: advisory lock over serializable

`crates/store-pg/src/admission.rs:1-19` documents the choice the technique
argues for, as a lived trade-off: a plain transaction is not enough
("under READ COMMITTED two concurrent transactions both read pre-burst
usage and both insert"), and SERIALIZABLE "would instead abort each other,
turning a traffic burst into a retry storm on the ingest path (and every
retry re-reads the whole window)". Instead, `lock_project`
(admission.rs:36-45) takes `pg_advisory_xact_lock(hashtextextended($1, 0))`
as the transaction's **first** statement: per-project critical section,
deterministic 64-bit key from the project id, released by commit/rollback
with "no leak path if the connection dies mid-transaction". Different
projects never block each other on the key; same-project bursts queue —
"the cost of a burst is latency, not lost enforcement" (admission.rs:14-17).
The module does not mention the shared lock-memory pool the technique now
names; with one advisory lock per in-flight admission the pool is far from
exhausted at this deployment's scale, but the assumption is unwritten.

`usage_in_tx` (admission.rs:57-62 onward) reads rolling usage *inside* the
locked transaction — "so it sees this transaction's own prior inserts... and
nobody else's uncommitted ones" — windowed on `received_at`, "never the
client `ts`": the server-clock rule from the accounting substrate.

## Batch packing cannot bypass a cap

`insert_events_checked` (admission.rs:203-278) runs the whole batch in one
transaction, so each item's usage read sees the batch's prior accepted
inserts: "the next item's usage read runs in the same transaction and
therefore sees them, so a caller cannot bypass a cap by packing events
into one request" (admission.rs:208-209). Each item runs in its own
SAVEPOINT because Postgres aborts the enclosing transaction on any
statement error — "without one, a single duplicate id (23505) would
poison every following item" (admission.rs:205-207). Multi-project
batches take their advisory locks in sorted, deduped project order
(admission.rs:227-237) — a total lock order kept deadlock-free even
though "a batch is single-project by construction today; this keeps that
from being a load-bearing assumption". A failed final commit fails every
item: "All-or-nothing beats a torn batch the client can't detect"
(admission.rs:273-276).

## SQLite: the connection lock is the section — and says where it ends

The embedded backend's `insert_event_checked`
(crates/store/src/sqlite/mod.rs:351-357) locks the usage cache *before*
the connection, "consistent order in both admission methods", and the batch
path holds both locks across every item (mod.rs:360). The incremental
usage cache's header (crates/store/src/sqlite/usage_cache.rs) states the
consequence: it is "updated under the *same* connection lock as the
insert... so the check-count-insert critical section is preserved: a
concurrent burst cannot read one stale total and race past a cap"
(usage_cache.rs:21-23). The same header declares the coherence boundary
honestly: cursor-based loading (`rowid > seen`) picks up any other
process's committed appends, but "what the cache cannot observe is another
process's *admission decision*... so a configured cap is only strictly
honored with one API process per SQLite database (the repo's deployment
stance)" (usage_cache.rs:30-34) — the declared-topology rule stated in the
module operators will actually read. It also writes down the clock
assumption: "Reads assume a non-decreasing admission clock (wall-clock
`Utc::now()` at ingest, which only moves forward)... A clock that ran
backwards could under-count; ingest never does that" (usage_cache.rs:25-28)
— "never" here is the unconditioned form the technique now qualifies
(stepped time corrections and snapshot restores do run wall clocks
backwards); the module documents the assumption but does not clamp to the
last admission time.

## The rejection stays counted

A rejected event is never inserted (admission.rs:149-152 inserts only when
`admission.admitted`), and `crates/api/src/rejections.rs:1-12` explains why
the gap must be closed elsewhere: storing the rejected event "would corrupt
the usage/cost rollups every cap is evaluated against", but "an
observability tool going blind exactly when limits bite is a product
flaw". The in-process ledger keys by `(project, metric, window, scope)`
(`RejectionKey`, rejections.rs:40-41) — scope included so a scoped and a
project-wide cap keep separate tallies — and declares its honesty bounds
in the type: "best-effort and process-local by design... a rolling 'what
did limits reject lately' view, not an audit log — that honesty is
acceptable for v1, and the `/v1/limits/status` docs say so"
(rejections.rs:10-12). Entries are pruned after a 24-hour TTL
(rejections.rs:24-25).
