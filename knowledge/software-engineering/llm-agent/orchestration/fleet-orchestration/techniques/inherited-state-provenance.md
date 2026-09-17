---
layer: technique
type: technique
subject: fleet-orchestration
technique: inherited-state-provenance
status: forged
laws: [silent-state-is-ungoverned, count-carries-predicate, unknown-is-not-a-value]
shared_with: []
use_when: [a retried or resumed worker is placed back into the artifacts its own previous attempt left, a dispatcher hands a worker a directory, branch or store it did not create, the orchestrator records a dispatch fact in its event log and nowhere the worker can read, a worker reset, reverted or redid work that had already been done for it, deciding what a brief owes about state the worker inherits structurally rather than in text, several workers in one wave append to the same accumulating artifact]
applied: code
ab_verdict: better
---

# Inherited-state provenance

A dispatched worker starts fresh, so everything the dispatcher learned in session
has to be restated in the brief
([brief-carries-the-session](./brief-carries-the-session.md)). That rule models
one direction of loss: the dispatcher knows something and the worker does not.

The opposite case is commoner in a fleet that has been running for a while, and
it is unmodelled. Some state reaches the worker **without passing through the
brief at all** — because delegation itself creates durable artifacts, and a
retried, resumed or fanned-out worker is deliberately placed inside them:

- the working directory and branch a **previous attempt at the same work** was
  given, carrying its commits and its uncommitted files;
- a store, queue or ledger that earlier attempts already half-drained or
  appended to;
- a shared input computed once upstream so the fan-out would not each rebuild
  it, handed to every member of the wave;
- an output a predecessor step wrote, which this worker's task is to extend
  rather than to author;
- the accumulating notes file a wave writes into, whose earlier rows were
  written by a session that is gone.

The worker sees the artifact. It does not see where the artifact came from. And
its default reading is the wrong one, because the fresh worker is the modal case
the model has been trained and prompted to expect: **the tree is as the
repository left it, the store is as the system left it.** Work that was in fact
its own predecessor's reads as stray, foreign or stale.

## Not a resumed session

The neighbouring case is a parked session woken under its own identity, which
restores a resume contract and is [hibernation-and-resume](./hibernation-and-resume.md)'s
business. This is the other one, and the difference is what makes it easy to
miss: **the session did not survive — only the artifact did.** A new process,
with a new brief and no history, is handed the leftovers of a session that is
gone. There is no resume contract to restore, so nothing in the runtime will
tell the worker what it is looking at; the only channel left is the brief the
dispatcher writes.

## Three misreadings, all reasonable

- **Stray.** Uncommitted files and unfamiliar commits on the branch look like
  somebody else's mess or a dirty checkout, and cleaning before starting is
  good hygiene. The worker resets, cleans or re-forks from the base — and the
  earlier attempt's work is gone, silently, with the retry's own budget spent
  reproducing it.
- **Finished.** A half-populated output reads as a completed one. The worker
  skips the step, reports done, and the gap ships.
- **Foreign.** The worker neither trusts nor deletes the artifact: it builds its
  own beside it. Two partial answers now exist, and whichever one the harvest
  reads is arbitrary ([result-harvest](./result-harvest.md)).

Nothing in the brief distinguishes these, so the choice is made by temperament.
That is the signature of state nobody surfaced
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)):
the dispatcher's decision to hand over the artifact is real, consequential, and
invisible to the only party that has to act on it.

## The rule

> **Every artifact a dispatch hands a worker is named in the worker's own
> channel with three facts: where it came from, how much of it there is, and
> what the worker may do with it.**

Provenance, count, mandate. Each of the three prevents a different misreading,
and the brief is the only place they can land, because the worker reads no log.

- **Where it came from.** "This is the working directory your previous attempt at
  this same step was given"; "this input was resolved once upstream for every
  member of this wave"; "the predecessor step wrote this". One clause, and it
  converts a foreign object into the worker's own history.
