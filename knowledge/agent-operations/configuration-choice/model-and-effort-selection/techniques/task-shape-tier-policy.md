---
layer: technique
type: technique
subject: model-and-effort-selection
technique: task-shape-tier-policy
status: draft
laws: [a-ceiling-is-a-measurement-boundary]
shared_with: []
use_when: [writing a fleet-wide policy for which tasks get which tier, setting ceilings per task kind, explaining a configuration choice to someone who wants the strongest model everywhere]
---

# Task-shape tier policy

The concern: per-task configuration decisions do not scale — a fleet with dozens of
recurring tasks cannot re-derive a recommendation for each one, and will default to "the
strongest configuration everywhere", which is the expensive answer and, for writing tasks,
the risky one. A policy keyed to the *shape* of the task gives a defensible default before
any measurement exists, and tells the operator which tasks are worth measuring properly.

## The shapes

- **Report** — reads the repository, produces a verdict or a document, changes nothing.
  Failure costs a reread when a reader can spot it, and a longer-reasoning run is likelier
  to fabricate confidently. Thoroughness is cheap in side effects, but it is not free in
  accuracy. A run's length alone is not evidence that it is stuck. Longer runs fail
  more often mainly because harder tasks run longer, and in one large study the relation
  reversed once difficulty was controlled. Read a long run against the same task's own
  earlier runs.
- **Repair** — makes a bounded, reviewable change: a fix with its test, a documentation
  correction. Failure costs a review cycle. The tier earns its keep where the repository is
  large enough that finding the right call sites is the hard part.
- **Sweep** — acts on everything it finds: an inventory, a bulk update, a scan that writes
  notes per subject. Volume scales with thoroughness, so both value *and* damage scale with
  the tier. This is the shape to measure before trusting.
- **Custodial** — changes the repository's own rules or shared state: guidance files,
  indexes, generated artifacts other tasks depend on. Failure is quiet and propagates.
  Prefer the configuration that preserves existing content over the one that rewrites best.

## The policy

| Shape | Default tier | Ceiling posture | What must be measured before raising the tier |
|---|---|---|---|
| Report | mid | Short, as a cost cap; a run past it is reported as having hit it, and read against the same task's own history | Whether the higher tier changes the verdict at all, and how many of its claims survive a check |
| Repair | mid to high | Generous enough for a full test cycle | Whether the change still lands inside the repository's checks |
| Sweep | lowest that produces the artifact | Generous, but a hit ceiling is a failed run | Blast radius per tier, before quality |
| Custodial | lowest that produces the artifact | Short | Content preserved from the file it replaced |

## Decision rules

- **Ceilings are part of the policy, not an afterthought.** Every shape gets a wall-clock
  ceiling chosen from its own distribution of honest runs, and a run that hits it is
  reported as having hit it — never as a finished run that scored badly.
- **A ceiling that bites once in a population is a ceiling; one that bites repeatedly is a
  measurement error** — either the shape was misclassified or the task is unbounded and
  needs splitting.
- **The policy names a default, not a mandate.** A task with a measured recommendation uses
  the measurement; the policy governs the long tail that will never be measured.
- **Review the policy when the fleet's engines change.** Tier labels are vendor-local and
  their meaning drifts between generations; the shapes do not drift, which is why the
  policy is keyed to them.
- **A tier is a (model, effort) pair, resolved per model.** "Mid" names a position in the
  policy, not a level. Levels and defaults are specific to each model: a level that exists
  on one model is rejected on another, and one vendor's advice for the same task flipped
  from "start at the second-highest level" to "use low and medium liberally where your
  evaluations hold" within a year of releases in one family.
  Keep a per-model mapping from policy positions to levels, and re-derive it when a model
  arrives.
- **Shape applies per role inside a task, not only per task.** A task that diagnoses
  and then edits is a report followed by a repair or a sweep. Harnesses now expose
  separate settings for the planning phase and for spawned helpers, and vendors document
  a strong planner with cheaper executors. Set each role from its own shape. Pin the
  helpers explicitly: they do not follow the parent, and their defaults move
  ([pin-the-resolved-configuration](pin-the-resolved-configuration.md)).
