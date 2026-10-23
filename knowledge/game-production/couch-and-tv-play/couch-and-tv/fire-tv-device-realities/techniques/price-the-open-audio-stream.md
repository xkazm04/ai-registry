---
layer: technique
type: technique
subject: fire-tv-device-realities
technique: price-the-open-audio-stream
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a game's sound is suspected of costing frames on a streaming stick, deciding whether to cut the mix or change how audio output is opened, a low-latency or deep-buffer audio request is assumed to change the device's audio path, frames over budget persist after the mix was trimmed]
---

# Price the open audio stream

## The concern

On a weak living-room device, the cost of sound is not only the cost of the mix. While any
output stream is open, the platform's mixer and its hardware writer stay out of standby, and
each can take a large share of a core and preempt the render thread at every buffer handoff.
An open stream writing nothing but silence can therefore cost the frame budget as much as the
full mix does. A team that sees audio in a trace and trims sounds saves nothing, and the slow
frames stay pinned on content that was never the cause.

A three-arm soak on one stick measured exactly this: a stream writing zeros cost the render
thread as much as the game's full mix, and requesting a deep-buffer output did not avoid it,
because the device declared no such route and the request landed on the same mixer.

## Procedure

1. **Run the same soak in three arms**: no stream open, one stream open writing zeros, and
   the full mix. Every other call the game makes is identical across arms. Two runs per arm,
   and an arm beats another only if both of its runs read lower.
2. **Trace one run of the silent arm** and attribute the render thread's preempted time to
   the platform's mixer and writer threads, so the cost has a named owner.
3. **Read the output routes the device declares** before asking for a buffer or performance
   mode. A mode with no route behind it changes nothing, and the measurement should show it.
4. **Close the stream whenever nothing plays** - menus, pauses, quiet stretches - and confirm
   from the platform's own state that the mixer went to standby.

## Decision rules

- When the silent arm costs as much as the full mix, the lever is the stream's lifetime, not
  the content.
- When the silent arm costs nothing, the mix is the cost; trim it.
- Report each arm's frame figure with its unit and window, beside the stream state it was
  measured under.

## When not to use it

On a device that declares a mixer-bypass or low-latency route, the open stream may be cheap;
it needs its own measurement through that route. The figures above are one device on one
platform release and do not travel; the three-arm method does.
