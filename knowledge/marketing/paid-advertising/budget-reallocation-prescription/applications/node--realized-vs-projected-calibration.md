---
layer: application
type: application
subject: budget-reallocation-prescription
technique: realized-vs-projected-calibration
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Projection, realized read and calibration - three pure modules in a Czech adtech workspace

At commit `2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08) the workspace
splits the loop into three pure modules with no I/O: `src/lib/campaigns/simulate.ts`
(the linear projection and its confidence), `src/lib/campaigns/realize.ts` (the
seven-before/seven-after read) and `src/lib/campaigns/calibration.ts` (the median
multiplier). A runner persists what they compute; the modules themselves are
importable under the unit suite on Node 24 (`package.json` engines).

## The structural fact: the read says it is not an experiment, in the source

`realize.ts:6-11` is the honesty clause the technique requires, written where the
arithmetic lives:

> "it is not an experiment. Nothing here claims the delta was CAUSED by the
> change-set - the account moved for many reasons in those 14 days. It is the
> honest observable: the projection said +X, the touched campaigns then did +Y."

The windows are built at `realize.ts:130-134`: after = the apply day plus six,
before = the seven preceding, both day-aligned from `approvedAt` so the two windows
are the same shape regardless of the hour. `REALIZE_WINDOW_DAYS = 7` (line 18) and
`REALIZE_MIN_DAYS = 5` (line 24) carry their reasons in comments: a whole week on
each side so weekday seasonality cancels; five of seven leaves room for an
edge-day gap. Both are conventions and the technique labels them so.

The three honesty rules land as three branches of `realizeChangeSet`
(`realize.ts:118-166`):

- *Not due is not degraded* - lines 123-127 return `null` (not `insufficient`) for
  a set that is not `applied`, has no parseable `approvedAt`, or whose after-window
  has not elapsed. The doc comment at 109-113 notes that `approvedAt` is stamped
  even on a failed settle, so `status` is the only honest filter.
- *Insufficient is a state* - line 148 requires `covered.before >= 5 && covered.after >= 5`;
  `daysCovered` (91-103) counts the union of dates across the touched set, with the
  comment explaining that coverage is a property of the stored period, not the
  weakest campaign.
- *A ratio against nothing is null* - line 164: `ratio: measured && projected > 0 ? realizedValueDelta / projected : null`.

`touchedCampaignIds` (46-63) pushes a shift's recipient only when `toId` is
non-empty, so a pause (blank recipient) contributes its donor only; the comment
names the failure this prevents - a blank key pulling the account's un-keyed series
into the sums. The suite pins each branch: `test-unit/campaigns-realize.test.mjs:109`
(not-due returns null), `:128` (uncovered before-window degrades to insufficient),
`:141` (exactly five days still measures), `:152` (no touched campaign is
insufficient, not zero), `:162` (projection of zero yields null, not Infinity),
`:173` (a realized loss scores as a negative ratio rather than being hidden),
`:185` (a pause contributes its donor only).

## The calibration: median, clamp, minimum, disclosed

`calibration.ts:11-19` states the three conservatisms as design; the constants are
`CALIBRATION_MIN_SETS = 3` (line 24, "the least that can produce a median rather
than an average of one accident") and `CALIBRATION_CLAMP = [0.3, 1.5]` (line 30,
"beyond it the calibration would be claiming the projection is off by more than
the linear model's own error bars can justify"). `computeCalibration` (71-87)
admits only `status === "measured"` sets with a finite ratio and a positive
projection - the doc comment at 66-70 says an `insufficient` read "is excluded
rather than treated as a ratio of zero, which would drag the multiplier down on
missing data". Below the minimum, `neutralCalibration` returns multiplier 1 with
`reason: "insufficient-history"` (49-51), which is the disclosure.

`parseCalibration` (94-108) defends the read: a stored multiplier outside the clamp
band, or non-finite, reads as no calibration. The suite pins the median at
`campaigns-calibration.test.mjs:46` ("one freak week cannot move it"), the floor
at `:66` and `:72` (a negative median still clamps to the floor, never below zero),
the ceiling at `:77`, exclusion of insufficient reads at `:88`, and refusal of an
out-of-band stored multiplier at `:119`.

## Recipient half only

`simulate.ts:130-136` and the loop at 184-190: the multiplier `gainMul` scales
`to.conversionValue += amount * toValPerCzk * gainMul` and the conversions line,
and nothing on the `from` side. The comment: "The donor half is arithmetic, not a
prediction - the money demonstrably leaves the donor." Multiplying by exactly 1 is
an IEEE-754 identity, so the uncalibrated path is byte-identical to the
pre-calibration function (143-148), pinned in `campaigns-simulate-calibration.test.mjs`.

## The confidence cap

`SIM_LOW_CONFIDENCE_DONOR_SHARE = 0.5` at `simulate.ts:89`, with the comment that
it sits "comfortably above the recommender's own 40% shifts" so an
auto-recommendation always reads high-confidence. `moveDonorShare` (97-104) returns
0 for a pause, 0 for a criterion move, 0 for an unknown or zero `fromCost`, else
`amount / fromCost`; `simulationConfidence` (109-111) degrades the whole set on any
shift above the cap. Criterion moves are skipped before the donor lookup at
152-158, with the comment that a fabricated lift on the approval screen would be
worse than none.

## Deviation

The realized read has no lag term, no holdout and no calendar-event exclusion; a
promotion inside the after-window scores as a 1.5 ratio and feeds the median. The
median and the clamp are the workspace's whole defence against that, which is
adequate for a descriptive read and would not be for a causal one - the boundary
the technique draws to `attribution-and-incrementality`.
