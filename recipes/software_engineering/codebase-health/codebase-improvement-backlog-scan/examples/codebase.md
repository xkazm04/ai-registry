# A registered local checkout as the `source_control` connector

What was learned mapping this recipe onto a local working checkout specifically. Nothing
here is part of the recipe: swap the connector and this file stops applying while the
recipe does not change.

## What the mapping has to decide

**The checkout is what makes the ranking possible, and its history is the fragile part.**
The recipe ranks by where the code actually changes, which means it reads commit history
rather than the working tree alone. A shallow clone has no history to read, and a
repository whose branches are squash merged shows one commit per feature, so a file
edited thirty times inside a branch reads as edited once. Establish at adoption how deep
the clone is and how the project merges, because both quietly turn the ranking back into
the marker sweep the recipe exists to avoid.

**Renames reset churn.** Change counts attributed per path start again when a file moves,
so a directory reorganization makes an untouched tree look freshly churned and pushes
every candidate into the wrong corner of the repository. Confirm that history follows
renames before trusting the first ranking, and treat the pass immediately after a large
move as establishing coverage rather than as a reading.

**Vendored, generated and migration directories dominate every raw count.** They are
large, they change in bulk, and nobody wants a candidate against them. The exclusion list
belongs to the adoption, not to the recipe, because what counts as generated differs by
project and getting it wrong produces a first pass a person rejects entirely.

**There is no review surface here.** A hosted forge offers a pull request to attach a
candidate to; a local checkout offers nothing, so the question of where a candidate
arrives has to be answered somewhere else at adoption. That placement decides the fix
rate more than the quality of any single finding does.

**Bind it read only.** The same connector can write, and the recipe's whole discipline is
that it proposes and never edits. A binding that can apply a change invites a pass to
close the loop itself, and a candidate that has already been applied is not a candidate.

## What transfers to any source_control connector

- Ranking needs history. Establish whether the connector's history is complete, and say
  so in the pass when it is not, rather than ranking on what is there.
- A repository's excluded directories are an adoption fact, never a recipe fact.
- Ask where a candidate can be delivered so that it lands beside the work, before
  deciding what to surface.
