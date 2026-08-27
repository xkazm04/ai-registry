---
layer: golden-path
type: golden-path
subject: knowledge-registry
status: forged
techniques:
  - lane-contracts
  - consumer-overlays
  - standard-versus-consumer-split
  - per-contributor-aggregation
  - propose-then-adopt
  - catalog-as-sync-key
  - deterministic-seeding
  - verification-is-contributed
---

# Shared knowledge registries

An organization that runs more than one codebase eventually notices it is
maintaining the same guidance several times: the same conventions, the same
reusable agent instructions, the same hard-won facts, each copy drifting from
the others at its own rate. The obvious fix — put it in one place everyone
reads — is right, and the interesting part is everything that fix does not
settle. *One place* still has to answer: who may write to it, what is allowed
in it, what happens when two tools disagree about the same field, and which
knowledge is genuinely shared versus which only looks shared because it was
written in the same file.

A **registry** is that shared place: a repository of reusable knowledge, owned
by the organization, consumed by many codebases and many tools. This subject is
the design of one — its structure, its write path, and above all the boundary
between what publishes and what must not.

The registry is not a service. It is a repository, and that is a design choice
with consequences: every consumer can read it with tools they already have, the
history is the audit log, review is the adoption mechanism, and nothing needs an
account. It also means the failure modes are repository failure modes — lost
updates, merge conflicts, and one writer silently erasing another — which is why
three of the eight techniques here are about ownership rather than content.

## What belongs in a registry

The test is transplantability: **would this still be true in a codebase that has
never seen ours?** Guidance that survives that question is shared knowledge.
Guidance that only makes sense against one tree is a local fact wearing shared
clothes, and publishing it makes the registry worse — it dilutes what other
consumers came for and couples them to a codebase they cannot see.

This produces a boundary that runs through almost every artifact rather than
between them. A standard is shared; the proof that a particular repository obeys
it is local. A reusable instruction is shared; which projects installed it is
local. A measurement method is shared; the measurement is local. Getting this
line wrong in the *permissive* direction is the expensive mistake, because
published-and-wrong cannot be quietly withdrawn — it is in the history, and
consumers have already synced it.

[standard-versus-consumer-split](./techniques/standard-versus-consumer-split.md)
owns that boundary and the mechanics of keeping local material local without
losing it.

## Structure: lanes, not a pile

A registry with one kind of content is a folder. A registry with several kinds —
reference knowledge, reusable instructions, organizational facts, contributed
telemetry — needs each kind to declare its own shape, its own specification, and
its own gate, because a single validator over heterogeneous content either
rejects half of it or checks none of it meaningfully.

The unit is a **lane**: a top-level division with one item shape and one
governing document. A consumer indexes the lanes it understands and ignores the
rest, which is what lets a registry grow a new kind of content without every
existing reader breaking. [lane-contracts](./techniques/lane-contracts.md) covers
the declaration, the additive-evolution rule that makes ignoring safe, and why
the gate belongs to the lane rather than to the repository.

## Two consumers, one repository

The moment a second tool reads the registry, a question appears that had no
answer before: **whose file describes the repository?** The first consumer's
configuration is usually written as though it were the repository's own
definition, because at the time there was no difference.

There is a difference, and the resolution is not to negotiate a merged format.
It is to separate *what the repository is* from *how one consumer treats it*: a
neutral declaration that belongs to the registry, and a per-consumer overlay
beside it. Neither rewrites the other, a reader that knows only one of them still
works, and a third consumer costs a file rather than a migration.
[consumer-overlays](./techniques/consumer-overlays.md) is that split.

## The one question every consumer actually asks

A consumer rarely wants the registry's content. It wants one answer about each
item it already holds: **am I in sync, stale, or diverged?** Answering that by
fetching everything and comparing bodies is expensive, and it means the
comparison gets implemented once per consumer, differently each time.

So the registry publishes a generated catalog — one row per item carrying
identity, location, declared version, and a short digest of the content — and
that digest is the only thing a consumer needs to decide whether to fetch.
Two consequences are easy to miss. The comparison has four outcomes rather than
two, because *stale* wants a pull and *diverged* wants a conversation, and a
tool that collapses them will overwrite somebody's local edit while reporting
success. And the digest is only trustworthy if it is defined over a normalized
form: a digest taken over whatever bytes happen to be on disk answers a question
about the checkout rather than about the content.
[catalog-as-sync-key](./techniques/catalog-as-sync-key.md) covers the envelope, the
four states, and the normalization rule that keeps the answer true.

## The question the catalog cannot answer

Sync is a relation between two copies; truth is a relation between a copy and
the world. The catalog settles the first completely and cannot reach the
second — a registry can be in perfect sync with every consumer it has and be
uniformly wrong, with every digest matching exactly as designed.

The reason is the publish boundary doing its job. The standard is shared and
the evidence for it is local, so the registry holds no material against which
any published claim could be re-checked; it has architecturally exported the
only thing that could falsify it. What makes this recoverable is that the check
already happens somewhere — the consumer's own gate resolves its evidence
pointers against its own tree on every run — and that the *verdict* can cross a
boundary the *evidence* cannot, provided it is reduced to what carries no shape
of the tree: counts rather than identities, and the item named by slug rather
than by location, so the fact survives the taxonomy moving a folder
(`_laws.md#verdict-survives-boundary`, `_laws.md#identity-survives-reuse`).

