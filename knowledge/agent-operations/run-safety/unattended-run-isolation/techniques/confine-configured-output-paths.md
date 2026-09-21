---
layer: technique
type: technique
subject: unattended-run-isolation
technique: confine-configured-output-paths
status: draft
laws: [the-harness-is-a-suspect-in-every-red, the-repository-outranks-the-instruction]
shared_with: []
use_when: [a task or overlay names where its output goes, installing task configuration into a run environment, auditing writes outside a run's directory]
---

# Confine configured output paths

The concern: tasks and their project overlays name destinations — a vault, a notes
directory, an export target, a scratch area — and a destination can be **absolute**. An
absolute path in a configuration file that a run environment copies faithfully is a hole
straight through every other isolation measure: the checkout is private, the remote is
removed, the credentials are stripped, and the run still writes into a real directory
because its configuration told it to.

This is easy to miss because the configuration is usually correct *for the machine it came
from*. It becomes dangerous only when copied into an unattended environment.

## The procedure

1. **Enumerate destination keys** in every task and overlay the environment installs —
   anything naming a directory or file the run will write.
2. **Rewrite every one to a path inside the run environment** before the agent starts, with
   the rewrite applied to the copy, never to the operator's source configuration.
3. **Commit the rewrite as part of the environment's starting state**, so it is visible in
   the run's own history and cannot be mistaken later for something the agent did.
4. **Preserve semantics.** Keep each destination's role — a task whose contract reads its
   own notes directory must still find one at the expected relative location.
5. **Verify after the run**: nothing written outside the environment, and the agent's own
   report of where it wrote matches the confined locations.

## Detecting an escape

- **Watch for writes outside the environment** during the run where the platform allows it.
- **Compare the run's own account with the tree.** A run that says it wrote a vault while
  the environment contains none has written it somewhere else.
- **Audit destination keys after any configuration change.** New overlays arrive with new
  keys, and a rewrite list that is not regenerated silently stops covering them.

## Decision rules

- **Treat an absolute destination as a defect in the configuration**, and report it upstream
  as well as rewriting it locally — the same file will be copied into the next environment
  by someone else.
- **Never resolve a destination relative to the operator's home.** A home-relative path is
  an absolute path with extra steps, and it points at the one directory most likely to hold
  real work.
- **When an escape happens, keep the written material and tell the owner where it is**,
  rather than deleting it: the run's output may be legitimate work in an illegitimate
  place, and only its owner can decide.
