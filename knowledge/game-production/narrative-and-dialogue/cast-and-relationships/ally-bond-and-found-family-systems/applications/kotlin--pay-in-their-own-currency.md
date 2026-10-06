---
layer: application
type: application
subject: ally-bond-and-found-family-systems
technique: pay-in-their-own-currency
stack: kotlin
status: forged
verified_on: 2026-10-06
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: unmeasurable
---

# Death Ride: four allies, one menu, and where the currency went when the kind was locked

This application reads the technique against running code rather than a design document. The
tree is the `firetv` repository at `0158739f`, read on 2026-10-06; the version witness is the
Kotlin plugin pinned in `gradle/libs.versions.toml:3` (`kotlin = "2.0.21"`). Death Ride is a
top-down vehicular combat racer for a television. Four regional bosses (Rook, Ox, Vex, Mica)
are beaten in the campaign and then turn, and each turn pays the player a promotion reward.
The game has not been played by anyone outside its own simulations, so nothing below claims a
result in play.

## What the runtime pays

Every ally pays from the same menu. `Campaign.choices` is one list for the whole roster
(`deathride/core/src/main/kotlin/dev/deathride/core/Campaign.kt:67 val choices=listOf("money","car","part")`),
and the per-ally row in `deathride/core/src/main/resources/data/campaign-allies.csv` varies
only the magnitude of the money, which car and which part:

```
rook,scrap-7,350,Trail,tires,...
ox,foundry-7,650,Flint,armor,...
vex,salt-7,1000,Quill,engine,...
mica,switchback-7,1400,Kestrel,suspension,...
```

The magnitudes belong to the economy and a balance test pins them
(`deathride/core/src/test/kotlin/dev/deathride/core/CampaignBalanceTest.kt:26 assertEquals(listOf(350,650,1000,1400),Campaign.allies.map{it.money})`).
That is exactly the seam the technique draws: this subject owns kind, timing, condition and
voice, and the number is handed across.

**The swap test, run on what the runtime says.** The claim path returns one generic sentence
for every ally (`Campaign.kt:159 return "${a.id.replaceFirstChar{it.uppercase()}} promotion: $description claimed"`),
where `description` is a price label. Exchange Rook's row with Ox's and the player sees a
different name, a different number and a different car, and no wrong note. All 4 of 4 allies
fail the swap test. The kind is identical, the timing is identical (one claim after the turn
race), and the condition is identical apart from the economy's own availability checks.
Rook's turn line in the runtime table announces the menu itself: "My name opens the crew
account. Your choice is money or a missing car or a useful part." That is the vending
machine's tell, an ally reading out the price list, as described in
[bond-pays-in-play-not-vending](../techniques/bond-pays-in-play-not-vending.md).

## What the design did under the lock

The team adopted the technique with the kind locked. The game's owner kept the three-way
choice and its amounts. The story bible's section on payouts says so in its first sentence
(`docs/narrative/STORY-BIBLE-V2.md:182 "The owner's three choices (money, car, part) and the amounts in campaign-allies.csv are unchanged. What changes is the voice"`),
and moves the currency into the two parts the lock left open:

- **Voice per choice, drawn from the ally's own life.** Every chosen reward gets its own line
  for every ally. Rook's money is "Tag money. Collected it nine years. Now I'm uncollecting it."
  (`deathride/narrative/lines.csv:312`), Ox's is "The levy back, counted twice."
  (`lines.csv:337`), Vex's is "Every haul I'll never get paid for again." (`lines.csv:361`) and
  Mica's is "Grit money. There's no grit coming." (`lines.csv:385`). The kind is the same
  everywhere, and each line names what the money *was* to the person handing it over. That is
  the technique's "best payment costs the giver" carried entirely by voice.
- **A story-only gift that accumulates into one object.** Each ally also gives the Mechanic one
  part for the finale rig: Rook's tyres, Ox's plate stamped with the Roll Call, Vex's
  stopwatch, Mica's anchor pins (`lines.csv:315`, `:340`, `:364`, `:388`). The frame-change
  ledger adopts it as "The rig is made of gifts", with stats fixed in a separate table so the
  gift carries no hidden power (`docs/narrative/FRAME-CHANGES.md:20`).

Run the swap test again on the authored lines and no pair survives it: 0 of 4 allies'
payout lines could be moved to another ally without the wrong note, because each one names
that ally's trade (tags, the levy, hauls, grit).

## Where it stands

None of the authored currency reaches the player yet. The project's status page says the
518-line script "Nothing of it is wired into the game yet"
(`docs/concepts/DEATH-RIDE-STATUS.md:14`). Its one reader is the owner's review page, and no
Kotlin source reads `lines.csv`. Until it is wired, the ally the player meets is the generic
claim sentence above. That is the technique's failure, and the fix exists one file away, which
is the narrative form of
[compiling-is-not-wiring](../../../../_laws.md#compiling-is-not-wiring).

## What this adds to the technique

The technique's first decision rule, "give one of them a different kind", cannot fire when the
owner or the economy has locked the kind. This tree shows the currency surviving the lock in
the parts the lock does not touch: a voice line per chosen reward that says what the thing cost
the giver, and a story-only gift that adds to one shared object. The technique now carries that
case as a condition. The verdict is `unmeasurable`. The 4/4 to 0/4 swap result uses the
technique's own instrument, applied to authored text, so it measures that the authoring
followed the rule and not that players feel the difference. The game has had no playtest. Return
condition: when the payout lines are wired into the claim path and a playtest asks players to
tell the allies' rewards apart.
