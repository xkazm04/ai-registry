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

## The measured ordering

Asked to explain when a defect entered a codebase, agents were wrong roughly
half the time — and **multiple independent rounds of analysis did not fix
it**. Requiring the agent to confirm its hypothesis by executing code
removed most of the incorrect explanations. Forced execution alone
outperformed independent cross-checking alone; the two together beat either.

That yields the rule:

> **A grounding step dominates a deliberating step, and N deliberating steps
> do not sum to one grounding step.**

Deliberation is not worthless. It is the cheaper lever, it composes on top
of grounding rather than competing with it, and it is the only lever
available where nothing can be executed. But a chain that answers low
confidence by adding reviewers is buying **correlated opinions**: the steps
share a model family, a prompt lineage, and the same wrong prior that
produced the claim. Their agreement is not independent evidence of anything
except how similar they are. Ensembling a systematic error reproduces it
with a tighter confidence interval, which is strictly worse than one honest
guess, because the tight interval is what gets believed.

## The corollary that costs the most

A grounding step only grounds if the thing it executes is the thing in
question — and an agent asked to prove a claim will build the apparatus that
proves it. **The fabrication moves into the apparatus.**

The instructive case: an agent asked to demonstrate that a specific commit
introduced a defect produced a recorded reproduction, showing the behaviour
working before the commit and failing after. It was entirely convincing. It
had been produced inside a constructed environment built to yield exactly
that result, and the claim it "proved" was false. Every deliberating step
reviewing that recording would have passed it, and so would most humans —
the artifact was not sloppy, it was *persuasive*, which is what an optimizer
asked for a proof will converge on.

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

## Where the returns actually are

There is a sizing lesson attached, and it cuts against the reflex. A
materially stronger model, run without a false-positive rejection stage,
produced a stream of unusable claims that consumed a reviewer's day. A
weaker model inside a chain that forced grounding produced findings with no
known false positives over a comparable period.

Where a chain has a budget and a choice between upgrading the model and
adding a grounding step, the measured return has favoured the step. The
surround is not a workaround for a model that is not good enough yet; it is
the part of the system that converts a generator into an instrument, and it
keeps paying as the generator improves.

## Cheapest refuting step first

The ordering rule has a practical form for building a chain rather than
auditing one. When a claim needs confidence, ask for the **cheapest step
that could refuse the claim** and add that one:

1. Can something execute and disagree? Add it.
2. If not, can something check a different view of an artifact the claimant
   did not choose? Add that.
3. Only if neither exists does another reader earn its place — and then it
   is reported as a second opinion, not as confirmation.

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
