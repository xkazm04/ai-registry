---
layer: technique
type: technique
subject: game-economy-tuning
technique: cost-curve-object-audit
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
shared_with: []
use_when: [pricing a new object against an existing roster, deciding whether an outlier is overpowered or merely undercosted, deriving the value of an effect no formula covers]
---

# Cost-curve object audit

The concern: a roster of purchasable or craftable objects — cards, units,
items, abilities — where each object bundles costs, benefits and limitations,
and the question "is this one fair" has no shared yardstick. The technique:
pick **one central resource**, express every cost, benefit and limitation of
every object in that resource's units, and require that each object's cost
total equals its benefit total. The curve — the mapping from cost to
expected total benefit — becomes the roster's pricing authority, and an
object off the curve is the rebalance queue.

## Procedure

1. **Choose the central resource** the roster already trades in. Everything
   else — secondary costs, drawbacks, situational limits — is converted into
   it. A limitation is a negative-cost entry (it cheapens the object), never
   a benefit.
2. **Derive unknown prices by isolation.** Two objects that differ in exactly
   one variable price that variable: the difference in their costs is the
   value of the difference in their effects. Work outward from the pairs the
   roster already contains before inventing a price from taste.
3. **Audit every object against the derived curve** and split the outliers by
   which side is wrong: over/underpowered means the *effects* are mispriced
   for the intent (fix the object), over/undercosted means the *price* is
   wrong for the effects (fix the cost). The two fixes are different work
   for different owners, and a report that says only "too strong" hides
   which one is owed.

## Pricing riders

Three rules recur wherever a curve is derived, and each catches a distinct
authoring error:

- **A restricted benefit is never a cost, and its value is never zero.**
  A conditional effect is a cheaper benefit, not a drawback; pricing it at
  or below zero produces objects that are strictly free value.
- **A choice between benefits costs at least its most expensive branch.**
  The chooser will take the best branch in the situations where it matters;
  pricing at the average pays the player for optionality.
- **When the curve cannot settle a price, err weak.** An undercosted object
  warps every roster decision around itself; an overcosted one is merely
  unused, and an unused object is a cheap fix.

## When not to use this

Rosters with no shared resource to price in — purely situational toolkits
where objects never compete for the same slot — give the curve nothing to
bind. And the curve prices *intended* value, not emergent value: an object
whose power comes from a combination the curve cannot see is a job for
play data and the roster's outlier alerts, not for re-derivation.
