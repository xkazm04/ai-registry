---
layer: technique
type: technique
subject: usage-pricing-models
technique: advance-billing-refuses-retroactive-models
status: forged
laws: [absent-guard-is-loud, verdict-survives-boundary, failure-not-empty-success]
shared_with: []
use_when: [choosing when a usage charge is billed, someone asks for a volume discount charged upfront, a fee came out negative]
---

# A model that reprices the past cannot be charged before the past exists

Charges are billed in one of two timings. **In arrears**: the period closes, the
quantity is final, the model runs once. **In advance**: the customer is charged
at the start of the period, and for a usage charge that means charging for what
has accrued so far and charging again later for the increment.

Billing in advance is therefore **incremental** by construction. Each successive
charge is the amount for the quantity to date minus what has already been
charged. That subtraction is where the constraint comes from.

## The property, stated once

A pricing model is **retroactive** when the amount attributed to a unit already
consumed can change because of a unit consumed later.

- Per-unit: not retroactive. Each unit contributes its rate, forever.
- Graduated: not retroactive. A unit's tier is fixed by the units *before* it;
  later units land in later tiers and change nothing behind them.
- Package: not retroactive. Blocks, once opened, are paid for.
- Percentage: not retroactive. Each transaction's fee is a function of itself.
- **Volume: retroactive.** The total selects one tier and *every* unit is
  priced at that tier's rate, the historical ones included.

The test that follows is mechanical: **is the total a non-decreasing function of
the quantity, and is the marginal amount of the next unit non-negative?** For a
volume ladder with descending rates it is not. A hundred units at one currency
unit each totals a hundred; a hundred and one units at half a unit each totals
fifty and a half; the hundred-and-first unit has a marginal price of minus
forty-nine and a half.

In arrears that is not a defect — it is the product. A volume discount is
exactly the promise that crossing a threshold makes the whole bill cheaper, it
is computed once when the quantity is final, and the customer sees a smaller
number. In advance the same arithmetic emits a **negative fee**: an invoice line
that reduces a total, appearing on an invoice that was supposed to collect
money, with no refund semantics, no credit-note lineage, nothing downstream that
can classify it for tax, and a plausible path to a negative invoice total. There
is no configuration of a retroactive model, billed in advance, that is safe. So
the answer is not to handle the negative fee. It is to make the combination
unconstructible.

## Refuse the pair, at every layer that can construct it

The constraint is on a **pair** — (model shape, billing timing) — not on either
attribute alone. Validating "volume" or validating "in advance" independently
cannot express it. Model it as a table over the product of the two closed sets,
with **every cell decided and no cell defaulted**, and then assert it in three
independent places, because they catch different things at different times:

1. **At authoring.** The charge cannot be saved with the forbidden pair. The
   validation error names the model, the timing and the reason, and it reaches
   the person configuring the plan as a statement about pricing, not as a field
   error on an unrelated attribute. A refusal that arrives as a generic failure
   has not
   [survived to the boundary that acts on it](../../../../_laws.md#verdict-survives-boundary).
2. **At selection.** The component that maps a charge to its computation
   refuses the forbidden pair rather than falling through to a default
   implementation. This catches what authoring cannot: a plan created before
   the validation existed, a bulk import, a fixture, an internal caller that
   assembled the arguments directly.
3. **At computation.** The code path that would run raises. Not returns zero,
   not returns the arrears amount, not logs and continues — raises. A selector
   that returns nothing and a caller that reads nothing as zero is
   [failure spelled the same way as empty success](../../../../_laws.md#failure-not-empty-success),
   and on a money path it bills nobody and alerts nobody.

Three layers is not belt-and-braces paranoia; it is the recognition that one
validation is a guard you can route around, and
[an optional guard is an absent guard](../../../../_laws.md#absent-guard-is-loud).
Authoring protects the surface, and every real system has a second way in.

## Refuse on the shape, not on the numbers

A tempting refinement: a volume ladder whose rates *ascend* is monotone, so
allow that one. Do not. The constraint has to hold across every future edit of
the configuration, and rates are editable — the plan that was ascending when it
was validated becomes descending in a support ticket six months later, long
after the charge stopped being re-validated. A structural refusal keyed on the
model's kind is checkable at every moment of the plan's life. A numeric check
is only true of the numbers it saw.

The same reasoning rules out "warn and let them proceed". A warning delegates a
correctness property to the attention of whoever is configuring a plan at the
time, and it is dismissed by the same person twice.

## The second requirement, which the first one hides

Non-retroactivity is necessary and not sufficient. The delta formulation —
*price the quantity including this event, price it excluding this event,
charge the difference* — imposes a requirement on the model itself: it must be
**evaluable at a hypothetical quantity**, including zero, and it must know that
it is being evaluated for a delta rather than for a bill.

The reason is the flat component. A charge with a flat fee, evaluated at zero
units, returns the flat fee; evaluated at one unit, returns the flat fee plus a
rate; the difference is the rate alone, and the flat fee is never charged. The
model must therefore accept a signal — an explicit flag on the evaluation, not
a guess from the quantity being zero — that suppresses flat components in the
excluding-this-event evaluation, so that the very first event of a period picks
up the flat fee and no later one does.

Two rules follow. **The suppression flag is an input to the model, not a
condition inside it**: a model that infers "this must be a delta because units
are zero" is wrong for a real period that genuinely had no usage. And **every
model that is allowed in advance implements it**, not just the ones with flat
fees today — a tier flat amount added next quarter to a model that ignores the
flag reintroduces the bug in a place nobody associates with billing timing.

## What to offer instead

The refusal is only defensible if there is an answer to the requirement behind
it, and there usually is:

- **Split the charge in two.** A flat commitment billed in advance, and a usage
  charge billed in arrears that trues up against it. This is what the customer
  actually asked for — money up front, a volume-shaped bill — and both halves
  are ordinary.
- **Use a graduated ladder.** It delivers the same declining marginal cost and
  most of the same total, without repricing history, and it is safe in advance.
  For most quantities the totals differ by less than the argument about them
  costs.
- **Keep volume and bill in arrears.** Frequently the in-advance requirement is
  about cash timing, and a shorter period solves it without touching the model.

## Decision rules

- **When a new pricing shape is added,** its row in the table is decided before
  it ships. An undecided cell defaults to allowed, which is the wrong default
  on a money path.
- **When a new billing timing is added** — mid-period charging, a settlement
  cadence, anything that computes an amount before the quantity is final — the
  whole table is revisited. The constraint is about finality, not about the
  word "advance".
- **When a period is shortened or a plan changes mid-period,** the partial
  quantity is still not final for a retroactive model. The refusal follows the
  model into every partial-period path rather than being re-argued there.
- **When a fee comes out negative anywhere,** treat it as this defect until
  proven otherwise, and never as a number to clamp at zero. Clamping converts
  a structural error into a silent undercharge on one side and an overcharge on
  the other.

## When not to use this

- **Charges with no usage component.** A flat subscription fee is final at the
  start of the period by definition; timing is a free choice.
- **Systems that only bill in arrears.** The table still wants writing down,
  because the second timing arrives eventually, but nothing is refused today.
- **Quotes, previews and estimates.** These may run a retroactive model over a
  partial quantity, because they are labelled as projections and collect no
  money. They must be prevented from becoming the source of a charge, which is
  a boundary at the invoice, not at the model.
