---
layer: technique
type: technique
subject: judgeable-spec-authoring
technique: interpolated-counts-over-typed-counts
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
shared_with: []
use_when: [authoring spec artifacts in bulk, a grader reports a number that does not reproduce, a count in prose disagrees with the structure it counts, repairing a corpus where one edit invalidates numbers elsewhere]
---

# Interpolated counts over typed counts

The named concern: **every number in a spec that a human typed rather than computed.**
In a measured corpus, numbers that did not reproduce from their own stated derivation
were 41% of all sub-bar findings — second only to self-contradiction, and frequently the
cause of it.

## Why typed numbers rot

A spec states a quantity in prose ("twelve rows", "the longest string is 89 characters",
"three of the four cases"). Later something changes — a row is added, a string is
rewritten, a case is merged. The structure updates. The sentence does not.

Nothing flags it. The artifact still parses, still passes shape checks, and still reads
correctly. Only a reviewer that recomputes catches it, and by then the artifact has
usually acquired several.

The measured cost is sharp: in one catalog adding a single row to a table left four count
sentences elsewhere stale, and the next probe dropped that artifact from 86 to 76 in one
pass. **Everything interpolated survived that edit; everything typed did not.**

## The procedure

Author the artifacts with a small builder rather than by hand, and make the builder
responsible for every number:

1. **Interpolate every count sentence from the structure it counts** — the sentence is
   assembled from the array's length, never typed alongside it.
2. **Recompute every derived figure from the values just written**, not from whichever
   constant looked authoritative when the section was drafted.
3. **Assert the artifact's invariants inside the builder, before it writes.** A builder
   that cannot satisfy its own assertions must not produce a file.
4. **Run a cross-artifact checker over the whole entity afterwards**, and again over what
   the store returns, so the round trip is proved rather than assumed.

Checks worth carrying, all of which caught real defects in a measured pass:

- every count stated in prose equals the length of the structure it describes;
- every declared key has a value and every value has a key, both directions;
- every identifier in a coverage map is real and every real identifier appears in the
  map, with exemptions coded rather than implied;
- every cited sibling resolves to a step that exists;
- a **stale-literal scan**: after any count changes, assert the old literals ("twelve
  rows", "twenty-one") appear nowhere in any artifact of the entity.

## Recompute the superlative, not the value

The subtlest form, and the one recounting does not catch. Two claims of the form *"the
longest shipped string is X at N characters"* had the correct count **for the wrong
string** — a different string was longer. Both had survived earlier review precisely
because the stated number matched the string named.

**Script the measurement over every candidate, sort, and take the maximum.** Never
measure the one the artifact already points at.

## The checker that blocks you is working

A cross-artifact checker will eventually refuse a change you made on purpose. That is the
success case, not a defect: it means a deliberate change to a shared quantity has
dependents you had not updated. Update the assertion and the dependents. **Never bypass
it** — in one measured pass the checker blocked two intended applies and caught six real
breaks mid-edit that would otherwise have shipped as fresh contradictions.

## Decision rules

- **When a number appears in prose, it must be interpolated from its source.** If it
  cannot be, name why in the artifact — that is a basis statement, per
  [a number carries its unit and basis](../../../_laws.md#a-number-carries-its-unit-and-basis).
- **When a quantity is shared across artifacts, one owns it and the rest cite the
  owner** — see `quantity-ownership-and-the-bindable-row`.
- **When a claim is superlative, compute it over the full candidate set.**
- **When a builder's assertion fails, fix the content or the assertion — never the
  bypass.**

## When NOT to use this

- **Do not tool up for a single artifact.** The builder pays for itself across an entity
  or a catalog; for one small edit it is overhead, and the discipline that matters is
  simply recomputing what you touched.
- **Do not interpolate a number whose stability is the point.** A published contract
  value that downstream consumers are bound to should be stated and owned, not derived
  from whatever the structure currently holds — otherwise a structural edit silently
  moves a committed interface.
