---
layer: technique
type: technique
subject: quality-verdict-integrity
technique: calibration-against-confirmed-labels-only
status: forged
laws: [unmeasured-is-not-a-pass, no-gate-self-certifies, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [claiming an automated grader agrees with human judgment, standing up a new grading standard, reporting the trustworthiness of a quality layer]
---

# Calibration against confirmed labels only

Measure the automated grader against labels a human deliberately assigned, using
the same rubric text the grader receives, and report the agreement with its
sample size. Nothing else is calibration. A grading system's standing is the
weakest link in this chain, and the honest default standing is never the top one.

## Confirmed, and what is not confirmed

A **confirmed label** is a band or score a person assigned to a specific
artifact, on purpose, against the same criteria the grader was given, with the
intent that it be ground truth.

Everything else is a seed, and seeds prove nothing:

- a label inferred from a prior automated run — this measures self-consistency,
  which is not a virtue;
- a label inferred from an artifact having been accepted, shipped, or not
  complained about — that is a proxy for a process, not a judgment of craft;
- a label seeded from documented prior evidence and never re-affirmed — good
  material, still not confirmed.

Seeds are useful: they populate the set so the workflow can be exercised. They
must be flagged as provisional and **excluded from enforcement**, because
agreeing with an unconfirmed guess proves nothing at all. A system whose entire
label set is provisional reports its agreement rate *and* reports that zero
confirmed labels back it. That is [no gate
self-certifies](../../_laws.md#no-gate-self-certifies) applied to the grader
itself.

## The standings

| Standing | Means |
| --- | --- |
| `unrun` | no measurement exists; nothing about the grader is proven |
| `provisional` | labels exist but none are confirmed, or too few are |
| `stale` | the last run was scored under a superseded standard; proves nothing about the one in force |
| `enforced` | agreement over confirmed labels clears a stated threshold at a stated sample size |

Publish the standing next to every quality number the grader produces. A
dashboard that shows scores without the grader's standing is showing a
measurement without its basis —
[a number carries its unit and its basis](../../_laws.md#a-number-carries-its-unit-and-basis).

## The procedure

1. **Choose targets stratified across the outcome range and across content
   classes** — clear failures, borderline work, work that genuinely ships. A
   set drawn from whatever was convenient measures agreement on the easy cases.
2. **Have a person label each one** against the same rubric text the grader
   sees, and clear the provisional flag as an explicit act.
3. **Measure human-to-human agreement first, on a subset.** If two people cannot
   agree with each other at a workable level, the criteria are ambiguous and the
   grader will inherit the ambiguity — fix the criteria before touching the
   automation. This step is skipped constantly and is the cheapest way to find a
   broken rubric.
4. **Run the grader over exactly those targets**, at the model and settings the
   production path uses. The run is metered like any other work.
5. **Compare bands, not raw scores.** Agreement on the decision the score drives
   is the thing that matters; two graders can differ by eight points and make
   the same call every time.
6. **Report agreement with its sample size, its confirmed-label count, and the
   disagreements themselves** — each with the human's band, the grader's band
   and the score. The disagreement list is the actionable output; the rate is
   the summary.
7. **Decide the standing**, and fail the build on an enforced-and-failing
   result.

## Sizing and thresholds

- **Threshold**: state one, in one place, and never lower it to make a run pass.
  Lowering it is the only irreversible move here — every other mistake is
  fixable by re-measuring. A working figure for a band decision is agreement at
  or above 0.85; chance-corrected agreement statistics are the stricter and
  better instrument where the bands are unbalanced, and raw percentage
  agreement flatters a set dominated by one band.
- **Size**: a handful of targets is a smoke test, not a calibration. Roughly
  twenty stratified targets is the floor at which a band-agreement figure starts
  to mean something for a narrow, well-specified rubric; a broad rubric over
  heterogeneous content wants low hundreds. Report the number every time — an
  agreement rate without a sample size has reported nothing.
- **Cadence**: re-measure whenever the standard is versioned, whenever the
  grading model changes, and on a schedule regardless — both the graded system
  and the grader drift, and a drift alarm is ambiguous between the two unless
  the grader is independently re-anchored.

## Keep the measurement out of the record

The calibration run **writes nothing to the verdict store**. Calibration is
measurement of the instrument, not judgment of the artifacts; mixing them makes
the instrument part of its own evidence and pollutes the quality corpus with
scores produced under experimental conditions.

Likewise, choose a grader from a different model family than the one that
produced the content where that is possible: graders measurably prefer output
from their own family, and a same-family pairing quietly inflates the very
agreement figure being reported.

## When not to use this

- **When the grader's output drives no decision** — an advisory score nobody
  gates on — a full calibration programme is overhead. Say `unrun` and mean it,
  rather than implying a rigour that does not exist.
- **When no human is available to label**, do not substitute a stronger model's
  labels and call the result calibration. Call it cross-model agreement, which
  is a different and weaker claim, and keep the standing at `provisional`.
- **When the criteria are still moving weekly**, calibrating each revision burns
  human attention on an instrument that will not survive the month. Stabilise
  the criteria, then calibrate — but do not ship a gate on the uncalibrated
  interim.
