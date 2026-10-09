---
layer: application
type: application
subject: condition-tagged-line-tables
technique: react-to-what-the-player-caused
stack: kotlin
status: forged
verified_on: 2026-10-09
verified_against: kotlin@2.0.21
applied: experiment
ab_verdict: better
---

# Death Ride: who hit whom, guessed from two totals when the resolver already knows

This application tests the technique's attribution rule against running code. The two
`process` applications beside it read a design on paper. The tree is the `firetv` repository's
`deathride/main` branch at `10974fa3`, read on 2026-10-09. The version witness is the Kotlin
plugin pinned in `deathride/gradle/libs.versions.toml:3 "kotlin ="` (2.0.21). Death Ride is a
top-down vehicular combat racer for a television. Its rivals bark captions during a campaign
race. Nobody has played the campaign; everything below comes from reading the code and from a
headless experiment. Anchors are root-relative to that tree.

## The two attribution paths, side by side

The combat resolver knows the author of every hit. Each hit passes through one function with
its target, source and kind
(`deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:159 "internal fun damage(id: Int,raw: Double,source: Int,kind: DamageKind)"`).
The resolver credits the source
(`deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:171 "if(source>=0 && source!=id)damageDealt[source]+=dealt"`)
and records who wrecked whom
(`deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:173 "wreckSource[id]=source"`).
A mine carries its owner into that call
(`deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:312 "m.owner,DamageKind.MINE"`).

The dialogue layer uses the resolver's answer for wrecks only. A wreck bark reads the source
(`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:156 "if(combat.wreckSource[r.id]==player.id)bark(id,`).
For hits it re-derives the cause from two running totals. If the rival took damage this frame
and the player dealt damage to anyone this frame, the rival says it was the player
(`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:142 "val playerDealt=combat.damageDealt[player.id]-lastDealt[player.id]"`;
`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:155 "if(taken>0 && playerDealt>0 && !combat.wrecked(r.id))bark(id,if(mineDelta>0)"`).
The mine variant is worse, because `mineDelta` is the field-wide mine damage, so any car's mine
on any target makes the line a mine line
(`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:141 "val mine=combat.damageByKind[DamageKind.MINE.ordinal]"`).
This is the technique's named failure, re-deriving cause from appearances, written in code
beside the correct path for a sibling event.

The frame the totals are compared over is a rendered frame, not a simulation step. The
director runs once per render with the frame's real duration, capped at a tenth of a second
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:435 "script.frame(phase,campaignRace,profiles[0],raceRound,world,actual.coerceIn(0.0,.1))"`).
At 60 steps a second, a hitch folds several steps of everybody's combat into one comparison.

## The experiment

- **Setup.** The harness ran in a scratch worktree of `10974fa3` and was deleted afterwards;
  nothing was committed to the project. A one-line probe in the damage function logged
  `(target, source, kind)` for every hit as ground truth.
- **Arms.**
  - Arm A is the director's predicate, replicated line for line.
  - Arm B is the resolver's own record: was this rival damaged by the player in this window,
    and by what kind.
- **Runs.** All 34 non-finale campaign events, three seeds each, 102 races. The rival fields
  came from the campaign's own economy at difficulty 1. The player's car was driven by the
  game's AI at the same skill, as a stand-in for a human. Windows were 1, 2 and 4 simulation
  steps, which is 60, 30 and 15 rendered frames a second.
- **Gates.** The director's speech gates were applied as well: a 6-second global gap, a
  25-second cooldown per speaker and trigger, and 14 barks per race.

| Render rate | Predicate fired | Not the player | Wrong kind | Spoken after gates | Spoken and wrong |
| --- | --- | --- | --- | --- | --- |
| 60 fps | 2,537 | 21 | 1 | 460 | 9 (2.0%) |
| 30 fps | 2,563 | 47 | 4 | 463 | 16 (3.5%) |
| 15 fps | 2,532 | 88 | 8 | 467 | 28 (6.0%) |

The player's ground-truth hits on rivals numbered 2,533 in every arm. The mine label is the
weakest: at 15 fps, 20 of its 148 firings named the wrong author or the wrong weapon. Arm B is
wrong zero times by construction, because it is the record Arm A approximates.

Read per race, about one rival in every four to eleven races accuses the player of a hit
somebody else made, more often when the device hitches. Gating raises the share rather than
diluting it: the first predicate in a cooldown window is the one spoken, and false matches
cluster in multi-car melees, where several firings land close together.

**What the numbers do not say.** An AI stand-in fights differently from a person, and a player
who mines a pack would raise the mine figure. The caption-idle gate was not modelled, so spoken
counts are an upper bound on opportunities, not on lines heard. No player has heard any of
these lines, so whether a wrong accusation costs more than silence is still unmeasured. The
research lanes found no source either way.

## Verdict and the fix the tree already holds

**`better`, at the `experiment` rung.** The technique's rule (read the resolver's attribution,
never infer it) is right in this tree and costs almost nothing here. The resolver already
emits each hit with its source to the presentation layer
(`deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:166 "world.presentationEvents.emit(PresentationKind.HIT,source,id,kind.ordinal"`),
so the dialogue layer can subscribe to that stream or to a per-pair tally. Two caveats:
  - The presentation stream skips rams, wall hits and mines (`deathride/core/src/main/kotlin/dev/deathride/core/Combat.kt:165`).
  - The mine case needs its owner, which only the damage call carries.
Nothing was changed in the project. The finding and its measurement are the owner's to act on.

## The other cause paths, read

- **Wrecks:** confident attribution, read from the resolver. Correct.
- **The player's own wreck.** The bark goes to the car the resolver names, and a world or
  mine death with no rival source stays silent rather than guessing
  (`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:164 "val killer=world.cars.getOrNull(combat.wreckSource[player.id])?.aiStyle?.id"`).
  The technique's fall-through to silence, done right.
- **Overtakes.** These are read from race positions with a 0.75-second hold against
  flicker (`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:150 "if(flipHold[r.id]>=.75)"`).
  Position change is the race logic's own answer, so this is attribution by the owner. A rival
  who drops a place because it crashed alone still says it was overtaken by the player, though.
  That is a state change read as a cause, a softer form of the same defect.
- **Freshness** is implicit. A bark that loses the 6-second gap or finds the caption busy is
  dropped, not queued (`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:182 "if(raceClock-lastBark<minGap || barkCount>=14 || needIdle && !idle)return false"`).
  So a stale reaction cannot play, and the technique's max-age rule is met by never deferring.
- **Memory.** Every rival the player wrecks gets a grudge that lasts until that driver joins as an ally
  (`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:140 "if(r.playerWrecked)p.grudges[r.index]=1"`),
  and the grudge feeds the hit rows. That is a long-horizon cause carried in the save, as the
  technique asks. The [line-table-schema application](kotlin--line-table-schema.md) records
  how the grudge row and the plain row tie on specificity.
