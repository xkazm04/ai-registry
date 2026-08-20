---
layer: technique
type: technique
subject: scoring-rubrics
technique: weight-lenses
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [one rubric grades unlike populations, small subjects score badly for missing infrastructure, adding a dimension to a rubric that has per-class weights]
---

# Weight lenses

One rubric often has to grade genuinely unlike subjects: a two-person effort
and a platform team, a prototype and a regulated service. Judged under one
weight vector, the small subject loses points for infrastructure it has no
business owning, and the ranking reports a fact about *scale* while claiming
to report a fact about *quality*. The two bad escapes are equally common —
soften the vector until it flatters everyone (and it now discriminates
nothing at the top), or fork the rubric per class (and the scores stop being
comparable at all, because the dimensions themselves diverged).

A **lens** is the third option, and it is a strict structure: **one dimension
set, one normalization, one banding — several weight vectors, selected by the
population the subject belongs to.** Everything that makes scores comparable
stays fixed; only the *importance* budget moves. A lensed score therefore
still means "quality against the same named dimensions", and the lens is a
declared statement of what that population is fairly expected to invest in.

## The invariant: lenses vary weight, never vocabulary

If a lens adds, removes, or renames a dimension, it is not a lens — it is a
second rubric, and the composites it produces do not belong on the same axis
as the first one's. The dimension set is a closed vocabulary with exactly one
authoritative definition
([one-authority-per-vocabulary](../../_laws.md#one-authority-per-vocabulary));
lenses are alternate readings of it, so:

- every lens declares a weight for **every** dimension, including the ones it
  considers irrelevant (see the zero rule below);
- every lens sums to the same stated total, and the check is per lens, not
  once over the union;
- lenses live in one declaration beside the dimension set, so the vectors can
  be read as columns — which is the only way anyone can review the claim that
  actually matters: *what this population is excused, relative to the others*.

Comparing scores **across** lenses is a real limitation and it needs saying at
the surface, not in a comment. Two subjects under different lenses were graded
against different importance budgets; a mixed leaderboard is defensible only
if the reader can see which lens each row was judged under. The lens label
travels with the score exactly as coverage and rubric version do — and it
carries a one-line explanation of what it changed, because an unexplained
class label on a report reads as a demotion.

## Selecting the lens is itself a scored decision

The classifier that picks the lens is part of the rubric's attack surface: it
decides which budget applies, so a wrong classification moves the composite
more than most dimension errors do. Three rules:

- **The classifier is declared and versioned with the weights.** Its inputs
  and thresholds are score-moving knobs — a change to who counts as "small"
  re-scores a population without touching a single weight.
- **Classification is conservative toward strictness where the score confers
  standing.** When the evidence for the more forgiving class is weak, grade
  under the stricter lens; the alternative rewards ambiguity, and ambiguity
  clusters exactly where a subject would prefer the easier grade.
- **The fallback is named, not incidental.** An unrecognized class must
  resolve to a *declared* default lens, and which lens that is, is a policy
  statement. Falling through to whichever vector happens to be first in the
  structure is an unowned decision that will be discovered by a subject
  reading a bad score.

## A zero weight is policy; a missing weight is drift

The two look identical in the arithmetic and mean opposite things.

- **Zero** is a decision: *this dimension does not count for this population.*
  It was typed deliberately, it is reviewable beside its neighbours, and it
  belongs in the vector precisely so a reader can see the exemption.
- **Missing** is a bug with a specific cause: a dimension was added to the
  rubric and one lens was not updated. The dimension then vanishes from that
  population's headline — silently, because a lookup that returns nothing and
  a lookup that returns zero contribute identically to a weighted sum.

So the lookup is not a plain index into the vector. It distinguishes the two
cases and treats the missing one as a fault: warn loudly, or fail the load
outright, and never let absence pass as a considered zero
([failure-not-empty-success](../../_laws.md#failure-not-empty-success)). This
is the single highest-value line of code in a lensed rubric, because the
defect it catches is otherwise invisible: nothing crashes, no dimension
errors, one population's score simply stops including a dimension everyone
believes it includes.

The rule generalizes to the review path: adding a dimension is not one edit,
it is *n* edits — the dimension plus one weight in every lens — and the sum
invariant is what forces the arithmetic half of that conversation while the
missing-weight fault forces the completeness half.

## Assert the invariant on the vector that is actually used

The classic near-miss: a startup check that validates the *base* vector while
scoring runs on the lenses. Every lens can be malformed and the check stays
green, because it never looked at the values the engine reads
([gate-sees-target](../../_laws.md#gate-sees-target)). Validate every vector
the selector can return, including the fallback, and run the check where a
misconfiguration cannot be missed — at load in development and in the test
suite, so the failure lands on the person editing the weights rather than on
a production reader holding a deflated number.

Defensive renormalization at the summation site (dividing by the weights
actually present rather than by the declared total) is correct and should
stay — a malformed vector must not deflate anyone's score. But it is a
containment measure, not a check: renormalizing quietly repairs the symptom,
which is exactly why the loud invariant has to sit above it. Silent
correctness is how a broken vector survives for a quarter.

## When not to use lenses

Do not reach for a lens when the real complaint is that a *dimension does not
apply* to a subject — that is an exemption, and it belongs to the
measured/absent machinery (the dimension is not measurable for this subject,
excluded from the denominator, disclosed), not to a whole alternate vector.
Do not add a lens per subject-shaped special case either: lenses are
populations, and a population with one member is an exception being laundered
into policy. Two or three lenses with defensible boundaries are a rubric that
grades fairly; seven are a rubric whose author could not defend a single
weight and delegated the argument to classification.
