---
layer: technique
type: technique
subject: on-device-verification-harness
technique: poll-ready-signal-not-fixed-delay
status: forged
laws: [structural-proof-is-never-sufficient, an-instrument-proves-it-had-input]
shared_with: []
use_when: [a harness waits a fixed number of seconds after a launch or restart before it talks to the game, a check sometimes fails and sometimes passes on the same build, a screenshot was taken after an assertion and is being used to explain it]
---

# Poll a ready signal, not a fixed delay

The named concern: every step of a device harness that depends on the game having reached a
state is gated on the game announcing that state, read from the device, with a bounded
timeout, and never on elapsed time.

## Why a delay is the wrong instrument

A fixed delay is a guess about a distribution. On a low-memory device the time from "the
launch was accepted" to "the listener is up" varies with thermal state, with what the
platform was doing a moment ago, with whether native code was already paged in, and with
how many other processes the platform chose to keep. A delay long enough for the worst case
wastes the budget of every run; a delay tuned to the typical case fails on the day the
device is slow, and the failure looks like a defect in the game.

The deeper fault is that a launch command answers a narrower question than the one being
asked. It reports that the platform accepted an intent. It does not say that a window
exists, that the process finished starting, that a network listener is bound, that a
catalogue has been loaded, or that the visible control is enabled. Each of those is a
separate fact and each has its own signal. A harness that waits for the command and then
sleeps has assumed all of them.

## The ready signal

Choose the signal at the same layer as the next action. If the next step is a network
request, the signal is the listener answering, or the game's own log record saying it is
listening. If the next step is a tap on a control, the signal is the control's own
enabled state, read from the page, not a sibling element that appears earlier. If the next
step reads the game's state endpoint, the signal is a field in that state that the game
sets last: "scene ready", "not paused", "all seats connected".

The signal must be **a thing the new process produced**. After a restart, the log still
holds the previous process's records, and the previous process's pairing code is a
perfectly well-formed wrong answer. Scope the read to the new process identity (ask the
platform for the live process id after the launch and filter the log by it), and require
that the identity changed when a restart was requested. A signal that survives the thing it
signals is not a signal.

## Procedure

1. Name the fact the next step needs, in one sentence ("the listener of the new process
   accepts connections").
2. Name the observable that proves it and who produced it. Prefer the game's own
   declaration over an inference, and the platform's process list over a log line.
3. Poll it at a short fixed period (a tenth of a second to a second, by the cost of one
   read), swallowing transport errors as "not yet", because before the signal exists the
   probe is expected to fail.
4. Bound the wait with a ceiling stated in the code and chosen from observed worst cases
   with margin. On timeout, throw a named failure that says which signal never arrived, and
   which of its prerequisites were seen. A timeout is a result.
5. When the signal arrives, record how long it took. The sequence of times is the cheapest
   startup-regression detector the harness will ever have, and it comes free.
6. Apply the same shape to the wake of a sleeping display, the restart of the process, the
   reconnection of every controller, and the end of a transition. Do not special-case any.

## Decision rules

- **When the next action is an assertion, wait for the property the assertion reads, not a
  nearby visual state.** A panel can become visible before the data it will show has been
  bound; an assertion that fires on visibility reads a stale default and passes or fails by
  accident. The remedy is to make the property itself the wait condition and then to assert
  separately that the host refuses the forbidden action.
- **When a failing assertion is explained by a screenshot, check when the screenshot was
  taken.** A frame captured after the assertion fired shows the later state, not the state
  the assertion saw. Capture inside the failing handler, before anything else runs, or do not
  use the image as evidence of the cause.
- **When the signal is a log record, cap what is expected of the record.** Platform log lines
  are truncated at a modest size; a measurement packed into one record is silently clipped.
  Emit a compact record for readiness and read full state from a query endpoint, and treat a
  truncated record as no record.
- **When the ceiling expires, fail, do not retry silently.** A harness that retries the launch
  on timeout turns a start-time regression into flakiness nobody can attribute.
- **When a fixed pause is genuinely needed, name what it is waiting for and why no signal
  exists.** A pause for physical settling, such as a display recovering from a mode change, is
  legitimate; a pause standing in for a missing log line is a missing log line.
- **A polling period is not a latency measurement.** The recorded time to ready has the
  period's resolution; never present it with more precision than the period.

## What this does not fix

A ready signal tells the harness the game believes it is ready. It is a self-report of the
producer, and under the bundle's rule that no gate certifies itself, it licenses the next
step of the harness and nothing more. Whether the thing behaves is judged by a later
observation of state the game did not write.

## When not to use it

When the harness is the only thing that can observe the interval itself, for example when a
check measures how long startup takes, the poll's resolution becomes part of the measurement
and must be stated beside it. And when the platform offers a blocking primitive that returns
only on the real event, such as a command that waits for a process to attach, use that
instead of a poll, provided it is bounded by the same ceiling.

## Evidence status

Measured on one device: a restart followed by a fixed 2.6 second wait failed to find the
new process's pairing code, which appeared later; the same harness polled the new process's
log up to a thirty second ceiling and succeeded. A career-sheet assertion fired on a
visible-but-unbound control on the same device. Nobody has measured the distribution of time
to ready across thermal states, so the ceilings are authored from a handful of observed
runs, not derived.
