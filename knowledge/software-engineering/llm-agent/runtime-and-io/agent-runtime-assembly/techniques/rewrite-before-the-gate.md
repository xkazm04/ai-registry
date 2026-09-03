---
layer: technique
type: technique
subject: agent-runtime-assembly
technique: rewrite-before-the-gate
status: forged
laws: [gate-sees-target, verdict-survives-boundary, failure-not-empty-success]
shared_with: []
use_when: [a contributed transform rewrites tool arguments before execution, deciding where a rewriting surface sits relative to guardrails and approval, a wrapper that raises after the call re-runs a non-idempotent tool, a policy gate approved a value other than the one that executed]
---

# Rewrite before the gate

A mutator surface has two powers with different hazards. It can **rewrite** —
replace the arguments a call will run with — and it can **wrap**, sitting
around the call to observe or replace its execution. Both are useful; both have
one correct position and one correct arity, and a runtime that gets either
wrong produces a failure with no error attached. This technique fixes both: the
rewrite runs outside every gate that evaluates the value, and the wrapper runs
the call beneath it exactly once.

## The effective value is what policy must judge

A tool call passes through a policy path before it executes: availability
checks, guardrails, a human approval prompt, the runtime's own gates. If a
contribution may rewrite the arguments, there are only two places the rewrite
can go, and the choice is not a matter of taste. Put it **after** the gates and
the system has approved one value and run another: the approval prompt showed a
path, a command, a destination; the rewrite changed it; the guardrail's verdict
was computed over a string that no longer exists. Nothing errors — the gate
ran, said yes, and its yes was about something else. This is
[gate-sees-target](../../../../_laws.md#gate-sees-target) in the tool path: the
gate observed a proxy, and the proxy diverges precisely when a contribution is
doing something interesting to it.

So the rule is positional: **the rewriting point runs first, before argument
validation, before guardrails, before approval, and before the observer
emission** — and every one of those sees the rewritten value as the only value.
That consequence is stated plainly in the contract, because it is a transfer of
power: a contribution that can rewrite a path, a command or a destination
decides what policy will evaluate.

The rejected alternative deserves its forces stated, because it is the one most
runtimes reach for. Rewriting last means the transform sees the final, approved
value; normalization is easier there, and the value the human saw is the value
the model issued, which makes the consent disclosure trivially honest.
Rewriting first pushes the burden the other way: every gate downstream must be
correct over a value the model did not write, and the approval surface must
render a value a contribution authored. That burden is the right one to carry.
A gate reasoning about an unfamiliar value is doing its job; a gate reasoning
about a value that will not run is theatre. The disclosure a human approves,
and the binding of consent to the disclosed parameters, belong to the approval
discipline; this technique makes that binding *possible* by guaranteeing the
parameters at the gate are the parameters at the executor.

## Carry the original, and make a failed rewrite loud

A rewritten call has two values, and a gate that refuses it names one of them.
If the chain carries only the effective payload, the refusal names a string
nobody wrote and the contributor whose rewrite produced it is invisible in
every channel. So the frame carries **both** — the effective payload and the
original as it arrived — plus a trace entry per rewriting frame naming its
source and stated reason. The trace travels into the observer payloads that
report the call, so a refusal or an audit row resolves to "this contribution
changed this field, for this reason" without reading any handler. A rewriting
surface without provenance is an unattributable change to a value policy will
judge.

And when the rewriting point itself throws, the call proceeds with the original
arguments. That is the right fail-open direction — a contributor's bug should
not end a turn — and it is a *change of behaviour*: a contribution that existed
to constrain a command is not constraining it. Per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success),
"the rewrite ran and changed nothing" and "the rewrite could not run" are
different facts, spelled differently, on the operator's surface — not at the
debug level where this diagnostic lands because the path recovers so cleanly.

## Exactly once, and the three states of a wrapping frame

A wrapping point receives a continuation — call it to run everything beneath
you — and returns a result. Two rules govern it, and the second is the one
runtimes get wrong. **The continuation is single-use per frame:** calling it
twice re-runs the provider call or the tool, and a tool is not assumed
idempotent — the second call is a second write, a second charge, a second
message sent. A second invocation is a contract violation surfaced as an error
naming the frame, not a retry.

**Fail-open is conditioned on whether the call beneath already ran.** The
tempting rule — a wrapper failed, so fall through to the base path — is right
for exactly one of three states:

1. **Raised before calling the continuation.** Nothing beneath has happened.
   The frame is skipped, diagnosed, and the chain continues to the next frame
   and eventually the base path — the fall-through the naive rule describes.
2. **Called the continuation; the call beneath raised.** The wrapper did not
   fail — the work did. That error propagates as itself, with its own identity:
   a downstream failure re-thrown as the wrapper's error type is
   [verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)
   broken at the isolation seam, and one converted into an empty success is
   worse. Telling this state from state 1 requires the frame to record that it
   entered the continuation; the exception alone cannot.
3. **Called the continuation successfully, then raised while post-processing.**
   The effect has happened. The downstream result is preserved and returned as
   the frame's result; the wrapper's failure is a diagnostic and nothing else.
   Falling through here would run the call a second time — the naive rule's
   whole cost, paid on the state where wrappers most often fail.

A frame that short-circuits deliberately — returns without calling the
continuation — is a legitimate use of a wrapping point, not a failure. What
separates the two is whether the frame returned or raised: one more reason
refusal must never be expressed by raising.

## Where this stops

[semantic-hook-placement](./semantic-hook-placement.md) states the same shape
one chain over: sanitization is the outermost model wrapper, because
sanitization inside retry sends the original on the second attempt. That is
this rule for the *model* chain against *retry*; this states it for the *tool*
chain against *policy*, and adds the wrapping arity contract, which has no
counterpart there. The generalization both serve: **a transform that changes
what a later decision judges sits outside that decision** — written as a
wrapping relation in the composer, so it is validated rather than remembered.
[observer-and-mutator-surfaces](./observer-and-mutator-surfaces.md) decides
which surface may rewrite at all, and
[operator-tier-code-loading](./operator-tier-code-loading.md) decides fail-open
by the *origin* of a failure where this decides it by the *position in the
frame*.

## Decision rules

- Run the rewriting point before argument validation, guardrails, approval and
  observer emission; make every downstream evaluation see only the effective
  value, and state that power transfer in the contract.
- Carry the original beside the effective value and a per-frame trace naming
  source and reason, propagated into the payloads that report the call.
- Make the continuation single-use per frame; treat a second call as a contract
  violation naming the frame, never as a retry.
- Fall through only when the frame raised *before* entering the continuation;
  propagate a downstream failure as itself; return the downstream result when
  the frame raised after a successful continuation; never convert a downstream
  failure into a successful empty result.
- Report a rewriting-point failure on the operator's surface — the call ran
  under un-rewritten arguments.

## When not to use it

A runtime whose extension surface cannot rewrite arguments and cannot wrap
execution has neither hazard, and the frame bookkeeping is cost with no
purchase. It becomes necessary the moment a contribution can change a value a
gate will judge — when the first rewriting point ships, not when it is used.
