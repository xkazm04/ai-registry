---
layer: technique
type: technique
subject: perf-regression-gating
technique: allocation-gate-on-the-shipped-configuration
status: forged
laws: [an-instrument-proves-it-had-input, unmeasured-is-not-a-pass, a-budget-shapes-the-output]
shared_with: []
use_when: [holding a fixed simulation step allocation-free as optimisations land, an allocation test passes and the device still collects garbage during play, deciding what scenario a per-step allocation test runs]
---

# Allocation gate on the shipped configuration

The concern: on a managed runtime, a simulation step that allocates feeds a collector whose pause
lands on some later, unrelated frame, and the defect is decoupled in time from its cause. The
gameplay-patterns subject states the discipline an author follows to keep a step from allocating.
This technique is the gate that keeps it true while other changes land — and the gate has two
classic ways of proving nothing. It runs a scenario that does not exercise the code that allocates,
and it runs on a runtime that removes allocations the device's runtime will not.

## Procedure

**1. Run the configuration that ships.** The scenario is a real level with the full participant
count, with the systems that actually run in play switched on — combat, abilities, opponents'
decision-making, contacts — not a test track with one car and nothing to hit. An allocation test on
a reduced scenario certifies the reduced scenario; the allocations live in the systems it left out.

**2. Warm up, then measure a long window.** Run enough steps for one-time initialisation, lazy
tables and first-use caches to settle, then count over thousands of steps. One-time cost is real
and belongs to the startup budget, not to the per-step gate.

**3. Count bytes on the stepping thread.** A per-thread allocated-bytes counter read before and after
the window measures what the step allocated, with no sampling and no dependence on when a collector
ran. A heap-size difference does not: it is moved by collections and by every other thread.

**4. Switch off the host runtime's allocation elimination.** An optimising compiler can prove that
an object never escapes its method and remove its allocation. The device's runtime does some of the
same, but not the same set: which allocations disappear depends on how much each compiler inlines,
and on whether the method had been compiled at all when it ran. A test that passes only because the
host's compiler was clever has hidden a per-step allocation that the device may pay. Run the gate
with that analysis disabled, so that it reports what the code allocates rather than what one
compiler on one run happened to remove — and run it that way by default, in the task the pipeline
calls, not in a side configuration somebody remembers to apply.

**5. Prove the scenario happened.** Beside the byte count, the gate reports what it ran: steps,
participants, contacts resolved, shots fired, abilities triggered. A window in which no contact
occurred cannot vouch for the contact solver, and a zero from such a window is a measurement taken
over an empty set ([an-instrument-proves-it-had-input](../../../_laws.md#an-instrument-proves-it-had-input)).

**6. Set the threshold small and non-zero, and say why.** A few kilobytes over thousands of steps
admits rare bookkeeping — a list that grows once to its working size — and fails the moment
something allocates per step, because per-step allocation multiplied by thousands of steps is never
a few kilobytes. State the threshold as bytes over the stated number of steps, never as a bare
number.

**7. Keep the failed run.** When the gate fails on a build that a previous run passed — typically
because the compiler stopped eliminating something — the failing log is kept with the fix, so the
history shows that the passing run was luck, not proof.

## Decision rules

- **When the only allocation test runs a reduced scenario, the shipped step is unmeasured.** Say so;
  do not cite the reduced test as coverage ([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)).
- **When a test passes with the host's allocation elimination on and fails with it off, the code
  allocates.** Fix the code; the device does not run the host's compiler.
- **When a new system joins the step, it joins the gate's scenario in the same change.** A gate that
  does not run the new system is not guarding it.
- **When the gate fails, the per-step budget is the target, not the threshold.** Raising the
  threshold to absorb a new allocation converts the gate into a recorder of the current state
  ([a-budget-shapes-the-output](../../../_laws.md#a-budget-shapes-the-output)).
- **When the render thread is the concern, gate it separately.** Its allocation is measured over a
  frame and depends on what is drawn; it needs its own scenario and its own window, and a passing
  simulation gate says nothing about it.

## When not to use

Not on an unmanaged runtime without a collector, where the concern is fragmentation and the
instrument is the allocator's own statistics. Not on cold paths — loading, menus, saving — where
allocation is expected and the startup budget governs. And not as a substitute for a device run: an
allocation-free step on the host is a necessary condition for no collection pauses from the step on
the device, not a proof that the device has none.
