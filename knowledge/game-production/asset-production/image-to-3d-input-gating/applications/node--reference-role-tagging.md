---
layer: application
type: application
subject: image-to-3d-input-gating
technique: reference-role-tagging
stack: node
status: forged
verified_on: 2026-08-20
---

# A declared role table with a numeric assembly order

`src/lib/visual-gen/reference-roles.ts:30-60` in the PoF repo
(`C:\Users\kazda\kiro\pof`) is the technique as a data table: four roles, each with an id, a
label, a description, a `promptCue`, and an `order`.

## The table

| id | supplies | order |
|---|---|---|
| `blocking` | camera path, composition, motion and timing — "the control anchor" | 1 |
| `style` | lighting, mood and material properties | 2 |
| `multiview-master` | all sides plus a face close-up, so identity holds on unshown angles | 3 |
| `identity` | the subject's exact design — shape, proportions, key details | 4 |

The field comment states the ordering rule outright: *"Assembly order (lower first) —
blocking anchors the shot, identity must-match last."* That is the counter-intuitive half of
the technique in one line, and it is why the master goes last rather than first: later
references refine earlier ones, so the reference that must not be overruled speaks last.

## The role is a sentence, not a tag

Each role carries a `promptCue` with a `{ref}` placeholder — for `identity`, *"Use {ref} as
the master identity reference — the subject must match it exactly (shape, proportions, key
details)."* The role is therefore rendered into the request text, not merely recorded
alongside it. `GEN_PROMPTING_PRACTICES` (`:74-130`) states the underlying practice directly:
*"Tag every reference with its role, explicitly, in the prompt. State what each reference is
FOR."*

`ROLE_IDS` and `getReferenceRole(id)` (`:62-66`) close the vocabulary — a role that is not in
the table cannot be assigned, which is what keeps the set from growing an untagged
"miscellaneous" bucket.

## Colour and material, split

The practice list carries the split as its own entry: *"Split the color map from the PBR
material set — AI for color, layered materials for properties."* Generated **colour**
(albedo/base-colour) is production-usable with light post-processing; roughness, metalness and
height are not, and are layered on top procedurally. The input-side consequence is the one the
technique states: a single reference asked to supply both teaches the reconstruction that a
highlight is a colour. Note the deviation — this table's `style` role bundles lighting and
material together, so the split lives in the practice prose rather than in the role
vocabulary. The standard is two roles.

## What this table is for, and its seam

These four roles are shaped by a video-generation flow — `blocking` is a grayscale 3D play
blast that fixes camera and timing, which only exists when the output is a shot. For a pure
image-to-3D reconstruction the analogous anchor is the form/silhouette view. The
transplantable part is not the role names: it is that roles are enumerated, that each declares
what it supplies, that each renders itself into the request, and that assembly order is a
number on the role rather than the sequence a file was attached in.

Composing the prompt around those references — style locking, narrative, provider routing — is
generic generative-media craft and lives outside this bundle. What belongs here is only what a
reconstruction demands of the images it consumes.
