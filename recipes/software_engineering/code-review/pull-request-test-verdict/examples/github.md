# GitHub as the `source_control` connector

What was learned mapping this recipe onto GitHub specifically. Nothing here is part of the
recipe: bind a different host and this file stops applying while the recipe does not change.

## What the mapping has to decide

**GitHub already computes the merged result, and it is the ref worth testing.** For an open
pull request the host maintains a ref holding the change merged with its target. Fetching that
rather than the head branch is the cheapest way to satisfy the recipe's central requirement,
and it costs one extra fetch. When the pull request is not mergeable the ref is absent, and
that absence is itself the verdict: a conflicting change cannot be tested and should be handed
back rather than tested on its branch and reported as green.

**The token's permissions decide whether hosted CI results can be read at all.** A token
scoped for contents read plus pull requests read and write can post a review and request a
merge, but reading Actions runs and check runs needs a further permission that the usual setup
guidance does not include. So a verdict here rests on the suite this work ran itself, and the
adoption should say so rather than implying the hosted checks were consulted.

**Auto-merge is a request, not a result.** Enabling it hands the merge to the host once the
required checks pass, which leaves the change in flight with nobody watching. The observable
end this recipe wants is the merge event; treat enabling auto-merge as an intent recorded and
check back, because a later failure leaves the change open silently.

**A merge queue changes what this recipe should claim.** Where one is configured the host
builds and tests the change against everything ahead of it in the queue, which is a stronger
answer to merge skew than anything this work can do alone. When it is present, say the verdict
is a pre-check and the queue is the gate; when it is not, the merged result ref above is the
substitute.

**"Require branches to be up to date before merging" is the partial answer people mistake for
the full one.** It forces the branch to be rebased or merged forward before merging, which
catches textual staleness but not a semantic conflict introduced between that update and the
merge. It reduces the window; it does not close it.

## What transfers to any hosted repository connector

- Ask whether the host already offers a merged result to test against before constructing one.
- An unmergeable change is a verdict, not a reason to fall back to testing the branch.
- Say which suite the verdict rests on, especially when hosted results were not readable.
- A conditional or queued merge is in flight; the merge event is the end.
