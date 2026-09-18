---
layer: technique
type: technique
subject: unattended-run-isolation
technique: disposable-run-environments
status: draft
laws: [the-harness-is-a-suspect-in-every-red]
shared_with: []
use_when: [setting up where an unattended agent run executes, deciding what to keep after a run finishes, making a clean re-run cheap]
---

# Disposable run environments

The concern: an agent run needs a real repository to be useful and must not be able to
damage one. The resolution is a per-run environment that is cheap to create, cheap to
inspect afterwards, and expected to be destroyed — cheap enough that re-running a
suspicious cell in a clean environment is the default triage step rather than a project.

## Constructing one

- **A private checkout per run**, at the pinned revision, on its own branch. Share the
  object store with the source repository to keep creation fast, but keep the working tree
  and its metadata private to the run.
- **No reachable remote.** Remove it. An agent cannot publish what it cannot address, and
  this is more reliable than instructing it not to push.
- **A local identity** for the run's commits, so its authorship is unambiguous in review.
- **Deterministic text handling** — line-ending and encoding settings fixed per run — so
  the same change produces the same diff on every host.
- **The task's own material installed into the checkout** from a pinned source, and
  committed before the agent starts, so the starting revision is exactly what the agent
  will see and every later diff is the agent's work.

## Deciding what survives

After the run, keep what a verdict might need and drop what regenerates: keep the
repository state and history, the diffs, the artefacts the run wrote (including ones the
repository ignores, which no diff shows) and the check output; drop build output,
dependency trees, virtual environments and tool caches as soon as the run's facts are
computed.

That split matters at scale. Build output dominates: on one benchmark, clones of finished
runs held roughly 86 GB of regenerable build artefacts against a few gigabytes of state a
verdict actually needed. Trimming each environment as soon as its facts were stored kept the
working area flat instead of growing until the disk decided the matter.

## Decision rules

- **A run that cannot be re-created cannot be re-run**, and a cell that cannot be re-run
  cannot be attributed. Pin everything the environment depends on.
- **Destroy on a defined trigger** — facts computed, not "later". A cleanup that depends on
  someone remembering is a disk-full incident with a delay.
- **Keep an environment that produced an incident**, exactly as it stands, until the
  incident is understood. That is the one case where disposability waits.
- **Never let two runs share a working tree**, however similar their tasks. The cost of a
  second checkout is seconds; the cost of interleaved writes is an unattributable result.
