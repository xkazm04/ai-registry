---
layer: technique
type: technique
subject: usage-limit-governance
technique: cost-evidence-and-imputation
status: forged
laws: [nullable-never-zero, never-present-absence-as-an-answer, estimation-announces-itself]
shared_with: []
use_when: [a cost cap must hold over traffic the price book cannot fully price, deciding what an enforcing cap does when spend is unmeasurable, disclosing how much of a cap's current value is estimated]
---

# Cost evidence and imputation

A cost cap evaluates a sum, and the sum has a hole: an event whose model is
absent from the price book stores a *null* cost — correctly, because a null
is an admission and a phantom zero would poison margin and unit-economics
downstream. But every aggregate reads that null as contributing nothing, so
the naive cost cap is free to walk past on exactly the newest, least-vetted
traffic — the just-released model nobody has priced yet is precisely the
traffic an operator most wants capped, and it spends for free. The
technique is charging that traffic honestly, disclosing how, and refusing
to enforce what cannot be measured at all.

## The imputation rule

Charge each unpriced call the mean cost of a *priced* call in the same
window: stored priced cost divided by priced-call count, times the number
of unpriced calls, added to the stored sum only for the limit evaluation.
The rule's virtues are exactly its constraints:

- **It uses only evidence already inside the window.** No provider
  lookups on the admission path, no guessed price list, no writes to the
  event row — the stored null stays null, preserving the invariant that
  downstream analytics never see invented numbers. The imputed charge
  exists only in the evaluation, never in the data.
- **It self-corrects.** When the operator adds the missing price, newly
  priced traffic immediately moves the mean the estimate draws from, and
  ages the unpriced share out of the window on its own schedule. No
  backfill job, no restatement of history.
- **It is deliberately crude.** The window mean is not the missing model's
  price; it is the window's own best evidence. Resist the urge to
  substitute a fancier estimator wired to external data — the moment
  imputation depends on a feed, the cap's value changes when the feed
  does, and an enforcement decision stops being explainable from the
  window's own contents.

Know the rule's failure directions before arming it: a cheap-model window
under-charges an expensive unpriced model (the cap goes soft), an
expensive window over-charges a cheap one (the cap goes strict). Both
errors shrink as the operator prices the model — which the disclosure
below is designed to prompt.

## The evidence structure

The evaluation carries a provenance block beside the current value, not
buried inside it: how many calls in the window are priced, how many are
not, how much was imputed for the unpriced ones (already included in the
current value, so the hard-evidence sum is recoverable by subtraction),
and how much of the stored cost was self-reported by the client rather
than derived from the platform's own price book. Client-reported cost is
not less valid — it is often more accurate — but it is not the platform's
arithmetic, and an operator judging a breach deserves to know whose
numbers tripped it. A status that says "current $4.80 of $5.00, $1.20
imputed across 37 unpriced calls" invites the operator to price the model;
a bare "$4.80" invites them to trust a number that is one-quarter
inference.

## The degenerate case: unpriceable refuses

A window holding unpriced calls and *no* priced call has nothing to impute
from. The naive reading — no measured spend, therefore no breach,
therefore admit — presents the platform's blindness as the customer's
headroom. The correct behavior inverts by tier:

- **An enforcing cap refuses ingest in the unpriceable state**, even
  though nothing is breached — nothing was *measured*, and a cap that
  cannot be measured is not a cap. The refusal is distinguishable from a
  breach in the status (the breached flag stays false; the unpriceable
  flag explains the rejection), so the operator's remediation is "price
  the model", not "raise the threshold".
- **An observe-only cap never rejects**, unpriceable included. Its job is
  to notify, and the unpriceable state is itself worth alerting on — but
  an alert tier that starts rejecting under any condition has silently
  changed tiers.

This is the strictest decision in the subject and it will be challenged
("you rejected traffic that might have been under budget!"). Hold it: the
alternative teaches every operator that adding a new model to production
without pricing it grants that model an unlimited budget, which converts
an accounting gap into a standing incentive. The pressure valve is
legitimate and cheap — deploy new caps observe-only until the price book
covers the traffic, then arm them.

## When not to impute

Calls and token caps need none of this — a call is a call, a token count
is exact, and attaching an evidence structure to them adds a field that is
always empty. Impute only where measurement itself is uncertain, and keep
the evidence structure absent (not zeroed) everywhere else, so its
presence is itself information: a status carrying evidence is a cost cap,
and a status carrying none has nothing to qualify.
