---
layer: golden-path
type: golden-path
subject: unattended-run-isolation
status: draft
use_when: [running agents against real repositories without supervision, deciding what an agent run may reach, containing the blast radius of a bad run, sharing expensive state between runs safely]
techniques:
  - disposable-run-environments
  - no-links-into-live-trees
  - confine-configured-output-paths
  - os-enforced-run-boundary
  - hermetic-inherited-configuration
  - diff-from-the-recorded-base
---

# Unattended run isolation

An unattended agent run is a process with a shell, credentials, and an instruction to
change things. Isolation is what decides whether its worst plausible mistake costs a
throwaway directory or someone's working tree. The design target is simple to state and
easy to erode: **a bad run should cost nothing that is not reproducible in minutes.**

Erosion happens for good reasons. Dependency installs are slow, so a run borrows the real
project's dependency directory. Compilation is slow, so runs share a build cache.
Configuration is fiddly, so the runner inherits the operator's own settings. Each shortcut
is defensible alone, and together they reconnect the disposable environment to the live one
— usually invisibly, because the link is in a path nobody reads at runtime.

## What isolation must cover

- **The repository.** Each run gets its own checkout at a pinned revision. Remove the
  remote, but do not mistake that for the guarantee: a push can name a URL instead of a
  remote, and a stored credential answers for the host, not the repository. **A run cannot
  publish when it holds no write credential and has no egress to the destination.** Without
  a remote, it merely cannot publish by accident.
- **Dependencies and build output.** Either per-run, or a genuinely read-only shared cache.
  A writable shared cache is a channel between runs: one run's artefacts become another's
  inputs, which spoils measurement and can corrupt a real tree.
- **Configured output paths.** Tasks and their overlays name destinations — a vault, a
  notes directory, an export path — and those can be absolute, pointing outside the run.
  Every configured destination is rewritten to sit inside the run's own environment before
  the agent starts.
- **Inherited configuration.** The operator's settings, hooks, plugins and tool servers do
  not load, and neither do the repository's own agent hooks and tool servers when the run is
  headless. The same holds for version control's global and system configuration, and for
  variables a parent process exported. They change what the agent can do, they differ between
  engines, and they turn a benchmark into a measurement of one desktop. An empty working
  directory cuts none of the user-level layers; see hermetic-inherited-configuration.
- **Credentials.** Only what the task needs. They live in more places than the environment:
  files under the home directory, the operating system's keyring, the credential helper
  version control is configured with, and agent sockets. Strip the environment by allowlist,
  deny reads of credential files, and where the run needs a credential, keep it outside the
  run behind a proxy that holds it.

## Arrangement is not enforcement

Everything above is arranged: a remote removed, a path rewritten, a variable dropped. A
process with a shell, running as the operator, can undo or step around any of it. Only a
boundary the operating system enforces makes the list hold. That means writes confined to
the run's own directory, and egress denied by default. **The two come together or not at
all.** Confined writes with open egress still let a run send away what it can read. Open
writes with closed egress let it change the configuration that governs its network.

Such a boundary is platform-bound, and a fleet has to know where it has one. Where the
platform provides none, the boundary is a container, a virtual machine or a separate user
account. Otherwise the run is recorded as unenforced, never as isolated. See
os-enforced-run-boundary.

## Shared state is the recurring failure

The fastest way to break isolation is to save time. Two rules keep it survivable:

1. **A link into a live tree is not a cache** — it is write access to something a person is
   using, and any tool the run invokes may rewrite it.
2. **A shared cache is per-purpose and per-writer.** Runs may share a download cache whose
   entries are verified on read. They must not share a build output directory, because the
   artefacts there are executed. An artefact from a sibling run, executed during
   verification, is a fault that looks exactly like a model defect. A package cache that
   also stores built wheels is a build output directory under another name.

## Blast radius does not end at the run

Isolation contains the run; the landing step contains the fleet. A change that leaves the
disposable environment does so through a reviewed, mechanical gate: it does not land if it
overrides the repository's declared rules, breaks its checks, or violates a structural law
the repository states. The gate is not a formality — it is the last place a confident,
wrong change is stopped, and it must be enforced by a tool rather than by whoever is
reading the log.

## Isolation is a claim to be tested

Isolation is assumed until something proves otherwise, and what proves otherwise is usually
an incident. Test it deliberately, before the queue starts:
- Run a known-bad action that must fail: a write outside the run, a request to a host
  that is not allowed.
- Run a known-good action that must succeed.
- Read what the run actually loaded from the runner's own report, not from the harness's
  description of itself.

During and after the run, audit what each environment points at and watch for writes
outside the expected paths. Treat "a run touched something live" as a first-class incident
with a written record: what was reached, what was changed, whether it is recoverable, and
what now prevents it.
