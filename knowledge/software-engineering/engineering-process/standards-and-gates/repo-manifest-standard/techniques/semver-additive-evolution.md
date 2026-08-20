---
layer: technique
type: technique
subject: repo-manifest-standard
technique: semver-additive-evolution
status: forged
laws: [identity-survives-reuse, one-authority-per-vocabulary]
shared_with: []
use_when: [classifying a proposed change to a contract, stamping a version on a machine-readable artifact, deciding whether a change forces a migration]
---

# Additive evolution under a versioned contract

The manifest carries a version, and that version describes **the contract**: the
set of fields a reader may expect and the meanings attached to them. It does not
describe the repository, the product, or the tool that generated the file. This
separation is the first decision and the one most often gotten wrong, because at
the beginning the two numbers are both "1" and there is no visible cost to
merging them.

The cost arrives later, in both directions. A contract version tied to a
product's release train forces a contract bump on every ship, so readers cannot
use the number to decide anything. A product whose release train is gated on
contract stability cannot ship. Two facts, two fields, each with one authority
(`_laws.md#one-authority-per-vocabulary`).

## The rule

**Within a major version, change is additive only.**

Additive, and therefore a minor bump:

- A new optional field.
- A new member of an open enumerated set, where readers are already required to
  ignore unrecognized members.
- A new capability name in the declared vocabulary.
- A relaxation: a field that was required becoming optional, provided every
  existing document stays valid.

Breaking, and therefore a major bump:

- Removing a field, or renaming one.
- Making an optional field required.
- Narrowing a field's accepted values or changing its meaning under the same
  name.
- Changing a pointer's resolution base, or the units of anything numeric.

## The changes that look additive and are not

These are where the discipline is actually tested.

- **Reusing a name for a new meaning.** The most damaging change available,
  because *must-ignore* offers no protection: old readers parse the new content
  under the old contract and are confidently wrong. A field name is an identity
  and it must survive the document's whole major version
  (`_laws.md#identity-survives-reuse`). Need a new meaning? New name; leave the
  old one deprecated and readable.
- **Adding a required field.** Presented as "additive" because nothing was
  removed. Every existing document instantly becomes invalid. Add it optional
  with a defined default, and require it at the next major.
- **Tightening validation without changing the schema.** The document did not
  change; the population of accepted documents shrank. To everyone whose file
  now fails, that is indistinguishable from a breaking change, and they are
  right.
- **Adding a member to a set the specification declared closed.** If readers
  were told the set was exhaustive, they were licensed to switch on it
  exhaustively. Sets are open by declaration, not by hope — say which they are
  when you define them.

## The identity field beside the version

A version alone does not tell a reader *what* it is holding. Pair it with a
**stable identifier for the contract itself** — a short, permanent name, carried
as the document's first field.

Make that identifier a name, not a location. An identity expressed as a fetchable
address stops resolving the first time the publishing host reorganizes, and then
every document in the field carries a dead pointer as its identity. A plain
string cannot rot, needs no network to compare, and is exactly as unique as the
authority that minted it. Readers dispatch on the pair (identity, major): unknown
identity means "not my document, ignore it entirely"; known identity with an
unknown major means "mine, and I cannot read it" — two different outcomes that a
version number alone cannot distinguish.

## What a reader does with the version

Define the reader's behaviour in the specification; do not leave it to each
implementation:

- **Same major, any minor:** proceed. Unrecognized fields are ignored as usual.
- **Higher minor than the reader knows:** proceed, and say so once. The reader
  is reading a superset it was designed to tolerate.
- **Higher major:** refuse, with a message naming both versions. Guessing across
  a major is exactly what the major was declared to forbid.
- **Lower major:** the reader may support it or refuse it, but it must state
  which. Silent best-effort across a major boundary is the worst option.

## Decision rules

- **When in doubt between minor and major, ask whether any currently valid
  document becomes invalid, or any currently correct reader becomes wrong.**
  Either one, and it is a major. This test is mechanical and settles most
  arguments in a sentence.
- **When a major seems necessary, first try adding the new shape beside the old
  one** and deprecating rather than removing. Deprecation costs a paragraph;
  a major costs every adopter a migration, and the adopters who cannot migrate
  are the ones you lose permanently.
- **When you bump a major, publish what changed as a list of field-level
  transitions**, not prose. The reader's author needs a checklist, not an essay.

## When not to use this

Do not version an artifact whose only reader is generated from the same source
in the same commit — an internal intermediate, a build-time cache. There, the
version field is ceremony: nothing can be skewed, and the number will be wrong
because nobody had a reason to maintain it. Versioning is for contracts that
cross a boundary where the two sides are updated independently. If there is no
such boundary, there is no contract, only a data structure.
