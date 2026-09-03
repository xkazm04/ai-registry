---
layer: application
type: application
subject: agent-memory
technique: probe-without-write-back
stack: python
status: forged
verified_on: 2026-09-02
verified_against: python@3.10
---

# A benchmark harness that disables the memory writer for the measured epoch (OpenViking)

The technique says a scheduled measurement must not run through the production write
path, or the instrument entrenches the items it uses as ground truth. This tree's
task-completion harness for a self-improving bot applies the rule at epoch scale.

The bot natively commits each finished task's trajectory to memory as it goes. With
train and test splits running in parallel, a sibling run's write would leak into a
run mid-epoch, so the harness **always unregisters the memory-commit tool** for the
bot under test (`benchmark/tau2/vikingbot/README.md:197-199`) and states the property
it buys in the technique's own terms: "no run sees memory written by a sibling run
mid-experiment" (`:164-167`). Extraction runs only over the train split, between
epochs, with the test split held out (`:8-11`). The paired evidence harness makes the
same choice from the other side: its trajectory corpus is a pinned manifest
(`corpus_id: memory_v2_operation_family_v1_success_only`) that a run reads and never
appends to (`benchmark/tau2/llm/config/template_indexed_trajectory.yaml:18-28`).

The same design surfaces in the product's global switch: agent evolution — the loop
that turns trajectories into experience memories — defaults to off
(`docs/design/agent-evolution-global-switch-design.md:21-33`), so a deployment that
measures itself is not also training itself unless an operator said so.

## What the tree admits

Recovery batches replay from the triggering archive's snapshot, so changing the
evolution setting before a later recovery commit "can affect replayed messages from
earlier failed archives" (`agent-evolution-global-switch-design.md:59-63`) — the
switch is not perfectly epoch-aligned under failure. And the two task harnesses learn
in opposite directions — one trains on successes only, the other commits only wrong
trajectories after the first epoch (`benchmark/tau2/vikingbot/run_full_test.sh:83-86`)
— without the README saying which produced its published deltas.

## What this realization cannot do

The rule is applied to the *commit* tool, not to usage counters: whether the bot's
reads during a test epoch increment a recall-usage signal that later ranking reads is
not addressed in the harness. A reader copying the epoch discipline should check the
read path for the write the technique names first.
