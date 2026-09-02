---
layer: technique
type: technique
subject: sprite-and-atlas-production
technique: lossy-compression-acceptance-for-flat-art
status: forged
laws: [no-gate-self-certifies, structural-proof-is-never-sufficient, unmeasured-is-not-a-pass]
shared_with: []
use_when: [choosing the compression path for a two-dimensional art class, coloured halos appear along outlines after a build, deciding whether an asset class may take a lossy path, defending the memory cost of a lossless path]
---

# Lossy compression acceptance for flat art

## The concern

Compression schemes are tuned for the images their designers had. Fixed-rate block compression —
divide the image into small blocks, store a pair of endpoint colours per block, give each pixel a
couple of bits selecting a point along the line between them — is tuned for photographic and
painterly surfaces, where a small neighbourhood really does hold colours near a line and a small
error disappears into the texture.

Flat art breaks both assumptions in the same block. A block straddling a dark outline between two
flat fills holds three colours that are nowhere near a line, and the encoder must approximate. The
approximation appears as invented intermediate colours smeared along the outline — exactly the
edge the style consists of. The identical encoder is invisible on a rock face and disfiguring on
an icon, which is why this is a decision per class of art and never a global setting.

The transform-and-quantise family used for photographic delivery fails the same content in its own
way: ringing around hard edges, and colour detail thrown away outright by chroma subsampling, which
is catastrophic for saturated flat regions and for anything carrying text.

## Procedure

1. **Classify the art, not the asset.** Flat regions plus hard edges plus small text is one class:
   interface, icons, pixel art, line art, tile sets, readable labels. Continuous tone with soft
   gradients and noise is another. The class decides the path; individual assets do not get to
   argue.
2. **Assign a path per class, with the memory consequence stated.** Flat classes take a lossless or
   palette-indexed path. Continuous-tone classes take the block-compressed path. Write the memory
   difference down at the same time, because the entire pressure to reverse this decision arrives
   later as a memory number with no picture attached.
3. **Where a lossy path is unavoidable, prefer the encoding that spends its bits on endpoints
   rather than on smoothness.** Within the block-compressed family, modes with more endpoint
   precision and more partitioning cost the same memory and handle hard edges far better than the
   oldest fixed four-colour mode. Choosing badly inside the family is a self-inflicted wound.
4. **Measure the encoded result against the source, on edges.** A whole-image average error is the
   wrong instrument: the damage is concentrated on a small fraction of pixels and an average over a
   mostly-flat image reports it as negligible. Measure the maximum error, and measure error
   restricted to pixels adjacent to a strong gradient. Those two numbers see the halo; the mean does
   not.
5. **Look at the difference image at least once per class.** Not per asset — per class, when the
   path is chosen. A subtraction against the source shows a halo as a bright outline of the artwork
   and is immediately legible to a non-specialist, which matters when the decision has to be
   defended to whoever owns the memory budget.
6. **Record the path and the measurement with the asset.** Which encoding, which mode, what the
   edge error was. That record is what makes the decision revisitable when the platform changes.

## Decision rules

- **When the encoder reports success, that is a self-report and not a verdict.**
  ([no-gate-self-certifies](../../../../_laws.md#no-gate-self-certifies)) Every encoder succeeds on
  every input; success means it produced output, not that the art survived. The authority is a
  separate comparison against the source.
- **When the asset loads and renders, that is structural proof and nothing more.**
  ([structural-proof-is-never-sufficient](../../../../_laws.md#structural-proof-is-never-sufficient))
  Compression damage never breaks loading. It is a perceptual failure downstream of a completely
  successful technical pipeline, which is why nothing in a build log will ever mention it.
- **When the art carries text or a thin single-pixel outline, the lossy path is closed.** Not
  discouraged — closed. Both are destroyed at the scale of the block, and no parameter recovers a
  line thinner than the encoder's own quantisation.
- **When the art has a hard transparency cutout, treat the transparency channel as the constraint.**
  Schemes that store transparency at low precision, or interpolate it, produce ragged and unstable
  silhouettes that read as a broken sprite rather than as a compression artefact.
- **When memory pressure demands a lossy path for a flat class, reduce the resolution on the grid
  instead.** Halving the authored size costs a quarter of the memory and keeps the edges intact,
  which nearly always looks better than the same asset large and haloed. Reducing on a whole-number
  factor keeps the grid contract.
- **When a class was never measured, its state is unmeasured, not acceptable.**
  ([unmeasured-is-not-a-pass](../../../../_laws.md#unmeasured-is-not-a-pass)) A library where nobody
  can say which classes were compared against their sources cannot answer the one question that
  matters when a platform's encoder changes under it.
- **When a platform forces a different encoder per target, the decision is per target.** The same
  source art can be clean on one target and haloed on another, so the measurement belongs to the
  target's output, not to the source.

## When NOT to use it

- **Continuous-tone art**, where block compression is close to free and the memory saving is real.
  Applying the flat-art rule everywhere is how a project ends up unable to fit its own backgrounds.
- **Source and intermediate artifacts.** Working files stay lossless as a matter of course; this
  technique is about what ships, and applying it upstream just restates a rule that was never in
  question.
- **Art that is downsampled far below its authored size at runtime.** Once a sprite is drawn at a
  fraction of its authored size, edge damage is dominated by the resampling, and the strict rule
  buys memory for nothing.

## What this technique does not tell you

A clean compression result says only that what ships resembles what was authored. It says nothing
about whether what was authored was any good, whether it matches its siblings, or whether it is on
the grid. It is a fidelity check against a source, and it inherits every defect that source already
had.
