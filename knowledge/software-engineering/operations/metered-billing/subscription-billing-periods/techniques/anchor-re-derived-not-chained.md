---
layer: technique
type: technique
subject: subscription-billing-periods
technique: anchor-re-derived-not-chained
status: forged
laws: [derivation-names-recomputation, identity-survives-reuse]
shared_with: []
use_when: [computing the next boundary of a recurring subscription, a renewal date has walked backwards through the month, deciding what a subscription row must persist]
stage: solo
---

# Anchor re-derived, not chained

A recurrence is a **pure function of an anchor and an index**. Given the date
the agreement is pinned to and the ordinal of the period wanted, the boundary
falls out. It is never computed from the previous period's boundary, and no
persisted boundary is ever an input to the arithmetic that produces the next
one.

Stated as an equation, the two shapes are:

- **Chained (wrong):** `b[n] = advance(b[n-1])`
- **Derived (right):** `b[n] = advance(anchor, n)`

They agree for most anchors, most of the time, which is why the first one gets
written and stays.

## Why chaining is irreversible, not merely inaccurate

Calendar advancement is **lossy at clamped steps.** February cannot represent
the 31st, so advancing a 31st into February must produce the 28th or 29th —
there is no other option and no bug in that step. The defect is what happens to
the output.

Under derivation, February's clamp is a *rendering* of period `n`: the anchor is
still the 31st, so period `n+1` is the 31st of March. The clamp lasted one
period and cost nothing.

Under chaining, February's output becomes March's input. `advance(28 Feb)` is 28
March, and the 31st is now gone from the system — not marked lost, not
recoverable, simply overwritten by its own successor. Every subsequent period
inherits the loss. A subscription that a customer signed on the 31st bills on
the 28th for the rest of its life, and the paperwork that could prove it should
not is a payment history nobody diffs.

The generalization is the part worth carrying out of this subject: **any
recurrence that accumulates deltas through its own state drifts irreversibly at
the first clamped step, and the direction of the drift is always toward the
lossier value.** Month-end is the common instance. It is not the only one: a
weekly cadence that steps by a fixed duration through a seasonal clock shift
migrates by an hour and eventually by a day; a "quarterly" that steps three
times through a clamp loses three times.

## The anchor is contract data, and it is not the row's start

