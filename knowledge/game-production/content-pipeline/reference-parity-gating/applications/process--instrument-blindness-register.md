---
layer: application
type: application
subject: reference-parity-gating
technique: instrument-blindness-register
stack: process
status: forged
verified_on: 2026-08-31
---

# A blindness register kept as incident law

The same public vehicle-rebuild program maintains what this technique calls a register,
though it does not use the word. Its blind spots are recorded across a contract document, a
lessons file whose stated purpose is *"the stories behind the laws"*, and dated owner
rulings — and every entry has the register's four fields in substance: the class, why the
rig cannot see it, the witness that does, and whether that witness is mandatory.
Read at commit `286bd2a`.

## The entries, as the program states them

| Class | Why the rig cannot see it | Witness it assigned |
| --- | --- | --- |
| Reversed winding | comparison masks render double-sided; the game and the critic render single-sided | a left-versus-right render check every round, plus winding guards on every mirrored construction path |
| Mirrored assembly | registration is translation-only | reference-derived orientation asserts, a mirror re-scoring check, and a mandatory human pass |
| Thin axis-aligned components | cross-section cameras clip a ~0.52 m slab, so such a part shows only its end caps | an authoring rule: segment below the slab depth |
| Hollowness | orthographic silhouettes cannot see it at all | shaded top-down and perspective views |
| Not-visible geometry | bounding boxes, framing, hashers and probes all see meshes flagged invisible | deferred construction at the state transition |

Every one of these shipped a defect at a passing score first. The program's own summary of
the winding case is the technique's thesis in one line: *"A whole face of a tank can vanish
while scoring 90+ … The gate STRUCTURALLY cannot see this class."*

## What the realization confirms about the standard

**Witnesses are chosen to not share the failing property, and the program says so.** The
winding entry notes that flood-based tools are blind to the same class for the same reason —
a reversed surface reads as open background rather than as a hole — and concludes *"renders
are the witness."* That is the technique's step 3 reached independently, including its trap.

**A witness's known limit is recorded with the witness.** The mirror check is documented as
catching asymmetric silhouettes and provably failing on near-symmetric ones, where *"the
backwardness lives in shaded features the masks cannot see."* The program therefore requires
three layers rather than treating the check as a solution. This is the discipline the
technique's step 5 asks for, and it is the step most likely to be skipped, because a witness
presented as complete terminates the search.

**Authoring correctives are preferred to instrument changes.** The thin-component entry is
explicit that this is *"a build defect pattern, not a measurement artifact — the pipeline
measures correctly"*, and it carries the number: segmenting one component moved a
cross-section row from 54.2 to 76.1 with no other change. The technique's fourth decision
rule, with a measurement behind it.

## The structural fact the tree carries

The register's existence produced a rule the program would probably not have written
otherwise, and it is the one worth transplanting: **a parity score alone is no longer
allowed to certify anything.** The document states it as *"curve scores alone never certify
a tank again"*, and the mandatory human turntable pass exists because the register was long
enough to make the argument unanswerable.

That is the technique's closing claim arriving as an operational consequence rather than as
doctrine. It is also the answer to the question the technique anticipates — what to say when
someone proposes retiring the human pass because the scores are good. This program's answer
is to read the register aloud, and its length is the argument.

## What this realization cannot do

The register is prose distributed across three documents rather than a queryable artifact,
so nothing enforces that an entry has a witness, and nothing re-derives the register when
the rig's configuration changes. The program has changed rig behaviour repeatedly — a mirror
check, a symmetric coverage term, a resolution change on one dimension row — and each time
the blindness boundary moved without a corresponding review pass. The technique's step 6
is the gap this realization does not fill.

There is also no separation between entries that are structural and entries that are merely
unfixed. The invisible-geometry class was eventually removed at the source by deferring
construction, which by the technique's own guidance means it was a cheap fix rather than a
permanent blindness — but it still reads in the documents as law of the same rank as the
culling mismatch, which cannot be removed at all.
