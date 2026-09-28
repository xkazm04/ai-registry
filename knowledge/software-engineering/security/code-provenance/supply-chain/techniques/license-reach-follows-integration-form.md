---
layer: technique
type: technique
subject: supply-chain
technique: license-reach-follows-integration-form
status: forged
laws: [gate-sees-target, unknown-is-not-a-value]
shared_with: []
applied: blind-ab
ab_verdict: better
use_when: [a copyleft-licensed component meets a product under a different license, deciding whether a license belongs on the allowlist, bundling third-party data such as dictionaries fonts datasets or certificate bundles, shipping or spawning a third-party executable beside the product, replacing a spawned tool or a protocol peer with its library binding, a license exception justified by "it is only data" or "it runs as a separate process"]
---

# License reach follows the integration form

A license identifier does not carry a verdict. The same copyleft text reaches
a product differently depending on **how the component meets the product**,
and the question a license policy actually has to answer is about the pair:
*this license, in this form.*

The instructive case is one product that draws the same boundary twice and
reaches opposite conclusions, both correct. Many of its spell-check
dictionaries are under strong copyleft, and the product's own code parses
them directly: they are fetched at run time, pinned by digest, from an asset
tree where each keeps its license file, and nothing walls them off from the
code that reads them. Its optional game-capture hook is under a copyleft
license pinned to an earlier version than the product's own, and it is walled
off even though it is packaged *inside* the product's native module: its own
subdirectory, its license text beside the binaries, the upstream revision,
local patches and build script recorded, corresponding source provided for
the exact binaries shipped, a packaging assertion that the directory and its
notice are present, and a written rule that none of its implementation may be
copied into the product's modules. The product never links it; it sets the
launch environment of the process the hook is injected into and speaks the
hook's socket protocol from the other end. Where each one sits decided
nothing - the data lives outside the package and flows straight into the
product's code path, the hook lives inside the package and may not touch it.
One is data a program reads; the other is a program that would become part of
the product the moment its code crossed the line.

## The forms, from least reach to most

- **Data the program reads.** Dictionaries, certificate bundles, fonts,
  datasets, models. The license governs redistribution of the data -
  attribution, share-alike, source for the data - and does not reach the
  program that reads it, exactly as a program's license does not reach the
  documents it opens. The obligations are real but they are the data's:
  license text beside the files, the version pinned, the notice kept.
- **A separate program the product talks to.** A spawned command, a peer on a
  socket, a component shipped beside the product in one archive or image.
  Obligations attach to that component's own distribution - its license, its
  corresponding source, its notices - and stop at the protocol, *provided the
  communication stays at arm's length*: command lines, pipes, sockets, files,
  not a shared address space or a private exchange of in-memory structures.
- **Dynamically linked code.** A shared library the product loads. Weak
  copyleft is designed for this form: the library stays replaceable, its
  modifications stay published, and the product's own code is not reached.
- **Linked, bundled, copied or modified code.** One combined work. Now the two
  licenses must be *compatible*, and compatibility is not symmetric or
  family-wide: a copyleft license pinned to an earlier version cannot be
  combined with a later version of the same family, so the capture hook above
  is acceptable as a separate program and unacceptable as linked code **under
  one and the same license**. File-level copyleft sits in this row only for
  files you change: an unmodified file-level-copyleft dependency is linked
  code with no reach into yours; the first local patch creates a publication
  obligation for the patched files.

## Key the policy on the pair, not the identifier

The licenses clause of
[dependency-policy-gates](./dependency-policy-gates.md) is an allowlist, and
that is right; what it must not be is an allowlist keyed on the identifier
alone, because that makes the owner choose between two wrong gates.
Allow the license globally, and the next component under it that arrives in
the linked form passes silently. Deny it globally, and every data
file and every separate program under it becomes a permanent exception, which
is where policies rot. The tell that a policy has already hit this: **the
form reasoning is written in a comment beside an identifier-keyed entry** -
"allowed because the license is on the data", "allowed because we link these
unmodified". The reasoning is right and the gate cannot read it
([gate-sees-target](../../../../_laws.md#gate-sees-target)): the next entry
under the same identifier inherits a justification that was written about a
different component.

So each accepted entry names its form, and a license acceptable in one form is
a separate row from the same license in another. Where the policy engine can
only key on identifiers, bind the exception to the named component and record
the form there; the comment becomes a field.

## Make the form a place in the tree

A form that lives only in a policy file is a claim about the code. Make it a
place the code can be checked against:

- The separate-program component gets its own directory, its own license
  text, the upstream revision, the local patches and how it is built, and a
  notice stating the boundary and the rule that its implementation must not be
  copied across.
- Nothing in the product's modules imports from that directory; the product
  speaks only the protocol. That is checkable by the same import-graph rules
  that guard any other layer boundary.
- A packaging test asserts that the component and its notice are in the
  shipped artifact, because the obligation is on the distribution and the
  artifact is where a dropped license file is invisible.

## The form changes without a license change

The dangerous edit to a license posture usually does not add a license. It
changes a form: a spawned command replaced by its library binding, a protocol
peer pulled in-process for speed, a file-level-copyleft dependency patched in
place, a dataset compiled into source. The resolved graph's licenses are
unchanged and an identifier-keyed gate stays green. Each of these is a review
event, and a policy that records the form is the only one that can notice it
has moved.

The inventory is per form, too. The lockfile sees linked code. It does not see
the executables the product spawns, the base image it ships in, or the data
files it downloads or bundles, and those are exactly the forms where a
copyleft license is most often acceptable - so a lockfile-only license gate
is both blind to them and unable to express why they are fine.

## When the statement is ambiguous, take the narrower reading

Upstream license text and downstream packaging metadata disagree often - one
says a pinned version, the other says "or later". Until the files in the exact
revision you ship state otherwise, take the narrower reading. An unresolved
license is not the permissive one
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)); a
component with no license statement at all is the same case, and it is a
review event rather than a pass.

## When not to bother

A product whose license is permissive and whose inventory, in every form, is
permissive has nothing for the form to decide, and recording it is ceremony.
And this is an engineering policy, not a legal opinion: the forms above follow
the license authors' own published readings of aggregation and arm's-length
communication, and the edges - plugins in a shared address space, protocols
that exchange internal data structures, generated code derived from a
copyleft grammar or dataset - go to counsel with the form already written
down.
