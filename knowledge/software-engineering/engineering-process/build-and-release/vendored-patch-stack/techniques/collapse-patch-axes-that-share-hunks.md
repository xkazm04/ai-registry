---
layer: technique
type: technique
subject: vendored-patch-stack
technique: collapse-patch-axes-that-share-hunks
status: forged
laws: [identity-survives-reuse, one-authority-per-vocabulary]
shared_with: []
use_when: [choosing how to split a patch set into files, a rejected hunk cannot be attributed to one local change, patches in the set conflict with each other and not only with upstream, a patch set has grouped changes by feature and bumps keep getting worse]
---

# Collapse patch axes that share hunks

A patch set has an **axis**: the property by which the divergence is cut into
separate artifacts. The axis is chosen once, usually without discussion, and it
sets the price of every future upstream bump, because it decides whether a
rejected hunk names one change or several.

The intuitive axis is the team's own: one patch per feature, one per subsystem
the team owns, plus a cross-cutting group for a concern that touches everything.
It reads well and it matches how the work was scoped. It is also the expensive
one, and the reason is not a matter of taste.

## Upstream's changes arrive per file

A source tree's history is made of file-level changes, and so is upstream's
refactor. That is the axis every conflict will arrive on, whatever axis you
chose. A set cut per upstream file inherits three properties for free:

- **Disjointness.** No two patches touch the same region, so patches cannot
  conflict with each other — only with upstream. Half the conflict surface
  disappears.
- **Order independence.** Because no two patches address the same text, the
  order they are applied in cannot change the result. There is nothing to
  declare and nothing to get wrong.
- **Attribution.** A rejected hunk names exactly one patch, and that patch names
  exactly one upstream file. The question "what was this for" has one ledger
  entry to answer it.

A set cut per feature has none of them. Two features that both edit one file
produce patches that conflict with each other; correctness now depends on a
total order; and a reject in that file could belong to either, so triage starts
with reading both to work out which change the failing text came from. The
multiplication is the point: the triage cost is not the number of patches, it is
the number of *pairs of patches sharing a region*, and that grows quadratically
in exactly the files the fork cares most about.

## The rule

**Cut the patch set on the upstream file. A second axis is permitted only when
its hunk sets are provably disjoint from the first, and the decision is written
down beside the set.**

"Provably disjoint" is a real test and not a feeling: list the regions each axis
touches and intersect them. An empty intersection means the axes are independent
and the split buys legibility for free. A non-empty intersection means the axes
conflict with each other, and the second axis must be collapsed into the first —
the shared region becomes one patch, whatever the two changes in it were called
in the tracker.

The second half of the rule is the half that survives staff turnover. A patch set
that was deliberately cut one way looks identical, six months on, to one that
was cut that way by accident, and the next maintainer will restructure it back on
instinct. Record the axis and the reason, once, next to the set.

## Identity is the upstream path, not the feature name

Naming patches after features is the same decision as cutting on features, made
one layer down, and it fails the same way. Feature names get reused, renamed when
the product renames, and duplicated when a second change to the same area
arrives; the upstream path a patch addresses is stable across all of those, which
is what [identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)
asks of any identifier that has to survive real operations. Encode the upstream
path in the patch's name and the directory listing becomes a readable index of
exactly which upstream files the fork has its hands on — the single most useful
piece of information about a fork, and one most stacks cannot produce on demand.

## If the order matters, the order is a declared artifact

Some sets genuinely cannot be made disjoint: a change that must be applied to
generated content after another change produced it, or a set inherited in a shape
nobody can afford to recut. Where an order is load-bearing, it is **an explicit
ordered list, committed and reviewed** — never the order a directory listing
happens to return, which varies by filesystem, locale and tool and therefore
makes the stack reproduce differently on different machines. That list is the
single authority on application order
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
which has a consequence teams miss: a patch applied by a step outside the list
is invisible to it, so the list has stopped being the authority even though it is
still correct about everything it mentions. Every patch goes through the ordered
list or the list is decoration.

## Restructure immediately after a bump, never before

Recutting a patch set requires knowing what each patch is for, and that knowledge
is at its cheapest in the days after a bump, when every reject has just been
triaged and every intent has just been reconstructed. Before a bump it is at its
most expensive, and the work competes with the bump itself. A team that plans to
"clean up the patches before the next upgrade" has scheduled the work at the one
moment it costs most and delivers least.

## When not to use it

Below roughly a dozen patches, the axis barely matters — every arrangement is
readable and triage is bounded by reading the whole set. Do not spend a
restructuring on a stack that small; spend it the first time somebody cannot find
which patch a reject belongs to.

And do not read this as an argument for one patch per file at all costs. A single
coherent change that spans four upstream files as one atomic edit — a signature
change and its callers — is one change, and splitting it four ways to satisfy the
axis produces four patches that are individually meaningless and cannot be
reviewed apart. The axis is a default that resolves ties, and atomicity of a real
change outranks it.
