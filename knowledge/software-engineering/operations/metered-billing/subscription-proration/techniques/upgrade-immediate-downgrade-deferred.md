---
layer: technique
type: technique
subject: subscription-proration
technique: upgrade-immediate-downgrade-deferred
status: forged
laws: [record-precedes-effect, silent-state-is-ungoverned]
shared_with: []
use_when: [implementing a plan change, a customer downgraded and lost access they paid for, deciding whether a change needs a refund]
---

# Up now, down at the boundary

A plan change mid-period is not one operation with a sign. It is two
operations with different timing, different money, and different failure
modes.

**An upgrade takes effect immediately and is prorated.** The customer asked
for more capability, wants it now, and owes more for the remainder of the
period.

**A downgrade takes effect at the next billing date.** Nothing is prorated,
nothing is credited, and the customer keeps what they paid for until the
period they paid for ends.

## Why the asymmetry, stated as costs

The symmetric alternatives are both worse, and it is worth naming exactly how.

**An immediate downgrade with a credit** returns money for service already
rendered. The customer held the higher tier for seventeen days and used it;
the credit says those days were worth nothing. It also creates an arbitrage
that scales: subscribe high, consume the burst the high tier exists for,
downgrade, collect the credit, repeat. The exploit is cheap to run and
tedious to detect after the fact, because each individual sequence is a
legitimate use of two legitimate features.

**An immediate downgrade without a credit** silently removes entitlement the
customer has already paid for. This is the worse of the two, and the more
common, because it is what falls out of the simplest implementation — write
the new plan onto the subscription and let the gates read it.

**A deferred upgrade** is a different failure: the customer asked for capacity
they need now, and gets it in three weeks with no error message anywhere. They
will assume the request did not go through, and try again.

## The state this requires

