---
layer: technique
type: technique
subject: agent-instruction-files
technique: single-source-topology
status: forged
laws: [one-authority-per-vocabulary, identity-survives-reuse]
shared_with: []
use_when: [a repo serves more than one coding harness, deciding where the canonical instruction file lives, per-tool instruction files have drifted apart, structuring instruction files in a monorepo, the always-loaded floor has outgrown its budget and needs scoped overflow, instruction content is copied out into templates or a published package, two harnesses want the same rule in different file formats, a generated instruction directory also holds hand-written local files]
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

## The topology changes at a distribution edge

Which bridge is available is not a free choice. There are two regimes — link
and copy — and two different boundaries push a repo across into the copy one.
The first is **distance**, and it is the edge of a single checkout; the second
is **format**, and it sits inside the checkout. Distance is the one to
understand first, because the copy regime's obligations are easiest to see
where the copy is visibly far away.

**Inside one checkout, the bridge can be a filesystem link.** A
differently-named file is a link to the canonical one, a per-tool skills
directory is a link to the shared directory, and drift is not
*representable*: there is one inode and no second copy to diverge. Nothing
needs checking, because nothing can differ. This is the strongest form of
the single-source rule and the one to reach for by default — a repo that
copies where it could link has invented a consistency problem it did not
have.

**That guarantee is a property of the checkout, not of the repository, and
where it fails it fails silently.** A link is recorded faithfully in the
version-control index, but materialising it is the working tree's job, and a
platform whose filesystem or permission model does not create links writes a
**regular file containing the target's path** instead — a few bytes of text
where the canonical document was supposed to be. Nothing announces this. The
bridge file exists, it is readable, it is not empty, and its contents are a
plausible path, so every check that asks whether the file is present says
yes. A reader that opens it by name receives the path string as its entire
instruction set.

That is a worse outcome than the drift the copy regime risks, and the
comparison is the point: a drifted copy is wrong in places and is caught by
the obligations the copy regime forces you to adopt, while a materialised
link is wrong *entirely* and carries no obligations at all, because the
regime was chosen precisely on the promise that nothing needed checking. The
sentence above holds only with its precondition attached — drift is
unrepresentable *where the link exists as a link*. Where it does not, the
repo has silently entered the copy regime with no assembly step and no
verification.

So the choice of bridge is a claim about every machine the tree will be
checked out on, and it is rarely a claim anyone made deliberately. Where the
platform is not guaranteed, prefer the form the **reader** resolves — a
one-line directive naming the canonical file, which is ordinary file content
that every checkout materialises identically — over a filesystem link. Where
the reader has no such mechanism, take the copy regime and its obligations
honestly. And under any of the three, the assertion is the same cheap one,
and it is the one a link regime uniquely tempts you to skip: **the bridge
resolves to the canonical document.** One line, checkable on every machine,
and it is the only thing that distinguishes a working bridge from nine bytes
of text.

**The moment the same content is shipped outside that checkout, the link
has no target.** A scaffolded project, a starter template, a published
package, a downstream repository the content is mirrored into — each is a
tree that will exist on a machine where the canonical file is absent, so
the bridge necessarily becomes a **copy**. The usual shape is assembly
rather than duplication: a shared base plus a per-target body,
concatenated into the destination's instruction file, so the common
guidance still has one author and only the target-specific paragraph is
local. That is the right construction, and it does not change the
regime — the shipped file is still a second copy of the base, sitting in
a tree where the base is not.

The rule follows directly: **the copy regime needs the drift check the
link regime makes unnecessary.** The generator runs in CI, the destination
files are regenerated, and any difference from what is committed fails the
build. Without it, "generated" is a claim in a comment header rather than
a property of the tree, and the copies drift the first time someone edits a
shipped file in place — which is the normal way to fix a template, because
the shipped file is what the person is looking at.

## The second boundary is a format edge, and it sits inside the checkout

The distribution edge is the boundary that is easy to name, and it is not the
only one. A link is a single inode read by every reader, so it is available
only while every reader accepts **the same bytes**. Harnesses do not reliably
agree on that: one wants a rule file with one frontmatter vocabulary and one
extension, another wants a different vocabulary and a different extension for
the same rule; one reads a tool-server manifest in a shape the other rejects.
Where two hosts differ in *syntax* rather than in *location*, the link has no
target either — not because the destination tree is elsewhere, but because
there is no single byte sequence both hosts can read.

