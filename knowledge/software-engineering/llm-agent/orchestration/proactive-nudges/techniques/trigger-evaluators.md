---
layer: technique
type: technique
subject: proactive-nudges
technique: trigger-evaluators
status: forged
laws:
  - failure-not-empty-success
shared_with: []
use_when: [deciding whether an evaluator may deliver directly, same condition keeps refiring every tick, quiet week that could be a dead instrument]
---

# Trigger evaluators

An evaluator answers a coherent question about an authorized snapshot and returns
candidates, rather than delivering contact or executing their proposed actions.
Deterministic value functions make repeatable tests straightforward. If model-based
judgment is used, record its version and uncertainty; do not promise deterministic
output from identical inputs unless the implementation provides it.

## Contract

Supply a consistent, scoped snapshot with observation time and relevant revisions.
Return a semantic occurrence identity, evidence reference, payload and validity
bound. Candidate priority must be validated against an authorized kind-to-policy
mapping; merely using an enumerated urgent class does not authorize that evaluator.

Related predicates may share an evaluator when they form one understandable decision.
Reuse authoritative state rather than maintaining competing copies. Snapshot building
can fail or cost money; report those failures and bound collection and computation.

## Cadence and isolation

Periodic evaluation works for conditions that remain observable between ticks.
Short-lived events may require durable upstream capture or event-driven evaluation.
Skipping an overlapping periodic tick is valid only if the missed observation is
acceptable or recoverable. Repeated evaluation relies on stable admission identity.

Isolate failures so one kind does not suppress independent work. Distinguish failure
from a successful empty candidate set. A timeout on an asynchronous wait does not
stop the underlying work, and a same-thread timer cannot interrupt synchronous
computation. Use an execution boundary or cooperative cancellation appropriate to
the required limit, and reject late results after their generation is invalidated.

Test positive, negative, stale, conflicting and unauthorized snapshots. Verify
downstream admission and policy checks independently; evaluator purity alone does
not establish safe delivery.
