---
layer: technique
type: technique
subject: runner-fleet
technique: ephemeral-versus-warm-runners
status: forged
stage: team
laws: [creation-names-reaper, gate-sees-target]
shared_with: []
use_when: [a build passes on one machine and fails on another, choosing how runners are provisioned, deciding what may persist between jobs]
---

# Ephemeral versus warm runners

A runner either starts each job from a known-clean state or reuses what the last job left. The
trade is real: clean is reproducible and slow to start, warm is fast and carries history. There
is no universally correct answer, and the failure is not choosing wrong — it is **not choosing**,
then spending two days on a machine-dependent failure without the vocabulary to describe it.

## The two models

**Ephemeral.** A fresh environment per job, destroyed afterwards. Every job sees identical
starting conditions, so a failure is a property of the code rather than of the machine. Cost:
the environment is created every time, so cold-start latency and the price of provisioning are
paid per job.

**Warm.** A long-lived runner taking job after job. Toolchains are installed, dependency caches
are populated, checkouts are incremental. Cost: everything the previous job left is your
starting condition, including things nobody intended to leave.

## Default to ephemeral, and know why

Not because warm is bad, but because contamination failures are expensive to diagnose and cheap
to prevent, and the diagnosis cost is the part people underestimate. The characteristic
contamination failure looks like this: it fails intermittently, it fails only on some machines,
it stops failing when you look at it, and it makes an experienced engineer doubt the code. Two
days of that is worth a lot of cold starts.

Per [gate-sees-target](../../../../_laws.md#gate-sees-target), a warm runner also weakens what a
green result proves. A build that passes because a file left by an earlier job happened to be
present has verified a configuration nobody will ever ship. The check observed the machine, not
the change.

There is a second argument that has nothing to do with correctness: a warm runner is a
persistence mechanism. Anything an attacker leaves survives to the next job, and the next
repository. An ephemeral runner discards it on a fixed schedule without anyone deciding to.

## Where warm is right

Warm earns its place where the environment is genuinely expensive and the persistence is
genuinely bounded:

- Large toolchains that take minutes to install.
- Build systems whose incrementality is the entire point, and whose state is content-addressed
  rather than time-dependent.
- Platform-constrained fleets where clean provisioning is slow or expensive enough to dominate.

Choosing warm means taking on an obligation, per
[creation-names-reaper](../../../../_laws.md#creation-names-reaper): **enumerate what may
persist, and reap everything else.**

- A written list of what is allowed to survive a job, kept with the runner's provisioning.
- Everything not on the list removed between jobs — checkouts, temporary directories,
  environment leftovers, background processes the job started and did not stop.
- Nothing credential-shaped ever on the list.
- A maximum lifetime, after which the runner is replaced regardless of health. Without it, warm
  runners live indefinitely and drift apart from each other until "which runner did it land on"
  becomes a real diagnostic question.

## The middle grounds

- **Ephemeral job environment, warm host.** The host persists and provides a cache mount; each
  job runs in a fresh environment. Most of the isolation, most of the speed. Usually the right
  answer, and the reason to prefer it over full warm is that the persistence surface is *one
  declared mount* rather than a whole filesystem.
- **Warm runner, clean workspace.** The machine persists, the working directory is recreated per
  job. Cheap to adopt and it closes the most common contamination path, while leaving the
  machine-level ones open.
- **Pre-baked images.** The environment is built once into an image and started fresh per job.
  Ephemeral behaviour with warm-like start times. The cost moves to image maintenance, which is
  a real ongoing task and a much more reviewable one than accumulated machine state.

## Diagnosing contamination

When a failure is suspected to be machine state, the ladder is short:

1. **Does it reproduce on a fresh environment?** If not, it is state, and the question is which.
2. **Does it reproduce on a different runner of the same pool?** If not, the runners have
   drifted from each other, which is a provisioning defect rather than a job defect.
3. **What did the previous job on that runner do?** This requires knowing which job that was —
   which is a reason to record job-to-runner assignment even in a fleet that otherwise does not
   need it.

The fix is almost never to make the job defensive against the leftover. It is to stop the
leftover from surviving.

## Decision rules

- Choose the model explicitly, per pool, and write down which you chose.
- Default to ephemeral; the diagnosis cost of contamination exceeds the latency cost of clean
  starts more often than people estimate.
- Production-reaching pools are ephemeral without exception.
- Choosing warm means an enumerated persistence list, everything else reaped between jobs, no
  credentials on the list, and a maximum runner lifetime.
- Prefer ephemeral-environment-on-warm-host over full warm; the persistence surface is one
  declared mount instead of a filesystem.
- Record job-to-runner assignment, so "what ran here before" is answerable.
- Fix contamination by stopping the leftover, not by making jobs tolerate it.
