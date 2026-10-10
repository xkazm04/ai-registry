---
layer: application
type: application
subject: vehicle-archetype-balance
technique: weights-fit-to-sim-with-published-residuals
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: experiment
ab_verdict: better
---

# Death Ride: the weights outlived the physics they were fitted on

Read against the `firetv` repository's `deathride/main` branch at `d9990777` on 2026-10-10.
Anchors are relative to that tree. The version witness is
deathride/gradle/libs.versions.toml:3 "2.0.21". The sibling `process--power-rating-single-function`
application read the same rating at content commit `e1640f0` on 2026-10-01. Every number below
is seeded simulation with scripted drivers. Nobody has driven these classes for this run.

## The fit and the step it was fitted on

The weights table has not changed since the C1 roster commit `fd6b51a1` (2026-10-01 11:14).
That commit fitted the weights over a movement-only sweep:
deathride/core/src/main/resources/data/pr-weights.csv:5 "armorReduction,0,0.04,0.100264145" and
deathride/core/src/main/resources/data/pr-weights.csv:10 "brakeMps2,16,1,0.100197840".
Five hours later (`c1923384`, D2) every roster car moved to the two-axle solver. Every class
spec carries a geometry:
deathride/core/src/main/kotlin/dev/deathride/core/Cars.kt:28 "driftGeometry=DriftGeometry.forClass(i".
The step then branches on it:
deathride/core/src/main/kotlin/dev/deathride/core/World.kt:208 "DriftDynamics.integrate(car,input,spec,throttle,brake,dt,driftParameters)".
The design notes record what changed for handling. Before:
docs/concepts/deathride/D1-drift-research.md:23 "Mass affects contact impulses, **not handling**".
After: docs/concepts/deathride/D2-drift-model.md:5 "Dimensions and upgraded mass derive yaw inertia".
The merge note retired the old evidence:
docs/concepts/deathride/A0-drift-merge.md:15 "old balance evidence is historical and A3 must remeasure the merged rules".
No commit refit the weights. A `git grep` for refit, recalibration and the calibration output
finds only C1-era text. The positive control `maxWinShare` was found.

The project did not hide this. It relabelled the rating:
docs/concepts/DEATH-RIDE-PROGRESSION.md:9 "PR is a planning index, not a guarantee of equal lap strength".
It also called its ability pricing a hypothesis:
docs/concepts/deathride/A1-signature-abilities.md:34 "Zero adjustment is a calibration hypothesis, not evidence of equal expected strength".

## The experiment

A detached scratch worktree at `d9990777` ran the C1 harness (`:core:rosterReport`, movement
only) at 2,000 races per course cell with the harness's own seeds. It also ran the
shipping-ruleset harness (`:core:abilityReport`, combat on, abilities off and on) on a fresh
seed namespace. The performance figure is the one the project's audit uses: tier-mean mixed
time over the class's mixed time
(deathride/tools/audit-roster.py:98 "inverseTimeRatioToTier"). The residual is the PR ratio
to the tier budget minus that figure. Fit error is the sum of squared residuals over the ten
classes. Nothing was committed to the game.

| Arm | Fit error | Worst residual |
|---|---|---|
| Forge: fitted weights on C1's point-model data | 0.00183 | Comet +0.029 |
| A: shipped weights, movement harness on the axle solver | 0.00348 | Trail +0.032, Bastion -0.032 |
| A': shipped weights, combat and abilities on | 0.00354 | Line +0.035 |
| B: SLSQP refit, same +-3% bounds, movement harness | 0.00100 | Bastion -0.017 |
| B': SLSQP refit, combat and abilities on | 0.00111 | not recorded |

Eight of the ten classes have the same stats as at the forge (Line changed in A3/DV2, Quill in
A2), so their residual shift is the physics. The Club pair flipped. Bastion and Trail now
finish level (performance 0.998 and 1.002), while the rating holds them at 1.030 and 0.970,
exactly the tolerance edge. The budget check
(deathride/core/src/main/kotlin/dev/deathride/core/PowerRating.kt:28 "PR outside tier budget")
passes them, because it reads the same weights. The Pro tier went the other way: its
performance span tightened from 0.947-1.059 at the forge to 0.973-1.029.

**Verdict: better.** The residual table detected a calibration change that the budget check
could not see. A refit under the technique's own constraints cut the error by about 71
percent. The obligation the technique adds, refit when the step changes, is measured here,
not argued.

## What the refit showed about silent stats

The refit moved armour from about 0.1 to about 2.3 and braking to about 1.9-2.0 (both had been
on or near the fitter's 0.1 floor). It also moved mass from 5.0 to about 1.1, and on the
combat data it put handling on the floor. Armour got a weight even in the movement-only refit,
where armour does nothing. Ten classes against eight weights leave the unexercised stats
unidentified. The forge-time near-zero was the bound, not a price. The technique's "report
near-zero weights" rule would have missed a silent stat priced at 2.3. It now reads
"unidentified, whatever its value".

## Limits

Developed (upgraded) builds and the DV3 legal-shop sweep were not run. No byte replay against
the accepted A3/Z3 rows. In combat means, a wrecked entry counts as 300 s. One seed namespace
per harness. The refit's per-class residuals on combat data were not recorded.

## Reconciliation

Confirmed: residuals published beside the weights detect what the budget check cannot. Upward
lessons: refit when the step changes, with no stat change required; a weight on a bound is the
fitter's, not the stat's; an unexercised stat is unidentified at any value. Deviation: the
weights carry no stamp of the ruleset they were fitted on, so the solver swap tripped nothing.
