# A registered local checkout as the `source_control` connector

What was learned mapping this recipe onto a local working checkout specifically. Nothing
here is part of the recipe: swap the connector and this file stops applying while the
recipe does not change.

## What the mapping has to decide

**One binding supplies the drift half and none of the disuse half.** The entries and the
code they describe are in the same tree, so drift is computable here without anything else.
Whether an entry was ever reached for is not in the tree at all. Where this operation has no
convention for marking a use, the audit measures drift and must report the disuse half as
unmeasured. Reporting it as zero would retire the whole library.

**Commit history is the cheapest usage proxy available and it measures the wrong thing.**
It records that somebody wrote something down, not that somebody read the entry before doing
the work. An entry consulted fifty times and never cited scores the same as one nobody has
opened. Where the count comes from history, say so, because it changes what a low number
means.

**Cross references between entries are the only dependency signal a checkout offers, and
they undercount badly.** An entry that relies on another for the shape of its output, for a
file it leaves behind, or for a name it happens to use, declares nothing. Treat the
reference graph as a floor on what would break, never as the answer to whether removal is
safe.

**Entries and code move at different speeds inside the same history.** A repository wide
answer to "has anything changed since the last audit" is almost always yes and almost never
useful. Evaluate movement per area, against the area each entry actually describes.

**A confirmation date has to be written somewhere the checkout can hold it.** The distinction
between last edited and last confirmed to work only exists if something records the second,
and a checkout will happily give you the first and let you mistake it for both. If the
entries have no field for it, adding one is the first proposal the audit should make.

## What transfers to any source_control connector

- Drift and disuse come from different sources; a binding that supplies only one must say
  the other was not measured rather than reporting a zero.
- Any usage count derived from history counts authorship, not consultation.
- The declared reference graph is a floor on the blast radius of a removal, never a
  clearance.
