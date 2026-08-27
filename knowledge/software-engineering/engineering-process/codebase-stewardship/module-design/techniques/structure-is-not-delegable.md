---
layer: technique
type: technique
subject: module-design
technique: structure-is-not-delegable
status: forged
laws: [derivation-names-recomputation, one-validation-door]
shared_with: []
use_when: [deciding how much of a structural pass an agent may run, granting standing approval over an automated flow, arguing about which decisions should move onto the agent as capability rises]
---

# Structure is not delegable

The claim, stated precisely so it can be argued with: **an agent can find
structural candidates and can execute a shaped structural change; it cannot
choose which candidates are worth having.**

Note what the claim is not. It is not "agents produce bad structural code" —
they frequently produce excellent structural code. It is not a claim about
volume, size or risk. It is a claim about one specific act, in the middle of a
flow whose other two thirds delegate perfectly well.

## Why the middle step is different

Finding is pattern recognition over evidence that is **entirely present in the
tree**. Change scatter, duplicated knowledge, an options surface growing per
caller, a bypassed adapter, a dependency pointing the wrong way — all of it is
readable, at scale, faster and more consistently than any human will read it.
This is genuinely good delegation and it should be taken.

Choosing requires a fact that is **not in the tree**: where the product is
going. Which of two couplings will matter is a function of what will be built
next quarter, which parts the organisation intends to keep optional, who will
maintain what, and which commitments are already made to people outside the
codebase. None of that is recoverable from the code — and a process that reasons
only over the code will confidently optimise for the past, because the past is
the only thing the code is a record of.

The asymmetry is not about intelligence. A principal engineer with no knowledge
of the roadmap makes the same error, for the same reason, and their proposals
are equally well-argued and equally likely to remove the seam that next
quarter's work needed.

## The division of labour

Stated as a rule, in three parts:

1. **The agent proposes candidates with evidence** — grounded at both ends, with
   the relation quoted, per
   [structural-improvement-loop](./structural-improvement-loop.md). Volume here
   is a benefit; recall matters more than precision, because the next step
   filters.
2. **The human selects and states the target shape** — which candidates are
   worth having, what the boundary should become, and what the trade costs.
   This is the smallest step in the flow and the most valuable, and it is the
   only one that consumes information from outside the repository.
3. **The agent executes the shaped change** — mechanically, at whatever scale,
   against the pinned invariant and the stop condition the spec names.

All three are real work. The temptation is to measure the flow by its output
volume, which makes step 2 look like a bottleneck to be optimised away. It is
not a bottleneck; it is the input.

It is, however, the **throughput ceiling**, and saying so plainly is better than
pretending otherwise. Steps 1 and 3 scale with whatever compute is available;
step 2 scales with one person's attention, and attention spent on structural
selection is expensive and does not stay sharp for long. The practical
consequence is that the flow is sized to step 2 — a batch is as large as can be
selected and shaped carefully in one sitting, and running steps 1 and 3 at their
own natural rate simply builds a queue in front of the step that cannot absorb
it. Discovering the batch size empirically, and writing it down, is worth more
than any speedup applied to the other two.

## Why a blanket approval grant deletes this flow

For most automated flows, a standing grant of approval trades a little risk for
a lot of speed, and it is a reasonable trade — the human step was a *check
around* the work, and removing the check accelerates the work.

Here, the human step is not a check around the work. It is the step that
**supplies the missing input**. Granting a blanket auto-approval over this flow
does not speed it up; it removes the only stage where information from outside
the codebase enters, and leaves the scaffolding running. The tell is specific
and easy to miss: **the flow keeps producing output and stops producing
decisions.** Candidates are found, changes are made, the pipeline stays green,
and the structure now optimises for whatever the code already looked like.

The rule that generalises: **when a flow's human step supplies information that
exists nowhere else in the system, that step may not be covered by a standing
grant** — not because it is dangerous, but because removing it removes the
flow's only input. Approval gates that exist for safety can be traded against
speed; a gate that exists as an information channel cannot, and treating the
two as one category is how the second gets removed by a policy written for the
first.

