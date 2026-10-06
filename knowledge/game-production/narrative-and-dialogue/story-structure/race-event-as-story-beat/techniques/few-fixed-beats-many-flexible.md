---
layer: technique
type: technique
subject: race-event-as-story-beat
technique: few-fixed-beats-many-flexible
status: forged
laws: [unmeasured-is-not-a-pass]
shared_with: []
use_when: [deciding which story events a race campaign must force in order, players get stuck behind one hard story event, writing beats that hold up in any order]
---

# Few fixed beats, many flexible

The named concern: in a race campaign only a handful of story beats are pinned to a position
that every player must pass through in order; every other beat is free, meaning playable in
any order inside its tier, failable without blocking progress, and written so that the story
holds whichever subset the player has met.

## Why the split

Racing players fail, retry and wander. A strictly linear campaign pins progress behind its
hardest story event, so a player who cannot win the rival race cannot see anything after it,
and every retry replays the same card and the same lines until the story becomes the thing
standing between the player and the next race. A campaign with no pinned beats has the
opposite defect: no arc, only a list of modifiers in no order, with nothing that rises and
nothing that resolves. The split gives the arc to a few beats and gives the player's freedom to
everything else.

## The fixed spine

Four or five beats is the typical size: an opening that establishes the situation, a turn that
changes what the player wants, a low point, and a finale, with an optional midpoint reveal.
Each sits at a tier boundary and gates it, which is where a campaign already forces the player
through a funnel. Fixed beats are allowed what free ones are not: a longer story budget, a
scene, a guaranteed audience, and the right to assume earlier fixed beats have happened. They
are also the beats whose loss outcome matters most, because a gate the player cannot pass is a
campaign that ends early. The clean rule is that the story advances on *finishing* a beat and
winning gates only money and rank; where a design insists that a promotion requires a win,
the story of the loss must still be told on the way to the retry, or the arc stops for
exactly the players who are struggling.

The spine is also where weight lives. The naive campaign gives every event one card of the
same length and the same register, and an arc made of equal beats has nothing that peaks;
the fixed beats are allowed to be heavier precisely so that the free ones can be light.

## The free beats

A free beat reads campaign state and never another free beat's order. Its card is tagged by
condition (the rival has been beaten once, the debt is above a threshold, the ally is still on
side) rather than by sequence number, and at run time the card whose conditions match most
specifically wins, with a broad default for every slot so that nothing ever falls through to
silence. A beat whose card would be wrong in some reachable order is given a more specific
card for that state or is not offered in it. A callback, a free beat that transforms an
earlier idea, names its prerequisite in state and is withheld until it is met.

The selector never picks a fixed beat. A most-specific-match choice is excellent at texture
and poor at climax: it lands worse than an authored placement exactly at the moments the arc
depends on, so the spine is placed by hand and the selector is given everything else.

This is the part that has to be checked, not trusted. For each free beat, enumerate the states
in which it can be offered and confirm its card, barks and outcome are true in each. A beat that
has never been read in its least likely order has not been shown to work in that order
([unmeasured-is-not-a-pass](../../../../_laws.md#unmeasured-is-not-a-pass)): the author's own
reading is always the intended order.

## Procedure

1. Write the spine: four or five fixed beats, each at a tier boundary, each stated as the
   proposition the campaign must have delivered by then.
2. Assign every other beat to a tier and mark it free.
3. For each free beat, list the campaign values its card and outcome read, and confirm each has
   a defined value in every state that can reach the tier.
4. For each fixed beat, write both a win and a loss outcome that advance the campaign, or state
   why the gate is intended to hold.
5. Re-read the free beats of a tier in at least two orders, including the one least like the
   author's outline.

## Decision rules

- **When a free beat's card mentions another free beat's event, rewrite it to mention state**,
  because the player may not have met that event.
- **When a story beat is the hardest event in its tier, it should not be fixed**, unless its
  loss outcome also advances.
- **When the spine grows past six beats, the campaign is becoming linear**; demote the weakest
  to free.
- **When a tier's free beats share an antagonist, let each one advance the antagonist through
  state rather than through order**, so the third one met escalates whichever two came first.

## When not to use this

A campaign short enough to be one sitting, half a dozen events, may simply be linear; the
retry cost is small and the arc is easier to write. A campaign whose story is the progression
itself, with no characters and no propositions, needs no spine; it needs a good tier ladder,
which is a difficulty concern.

## Evidence status

Fixing only a couple of moments and letting the rest of a story emerge in whatever order play
produces is a primary statement by the narrative director of a repeat-play action game, high
confidence. Selecting lines by the most specific matching conditions, with broad defaults,
rests on a primary conference talk and a primary essay on salience-based narrative, high, and
the warning that such a pick lands worse than authored placement comes from that essay. The
interest curve that nests inside each region and each race is medium, from secondary notes on
a design textbook. Advancing the story on finishing rather than winning is the research's
proposal from a director's warning about difficulty walls. The spine size of four or five, the
condition audit and the tier placement are design inference. None has been tested in a played
race campaign.
