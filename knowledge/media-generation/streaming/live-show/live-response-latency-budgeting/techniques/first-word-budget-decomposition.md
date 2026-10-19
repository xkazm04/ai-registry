---
layer: technique
type: technique
subject: live-response-latency-budgeting
technique: first-word-budget-decomposition
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [setting a response-time target for a live generated host, replies feel late and nobody can say which stage is slow, adding a new stage between chat and speech]
---

# First-word budget decomposition

A live host's response time is a sum of stages, and a target set on the sum
without a line for each stage is a wish. This technique turns "the host
should answer quickly" into a budget: a total, fixed by what the audience
tolerates, divided into named stages, each with a high-percentile allowance
and an owner, measured end to end on the clock the viewer sees.

## The total is tolerance minus what the show cannot remove

Start from the viewer, not the model. The viewer's loop runs from sending a
line to hearing the host take it up on their own screen. Part of that loop
belongs to the platform: chat transport in, and the broadcast delay on the
way out (encoding, segmenting, delivery, the player's buffer), which runs to
seconds and varies by the viewer's player mode. The show cannot spend that
time and cannot shorten it from the host side, so subtract it first.

What remains is the host's budget, and it is the number this technique
divides. Write it as **time from a message being accepted to the first audible
word of a reply about it**, at a stated percentile. The practical target for
a generated host lands at a few seconds to the first word; a host that takes
longer than that is heard as not having heard, and the broadcast delay makes
the felt wait longer still. A sub-second conversational target is right for a
private voice agent and wrong here, because the broadcast already spent more
than that before the host started.

## The stages, named

Every stack differs, but the stages a live reply passes through are close to
universal, and each one is a line in the budget:

1. **Scheduling wait**: the time a message sits before the loop looks at it.
   A loop that wakes on a fixed tick adds up to one full tick to every reply,
   and on average half of one. A batch window that collects chat for a few
   seconds before choosing adds its full length. This is the line most often
   missing from a budget and most often the largest.
2. **Admission**: input moderation, injection screening, and the decision
   whether to answer this message at all.
3. **Picking and assembly**: choosing which message to take up, and building
   the prompt.
4. **Time to first token** of the model call that writes the line.
5. **First speakable unit**: tokens until the first clause or sentence that
   synthesis can start on. A model that opens with a long preamble pays here.
6. **Output gate**: whatever must check the text before it is voiced, sized
   to the first unit, not the whole reply.
7. **Time to first audio** from synthesis, measured on the hardware that runs
   it.
8. **Compositing and encode-in**: the hop into the broadcast pipeline.

Give each line an allowance at the high percentile and a named owner. The
allowances sum to no more than the host's budget; when they do not, a stage
must shrink or move off the path. A stage nobody owns grows.

Three hidden costs hide inside line 4 and are worth naming. Every tool call
the voicing model makes is another full round trip and another first token,
so the voicing call is kept tool-free and what it would have looked up
(memory, state, the open poll) is fetched into its prompt before the call.
Starting a model process per reply adds a start-up cost to every line, so a
warm session is held open; but a warm session that accumulates its own
history while the prompt is rebuilt each turn grows its input, its cost and
its first-token time without bound, so it is recycled on a fixed number of
turns. And a prompt whose opening section is byte-stable across turns can be
served from a prefix cache, which shortens first-token time on every call;
keeping that prefix stable is the persona subject's discipline, and its
latency payoff is a line here.

## Budget the tail, and measure on the stream clock

Allowances are set at a high percentile, not the median, because a live
audience hears every reply and remembers the slow ones. A stage whose median
is small and whose tail is long is a stage that will eventually own the room's
silence; it is the tail that the budget must hold. Percentiles do not add, so
the end-to-end high percentile is measured directly, never computed from the
stage figures; the per-stage figures say where to look when the total misses.

Measure on the clock the audience experiences. In a simulated stream that
advances on a synthetic clock, a stage that blocks real time may be invisible
in stream time, or the reverse; instrument both and budget on the one the
viewer lives in. A budget that has never been measured end to end is not met,
whatever each stage's benchmark says.

## Decision rules

- When the end-to-end figure misses, attack the scheduling wait first; a tick
  or batch window is free to shorten and often costs more than the model.
- When a stage needs the whole reply, move it to operate on the first unit or
  move it after voicing begins; never let it hold the first word.
- When a new stage is proposed, it brings its own allowance and the stage it
  takes the time from; a stage added without a line is added to the tail.
- When the broadcast delay grows (a player mode change, a resilience buffer),
  recompute the host's budget; the tolerance did not grow with it.

## When not to use it

A pre-recorded or scheduled segment, a host that reads a script without
taking chat, or a stream whose interaction is asynchronous by design (answers
read out later from a queue the audience knows is a queue) has no response
clock to budget. Keep only the silence ceiling for those.
