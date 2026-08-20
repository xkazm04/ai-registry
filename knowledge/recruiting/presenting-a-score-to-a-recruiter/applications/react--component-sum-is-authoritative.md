---
layer: application
type: application
subject: presenting-a-score-to-a-recruiter
technique: component-sum-is-authoritative
stack: react
status: forged
---

# The breakdown invariant in the analysis report

The score card in this repo is a dial (`ScoreDial`) sitting above a bar chart
(`FactorChart`) of five weighted components. Both are fed from the same
analysis `score` object, and the invariant that keeps them from contradicting
each other lives in `app/_lib/format.ts`.

## The contract

`app/_lib/format.ts:483` states it as doctrine:

> An analysis score is a `total` plus five weighted components —
> experience / skills / roleSeniority / education / traits — whose individual
> maxima (25 / 30 / 23 / 12 / 10) sum to exactly 100. The total is *defined* as
> the sum of those parts: it is the figure a viewer adds up by eye from the
> FactorChart bars and the same figure ScoreDial paints on its 0–100 arc.

The failure it guards is named in the same comment: a bad generation returning
a `total` that disagrees with its components surfaces "as a dial reading 82
above bars that visibly add to 74: two different stories with no signal which
is right, quietly eroding trust in the report."

`SCORE_COMPONENT_KEYS` (`format.ts:518`) is the single list the sum is taken
over, so the dial's total and the bars can never be summed over different
parts, and `SCORE_COMPONENT_LABELS` is co-located so a rename lands once.

## Recompute, warn once, dev-only

`scoreComponentSum` (`format.ts:557`) sums the five keys, counting a
non-finite component as 0 so a malformed payload degrades to a number rather
than poisoning the sum with `NaN`. `reconcileScoreTotal` (`format.ts:586`)
returns that sum as the displayed total and, when the payload's own `total`
disagrees, calls `warnScoreContract` (`format.ts:572`) — de-duplicated per
distinct message, silenced in production so one bad analysis cannot spam a
user's console, loud in dev and test where an engineer can catch it.

The routing rule in the doc comment is the part that makes the invariant real
rather than decorative: *every* surface showing a total beside its breakdown
goes through the helper (the dial and chart in `ExtractionTab`, the compare
grid's Overall row), and `ResultPanel` runs the assertion **once per analysis
on load, regardless of which tab is open** — so the check does not depend on
someone expanding the breakdown.

## Both ends now hold — and the doc comment is stale

The comment at `format.ts:483` says the pipeline "mints `total` from the
model's own number … NOT recomputed from the parts". That was true; it no
longer is. `_score_from_payload` in `pipeline/jobfit/pipeline.py:718` now
computes `total = min(experience + skills + role_seniority + education +
traits, 100)` and documents the maxima as capping it at exactly 100, with the
`min()` called out as defensive belt-and-suspenders.

The generator's own claimed total was not deleted — it was demoted.
`_reported_score_total` (`pipeline.py:750`) extracts it purely as a signal,
and `_score_sanity_checks` (`pipeline.py:1298`) compares it against the
authoritative sum past `SCORE_TOTAL_TOLERANCE`, flagging a divergence "for
observability … turning a quiet generation defect into a visible, reviewable
one even though the bad number is no longer trusted." Both halves of the
technique's *fix it at the producer, and keep the display check anyway* rule
are present, and the display-side reconciliation is retained for records
written before the fix. The stale sentence in the formatter's doc comment is
the only loose end.

## The wire contract on the other scoring path

The live-match path carries the same discipline in its type rather than in a
reconciler: `ScoreDimension` in `app/features/shared/matchTypes.ts:24` puts
`percent`, `weight` and `contribution` "all on a single 0-100 scale so the
bars render with zero client-side math", with weights summing to 100 and
contributions summing to the total. `build_score_breakdown`
(`pipeline/jobfit/matching.py:621`) computes contribution and total from the
same un-rounded inputs so the rows sum to the total modulo per-row rounding.

The residual gap is precisely the one the technique's rounding rule addresses:
each `contribution` is rounded independently (`matching.py:642`,
`round(100 * w[key] * scores[key], 1)`), with no largest-remainder assignment,
so the displayed rows can miss the displayed total by a tenth. On this
breakdown the drift is sub-percent and invisible; the rule still stands, and a
coarser rounding precision would make it visible.

## Axis pinning, the same failure one level down

`app/_lib/factor-points.ts:10` carries the sibling incident. The five
`FACTOR_MAXES` (25/30/23/12/10) are fixed per-factor ceilings, and because
they differ, "raw values are NOT comparable across bars"; each bar encodes
`value/max` in `[0,1]`. `FACTOR_DOMAIN` (`factor-points.ts:25`) pins the axis,
after an auto-scaled axis drew "a candidate whose components were all weak
(experience 8/25, skills 7/30, …)" with their tallest bar at full height —
"a recruiter reads 'maxed out' where the true figure is 8/25" — and floated
per candidate so two charts could not be compared by eye. `factorPoints`
carries the raw `value` and `max` along for the tooltip "so the true figure is
never hidden".

One deviation from the standard remains here: `factorPoints`
(`factor-points.ts:37`) reads `raw[id] ?? 0`, so a missing component becomes a
measured zero rather than a null cell — the coercion the null-score policy
forbids one level up. Harmless while the schema guarantees all five keys;
wrong the day it does not.
