---
layer: application
type: application
subject: selection-score-calibration
technique: post-deployment-drift-monitoring
stack: process
status: forged
verified_on: 2026-09-29
applied: code
ab_verdict: better
---

# The drift alarm as a pure comparison stage (Python analysis pipeline)

`pipeline/jobfit/calibration_drift.py` realises the technique as a stage of the spawned Python
analysis pipeline rather than as a service: pure functions only, "nothing here reads a
database, calls an API, or schedules anything". Callers hand it two payloads in the exact shape
the web app's engine emits (`CalibrationResult`: `n`/`positives`/`brier`/`bins`/`calibrated`/
`minOutcomes`), so a JSON blob serialised by the app is directly consumable, and
`compute_calibration` mirrors the TypeScript `computeCalibration` so a Python-side caller can
build a payload from raw pairs and get identical bins.

Read against kp at `006bf7a0a`, then changed by `5deab937` (local, not pushed: kp's main carries
sibling work). The module docstring still cites "Article 72" for a duty to monitor "its own
performance after deployment". Article 72 is the *provider's* post-market monitoring system; the
deployer's duty is Article 26(5) (monitor operation against the instructions for use) with logs
kept at least six months (26(6)), and the high-risk obligations apply from 2 December 2027
(Regulation (EU) 2026/1744), not 2 August 2026. The header now sits on the wrong article for the
role a deployer plays, and the docstring was not changed in this pass.

## Three axes, three named thresholds

Each constant carries its derivation in a comment, which is what makes the alarm defensible
rather than tuned:

- `BRIER_DEGRADATION_ALERT = 0.05`, signed, so "improvement never alarms" (`brier_delta >=
  brier_alert`).
- `PSI_ALERT = 0.25`, the credit-risk convention, with the report-but-do-not-alarm middle band.
- `POSITIVE_RATE_SHIFT_ALERT = 0.10`, compared as an absolute value, correctly: movement in
  either direction invalidates the frozen curve.
- `_PSI_EPSILON = 1e-4`, so an empty bin contributes a large-but-finite term.

All three are keyword arguments with those constants as defaults.

## Measured: the alarm on windows with no drift (code, 2026-09-29)

The 2026-08-20 comment called a 0.05 Brier worsening "comfortably past run-to-run jitter on
n>=20 windows". It is not, and the whole alarm was worse than that. Harness: perfectly
calibrated scores (outcome probability equal to the score), baseline and current windows drawn
from the *same* population, so every alarm is false; `detect_drift` called unchanged; 4,000
window pairs per size; three score distributions (Beta(2,2), uniform, Beta(5,3)), all within a
few points of each other.

| outcomes per window | any axis alarms | delta sd | PSI median | PSI ≥ 0.25 | rate shift ≥ 0.10 |
|---|---|---|---|---|---|
| 20 | 99.8% | 0.057 | 1.78 | 99.1% | 64.4% |
| 30 | 98.9% | 0.046 | 0.94 | 97.6% | 52.0% |
| 50 | 91.0% | 0.035 | 0.46 | 85.0% | 37.5% |
| 100 | 42.8% | 0.026 | 0.18 | 29.5% | 18.2% |
| 200 | 6.1% | 0.018 | 0.09 | 1.0% | 5.0% |
| 400 | 0.4% | 0.012 | 0.04 | 0.0% | 0.4% |
| 1,000 | 0.0% | 0.008 | 0.02 | 0.0% | 0.0% |

(Beta(2,2) rows; the Brier axis alone alarmed on 19.4% at 20, 8.5% at 50, 2.4% at 100.) The
PSI numbers match the closed form the technique now gives: with ten bins the no-shift expected
value is 9 × (1/n + 1/m), 0.9 at 20 and 0.18 at 100. The alarm at the floor the technique used
to recommend, the curve's own 20, fired on essentially every pair; the mute-within-a-month
failure the technique warns of was built into the floor it named.

