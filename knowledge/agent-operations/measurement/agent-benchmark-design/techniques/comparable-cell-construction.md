---
layer: technique
type: technique
subject: agent-benchmark-design
technique: comparable-cell-construction
status: draft
laws: [measure-the-tree-not-the-summary, the-harness-is-a-suspect-in-every-red]
shared_with: []
use_when: [setting up a configuration comparison, deciding what to pin before a benchmark runs, judging whether two results may be compared at all]
---

# Comparable cell construction

The concern: an agent benchmark has many more moving parts than the variable it intends to
measure — repository state, instruction wording, runner flags, environment, the
measurement code itself. Any of them drifting between cells silently redefines what is
being compared, and the result still looks like a table. **Pin everything but the
variable, and record what was pinned, so a later reader can tell whether two numbers may
be compared.**

## What to pin

- **The repository revision.** Every cell starts from the same commit of the same
  repository. A benchmark against a moving branch measures the branch.
- **The instruction text.** Byte-identical across engines. Naming both of the places
  different runners look for a task file, rather than tailoring per runner, keeps one
  ecosystem from having home advantage. Byte-identical pins the task's words, not
  neutrality: each engine's own harness, system prompt and tool set are still part of
  the cell, and sensitivity to wording differs between families. Record the engine's
  version as shipped among the pins, and treat the instruction as one sample of wording
  rather than a control.
- **Runner isolation.** Every engine runs without the operator's personal configuration —
  no user-level settings, hooks, plugins or tool servers — or every engine runs with it.
  Mixed, the comparison includes the operator's desktop.
- **Ceilings and retries.** The same wall-clock ceiling and the same retry policy per task
  shape, across configurations.
- **The environment the task sees.** Toolchain caches, dependency state and generated
  artefacts either exist for every cell or for none; a cache populated by one cell and read
  by the next makes the second cell a different experiment.
- **The resource envelope.** The memory and processor the run is guaranteed, and the
  separate threshold at which the host kills it, both declared. An agent's score moves
  with the resources its sandbox had, by amounts comparable to the gaps a grid is
  trying to read.
- **The measurement code.** The definition of "passed" is one version, applied to all
  cells — see the recompute discipline below.

## Recording what was pinned

The cell's stored record names the revision, the instruction, the configuration, the
ceilings and the harness version. This is what makes a result auditable a month later, and
it is also what lets a fleet detect the comparison it must not make: two cells whose
records differ in anything but the configuration are not a comparison, whatever the table
suggests.

**Check the pins where the comparison is printed; do not assert them.** Recording the pins
is half the rule. A tool that prints one row's pins under a sentence saying every row
shares them has turned the rule back into prose. That prose is wrong in exactly the case
the rule exists for, and nothing in the table shows it. Diff every pin except the variable
across all rows at print time. Name the rows that differ, and refuse to call the table a
comparison when any pin differs. A pin the record omits cannot be checked this way, so
"no difference found" covers only the pins the record actually names.

## Handling a mid-flight fix

A long benchmark will need its measurement corrected while it runs. Three rules keep that
survivable:

1. **Derive facts from stored artefacts**, so a corrected definition can be re-applied to
   cells that already ran instead of requiring them to be re-run. Re-applying a definition
   changes who scored the cell. From then on it was scored by the version that re-applied
   the definition, not the one that ran it, so stamp the scorer separately from the
   producer. A ladder re-scored piecemeal without that stamp cannot show afterwards that one
   definition scored every row, even when that is true.
2. **Re-run the cells the fix touches** where recomputation is impossible — for example
   when the fix changes what the run was allowed to see or do.
3. **Log the fix with its time and its effect**, so any result read later can be placed on
   the right side of it.

## Decision rules

- **A cell whose environment was spoiled by a sibling cell is void, not a data point.**
  Shared state is the likeliest source; clear it before attributing anything to a model.
- **Never compare across engines with different isolation.** Fix the isolation and re-run
  the cheaper side; the comparison is otherwise unpublishable.
- **Where a recommendation turns on a narrow margin, rerun a few of its cells under a
  paraphrase of the instruction.** A ranking that flips under paraphrase is reported as
  wording-sensitive, not as a finding about the engines.
- **A benchmark that cannot state its pins cannot state its conclusions.** If the pins were
  not recorded, the honest output is the raw artefacts and no table.