- **How much of it there is,** counted, with the predicate
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
  *two commits ahead of the base branch and three uncommitted paths*, not
  "some earlier work". The count is what tells the worker whether to read
  before writing, and a count with no predicate ("2 items") is a number it
  cannot act on.
- **What it may do with it.** Continue, read-only, or replace. The dispatcher
  knows which; the worker cannot infer it from the bytes. Without the mandate
  the two safe-looking options — start over, or leave it alone — are both
  destructive in the case that matters.

## The orchestrator's log is not the worker's channel

The defect almost never looks like missing information. It looks like
information filed in the wrong place. In the instance measured here the
dispatcher had already **computed** the fact, at dispatch time, and written it
somewhere: an event row, an audit line, a structured log field. The worker's
input and brief did not get it.

So the finding is a diff, and it is cheap to take: list what the dispatch path
computes about the handover, list what the worker's brief says, and look at the
difference. A flag that decides which branch of the dispatcher's own code runs —
*re-attach the previous attempt's directory, or prepare a fresh one* — is
precisely a fact the worker's reading of the tree depends on.

**The asymmetry tell.** A dispatch path that has this defect usually carries one
such fact into the brief already, for the case somebody was burned by: a note
saying the branch the brief names is not the branch the worker got, a warning
that a dependency was borrowed rather than installed. Where one handover fact is
in the brief and a bigger one is only in the log, the bigger one was not judged
unnecessary — nobody chose at all. Check the siblings whenever you find one.

## Do not confuse this with carrying the contents

The sibling technique's pointer discipline holds here without change: the brief
names the artifact and its state, never its contents. Three lines of provenance
compress the worker's first several tool calls and stay true, because the worker
then reads the live artifact. Pasting the previous attempt's diff into the brief
buys nothing and ages immediately.

Two boundaries worth stating:

- **An artifact whose provenance cannot be stated should not be handed over.**
  If the dispatcher cannot say what produced the directory or how far it got,
  the worker cannot either, and it is starting from an unknown rendered as a
  definite state
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
  Prepare a fresh artifact, or spend the call that establishes the facts. A
  resumption whose commit count could not be read says so, rather than
  reporting zero.
- **The judgment role still inverts.** A reviewing seat gets the inventory —
  what changed, how much, where it came from — and not the producing seat's
  account of why its work is right. Provenance is factual; narrative is an
  anchor, and the sibling technique's review split governs which is which.

## What it cost where it was measured

On one orchestrator's retry path the resumption flag was computed, logged as a
dispatch event, and absent from both the worker's structured input and its
brief: a first attempt and a resumption produced byte-identical briefs. Adding
provenance, counts and mandate moved four resume assertions from zero passing to
four, left a first attempt's brief byte-identical to what it had always been, and
changed nothing else in a suite of some 3,700 tests. The change was about ninety
lines of product code across two files, a third of it comment: the rest is the two
counts, taken at the one moment anything knows a resumption is happening, and the
sentence that carries them into the brief.

The same path is the argument for the count: the re-attach case exists precisely
because retries were forking a competing branch and abandoning the earlier
attempt's commits. The machinery to keep that work was built and shipped; the
sentence that tells the worker the work is its own was not.

## Decision rules

- At every dispatch, enumerate what the worker inherits structurally — directory,
  branch, store, queue, predecessor output, shared input — and treat an empty
  enumeration as a claim to be checked, not a default.
- For each inherited artifact, put provenance, a counted state and a mandate in
  the worker's own channel. Structured input alone is not enough if the worker
  reads a brief; say it in both, from one composer, so they cannot drift.
- Diff what the dispatch path computes about the handover against what the brief
  says. Any fact that selects a branch in the dispatcher's code and is missing
  from the brief is the finding.
- Keep a first dispatch's brief unchanged. A resumption line that appears on
  every dispatch is noise, and noise in the primacy position costs the
  invariants their place.
- Where a handover fact already reaches the brief, check its siblings; the one
  that made it in is usually the one that caused an incident.
- When provenance is unavailable, prepare a fresh artifact rather than handing
  over an unexplained one.
