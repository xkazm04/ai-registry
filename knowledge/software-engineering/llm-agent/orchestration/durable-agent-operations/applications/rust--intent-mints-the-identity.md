---
layer: application
type: application
subject: durable-agent-operations
technique: intent-mints-the-identity
stack: rust
verified_on: 2026-10-22
verified_against: rust@1.96.1
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Twenty-two runs that reached the provider are booked as free

The desktop agent app (personas, Tauri over SQLite; toolchain pinned to 1.96.1 by
its `rust-toolchain.toml`, the witness for `verified_against`) persists every
agent run as a row in `persona_executions` and sums that column into a
per-persona monthly budget. The row is the durable record of the run, and its
spend column is written once, when the run settles. This is the second
application of the technique and the first against a rust tree that already
recovers interrupted runs well: restart classification, a resume pointer and an
escalation counter all exist. What it lacks is the spend half of the intent.

## The structural fact

The spend column has no value for "a call started and its cost is unknown". The
schema gives every new row a default of zero, so a run that is interrupted,
cancelled or failed before settlement keeps that zero, and the budget query sums
it as money that was not spent:

- `src-tauri/db/src/migrations/schema.rs:123` "cost_usd          REAL DEFAULT 0,"
- `src-tauri/db/src/repos/execution/executions.rs:1223` "cost_usd = COALESCE(?9, cost_usd),"
- `src-tauri/db/src/repos/execution/executions.rs:2369` "'completed', 'failed', 'incomplete', 'cancelled'"

The tree does hold one durable sign that the provider was reached: the CLI
session id, persisted by a detached column-scoped write the moment the stream
reports it.

- `src-tauri/src/engine/runner/mod.rs:2995` "exec_repo::set_claude_session_id("

That write comes after the process has started, so it is evidence of admission
rather than a reservation made before it. It is the nearest thing this tree has
to the intent's "pending" mark, and it is written by a path that can lose a
race with the terminal status. The technique's recommendation, reserve at the
intent and express unknown units as unknown, is the part that is absent: nothing
is committed before the call that says what its spend will occupy, so the
settlement is the only writer of that column.

## The paired comparison

Both arms are read-only queries over a copy-free read of the app's own database
(opened `mode=ro`, 169 rows, 2026-05-28 to 2026-10-13).

**Target:** non-completed rows that reached the provider (session id present)
and are booked at exactly zero. **Floor:** a completed row must never be
flagged, and a row that never reached the provider must stay a true zero.

| Population | Rows | Session id | Booked cost |
| --- | --- | --- | --- |
| completed | 137 | 137 | 137 above zero, 0 at zero |
| failed, cancelled, incomplete with a session | 25 | 25 | 3 above zero, 22 at zero |
| failed or cancelled, no session | 7 | 0 | 7 at zero |

- **Arm A, today:** all 29 non-completed zeros are the same value. The 22 that
  reached the provider (12 failed averaging 541 s, 8 cancelled averaging 281 s,
  2 incomplete) are indistinguishable from the 7 that never started.
- **Arm B, the predicate:** `status <> 'completed' AND session id present AND
  cost = 0` means spend unknown. It flags 22 rows, 0 of the 137 completed rows
  (floor held) and 0 of the 7 sessionless rows (the true zeros stay zero). The
  three rows that did recover a cost are not flagged.

The predicate separates the populations on recorded data without a single
assumption about price. Five of the 22 are the restart-recovery rows: marked
`resume_pending` after the interruption, then failed by a startup panic, with a
session id and no tokens. Re-admission updates the same row in place, so a
resumed run that completes books only its own turn. The interrupted turn's spend
has no slot to land in, which is the identity half of the technique failing in
the ledger.

## What would have falsified it

Two outcomes would have killed the finding, and neither occurred. If completed
rows carried a session id at zero cost, a session id would not imply a billed
call; there are none, and 137 of 137 are above zero. If every non-completed row
with a session had been priced, the zeros would be recovered cost rather than
absent cost; 3 of 25 were priced, which shows the settlement path can recover a
figure and mostly does not.

The seam was chosen to falsify. The run looked for a place where the tree's own
unknown-money discipline (the list mapper keeps a missing cost as absent rather
than inventing zero) stopped at the storage layer, and found it stops there: the
column cannot hold the distinction the mapper was written to carry.

## What this realization cannot do

It does not price the gap. A duration-scaled guess from the completed rows puts
the unrecorded spend roughly an order of magnitude above the $3.58 booked across
non-completed rows, but that is a priced counterfactual with no arm that ran it,
so the dollar figure is `unmeasurable` here and is deliberately not stated as a
result. Cancelled runs may have been stopped before any billable token, so some
of the 22 may truly be zero; the predicate marks them unknown, which is what the
technique asks for, and does not claim they were billed.

Nothing shipped. Changing the budget gate to treat unknown spend (reserve, block
or warn) is a policy the owner decides, and a surface for it is a direction, not
coverage. The tree carried unrelated uncommitted work, and the measurement needed
no product change.

Return condition: when a project adds an unknown-spend state (a nullable cost or
a reserved attempt row) the same two queries re-run as the after arm, with the
floor that the monthly total over completed rows does not move.
