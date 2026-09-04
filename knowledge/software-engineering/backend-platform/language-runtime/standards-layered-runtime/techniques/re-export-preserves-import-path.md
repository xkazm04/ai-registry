---
layer: technique
type: technique
subject: standards-layered-runtime
technique: re-export-preserves-import-path
status: forged
laws: [identity-survives-reuse, deletion-is-not-repair]
shared_with: []
use_when: [moving an API from the extras layer into a standard package, retiring a historical import path after a migration, reviewing a migration commit that changed where a type is defined]
---

# Re-export preserves import path

When an API moves between layers — most often downward, from the extras layer
into a standard's package once the standard adopts it — every embedder that
imported it from the old home has a path in its source that must keep
resolving, and every type they hold must remain the *same* type. The
technique is that **the old layer re-exports the moved API under its
historical name**: the definition now lives in the lower package, the upper
package's module of the same name becomes a re-export of it, and both paths
name one type.

The rule sounds like courtesy and is actually correctness. A migration that
copies the API instead of re-exporting it leaves two types with one name in
two packages; an embedder holding a value from the old path cannot pass it to
a function that takes the new one, and the compiler's message names two
identical-looking types. That is a broken identity
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)): the
entity was reused in a new home and its identity did not survive. A re-export
is the mechanism by which it does.

## The migration step

A single move, in one change:

1. Cut the API's module out of the upper layer and place it in the lower
   package, adjusting its internal imports to the lower package's vocabulary.
   The module's status header
   ([status-header-per-api](./status-header-per-api.md)) loses its placement
   marker in the same change.
2. In the upper layer, at the module's old path, write a re-export of the
   lower package's module, annotated as a re-export so a reader following the
   old path learns the new home. Where the upper layer exposed a flat list of
   names at its root, each of those becomes a re-export too.
3. If the upper layer's registration installed the API as part of its
   baseline, it continues to — the registration now calls the lower package's
   registrar for that API, and the upper layer's installed set is unchanged
   from an embedder's point of view.

**When the moved API's registration signature differs between the layers,
the move is not ready**, because a re-export preserves the type but not the
calling convention, and an embedder whose code registered the API by hand will
break. Align the signature first, under the extension trait
([baseline-plus-extension-tuple](./baseline-plus-extension-tuple.md)), then
move.

## Whole-package re-export

The extras layer re-exports the entire standard package it builds on, under
one module name, so that an embedder depending on the extras layer reaches the
standard's types without a second dependency line. This is the same technique
at package scale, and the same identity property holds: a value created through
the extras layer's re-export and one created through a direct dependency on
the standard package are the same type, provided both resolve to the same
version. **When an embedder depends on both packages directly, its lockfile
must pin both to one version**, because two versions of the standard package in
one build are two types again, re-export or not.

## When the re-export may go

A re-export is a promise to old callers, and it is kept until the callers are
gone or told. **Retire a historical path only across a major version, with the
deprecation announced at least one release ahead**, and do it by removing the
re-export, not the API — the API lives on at its new home. **Never remove a
re-export to silence a deprecation warning in the runtime's own code**; that
is [deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair) in a
small costume — the warning was the record that callers exist, and deleting
the path converts a visible obligation into a broken downstream build.

## When not to use it

An API that has never shipped in a release has no callers to preserve; move it
outright. And an API moving *out* of a standard package because the standard
dropped it should not be re-exported from the standard package afterwards —
that would keep a non-standard name inside the package whose whole purpose is
to contain only standard names. Move it up, re-export nothing downward, and
let the standard package's changelog record the removal.
