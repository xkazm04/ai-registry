---
layer: technique
type: technique
subject: agent-benchmark-design
technique: null-and-reference-controls
status: draft
laws: [measure-the-tree-not-the-summary, the-harness-is-a-suspect-in-every-red]
shared_with: []
use_when: [adding a task or a check to a benchmark, trusting the first ranking over a new task set, a task every configuration passes or every configuration fails, deciding whether a universal failure is a hard task or a broken one]
---

# Null and reference controls

The concern: [eligibility-before-ranking](./eligibility-before-ranking.md) composes a
predicate and then trusts it to mean "did the job". Nothing in the predicate proves that,
and it can be wrong in two directions. It can be **passed without the work**: a rule that
forbids something is satisfied by an empty reply, and "the checks are as green as before"
is satisfied by a run that changed nothing the checks cover. And it can be **failed by
correct work**: a check that asserts one implementation, or an instruction too
underspecified for any reading to satisfy it. Both defects look like results. The first
reads as a configuration's score, the second as a hard task. The benchmark's own defect
signal, every configuration failing the same way, sees only the second kind, because a
task that is passable by doing nothing is passed by everyone and reads as nothing to see.
**Before a task's results count, run it against controls whose outcome is known: a run
that does nothing must fail, a known-good solution must pass, and one deliberate shortcut
must fail.**

## The three controls

- **The null run.** An arm that does nothing, an empty change or an abstaining answer, put
  through the same predicate as every configuration. On a task that requires work it must
  be ineligible. Each pass it earns is one of two things. Either the task's correct answer
  *is* nothing (a report that changes nothing, a question whose right answer is "not
  known"), and the task is labelled a restraint task. Or the check can be passed without
  the work, and that is a defect in the check.
- **The reference run.** A solution known to be correct, such as the fix the task was
  derived from or a run the owner inspected, put through the same predicate in the same
  harness the grid uses, not in its author's environment. It must pass. When it fails, the
  task or its check is defective, and no configuration's failure on that task is evidence
  about the configuration. A check written from one solution passes that solution by
  construction, so where the work admits more than one correct shape, a second, differently
  written correct solution is the control that catches a check asserting one
  implementation.
- **The shortcut run.** One scripted attempt to satisfy the predicate without doing the
  job: skip or loosen the failing check, special-case the tested input, write the required
  artefact with nothing behind it. It must fail. The predicate already forbids suppression;
  this control is what shows the predicate can see it. Agents do find these routes
  unprompted when a check allows them, so the control is not hypothetical.

The controls are cheap beside the grid. The null run costs nothing, the reference run
costs one run per task, and the shortcut is an edit. They run once per version of the task
and its check, not once per configuration.

## Reading what they return

- **Report restraint tasks apart from work tasks.** An aggregate that mixes them adds a
  floor that every quiet configuration earns for free. It can also hide two effects that
  run in opposite directions: a configuration can lead on the work and lose on restraint,
  and the aggregate shows only the net.
- **A null pass on a work task is a check defect, never a data point.** Fix the check so
  that it reads a rule against a reply that did the work, since an abstention shows no
  compliance with anything. Then re-derive every stored cell under the corrected check,
  per the recompute discipline in [comparable-cell-construction](./comparable-cell-construction.md).
- **A reference failure moves the task to the defect list, out of the ranking.** It joins
  the instruction defects the benchmark already owes its tasks.
- **Universal failure is a trigger for this audit, not its verdict.** A task that every
  configuration fails and the reference passes is hard; one the reference also fails, or
  whose check disagrees with its specification, is broken. The failure pattern alone
  cannot tell them apart, and the broken share has varied between published audits of such
  tasks from a small minority to a majority, so neither reading is a safe default.

## Decision rules

- **No task enters a ranking until its null run is ineligible on it**, or the task is
  labelled restraint and reported in its own column.
- **A task with no reference solution is provisional in the coverage sense.** Its failures
  cannot be attributed to a configuration, and the report says so beside them.
- **Re-run the controls when the task or the check changes.** Both defects belong to the
  pair, so a new check on an old task is a new, uncontrolled task.
- **Keep the controls in the table as rows.** Like ineligible runs, they show the reader
  the floor and the ceiling that every configuration's number sits between.
- **Audit a sample of eligible passes as well.** The controls prove the check can fail;
  they do not prove that every pass did the job. Where a check can pass work that
  differs from the reference, compare a sample of passes against the reference or put
  them in front of a reviewer. Read every anomalously high score first: an outlier pass
  is where a route around the check shows up, and whatever the reading finds is an
  undercount.

## When not to use it

- **A benchmark whose checks are the owner's production gates and whose question really
  is "does the run keep the repository healthy".** The null run passes by design there,
  and that is the right reading: the gate is a floor, not the job. The moment the same
  grid is read as "which configuration did the task", it needs a task-specific clause,
  and this audit is how to show the clause is there.
