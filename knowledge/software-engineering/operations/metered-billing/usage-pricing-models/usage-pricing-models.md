---
layer: golden-path
type: golden-path
subject: usage-pricing-models
status: forged
use_when: [choosing a pricing shape for a metered charge, adding tiers or free units to an existing charge, an invoice line the customer disputes, deciding whether a charge may be billed before the period closes]
techniques:
  - inferred-tier-boundary-convention
  - advance-billing-refuses-retroactive-models
  - grouping-key-reruns-the-ladder
  - exact-money-with-one-rounding-boundary
---

# Usage pricing models

A pricing model is the function that turns **one measured quantity into one
amount of money**. Everything before it — what was counted, over what window,
deduplicated how — belongs to measurement. Everything after it — which lines
land on which invoice, when that invoice is finalized, what tax applies — belongs
to invoicing. This subject owns the middle: the shapes that function can take,
the conventions that make it reproducible, and the interactions between those
shapes that surprise the people who configured them.

It deserves a subject because the middle is where a product's pricing stops
being a sentence on a page and becomes arithmetic that somebody will dispute.
A per-unit rate is a sentence anyone can check. The moment a ladder, a free
allowance, a flat component, a dimension and a percentage appear in the same
charge — which is where every metered product ends up — the amount is the
output of a composition nobody wrote down, and the two questions that matter
are *can this number be reproduced* and *did anyone notice when it changed*.

## What this subject does not own

- **Measurement.** How events became a quantity — summed, maximised, counted
  as distinct values, taken as the latest reading, weighted by duration — is
  the aggregation subject's. This subject receives a number and a unit and
  asks no questions about its provenance beyond one: is it an integer, or can
  it be fractional? That single property decides which boundary conventions
  are even coherent.
- **Proration.** What a mid-period plan change does to the period's quantity
  and to any flat component is its own subject with its own arithmetic. This
  subject's models run over whatever quantity proration hands them.
- **Invoice assembly.** Line grouping, sequencing, finalization, credit notes,
  taxes and totals are downstream. This subject produces a priced line and the
  numbers that let later stages divide it.
- **The payer's seat.** There is a neighbouring discipline — cost metering —
  that owns price tables for money going *out*: an external dependency charges
  per unit consumed, and the product's job is to estimate, budget and cap
  before it spends. That is the same arithmetic pointed the other way, and the
  failure modes do not transfer. On the payer's side an error means overspend,
  it is discovered by a budget alert, and the fix is a ceiling. On the seller's
  side an error means revenue that was never collected or an amount the
  customer did not agree to, it is discovered by a customer, and the fix is a
  credit note and an explanation. **This subject is the seller's seat.** Its
  standard of proof is therefore higher: not "close enough to plan capacity"
  but "reconstructible to the minor unit, months later, by someone who does
  not have the running system."

## Five shapes, and the one axis that separates them

Practitioners argue about which pricing shapes exist; the list is short and
stable, and the useful part is not the list but what distinguishes them.

- **Per-unit.** Amount is quantity times a rate. Linear, trivially
  reproducible, and the only shape a customer can verify in their head.
- **Graduated.** Successive tiers each hold a band of the quantity; each tier
  prices only the units that fall inside it, and a tier may carry its own flat
  component alongside its per-unit rate. The total is the sum over tiers. The
  marginal rate falls (or rises) as consumption crosses boundaries, but a unit
  once priced stays priced.
- **Volume.** The *total* quantity selects exactly one tier, and then **every
  unit is priced at that tier's rate**, including the ones consumed before the
  tier was reached. This is the shape that behaves unlike all the others.
- **Package.** The quantity is divided into blocks of a fixed size, rounded
  **up**, and each block costs a flat amount. A step function; the customer
  pays for the unused remainder of the last block, which is the point.
- **Percentage.** A rate applied to a monetary value rather than to a count,
  almost always with a fixed amount per transaction, and frequently with a
  per-transaction floor and cap. Its inputs are money, so it manufactures more
  decimals than any other shape.

The axis that actually matters, and that no vocabulary makes visible: **can the
price of a unit already consumed be changed by a unit consumed later?** For
per-unit, graduated, package and percentage, no — each unit's contribution is
fixed the moment it is measured, and the total is a non-decreasing function of
quantity. For volume, yes: crossing a boundary reprices the whole history, and
if the tier rates descend, the marginal cost of the boundary-crossing unit is
**negative**. A hundred units at one currency unit each is a hundred; a hundred
and one units at half a unit each is fifty and a half. The hundred-and-first
unit cost minus forty-nine and a half.

