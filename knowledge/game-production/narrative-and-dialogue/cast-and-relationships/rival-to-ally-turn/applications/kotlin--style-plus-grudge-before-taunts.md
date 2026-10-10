---
layer: application
type: application
subject: rival-to-ally-turn
technique: style-plus-grudge-before-taunts
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: better
---

# In Death Ride's code, one grudge flag that never fades

This reads the `firetv` repository's `deathride/main` branch at `d9990777` on 2026-10-10. The
version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. The script
(`deathride/narrative/lines.csv`) is read from the same tree. Nobody has played these rivals.
The `process` application on this technique reconciled the research. This one reads what the
code does with it.

## The style is data, and the hardest settings erase part of it

Each rival has a driving row: lane bias, pass distance, fire and heavy-weapon range, mines.
- Rook: `deathride/core/src/main/resources/data/rivals.csv:2 "Late pass specialist,1.8,1.25,0.8,1.4,0"`
- Ox: `deathride/core/src/main/resources/data/rivals.csv:3 "Close-range bruiser,-1.8,0.85,0.85,0.7,1"`

On top of that row sits a persona delta, and Rook's carries his late braking as a negative
corner margin (`deathride/core/src/main/resources/data/ai-personas.csv:2 "rook,-0.05,0.05,0.0,0.04,0.10,0.10,0.0,-0.3,0"`).
The margin is clamped at zero
(`deathride/core/src/main/kotlin/dev/deathride/core/AiBehaviour.kt:246 "fun cornerMargin(c: Car,skill: AiSkill)=max(0.0,skill.cornerMarginMps+"`),
and Pro and Champion start from zero
(`deathride/core/src/main/resources/data/ai-skills.csv:7 "Pro,8,0.52,0,0.15,1,1,1"`). So at the
two hardest settings, Rook brakes like everyone else.

Signature attacks belong to the car class, not the rival
(`deathride/core/src/main/resources/data/abilities.csv:2 "Needle,steel-flick,Steel Flick,DASH"`),
and Rook and Mica buy the same car ladder:
- `deathride/core/src/main/resources/data/rival-garages.csv:2 "rook,Needle,Trail,Flint,Quill,Kestrel"`
- `deathride/core/src/main/resources/data/rival-garages.csv:4 "mica,Needle,Trail,Flint,Quill,Kestrel"`

Every car shows the same amber wind-up before an attack
(`deathride/game/src/main/kotlin/dev/deathride/game/AbilityPainter.kt:34 "else if(windup)r.setColor(1f,.75f,.3f,.85f)"`),
so no rival has a tell of their own. The style passes the technique's rule on paper. The new
decision rule (check the hardest setting and every vehicle) is what finds both gaps.

## The taunt names the behaviour once, before the race

Rook's pre-race line is the technique done right. It names a braking point the player can
test: `deathride/narrative/lines.csv:303 "You brake at the third post, fresh tag. I brake at the fourth."`.
In-race barks fire on events that have just happened, chosen from fixed text
(`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:187 "val options=Script.lines.filter{"`).
The one bark that names a felt behaviour asks for a fact nothing records
(`deathride/narrative/lines.csv:441 "vex=rival;on-straight;rare"`). Unknown facts fail the term
(`deathride/core/src/main/kotlin/dev/deathride/core/Script.kt:16 "Unknown keys fail the term"`),
so that bark never plays.

## The grudge: persistent, and nothing else

The grudge is saved state
(`deathride/core/src/main/kotlin/dev/deathride/core/ProfileStore.kt:84 "require(grudges.size==p.grudges.size"`).
It is set when the player wrecks a rival in any race
(`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:140 "if(r.playerWrecked)p.grudges[r.index]=1"`),
and while it stands it tightens the rival's passing and lengthens their fire range
(`deathride/core/src/main/resources/data/ash-rules.csv:4 "grudgePassScale,0.85"`,
`deathride/core/src/main/resources/data/ash-rules.csv:5 "grudgeFireRangeBonus,0.05"`). A test pins
that effect:
`deathride/core/src/test/kotlin/dev/deathride/core/CareerV2Test.kt:50 "assertTrue(w.cars[1].aiStyle!!.passDistanceScale<Career.rivals[first].passDistanceScale)"`.
The only thing that clears it is joining
(`deathride/core/src/main/kotlin/dev/deathride/core/Campaign.kt:100 "p.grudges[rival]=-1"`).
Nothing decays it.

The arc grudges exist too, but as script. Each boss's story turns on an injury the player did
not cause, which is the arc grudge. The code's single flag records only a contact grudge, and
the story treats that flag as if it were the arc grudge.

## The A/B, and the condition it earned

Simulation over three real states of the flag:

- **Ox wrecked in a Scrap race.** Ox is in the field from the first Scrap event
  (`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:58 "val available=Career.rivals.indices.filter{if(e.cupIndex<4)Career.rivals[it].id!="`),
  and the flag then drives her harder for every race until her own boss race at the end of
  the Foundry, up to thirteen races later.
- **Rook wrecked, then joined.** The join clears the flag.
- **Rook wrecked after joining.** The flag is set again, and nothing will clear it.

Rule A, as written: a grudge persists until an event resolves it.
- Ox passes, because the join is the event.
- Rook, wrecked then joined, passes.
- Rook, wrecked after joining, is flagged: there is no resolving event, so write one.

Rule B, with the arc and contact grudges split:
- Ox is flagged. A contact grudge that never decays is the shipped series' bug.
- Rook, wrecked then joined, passes.
- Rook, wrecked after joining, is flagged with a decay, not with an invented story event.

B catches one case that A passes and gives the right remedy for another. The condition is now
in the technique and the golden path. The prediction is falsified if players read a
never-decaying contact grudge as intended.

## Sources behind the condition

GRID Legends v6.0 patch notes, as reposted on the game's Steam board on 26 Jan 2023
(an official note on a community page, medium):
https://steamcommunity.com/app/1307710/discussions/0/3763355214778656823/ — "AI Nemesis states
should no longer be permanent across different races"; "If a Nemesis is not antagonised during
the closing stages of the race, there is a good (60%) chance". The players' thread asking for the
system to be switched off: https://steamcommunity.com/app/1307710/discussions/0/3415431214835830986/
(community).
