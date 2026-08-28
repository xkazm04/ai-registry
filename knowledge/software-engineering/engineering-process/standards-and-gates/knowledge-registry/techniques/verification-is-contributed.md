---
layer: technique
type: technique
subject: knowledge-registry
technique: verification-is-contributed
status: forged
laws: [verdict-survives-boundary, identity-survives-reuse, absent-guard-is-loud, unknown-is-not-a-value]
shared_with: []
use_when: [a published claim could be false in every consumer and the registry cannot tell, deciding what may cross a publish boundary that forbids evidence, a contribution schema measures consumers against the standard in every field, a verification channel is specified and no contributor populates it]
---

# Verification is contributed, not published

A registry answers one question extremely well: *am I in sync, stale, or
diverged?* The catalog carries a normalized digest, the consumer compares, and
the four states fall out ([catalog-as-sync-key](./catalog-as-sync-key.md)).
There is a second question, and the sync machinery is constitutionally unable
to reach it:

> **Is what we both hold still true?**

Sync is a relation between two copies. Truth is a relation between a copy and
the world. A registry can be in perfect sync with every consumer it has and be
uniformly wrong, and every digest will match, exactly as designed.

## The registry cannot check its own claims, and that is correct

This follows from the publish boundary
([standard-versus-consumer-split](./standard-versus-consumer-split.md)). The
standard is shared; the evidence that any particular claim holds is local,
because evidence is anchors into a tree the registry cannot see and must not
publish. So the registry holds **no material against which any published claim
could be re-checked**. Nobody forgot to write the checker; there is nothing in
the repository for a checker to read.

The architecture is right and it has an unbudgeted consequence: the registry has
exported the only thing that could ever falsify it.

## A count crosses where an anchor cannot

This is the move that makes the whole technique possible, and it is easy to
miss because the publish boundary looks absolute. The consumer's own gate
already resolves its evidence pointers against its own tree — that check keeps
its teeth where the code is — so a verdict exists on every consumer run.
Publishing the *evidence* is forbidden. Publishing the **verdict over it** is
not, provided the verdict is reduced to what carries no shape of the tree:

- **counts, never identities.** "Four pointers into this item stopped
  resolving" is a fact about the standard. "`<path>` is gone" is a fact about
  one private tree and stays there. The schema enforces counts only, because
  the natural instinct — attach the list so somebody can go look — re-imports
  everything the boundary exists to keep out;
- **the item's identity by slug, never by location.** A citation names the item
  it verifies, and it names it the way the item will still be nameable after
  the taxonomy moves its folder
  (`_laws.md#identity-survives-reuse`). A location-keyed verdict silently
  detaches the first time a subject is recategorized, and detaches into
  *silence* rather than into an error.

Without that reduction the verdict cannot cross and the loop cannot close. With
it, a fact about the standard reaches the only place the standard can be
corrected — which is `_laws.md#verdict-survives-boundary` at the one boundary in
the design where it decides anything.

## Three verdicts, because moved is not gone

Two states are not enough, and the distinction that matters is between the two
kinds of failure:

- **resolved** — the pointer found what it claimed. The claim survived contact
  with this tree today;
- **moved** — the anchor is not where it was, but the thing still exists. This
  is usually a *pointer* problem: a rename, a refactor, a file split. It says
  little about whether the claim is true;
- **gone** — the anchor's target no longer exists at all. This is the one that
  can mean the world moved out from under the claim.

Collapsing *moved* into *gone* fills the signal with rename noise until nobody
reads it, which is the ordinary way a freshness channel dies. Collapsing it the
other way hides real disappearances behind a reassuring word.

And absence is a fourth thing, not a zero: a contributor that never ran the
check and a contributor whose every pointer resolved must not aggregate to the
same number (`_laws.md#unknown-is-not-a-value`). The lane rule that keeps this
honest is that an absent verdict block means *not measured*, never *nothing
wrong*.

## Carry it on the contribution lane that already exists

Nothing new is needed structurally.
[per-contributor-aggregation](./per-contributor-aggregation.md) already
specifies the shape — one file per contributor, owned by that contributor,
touched by nobody else, aggregated at generation time into a derived view — and
the verification direction is another block inside it, inheriting the
conflict-freedom and the privacy rule unchanged.

The asymmetry worth auditing in an existing schema: read it field by field and
ask of each, *which party can this fact indict?* A contribution schema commonly
carries how often a consumer **consulted** an item and how often it **deviated**
from one, which looks like a balanced pair and is not — both are facts about the
consumer, and neither can ever falsify a published claim. A registry whose only
feedback direction is downward publishes a wrong claim indefinitely and grows
*more* confident as it spreads, because adoption counts read as corroboration
when they are only distribution.

## The channel that exists and is never populated

The failure this technique actually meets in the field is not a missing schema.
It is a schema that specifies the verdict correctly while nothing emits it, and
it has a recognizable three-part signature:

1. **specified** — the lane's validator accepts the verdict block, with the
   right vocabulary and the right privacy rule;
2. **unpopulated** — the collector that generates contributor files has no code
   path that produces one, so populating it requires hand-editing a generated
   artifact, which nobody does;
3. **half-consumed** — the aggregating reader pulls one of the three counts and
   ignores the rest, so even a populated channel would deliver a third of its
   information.

Each part looks minor and reviews cleanly on its own. Together they are
`_laws.md#absent-guard-is-loud`: the verdict is optional, so the fleet converges
on not sending it, and the registry keeps the *appearance* of a verification
loop with none of its traffic. **The test for whether the channel exists is not
whether the validator accepts it — it is whether the collector emits it
unasked.** A verification channel that has to be opted into per contributor has
already chosen its steady state.

## What this must not turn into

The registry does not thereby acquire freshness enforcement, and holding that
line is what keeps the technique cheap:

- **the verdict is contributed; the aggregate is derived.** No hand-editing a
  rolled-up view; it is regenerated and names its recomputation like every other
  derived artifact here;
- **a failing pointer is evidence, not a verdict on the standard.** One
  consumer's refactor breaks pointers that were perfectly correct. What the
  count buys is a *ranked place to look*, and it earns its keep at the moment
  several independent contributors' pointers into the same item fail at once —
  a signal no single consumer could ever produce, and the entire reason the
  fact has to cross;
- **correction stays a human adoption act**
  ([propose-then-adopt](./propose-then-adopt.md)). A registry that auto-retracted
  claims past a failure threshold would have handed a merge decision to whichever
  consumer refactored hardest.
