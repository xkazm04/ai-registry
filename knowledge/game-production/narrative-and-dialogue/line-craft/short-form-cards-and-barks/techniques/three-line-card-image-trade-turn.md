---
layer: technique
type: technique
subject: short-form-cards-and-barks
technique: three-line-card-image-trade-turn
status: forged
laws: [law-and-check-share-one-source, grade-against-what-ships-not-on-a-curve]
shared_with: []
use_when: [writing a story card shown at a seam of play, reviewing a batch of generated cards, a card reads smoothly and nobody remembers it]
---

# Three-line card: image, trade, then a turn or a price

The named concern: a story card of at most three lines that moves the story by one step, using
a fixed shape — one concrete image, one stated trade, and a last line that is either a turn or
a price. The shape is not a template for wording. It is a test each line must pass, and a card
that passes all three is short because it has nothing left to say, not because it was trimmed.

## The three jobs

**The image** is one concrete, specific, visible thing. Not "the garage at night" but the one
object in it that matters: the jacket on the hook that belonged to someone else, the second
helmet nobody wears. When the card has a picture, the picture usually supplies the image and
the first line is freed for something else (picture-carries-the-card); when it does not, the
first line does the picture's job and must be a noun the reader can see.

**The trade** says what is exchanged, owed, wanted or risked, in the plainest words available:
who wants what from whom, *now*. "He lends you the car. You win, you keep it." A trade is a
fact with two sides, in the present tense. A line that states a feeling ("everything rides on
tonight") is not a trade, because it names stakes without saying what they are; a line that
recounts history ("years ago he lost everything") is not a trade either, because backstory is
a fact about the past and the card needs pressure in the present. When history matters, it
goes into the image — an object that carries it — not into the trade.

**The turn or the price** is the last line and the only one that is allowed to surprise. A
turn is a fact that changes what the trade means: the car was never his to lend. A price is
what the trade will cost if it goes wrong, stated as a consequence the player will meet: lose
tonight and the garage closes. The rule for choosing: when the card sits *before* play, end on
a price, because a price makes the next round matter; when it sits *after* play, end on a
turn, because a turn makes the round just played mean something it did not mean while it was
being played.

Either way, the card pays inside itself. A card whose last line only promises — "soon, the
truth will come out" — is a trailer, and a player who meets trailers between rounds learns to
skip cards. A price is a payment because it changes what the next round is worth; a turn is a
payment because it changes what the last one was.

## Procedure

1. **Name the one fact this card exists to deliver.** If there is none, the card should not
   exist; a card that delivers only mood is a loading screen with ambitions.
2. **Write the last line first.** The turn or the price is the card; the other two lines exist
   to make it land. Writers who write top-down produce a strong first line and a summary at
   the end, because they have spent their idea by line two.
3. **Choose the image that the last line changes.** The best image is the object the turn
   recontextualises: the jacket becomes the dead man's jacket, the napkin becomes the loan.
4. **State the trade with both sides named.** Read it and ask "what does each party get?" — a
   trade with one side missing is a threat or a wish, not a trade.
5. **Cut every word that does not belong to one of the three jobs.** Adjectives of emotion go
   first. Then any line that explains a line above it, then any line that restates another.
   Each line stays near a dozen words or under, and the last is usually the shortest, because
   the line that turns lands hardest when it has the least to carry.
6. **Vary the openings.** Two lines that start the same way read as a list, and a list is the
   opposite of a turn.
7. **Run the ban list** over the stored text and fix every hit by rewriting the line around a
   fact, not by swapping the phrase for its nearest synonym.

## The ban list

Short dramatic text attracts stock phrases because they read as story at no cost: "little did
they know", "the stakes have never been higher", "only one can walk away", "this changes
everything", "nothing will ever be the same", "a storm is coming", "it's not about the
money". Every one of them asserts drama instead of stating the fact that would cause it. A
phrase list alone is too narrow, so the list carries two further kinds of entry. **Constructions**
are shapes that fail whatever words fill them: "it's not X, it's Y", the mirrored pair ("you
race for money; I race for blood"), the closing generalisation about roads, debts or fate, and
a rule-of-three cadence on every line. **Interior-state words** — feel, realise, remember,
and abstractions such as destiny or betrayal — narrate what happens inside a character instead
of stating the fact that would make it happen inside the player; on a card, the abstraction
names the very thing the trade and the turn exist to show. A hit rejects the line; a person
may override it, and the override is written down with its reason, so that an exception stays
an exception. The list is a gate over every stored card, and it lives in one place that both
the writers' style guide and the automated check read, which is
[the law and the check that enforces it share one source](../../../../_laws.md#law-and-check-share-one-source):
a ban list copied into a prompt and separately into a linter will drift, and the drift lets
banned phrases through whichever copy is stale.

The list is necessary and never enough. A generator steered away from "the stakes have never
been higher" writes "everything hangs in the balance", and the card is no better. The real
gate is the shape: a card whose last line is a concrete turn or price has no room for a stock
phrase, because every slot is occupied by a fact.

## Decision rules

- **When a card has four lines, one of them is a restatement.** Find it and cut it; do not
  shrink the type to fit.
- **When the turn needs explaining, it is not a turn.** A turn the player cannot read in one
  pass is a plot summary; move the explanation to a scene or drop the turn.
- **When the trade is abstract, make it a thing.** "Your reputation" becomes "your name on the
  board"; "everything" becomes the specific thing that would be lost.
- **When a batch of generated cards is reviewed, grade each against a shipped card of the same
  kind, not against the rest of the batch.** A batch of uniformly competent cards that each end
  on a mood line is placeholder work, and ranking it on a curve promotes the least bad one to
  canon — [grade against what ships, not on a curve](../../../../_laws.md#grade-against-what-ships-not-on-a-curve).
- **When a card ends on a moral, replace the moral with a price.** The lesson is the player's
  to draw; the card's job is to make the next round cost something.

## When not to use this

- **On instruction cards.** A card that teaches a control or states a rule has a different job,
  and dressing it in image-trade-turn makes the instruction harder to find.
- **On a title or chapter card.** A name and a place need no trade; forcing one produces the
  mood card the shape exists to prevent.
- **As a quota.** Not every seam needs a card. A run of cards that each turn the story becomes
  noise; the rhythm of the whole sequence decides where a card is earned.

## Evidence status

The three-job shape is practitioner craft distilled from the economy of comic captions,
title cards in silent and animated film, and the card-based narrative of short-session games;
it is stated here as a decision rule, not as a measured result. Its parts rest on sources of
uneven strength: "dialogue as a trade" comes from a showrunner speaking first-hand (primary,
high confidence); "start from one image and pay back inside the piece" from a short-film
director's interviews (primary, high); the line-level heuristics — about a dozen words a line,
no repeated openings, never end on a moral — are a common heuristic reasoned from a dramatist's
memo, rated medium by the research that collected them. Within the ban list, the constructions
and vocabulary measured as over-used in model text come from published corpus studies
(primary); the remaining entries are editorial judgement. The before-play/after-play rule for
choosing price versus turn is this subject's own judgement. None of this has been tested in a
played game yet.
