---
layer: technique
type: technique
subject: giveaway-eligibility-and-weighting
technique: concave-activity-weights
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [rewarding regular viewers with extra weight in a giveaway, choosing a weight curve and its cap, explaining to the room how much a regular's entry outweighs a newcomer's]
---

# Concave activity weights

Streamers want their regulars to have better odds, and a weight drawn from activity is the
honest way to give it: it rewards being present, which every viewer can do, rather than
paying, which only some can. The risk is the curve. A weight that grows in step with
activity rewards whoever idled longest and makes a newcomer's entry decorative.

## The curve

Weight is a function of qualifying activity units, starting at a base for an entrant with
none. Each further unit adds **less than the one before**, and after a stated number of
units adds nothing: a concave, capped curve. A simple shape is a decreasing increment — the
first unit adds the most, each next adds one step less, down to zero at the cap — which
gives a closed form the verifier can recompute and a table the streamer can read. A square
root or logarithm with a ceiling behaves similarly; whichever is chosen is written into the
frozen rules exactly, with integer arithmetic, so two implementations agree to the unit.

The base weight is part of the curve, and the most consequential part. With a base of one
and increments that shrink by one from the cap downward, the top weight grows with the
square of the cap: raise the cap from four to eight and the heaviest entrant goes from
about eleven newcomers to about thirty-seven. Set the base **equal to the cap** instead,
so weight at n units is the cap plus the sum of the first n shrinking increments, and the
top weight is roughly the base times half the cap: the newcomers-to-outweigh number then
grows only in step with the cap — four at a cap of four, six at a cap of eight. A steeper
"bonus" for regulars is then a decision the streamer sees in that number, not a side effect
of a slider.

## The number the room is told

Compute and publish **how many newcomers it takes to outweigh the heaviest possible
entrant**: the smallest count whose combined base weight is strictly greater than the top
weight — the top weight divided by the base, rounded down, plus one. A tie is not an
outweigh, and a rounded-up quotient reports a tie as one. That number is the
design. It must be greater than one — otherwise activity buys nothing — and small: a
handful, not dozens. The tool computes it from the curve on the screen where the curve is
chosen, so the streamer sees the consequence before they pick, and refuses a configuration
whose number exceeds the stated ceiling. Before entries exist the heaviest figure is the
curve's own ceiling; once the list is frozen it is the heaviest real entry, and the screen
says which of the two it is showing.

Beside that number, show the curve as steps — the weight each activity level adds, against
a linear reference in which every unit is worth the first — and, where cohorts are known,
each cohort's share of heads next to its share of weight. A cohort holding a fifth of the
entrants and two fifths of the weight is the picture a streamer needs before going live,
and no single ratio shows it.

## What counts as activity

- **Distinct windows, not volume.** Count presence per window (a chat message in each
  ten-minute slot, a stream attended) or distinct qualifying actions, never raw message
  count. A count of messages is a count of spam.
- **Only moderated activity.** A unit is earned only by a message that passed moderation.
  Weight earned by messages the screen removed reopens the hole the entry gate closed.
- **No currency on the path.** Trace each unit to its source. Paid messages, cheers,
  purchased points and gifted subscriptions are not activity; they are money.
- **A defined window.** Activity is counted over a stated period that ends at or before the
  freeze, so a viewer cannot farm units after entries close.

## Decision rules

- **When choosing a cap**, start from the newcomers-to-outweigh number the streamer is
  willing to say aloud, and derive the cap from it, not the other way round.
- **When the first curve is set**, label it a proposal and look at the real distribution
  after a few draws: if most entrants sit at the cap, the cap is too low to distinguish
  anyone; if almost nobody reaches it, it rewards a tiny club.
- **When weights are published**, remember they disclose each viewer's activity; the
  streamer reviews the list before it leaves the tool. Diagnostics carry the shape of an
  entry — its identifier, its unit count, how many cohorts — never the message text or the
  cohort names.
- **When activity cannot be measured**, every entrant sits at the base. Missing evidence
  grants no weight, and the screen says the curve had nothing to act on rather than
  showing a curve that never applied.
- **When weights feed the draw's record**, check they fit the record's integer width at the
  freeze and refuse the freeze if one does not; a weight silently truncated is a changed
  odds table.

## When not to use it

A draw meant to welcome — a raid, a first-stream giveaway, a newcomer special — should be
flat. So must any draw that offers a free path alongside a gated one: equal odds, not
activity weights, is the rule there. And with a handful of entrants, weight is noise; give
everyone one.
