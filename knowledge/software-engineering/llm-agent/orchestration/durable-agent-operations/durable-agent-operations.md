---
layer: golden-path
type: golden-path
subject: durable-agent-operations
status: forged
use_when: [an agent run must survive the death of the process executing it, deciding what a restart finds after a crash mid-tool, a parallel tool batch settled out of order and a crash lost the finished results, designing shutdown for an agent runtime, a cancelled operation resumes or repeats work it already did]
techniques:
  - total-restart-point-by-reference
  - intent-mints-the-identity
  - settlement-order-is-not-placement-order
  - two-cancellations-and-a-synchronous-door
  - close-is-a-controlled-crash
  - recovery-prefix-enumeration
---

# Durable agent operations

An accepted agent operation may outlive its executor. Its durable record must
distinguish known outcomes from unresolved effects, preserve output identities,
and tell a successor what it may safely do. A process exit is not evidence that
an external effect failed, and an observer disconnect is not necessarily a
request to cancel the work.

This subject owns recovery of agent operations: provider requests, parallel tool
batches, transcript placement and context rewrites. Runtime assembly belongs to
[agent-runtime-assembly](../../runtime-and-io/agent-runtime-assembly/agent-runtime-assembly.md);
whether the loop should continue belongs to
[session-continuation](../session-continuation/session-continuation.md).
Neither subject replaces the other's recovery or stopping contract.

## Choose the durable representation explicitly

A small, replaceable current-state value referring to separately stored content
is one useful design. Recovery reads the phase, policy, identities and ownership
version, then dispatches to a defined procedure. Required missing content is a
fault; optional absence has an explicit meaning. See
[total-restart-point-by-reference](./techniques/total-restart-point-by-reference.md).

It is not the only valid design. Snapshot-plus-log and deterministic journal
replay can also recover work. [Temporal's event-history contract](https://docs.temporal.io/workflow-execution/event)
uses an append-only history for recovery and documents history limits. Choose
using measured recovery cost, compatibility requirements and retention needs;
the existence of a journal is not a defect.

The replacement design assumes atomic durable publication of the state and its
required references. If blobs live in another store, a local transaction cannot
magically include them: stage immutable content before publishing references and
define how abandoned staging is reclaimed. Schema versions and migrations must
cover restart points written by older executors.

## Fence ownership before recovering effects

A successor needs exclusive execution authority or a store-enforced ownership
epoch checked on each transition. Lease expiry permits reassignment under the
lease contract; it does not prove the old process stopped. A delayed executor
must not overwrite its successor's state. External destinations need their own
idempotency or fencing contract; a database fence alone cannot stop a stale
process from sending an external request.

## Record intent before an uncertain effect

For repeat-sensitive work, persist an intent and reserve output and usage
identities before dispatch. Atomically settle the outcome and next local state.
A crash after intent but before settlement leaves an unknown outcome, including
the interval before the request was sent. Recovery must reconcile, retry under a
declared safe contract, or record an indeterminate result. It must not guess.
See [intent-mints-the-identity](./techniques/intent-mints-the-identity.md).

Local record identities identify attempts. A destination's idempotency key may
identify the logical operation across several attempts; changing it on every
retry can repeat the effect. [AWS's idempotent API guidance](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)
describes request identifiers, parameter matching and retention windows. Verify
the actual destination's contract before replaying an unknown outcome.

Record unknown usage as unknown, not zero. The ledger rules belong to
[usage-ledgers](../../evaluation-and-cost/cost-metering/techniques/usage-ledgers.md).
Two local commits do not guarantee exactly-once execution in another system.

## Persist settled results independently of placement

Run only independent, authorized tool calls concurrently. Persist each complete
result promptly, without waiting for earlier siblings. If the transcript or
provider contract requires source order, materialize the ready prefix in that
order. Correlation identifiers and ordering requirements must come from the
actual adapter contract, not an assumption that every provider requires the same
layout. A durably staged batch can also be placed atomically at a turn boundary
when that latency is acceptable. See
[settlement-order-is-not-placement-order](./techniques/settlement-order-is-not-placement-order.md).

## Separate cancellation from observation and shutdown

For work explicitly accepted as durable, disconnecting an observer should not
silently cancel it. Cancellation is a separately authorized, durable request.
It prevents further admission according to the runtime's ordering contract and
reconciles already-started effects; it does not prove those effects stopped.
[Two cancellations and a synchronous door](./techniques/two-cancellations-and-a-synchronous-door.md)
explains the local admission boundary and its limits across processes.

Process shutdown seals admission, drains within a deadline and releases local
resources. It must not invent a cancellation or success verdict. It may persist
a genuinely observed outcome through the ordinary settlement path while the
store remains open. A stricter design can seal writes early and recover pending
effects later, but must justify the information and latency it gives up. See
[close-is-a-controlled-crash](./techniques/close-is-a-controlled-crash.md).

## Derive tests from the recovery contract

Enumerate phase variants and transaction boundaries, including recovery's own
interrupted prefixes, pending cancellation and stale-owner writes. Vary payloads,
batch sizes, references and interleavings: a finite phase vocabulary does not
make all concrete states finite or prove correctness with one test per phase.
Use [recovery-prefix-enumeration](./techniques/recovery-prefix-enumeration.md).

At the application level, atomic transactions expose committed boundaries even
when a crash occurs during a commit. That assumption depends on the store and
configuration. [This atomic-commit explanation](https://www.sqlite.org/atomiccommit.html)
describes both the guarantee and its storage assumptions; it is not a guarantee
for arbitrary multi-file writes. Exercise the actual persistence adapter as well
as an in-memory state model.

## Acceptance and limits

- Each pending effect has a stable reservation and an explicit recovery policy.
- Repeated recovery does not duplicate local settlements or silently replay
  an unsafe external effect.
- Old owners cannot commit after reassignment; required references remain valid.
- Cancellation survives observer loss, and shutdown preserves unresolved work.
- Staged and placed results have one coherent projection with no gap or overlap.
- Cleanup leaves the conversation and required audit/idempotency evidence intact.

For one cheap, repeatable computation, a simple retry may be sufficient. For an
opaque plugin state, the host can test its envelope and storage contract but
cannot enumerate guest semantics without a guest-supplied recovery contract.
The historical private runtime that motivated this subject was not re-executed
in the architecture review; these are design conditions, not new field evidence.
