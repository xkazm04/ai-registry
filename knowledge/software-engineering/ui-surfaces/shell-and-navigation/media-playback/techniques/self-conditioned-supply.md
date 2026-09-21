---
layer: technique
type: technique
subject: media-playback
technique: self-conditioned-supply
status: forged
laws: [failure-not-empty-success, limits-are-derived]
shared_with: []
use_when: [each unit a producer makes is conditioned on the tail of its own already-committed output, a late result is being discarded and re-requested and the stream still runs dry, a producer keeps generating while nothing is being asked of it, deciding whether a playback clock may wait for a producer, a spliced seam between separately produced units needs patching]
---

# Self-conditioned supply

[generated-supply-margin](./generated-supply-margin.md) treats the producer as a
black box that turns an instruction into a unit of content. A growing class of
producers is not a black box in that sense: **each unit is conditioned on the last
few moments of the content already committed ahead of it.** A continuous-motion
planner reads the previous handful of frames before it plans the next segment; a
streamed generator of speech, music or video carries a history window from the
output it just emitted. The unit is a continuation, not an answer.

That one property changes three rules the margin technique states flatly, and
each change is an inversion rather than a refinement. The producer's input now
includes the timeline itself, so the timeline's committed past becomes part of
every request, and the consumer is no longer the only party that cares where
the playhead is.

## The seam is reserved before the plan starts

A continuation has to be planned from a **snapshot at a boundary that has not
been played yet**, because the context it reads must still be true when the
result arrives. So the scheduler does three things at dispatch, not at arrival:
it chooses a future boundary (the playhead plus a lookahead), takes the committed
frames that end at that boundary as the context, and **reserves** the boundary.
The result may replace content only from the reserved boundary onward. A result
whose boundary has already been committed to playback is rejected as late; it is
never spliced in at the current playhead, because the frames it was conditioned on
are no longer the frames that precede it.

This moves [committed-buffer-steering](./committed-buffer-steering.md)'s
steerable frontier one step further out. There, the frontier is whatever has not
entered production. Here, it is whatever lies after the next reserved boundary,
and the reservation is a promise the producer and the clock both have to keep.
"Replanning cannot replace the past" is not a performance guideline in this regime;
it is what makes the output continuous at all.

The offline form of the same rule is worth stating because it is where the defect
usually appears first. Units produced separately and then joined end to end were
never conditioned on each other, so the join is a discontinuity that downstream
stages have to patch - re-anchoring a position here, blending a heading there - and
every patch covers only the channels someone thought to patch. Where the producer
can continue from a committed tail, produce the joined sequence as one continuation
with the change of instruction at the seam, and splice only when it cannot.

## A late plan is waited for when the clock is owned

The margin technique says the consumer is a clock that cannot be asked to wait.
That is true of a clock that belongs to the viewer - wall time on a broadcast, a
listener's attention. It is **not** true of a clock the system owns: a simulation
tick, a reference timeline that drives a character, any clock whose only consumer
downstream is a buffered presentation that can hold a frame.

The distinction matters because the obvious policy for a late result is wrong for
a self-conditioned producer. Discarding a late plan and re-requesting from a fresh
snapshot sounds like recovery, but the fresh snapshot sits further along the
timeline and the plan takes exactly as long as before. A cold producer - first
call, a graph not yet cached, a device warming up - is late every time, so
discard-and-retry turns one slow plan into a livelock that ends only when the
committed buffer runs out. The retry loop is guaranteed to lose, and each lap looks
correct.

So the rule splits on one question: **who owns the clock?**

- **Owned.** When a plan is outstanding and the playhead reaches its reserved
  boundary, hold the clock just before the boundary, accept the same plan when it
  lands, and resume. Surface the hold as an explicit planning state on the
  presentation, not as a silent freeze, so a stall reads as a stall
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
  Where the owned clock also steps a simulation, the slow path slows the simulation
  and never lengthens its step or skips steps to catch up, with a bounded number of
  catch-up ticks per loop. Waiting is for a plan that is **late but still current**.
  A plan answering an instruction that has since been superseded is discarded on
  arrival however punctual it is, and a new plan is dispatched against the current
  one; lateness and staleness are separate tests and they get opposite answers.
