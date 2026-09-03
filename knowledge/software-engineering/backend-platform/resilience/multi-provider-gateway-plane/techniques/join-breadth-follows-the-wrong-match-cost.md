---
layer: technique
type: technique
subject: multi-provider-gateway-plane
technique: join-breadth-follows-the-wrong-match-cost
status: forged
laws: [unknown-is-not-a-value, count-carries-predicate, identity-survives-reuse]
shared_with: []
use_when: [joining a catalog's names against an upstream's own naming scheme, one installed item marked hundreds of catalog rows as present, deciding whether a fuzzy match should broaden or narrow, an entry that is not local at all is contributing keys to a local inventory]
---

# Join breadth follows the cost of a wrong match

Two naming schemes meet at every plane that fronts upstreams it did not design.
The plane holds a catalog keyed one way; each upstream names the same artifacts
its own way — a shortened family name, a size token, a namespace prefix, a
publisher path. Neither side will adopt the other's scheme, so the plane joins
them, and the join is necessarily fuzzy: keys are *derived* from one side and
matched against the other.

Every such join has one dial. **How broad a key does a matched item
contribute?** A narrow key matches only the exact artifact. A broad key — the
family stem with the size and qualifiers stripped — matches every member of that
family in the catalog.

The dial has no default setting, and the mistake is to look for one. Turning it
is a judgment about **which direction a wrong match hurts**, and that judgment
comes from what the join's output is *used for*, not from anything about the
names.

## The two directions, and the question that separates them

> **Does a miss delete something real, or does a false positive assert something
> false?**

**When the join feeds an aggregate that must be complete — an accounting total,
a coverage figure, a bill — a miss is the expensive error.** An item the join
fails to recognise does not become visibly wrong; it becomes *absent*, and
absence in a total is invisible by construction. Every unmatched row silently
removes real quantity from a number somebody will act on. Here the dial goes
broad: match on family membership, fold namespaced and resold variants of one
family onto one identity, and treat the wrapper as noise. This is the correct
setting for that class of join, and it is well established.

**When the join feeds a claim about what is present — an inventory, an installed
set, a capability list — a false positive is the expensive error.** A broad key
does not merely over-count; it makes the plane assert something specific and
false to a user who can check it. And it is not a small effect, because a family
is not a handful of entries: one broadly-keyed match has been measured marking
**238 of 9,250 catalog rows as installed**, among them an entry two orders of
magnitude larger than the artifact actually present. The user is told they
already have a thing they do not have, and the remedy — downloading it — is
exactly what the inventory existed to tell them they could skip.

Same craft, opposite settings, and neither is a special case of the other. A
design that copies a broad-matching rule from an accounting context into an
inventory context has inherited the setting without the reasoning that produced
it.

## The rule that follows for a presence join

Breadth is not banned on the narrow side; it is **reserved for the case where
the specific identity is genuinely unavailable**:

- **An entry that already names the exact artifact contributes only itself.** A
  reference carrying its size or version has told you precisely what is present.
  Contributing its family stem *as well* adds no information and every false
  positive above — the stem is not extra evidence, it is the absence of evidence
  spelled as a match ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value),
  read in the direction people forget: a definite value must not be widened back
  into a claim about the unknown).
- **An entry whose specific identity is genuinely unknown contributes the stem —
  plus the specific alias its own metadata implies.** An unqualified or
  latest-tagged reference really does leave the exact artifact unstated, so the
  stem is the honest key. Where the upstream reports a parameter count or a
  version alongside it, derive the specific alias too, so the common case still
  resolves to one row rather than to the family.
- **An entry that does not satisfy the join's predicate contributes nothing at
  all.** This is the one that gets missed. A reference the upstream lists but
  which is *not local* — a remotely-hosted variant, a placeholder, a
  subscription entry — looks like a member of the set and is not. Its stem
  would mark every local sibling as present, so an entry that fails the
  predicate is excluded before key derivation, not filtered after matching
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## Derive keys deliberately, and expect the upstream's tokens to be marketing

The alias derivation above has a trap worth naming, because it is where the
"specific" key quietly becomes wrong. The size and version tokens upstreams put
in their names are **rounded for humans**, not derived from the artifact: a
reference tagged with one figure commonly reports a different true count. So a
derivation that computes the token from the true value and matches on it alone
will miss the entry it was built for.

Derive **both** forms — the rounded token and the verbatim one — and match on
either. And where a value cannot produce a meaningful token at all (a magnitude
the naming scheme does not express), derive **nothing** rather than a token that
is syntactically valid and semantically false; a bogus key is worse than a
missing one, because it will match something eventually.

## What this owes the operator

- **The join's breadth setting, stated once, with its reason.** A future
  maintainer reading a narrow-matching rule will read it as timidity and widen
  it. The comment that prevents that names the cost direction, not the mechanism.
- **A count of items matched by a broad key**, separately from those matched
  exactly. A rising broad-match count is the early signal that an upstream
  changed its naming scheme and the specific derivation has stopped working —
  which otherwise presents as a slow drift toward everything looking present.
- **The key that matched, on the record.** "Present" is not attribution when the
  match may have come from a family stem
  ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
