---
layer: technique
type: technique
subject: short-form-cards-and-barks
technique: callback-pays-a-seed
status: forged
laws: [declaring-an-input-is-not-consuming-it]
shared_with: []
use_when: [planting a detail that a later card or bark will return to, a callback line falls flat in play, auditing which planted details ever pay off]
---

# A callback pays a seed

The named concern: short units gain depth almost for free by referring back to each other — a
detail planted in one card or bark, returned to later with a changed meaning. The planting is
the **seed**, the return is the **callback**, and the callback works only if it pays, which
means it changes what the seed meant rather than repeating it. Because short units are
scattered across play and many fire only under conditions, the pair is also a correctness
problem: a callback to a seed the player never saw refers to nothing.

## What a seed is

A seed is a **specific, noticeable, unexplained** detail. Specific, so it can be recognised
when it returns: the second helmet, the sum on the napkin, the rival's habit of tapping the
roof twice. Noticeable, so the player registers it, usually by placing it in the image line of
a card or the first words of a bark, at a moment the player remembers — a first meeting, a
first win, a loss. Unexplained, so the player carries a small open question without being told
to. A seed that is explained when planted has already paid itself, and the callback has
nothing to add.

The strongest seed has an innocent first reading. A creditor who compliments the car rather
than the driver reads, the first time, as a gruff kind of praise; after he seizes the car it
reads as an appraisal. Nothing was hidden, and the player can go back and find it, which is
what makes the turn feel earned rather than imposed. Objects make the best seeds of this kind,
because an object can change state — damaged, given away, picked up again — and report the
change without a line of explanation.

## What a payment is

A callback pays when the returning detail means something new. The rival taps the roof twice
before every race; after he crashes out, a card shows the player tapping their own roof twice.
That is a payment: the gesture has passed from him to the player, and nobody has to say so. A
callback that merely repeats the detail — the rival taps the roof twice again — is a reference,
not a payment, and it confirms the pattern without moving it. The distinction is worth keeping
in a sentence: a callback that means the same thing twice is a wink; one that has changed is
an arc.

The best payments are carried by the picture or by a bare repetition of words in a new
context, with no explanation. A callback that explains itself ("remember when he used to tap
the roof?") pays in the weakest currency, because it does the player's recognition for them.

## The ledger

Seeds and callbacks are kept as a ledger: each seed with an identifier, where it is planted,
and the condition under which the player sees it; each callback with the seed it pays and the
condition under which it fires. The ledger is audited in both directions, because a planted
detail and a returning line are each a declaration that only means something when its
counterpart exists — [declaring an input is not consuming it](../../../../_laws.md#declaring-an-input-is-not-consuming-it):

- **A callback with no reachable seed** is an orphan. It fires for a player whose path never
  planted the detail, and to that player it is a line about nothing. Guard the callback on the
  seed having been seen — a recorded fact of play, not an assumption about the usual path —
  and give the slot a fallback line that stands alone, so that the unseen-seed player gets a
  good line rather than a gap.
- **A seed no callback pays** is a promise broken quietly. One or two are texture; many are a
  sign that payments were planned and cut, and the remaining seeds now read as loose ends.

## Procedure

1. **Plan the payment before planting the seed.** A seed planted in hope of a later use is
   usually never paid.
2. **Plant the seed in the most-seen position** — the image, or the first words — of a unit
   the player is guaranteed or very likely to meet.
3. **Record the seed as seen** when its unit is shown, so callbacks can be conditioned on it.
4. **Write the callback as a change of meaning,** carried by image or bare words, without a
   reminder.
5. **Audit the ledger** whenever units are added, cut or re-conditioned: orphan callbacks are
   defects; unpaid seeds are reviewed.

## Decision rules

- **When the gap between seed and callback is long, the seed must be stronger.** A detail seen
  once, forty minutes earlier, must have been the most specific thing on its card.
- **When a callback needs a reminder to land, the seed was too weak.** Strengthen the seed;
  do not add the reminder.
- **When the seed sits on a conditional path, the callback inherits the condition.** There is
  no "most players will have seen it".
- **When one seed is paid twice,** the second payment must change the meaning again or be cut.
- **When an exchange already carries a callback, it carries no second one.** Two callbacks in a
  few lines turn recognition into a quiz, and each dilutes the other.

## When not to use this

- **On running gags inside a bark pool,** which are repetition by design and belong to the
  repetition discipline rather than to a ledger.
- **On a prototype sequence** that will be rewritten; the ledger costs upkeep that only pays
  once the sequence is stable.

## Evidence status

Planting and payoff is long-standing dramatic craft across film, television and serial
fiction; the wink-versus-arc distinction is stated first-hand by a series showrunner and
illustrated from on-screen motifs (primary, high confidence for the main example, medium for
one script wording known only from an excerpt). Memory-driven reactivity that makes callbacks
possible in games is documented in a dynamic-dialogue conference talk and a game director's
interviews (high); the one-callback-per-exchange rationing rule is rated medium by the research
that proposed it. The double-reading seed comes from that research's design proposals, which
it labels inference, not fact. The ledger and its two-direction audit are this subject's
application of the bundle's law on declared but unconsumed inputs. None of this has been tested
in a played game yet.
