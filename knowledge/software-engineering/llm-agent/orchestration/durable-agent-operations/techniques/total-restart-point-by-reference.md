---
layer: technique
type: technique
subject: durable-agent-operations
technique: total-restart-point-by-reference
status: forged
laws: [unknown-is-not-a-value, one-authority-per-vocabulary, creation-names-reaper]
shared_with: []
use_when: [designing what a crashed agent operation leaves behind, recovery has to work out where it was, a full-state checkpoint is rejected as too expensive, deciding where large in-flight content lives]
---

# Total restart point by reference

Use a small current-state value when recovery should dispatch without replaying
the entire operation history. Replace its logical value at each transition;
store growing content separately and reference it by stable identity. This is a
representation choice, not a requirement that the database issue a literal
whole-row rewrite or that its storage engine keep no journal.

## The rule

The value contains a schema version, explicit phase, bounded policy, required
content references and an ownership/version token. Execution and recovery share
one phase definition and exhaustive handling. Do not infer that an effect never
happened merely because a field was not written. Missing required content is a
fault; optional absence is legal only where the schema gives it that meaning.
These are the uses of
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) and
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary).

Publish the next value and its local content changes atomically. Use a
conditional version/owner check so concurrent or delayed writers cannot replace
a newer state. Validate old schema versions before resuming; migrate explicitly
or report an unsupported restart point without guessing its phase.

## What stays bounded

References avoid repeatedly copying the transcript into every checkpoint. The
claim of constant-size state requires a bounded number of references: storing
one reference per tool in an unbounded batch still grows with that batch.
Referencing a separately stored collection can bound the envelope, but its reads,
writes and cleanup still cost work.

Retaining N full snapshots of a linearly growing conversation can take quadratic
aggregate storage. Replacing one latest snapshot has linear live size, although
cumulative write traffic can still be quadratic. Deltas, structural sharing and
periodic snapshots have different tradeoffs. Journal replay remains a legitimate
alternative; see the source and scope discussion in the
[golden path](../durable-agent-operations.md#choose-the-durable-representation-explicitly).

## Content ownership and cleanup

Mint identities before their uncertain writes. Every scratch address has an
owner and a cleanup policy. Reads use explicit references rather than searching
for a plausible result. If content is outside the state transaction, stage it
durably before publishing its reference; abandoned uploads need an idempotent
reaper. A missing required blob must not be interpreted as an empty result.

When the store supports it, terminalization can atomically write an immutable
result and delete owned scratch state. Keep shared content, audit evidence and
idempotency records for their declared retention periods. Deletion is one way to
represent closed work; an explicit terminal record is another. Neither removes
the need to find stalled open work or reclaim abandoned external blobs.
This is the ownership obligation of
[creation-names-reaper](../../../../_laws.md#creation-names-reaper).

## Checks and boundaries

Test missing references, version conflicts, stale owners, old schema versions,
and a crash between blob staging and reference publication. Delete permitted
scratch after completion and read the conversation and result back. Measure
recovery and cumulative write cost at increasing run and batch sizes.

Use another representation when retained replay history is required or the host
cannot interpret a guest's opaque state. The host may still persist a total
envelope; semantic recovery then belongs to the guest contract. One repeatable
step may need only a result key and retry policy, rather than a phase machine.
