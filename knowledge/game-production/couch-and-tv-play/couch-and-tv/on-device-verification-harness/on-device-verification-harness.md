---
layer: golden-path
type: golden-path
subject: on-device-verification-harness
status: forged
use_when: [an unattended agent will install, drive and measure a game on a real low-memory device, a soak or a restart drill is about to be run and reported, a number from the device is about to be believed, a verdict about touch or feel is about to be written from scripted input]
techniques:
  - poll-ready-signal-not-fixed-delay
  - absolute-due-time-load-pump
  - fresh-state-per-check
  - meminfo-local-to-avoid-forced-gc
  - separate-active-race-from-transition-windows
  - keep-the-failed-baseline
  - emulated-touch-is-not-physical-touch
  - attribute-every-stall-before-judging-it
---

# On-device verification harness

An agent that nobody is watching puts a build on a real device, drives it, reads numbers
back and writes a verdict. Every step of that loop can fool it, and none of the ways is
exotic. The harness waits too briefly and reads a process that is not yet ready, or waits
too long and wastes the budget. It asks for a rate and gets a lower one. It inherits what
the last session left on the device and blames the wrong change. Its memory probe causes the
stall it then reports. It averages a loading screen into the play it is judging. It tidies away the
run that failed. And it sends synthetic touch and writes "controls verified". This subject
is the discipline that keeps the measurement honest about itself: not how to build the loop in
general, but the small number of ways a loop on a real, small, long-lived device deceives its
own author, and the check that closes each.

The device is the reason. A low-memory streaming stick has a managed runtime that collects at
moments it chooses, a thermal state that depends on the last hour, a platform that kills and
restarts processes, and a controller that is a phone on a radio link. An emulator has none of
these, so an emulator-trained habit, a fixed sleep, a shared output path, a clean start
assumed, is quietly wrong on the shelf device. The harness has to be written for the shelf
device from the first line.

## The instrument is part of the experiment

The unifying idea is that on a real device the act of measuring is a stimulus. A memory
report can ask the application to prepare, and the preparation is a collection. A command
that shells out to the device every few seconds starves the pump that is generating the load.
A screenshot costs a frame. A readiness probe on a log can read the previous process's
answer. A harness is not a window onto the game; it is another actor on a very small machine,
and its effects belong in the analysis. The rule that follows is to know the cost of every
probe, to put the expensive ones outside the timed window or on the other side of the
asynchronous boundary, and to look first at the instrument whenever a number is
periodic at the harness's own period.

The same rule decides who owns a stall. A late input, a slow frame or a failed window had three
possible authors — the host driving the load, the link, the game — and a verdict written before
the stall is attributed blames the game by default. An independent heartbeat on the host, sharing
nothing with the load pump, says whether the host could run on time; timers on each unit of work
the device's render thread runs say which request a slow frame belonged to; and a slow frame that
neither names is reported as unattributed, a gap in the instrument rather than a fault of either
side. An interface that is asynchronous does not prove the loop that calls it is spared — the
result is handled there, and part of the start-up may be — so a probe written to sample
asynchronously stays a suspect until the heartbeat clears it. `attribute-every-stall-before-judging-it`.

## Wait for the fact, not the clock

Time is the cheapest thing to wait on and the least informative. A launch command reports
acceptance, not readiness, and the time between the two is a distribution that depends on
heat, memory pressure and what the platform did a moment ago. A harness that sleeps for a
fixed number of seconds is correct on the day it was written and wrong on a slower day,
and the failure looks like a defect in the game. The alternative is to name the fact the next
step needs and to poll its signal, produced by the new process, with a bounded timeout and a
named failure. The same shape serves waking a display, restarting a process, reconnecting a
controller and ending a transition. It also fixes a quieter fault: an assertion that fires on
a visible control before the data behind it is bound reads a default and passes or fails by
accident. See `poll-ready-signal-not-fixed-delay`.

## Load that is the load it says it is

A scripted client standing in for a player at a fixed rate is only a load if it delivers that
rate. A repeating relative timer accumulates its own lateness and is quantised to the host's
timer resolution, so a requested thirty hertz arrives as twenty-odd, and every claim about
headroom is stated at an operating point nobody chose. The fix is to schedule each frame
against the time it was due, to bound the catch-up so lateness does not become a burst, and to
publish the delivered rate beside the requested one. `absolute-due-time-load-pump` owns
it. The pump measures what was sent on time, not what arrived on time; the link and the
device's scheduler remain in the path.

## A check begins from a state it chose

A device on a shelf remembers: a playback position, a saved profile, a session, a warm
heat history. A check that inherited any of these will eventually accuse the wrong change,
usually the most recent one, and the investigation that follows is spent on correct code.
So every check establishes or asserts the state it needs, records what it found first, and is
independent of order unless it is declared a chain. The recovery paths, the ones that run only
when state is lost, are run on purpose: send the platform's home control and assert that the
listener stops and that, on return, persistent state and neutral controls come back; kill the
process and assert that a fresh pairing recovers what was saved. State that cannot be reset,
thermal start and free memory, is recorded rather than ignored. `fresh-state-per-check`.

