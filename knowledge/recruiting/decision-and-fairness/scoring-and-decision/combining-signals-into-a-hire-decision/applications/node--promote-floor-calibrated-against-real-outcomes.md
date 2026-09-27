---
layer: application
type: application
subject: combining-signals-into-a-hire-decision
technique: promote-floor-calibrated-against-real-outcomes
stack: node
verified_on: 2026-09-27
verified_against: node@24
---

# Deriving the promote floor from recorded outcomes (Node/TypeScript)

`calibrate()` (`app/_lib/dev-outcomes.ts:658`) reads the recorded hire/reject
outcomes for one workspace, buckets them by the score that was predicted at
screening time, and answers two questions: does a higher score actually convert
better, and where should the promote floor sit. A human then acts on it — the
control page's "Apply suggested → N" button moves the live floor — which is why
every constant in the function is documented with why-it-holds-that-value
(`:620-653`).

## The four documented thresholds

| Constant | Value | Documented rationale (`:627-645`) |
| --- | --- | --- |
| `MIN_RESOLVED` (`:584`) | 4 | "do not calibrate until at least 4 *decided* (hired\|rejected) outcomes WITH AN IN-RANGE predicted score exist … 4 is a low "show me *something*" bar, not a statistically powered sample — it just stops the engine from making a recommendation off one or two data points" |
| monotonicity tolerance (`:723`) | 0.05 | "We permit a 5-percentage-point dip before declaring the trend broken, so ordinary sampling noise doesn't flip a genuinely-rising trend to "not predictive". The 0.05 is a judgement call … not derived" |
| majority-hire threshold (`:729`) | 0.5 | "the lowest band where a simple majority (≥ 50%) of promoted candidates were actually hired: the cheapest band that "pays off" more often than not. 0.5 is a plain coin-flip majority, chosen for being an obvious, defensible cut rather than an optimised one" |
| no-converging-band fallback (`:730`) | 85 | "when NO band reaches the 0.5 hire rate, fall back to 85 (the floor of the top BANDS tier): the most conservative advice available" — and, since the fallback is "advice, NOT a measured band", it can only ever carry `raise` or `weak` (`:643-645`, `:735-758`) |

Each entry says what it protects against and admits what it is not. That
admission is the load-bearing part: "none of these are tuned/learned — they are
deliberate, defensible defaults" (`:625-626`) is a far more useful thing for a
reviewer to read than a number presented as derived.

## Fixed bands, anchored, not fitted

`BANDS` (`:574-579`) is `[0,55) [55,70) [70,85) [85,101)`, and the comment at
`:561-573` states exactly the standard's rule: the boundaries are "HAND-CHOSEN
tiers, not learned from data — they stay constant no matter how many outcomes
accumulate". 55 is the default promote floor, "so the first band [0–54] is
exactly the "scored below the floor" region"; 70 and 85 split the promotable
range into borderline / good / strong, "round, legible cut-points, NOT fitted to
the observed hire rates".

The top bound is 101, not 100, "because band membership is a half-open [lo, hi)
test … using 101 makes a perfect score of 100 fall into the top band instead of
being dropped by the strict `< hi` comparison" (`:569-571`).

## The sample it reports is the sample the bands hold

- **In-range filtering** (`:666-678`). Only decided outcomes whose predicted
  score lands inside `[RANGE_LO, RANGE_HI)` count; a null or legacy out-of-range
  score "buckets into NO band, so counting it toward the resolved sample would
  advertise more outcomes than the bands actually hold".
- **A partition invariant that throws** (`:692-702`): the band counts must sum
  to the in-range count, or the function raises rather than "silently compute a
  floor suggestion over a sample that doesn't match the `resolved` count shown
  to the human."
- **The scan cap is disclosed** (`:597-617`): past `CALIBRATION_SCAN_LIMIT =
  1000` rows, `resolvedOf` tells the reader the bands saw a suffix of the
  history, not all of it.

## Corpus hygiene: upsert, not insert

