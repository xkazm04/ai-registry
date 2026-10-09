---
layer: application
type: application
subject: racing-career-economy
technique: pr-ratio-boss-dip
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: unmeasurable
---

# Death Ride's rating curve: the authored dips flattened, the realised ones walled

The tree is the `firetv` repository's `deathride/main` branch at `d9990777`, read on
2026-10-10. The version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Anchors are
root-relative to that tree.

Every figure below comes from the committed seeded ledgers under
`deathride/evidence/campaign/design-v2/after/`: AI proxy drivers, 2,000 careers per buying
policy. The project's own caveat stands
(`deathride/evidence/campaign/design-v2/README.md:34 "All Stick checks and human pacing, fairness and enjoyment judgments remain pending."`).

The traces were committed on 2026-10-03 at `f886edc8`. Two later commits changed progress:
- `c082fd4b` made boss promotion require first place;
- `a053c363` shortened the lap counts.

Neither changed the money code or data. So the money and rating figures still describe the
current rules, but the attempt counts were measured under a looser boss rule.

## The curve is data, with bands

The rating is one formula over stat weights held in data
(`deathride/core/src/main/kotlin/dev/deathride/core/PowerRating.kt:16 "fun of(car: CarClass, bonuses: In"`,
`deathride/core/src/main/resources/data/pr-weights.csv:2 "maxSpeedMps,20,2,29.097449327"`).
Each event's ratio target must sit inside a declared band
(`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:37 "Ratio target must be inside its declared band"`).
This is the technique's step 1 and step 2, realized.

## The authored dips

The four ordinary bosses are events 7, 14, 21 and 28. Their targets are:
- 0.89 (`deathride/core/src/main/resources/data/career-curve.csv:8 "scrap-7,7,0,505,0.89"`);
- 0.89 (`deathride/core/src/main/resources/data/career-curve.csv:15 "foundry-7,14,1,620,0.89"`);
- 0.98 (`deathride/core/src/main/resources/data/career-curve.csv:22 "salt-7,21,2,655,0.98"`);
- 0.98 (`deathride/core/src/main/resources/data/career-curve.csv:29 "switchback-7,28,3,665,0.98"`).

At event 21 the target *rises* from the event before
(`deathride/core/src/main/resources/data/career-curve.csv:21 "salt-6,20,2,645,0.96"`). At event
28 it falls by 0.02. So the last two bosses no longer dip on paper.

The finale replaced the end-ahead target with a duel in a supplied rig at about one half
(`deathride/core/src/main/resources/data/career-curve.csv:36 "crown-7,35,4,635,0.525,2.6,1700,4,supplied-rig,"`).

The design document still says all four bosses are at 0.89
(`docs/concepts/DEATH-RIDE-PROGRESSION.md:79 "The four ordinary boss targets remain 0.89."`).
The data contradicts it.

## The realised dips

These are mean ratios at each career's first visit, from the race buyer
(`timeline-race.csv.gz`):

| Event | Careers | Mean ratio | Previous event | Target |
|---|---|---|---|---|
| 7 | 2,000 | 0.830 | 1.073 | 0.89 |
| 14 | 2,000 | 0.865 | 0.989 | 0.89 |
| 21 | 2,000 | 0.898 | 0.989 | 0.98 |
| 28 | 1,263 | 0.970 | 0.998 | 0.98 |
| 35 (rig) | 1,207 | 0.521 | - | 0.525 |

The realised dips are deeper than the authored ones, and they fall where the field steps up a
car tier (the `fieldTier` column moves to 1, 2 and 3 on those rows). The step comes from the
field's schedule, not from the ratio target. That is the technique's mechanism: a boss is a
stage, and a stage has a window. It is also a warning. The authored target says nothing about
the dip the schedule actually produces, so step 4's realised-against-target plot is the only
place it shows.

## The walls

Under the older boss rule:
- At event 21 the race buyer needed a mean of **20.25 attempts** (maximum 47). **712 of 2,000**
  careers ran out of races there, at the 70-race cap
  (`deathride/core/src/main/resources/data/ash-rules.csv:8 "maximumCareerRaces,70"`).
- At event 7 the pr buyer needed a mean of **33.57 attempts** (maximum 64). **664 of 2,000**
  stopped there.
- Careers that finished: 1,162 of 2,000 for the race buyer and 961 of 2,000 for the pr buyer.

The current first-place rule is stricter, so it cannot make these walls easier. The figures need
a re-run before anyone quotes them.

The technique's decision rule fires: a dip deeper than income can climb out of is a wall. A
ratio of 0.83 at event 7 against 1.07 one event earlier is that case. The project's design
document already says so
(`docs/concepts/DEATH-RIDE-PROGRESSION.md:79 "late dips and censored careers remain unresolved"`).

Two other gates came out clean:
- **Early elimination:** 0 early rows in 117,482 timeline rows for the race buyer and 0 in
  130,784 for the pr buyer.
- **Bankruptcy:** 0 of 4,000 careers flagged.

## Applied: end modestly ahead, keep the last stretch contestable

The old rule said end around 1.05, "rather than contested to the end". The new rule keeps the
modest lead and asks that the last stretch stay contestable. The simulation walked three cases
from this tree under both:

| Case | Ratio | Old rule | New rule |
|---|---|---|---|
| Last ordinary event, race buyer | 0.979 | short of the target | contestable, passes |
| Last ordinary event, pr buyer | 1.032 | passes | passes |
| The finale, a supplied rig | 0.521 | fails: it is contested by design | contestable, but far from a modest lead, so the rule flags its size, not its closeness |

The verdicts differ, but nothing in the tree measures enjoyment, which is what the change is
about. So the result is **unmeasurable**. Return: any person playing the last act.

## Two drivers, as the procedure asks

The project ran two buying policies, which is step 5. They disagree on where the wall is: event
21 for one, event 7 for the other. A curve judged on one policy would have hidden half of it.
