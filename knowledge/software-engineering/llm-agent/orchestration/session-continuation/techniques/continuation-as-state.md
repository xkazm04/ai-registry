---
layer: technique
type: technique
subject: session-continuation
technique: continuation-as-state
status: forged
laws: [gate-sees-target, creation-names-reaper]
shared_with: []
use_when: [an agent stops before the task is complete despite being told not to, designing a keep-working mode for a harness, a session opened in a directory inherits a stale continuation from a crashed run, deciding which states may hand control back to the operator]
---

# Continuation as state

For explicitly accepted multi-turn work, put the continuation policy in a record
the harness re-reads at its turn boundary. Prompt reinforcement can explain why
work continues, but must not be the only carrier. The hook can request another
turn; progress and host availability remain separate concerns.

## Record and lifecycle

Include task and acceptance references, owner session/run identity, schema and
control revisions, active mode, cancellation state, timestamps and absolute
resource bounds. Bind the record to its owner rather than to a directory alone.
This is [gate-sees-target](../../../../_laws.md#gate-sees-target): the boundary
reads authoritative control rather than a model's description of it.

Use an explicit expiry or lifecycle policy. A lease can prevent abandoned modes
from blocking later work; its duration depends on task and renewal behavior,
not a universal hours-versus-days rule. Renew atomically for the same active
generation only, without extending an absolute task deadline or budget. Do not
let arbitrary future timestamps keep a record active indefinitely. Missing or
invalid control is reported and cannot establish successful completion.
Expired advisory continuation stands down without deleting the task's evidence.
This is the cleanup obligation of
[creation-names-reaper](../../../../_laws.md#creation-names-reaper).

## Yield states

Enumerate at least completed, cancelled, rejected, awaiting-required-input,
blocked-on-external-state and resource-limit-reached where the workflow needs
them. Preserve resumability and the specific unmet condition. These states are
not interchangeable verdicts about content quality.

An intermediate approval is not completion when implementation remains in the
accepted task. A review-only request may legitimately finish with a verdict.
Neither a positive review nor a passing test grants unrelated execution authority.

Bound repeated stop refusals and honor the target harness's documented re-entry
behavior. A cap releases control with an incomplete status; it must not label
the task done. Explicit user cancellation outranks continuation reinforcement.

## Arming and verification

Use explicit task intent to arm a mode. Prevent quoted text, retrieved content
or a copied parent prompt from arming delegated workers. Suppress automatic
inheritance by trusted session metadata; intentional child continuation may be
allowed within an explicitly delegated budget and task. An environment marker
is a coordination convention, not a security boundary against an untrusted child.

In isolated fixtures, remove only redundant reinforcement and keep the record:
the boundary must still apply its policy. Expire or cancel the record and leave
reinforcement: that mode must no longer refuse a stop. Also test wrong-session
records, future timestamps, concurrent renewal, required input and budget expiry.
Preserve task and higher-priority instructions during this test.

Do not arm a loop for a simple question. A continuation mode needs a cancellation
path from its first release; absent host support must be reported honestly.