The anchor is the date the recurrence is pinned to — for a plain subscription,
the date the agreement started. It has the properties of an identity, not of a
timestamp: [minted once at creation and carried](../../../../_laws.md#identity-survives-reuse),
never regenerated, never normalized by a migration, never "cleaned up" into the
runtime's zone. It survives restarts, replays, re-billing, and a rebuild of
every derived row.

It is therefore **a different field from the date this subscription record
began**, and a mature model carries both. The two diverge the first time a
subscription is replaced rather than created: an upgrade ends one plan and
starts another, and the customer's expectation is that their invoice date does
not move. So the new record starts today and *inherits the old anchor*. Fusing
the two fields forces a choice between resetting the customer's billing date on
every plan change and lying about when the record began.

The divergence has a consequence downstream that is easy to get backwards.
Such a period is short — it runs from the replacement date to the next
anchor-derived boundary — but the **denominator for anything proportional is
the whole anchor-derived period**, not the short span actually served. A
partial period measured against itself is always a full period, which silently
charges a full month for three days. State plainly, at the boundary, which
consumers get the *actual span* (usage selection, the invoice's stated dates)
and which get the *nominal anchor period* (any proportional derivation).

A subscription may legitimately need a *different* anchor later — a plan change
that re-anchors to the change date, a move from anniversary billing to
calendar-aligned billing, a negotiated shift of the invoice date. Every one of
those is an **explicit anchor change with a recorded effective date**, written
as data. It is never the residue of arithmetic. The test is whether you can
answer "why does this subscription bill on the 14th?" with a row rather than a
reconstruction.

## Procedure

1. **Persist the anchor**, distinct from the subscription's audit timestamps and
   from any period row.
2. **Compute the index from the anchor and the present**, not from a counter
   that increments per pass. A counter is chained state with extra steps: it
   diverges the first time a pass is skipped or replayed.
3. **Derive both ends of a period from the anchor**: period `n` runs from
   `advance(anchor, n)` to the boundary that `advance(anchor, n+1)` implies.
   Deriving the start from the anchor and the end by adding a duration to the
   start reintroduces the chain within a single period.
4. **Clamp at the render, re-anchor at the next step.** Day-of-month overflow
   resolves to the target month's last day for that period only; the following
   period is computed from the anchor's own day-of-month. The mechanics of
   clamping are general calendar craft and are not restated here.
5. **State the recomputation next to the stored boundary.** A persisted period
   row [names how it would be reproduced](../../../../_laws.md#derivation-names-recomputation)
   — the anchor, the index, the cadence, the zone. This is what turns a billing
   incident into an arithmetic problem: recompute all periods from anchors,
   diff against what was stored, and the difference is exactly the damage.
6. **Widen the selection predicate on clamped periods.** Preserving the anchor
   is only half the job: whatever *selects* subscriptions as due must also
   absorb the clamp, or an anchor of the 31st is simply never selected in
   February and the period is skipped rather than shortened. The rule is
   symmetric with the derivation — **on the last day of a period unit, the
   selection matches every anchor day from today's through the largest the unit
   can hold.** On the 28th of a short February that is days 28 through 31; on
   the 28th of a non-leap February, a yearly anchor of the 29th matches too.
   This is the single most-missed half of the technique, because the derivation
   is where people look when the renewal date drifts and the selection is where
   people look when a period goes missing, and the two symptoms are reported by
   different teams.
7. **Assert tiling over a synthetic year.** Generate every boundary for
   subscriptions anchored on the 28th, 29th, 30th and 31st, and on a leap day,
   for twenty-four consecutive periods. Assert the day-of-month returns to the
   anchor's whenever the target month can represent it, and that consecutive
   periods leave no gap.

## Decision rules

- **When a previous period's boundary must be read, it may only be read to
  assert continuity, never to compute.** The distinction is the whole technique:
  a comparison is a check, an assignment is a chain. The continuity assertion
  itself is a separate technique in this subject.
- **When the cadence is a fixed duration rather than a calendar unit** (a
  seven-day trial, an hourly meter), derivation still applies — `anchor +
  n × duration`, computed from the anchor — because the accumulate-and-store
  form still loses precision through rounding and still cannot be recomputed.
- **When a period must be re-opened or corrected**, recompute it from the
  anchor and replace the row. Never patch the stored boundary by hand: a
  hand-patched boundary is a value with no derivation, and the next recompute
  will disagree with it silently.
- **When an anchor genuinely changes**, write the new anchor with its effective
  date and leave the old periods derived from the old anchor. The subscription
  then has a piecewise recurrence, which is honest, rather than a rewritten
  history, which is not.
- **When two subsystems both need the boundary** — the biller and the surface
  that shows the customer their renewal date — both call the same derivation.
  A renewal date computed independently for display is a second recurrence that
  will disagree in February.

## When not to use it

- **One-off charges and non-recurring events** have no anchor and no index;
  forcing them through a recurrence is ceremony.
- **Externally dictated schedules.** When a counterparty publishes the billing
  dates — a partner's settlement calendar, a regulator's filing dates — the
  dates are ingested facts, not a derivation. Store them, do not compute them,
  and reconcile rather than re-derive.

## Smells

- A column named for the next boundary that is written by the job that just
  consumed the previous one.
- A period counter incremented per pass.
- A subscription whose start date is absent, nullable, or equal to its row's
  creation timestamp.
- A renewal date shown in the interface that is computed by a different code
  path from the one the biller uses.
- Any advancement whose input is a value read back from the periods table.
- A migration that "normalizes" subscription start dates.
