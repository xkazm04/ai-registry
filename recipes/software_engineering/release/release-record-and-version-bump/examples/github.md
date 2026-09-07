# GitHub as the `source_control` connector

What was learned keeping the version and changelog record on GitHub specifically. Nothing here
is part of the recipe: bind a different host and this file stops applying while the recipe does
not change.

## What the mapping has to decide

**One commit, or the atomicity outcome is not met.** The version file and the changelog are two
files in one repository, so moving them in separate commits creates a real, observable state in
which the version has advanced and the record has not. Anyone who fetches between the two, and
every automation watching the default branch, sees it. Stage both and commit once; there is no
weaker version of this that satisfies the outcome.

**A tag is not immutable by default, and moving one is the worst available failure.** A
consumer that has already fetched the old tag keeps it, so a moved tag means two machines
disagree about what a version contains and neither is wrong. Treat a published tag as final and
fix a mistake with a new version, which is also what the versioning contract says.

**Pushing a tag is often the publish trigger.** Where a workflow fires on tag push, creating the
tag is not recording a decision but starting a release. That makes the ordering load bearing:
write and land the record first, tag second, and know before tagging what the tag will set in
motion.

**A protected default branch turns the record into a proposal.** Where direct pushes are
blocked, this work cannot commit the version and changelog; it can only open a change containing
them. That is a legitimate shape but it changes the promise, because the record is not true
until somebody merges it. Establish this at adoption rather than discovering it at the push.

**Squash merges detach the change from its commits.** With squashing, the landed commit message
is the pull request title, which is exactly the description this recipe declines to derive a
version from. The diff is still there and is still the right source; the point is that the
convenient text has become even less reliable than usual.

## What transfers to any hosted repository connector

- Move the version and the record in one commit; a gap between them is observable by others.
- A published tag is final; correct a mistake forward, never by moving it.
- Find out what tagging triggers before tagging.
- Know whether this work can write the record or only propose it, and say which.