There is a second, quieter distinction hiding in that list, and it decides how
much of the event stream the model needs. **Most shapes are functions of one
aggregated quantity. A per-transaction floor or cap is not.** The moment a
percentage charge acquires a minimum or maximum *per transaction*, the amount
can no longer be computed from the period's total value at all — each
transaction has to be priced on its own and the results summed, because
clamping the total is not the same as clamping each part. The same is true of a
fixed fee charged per transaction, and of a free allowance expressed as a number
of *events* rather than a number of units. A model with any of these needs the
per-event breakdown, not the aggregate, and a pipeline that only ever hands the
pricing stage a single number cannot express them. Discover that before the
feature is promised, not while implementing it.

In arrears that negative number is not a bug — it is the entire point of volume
pricing, computed once when the period closes, and the customer experiences it
as a discount. Charged before the period closes it is fatal, and the reasons
are structural rather than stylistic: it emits a fee that reduces an invoice,
with no refund semantics attached and no stage downstream that knows how to
classify it. That is the
[advance-billing-refuses-retroactive-models](./techniques/advance-billing-refuses-retroactive-models.md)
technique, and its main claim is that the incompatibility is a **refusal**,
asserted at every layer that could construct the pair — not a warning in a
help article.

## A ladder is two numbers and a convention, and only two of them are written down

Every graduated or volume ladder is a list of ranges. `0` to `10`, then `10` to
`20`, is a different ladder from `0` to `10`, then `11` to `20` — one of them
holds ten units in its second tier, the other holds ten and the boundary unit
belongs to the first. The convention is not visible in the numbers alone; it
lives in whether the ranges **touch**.

The difference is one unit per tier. It is not noise: it has the same sign for
every customer, on every period, forever, and it never shows up as variance
because there is nothing to vary. It is the cheapest possible defect to prevent
and among the more expensive to discover, because discovering it means somebody
reconciled a real invoice by hand.

The correct answer is to **declare the convention as data on the model** and
have every consumer read the declaration. The situation this subject has to
handle honestly is the one where you cannot: a corpus of plans authored under
an older encoding, a newer encoding that reads more naturally, and no field to
migrate into because the old plans do not record which they were. Then the
convention is *inferred from the shape of the ranges* — and an inferred
convention has a failure mode a declared one does not, which is that inference
is a thing a second code path can simply forget to do. Detection at one site
and a hardcoded assumption at the next is not a bug in a tier; it is a **silent
fork of the pricing model**, where the same plan prices two ways depending on
which path ran. Detection, the sites that must consume it, and the ladders on
which inference has no answer at all are the
[inferred-tier-boundary-convention](./techniques/inferred-tier-boundary-convention.md)
technique.

## Free units and flat components compose in an order somebody chose

A real charge is rarely one shape. It is a flat component plus a ladder, with
an allowance of units that cost nothing, possibly with a minimum the period
must reach. Those parts compose, and composition has an order:

- **Which kind of free.** "Free units" is two different allowances wearing one
  name: a free *quantity* (the first thousand units cost nothing) and a free
  *count of events* (the first ten transactions cost nothing). A charge with a
  percentage component and a per-transaction fixed fee has both, and they apply
  to different components — the quantity allowance reduces the percentage part,
  the event allowance reduces the fixed part. Naming them identically in the
  configuration guarantees that somebody eventually sets one and expects the
  other's behaviour.
- **Free units before or inside the ladder.** Subtracting the allowance from
  the quantity and then running the ladder is *not* the same as making the
  first tier free, unless the ladder's first tier starts at zero and the
  allowance falls exactly on a boundary. Under the first reading the allowance
  shifts the whole ladder down; under the second it consumes the first tier's
  band. Pick one, write it beside the model, and price a fixture both ways once
  so the difference is visible to whoever reads the code next.
- **The flat component's scope.** Per charge, per tier, per block, per group —
  four different amounts. A flat component whose scope is unstated multiplies
  by whatever the model happens to iterate over.
- **The minimum's scope.** A period minimum applied per charge and the same
  number applied per dimension are different products.

None of these are hard. All of them are silently wrong when nobody states the
order, because every reader assumes the reading that matches the last system
they worked on.

## A dimension is not free, and it is not reporting

When a charge carries a grouping key — price this per region, per model name,
per endpoint — the whole model **runs once per distinct value**. Tiers reset.
Free units reset. Flat components reset. Each group becomes its own invoice
line, and that is the reason it must work this way: a line must be
independently reconstructible from its own quantity, and a ladder shared across
groups would make each line depend on the order the groups happened to be
processed in.

