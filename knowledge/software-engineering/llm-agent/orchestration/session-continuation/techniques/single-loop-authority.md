---
layer: technique
type: technique
subject: session-continuation
technique: single-loop-authority
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [the host harness ships its own goal evaluator beside a custom continuation loop, a continuation mode is armed inside a session already running one, deciding whether a judge's pass means the task is complete]
---

# Single loop authority

Multiple behaviors may advise whether a session should continue. One arbiter
owns the resulting control decision, with an explicit policy for conflicts.
That arbiter may be a single mode or an ordered composition; the important
property is that independent hooks cannot each re-arm work after another has
ended it. See [one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary).

## Independent claimants

Choose and record a supported conflict policy before activating the second loop:

- Refuse an incompatible or unauthorized second mode with a clear diagnostic.
- Adopt a compatible condition into the existing authority, recording what changed.
- Keep a second evaluator advisory: it emits evidence without blocking a stop.

An unknown policy is a configuration error, not an implicit grant to another
loop. Report it without preventing an operator from stopping the session.
[Unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) applies to
the policy decision as well as to completion claims.

Adoption preserves accepted scope and resource limits. Do not automatically take
the strictest possible condition: a follow-up can narrow the task, and a nested
skill cannot expand its parent's authorization. Record the effective condition
and reconcile genuine conflicts explicitly. Where behaviors have a defined
priority or nesting relationship,
[ordered-yield-composition](./ordered-yield-composition.md) supplies another model.

## Completion evidence

Keep evaluator-passed separate from accepted completion until the task's required
checks are satisfied. A transcript may contain authoritative tool results, but
the agent's own sentence that tests passed does not prove it. Read current
artifacts and check results, bind them to the relevant revision, and state when
verification cannot run. Not every task has an executable acceptance test;
use the declared evidence standard rather than inventing one.

An evaluator that lacks final authority should return its verdict to the arbiter.
An evaluator explicitly designated as the arbiter may decide under the same
acceptance contract. The implementation role alone does not determine authority.

## Checks and boundaries

Exercise two simultaneous arm requests, invalid policy, adoption of narrower
scope, contradictory completion predicates and stale completion evidence. Only
one revision-consistent decision may publish. Cancellation and total resource
bounds remain authoritative regardless of which modes participate.

A session with one loop needs no elaborate conflict table, but must still
distinguish a completion claim from the evidence required to accept it.