And the fix is structural rather than disciplinary
([one-validation-door](../../../../_laws.md#one-validation-door)): a structural
change reaches the tree through one door that the selection step is part of. A
second lane — an unattended pass, a convenience path, a different flow that
happens to be able to restructure — is a lane where the missing input is
missing, and no amount of remembering closes it.

**The grant is rarely made as a decision.** It usually arrives as
infrastructure: somebody puts the periodic pass on a schedule, and an unattended
run has no human turn by construction, so the selection step is deleted by a
convenience nobody classified as a policy change. That is why the door has to
be built while the flow is still manual — at that point it costs nothing and
looks redundant, which is exactly when it is cheap. Retrofitting it after the
schedule exists means arguing to slow down something that currently works, and
that argument is lost on the numbers every time. The general design of such
gates, their granularity and their audit trail, belongs to
[hitl-approval](../../../../llm-agent/orchestration/hitl-approval/hitl-approval.md);
what this technique contributes is *which* step must be behind one, and why the
usual speed argument does not apply to it.

## The boundary against capability-driven migration

There is a well-argued position that as model capability rises, decisions should
migrate from orchestration onto the agent, and that pipelines routinely keep
scaffolding compensating for limitations that have since lifted. That position
is correct, it is developed in
[orchestration-to-tool-migration](../../../../llm-agent/runtime-and-io/mcp-tools/techniques/orchestration-to-tool-migration.md),
and this technique does not contradict it.

The two partition cleanly, on one property: **whether the decision's outcome is
scoreable inside the run.** That technique governs decisions with an outcome
measurable within the pipeline — did this produce better output, at what cost,
with what variance — which is exactly what makes its method work: hold the model
roster fixed, move one stage, measure the axes, and accept the reverse migration
as a real result. The migration is a hypothesis that a harness settles.

This technique governs a decision whose outcome is measurable only **over
months**, in a signal with a long lag and no threshold: was this the right
structure. There is no harness that scores it, so there is no experiment to run,
so the migration argument's method has no measurement to take. **A decision the
harness cannot score is one the migration argument does not reach.**

Read together, the two are a single instruction rather than a tension: migrate
the finding and the executing — they are scoreable, and the case for moving them
onto the agent is the migration argument's own, made well. Do not migrate the
selection, because the thing that would tell you whether the migration worked
arrives two quarters after the decision, by which time the structure is the
independent variable in everything else that happened.

## The honest limit, and what would falsify it

This claim is a derived value, and like every derived value it names its
recomputation
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
Two parts:

**What would have to change.** The missing input is product direction. The claim
therefore weakens exactly to the degree that direction becomes *legible to the
system*: a written, current, specific statement of where the product is going
and which options are being kept open, against which a candidate can be argued.
It does not weaken because models get better at reading code — reading the code
better cannot recover a fact the code does not contain. It weakens when an
organisation writes down what the code is for and keeps that true, which is
harder than it sounds and is the actual prerequisite.

**The test that would settle it.** Have the flow select candidates without the
human, record the selections **before** the outcomes are known, and let a
principal record theirs independently. Over a stated number of passes on a
stated codebase, if the two selections agree at a rate the organisation is
willing to act on, the claim is falsified *for that codebase* and the selection
step should move. Until somebody runs that, the division of labour holds. Note
the two conditions that make it a test rather than a demonstration: selections
recorded in advance, and a fixed comparison population — a retrospective "the
agent would have picked this too" is a story about hindsight.

Finally, the claim is about a **class of decision, not a model generation**.
"The newer model is more capable" is not evidence for or against it, because
capability is not the binding constraint — the absence of the input is. That
distinction is what keeps this technique from becoming the kind of stale
scaffolding the migration argument exists to remove.

## When not to apply it

**Do not use this to gate work that is merely large.** Executing an agreed
structural change is delegable however big it is, and treating size as the
trigger produces teams hand-writing mechanical transformations for weeks, which
is the failure this technique will be blamed for if it is stated carelessly. The
undelegable act is small and specific: choosing among grounded candidates and
stating the target shape.

**It also does not apply where structure is genuinely scoreable inside a run.**
Where a structure is regenerated wholesale from a source of truth on every run —
generated artefacts, a rendering of a schema, anything whose shape is a pure
function of a generator — the structure's quality is measurable within the
pipeline, and the migration argument governs it. The distinguishing question is
not "is this code" but "does a harness observe the consequence of this
decision before anyone has to live with it."

Where the answer is yes, the decision is not merely outside this technique — it
has a method of its own, and it is not discussion:
[scoreable-designs-are-built-not-argued](./scoreable-designs-are-built-not-argued.md)
owns building the candidates and measuring them, along with the part of the
judgment that stays human even there.
