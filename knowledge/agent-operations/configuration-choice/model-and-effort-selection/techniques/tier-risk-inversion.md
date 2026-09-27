---
layer: technique
type: technique
subject: model-and-effort-selection
technique: tier-risk-inversion
status: draft
laws: [the-repository-outranks-the-instruction, measure-the-tree-not-the-summary]
shared_with: []
use_when: [choosing a tier for a task that commits or deletes, assessing blast radius before raising reasoning, deciding the default tier for tasks that write to a repository]
---

# Tier risk inversion

The concern: raising the reasoning tier is assumed to be strictly safer — more thought,
fewer mistakes. For tasks that *change* a repository, the assumption inverts. Thoroughness
scales the execution of a decision, not the quality of the decision about whose rules win.
When a task's instruction tells a run to commit its output, and a repository has declared
that output private, a more thorough run finds more of it and commits more of it. **Where
the mistake is constant across tiers, the damage is proportional to the tier.**

The mistake is not always constant. In the measured case one decision held at every tier,
and only its volume grew. Elsewhere, the *rate* of a harmful choice moved with capability,
up in one vendor's newer models and down in another's. So the conservative reading is to
assume the volume grows with the tier, measure whether the rate does too, and never assume
the rate falls.

## How to recognise a tier-inverting task

- The task's procedure ends in an action that is hard to reverse for someone else: a
  commit, a push, a migration, a deletion, a published artifact — or it runs commands whose
  side effects nobody has enumerated.
- The task's own wording asserts a default that a repository may have overridden
  ("commit the output", "update the shared index", "install the dependency").
- The volume of the action is a function of how much the run found — a sweep, an
  inventory, a scan, a bulk rename.

Where all three hold, plot the damage, not the score, against the tier before choosing.

## The procedure

1. **Measure blast radius per tier as a first-class number**, beside quality: files
   changed, files committed against the repository's declared exclusions, irreversible
   actions attempted. These are mechanical facts, available without a judge.
2. **Check the direction of the trend.** Quality rising while blast radius rises faster is
   the inversion; it is easy to miss when only quality is plotted.
3. **Fix the instruction first** — the decision defect is in the wording, and no tier
   repairs it.
4. **Until the instruction is fixed, prefer the lowest tier that still produces the
   artifact**, and require the mechanical bar to include "overrode no declared exclusion".
   A tier chosen this way is not a compromise on quality; it is a cap on the size of a
   known-possible error.
5. **Never let a judged score override the mechanical bar here.** A reviewer shown a clean
   summary will rate a wide, confident, wrong action highly; the same reviewer shown the
   fact that the run overrode an exclusion rejects it. Both reactions are correct
   responses to what they were given, which is why the fact must be in front of them.

## Decision rules

- **A task that commits gets the lowest tier that clears the bar, not the highest that
  fits the budget.** State this as the fleet's default posture for writing tasks, and
  require an argument to depart from it.
- **A read-and-report task has its own inversion, in a different currency.** Its failure
  is a wrong sentence rather than a wrong commit, and longer reasoning produces more of
  them. Published measurements find accuracy falling as reasoning lengthens on tasks with
  distractors or misleading patterns. On knowledge-heavy questions, extra reasoning
  produced more attempted answers, more fabricated detail, and early wrong beliefs defended
  at length. A report is discarded only if a reader can tell it is wrong. So a report task
  spent at a high tier needs its claims checked against the tree, and the check grows with
  the tier. The tier is not free there.
- **"Read-only" is a property of the side effects, not of the label.** A report task still
  runs commands, and a more thorough run runs more of them. On this fleet, commands a
  reader assumed were inspections (a help flag, a listing flag) executed and rewrote
  shared files. Classify a task by what its commands can change, and where they can
  change anything, it is a writing task for this rule.
- **Where blast radius grows with the tier and the instruction cannot be fixed yet, add a
  mechanical stop** rather than trusting the model: refuse to land a change that touches
  what the repository excluded, and let the run report what it wanted to do.
- **Report the inversion when it is measured.** It is counter-intuitive enough that a fleet
  will re-derive it repeatedly unless the finding names the task shape, not just the model.
