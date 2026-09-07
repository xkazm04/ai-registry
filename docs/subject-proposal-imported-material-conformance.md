# Subject proposal — `imported-material-conformance`

**Status:** **EXECUTED 2026-09-07** - forged in the same session by one worker under
`/intake` Phase 7, reviewed against the diff, gate-clean.

**Overrides the worker made, all accepted by the director:**
1. **Link depth in this spec was wrong.** It said five levels to `_laws.md`; the correct
   depth is four, confirmed against `shader-budget-authoring/techniques/channel-packing.md`
   at identical depth. Five would have failed the link check.
2. **Open question 1 (object identity) resolved as OUT.** The worker agreed with the intake
   read and strengthened it: the "non-geometric property that does not survive" shape is not
   specific to identity - pivot placement, LOD grouping and collision intent share it - and
   that generality is what makes it a wider content-pipeline observation rather than a
   seventh technique here. It stays the source note's lead.
3. **The golden path's spine was restructured** from this spec's "three disagreements" to
   three shapes of failure with three different fix locations - misread (convert at the
   edge), never stated (a defaults policy), unaddressable (materialise inside the import) -
   because that is what routes a symptom to a remedy. The opening claim is now that the
   information usually *arrives intact and is misread*, which distinguishes this subject
   from its twin, whose spine is information destroyed upstream.
4. **Technique 6 was rewritten from a diagnosis into a migration procedure** for a team
   whose pipeline is already broken - inventory the corrector's rules, classify each as
   boundary or asset, move the boundary half into the edge one rule at a time behind a
   swatch case, rehome the asset half, delete it. Every other technique assumes the edge is
   being built fresh.
5. **Technique 2 was widened**, and this is the substantive find the spec did not have: the
   gloss mismatch is a **relocation and a negation at once**, because the two conventions
   disagree about which texture and which channel hold the quantity as well as about its
   sense. The two halves fail differently, and negating a factor and a map separately
   negates twice - which looks from outside exactly like a conversion that never ran.

**Neighbour overlap found and handled:** `shader-budget-authoring/techniques/channel-packing.md`
already states the per-role transfer-curve rule from the *authoring* side. Not a conflict of
fact, but a real risk of two authorities; the worker adopted that neighbour's existing
vocabulary and wrote the boundary explicitly into the golden path (that subject decides what
to pack when authoring, this one reads what a format already packed when receiving).

Original proposal follows, unedited except for this header and the draft pointer.
**Bundle:** `game-production`
**Category:** `asset-production` › `surface-and-imagery` (subcategory, subjects only)
**Resolved path:** `knowledge/game-production/asset-production/surface-and-imagery/imported-material-conformance/`
**Link depth from a technique to `_laws.md`:** `../../../../../_laws.md`
**Raised by:** `/intake`, 2026-09-07, from
[`librarian/sources/2026-09-07-medieval-house-interior.md`](../librarian/sources/2026-09-07-medieval-house-interior.md)
**Engine:** `domain-knowledge-forge` — read [`forge-brief.md`](forge-brief.md) first; it is the contract.

---

## Why this is `XL` and not one technique in an existing subject

Because two adjacent subjects were opened, and **both of them explicitly disclaim this
ground in their own closing sections**. That is not a slug-matching accident; it is the
corpus stating a boundary twice and leaving the far side empty.

- `geometry/generated-asset-world-scale` holds the import edge for transforms
  (`unit-convention-at-the-engine-edge`, `import-scale-derivation`) and closes:
  *"what belongs here is only whether the output can be the right size."*
- `geometry/mesh-finishing-for-engine-readiness` runs the bench to `bind` and closes:
  *"It does not judge whether a tiling material reads correctly, nor whether the finished
  asset's material stays inside a shader's sampler ceiling"* — and routes world scale away
  as *"an import-edge decision with its own authority."*
- `surface-and-imagery/shader-budget-authoring` is about **authoring** a material against a
  renderer's hard and soft limits, not about receiving one across a boundary.
- `surface-and-imagery/tiling-texture-acceptance` judges whether a tile *reads* — seams,
  texel density, wrap — not whether a delivered material was converted correctly.

So a delivered surface crossing into a renderer has four neighbours and no owner, and each
neighbour names a different one of the others.

The second reason is a stronger one, and it is what makes this a layer rather than an
omission. `unit-convention-at-the-engine-edge` opens by asserting that formats and engines
*"disagree about two things at once"* — unit and axis — and that **"both disagreements
produce an asset that looks plausible and is wrong by a fixed factor."** There is a third
disagreement at the same edge, it is not round, and its non-roundness is precisely why it
survives: it cannot be caught by that technique's own diagnostic (*"a factor of exactly a
hundred is a diagnosis"*), it produces an asset that is merely *cheap-looking*, and
cheap-looking is indistinguishable from "the generator is not very good at materials".
Extending the existing technique would falsify its standing sentence, which is the test
this method uses to separate an amendment from a subject.

## The mechanism, corroborated against the standard

One fetch was spent on the interchange format's own specification (2026-09-07), and it
grounds all three disagreements in normative text rather than in recollection:

- **Colour space is declared per texture role, not per asset.** Base colour and emissive are
  sRGB; metallic-roughness, normal and occlusion are linear. Three of five maps carry
  measurements and two carry appearance, so a single per-asset colour-space policy is wrong
  about three of them whichever policy it picks.
- **The factors default to fully on.** Both the metallic and the roughness factor default to
  `1.0`, so a material that omits them is *fully metallic*.
- **Channel packing is fixed**: roughness in green, metallic in blue, of one texture.
- **Transparency and two-sidedness default to off**: alpha mode defaults to opaque,
  double-sided defaults to false.
