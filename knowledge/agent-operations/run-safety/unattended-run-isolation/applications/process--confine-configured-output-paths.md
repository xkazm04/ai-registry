---
layer: application
type: application
subject: unattended-run-isolation
technique: confine-configured-output-paths
stack: process
status: forged
verified_on: 2026-09-16
---

# Process: a benchmark run wrote into the owner's personal notes vault

Measured 2026-09-15. Every run in this benchmark had a private checkout, no reachable
remote and a stripped environment. One task still wrote four files into a real, personal
notes vault on the operator's disk — through its own configuration.

## How it happened

Tasks in this fleet carry a project overlay: a small configuration file, copied into the run
environment alongside the task, that tells the task where its output belongs. One product's
overlay named its destination as an **absolute path** into the owner's personal knowledge
vault, which is correct for that product on that machine and catastrophic once copied into
an unattended environment.

The run followed its configuration exactly. Nothing else was breached: the checkout was
private, the remote removed, the credentials stripped. The hole was a line in a file the
harness copied faithfully.

## The fix

Before the agent starts, the harness now rewrites every `vault:` destination in every
overlay it installs into the environment to a path *inside* that environment — one
task keeps its conventional dot-directory at the checkout root, others get a per-task
directory under the environment's configuration folder. The rewrite:

- applies to the copy in the run environment, never to the operator's source configuration;
- lands in the commit that installs the task, so it is part of the starting state and can
  never be confused with something the agent did;
- preserves each destination's role, so a task whose contract reads its own notes directory
  still finds one where it expects.

## What was not done, deliberately

The four files written into the personal vault were **left in place**, with an incident
record naming them and the run that produced them, for the owner to review and delete. They
are legitimate task output in an illegitimate location; deleting someone's files to tidy up
an incident is a second incident.

## The generalisable part

Every other isolation measure in this fleet governs what the run *can reach*. A configured
destination governs where it *intends to write*, and it defeats the others silently because
the run is behaving correctly. Any environment that copies configuration in must enumerate
its destination keys and confine every one — and re-enumerate whenever a new overlay
arrives, because a rewrite list that is not regenerated stops covering the newest task
first.
