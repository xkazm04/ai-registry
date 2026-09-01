---
layer: technique
type: technique
subject: docs-sync
technique: rendered-surface-coupling
status: forged
laws: [derivation-names-recomputation, gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [a document's figures are rendered from something that keeps changing, a regeneration diff goes red on a toolchain upgrade that changed no content, a rot scan reports clean over documents whose pictures it never opened]
---

# Rendered-surface coupling

A maintained document acquires pictures: a capture of a screen the product no
longer draws that way, a diagram rendered from a definition somebody has since
edited, a composite assembled from the document's own output. Each is a
**derived artifact coupled to a source**, which is the same substance as the
prose around it and carries the same standing claim
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
It also rots faster than the prose, because nobody rereads a picture.

The reason this needs its own technique is that the corpus already holds two
disciplines for derived artifacts, and **a rendered surface is disqualified by
each of them for a different reason**, so both owners can correctly say it is
not theirs.

## Why the regeneration diff cannot be the gate

The general discipline for a derived artifact is to commit the output,
regenerate it in the gate, and fail on the difference
([codegen](../../../build-and-release/codegen/codegen.md) owns this). That works
because a generator is a function and its output is byte-stable, which makes a
diff a proof rather than an opinion.

Rasterization is not byte-stable. Glyph hinting, the rasterizer's version, the
image encoder's settings and the colour profile all move the bytes while the
picture stays identical to any reader. A gate built on the output diff
therefore goes red on a toolchain upgrade that changed nothing a human can see,
and it goes red on the machine of whoever regenerated it last. A gate that is
red for reasons unrelated to correctness is switched off inside a month, and
then the artifact is not merely ungated but ungated *with a gate in the
repository*, which reads to every subsequent maintainer as coverage.

## Why the rot scan cannot see it either

The other discipline is the scan
([doc-rot-detection](./doc-rot-detection.md)), which resolves each document's
coupled sources through a ladder and judges whether the document is still a
plausible description of them. Every rung of that ladder assumes the artifact
can be **read**. An image cannot. Its coupling can never be established by
inspection, so it terminates at the ladder's third rung and is `unverifiable` -
not occasionally, the way an unmapped document is, but **permanently and by
construction**.

That is the honest verdict and it must be reported as one. The population
matters more here than elsewhere: a sweep that counts documents examined while
silently omitting their figures is counting the wrong denominator
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)), and
the reader of that report will conclude the pictures were checked.

## Gate the inputs, never the output

The resolution is to stop comparing what came out and start comparing what went
in. The figure declares a digest of its **input set**, the gate recomputes that
digest, and a move fails the build. Output bytes are never compared, so the
rasterizer is free to change and the gate stays quiet.

The input set is the whole design decision, and it fails in both directions:

- **Too narrow** - the source document alone. The renderer is then outside the
  coupling, and an upgrade changes the picture with the digest unmoved: a silent
  substitution behind a green gate, which is worse than no gate at all
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) inverted -
  the guard is present and lying).
- **Too wide** - the toolchain lockfile, the whole theme directory, the
  repository. The digest then moves on every dependency bump and the gate is
  back to being always-red for content-irrelevant reasons.

What belongs in it is the source document, the **parameters** that selected this
rendering (the viewport, the theme or token block, the page or frame chosen),
and the **renderer's identity** at whatever granularity actually changes the
output. Three things, each with a stated reason for being there; anything a
maintainer cannot justify aloud is noise that will eventually make the gate
untrustworthy.

## The checklist item is the failure, not the fix

The observed shape of this defect is not an absent obligation. It is an
obligation recorded where nothing executes it: a line in a review template
asking the author to re-run the generator if the source moved, or a paragraph in
a contributing guide saying the imagery is generated. Both state the coupling
correctly and neither observes the change they gate
([gate-sees-target](../../../../_laws.md#gate-sees-target)), so both are
discharged by whoever is in a hurry, and the discharge leaves no trace that
distinguishes "I re-rendered it" from "I ticked the box".

A repository can hold the remedy and still not apply it. One first-party
codebase surveyed for this technique implements exactly the input-digest
discipline for every quoted snippet inside the documents it generates - each
citation carries the digest of the source lines it quotes, and a dependency-free
sweep verifies them in milliseconds - while the composite image on its own
landing page, whose generator's docstring states plainly that it rots the same
way, is guarded by a review-template checkbox and nothing else. The discipline
was one directory away and one level of abstraction from where it was needed.
That is the ordinary case: the team that cares enough to build the checker is
the team whose own shopfront is unchecked, because the shopfront is the surface
nobody thinks of as an artifact.
