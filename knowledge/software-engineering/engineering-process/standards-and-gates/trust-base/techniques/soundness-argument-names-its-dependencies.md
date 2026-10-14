---
layer: technique
type: technique
subject: trust-base
technique: soundness-argument-names-its-dependencies
status: forged
laws: []
shared_with: []
use_when: [an escape hatch is sound only because of a declaration made elsewhere, a pointer cast reads data a constructor is supposed to have appended, a representation attribute is load-bearing for a distant block, auditing which escape sites carry a justification]
---

# A soundness argument names its dependencies

The shortest justification for an escape hatch is "this is fine because the
caller checked", and it is nearly always an argument about something that is not
on the page. A cast that reinterprets trailing bytes as a typed value is sound
because the type has a fixed, known layout, because a constructor always appended
those bytes, and because the length arithmetic cannot underflow. None of those
three facts is local to the cast. Each can be broken by an edit to a file the
person editing never opens, and the cast keeps compiling.

The technique is to treat the argument as a graph and write both ends of every
edge.

## Two ends, both written

1. **At the site**, state the argument as a list of the facts it needs, each with
   the place that establishes it. "Sound because the hash type has a fixed layout
   (its declaration), because every construction path appends exactly one hash
   (the constructor), and because the stored length is never less than the hash
   length (the same constructor)."
2. **At each dependency**, state that something else rests on it. The layout
   attribute carries a comment that a distant cast depends on it; the constructor
   notes that a reader assumes the trailing bytes exist. Without this end, the
   dependency is a silent coupling, and an edit that removes it looks like a
   cleanup.

A one-directional note decays: the site's list goes stale when a dependency is
refactored away, and the dependency has no signal that it matters. A two-ended
note makes the edit that breaks the argument visible from either side, in a
search for the dependency's name or in a review of the site.

## The three common shapes

- **Layout dependence.** The code reinterprets memory as a type. The type's
  representation must be declared stable (no reordering, no padding surprises), and
  that declaration is the dependency. If the declaration is absent, the argument is
  not merely undocumented; it is false, and only the optimizer's current choices make
  it work.
- **Constructor dependence.** The code reads data that a particular constructor is
  required to have put there. The dependency is every construction path. State that
  this is the *only* path, or enumerate them. A second constructor added later is an
  edit that must be checked against the cast.
- **Containment dependence.** A pointer computed from a base and an offset stays
  inside one allocation. The dependency is the length bookkeeping, and the
  arithmetic should be checkable in one place, ideally an assertion in debug builds
  that the offset is within the allocation.

## What a lint can and cannot enforce

Lints exist for the block form: require a note adjacent to each unsafe block.
That covers the first end of the first kind of site. It does not cover hand-written
markers on types (see [the marker discipline](./marker-impl-names-its-exclusion.md)),
nor the second end of any edge, because a lint can require that a comment exist
and cannot read what it depends on. Run the lint, but report it as coverage of one
spelling. A clean lint is evidence about blocks only. A two-ended note is a manual
discipline checked at review, and the measure that tells you whether it is working
is the fraction of sites whose note names a dependency, not the fraction that has a
note at all.

## Decision rules

- **If a site's argument needs a fact from another file, name the file's
  declaration, not a vague "the caller guarantees".** The reader must be able to
  search for it.
- **If a dependency can be turned into an assertion, turn it into one.** A length
  check at the site converts one edge into a local fact. Do this before writing the
  prose.
- **If a dependency is a declaration, annotate it where it is made.** The attribute
  or constructor gets the second end.
- **Count undocumented sites with the predicate attached.** "Sites with any note"
  and "sites whose note names its dependency" are different numbers, and the second
  is the one that predicts drift.

## When not to use it

- **When the site is locally sound.** A cast of a freshly allocated buffer of known
  size, with the size right above it, needs no remote dependency list.
- **When the dependency set is the whole program.** An argument that rests on "the
  entire module never does X" is a design smell, not something to document. Narrow
  the visibility so that the module's author can actually check the claim.
