# Gemini vision as the `vision` connector

What was learned mapping this recipe onto a multimodal vision model as the checking step.
Nothing here is part of the recipe: swap the connector and this file stops applying while
the recipe does not change.

## What the mapping has to decide

**Ask closed questions, never for a score.** "Rate this asset out of ten" produces a number
that moves between runs on identical input, so it cannot be compared and cannot be
thresholded honestly. "Transcribe every piece of text visible in this image, verbatim",
"list the dominant colors as hex", "is the subject centred, left or right" all return
answers two runs agree on and a human can check. The text transcription is the single
highest value question here: comparing it against what the asset was meant to say catches
the near words a generator renders, which is the defect most likely to reach production.

**Downsample before asking about legibility.** The model sees the image at whatever
resolution it resizes to, which is not the size the surface renders at. A caption the model
reads perfectly in a full resolution asset can be unreadable in the feed. Resize to the real
render size first, then ask, and the answer starts meaning something.

**Palette conformance is arithmetic once the colors come back.** Ask for dominant colors,
then compare them against the brand's declared values yourself rather than asking the model
whether the asset is on brand. The model has no access to the brand and will answer anyway.

**Absence degrades the recipe rather than breaking it.** Without a vision connector the
checkable properties that come from the file itself, dimensions, aspect ratio, weight and
format, still run; only the ones that need the image read are lost, and the recipe falls
back to human review alone. That is a weaker recipe and worth saying out loud at adoption,
because it changes how much review the human is signing up for.

## What transfers to any vision connector

- A model answers questions. It does not produce measurements. Everything you intend to
  threshold on should be computed from an answer, not returned as one.
- Ask about legibility at the render size, never at the source size.
- Keep the brand comparison on your side of the boundary. The model does not know the brand.
