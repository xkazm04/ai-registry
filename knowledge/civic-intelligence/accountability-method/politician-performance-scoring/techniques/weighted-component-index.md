---
layer: technique
type: technique
subject: politician-performance-scoring
technique: weighted-component-index
status: forged
laws: [deterministic-code-owns-numbers, one-definition-one-import, provenance-or-nothing]
shared_with: []
use_when: [designing a composite effort score from registry activity data, choosing and publishing component weights, exposing sub-scores for auditability]
---

# Weighted component index

A composite score over elected officials is a weighted sum of independent
activity components, each normalized before weighting so the number means the
same thing for every person in the population. The technique is less about the
arithmetic — which is deliberately trivial — than about the discipline that keeps
a trivial formula defensible: independent dimensions, honest denominators, round
published weights, and full decomposition on every surface.

## Choosing components

Each component captures a *distinct channel* of observable work, attributable to
one person from registry data alone. A workable set for a legislative chamber:
breadth of committee engagement, voting participation, attendance, legislative
output (instruments authored, formal questions filed), floor presence, and a
leadership term for chairing bodies. Decision rules:

- **One fact, one component.** If two components move together by construction
  (committee membership and committee leadership drawn from the same rows), split
  them explicitly and dedupe their shared identity — do not let one underlying
  fact pay twice. Keep role weighting in its own component: chairing a body earns
  the leadership term, but must not inflate the breadth count, or chairing one
  body outranks serving on two.
- **Registry-attributable or excluded.** A dimension you cannot compute for the
  whole population from source data is not a component; it is a future footnote.
  Media mentions, "influence", and quality judgments are out — not because they
  do not matter, but because the index's claim is narrowed to what deterministic
  code can attest.
- **Independent denominators.** Rates are normalized to what the person *could*
  have done: ballots over roll calls their mandate could vote in, absences over
  sitting days of their actual tenure. A shared global denominator quietly
  converts the index into a tenure ranking.

## Weights

Weights are few, round, sum to a round total (100 is conventional because the
composite then reads as a percentage-like score), and are ordered by a stated
editorial judgment about which channel is most load-bearing. Two rules:

- **Weights are published constants with one definition.** Every consumer — the
  scorer, the methodology page, the reader-facing decomposition, any share
  artifact — imports the same declarations. A weight restated as a literal in
  explainer copy is a future lie: the constant gets tuned, the copy does not.
- **Do not fit weights to an outcome.** Weights tuned so that a preferred
  ordering emerges are an editorial ranking laundered through arithmetic. Choose
  them from the stated theory of the index, before looking at who lands where,
  and change them only through the published-correction path.

## Decomposition is not optional

The composite renders with its component sub-scores, each also published, each
re-derivable from the person's raw counts and the published caps. Two subtleties
that only bite after launch:

- **Published precision must round-trip.** If surfaces re-derive component points
  from stored rates, store the rates at enough precision that the re-derived
  parts agree with the published whole — a rate stored at one decimal can make
  the visible parts disagree with the visible total by more than a point, which
  reads as a bug in the arithmetic the whole product rests on. Measure the
  worst-case reconstruction error and state the rounding note where parts are
  summed.
- **Translate points back to native units.** "14.2 legislative points" is
  meaningless to a reader; "3 instruments authored, cap at 4, chamber median 1"
  is auditable. Publish, per component, the person's value in its own unit, the
  cap, the population median over people who *have* the value, and the headroom
  — all derived, all labeled as derived, none stored separately where they could
  drift.

## When not to use this

Do not build a weighted composite when the honest product is the component table
itself — a composite exists to support ranking, and ranking is only defensible
when the components share a population, a period, and a normalization. Do not
composite across chambers or terms with different rules (see the subject's
fairness technique). And do not add a component you cannot explain in one
sentence with its denominator; every component is one more surface the method
must defend.
