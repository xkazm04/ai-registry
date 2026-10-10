---
layer: application
type: application
subject: vehicle-archetype-balance
technique: winner-share-over-declared-course-mix
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: experiment
ab_verdict: better
---

# Death Ride: the share gate on the axle solver, read beside its margins

Read against the `firetv` repository's `deathride/main` branch at `d9990777` on 2026-10-10.
Anchors are relative to that tree. The version witness is
deathride/gradle/libs.versions.toml:3 "2.0.21". The sibling `process--winner-share-over-declared-course-mix`
application read the C1 acceptance at content commit `e1640f0`. All figures are seeded
simulation: scripted equal drivers, 2,000 races per course cell, six-car fields. Owner feel is
unmeasured.

## The gate in code

The harness gates the mixed share against the data threshold:
deathride/core/src/test/kotlin/dev/deathride/core/RosterReport.kt:79 "exceeds mixed race-winner share".
At full sample it throws:
deathride/core/src/test/kotlin/dev/deathride/core/RosterReport.kt:88 "check(findings.isEmpty())".
The project still presents this harness as the C1 instrument (deathride/README.md:97 "C1: ten cars now form five two-car tiers"), but its
acceptance moved to the combat-on ability harness after the solver merge. A3 kept the mix and
the threshold (docs/concepts/deathride/A3-balance-and-device.md:43 "Course weights and the 55% gate were retained.").
It recorded the drift on the merged rules, on the same line:
docs/concepts/deathride/A3-balance-and-device.md:43 "its 200-race/cell abilities-off baseline was already 55.375% on the merged drift model".
The gate kept firing on fresh seeds after tuning:
docs/concepts/deathride/DV3-owner-review-and-acceptance.md:42 "The gate genuinely fired on fresh seeds."
An owner check records a cap expansion turned down on this gate:
deathride/OWNER-CHECKS.md:286 "shifted class winner share too far and is not shipped".

## The experiment: one roster, two harnesses

| Tier | Movement only (C1 harness) | Combat, abilities off | Combat, abilities on | Accepted |
|---|---|---|---|---|
| Rookie | Needle 56.175% [55.3, 57.0], fails | 52.74% | 50.16% | 52.76% (A3) |
| Club | Trail 51.08% | 50.78% | 50.55% | 51.18% |
| Pro | Comet 50.09% | 50.08% | 50.18% | 50.04% |
| Elite | Vandal 50.56% | 50.50% | 50.43% | 50.56% |
| Champion | Bulwark 51.83% | 51.33% | 51.16% | 51.79% (C1) |

The interval is a normal approximation over the weighted mixture. Every pair keeps a best and
a worst course type in every arm.

**Verdict: better.** The share is a gate that can fire. On the shipping physics it fails a
tier at 56.2 percent, where the entry-rate gate it replaced had a ceiling of 33.3 percent and
could not. The run also earns two conditions. First, the movement-only harness and the
shipping harness disagree on Rookie: the verdict belongs to the ruleset the harness ran, and a
harness kept after combat joined the game measures a different game. Second, the share is
not a margin.

## Per-course margins (movement harness)

| Tier | Technical | Straight | Loose |
|---|---|---|---|
| Rookie | Needle +5.66 s, 97.85% | Line +6.10 s, 83.90% | Needle +5.92 s, 94.65% |
| Club | Trail +17.58 s, 100% | Bastion +19.60 s, 97.85% | Trail +23.82 s, 100% |
| Pro | Flint +9.27 s, 99.85% | Comet +24.72 s, 99.90% | Flint +11.04 s, 99.60% |
| Elite | Quill +6.90 s, 99.80% | Vandal +20.51 s, 100% | Quill +6.73 s, 97.95% |
| Champion | Kestrel +8.28 s, 97.70% | Bulwark +16.12 s, 99.85% | Kestrel +9.38 s, 94.70% |

Twelve of fifteen cells are at least 97 percent one class. The mixed share therefore sits near
each class's owned course weight (0.25 + 0.25 against 0.50), and the gate reads leakage. Rookie
fails because Needle takes 16.1 percent of the straight, which carries half the weight. Rookie
also has the smallest margins in the roster, about six seconds everywhere. The Champion tier
shows a margin moving under unchanged stats. C1 accepted Bulwark at 3.43 s lost on technical
(docs/concepts/deathride/C1-roster-v2.md:29 "loses 3.43 seconds on the technical course").
On the axle solver it loses 8.28 s. Its share barely moved (51.79 to 51.83).

## Limits

The harness never varies driver skill, so the per-skill condition is unmeasured here. The
choose-per-course condition does not bind: Death Ride's career carries a bought car through
fixed events, so the mixture describes the decision. Wrecked entries count as 300 s in combat
means. One seed namespace per harness. No byte replay of accepted rows.

## Reconciliation

Confirmed: the share gate is reachable and fires, the mix is data, and pairs keep their courses.
Upward lessons: publish per-course margins, because a share near the owned weight is not
closeness; the verdict belongs to the harness's ruleset. Deviation: the README still names the
movement-only harness, which now fails Rookie, as the roster instrument.
