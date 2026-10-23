---
layer: application
type: application
subject: proactive-nudges
technique: notice-delivery-decoupling
stack: rust
verified_on: 2026-10-22
applied: simulation
ab_verdict: unmeasurable
---

# Notice/delivery decoupling — Athena's proactive queue (Personas)

The technique's queue as implemented in
`src-tauri/src/companion/proactive/mod.rs`, read at the checkout's `master`
tip on 2026-10-22. The decoupling itself is faithfully built; the one part
of the technique the tree does not realize is the part that makes the
queue answerable to its operator.

## Where each mechanism lives

| Mechanism | Implementation |
|---|---|
| Durable notice | a `queued` row in `companion_proactive_message`, inserted by `enqueue_if_new`; survives restart |
| Sweep before dedupe | `enqueue_if_new` calls `sweep_lifecycle(&conn)` ahead of the dedupe query (`mod.rs:282`), so an aged row stops claiming its identity in the same pass |
| Dedupe on identity | `(trigger_kind, trigger_ref)` against `status IN ('queued', 'delivered')` (`mod.rs:291`) |
| Gate at delivery, not at notice | `release_pending` holds every row while quiet (`mod.rs:398`) and spends budget per row afterward |
| Oldest-eligible first | `ORDER BY COALESCE(scheduled_for, created_at) ASC` (`mod.rs:412`) |
| Expiry by kind | trigger rows `-1 day`, scheduled check-ins `-7 days` (`mod.rs:210`): the generous expiry for notices with no re-fire path |
| Idempotent delivery | `claim_delivered` flips `queued -> delivered` only `WHERE id = ?2 AND status = 'queued'` (`mod.rs:579`), so a concurrent pass cannot double-announce |
| Per-kind cap skips, global cap stops | per-kind refusal `continue`s (`mod.rs:453`) so one capped kind cannot starve the rest |

## What the tree shows that the technique only asserts

**Deferral is unrecorded.** The technique says a gated notice returns to the
queue "with the reason recorded" and that reasons are "enumerable and
queryable". Here the table has no reason column, and each deferral path
(quiet hold, per-kind cap, global ceiling) writes only a `tracing` line.
After a pass, a notice that lost to the per-kind cap and a notice no pass has
looked at are the same row: `status = 'queued'`, nothing else. "Why didn't it
tell me?" is answerable only from a log that the operator view does not read.
Nobody designed this gap; it falls out of expressing the gate as a loop that
`continue`s instead of as a state transition.

**Expiry leaves a status, not a trace.** `sweep_lifecycle` runs bare `UPDATE`s
and discards the affected-row counts, and three different causes (stale
queued, overdue scheduled, delivered-and-ignored) all end in the one status
`expired`. The row survives retention, so the notice is not lost, but the
count and the reason the technique asks for cannot be read back.

## A/B (simulation, three cases from the tree's own tests)

Seam chosen to falsify: the technique's claim that every deferral is
explainable. Had the tree recorded reasons, the claim would have held; it
did not. A: shipped tree. B: the same pass with a reason stamped on each
deferred row.

1. `per_kind_cap_does_not_starve_other_kinds`: under A the capped kind's
   surviving rows are indistinguishable from untried rows; under B they
   read `budget-kind`.
2. `queued_rows_that_miss_a_slot_survive_for_the_next_pass`: A leaves a
   row that survived because of the global ceiling looking like a fresh
   one; B reads `budget-global`.
3. `quiet_hours_still_queue_a_candidate_but_withhold_delivery`: the
   candidate is queued and withheld; A cannot say it was withheld by quiet,
   B reads `quiet`.

The prediction that would falsify B: a stamp written on every refused pass
turns each tick into a write per queued row. The pass that holds during
quiet hours returns before reading the queue, so B must stamp in bulk or only
on state change, and the cost of that is the unmeasured part.

Verdict: `unmeasurable`. The effect is on an operator view that does not
exist yet, so no gate or emitted metric can see it.

## What this realization cannot do

It does not show that late delivery is honest: no gate-time revalidation
exists, and the design rests on the short trigger expiry plus an idempotent
evaluator, which is the technique's equivalent form and only valid for
evaluator-driven kinds. Priority classes are absent too: ordering is by age
alone, so "oldest-eligible first by priority class" is realized as
oldest-first.

Return condition: build an operator queue view over `companion_proactive_message`
that needs to show why a row is waiting; add the reason column then, with the
bulk-stamp-on-change rule, and re-run cases 1-3 as a code arm.
