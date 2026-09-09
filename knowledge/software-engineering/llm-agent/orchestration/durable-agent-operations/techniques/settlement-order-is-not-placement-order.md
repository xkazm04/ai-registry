---
layer: technique
type: technique
subject: durable-agent-operations
technique: settlement-order-is-not-placement-order
status: forged
laws: [record-precedes-effect, identity-survives-reuse]
shared_with: []
use_when: [parallel tool calls must appear in the order the model asked for them, a crash re-ran effects that had already completed, a finished call disappears from the display until its result is placed, deciding when a batch of results enters the transcript]
---

# Settlement order is not placement order

When independent tool calls run concurrently, completion order can differ from
the order required by the transcript. Persist finished results without waiting
for earlier siblings. Place them according to the actual consumer contract.
Not every provider requires source ordering, and dependent calls must not be
parallelized merely to reduce latency.

## The failure and the intermediate state

Calls A, B and C start. B and C finish while A is pending. If their results live
only in memory, a crash makes all three unresolved; replay can repeat effects
that already happened. Stage each complete canonical result durably, advance its
state atomically and reject late progress writes. This reduces the uncertainty
window but cannot eliminate a crash between external completion and staging.

Distinguish dispatched, settled-but-unplaced and placed. Preserve the identity
reserved before dispatch across all three states. Progress is not a substitute
for a canonical result. Required structured output must survive any size limit;
oversized content may need a durable reference with a defined retention policy.
See [record-precedes-effect](../../../../_laws.md#record-precedes-effect) and
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse).

## Placement policy

For incremental source-ordered placement, flush the contiguous ready prefix from
the first unplaced position. A later ready sibling waits for the gap to close,
but its result is already durable. Atomically advance placement and remove or
reclassify the staged entry so retries cannot place it twice.

A turn-end barrier is also valid when all results are durably staged and the
consumer accepts the delay. It does not inherently cause duplicate display.
Choose prefix flushing when incremental availability is useful; choose batch
placement when a whole-turn view simplifies the consumer contract.

## Projection obligation

| Durable state | Projection |
| --- | --- |
| Dispatched, pending | In flight |
| Settled, staged, not placed | Settled and awaiting placement |
| Placed | Transcript record |

For each visible call, the staged/in-flight view and transcript have no gap or
overlap. Derive both from one consistent snapshot or reconcile their events by
stable identity and version. Remove the staged projection on placement, whether
placement is incremental or batched; a turn-end notification alone is not enough
when results are placed earlier.

## Checks and boundaries

Exercise different completion orders, crashes after each staging/placement
boundary, duplicate events, late progress and reconnects between transitions.
Assert preserved outcomes, one placed result per reserved identity, required
order and coherent projection. A settled call is not re-executed by recovery.

Sequential execution can share this machine with concurrent execution, or
combine staging and placement atomically when no intermediate wait is possible.
With completion-order consumers there is no source-order gap to bridge.
This technique orders local materialization; delivery to external subscribers
needs its own acknowledgement and replay contract.
