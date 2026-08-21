---
layer: application
type: application
subject: selection-score-calibration
technique: post-deployment-drift-monitoring
stack: process
verified_on: 2026-08-20
---

# The drift alarm as a pure comparison stage (Python analysis pipeline)

`pipeline/jobfit/calibration_drift.py` realizes the technique as a stage of the
spawned Python analysis pipeline rather than as a service: pure functions only,
"nothing here reads a database, calls an API, or schedules anything" (`:11-12`).
Callers hand it two payloads in the exact shape the web app's engine emits
(`CalibrationResult`: `n`/`positives`/`brier`/`bins`/`calibrated`/`minOutcomes`),
so a JSON blob serialized by the app is directly consumable, and
`compute_calibration` (`:82`) mirrors the TypeScript `computeCalibration`
numerically so a Python-side caller can build a payload from raw pairs and get
identical bins.

The module docstring states the obligation it exists to meet: Article 72 "requires
a high-risk system to MONITOR its own performance after deployment, not just
certify it once" (`:1-9`).

## Three axes, three named thresholds

Each constant carries its derivation in a comment, which is what makes the alarm
defensible rather than tuned (`:43-58`):

- `BRIER_DEGRADATION_ALERT = 0.05` — "Brier ranges 0 (perfect) .. 0.25
  (uninformative coin at p=0.5). A worsening of 0.05 eats a fifth of that whole
  range — comfortably past run-to-run jitter on n>=20 windows, and roughly the
  gap between a decent (≈0.18) and a useless (≈0.25) recruitment ranker."
  Critically: "Improvement never alarms (signed, not absolute)" — implemented as
  `brier_delta >= brier_alert` on a signed difference (`:204-205`).
- `PSI_ALERT = 0.25` — the credit-risk convention, with the standard's
  report-but-do-not-alarm rule stated explicitly: "We alarm only at
  'significant'; the 0.10 'moderate' band is reported but does not alarm."
- `POSITIVE_RATE_SHIFT_ALERT = 0.10` — "a ±10-percentage-point move means the
  outcome mix changed enough that the frozen curve no longer describes the
  population (e.g. a hiring-bar change), regardless of the Brier delta." This is
  compared as an absolute value (`:216`), correctly — unlike the Brier axis,
  movement in either direction invalidates the frozen curve.
- `_PSI_EPSILON = 1e-4` — "so an empty bin on one side contributes a
  large-but-finite term instead of a division by zero / log(0)."

All three thresholds are keyword arguments with those constants as defaults, so a
workspace can recalibrate them without forking the logic.

## The honesty gate runs first and returns nothing else

`detect_drift` (`:166`) checks `baseline.get("calibrated")` and
`current.get("calibrated")` **before** computing any axis, and on failure returns
`VERDICT_INSUFFICIENT` with `alarm=False`, all three axis values `None`, both
counts, and a reason naming each window against its own `minOutcomes`
(`:183-196`). The docstring gives the rule in one line: "a drift verdict on
statistical noise is worse than none" (`:178-179`), and the module header ties it
to the same principle as the app's `calibrated` flag and the analysis pipeline's
"unmeasured metric must not pass" rule (`:28-31`).

Note that the gate is `or`, not `and`: a rich current window against a thin
baseline is unevaluable too.

## The report is a record, not a notification

`DriftReport` (`:152`) carries `verdict`, `alarm`, `brier_delta`, `psi`,
`positive_rate_shift`, `baseline_n`, `current_n`, and `reasons` — a
human-readable line per tripped axis, each quoting the value and the threshold it
crossed ("brier degraded by +0.062 (>= 0.05) — score probabilities are getting
less reliable"). Every axis value is present on an `ok` verdict too, so a quiet
cycle is still evidence rather than silence, and `MIN_CALIBRATION_OUTCOMES = 20`
is mirrored from the app (`:40`) rather than reinvented — the standard's "reuse
the whole-surface floor" rule realized as a numerically-pinned mirror.

## Deviations from the standard

- **Nothing schedules it, and nothing retains its output.** The module is
  explicitly "no wiring"; there is no job that runs it on a cadence, no store for
  the sealed baseline, and no retained series of reports. The Article 72 evidence
  the docstring invokes therefore does not yet exist as an artifact — the standard
  requires the periodic retained record, and what is implemented is the verdict
  function it would call.
- **No arm segmentation.** `detect_drift` compares two payloads; whether they
  came from the contaminated pipeline arm or the clean holdout arm is invisible
  to it, so drift in the production arm cannot be distinguished from the
  threshold's own effect. Segmentation is left entirely to the caller.
- **No model-change break marker.** Nothing in the payload identifies which
  scoring model produced the predictions, so a baseline and a current window
  straddling a model swap compare as a trend.
- **No routing to a person.** The report has no actor field and no delivery path;
  the standard's "the monitor's job ends at 'a human must look at this', and the
  record names who did" has no representation.
