---
layer: application
type: application
subject: debt-and-loss-stakes-staging
technique: take-it-after-a-win
stack: kotlin
status: forged
verified_on: 2026-10-09
verified_against: kotlin@2.0.21
applied: experiment
ab_verdict: better
---

# Death Ride's seizure in code: after a win by chance

The companion `process` application read the seizure in Death Ride's design canon. This one
reads the code that performs it, and measures the timing rule against the seeded careers the
project already runs. The tree is the `firetv` repository's `deathride/main` branch at
`10974fa3`, read on 2026-10-09. The version witness is the Kotlin plugin
(`deathride/gradle/libs.versions.toml:3 "kotlin = \"2.0.21\""`). Anchors are root-relative to
that tree. Nobody has played the campaign. The careers below are driven by the project's AI
proxy drivers at three skills, so "the player" means a reference policy.

## What the code does

The take is a state change, not a deletion. It fires when the player prepares the finale,
`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:177 "RivalEconomy.prepare(it);DeathDuel.seize(it)"`,
and only on that event,
`deathride/core/src/main/kotlin/dev/deathride/core/DeathDuel.kt:21 "if(!Career.events[p.careerRound].elimination || seized(p))return"`.
Nothing in `seize` reads the debt, so the canon's "zero balance never prevents the seizure" is
literal. While the car is held, the garage refuses it
(`deathride/core/src/main/kotlin/dev/deathride/core/Commerce.kt:46 "Car seized - the supplied rig needs no purchase"`),
and victory gives it back:
`deathride/core/src/main/kotlin/dev/deathride/core/DeathDuel.kt:28 "if(s.seizedCar>=0){p.owned[s.seizedCar]=true;p.selectedCar=s.seizedCar;s.finale=2}"`.
That is the technique's "keep the economy whole": the object is held, and getting it back is
possible.

## The timing rule, measured

The technique says to stage the take right after a decisive win. Here the event before the
take is crown-6, a qualifier
(`deathride/core/src/main/resources/data/campaign.csv:35 "crown-6,Before the Crown,crown,crown-6-a,crown-6,0,0,3,LAPS,4,qualifier"`).
Only a boss event demands first place
(`deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:102 "if(events[p.careerRound].boss && position!=1)"`).
An ordinary event advances on any qualifying result. So whether the take follows a win is
whatever the field happens to give.

The project commits seeded career traces with a row per race
(`deathride/core/src/test/kotlin/dev/deathride/core/CampaignReport.kt:228 "trace.append(\"seed,skill,reward,race,event"`).
I read four of them: 2,000 careers each, from builds committed on 2026-10-03 and 2026-10-04.
For each career that cleared crown-6, I took the finishing position on the attempt that
advanced. The seizure fires on the next screen.

| Trace (build, buyer policy) | Careers clearing crown-6 | Won it | Share |
| --- | --- | --- | --- |
| `evidence/ai/z3/raw/after`, race | 1,085 | 799 | 73.6% |
| `evidence/ai/z3/raw/after`, PR | 1,056 | 853 | 80.8% |
| `evidence/ai/z3/raw/before`, race | 669 | 326 | 48.7% |
| `evidence/campaign/design-v2/after`, race | 1,215 | 324 | 26.7% |

The share moved from 27% to 81% across four balance builds, and none of those builds was
aimed at the seizure. In the newest build, 286 of the 1,085 seizures came straight after a
last-place finish. That is the "game piling on" placement the technique exists to prevent.

The alternative anchor is in the same tree. Boss events advance only on first place. In the
newest trace, every boss clear was a win: 2,000 of 2,000 at event 7, then 1,290, 1,247 and
1,188 of the same at events 14, 21 and 28. A take tied to a boss clear follows a win by rule,
not by sampling. A is the qualifier anchor, measured at 26.7% to 80.8%. B is the boss-clear
anchor, at 100% by construction and confirmed on 1,188 of 1,188 careers. On the attribute the
technique names, B is better.

It is not free. The last boss before the finale is event 28. Anchoring there moves the take
seven events earlier, which collides with the clause-nine plot planted at crown-5 and crown-6
(`deathride/narrative/lines.csv:104 "Clause nine is one sentence long and a week old."`). It
also creates the lean stretch the canon lacks, which is the cost and the gain at once. The other
option is to make crown-6 a win-gated event. That buys the timing with a wall in front of the
finale. Either one is the owner's call. Nothing has changed in the project.

## The stretch that is not there

Crown-7 follows the seizure directly. The dip is declared to the curve: crown-6 carries a ratio
target of 1.00, and the finale's supplied rig carries 0.525 inside its own band
(`deathride/core/src/main/resources/data/career-curve.csv:36 "crown-7,35,4,635,0.525,2.6,1700,4,supplied-rig,0.50,0.55"`).
The curve loader refuses a finale whose basis is not the rig
(`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:36 "if(p.ratioBasis!=if(event.elimination)\"supplied-rig\" else \"lap-field\")"`).
That is the lean-stretch technique's "declare the dip", held as a load-time check. What the tree
does not have is the stretch itself. The player first drives the rig in the decisive event,
which the lean-stretch technique names as its third naive design. The finale application of
this subject reads how survivable that event is.

## What this does not show

These are proxy drivers, not players, and positions in a sampled trace, not a played build. The
traces predate the tip by five days. Since then the debt rules and the seizure code have
changed only the duel's search speed and a story-card fallback, but the course laps have changed,
so the current share has not been measured. The swing across builds is the finding. Whether a
human who finished third blames Marrow or the game is the claim the technique rests on, and
nobody has asked one.
