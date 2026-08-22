---
layer: technique
type: technique
subject: ci-execution-trust
technique: untrusted-contribution-lanes
status: forged
stage: team
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [a repository accepts changes from outside the deploying team, opening a project to contributors, a build interpolates data from a change request]
---

# Untrusted contribution lanes

A proposed change carries its own build definition. So the moment a repository accepts changes
from anyone who cannot already deploy it, submitting a change becomes a way to submit code for
execution with whatever the build holds. This is not a subtle attack requiring a clever
adversary — it is the mechanism working as designed, pointed at a population it was not
designed for.

The answer is two lanes with different capabilities, never one lane with a condition.

## Two lanes

**The untrusted lane** runs on proposals from outside the trusted set. It verifies: builds,
tests, lints, reports. It holds nothing worth stealing — no publishing credential, no
deployment reach, no write access to any shared cache or artifact store, no network path to
anything the organization cares about. Its output is a verdict, and the verdict is the only
thing that leaves it.

**The trusted lane** holds what it needs and runs only on instructions that originated inside
the trusted set: the protected branch after merge, a tag, an explicitly approved run.

## Why not one lane with a condition

Because per [gate-sees-target](../../../../_laws.md#gate-sees-target), the condition is
evaluated by the system being attacked, using inputs the attacker influences, in a file the
attacker's change can edit. Every part of that sentence is a defect:

- The condition lives in the build definition, which the proposal contains and can change.
- It reads attributes of the proposal, which the proposer controls.
- It is one expression, and a single mistake in it collapses the whole separation silently.

Two lanes with genuinely different capability grants cannot be collapsed by editing a
condition, because the capability was never in the definition — it was in what the lane was
issued.

## Verify the untrusted lane is actually empty

Per [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success), a lane that is
*supposed* to hold no credentials is a claim, and until something checks it, it is only a
claim. Credentials accumulate: a shared configuration adds one, a machine-tier hook exports
one, a cache token turns out to be writable, a runner is reused from the other lane.

Check it, on a schedule and after any change to the shared configuration:

- Run a job in the untrusted lane that dumps what it can reach and inspect the result.
- Confirm from the network side, not the job side, that the segment cannot reach production
  services. A job asking itself what it can reach is the wrong instrument.
- Confirm the runners are not shared with the trusted lane, including through a cache, a
  daemon socket, or a leftover checkout.

## Approving a run into the trusted lane

Sometimes an outside contribution genuinely needs the trusted lane — an integration test
against a real service, a build that needs a signing key. That is an approval, and it carries
the properties any approval does, plus one specific to this case:

**Approval binds to a revision, never to a person or a proposal.** Approving "this
contribution" and then having the contributor push another commit is the entire attack: the
approval was granted against reviewed content and spent on unreviewed content. The approval
names the exact revision it approves, and a new revision needs a new approval.

The approver's obligation is to have read what will execute, which is a larger surface than the
change's stated purpose — it includes the build definition, the lifecycle hooks, and any
extension references the change adds.

## Untrusted input is data, never code

Separate from the lane split, and it applies to the trusted lane too: text originating from
outside — titles, descriptions, branch names, author fields, comment bodies — is attacker-
controlled text. Interpolated into a shell command it becomes a shell command.

- **Pass it through a named variable**, never by string substitution into a command body. The
  variable indirection is the whole fix and it is one line.
- **Treat it as data at every layer it reaches**, including any place a machine-readable
  summary is assembled from it.
- **Assume anything printed is disclosed**, since logs are frequently public on open projects.

This one is worth stating loudly because it is not a lane problem and cannot be fixed by lane
design: it is the same defect in every templating system, and delivery definitions are
templating systems that emit shell.

## Before you have outside contributors

Nothing here costs anything to prepare and everything here is expensive to retrofit under
pressure. Before the first outside contribution:

- Know which of your credentials are reachable from a build at all.
- Know whether your lane split exists or whether it would need to be built.
- Use the variable indirection for change-derived text from the start; it is free.

## Decision rules

- Two lanes with different capability grants; never one lane switched by a condition.
- The untrusted lane holds no credential, no deployment reach, no shared write access, and no
  runner in common with the trusted lane.
- Verify the untrusted lane's emptiness on a schedule and after configuration changes, from the
  outside.
- An approval into the trusted lane binds to a revision; a new revision needs a new approval.
- The approver reads what will execute, including build definition and extension references.
- Change-derived text passes through a named variable, never string substitution into a command.
- Assume every log line is disclosed.
