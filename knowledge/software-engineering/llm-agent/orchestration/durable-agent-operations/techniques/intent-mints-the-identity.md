---
layer: technique
type: technique
subject: durable-agent-operations
technique: intent-mints-the-identity
status: forged
laws: [record-precedes-effect, identity-survives-reuse]
shared_with: []
use_when: [a crash mid-provider-call leaves an unknown outcome, recovery cannot tell whether a tool ran, a recovered transcript gains an extra record every restart, an interrupted generation is billed as free]
---

# Intent mints the identity

An external request can succeed even when its caller never receives the answer.
Before a repeat-sensitive effect, durably record its intent and reserve the
identities that its result and usage records will occupy. After observing the
outcome, atomically settle those local records and advance the operation.
This implements [record-precedes-effect](../../../../_laws.md#record-precedes-effect)
and [identity-survives-reuse](../../../../_laws.md#identity-survives-reuse).

## The two commits

The intent names the effect, attempt, policy, output slots, and any destination
idempotency key. If it cannot commit, do not dispatch. The settlement records the
observed or explicitly indeterminate outcome, usage evidence and next state in
one transaction guarded by the current ownership/version token. A late executor
cannot overwrite a successor's settlement.

| Crash position | Durable observation | Recovery |
| --- | --- | --- |
| Before intent commits | Previous phase | Resume it; dispatch was not allowed yet. |
| After intent, before dispatch | Pending | Apply the unknown-outcome policy. |
| During or after dispatch, before settlement | Pending | Reconcile or apply the same safe policy. |
| After settlement | Outcome and next state | Continue without duplicating the settlement. |

The middle rows are deliberately indistinguishable without additional
destination evidence. Intent does not establish that dispatch actually happened.
A failed local observation must not become a false claim of external failure.

## Attempt identity and effect identity differ

Recovery fills the slot reserved by that attempt. A new attempt can have fresh
local output and usage identities while retaining the logical effect's remote
idempotency key. Reusing that key is valid only under the destination's parameter,
scope and retention contract. Minting a fresh remote key on every network retry
can repeat the effect; reusing one for genuinely new intent can suppress work.
The [golden path](../durable-agent-operations.md#record-intent-before-an-uncertain-effect)
links the primary idempotency guidance.

Keep already-settled failed attempts as evidence. When resolving an earlier
indeterminate record, preserve the reconciliation history instead of presenting
the later knowledge as if it had been available at interruption time.

## Unknown outcomes and usage

Declare recovery per effect class: query by stable identity, retry with verified
idempotency, compensate through a durable handle, or retain an indeterminate
result requiring a decision. Returning the result to an agent is not permission
for that agent to repeat an unsafe effect blindly.

Reserve usage identity at intent and retain a row even if the provider never
reports units. Unknown units are not zero; an interrupted request may or may not
have incurred charges. The accounting contract belongs to
[usage-ledgers](../../../evaluation-and-cost/cost-metering/techniques/usage-ledgers.md).

## Acceptance and limits

Inject each crash position, repeat recovery and delay an old executor past
reassignment. Assert one local settlement per attempt, unchanged reserved
identities and an explicit unknown outcome where evidence is unavailable.

Two commits make the local recovery record precise; they do not make arbitrary
external effects exactly-once. If output and usage live in different stores,
define a recoverable publication protocol rather than assuming one transaction
covers both. Pure, cheap recomputation may need no separate intent, provided its
identity, cost and retry requirements are still satisfied.
