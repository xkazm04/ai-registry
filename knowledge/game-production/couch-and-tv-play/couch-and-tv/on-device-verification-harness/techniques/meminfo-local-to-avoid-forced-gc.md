---
layer: technique
type: technique
subject: on-device-verification-harness
technique: meminfo-local-to-avoid-forced-gc
status: forged
laws: [an-instrument-proves-it-had-input, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a memory sample is taken from a running game on a device, a periodic frame spike shares a period with a polling interval, the measurement tool may be the cause of the stall it reports]
---

# Measure memory without forcing a collection

The named concern: sampling the memory of a game on a real device must not itself change the
memory or the frame times it is sampling. The platform's default per-process memory report
asks the target process to prepare its own numbers, and on a managed runtime that request
can force a collection. A sampler that fires once a minute then plants a collection and a
long frame once a minute, and the soak reports a rhythmic hitch that the game does not have.

## The signature

The tell is periodicity that matches the harness, not the game. A single long frame at an
interval equal to the memory-sampling period, with frame times flat in between, is the
instrument's fingerprint. A game's own cost does not align to the tester's polling clock. The
second tell is a collection logged by the runtime at the sample instants. Together they are
enough to suspect the probe before any change is made to the game, which is the order
that saves a week.

Do not read an unusual frame as the game's fault until the measurement path has been ruled
out. The converse also holds: a game whose frame times show a spike at a period unrelated to
the harness has a real problem and should be profiled as one.

## The remedy

Use the report option that collects details locally, in the service's own process, and does
not call into the application. The device's own help text for the command states the option;
the stated option name is worth confirming against that help rather than a remembered one,
because the flag set varies by platform release. Its output still contains the totals that
matter to a soak, the proportional set size and the graphics memory entries, but it omits
the detailed managed-heap breakdown that required the application's cooperation. The trade is
deliberate: a coarser number that does not disturb the system beats a richer number that does.

A second route for the same readings is a lower-level source of the process's memory
accounting that the platform exposes as a file, read through the debug bridge. It is also
non-intrusive, and is the fallback when the report option is unavailable.

## Procedure

1. Before the soak, take one intrusive reading and one local reading at the same instant,
   from the same process, and compare the totals. This establishes that the cheaper reading
   is faithful enough for the question; write the difference down with its unit.
2. Run the soak sampling only with the local reading, once per sampling period, on the
   asynchronous side of the harness so the cost of the command does not delay the load pump.
3. Log each sample with its time, the process identity and the unit, kilobytes of
   proportional set size, never an unlabelled number.
4. Look for growth with a stated window and slope, not by eye on two numbers. A range with no
   trend over the soak is a finding about that soak, with the device's start state.
5. Keep the earlier intrusive run in the record. It is evidence about the cost of the probe.
6. Compare frame-time periodicity before and after the change of sampling method. If the
   periodic spike disappears, the probe was the cause; if it remains, the game is.

## Decision rules

- **When a periodic spike aligns with a sampling clock, change the sampling before the game.**
- **When the memory number is a ceiling check, read the local total.** It is the number the
  platform's low-memory killer reasons about, not the managed heap alone.
- **When the heap breakdown is the question, accept the intrusive reading and say so.** Take it
  once, outside the timed window, and exclude no frame it caused from the record; label them.
- **When the readings are used as growth evidence, state the sample count and the span.** A
  flat series over fifteen minutes does not clear an hour.
- **When the report omits an entry the question needs, say the entry is unmeasured.** The local
  option does not return everything; a missing field is not zero.
- **Never call a number "memory" without saying what it counts.** Proportional set size,
  resident size, graphics-driver memory and heap size answer different questions and differ by
  tens of percent.

## Interaction with allocation work

A collection that the harness did not cause is a different matter and belongs to allocation
discipline in the hot path: find what allocates per step, and fix that. This technique only
guarantees that the instrument does not manufacture the collection. Do the instrument first;
otherwise an allocation fix is tested against a stall the fix cannot touch.

## When not to use it

On a platform whose service tool has no such option and no cheaper source, the choice is
between an intrusive reading at a long interval and no reading. Prefer a long interval of
several minutes, schedule it between phases rather than inside an active window, and
declare the sample instants in the result so a spike can be matched against them.

## Evidence status

Measured on one device: the ordinary report coincided with an explicit copying collection and
a long render interval every minute; switching to the local option removed the rhythm and the
final soak showed no sustained growth within its range. The option name was taken from the
device's own help. Nobody measured how large the intrusion is on other devices or runtimes,
nor the difference between the intrusive and the local totals beyond that soak.
