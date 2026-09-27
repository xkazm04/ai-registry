---
layer: application
type: application
subject: unattended-run-isolation
technique: os-enforced-run-boundary
stack: process
status: forged
verified_on: 2026-09-27
applied: simulation
ab_verdict: better
---

# Process: four fleet incidents walked under an enforced boundary

The fleet's unattended runs execute on a desktop operating system where its agent runner's
sandbox is not supported natively. It is supported only inside a Linux subsystem. Every
isolation measure in the fleet is therefore an arrangement, and this is a simulation, not a
code change. It walks four incidents that happened under the arranged measures through the
two policies:
- **A:** a private checkout, links, rewritten paths and a stripped environment, as run;
- **B:** writes confined to the run and egress denied by default, enforced by the
  operating system.

## The probe first, on the fleet's own machine

Before the simulation, the technique's first known-bad probe was run on 2026-09-27, read
access only. It used an empty repository with no remote at all:

- **Listing a private repository on the forge by URL succeeded** (exit 0). The credential
  came from the helper configured in the version-control system's system-level
  configuration.
- **With the helper reset on the command line**, the same listing was refused (exit 128).
- **A public repository**, listed as a network control, succeeded (exit 0). So the refusal
  was the missing credential, not the network.

Removing the remote removed nothing the run needed in order to reach the forge. A push was
not attempted.

The fleet's dispatched research runs work in linked worktrees of the registry. One of
them read its remote from the primary checkout's own configuration file. Removing the
remote there, as the arranged policy prescribes, would have removed the operator's remote.

## The four incidents

| Incident | A, as it happened | B, predicted |
| --- | --- | --- |
| A continuous-integration task installed dependencies through a link into a real project, leaving 3 entries where there had been hundreds (2026-09-15) | not prevented; found by the run reporting its own boundary | refused: the link resolves outside the writable root |
| Three builds wrote about 2,400 files through a link into a real build directory and spoiled two later gates (2026-09-16) | not prevented; found through two false reds | refused, same reason |
| A task wrote four files into the owner's personal notes vault through an absolute destination in its configuration (2026-09-15) | not prevented; found afterwards | refused: outside the writable root |
| Test fixtures inherited a repository path from a pre-push hook and rewrote a real repository's configuration, identity and branches (found 2026-09-19) | not prevented; found weeks later | configuration and identity writes refused; **branch writes allowed** |

Under B, all four are stopped or narrowed at the first write. Under A, all four were found
after the damage.

## The condition gained

The fourth row is not a clean catch. A vendor sandbox that lets worktree runs commit must
allow writes to the repository's shared metadata. The one read here denies the hooks
directory and the configuration, and still allows the references. Fixture branches and a
moved branch would have crossed the boundary, and a push would have crossed it too wherever
the forge was an allowed host. The technique now carries this under "what the boundary does
not cover", and the disposable-environment technique names a clone with its own references
as the construction that closes it.

**Falsifier:** an incident whose write target sat inside the run's writable root, or went
through a runner's built-in file tool that the boundary does not govern.

**Return to code mode** when a fleet runner moves into a container, a virtual machine, the
Linux subsystem, or a separate user account. The first move there is the known-bad probe.
