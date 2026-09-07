# A registered local checkout as the `source_control` connector

What was learned mapping this recipe onto a local working checkout specifically. Nothing
here is part of the recipe: swap the connector and this file stops applying while the
recipe does not change.

## What the mapping has to decide

**Bind it read only, and mean it.** The same connector class can apply a change, and this
recipe's entire discipline is that a finding is a claim a person can decline. A binding
that can edit invites a pass to fix what it found, and a defect that has already been
fixed cannot be confirmed, so the confirm rate the recipe steers by stops existing.

**The checkout tells you which areas changed, which is the whole selection signal here.**
There is no other way in this binding to know what has not been read since it moved.
Establish that history is present and follows renames, because after a large
reorganization every file looks changed and the pass reads the wrong areas confidently.

**Blame is not authorship and is not a signal.** A formatting pass, a lint autofix or a
license header sweep rewrites the last-touched line of the whole tree. Use commit content
rather than last-touched dates when deciding what has genuinely moved.

**The project's own tools are in the checkout and should be read before filing anything.**
Its linter configuration, its type checker settings and its suppressions are all there, and
they say what is already visible to the team. They also say what the team has deliberately
turned off, which is the more interesting half: a rule disabled on purpose marks an area
where a finding of that shape will be declined.

**A checkout cannot tell you whether the path is ever taken.** A finding about a failure
branch is stronger when something reaches it, and this binding has no runtime evidence.
State the conditions the defect needs rather than implying they occur, because a reader who
knows the branch is unreachable will decline the finding and trust the next one less.

## What transfers to any source_control connector

- Read what the project's tools already report before filing; anything they cover is
  already visible and refiling it is what makes the queue feel like noise.
- Selection needs a reliable "changed since last read", and mechanical rewrites destroy it.
- Without runtime evidence, name the conditions a defect requires instead of asserting
  that it happens.