Between the request and the effective date, **the tier the customer holds and
the tier they will be billed for are different.** That divergence is a state,
and it has to exist as data before it can be governed at all — an intention
living only in a scheduled job's arguments is
[state nothing downstream can read](../../../../_laws.md#silent-state-is-ungoverned).

Three fields, on the subscription:

- the **current plan** — what entitlement gates read, right now;
- the **pending plan** — what the next period will be billed and gated at;
- the **effective date** — which is the next billing date, not a date computed
  independently.

And the sequencing rule: **the pending change is recorded before anything
moves.** A system that applies the entitlement first and schedules the billing
consequence afterwards has a window where the customer holds a tier no record
accounts for — [the record precedes the effect](../../../../_laws.md#record-precedes-effect),
and if the record cannot be written the change does not happen.

A product without somewhere to put the pending plan will implement a
downgrade the only way it can: by overwriting the current plan. Build the
three fields before building the change flow.

## What the upgrade's invoice must show

An upgrade produces **two lines, not one**:

1. a credit for the unused remainder of the outgoing plan, over the segment
   from the change to the period end;
2. a charge for that same segment at the incoming plan's price.

The tempting single line — "plan change, difference for the remainder" — is
smaller, and is not reconstructable. The customer cannot check it without
knowing both plans' prices and taking the subtraction on faith. Two lines, each
carrying its own dates and denominator, can be verified from the document
alone, which is the whole subject's acceptance test.

Whether the difference is charged now or added to the next invoice is a
separate, legitimate policy choice: charging immediately matches the
entitlement, deferring reduces payment-attempt volume for small amounts. Both
are honest as long as the two lines are visible. Very small differences are
commonly held to the next invoice rather than charged, on the grounds that a
payment attempt costs more than it collects — state that threshold rather than
letting it emerge from a rounding rule.

## Cancellation is a downgrade to nothing

The same rule, with the destination empty: service runs to the paid-through
date, no proration, no refund by default. Two mistakes follow from treating
cancellation as its own thing. Ending service the instant the customer clicks
cancel takes money for days they will not get. Refunding the remainder by
default converts every cancellation into a payment-provider operation with an
external failure mode, and gives back money for service that was rendered.

Immediate termination is a real option and should be a distinct, explicit one,
with its own copy and its own money rule — not the default that cancellation
falls into.

## The exceptions, and only these

The asymmetry has genuine exceptions. They are enumerable, which is what makes
them safe:

- **Trials.** Nothing has been paid; there is nothing to protect. Changes in
  either direction can be immediate and unprorated.
- **Arrears billing.** When the period is billed after the fact, no money has
  been taken yet, so an immediate downgrade refunds nothing — the invoice
  simply carries two segments at two prices. The deferral exists to protect
  money already collected; with none collected, it has no work to do.
- **A change at the exact period boundary.** Not a proration at all: the
  period ends, the new plan starts. Route it away from this path entirely,
  because a zero-length segment through the proration code is a defect
  waiting for a rounding rule.
- **A change of billing interval** — monthly to annual or back. The two
  prices describe different lengths of time and are not comparable on an
  up/down axis. This closes the current period and opens a new one, and
  belongs to the periods subject rather than here.
- **A subscription that has not started yet.** There is no service rendered,
  no money taken and no period in progress, so a change in either direction is
  an **edit to the pending record**, not a scheduled change. Route it away
  before the direction is even computed; a future-dated subscription pushed
  through the deferral path acquires a pending change against a period that
  does not exist.
- **Removal for compliance or abuse.** Entitlement goes away immediately
  because it must; the money question is then handled deliberately and
  separately, under a policy, and never by the proration path.
- **A contractual right to a mid-period refund.** Some agreements and some
  jurisdictions grant one. Honour it explicitly, as a named policy with its
  own line item, not by making downgrades immediate for everybody.

Note what is *not* on the list: "the customer asked nicely", "our competitor
does it", and "the amount is small". Those are decisions to make once, in the
policy, not per-request in the code path.

## Direction is declared, never inferred from price

The whole technique depends on knowing which way a change goes, and **that is
not deducible by comparing two prices.** A cheaper plan can include something
the dearer one does not. Two plans at the same price can trade capacity for
support. Across intervals, the two numbers describe different durations and
comparing them is meaningless.

Declare an explicit ordering on the plan model — a rank, a committed amount
for a stated comparable period, or an explicit pairwise policy for the pairs
that do not sit on a line — and have the change handler read it. A handler
comparing display prices will eventually defer a genuine upgrade, and the
customer who needed capacity today will wait for the boundary with nothing to
tell them why.

**If the ordering is a number, normalise it to a comparable period first.** A
system that compares each plan's amount *annualised* — the same duration for
every plan, whatever interval each is billed at — has fixed the worst half of
the defect for one field's worth of effort, and it is the minimum acceptable
form. What it still cannot see is a cheaper plan that includes more, or a
same-price plan that trades one capability for another; those need the
declared rank.

**And the ordering needs a stated tiebreak.** Two plans at the same
normalised amount are neither an upgrade nor a downgrade, and something has to
decide. Routing the tie to the immediate path is the common choice and is
defensible when the plans differ only in composition — but it takes effect
immediately, so if the tied plan removes a capability, the tiebreak has
silently performed the immediate downgrade this whole technique exists to
prevent. Whichever way the tie goes, write it down; a tiebreak that is a side
effect of a `>=` is a policy nobody has read.

## Concurrency: one pending change at a time

Changes arrive while changes are pending. The rules that keep this from
compounding:

- **At most one pending change per subscription.** A second request
  supersedes the first rather than queueing behind it. A queue of plan
  changes is a state machine nobody will get right and nobody can explain to
  a customer.
- **An upgrade issued while a downgrade is pending cancels the pending
  downgrade** and takes effect immediately. It does not stack, and it does not
  wait.
- **A downgrade issued while a downgrade is pending replaces it.** Same
  effective date, new destination.
- **A change to the plan the subscription is already on is a no-op**, and
  clears any pending change. This is the "I changed my mind" path, and it must
  exist or customers will find another way to reach it.
- **The effective date is re-read from the subscription at application
  time**, never captured when the request was made. Periods move; a captured
  date will one day fire into the middle of a period.

## Decision rules

- **When the pending change is applied,** it is applied by the same code that
  opens the next period, in the same transaction as the period's creation.
  Two independent schedulers will disagree about which side of the boundary a
  change landed on.
- **When a subscription is cancelled with a downgrade pending,** the pending
  change is discarded, not applied at the paid-through date. There is no next
  period to bill it into.
- **When an entitlement gate reads the plan,** it reads the *current* plan. A
  gate that reads the pending plan has implemented the immediate downgrade the
  deferral exists to prevent — and it will read as a small, sensible-looking
  bug in an unrelated file.
- **When the interface shows the plan,** it shows both: what is active now and
  what changes on which date. A customer who downgraded and still sees the old
  tier with no explanation will file a ticket, downgrade again, or dispute the
  charge.

## When not to use this

- **Pay-as-you-go with no plan tiers** has no direction to be asymmetric
  about.
- **Contracts negotiated per customer**, where a change is an amendment with
  its own effective date and its own signature, do not want an automatic
  rule at all — the effective date is a term, not a computation.
