---
layer: technique
type: technique
subject: agent-instruction-files
technique: listing-tier-by-initiator
status: forged
laws: [deletion-is-not-repair, count-carries-predicate]
shared_with: []
use_when: [an installed capability is paid for on every session but is only ever started deliberately by a person, deciding between keeping and removing a capability that rarely fires, a harness offers a listing state between fully listed and hidden, the session floor is dominated by capability descriptions rather than the instruction file, a capability is started by typing its name or by another capability naming it]
---

# Listing tier by initiator

[sibling-floor-ownership](./sibling-floor-ownership.md) prices the installed
half of the floor and closes on two decisions, install and keep, with a
held-out trial standing between an unused entry and its removal. That framing
treats listing and installation as one fact. On a harness with progressive
disclosure they are two, and the gap between them is where most of the cost
can be recovered **without a trial**, because nothing becomes unreachable.

## Three tiers, not two

A capability's presence in the discovery listing has at least three useful
states, and current harnesses expose them as a per-entry setting:

- **Listed** - name and description in every session. The model can select
  the capability because the task *resembles* its description.
- **Name only** - the name is listed and the description is not. The model
  can still select it when something *names* it: the person's prose, another
  capability's instructions, a program's prompt. It will not select it on
  resemblance.
- **Hidden** - absent from the model's listing; a person can still start it
  explicitly, the model cannot.

The description is the cost, and it is almost all of the cost: an entry's
name is a few tokens, its description is up to the harness's per-entry cap.
So the middle tier removes the price and keeps every path that begins with
the name. Removal ([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair))
and the hidden tier both sever paths; the middle tier severs exactly one -
selection by resemblance.

## The tier is set by who starts the capability

The right tier is not a quality judgement and not a frequency count. It is a
fact about the capability's **initiator**, and the recorded history answers it:

| Who starts it | Evidence in the transcripts | Tier |
| --- | --- | --- |
| The model, on resemblance, unprompted | an invocation whose triggering text does not contain the name | listed |
| A person or a program, by name | an explicit start command, or prose, a chain or a prompt that names it | name only |
| A person only, and a model start would be a hazard | side effects nobody should trigger by inference (deploy, push, spend) | hidden |

Most of a curated catalog is the second row. Workflow capabilities - the ones
that open a session with a goal, run a loop, orchestrate a review - are
started by a person who already knows the name. Their descriptions are written
to help a *model* choose them, and that reader never needed them.

**Count by initiator, not by frequency.** A replay that counts invocations
([count-carries-predicate](../../../../_laws.md#count-carries-predicate))
reports "used" and "unused", and both mislead. An unused entry may be the
ambient guard that must fire on resemblance the day its trigger appears. A
heavily used entry may be started by name every time and never needs its
description at all. The predicate that decides the tier is "was this ever
selected without being named?", and a count that does not carry that
predicate cannot set it.

## The falsifier to run before choosing the hidden tier

The hidden tier looks like the obvious setting for "only I start this", and
the history usually refutes it. Deliberate starts are not all explicit
commands: a person writes "run the review skill" in a sentence, pastes a
brief with the start command in the middle of it, or asks a colleague's
program to drive the capability; one capability dispatches another by name;
an embedding product prompts the model to perform the workflow. Every one of
those is a model-side selection *by name*. The hidden tier breaks all of
them, and the middle tier breaks none. So replay the model-side invocations
of each candidate and read the text that preceded them. Only a capability
whose model-side starts are empty, or are hazards, belongs in the hidden tier.

## Where the tier lives

The tier is a property of the capability, not of the consumer: an ambient
guard is ambient in every repository that links it, and an orchestrator is
started by name everywhere. So declare it once, beside the capability's own
definition, default the undeclared case to **name only**, and let the
installer write the consumer's local setting from the declaration. The
default carries the argument: an entry that must fire on resemblance is the
exception, it is the one that has to prove it, and it declares itself.

Two cautions:

- **Write the tier where the consumer's machine state lives, never into a
  shared tracked file.** A tier is derived from a declaration, exactly like a
  link to a shared capability. Written into a tracked settings file, it becomes
  a diff in every consumer on every change.
- **The harness's own and platform-supplied entries are part of the same
  floor**, and they need the same sort, entry by entry. Several are ambient by
  design (document-format handlers, API references that must fire when the
  code touches the API) and must stay listed; others are started only by name.
  A blanket setting over them repeats the mistake the tiers exist to avoid.

## What it does not replace

The middle tier recovers the cost of entries that are *kept*. It says nothing
about whether an entry should be kept at all. That remains
[sibling-floor-ownership](./sibling-floor-ownership.md)'s audit and its
held-out trial. Run the tiers first: they are reversible, they need no trial,
and they shrink the floor that the trial then has to reason about.
