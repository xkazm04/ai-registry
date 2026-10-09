---
layer: application
type: application
subject: ending-first-narrative-structure
technique: lock-the-final-card-first
stack: kotlin
status: forged
verified_on: 2026-10-09
verified_against: kotlin@2.0.21
applied: code
ab_verdict: unmeasurable
---

# Death Ride's locked card in the build: held in text, one object in four planted

The companion `process` application read the dossiers that proposed a final card. This one
reads the card the head writer locked and what the shipped game does with it. The tree is
the `firetv` repository's `deathride/main` branch at `10974fa3`, read on 2026-10-09. The
version witness is `deathride/gradle/libs.versions.toml:3 "kotlin = \"2.0.21\""`. Anchors are
root-relative to that tree. Nobody has played the campaign.

## The card, and the lock

The bible records the order:
`docs/narrative/STORY-BIBLE-V2.md:17 "was written before any other line."`
The card is three lines of the script, each marked as the writer's pick and tagged
`locked-first`:

- `deathride/narrative/lines.csv:110 "Your key comes home with Marrow's clamp cut through."`
- `deathride/narrative/lines.csv:111 "The Mechanic takes the mine rack off the rig first."`
- `deathride/narrative/lines.csv:112 "By the door there's a new hook, at your height."`

**The lock held.** The script file is byte-identical from the commit that wrote it
(`256b8868`, 2026-10-04) to `10974fa3`, including through the commit that wired it into the
game. The card's properties match the technique.
- **The price is the direct cost of the victory.** The Mechanic built a weapon:
  `docs/narrative/STORY-BIBLE-V2.md:26 "The Mechanic built a weapon, and it killed a man. Nobody says so."`
- **The surviving image is the hook.**
- **The return is the key,** which the game's first card hung on the Tag Board.

The card sits after the climax rather than at it. That resolves the placement deviation the
`process` application recorded against the dossiers.

**The candidates were wordings, not endings.** The pool holds at least seven candidate
cards, scored by two judges on a ten-dimension line rubric
(`deathride/narrative/candidates/cards.md:13 "KEY PICK"`). All of them render one ending,
fixed by the brief before any wording was written:
`deathride/narrative/candidates/cards.md:9 "Must pay off: keys"`.
- The technique's first step asks for three candidate endings, chosen by how far back their
  prerequisites reach. That ran here only as a choice between phrasings.
- The choice of ending came earlier, from the owner's fixed spine.
- The brief is the prerequisite list, and it was written first. That is the derivation step
  done in the right order.

## The objects the card names, against what the build fires

The technique's rule is that a named object is a plant. The script's tags do not key the
ending's threads to their plants (see the companion `kotlin--back-planned-beat-sheet`
application), so the card's prerequisites were traced by hand. Each was checked against the
lines the runtime can raise.

- **The key: planted where everyone sees it.**
  - Three story cards, in two acts:
    `deathride/narrative/lines.csv:6 "Every key is a car the league took back."`,
    `deathride/narrative/lines.csv:21 "Three rows down: Rook's own key."` and
    `deathride/narrative/lines.csv:37 "His key hangs on the Tag Board in the Yards."`
  - A boss turn every player wins through:
    `deathride/narrative/lines.csv:310 "Board's got my key."`
  - The seizure scene:
    `deathride/narrative/lines.csv:198 "Key on the counter. Thank you."`
- **The clamp: in no line.** The word occurs nowhere else in the script. The bible places it in
  the kept debt-contract art, and this run did not trace where that art is shown.
- **The rack, which is the price: planted only where nothing fires.** The Mechanic's
  inability to kill is set up in three rows, two on `shop-idle` and one on `own-mine-hit`.
  Neither trigger has a call site:
  - `deathride/narrative/lines.csv:258 "I tried arming a test mine. I couldn't. I said sorry to it."`
  - `deathride/narrative/lines.csv:492 "That one was ours. Sorry. Sorry. Keep going."`
  - `deathride/narrative/lines.csv:288 "Rack first. Then everything."`

  The only fired line that touches the Mechanic and the mines is a duel instruction about the
  mines' indifference
  (`deathride/narrative/lines.csv:485 "They don't know whose side they're on."`).
  In the build, the card's price lands with no plant behind it.
- **The hook: one line by chance, one never.** "Help's a hook" is the idea the card inverts.
  It sits in a refusal slot where the writer's other pick always wins
  (`deathride/narrative/lines.csv:300 "In the Yards, help's a hook."` loses to line 299). It
  also sits in a grid greeting that one rival per race may speak
  (`deathride/narrative/lines.csv:409 "I'm on your hook now."`).

So one object in four is planted where every player sees it, and that one is the key. The
lock did its job: the text never drifted. The plants for it went onto triggers the build does
not raise.

## A second ending in the data, fenced

The pre-lock card survives in the older story table as the per-line fallback
(`deathride/core/src/main/resources/data/story-cards.csv:37 "campaign-victory,The garage is ours"`).
Its lines return the car, bring back a sibling the rewrite removed, and pay no price. That is
a second authority on the ending. It sits exactly where
[one authority per quantity](../../../../_laws.md#one-authority-per-quantity) says the
disagreement hides: the loader falls back line by line, so one missing scripted line would
show a card made of two endings.

The project fenced it. The suite lists no permitted fallbacks and asserts that the scripted
card is the one shown:
- `deathride/core/src/test/kotlin/dev/deathride/core/ScriptTest.kt:30 "val explicitFallback=emptySet<String>()"`
- `deathride/core/src/test/kotlin/dev/deathride/core/ScriptTest.kt:35 "AshStory must show the scripted card"`

Verified and left: the old model persists as data, and a gate stops it from reaching the
screen.

## The decisive act, under the bounded rule

The finale is a fight the player wins by surviving Marrow in the Mechanic's rig. Two rules
were compared:
- **Old:** the act is performed with the game's trained verb.
- **Bounded:** the protagonist owns the decision, and withholding or refusing the trained verb
  can be that decision.

Both pass the duel. The player drives and fights, which the whole campaign trains. Whether
the rig's own tool is met before the duel is a lead banked by run dp-dls-1009. A tie between
the two rules means the case did not discriminate, and it is recorded as unmeasurable.

## What this does not prove

That the card moves anyone, or that the clamp registers from the art. The project leads,
which wait on the owner:
- move the Mechanic's mine plants onto a channel that fires, such as a card, a pre-race scene
  or the rig reveal;
- give the hook its plant in a slot that is shown.
