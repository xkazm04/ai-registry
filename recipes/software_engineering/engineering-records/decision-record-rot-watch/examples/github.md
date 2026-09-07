# A hosted repository as the `source_control` connector, on GitHub

What was learned mapping this recipe onto a hosted repository specifically. Nothing here is
part of the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**The signal is not in the decisions, it is in the world underneath them.** A dependency
removed from a manifest, a client for a retired service deleted, a flag taken out, a
configuration block that stopped being read: those land as ordinary changes that mention no
decision at all. So an assumption watch has to be expressed in terms of concrete artifacts
in the repository rather than in terms of words, and the artifacts have to be named per
decision at adoption. A keyword watch will never fire.

**Where the records live beside the code, a supersession and the change that caused it can
land in the same change request.** That is the only arrangement in which the two stay in
step without anybody having to remember, and it is worth checking for at adoption, because
it changes this recipe from a periodic sweep into something closer to a review comment.

**The record's own edit history is the only honest answer to whether it has ever been
examined.** A status field records a state and not an act. History distinguishes a record
somebody read and deliberately left alone, which appears as an edit to its examined date,
from one nobody has opened since it was written, which appears as nothing at all.

**The highest yield candidate is visible from two facts in the same history.** A record whose
file has not been touched since it was created, sitting over an area that has changed a great
deal since then, is the shape this recipe is looking for, and no single query returns it. It
comes from comparing two histories, which is why the binding is worth having at all.

**Nothing here should be written by this recipe.** The reopening and the cross referencing go
to the record store. This binding is read only and the grant should say so.

## What transfers to any source_control connector

- Express an assumption watch in artifacts, not keywords, because the change that
  invalidates a decision never mentions it.
- Edit history answers whether a record was examined; a status field only claims a state.
- The useful candidate comes from comparing the record's history against its subject's, so
  a binding that gives only one of the two cannot rank at all.
