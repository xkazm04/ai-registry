---
layer: application
type: application
subject: streaming-output
technique: cancellation-and-finalization
stack: rust
verified_on: 2026-09-02
verified_against: rust@1.95
---

# Interruption carried in the stream itself, at the receiver's queue

A dataflow runtime for robotics and AI pipelines streams between *processes*
rather than to a renderer, and its interruption design is the technique's
"stop applying" step moved one hop upstream: the producer of the next
segment sends a message whose metadata carries `flush: true`, and the
receiving node's input queue discards every older queued message before
delivering it (`docs/patterns.md` §4 "Queue flush behavior"). The stream
envelope is `session_id` / `segment_id` / `seq` / `fin`, and an interrupted
segment is one that never receives `fin` - the next segment's flush is the
only signal that the old one ended.

## What the tree confirms

The technique's three ordered steps - signal the producer, stop applying
immediately, finalize through one door - hold here with a changed carrier
for step two. The runtime does not wait for the producer to comply: the
discard happens at the consumer's queue on arrival of the flush, so a
text-to-speech node stops emitting the previous answer's audio within one
message delivery of the user speaking, whatever the language model upstream
is still generating. "Stop applying now, not when the producer notices" is
the same rule, enforced at the transport rather than the surface.

The technique's rule that cancellation preserves partial output is
confirmed in the negative: what was already *delivered* to the consumer is
its own; what was still queued is gone by design, because a queued audio
chunk for a superseded answer has no value to anyone.

## What the tree does not have, and says so

There is no finalization door and no outcome taxonomy at this layer. The
interrupted segment is not marked `cancelled`; it is simply never
completed, and a consumer that needs the four-way outcome (completed /
failed / cancelled / interrupted) must derive it from `fin` and from the
supervisor's `NodeRestarted` event, the same way the tree's service and
action helpers derive `ServerRestarted` for a correlated wait (§6). The
technique's warning applies verbatim: silence is not completion, and a
consumer that treats a segment without `fin` as finished has promoted
interruption to success.

One deviation the tree documents rather than hides: flush is per input,
not per session, so two independent sessions multiplexed on one input
cannot be interrupted separately (§4 note). The technique's "whose output
this is" obligation is met only by giving each session its own input edge.

## What this realization cannot do

It cannot tell a consumer *why* a segment ended - user interruption,
producer crash, or transport loss look identical at the queue - and the
tree defers a daemon-side synthesis of per-correlation terminal events to
future work (`dora-rs/adora#148`). Until then the outcome taxonomy lives in
the consumer, or nowhere.
