# Higgsfield as the `image_generation` connector

What was learned mapping this recipe onto Higgsfield specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**Steering is preset shaped, not negative shaped.** The direction is set by choosing a
style and describing what is wanted, and there is no reliable channel for describing what
is not. That changes how the recipe's rejection loop has to work here: a reason like "the
compositions are always centred" cannot be handed to the generator as an exclusion and has
to be converted into a positive constraint the curator agrees with, or into a different
preset. Doing that conversion is a judgment call, so it belongs in the presentation to the
curator rather than in the agent's own head. Say which rejection produced which change.

**The account is likely also serving a video recipe, and that is a reason to pick it.**
This connector generates motion as well as stills, so a kept still can be the source frame
for a later animation, and the same credit pool covers both. Where an adopter runs both
this recipe and a video production one, the kept library becomes the shared input and the
naming has to be decided once for both rather than twice.

**Preset drift is invisible in the record unless it is written down.** Because the style
lives in a preset rather than in the prompt text, two pieces with identical prompts can be
made months apart and look nothing alike. The preset identifier belongs in the record next
to the model version, and it is the first thing to check when a curator says the library
has started to look different without anyone changing anything.

## What transfers to any image connector

- Where the connector cannot be steered away from something, a rejection has to be
  translated into a positive constraint, and the translation is a decision to surface.
- Anything that carries style outside the prompt text is part of the record. A preset, a
  style reference or a finetune is as load bearing as the model version.
- Choosing one connector that covers two recipes makes the kept library a shared artifact,
  which is a naming decision before it is a storage one.
