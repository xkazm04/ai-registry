---
layer: application
type: application
subject: small-sample-honesty-in-hiring-analytics
technique: a-named-minimum-per-claim
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# A named minimum per claim — pure gate modules in a TypeScript hiring platform

The kp codebase realizes this technique as a family of **small, pure,
dependency-free modules**, each owning exactly one claim's floor, its reasoning
comment, and the predicate that enforces it. Every one of them is importable
under `node --test` without standing up the SQLite layer, which is the property
that makes the floors testable in isolation and therefore actually reviewed.

## The floors, and why none of them share a constant

| Claim | Constant | Value | Where |
| --- | --- | --- | --- |
| Any headline metric in the shareable pack | `MIN_SAMPLE` | 8 | `app/_lib/metric-pack.ts:37` |
| Recruiter capacity is a signal at all | `MIN_OPEN_ROLES` | 3 | `app/_lib/metric-pack.ts:41` |
| A stage may be called a bottleneck | `BOTTLENECK_MIN_SAMPLE` | 3 | `app/_lib/analytics-bottleneck.ts:14` |
| An offer acceptance rate may render | `MIN_OFFERS` | 5 | `app/_lib/analytics-offer.ts:15` |
| A reliability curve may be drawn | `MIN_CALIBRATION_OUTCOMES` | 20 | `app/_lib/contract-constants.generated.ts:17` |
| A selection-rate ratio may be asserted | `ADVERSE_IMPACT_MIN_COHORT` | 30 | `app/_lib/adverse-impact.ts:39` |
| A comparative verdict over a field | `GROUP_EVAL_MIN_COHORT` | 2 | `app/_lib/group-eval-cohort.ts:23` |

Seven claims, seven numbers spanning 2 to 30, and each carries its reasoning in
the doc comment above it. That spread is the technique's whole argument: any
single shared threshold would have been wrong for six of these.

## Each justification is written down

- `metric-pack.ts:34-36` sizes 8 as *"roughly a quarter of hiring for a mid-size
  team — enough to stop a single outlier hire from moving a headline number by
  tens of percent"* — a headline floor argued from organizational scale, not
  from statistics, exactly as the technique prescribes for a figure that will be
  repeated outside the room.
- `analytics-bottleneck.ts:6-10` argues its floor behaviourally: *"a confident
  'candidates in X have waited N days on average' backed by a single stale entry
  (n=1) erodes trust and misdirects effort."* The cost of being wrong once is
  recruiter attention, so the floor is small but strictly greater than one.
- `analytics-offer.ts:10-15` sizes `MIN_OFFERS = 5` explicitly *relative to* its
  siblings — *"offers are the rarest pipeline event, so this floor sits well
  below the calibration outcomes gate"* — which is what a per-claim floor looks
  like when the claim's evidence is structurally scarcer than its neighbours'.
