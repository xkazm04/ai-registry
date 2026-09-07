---
name: release-record-and-version-bump
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/release
---

# Release record and version bump

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A version number chosen from the wording of a commit message is a claim about
compatibility that nobody checked, and dependency resolvers act on it automatically, so
the mistake is not a documentation error but an upgrade that breaks somebody at three in
the morning; and a changelog written afterwards is written from memory.

**Input.** The change that just landed and what it does to the project's public surface,
the version and changelog as they currently stand, and the reasoning behind earlier
version decisions.

**Core action.** Choose the version step from what the change actually does to the
declared public surface rather than from how it was described, and move version,
changelog and record together so none of them can be true while another is not.

**Output.** A version, a categorised changelog entry written for a reader six months
from now, and a recorded reason for the version choice, all moved as one, with an
undeclared public surface reported as the finding it is.

## Activities

1. Establish what this project's public surface actually is, since a compatibility claim
about an undeclared surface cannot be checked *(observe)*
2. Read what the landed change does to that surface, from the change itself rather than
from its description *(observe)*
3. Choose the version step from that, preferring the conservative reading when two are
defensible *(decide)*
4. Update version and changelog together, categorised by what each change does to a
reader *(act)*
5. Record the reasoning so the version decision can be argued with later *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Anyone reading the changelog can tell what changed and what it means for them, without
reading the commits.**

- Every landed change is represented in the record, categorised by what it does rather
  than by who wrote it
- The version reflects what the change does to the public surface rather than how the
  commit described it, and the reasoning behind that choice is recoverable later
- A breaking change is never recorded as anything else, and a deprecation is recorded as
  a compatible addition rather than as a fix
- A change with no effect on the public surface is recorded without moving the version,
  rather than being given a step to look busy

**The version, the changelog and the record update together or none of them does.**

- A failure partway through leaves the record consistent rather than half written
- No state exists in which the version has moved and the changelog has not, or the
  reverse, that another reader could observe

**A project that has never said what its public surface is finds that out from this work
rather than from a broken dependent.**

- Where no public surface is declared, that is reported as a finding and the version
  choice is stated as provisional rather than presented as derived
- Where the project is still below its first stable version, the record says that no
  compatibility claim is being made, rather than implying one
- A change that should not have shipped is escalated at the time rather than being
  recorded neutrally and shipped

## Guidance

A version is a claim about compatibility that machines act on, so choose it from what
the change does to the public surface rather than from how the commit described it: a
message states intent and a diff states compatibility. If the project has never said
what its public surface is, that is the first finding, because until it does every bump
is unfalsifiable. Marking something deprecated is a compatible addition, not a fix.
Where two readings are defensible, take the conservative one and say why.

## Where this is worth adopting

- A library with dependents, where a wrong version step does not produce a complaint but
  a silent automatic upgrade that breaks somebody who never read the changelog.
- A team that adopted a commit message convention and now derives its version from the
  prefix, so a fix that quietly changed a return type has been shipping as a patch for
  months.
- A project sitting at a zero version indefinitely, where consumers have started
  treating it as stable and nobody has decided whether it is.
- A changelog that is written the day before a release from a week of commit messages,
  which is the point at which the reason a change was made has already been forgotten.
- An audit or a support conversation where somebody has to justify why a particular
  release was numbered the way it was, and the only surviving evidence is the number
  itself.

## Connector types

`source_control`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[github](examples/github.md) for `source_control`.

## Recommended trigger

`event`. Work landing is a real external event and the record has to be true the moment
somebody reads it, so this work wakes on the merge. The separate question of when an
accumulated increment deserves a release is a judgement and belongs to the release
candidate review, which reads the entries this work leaves behind.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- What this project treats as its public surface, because that is what a version is a
  claim about and most projects have never written it down
- Where the version and changelog live here, since every project keeps them somewhere
  different and the two must move in one step
- The versioning convention the project actually follows, which is often not the one it
  claims, and whether it is still below a stable version at all
- Which branch the record is kept on, and whether writing to it needs anybody's approval
- Who is told when a landed change looks like it should not have shipped, because that
  escalation has to reach a person while the change is still fresh

## Dependencies

- git, since the version decision is read from what landed and written back alongside it
