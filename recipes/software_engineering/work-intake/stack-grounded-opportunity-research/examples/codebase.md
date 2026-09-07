# A registered local checkout as the `source_control` connector

What was learned mapping this recipe onto a local working checkout specifically. Nothing
here is part of the recipe: swap the connector and this file stops applying while the
recipe does not change.

## What the mapping has to decide

**The lockfile is the inventory; the manifest is a wish.** A manifest states ranges and a
lockfile states what is installed, and a finding grounded in a range cannot name a version.
Where a project has no lockfile, the grounding step has to say the inventory is
approximate, because every later claim about being behind is then approximate too.

**Direct and transitive dependencies need separating at the start.** The tree is mostly
things nobody chose, and a finding about a transitive dependency has a different answer
than one about a direct one: the adopter usually cannot upgrade it directly and needs to
know which of their own dependencies pulls it. Say which kind each finding is, or the
reader spends the pass working it out.

**Imports and the manifest disagree, and both disagreements matter.** A declared dependency
that nothing imports is a removal candidate rather than an upgrade one. Something imported
that no manifest declares is being resolved some other way and is invisible to every
advisory feed. The checkout is the only binding that can see either.

**Silence has a local reading too.** The checkout carries the date each dependency was last
changed here, alongside what upstream has done. A dependency untouched locally for years
and untouched upstream for years is the shape this recipe exists to notice, and neither
half alone says it.

**Vendored copies defeat the whole grounding step.** A library copied into the tree has no
manifest entry, so it never appears in the inventory and no advisory will ever match it.
Establish at adoption whether this project vendors anything, and treat vendored paths as a
separate inventory rather than as absent.

## What transfers to any source_control connector

- Ground on what is installed, not on what is permitted, and say when only the latter is
  available.
- Direct and transitive findings are different findings and need labelling as such.
- Anything the manifest does not know about is invisible to every feed, so the inventory
  has to be built from more than the manifest.
