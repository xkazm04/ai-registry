# Higgsfield as the `video_generation` composition connector

What was learned mapping this recipe onto Higgsfield specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**Renders are asynchronous, so a submitted job is a third state and the recipe has to hold
it.** A slow render and a failed render look identical for as long as nobody asks. Poll,
carry an expected end, and report a provider error as an error rather than as a run that is
still going. This is the concrete case behind the outcome that says a requested render must
be visible as still running: without it, an announcement sits in limbo and the operator
finds out by noticing it never shipped.

**Generated motion cannot show the product.** This connector makes footage; it does not know
what the feature looks like. An announcement whose job is to demonstrate something needs a
capture of the real interface, and the honest shape of that adoption is generated footage
around a real recording rather than generated footage instead of one. Deciding which of the
two this announcement is belongs in the strategy step, before the script, because it changes
what the script can promise.

**No audio comes back, so the composition owns the mux.** Voiceover, footage and captions are
joined outside this connector, which is why the recipe carries a local dependency at all.
Verify that at adoption rather than at the first render: the failure appears at the end of
the pipeline, after everything expensive has already been spent.

**The category is thin.** In a typical catalog there are very few connectors carrying video
generation, so an adopter choosing this type is often choosing between one option and none.
Plan the recipe around the constraints of what is available rather than around a comparison
that does not exist.

## What transfers to any generation connector with async jobs

- A submitted job is a state, not a pending return value. Give it an expected end and a way
  to be found again.
- Ask what the connector cannot show. Generated footage and a real interface are different
  claims about the product.
- Where the connector does not produce the finished artifact, the local composition step is
  a dependency to verify before the first expensive run, not after it.
