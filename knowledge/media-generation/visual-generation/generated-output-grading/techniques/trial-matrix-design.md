---
layer: technique
type: technique
subject: generated-output-grading
technique: trial-matrix-design
status: forged
laws: [unmeasured-is-not-pass, style-is-restated-not-remembered]
shared_with: []
use_when: [choosing a house style or a generator from candidates, building a reusable test set for image generation, a showcase render is being offered as proof of capability]
---

# Trial matrix design

A single beautiful render proves nothing — every candidate style and every
model can produce one, given enough rolls and a flattering subject. What a
production pipeline needs to know is whether a candidate holds up across the
*range* of problems it will actually face. The trial matrix is the instrument:
**a small set of briefs, each probing a different visual problem, crossed
against every candidate, every cell rendered and graded.** The output is not a
gallery; it is a grid that carries a judgement per cell, and the grid — which
candidate fails which *kind* of problem — is the finding.

## The trial axis: problems, not pictures

The design work is almost entirely in choosing the trial briefs, and one rule
governs it: **no candidate may be able to pass the whole set by being good at
one thing.** Each trial probes a distinct capability, so passing the row
requires range. A working taxonomy for factual visual work:

- **quantity** — a magnitude over time: can it plot a shape with intent?
- **inventory** — many discrete items at once: can it hold a set without
  clutter, keeping count and spacing?
- **analogy** — two unlike scenes juxtaposed: can it carry a concept across
  a split composition?
- **mechanism** — a closed loop with a reversal: can it draw causation, and
  countable structure inside it?
- **flow** — opposing streams meeting: can it show direction and congestion?

Five to seven trials is the working size. Fewer and a capability gap hides in
the gaps between probes; more and the matrix cost stops the second provider
run that flip analysis needs.

Two sourcing rules make the set honest. **Lift trials from real production
briefs** — a finished script, an actual delivered sequence — never invent
them for the test, because an invented set quietly avoids the shapes its
author suspects are hard, which are exactly the shapes the matrix exists to
probe. And **rotate or extend the set over time**: any fixed benchmark gets
optimized against, deliberately or through familiarity, and a prompt set the
whole team knows by heart stops measuring generalization.

## The candidate axis, and holding it still

The other axis is whatever you are choosing between — style blocks, models,
prompt scaffolds — and the discipline is single-variable: everything not
under test is held constant across the grid, including the grading schema and
the judge. When comparing styles, restate each style contract in full on
every call (consistency by restatement, not by memory); when comparing
models, the model must be an explicit run parameter, not a router's ambient
choice. A grid with two moving axes attributes nothing.

## Running it

- **Grade every cell** through the standing schema, veto field first. A cell's
  grade includes who graded it; ungraded cells are labeled, counted, and
  excluded from aggregates rather than defaulting to anything.
- **Multiple generations per cell before judging** when budget allows — one
  sample measures luck. The spread is the reading: a candidate that lands a
  check four of four is reliable; two of four is a coin. If budget forces one
  render per cell, say so, and treat single-cell surprises as hypotheses.
- **Resumable by construction.** The matrix is expensive and will half-fail;
  cells already rendered are skipped on re-run, and judgements are
  recoverable from disk without re-rendering. Keep the concurrency modest —
  the failure mode of guessing high against an opaque rate limit is a
  half-finished grid plus a cooldown.
- **Persist the grid as a durable index** keyed by every axis, with a free,
  re-runnable reader separate from the expensive builder. The index is what
  the next session experiments on; it outlives the images.

## Reading the grid

Read by row and by column before reading totals. A *column* that fails across
all candidates is a trial whose brief is bad — or genuinely frontier — and
either way it should not count against candidates until re-examined. A *row*
strong everywhere except one problem class is the characteristic finding: a
style that renders a beautiful chart and mangles a five-icon row is not a
house style, and one trial would never have discovered that. Totals come
last, and decisions made on totals alone forfeit the diagnosis the matrix
was built to give.

## When not to use it

The matrix is a selection and diagnosis instrument, not a per-batch quality
gate — production outputs are graded individually against their own briefs,
not against the trial set. Skip the matrix when there is only one candidate
and no decision (grade production directly), and when the candidates differ
on axes the grid cannot see — cost ceilings, licensing, latency — which must
be weighed beside the grid, not inside it. A matrix is also overkill for a
disposable one-off image; the discipline pays where the choice will govern
hundreds of future renders.
