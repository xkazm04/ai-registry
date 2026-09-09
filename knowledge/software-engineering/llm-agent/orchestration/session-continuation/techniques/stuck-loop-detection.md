---
layer: technique
type: technique
subject: session-continuation
technique: stuck-loop-detection
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [a continuation loop is repeating the same failed fix, choosing when a keep-working loop must stop anyway, a self-improvement loop keeps accepting negligible gains, a batching policy is deferring a stop the loop already earned, a session auto-resumed after a crash crashes the process again]
---

# Stuck-loop detection

Use failure identity and observed progress to decide when a lane should change
approach or ask for help. Retain hard attempt, time and spend limits independently.
Different errors can be random churn; identical errors can persist while a
necessary prerequisite is being repaired. Neither pattern alone proves progress
or exhaustion of all useful hypotheses.

## Failure signatures and evidence

Normalize volatile details while retaining the error class, meaningful location
and failed predicate. Keep the original evidence so normalization collisions can
be inspected. Count consecutive unsuccessful repairs of that signature, alongside
the remaining budget and the information each attempt produced.
This is [count-carries-predicate](../../../../_laws.md#count-carries-predicate).

Choose a threshold for the task and layer; three is an example, not a universal
law. A parent need not repeat all a child's failed attempts. On threshold, pause
that lane with the signature, attempts, observed changes and a root-cause
hypothesis labeled as such. Continue independent authorized work where possible.
Do not defer the lane's stop merely to finish a batch.

## Two optimization counters

For a measured improvement loop, define the metric, materiality threshold and
noise treatment before interpreting wins:

- Failure counts consecutive rounds with no measured improvement and resets on
  an improvement under that measurement rule.
- Stagnation counts rounds without a meaningful improvement, including failures
  and negligible gains, and resets only on a meaningful improvement.

Different thresholds can pause a lane or end an approach. Do not let tiny noisy
changes keep a failing approach alive indefinitely. A streak of wins from one
family can prompt an alternative trial when exploration is valuable; forcing a
different family after every fixed streak can waste budget on a known worse
option and is not mandatory.

## Validate the integrated candidate

Measure the candidate with the current base in a reversible integration state,
such as a temporary worktree or merge candidate. Accept the relevant checks on
that combined state; two independent improvements can conflict. This does not
require publishing or merging an unvalidated candidate into the live branch.
Rerun checks when the base or affected assumptions change.

## Interrupted turns need a separate counter

Persist dispatch/attempt identity before auto-resume and track consecutive
unsettled resumptions outside the worker that can crash. Clear the interruption
streak only on the defined successful boundary, not merely when resume begins.
At its limit, suspend the lane with its evidence and a recovery path. A count
does not prove its history is permanently unrunnable.

Resume only work admitted by the run's stored policy and current authority.
Recent activity alone is not permission to resume a session; deliberately paused
or cancelled work stays paused or cancelled. Reconcile unknown external effects
before retrying them. Preserve unrelated lanes rather than blaming every session
that happened to be active during a host failure.

A clean-shutdown marker can help classify a supervisor restart. If used, scope
it to the process generation and write it only after its defined drain succeeds.
Its absence means no clean marker was observed, not proof of a particular crash
cause. Deployment restart may intentionally resume durable work; clean shutdown
does not by itself forbid it. Keep lifecycle observation separate from the
operation's cancellation/completion state.

## Checks and boundaries

Test repeated signatures, changing errors without progress, tiny gains within
noise, a genuinely improving sequence, hard-budget exhaustion and crash during
resume. Verify counters survive compaction and failures to persist suspension
are reported. Dependency unavailability may belong to backoff or circuit-breaker
policy; it still consumes applicable task limits and must not cause blind retry.
