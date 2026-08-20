---
layer: technique
type: technique
subject: margin-and-unit-economics
technique: revenue-recognition-rules
status: forged
laws: [no-retroactive-restatement, estimation-announces-itself]
shared_with: []
use_when:
  - turning billing events into windowed revenue
  - handling subscriptions, refunds, and periods in a margin window
---

# Revenue recognition rules

Billing events say when money *moved*; margin needs to know when revenue was
*earned*. Recognition is the translation, and for subscription products it is
the standard accounting treatment: revenue is recognized ratably over the
period the payment purchased, not at the moment of charge. The technique is a
single, pure recognition function with explicit rules for every event shape —
reused verbatim by every surface that reports revenue.

## The rules

Given a revenue event and a half-open window `[since, until)`:

1. **Periodic events amortize linearly over period ∩ window.** A charge
   carrying a valid period (start < end) contributes
   `amount × overlap_seconds / period_seconds`, where overlap is the
   intersection of its period with the window. An annual prepayment thus lands
   as ~1/12 in each month it covers. Zero overlap contributes zero.
2. **Point-in-time events count fully at their timestamp.** A one-time charge
   with no period (or a degenerate one) is recognized entirely in the window
   containing its timestamp, and nowhere else.
3. **Refunds are sign-flipped, in the window they occur.** A refund is
   negative revenue when it happens — it does not claw back a prior window,
   because restating closed windows destroys the ability to compare a report
   with the same report pulled last month. Take the absolute value of the
   stored amount and negate it, so upstream sign conventions cannot double-flip.
4. **Half-open windows everywhere** (`ts ∈ [since, until)`), so adjacent
   windows tile without double-counting a boundary timestamp.

## One implementation, many surfaces

The rollup ("this month per customer"), the daily trend ("this customer per
day"), and the simulation baseline all need recognized revenue. Write the
recognition function **once** and derive the others from it — a daily point is
just the same function over a one-day window. Duplicated recognition math is
not a style problem; it is two implementations that will disagree the first
time one of them handles a refund's sign or a period boundary differently,
after which every discrepancy between the monthly and daily views becomes an
unanswerable support ticket about which number is real.

The test for whether you got this right: summing the daily series over a month
must equal the monthly rollup to rounding error, for every event shape —
subscription spanning the boundary, mid-month refund, point-in-time charge on
the last day.

## Currency and disclosure

Revenue arrives in whatever currency the processor sends. Normalize to the
reporting currency **once at ingest**, from a static, versioned rate snapshot
— never a live feed, which silently re-prices history between two pulls of the
same report. When a currency has no rate, store the amount flagged as
unconverted rather than guessing, and have the margin surface *echo the list
of unconverted currencies* alongside its totals with a human-readable caveat.
The reader must learn from the payload itself that the total is approximate —
a footnote in documentation protects no one who only sees the number.

## Decision rules

- Event has period fields but `start ≥ end`: treat as point-in-time. A broken
  period silently amortized over zero or negative seconds is worse than the
  conservative fallback.
- Proration questions ("customer upgraded mid-period"): represent the change
  as the billing system does — a credit event and a new periodic event — and
  let the same four rules handle it. Do not add upgrade-specific logic to
  recognition.
- Backfilled or late-arriving billing events: recognition is a pure function
  of the event, so late data lands correctly in old windows when re-queried —
  but note this is the one sanctioned way history changes: new *events*, never
  re-priced old ones.

## When not to use it

Pure usage-billed products with no periods and no refunds can recognize at
timestamp and skip amortization — but build the function with the periodic
branch present and unreachable, because the first enterprise deal with an
annual contract should not require a schema migration of your P&L.
