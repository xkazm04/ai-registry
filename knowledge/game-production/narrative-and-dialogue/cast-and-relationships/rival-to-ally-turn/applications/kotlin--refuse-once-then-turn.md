---
layer: application
type: application
subject: rival-to-ally-turn
technique: refuse-once-then-turn
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: better
---

# In Death Ride's script, a four-line refusal reaches the screen as one line

This reads the `firetv` repository's `deathride/main` branch at `d9990777` on 2026-10-10. The
version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. The story bible
(`docs/narrative/STORY-BIBLE-V2.md`) is read from the same tree. Nothing has been played.

## Where the refusal sits

The owner's rule is that a won boss race turns the boss at once
(`docs/narrative/STORY-BIBLE-V2.md:165 "winning the boss race turns the boss immediately"`), and
the code does exactly that
(`deathride/core/src/main/kotlin/dev/deathride/core/Career.kt:94 "if(result.advanced && events[expectedRound].boss)Campaign.promoted(p,expectedRound)"`).
The bible puts the refusal *before* the boss race, as a refusal of help, two events earlier.

- **Rook** is offered a hiding place for his car and looks behind the curtain anyway
  (`deathride/narrative/lines.csv:18 "The Mechanic offers to hide it behind his curtain. Rook looks behind it."`).
- **Ox, Vex and Mica** are each offered the crossing by the boss who crossed before them:
  - Rook asks Ox: `deathride/narrative/lines.csv:320 "Show them, Ox. The book's got your crew too."`
  - Ox asks Vex: `deathride/narrative/lines.csv:345 "The crews need the time, Vex."`
  - Vex asks Mica: `deathride/narrative/lines.csv:369 "Shut the huts to him, Mica. One winter."`

Each refusal states the rival's own reason. For example, Vex:
`deathride/narrative/lines.csv:346 "Every haul I've run is in the log under somebody else's name."`.
The turn after the race is the boss's initiative, a thing handed over
(`deathride/narrative/lines.csv:310 "Only one of those I can give away."`). This is the
technique's function in a placement the rule as first written did not allow.

## What the line picker does to it

The script treats numbered siblings with the same conditions as variants of one slot
(`deathride/core/src/main/kotlin/dev/deathride/core/Script.kt:11 "are variants of one slot; only one is shown"`),
and a scene shows one line per slot
(`deathride/core/src/main/kotlin/dev/deathride/core/Script.kt:103 "one line per slot"`). The
refusals were written as exchanges and numbered like variants:

- **Rook.** All four lines share the slot `scene=shop`, so one plays. The writers marked
  `deathride/narrative/lines.csv:299 "Kid, I collect for a living. Don't show me things."` as
  the pick. The line with the reason never plays:
  `deathride/narrative/lines.csv:300 "In the Yards, help's a hook. I'm on his already."`.
- **Ox and Mica.** Four lines in two slots, so two play.
- **Vex.** Six lines in two slots, so two play. Vex's exchange depends on Ox's answer
  (`deathride/narrative/lines.csv:349 "Cold. Crew's still eating."`), and that answer shares a
  slot with Ox's opening line.

## The A/B, and the condition it earned

Simulation over the four bosses:

- **A**, the rule as written: the first offer after the defeat is refused, unskippably. All four
  are flagged as instant turns, since the win promotes the boss at once. That is four false
  flags on a design that has a refusal, and the real defect is not found.
- **B**, the placement bound plus "an exchange must play as one": all four pass on placement
  (reason heard once, before the turn, then the rival's initiative). The exchange check flags
  all four. Rook loses his reason line, and the other three lose half their exchange.

B removes four false flags and finds a defect that A cannot see. Both conditions are now in the
technique and the golden path. The prediction is falsified if players who see only the picked
line can still state why Rook refused.
