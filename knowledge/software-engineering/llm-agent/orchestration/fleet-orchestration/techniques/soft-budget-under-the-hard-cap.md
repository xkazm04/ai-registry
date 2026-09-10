---
layer: technique
type: technique
subject: fleet-orchestration
technique: soft-budget-under-the-hard-cap
status: forged
laws: [limits-are-derived, failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [a dispatcher loop needs a stopping rule, raising an iteration cap changed nothing about how long runs take, a run was cut off mid-plan and the artifact is whatever existed at the cut, deciding where an agent loop's limit is written]
---

# Soft budget under the hard cap

A planning allowance below an enforced resource limit can leave room to collect
results and report a controlled stop. Use it when a model-driven loop otherwise
begins work it cannot finish within the allowed budget. The hard limit bounds
resource use even if the model ignores the brief.

## Define what each limit counts

Name the units and scope: model turns, worker starts, concurrent slots, elapsed time,
tokens or spend. A concurrent-slot cap does not limit repeated sequential dispatches.
Retries, record-only calls and child work must be included in the appropriate total.
Reserve capacity before dispatch and reconcile actual usage and uncertain outcomes.

Derive the effective planning allowance from the available limits and a declared
cleanup reserve. Independently configured ceilings can be valid when they constrain
different resources; validate their relationship instead of forcing all numbers to
share a ratio. A caller's requested maximum is a ceiling, not a promise to spend it.

For very small caps, explicit zero-work or immediate-finalization paths may be needed.
Reject invalid configurations rather than rounding a planning allowance above its
hard limit. Expose the effective allowance and remaining budget in the brief where
the model is expected to use them.

## Plan for every stop path

State early-stop conditions alongside the planning allowance: acceptance satisfied,
required input unavailable, or no justified next action within remaining scope.
The model can ignore a soft allowance, so enforce the hard ceiling independently.

A hard-cap stop is a resource outcome, not proof of content failure. It may leave a
complete accepted artifact, a useful partial, or no usable result. Report stop reason
and artifact acceptance separately. At a cap, prevent new admissions, cancel or
reconcile in-flight work under its policy, and preserve available results. A loop
counter alone cannot interrupt an unbounded tool call.

## Interpret the instrument

Report cap stops, elected stops, accepted outcomes, cost and incomplete cleanup by
workload and denominator. Frequent cap stops may indicate difficult tasks, excessive
fan-out, slow dependencies, weak stopping instructions or an undersized allowance.
Investigate before raising limits.

A cap that never fires in ordinary runs can be a functioning backstop. Exercise it
with a deliberately non-terminating fixture to verify enforcement; do not increase
spend merely to make the cap bind. A simple deterministic loop may need only its
enforced limit, without adding a second model-facing allowance.

## Acceptance

Use finite scripted workers to exercise early success, exhausted allowance, ignored
soft limits, slow child calls and cancellation races. Confirm no admission exceeds
the counted resource bound and that every stop reports acceptance honestly. Model
behavioral improvements require a separate comparison on representative tasks.
