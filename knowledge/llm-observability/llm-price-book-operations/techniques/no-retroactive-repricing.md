---
layer: technique
type: technique
subject: llm-price-book-operations
technique: no-retroactive-repricing
status: forged
laws: [no-retroactive-restatement, nullable-never-zero]
shared_with: []
use_when: [correcting a wrong price-book row, explaining why a budget window still shows old costs, deciding whether cost is stamped at ingest or computed at read]
---

# No retroactive repricing

The deepest design decision in a price book is not any row — it is *when
multiplication happens*. Stamp cost onto the event at ingest, and history is
frozen: reports are citable, alerts mean what they meant, and a price
correction changes only the future. Compute cost at read time from the current
book, and every report is a function of when you ran it: fixing a wrong row
silently rewrites last month, two exports of "the same" month disagree, and no
number can be cited without also citing the book version it was read under.
This technique is the first choice, held deliberately:
**cost is stamped once at ingest, and correcting a wrong price never restates
spend already recorded** — the direct application of
[no-retroactive-restatement](../../_laws.md#no-retroactive-restatement).

## What a correction can and cannot do

When an operator discovers a wrong row and fixes it through the write path:

- **Can:** change the price of every event ingested from the swap onward.
- **Cannot:** change the stamped cost of any event already ingested. The
  budget window that those events fell into **stays wrong until it rolls** —
  and the system's own documentation says exactly that, in those words, where
  cap behavior is described. Shipping the caveat is part of the technique: an
  operator who fixes a price and watches the window not move will otherwise
  conclude the fix failed and "fix" it again, harder.

This feels wrong the first time — surely correcting an error should correct
its consequences? But walk the alternative: a restating system cannot answer
"why did we alert on Tuesday?" after a Wednesday correction, because
Tuesday's number no longer exists. Enforcement decisions were *made* on the
stamped numbers; unmaking the numbers cannot unmake the decisions, it can
only orphan them. Accounting that can change after the fact is not
accounting. The bounded cost of a frozen wrong window — known, dated,
explainable — is the price of every other number staying citable forever.

## The deliberate asymmetry: imputed charges self-correct

One class of traffic escapes the freeze, on purpose. An event whose model had
*no row at all* at ingest was never stamped — its cost is null, per
[nullable-never-zero](../../_laws.md#nullable-never-zero) — so anywhere a
charge for it is needed (a cost cap must count it as something), the charge
is **imputed at evaluation time** under a disclosed rule. Because imputation
is computed fresh at each evaluation, adding the missing price later means
the very next evaluation prices that traffic correctly: **only unpriced
traffic self-corrects, because only unpriced traffic carries no stamp.**

The asymmetry is principled, not accidental, and worth stating as a rule:
*a measurement, once made, is frozen; an estimate, never having been a
measurement, is recomputed.* The two never blur — the imputed charge is
reported beside the totals it entered, never written onto the event, so it
cannot ossify into fake history.

## Decision rules

- **Never backfill stamped cost, even "just this once".** The one-time
  backfill script is the whole invariant gone: after it exists, no historical
  number is known to be original. If a business genuinely requires corrected
  historical views, build them as a *separate, labeled* re-priced projection
  beside the ledger — never in place of it.
- **Stamp enough to explain the stamp.** The event's cost is more auditable
  when the ingest also records what priced it (the resolved row's identity or
  rates). Then "why does this event cost this?" is answerable from the event,
  even after the book has moved on.
- **The caveat travels with the surface.** Wherever cap or window behavior is
  documented, the no-restatement rule and the imputation asymmetry are
  documented beside it. This is operator-facing semantics, not internals.
- **Corrections are still urgent.** Forward-only does not mean relaxed: every
  hour a wrong row lives, more traffic is stamped wrong *permanently*. The
  freeze makes speed matter more, not less — which is the operational
  argument for the hot-swap path.

## When not to use it

- **Provider-invoice reconciliation systems**, where the provider's bill is
  the ground truth and your figures are estimates by definition — there,
  restating estimates toward actuals (labeled as such) is the honest move,
  and the frozen-ledger posture belongs to the actuals, not the estimates.
- **Pre-launch and staging environments**, where the "history" is synthetic
  and repricing it is just fixing test data. The invariant guards decisions
  people made on numbers; where no decisions were made, there is nothing to
  protect — but flip the discipline on before the first real consumer, not
  after.
