---
layer: application
type: application
subject: small-sample-honesty-in-hiring-analytics
technique: a-named-minimum-per-claim
stack: node
status: forged
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
| Any headline metric in the shareable pack | `MIN_SAMPLE` | 8 | `app/_lib/metric-pack.ts:36` |
| Recruiter capacity is a signal at all | `MIN_OPEN_ROLES` | 3 | `app/_lib/metric-pack.ts:40` |
| A stage may be called a bottleneck | `BOTTLENECK_MIN_SAMPLE` | 3 | `app/_lib/analytics-bottleneck.ts:13` |
| An offer acceptance rate may render | `MIN_OFFERS` | 5 | `app/_lib/analytics-offer.ts:15` |
| A reliability curve may be drawn | `MIN_CALIBRATION_OUTCOMES` | 20 | `app/_lib/calibration.ts:15` |
| A selection-rate ratio may be asserted | `ADVERSE_IMPACT_MIN_COHORT` | 30 | `app/_lib/adverse-impact.ts:39` |
| A comparative verdict over a field | `GROUP_EVAL_MIN_COHORT` | 2 | `app/_lib/group-eval-cohort.ts:23` |

Seven claims, seven numbers spanning 2 to 30, and each carries its reasoning in
the doc comment above it. That spread is the technique's whole argument: any
single shared threshold would have been wrong for six of these.

## Each justification is written down

- `metric-pack.ts:33-36` sizes 8 as *"roughly a quarter of hiring for a mid-size
  team — enough to stop a single outlier hire from moving a headline number by
  tens of percent"* — a headline floor argued from organizational scale, not
  from statistics, exactly as the technique prescribes for a figure that will be
  repeated outside the room.
- `analytics-bottleneck.ts:5-10` argues its floor behaviourally: *"a confident
  'candidates in X have waited N days on average' backed by a single stale entry
  (n=1) erodes trust and misdirects effort."* The cost of being wrong once is
  recruiter attention, so the floor is small but strictly greater than one.
- `analytics-offer.ts:12-15` sizes `MIN_OFFERS = 5` explicitly *relative to* its
  siblings — *"offers are the rarest pipeline event, so this floor sits well
  below the calibration outcomes gate"* — which is what a per-claim floor looks
  like when the claim's evidence is structurally scarcer than its neighbours'.
- `adverse-impact.ts:22-39` is the only one that cites an external authority: the
  EEOC Uniform Guidelines' own caution that a four-fifths difference "based on
  small numbers" does not establish adverse impact, then adopts n ≥ 30 as the
  standard rule of thumb for a stable proportion. A statutory surface takes a
  statistical floor, and the module says so rather than picking a product number.

## The two-floors lesson, stated in the code

`group-eval-cohort.ts:18-23` is the clearest instance of the "two questions, two
minimums" rule, and it names the distinction in the comment rather than leaving
it to be inferred: `GROUP_EVAL_MIN_COHORT = 2` is *"a HEAD-TO-HEAD comparison
floor, deliberately small — distinct from `adverse-impact.ts`'s
`ADVERSE_IMPACT_MIN_COHORT` (n >= 30), which guards a statistical
SELECTION-RATE. A comparison's floor is simply 'more than one thing to
compare'."* Same codebase, same cohort of candidates, floors an order of
magnitude apart, because one asks a structural question and the other a
distributional one.

The regime floor appears at `metric-pack.ts:38-40`: `MIN_OPEN_ROLES = 3`, with
*"recruiter capacity below this many open roles per recruiter is not a capacity
signal, it is a quiet quarter. Stated, not hidden."* It is deliberately kept as
a second constant beside `MIN_SAMPLE` rather than folded into it — the two
refuse for different reasons.

## The evidence unit is not the display unit

The metric pack samples `recruiter_hours_saved` in **actions**, not hires
(`MetricPackInput.automationRoi.totalActions`, `metric-pack.ts:73`), and the
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
(`calibration.ts:36`, commented *"echoed so the UI can render 'N /
minOutcomes'"*), and `sample` on every `Metric` (`metric-pack.ts:51`). The
result is a "K of N needed" line instead of an unexplainable empty panel — the
difference between a refusal recruiters trust and one they report as a bug.

## What the repo does not do

There is no per-claim floor for the segmented and per-period breakdowns beneath
the headline figures; gating is strongest at the metric level and thins out at
the drill-down, which is the deviation the gate-each-cohort technique names. The
standard stands: a per-period rate needs a per-period minimum, and the fact that
the floors here are concentrated on top-level claims is a gap in the
implementation, not a softening of the rule.
