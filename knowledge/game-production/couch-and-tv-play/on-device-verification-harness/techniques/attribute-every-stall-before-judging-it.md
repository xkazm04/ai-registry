---
layer: technique
type: technique
subject: on-device-verification-harness
technique: attribute-every-stall-before-judging-it
status: forged
laws: [no-gate-self-certifies, an-instrument-proves-it-had-input, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a soak reports input stalls or slow frames and nobody knows which machine produced them, the harness samples the device from the same process that drives the load, a bar failed and the fix is about to be chosen from the failing figure alone]
---

# Attribute every stall before judging it

## The concern

A soak on a real device reports that something was late: an input that reached the game after its
due time, a frame over its budget, a window that failed its bar. Three machines could have produced
it — the host driving the load, the link between them, and the device running the game — and on the
device, any of the units of work the render thread ran that frame. A verdict written before the stall
is attributed blames the game by default, and the fix chosen from it is chosen blind. The harness's
own sampling is the most common unattributed culprit: a host process that drives the load and also
asks the device for its statistics, synchronously, on the same loop, stops pumping input for as long
as the device takes to answer, and the stall it then reports is its own.

## Procedure

1. **Run an independent heartbeat on the host.** A separate thread or process that does nothing but
   record a timestamp at a fixed cadence, sharing no loop and no lock with the load pump or the
   probes. It answers one question: was the host itself able to run on time? If the pump was late and
   the heartbeat was not, the pump's own process stalled. If both were late, the host stalled. Only if
   neither was late does the stall belong to the link or the device. Record the host's load at the
   start and end of every run beside it; a shared host's load is a condition of the run, like the
   device's temperature.
2. **Move the probe off the pump's loop.** Device sampling — a memory report, a thermal reading, a
   frame-statistics query, a log read — runs on its own thread or process and never on the loop that
   schedules input. Calling it through an asynchronous interface from that loop is not proof that the
   loop is spared: the result is still handled there, and how much of the start-up runs there depends
   on the runtime and on how loaded the host is. A probe written to be asynchronous is cleared by the
   heartbeat, not by its interface. Measure the probe's cost once, deliberately, and record its period
   so that a stall periodic at that period can be recognised.
3. **Time each unit of work on the device's render thread.** Every request the render thread runs — a
   queued command, a lazy build, an upload, a save — is wrapped in a timer that records its name, its
   duration and the frame it ran in, whenever it exceeds a set share of the frame. A slow frame is then
   joined to the requests that ran in it. One log line per request, not per frame, keeps the timer's
   own cost off the frames it measures.
4. **Classify every slow frame.** Each one is attributed to a named request, to the harness (by the
   heartbeat), or left as unattributed. A request's cost shows up more than once: in the frame where
   it ran, in the next frame if the interval is measured from frame start to frame start, and in any
   simulation catch-up the long interval triggers. Those neighbours are attributed to the same request,
   not counted as separate causes. The report carries the counts per class. An unattributed slow frame
   is a gap in the instrument, reported as such; it is not the game's fault by default and not the
   harness's by convenience ([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)).
5. **Prove the attribution can fire.** Inject a known stall of each kind — a sleep in the pump, a
   sleep in a named render-thread request — and confirm that each is attributed to the right owner
   before trusting a clean run ([an-instrument-proves-it-had-input](../../../_laws.md#an-instrument-proves-it-had-input)).
6. **Fix by name, then measure again.** A change is chosen for a named request and judged by that
   request's time on the next run, beside the bar it was meant to restore.

## Decision rules

- **When the load pump is late and the heartbeat is not, the harness caused the stall.** Move the
  probe, rerun, and keep the failed run under its own name; do not rewrite it as a pass.
- **When the heartbeat and the device both report on time, the stall did not happen to the game.**
  Report it as a harness event, with its duration and period.
- **When every remaining slow frame has a name, the investigation is over and the work begins.** When
  some have none, add timers before changing code; a fix for an unattributed frame is a guess.
- **When a bar is stated over a fixed window, read a failed window as an event first.** A bar on a
  window's maximum, or a percentile over a window too short to hold more than a few frames beyond it,
  fails the whole window for one slow frame. Attribute that frame; the window's other frames are
  evidence too, and the report says that one frame failed it. Where the windows are rolling and read
  more often than their length, one frame fails every window that contains it, so a count of failed
  windows can stand still while the worst frame falls by an order of magnitude; report the frames and
  their causes beside the count.
- **When the game's own timers are the only evidence, label them self-reported.** A request timer is
  the game measuring itself; the frame statistics the platform keeps, or a host-side heartbeat, are the
  outside readings that corroborate it ([no-gate-self-certifies](../../../_laws.md#no-gate-self-certifies)).

## When not to use

When the harness drives no load and samples nothing synchronously, there is no host stall to rule out,
and a heartbeat is ceremony. Per-request timers cost a clock read per request; on a render thread that
runs thousands of tiny requests a frame, time the classes of request rather than each one. And this is
not a profiler: attribution names which request was slow, not why its code was slow.

## On fixed-refresh standalone headsets

The rule holds unchanged, because it is about the instrument rather than the display. A headset runs
the same family of mobile operating system and is driven and sampled over the same kind of debug
bridge, so a harness's own sampling can stall it the same way, and the platform's own guidance warns
that system-wide tracing adds overhead of its own. What a headset adds is a better outside reading:
when the application misses a refresh the platform shows the previous frame again and counts it as a
stale frame, so a slow frame has a platform-side witness to set beside the game's request timers, and
a frame rate read per window can look healthy while that count climbs. No headset harness was run;
the transfer is a statement about the method.
