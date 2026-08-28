---
layer: technique
type: technique
subject: agent-instruction-files
technique: workspace-ancestry-isolation
status: forged
laws: [absent-guard-is-loud, gate-sees-target]
shared_with: []
use_when: [an agent runs inside a directory some tool created rather than a repo someone chose, a harness generates scratch workspaces or candidate checkouts under an existing tree, an evaluation must measure the agent rather than the repository it was launched in, a cloned third-party tree is about to be read by an agent, a session picks up instructions nobody on the team wrote]
---

# Workspace ancestry isolation

Every other technique in this subject is written from the author's chair:
what a line must earn, where the canonical file lives, which regions the
machine owns. This one is written from the opposite end, and it is the only
question the author cannot answer by editing the file: **which directories
does this file govern?** The answer is not "the repository." It is a span
computed at launch from a path, and a directory that a program created
inside that span inherits the brief without anyone deciding it should.

## Discovery walks, and it does not stop at the repository

The loading rule is an ancestry walk. The harness reads its instruction
files from the working directory and **every directory above it**, to the
filesystem root — there is no boundary at the repository root, at a
worktree, or at a package. Everything discovered is **concatenated** into
context; the nearest file does not replace the ones above it, it is
appended after them.

The walk has a second half that is easy to miss because it is lazy:
per-directory files *below* the working directory are discovered too, and
loaded on demand when the agent reads a file in that directory. So the
governed span is not a chain, it is a cone — everything above the launch
point, plus everything beneath it that gets touched.

Two consequences follow immediately, and they run in opposite directions:

- **Upward inheritance.** A workspace created inside a repository is
  governed by that repository's instruction file, and by every ancestor
  file above it. The agent working in the scratch directory is following
  house rules written for the product, about a codebase it is not editing.
- **Downward injection.** A third-party tree cloned *under* the working
  directory carries its own instruction file, and that file enters context
  the moment the agent reads anything in the clone. The instructions
  arriving are those of whoever wrote the upstream repository — content the
  team never reviewed, loaded by the act of reading a file.

Downward injection is the sharper of the two, because the upward case at
least involves a file someone on the team wrote.

## The uncovered case is the directory nobody authored

[line-earning](./line-earning.md) prices a line against every future
session, and that pricing quietly assumes the sessions are *yours* — work
in a tree someone chose, on a task the file was written to inform.
[single-source-topology](./single-source-topology.md) sorts loading into
always-loaded, loaded-on-touch and per-user, and all three categories
describe files an author placed deliberately.

A machine-generated workspace is in none of those categories. Nobody placed
it, nobody priced it, and the file governing it was written about a
different codebase. It is the case where a correctly written, well-earned,
freshly maintained instruction file is nonetheless wrong — not because the
lines are bad, but because they are being applied where they were never
meant to apply.

## Where this bites

The pattern is always the same shape: a program creates a directory, and an
agent is launched in it.

- **Evaluation and benchmarking.** A harness that generates candidate
  workspaces beneath its own checkout hands every candidate the harness
  repository's instruction file. The run then measures the agent *plus* an
  uncontrolled brief, and the brief changes whenever someone edits the
  file — so scores move with no change to the system under test. That is a
  gate reading a proxy
  ([gate-sees-target](../../../../_laws.md#gate-sees-target)); the same
  contamination the sibling subject screens for on the scenario side
  ([eval-harness](../../../evaluation-and-cost/eval-harness/eval-harness.md)),
  arriving through the environment instead.
- **Self-modifying and optimization loops.** A loop that edits an agent's
  own prompts or tools while running inside the tree it is editing reads
  its own in-progress output as instruction. The measurement and the
  material become the same file.
- **Scratch clones and sandboxes.** Any tree fetched to be *operated on*
  rather than worked in — a repository under analysis, a dependency being
  inspected, a candidate patch checkout — ships whatever instructions its
  authors wrote for their own agents.

## The rule: place the workspace outside the span

Isolation here is positional, and it is cheap: **launch the agent from a
directory that is not a descendant of any tree whose instructions must not
apply, and do not nest the trees under consideration beneath it.** A flat
sibling layout — the tool, the material, and the working directory as peers
under a common parent that holds no instruction file — makes the span empty
by construction. Nesting the workspace inside the tool's own checkout is
the default that produces the contamination, and it is the layout everyone
reaches for first because it looks tidier.

Where the layout cannot change, the fallbacks are worse in a specific way
and should be chosen knowingly:

- A **path-exclusion setting**, where the harness offers one, subtracts
  named files from the walk. It is configuration, so it fails the way
  configuration fails: it protects the machine it is set on and no other
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).
  Commit it where the harness reads a committed layer, and expect it to
  drift from the layout it describes.
- **Cross-boundary loading defaults** are worth reading rather than
  assuming. Where a harness lets a session reach additional directories,
  loading those directories' instruction files is typically opt-in — the
  boundary decision has already been made correctly in that one place, and
  it says nothing about the ancestry walk, which has no such default.

## Make the loaded set an artifact

The failure is silent by construction: a contaminated session looks exactly
like a clean one, and the contamination is legible only as behavior nobody
can trace to a line. So the isolation claim gets the same treatment
[instruction-freshness](./instruction-freshness.md) gives an enforcement
claim — it is verified against what actually loaded, not asserted from the
layout.

Every mature harness can report the instruction files a session resolved,
either as a session-inspection command or as a lifecycle hook that logs
each load with its reason. An automated run should capture that list into
its own artifacts and assert it: an evaluation whose runs cannot state
which briefs they loaded has an uncontrolled input, and an empty expected
list is the cheapest assertion in the suite. A layout that is correct today
and unasserted is a layout that will be reorganized by someone who does not
know the walk exists.
