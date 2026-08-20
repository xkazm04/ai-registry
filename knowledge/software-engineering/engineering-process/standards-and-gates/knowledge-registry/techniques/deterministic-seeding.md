---
layer: technique
type: technique
subject: knowledge-registry
technique: deterministic-seeding
status: forged
laws: [derivation-names-recomputation, failure-not-empty-success]
shared_with: []
use_when: [creating a registry in a repository you do not own, re-running a seeding proposal, moving an existing body of knowledge into a registry]
---

# Deterministic seeding

A registry usually has to be created *inside somebody else's repository*, by the
same mechanism everything else uses: a proposal a human merges. That makes the
seed an artifact with an unusual property — it will be generated more than once
against the same target, because the first proposal sits open for days while
someone asks what it is for, and in the meantime the tool that produced it gets
fixed, redeployed, or simply re-run.

So the seed is not a one-shot script. It is a **derived artifact whose
recomputation must be a no-op** (`_laws.md#derivation-names-recomputation`), and
almost every rule here follows from that.

## Make the seed a pure function of one input

The seed content may depend on the organization it is for, and on nothing else.
No timestamps, no minted identifiers, no reads of the environment the generator
happens to run in.

The consequence is concrete: re-running the seeding against an open proposal
produces byte-identical content, so the re-run *updates* the proposal instead of
rewriting it. Break the rule with a single generation timestamp and every re-run
is a diff — reviewers lose their place, "nothing changed" becomes
indistinguishable from "something changed", and the reviewer learns to skim the
one artifact that most needs reading.

Where a field genuinely wants a timestamp — the generated index almost always
does — seed it **present and null** rather than omitting it. The shape is there
from the first day, consumers can parse it before anything has been generated,
and determinism survives.

Seed the generated index empty rather than not at all, for the same reason. An
absent index and an index of nothing are different facts, and a consumer that
has to handle both learns to treat absence as normal.

## Order the seed so the first file is the membership test

Commit the seed **spine first** — the file whose presence is what makes the
repository a registry at all. That ordering turns the first write into the
already-installed detector, and it lets two collisions mean two different things
(`_laws.md#failure-not-empty-success`):

- **A collision on the spine** means the target is already a registry. Refuse the
  whole seeding and write nothing. The correct action is to point the consumer
  at the existing registry, not to seed a second declaration over it.
- **A collision on any later file** means an ordinary pre-existing file — a
  readme, an ownership file, a directory that already exists. Never overwrite it;
  skip that path, report it, and let the rest of the seed land.

The second half is the one people get wrong by being cautious. Refusing the
entire seeding because the target already has a readme makes creation unreachable
for exactly the repositories most likely to want a registry — the ones that are
already being used for something. Collapsing both cases into one "some files
already existed" outcome is the other failure: the caller cannot tell "you
already have this" from "we skipped a file", and those need opposite responses.

## Seed the adoption control with the registry, not after it

If merging is what adoption means, then the ownership metadata that forces review
is not an administrative afterthought — it is the enforcement of the whole
governance model, and a registry created without it depends on everyone
remembering. Ship it in the seed: a placeholder owning group per lane, plus the
root declaration, and a sentence *in that file* saying that merging a change here
is the act of adopting it. Placeholders that must be replaced are fine; silence
is not, because silence reads as "no review needed" to the next person.

## The seed carries nothing private

Everything the seed writes is content the recipient owns from the moment the
proposal merges, and it lands in a repository whose visibility you do not
control. No secrets, no internal identifiers, no material from another
consumer's tree. State this as a property of the seeding function rather than as
a review habit: a seed is written once and copied forever, and the person who
adds a "helpful" default six months from now will not re-derive the rule.

Default the outward-facing switches to off. A freshly created registry that
begins reporting anything anywhere before its owner has opted in has made a
decision that was not theirs to skip.

## Migrating existing content: one kind per proposal

When a registry is being seeded to replace a store that already holds material,
do not move it in one change. **One proposal per kind of artifact**, each on its
own stable branch so re-running that kind updates its proposal rather than
opening a second.

The reason is reviewability, not throughput: a single change that moves an
organization's entire knowledge base is a change nobody reads, and this content
only becomes real when a human reads it. A hundred items of one shape can be
reviewed by spot-checking; a hundred items of five shapes cannot.

And nothing is removed at the source by *opening* a proposal. An item's recorded
home changes only after the indexer has actually observed it in the registry —
not when the proposal opens, not when someone believes it merged. Until then both
surfaces answer consistently, and a proposal that is abandoned leaves nothing
pointing at a place the item does not exist.

## When not to use this

Determinism costs design effort in the generator, and it buys the ability to
re-run safely. If the seed is applied once, by hand, in a repository the author
owns, that budget is better spent elsewhere. The moment the seeding is
automated, offered through an interface, or aimed at a repository someone else
merges, it will be run twice — and every rule above becomes load-bearing.
