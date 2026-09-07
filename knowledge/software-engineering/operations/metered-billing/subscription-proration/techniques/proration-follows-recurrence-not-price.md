---
layer: technique
type: technique
subject: subscription-proration
technique: proration-follows-recurrence-not-price
status: forged
laws: [one-authority-per-vocabulary, verdict-survives-boundary]
shared_with: []
use_when: [deciding whether a charge is prorated, adding a prorated flag to a rate card, a metered charge that came out too small]
---

# Prorate what persists, not what happened

A billing system has to answer, for every charge on an invoice, whether a
partial period scales it. The answer is determined by **what the quantity
measures**, and by nothing about how it is priced.

## The classification

Four kinds of quantity, three answers:

| The quantity measures | Prorated? | Why |
|---|---|---|
| A recurring fixed fee | Yes | The fee buys a period of availability; half a period is half the availability. |
| A **level held over time** — seats, provisioned capacity, active devices, licensed installs | Yes, **on the quantity** | A seat held for ten days of thirty is a third of a seat. |
| **Events counted in a window** — calls made, messages sent, jobs run, bytes transferred | **No** | The events happened. Inside the window. Already. |
| A one-time or setup fee | No | There is no period to take a fraction of. |

The third row is the one that gets it wrong, and the error is quiet. A
customer joins on the 20th; their metered events are the events they generated
between the 20th and the period end — the meter already restricted itself to
the served span by construction. Multiply that count by 11/30 and the customer
is charged for a third of the work they actually did. Nothing fails. The
invoice is smaller than it should be and no reconciliation notices, because
there is no second source to reconcile against.

The mirror error is charging a full period's recurring fee to somebody who
held it for eleven days. Both come from the same root cause: **the decision
was attached to the price instead of to the metric.**

## Why the price is the wrong place to attach it

A switch labelled "prorate this charge", sitting next to a rate card, is a
switch somebody will turn on for a metered event count — because from the rate
card's seat, proration looks like a discount policy, and every charge can have
a discount policy. From the metric's seat the question does not even parse: an
event count has no level to have held.