Three verdicts, since *moved* is a rename and *gone* is a disappearance and
folding them together fills the channel with noise until nobody reads it — and
absence is a fourth thing, meaning not-measured rather than nothing-wrong. The
asymmetry to audit in an existing schema is which party each field can indict:
*consultations* and *deviations* look like a balanced pair and are both facts
about the consumer, so neither can ever falsify a published claim. A registry
whose only feedback direction is downward publishes a wrong claim indefinitely
and grows more confident as it spreads, because adoption counts read as
corroboration when they are only distribution. The characteristic failure is
not a missing schema but a specified one nothing populates: optional
contributions converge on absent, so the test is whether the collector emits
the verdict unasked, not whether the validator would accept it.
[verification-is-contributed](./techniques/verification-is-contributed.md).

## Many writers, one artifact

Some registry content is contributed rather than authored — usage counts,
adoption states, anything each installation knows about itself. The tempting
shape is one shared field that every contributor updates. In a repository this
fails twice over: contributors overwrite each other's value, and even when they
do not, two of them editing the same line is a conflict on every synchronization.

The shape that works is one file per contributor, aggregated at generation time
into whatever shared view is wanted. Each contributor owns exactly one file and
never touches another's, so there is nothing to conflict over; removing a
contributor is deleting a file; and the aggregate stays derived, which keeps it
honest. [per-contributor-aggregation](./techniques/per-contributor-aggregation.md)
covers the shape and the privacy rule that has to travel with it when the
registry is readable beyond the organization.

## The write path is the governance

A registry that any tool can write to is a registry with no owner. The write
path is therefore the whole governance model, and it is worth stating as one
sentence: **tools propose, people adopt.** A tool may draft, generalize, branch
and commit; merging is the human act, and merging is what adoption *means*.

The corollary is easy to violate by accident: an automated contributor that
pushes and merges its own proposal has not automated the paperwork, it has
removed the decision. [propose-then-adopt](./techniques/propose-then-adopt.md)
covers where to stop, and why the stopping point is "committed on a branch"
rather than anything further along.

## Creating one is also a proposal

A registry usually has to be brought into existence inside a repository its
author does not own, through the same door as everything else: a proposal
somebody merges. That makes the initial seed an unusual artifact — it will be
generated more than once against the same target, because the proposal sits open
while people ask what it is for, and in the meantime the thing that produced it
is fixed or simply re-run.

The seed must therefore be a pure function of the organization it is for. No
timestamps, no minted identifiers, no reads of the environment: a re-run then
produces byte-identical content and *updates* the open proposal instead of
churning it, and a reviewer who sees no diff can trust that nothing changed. The
same discipline decides what happens on a collision — one on the marker that
makes a repository a registry means it is already one and nothing should be
written; one on any ordinary file means skip that path and let the rest land —
and it decides that the ownership metadata forcing review ships *with* the seed
rather than after it, because that metadata is the entire adoption control.
[deterministic-seeding](./techniques/deterministic-seeding.md) covers the seed as a
derived artifact, the two collision meanings, and moving existing material in one
kind of artifact per proposal.

## Failure modes worth naming

- **The registry becomes a second authority.** A consumer copies registry
  content into its own store "for speed" and the copy drifts. A registry is
  read on demand or synchronized explicitly; a silent cache with no
  reconciliation is two authorities
  (`_laws.md#one-authority-per-vocabulary`).
- **A generated view is hand-edited.** Aggregates and indexes are derived; an
  edited derived file is overwritten on the next generation, and between those
  two moments it is a confident lie. Derivation must name its recomputation
  (`_laws.md#derivation-names-recomputation`).
- **Absence reads as zero.** A registry nobody has contributed to and a fleet
  that uses nothing produce the same number. They are different facts and the
  consumer's interface has to distinguish them
  (`_laws.md#count-carries-predicate`).
- **A consumer's write erases another's.** The most expensive one, and the
  quietest: a producer that rebuilds a shared artifact from scratch deletes
  every field it does not know about. Carry forward what you do not own.
- **A digest describes the checkout, not the content.** A change key computed
  over raw bytes, or computed over a different span by each of the two sides
  comparing it, reports divergence for artifacts that are identical. It is wrong
  in exactly the case it exists to detect, and its operators learn to ignore it
  before the first real divergence arrives.
- **The gate is on the wrong side.** Checks that describe the standard belong to
  the registry; checks that describe a codebase cannot live there and must not
  be dropped in the move. Splitting a gate is how half of it disappears.

## Where this subject ends

It owns the registry as a shared artifact: structure, ownership, write path,
and the publish boundary. It does not own what goes *inside* a lane — the shape
of a reusable instruction, the layering of reference knowledge, the format of an
organizational fact — each of which is its own body of knowledge with its own
standard. It also does not own version control mechanics under concurrent
sessions, which belongs to
[concurrent-vcs](../../codebase-stewardship/concurrent-vcs/concurrent-vcs.md), nor the derivation
pipeline that produces generated files inside one repository, which belongs to
[codegen](../../build-and-release/codegen/codegen.md).