- `adverse-impact.ts:22-39` is the only one that cites an external authority: the
  EEOC Uniform Guidelines' own caution that a four-fifths difference "based on
  small numbers" does not establish adverse impact, then adopts n ≥ 30 as the
  standard rule of thumb for a stable proportion. A statutory surface takes a
  statistical floor, and the module says so rather than picking a product number.
  The guideline itself names no head-count, which the comment concedes (*"There is
  no single codified floor"*), and the floor is on group size rather than on power:
  see the state-what-the-sample-could-have-seen application for what a group of
  thirty could and could not have shown.

## The two-floors lesson, stated in the code

`group-eval-cohort.ts:19-23` is the clearest instance of the "two questions, two
minimums" rule, and it names the distinction in the comment rather than leaving
it to be inferred: `GROUP_EVAL_MIN_COHORT = 2` is *"a HEAD-TO-HEAD comparison
floor, deliberately small — distinct from `adverse-impact.ts`'s
`ADVERSE_IMPACT_MIN_COHORT` (n >= 30), which guards a statistical
SELECTION-RATE. A comparison's floor is simply 'more than one thing to
compare'."* Same codebase, same cohort of candidates, floors an order of
magnitude apart, because one asks a structural question and the other a
distributional one.

The regime floor appears at `metric-pack.ts:39-41`: `MIN_OPEN_ROLES = 3`, with
*"recruiter capacity below this many open roles per recruiter is not a capacity
signal, it is a quiet quarter. Stated, not hidden."* It is deliberately kept as
a second constant beside `MIN_SAMPLE` rather than folded into it — the two
refuse for different reasons.

## The evidence unit is not the display unit

The metric pack samples `recruiter_hours_saved` in **actions**, not hires
(`MetricPackInput.automationRoi.totalActions`, `metric-pack.ts:106`), and the
`basisHoursSaved(actions)` string reports that count to the reader. A workspace
with hundreds of assisted actions and three hires gets a measured hours-saved
figure and a not-measurable cost-per-hire, which is the correct outcome and is
only reachable because the floor was placed on the observations that carry the
claim. This is recorded as a preserved constraint in
`docs/product/uat-insights/2026-08-17-analytics-sections.md:107` (guardrail G7).

## The floor is published, not private

Every gate echoes its own threshold into the result so the interface can render
progress rather than a bare refusal: `minOffers` on `OfferConversion`
(`analytics-offer.ts:38`), `minOutcomes` on `CalibrationResult`
(`calibration.ts:39`, commented *"echoed so the UI can render 'N /
minOutcomes'"*), and `sample` on every `Metric` (`metric-pack.ts:52`). Since 2026-09-23 the pack goes one step further and carries `need` on every
blocking row (`metric-pack.ts:57-61`): the shortfall in the row's own unit, whole
weeks at the recent pace and the date, or the named reason there is none (see the
state-the-accrual-horizon application). The result is a "K of N needed" line instead of an unexplainable empty panel — the
difference between a refusal recruiters trust and one they report as a bug.

## The count must be the rows the arithmetic used

On 2026-08-29 an explorer pass found the metric pack certifying a headline off a
sample of five against its own floor of eight. `buildMetricPack` sampled
`time_to_hire` with `input.hired`, but the median it labels is computed over the
narrower set of terminal rows that also carry `created_at`, `stage_changed_at` and
a non-negative duration: nine hires, five usable on the shipped corpus. The pack
printed "over 9 hires", `sample: 9`, `status: "measured"`, `certifiable: true`. The
producer half had already been fixed and pinned; nothing read the field, so the
divergence was visible in the payload and still published. The fix
(`acaf90157`) adds an optional `timeToHireSamples` to `MetricPackInput` and builds
both the metric and its `basis` prose from it — *"a basis that names a bigger
population than the statistic is the same lie one sentence further down"* — and
the corpus now reports sample 5, `thin`, "over 5 hires", not certifiable. That is
the technique's unit rule extended from the display unit to the filtered subset,
and it was found by wandering, not by a gate: no floor test in the tree read the
count the arithmetic ran over.

## What the repo does not do

The gap the first version of this note recorded — no floor beneath the headline
figures — has narrowed. Period-over-period movement is now gated per cell:
`MIN_RATE_DELTA_N = 5` (`analytics-deltas.ts:69`) applies to each side on its own
n (`:94-97`), to source and channel rows the same way (`:123`), and a thin movement
is withheld with its reason (`thinCurrent`, `thinPrior`, `thinBoth`) rather than
shown. What remains is what that floor is sized from: five is the count at which one
observation moves a rate twenty points, a granularity floor, and a movement
between two rates each on five carries an interval of roughly sixty points either
way. The gate stops the thinnest movements; it does not make the ones it lets
through precise. Whether the *levels* of the segmented rows (a source's own
conversion rate) carry their own floor was not re-read in this pass. The standard
stands: a per-period rate needs a per-period minimum, sized from what the claim
needs rather than from what is convenient to gate.
