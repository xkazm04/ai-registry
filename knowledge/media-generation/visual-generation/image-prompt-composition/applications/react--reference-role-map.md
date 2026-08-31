---
layer: application
type: application
subject: image-prompt-composition
technique: reference-role-map
stack: react
status: forged
verified_on: 2026-08-31
verified_against: react@19
applied: simulation
ab_verdict: unmeasurable
---

# React: a reference is a bag of bytes, and the split is a binary

*Verified against the consuming tree at commit `7637553`, 2026-08-31.*

The technique gained an amendment this run: where two references merge in one
frame, the beats must author the **interaction** between them, because the
relation belongs to neither reference and a map with one row per asset has no
row that can hold one. This tree runs a governed multi-vendor imaging
chokepoint and composes prompts carefully, so it is the right place to look —
and the honest result is that the amendment's precondition is absent here. The
value is in what the absence is made of.

## The seam

`lib/imaging/types.ts:83` is where a reference's role would be declared, and
nothing declares one:

```
references?: ImageRef[];
```

`ImageRef` (`:44`) is `{ base64, mime, width?, height? }` — bytes, a media
type and two optional dimensions. There is no role field, so the map the
technique asks for cannot be expressed in the type at all. The file header
scopes the array by comment rather than by type: *"generate — a text prompt
(+ approved style references) → plate images"*. One reference class, named in
prose.

## A and B, over three shipped cases

**A** — the shipped policy: an unroled reference bag, scoped to style by
convention. **B** — the amendment: where two references merge in one frame,
the beats author how the subject meets the plate's light, floor, scale and
atmosphere.

1. **The style-transfer path.** `lib/foundry/extract/prompts.ts` carries
   `TRANSFER_SCENES` — four neutral scene descriptions a style is transferred
   onto, chosen so that "a recipe that survives here carried the LOOK, not the
   content". The call is one image reference plus a text scene. **Both arms
   are identical**, and the amendment correctly changes nothing: its own scope
   line says a single reference class keeps the simple rule. This case is the
   range, and it is the one worth stating first.
2. **The edit endpoint.** `app/api/imaging/edit/route.ts` over
   `EditRequest { image, instruction, references? }` is the one place in the
   tree with two image inputs, and it is where a subject-into-plate merge
   would land if the studio grew one. Arm B adds the relation clause to
   `instruction`. **This is the arm that was not run**: judging whether a
   composite reads as integrated needs generation spend and a grader pass, and
   the outcome is the technique's actual claim. Hence the verdict.
3. **The readback vocabulary.** `lib/foundry/extract/types.ts:41-53` splits
   every observation into `look` — the rendering, with nothing about what is
   depicted — and `depiction` — the subject and its staging — over
   `OBSERVABLE_FIELDS`, eleven properties of a rendering: `render_mode`,
   `medium`, `detail_density`, `surface_realism`, `atmospherics`,
   `particle_fx`, `palette_strategy`, `black_handling`, `edge_treatment`,
   `finish`, `focus`. Arm B needs a third thing that is neither. **Prediction:
   if this studio grows composite calls, the binary will not extend to cover
   them**, and the failure will present as inserts that are correctly styled
   and correctly staged and still read as pasted. *Falsifier:* a field in that
   list usable across two images — a light direction, a contact, a scale
   against environment. There is none; all eleven are properties of one
   surface.

## Verdict: unmeasurable

Not `not-better`: the technique did not lose. Its precondition — two
references merging in one frame — does not occur anywhere in this tree, so
case 1 is a no-op by the amendment's own scope and case 3 is a prediction
about a call the studio does not yet make. Case 2 is the real test and it is
not runnable in a research run.

**The instrument that would measure it** is already in this tree: the foundry
verdict grader at `app/api/foundry/runs/[id]/verdicts/route.ts`, run over
composite calls. What is missing is not the grader; it is composite calls to
grade.

## What the tree could not have been built to prove

The `look` / `depiction` split is stated by the codebase as a property of
reading **one** image — `types.ts:57` says so directly: *"What the vision
model reads back off ONE image."* That comment is about a vision readback, not
about compositing, and it was written to explain a singleton mode.

It also happens to be the exact reason the amendment exists. A binary split of
one image's observables has no vocabulary for a relation between two images,
and so a well-built pipeline can carry a complete style contract, a complete
staging contract, a disciplined role convention — and still have nowhere to
put *the subject is lit by the lamp that is already in the room*. Nobody
designed that blind spot; it fell out of the module being single-image, and it
is visible here precisely because everything around it is done well.

## What this realization cannot do

It cannot judge composites, because it does not make any. The role convention
is enforced by a comment rather than by the type, so a second reference class
can enter the array without anything failing — which is the change that would
move this row from `unmeasurable` to a real measurement, and the return
condition it is filed under.
