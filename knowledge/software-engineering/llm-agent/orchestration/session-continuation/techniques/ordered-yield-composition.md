---
layer: technique
type: technique
subject: session-continuation
technique: ordered-yield-composition
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [two independently authored behaviours each want to hold the session open, a second loop is being refused because the first one armed first, deciding whether a stop decision is single-valued or ordered, an operator cannot end a session because some interceptor will not release it]
---

# Ordered yield composition

When continuation behaviors have a defined nesting or priority relationship,
an arbiter can consult them in order. The arbiter owns the final decision;
individual frames contribute requests. For unrelated modes without such a
policy, use [single-loop-authority](./single-loop-authority.md).
This preserves [one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
without requiring every behavior to be merged into one implementation.

## Candidate yield protocol

Offer a candidate turn-end to frames from innermost outward. Define outcomes:
pass offers it outward; continue requests another turn; yield requests return
of control; push installs an authorized child; done pops the current frame and
re-offers the candidate; fail follows the frame's declared failure policy.

For each candidate, at most one frame consumes it. If every frame passes or
the stack is empty, the arbiter applies an explicit default. Done and advisory
failure can also move outward; pass is not the only outward transition.
Missing responses and timeouts are failures handled by policy, not an implicit
permission for a protective check to disappear.

Ordering is not a termination proof. A frame can keep returning continue or
push without bound. Cap stack depth and transitions per candidate, enforce the
overall resource budget, and expose the frame responsible for continuation.
Global cancellation and required protective refusals are evaluated before a
child's request to continue or yield can bypass them.

## Composition still needs semantics

Priority can choose between conflicting requests, but does not make incompatible
conditions compatible. State whether a child's yield ends just its subtask or
the whole session, what happens to the parent's unfinished work, and which
conditions are mandatory. Reject combinations without defined semantics.
Arrival order is a possible explicit serialization policy, but accidental hook
registration order is not a substitute for deciding these questions.

Persist frame identity, parentage, version, remaining bounds and lifecycle state
when restart is supported. Restore against current cancellation and ownership;
do not reset deadlines. Removing a frame does not undo external effects it already
caused, so inspectable stack state alone does not make execution reversible.

## Failure and tests

Advisory failure may pop and re-offer the candidate with a diagnostic. A protective
refusal blocks the protected action and follows its declared escalation policy;
it must not be silently converted to an advisory pass. Unknown outcomes are
explicit errors under [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value).

Test all-pass, empty stack, done, repeated push, timeout, protective failure,
conflicting parent/child requests, cancellation and stale restore. Use this
composition when independent extension behaviors justify it; one loop may be
clearer with a single control record.
