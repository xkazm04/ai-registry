---
layer: golden-path
type: golden-path
subject: subscription-proration
status: forged
use_when: [a customer joins or leaves part-way through a billing period, implementing plan upgrades and downgrades, an invoice line a customer disputes, adding a prorated variant of a pricing path]
techniques:
  - whole-period-denominator
  - proration-follows-recurrence-not-price
  - upgrade-immediate-downgrade-deferred
  - prorated-path-inherits-every-convention
---

# Subscription proration

Somebody joins on the 20th. Somebody upgrades on the 8th. Somebody downgrades
on the 3rd, or cancels on the 17th and wants to know what happens to the rest
of the month they already paid for. In every one of those cases a billing
period got cut into pieces, and **a number has to come out for each piece**.
This subject owns that number: the coefficient that converts a whole period's
price into what is owed for part of it, the granularity that coefficient is
measured at, the denominator it divides by, and the question of which charges
are subject to it at all.

The reason it deserves a subject rather than a helper function is that the
number is **adversarial**. Almost every other computed value in a product is
consumed by the product. This one is printed on a document, sent to somebody
who did not write the code, and disputed by them. A customer who believes they
were charged for a month they held for eleven days does not file a bug report;
they file a chargeback. So the acceptance test for this subject is not "does
the arithmetic terminate" but **can a stranger with the invoice and a calendar
reproduce the number, without access to the system that issued it.** Every
rule below is downstream of that test.

## What this subject does not own

- **The period boundaries themselves.** When a period starts, when it ends,
  whether it is anchored to a calendar month or to the customer's signup
  anniversary, how a period is generated at all — that is the sibling
  subject on billing periods. This subject takes a period's start and end as
  *given inputs* and prices a slice of it. The dependency is one-way and must
  stay that way: proration never adjusts a period boundary, and a change that
  moves a boundary is not a proration at all (see below).
- **The pricing ladder.** Whether a charge is flat, per-unit, graduated,
  volume-banded or sold in packages belongs to the pricing-models sibling.
  This subject supplies a coefficient and says where in the pipeline it is
  applied; it does not decide what the rate card looks like.
- **What a plan grants.** Which capabilities a tier includes, and how a gate
  reads them, is
  [plan-entitlements](../../service-operations/plan-entitlements/plan-entitlements.md).
  This subject owns who owes what for the days on either side of a change;
  that subject owns what they can *do* on those days. They meet at exactly one
  point, and it is the sharp one: a deferred downgrade makes the tier a
  customer holds and the tier they are billed for diverge for the rest of the
  period, and both subjects have to be able to represent that.
- **Money going out.** There is a sibling subject written from the payer's
  seat — a product consuming a metered external dependency, watching units
  accumulate and somebody real pay a number at the end of the month. It
  claims the billing-period boundary for *outgoing* cost, and correctly. The
  discriminator is **who can dispute the number.** When the product is the
  payer, an off-by-one day is an internal reporting error it absorbs and
  corrects next month. When the product is the seller — this subject's seat —
  the same off-by-one is a document a customer can challenge, a support
  ticket, and in some jurisdictions a regulated statement. The reconstruction
  requirement, the exact-partition invariant and the refusal to round early
  all exist only in the second seat. Do not import the first seat's
  tolerances.

## The coefficient is a ratio of two things printed on the invoice

The central discipline. A prorated line is not "a price with an adjustment
applied"; it is a whole-period price multiplied by an explicit fraction, and
**both the numerator and the denominator have to be visible on the document.**
The numerator is the span the customer actually held the thing. The
denominator is the length of the **whole period** — never the span being
billed, never a rounded-up month, never the remaining days.

Divide by the truncated span and the arithmetic still runs; it simply returns
1. A customer who joined on the 20th of a 30-day month gets eleven days of
service and a coefficient of 11/11, and pays a full month. This is the single
most common proration defect and it never throws — it produces a plausible
number, on a real invoice, in the direction that favours the seller, which is
the worst possible direction for a defect to have.

Two invariants make the discipline testable rather than aspirational:

1. **Reproducibility.** Given period start, period end, segment start, segment
   end and the whole-period amount, the line's amount is determined. Nothing
   else may enter the calculation — not the current date, not the process's
   clock zone, not a plan record that might since have changed.
2. **Partition.** Cut a period into any number of segments and **the
   coefficients sum to exactly 1.** Not approximately; exactly. This is what
   guarantees a customer who upgrades three times in one month pays one
   month's worth of base fee, and it is enforceable as a property test over
   random splits long before a customer discovers it is false.

Both invariants are broken by the same small decisions: a closed interval on
both ends of a segment (the change day billed twice), a coefficient rounded to
four decimals before multiplication (residues that do not sum), a day boundary
read from the server's zone rather than the subscription's (a change at 23:30
lands in a different day for two customers with the same contract).

