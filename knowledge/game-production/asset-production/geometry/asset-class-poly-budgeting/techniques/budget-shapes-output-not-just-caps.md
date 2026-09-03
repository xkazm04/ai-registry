---
layer: technique
type: technique
subject: asset-class-poly-budgeting
technique: budget-shapes-output-not-just-caps
status: forged
laws: [a-budget-shapes-the-output, grade-against-what-ships-not-on-a-curve]
use_when: [choosing the budget for one specific asset, output has invented detail nobody asked for, deciding whether to hand an asset its class maximum]
---

# The budget shapes the output, it does not just cap it

## The concern

A limit handed to a generative process is read by that process as a target. It spends
what it is given. This inverts the intuition every engineer brings from resource
budgeting, where a generous limit is at worst wasteful and never harmful. In generative
geometry a generous limit is *actively harmful*: with the subject's real detail already
resolved, the surplus density has nowhere legitimate to go, so the model invents
structure to absorb it.

The technique is to treat the per-asset requested budget as an authoring decision made
per asset, distinct from the class ceiling that governs what may ship.

## The evidence

The measured case that settles the argument concerns hair, requested at three
densities from the same service on the same subject:

| Requested | Result |
| --- | --- |
| 1,500 quads | an unusable mess — not enough density to resolve the form at all |
| 3,000 quads | individual strands resolved; the correct answer |
| 6,000 quads | the generator invented an entire head that should not have existed |

The curve is non-monotonic with the optimum in the middle. That shape is the signature
of an instruction, not of a cap: a cap can only ever fail downward. Note also the unit
in that table — quads, as the service counted them — which is exactly why the authored
budget must be converted at the edge rather than compared to the service's numbers
directly.

A second observation from the same body of work: the better services *skip* spending
density on flat surfaces rather than adding loops there. Quality of the density
allocation is itself a discriminator between services, and it is visible only when you
commission the same subject at several budgets.

## Procedure

1. **Set the requested budget from the subject's complexity, not from its class.** Ask
   what density this shape needs to resolve its real features, and request that. The
   class ceiling is a bound on the answer, not the answer.
2. **Probe rather than guess for a new subject family.** Commission the same subject at
   three budgets spanning roughly a factor of four and look at all three. This is
   cheap relative to the cost of shipping a library of over-budgeted assets, and it is
   the only way to find the middle of a non-monotonic curve.
3. **Record the chosen budget with the asset**, so a regeneration reproduces the good
   result instead of restarting the search.
4. **Grade against what was requested**, so an over-generous request that produced
   invented geometry is visible as a delivery matching a bad instruction rather than as
   a pass against a distant ceiling.
5. **Do not spend budget on features geometry cannot carry.** Lettering, engraving and
   fine surface text are ignored or scrambled at every density — verified up to five
   figures of quads. Those belong in the material, and density spent chasing them is
   density spent making the mesh worse.

## Decision rules

- **When an asset is simple, request well under its class ceiling.** A crate does not
  get the prop maximum because it is a prop.
- **When output shows detail nobody asked for** — extra shells, invented anatomy,
  surface noise on what should be flat — suspect the budget before suspecting the
  prompt. Halve it and re-run before rewriting the description.
- **When output is mushy or unresolved**, raise the budget before adding words. Below
  the threshold where the form resolves, no prompt rescues it.
- **When two assets in the same class have very different complexity, they get
  different budgets.** One number per class, applied to every asset in it, is the
  policy this technique exists to replace.
- **When a virtualized-geometry renderer removes the runtime pressure**, the budget
  still matters, because it was never only a runtime constraint. It is what the
  generator was told to make.

## When not to use it

- **When the budget is applied by post-process decimation**, not at generation time.
  A decimator does not invent geometry to fill a generous target; there the budget
  really is only a cap, and the shaping argument does not apply. (This is also a reason
  to prefer telling the generator over cutting it down afterwards.)
- **When the process is deterministic authoring by a human or a script.** A modeller
  handed a generous budget does not invent a second head. The shaping effect is a
  property of generative processes that optimise toward a stated size.
