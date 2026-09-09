---
layer: technique
type: technique
subject: session-continuation
technique: ordered-teardown
status: forged
laws: [creation-names-reaper, one-validation-door]
shared_with: []
use_when: [a session keeps refusing to stop after the operator cancelled, adding a new guard that can block a stop, a mode handoff is being disarmed by a cancel it did not ask for, cancel and the loop's re-arm fire on the same turn]
---

# Ordered teardown

An explicit request to stop must reach every guard that can force continuation.
Use one cancellation coordinator and derive its coverage from the same registry
that declares guards. Adding a guard includes its disarm and cleanup behavior.
This applies [creation-names-reaper](../../../../_laws.md#creation-names-reaper)
and [one-validation-door](../../../../_laws.md#one-validation-door) to control state.

## Stop admission, persist control, clean dependents

Close local admission to new work as soon as cancellation is accepted. Persist
a cancelled control generation, or atomically deactivate the primary record,
before cleaning dependent continuation flags. Otherwise a reader of the still
active primary can reconstruct what cleanup just removed.

If the durable write fails, report that cancellation is incomplete, preserve
enough state to retry, and keep local admission closed. Do not continue executing
merely to keep the old record internally consistent. An operator must retain a
way to terminate the process. Recovery after an uncommitted cancel needs an
explicit policy because the persisted record may still say active.

Cleanup after the durable cancel is idempotent and retryable. Keep evidence of
unfinished cleanup instead of claiming every resource was released. Prefer one
transaction when the store supports it; otherwise represent partial cleanup as
a known state. Disarming a continuation guard does not itself cancel a remote
job or prove an in-flight effect stopped.

## Deactivate is narrower than cancel

A successful mode handoff deactivates its predecessor and activates the successor
under the agreed authority. It must not emit a global cancel aimed at the mode
that just finished. Global cancel is reserved for an operator or policy whose
scope includes the whole session. Preserve background job identities until
their cancellation or handoff has been reconciled.

## Cancellation defeats stale renewal

Renewal compares and updates the same expected control generation atomically.
A cancel increments that generation or leaves a run-scoped terminal record, so
a delayed renewal cannot recreate the old mode. A separate read followed by an
unconditional write is not compare-and-swap.

A short-lived signal can help coordinate one turn, but expiry alone does not
defeat a writer paused longer than the signal's lifetime. Retain a cancelled run
identity or fencing generation long enough to reject stale work; a new authorized
run uses a distinct identity. This avoids both accidental resurrection and a
global tombstone suppressing unrelated future work.

## Checks and boundaries

Test cancellation before and after renewal, a writer delayed past signal expiry,
primary persistence failure, cleanup failure, duplicate cancel and a legitimate
mode handoff. The accepted cancellation must stop local admission in every case;
durable completion and unresolved external effects are reported separately.

One guard needs no dependency graph. It still needs a reachable cancel path and
a generation-safe update. Process shutdown without a request to end the work is
a separate contract in
[durable-agent-operations](../../durable-agent-operations/durable-agent-operations.md).