The consequence is the sharpest single fact in this subject, and it is
routinely learned the expensive way: **adding a grouping key to an existing
charge reprices every customer on it, and nothing in the change looks like a
price change.** The direction is not even uniform — per-group flat components
and descending ladders push the total up, a resetting free allowance pushes it
down, and a charge with both moves in a direction nobody computed. A change
that is reviewed as a reporting improvement ships as an unannounced repricing.
The rule that follows is blunt: a grouping key is a **pricing attribute**,
reviewed like a rate; if the requirement came from a dashboard, satisfy it from
the event stream, which already carries the property. That, the cardinality
bound, and what happens to events with no group value are the
[grouping-key-reruns-the-ladder](./techniques/grouping-key-reruns-the-ladder.md)
technique.

## Exact until one boundary, then integral forever

Every shape above manufactures more decimals than the currency can express. A
percentage of a transaction does. A tier rate of three ten-thousandths per
request does. A conversion between the unit the price is quoted in and the unit
the meter counts does. There is exactly one place in the whole pipeline that
*must* be integral — the amount actually charged, expressed in the currency's
minor unit — and the discipline is to round **there and nowhere else**, in an
arbitrary-precision decimal type throughout, and to **persist the unrounded
value beside the rounded one**.

The unrounded twin is the part teams omit and the part that pays for itself,
because three later stages each need to *divide* the amount: a discount or
credit allocated proportionally across N lines, a minimum-commitment shortfall
computed as a commitment minus a sum of lines, and a partial refund that takes
a fraction of one line. Every one of those divisions off a rounded number
produces a set of parts that does not sum back to its whole, and the remainder
gets pushed onto whichever line the loop touched last. Off the unrounded twin,
a discount split across any number of lines sums to the discount exactly. Rules
for the boundary, the pair, the rounding mode and the residue are the
[exact-money-with-one-rounding-boundary](./techniques/exact-money-with-one-rounding-boundary.md)
technique.

## Reproducible means: the recorded inputs are sufficient

The invoice line is the artifact that has to survive. Months after the fact,
with the plan since edited, someone must be able to re-derive the amount from
what was written down. That imposes a test on everything above — **the amount
must be a function of the recorded inputs alone** — and the test fails in three
recognisable ways.

It fails when the line records a quantity and an amount but not the rates, so
re-derivation reads today's plan and reprices history. It fails when the model
carries an inferred convention rather than a declared one, because the
inference is not among the recorded inputs. And it fails, most insidiously,
when a pricing path is **gated on a build or licence flag** — when the same
model, the same quantity and the same configuration produce one amount in one
edition and a materially different amount in another. That has been observed as
a difference of an order of magnitude on a single fixture, and it means the
recorded inputs were never sufficient: reconstructing the invoice also requires
knowing which build ran, which nothing on the invoice says. Pricing behaviour
belongs to the model, never to the edition; if an edition genuinely sells a
different price, that is a different model, named, and recorded on the line.

## What this subject refuses

- **Treating graduated and volume as synonyms.** They differ in whether history
  is repriced, which is the only property that decides half the design.
- **A retroactive model billed before the period closes.** Not warned about —
  refused, at authoring, at selection and at computation.
- **An undeclared tier-boundary convention.** And where one must be inferred,
  inference at some sites and an assumption at the others.
- **Inclusive-both-ends ranges over a quantity that can be fractional.** Ten
  and a half units belongs to no tier, and no arithmetic recovers from that.
- **A grouping key added for reporting.** It is a repricing with no diff line
  that looks like one.
- **An unbounded grouping key.** Group count is invoice-line count; an
  open-vocabulary key turns a per-group flat component into a per-request fee.
- **Floating-point money, at any stage.** And its quieter sibling, rounding
  each tier's subtotal before summing, which makes the error a function of the
  tier count.
- **A stored amount with no unrounded twin.** Every proportional split
  downstream is then approximate, and the approximations do not agree.
- **A price that depends on the edition running it.** The invoice would not be
  reconstructible from the invoice.
- **A composition nobody priced against a fixture.** Free units, a flat
  component, a ladder and a dimension in one charge have an order of
  operations; if no test pins it, the order is whatever the code does today.

## The techniques

- [inferred-tier-boundary-convention](./techniques/inferred-tier-boundary-convention.md)
  — declaring the ladder's boundary convention, inferring it only as a
  migration bridge, and inferring it at every site that consumes it.
- [advance-billing-refuses-retroactive-models](./techniques/advance-billing-refuses-retroactive-models.md)
  — a model whose past units are repriced by future units cannot be charged
  before the period closes, and the incompatibility is a structural refusal.
- [grouping-key-reruns-the-ladder](./techniques/grouping-key-reruns-the-ladder.md)
  — a dimension re-runs tiers, free units and flat components per group; adding
  one is a repricing, and cardinality is invoice length.
- [exact-money-with-one-rounding-boundary](./techniques/exact-money-with-one-rounding-boundary.md)
  — arbitrary-precision throughout, one rounding at the integral boundary, the
  unrounded value persisted beside it for every stage that divides.
