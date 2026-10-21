---
layer: technique
type: technique
subject: audience-absorption-at-scale
technique: size-tiered-picking-mode
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [designing how a live host selects chat messages, a host that is fine in small rooms and lost in big ones or the reverse, choosing thresholds between answering, choosing and aggregating]
---

# Size-tiered picking mode

A message picker has three distinct jobs depending on how many people are talking, and
the technique is to make the job an explicit **mode** selected from room size, rather
than one ranking function whose weights are expected to stretch from three chatters to
three hundred. The naive single picker is tuned in whatever room its author tested in
and is wrong in every other.

## The three modes

**Answer (an empty or near-empty room).** Every acceptable message gets a reply, in
arrival order, as soon as the host can speak. In a room of one to a handful, not being
picked is indistinguishable from being ignored, and the person ignored is a large share
of the audience. Priority barely matters because the queue is rarely more than one deep.
The host's other job here is filling silence between messages, which is content design,
not picking.

**Choose (a mid-size room).** More messages arrive than the host can answer, but each
message is still individually visible to the room and each sender still expects a name.
The picker ranks candidates and answers the best one each turn. "Best" is a blend, never
one signal: freshness (a message older than a few turns is a reply to a moment that has
passed), novelty of the sender (who has not been answered recently), the message's fit to
the current segment, questions over statements, and a bounded nudge for rank. Unpicked
messages expire rather than queueing forever, because a reply to a stale message is worse
than no reply.

**Aggregate (a large room).** Individual messages scroll faster than anyone can read them,
including the room itself. The host answers the **crowd** — what the room as a whole is
saying, voting, asking — and spotlights individuals sparingly, as a deliberate beat rather
than as the default. Ranking still runs, but over clusters of similar messages rather than
single ones, and the largest cluster usually wins.

## Selecting the mode

Key the mode to **distinct active chatters in a sliding window** of a few minutes, never to
viewer count; lurkers outnumber chatters by an order of magnitude and that ratio varies
from show to show. Count senders, not messages, so one prolific viewer cannot push a room
of two into choose mode.

Use **hysteresis**: enter choose at a higher chatter count than the one at which you fall
back to answer, and the same for aggregate. Without it a room hovering at the boundary
alternates modes message by message, and the host's manner — names one moment, summaries
the next — reads as erratic.

Place the thresholds where the host's answer rate meets the arrival rate. If the host can
answer roughly one message per turn and a turn is several seconds, answer mode holds while
chatters times their per-chatter message rate stays below that capacity; choose mode holds
while individual messages remain legible on screen; aggregate begins when a message
typically leaves the visible chat before the host could have answered it. The chat itself
confirms the last boundary: it is where the room turns to crowdspeak, with messages
shrinking to a few words, copies and emote chains dominating, and distinct vocabulary per
stretch of chat falling to around half that of a conversational room. One large study of
public livestream chat logs measured where that turn happens (Nematzadeh et al., 2019,
arXiv 1610.06497). Messages per chatter rise with total chat volume up to about forty
messages per five minutes, roughly one every seven or eight seconds, and fall above it,
while messages shorten, repeat and fill with emotes. Below that point a livelier chat
draws each chatter out; above it, extra volume buries them. That figure places the
aggregate boundary to within an order of magnitude, and it is the only published
measurement of it. The thresholds are still properties of the host's pacing, the display
and the crowd, so derive them for the show rather than copying numbers from another one,
and validate them with a simulated audience at each size before trusting them.

## When a model chooses

Somewhere in choose mode a hand-tuned score stops reading the room well: it cannot tell a
witty aside from a dull one, or notice that three messages are really one argument. Handing
the choice to a fast model is reasonable there, under three conditions. The deterministic
score narrows the pool first, so the model sees a few dozen ranked candidates, not the
firehose. The model returns an **order**, not a decision: every cap, exemption and
one-pick-per-viewer rule runs after it, in code, on what it returned, and anything it
names that is not in the pool is ignored. And when the model errs, times out or returns
nothing usable, the deterministic pick stands in for that turn. Chat shown to a picking
model is data, never instructions; messages already tagged as manipulation attempts reach
it as a placeholder, not as their text.

## Decision rules

- **When a single picker must serve rooms of very different sizes**, split it into modes;
  do not re-weight one ranking function, because no weighting makes arrival order and
  clustering the same algorithm.
- **When the picker emits nothing this turn**, check the backlog before letting the host
  remark on a quiet room; an empty pick from a non-empty chat is a picking state, not
  silence.
- **When a mode switch fires**, let the host mark it lightly if at all ("chat's waking
  up"); never announce the machinery.
- **When tuning**, report responsiveness separately per room size. A blended figure across
  sizes hides a mode that fails completely in one band.

## When not to use it

A show whose audience never leaves one band — a private session with a fixed handful, a
broadcast where chat is closed and only curated questions arrive — needs only the one mode
that band calls for. Building the other two is machinery with no room to serve. Equally,
mode selection is not moderation: the input to every mode is the set of messages that have
already been judged acceptable.
