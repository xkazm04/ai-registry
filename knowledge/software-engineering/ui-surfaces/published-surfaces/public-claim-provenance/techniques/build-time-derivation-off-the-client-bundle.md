---
layer: technique
type: technique
subject: public-claim-provenance
technique: build-time-derivation-off-the-client-bundle
status: forged
laws: [derivation-names-recomputation, gate-sees-target]
shared_with: []
use_when: [a public count must derive from a heavy catalog, deciding where a claim is computed, a marketing page is dragging a data set into the reader's download]
---

# Build-time derivation, off the reader's bundle

The catalog behind a public claim is usually the largest thing the product
owns. Deriving a count from it where the page renders means shipping the whole
catalog to prove a two-digit number — and the number is on the first page a
stranger loads, so the cost lands on exactly the audience the surface was
built to persuade.

That is not primarily a performance problem. It is the mechanism by which
honest surfaces regress. Someone eventually measures the page, finds a
megabyte of catalog behind a headline, and replaces the derived count with a
typed one. In review the change reads as an obvious optimization: the page
gets faster and the number does not move that day. Provenance was traded for
bytes by a person who was never thinking about provenance, and there is no
artifact left recording that a derivation used to be there.

## Reduce where the catalog already lives

The rule is one sentence: **the catalog is reduced to scalars on the producing
side, and only the scalars cross the boundary.** Producing side means wherever
the catalog is already resident and free — the build step, the server render,
the generator that emits the page. Scalars means plain serialisable numbers
and strings: counts, totals, a label. Not a filtered catalog, not a summary
object holding entries, not "just the ids".

The export shape is the mechanism, not the intention. A module whose public
surface is a record of numbers cannot leak a collection, because a number has
no room in it for one. A module that exports a helper taking the catalog as an
argument has leaked it already, whatever the helper returns. When the tooling
supports it, mark the module so that importing it from a reader-side component
fails at build rather than quietly widening the download; a boundary nobody
can cross by accident is worth more than a convention everyone agrees with.

## Derive at build, not merely off the bundle

Moving the derivation off the reader's download is the smaller half. The
larger half is *when* it runs.

A claim derived **at build** ships in the same artifact as the thing it
describes. They cannot disagree, because they were produced by the same
event: a build that adds catalog entries publishes the new count in the same
breath, with no human in the loop, nothing to remember, and no window during
which the page is stale. This is the strongest property a public claim can
have, and it is available for free to any claim whose inputs are known before
deployment — which covers nearly every roadmap, capability list, coverage
strip and catalog counter that has ever drifted.

A claim derived **at request time** is a different animal with different
obligations: it can fail, it can arrive late, and it can arrive partially, so
it inherits the whole load-state discipline of
[degraded-never-claims-live](./degraded-never-claims-live.md). Choose it only
when the inputs genuinely are not known at build — live activity, external
service state, per-viewer values.

A claim **cached into a hand-editable file** is the worst of the three, and it
is common because it looks like the responsible middle. A checked-in number
that was generated once has all the fragility of a derived value and none of
the guarantees: its recomputation path exists only in someone's memory, and
the file's editability means the next drift will be applied by hand and the
generator quietly abandoned. If a value must be materialised, the generator is
committed alongside it, the file says which command regenerates it, and a
check re-runs the generator and fails on divergence
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).

## Derive from the target, never from a stand-in

The derivation must read the artifact the product actually ships
([gate-sees-target](../../../../_laws.md#gate-sees-target)). A count taken from a
manifest listing, a directory scan, a documentation index, or a second list
maintained for the marketing page is a count over a proxy, and a proxy agrees
with its target right up until the moment they diverge — which is precisely
the moment the claim needed to be correct. The tell is that the proxy is
usually *easier* to read than the real thing, which is why it was chosen.

The check that keeps this honest is cheap and worth having: assert that the
derivation's input is the same module, table, or directory the runtime loads,
and fail the build when the two are different objects. Where that assertion is
impossible, at minimum the derivation's declaration names what it read, so the
substitution is visible to a reviewer rather than buried in an import.

## Decision rules

- **When the reduction is expensive, cache the reduction, not the claim.** The
  count is the output; caching it at the boundary is fine, and a cache with a
  named recomputation is not the hand-editable file the section above forbids.
- **When several surfaces show the same derived claim**, they read one
  reduction. Two derivations of one public number will diverge on the first
  filter change, and the page that disagrees with the other page is the single
  most credibility-expensive defect this subject has. The likelier version is
  worse: the second copy is not a derivation at all but a typed default that
  *currently agrees*, and agreement is the most dangerous state a duplicate can
  be in, because there is no visible defect to prompt anyone to fix it. Search
  for the number, not for the derivation.
- **When the catalog is not available at build** (it lives behind a service,
  or is per-tenant), the claim is a runtime claim and takes the runtime rules.
  Do not fake a build-time value from a snapshot taken by hand — that is the
  cached-into-a-file failure with an extra step.
- **When a derived value would be zero because the catalog is empty**, the
  surface renders absence, not zero, and the empty-denominator guard in
  [presentation-invariants-on-derived-values](./presentation-invariants-on-derived-values.md)
  is what keeps it from rendering nonsense.

## When not to use this

A claim whose inputs are small and already present where the page renders
needs no boundary at all; adding a producing-side module for a count over
twelve items is ceremony. The threshold is not a byte count, it is a
direction: does deriving this number cause anything to be downloaded that the
reader would not otherwise receive? If not, derive it in place and spend the
effort on the label discipline instead.
