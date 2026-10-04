---
layer: technique
type: technique
subject: race-event-as-story-beat
technique: four-part-beat-delivery
status: forged
laws: [compiling-is-not-wiring, one-authority-per-quantity]
shared_with: []
use_when: [specifying what an event must ship with to carry its beat, a beat is written but players do not remember it, reviewing an event for a missing card bark or outcome]
---

# Four-part beat delivery

The named concern: a story beat carried by a race event ships in four parts, every one of them
present, each with its own job and its own failure. The parts are the pre-event card, the rule
variant, the mid-event barks and the post-event state. A beat missing any one of them is not a
lighter beat; it is a different and worse artifact.

## The four parts

**The pre-event card** is shown between selecting the event and the first input on the grid.
It names who is involved, what is at stake and the one rule that is different today, in a
single image and one or two lines. It is the only part that may carry exposition, and it
carries the least it can.

**The rule variant** is the mechanical expression of the event's idea, live for the whole race
and visible on the heads-up display. It is the beat's content; its own technique covers how
one is chosen.

**The mid-event barks** are short lines triggered by state and by race phase rather than by
the clock: the rival when the block happens, the passenger when the cargo is hit, the team
when the last lap starts with the target still ahead. Each carries exactly one fact, in the
speaker's word choice rather than in a pun, and is sized for a glance: a portrait and a
handful of words on screen, or a voiced line under about two seconds. They confirm that the
idea is in play. They do not introduce anything, because a player at speed hears a line and
cannot read one, and anything new said at speed is lost. A line timed to the wall clock
instead of the race phase lands on a straight in one race and mid-corner in the next, and
the second time it is noise.

**The post-event state** is what the campaign records: money, carried damage, a rival's
standing, an ally gained or lost, a callback unlocked. It is written whether or not any text
was read, and it is what the next card reads. It branches on result, at minimum on won, lost
and finished-but-failed-the-variant, because those are three different stories and a race
produces all three. A loss gets its own reactions, short and in character, the winner's
gloat, an ally's defence of the driver, so that losing yields story the player would not have
had by winning instead of a retry prompt and silence. And the state pays off twice: once on
the result screen, and once later, several events on, in another character's mouth, because
the delayed echo is what proves the world kept the record.

The card reads that state too, including the state of the attempt itself. A retry's card
acknowledges the attempt before it: the third try at a beat opens differently from the
first, which is the cheapest available proof that attempts are part of the story rather than
outside it.

## The failure signatures

A card with no variant is a **trailer**: the player is told the stakes and then drives a race
identical to every other race. A variant with no card is a **gimmick**: a modifier with no
reason, which the player experiences as arbitrary difficulty. Barks that explain are
**narration over driving**, which the player cannot attend to and soon learns to mute. An
outcome shown but not recorded is an **evaporated beat**: the screen says the rival is
humiliated, and nothing anywhere remembers it, so the next card cannot refer to it and the
player correctly concludes that nothing they do persists. That last one is the commonest,
because the outcome screen looks finished; a beat that renders and writes nothing is the
narrative form of an artifact that compiles and is wired to nothing
([compiling-is-not-wiring](../../../../_laws.md#compiling-is-not-wiring)).

## Procedure

1. Write the event's idea as one proposition and choose its rule variant first.
2. Write the card last-but-one: who, stake, rule, within the per-event budget.
3. List the state triggers the variant can produce (block, hit, overtake, wreck, final lap) and
   write at most one bark per trigger per speaker, with a cooldown so a trigger that fires ten
   times does not speak ten times.
4. Write the outcome as state first and words second: for each result, which campaign values
   change, then the one line that names the change.
5. Check that every value the outcome writes has one owner in campaign state and that some
   later card or rule reads it
   ([one-authority-per-quantity](../../../../_laws.md#one-authority-per-quantity)).

## Decision rules

- **When a beat is short of budget, cut words from the card before cutting a part.** A
  one-line card with all four parts beats a full card with no persisted outcome.
- **When a bark needs a clause to make sense, it belongs on the card**, because a line the
  player must parse at speed will not be parsed.
- **When the outcome for a loss is "retry", write a loss outcome anyway** for any beat that is
  not a gate, so a player who loses still moves the story.
- **When a recorded outcome is read by nothing later, either add the reader or stop recording
  it**, because state that nothing reads trains authors to believe the campaign remembers more
  than it does.

## When not to use this

The four parts are the minimum for a beat, not for every event: a free-play race needs none of
them, and a pure qualifying or training run carries no idea to deliver. A fixed spine beat may
add a fifth part, a longer scene before or after, but it keeps the four, because the scene is
skippable and the four are what remains when it is skipped.

## Evidence status

The four-slot shape itself is a design proposal in the research this subject distils, built
on its patterns rather than taken from any shipped game. The parts rest on sources of
different strength. One fact per bark, and the warning against clever one-liners, come from
primary statements by working game writers, high confidence. Losing as content rests on
primary statements by two narrative directors, high; the racing counter-example, players
muting an announcer's repetitive post-failure lines, comes from community sources and is low.
Delayed consequence is high for a primary interview and medium for the racing example of a
car taken at the start and returned at the top of the rival list, which rests on an
encyclopedia summary. Retry cards that read the last attempt are medium and high across two
examples. The bark sizes, the phase-not-clock timing rule (rated low by the research) and the
loss-reaction set are inference or proposal. None has been tested in a played race campaign.
