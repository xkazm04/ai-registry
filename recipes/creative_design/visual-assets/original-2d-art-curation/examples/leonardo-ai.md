# Leonardo AI as the `image_generation` connector

What was learned mapping this recipe onto Leonardo specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**The negative prompt is where a rejection reason becomes an instruction.** This recipe
insists that a discard names a property rather than a feeling, and this connector is why
that insistence pays: "the pose keeps repeating" and "the palette is muddy" can be carried
forward as things to steer away from, without contaminating the positive direction. Decide
at adoption whether recurring rejection reasons accumulate into a standing negative prompt
or are applied per run. A standing one drifts long and eventually excludes the thing the
curator wanted, so it needs its own review.

**The model is a choice, not a constant, and it retires.** Style continuity across a
library comes from holding one model rather than from the prompt, and platform models are
versioned and withdrawn. Record the model identifier with every kept piece. When a model
the library was built on goes away, that is a visible break in the body of work and it
deserves to be presented to the curator as one, not absorbed silently by falling back to
whatever the connector defaults to.

**Cost is per generation, so the variation count is the budget knob.** Dimensions and model
both move the price. The recipe asks for every variation to be presented rather than
filtered, which means the variation count is set by how many decisions the curator is
willing to make in a sitting and by what the run can spend, and those two numbers should be
reconciled at adoption rather than discovered from a credit balance.

## What transfers to any image connector

- A rejection reason is only actionable where the connector has a channel for it. Establish
  what that channel is before promising the curator that repeated objections will stick.
- Record the model version with the piece. Prompt and seed alone do not reproduce anything
  once a provider updates a model.
- The variation count is a budget and a review-load decision at the same time.
