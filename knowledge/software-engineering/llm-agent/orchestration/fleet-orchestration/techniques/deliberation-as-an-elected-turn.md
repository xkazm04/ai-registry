---
layer: technique
type: technique
subject: fleet-orchestration
technique: deliberation-as-an-elected-turn
status: forged
laws: [silent-state-is-ungoverned, absent-guard-is-loud, count-carries-predicate]
shared_with: []
use_when: [a dispatcher decides fan-out width and nothing records why, adding a thinking step to an agent that dispatches workers, a run's topology looks wrong afterwards and the reasoning left no artifact, deciding whether reflection is an instruction, a machinery step, or a tool]
---

# Deliberation as an elected turn

A dispatcher that is itself a model makes the fleet's most consequential
decisions — how to split the brief, how wide to fan out, whether the returns
are enough — and by default leaves **no artifact of any of them**. The
registry records what was dispatched, the harvest records what came back, and
the reasoning that connected the two is gone the moment the turn ends. It is
the one part of a run that is state without a record, and the rest of this
subject cannot govern what it cannot read
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)).

The boundary against the neighbour, stated first. [Grounding over
deliberation](../../agent-chaining/techniques/grounding-over-deliberation.md)
ranks the two moves and settles which to buy: a step that forces a claim
through something that can refuse it dominates a step that forms an opinion
about it, and N opinions do not sum to one execution. That ranking is not in
dispute here. This technique governs the residual that technique itself names
— *the lever available where nothing can be executed* — and a dispatcher
splitting a brief is squarely in it. There is no artifact to run, no state the
claim predicts, nothing to refuse it. The question is not whether to
deliberate instead of grounding; it is **where the deliberation sits, and
whether anyone can read it afterwards.**

## Three placements, and only one of them works

- **An instruction to think.** Cheapest to write, and it buys nothing
  durable: the thinking happens inside the turn that produced the dispatch,
  in whatever the provider does or does not expose, and it is not in the
  record the next turn reads.
- **A machinery step that always deliberates.** Durable, and wrong in a way
  that is hard to see later. It pays for a turn on every iteration including
  the ones with nothing to decide, and — worse — it manufactures deliberation
  the dispatcher did not want, which sits in the transcript looking exactly
  like deliberation it did want. The record survives and stops meaning
  anything.
- **A tool the dispatcher elects, which does nothing.** It takes the
  reasoning as its only argument, has no side effect, reserves no capacity,
  cannot fail, and returns an acknowledgement. Its entire value is that the
  next turn — and the harvest, and the triage, and a human — sees it.

Take the third. The properties that make it work are exactly the ones that
make it look pointless: no side effect means it can never be the reason a run
failed, and no capacity means admission never has to reason about it.

## The rule that makes it worth having

> **Deliberation may not be emitted in the same batch as the action it
> deliberates about.**

A model that emits reflection and dispatch together generated both from one
context. The reflection therefore describes a state that has not happened
yet: it is a prediction wearing the costume of an assessment, and it is
indistinguishable in the transcript from the real thing. Forbidding the
parallel emission is what converts the tool from a comment into a
**serialization point** — the observation lands, the turn ends, the next turn
reads it, and only then does the next action get chosen.

That one rule is also the whole cost of the technique. Everything else is
free; this is the part that spends a turn.

## Election is the signal, and it must not become the target

The dispatcher chooses when to deliberate, so the *rate* at which it chooses
carries information that a mandatory step destroys:

- A dispatcher that stops electing reflection as it approaches its cap is
  behaving differently from one that reflects and dispatches anyway, and the
  two failures need different fixes — the first is a budget read as pressure,
  the second is a brief that is not being followed.
- A dispatcher that elects reflection and then dispatches the same width it
  had already planned is deliberating decoratively; the content is present
  and load-bearing on nothing.

Report the rate with the population it was elected over
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)), and
never grade a run on the count. A reflection count that becomes a target stops
being an election and becomes the machinery step this technique rejected, with
extra steps.

## What it buys the layers above

[Worker trajectory anatomy](./worker-trajectory-anatomy.md) puts the decisive
error at a median step 7 and its observable signal ten steps later. A recorded
deliberation is the cheapest thing that moves the observation point earlier:
the dispatcher's own account of why this fan-out, written before the fan-out,
is available to triage without replaying anything. [Coordination failure
triage](./coordination-failure-triage.md) classifies a failed run against
three owners, and the specification class — the largest — is the one whose
evidence is precisely this: what the dispatcher believed the brief meant at
the moment it split it.

An absent record here is the ordinary shape of the optional guard: reasoning
that exists only where the provider happened to expose it protects the design
and not the deployment
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

## Decision rules

- Ask first whether the claim can be forced through something that refuses
  it. If it can, ground it; this technique does not apply.
- Where nothing can be executed, make deliberation an elected tool with no
  side effect — never a standing instruction, never a mandatory step.
- Forbid it in the same batch as the action it reasons about, in the brief
  and, where the harness can see the batch, at the dispatch door.
- Give it no capacity, no failure mode, and no ability to change state. The
  moment it can fail, it becomes a thing runs die on for no gain.
- Read the election rate as a signal about the dispatcher and the brief.
  Never publish it as a score, and never require a minimum.
