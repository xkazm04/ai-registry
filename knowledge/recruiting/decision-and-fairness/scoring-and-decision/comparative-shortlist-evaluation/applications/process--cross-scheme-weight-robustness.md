---
layer: application
type: application
subject: comparative-shortlist-evaluation
technique: cross-scheme-weight-robustness
stack: process
verified_on: 2026-09-27
applied: experiment
ab_verdict: better
---

# The fairness matrix and the honest status it reports (Python pipeline → payload)

The check itself lives in the spawned analysis pipeline. The vocabulary that
reports it lives in the shared types the server and the panel both import. Both
halves are needed: a correct check with a boolean flag would still lie, and so
would a correct status the panel does not read. The second was live until
2026-09-27.

Re-verified 2026-09-27 against the tree's main at `29430f170`.

## Bounded dynamic weights

Per-candidate weights let demonstrated, role-relevant evidence count for more for
the candidate who has it. Three constants keep that fair
(`pipeline/jobfit/matching.py:980-982`): `_WEIGHT_MAX_DELTA = 0.15`,
`_WEIGHT_FLOOR = 0.10`, `_WEIGHT_CEIL = 0.60`. `weight_bounds` (`:985`) composes
them into per-slot bounds around the archetype baseline, "so one strong signal
can neither erase a dimension nor let it dominate" (`:975-976`).

`resolve_weights` (`:998`) is the standard's projection rule as code. Its
docstring names the failure the obvious repair causes: "a plain clamp-then-divide
can renormalize a slot back past its ceiling" (`:999-1005`). The implementation
(`:1010-1026`) is a bounded simplex projection: at most 8 passes, with the
residual distributed in proportion to the headroom left.

`propose_weights` (`:1029`) supplies the deterministic proposal and returns the
vector *plus its reasons*. Since 2026-08-11 its `else` branch always writes one:
"Baseline <archetype> weights kept — no high-trust must-have evidence to shift on"
(`:1056-1063`). An empty list had read as "no rationale". The fix was right for
the audit and wrong for every consumer that read "has a note" as "was adjusted".

## Score everyone under everyone's yardstick

`fairness_matrix` (`:1238`) scores every candidate under every candidate's scheme
and ranks by the mean (`:1239-1247`). The diagonal is kept (`own`, `:1261`). The
scheme-independent dimension scores are computed once per candidate (`:1256`), so
the n² part is multiply-adds. Every input runs through `resolve_weights` (`:1248`).
Since 2026-09 the matrix also returns `order` as indices, and `fairness_check`
maps it to `rankingIds`. The robust order is keyed on identity, and a namesake
cannot erase an eligible hire.

## What the mean order is, measured

A harness over the pipeline's own `fairness_check` and `_score_dimensions`,
product code unchanged, ran one bau archetype on one senior role. It covered
1,856 three-candidate cohorts whose schemes varied and with no knockouts:

- **The mean order is the centroid weighting.** The mean-order leader equalled
  the leader under the averaged weight vector in 1,856 of 1,856 cohorts, as the
  algebra requires for a linear composite.
- **Under these bounds, a pass is near-certain.** No scheme crowned a sole
  leader different from the mean order's (0 of 1,856). Adding a third candidate
  never reversed a pair's mean order (0 of 5,764 pair-and-third cases).
- **The live defect is ties.** In 96 of 1,856 cohorts (5.2%) the top two means
  were exactly equal. The panel still styled one of them as the moss "first"
  pill, chosen by input order.

So the tree's "robust order" is a fair, centroid-weighted ranking, not a
robustness finding. With every slot within 0.15 of a shared baseline, "the order
held" carries little information. The corrected reading, B, differs from what
the tree shows, A, in two ways. It states how far the schemes moved, and it
reports the 96 tied tops as ties. The 0-of-1,856 result is itself the reason to
state the distance.

## The status is derived, not asserted

`assessRobustness` (`app/features/shared/groupEvalTypes.ts:108`) turns the
matrix into one of five values (`:46`). The comment block above the type
(`:31-45`) is the epistemology. Two changes since the first write:

- **Variance is read from the schemes, not the notes.** The 08-20 write said
  variance was detected from `weightNotes`: "a candidate whose proposal produced no
  reasons was never moved off the baseline". That was already false on the day it
  was written. `propose_weights` had noted every candidate since 08-11, so the
  notes-based check returned `assessed` for every run. The server moved to
  comparing scheme vectors in `4fb00544c`, and the test *notes alone cannot claim
  a weighting check* pins it. The panel did not move with it. It was fixed on
  2026-09-27; see
  [node--robustness-status-taxonomy](./node--robustness-status-taxonomy.md).
- **Below the floor is `insufficient_sample` inside the function too** (`:111`,
  `d72c22392`), not only at the run's gate.

`isFairnessAligned` (`:65`) is the unreadable-check guard, and it is stricter now.
It also checks that `own`, `ranking` and `koFailed` line up and that `rankingIds`
identify the same people (`:52-58`). A misaligned matrix is treated exactly like
a missing one (`:110`).

## The gate order

`group-eval-run.ts:568-572` composes the floors in the order the standard
requires. Below the cohort floor the status is `insufficient_sample`. A job-backed
role whose matrix does not cover the compared field is `unavailable`, so a subset
matrix no longer passes as a full one. Otherwise it is `assessRobustness`. The
status rides into the sealed record's `inputs` (`:871`, `:886`).

## What is still owed

- A scheme count, the largest weight movement, and "which scheme flipped it" on
  the panel and in the seal. Today a pass is a pill row and an "agrees" line.
- Tied means shown as a tie in the robust-order pills.
- The sealed record carries the status, not the schemes it was computed over.