`recordOutcome` upserts (comment `:175-190`, body `:217-290`) because a
re-record of the same real-world fact used to land as a second row that
double-counted in the bands ("at MIN RESOLVED = 4 a single duplicate can move
suggestedFloor a whole tier"). The identity is the submission reference when
present, and a different outcome for the same name "is NOT a correction — it
stays a fresh row". The read-then-write is one transaction behind a partial
unique index (`:116-142`), so a race cannot mint two decided rows.

## The conclusion is a finding, not a sentence

`CalibrationRationale` (`:594-595`) is `{ kind, params }` over a closed set —
`insufficient | weak | raise | lower | calibrated` — because "the engine decides
WHICH of five fixed conclusions holds and with what numbers, and the control room
renders the sentence in the operator's language" (`:588-591`). The insufficient
branch returns `{ kind: "insufficient", params: { min: MIN_RESOLVED } }`
(`:714`), so the message quotes the same constant the gate used.

## One floor, in one place

`promoteSubmission` takes the floor as a parameter, and all three callers — the
promote API route, the lifecycle orchestrator and the interview entry — pass
`activePromoteFloor()`, because "the old hardcoded `score >= 70` here diverged
from the calibration-adjustable floor the orchestrator actually promoted on"
(`app/_lib/devcase-run.ts:1046-1051`).

## Deviations from the standard

- **The bands mix two scores.** The floor is applied to the work-sample
  *transfer* score. The manual outcome form posts that score
  (`app/features/tools/devcases/useDevSubmissionRow.ts:150`). The automatic
  feed records `entry.matchScore` instead (`dev-outcomes.ts:448-451`, and
  `:387-388` for a rated hire), and since 2026-08-28 a promoted entry is written
  with `matchScore: null` (`devcase-run.ts:1171`), later filled by a *profile
  match* score if at all. The comment at `:417-421` still says the entry
  carries "its transferScore as matchScore". An update keeps
  `input.predictedScore ?? existing.predicted_score` (`:255`), so a later match
  score overwrites an earlier transfer score on the same row. The calibration
  corpus therefore holds rows on two scales, and the suggested floor is applied
  to one of them. This was found by reading the code; it was not executed.
- **The success threshold is a coin flip, not a cost ratio.** `0.5` is correct
  only if a false advance and a missed good hire cost the same; the comment
  says so honestly, and the standard now asks for the ratio to be stated.
  There is also no per-band minimum. `MIN_RESOLVED = 4` gates the total, and the
  comment admits a band "can be decided by a single outcome" (`:647-653`).
- **The small-sample caveat never reaches the reader.** The returned object
  carries `resolved`, `resolvedOf` and per-band `count`
  (`:606-618`), but no refusal/provisional/comfort regime. At four outcomes the
  "calibrated" rationale renders as well-calibrated, with no caveat.
- **The promote-floor corpus has no clean arm.** The auto-promote slate never
  promotes below the floor (`app/_lib/devcase-cohort-rank.ts:114-116`), so the
  lowest band fills only from manual entries. The leakage verdict and the 5%
  holdout (`app/_lib/calibration.ts:399-505`,
  `app/features/insights/analytics/calibrationVerdict.ts:60-82`) exist for the
  *match-score screening* floor only; `dev-outcomes.ts` has neither.
- **The outcome definition is thin.** `hired | rejected` with an optional 1–5
  performance rating; "worked out" is effectively "was hired".
- **No structured record of the floor a decision used.** The floor appears as
  text in the automation trail (`transfer score X vs calibrated floor Y`,
  `devcase-promote-verdict.ts:130`), and as structured facts only on the
  orchestrator's audit path. The card, the decision seal and the outcome row
  carry none. Floor changes are audited with a timestamp, so the history can be
  rebuilt, but not read off the decision. (The previous version of this
  application said nothing recorded it; the trail text has.)
- **The recommendation is per team; the floor it moves is not** — see the
  per-team application.
