---
layer: technique
type: technique
subject: session-continuation
technique: boundary-applied-stop
status: forged
laws: [failure-not-empty-success, verdict-survives-boundary]
shared_with: []
use_when: [a time or budget limit is crossed while the model keeps emitting tool calls, deciding whether a stop may interrupt a running tool batch, the last permitted round of a fixed budget dispatches tools nobody will read, a continuation prompt is injected between tool calls and their results, a deferred stop fires at the start of the next turn]
---

# Boundary-applied stop

The subject's enforcement point is the candidate yield: the moment the model
produces no further tool calls and tries to hand control back. That is the
right place to refuse a stop, and it is the wrong place to *find* one. A
model working steadily emits tool calls on every iteration and never yields,
so a stop gate consulted only at yield never runs during the stretch in which
limits are actually crossed. A wall-clock limit passes during a forty-call
streak, a token budget is exhausted halfway through it, a repetition detector
has the same call five times in its window, and none of them is asked until
the streak ends on its own, which for a runaway loop is never.

The fix has two halves, and the second is where the craft is. **Evaluate the
stop gates on every iteration**, including iterations that emitted tool calls.
**Apply a stop at a boundary**, never in the middle of a batch.

## The boundary is a point in the record, not a point in time

An iteration that emitted tool calls is followed by their execution, then by
their results being appended to the record, then by the next reasoning call.
The boundary is the gap between the last two: **every call in the batch has
its result in the record, and no reasoning call has started.** Only there is
the record well formed and nothing in flight.

Stopping anywhere else produces one of two damaged records. Stopping after the
calls are announced and before they run leaves calls with no results, which
breaks the pairing invariant that history-compaction owns (a call without its
result is rejected as protocol by every later request built from that record).
Stopping while tools run cuts off work whose side effects may have escaped,
and the record then needs an indeterminate closure: the case
[indeterminate-closure-on-interruption](../../../runtime-and-io/agent-runtime-assembly/techniques/indeterminate-closure-on-interruption.md)
exists to repair after a crash. A loop that manufactures that case on purpose,
for a limit that could have waited one iteration, has turned a clean stop into
a recovery problem.

## A stop decided mid-batch travels as a pending value

When a gate decides to stop on a tool-call iteration, the decision is not
discarded and not applied. It is **recorded as a pending stop**, carrying the
gate's reason as a typed value, and consumed at the next boundary before the
next reasoning call. The stop reaches the point that acts on it with its
classification intact; a boundary that only knows "something wanted to stop"
cannot tell the operator why the session ended
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).

Continuations are sorted on the same iteration, by whether they carry
information the model lacks:

- **Ordinary keep-working prompts are dropped.** The model is already working;
  it emitted tool calls. Injecting "continue" as a user message after its
  results is redundant and dilutes the record with text that looks like
  operator intent.
- **Warnings flagged for delivery during tool iterations are carried.** A
  repetition warning is the canonical one: the model repeating a call is
  exactly a model that is not yielding, so a warning deliverable only at yield
  never arrives. The flag is set by the gate that produces the warning; the
  loop does not guess which continuations matter.
- **A pending stop outranks a pending warning** at the same boundary. The
  warning is consumed and dropped; telling a session to change strategy on the
  iteration it ends helps nobody.

A pending stop has a lifetime, and it is the turn that decided it. It is
cleared at turn start and on conversation reset. A pending stop that survives
into the next turn stops that turn at its first boundary, for a reason the
operator's new message has nothing to do with.

## Lateness is bounded, and the bound is stated

A limit checked only at boundaries fires **at most one iteration late**, and
one iteration is the time from the last check to the next: a reasoning call
plus the slowest tool in the batch. That is the price of never cutting a batch,
and it must be a known price. If a single tool can run longer than the slack
an operator accepts on a time limit, the fix is to bound the tool with its own
timeout, not to let the loop interrupt it. The loop's stop and the tool's
timeout are separate instruments, and only the second one owns the tool.

The lateness is also testable without waiting: inject the clock, advance it
past the limit between two checks, and assert the first check passes and the
second stops. A test that only asserts the limit eventually fires cannot tell
a boundary-applied stop from a yield-only one.

## A stop known before dispatch refuses the batch

Deferral is correct for a stop that arises **while the batch runs**: time
passes, an external cancel arrives, a meter crosses during a tool that bills.
It is wrong for a stop that is **known before the batch is dispatched**. The
case is common, because the gates run after the reasoning call and before the
tools. On the last permitted round of a fixed round budget, or with a budget
already exhausted by the reasoning call itself, the gate knows at evaluation
time that no further reasoning call will happen.

Executing that batch anyway spends every side effect in it (writes, external
calls, approval requests put in front of a human) and produces results that
no reasoning call will ever read, in a turn that is then recorded as stopped
on a limit. The operator approved a write, the write happened, and the session
reports failure without looking at it.

The rule that separates the cases is one question: **will any reasoning call
read this batch's results?** If yes, dispatch and defer the stop. If no, refuse
the batch. Refusing does not mean dropping the calls from the record, which
would break pairing. It means answering each call with a synthetic result that
says the call was **not executed because the limit was reached**. That status
is not failure and not indeterminate: the outcome is known, and nothing
happened. It is spelled as its own status so that a later reader, or a resumed
session, does not read a refused write as a failed one or a succeeded one
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
Approval requests for refused calls are never raised.

Where a limit permits one final wrap-up reasoning call after the stop (a
summary the operator will read), the answer to the question is yes for that
call's inputs, and the batch may run. Make the wrap-up call's existence
explicit in the limit's definition rather than inferring it at the boundary.

## Decision rules

- Evaluate stop gates on every iteration, including tool-call iterations. A
  gate consulted only at yield never sees a limit crossed during a tool streak.
- Apply a stop at the boundary: all results recorded, no reasoning call
  started. Never mid-batch.
- Carry a stop decided mid-batch as a pending typed value with its reason, and
  consume it before the next reasoning call.
- On tool-call iterations, drop plain keep-working prompts; carry only
  warnings their gate flagged for tool-iteration delivery; a pending stop
  outranks a pending warning.
- Clear pending stops at turn start and on conversation reset.
- State the lateness bound (one iteration) and bound long tools with their own
  timeouts rather than interrupting the loop.
- When a stop is known before dispatch and no reasoning call will read the
  results, refuse the batch: answer every call with a not-executed result,
  raise no approvals, run no side effects.

## When not to use this

A protective stop, one whose next side effect is irreversible (a
destructive-command block, a spend ceiling that forbids even one more billed
call), does not wait for the batch. It interrupts, and the record is repaired
by indeterminate closure; the cost of that repair is the right price for
that class, per advisory-guard-fail-mode's risk classes. A loop in which every
iteration either yields or runs exactly one short tool has no batch to protect,
and a pending-stop slot is machinery with nothing to defer.
