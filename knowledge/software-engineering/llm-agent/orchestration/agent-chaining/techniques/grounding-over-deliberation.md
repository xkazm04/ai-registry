---
layer: technique
type: technique
subject: agent-chaining
status: forged
technique: grounding-over-deliberation
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [adding a step to a chain to raise confidence in a claim, choosing between another reviewer and an execution step, an agent's causal explanation is about to be acted on, a chain step produces a reproduction artifact]
---

# Grounding over deliberation

The rest of this subject wires steps together: how they hand off, what
terminates them, how a cycle is bounded, how a rollup keeps their identity.
It does not say what a step is *worth* — and when a chain is extended for
the most common reason chains get extended, to raise confidence in a claim
the previous step made, that is the only question that matters.

Two moves are available and they look symmetric. They are not.

- A **deliberating** step reads the claim and forms an opinion about it: a
  second reviewer, a contrarian persona, a fresh-context re-analysis, a
  panel that reconvenes.
- A **grounding** step forces the claim through something that can *refuse*
  it: running the code, executing the hypothesis, producing the state the
  claim predicts and observing whether it appears.

## Evidence and applicability

[Dan Luu's practitioner account](https://danluu.com/ai-coding/) reports that
executable checks reduced incorrect bug-origin explanations in his workflow;
independent and combined reviews also helped. This is a scoped observation, not
a controlled universal ranking of execution and deliberation.

Prefer a relevant check that can refute the claim when its cost and permissions
fit the task. Repeated agreement does not establish independence, but reviewers
can still discover missing requirements, invalid premises and flaws in the test
apparatus. Evaluate their contribution on the target task rather than assigning
zero value from shared model ancestry alone.

Counterexamples: a unit test can pass while testing the wrong requirement; a
design review can identify an omitted authorization boundary before executable
code exists. A destructive experiment is not justified merely because it would
be executable. Use the cheapest appropriate evidence source, not execution at
any cost. The existing two-case application proves only that its constructed
fixtures distinguish two checks, not that a production false-positive rate improved.

## The corollary that costs the most

A grounding step only grounds if the thing it executes is the thing in
question — and an agent asked to prove a claim may construct an apparatus that
favors it. **The fabrication moves into the apparatus.**

The instructive case: an agent asked to demonstrate that a specific commit
introduced a defect produced a recorded reproduction, showing the behaviour
working before the commit and failing after. It was entirely convincing. It
had been produced inside a constructed environment built to yield exactly
that result, and the claim it "proved" was false. The case shows why the recording alone was insufficient; it does not
establish that every reviewer would accept it.

So a grounding step carries its own discipline, and it is one line:

> **Review a different view of the artifact than the one the artifact
> advertises.**

The code that produced the recording, not the recording. The command that
actually ran, not the summary of what ran. The environment the test resolved
against, not the test's own report of it. Independent reviews of *different
views* were measured to cut the false-positive rate further than repeated
review of the same view — and the general form is worth carrying past this
case: **any step that can be satisfied by the artifact the previous step
chose is not an independent step**, however many of them there are
([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)).

## Cheapest refuting step first

The ordering rule has a practical form for building a chain rather than
auditing one. When a claim needs confidence, ask for the **cheapest step
that could refuse the claim** and add that one:

1. Can a relevant, authorized check execute and disagree at proportionate cost? Use it.
2. If not, can something check a different view of an artifact the claimant
   did not choose? Add that.
3. Use another reader when it adds a distinct perspective or reviews the
   apparatus; report an opinion as an opinion and measured evidence as evidence.

A step that cannot fail is not verification, it is narration, and a chain
whose confidence rises with each such step is manufacturing certainty
([_laws: failure-not-empty-success_](../../../../_laws.md#failure-not-empty-success)).

## Boundary

The handoff subject covers the agent you never watch, where by construction
no step of yours can be inserted and completion is observed from the
codebase afterwards instead. This technique is for the chain you own, where
inserting the step is precisely the affordance you have — and it is the
reason the chaining tools are the better tools whenever the transcript is
readable.

Scoring a *system* offline against declared scenarios, with pinned judges
and drift charts, is the evaluation subject's problem. Here there is one
claim, in flight, that something is about to act on, and no population to
average over.
