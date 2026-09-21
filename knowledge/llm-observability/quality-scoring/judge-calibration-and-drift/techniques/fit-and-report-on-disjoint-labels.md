---
layer: technique
type: technique
subject: judge-calibration-and-drift
technique: fit-and-report-on-disjoint-labels
status: forged
laws: [the-judge-is-both-untrusted-and-under-test, statistical-verdicts-or-no-verdict]
shared_with: []
use_when: [tuning a judge's instruction or examples against human labels, choosing a judge model or judging method on a golden set and then quoting its agreement, retrieving few-shot examples for a judge from labeled items, an alignment number rose after iterating on the same labels it is measured on]
---

# Fit and report on disjoint labels

The concern: the moment a human-labeled set is used to *change* the judge,
it stops being able to *certify* the judge. Every step that consults the
labels to decide what the judge becomes is fitting: searching over
instruction wordings for the one that agrees most, retrieving worked
examples from labeled items, iterating a rubric against the rows where the
judge and the human disagreed, and choosing one judge model out of several
by its score on the set. After any of them, an agreement figure computed on
the same labels measures how well the judge was fitted to those items, not
how it will read the next thousand. The golden set's authority rests on the
judge never having seen it, and fitting is the most direct way of letting
it see.

## Four ways the labels get consumed

- **Instruction search.** A population of candidate judge instructions is
  generated, mutated using the rows it got wrong, and ranked by agreement
  with the annotations. When ranking and reporting use the same
  annotations, the winning instruction's agreement is its training score.
- **Iterating by hand.** A person reads the disagreements, edits the judge
  prompt, and re-runs it. A published walkthrough of exactly this moved
  raw agreement from 75.6% to 86.9% on 160 labeled rows, and the 160 rows
  were both the error analysis and the result. The edit may well be an
  improvement. The number cannot say, because every row it is computed
  on informed the edit.
- **Retrieved examples.** Worked examples are chosen per call from labeled
  items by similarity to the input. If the item being scored, or its near
  duplicates, can be retrieved as its own example, the judge is shown the
  answer key. Excluding the item itself is necessary but not sufficient,
  because the report split must also be unreachable by retrieval.
- **Selection.** Picking the best of several judge models or judging
  methods by their score on the set is a fit with one parameter. The
  winner's score is biased upward by the selection itself, since the
  maximum of several noisy estimates overshoots the one it picked. On a set
  of a dozen items, a gap between two candidates can be mostly that
  overshoot.

## Decision rules

- **Split before the first fitting step, and never move an item across.**
  One part is the fitting set, which searches, examples and disagreement
  reviews may read. The other is the report set: the judge is scored on it
  once per candidate that will actually be used, and nothing about the
  judge changes in response. Size the report set for the agreement interval
  the trust verdict needs, not for what is left over, because
  [golden-set agreement](./golden-set-agreement-measurement.md)'s power
  rules apply to it alone.
- **Re-measure the winner.** A selection or search ends with one run of the
  chosen judge on the report set, and that run's chance-corrected agreement
  is the number that becomes the trust record. The selection score is
  logged as the selection score and never quoted as agreement.
- **Bind the selection direction to the loss.** A search that keeps the
  candidate with the highest loss is correct for agreement and F1 and
  exactly wrong for squared error. One working optimizer took the maximum
  over a loss family that included both kinds, so on a continuous judge it
  kept the candidate furthest from the humans. Another negated every loss
  before handing it to a search that maximizes, which is right for squared
  error and turns agreement into the thing being minimized. Each loss declares its orientation, and the search
  reads the declaration rather than assuming one. A search whose best
  candidate is worse on the report set than the unfitted baseline is the
  tell.
- **The unfitted judge competes to the end.** Carry the starting
  instruction into the final comparison on the report set. A search that
  scores only its offspring can return something worse than where it
  began, and nobody will see it.
- **Pair by identity, not by position.** When some judge calls fail and
  some human labels are missing, drop by item identity from both sides
  together. Filtering the human list and the judge list separately, then
  zipping them, shifts every later pair by one and produces an agreement
  figure for a set of items that were never compared.
- **A refit is a new judge.** Changed instruction, changed example set, or
  changed retrieval pool: the judge packet has a new version, its trust
  starts unknown, and history across the change is two series
  ([the-judge-is-both-untrusted-and-under-test](../../../_laws.md#the-judge-is-both-untrusted-and-under-test)).
- **Labels carry their criteria round.** Grading outputs changes what the
  graders think the criteria are: a study of assisted evaluator alignment
  observed that people need criteria to grade outputs and that grading
  outputs is how they define the criteria. Labels made before and after a
  criteria change are different instruments. A judge fitted to one round
  and reported on the other measures the drift, not the judge.

## When not to use this

A judge whose instruction and examples were written before anyone looked at
the labels, and that was never selected from alternatives on them, has
consumed nothing. Its golden set may certify it directly, and splitting it
halves the power of the only measurement that matters. The discipline
starts at the first change made *because of* what the labels said.

A paired comparison of two judging methods on the same set, reported as a
method delta, is also not fitting. The paired design is what makes that
delta clean. It becomes fitting when the comparison's winner is adopted and
the same set's agreement is then quoted as the adopted method's trust.
