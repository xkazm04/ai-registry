---
layer: technique
type: technique
subject: durable-agent-operations
technique: two-cancellations-and-a-synchronous-door
status: forged
laws: [one-validation-door, absent-guard-is-loud]
shared_with: []
use_when: [closing a browser tab kills an agent run that should have continued, cancelling work requires somebody to still be watching it, an effect starts after cancellation was requested, deciding which calls must pass an admission check]
---

# Two cancellations and a synchronous door

For work accepted as durable beyond its initiating request, separate stopping
an observer from requesting that the operation end. A browser disconnect can
release its stream without changing the work's durable state. An authorized
operation-cancel request persists independently of that observer.

This split is a workflow contract, not a prohibition on every public API that
accepts a cancellation signal. A signal may represent durable cancellation when
the API explicitly defines that meaning and reliably persists the request.

## Requested does not mean stopped

Persist the cancellation request in control state and make duplicate requests
idempotent. Acknowledge durable acceptance only after commit. On restart, inspect
it before admitting new effects. Keep cancellation requested, cancellation
reconciled and external outcome separate: a tool can complete despite receiving
an abort signal. Record the outcome actually observed.

If an observer leaves while the cancellation commit is pending, the command
must finish independently or the caller must be able to query/retry it by
identity. A lost response is not evidence that cancellation failed.

## Local admission boundary

In a single serialized executor, finish asynchronous preparation first, then
check admission and invoke without yielding between them. Close the local door
before awaiting persistence of a cancel request. Otherwise this trace is legal:
check, await preparation, cancel, resume preparation, start effect.

The admitted unit is the whole logical operation. A lazy wrapper must propagate
cancellation into later work; synchronously creating the wrapper does not mean
the external request was sent. Preparation that itself performs an external
effect also needs the appropriate admission and authority checks.

Within that serialized boundary, test admission-first and cancellation-first.
Across threads, processes or remote senders, a synchronous expression is not an
atomic global decision. Serialize admission and cancellation through shared
ownership/control state, reject stale owners, and state whether the guarantee
concerns admission or actual remote execution. A destination may require fencing
or idempotency; a local signal cannot promise that remote work stopped.

## Enumerate integrations by effect

Maintain the catalog of effect-starting paths: provider requests, real tools,
effectful hooks and retry dispatch. Exercise each through the same guard, and
detect paths that bypass it. That is the use of
[one-validation-door](../../../../_laws.md#one-validation-door) and
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud).

Do not block settlement commits merely because new effects are forbidden; they
record work already admitted. Pure classification and truly passive observers
need no effect admission. Queue mutations, telemetry and preparation are not
automatically passive: classify what they actually do. An admission door is not
a replacement for authorization or storage concurrency checks.

A hook pipeline can be admitted as a unit, or expose defined interruptible
boundaries with reconciliation. Neither choice makes several handlers atomic.
Test partial application rather than assuming it cannot happen.

## Restart and checks

The local gate is a projection of durable control, not an independent enduring
verdict. If the process dies before cancellation commits, recovery may resume
unless the request was durably accepted elsewhere. Do not report that request
as committed. If persistence fails while the process remains alive, report the
failure and explicitly retry or restore the gate from authoritative state.

Disconnect observers and confirm durable work continues. Request cancellation
and disconnect immediately; verify persistence and reconciliation. Test commit
failure, delayed dispatch, stale owners, duplicate requests and already-completed
effects, as well as the two local orderings.

The neighboring [ordered teardown](../../session-continuation/techniques/ordered-teardown.md)
clears guards that could refuse a stop. This technique prevents new effects from
being admitted after the cancellation boundary; a runtime may need both.

## When not to use it

Request-scoped, cheap, repeatable work may intentionally end with its caller.
One signal can be sufficient there. Use the durable split when the accepted
work contract requires survival beyond an observer and define resource/time
ceilings so survival does not mean unbounded execution.
