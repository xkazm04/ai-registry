# Leonardo AI as the `image_generation` connector

What was learned mapping this recipe onto Leonardo as the generator for product surfaces.
Nothing here is part of the recipe: swap the connector and this file stops applying while
the recipe does not change.

## What the mapping has to decide

**A content policy refusal is a normal outcome and needs its own path.** Brand work runs
into refusals on ordinary terms: a product name that collides with something restricted, a
described person, a brand reference in the prompt. Report the refusal with the terms that
triggered it and stop, rather than paraphrasing and retrying until something gets through.
A blind retry loop spends the iteration budget the recipe deliberately bounded, and it
usually arrives somewhere further from the brief than the first attempt was.

**The generator's dimensions are a menu, and the surface's are not.** Available sizes and
aspect ratios are fixed by the model, while the layout wants what the layout wants.
Generate at the nearest supported ratio and crop deliberately to the target, deciding at
adoption where the crop comes from, because a centre crop moves the subject and an asset
that passed a composition check before cropping has not passed one after.

**Do not ask it to render the text.** Where a surface needs words on an image, generate the
image without them and compose the text over it in the delivery step. That removes the most
common failure this recipe checks for, and it also makes the asset reusable when the copy
changes, which it will. Where text really has to be generated, the transcription check is
not optional.

**Vector is not on the menu.** An icon set brief cannot be satisfied by this connector
alone: what comes back is raster at a fixed size. Either the brief resolves to raster, or
the delivery step includes a trace, and either way that is a decision to make at adoption
rather than at delivery when the surface rejects it.

## What transfers to any image connector

- Refusals are reported, not retried around.
- The generator's supported sizes and the surface's required size are two different sets;
  the crop between them is a composition decision.
- Compose copy over the image rather than into it, wherever the surface allows it.
