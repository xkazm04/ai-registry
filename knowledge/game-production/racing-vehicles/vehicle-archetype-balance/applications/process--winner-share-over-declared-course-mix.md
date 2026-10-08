---
layer: application
type: application
subject: vehicle-archetype-balance
technique: winner-share-over-declared-course-mix
stack: process
status: forged
verified_on: 2026-10-01
---

# Replacing an unreachable entry-rate gate with winner share over a declared mix

Source: the same ten-class arcade racer, content worktree
`firetv-deathride-content` at commit `e1640f0`, plus the design document in
`firetv-deathride`. All results are seeded simulation of stock movement
(2,000 races per scenario, six-car fields, twenty scenarios). Nobody has felt the classes, and
combat fairness is outside this sweep.

## The brief's gate and why it could not fire

The design set the gate per entry: `docs/concepts/DEATH-RIDE-PROGRESSION.md:43` "no class wins more than 55% of entries across the mixed track set"
(source repo `firetv-deathride`), alongside the requirement that every class
is "the best class (by mean finish time) on at least one track type and the worst on at least one".
The first 40,000-race sweep followed it literally, and the review recorded the defect:
`docs/concepts/deathride/C1-roster-v2.md:25` "Its maximum possible rate was 33.3%, so it was not an informative dominance check."
With three copies of each class in a homogeneous field the rate cannot exceed one third, so a
fifty-five percent threshold was a gate that could not be failed. The sweep's summaries were kept
as initial evidence and acceptance moved to the winner share:
`C1-roster-v2.md:25` "replaced acceptance with class share of race winners".
The threshold itself did not move: `deathride/core/src/main/resources/data/roster-rules.csv:14` "maxWinShare,0.55"
is the same fifty-five percent, now applied to a quantity that can reach it.

## The declared mix

The mixture is data, read by the harness and quoted by the report:
`deathride/core/src/main/resources/data/roster-courses.csv:2` "technical,45,20,10,Asphalt,0.25",
`roster-courses.csv:3` "straight,700,120,14,Asphalt,0.50" and
`roster-courses.csv:4` "loose,100,32,12,Gravel,0.25". The report labels it as an assumption
and not a claim about players: `C1-roster-v2.md:25` "This is a content mixture assumption, not a claim about human track choice."
The long straight carries half the weight, so a class that wins straights is helped by the
mix; per-course results are published separately for that reason.

## A failing gate and the rerun that was required

`C1-roster-v2.md:25` "Champion initially gives Kestrel 61.3% of this mixture, which fails."
The fix was a one-point change to the heavy rival's launch acceleration, and
`C1-roster-v2.md:29` "The acceleration-only correction overcompensated" records that the first
cure overshot: its partial sweep already exceeded the 55% limit. The accepted car settled at
acceleration 9 and grip 7, and the full eight-thousand-race tier rerun passed with
`C1-roster-v2.md:29` "Bulwark wins 51.7875% of the mixture, loses 3.43 seconds on the technical course, and gains 15.36 seconds on the long straight",
and unchanged tiers reused their accepted samples (`C1-roster-v2.md:29` "are reused, not rerun for cosmetic metadata changes").
The same document states the instrument's evidence of input:
`C1-roster-v2.md:31` "all entries resolved and 2,000 distinct terminal hashes per scenario" and
"Twenty first-seed replays on the final code/data match the accepted raw rows exactly".

## A role fixed by authored stats

The Comet class originally lost the fast course too. The fix was authored, not a rating tweak:
`docs/concepts/deathride/W2-cars-and-stats.md:47` "Comet originally lost on fast too; increasing authored acceleration/grip to 6/4 exposed its intended speed role while leaving tight-track weakness."
The dispatch cited line 88 of this file; it has 51 lines and the passage is line 47.

## Limits the source states

The synthetic straight takes up to about 242 seconds and "exceeds the playable host's
180-second ceiling" (`C1-roster-v2.md:35`), so it isolates top speed and is not a pacing claim.
Owner feel and warning-colour presentation are "not measured" (`C1-roster-v2.md:35`).

## Reconciliation

Confirmed: winner share with a published mix, per-course companions, mandatory full rerun, byte
replay. Upward lessons: compute a gate's maximum attainable value before running forty thousand
races; a correction near a threshold can overshoot. Deviation: the design document still states
the entry-rate wording, and the dispatch's line numbers for two anchors did not hold.
