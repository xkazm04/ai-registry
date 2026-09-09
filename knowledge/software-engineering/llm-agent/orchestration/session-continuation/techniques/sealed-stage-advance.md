---
layer: technique
type: technique
subject: session-continuation
technique: sealed-stage-advance
status: forged
laws: [identity-survives-reuse, gate-sees-target]
shared_with: []
use_when: [a multi-stage autonomous run must resume after an interruption, a stage is advancing on a completion phrase the model wrote, later configuration edits are changing a run already in flight, deciding whether a staged loop needs a workflow engine]
---

# Sealed stage advance

Pin a staged run's selected definition, bind evidence to its current activation,
and publish each accepted transition atomically. Closed named profiles can keep
a small harness understandable. General workflow engines can enforce the same
provenance and acceptance rules; rejecting them is a scope choice, not a proof
that arbitrary graphs cannot be safe.

## Inputs and descriptor

Validate prerequisites before creating a run. Each input comes from a declared
run input or a prior stage's output, with identity/version recorded where needed.
The first stage necessarily has an external task input. Explicitly admitted
external artifacts are valid; silently reading whatever is on disk is not.

Persist the selected stages, adapter/schema versions, acceptance predicates and
declared input references in an immutable descriptor. Canonical hashing detects
accidental changes to those fields, but is not authentication if a writer can
replace both the descriptor and its hash. Protect the record according to the
actual threat model. Keep mutable stage tracking separately versioned.

Resume validates the stored descriptor and compatible adapters. It need not
match today's profile definition if the pinned definition remains supported.
An incompatible definition is an explicit migration or blocked run, not a silent
substitution. Stable identity follows
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse).

## Provenance is necessary but not acceptance

Bind a completion claim to run, owner session, stage, activation token and exact
record identity. Validate the actual record and its protected provenance rather
than the model's summary: [gate-sees-target](../../../../_laws.md#gate-sees-target).
For file evidence, handle-based no-follow traversal and bounded reads can protect
the selected file; a basename and timestamp alone do not authenticate its writer.

Then evaluate the stage's acceptance predicate against current outputs. An exact
phrase in a legitimate assistant record can still be a false completion claim.
Record what passed, failed or could not be checked before authorizing advance.

## Atomic transition and recoverable dispatch

Compare run identity, active stage, cancellation state and expected tracking
revision in the same transaction or lock-protected operation that publishes the
next revision. A read-check-write sequence without atomic exclusion has a race.
Record the accepted evidence and next-stage activation together.

A duplicate or concurrent loser re-reads and reports current state without
applying its stale candidate to a later stage. Unexpected corruption or a
different run is an error, not a successful concurrent advance.

Advancing the record once does not deliver the next prompt exactly once. A crash
can fall between the state write and dispatch. Persist a dispatch intent/outbox
or use an idempotent activation mechanism so recovery can deliver it safely.
External effects inside a stage still require their own recovery policy.

## Checks and boundaries

Test wrong-session/stage evidence, pre-activation claims, an authenticated but
incorrect completion phrase, descriptor tampering, two competing writers,
cancellation during advance and a crash before next-stage delivery. Verify that
later configuration changes do not silently replace the pinned run.

One-stage work may need only a loop. Branching work may justify a workflow engine;
the same identity, acceptance and atomicity obligations still apply.