So the classification lives with the **metric definition**, not the charge.
The set of quantity kinds is a closed vocabulary with
[one authoritative definition](../../../../_laws.md#one-authority-per-vocabulary),
and every charge over a metric derives its proration behaviour from it rather
than declaring its own. Adding a fifth quantity kind is then one edit, in one
place, and every charge over it is correct on the day it lands.

This is also why the classification must reach the pricing boundary **as a
typed value**, not be re-derived there from a name or a shape. A pricing path
that decides "this looks like a recurring metric" by inspecting the charge is
[a verdict that did not survive its boundary](../../../../_laws.md#verdict-survives-boundary):
the real classification exists at the metric, and a second guess made
downstream will disagree with it the first time somebody defines a metric that
does not look like its kind.

**A charge may still carry a per-charge switch, and it may still be
orthogonal to the pricing model in the schema** — that is a reasonable and
common design. The rule is not about where the boolean is stored. It is that
the boolean is only *meaningful* for metrics that measure a persisting level,
and setting it on anything else must be rejected at the point of definition
rather than honoured at the point of billing.

## Where the coefficient is applied

For a recurring fixed fee there is no quantity, and the coefficient multiplies
money. For a level metric there is a quantity, and the coefficient can be
applied in one of two places:

- **Before the rate card** — scale the units, then price the scaled units.
- **After the rate card** — price the full units, then scale the money.

**These are not the same operation.** They agree exactly when the price is
linear (one rate per unit), which is why nobody notices the choice at first.
Under any non-linear ladder — graduated bands, volume discounts, package
blocks, per-tier flat components — they diverge:

> A hundred seats, held for half the period, on a ladder charging a high rate
> for the first band and a low rate above it. Scale the units and the customer
> is priced as if they held fifty seats — they never reach the cheap band, and
> pay more. Scale the money and they are priced at the hundred-seat rate and
> billed for half the time — they keep the discount they earned by holding a
> hundred seats, and pay less.

Neither is wrong in the abstract. Both are wrong if the system does one of
them in the primary path and the other in a variant, or if the rate card
advertises a volume discount the prorated path silently withdraws.

**There is a third order, and for a banded ladder it is the right one:
place by the full quantity, price by the prorated quantity.** Carry both
numbers through the ladder. The band a unit falls into is decided by the level
the customer *actually held* — a hundred seats reaches the hundred-seat band —
while the amount charged inside that band is computed from the prorated
quantity. The customer keeps the discount they earned by holding a hundred
seats, and pays for the time they held them, and the two questions the naive
orders conflate are answered separately.

It costs more than either naive order: the ladder now needs the full and the
prorated quantities per event rather than one total, and units that straddle a
band boundary have to have their overflow un-counted at the prorated rate
before being re-counted in the next band. That machinery is where the bugs
live, and it is worth it, because the alternatives are both wrong in a way a
customer can articulate.

**Whichever order is chosen, choose it once, write it beside the ladder's
definition, and hold every path to it.** Say it in the document a customer can
read too, because a customer who held a hundred seats and is billed at the
fifty-seat rate will ask.

## Flat components are not scaled, and are placed by the peak

A banded ladder often carries a flat amount per band alongside the per-unit
rate. Two rules, both easy to get wrong and both invisible until somebody
checks:

- **A flat component is not prorated.** It is a fee for occupying the band,
  not a rate over time. Scaling it by the coefficient charges a fraction of an
  unfractionable thing.
- **The band that determines it is the highest level reached during the
  period, not the level at the end.** A customer who ran at the top band for
  three weeks and dropped back on the last day occupied that band, and the
  flat fee for it is owed. Reading the closing level instead makes the fee
  avoidable by timing, which is an arbitrage with a one-line exploit.

## Package and block pricing needs an extra decision

Where units are sold in indivisible blocks — a block of a thousand, rounded
up — scaling the quantity produces a fraction of a block, and the rounding-up
rule then decides whether a customer who held a third of a period pays for a
whole block anyway. That is a policy question the ladder cannot answer on its
own. State it: either the block count is computed from the prorated quantity
and rounded up (a customer present for one day pays for one block), or the
block is itself treated as a level and prorated in money. Choosing by
accident means whichever the arithmetic happened to do.

## An already-weighted aggregation must not be prorated again

The sharpest instance of the double-scaling error, and the one that survives
review because both halves look correct on their own. Some aggregations are
**already time-weighted by construction**: a weighted sum over the period, an
average level, a seat-days integral. The time dimension is inside the
aggregate. Applying a proration coefficient on top scales it a second time,
and a customer present for a third of the period is billed for a ninth.

So the classification has a fourth answer beside the three in the table:
*already prorated*. It belongs on the aggregation, it is checked at
definition time, and a charge that requests proration over such an
aggregation is **rejected**, not silently honoured. The rejection is what
makes the rule survive contact with a rate card that looks like it wants
proration; a comment saying "do not prorate this one" does not.

## Committed minimums and true-ups

A commitment — a minimum spend for a period, a prepaid allowance — is a level,
and is prorated: a customer present for a third of the period is committed to
a third of the minimum. The **usage measured against it is not prorated**; it
is whatever they actually used. Prorating both is the same double-scaling as
the metered-event error, and it makes a partial-period customer look
compliant with a commitment they did not meet.

## Decision rules

- **When a new metric is defined,** its quantity kind is a required field, not
  a default. A metric that arrives without one is rejected; a metric that
  defaults to "not prorated" is a silent full-period charge waiting to happen.
- **When somebody asks to prorate a metered charge,** ask what the meter
  counted. If the answer is events in a window, the meter already did the
  proration; a second one is a discount, and should be implemented as a
  discount with a name.
- **When a level metric's quantity is measured as a snapshot** — seats at
  period end, rather than seat-days — the coefficient is the wrong instrument
  entirely. A snapshot cannot express a level that changed mid-period. Fix the
  measurement; a coefficient over the wrong quantity produces a defensible
  number for the wrong question.
- **When the ladder is linear today,** still record the chosen order of
  operations. It costs a sentence now and is unrecoverable later, because by
  the time the ladder is non-linear both orders exist somewhere in the code
  and no one can say which was intended.

## When not to use this

- **Where every charge is a flat recurring fee**, the classification is
  trivial and a vocabulary for it is over-structure — but write down that the
  choice was made, so the first metered charge does not inherit an assumption
  nobody stated.
- **Where the contract prices availability rather than consumption** — a
  reserved-capacity agreement, an annual licence with no meter — there is one
  level and the classification collapses to the first row.
