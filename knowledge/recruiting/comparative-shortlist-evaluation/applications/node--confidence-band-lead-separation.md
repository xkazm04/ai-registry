---
layer: application
type: application
subject: comparative-shortlist-evaluation
technique: confidence-band-lead-separation
stack: node
---

# Separating the crown from the point estimate (Node/TypeScript)

The band is computed in the Python matcher; the separation verdict is a pure,
dependency-free TypeScript module; the two meet in the group-eval run path, which
carries the verdict into the crown, the deterministic summary and the sealed
decision record.

## The band, and why it is honest before it is used

`_confidence` (`pipeline/jobfit/matching.py:764`) starts from a base spread of 4
and widens it per thinness source, each widening pushing a recruiter-readable
driver alongside a locale-independent code:

| source | spread | driver code |
| --- | --- | --- |
| early-career, no observed skills | +6 | `earlyCareerThin` |
| early-career, some observed skills | +2 | `earlyCareerObserved` |
| fewer than 3 skills listed | +6 | `fewSkills` |
| education level unknown | +4 | `eduUnknown` |
| no languages listed | +4 | `noLanguages` |
| misses more than 2 must-haves | +5 | `missesMusts` (with the count) |

The docstring states the rule the standard names: each source "both widens the
band and records a recruiter-readable driver, so the UI can explain *why* a score
is uncertain rather than leaving a bare `low–high` range to be misread"
(`:765-769`). The early-career pair is the offset case in code — a directly
observed live-case skill de-risks a thin paper trail and takes the widening from
+6 to +2 (`:781-786`). The band clamps to the scale (`low=max(0, total - spread)`,
`high=min(100, total + spread)`, `:803-804`) and is graded `tight | moderate |
wide` for display.

`group-eval-run` carries this through to every candidate — and, before this work,
then ranked, crowned and sealed on `score` alone.

## The verdict is 11 lines and a comment block that outweighs them

`leadSeparation` (`app/_lib/group-eval-separation.ts:54`) takes the lead and the
runner-up structurally (`BandedCandidate = { score, confidence? }`, `:33`) so an
`EvalCandidate` satisfies it without importing the group-eval types, and returns
`"separated" | "overlapping" | "unknown"` (`:44`).

Three properties are worth copying verbatim:

- **Unknown is a real branch, four times over** (`:58-63`): no lead or no
  runner-up, either score `null`, either band absent, or a non-finite edge. The
  comment: "Absence of evidence is never rendered as a claim either way"
  (`:42-43`).
- **The boundary is inclusive** (`:64`): `a.low > b.high`, not `>=`. The docstring
  gives the reason — "a zero-width gap is not a separation and this call should
  never flatter the crown" (`:50-53`) — and `group-eval-separation.test.ts:36`
  pins it: *touching bands are overlapping, not separated*.
- **It is deliberately not a re-ranking.** The header states it as a product
  decision: "Reordering candidates by band would be a different (and much larger)
  product decision; the honest score order stays exactly as it was. What changes
  is that the crown, the deterministic summary and the sealed record can now STATE
  the separation rather than implying one" (`:15-18`), and places it in the
  codebase's established line beside the null-score policy that reports "unscored"
  instead of fabricating a 0.

## The caveat is emitted only where it changes the reading

`separationNote` (`:74`) returns the empty string for anything but `overlapping`,
and only the overlapping sentence names both candidates and the consequence:
"their score bands overlap, so this ordering is within the measurement's own
uncertainty. Treat the top two as a tie on the evidence available."

This is where the repo falls short of the standard. `separated` needing no hedge
is right; `unknown` returning empty (`:65` of the test file: *empty when
separation is unknown — absence is not a claim*) means a lead whose separation
**could not be assessed** seals with a rationale indistinguishable from a lead
whose gap genuinely cleared. The standard's rule holds: unknown is stated, because
silence beside a crown reads as endorsement. The verdict itself is already sealed
correctly — `separation` rides in the decision record's `inputs` alongside the
lead's `confidence`, cohort size and robustness status
(`app/_lib/group-eval-run.ts:657` and `:672`) — so the missing piece is one
sentence in `separationNote`, not a data change.

## Where it is wired

`group-eval-run.ts:548-549` computes the verdict and the caveat once; `:753`
publishes `leadSeparation` on the payload so the panel and the sealed record read
the same value. The cohort gate runs first (`:380`, `:406`): below
`GROUP_EVAL_MIN_COHORT` there is no lead to separate, and the run reports
`insufficient_sample` rather than an unknown separation over a field of one.
