---
layer: application
type: application
subject: delivery-analytics
technique: delivery-metric-denominators
stack: node
status: forged
verified_on: 2026-08-20
---

# Sample floors, trend points, and the tier that was retired (node)

## A minimum-sample floor on every derived rate

`src/lib/analyze/pulls.ts:296-336` returns the delivery rate family, and every
*derived* rate in it carries the same `>= 5` floor, with the reasoning recorded
in the code rather than in a wiki nobody reads:

- `reviewedRate` — null below 5 human-authored merged proposals, because "at
  1-4 human-merged PRs a single unreviewed (e.g. self-merged) PR swings the
  rate 25-100pts, drags D6 through prRigor's 0.5 weight, and can flip the rigor
  axis / posture near the 50 threshold off a meaningless sample."
- `aiGovernedRate` — the comment records that the floor was *raised* from 3 to
  5: "At the old `>= 3` floor, a single unreviewed AI PR in a 3-PR window swings
  the rate ~33pts."
- `aiTrailerRate`, `aiPreReviewedRate`, `reworkRate` — the same floor over
  merged proposals.
- `aiReworkRate` (`pulls.ts:335`) floors on **both** denominators —
  `merged >= 5 && aiInvolvedMerged >= 5` — because a ratio whose numerator
  population is a subset needs its own sample floor, not the parent's.

The floors are explicitly kept "in lockstep", and downstream the null is
honoured rather than coerced: `applyPrSignals` (`pulls.ts:388-396`) drops the
review term and renormalizes the remaining weights instead of substituting
zero. Note also that the *undenominated* counts (`avgReviews`, `smallPrRate`,
`revertRate`) do not carry the floor — the floor guards rates that feed scored
dimensions, which is where a swing becomes a verdict.

`reworkRate` additionally ships its epistemic status in the field's own doc
comment (`src/lib/db/org-delivery-trend.ts:103-106`): a lower bound by
construction, "null means 'not measurable', a number means 'at least this share
was rolled back in the window'." The construction reasons are listed at
`pulls.ts:245-256` — a manually renamed revert, a revert whose target merged
before the window, and a revert landing after the scan all escape.

## What a point on the delivery trend means

`src/lib/db/org-delivery-trend.ts:1-24` opens with a header titled "WHAT A
POINT MEANS (say it, don't imply it)", and it is the clearest statement of the
technique in the codebase:

- One point is one calendar day in a canonical organization time zone,
  half-open, aggregated over the scans that actually ran that day.
- It is "a *sample*, not a fleet census: on a day when only one repo was
  scanned, that day's rates describe that one repo."
- The rejected alternative is named: a latest-scan-per-repo-as-of-day
  reconstruction "would silently carry a stale repo's rates forward for
  months". The chosen fix is disclosure — "each point therefore carries its own
  `scans` / `repos` / `prs` sample size so the UI can show what is behind it."
- Weighting mirrors the non-trend surface exactly, by each scan's `analyzed`
  count, and "a nullable rate … contributes only where present and stays null
  when no scan that day carried it; null is never coerced to a measured 0."
- A point whose inputs all came from the deterministic mock engine carries
  `mock: true` (`org-delivery-trend.ts:110-112`): "such a point is not
  comparable to a live-scored one, and the chart draws it hollow rather than
  asserting it is."

## Narrowing the forecast type so no consumer can misuse it

`org-delivery-trend.ts:111` and its doc comment implement the technique's
type-level enforcement. The shared `forecastTrajectory` helper returns slope
*plus* `currentLevel` / `projectedLevel` / `eta`, whose semantics are maturity
bands over a 0-100 score. The delivery trend reuses the fit but exposes a
"DELIBERATELY NARROW" type in which "only the *slope* fields survive to the
consumer", because "review coverage is not a maturity score, so projecting it
into 'L4 in ~6 weeks' would be a category error dressed as a forecast."
Narrowing at the producer "means no consumer can render it by accident — the
same 'enforce it where the data is made' pattern the contributor privacy floor
uses."

## Nothing synthesized reaches a customer surface

`src/features/bought/delivery/ai/aiDeliveryModel.ts:10-21` records the
retirement of a `simulated` fidelity tier. The tier filled spend columns "from
an FNV hash of the repo name — plausible dollar figures, seat counts and plan
assignments that no provider ever reported. The UI blurred them behind a
'locked' treatment, but the MODEL still produced them, so every derived total
(annual spend, idle spend, ungoverned spend, cost/AI-PR) was arithmetic over
fabricated input."

Two rules survive the fix and generalize:

1. **Enforce at the model, not the presentation.** A blurred render is not a
   suppression; the remaining tiers are `measured`, `allocated` (an explicitly
   distributed real total) and `none`, and there is no representation for a
   synthesized value.
2. **`none` is not zero.** Line 19: "`none` != '$0 spent'. Every spend field is
   zero because nothing was measured, and the UI renders those cells empty with
   a connect prompt rather than as money."

The module also keeps the boundary visible in the other direction —
"Everything adoption/governance-related is always real (git)" — so a reader can
tell which half of a joined model is measured and which half depends on an
integration being connected.

## Deviation

The five-part label the technique requires (numerator predicate, denominator
population, window, exclusions, sample size) travels with the trend points but
not with every surface that renders a rate: `smallPrRate`, `revertRate` and
`botAuthoredRate` are emitted as bare percentages over `analyzed`
(`pulls.ts:313-317`) with the population implied by the field name. The
standard stands — the denominator belongs on the metric at definition time,
because the moment a number travels is not predictable from where it is
computed.
