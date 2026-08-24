---
layer: technique
type: technique
subject: agent-instruction-files
technique: single-source-topology
status: forged
laws: [one-authority-per-vocabulary, identity-survives-reuse]
shared_with: []
use_when: [a repo serves more than one coding harness, deciding where the canonical instruction file lives, per-tool instruction files have drifted apart, structuring instruction files in a monorepo, the always-loaded floor has outgrown its budget and needs scoped overflow]
---

# Single-source topology

Different harnesses read differently named instruction files from
different locations under different loading rules. A repo that serves
more than one — or that may — faces the oldest fork in the book: copy the
guidance per tool, refine one copy under deadline, and own two files that
disagree about the same repo. The discipline is the vocabulary law applied
to guidance
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)):
**the repo's instruction content exists once; every other file a harness
requires is a bridge — an import, a pointer, or a link — never a
restatement.**

## One canonical file, bridges around it

The ecosystem supplied the schelling point: a vendor-neutral standard
file (AGENTS.md — plain markdown, no required structure, stewarded by a
neutral foundation, read natively by most harnesses). The topology that
follows:

- **The canonical file** holds everything that passed
  [line-earning](./line-earning.md). It is the only file humans edit.
- **Bridge files** exist because a specific harness reads a specific
  name. A bridge is one line — an import directive or a pointer — plus,
  at most, guidance genuinely specific to that harness. Content below
  the import line in a bridge is the beginning of the fork; treat any
  paragraph appearing there as a smell.
- **A rule's identity is the rule, not its copies**
  ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)):
  other files cite it ("commit discipline: see the canonical file") and
  never restate it, so sharpening the rule sharpens it everywhere.

Where a harness supports neither imports nor symlinks, a generated copy
is acceptable only as a *derived artifact* — stamped by a script from the
canonical file, marked as generated, and regenerated in CI — which is
[machine-owned-regions](./machine-owned-regions.md) applied to a whole
file.

## The combination-semantics trap

The convergence on one file name hides a divergence in how files
*combine*, and it bites monorepos. The standard's semantics are
**nearest-file-wins**: the file closest to the code being edited takes
precedence, so a nested file can override the root. At least one major
harness instead **concatenates** every file it discovers up the tree —
root and nested load together, and a contradiction between them is
resolved arbitrarily by the model. An author targeting both cannot write
nested files as overrides. The portable rule: **nested files are
additive** — a package's file carries only what is *extra* about that
package, never a contradiction of the root, and anything that must
differ per-package is phrased in the root as "per-package files govern
X" so both semantics land on the same reading.

## Loading is budget structure

Harness loading rules are the only lever the author has over *when* the
floor is paid, and they map directly onto
[context-budgeting](../../prompt-assembly/techniques/context-budgeting.md)
categories:

- **Always-loaded** (the root file and whatever it imports): the floor.
  Imports organize; they do not save — an imported file loads at launch
  with its importer. Only line-earning shrinks the floor.
- **Loaded-on-touch** (nested per-directory files; path-scoped rule
  files where the harness supports them): the elastic overflow. Guidance
  relevant to one subtree belongs here, paid only by sessions that enter
  the subtree. This is the sanctioned pressure valve for a floor that
  has outgrown adherence — not a bigger root file.
- **Per-user, uncommitted** (local-override files; user-global files):
  personal preference, never repo policy — a rule the repo needs must
  not live where only one machine loads it.

The topology is verifiable, cheaply: a repo-audit that checks every
bridge resolves to the canonical file, no bridge carries body text, and
the floor's byte total stays under a stated cap makes the whole
discipline a gate instead of a hope.
