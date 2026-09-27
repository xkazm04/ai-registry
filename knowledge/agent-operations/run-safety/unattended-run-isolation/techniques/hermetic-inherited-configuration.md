---
layer: technique
type: technique
subject: unattended-run-isolation
technique: hermetic-inherited-configuration
status: draft
laws: [the-harness-is-a-suspect-in-every-red, measure-the-tree-not-the-summary]
shared_with: []
use_when: [launching an agent or a model call headlessly from a harness, a run's tools, context or cost differ from what the harness says it configured, spawning version control or test commands from inside a hook or another run, comparing runs across machines or settings changes]
---

# Hermetic inherited configuration

The concern: a run inherits more than its working directory. A headless agent invocation
loads several layers by default:

- the operator's user settings, and with them their hooks, plugins, tool servers, skills
  and permission rules;
- the repository's own agent hooks and tool servers, when the run starts inside a checkout;
- version control's system and global configuration, including its credential helper,
  hook path and identity;
- every variable the parent process exported.

An empty working directory cuts only the layer that is found by walking up from it.
Everything user-level and everything exported still arrives. The damage is quiet in both
directions:
- **Inward.** The model reads tools, instructions and skill listings the harness never
  declared, so the measured configuration is not the one described.
- **Outward.** Hooks written for a person's sessions fire on every call and send the
  prompts to wherever those hooks send them.

## The procedure

1. **Start from an allowlist, not a denylist.** Build the child's environment from the
   variables it needs, rather than copying the parent's and removing known-bad names. In
   particular, drop every version-control variable a hook may have exported: the
   repository, work-tree and index paths. From a linked worktree these are absolute, so
   every command the child runs acts on the parent repository whatever its directory.
2. **Cut the configuration layers explicitly.** Name them on the command line or in the
   environment:
   - which settings sources load;
   - which tools exist;
   - which tool servers connect;
   - whether skills and hooks are active;
   - which global and system configuration version control reads.

   Use a per-run home or configuration directory where the runner supports one. Where the
   runner's fully hermetic mode requires a different authentication method, cut each layer
   by its own flag and say so.
3. **Put the isolation profile in the argv builder**, in one place, so no call site can
   build an unisolated command by hand.
4. **Key every cache by the profile.** A reply cached under a different invocation is a
   replay of a different configuration. Serving it after the profile changes silently
   mixes the old configuration into the new results.
5. **Read what loaded from the runner's own report.** Most agent runners emit an
   initialization record listing tools, tool servers, skills, plugins and hooks. Capture it
   for one isolated call and one control call with the isolation removed. The control is
   the positive control: if it loads nothing either, the machine has nothing to leak and
   the pass is uninformative.

## Decision rules

- **A harness's description of its calls is not evidence.** "No tools" is true when the
  runner's own report lists none, and not before.
- **A change to the isolation profile is a change to the measurement.** Earlier results were
  measured under the old profile. Pairs inside one round shared it and stay comparable.
  Absolute numbers and cross-profile comparisons do not.
- **Operator hooks are outward channels.** A hook that forwards prompts to a local
  application, a notifier or a logger forwards the benchmark's inputs too, including
  anything private in them.
- **Managed or enterprise policy cannot be cut from inside the run.** Record which policy
  applied rather than claiming a clean profile.
- **When a checkout turns bare, a foreign commit appears, or test identities show up in
  real history, suspect an inherited repository variable first.** Read the diffs before
  discarding anything: real work may be carrying a leaked identity.
