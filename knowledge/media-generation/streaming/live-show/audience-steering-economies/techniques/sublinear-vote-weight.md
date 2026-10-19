---
layer: technique
type: technique
subject: audience-steering-economies
technique: sublinear-vote-weight
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [choosing how much a rank multiplies a viewer's vote, tallying a weighted ballot and breaking its ties, checking whether a few heavy voters can carry a ballot against the room]
---

# Sub-linear vote weight

Standing has to buy something or nobody climbs, and the most natural thing for it to buy
is a louder vote. The danger is entirely in the curve. Weight that grows linearly with
rank, or in proportion to spend, hands every ballot to the handful at the top: ten
top-rank voters with a hundred times a newcomer's weight outvote a room of nine hundred.
The room can see that arithmetic in one ballot, and it stops voting. Weight must grow,
and it must grow **more slowly than the standing behind it**.

## The curve

Give each rank a weight, starting at one for a newcomer, rising with every rank, and
rising by less at each step: a concave sequence such as one, a little more, a little more
than that, flattening toward a modest ceiling. A shape close to a square root or a
logarithm of the standing measure behaves well; the exact function matters less than three
properties that are checked, not assumed.

**The top is worth a few, never a crowd.** The heaviest single voter counts for a small
handful of newcomers — single digits. State that number in the design and keep it small
enough that one dedicated viewer cannot overturn a visible room, and large enough (above
one) that climbing is felt.

**The top tier together cannot carry a clear majority.** Take the realistic population of
the highest ranks on a busy night, give them all one side, give a two-thirds head-count
majority of the active voters the other, and confirm the majority wins. If it does not, the
curve is too steep, whatever it looks like on paper. The arithmetic has a hinge worth
knowing: a third of the voters at a weight above two outweighs the other two-thirds at
weight one. So a top weight at or below two passes this check for any population, and a top
weight above two passes it only while the top ranks stay rare — a population fact, true on
a young show and eroding as it matures, that must be re-measured rather than assumed.

**Every step is felt.** A rank change that moves weight by a rounding error is a rank that
buys nothing. Fewer, larger steps beat many imperceptible ones.

Weight is derived from standing, never from spend directly. Spend may accelerate the climb
the gift technique describes; routing currency straight into weight reintroduces linear
purchase of the outcome by the back door. The ceiling matters as much as the shape: once a
viewer holds the top rank, further spend buys no further weight.

Enforce the properties where the weight table is **loaded**, not only in a test of the
table that ships. A loader that checks only that weights rise will accept a retuned table
that rises steeply, and the first night anyone edits the numbers the curve can go convex
without a single failure. Reject a table whose increments grow, whose top weight exceeds
the stated newcomer ratio, or whose top tier can carry the two-thirds room.

The first weights are a guess and must say so. A curve set before any real night has run is
a proposal, labelled as one beside the numbers, and recalibrated against the observed rank
distribution and the observed rate at which weighted and head-count winners differ; it does
not graduate to a tuned parameter by surviving unexamined.

## One voice, weighted

A viewer casts one vote per ballot. Weight multiplies that voice; it never lets a viewer
vote again. A later vote from the same viewer replaces their earlier one — people change
their minds when the host argues for an option, and that is the fun — and it is counted
once at the weight of the viewer's rank when the ballot closes. Repeated messages, spammed
options and alternate accounts must collapse to one vote per identity, because otherwise
the cheapest way to steer is to type more, which the economy never meant to sell.

## The tally

The weighted total decides. A tie in weight goes to the option with **more distinct
voters**, because a weight tie with a gap in heads means the heavier voters are the
minority and the room should win the draw. If heads also tie, a rule stated before the
ballot opened decides — the earlier option, the host's choice announced as such, or a
quick run-off — never a rule invented after the result is known.

Give the host both numbers for every option while the ballot runs — the weighted total and
the count of voters — so that it can describe the race truthfully and see a divergence
coming. When the weighted winner and the head-count winner differ, the result is legitimate
and it is also news. Say it: "most of you said left, but the veterans dragged it right". That
moment teaches the room what rank is for, and hiding it makes the next discrepancy look
like a fix. It should also be rare; if it happens on a large share of ballots, the curve is
too steep.

## Decision rules

- **When choosing a curve**, start concave and verify the two population checks — the
  heaviest voter against newcomers, the top tier against a two-thirds room — on realistic
  rank distributions from real or simulated nights, not on an imagined even spread.
- **When a ballot is tied in weight**, more voters wins; when heads tie too, the
  pre-announced rule decides.
- **When weighted and head-count winners differ**, announce both; track how often it
  happens and flatten the curve if it is common.
- **When a rank system is new**, publish the weight table where viewers can see it. A
  secret weight looks like a rigged count the first time it matters.

## When not to use it

Some ballots should be flat — one viewer, one vote, regardless of rank — because the
point is to hear the whole room: a welcome ballot for a raid, a vote among newcomers, a
decision about the show's own rules. Weight is a reward for standing, and a ballot where
standing is beside the point should not pay it. And where the audience is tiny, weight is
noise: with five voters, name the voters and let the choice be a conversation.
