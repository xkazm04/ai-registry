---
layer: technique
type: technique
subject: agent-run-budgeting
technique: ceiling-as-measurement-boundary
status: draft
laws: [a-ceiling-is-a-measurement-boundary]
shared_with: []
use_when: [choosing a wall-clock ceiling for a task shape, reporting a run that hit its ceiling, interpreting durations from hosts that sleep or throttle]
---

# Ceiling as measurement boundary

The concern: a ceiling is usually treated as an operational safeguard — something that
stops a stuck run — and then quietly treated as invisible when results are read. It is not
invisible. A ceiling truncates the population being measured, and a run that hit one is a
different kind of object from a run that finished. **Choose the ceiling from data, report
every run that hit it, and never let a truncated run be scored as a finished one.**

## Choosing the ceiling

- **From the distribution, per task shape.** Collect honest completion times for the shape
  and place the ceiling well above the tail — far enough that hitting it is evidence of a
  stuck run rather than a thorough one. A ceiling inside the normal range silently selects
  for fast, shallow work and then reports it as the population.
- **Uniform across configurations.** Every model and tier of a comparison gets the same
  ceiling, or the comparison measures the ceiling. When a tier routinely approaches it,
  that is a finding about the tier's cost, not a reason to give that tier more room.
- **Revisited when the shape changes.** A task that grows a new step outgrows its ceiling,
  and the first symptom is a cluster of truncations that look like model regressions.

## Reporting

- A truncated run is **reported as truncated**, in the same place as its outcome, and is
  excluded from "finished" statistics. Whatever it produced may still be inspected — it
  can be substantial — but it never competes with runs that were allowed to finish.
- **One truncation in a population is a ceiling doing its job; a cluster is a measurement
  error.** Investigate the cluster before publishing anything from that population.
- **Durations are reported with their integrity**, not just their value: a duration
  recorded across a host suspension measures nothing and must be labelled rather than
  averaged.

## Host-clock hazards

A wall-clock ceiling assumes the clock advances only while the run does. Two failure modes
follow when the host sleeps, hibernates or is paused:

1. **Inflated duration.** The run completed normally but reports hours it did not spend.
   Detect it as a duration exceeding the ceiling with no truncation flag — impossible when
   the clock is honest, since the ceiling is what enforces the bound — and mark such
   durations unusable rather than deleting the run.
2. **Premature kill.** The timer fires the moment the host wakes and ends work that was
   never given its time. This produces a truncated run whose truncation is a host artefact;
   it is requeued, not scored, because the alternative is publishing a zero-output result
   for a model that was asleep.

Both are cheap to detect afterwards and impossible to reconstruct later from a score alone,
which is why the check belongs in the reporting path rather than in an operator's memory.
