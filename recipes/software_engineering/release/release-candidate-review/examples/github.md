# GitHub as the `source_control` connector

What was learned proposing and approving release candidates on GitHub specifically. Nothing
here is part of the recipe: bind a different host and this file stops applying while the
recipe does not change.

## What the mapping has to decide

**A draft release is the candidate, and it is the only place the proposal can wait
visibly.** A draft is not public, carries the notes, names the target commit, and can be
discarded, which makes it the natural home for a candidate awaiting approval. Approving is
then publishing it. Doing this in a conversation instead leaves the candidate with no
observable age, which is the state the recipe is trying to avoid.

**Publishing a release creates the tag, and that is a wider permission than reading code.**
A token scoped for contents read cannot create a release or a tag, and the failure surfaces
only at the moment of approval, after the candidate has been prepared. Establish the
permission at adoption or the work reaches the last step and cannot take it.

**Automatically generated notes are a starting point that groups by author, not by what a
reader cares about.** The generated list is organised around pull requests and contributors,
which is exactly the shape the recipe rejects. Use it as the raw set to make sure nothing was
missed, then group it yourself, and delete the entries for reverted work rather than leaving
them for the reader to reconcile.

**The comparison between two tags is where reverted work is visible, and it is easy to
miss.** The set of commits since the last release includes both the change and its revert, so
a naive list reports a feature that is not in the release. Compare the trees rather than the
commit list where the difference matters, and say in the notes that a reverted item was
excluded rather than silently omitting it.

**"Latest" is assigned when a release is published, and it is not always what you mean.** A
patch published for an older line will take the latest marker unless it is told not to, which
changes what every downstream reader and installer sees. Decide this deliberately for any
release that is not on the newest line.

## What transfers to any hosted repository connector

- Put the candidate somewhere it can wait visibly and accumulate an age.
- Check the permission for the last step before doing the first one.
- Generated notes are a completeness check, not a draft; the grouping is the work.
- Reconcile against the tree, not the commit list, or reverted work is announced as shipped.
