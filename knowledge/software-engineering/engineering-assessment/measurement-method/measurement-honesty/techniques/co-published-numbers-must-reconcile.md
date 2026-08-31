---
layer: technique
type: technique
subject: measurement-honesty
technique: co-published-numbers-must-reconcile
status: forged
laws: [count-carries-predicate, derivation-names-recomputation]
shared_with: []
use_when: [publishing a summary statistic beside the distribution it was derived from, citing an association or correlation figure from an external report, a dashboard shows a total and its parts on one screen, deciding whether an outside number is strong enough to build on]
---

# Co-published numbers must reconcile

A number published alone is unfalsifiable — that is the premise this whole
subject rests on. But numbers are rarely published alone. A report that carries
a distribution table in one section and an association statistic in another, a
dashboard that shows a total beside its parts, a rollup that prints a rate next
to the numerator and denominator it came from: each of these has published not
a number but a **system of numbers**, and a system of numbers has constraints.

Those constraints are the cheapest audit that will ever be available for that
data — they need no access to the raw records, no re-collection, and no
cooperation from whoever produced them — and they are almost never run. Not by
the reader, and, more often than anyone expects, not by the publisher either.
The reason is structural rather than careless: the two numbers that contradict
each other were computed by different code, printed in different sections, and
reviewed by someone reading one page at a time. **The contradiction does not
exist inside either number. It exists only between them, and nothing in the
pipeline is looking there.**

## The bound is an identity, not a heuristic

The most useful constraint is also the most elementary. For any two properties
A and B over the same population, the fraction of items having *both* cannot
exceed the fraction having *either* one:

    support(A and B)  <=  min( P(A), P(B) )

This holds because the set of items with both properties is a subset of the set
with each. There is no sampling assumption behind it, no significance threshold,
and no model that could have been specified differently. If a document hands you
a joint frequency and anywhere else hands you a marginal, **one comparison
decides whether the joint can be true at all** — before you have formed any
opinion about whether it is interesting.

A worked case, because the shape is easier to recognize than to describe. A
cross-sectional study of seventy systems reported four association rows with
support, confidence and lift, having defined all three correctly one section
earlier. Its own distribution tables put the antecedent of the strongest row at
31% of the corpus; the row reported support 0.89. Support cannot exceed 0.31. A
second row reported 0.62 against an antecedent the study itself measured at
14.3% — over by a factor of 4.3 — and a third exceeded its antecedent under the
most generous reading available. Recomputing the strongest row from the study's
*own* conditional statement (100% of the isolated group against 23% of the rest)
yields support 0.31 and lift 2.13, against a reported lift of 3.4. That row had
been presented as the strongest relationship in the work, and the ordering it
justified was wrong as well.

Nothing here required doubting the authors, re-deriving their coding, or
obtaining their data. It required subtracting two published numbers. The likely
mechanism is mundane and worth naming, because it is the one to expect: **a
column was mislabeled** — some quantity that behaved like a confidence or a
similarity score was printed under a header that means joint frequency — and no
arithmetic between the two tables was ever run, because they lived in different
sections of one document.

## Enumerate the constraints your own publication creates

Do this once per reporting surface, at design time, and write the results down
as executable assertions rather than as a reviewer's checklist. Most surfaces
have fewer than a dozen, and they are usually obvious the moment someone asks:

- A part cannot exceed its whole; sibling parts over a partition sum to the
  whole, and the total row is checked rather than typeset.
- A joint cannot exceed either of its marginals.
- Shares over a partition sum to one — after rounding, with the rounding rule
  stated, because 99.9% and 100.1% are different bugs.
- A numerator never exceeds its denominator, and a rate derived from them is
  recomputable from the pair as printed.
- A declared lower bound is never greater than any point estimate of the same
  quantity, and never greater than a later, more complete measurement of it.
- A score's declared range contains every value reported on that scale.
- Two counts compared to each other carry the same predicate. A count is
  meaningless without its predicate
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)), and
  two counts with *different* predicates set beside each other in one table are
  a comparison the reader will make and the data cannot support.

