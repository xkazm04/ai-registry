# A registered local checkout as the `source_control` connector

What was learned mapping this recipe onto a local working checkout specifically. Nothing
here is part of the recipe: swap the connector and this file stops applying while the
recipe does not change.

## What the mapping has to decide

**The premise check is a read of the current tree, and that is the only thing this binding
is here for.** Everything else in this recipe is a decision. Keep the read cheap and keep
it honest: confirming that the thing the idea asks for is now present is a search, and
confirming that it is still absent is not. Where the check cannot establish absence, the
idea goes forward marked as unconfirmed rather than as confirmed still needed.

**The checkout can tell you whether the code moved; it cannot tell you whether the idea
was done.** Work often lands in a shape the idea did not describe, so a text match on the
idea's own wording will miss it and a premise check built on that match will keep waving
through work that has already shipped. Compare against the behaviour the idea asked for
rather than against its phrasing, and where that is not possible, say the check was
shallow.

**History is what makes staleness measurable.** The useful fact is not the idea's own age
but how much the area it names has changed since the idea was written. A six month old
idea against untouched code is fresh; a three week old one against an area that was
rewritten last Tuesday is not. The checkout has both dates and neither is available from
the idea itself.

**Bind it read only.** This gate decides and never builds. A binding that can write invites
a pass to close the small ones itself, and an idea that has been quietly implemented cannot
be declined, accepted, or counted.

## What transfers to any source_control connector

- A premise check confirms presence far more reliably than absence; label which one it
  managed.
- Staleness is the movement of the area, not the age of the item, and only the connector
  knows the first.
- Compare against the behaviour asked for, not the words used, or the check waves through
  work that already shipped in a different shape.
