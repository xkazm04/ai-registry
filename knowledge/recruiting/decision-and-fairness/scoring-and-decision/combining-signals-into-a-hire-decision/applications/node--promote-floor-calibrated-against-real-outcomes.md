---
layer: application
type: application
subject: combining-signals-into-a-hire-decision
technique: promote-floor-calibrated-against-real-outcomes
stack: node
verified_on: 2026-08-20
---

# Deriving the promote floor from recorded outcomes (Node/TypeScript)

`calibrate()` (`app/_lib/dev-outcomes.ts:475`) reads the recorded hire/reject
outcomes for one workspace, buckets them by the score that was predicted at
screening time, and answers two questions: does a higher score actually convert
better, and where should the promote floor sit. A human then acts on it — the
control page's "Apply suggested → N" button moves the live floor — which is why
every constant in the function is documented with why-it-holds-that-value
(`:443-448`).

## The four documented thresholds

| Constant | Value | Documented rationale (`:449-463`) |
| --- | --- | --- |
| `MIN_RESOLVED` (`:417`) | 4 | "do not calibrate until at least 4 *decided* … outcomes WITH AN IN-RANGE predicted score exist… 4 is a low 'show me *something*' bar, not a statistically powered sample — it just stops the engine from making a recommendation off one or two data points" |
| monotonicity tolerance (`:530`) | 0.05 | "we permit a 5-percentage-point dip before declaring the trend broken, so ordinary sampling noise doesn't flip a genuinely-rising trend to 'not predictive'. The 0.05 is a judgement call … not derived" |
| majority-hire threshold (`:537`) | 0.5 | "the lowest band where a simple majority (≥ 50%) of promoted candidates were actually hired: the cheapest band that 'pays off' more often than not … chosen for being an obvious, defensible cut rather than an optimised one" |
| no-converging-band fallback | 85 | "when NO band reaches the 0.5 hire rate, fall back to 85 (the floor of the top BANDS tier): the most conservative advice available" |

Each entry says what it protects against and admits what it is not. That
admission is the load-bearing part: "not tuned/learned — they are deliberate,
defensible defaults" is a far more useful thing for a reviewer to read than a
number presented as derived.

## Fixed bands, anchored, not fitted

`BANDS` (`app/_lib/dev-outcomes.ts:407`) is `[0,55) [55,70) [70,85) [85,101)`,
and the comment at `:394-406` states exactly the standard's rule: the boundaries
are "HAND-CHOSEN tiers, not learned from data — they stay constant no matter how
many outcomes accumulate". 55 is the default promote floor, "so the first band
[0–54] is exactly the 'scored below the floor' region"; 70 and 85 split the
promotable range into borderline / good / strong, "round, legible cut-points, NOT
fitted to the observed hire rates".

The top bound is 101, not 100, "because band membership is a half-open [lo, hi)
test … using 101 makes a perfect score of 100 fall into the top band instead of
being dropped by the strict `< hi` comparison". A calibration that silently
discards its highest scorers is the failure mode this one line prevents.

## The sample it reports is the sample the bands hold

Two mechanisms keep `resolved` honest:

- **In-range filtering** (`:479-490`). Only decided outcomes whose predicted
  score lands inside `[RANGE_LO, RANGE_HI)` count. A null or legacy out-of-range
  score "buckets into NO band, so counting it toward the resolved sample would
  advertise more outcomes than the bands actually hold and bias the human-facing
  floor suggestion."
- **A partition invariant that throws** (`:505-514`). The band counts must sum to
  the in-range count; if they do not, a band definition introduced a gap or
  overlap and the function raises rather than "silently compute a floor
  suggestion over a sample that doesn't match the `resolved` count shown to the
  human."

## Corpus hygiene: upsert, not insert

`recordOutcome` upserts (`:118-133`) because "calibrate() counts every decided
row individually, so a re-record of the same real-world fact … used to land as a
second row that double-counted in the bands (at MIN RESOLVED = 4 a single
duplicate can move suggestedFloor a whole tier)." The identity is the submission
reference when present, otherwise the newest row with the same candidate
reference *and* the same outcome — and the comment draws the line the standard
draws: "A different outcome for the same name is NOT a correction — it stays a
fresh row (e.g. the same candidate across two postings)."

## The conclusion is a finding, not a sentence

`CalibrationRationale` (`:427-428`) is `{ kind, params }` over a closed set —
`insufficient | weak | raise | lower | calibrated` — because "the engine decides
WHICH of five fixed conclusions holds and with what numbers, and the control room
renders the sentence in the operator's language" (`:421-426`). The insufficient
branch returns `{ kind: "insufficient", params: { min: MIN_RESOLVED } }`
(`:524`), so the message a recruiter reads quotes the same constant the gate
used.

## One floor, in one place

`promoteSubmission` takes the floor as a parameter and both callers pass
`activePromoteFloor()` — the API route and the lifecycle orchestrator — because
"the old hardcoded `score >= 70` … diverged from the calibration-adjustable floor
the orchestrator actually promoted on" (`app/_lib/devcase-run.ts:773-778`). The
recruiter was reading advice computed against one threshold while the system
promoted on another.

## The clean arm exists, and it sits above the quality ladder

`verdictFor` (`app/features/insights/analytics/calibrationVerdict.ts:71`) returns
`"circular"` when `leakage.level === "high"`, and the docstring explains the
placement: the leakage branch "sits above the skill ladder, so no Brier score —
however good — can route a score-caused arm to `trustworthy`. That is
deliberately a property of this function and not of the copy, because copy
regresses and a decision table does not." `CalibrationLeakage` itself is computed
in `app/_lib/calibration.ts:385-411`.

## Deviations from the standard

- **The outcome definition is thin.** `hired | rejected` with an optional 1–5
  performance rating is the whole ground truth; there is no fixed horizon and no
  probation milestone, so "worked out" is effectively "was hired".
- **`MIN_RESOLVED = 4` is below any defensible statistical bar**, and the code
  says so. The standard's two-regime rule — a refusal threshold *and* a comfort
  threshold, with the caveat travelling with the value — is only half
  implemented: the caveat lives in the docstring (`:464-471`) rather than
  riding on the returned `Calibration` object to every surface that renders it.
- **No versioning of the floor against past decisions.** Nothing records which
  floor a given promotion was decided under, so a past verdict cannot be
  re-derived under the rule that actually produced it.