A second measurement: outcomes drawn from a score that had lost half its resolution (true Brier
worsening 0.050) tripped the 0.05 cut on 49% to 51% of pairs at every window size from 20 to
1,000. A cut equal to the change it must catch detects it half the time at best.

## The fix and its A/B (code, better)

A = `detect_drift` before `5deab937`, gate on `minOutcomes` (20) only; B = after: a second gate,
`MIN_DRIFT_WINDOW_OUTCOMES = 200` (`min_window_outcomes` keyword), which returns
`insufficient_data` with no axis computed and a reason naming both windows against the drift
floor. Same harness, 1,500 pairs per size, Beta(2,2): alarms at 20, 50 and 100 outcomes 0%, 0%,
0% (was 99.8%, 91%, 43%); at 200, 5.7%; at 400, 0.3%. Nothing changes at or above 200, which
is the point: the change withholds a verdict the data could not support and leaves the rest.
Tests: the five alarm cases were scaled from 40-pair shapes to 200 with the shape unchanged; one
new test pins the refusal at 40; one runs 300 seeded pairs of calibrated windows at the floor and
fails if the false-alarm rate reaches 12% (measured 3.7% there, 6% in the larger run), which is
also what fails if someone lowers the floor. 19 tests, all pass.

Cost: a workspace whose windows are under 200 resolved outcomes now gets "not evaluable" where it
would have got noise, and the technique says that is the correct output. 200 is a floor for this
design (ten bins, the three cuts above), not a universal number; a different bin count or cut
moves it.

## The honesty gate runs first and returns nothing else

`detect_drift` checks `baseline.get("calibrated")` and `current.get("calibrated")` **before**
computing any axis, and on failure returns `VERDICT_INSUFFICIENT` with `alarm=False`, all three
axis values `None`, both counts, and a reason naming each window against its own `minOutcomes`.
The docstring gives the rule in one line: "a drift verdict on statistical noise is worse than
none". The gate is `or`, not `and`: a rich current window against a thin baseline is unevaluable
too. The drift-floor gate was added directly after it and follows the same shape.

## The report is a record, not a notification

`DriftReport` carries `verdict`, `alarm`, `brier_delta`, `psi`, `positive_rate_shift`,
`baseline_n`, `current_n`, and `reasons`, one human-readable line per tripped axis quoting the
value and the threshold it crossed. Every axis value is present on an `ok` verdict too, so a
quiet cycle is still evidence rather than silence, and `MIN_CALIBRATION_OUTCOMES = 20` is
mirrored from the app rather than reinvented, pinned by the contract-constants generator.

## Deviations from the standard

- **Nothing schedules it, and nothing retains its output.** Searching kp on 2026-09-29 finds the
  module referenced only by the contract-constants mirror and one decoder guard: no job runs it
  on a cadence, no store holds the sealed baseline, no retained series of reports exists. The
  provider-side evidence the docstring invokes therefore does not exist as an artifact.
- **The input axis is not an early signal here.** `population_stability_index` reads the bin
  shares of the two `CalibrationResult` payloads, and those bins are built from *resolved*
  outcomes only. The technique asks for the index over every scored candidate, needing no
  outcome, with far larger windows: `pipeline_entries.match_score` exists for all of them, so
  the seam is there and unused. As built, the input axis waits as long as the outcome axes and
  has their n.
- **No arm segmentation.** `detect_drift` compares two payloads; whether they came from the
  contaminated pipeline arm or the clean holdout arm is invisible to it, so drift in the
  production arm cannot be told from the threshold's own effect.
- **No model-change break marker.** Nothing in the payload identifies which scoring model
  produced the predictions, so a baseline and a current window straddling a model swap compare
  as a trend.
- **No routing to a person.** The report has no actor field and no delivery path.
- **The PSI cut is still the fixed convention.** Above the new floor the false-alarm rate on
  that axis is about 1% at 200 outcomes, so the fixed 0.25 is conservative there; the technique's
  chi-square benchmark would be the way to keep a window between 100 and 200 usable, and is not
  implemented.
