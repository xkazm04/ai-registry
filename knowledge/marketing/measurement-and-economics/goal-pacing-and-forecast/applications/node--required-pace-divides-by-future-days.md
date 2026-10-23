---
layer: application
type: application
subject: goal-pacing-and-forecast
technique: required-pace-divides-by-future-days
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Required pace divides by future days - the pace was right and the days beside it were not

Verified against `systedo-case` at commit `7bbd1cab` (2026-10-22), `package.json` engines
`node: 24.x`. The prescription lives in `monthlyPacing()` in `src/lib/metrics/pacing.ts`
and is read by one dashboard card, `src/components/dashboard/GoalPacing.tsx`.

## What the tree already did

The arithmetic follows the technique line for line. The gap is max(0, goal minus
month-to-date). The future-day count is the month's length minus the day-of-month of the
latest point, so a stale series prescribes from its own last day. Required daily is the gap
over future days, and zero when none remain. Recent daily is (projection minus
month-to-date) over the same future days. The ratio is zero when recent is zero. A unit
test pins the gappy case: five missing interior days, required divided by 6 and not by 11.
The card hides the required tile once the goal is banked, and it prints the recent pace
beside the required one. Steps 1-6 and decision rule 1 were already in place, so the seam
was chosen to falsify the one rule a module test cannot see: what the surface prints
beside the number.

## The seam chosen to falsify "a reader dividing the gap by the days shown gets the tile's number"

The module keeps two denominators, as the technique says. `daysRemaining` is the month's
length minus the present-day count, which counts interior gaps as remaining. It weights
the projection and the band. `futureDays` drives the prescription. Only the first was on
the result object. The card printed it twice: in the header ("20/31 days · 11 remaining")
and in the "Days remaining" tile, directly beside a required pace computed over 6 days.
Decision rule 2 names this failure exactly, and nothing on the surface said that any days
were missing.

## A and B

Six fixtures went through the real `monthlyPacing`: gapless behind, gapless ahead, gappy
behind (5 interior gaps), gappy with the goal banked, gappy with data reaching the month's
last day, and a complete month. Target: fixtures where the days shown are not the
future-day count and no missing-day count is shown. A: 3 of 6. B: 0 of 6. Reader check
(gap divided by the days shown equals the tile, wherever the tile shows): A fails once
(1 818 against 3 333 per day), B never. B adds `futureDays` and `missingDays` to the result
and one pure helper, `daysAheadDisplay`, that both the header and the tile read. The card
prints the future days and appends "5 days without data". Floor: the gapless and complete
fixtures print exactly what they printed before. The 26 pacing tests pass (3 new). Typecheck,
lint and the context-decay check are clean. The full unit suite failed only where
origin/master already fails: patterns-embeddings and two generated-instruction-drill tests,
plus a campaigns-local-store diff test that failed once in three solo runs. None of them
touches metrics.

The project's line ratchet for components refused the first push: the card had grown from
397 to 410 lines against a 200-line ceiling. The cs/en table was moved verbatim into a
colocated strings file, and the card now has 314 lines. The master pre-push gate then
blocked on those base reds, so the change went to branch `cur/rpdfd-days-ahead` (6dc7a53c).
It was not pushed to master.

## The structural fact

The gappy fixture whose data reaches the month's last day is the case the technique did
not state. There are no future days, so the required pace is zero and its tile hides. But
two days are missing, so the month is not complete, and the card shows neither the final
figure nor a prescription. Under A, the only thing that explained the empty slot was
"2 remaining", which was false: those were two past days with no data. Under B the card
reads "0 remaining · 2 days without data". The technique gained that sentence. This is
also the third application in this subject where the arithmetic held and the surface
around it did not. The band application found the probability gate bypassed in the recap,
and the implied-spend application found a capped answer worded as an estimate. The golden
path now carries the rule at subject level.

## What this realization cannot do

It does not label staleness. A series that stopped a week ago prescribes from its own last
day, as the technique requires, but the card does not say that the last day is not today.
It does not warn when the required pace exceeds anything the account has delivered in a
week (decision rule 4). It does not pace an efficiency goal. How often live accounts have
interior gaps was not measured: the sample dataset has none.
