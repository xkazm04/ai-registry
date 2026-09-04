---
layer: technique
type: technique
subject: repo-manifest-standard
technique: spec-ships-with-artifact
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target, deletion-is-not-repair]
shared_with: []
use_when: [publishing a contract others will implement, making a repository self-describing offline, keeping a vendored copy of a specification honest]
---

# The specification ships with the artifact

A contract whose definition lives somewhere else is a contract that stops
meaning anything the moment the network, the host, or the link structure fails.
The situations where a manifest matters most are exactly the offline ones:
someone auditing a repository they did not write, on a laptop, from a clone, in
a room with no access to whatever site the specification was published on.

So the specification **travels inside the adopting repository**. The manifest's
pointer to it resolves relative to the repository root, in a fresh clone, with
no network. That is the whole requirement, and every other part of this
technique exists to keep that copy from becoming a lie.

## Vendoring without creating a second authority

A copy of a specification is a second copy of a vocabulary, which is the
condition the laws warn about (`_laws.md#one-authority-per-vocabulary`). What
makes it safe is not discipline but a **drift check**: the shipped copy is
compared, byte for byte, against the source of truth, and any divergence fails.

The shape that works:

- One document is the source. One copy is the shipped artifact. The direction
  is stated — the copy never edits back.
- A test asserts equality between them and fails on any difference, without
  attempting a merge. A test that reconciles is a test that hides.
- The check reads the **actual shipped bytes**, not a re-derivation of them
  (`_laws.md#gate-sees-target`). A drift check that compares the generator's
  output against the generator's output is green forever and proves nothing.
- The check runs on every change, not on release. Drift caught at release is
  drift that already shipped to whoever synchronized in between.

When the drift check fails, the fix is to reconcile the copy. It is never to
delete the check — that converts a visible divergence into an invisible one at
the exact site where visibility existed
(`_laws.md#deletion-is-not-repair`). If the copy is genuinely no longer wanted,
remove the copy *and* its pointer *and* the check together, deliberately, in one
change.

## The reimplementation clause

Shipping the specification is only half of self-containment. The other half is
that the specification must be **sufficient**: a reader must be able to write a
conforming implementation from the document alone, without consulting the
reference implementation's source.

Say so, in the specification, as a clause:

> Any implementation that performs the checks this document describes is
> conformant. The reference runner is a runner, not the definition.

This costs something and is worth it. It forces every check to be written down
in prose precise enough to reimplement — the input it reads, the condition it
asserts, the outcome it emits, and the sampling caps if it samples. Checks that
cannot survive that treatment were never specified; they were only implemented,
and the "standard" was one program's behaviour wearing a standard's clothes.

The practical test: hand the shipped document to someone with no access to the
reference implementation and ask them to write the checker. Every question they
have to ask is a hole in the specification.

The clause also has a consequence for the test bed, and it is the one most often
missed: **if the shipped reader is the only reader in the suite, the clause is
unproven.** A reference reader is normally written against a deliberate *subset*
of the serialization — treating every value as opaque text, say — which makes it
structurally blind to exactly the portability defects the clause exists to
prevent, and checking the generator's output against the generator's own reader
is green forever for the same reason a synthesis-against-synthesis drift check
is. So the suite must contain **at least one independent, full implementation of
the underlying format**, reading the real emitted artifact. The defect class this
catches is small and famous: a bare token that the subset reader passes through
as a string while a conforming parser coerces it into another type entirely — a
legal name that a foreign reader silently turns into a boolean.

## Decision rules

- **When the specification is long, ship it anyway.** Size is not the objection
  that matters; resolvability is. If length is a real problem, that is a signal
  the contract is too large, not that the copy should be a link.
- **When the source of truth is a document in the same repository, the "copy" is
  a pointer** and there is nothing to drift. Vendoring applies when the source
  lives across a boundary.
- **When the copy must be embedded in code rather than left as a document**
  — because the runner needs it verbatim at execution time — embed it as a
  single literal constant with the drift test pinning it, and never as prose
  reassembled from fragments. Reassembly makes the comparison impossible, which
  removes the only thing making the copy safe.
- **When the kit ships a reference reader, never let it be the only reader in
  the suite.** A round trip against the shipped reader proves the pair agrees
  with itself; portability is a claim about readers written elsewhere, and only
  a second, independent full-format reader tests it.
- **When a consumer asks for a machine-readable schema as well as prose**, ship
  both and pin both. Two artifacts, one source, one check each.

## When not to use this

Do not vendor a specification you do not control *and* which forbids
redistribution, and do not vendor one that is genuinely enormous relative to the
repository. In those cases, ship a precise citation — name and exact version,
never "latest" — plus the subset your contract actually depends on, restated in
your own words and pinned by your own tests. The goal is unchanged: a reader in
a clone with no network can determine what the manifest means.
