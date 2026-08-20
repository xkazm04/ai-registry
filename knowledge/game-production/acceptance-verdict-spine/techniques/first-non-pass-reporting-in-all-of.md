---
layer: technique
type: technique
subject: acceptance-verdict-spine
technique: first-non-pass-reporting-in-all-of
status: forged
laws: [unmeasured-is-not-a-pass, structural-proof-is-never-sufficient]
shared_with: []
use_when: [composing several checks into one unit verdict, a reason on screen cannot be attributed, deciding what an operator sees when five sub-checks fail]
---

# First non-pass reporting in an all-of

The named concern: **when a unit's verdict is a conjunction of several checks and more
than one is unsatisfied, exactly which reason does the operator see?**

## The rule

Run the members in declared order, forwarding the same data and context to each.
Return the **first non-pass** result — its status, its rung, its reason, whole and
unedited. When every member passes, return the first result, whose label and rung
stand in as the unit's headline verdict.

Then do the one thing that makes it usable: **name the member that spoke**, wherever
the reason is displayed.

## Why first-non-pass beats the alternatives

**Versus a count.** "Three of five checks failing" is a progress bar, not an
instruction. It tells the operator how much work remains and nothing about what to
do. There is no action whose first step is the number three.

**Versus a concatenation.** Joining every failing reason produces a paragraph whose
sentences belong to *different rungs of evidence* — a missing field, an out-of-band
budget, and an unrun runtime gate read as one complaint. The operator picks whichever
sentence they understand, which is usually the shallowest, and fixes that. Worse, the
composite has no single rung and no single deciding authority, so it cannot be
attributed and cannot flow through the rest of the spine as a verdict.

**Versus the worst-severity member.** Tempting and wrong, because it requires a total
order over statuses that does not exist. Failed and not-measured are not ranked; they
are different epistemic states
([unmeasured is not a pass](./../../_laws.md#unmeasured-is-not-a-pass)). Any severity
ordering you invent will eventually rank one above the other and start hiding
deferrals behind failures, or the reverse.

**First-non-pass** gives one reason, at one rung, attributable to one member, with a
deterministic answer that does not change when an unrelated member is added at the
end. Determinism is what lets an operator, a test, and a dashboard agree.

## Ordering is authorship

Because the first non-pass wins, **the declaration order is a design decision**:

- Put the **cheapest and most fundamental** check first. A unit missing its data
  should say so, not report a budget violation computed over nothing.
- Put checks in **dependency order**, so a reason never presupposes a condition an
  earlier member would have caught.
- Put the **expensive or context-dependent** members last. They are also the ones most
  likely to degrade when context is absent.

The order is not an implementation detail to be sorted alphabetically by a formatter.

## Naming the member

A composition returns one member's result, so the rung and the reason on screen belong
to whichever member spoke — and by default nothing says which. That silence reliably
sends people to fix the base check when an invariant is what spoke.

Record the members on the composition when it is built — non-enumerable metadata,
invisible to existing consumers, grading untouched — and let the explanation surface
read them back, re-run them, and flag the one whose index matches the first non-pass
(or index zero when all pass). This costs nothing at grade time and gives every
composed unit a member-level breakdown on demand. See `explain-why-this-verdict`.

## Decision rules

- **When a member is not-measured and a later one fails, the not-measured member
  still speaks** — it came first, and the composition's answer is honest: the unit's
  standing is unknown at that rung, which is not the same as failing.
- **When all members pass, return the first result rather than a synthesised one.** A
  fabricated aggregate has no author and no rung.
- **When a member needs context that may be absent, it degrades to not-measured, never
  to a failure** — absent context must not regress a satisfied unit.
- **When a composition is itself a member of another composition, the rule applies
  recursively** and the reported reason stays a leaf's reason. Do not summarise at
  each level.

## When NOT to use this

- **Disjunctions.** For "any of these is acceptable", the first non-pass is
  meaningless; report the reason only when *all* alternatives failed, and then report
  all of them, because the operator genuinely has a choice of remedies.
- **Batch validation surfaces.** A form or an import report wants every violation at
  once, keyed to its own field. That is a different product: many verdicts, not one.
  Do not compress it into a unit verdict, and do not expand a unit verdict into it.
- **Scored rubrics.** Where the output is a graded score across weighted dimensions,
  conjunction is the wrong combinator entirely — every dimension contributes, and
  suppressing all but the first destroys the measurement.
