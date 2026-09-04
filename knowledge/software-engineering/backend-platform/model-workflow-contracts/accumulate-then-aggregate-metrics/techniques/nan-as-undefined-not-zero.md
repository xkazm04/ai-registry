---
layer: technique
type: technique
subject: accumulate-then-aggregate-metrics
technique: nan-as-undefined-not-zero
status: forged
laws: [unknown-is-not-a-value, count-carries-predicate]
shared_with: []
use_when: [a per-class score falls as a class becomes rarer, a reference mask is empty for some classes in some samples, a best-so-far comparator sees a not-a-number]
---

# Not-a-number as undefined, not zero

Some samples have no value for some classes. The reference contains none of the
class and the prediction contains none of it, so an overlap ratio is zero over zero;
there is no surface, so there is no distance to it; the denominator of a rate is
empty. The metric is **undefined** for that cell of the table, and the encoding of
"undefined" is the decision this technique owns: it is **not a number**, carried
through every reduction as not a number, with the count of defined cells returned
beside the figure.

## Three wrong encodings

Zero is the intuitive one and the worst. A model that correctly predicts the absence
of a class in a sample where it is absent has done its job perfectly, and a zero in
that cell says it failed completely. The per-class mean then falls with the class's
rarity across the set rather than with the model's quality, and a model evaluated on
a cohort with fewer occurrences of a rare class scores worse for reasons that have
nothing to do with the model. The failure is silent because zero is a legitimate
value for a defined cell, so nothing downstream can tell a true zero from an
undefined one
([_laws: unknown-is-not-a-value_](../../../../_laws.md#unknown-is-not-a-value)).

One is the opposite intuition — "correctly predicted absence is a perfect score" —
and it is a policy rather than a fact. It inflates the mean of a rare class toward
one for the same reason zero deflates it. Where a team genuinely wants absence
scored as correct, that is a named option on the metric, off by default, and the
cell it produces is a defined one; it is not the encoding of undefined.

Dropping the sample from that class's buffer is the subtle one. It gives the right
per-class mean and breaks everything else: the buffers are no longer aligned, the
case loses its row in the per-case report, and a per-sample reduction over classes
now averages over a different number of classes per sample without saying so. The
row stays; the cell is not a number.

## The reduction contract

Every reduction the accumulator performs is **weighted by definedness**: a mean is
the sum of the defined cells over the count of defined cells, a sum is over defined
cells, a percentile and a standard deviation are computed over defined cells only.
Each reduction returns two things — the figure and the count of cells it was
computed from — and the shape of the count follows the shape of the figure: a
per-class figure comes with a per-class count, a scalar with a scalar count
([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)).
A reader who sees a class scoring well and a count of three knows exactly what the
figure is worth; a reader who sees only the figure does not know there was anything
to know.

When the count is zero the figure is not a number, and it stays that way. Filling it
with zero "so the report has a value" reintroduces the original error one layer up.

## The case split

Undefined is precisely the case where the denominator is empty, and the split is
written into the metric rather than left to the reader:

- Reference empty, prediction empty: undefined. Not a number by default; a defined
  one only under the explicit option above.
- Reference empty, prediction non-empty: **defined**, and the value is zero. The
  model asserted something that was not there; that is a false positive and it is
  scored as one.
- Reference non-empty, prediction empty: defined, zero. A miss.
- Both non-empty: defined, the ordinary formula.

The second row is the one teams get wrong in the other direction — treating any
empty reference as undefined lets a model that hallucinates a class everywhere
escape without a penalty. The rule is the denominator, not the reference.

## Contagion downstream

Not-a-number is the right encoding because it propagates: any reduction that is not
aware of it returns it, which is loud, where a zero would be silently wrong. The
cost is that every consumer must be aware. The mean and sum are; the percentile
must use its not-number-aware form or it interpolates across the marker and returns
it for the whole column; the standard deviation must use the same count the mean
did; a report writer prints the marker rather than a blank or a zero. And the
comparator that decides whether this pass's figure is the best so far must treat a
not-number as **not an improvement** — a naive "greater than" comparison is false
for it, which happens to be safe, but a "not less than" comparison is also false,
and a "changed since last time" check can pass. State the rule: a not-number never
replaces a defined best, and a defined figure always replaces a not-number best.

Where the value type has no not-a-number — integer counts, a boolean rate — the
principle holds and the encoding changes: an optional, a mask carried beside the
table, a sentinel that cannot collide with a legitimate value. The float marker is
the convenient case, not the doctrine.

## When not to use it

A metric formed from additive counts — the confusion cells summed over the set and
the rate taken once at aggregate — has no undefined cell at append: an empty
reference contributes zeros to the counts, which is correct, and the undefined case
appears at the ratio, where it is handled by the same rule. There the per-cell
marker would be wrong, because a zero count is a defined zero. The technique applies
where the per-sample value is itself a ratio or a distance; where the per-sample
value is a count, the undefined case is deferred to aggregate and encoded there.