And one that is subtler than all of them: **the record being billed often does
not know its own period.** When a plan change is implemented by ending one
subscription and starting another, the new record begins mid-period and
inherits its period anchor from its predecessor. Compute the denominator from
the new record's own start and the truncated-span defect is back, arrived at by
a longer route. The period is *resolved* — walked back to the boundary
containing the segment — never read off the record. The mechanics —
granularity, half-open intervals, period resolution, the day-count convention,
exact arithmetic, deterministic residue assignment — are
[whole-period-denominator](./techniques/whole-period-denominator.md).

## Proration is a property of what is measured, not of how it is priced

The second discipline is a classification question that most systems answer
implicitly and therefore inconsistently: **which charges get prorated at
all?**

The wrong instinct is to make proration a property of the price — a switch
next to the rate card, "prorate this charge." It is a property of the
**quantity**, and specifically of whether the quantity describes a *level held
over time* or *events that happened in a window*.

- A recurring fixed fee is a level. It is prorated, always.
- A count of events in the period — calls made, messages delivered, jobs run
  — is not a level. **Those events already happened inside the window.** There
  is nothing to prorate; scaling them by a time coefficient charges a customer
  for a fraction of work they actually did. A system that offers proration as
  a price-side switch will eventually have it switched on here, and the result
  is a quiet undercharge nobody audits.
- A persisting level measured by a meter — seats held, provisioned capacity,
  active devices — is a level, and is prorated by **quantity**: a seat held
  for ten days of a thirty-day period is a third of a seat before the rate
  card ever sees it.
- One-time and setup fees are never prorated. They are not periodic; there is
  no period to take a fraction of.
- A quantity produced by an **already time-weighted aggregation** — a weighted
  sum, an average level, a seat-days integral — has the time dimension inside
  it already. Prorating it applies the coefficient twice, and a customer
  present for a third of the period is billed for a ninth.

Where the coefficient is applied matters more than teams expect, because
**scaling the quantity and scaling the money are not the same operation.**
They agree exactly when the price is linear, which is why the choice looks
free at first. The day a graduated or volume-banded ladder lands, they
diverge — a customer who briefly held a high level is billed at the rate for a
level they never occupied, or the reverse — and nothing fails. There is a
third order that answers both questions separately and is the right one for a
banded ladder: **place by the full quantity, price by the prorated quantity**,
so the band is decided by the level actually held and the amount by the time
it was held for. Whichever is chosen, write it down where the ladder is
defined and hold every path to it. The classification, the order of
operations, the treatment of flat components and the divergence test are
[proration-follows-recurrence-not-price](./techniques/proration-follows-recurrence-not-price.md).

## Up is immediate; down waits

The third discipline is an asymmetry that looks arbitrary until you write out
what the symmetric version costs.

**An upgrade takes effect immediately and is prorated.** The customer asked
for more, wants it now, and owes more for the rest of the period. The invoice
carries two lines, not one: a credit for the unused remainder of what they
were on, and a charge for the remainder at the new price. A single "difference"
line is smaller and is not reconstructable — the stranger with the calendar
cannot check it, which fails the subject's acceptance test.

**A downgrade is deferred to the next billing date.** Doing it immediately
forces one of two bad outcomes: either money is returned for service already
rendered at the higher tier, or entitlement the customer has already paid for
is silently removed. It also opens an arbitrage — upgrade, consume a burst,
downgrade, collect the credit — that costs real money at scale and is
tediously hard to detect after the fact.

The consequence is the part that gets built last. Between the request and the
effective date, **the tier the customer holds and the tier they will be billed
for are different**, and the product must be able to say so: a current plan, a
pending plan, and a date. A system with nowhere to put the pending plan will
implement the downgrade the only way it can — by writing the new plan onto the
subscription — which removes the paid-for entitlement immediately and is
exactly the failure the deferral existed to prevent.

Cancellation is the same rule with the destination set to nothing: service
runs to the paid-through date, no proration, no refund by default. The
asymmetry's real exceptions — trials, arrears billing, interval switches,
compliance-driven removals — and the rule for what happens when a second
change arrives while one is pending are
[upgrade-immediate-downgrade-deferred](./techniques/upgrade-immediate-downgrade-deferred.md).

The asymmetry is useless without one thing beside it: **"upgrade" and
"downgrade" are not deducible by comparing two numbers.** A cheaper plan may
include a capability the dearer one does not; a monthly-to-annual move
compares prices describing different lengths of time and is not on the up/down
axis at all. The direction is an ordering declared on the plan model and read
by the change handler, never inferred from what a pricing page displays.

## A prorated pricing path is a second implementation

The fourth discipline is a general defect class that proration happens to
expose more reliably than anything else, and it is worth stating at full
strength because it costs far more than the arithmetic does.

