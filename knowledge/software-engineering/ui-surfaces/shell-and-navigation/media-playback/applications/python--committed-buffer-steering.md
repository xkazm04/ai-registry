---
layer: application
type: application
subject: media-playback
technique: committed-buffer-steering
stack: python
verified_on: 2026-09-04
verified_against: python@3.14
applied: simulation
ab_verdict: not-better
proof: structural-only
---

# The half with a seam was already better than the technique

*Verified against the project tree at `d5bec98`.* This row is a refusal, and
it is worth more than the adoption it did not produce.

The technique has two halves. The central one — buffer depth is
simultaneously stall protection and reaction latency, so steering a
continuously generated timeline trades one against the other — has **no seam
anywhere in the fleet**, and saying so is the honest result rather than a
gap to be filled by a contrived test. No managed project runs a producer
feeding a playback timeline that third parties steer. That half is
**unapplied**, and its return condition is exactly that: when a project
grows a continuously generated timeline with contributor input against it.

The peripheral half — treat the autonomous filler producer as the
lowest-priority contributor to one bounded, admission-ruled queue — *does*
have a seam, in a speech-synthesis service's request scheduler
(`service/engine.py:80-105`). Tested against it, the technique lost.

## What the tree does better

The technique said: bound the queue, declare the admission rule, make
filler the lowest-priority contributor rather than a special case. All
correct, and all weaker than what is there.

The scheduler expresses priority as a **deadline rather than as a class**.
Each class gets a scheduling horizon (`_BULK_AGING_HORIZON_S = 30.0`,
`_INTERACTIVE_HORIZON_S = 2.0`) and the queue key is
`t_enqueue + horizon`, computed once at enqueue. Its own comment states the
consequence the technique had missed entirely:

> a bulk job enqueued at T beats an interactive job that arrives after
> T + (BULK − INTERACTIVE), so interactive work jumps the queue without
> ever being able to starve bulk work behind it.

That is preemption and a starvation bound collapsed into one number, in a
static-priority heap. The technique as written would have let a busy enough
stream of instructions starve the background producer indefinitely — which
on a generated timeline means the buffer it maintains drains to nothing
while every individual scheduling decision looks correct.

The second thing the tree knew and the technique did not: **a
caller-supplied priority is an unauthenticated privilege knob.** The
service floors the effective horizon of an explicit `deadline_s` per class,
because the field arrives in a request body — `{"deadline_s": 0.001}` would
otherwise mint a key ahead of every interactive turn *and* every bulk job
younger than the aging horizon, described in the source as "a starvation
weapon costing one JSON field." On a public steering surface every
contributor can send that field.

## The verdict and what it changed

`not-better`: the project adopted nothing, and the technique gained the
two rules above as an amendment written from what the seam showed. The
condition under which the technique's queue guidance did not hold is now
stated in it — priority expressed as a class rather than as a deadline has
no starvation bound, and any self-declared urgency needs a per-class floor.

The seam class, so a later run does not re-run this test: **a request
scheduler is not a committed-buffer timeline.** It orders work that has not
started; it has no produced-but-unplayed content, so the technique's
central trade cannot be exercised there and only its queue rules are in
range. A future project with a real generated timeline would test the other
half, and this row should not be read as covering it.

## What this comparison cannot do

It is a structural read of one scheduler, not three cases walked under two
policies, and it is labelled `simulation` on that basis rather than
promoted to something it did not earn. No arm was run: the claim "the
technique's version would starve the producer" follows from the ordering
rule as written, not from an observed starvation. A harness that drives a
mixed instruction/filler load against both orderings and counts producer
idle time would settle it, and none exists here — the scheduler has no
filler class because it has no timeline to keep full.
