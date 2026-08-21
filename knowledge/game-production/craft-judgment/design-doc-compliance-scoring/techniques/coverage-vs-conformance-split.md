---
layer: technique
type: technique
subject: design-doc-compliance-scoring
technique: coverage-vs-conformance-split
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [designing a compliance or readiness metric, a dashboard number that moves for reasons nobody can explain, splitting a percentage that mixes measurement with reach]
---

# Coverage / conformance split

## The concern

Any single percentage over a design surface is a ratio whose numerator and denominator have
been chosen quietly. Two different questions are hiding inside it — *how much of this did we
look at* and *of what we looked at, how much was right* — and they have different
denominators, different owners, and different remedies. Collapsing them means a fall in one
can be masked by a rise in the other, and no reader can tell which lever to pull.

## The split

Compute both, from the same row set, in one pass:

```
coverage    = items with a verdict / items in scope
conformance = credit earned        / items with a verdict
```

The denominators differ on purpose. **Coverage** is about reach and is fixed by running
scans and reviews. **Conformance** is about quality and is fixed by building things. An item
with no verdict appears in coverage's denominator and in *neither* of conformance's terms —
it is a coverage fact, not a quality one, and putting it in the conformance denominator
manufactures a quality figure out of ignorance.

Credit within conformance may be graded — fully-done and improved-beyond-spec both earn
full credit, a partial implementation earns half, an absent one earns zero — provided every
credit band corresponds to an actual verdict somebody issued. Half credit for "partial" is
legitimate because someone judged it partial. Half credit for "unknown" is imputation.

## Split at the type level, not the presentation level

This is the load-bearing rule. If the report object carries one score field, the information
is already destroyed and no downstream rendering can recover it. The scoring function
returns an evidence record — items in scope, items measured, coverage, conformance,
measured-or-not — and the headline field carries conformance *only*, defined as meaningless
without the record beside it.

The practical test: can a consumer of your report render "not measured" without inventing
anything? If it has to infer that from a low score, you have not split; you have renamed.

## Coverage becomes a confidence band, not a tint

Coverage is more useful to a reader as a named band than as a decimal, because a band can be
said out loud in a sentence: *this conformance figure is backed by high / moderate / low
coverage*. Bands used on a real surface: high above 75%, moderate from 34%, low below.
Reserve a distinct band — call it **none** — for "no measured item at all", and give it
precedence over the numeric bands. None is not a low confidence; it is the absence of a
confidence, and the conformance number beside it must not be rendered as a number.

Name the band rather than encoding it as a colour or an opacity on the score. A tinted
number is still read as a number; a labelled one carries its own caveat wherever it is
copied, including into a screenshot in a status deck.

## Rolling up without lying

Aggregating areas into a project figure re-runs the same trap one level up. Rules:

- **Roll up the raw counts, then recompute** — sum items-in-scope and items-measured across
  areas and derive the parent coverage and conformance from the totals. Averaging child
  percentages weights a two-item area equally with a two-hundred-item one.
- **Exclude unmeasured areas from the conformance roll-up entirely**, and state their count
  separately in the header. An area with no evidence contributes to how much is unknown, not
  to how good things are.
- **Preserve the evidence envelope across the roll-up** — the parent's oldest and newest
  evidence timestamps and its undated count are the extremes of its children's, not fresh
  values generated at roll-up time.
- **Order the output so absence cannot bury failure.** Sort measured areas first, worst
  conformance first — the triage order — with unmeasured areas after. A wall of
  no-evidence cards at the top of a list is how a real failure goes unread for a quarter.

## Decision rules

- When a stakeholder asks for "one number", give conformance **and** coverage as a pair and
  refuse to multiply them. The product is a third quantity with no interpretation: 50%
  conformance at 100% coverage and 100% conformance at 50% coverage are wildly different
  situations that produce the same 0.5.
- When coverage is below the lowest band and someone wants the score anyway, report the
  conformance with its item count in the same breath — "4 of 61 measured" — so the basis
  travels with the figure.
- When a new item is added to the design, coverage must **drop**. If your metric rises or
  holds when the surface grows without evidence, the denominator is wrong.
- When coverage reaches 100%, conformance and the old single number finally agree. That is
  the only situation in which the naive metric was ever correct, and it is why it survived.

## When not to use this

- **A closed surface where every item is measured by construction** — a compiler's own error
  list, a test suite's pass rate — has coverage pinned at 1 and the split is ceremony.
- **Sampled populations** where the sample is drawn deliberately and is representative:
  there the right pair is an estimate and an interval, not coverage and conformance;
  coverage of a random sample is a property of the sampling plan, not a finding.
- **Live counters** with sub-second churn, where any denominator is stale before it renders
  — those need a rate, not a ratio.
