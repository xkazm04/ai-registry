---
layer: application
type: application
subject: proactive-nudges
technique: attention-budgets
stack: rust
verified_on: 2026-08-18
---

# Attention budgets — Athena's daily nudge budget (Personas)

The technique's global-over-per-kind cap structure with atomic claims, as
implemented in `src-tauri/src/companion/proactive/budget.rs` and spent by
the release pass in `src-tauri/src/companion/proactive/mod.rs`.

## Where each mechanism lives

| Mechanism | Implementation |
|---|---|
| Global daily cap | `GLOBAL_DAILY_CAP = 12` (`budget.rs:23`), counted in `companion_proactive_budget(date, count)` |
| Per-kind caps | `kind_cap()` (`budget.rs:31-48`): incidents 6, message-attention 8, execution reviews 4, goal kinds share 2, fallback 3 — counted in `companion_attention_budget(date, trigger_kind, count)` |
| Atomic claim of both | `DailyBudget::try_consume` (`budget.rs:193-230`): one transaction, two conditional `UPDATE ... WHERE count < cap` statements; a per-kind refusal **rolls back** the already-applied global increment, so no phantom spend and no concurrent burst past either cap |
| Claim at delivery, not notice | `evaluate_with_extra_candidates` doc: "The daily budget is **not** consulted here. Noticing is free; only `release_pending` spends attention" (`mod.rs:119-122`) |
| Capped kind skips, never halts | `release_pending` (`mod.rs:427-447`): per-kind refusal `continue`s to the next row; only the global ceiling `break`s. The doc comment records the prior bug — the old loop `break`-ed on any refusal, letting one capped kind starve every kind behind it — and `per_kind_cap_does_not_starve_other_kinds` pins the fix |
| Consented lane | `kind_cap("athena_scheduled") = u32::MAX` (`budget.rs:34-36`): user-requested check-ins are never throttled by their own kind, but still count toward the global ceiling |
| Day boundary | UTC date string as the counter key (`today()`, `budget.rs:233-249`); rollover needs no scheduled job — the next `today()` simply reads fresh rows |
| Efficacy modulation of caps | `effective_kind_cap` (`budget.rs:96-107`): 30-day engaged/dismissed rates move the base cap ±1, only past a 5-sample floor, clamped to `[1, base+2]` — slow, coarse, floored, exactly the technique's adaptation shape |
| Operator visibility | `modulations_summary` (`budget.rs:122-164`) surfaces every kind whose effective cap differs from base, with the engaged/dismissed counts that justify it — counts carrying their predicate |

## Judgment calls worth copying

- **The rollback is the whole point of the transaction.** Global and
  per-kind counters live in separate tables; incrementing global first
  and rolling it back when the kind cap refuses is what makes "must clear
  BOTH" one act rather than two reads. The module doc dates the lesson to
  a real bug hunt ("concurrent passes can never burst past either cap").
- **Conditional UPDATE as the claim primitive.** `UPDATE ... SET count =
  count + 1 WHERE count < cap` returning a row count *is* the atomic
  check-and-increment — no SELECT-then-decide window, and the same
  pattern claims the `queued → delivered` transition (`claim_delivered`,
  `mod.rs:568-578`, `WHERE ... AND status = 'queued'`).
- **Insert-or-ignore before the conditional update** ensures the counter
  row exists so "no row matched" unambiguously means "cap reached," never
  "first claim of the day."


## Architecture source check - 2026-09-09

The historical private implementation and tests were not rerun. Conditional updates
support an atomic claim only with the described transaction, row initialization and
rollback behavior. A zero match means cap refusal under those invariants; it is not
a general substitute for distinguishing missing rows or database errors.

Claiming a queued row as delivered prevents competing local claimants but does not
prove external delivery. Budget release is justified for a confirmed failed claim
that cannot send, while a send timeout can leave delivery unknown and must not be
blindly refunded. Recovery needs reservation identity and reconciliation.

The UTC boundary is a defect only if the product promises local-day accounting.
An exempt kind sharing the global cap can still miss a requested reminder. The
reported absence of an ignored outcome limits evaluation, but an expired card is
not evidence that a user saw and rejected it. Separate unobserved from dismissed.
Evaluation consumes resources even when it spends no attention allowance.

Uncounted direct callers need classification against the stated budget scope;
explicitly separate response accounts are valid. Historical verified_on is retained,
and the current runtime remains unverified in this review.
