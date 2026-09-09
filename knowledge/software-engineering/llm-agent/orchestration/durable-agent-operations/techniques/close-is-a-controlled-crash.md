---
layer: technique
type: technique
subject: durable-agent-operations
technique: close-is-a-controlled-crash
status: forged
laws: [unknown-is-not-a-value, gate-sees-target]
shared_with: []
use_when: [designing shutdown for a runtime that owns durable work, a graceful-exit path writes different state than a crash, recovery works in tests and fails on the first real restart, deciding whether shutdown may cancel in-flight effects]
---

# Close is a controlled crash

Make process shutdown preserve a state ordinary recovery understands. Do not
turn process exit into a user cancellation or invent the outcome of an
unresolved effect. Reusing recovery logic reduces the number of distinct paths
to maintain; it does not prove that rarely exercised paths are always wrong.

## Seal, drain, release

1. Seal admission to new operations and effects. Give new callers a clear
   closed result and finish or reject waiting observations.
2. Drain already-admitted work and commits within a defined deadline while the
   store and required resources remain usable.
3. Close the write boundary, release local resources and stop. Leave unresolved
   operations at valid restart points for the next owner.

Persist a known result through the ordinary settlement path during the drain.
This is not a synthetic success invented by shutdown. An alternative design can
seal writes immediately and deliberately leave late outcomes pending, but it
must account for the extra reconciliation or repeat risk and enforce that seal
consistently. Distinguish the admission seal from the later storage close.

## What shutdown must preserve

- No cancellation marker unless cancellation was actually requested under the
  operation's contract.
- No fabricated success or failure for an external effect whose outcome remains
  unknown; see [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value).
- No deletion of unfinished work merely because its executor is exiting.
- A valid restart point after every accepted write, guarded against stale owners.
- Bounded draining: an uncooperative effect cannot prevent shutdown forever.

Adopt a controlled-crash policy only after uncertain effects have durable
intents and declared recovery policies. Without them, refusing late writes can
discard the only knowledge of an escaped effect.

## Resource and compensation boundaries

Release process-owned handles and cooperate with in-flight work where possible.
An external resource that only the exiting process can release needs explicit
cleanup; a compensation whose handle expires with the process may also need to
run before exit. Give successors durable handles or lease/fencing contracts
where feasible, but do not suppress available cleanup while redesigning them.
Lease expiry alone does not prove that an old executor stopped acting.

The distinction from
[ordered-teardown](../../session-continuation/techniques/ordered-teardown.md)
is the trigger. An accepted request to stop work changes durable control;
replacing its executor usually does not. An explicit workflow policy can link
process shutdown to cancellation, but that policy must be stated rather than
inferred from the process disappearing.

## Checks and limits

At each durable boundary, compare restart behavior after shutdown and after
abrupt loss. Both must satisfy the same recovery invariants, but their stored
bytes need not match: a graceful drain can legitimately commit more observed
progress. Inject abrupt termination too; graceful close cannot simulate lost
buffers, commit interruption or a process killed before cleanup. This is the
application of [gate-sees-target](../../../../_laws.md#gate-sees-target).

Test a result arriving during the drain, one arriving after storage closes, an
uncooperative effect at the deadline and an old owner writing after reassignment.
Do not invent a second settlement path to handle these cases.

For a runtime with no durable work, close may be ordinary cleanup. A system
requiring compensation before exit needs that explicit contract alongside crash
recovery; a strict no-write shutdown policy is not universally superior.
