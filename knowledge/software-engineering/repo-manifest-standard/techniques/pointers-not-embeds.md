---
layer: technique
type: technique
subject: repo-manifest-standard
technique: pointers-not-embeds
status: forged
laws: [one-authority-per-vocabulary, failure-not-empty-success]
shared_with: []
use_when: [deciding what belongs inside a manifest, adding a field that duplicates existing material, wiring a manifest to generated evidence]
---

# Pointers, not embeds

A repository contract stays small by **naming where things are** instead of
containing them. The guidance lives in the guidance document; the manifest holds
a path to it. The evidence lives where the run wrote it; the manifest holds a
path to it. The dependency set lives with the dependency manager; the manifest
holds nothing at all.

Two forces make this non-negotiable. First, an embedded copy is a second
authority for the same fact, and the copy drifts on exactly the schedule that
makes it hardest to notice — slowly, silently, from the day it is written
(`_laws.md#one-authority-per-vocabulary`). Second, size destroys the document
socially: a contract short enough to read in full during review stays correct,
because the reviewer sees all of it; a contract that needs scrolling gets
skimmed, then remembered, then wrong.

## What goes inside

Only what is *about the contract itself* and cannot be pointed at:

- The contract version.
- The capability entries — name, invocation, enforcement point.
- Pointer fields, each naming a location and what the reader should expect
  there.
- The provenance record for the manifest document.

If a candidate field is neither one of those nor a fact with no other home, it
belongs behind a pointer.

## What goes behind a pointer

- **Narrative guidance** — conventions, architecture notes, review rules. These
  are long, edited by humans, and reviewed on their own merits.
- **Generated evidence** — the last run's report, coverage output, an inventory.
  These change on a different clock than the contract and must never be pasted
  into it.
- **The specification** the manifest conforms to.
- **Anything another authority already owns** — the dependency set, the release
  version, the license text.

## The resolution contract

A pointer without a resolution contract is decoration. State three things in the
specification, once, for all pointer fields:

1. **Relative to the repository root**, always. Absolute paths and network URLs
   break the offline-clone case that this whole document exists to serve.
2. **A missing target is a distinct outcome from an absent field.** The reader
   reports "not declared" and "declared but missing" differently
   (`_laws.md#failure-not-empty-success`). Collapsing them is how a broken
   pointer survives for a year.
3. **The reader never fabricates the target.** No creating the file, no falling
   back to a default location, no "helpfully" scanning for something similar. A
   pointer resolves or it does not.

## The rule that costs the most to learn

**Never point at what you do not ship.**

The tempting shape is a pointer to something the tooling produces — a report, a
generated inventory, a compiled artifact — placed in the manifest as it will
look after a successful run. It reads correctly to its author, who has run the
tool. On a fresh clone, that pointer resolves to nothing, and the reader dutifully
reports a broken pointer on the very first interaction anyone has with the
repository.

The consequence is worse than one bad message. A contract whose first act in a
new checkout is a complaint about a legitimate state teaches everyone to
disregard its output, and after that the contract has no enforcement budget left
for the case it actually exists to catch.

So the decision rule is: **point only at what is committed, or at what is
declared optional with the reader instructed to stay silent when it is absent.**
Pick one explicitly per field; do not leave it to the reader's temperament. If a
generated artifact really must be pointed at, either commit a valid empty
instance of it or mark the field optional-and-silent — never both-and-neither.

## Existence is not resolution

The companion failure to a dangling pointer is a pointer that resolves to a file
nobody has filled in. Scaffolding ships templates with placeholder markers in
them; a reader that only checks for existence reports a repository as complete
when every pointed-at document is still the template.

So the resolution check has a second half: **a target that still carries its
placeholder markers is reported as unfilled, not as present.** This is why
templates should carry an unambiguous machine-detectable marker in the first
place — it is the only thing that makes the distinction checkable.

The same reasoning applies to a pointed-at invariants document. Splitting the
"must not" rules out of the spine is right, but a rules file that nothing
enforces is prose with a pointer to it. Whatever subset of those rules a machine
can check — a tracked file matching a never-commit pattern is the canonical
example — should be checked, and hard. That subset can be small; it just cannot
be empty.

## Decision rules

- **When the material is under 20 lines and has no other home**, embed it. A
  pointer to a three-line fact is more machinery than fact.
- **When the material is edited by humans on a review cycle**, point. Manifests
  are regenerated; regeneration and human editing in one file is a collision
  waiting for the first person who is surprised by it.
- **When two consumers want the same material in different shapes**, point at
  the source and let each shape it. Embedding one consumer's shape makes that
  consumer the authority.

## When not to use this

Do not point at material outside the repository — another repository, a wiki, a
hosted document. The manifest's guarantee is that a clone is self-describing;
an external pointer forfeits that and reintroduces the network dependency the
file format was chosen to avoid. If the material genuinely lives elsewhere,
vendor a copy in with a drift check, or accept that the field is a human-facing
reference and mark it as one so no reader tries to resolve it.
