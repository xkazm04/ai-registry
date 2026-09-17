---
layer: technique
type: technique
subject: agent-run-budgeting
technique: refusal-detection-and-requeue
status: draft
laws: [a-refusal-is-not-a-result, measure-the-tree-not-the-summary]
shared_with: []
use_when: [a provider returns a limit or capacity message mid-queue, writing the runner that records agent runs, auditing stored results for runs that never happened]
---

# Refusal detection and requeue

The concern: a provider refusal is not an agent result, but it arrives through the same
channel as one and is trivially mistaken for a fast, empty run. Stored, it becomes a
zero-output data point attributed to a model — and because such runs are cheap, a single
exhausted window can manufacture dozens in minutes. **The detector must read the refusal
wherever the runner puts it, and the handler must requeue rather than record.**

## Detecting

- **Never trust the status field alone.** A refusal can arrive as a non-zero exit, as an
  error envelope whose category says nothing useful, or as a *success-shaped* envelope
  whose body carries the message. A detector keyed only to the status misses the last one
  entirely.
- **Match on the message text**, across the vocabulary providers actually use: usage limit,
  session limit, rate limit, quota, at capacity, overloaded, server busy, temporarily
  unavailable — and carry the text into the run's error field so the handler and the log
  both see it.
- **Treat suspiciously fast runs as suspects.** A run that returns in seconds with no
  tokens and no output is either a refusal or a crash; both are requeued, never scored.
  A duration floor per task shape is a cheap backstop for refusal wording nobody has seen.
- **Distinguish the two families of refusal.** *Capacity* ("busy, try again") recovers in
  minutes; *allowance* ("limit reached, resets at T") recovers at a stated time. They get
  different pauses, and the provider usually names T — use it rather than guessing.

## Requeueing

1. **Discard the artefact.** Delete the partial record so nothing downstream can mistake it
   for a result; keep the raw output aside if the refusal wording is new, because that is
   how the detector's vocabulary grows.
2. **Pause the whole queue**, not just the failed cell. A refusal is a property of the seat;
   the next cell will hit it too, and a queue that keeps trying converts one refusal into a
   hundred log lines.
3. **Requeue the cell** for the next pass, and make a pass boundary exist — a queue that
   only ever runs each cell once loses every refused cell permanently.
4. **Audit afterwards.** Scan stored results for refusal vocabulary and near-zero durations
   before trusting any aggregate; a detector added after a window closed does not
   retroactively clean the record it failed to catch.

## Decision rules

- **A refused cell is never reported as a failed cell.** In coverage tables it is *missing*,
  which is honest and visibly incomplete, rather than *zero*, which is a lie that averages.
- **Do not raise parallelism to beat an allowance limit.** Concurrency spends the same
  window faster; it converts a slow queue into an exhausted seat.
- **Record the reset time in the log, not just the pause.** An operator reading the log
  needs to know whether the fleet resumes in ten minutes or in five days — those are
  different decisions about what else to run.