The assertions belong beside the code that emits the numbers, not in the
template that renders them. A constraint checked at the render site is checked
once per surface and silently lost the first time a second consumer appears —
the same failure the sibling techniques in this subject keep meeting, and the
same fix.

## A metric must be evidenced by the object it is defined over

The second defect in that same table is subtler, more contagious, and survives
the bound check completely. Support, confidence and lift are defined over
**binary co-occurrence**: an item either has the property or it does not, and
each of the three is a ratio of item counts. Three of the four rows evidenced
them with a **difference of continuous mean scores** — 4.62 against 3.86 on a
five-point scale, 4.1 against 2.8, 6.2 against 2.3.

Those are two different objects, and neither can be computed from the other. A
mean-score gap can be wide where the binary co-occurrence is negligible, and a
near-total co-occurrence can sit under group means that barely differ. So the
figure in the column cannot have been produced by the evidence in the sentence,
and the evidence cannot support the figure. **Both directions fail, and no
amount of care about either number individually would have revealed it.**

The check is cheap and mechanical: **read the metric's definition, then read the
sentence offered as its evidence, and ask whether one operation could have
produced both.** If the definition counts items and the evidence averages
scores, the pair is broken regardless of which number happens to be right. The
same test catches a significance value evidenced by an effect size, a percentile
evidenced by a mean, a rate evidenced by a total, and a per-item cost evidenced
by a monthly bill.

This is
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
read from the outside. A derived value that names no invokable path back to its
inputs is a future discrepancy with no arbiter — and a published statistic whose
stated evidence is a different *kind* of object has named a path that does not
lead back to it.

## When a pair disagrees, you have learned about the pair

The most important operational consequence, and the one that gets skipped: a
failed reconciliation tells you that two numbers cannot both be true. **It does
not tell you which one is wrong.** Resist the reflex to trust the one that came
from the more careful-looking pipeline, or the one that matches expectation;
that reflex is how a real defect gets resolved in favour of the number that
caused it.

So the failure is reported as a pair. "The reported joint frequency of 0.89 is
inconsistent with the marginal of 0.31 published in the same document; at most
one of the two is correct" is a complete, honest and actionable finding. "The
joint frequency is wrong" is a guess wearing the same words. Where the
publication is yours, the pair blocks release until one side is traced. Where it
is someone else's, the pair is exactly what you write down, and it is enough: a
statistic that cannot be reconciled against its own document is not usable as
evidence, whether or not it is the erroneous half.

Two corollaries keep this from being over-applied:

- **An inconsistent statistic does not disprove the claim it was offered for.**
  It removes the evidence, which is a different and smaller thing. The study
  above may well be right that those design decisions travel together; what it
  no longer has is a measurement of how strongly. Say the narrower thing.
- **The check licenses nothing about numbers it cannot reach.** A figure with no
  co-published relative is exactly as trustworthy as it was before you started —
  which, per this subject's opening, is not very. Reconciliation is one
  instrument, not a verdict on a document.

## Failure modes of the naive reading

- **"That is a rounding difference."** A joint 2.9 times its marginal is not
  rounding, and the distinction is worth making explicitly, because the first
  response to any reconciliation failure is to reach for the smallest available
  explanation. Set the threshold from the instrument's measured noise band: a
  violation inside the band is a rounding question, and anything outside it is a
  defect until traced.
- **"They must define the term differently."** Then the definition has to be
  printed. A standard term used non-standardly without notice *is* the defect
  rather than an excuse for it — and in the case above the standard definitions
  were printed, one section earlier, and the numbers still violated them.
- **"Review would have caught something that basic."** This is precisely the
  class of error review does not catch. Both tables are individually well-formed,
  each is plausible on its own page, and the contradiction is visible only to
  someone holding both at once with a subtraction in mind. Basic and invisible
  are not opposites here; the check is trivial, which is exactly why nobody is
  assigned it.
- **"We will verify it at review time."** A reviewer reads a rendered document.
  The constraint is checkable only where both values exist in one process, which
  is upstream of every human who will ever see them.
- **"The headline conclusion was right anyway."** Possibly, and it does not
  matter for the decision in front of you. You are deciding whether to build on
  a number, and a number that fails its own document's arithmetic has no weight
  to lend, independent of whether the prose around it is sound.
