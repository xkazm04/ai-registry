---
layer: technique
type: technique
subject: proactive-nudges
technique: nudge-identity-dedup
status: forged
laws:
  - identity-survives-reuse
shared_with: []
use_when: [deciding whether a reopened condition is new news, same notice resurfacing after every restart, choosing between supersede and stack]
---

# Nudge identity & dedup

Assign identity to the semantic occurrence, scoped by tenant and recipient.
Kind plus subject reference is sufficient only when that scope and occurrence
are already implicit. Recurring reminders or separate events concerning the same
entity need a stable occurrence identifier; they need not become different kinds.

## Stable keys

Message wording, queue position and evaluation tick are poor identity components.
A scheduled due time can legitimately identify a recurrence when it is stable
across retries. Decide whether closing and reopening a condition is the same
situation or a new occurrence. Requested repetitions are not automatically spam.

Separate semantic notice identity from delivery-attempt and channel identities.
Declare whether one occurrence should contact multiple channels or be suppressed
across them. Retries reuse the destination's appropriate idempotency key within
its supported retention window.

## Coalescing and lifecycle

Atomically coalesce matching live candidates, update their payload revision and
retain original creation time alongside last observation and validity time. Define
whether refreshing a condition extends validity; do not accidentally keep an old
notice alive forever. Expired occurrences must not block legitimate new ones.

A delivered unresolved notice can suppress repeats, while explicit reminders may
have a consented recurrence policy. Cooldowns bound repetition only within their
declared scope. Persist identity when it must survive restart.

Retain attribution and dedup records for declared windows, respecting deletion and
privacy rules. Forever retention is unnecessary. Aggregates can preserve evaluation
evidence after individual payloads expire, with the resulting attribution limits
made explicit.
