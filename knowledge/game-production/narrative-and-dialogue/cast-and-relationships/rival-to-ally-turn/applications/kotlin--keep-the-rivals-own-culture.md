---
layer: application
type: application
subject: rival-to-ally-turn
technique: keep-the-rivals-own-culture
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: better
---

# In Death Ride's code, allies keep racing and one flag holds two states

This reads the `firetv` repository's `deathride/main` branch at `d9990777` on 2026-10-10. The
version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Nothing has been played.

## The voice is kept

Each boss has roughly as many lines after joining as before (Rook 10 rival / 9 ally, Ox 10 / 10,
Vex 9 / 9, Mica 10 / 7, counted from the conditions in `deathride/narrative/lines.csv`). The
ally lines stay in each boss's idiom:
- Rook: `deathride/narrative/lines.csv:409 "I'm on your hook now."`
- Vex: `deathride/narrative/lines.csv:445 "First by four tenths. I'm keeping those."`

The rivals' codes carry across the turn, as the technique asks.

## The rivalry is kept too, and so is competence

Allies give the player no race help. The rules forbid it outright
(`deathride/core/src/main/kotlin/dev/deathride/core/Campaign.kt:14 "No unmeasured ally power is supported"`).
But allies are not removed. They stay in the field at full strength in every race except the
final duel
(`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:58 "val available=Career.rivals.indices.filter{if(e.cupIndex<4)Career.rivals[it].id!="`),
and their lines keep score:
`deathride/narrative/lines.csv:429 "Ahead of you. Crew says it's for your own good."`.

There is no demotion and no call-in. The player cannot summon the move they learned to fear.
This is the rivalry-survives reading in its purest form, and the technique now names it.

## One flag, two states

Side and grudge share one integer per rival, from -1 to 1
(`deathride/core/src/main/kotlin/dev/deathride/core/ProfileStore.kt:84 "grudges.all{it in -1..1}"`).
Joining writes -1 (`deathride/core/src/main/kotlin/dev/deathride/core/Campaign.kt:100 "p.grudges[rival]=-1"`).
Wrecking any rival, ally or not, writes 1
(`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:140 "if(r.playerWrecked)p.grudges[r.index]=1"`).
Ally status itself is read from the reward record, not the flag. The script facts then set the
grudge independently of the side
(`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:64 "if(p.grudges[i]>0)f.set(r.id,"`).

Three real cases:
- **Rook, wrecked after joining.** He hears his ally grudge line
  (`deathride/core/src/main/resources/data/campaign-allies.csv:2 "I am still backing you. Keep your bumper off my crew."`).
  This is right: the grudge speaks as an ally.
- **Ox, hit before joining by a player who wrecked her in a Scrap race.** She has no rival line
  for being hit, so the only candidate is a line written for after she joins, gated on the grudge
  alone: `deathride/narrative/lines.csv:430 "We share a cause. That doesn't make my steel yours to break."`.
  She tells a rival that they share a cause before she has crossed.
- **Relay, after any delivery contract.** A delivery contract writes Relay's flag to -1
  (`deathride/core/src/main/kotlin/dev/deathride/core/Commerce.kt:99 "p.contractWins++;p.contract=-1;if(p.withRivals)p.grudges"`),
  so the panel can label him an ally
  (`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:147 "else if(p.grudges[index]<0)"`),
  while the script still treats him as a rival.

## The A/B, and the condition it earned

- **A**, the technique as written (speech, rites, loyalties, style, competence). It says nothing
  about state, so all three cases pass.
- **B**, A plus "side and grudge are separate states, and every post-crossing grudge line reads
  both". Rook passes, Ox's line is flagged, and Relay's label is flagged.

B finds two defects that A cannot see and keeps the one case that works. The condition is now
in the technique and the golden path. The prediction is falsified by a game that keeps one flag
for both states and never plays a line to the wrong side.

## Sources behind the bounds

The role-not-power bound and the surviving rivalry: https://hades.fandom.com/wiki/Companion_Battie
(community wiki) and https://en.wikipedia.org/wiki/Hades_(video_game) (secondary).