When a system prices a graduated ladder, it acquires conventions that are not
written in the rate card — they are **inferred at price time**. Whether tier
boundaries touch or overlap, and therefore whether a boundary value belongs to
the lower band or the upper one. What an absent upper bound on the last tier
means. How a flat component per tier composes with the per-unit rate. Which
rounding mode applies, at what precision, in which currency's minor unit.

Add a prorated variant of that path and you have written **a second
implementation of the same ladder** — and the conventions do not come with it.
They were inferred by code the variant does not run. The observable result is
that two customers on the same plan, differing only in whether their charge
was prorated, are billed on different boundary rules; the difference is one
unit at a tier edge, appears on a fraction of invoices, and survives for years
because no test compares the two paths.

The remedy is mechanical, which is what makes it worth having: enumerate every
input and every inferred property the primary path reads, and assert the
variant reads each one. The strongest single form is an equivalence property —
**at a coefficient of one, the prorated path must return exactly what the
primary path returns** — because it pins every convention at once, including
the ones the primary path has not acquired yet. The enumeration, the
equivalence test and the generalization past proration are
[prorated-path-inherits-every-convention](./techniques/prorated-path-inherits-every-convention.md).

## Advance billing needs a credit primitive; arrears billing does not

A structural point that decides how much of this subject a product can honestly
implement. When a period is billed **in arrears**, a mid-period change needs
nothing but correct segment arithmetic: the invoice simply carries two smaller
lines instead of one. When it is billed **in advance**, the money for the
remainder of the period has already been taken, and any change that reduces
what is owed produces an obligation running the other way.

That obligation should be a **credit against the next invoice**, not a refund
to the payment instrument. A credit stays inside the ledger, is reversible,
composes with later changes, and needs no cooperation from a payment provider.
A refund crosses that boundary, is frequently irreversible, may not return
processing fees, and turns a routine plan change into an operation with an
external failure mode. Refunds are for the case with no next invoice —
termination — and even there they are a policy decision, not a default.

The consequence is worth stating plainly: **a product that bills in advance and
has no credit primitive cannot implement mid-period downgrades honestly.** It
will either refuse them, silently keep the money, or reach for a refund it
should not be reaching for. Build the credit line item before building the
plan-change flow, not after.

## Every prorated line names its own derivation

Prorated amounts outlive the code that derived them. An invoice is re-rendered
years later, in a dispute, in an audit, in a migration to another system. So
the line stores what it was computed from — the two dates, the denominator,
the whole-period amount, the coefficient as an exact value — rather than only
the resulting money. A stored total with no recorded derivation is silently
re-derived under whatever rules the code holds at render time, and the next
convention fix restates history with nothing available to explain it.

## What this subject refuses

- **A coefficient a stranger cannot reproduce from the invoice.** If the
  document does not carry both dates and the denominator, the number is an
  assertion, not a statement.
- **A denominator that varies by segment.** Every segment of one period
  divides by the same period length, or the partition invariant is false.
- **Prorating events that already happened.** A window's events are not a
  level; scaling them is an undercharge with no error.
- **Rounding the coefficient before multiplying.** Round money once, at the
  end, and assign the residue deterministically.
- **A single "difference" line for an upgrade.** Two lines — the credit and
  the charge — or the customer cannot check the arithmetic.
- **An immediate downgrade that removes paid-for entitlement.** The customer
  paid through the period end; the deferral is what protects that.
- **Inferring upgrade versus downgrade from displayed prices.** Especially
  across different billing intervals, where the two numbers are not
  comparable at all.
- **Prorating a quantity that was already measured over time.** The
  coefficient is inside the aggregate; a second one bills a third of a third.
- **A prorated pricing path with no equivalence test against the primary
  path.** Two implementations of one ladder, with no check that they agree,
  will disagree.
- **Falling back to the unprorated path when no prorated variant exists.** A
  combination with nothing behind it is refused where the rate card is
  authored, not silently charged at full period.
- **Reading the day boundary from the process's clock zone.** The boundary
  belongs to the subscription and is fixed when it is created.

## The techniques

- [whole-period-denominator](./techniques/whole-period-denominator.md) — the
  coefficient's numerator, denominator and granularity; half-open segments,
  exact arithmetic, the sum-to-one partition invariant.
- [proration-follows-recurrence-not-price](./techniques/proration-follows-recurrence-not-price.md)
  — which charges are prorated at all, why that is a property of the metric,
  and where in the pipeline the coefficient is applied.
- [upgrade-immediate-downgrade-deferred](./techniques/upgrade-immediate-downgrade-deferred.md)
  — the direction asymmetry, its exceptions, pending-change state, and the
  divergence between held tier and billed tier.
- [prorated-path-inherits-every-convention](./techniques/prorated-path-inherits-every-convention.md)
  — a variant path as a second implementation, the convention enumeration, and
  the coefficient-of-one equivalence test.
