---
layer: application
type: application
subject: campaign-anomaly-triage
technique: crater-vs-slow-bleed
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# Crater and slow bleed - zero-spend days kept out of the noise floor

Verified against the systedo-case workspace at commit `0582e186` (2026-10-14), Node 24.x.
The crater rule is the `roas_crater` change rule and the slow bleed is
`detectSlowBleed`, both in `src/lib/campaigns/triage.ts`. The bleed delegates its
verdict to the engine's one variance-gated weekly-run detector, which `detectTrends`
also uses, so there is a single decline implementation.

## What matched the technique

The crater rule is the four-clause form verbatim: prior return at or above the critical
multiple of target, current positive, retained share below 0.6, current below target.
The bleed buckets whole weeks, takes the ratio of sums, refuses the whole verdict on a
week with no spend, walks back from the latest bucket and requires a 25% cumulative
loss. The constants are named exports, and the retained share and critical multiple are
the same number as the technique recommends.

## The seam that did not hold

The technique's refusal on a zero-spend WEEK was honoured. A zero-spend DAY was not:
the noise floor was estimated from the de-seasonalised daily return of every calendar
day, so a campaign paused on weekends fed two zeros a week into the variance. The
variance is already conservative because the slide inflates it; the zeros pushed the
per-move bar past real week-over-week moves and silenced a clean slide. Across 200
seeded four-week series falling 45% with 15% daily jitter, the old code fired on 24
with weekends paused and 188 with every day spending. The fix estimates weekday weights
and variance from measured days only, and sizes the weekly standard error by the
measured days a week actually holds. It then fired on 137 of 200 weekend-paused series
and on the same 188 of 200 unpaused ones. Flat and recovering series stayed at 0 of 200
in both arms. The regression test pins one deterministic seed.

Return condition: count how many production campaigns have paused weekdays, which no
local store shows.
