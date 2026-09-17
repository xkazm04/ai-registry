---
layer: application
type: application
subject: unattended-run-isolation
technique: no-links-into-live-trees
stack: process
status: forged
verified_on: 2026-09-16
---

# Process: two incidents from linking run environments to real projects

A skill benchmark gave each run a private checkout, no remote and a stripped environment —
and linked two directories into the real projects to save install and build time: the
JavaScript dependency tree for two products, and one product's framework build directory.
Both links caused incidents within two days (2026-09-15/16).

## Incident one: dependencies rewritten under a live project

A task whose job is to run a repository's own continuous-integration steps did exactly
that, and those steps begin by installing dependencies. The install ran through the link.
The real project's dependency directory was recreated and left with **3 entries** where it
had held hundreds — local dependency state only, regenerable from the lockfile, with no
tracked file touched, but a real project on the operator's disk was left unusable until
reinstalled.

Both runs that hit it reported the boundary themselves; one stopped when its installer
reached outside the environment. The verdicts were the harness's doing, not the models':
one failed only because a build broke on the link it had been handed.

First fix: remove the link for that one task. That was too narrow — the next day's audit
found every environment for that project still linked, and its remaining tasks could
install too. Second fix: no links at all for that project, and the links removed from every
existing environment (links only, targets untouched).

## Incident two: a build wrote a live build directory, and spoiled a gate

The other product's environments kept a link to the real framework build directory. At the
top reasoning tier, three runs of a code-exploration task built the application to check
their work. Those builds wrote through the link: about **2,400 files** into the real
project's build directory, ending with a failed build left in place. The operator's
development server, running from that project since the afternoon, kept serving because it
uses a different subdirectory — which is luck, not design.

The measurement damage was worse than the disk damage. That product's type-check
configuration includes the generated route types living in the build directory, so two
later runs type-checked against types a sibling run had generated, went red, and were
scored as model failures until the environment was cleared. Both were re-gated.

Fix: the link removed from the configuration and from all 75 existing environments,
including three runs still in flight, which simply rebuilt locally. Total cost of the
economy this link was protecting: a few minutes of compilation per run.

## The rule this produced

Links are not caches. A per-run install costs disk and minutes; a link costs an incident
whose first symptom is an unattributable red gate — and the audit that finds it is much more
expensive than the install it saved.
