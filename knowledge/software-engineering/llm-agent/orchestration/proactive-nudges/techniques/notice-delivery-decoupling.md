---
layer: technique
type: technique
subject: proactive-nudges
technique: notice-delivery-decoupling
status: forged
laws:
  - creation-names-reaper
  - failure-not-empty-success
shared_with: []
use_when: [deciding whether a deferred notice is still true, suppressed notices vanish instead of waiting, answering why a notice was never delivered]
---

# Notice/delivery decoupling

Separate candidate admission from permission to dispatch. Persist pending notices
when restart survival matters; safely recomputable transient suggestions may use
a smaller mechanism. Multiple queues or partitions are valid if every dispatch
enforces the same applicable policy.

## Lifecycle

Admit a scoped identity, source revision, payload, observation time, validity limit
and retention rule. Coalesce repeated candidates. At dispatch, validate current
recipient consent, source relevance, quiet policy and available capacity. Record
whether a refused candidate is deferred, obsolete, expired or cancelled.

Short expiry bounds possible staleness; it is not equivalent to checking current
truth. An incident can resolve just before expiry. Declare acceptable freshness
per kind and recheck consequential predicates before dispatch. Re-evaluation can
replace expired notices only when the underlying signal remains observable.

Requested future reminders need an explicit due time and missed-delivery policy.
Increasing an expiry does not guarantee the promise. Opt-out or cancellation must
invalidate queued work, with a final policy check or generation fence at dispatch.

## Delivery uncertainty

Claim a notice as reserved or in flight before sending. Marking it delivered first
can lose contact if the process crashes before sending. Sending first can duplicate
contact if acknowledgement is lost. Use a durable intent and destination-supported
idempotency where available; otherwise expose the chosen loss/duplicate tradeoff
and reconcile unknown outcomes. A local transaction alone cannot guarantee exactly
one external delivery.

## Bounded queues

Set per-scope and per-kind limits, coalesce updates and expire stale notices. Minimal
reason records can explain disappearance without retaining sensitive payloads forever.
Expiry-aware atomic admission can replace a full expiry sweep before each insertion.

Drain eligible work fairly with pacing after suppression ends. Queue pressure never
widens consent, budgets or quiet exceptions. Preserve transient signals upstream if
they must survive skipped evaluation; a queue cannot retain a candidate never created.
