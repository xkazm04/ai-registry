---
layer: technique
type: technique
subject: unattended-run-isolation
technique: os-enforced-run-boundary
status: draft
laws: [the-harness-is-a-suspect-in-every-red, measure-the-tree-not-the-summary]
shared_with: []
use_when: [deciding whether a run environment is isolated or only arranged, granting an unattended run a shell and network access, choosing a runner platform for unattended work, a run reached something its environment was built to keep out]
---

# OS-enforced run boundary

The concern: the other isolation measures build an environment in which nothing *points*
outside it. A private checkout, a removed remote, rewritten destinations and a stripped
environment are all arrangements. None of them *stops* a process from reaching outside. A
run with a shell, running as the operator's user, can add back a remote and push by URL
through a credential helper. It can write to an absolute path, or read a key file the
environment never mentioned. **Only a boundary the operating system enforces turns the
arrangement into a guarantee.** It has two halves: writes confined to the run, and egress
denied by default.

## The procedure

1. **Run the agent's commands inside an enforced boundary.** Use the platform's sandbox, a
   container, a virtual machine, or a separate low-privilege user account. The operator's
   own account reaches the operator's home directory and keyring by construction.
2. **Confine writes.** Allow the run directory and a per-run temporary directory. Mount or
   deny everything else, and treat a link out of the run as outside: it is checked at its
   resolved target.
3. **Deny egress by default.** Allow only the hosts the task needs, such as the package
   registry and the model endpoint, and name each with a reason.
4. **Keep credentials outside the boundary.** Where the run must authenticate, route it
   through a proxy that holds the credential and scopes what it may do. For example, the
   proxy pushes only to the run's own branch. Deny reads of credential files the platform
   leaves readable.
5. **Close the fallbacks.** Refuse to start when the boundary cannot be established, rather
   than running unconfined with a warning. Disable any per-command escape to unconfined
   execution.
6. **Prove it before the queue starts.** Run one known-bad action of each kind and require
   each to fail: a write outside the run, a request to a host that is not allowed, a push.
   Run one known-good action and require it to succeed. A probe that only ever sees failures
   cannot tell a boundary from a broken network.

## What the boundary does not cover

- **The runner's own file tools.** An agent runner may apply its permission rules to its
  built-in read, edit and write tools and apply the operating-system boundary only to the
  commands it spawns. Check which of the two covers each tool, and confine output paths
  anyway.
- **A shared repository directory.** When runs are worktrees of one repository, a sandbox
  that lets them commit must let them write the repository's shared metadata. One vendor's
  sandbox denies the hooks and configuration there and still allows the references, so
  branch and tag damage crosses the boundary. A clone with its own references does not
  have this gap.
- **Whatever egress remains.** An allowed host is a channel. A broad entry such as a whole
  code-hosting domain is open egress for anything the run can read.
- **What a mount exposes.** A container with the operator's home mounted, or a socket that
  controls the container host, is the operator's machine with extra steps.

## Decision rules

- **Filesystem and network confinement come together or not at all.** Either half alone
  leaves a path through the other.
- **Where the platform provides no boundary, record the run as unenforced**, never as
  isolated. A fleet that runs where its runner's sandbox is not supported owes a container,
  a virtual machine or a separate account. Until then its isolation is a list of
  conventions, however careful.
- **A probe that succeeds stops the queue.** One write that should have been refused is
  the incident, found early.
- **Open egress per task, never per fleet.** A host allowed for one task's install step is
  not allowed for the next task's run.
