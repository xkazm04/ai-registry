---
layer: technique
type: technique
subject: session-continuation
technique: compaction-checkpoint
status: forged
laws: [silent-state-is-ungoverned, unknown-is-not-a-value]
shared_with: []
use_when: [a continuation mode is dropped after the harness compresses context, deciding what a pre-compaction hook must write, a resumed session forgets its background jobs or its plan anchor, the summariser is the only thing carrying loop state]
---

# Compaction checkpoint

Keep authoritative loop control outside the model's lossy conversation summary.
A harness can persist it continuously and use compaction hooks to capture or
validate a snapshot. A separate model-writable note may preserve working intent,
but must not create authority that the control record does not contain.

## What survives

Record session/run identity, schema and control revision, active modes and their
conditions, loop authority, plan/task references, background operation identities,
stage position, cancellation, deadlines and remaining counters. Persist these
at their actual transitions. A checkpoint only at compaction cannot recover
an earlier crash or a mutation that races with that checkpoint.

The control envelope makes operational state inspectable under
[silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned).
Do not confuse it with project instruction delivery: both are needed when the
host would otherwise lose them, but they need not use the same lifecycle event.

## Restore against current authority

Branch on the host's documented start reason: compaction, explicit resume,
clear or a new session can have different policies. Resume may require restore;
it is not inherently double-arming. Make restore idempotent, bind it to the
current run and compare revisions before applying it. A stale snapshot cannot
replace a newer cancellation or reset spend/failure counters.

An unrecognized start reason is reported rather than guessed. A missing snapshot
does not prove no modes were active, nor does it identify the cause as a failed
write: the event may be unsupported, the path wrong or the record removed.
Inspect authoritative control where available and report uncertainty under
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value).

Reconcile background identities with their current owners; a stale process handle
or recycled process ID is not proof that the original job is still running.
Validate schema compatibility and required task references before continuing.

## Advisory working note

A short note can carry the current hypothesis, the next useful check and rejected
approaches. Treat it as potentially stale and verify factual assertions against
the artifacts. It supplements the task record and summary; it is not mandatory
when those already preserve enough working context. Never use a note to re-arm
a cancelled mode or substitute for missing authoritative control.

## Checks and limits

Compact with active jobs and nonzero counters, cancel after snapshot creation,
then restore. Also test missing/corrupt snapshots, duplicate restore, clear,
explicit resume, wrong run and an unsupported schema. Assert that newer control
wins and resource bounds do not reset.

Without a pre-compaction event, persist at ordinary state transitions and reload
through a supported boundary. If the host exposes no reliable control access,
state the reduced guarantee and use bounded tasks; short sessions alone do not
prove compaction cannot occur.
