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

- **The repository.** Each run gets its own checkout at a pinned revision, with no remote
  it can push to. A run that cannot reach the origin cannot publish a mistake.
- **Dependencies and build output.** Either per-run, or a genuinely read-only shared cache.
  A writable shared cache is a channel between runs: one run's artefacts become another's
  inputs, which spoils measurement and can corrupt a real tree.
- **Configured output paths.** Tasks and their overlays name destinations — a vault, a
  notes directory, an export path — and those can be absolute, pointing outside the run.
  Every configured destination is rewritten to sit inside the run's own environment before
  the agent starts.
- **The operator's own configuration.** Personal settings, hooks, plugins and tool servers
  do not load. They change what the agent can do, they differ between engines, and they
  turn a benchmark into a measurement of one desktop.
- **Credentials.** Only what the task needs. Keys for unrelated services are removed from
  the environment rather than trusted to go unused.

## Shared state is the recurring failure

The fastest way to break isolation is to save time. Two rules keep it survivable:

1. **A link into a live tree is not a cache** — it is write access to something a person is
   using, and any tool the run invokes may rewrite it.
2. **A shared cache is per-purpose and per-writer.** Runs may share a read-mostly package
   cache; they must not share a build output directory, because the artefacts there are
   executed, and an artefact from a sibling run executed during verification is a fault that
   looks exactly like a model defect.

## Blast radius does not end at the run

Isolation contains the run; the landing step contains the fleet. A change that leaves the
disposable environment does so through a reviewed, mechanical gate: it does not land if it
overrides the repository's declared rules, breaks its checks, or violates a structural law
the repository states. The gate is not a formality — it is the last place a confident,
wrong change is stopped, and it must be enforced by a tool rather than by whoever is
reading the log.

## Isolation is a claim to be tested

Isolation is assumed until something proves otherwise, and what proves otherwise is usually
an incident. Test it deliberately: audit what each run's environment actually points at,
watch for writes outside the expected paths, and treat "a run touched something live" as a
first-class incident with a written record — what was reached, what was changed, whether it
is recoverable, and what now prevents it.
