---
layer: application
type: application
subject: durable-agent-operations
technique: recovery-prefix-enumeration
stack: node
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# A crash-prefix suite reopened four of the job machine's eight states

The media-and-ads orchestration tree (gravitone, a TypeScript kernel over one
SQLite file, run on Node 24 per the `node-version` pin in its CI workflow, which is
the witness for `verified_against`) keeps every unit of work as a job record in a
closed eight-state machine: planned, queued, running, paused, failed,
interrupted, done, cancelled. Its recovery testing is already serious. A harness
records the effects a driver performs and kills the process after each prefix,
reopens the file, sweeps, retries and checks invariants, and the effect list is
read from a recording, so a step that gains a transaction gains its crash points.
This is the half of the technique that enumerates *effects*.

**What the seam asked.** Chosen to falsify: does an effect-prefix suite already
imply the state-leaf cases? If it did, deriving a case per state from the machine
would add nothing. It does not. The prefixes of one happy-path scenario can only
reopen the states that scenario passes through, and a count of the states the
suite closes and reopens gives queued, running, interrupted and done: **four of
eight**. A job that was planned, paused, failed or cancelled when the process
died was never reopened by any test, because no single scenario drives a job
through all of them.

**Arms.** A: the existing job suites (crash, kill, queue; 25 tests). B: one added
file that takes the machine's own state list, constructs each state's durable
record with the same transition helpers the kernel writes with, closes the store,
reopens it from disk, runs the restart sweep, offers the job to the driver, and
asserts the next transition the table allows; plus a coverage test that fails
when a state has neither a case nor a named owner. Target: states reopened,
**4 of 8 before, 8 of 8 after** (running stays owned by the prefix suite, done is
built by a completed drive). Floor: the whole kernel suite stays green, **528 of
528**, and the type check stays clean.

**What it found, and what it could not.** Recovery had no defect to find: all
eight cases passed first time after one fixture correction, so the finding is a
coverage fact and not a bug report. The instrument was checked the usual way,
by seeding a defect: a driver that also claims a failed job passed all 25 tests
in arm A and failed exactly one test, the failed-state case, in arm B.

**A boundary the construction exposed.** Building `interrupted` directly with the
record helper alone left the paid lane unheld, because the lane hold is a second
durable row written in the same transaction as the record. The first version of
the case failed on that, correctly: the durable state of an interrupted job is
the record plus its hold, and a fixture that builds only the enum value tests a
state production never produces. Construct a state the way its transition
commits it.

**What this application cannot do.** It does not enumerate the half-completed
recovery prefixes: the sweep is one transaction here, so the interesting
prefixes are the operator's retry and the driver's re-run, which the existing
suite already crashes. It also says nothing about write order; the tree has no
recording decorator over its store, and the technique's second tier is unbuilt.

Return condition: when a state is added to the job machine, the coverage test
names it before any reviewer does; when the sweep gains a second transaction,
add its prefixes beside the existing enumeration.
