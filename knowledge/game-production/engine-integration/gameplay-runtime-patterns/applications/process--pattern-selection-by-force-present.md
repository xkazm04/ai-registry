---
layer: application
type: application
subject: gameplay-runtime-patterns
technique: pattern-selection-by-force-present
stack: process
status: forged
verified_on: 2026-09-02
---

# A force inventory in the generation briefing, and a justification list in the review

This is the prompt-pipeline realization of `pattern-selection-by-force-present`: where the
force inventory sits in a machine-authoring pipeline, what it looks like as text, and what
the acceptance step does with what comes back. It is written for a pipeline that composes
generation prompts from named sections and grades the returned artifact before it lands.

## Where the inventory sits

A composed generation prompt in a production pipeline typically has a fixed section order —
project context, domain context, task instructions, engine-specific practice, output schema,
success criteria. The force inventory is *not* a new section. It belongs inside the task
instructions, immediately after the design intent, because it is a statement about the work
being commissioned rather than a standing rule about the engine.

The distinction matters practically. Standing rules are shared across every task of a kind
and are cheap to inject; the inventory is per-task and has to be filled in by whatever
constructed the task. Putting it in the standing-practice section produces a generic
paragraph about not over-engineering, which is advice, and advice does not change output.
Putting it in the task produces seven answered questions about *this* behaviour, which is a
constraint.

## The text

Seven lines, answered — never asked. A question the pipeline leaves for the author to answer
will be answered optimistically.

```
## Runtime forces for this behaviour
Population:  up to 40 enemies simultaneously; bounded by the spawner's cap.
Cadence:     runs on a damage occurrence, not every step.
Span:        instantaneous; no state is carried between steps.
Audience:    two known consumers, both in this module.
Deferral:    none; the consequence applies at the point of the trigger.
Variance:    kinds differ in numbers only (threshold, radius, multiplier).
Adjacency:   each hit considers participants within a radius; population < 100.

Expected shape: one method on the existing actor class, plus a row per kind
in the existing definition table. No new subsystem, no new notification
mechanism, no acceleration structure. If you believe a force above is wrong,
say so in your response rather than designing around it.
```

Three properties of that block do the work. It answers rather than asks. It states the
expected shape as a *size*, so the author has a target rather than a ceiling. And it invites
contradiction explicitly, which is what keeps a wrong inventory from silently producing a
wrong artifact — an author that disagrees is a signal, and an author with no channel to
disagree will simply build what it thinks is right and not mention it.

## What comes back, and what is graded

The artifact returns with a short justification list — one line per structural element, each
naming the force from the inventory that required it:

```
- damage application: direct method call — Audience: two known consumers
- kind table row: type object — Variance: numbers only
```

The acceptance step runs two checks over that list, and neither is a test of the code.

**Unjustified structure.** Every structural element present in the output appears in the
list with a force that appears in the inventory. An element citing a force the inventory
does not contain, or citing none, is rejected. Rejection here is cheap — the author is still
in the loop and the artifact has not been adopted — which is the entire reason the check
lives at generation time rather than in code review.

**Unanswered force.** Every non-trivial force in the inventory has an element answering it.
This is the direction teams drop, and it is the one that costs correctness: a `Span` of
several steps with nothing in the list carrying state means the behaviour was implemented as
loose flags, which will be wrong intermittently rather than obviously.

A third check is worth running and is easy to forget: the justification list must be
*shorter* than the inventory in the common case. A list with an entry for every force plus
three more is a list that was written to satisfy the check rather than to describe the code.

## What this does not catch, and the honest boundary

The justification list is self-reported. It is a claim by the producer about its own output
and it must be recorded as one — it does not establish that the element is present, correct,
or wired, and it can be written confidently around code that does something else. Its value
is narrow and real: it makes an unjustified element embarrassing to write, and it gives a
reviewer a one-screen surface instead of a diff.

The verification that the shape was actually adopted comes from reading the artifact, and
the verification that it behaves comes from running it. Those are separate rungs owned by
separate parts of the pipeline. Treating the justification list as evidence of anything but
intent is the way this technique gets discredited: it is a briefing device with a review
surface attached, not a gate.

## Cost, and when to skip the block

The inventory costs perhaps a hundred and fifty tokens per task and one construction step in
whatever assembles the task. That is negligible against the briefing budget, and it is
concentrated on the decision that is most expensive to reverse. Skip it for tasks whose
shape is fully determined by a schema on the other side — where the artifact's form is
dictated by what the runtime will load, there are no forces to weigh and the block only adds
noise. Skip it also for edits to an existing file whose shape is already fixed, where the
correct constraint is to match what is there rather than to re-derive.
