---
layer: application
type: application
subject: short-form-cards-and-barks
technique: picture-carries-the-card
stack: kotlin
status: forged
verified_on: 2026-10-10
verified_against: kotlin@2.0.21
applied: simulation
ab_verdict: better
---

# Death Ride: which cards have a picture in play, and what the duplicate test does to them

This application reads Death Ride's card panels as the running game chooses and loads them. It
then puts three real cards through the technique's duplicate test, before and after the
exceptions this pass added. The tree is the `firetv` repository's `deathride/main` branch at
`d9990777`, read on 2026-10-10. The version witness is
`deathride/gradle/libs.versions.toml:3 "2.0.21"`. The panels were viewed as shipped image files.
No card has been seen on a television. Anchors are root-relative to that tree.

## Which cards have a picture

The career screen picks one panel per event
(`deathride/game/src/main/kotlin/dev/deathride/game/StoryArt.kt:91 "fun panel(p: Profile,phase: String,campaignRace: Boolean): String?"`).
- Seven events share the debt-contract panel
  (`deathride/game/src/main/kotlin/dev/deathride/game/StoryArt.kt:99 "foundry-2"`).
- Four events show an ally panel.
- Crown-4 and crown-6 ask for the rig reveal
  (`deathride/game/src/main/kotlin/dev/deathride/game/StoryArt.kt:104 "crown-6"`).
- Crown-7 asks for the car seizure.
- Every other event gets no panel.

A panel loads only if the owner approved it
(`deathride/game/src/main/kotlin/dev/deathride/game/StoryArt.kt:71 "owner_approved"`).
The rig reveal is marked not approved, and so is the car seizure. By the catalog's approval
fields, the loaded panels are the debt contract, the four allies, the mechanic and the ending.
So **eleven of the 35 career events show a picture beside their card**. Crown-4, crown-6 and
crown-7 were written against pictures that do not load. Their text then takes the wider
picture-less width
(`deathride/game/src/main/kotlin/dev/deathride/game/RaceGame.kt:834 "if(storyArt.available(storyPanel))548f else 677f"`).

## A seed the art rework removed

The first brief for the debt-contract panel put a seed in the picture
(`deathride/art/briefs/story-art.csv:3 "A young shopkeeper offers a spare bearing beside it"`).
The panel that ships came from a later face-first brief
(`deathride/assets/story-art/catalog.json:31 "rw2-face-debt-contract-v2-a1"`).
That brief puts the creditor's face at the centre and keeps
(`deathride/art/briefs/rework2-faces.csv:10 "Small story objects at the bottom edge only"`).
The shipped image is the creditor's face over a clamped folio. There is no bearing in it. The rig
reveal still shows the mechanic holding the bearing, which is the payment
(`deathride/art/briefs/story-art.csv:25 "Keep the EXACT young Mechanic face, curly hair, apron, shirt, hands, bearing"`).
Neither picture's change touched a line of text. The script ledger reaches the same orphan from
the text side (kotlin--callback-pays-a-seed, in this subject).

## The duplicate test on three real cards

Rule A is the technique's duplicate test as it stood before this pass. Rule B adds the three
exceptions: an ambiguous still, a reader new to the picture, and a reader who cannot see it.

**1. Scrap-1, the first career card, over the debt-contract panel (loads).**
- The picture shows an unnamed older man's face over a clamped folio.
- The text:
  - `deathride/narrative/lines.csv:5 "Forty-one keys on the Tag Board now. Rook hung the last one."`
  - `deathride/narrative/lines.csv:6 "Every key is a car the league took back."`
  - `deathride/narrative/lines.csv:7 "The parts shop leaves one bulb on, over the empty bay."`
- **Rule A** passes the card, since no line restates the picture.
- **Rule B** flags it. This is the room's first sight of the creditor, and no line says who he
  is. The same face comes back on six later cards.
- A name appears only on the prologue card, which has no picture of him
  (`deathride/narrative/lines.csv:3 "Marrow reads the car's number, not yours."`).

**2. Crown-7, the duel card, written against the car-seizure panel (does not load).**
- The intended picture is a chained car under a tarp beside the creditor.
- The second line restates part of it
  (`deathride/narrative/lines.csv:108 "Your car waits on the plinth, chained, his tag on the mirror."`).
- **Rule A** flags the line as a caption of the picture and cuts it.
- **Rule B** keeps "your" and "his tag", which fix whose car sits under the tarp. Only the word
  "chained" goes.
- In the shipped build the panel never loads, so this line is the card's only image. Rule A
  would have cut the image line from a card that has no picture.

**3. Crown-4, the rig card, written against the rig-reveal panel (does not load).**
- The text names whose part is whose
  (`deathride/narrative/lines.csv:98 "Relay's sealed gearbox, seal still on. Rook's tyres. Ox's plate."`).
  Ownership cannot be seen, so both rules pass the line.
- The bearing the intended picture would have shown appears in neither channel.

**The narration clause is unmeasurable here.** The catalog entries carry no description field,
and the game draws text onto a GL canvas with no narration path. A narration user gets nothing
from any card, with or without the exception.

## Reconciliation against the technique

**Confirmed.** Where a picture loads, the card text mostly carries what cannot be seen: owners,
debts, what the league took.

**Upward lesson 1: write against the picture that will load, not the one that was briefed.** The
technique already says to write against the delivered picture. Death Ride shows the stronger
case. A card's picture can fail an approval gate and vanish at runtime. A line kept because it
fixes a reading survives that. A line cut as a duplicate leaves the card with no image at all.

**Upward lesson 2: a rework re-opens the ledger.** A seed can live only in a picture, and a new
composition removed it while every line stayed the same. The technique now re-reads every card
and callback a reworked picture serves.

**Verdict.** Better. Across three cases, Rule B removes one false cut that would have stripped the
image line from a picture-less card in the shipped build (crown-7). It adds one real finding, an
unnamed face on the first card (scrap-1). It changes nothing on the third case. The narration
clause stays unmeasured until a project ships cards to a screen reader.
