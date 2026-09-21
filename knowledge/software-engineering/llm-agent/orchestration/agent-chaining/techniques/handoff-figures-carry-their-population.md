---
layer: technique
type: technique
subject: agent-chaining
technique: handoff-figures-carry-their-population
status: forged
laws:
  - count-carries-predicate
  - gate-sees-target
shared_with: []
use_when: [a number produced by one link is read by the next as an input to arithmetic, a downstream link computes a ratio or return figure over a total handed to it, a running total rides the handoff payload and a guard compares it against a limit, a chain fans out and a figure accumulated along one path is described as the chain's, two surfaces show the same named figure and disagree, a composite workflow passes a headline number into a narrower specialist step]
---

# Handoff figures carry their population

[Handoff payload contracts](./handoff-payload-contracts.md) make what crosses
an arrow declared, bounded and stamped. None of that says what a *number*
inside the envelope measured, and a well-formed envelope carries a wrong
number as easily as a right one. Every figure a link emits is a count, a sum
or a rate **over some population**: this company's ledger, this storefront's
orders, this path's hops, this week's rows. The receiving link reads the
digits and not the population, so it uses the figure as if it measured the
receiver's own world. When the two populations differ, the arithmetic is
valid and the answer is fiction.

## Two shapes, one mistake

**A total becomes a narrower link's denominator.** A composite workflow reads
the quarter's revenue from the ledger and hands it downstream so that "every
step steers by one number." A marketing link then computes return on ad spend
over it. But the ledger covers the whole business, and the ads could only
reach the online slice, which here is about 2% of it. A campaign returning a
real 4.7 reports 194, because the denominator is roughly forty times too
large. The figure is enormous, flattering and entirely unreal, and it is the
one the owner budgets from. The tell is a ratio an order of magnitude better
than the field allows. Nobody checks what went in the bottom, because the
number came from the system of record.

**A path total is checked against a tree-wide limit.** A chain carries its
running spend in the payload: each hop adds its own cost to the figure it
received and forwards the sum. In a straight line that is the chain's spend.
Once the chain fans out it is not, because two sibling branches never see
each other's cost. Each branch carries the spend of its own ancestry, and a
cost ceiling described as halting "the whole cascade" is compared against
one path of it. The ceiling holds exactly while nobody fans out, which is
when it matters least. [Chain identity and
rollup](./chain-identity-and-rollup.md) already says the budget guard wants
every link's spend summed to the chain id. What it did not say is that the
handoff-carried running total is wrong under fan-out *without any crash*. No
write failed; the figure simply measured a different population.

The two cases look nothing alike, and they are the same mistake: a figure
that was true of its own population was read as true of the receiver's
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)
applied at the seam).

## The rule

> **A figure crosses a handoff with its population named. The receiver may
> use it in arithmetic only when that population is the one the receiver
> measures. Otherwise it crosses as labelled context, never as an operand.**

Concretely:

1. **Stamp the population beside the value.** A payload field is not
   `revenue: 971794`. It is the value plus the population it covers (the
   ledger, all channels, the quarter) in a form the receiver can compare.
   A guard's running total is labelled with the population it summed: this
   path, this trace, completed hops only.
2. **The receiver checks the population before it divides by the figure or
   compares it.** A ratio is computed against the base the receiving link
   can actually reach. When the handed-down total is broader, the receiver
   fetches its own base (the online revenue, the chain-wide sum) and reports
   both: *"Online revenue was 23,653 of the quarter's 971,794; return is
   against the online figure, because that is all these campaigns could
   touch."* One sentence, and the reader weighs the number correctly.
3. **A limit reads the population it governs** ([gate-sees-target](../../../../_laws.md#gate-sees-target)).
   A ceiling on a tree is checked against a figure summed over the tree, from
   the rows every branch writes. It is never checked against a total one branch
   happened to carry. When the tree-wide sum can be late (a link not yet
   recorded), take the larger of the carried and summed figures. That can only
   tighten the guard, never loosen it.
4. **One name, one population.** When a live view shows "chain spend" as the
   maximum over paths and a detail view shows it as the sum over every trace,
   the product has two figures under one name. At most one of them is the
   chain's spend. Rename the other or delete it.

## How to find it

The failure never throws, so look for it structurally:

- **Grep for figures read from the payload and fed into a comparison or a
  divide.** Each is a seam where the populations could differ. Ask what the
  emitter summed over, and whether the receiver's limit or ratio is about the
  same set.
- **Look for a sibling guard that already counts the right population.** A
  breadth guard that counts links across the whole trace, beside a cost guard
  that reads a path-carried figure, is the fingerprint. The repository
  already knows the tree-wide query and used it for only one of the two
  axes.
- **Distrust a figure that only ever grows along an arrow.** A running total
  incremented at each hop is path-shaped by construction. It is correct for a
  line and wrong for anything with a fork.

## What this does not settle

- **Which population a figure *should* measure.** That is the product's
  decision. This rule only makes the decision visible and forbids the silent
  swap.
- **In-flight spend.** A tree-wide sum over recorded links still misses work
  that is running and not yet booked. Reserving spend at admission is the
  guard's other half, and [cycle and depth
  guards](./cycle-and-depth-guards.md) owns it.
- **Unit and currency mismatches.** Those are schema problems, and the
  envelope's validation door catches them. A population mismatch passes every
  type check, which is why it needs its own rule.

## Decision rules

- Every numeric payload field names its population; a guard's running total
  names whether it is path- or tree-scoped.
- A receiver divides or compares only against a figure over its own
  population; a broader figure is shown beside the result as context.
- A limit on a tree reads a sum over the tree, and takes the larger of the
  carried and summed figures while the sum can lag.
- A ratio an order of magnitude better than its field allows is a
  population check before it is a finding.
- Two surfaces showing one named figure must agree, or one of them is renamed.