- **The gloss axis is inverted between conventions** — roughness (0 = mirror) against
  smoothness (0 = diffuse) — so copying the number across without negating maps the roughest
  possible surface onto the glossiest. **The midpoint is the fixed point of that inversion**,
  which is why a spot check on one mid-grey material clears the bug.

Defaults-on plus an un-negated axis compound into the familiar imported look: everything
shiny. Uniformly shiny across a whole delivery reads as a taste problem, and gets a manual
polish pass rather than a diagnosis.

## Proposed techniques

Each carries its own decision rule and its own failure. A drafter who concludes that any of
them is really a boundary case of a neighbour should say so and drop it rather than pad.

1. **`colour-space-is-per-texture-role`** — the split and why it exists (measurement maps
   versus appearance maps); the diagnostic that the colour reads wrong while the shading
   response reads right; why "half the maps look fine" is evidence *for* this diagnosis.
2. **`gloss-axis-inversion-and-the-midpoint`** — the inversion is not a scale error; the
   midpoint is a fixed point; a material correct in the middle and wrong at both ends is
   diagnostic, and one that is only checked in the middle is untested.
3. **`format-defaults-are-not-asset-properties`** — an asset arriving without a property
   nobody removed is a default being applied, not information being lost. Opaque windows and
   fully metallic plaster. Read the format's default before blaming the exporter; this is the
   rule that stops a team from debugging the wrong tool for a day.
4. **`materialise-on-import`** — an embedded material is not an editable material, so a
   correction has nowhere to live and every delivery re-acquires the defect. Materialisation
   into first-class addressable assets belongs *inside* the import. This is the obligation
   with no analogue on the transform side, where a correction can live as one number.
5. **`surface-conformance-swatch`** — the known-object test for surfaces, and the twin of
   pushing a cube of a stated size through the transform edge. A strip of quads at stated
   gloss values with a stated base colour, a stated alpha mode and one map per texture role.
   **It must straddle the midpoint**: calibrate at both ends, or the ruler reads correct
   while pointing backwards.
6. **`a-fixer-script-is-the-edge-in-the-wrong-place`** — the decay. A project-local script
   that "makes imports look right", run by habit, is the conversion edge written after the
   import instead of inside it: the defect returns with every delivery, the correction is
   re-applied from memory, and the day someone skips it the defect ships. The tell that a
   team has already misdiagnosed a convention error as a quality ceiling.

A draft of the material for techniques 1-5, written before the placement was settled, is
[`librarian/handoffs/2026-09-07-imported-material-conformance-draft.md`](../librarian/handoffs/2026-09-07-imported-material-conformance-draft.md).
It may be used as raw input; it is not authoritative, its frontmatter names a subject it was
never committed to, and the drafter should override it freely.

## Boundaries it must NOT absorb

- **Unit, axis, handedness and world scale** — owned by `generated-asset-world-scale`. This
  subject is the surface half of the same edge and should say so once, in prose, without
  restating the transform rules.
- **Seams, texel density and whether a tile reads** — owned by `tiling-texture-acceptance`.
- **Sampler caps, shading-model selection, channel packing as a budget decision** — owned by
  `shader-budget-authoring`. The overlap on channel packing is real and the boundary is: that
  subject decides what to pack when *authoring*, this one reads what a format packed when
  *receiving*.
- **Retopology, unwrap, bake, bind** — owned by `mesh-finishing-for-engine-readiness`.
- **Structural mesh acceptance** — owned by `generated-mesh-acceptance`.
- **Whether the asset should have been generated at all** — owned by
  `image-to-3d-input-gating`.

## Open questions the drafter must decide, not discover

1. **Does object identity belong here?** A delivered assembly flattens its part names at
   export, and the assembling stage is the only one that knows what each part *is* — so
   naming is cheapest there and impossible later. That is the same shape as the material
   defects (a non-geometric property that does not survive the crossing) but it is not a
   *material*. Decide whether it is a seventh technique here, a lead for a content-pipeline
   subject, or out of scope. The intake run's own read is that it is out of scope for a
   subject named for materials, and that the honest home is the wider law-shaped observation
   recorded as a lead in the source note.
2. **Is the subject named for materials or for the import edge?** The transform half of this
   edge lives inside a subject named for *size*, which understates it. A future taxonomy pass
   might reasonably want one import-edge subject with transform and surface halves. That is an
   `apply-taxonomy.mjs` question and is **out of scope for this forge** — but say in the
   golden path that the edge has two halves in two subjects, so a later pass can find it.
3. **How much of this is renderer-specific?** The rules above must transplant to a studio on
   any engine. Where a convention is genuinely one renderer's choice rather than a general
   disagreement, state it as a class ("a renderer that names the axis smoothness"), never as
   a brand.

## Primaries for the drafter's web budget

- The interchange format specification's materials section — the normative statements listed
  above were read from it on 2026-09-07 and can be re-cited rather than re-derived.
- A renderer's own documentation on the smoothness convention and on colour-space handling at
  import, for the receiving half of the mismatch.
- Anything that states the *default* values, which is where the third disagreement lives.

## Placement, verified against the authority

`knowledge/game-production/taxonomy.json` is the authority, not a directory count.
`asset-production` holds four subcategories; `surface-and-imagery` holds three bare subjects
(`shader-budget-authoring`, `sprite-and-atlas-production`, `tiling-texture-acceptance`) and no
nested subcategories, so a flat fourth subject is legal and well under `MAX_CHILD_DIRS` (10).
The taxonomy entry is **appended** to that subcategory's `subjects` array, never reordered.
