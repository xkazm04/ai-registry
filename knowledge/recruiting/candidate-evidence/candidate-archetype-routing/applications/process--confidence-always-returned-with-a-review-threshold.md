---
layer: application
type: application
subject: candidate-archetype-routing
technique: confidence-always-returned-with-a-review-threshold
stack: process
status: forged
verified_on: 2026-09-26
applied: experiment
ab_verdict: better
---

# A published threshold, a review chip, and a formula that outranks the candidate

Read on 2026-09-26 at the tree's main, `cf9a4b81c`. The routing confidence is produced by
the Python analysis pipeline (`pipeline/jobfit/registry.py`) and read by the TypeScript
app for display.

## What the tree gets right

- **Every path returns a confidence.** `detect_detailed` returns a 4-tuple on each
  branch: self-declared (0.9, possibly capped by a contradiction), signal-scored (the
  winner's share), and the no-signal default (0.4). A missing confidence cannot be
  expressed.
- **The threshold is published beside the weights.** `archetypes.json:61-64` holds
  `selfDeclaredConfidence: 0.9`, `defaultConfidence: 0.4` and
  `lowConfidenceThreshold: 0.55` in one block. `registry.py:127-132` documents that "the
  unguided default (`defaultConfidence`) sits below it by construction, so a silent
  fallback always trips it".
- **The threshold is wired to a flag.** `pipeline/jobfit/pipeline.py:850-863`
  `_archetype_needs_review` returns `low_confidence` below 0.55 and `contradiction` when a
  cap fired. It stamps `archetypeNeedsReview` and a code on the analysis (845-846), and
  `app/_components/results/ArchetypeBanner.tsx:133` renders a needs-review chip.
- **None of the forbidden uses exists.** The routing confidence is not read by the
  matcher, the automation policy pass, the recruiter ranking or the screening wave.
  It is not a score input, a ranking key, or a rejection trigger.
- **One corroboration path states the invariant outright.** `pipeline/jobfit/live_case.py:40-43`
  lets a passed work sample lift an early-career routing by 0.15, to at most 0.75, a
  ceiling that "deliberately sits BELOW a real self-declaration (0.9, registry.py) —
  performing well is corroboration, not identity."

## Where this falls short of the standard

- **The inference path breaks that invariant.** The signal-scored branch returns the
  winner's share (`registry.py:330`). That share reads 1.0 whenever every fired signal
  points one way, above the 0.9 a candidate earns by saying so.
- **The threshold was chosen, not measured.** No labelled routing sample exists, so 0.55
  has no measured error rate above it.
- **Review is a chip, not a control.** Nothing queues a flagged routing, and nothing
  withholds an action on it. The TypeScript side reads the threshold only in a comment
  (`app/features/insights/about/scenes/archetypes/ArchetypeRouter.tsx:40`). The review
  flag does not survive a profile save, as the sibling application on self-declaration
  shows.

## Applied

Experiment, 2026-09-26, on the flipped invariant: no inference may reach the declaration
tier, and confidence scales with evidence mass. The harness imported kp's registry and its
labelled matching-eval scenarios (`pipeline/jobfit/eval/matching_eval.py`, seven cases
with an expected archetype), wrote nothing, and added three single-signal variants of
those scenarios: the shape an extraction produces when it fills one field of six.

- **A** is the detector as shipped.
- **B** is the same detector with `share × min(1, mass / 3.0)`, held at 0.85, under the
  declaration tier.

| Case | Class (all correct) | Fired | A | B |
| --- | --- | --- | --- | --- |
| two students (enrolled, <1y) | student | mass 3.5 | 1.0 | 0.85 |
| three experienced (≥3y, substantial) | bau | mass 3.0 | 0.83 | 0.83 |
| two switchers (strong, substantial) | career_switcher | mass 4.5 | 0.78 | 0.78 |
| enrolled only | student | mass 2.0 | 1.0 | 0.67 |
| ≥3y only | bau | mass 1.5 | 1.0 | 0.50 |
| domain change only | career_switcher | mass 1.0 | 1.0 | 0.33 |

**n = 10, all 10 classes correct under both arms.** Under A, 5 of 10 document inferences
sit at or above the declaration tier. Under B, 0 of 10 do. The sharpest pair: the domain
change alone *inferred* reads 1.0, and the same fact *declared* by the candidate reads
0.7, capped by the tree's own switcher contradiction.

B's cost is two extra reviews, the ≥3y-only and change-only routings, whose classes were
right. That trade is the point: one fact is a thin reason for the highest confidence in
the system. **Verdict: better** on the invariant the tree states in `live_case.py`. The
floor of 3.0 is this experiment's choice, not a measurement. It should come from a
labelled sample.

Falsifier: a labelled sample in which single-signal routings are corrected by reviewers
no more often than multi-signal ones. B would then add review load and buy nothing.
