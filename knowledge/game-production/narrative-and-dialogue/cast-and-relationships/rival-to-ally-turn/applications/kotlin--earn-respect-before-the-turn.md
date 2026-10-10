---
layer: application
type: application
subject: rival-to-ally-turn
technique: earn-respect-before-the-turn
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: better
---

# In Death Ride's script, every respect line claims more than it read

This reads the `firetv` repository's `deathride/main` branch at `d9990777` on 2026-10-10. The
version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Nothing has been played.

## Recruiting is winning; respect reads one fact

A boss turns when the player wins the boss race outright
(`deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:141 "Win the boss race in first place to recruit"`).
After the race, the director records one fact about the boss: wrecked, or finished
(`deathride/core/src/main/kotlin/dev/deathride/core/ScriptDirector.kt:208 "if(boss!=null){if(combat.wrecked(boss.id))facts.flag("`).
It does not record who wrecked them, how often the cars touched, or whether the player had a
chance to wreck them and passed. The race itself records the wreck source
(`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:129 "world.combat.wreckSource[c.id]==0"`),
but only the grudge reads it. The script never does.

Each boss's turn opens with a line on that one flag. This is the technique's rule met: the game
was visibly watching. Then each line says more than the flag holds.

| Line | Gate | What it claims beyond the gate |
|---|---|---|
| `deathride/narrative/lines.csv:308 "You had me on the wall twice. You let me finish. Huh."` | boss-finished | two contacts, and a mercy |
| `deathride/narrative/lines.csv:329 "You left me a lane. I noticed."` | boss-finished | a yielded lane |
| `deathride/narrative/lines.csv:356 "You could've put me in the cairn. You went round."` | boss-finished | a chance declined |
| `deathride/narrative/lines.csv:380 "You could have put me over the edge. You waited."` | boss-finished | a chance declined |
| `deathride/narrative/lines.csv:330 "Slagged me. Fair."` | boss-wrecked | that the player did the wrecking |

The lines that would read how the race actually went are written, but they are dead. Their
weakness fact is never set (`deathride/narrative/lines.csv:316 "weakness=armour"`), and a test
pins that unknown terms fail
(`deathride/core/src/test/kotlin/dev/deathride/core/ScriptTest.kt:82 "assertFalse(f.holds("`).

## The A/B, and the condition it earned

Simulation over the five lines above, as real cases:

- **A**, the rule as written: the line reads a recorded fact about how the win happened. All
  five pass, since each is gated on a fact the race recorded.
- **B**, A plus "the line claims nothing its condition did not read". All five fail:
  - The four finished lines assert player acts that nothing records. A player who never touched
    Rook hears that he had him on the wall twice.
  - The wrecked line credits the player with a wreck that a third car may have caused.

B separates five lines that A cannot tell from honest ones. It also points to the repair: read
the wreck source and a contact count, which the race already has, or cut the clauses. The
condition is now in the technique and the golden path. The prediction is falsified if players
who did not make the claimed move hear these lines and do not notice.

## Where the tree already meets the standard

Respect is shown in an act as well as a word. Each boss's turn hands something over:
`deathride/narrative/lines.csv:310 "Truck's got my car. Board's got my key."`. The boss can
also beat the player at the boss's own excellence before the turning race. A loss and its
retries are scripted (`deathride/narrative/lines.csv:318 "Gate's mine. Truck goes home empty."`),
so the respect has something to run in both directions.
