# The registered local codebase as the `development` extraction source

What was learned mapping this recipe onto a checkout the agent can read. Nothing here is
part of the recipe: swap the connector and this file stops applying while the recipe does
not change.

## What the mapping has to decide

**Code answers "what is", and the brief is asking two questions.** Everything extracted
from a checkout is descriptive by construction, which is exactly why this recipe insists on
marking statements descriptive or aspirational: a brief extracted here and then presented as
direction quietly promotes whatever the product happens to do into what the product is
supposed to do, including the parts nobody chose.

**Declared is not used, and used is the honest answer.** A token file with forty colours
describes an intention; the six that components actually reference describe the product.
Extract from usage and count occurrences, then check the declarations for what was intended
and abandoned. The difference between the two lists is one of the most useful things this
recipe can hand back, because it is where the product already drifted from its own brief
before anyone wrote one.

**There are usually three candidate sources and they disagree.** A stylesheet's custom
properties, a utility framework's configuration and a design tokens file can all be present
in one project, each partly stale. Rank them by which one the components actually resolve
through, and say in the brief which source each statement came from. A brief that cannot be
traced back to where it was read cannot be revised when that source changes.

**A project with no theme layer is a real result.** Where colours and sizes are inline
literals scattered across components there is nothing to extract, and the honest output is
that finding plus a request to the adopter, not a brief assembled from the most frequent
hex values. Recording the absence stops the next run paying for the same search.

## What transfers to any project source

- Anything read out of an implementation is descriptive. Direction has to come from a
  person, and the brief has to keep the two apart.
- Prefer usage over declaration, and report the gap between them.
- Where several sources disagree, name the source of each statement in the brief itself.
- "Nothing to extract" is a finding worth writing down, not a reason to improvise.
