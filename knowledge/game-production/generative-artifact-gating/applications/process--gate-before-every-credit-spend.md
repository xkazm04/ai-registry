---
layer: application
type: application
subject: generative-artifact-gating
technique: gate-before-every-credit-spend
stack: process
status: forged
---

# Process — gate placement in a paid character pipeline

`pof`'s `character-pipeline` catalog (`src/lib/catalog/pipelines/character-pipeline.ts`) is
a ground-truthed idea→playable-character workflow where every generative stage costs
credits. Its header states the doctrine in one line (`:26`):

> Gates are the moat: EVERY generative step is verified by close-up renders BEFORE the next
> credit spend.

## The stage chain and where the money goes

Face-priority 2D concept (Leonardo GPT Image 2) → **2D face gate** → Tripo v3.1
image-to-3D → **3D face gate** → auto-rig + preset retargets → engine import → playable
wire → game-tier convert. Three of those arrows are paid calls, and each one consumes the
previous stage's output as its input.

## The authored rule

The pipeline's canon entry `charpipe-face-gate` (`src/lib/catalog/canon/canon-seed.ts:75`,
titled "Gate faces BEFORE every credit spend") is the technique in its authored form:

> The source 2D face DETERMINES the 3D face — image-to-3D reproduces (and amplifies)
> whatever it is fed; no downstream model, retexture, or texture-alignment fixes a creepy
> source. Gate the 2D concept (close-up crop: sclera + crisp pupils, natural brows, no
> glow/heavy makeup) AND the generated mesh (headless close-up head renders, front/3q/
> profile) before rig/retarget spend.

Three things to read off it. **Amplification, not merely survival** — the downstream model
elaborates the defect into a representation where it is harder to see and much harder to
remove, which is why the first gate is the valuable one. **Gate fidelity matches the next
consumer** — a close-up crop for the 2D input, headless front/three-quarter/profile head
renders for the mesh, because a face defect is invisible at thumbnail scale and ruinous at
gameplay-camera range. **Both faces of each arrow are gated**: the input to the paid call
and its output, before the next paid call.

The sibling entry `charpipe-model-versions` (`:76`) supplies the economic corollary from a
real loss: "fix quality by regenerating from a better source, not retexturing", after
retexturing an existing mesh with a different reference image smeared it through projection
mismatch. What to do with the rejection is a separate subject; that this pipeline learned
the answer by paying for it three stages down is the point here.

## Terminal proof is perceptual, not structural

`character-pipeline.ts:31-38` declares `packagingExempt` with a reason that names the
evidence rung: *"The terminal proof is the L4 Visual Gate — a gameplay-camera frame — not a
package manifest."* The exemption is *declared* rather than silently absent, which is the
same honesty rule the gates themselves obey.

The pipeline's own gallery steps use `gallerySeed('selected', n, 2)` to record a historical
gate winner at index 2 — and the seeded selection stays `autoSelected`, so the provenance
strip keeps reading `SELECTION: AUTO` rather than claiming a human picked it.

## Corrective feedback at the gate

When a gate rejects, the fix instruction comes from two shared modules rather than from
free-text description:

- `src/components/layout-lab/steps/shared/stepEvidence.ts:1` collects only real served
  URLs (`/api/visual-gen/asset/…`) from the **selected** candidate. Its stated honesty rule
  is *"a swatch is not evidence"* — citing a deterministic gradient "would hand a prompt a
  colour PoF invented and present it as the thing that was produced". A step with nothing
  real yields an empty list and the prompt gains **no section at all**, because an empty
  "Current output" heading would read as "there is no output".
- `src/components/layout-lab/steps/shared/genericFixCopy.ts:5` authors corrective language
  per **archetype**, not per step: nine blocks cover all ~344 steps, on the argument that
  the archetype *is* the deliverable contract and is "the largest unit that can carry a
  real, specific instruction WITHOUT inventing catalog content" — hand-writing 344 bespoke
  ones "would mean inventing target values no checker stated". Before it, 0 of 344 steps
  authored a `fixDirection`, so the fix button dispatched an empty direction: a produce run
  with no instruction at all. `withGenericFixCopy` now guarantees a non-empty direction for
  every non-pass, non-deferred status — and deliberately attaches none on `deferred`, since
  a runtime or visual gate is not locally fixable.
