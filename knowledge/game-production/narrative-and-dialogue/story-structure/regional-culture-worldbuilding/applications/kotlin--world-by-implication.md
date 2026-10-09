---
layer: application
type: application
subject: regional-culture-worldbuilding
technique: world-by-implication
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: better
---

# Death Ride plants "road levy" and prints "diverted" beside it

This reads the `firetv` repository's `deathride/main` branch at `d9990777` on 2026-10-10. The
version witness is `deathride/gradle/libs.versions.toml:3 "2.0.21"`. Nothing has been played.
The case is one line of the league's receipt. It is part of the economy the player cannot act
on, and the story needs it to read as a fair fee for thirteen races.

## The plant

Every league race, a share of the player's purse goes to the debt
(`deathride/core/src/main/resources/data/campaign-rules.csv:5 "paymentShare,0.20"`), and a
quarter of that payment is quietly diverted until the foundry boss exposes it
(`deathride/core/src/main/resources/data/campaign-rules.csv:6 "divertedShare,0.25"`;
`deathride/core/src/main/kotlin/dev/deathride/core/Campaign.kt:90 "val cut=if(s.exposed)0L else floor(amount*CampaignRules["`).
The bible treats the diversion as a twist planted in plain sight. Its proposal is to label the
line a road levy until the boss joins
(`docs/narrative/STORY-BIBLE-V2.md:114 "Proposed UI label change:"`). The script, which now
supplies the story-card text
(`deathride/core/src/main/kotlin/dev/deathride/core/AshCircuit.kt:14 "narrative/lines.csv owns the text"`),
plants it on the second race's card:
`deathride/narrative/lines.csv:9 "The fourth says road levy, in Marrow's own hand."` The
receipt remark keeps the plant going:
`deathride/narrative/lines.csv:178 "The levy keeps the road open. You are welcome to walk instead. M."`
The word is the centre's euphemism, exactly as the golden path's slang gradient predicts.

## The label that spends it

The same career screen draws the story card
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:834 "DeathDuel.story(p).lines"`)
and, before exposure, the ledger icon's caption
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:862 "DIVERTED"`), selected
whenever the books are not yet exposed
(`deathride/game/src/main/kotlin/dev/deathride/game/StoryArt.kt:88 "p.campaign.exposed ->"`).
The caption is only drawn when the icon art is present. The phone controller's receipt has no
such condition and prints "diverted" on every race
(`deathride/controller/index.html:56 "/ diverted "`). So the card says "levy" and the receipt
says "diverted", about the same money, in the same race.

## The A/B, and the condition it earned

Simulation over the ledger's three states (hidden, exposed and recovering, voided after the
finale):

- **A**, the technique as written: systems the player operates are taught plainly; the world
  is implied. A receipt deduction is a system, so A labels it plainly. That is "diverted" from
  race one, which is what the tree ships. A has no way to tell the label from the number.
- **B**, split the line: the number is shown plainly, because the player's money has to
  reconcile, and the save refuses a ledger that does not
  (`deathride/core/src/main/kotlin/dev/deathride/core/Campaign.kt:45 "Campaign ledger does not reconcile"`).
  The label speaks in the world's voice until the reveal. So the hidden state reads "road
  levy", and the exposed and voided states keep their plain captions ("recovered", "claim
  voided").

B changes the hidden state, which covers races 1 to 14, and leaves the other two alone. It also
removes a contradiction between two of the tree's own channels, which A cannot see. The
prediction is falsified if players who see "road levy" connect it to the foundry exposure no
more often than players who see "diverted", or feel cheated by the rename. Only a playtest can
measure that, and none has run.

## What else holds

The script's other residues follow the touchpoint rule. The levy rides on a number the player
reads every race. The centre's word for seizure is first heard from a house car the player
has just wrecked (`deathride/narrative/lines.csv:477 "Fleet nine. Retired."`), and it is the
same word the book later uses for a car taken at the gate
(`deathride/narrative/lines.csv:140 "one car has been retired at the gate under clause nine"`).
Nobody defines it, and two consistent uses make it a history. The interest stops when the
books are exposed, and only the announcer's notice gives the reason
(`deathride/narrative/lines.csv:137 "interest on Yards accounts is suspended"`).
