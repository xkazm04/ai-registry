---
layer: technique
type: technique
subject: perf-regression-gating
technique: host-independent-work-counts
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass, a-verdict-is-bound-to-its-content]
shared_with: []
use_when: [optimising for a target device that is not on hand, a performance wave measured on a desktop host is about to be reported, deciding which figures from a stand-in run may be stated about the device]
---

# Host-independent work counts

The concern: the device a game must fit is often not the machine the optimisation is done on. A
streaming stick, a phone or a headset is slow to deploy to, shared, or simply not in the room, and a
wave of work is measured on a desktop host. Some of what the host measures is true of the device and
some of it is not, and the distinction is not "rough versus precise". A count of the work the program
asks for — draws issued, texture switches, sprites submitted, indices, glyph quads laid out, packets
sent and their bytes, document mutations on a controller page — is a property of the program and its
scenario, and it is the same request on any host. A duration is a property of the program *and the
machine*: a desktop processor and driver price a draw, a parse or a layout nothing like a weak core
does, so host milliseconds are a statement about the host. The technique keeps the two apart all the way
to the report.

## Procedure

**1. Instrument counts at the boundary the program controls.** Wrap the calls the program makes into
the graphics layer, the socket, the document — draws, binds, buffer uploads, bytes written, mutations —
and count them per frame or per second, per phase of the scenario. These are the figures the host is
entitled to produce.

**2. Fix the scenario's inputs that change the counts.** Stage size and resolution, the level, the
number of participants, the phase (menu, race, results), the warm-up excluded. Two count figures from
different scenarios are no more comparable than two durations from different machines.

**3. Characterise the counts' own spread.** A count over a scenario paced by a real-time clock, with
opponents' decisions and collisions in it, is not identical run to run; averaged over thousands of
frames it is close, and how close is measured, not assumed. A count from a fixed-step headless run is
deterministic and needs only a repeat to confirm it.

**4. Label every figure with its host.** Each reported number carries where it was taken, on what
date, over how many frames or runs. Counts may be stated about the device as counts. Host durations are
reported as host durations, beside the counts, and never in a sentence about the device
([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).

**5. Carry the device cost as a named gap.** The claim the wave wants — the device's frame percentile
fell — is unmeasured until a device run with the same scenario measures it, and the report lists it as
an open item with the run that would close it
([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)). A wave closed on host
evidence alone says "degraded" about itself.

**6. Use a stand-in that exercises the real code.** Where the device hosts a server and a phone page
connects to it, a stand-in host that runs the real server and serves the real page, with a stand-in
loop producing real-sized payloads, lets the link be counted without the device or a handset. The
stand-in's counts transfer; its page timings are a desktop browser's.

## Decision rules

- **When a figure is a count of requests, it may be reported about the device as a count.** "Twenty
  draws per frame in the race scenario" is true wherever it was counted.
- **When a figure is a duration measured on a host, it describes the host.** It may rank candidates on
  that host; it does not estimate the device by a scale factor, because the ratio between host and
  device differs from one kind of work to the next.
- **When counts depend on the runtime, they are not host-independent.** Bytes allocated per frame
  depend on what the runtime's compiler eliminates and how its standard library builds strings; measure
  them with the host's allocation elimination disabled, and treat them as a close bound rather than an
  identity.
- **When the count fell and the device was not measured, the verdict on device cost is unmeasured.**
  The count is evidence for the change, not a verdict about the frame; a count bound to a scenario says
  nothing about a different one ([a-verdict-is-bound-to-its-content](../../../_laws.md#a-verdict-is-bound-to-its-content)).
- **When a device figure exists, it wins, and the host counts become its explanation.** A device
  percentile that did not move while the counts fell means the counted work was not the binding cost.

## When not to use

Not where the device is the development machine, or one command away — measure there. Not for costs a
count cannot see: fill rate, bandwidth, thermal throttling, scheduling, the driver's own behaviour under
memory pressure. Those exist only on the device, and the honest host report about them is that it has
nothing to say.
