---
layer: technique
type: technique
subject: visual-style-locking
technique: style-onboarding-from-sample
status: forged
laws: [style-is-restated-not-remembered]
shared_with: []
use_when: [a user arrives with a look they cannot describe, importing a house style from existing published work, seeding a new theme from a single admired image]
---

# Style onboarding from sample

Most people who want a consistent look cannot write an attribute grammar for
it — but they can point at an image that has it. This technique turns that
pointing into a ratifiable style artifact: **a style is captured from a
sample, read back into words, edited by a human, and then proofed like any
other style**. It is the acquisition path; everything downstream of it is
the same lifecycle every style goes through.

## Procedure

1. **Take the sample.** A screenshot, a frame from admired work, the user's
   own past output — any single image that carries the look. Provenance
   note: the sample seeds a *description*; the sample itself never becomes
   a production reference, both because it was never approved through the
   gate and because someone else's frame on your reference sheet is a
   rights question as well as a quality one.
2. **Have a vision model read it back as a style block.** The model
   describes the sample *in the attribute grammar's slots* — technique,
   subject treatment, palette with role assignments, finish — not as free
   prose. The schema is the point: free prose reproduces the vibe-word
   problem the grammar exists to kill.
3. **The human edits the block.** This step is load-bearing, not polish.
   The readback is a hypothesis about what makes the sample look the way it
   does; the owner corrects it — tightens a color, strikes an attribute the
   model over-read, names the finish properly. The edit is also where the
   style becomes *theirs*: describable, revisable, ownable.
4. **Generate the reference sheet from the edited block** — on the
   project's canonical test subjects, not on the sample's subject. Renders
   that mimic the sample's content prove nothing about the style
   transferring.
5. **Ratify.** The renders are judged, the sheet accumulates approvals, and
   the style locks through the standard gate. The block plus the approved
   sheet — not the original sample — are now the project's locked style.

## Why the readback matters more than it looks

The naive alternative — attach the sample image to every generation and skip
the words — fails twice over. First, image-only conditioning drifts within
a batch; the textual block is not optional. Second, and more structurally: a
style that exists only as an image is a one-off. The readback converts it
into **words the user can edit**, which is what turns a borrowed look into a
reusable theme — forkable, adjustable, applicable to subjects the sample
never contained. Capture without readback is imitation; capture with
readback is acquisition.

## Decision rules

- When the user's brief is an image rather than words, onboard from the
  sample — do not make them describe what they can only point at.
- When the readback disagrees with the owner's eye, the owner wins — the
  block is theirs, and the readback was a draft.
- When the sample's owner is not the user, treat the sample as inspiration
  for a description, never as a conditioning input — the derived block plus
  a freshly generated sheet is the deliverable.
- When a captured style is reused on a second project, re-proof it there
  before trusting it — a block extracted from one context has been
  validated only within that context; cross-project stability is a claim
  the new project's proofing must earn.
- Record the origin on the artifact (from a brief, from a preset, from a
  sample) — a captured style whose lineage is invisible cannot be audited
  when it later underperforms.

## When not to use it

When the owner already thinks in the grammar — a designer with a palette and
a technique in hand — composing the block directly is faster and cleaner
than laundering it through a sample. And when the sample's appeal is its
*subject* rather than its style (a great photo of a great moment), there is
no style to extract; onboarding it produces a block that describes lighting
and grain nobody actually wanted, and the disappointment surfaces one
proofing round later.