So the rule stated above inverts for that case, and the inversion is worth
saying plainly because a tree in this state reads like a mistake: **a repo that
copies where it could link has invented a consistency problem it did not have,
unless the hosts disagree about the format — and then it has no choice.** The
tell that distinguishes the two is one question about a single pair: could one
file satisfy both readers? A repository doing this well is legible precisely
because it does both at once — a symlink for the host that accepts the
canonical bytes, a generated tree for the host that does not.

What the copy must *transform*, and how to keep the transformation from
becoming per-host code scattered through a generator, is
[host-contract-compilation](./host-contract-compilation.md)'s subject. What
carries over from the distribution edge unchanged is the obligation: **the copy
regime needs the drift check regardless of which boundary produced it.** The
format edge is where that obligation is most often dropped, because the copy
lives in the same checkout as its source and therefore looks like it is under
the same review — while in fact nothing regenerates it, nothing compares it,
and the divergence is a working directory away.

Two failures cluster at this edge specifically, and both were observed in a
tree that derives its entire lint matrix from one config file to guarantee
local and remote agree, a few directories away:

- **The check demoted to prose.** The drift rule exists — as a bullet in an
  agent's own instructions telling it to notice when the generated tree is
  stale. That is a checkable condition delivered as advice, which
  [enforcement-demotion](./enforcement-demotion.md) says is a rule violated
  daily, and it is the same error in the opposite direction: a gate the
  repository already knows how to build, promoted into a prompt.
- **The half-generated directory.** A sync step that *preserves* files in the
  destination with no counterpart in the source produces a tree that is the
  union of generated content and unmanaged local content, with nothing marking
  which is which. The destination is then not a function of the source, so
  "regenerate and compare" has no defined answer and the cleanup step cannot
  safely delete. This is
  [machine-owned-regions](./machine-owned-regions.md)'s marker discipline owed
  at directory granularity: either the generated set is fenced — a manifest the
  generator writes and the checker reads — or the directory admits no local
  files at all and per-user content lives somewhere the generator never visits.

The discipline is easy to hold inside the boundary and easy to lose at it,
and the failure is legible in trees that otherwise do this well: a
repository can run three separate copy-out generators — skills into
templates, templates into a variant set, the whole assembly into a
downstream repository — with **no drift check on any of them**, while the
same pipeline runs exactly that check, regenerate-and-compare with a
non-zero exit on any difference, over an unrelated build artifact a few
lines away. The mechanism is present, understood, and applied to compiled
output; it simply stops at the point where content leaves the checkout,
because that is the point where the link stopped working and nobody
noticed that the obligation had changed hands. When auditing a topology,
enumerate the distribution edges first and ask of each one what fails the
build when its copy goes stale.

## The combination-semantics trap

The convergence on one file name hides a divergence in how files
*combine*, and it bites monorepos. The standard's semantics are
**nearest-file-wins**: the file closest to the code being edited takes
precedence, so a nested file can override the root. Most major harnesses
instead **concatenate** every file they discover along the path — root and
nested load together, ordered root-first so the nearest is merely *last*,
and a contradiction between them is resolved arbitrarily by the model — while
at least one implements the standard literally and loads the nearest file
only. An author targeting both cannot write
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

The cap is not only the author's. Hosts cap the floor themselves, and the
caps disagree in kind: one stops *adding files* once the concatenated total
reaches a configurable byte limit (32 KiB by default), consumed root-first —
so under a nested layout the file nearest the work is the first to be
silently dropped, which inverts the loaded-on-touch category above; another
skips any single file over a much larger size outright; a third states its
limit in pages. None of them errors. A floor sized against the author's cap
and not the host's is a floor whose tail is loaded by some tools and not by
others, and the per-directory overflow valve is exactly where the loss lands.

The topology is verifiable, cheaply: a repo-audit that checks every
bridge resolves to the canonical file, no bridge carries body text, and
the floor's byte total stays under a stated cap — the smallest cap among
the hosts the repo serves, not a number the author likes — makes the whole
discipline a gate instead of a hope.
