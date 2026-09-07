# Stripe as the `finance` connector

What was learned mapping this recipe onto Stripe specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**There is no recurring revenue figure to read, so the decomposition is the recipe's own
arithmetic and its correctness is the recipe's problem.** Subscriptions and invoices are
exposed; the movement between periods is not. That means new, expansion, reactivation,
contraction and churn are all definitions the mapping writes, and two people will write them
differently. This is exactly why the recipe insists the components reconcile against the
ending figure and against what was actually collected: those two checks are the only
external evidence that the arithmetic is right, because the provider will never contradict
it.

**A subscription that changed mid period is the hard case, and it is common.** Upgrades,
downgrades and seat changes are applied with proration, so the money that moves in the period
is not the money the new plan will produce in a full one. The mapping has to decide whether
the waterfall is built on the recurring amount at the period boundary or on cash movement
within it, and the two produce different and both-defensible reports. Pick one, write it
down, and expect the reconciliation gap to be the proration when they are mixed.

**Cancelled and lapsed look the same from the subscription record and must not be.** A
subscription that ends because the customer cancelled and one that ends because collection
failed both arrive as an ended subscription. Separating them, which the recipe requires
before a churn model can be calibrated on either, means reading the invoice and payment
history behind the ending rather than the ending itself. On this connector that evidence
exists and it is one extra lookup; on a connector where it does not, the recipe's
involuntary-churn separation cannot be honoured and the mapping should say so.

**Refunds, disputes and test data all move money and none of them are revenue movement.**
They arrive through the same objects, and a decomposition that does not exclude them
produces churn that nobody experienced. The exclusion list is set at adoption and is one of
the more common causes of a reconciliation gap that looks like an arithmetic bug.

## What transfers to any payments connector

- If the provider serves no recurring-revenue figure, the waterfall is your definition, and
  the reconciliation against collected cash is the only check on it.
- Decide at adoption whether the decomposition is built on the recurring amount or on cash
  in the period; the difference shows up as an unexplained residual.
- Find out whether the source can distinguish a cancellation from a failed collection. If it
  cannot, the calibration half of this recipe is learning on a mixed label.
