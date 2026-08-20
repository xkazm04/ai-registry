---
layer: technique
type: technique
subject: scoring-rubrics
technique: rubric-stability
status: forged
laws: [gate-sees-target, one-authority-per-vocabulary]
shared_with: []
---

# Rubric stability

The moment a score is stored, compared over time, shown to more than one
person, or computed in more than one place, the rubric stops being an
implementation detail and becomes an **interface** — and interfaces are
pinned, or they drift. Rubric drift is nastier than most interface drift
because the output stays a plausible number: nothing crashes, no consumer
breaks, the rankings just quietly stop meaning what everyone believes they
mean.

## Golden fixtures: the rubric's own examples, hand-verified

The foundation is a small set of **golden fixtures**: complete input
vectors with the expected composite, per-dimension breakdown, and gap
ordering — each verified by a person once, then enforced by a test forever.
Fixtures are chosen adversarially, one per honesty rule the rubric claims:
the all-measured happy path; the partially measured entity (renormalization
and coverage disclosure); the below-coverage-floor entity (refusal to
score); the inverted-polarity dimension at both extremes; values beyond the
clamp anchors; the tie that exercises the deterministic tie-break; the
cohort edge (single-member cohort, all-identical cohort) if normalization
is cohort-relative. A rubric with only happy-path fixtures is pinned only
where it was never going to break.

Assert on the **full explanation object** — breakdown, coverage, gap order
— not just the final scalar. Two wrongs multiplying into a right scalar is
a real and observed failure shape; the breakdown is where compensating
errors become visible.

## Twin implementations get a parity gate, not good intentions

When two runtimes must both compute the rubric — one aggregating and
persisting, one previewing interactively — the duplication is a standing
liability that comments cannot discharge. "Keep in sync with the other
side" is a wish; the same golden fixtures, executed against **both**
implementations with outputs compared to agreed precision, is a gate. The
gate must actually run both twins on the shared fixtures
([gate-sees-target](../../../../_laws.md#gate-sees-target)): a test suite that
exercises each twin separately against its own expectations verifies two
rubrics exist, not that one rubric exists twice. Fixtures live in a
neutral, both-sides-readable format, and the parity check runs wherever
either twin can change. Where the platform allows it, the stronger move is
to delete the twin — one implementation, one caller importing it — and the
parity gate is the honest fallback where it does not.
Same-language re-derivations count as twins too: a summary tile, an export,
and a detail view each re-implementing the composite are three twins with
no gate — the rubric is one authority
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
and every surface derives from it.

**A surface that describes the bar is a twin of the bar.** When a rubric
feeds a threshold policy, that policy gets rendered in several shapes at once
— prose conditions on a dashboard, a line in an automated review comment, a
query the badge endpoint accepts, a configuration snippet teams paste into
their pipelines. Written as four renderers, they drift, and the drift is
asymmetric in the worst direction: the advertised bar quietly omits a
condition the gate still enforces, and subjects are failed by a rule nobody
told them about. The structural fix is one **ordered enumeration of
conditions**, each carrying its own projections (its sentence, its short
form, its parameter, its configuration line), with every surface derived by
mapping over it. A condition that legitimately has no projection for some
surface says so in the enumeration — an explicitly absent field, not a
silently shorter parallel list.

Parity of *inputs* is the second half, and it is where this fails in
practice. A dashboard that evaluates the policy from stored aggregates while
the enforcing gate evaluates it from a full assessment is running the same
rules over different evidence: a condition whose input the aggregate does not
carry is skipped, so the dashboard reports a subject as passing that the gate
blocks. Both readings must be given the same fields, a skipped-because-not-
measurable condition must be visibly skipped rather than silently passed, and
the shared fixtures are run through both paths — the aggregate-based reading
of a policy is a twin implementation like any other.

## Version the rubric; stamp the scores

Every material change — a weight, a dimension added or retired, a
normalization anchor, a curve, the coverage floor, the tie-break — bumps a
**rubric version**, and every stored score carries the version that
produced it. This is what keeps history interpretable: a trend line that
crosses a version boundary either recomputes the old inputs under the new
rubric (when raw inputs are retained — the strongly preferred posture,
since stored composites are cheap to re-derive but raw inputs are
irrecoverable) or renders the boundary visibly. An unmarked splice
manufactures a step change that will be investigated as if it were real —
or worse, celebrated.

Version the *artifact*, not the deployment: the version lives beside the
weights in the rubric declaration, so no change to the declaration can
ship without touching the line a reviewer reads.

## What is score-moving, and what the pin cannot see

The version only works if "material change" is written down rather than
re-litigated per diff. The generic mechanics of a versioned assessment
contract — the enumeration of moving versus cosmetic changes, folding the
version into every cache key so a bump invalidates atomically, and pinning
the surface with a hash so the bump decision lands in the same change as the
edit — are the
[ladder-versioning](../../../../engineering-assessment/maturity-and-conformance/maturity-ladders/techniques/ladder-versioning.md)
discipline, and a rubric adopts them unchanged. What a rubric adds is the
*list*, because a composite has knobs a ladder does not:

- dimension weights, in the base vector and in **every lens**;
- the dimension set — added, removed, renamed;
- normalization anchors, curves, clamps, and polarity;
- the coverage floor and the absence policy;
- band boundaries, and any posture or threshold cut derived from the score;
- the blend weight when a composite mixes a deterministic score with a judged
  one, and the bound that clamps how far the judgment may correct the signal;
- the criteria text handed to any judge, and the instructions surrounding it;
- **the point tables inside individual detectors** — the calibration that
  decides what a raw signal is worth before the rubric ever sees it.

That last entry is the one that gets missed, and it generalizes into a rule
about the pin itself: **a hash can only cover what it can reach.** Detector
calibration, scoring tables, and prompt fragments usually live far from the
rubric declaration, so the pin stays green while they move the scores. Write
the exclusions down *at the pin* as a standing instruction — "these also
require a bump and this test cannot see them" — because a team that reads a
green pin as proof no bump was needed is worse off than a team with no pin,
having replaced a habit of judgment with a false clearance.

The framing that settles the borderline cases: **a bump asserts
non-comparability, not incorrectness.** The usual reason a bump is skipped is
a well-argued proof that the change is score-neutral — a prompt edit that
only constrains punctuation, an input nothing reads yet. That proof is often
right and beside the point: a stored score carries the configuration that
produced it, and if the configuration is not that configuration, the two are
not comparable however the numbers land. Bumping on a score-neutral change
costs one recompute; skipping it costs the meaning of the series. The
question is not "did the answer change?" (unknowable in advance) but "did the
inputs change?" (readable in the diff).

A per-bump changelog line, in the declaration, is what makes an old stored
score interpretable years later — what moved, and why it counted. The best
entries are the ones that argue with their own predecessors: a bump taken
because an earlier re-pin was justified by reasoning that covered part of the
change and not the rest. That correction, written at the version rather than
in a commit message nobody will find, is how the enumeration above stops
being a list and becomes a practice.

## Changes are re-baselined deliberately

A rubric change is a policy release, not a refactor. The minimum ritual:
run the new rubric against the current cohort **before** merging and read
the diff in *rankings*, not scores — who moves up, who moves down, does the
recommended next action change for anyone. If the reshuffle is intended,
that diff is the change's review evidence; if it is surprising, the change
was not understood. Fixtures are then re-verified by a person (they encode
the old policy by construction — a fixture update without a human read is
the pinning test approving its own change), and the version bump, the
ranking diff, and the rationale travel together in the change record.
