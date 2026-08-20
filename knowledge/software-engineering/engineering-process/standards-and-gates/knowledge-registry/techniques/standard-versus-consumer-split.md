---
layer: technique
type: technique
subject: knowledge-registry
technique: standard-versus-consumer-split
status: forged
laws: [one-authority-per-vocabulary, count-carries-predicate]
shared_with: []
---

# Standard versus consumer split

The single boundary a shared registry lives or dies on: **what publishes is the
standard; what proves the standard holds in one codebase stays with that
codebase.**

The line is easy to state and hard to hold, because both halves are usually
written in the same document by the same author on the same day. A piece of
guidance and the pointers proving it is followed here feel like one artifact.
They are not, and the test separates them cleanly: *would this still be true in a
codebase that has never seen ours?*

## Why the permissive direction is the expensive one

Publishing too little is recoverable — someone notices the guidance is thin and
adds to it. Publishing too much is not, for three compounding reasons:

- **It is in the history.** A repository is append-only in practice; withdrawing
  a published fact does not unpublish it.
- **Consumers have already synced it.** By the time the mistake is noticed, the
  content is in other people's working copies.
- **It dilutes what other consumers came for.** A standard interleaved with
  another codebase's specifics reads as *their* notes, and the next reader
  stops trusting the layer.

So when the boundary is genuinely unclear, the default is to keep material local
and promote it later, never to publish and retract.

## What the split looks like in practice

| Shared (publishes) | Local (stays) |
| --- | --- |
| The standard, method, or instruction | The pointers proving one tree follows it |
| The measurement *method* | The measurement |
| A reusable instruction's content | Which projects installed it, and at what version |
| The vocabulary a status field may take | One system's current statuses |
| How to decide something | The decision one team made |

The pattern is the same every time: the **rule** is shared, the **instance** is
local.

## Keeping local material without losing it

The split is only safe if the local half has a home. Two arrangements work:

**A local overlay beside the published file.** The published document carries the
standard; a sibling file, excluded from publication, carries the pointers. This
keeps the two next to each other for the author while keeping one of them out of
the shared repository. It is the right shape when the local material is dense and
changes with the codebase.

**A tracked local store in the consuming repository.** The consumer keeps its own
proof in its own repository, where its own history and review apply. This is the
right shape when the material has to survive the registry being re-cloned, and it
is what makes the local half auditable rather than a scratch file.

The arrangement that does *not* work is deleting the local half because it "did
not belong in the registry". It belonged somewhere; the move is a relocation, not
a deletion (`_laws.md#deletion-is-not-repair`).

## Splitting a gate is how half of it disappears

The corollary nobody plans for. If a check validated both halves — structure and
proof — moving the standard to a registry moves the structural half with it, and
the proof half has nowhere obvious to go. It is not deleted deliberately; it is
simply not in either repository's checks any more, and nothing announces that.

So when a body of knowledge moves, enumerate the checks it had, and place each
one on the side whose facts it asserts:

- Checks about the **standard** — shape, vocabulary, internal references,
  transplantability — go with the standard.
- Checks about a **codebase** — do the cited files exist, does the local copy
  still match the published one — stay with the codebase, and must be written
  even if they did not exist as separate checks before.

State the split in both places. A gate that quietly covers half of what its name
implies is worse than an absent one, because its green is read as the whole
claim.

## Reporting across the boundary

A consumer-side check often needs both halves — the published standard and the
local proof — which makes it the only check that can compare them. Two rules keep
it honest:

- **Compare sets, not counts.** Two collections can agree on size and disagree on
  every member.
- **Say which side is missing.** "Present here, absent there" and its reverse are
  different defects with different fixes; a symmetric "mismatch" message forces
  the reader to re-derive which happened.