## Measure without moving the number

On a managed runtime the platform's ordinary memory report can force a collection in the
target. Sample once a minute and the soak has a long frame once a minute that the game does
not have. The tell is periodicity that matches the harness's clock; the remedy is the report
option that gathers details locally without calling the application, confirmed against the
device's own help, with an intrusive reading taken once, deliberately, outside the timed
window. The local report loses the heap breakdown and keeps the totals a soak needs, and the
trade is made on purpose. `meminfo-local-to-avoid-forced-gc`. What the game itself allocates
in its step is a different problem, owned by the allocation discipline of the hot path; this
technique only guarantees the probe is not the one allocating.

## Phases are different populations

A session is play and the transitions around it. One figure for both is wrong in both
directions: a single scene build sets the maximum and the report accuses play, or the build is
dropped to clean the number and the hitch is forgotten. Windows are labelled by the phase at
their start and end; those that straddle are their own line; each population is reported with
its worst window percentile and its worst window maximum, both kept, and a strict claim over
"all windows" is written only if it is true of all of them. A pooled percentile is the merge
of distributions, never an average of window percentiles. `separate-active-race-from-transition-windows`.

## The record outlives the fix

A failed run, an intrusive measurement and the profiling that explained them are results. The
tidy final run, written to the same path as the first, erases the reason the method looks the
way it does, and the next person simplifies it back into the fault. The harness keeps the
failed baseline whole under its own name, writes the later run as a set of named corrections
and not as exclusions, and states what the corrected run still does not support: a proposed
bar that is missed stays missed, and a "no worse than before" claim that is false by a
hundredth of a millisecond is not written. `keep-the-failed-baseline`.

## Synthetic touch is the software path

An injected touch, key or socket message verifies that the software handles that event. It
says nothing about reach, thumb collision, the real stack's gesture cancellations, a phone's
timing or the lifecycle around it. A harness that sends synthetic input labels the result as
such, in the verdict field, with the tool and the device, and renders every claim about
feel and comfort as unmeasured until a person has held a real phone. The emulation also has
its own semantics, and misreading them produces false findings: ending a touch by listing
the remaining contacts, not the released one, reports a stuck button that is not there.
`emulated-touch-is-not-physical-touch`.

## Boundary

The sibling on runtime observation owns the ladder of evidence for any behavioural claim, the
tiers of truth, and the rule that an observation which could not be made is not a failure; this
subject borrows both and does not restate them, and owns the device-specific ways a harness
produces an observation that was never what it appears to be. When the question is which rung
a claim needs, read that sibling; when the claim needs a rung and the device keeps
returning a different one, read here. The unattended build loop owns what a loop may conclude,
spend and skip, how its pass rate is composed, and how it recovers; this subject owns the
measurements that feed it and the rule that its output, a failed run, is preserved rather than
rerun into green. The allocation discipline of the hot path owns which per-step allocations
produce frame cost and how to remove them; this subject owns the question of whether a
stall seen in a soak belongs to the game or to the probe, which must be answered first, and
it never says how to remove a game's allocation. The device-realities sibling owns the
conditions of the stick that make a launch fail silently, the asleep display, the narrow
userland, the bind failure, and the checks that make them visible; this subject owns the
harness that runs those checks, and the habits that stop it lying about its own timing, state
and memory. When the loop reports a black screen or a refused connection, read the sibling
first; when the loop reports a number, read here.

## What a principal practitioner holds

A number from a device carries its device, its start state, its probe and its window
population, or it is not information. A harness reports the fraction of the work it verified
separately from the fraction it asserted. The harness is itself a build under test: it is
checked against a known-good and a known-bad run before it is trusted, and its own cost is
measured. A device is one device: one model, one reported memory, one heat history; what
generalises to a sibling model is named as an assumption. A claim is written at the size of
the evidence: scripted and simulated results are not felt ones, and the sentence says which.

## What the naive reading gets wrong

- **Sleeping for a conservative interval after launch.** Conservative on one day is
  optimistic on another, and the failure reads as a game bug.
- **Trusting the requested rate.** The delivered rate is a measurement; the request is a
  hope.
- **Letting the last session's state be the starting point.** The shelf device accuses the
  latest change.
- **Using the platform's default memory report in a timed soak.** It may be the thing
  forcing the collection.
- **One latency figure for the whole session.** It describes neither play nor loading.
- **Overwriting the failed run.** The explanation goes with it.
- **Reading a clean emulated pass as a felt one.** The label is cheap; the claim without it
  is an overstatement.
- **Treating a ready signal as a verdict.** It lets the next step begin; it proves nothing
  about behaviour, and the game wrote it.
