---
layer: application
type: application
subject: comparative-shortlist-evaluation
technique: confidence-band-lead-separation
stack: node
verified_on: 2026-09-27
verified_against: node@24
applied: code
ab_verdict: better
---

# Separating the crown from the point estimate (Node/TypeScript)

The band is computed in the Python matcher. The separation verdict is a pure,
dependency-free TypeScript module. The two meet in the group-eval run path, which
carries the verdict into the crown, the deterministic summary and the sealed
decision record. A second, independent separation test sits in the matrix
grid's slate proposal. Until 2026-09-27 it measured against the wrong edge.

Re-verified 2026-09-27 against the tree's main at `29430f170`. Every line number
below is from that read; most moved since the 2026-08-20 write.

## The band, and why it is honest before it is used

`_confidence` (`pipeline/jobfit/matching.py:1074`) starts from a base spread of 4
and widens it per thinness source. Each widening pushes a recruiter-readable
driver alongside a locale-independent code:

| source | spread | driver code |
| --- | --- | --- |
| early-career, no observed skills | +6 | `earlyCareerThin` |
| early-career, some observed skills | +2 | `earlyCareerObserved` |
| fewer than 3 skills listed | +6 | `fewSkills` |
| education level unknown | +4 | `eduUnknown` |
| a school named, no degree stated | +4 | `eduDegreeUnstated` |
| no languages listed | +4 | `noLanguages` |
| misses more than 2 must-haves | +5 | `missesMusts` (with the count) |

The `eduDegreeUnstated` row landed on 2026-09-23 (`:1107-1113`), with the rule
that a named school without a degree title is uncertain, not a knockout. The
docstring states the standard's rule: each source "both widens the band and
records a recruiter-readable driver" (`:1077-1082`). The early-career pair is the
offset case in code, where a directly observed skill takes the widening from +6
to +2 (`:1092-1100`). The band clamps to the scale (`:1122-1123`).

The increments add linearly, the worst-case combination the technique names,
and the run path compares bands by strict non-overlap. Both choices are
conservative, and they compound. The engine scores missing evidence as missing
points, so thin records sink rather than rise. Over 4,414 three-candidate cohorts
built with this scorer, the leader carried the widest band in 16.3%, under the
third a width-blind draw gives. The estimate-noise condition on "do not re-rank"
does not bite here.

## The verdict

`leadSeparation` (`app/_lib/group-eval-separation.ts:54`) takes the lead and the
runner-up structurally (`BandedCandidate`, `:33`). It returns
`"separated" | "overlapping" | "unknown"` (`:44`). These lines did not move.

- **Unknown is a real branch, four times over** (`:58-63`): no lead or no
  runner-up, either score `null`, either band absent, or a non-finite edge.
- **The boundary is inclusive** (`:64`): `a.low > b.high`, pinned by
  `group-eval-separation.test.ts:36`, *touching bands are overlapping, not
  separated*.
- **It is deliberately not a re-ranking** (`:15-18`).

Since the first write the runner-up is chosen by `eligibleRunnerUp` (`:82-88`).
It skips knockout-failed rivals, so a lead is never "separated" from, or tied
with, somebody the gate already refused. The run path calls it at
`group-eval-run.ts:761-763`.

## The shortfall that stands: unknown is silent

`separationNote` (`:97`) still returns the empty string for anything but
`overlapping` (`:98`), and the test at `:65` still pins *empty when separation is
unknown*. The silence now reaches the UI as well. The comparison table sets
`tiedLead` only for `overlapping` (`GroupEvalComparisonTable.tsx:199`), and the
localized composer adds the caveat only for that state (`localize.ts:73`). A
lead whose separation could not be assessed renders exactly like one whose gap
cleared. The verdict is sealed correctly: `separation` rides in the decision
record's `inputs` (`group-eval-run.ts:871`, `:886`), with the lead's
`confidence`, cohort size and source and the robustness status. The missing
piece is one sentence and one chip, not a data change.

Ties are the other gap. The candidate sort is score-descending and stable
(`match-score.ts:35`), so an exact tie at the top is broken by stored-score order
and then cohort order, and `candidates[0]` becomes the lead. With bands, the tie
reads `overlapping`, hedged on the top two only. Without bands it reads
`unknown`, which is silent. No overlapping group larger than two is reported.

## The slate's separation test, fixed in this run

`proposeSlate` (`app/features/insights/matrix/matrixSlate.ts`) proposes one
role per candidate across the visible grid, and flags whether each pick's lead is
outside its margin. It compared the pick's band floor with the runner-up's
*point score* (`band.low > next.score`), a looser test than the run path's. The
engine's tightest band is plus or minus 4. Every gap of 5 to 8 points between two
tight-band candidates was therefore marked separated, although the bands
overlapped. So `slate.withinMargin` never appeared for exactly the leads it
exists to qualify.

Fixed in `29430f170`: the pick's floor must clear the runner-up's band ceiling,
and a runner-up with no band gives `null`. The existing test was updated. A new
one pins three cases: an overlap the point comparison crowned (`80 [76-84]` vs
`75 [71-79]`), touching bands, and a bandless runner-up. The matrix suites are
green (9/9), and the one TypeScript error in the tree is in an untracked file this
change did not touch. A/B on the case set: the shipped rule marked 2 of 3 as
separated (the overlap and touching cases) and 0 as unknown. The fixed rule marks
0 as separated, 2 as overlapping and 1 as unknown, which is the technique's
answer for all three.

## Where it is wired

`group-eval-run.ts:761-763` computes the verdict and caveat once; `:983`
publishes `leadSeparation` on the payload. The cohort gate runs first (`:517`,
`:568-572`): below `GROUP_EVAL_MIN_COHORT` there is no lead to separate, and the
run reports `insufficient_sample`.
