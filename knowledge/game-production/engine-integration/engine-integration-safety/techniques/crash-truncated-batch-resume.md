---
layer: technique
type: technique
subject: engine-integration-safety
technique: crash-truncated-batch-resume
status: forged
laws: [unmeasured-is-not-a-pass, an-instrument-proves-it-had-input, refuse-rather-than-destroy]
shared_with: []
use_when: [a batch of checks shares one launch of a heavyweight application and that launch can die partway, the items behind a crash stay unresolved on every run, designing the relaunch and resume policy of an automated session, deciding what a single crash is allowed to change]
---

# Crash-truncated batch resume

The concern: what a harness does when the one launch that carried a whole batch dies
partway. Grouping many items into one launch is the right economics for a heavyweight
callee, and it changes the blast radius of a failure: a crash at item K of N takes N-K+1
items with it. A harness that only knows how to judge a launch that finished has nothing
to say about them, and the nothing it says is usually wrong.

## Three populations, not one

After a cut, the batch's items fall into three groups that need three different treatments:

- **Completed before the cut.** They carry a result of their own. Those results stand; a
  crash later in the launch does not retroactively void an observation already made.
- **The culprit.** The item that was running when the launch died. It has no result and a
  real chance of being the cause.
- **The unreached.** Items that never started. They have no result and no connection to the
  cause. They exist, they are valid, and nothing has been learned about them.

The failure this technique exists to name is the harness that reads the second and third
groups as one thing, and reads that thing as **absent**. A missing result and a missing
registration look identical in a log, and a harness built around the second (a planned
item nobody has written yet, an honest wait) will file the first under it. The unreached
items then read "planned, not registered" while they exist; the tool offers to author a
duplicate; and because the next run re-runs the same batch with the culprit still near the
front, they are starved again, once per run, indefinitely.

The signal that separates the two cases is **not** the one the single-run rule uses. A
callee that enumerated its available work and then matched nothing has run to its own end
and found no such item. A callee that enumerated and then crashed also enumerated: the
enumeration is the first thing a run does, so it is present in both logs. What separates
them is the cut — a fatal marker in the log, or the watchdog firing — and never the exit
status, which is wrong in both directions for this class of callee.

## Procedure

**1. Read the cut from the evidence the run left, and name its class.** A fatal marker (or
the crash artifact the runtime writes) is a crash. The watchdog firing with no fatal marker
is a hang. A launch that simply ended with neither, and no end sentinel, was ended from
outside; say so, and do not call it a crash — the founding incident of this subject is a
run recorded as its own failure when another tool killed it. A fatal marker outranks the
watchdog: a crash that also stalled is a crash.

**2. Classify only launches the harness started, while work was in flight.** A person
closing the application, or the application's own orderly teardown, is not a crash. A
fault logged after every item completed, with the callee's structured report present, is a
teardown fault: the report's existence is the end sentinel and it outranks the log.

**3. Split the unobserved items into culprit and unreached.** The culprit is the requested
item the log shows running at the cut: scan back from the cut for the nearest line that
names exactly one requested item, and require that item to have no result of its own (a
completed item names itself nearest the cut when the cut fell *between* items). A line
that names several items is an echo or an enumeration, not a start marker. If the log
cannot name the culprit, leave it unidentified. That is safe: nothing is excluded, and step
6 bounds the cost.

**4. Give the unobserved items a reason that says what happened.** The status can match a
missing registration — neither pass nor fail, an honest not-measured — because nothing was
measured. The reason and the destination cannot. A missing registration waits for a person
to write the item; an unreached item is re-run by the harness. Carry the cause (crash or
hang), say "not reached", and attach nothing that suggests authoring.

**5. Resume the unreached in a fresh launch, without the culprit.** Leaving the culprit out
is the whole point. Re-run it first and the next launch dies at the same place, and the
items behind it starve exactly as before.

**6. Make every resume earn its launch.** A resume must produce a new verdict or identify a
new culprit; a launch that makes neither stops the loop, and the total number of resumes
is capped. This is the crash-loop breaker. Without it, a launch that dies at boot — before
any item starts — spends the whole budget on identical deaths. Confirm the relaunched
application is actually up before the batch is sent to it.

**7. Restore what the interrupted launch had.** Run the resume in the same mode (headless
or full) and under the same isolation (a lease, an overlay, a sandboxed write area). A
resume in a different mode is a different experiment, and one that drops the isolation
changes what the items can touch.

**7a. Assume the interrupted launch's teardown never ran.** Whatever the culprit created, a
file, a world, a registered object, is still there, and it was left there by the one item
that was never allowed to clean up. A resume starts from that assumption: setup removes
before it creates. A framework's own design guidance for its tests says the same from the
other end ("assume the test was left in a bad state the last time it ran"), and a crash is
the case where that stops being a habit and becomes a measured fact. This also bounds what a
resume may trust: a result from a resumed item that depends on state the culprit may have
left is weaker than one from a clean launch, and says so.

**8. A single crash is an observation, not a diagnosis.** Leave the culprit with a suspect
verdict and its evidence line. Do not quarantine it, open a ticket, edit code or run an
expensive rebuild on one occurrence; act when the same item dies again in a launch of its
own, and then with a repeat count. The cheap repair (an incremental build when the evidence
points at stale binaries) is for a repeat; the expensive one is for nobody on a first sighting.

## Decision rules

- Unobserved after a cut: **interrupted**, never planned. Unobserved with no cut after an
  enumeration: planned.
- A clean batch costs exactly one launch. If the resume machinery changes the launch count of
  a run that did not crash, it is broken; assert it.
- An unreadable log is no evidence the cut happened. Stay deferred and do not resume.
- When the only evidence of a cut is a fault marker and the callee's report is missing, the
  log alone cannot tell a crash from a teardown fault. Treat it as a cut: the cost of
  being wrong is one bounded resume that ends with the right label.
- State the number of launches a result cost, and why, in the result. A pass that took
  three launches is a different statement from one that took one.

## When not to use

**A batch of one**, or a callee that isolates each item in its own process: the cut takes one
item and there is nothing to resume. **A callee that supervises itself** and reports through
an interface with its own recovery. **A session with a person at the controls**, where the
decision to relaunch belongs to them (see the refusal rules in this subject).

## Failure modes

- **Resuming the culprit first.** Starves the rest on every pass.
- **A resume with no progress guard.** A launch that dies at boot spends the whole budget.
- **Reading the unreached as unregistered.** Invites duplicate authoring of existing items.
- **Counting the operator's own close as a crash.** Triggers recovery over a session a person
  is using; the recovery then does what the refusal rules forbid.
- **Acting on the first sighting.** A crash that does not repeat was weather.
- **A debugger attached.** It intercepts the fault: the crash artifact is never written and
  the process may stall rather than exit. It will read as a hang, and a classifier that
  waits for the artifact waits forever. The watchdog is the only signal left.
