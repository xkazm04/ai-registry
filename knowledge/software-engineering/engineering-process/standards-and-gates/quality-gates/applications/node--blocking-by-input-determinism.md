---
layer: application
type: application
subject: quality-gates
technique: blocking-by-input-determinism
stack: node
verified_on: 2026-09-04
verified_against: node@20
applied: simulation
ab_verdict: better
proof: structural-only
---

# Three variant-instrument checks, sorted twice (Node)

Read 2026-09-04 across three Node checks in three separate trees this registry
is connected to. The runtime recorded above is the lowest the three pin: two
of the trees pin node 20 in their pipelines (a major past its end of life
since April 2026), the third declares 22 in its version file and 20 in one
pipeline job; none of the three checks reads anything version-dependent, so
the drift is the pins', not the reading's. The technique's amended axis — grade on the input, then ask
separately whether the *instrument* is a function of that input — was walked
against each, alongside the unamended two-way split, to see whether the third
bucket changes any diagnosis. It changes all three, and in two of them the trees
had already reached the amended answer on their own.

## What was walked

Each check was sorted twice: once by the two advisory-nesses (debt-shaped, which
expires when the tree is cleaned; input-shaped, which is permanent), and once
with the third variance added. The falsifier was stated first: **if the two-way
axis is sufficient, these trees should have filed their variant instruments as
permanently advisory and stopped there.** None did.

## Case 1 — a purity check whose real test is a judgment pass

The bundle checker in this registry enforces a transplantability rule with a
literal-name denylist and states in its own output that the live transplant
test — handing the document to an agent in another context — is not statically
checkable.

- **Unamended:** the real test reads "something that changes without the
  repository: a model". Input-shaped, permanent, nothing to do.
- **Amended:** the input is perfectly still — a fixed document, a fixed rule.
  The variance is the judge's. The work is inside the gate, and it is nameable:
  pin the judge, or assert the mechanical part, or aggregate. The tree does the
  second, and the amended reading is what makes the remaining gap a *pending
  trigger* rather than a permanent condition.

## Case 2 — a benchmark harness that made its own instrument deterministic

A scoring-card benchmark in a consumer tree runs archetype cells through a
judge. The obvious grading is input-shaped: a model decides, so it can never
block.

What the tree actually did is the third remedy, thoroughly. Composition is
seeded by a hash of the cell id; there is no wall clock, no random source and no
network in the composition path; the schema half is split out into a separate
deterministic contract test whose own header says *no LLM, no fixtures, runs in
milliseconds*; and the judged half has a gate script that asserts. The split is
the technique's existing "split the invocation" move — applied not to separate a
deterministic *check* from a moving one, but to separate a deterministic
*instrument* from a judging one inside a single concern.

- **Unamended:** permanently advisory. The diagnosis would have written off a
  gate that demonstrably exists.
- **Amended:** pin-and-assert, reached and shipped. Correct.

## Case 3 — a lane certifier that judges the trend, not the run

A long-lane certifier in a third tree judges performance lanes against criteria
declared before the run. Its own header states the position in one sentence:
long lanes are certifications rather than gates, they run on their own clock,
they judge statistically, and the unit of value is the trend across runs rather
than the verdict of one. It carries a four-member verdict vocabulary in which
*could not see* and *could not run* are their own categories and neither is ever
counted as a pass, and its sibling flake checker aggregates across runs with an
explicit independence predicate — consecutive runs contribute only when their
commit shas match.

- **Unamended:** the input is the tree, so the axis says this may block. That is
  wrong, and wrong in the dangerous direction: a single run of a statistically
  varying instrument would be allowed to wall a correct change.
- **Amended:** the instrument is not a function of the input, so it may not
  block on one run — and the reachable remedy is aggregation, which is what the
  tree implemented.

## The result, and its limits

Three for three, and the third case is the one that matters most, because it is
the only one where the unamended axis gives an actively unsafe answer rather
than a merely pessimistic one. The two-way split grades the *supply* of the
input and says nothing about the *reading* of it, and a check can be a pure
function of a still repository and still answer differently twice.

`structural-only`. Nothing behavioural was run: the amendment changes a
diagnosis, and what was measured is whether the diagnosis matches what three
independent trees converged on. It does. **No code was changed in either
consumer tree, and none was warranted** — both had already arrived at the
amended prescription, which is the strongest evidence available for it and the
reason this row ships nothing.

## What this realization cannot do

- It cannot say how often the unamended axis is applied wrongly in the wild.
  Three trees that independently reached the right answer are three trees with
  unusually careful authors; the sample is biased toward the outcome.
- It measures no verdict distributions. The instrument that would make case 1
  measurable is a repeat harness over the judged transplant read — run the same
  document past the same judge N times and compare — and none of the three trees
  has one for its judged lane. That absence is this row's return condition.
- Case 2's determinism was read from the composition path and its own
  documentation, not proven by re-running the benchmark twice and diffing. The
  claim here is about how the tree is built, not about a measured stability.
