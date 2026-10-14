---
layer: technique
type: technique
subject: voice-io
technique: bounded-playback-wait
status: forged
laws: [limits-are-derived, creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [a speech command or tool call returns only once its audio has played, a hook or agent call that speaks never returned, a queue starts its next utterance only when the previous one ends, the output device can be a remote sound server or a sleeping wireless headset, choosing a timeout for playback, a playback wait must survive a pause the product did not make]
---

# A playback wait is bounded by the audio, not by the device

[voice-ux-integration](./voice-ux-integration.md) says a flow never waits on the
voice, and where the flow can proceed that is the right rule. Some callers cannot
proceed. A speech command that returns once it has spoken, a tool call that reports
how long it spoke, and a queue that starts the next utterance only when the last one
ended all have waiting as their contract. For them the playback lifecycle in
[tts-pipeline](./tts-pipeline.md) has three terminal states and no deadline. An
output device that never opens, or one that accepts samples and never plays them,
leaves `playing` with no exit, and whoever waited never returns. When the waiter is
a hook an agent runs after every task, the agent is what hangs.

The device fails in exactly these two ways in ordinary setups. A sound server that is
configured but unreachable (a remote shell into a machine whose audio is forwarded
nowhere) makes the open wait on a connection that never comes. The same server, once
reached, can accept the stream and never drain it, because nothing is connected
behind it. Neither raises an error; both just wait.

## Two waits, two kinds of bound

**The open gets a fixed limit, taken from what opening costs.** Opening takes a tenth
of a second to half a second, and a few seconds for a wireless device waking up. Past
that it is not going to open. Open the device on its own thread and have the caller
wait for it with a limit, rather than calling the open itself, because the open is
the call that can block for good.

**The drain gets a deadline derived from the audio.** The producer knows exactly how
long the queued audio lasts: samples over sample rate. The deadline is when that
audio ends if the device plays it in real time, plus a grace for the device's own
buffering. For streamed synthesis the deadline moves with every chunk, and a chunk
that arrives after the previous ones ran out starts at the current instant, not at
the old end:

> expected end = max(expected end, now) + length of this chunk

A fixed overall timeout gets this wrong in both directions: it cuts a long reading
short and holds a failed short one for minutes. The length-derived bound is
[limits-are-derived](../../../../_laws.md#limits-are-derived) applied to time, and
its derivation is computed at the call, not written in a comment.

**A cue gets a small bound of its own.** A start or stop chime is a fraction of a
second; if it has not played shortly after, the recording or the reply it announces
goes on without it.

## Report the outcome, then release the device

[creation-names-reaper](../../../../_laws.md#creation-names-reaper) says the device is
released on every exit from `playing`. The order matters. Closing a device that has
stopped taking audio can itself block, so a release that runs before the outcome is
sent holds back the very error that says what went wrong. Send the outcome to the
caller first and close afterwards; if the close hangs, it hangs on the playback
thread, which the caller does not join. A thread left waiting on a device that never
answered is abandoned, not awaited.

## Stop producing once the device is not opening

A streamed producer asks before each chunk whether the device is stuck opening, and
stops generating when it is. There is no reason to spend a model's time on audio that
has nowhere to go, and the error that ends the call is then about the device, not
about synthesis.

## The failure is a sentence the caller can act on

`failed` must be spelled differently from `completed`
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)), and the
two device failures must be spelled differently from each other: "did not open
within N seconds" and "accepted the sound and is not playing it" send the reader to
different places. Each names the route that needs no device at all, which is writing
the audio to a file.

The tests stand fakes in for the device, because a real one cannot be made to fail on
demand: a sink that accepts audio and never plays it, an opener that never returns,
and a device whose release blocks. Each test asserts the error text and an upper
bound on how long the call waited. The way to open the device is a parameter of the
playback thread for exactly this reason.

## When the channel can pause, the deadline runs on the audio clock

Everything above assumes nothing pauses playback, which is true of a command that
speaks one utterance and exits. A media element inside a browser engine can be paused
by things the product did not do: the operating system's media controls, a headset
button. A pause is a suspension, not an exit, and it may be resumed. A deadline
counted on the wall clock from the start of playback then rejects a clip that was
paused and later finished normally. In one engine, a one-second clip paused for two
seconds ended at 3.2 seconds; any wall-clock grace shorter than the pause would have
failed it.

So where the channel can pause, count progress of the playback position while not
paused, and call it a stall only when the position has not moved for the grace while
the element says it is playing. While paused, no deadline runs. A pause that is never
resumed is not a timeout case: it is a suspended utterance, and the caller retires it
by its own identity, the way [tts-pipeline](./tts-pipeline.md) retires a superseded
utterance.

## A mediated engine has already bounded the device

The same engine ended a one-second clip on time with its audio output disabled: it
played into a substitute sink and fired the end event at 1.26 seconds. Where playback
runs inside an engine that substitutes a sink for a missing or failed device, the
device half of this technique is the engine's job, and a product-side device watchdog
guards a failure that does not reach the product. Measure the engine before adding
one. The bound belongs where the product talks to the device itself: a native audio
library, a command-line player, a daemon that plays.

## Decision rules

- **If a caller waits for playback to end, bound the wait twice:** a fixed limit on
  the open, and a deadline on the drain derived from the queued audio's length plus a
  grace.
- **If synthesis streams, move the drain deadline per chunk,** from the later of the
  old deadline and the current instant.
- **Send the outcome before closing the device,** and never join a thread that is
  waiting on a device.
- **If the device is stuck opening, stop generating.**
- **Spell the two device failures differently,** and name the file route in both.
- **If the channel can pause, measure the stall on the playback position,** and run no
  deadline while paused.
- **If an engine between the product and the device substitutes a sink,** measure
  whether the device can still hang the product before adding a watchdog.

## When not to use it

- **Nothing waits.** A narration that follows a flow, a read-aloud button, a status
  chime: the flow proceeds and the voice follows
  ([voice-ux-integration](./voice-ux-integration.md)). There is no wait to bound.
- **The audio goes to a file.** No device is involved, and the call returns when the
  write does.
- **The device layer belongs to an engine that already ends clips on a substitute
  sink.** The remaining unbounded state there is a pause nobody resumed, which is a
  lifecycle state, not a timeout.
