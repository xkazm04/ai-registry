---
layer: application
type: application
subject: mcp-tools
technique: untrusted-result-handling
stack: react
verified_on: 2026-08-31
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# The arbitration nobody wrote (React/TypeScript agent layer)

The technique's amendment claims that a system implementing distrust alone has
not chosen a conservative tiebreaker between a tool's result and the model's
prior — it has silently delegated the choice. A desktop agent-orchestration app
with a full MCP tool surface tests that claim in the strongest available way,
because it was never built to test it.

## The structural fact

Across the application's agent layer — the tool-invocation modules, the execution
lifecycle, the result inspectors — a search for the vocabulary of arbitration
returns **nothing**. No conflict, no contradiction, no disagreement, no mismatch,
under any spelling. There is no branch anywhere that fires when a tool returns a
result the model's own answer disputes, because there is no notion in the codebase
that such a state exists.

This is not an omission a reviewer would catch, and that is the point. Every
mechanism the technique's parent discipline prescribes *is* present in some form:
results cross a typed boundary, errors travel inside the envelope, the human sits
in front of the irreversible. All of them lower or bound what a result can do.
None of them is the missing one, because the missing one is not a defense — it is
a **decision**, and a codebase does not grow a decision it has no word for.

So the tree confirms the amendment by the shape of its absence: the arbitration
happens on every tool call, it is resolved by whatever the model does that turn,
and nothing observes it or records that a conflict occurred. Ask what this tree
could not have been built to prove, and it proves it anyway.

## What could not be measured, and the instrument that would do it

A behavioural arm needs a tool whose result is known to be correct and known to
disagree with the model's prior, run through the live agent path with the outcome
recorded. Nothing in the tree can supply that today: there is no recorded-run
store for tool conflicts, no fixture with a planted disagreement, and — the
binding constraint — **no field in which a conflict could be recorded even if one
occurred**, so a run that hit the case would look exactly like a run that did not.
Verdict `unmeasurable`. The instrument is a **replayable tool-call log carrying
both the tool's result and the model's pre-tool answer**, which would make the
disagreement rate a query rather than a hypothesis.

## What this realization cannot do

It cannot distinguish "the model deferred to the tool" from "the model and the
tool agreed" from "the model overrode the tool", because all three produce an
identical transcript. Any team copying this structure should assume its
disagreement rate is unknown rather than low.
