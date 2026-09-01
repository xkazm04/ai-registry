---
layer: technique
type: technique
subject: judgeable-spec-authoring
technique: enumeration-closure-as-arithmetic
status: forged
laws: [one-authority-per-quantity, structural-proof-is-never-sufficient]
shared_with: []
use_when: [a spec introduces a field and lists the schema elsewhere, a grader reports an invented field, auditing a spec corpus for self-contradiction, a list in an artifact claims to be complete]
---

# Enumeration closure as arithmetic

The named concern: **a list inside an artifact that claims to be complete, and is not.**
It is the most common defect in machine-graded design specs — roughly half of all
sub-bar artifacts in a measured corpus carried at least one — and the cheapest to fix
once you can see it.

## The signature

An artifact introduces a field, a case, or a dependency in one block, then somewhere
else enumerates "the fields" or "the cases" and omits it. Nothing is wrong locally. Both
blocks read fine. The artifact simply disagrees with itself about what exists.

A strict reviewer cannot distinguish this from an invented field, and grades it as one.
That is the important asymmetry: **an omission in your own enumeration is read as a
fabrication in your content**, which is a far more serious finding than the clerical
error that actually occurred.

## Why the obvious repair is insufficient

The reflex is to add the missing name to the list. That fixes this instance and leaves
the class intact — the next edit that adds a field will do it again, because nothing in
the artifact forces the two places to agree.

## The procedure

Write the closure as a **sum whose terms are named**, not as a list:

> The record ships THIRTEEN fields: *[all thirteen named]*. This step reads ELEVEN of
> them — *[each, with what it is used for]*. It reads neither of the remaining TWO, and
> each has an owner elsewhere: *[field]* belongs to *[sibling]*, *[field]* to
> *[sibling]*. Eleven read plus two owned elsewhere is thirteen.

Three properties make this work. It states a total, so a missing entry is arithmetically
visible rather than invisible. It gives every element a *disposition* — read here, or
owned there by name — so an element cannot be quietly dropped. And it makes the
artifact's relationship to its siblings explicit, which is the surface a sibling-aware
reviewer checks first.

**Produce the counts by machine.** A closure claim that does not add up is worse than no
closure claim: in one measured pass an artifact whose text said "ten" over eleven names
was caught immediately and called a gate that would fail the row it was written to pass.
Interpolate the total from the array length rather than typing it — see
`interpolated-counts-over-typed-counts`.

## When the enumeration exposes an orphan

Auditing closure routinely surfaces a field that exists on the record, is cited by
siblings as appearing to the player, and is consumed by nothing. The cheap repairs are
to delete the field or to delete the siblings' citations. Both are the weakening move,
and both lower the pair.

**If two siblings independently assume a thing exists, the missing thing is real — build
it.** In one catalog adding the orphaned field to the display format took it from one
line to two, changed four resolved examples and re-derived six budgets, and made both
siblings' sentences true at once.

## Decision rules

- **When an artifact enumerates a schema it does not own, state the total and the split
  by owner** — never a bare list of the subset it uses.
- **When a count appears in prose, derive it from the structure it counts.** A typed
  count is a stale count waiting for the next edit.
- **When an enumeration and a usage disagree, do not assume the enumeration is right.**
  Check which siblings depend on each reading first; the usage is often the truth and
  the list is the error.
- **When a field has no consumer, look for the consumer the artifact forgot** before
  deleting anything.

## When NOT to use this

- **Do not force closure on a genuinely open set.** Some lists are exemplary rather than
  exhaustive ("statuses include…"). Say which kind it is; a list that does not claim
  completeness does not need to prove it, and dressing an open set in a false total is
  the same defect pointing the other way.
- **Do not enumerate a sibling's schema in full when you consume two fields of it.**
  Cite the owner and name what you read. Restating a schema you do not own creates a
  second copy to drift, which is what `quantity-ownership-and-the-bindable-row` exists
  to prevent.
