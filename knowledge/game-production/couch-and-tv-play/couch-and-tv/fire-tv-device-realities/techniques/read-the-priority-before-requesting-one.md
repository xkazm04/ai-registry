---
layer: technique
type: technique
subject: fire-tv-device-realities
technique: read-the-priority-before-requesting-one
status: forged
laws: [unmeasured-is-not-a-pass, structural-proof-is-never-sufficient]
shared_with: []
use_when: [a render or input thread is given an explicit priority to steady frame pacing, network or worker threads compete with the render thread on a few weak cores, a scheduling change verified on a desktop is about to ship to the stick]
---

# Read the priority before requesting one

## The concern

Raising a thread's priority looks like the cheapest scheduling fix available: one call, a named
constant that sounds urgent, and the frame should start on time more often. On a television platform
the call succeeds and can make things worse. The platform already boosts the foreground application's
main and rendering threads above the level an application would request for itself, so an explicit
"display" priority applied to a thread that the system had already raised is a demotion. Nothing
reports it: the call returns normally, the thread runs, and the frame-pacing experiment that was
supposed to measure a boost measures a lower-priority control instead. The symptom — a priority arm
that did not help or got slightly worse — points at the idea, when the cause is that the idea was never
tried.

## Procedure

1. **Read the priorities the device gave before changing any.** On the device, during a session, list
   the game's threads with their scheduler priority or nice value. Record the main thread, the render
   thread, the network threads and the audio thread.
2. **Compare each request against what is already there.** A requested level that schedules the thread
   less favourably than the one the system assigned is a demotion. Do not apply it; record that the request
   would have lowered the thread.
3. **Prefer lowering the competitors to raising the critical thread.** Network handlers, input parsing and
   log writers can run below the render thread's priority from a dedicated pool whose factory sets it, so
   the render thread wins contention without asking the platform for anything. Confirm that threads spawned
   by those workers inherit the lowered priority.
4. **Choose the level by the scheduler value it maps to, not by its name.** A language's coarse priority
   scale maps onto the scheduler in uneven steps, and on this platform's runtime two steps below normal is
   not a small step: it lands in the band meant for background work. A socket worker placed there yields to
   almost everything, and the input it parses waits behind ordinary threads. Read the resulting value back
   on the device and decide whether that is the intent.
5. **Record actual priorities in every run's receipt.** Each performance run states the priorities the
   threads actually had, read during the run — not the ones the code requested.
6. **Verify on the device.** A desktop operating system maps thread priorities to its scheduler
   differently, so a change verified there proves the code runs, not that the device schedules it the way
   intended ([structural-proof-is-never-sufficient](../../../../_laws.md#structural-proof-is-never-sufficient)).

## Decision rules

- **When the system already boosts a thread, leave it.** Requesting a named priority on it can only
  match or lower what it has.
- **When a priority change's effect on frame pacing has not been measured on the device, it is
  unmeasured.** A desktop run that shows unchanged throughput says the change did no harm there, nothing
  more ([unmeasured-is-not-a-pass](../../../../_laws.md#unmeasured-is-not-a-pass)).
- **When a scheduling arm fails its frame gate, report the priorities it actually ran at.** A conclusion
  about "priority" drawn from an arm that ran at a lower priority than the default is a conclusion about
  the wrong experiment.

## What it does not prove

Correct priorities remove one cause of late frames. They do not establish where a late frame came from:
a long gap can be a network stall, a collection, a kernel delay or the display pipeline, and each needs
its own trace.

## When not to use

When the game runs as one thread with nothing competing, there is nothing to order. And when the platform
documents and enforces a priority policy for foreground applications, follow it rather than probing; this
technique is for the platforms where the policy is undocumented or vendor-modified.

## Evidence status

Observed on one stick: inspection during a session found the foreground main thread already at a higher
priority than the display level the game requested, so the explicit request was a lower-priority control,
and the experiment's frame-gate results were re-read as such. Lowering the network workers below the
render thread was verified on a desktop host only; its effect on the stick's frame pacing is unmeasured.
