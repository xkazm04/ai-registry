---
layer: technique
type: technique
subject: pipeline-authoring
technique: human-checkpoints-in-a-pipeline
status: forged
stage: team
laws: [creation-names-reaper, identity-survives-reuse]
shared_with: []
use_when: [a deploy needs approval, a migration needs acknowledgement, an approval currently happens in a chat channel]
---

# Human checkpoints in a pipeline

A decision a person has to make is a node in the plan: the run reaches it, waits there, and
records who released it. Not a message in a channel with a button somewhere else — a step,
with the same identity, ordering and history as every other step.

## Why the node, and not the message

Moving the decision out of the plan loses three things simultaneously, and teams usually
notice only the third:

- **The record separates from the run.** Six months later, "who approved this deployment" is
  answered from a chat archive, if at all, and cannot be joined to the run it approved.
- **The pipeline cannot enforce it.** If the approval is external, the deploy step's
  precondition is a social convention. Conventions are not preconditions.
- **The approver reads a different surface from the one that acts.** They approve a summary
  written by a person; the pipeline executes a plan computed by a program. The gap between
  those two is where the wrong thing gets deployed with a genuine approval attached.

## The forms

Three shapes, chosen by what the human is actually contributing:

- **Acknowledge.** The run pauses; a person releases it. The contribution is attention and
  accountability, nothing more. Use for a routine deployment to a shared environment.
- **Decide.** The person picks between named branches of the plan — proceed, roll back,
  proceed with a reduced scope. The options are enumerated in the plan; free text is not an
  option, it is a comment.
- **Supply.** The person provides values the plan needs and could not compute — a release
  note, a target version, a maintenance window. Validate these where they enter, per the
  one-door discipline; a value supplied at a checkpoint is untrusted input like any other.

## What the checkpoint must state

The checkpoint says what proceeding will do, in the terms of the thing being changed, not in
the terms of the pipeline. "Deploy step will run" is not a statement; "this will replace the
version currently serving the shared environment with the build from this change" is.
Confirmation is proportional to blast radius — the ladder is owned by the monitoring subject's
remote-action-consent, and this technique adopts it unchanged.

Three details make the difference between a checkpoint people read and one people click
through:

- **Name the environment and the artifact.** Both, explicitly, in the prompt itself.
- **Show what is being replaced.** A deployment is a diff between two states, and the state
  being lost is the half people forget to display.
- **Make the irreversible visible.** If proceeding cannot be undone by re-running an earlier
  step, the checkpoint says so in those words.

## Waiting is a state, not an occupation

A run parked at a checkpoint must hold no execution capacity. A paused run that pins a
machine for a day is a capacity outage disguised as a workflow, and it is the reason teams
abandon checkpoints and go back to the chat channel. The paused run holds a record and a
position in the graph; it holds nothing scarce.

## Every checkpoint names what happens if nobody answers

Per [creation-names-reaper](../../../../_laws.md#creation-names-reaper), the checkpoint
declares its own end at the moment it is created:

- **A timeout, always.** No checkpoint waits indefinitely; an indefinite wait is a queue of
  abandoned runs that eventually gets bulk-cancelled by somebody who does not know what is in
  it.
- **A default that is safe on expiry.** Expiry cancels the run. Expiry never proceeds.
  "Approved because nobody objected" is not approval, and the moment a pipeline adopts it,
  every checkpoint in the system becomes advisory.
- **A named owner.** Who is expected to answer, so an unanswered checkpoint is a fact about a
  person's queue rather than an anonymous stall.

## Identity of the approver

The record carries who released the checkpoint, and it carries a durable identifier for them
rather than a display name, per
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse). Display names change;
an audit that resolves to a name nobody recognizes has recorded nothing. Where the approval
carries real consequence, the person releasing the checkpoint must not be the person who
authored the change — and that rule belongs in the plan, where it can be enforced, not in a
policy document.

## Anti-patterns

- **The checkpoint that always says yes.** If no one has ever declined it, it is not a
  decision point, it is a delay. Remove it or give it real criteria.
- **The checkpoint after the irreversible step.** Common and always accidental: the plan does
  the migration, then asks. Ordering is the entire value.
- **The checkpoint that fans out to everybody.** An approval addressed to a group is an
  approval addressed to nobody. Name the owner.
- **The checkpoint as a substitute for a check.** If a machine can decide it, a machine should.
  A human checkpoint guarding something automatable trains people to click through, and that
  habit does not stay local to the checkpoint that taught it.

## Decision rules

- The decision is a node in the plan; the record lives with the run.
- Choose acknowledge, decide, or supply by what the person actually contributes; enumerate the
  options.
- State the effect in the terms of the thing changed, name the environment and the artifact,
  and say when it is irreversible.
- A waiting run holds no execution capacity.
- Every checkpoint has a timeout, and expiry cancels — never proceeds.
- Record a durable identifier for the approver; separate approver from author where it counts.
- A checkpoint nobody has ever declined is a delay; a checkpoint a machine could decide is a
  bad habit being taught.