- **Not owned.** Waiting is not available, so discard is the only policy and the
  lookahead is what prevents the livelock. Derive it from the plan time at the
  percentile you intend to survive, including cold starts, rather than from the
  warm mean ([limits-are-derived](../../../../_laws.md#limits-are-derived)); a
  lookahead shorter than a cold plan fails on the first call of every session.

A mixed system usually has both clocks: the owned reference timeline waits, and
the viewer's presentation buffers a short interval and holds its last frame
rather than extrapolating. Holding is safe there only because the owned clock
upstream has already stopped. Extrapolating past a stalled reference invents
motion that the next accepted plan will contradict.

## Nothing requested is an instruction, and it has a fixed point

The margin technique's last rule is that a generated stream has no idle state:
the producer runs at its supply ratio whether anyone is watching or not, so the
cost floor equals the streaming cost. For a self-conditioned producer that rule
inverts twice.

**First, an empty command is not a neutral input.** A model trained on commands
has a default for "no command", and that default is whatever its training
fallback was - a small forward drift, a slow return to an average pose, a hum.
Passing the absence straight through asks the model to perform its fallback, and
then the next plan is conditioned on that output and performs it again. The
translation belongs at the controller: no input becomes an explicit stationary
request (the rest style, a zero speed, silence), stated in the model's own
command vocabulary.

**Second, a stationary request converges, and at convergence the producer should
stop.** Once the plan that settles into the stationary state has played, the last
unit *is* the requested content. Holding it is not filler covering an underrun,
and replanning from it is actively harmful: each replan is conditioned on the
previous one's output, so any bias the model carries at rest accumulates instead
of averaging out. Hold the settled frame, keep the clock running, mark the
presentation as holding, and replan only when an instruction arrives.

The discriminator from the margin technique's underflow rule is exact and worth
writing into the presentation state. A held frame is **content** when the
stationary state was requested and the plan that reached it has finished; it is
**an underrun** when a unit was due and did not arrive. The pixels are identical.
A gate that sees only the pixels will call a settled rest a freeze, or call a
freeze a rest, and the only thing that separates them is the command stream the
producer was answering.

This does not repeal the cost floor for every generated surface. A producer
whose content has no stationary state - a feed that must keep changing, a
narration that must keep talking - still has no idle state. The inversion holds
exactly where the requested content can stand still.

## Verifying a self-conditioned producer

The unit of verification follows from the same property. A recorded clip is not
the thing to compare, because the same instruction produces different output from
a different context. The replayable unit is the **planning event**: the committed
context at the reserved boundary, the command, the style, the random draws, and
the result. Replay each recorded event at the same boundary, compare integer
decisions (a chosen duration, a selected token) exactly and continuous outputs in
the output's own units, and add session checks that only a sequence can fail: the
replan timing, continuity of position and velocity across each seam, and the idle
case - that the stream settles, stops replanning, and holds a constant frame.

## Decision rules

- Plan every continuation from a snapshot at a reserved future boundary; reject a
  result whose boundary has been committed, never splice it at the playhead.
- Decide who owns the clock before choosing a late-result policy. Owned: hold
  before the reserved boundary and accept the late plan. Not owned: discard, and
  derive the lookahead from cold plan time.
- Test staleness before lateness: discard a result for a superseded instruction at
  once, and wait only for a late result that still answers the current one.
- Never let a discard-and-retry loop run against a cold producer; count retries per
  boundary and treat a second miss as the signal to wait or to widen the lookahead.
- Translate "no input" into an explicit stationary command in the model's
  vocabulary; do not pass an absence to a model that has a trained fallback for it.
- At a settled stationary state, stop producing and hold; resume on input.
- Carry the reason for every held frame (holding, planning, underrun) in the
  presentation state, because the frame cannot say it.
- Produce joined sequences as one continuation where the producer can; splice
  only separately produced units, and list every channel the splice patches.

## When this does not apply

A producer whose units are independent of each other - a request that renders one
clip from a prompt, a synthesizer that speaks each sentence from nothing - is
covered by [generated-supply-margin](./generated-supply-margin.md) alone: its late
results can be discarded without invalidating anything, and its idle policy is a
product decision about cost. A turn-based exchange, where a speculative reply is
thrown away when the other party keeps talking, is also outside this technique:
the other party owns that clock, nothing is conditioned on the discarded reply,
and discarding it is correct.
