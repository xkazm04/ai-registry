---
layer: technique
type: technique
subject: quality-gates
technique: branch-provenance-gate
status: forged
laws: [gate-sees-target, absent-guard-is-loud, count-carries-predicate]
shared_with: []
use_when: [a proposal's diff contains commits its author did not write, reviewers keep approving work that belongs to another proposal, a contributor branches from their own previous branch by habit, deciding what a push-stage gate can check that a content gate cannot, a merged proposal silently delivered a second unreviewed change]
---

# The branch-provenance gate

Every gate in this subject examines **content**: the types, the tests, the
formatting, the build. A whole class of defect is invisible to all of them,
because the content is fine and the *history carrying it* is wrong. A
contributor branches from the branch they were last on rather than from the
integration branch, and their proposal now contains someone else's commits — or
their own earlier, still-unreviewed ones.

The reviewer reads a diff against the integration branch, sees the foreign
commits, and has three bad options: review work that is not this proposal's,
approve it unread, or ask for a rebase that discards the review already done.
Most often they scroll to the file they were asked about and the rest merges
unexamined. So a second change ships with no review at all, attributed to a
proposal that never claimed it, and the defect is discovered later as a change
nobody remembers approving.

Content gates cannot see this and no amount of strengthening them will. The
defect is a relationship between this branch and *other branches on the
remote*, which is information no local linter, formatter or type checker has
any access to. It is also invisible to the integration pipeline, which tests
the merge **result** and is indifferent to how the commits got there.

## Two questions, at the push

The push is where the check belongs: it is the first moment the local history
is final and the remote's other branches are knowable. Two questions, and both
are cheap graph queries.

**Is this branch based on the integration branch at all?** If the integration
branch is not an ancestor of the branch tip, the proposal is not built on the
thing it proposes to merge into, and every diff computed for it is against a
base that was never its base.

**Does any commit this branch adds appear on another proposal branch?** Take the
commits the branch adds beyond the integration branch, and for each ask whether
it is already an ancestor of some other remote proposal branch. A commit that
is refuses the push: it is somebody's proposal, and it is not this one's to
carry.

The second question is the one that finds the real cases, and it is only
answerable against the remote. Note what it does *not* ask: it never compares
diffs, patch ids or content. A commit shared by two proposals is a provenance
fact, and reading it off the graph is exact — which is why this gate has no
false-positive taxonomy to tune. It answers one question, about ancestry, and
nothing else
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## The rules that keep it honest

- **Name the offending commit and the branch it belongs to.** "This branch
  appears stacked" sends the author to guess. "Commit `abc1234` is also present
  in `origin/fix/parser-crash`" names the two facts the repair needs, and the
  repair itself — recreate from the integration branch, cherry-pick only the
  intended commits — belongs in the message, because the author hitting this is
  by definition someone who does not yet know how they got here.
- **Do not block when the base cannot be resolved.** A fresh clone, a
  disconnected checkout, or a contributor who has not configured the upstream
  remote has no integration ref locally, and a gate that refuses every push in
  that state teaches its own bypass. Exit clean and say nothing.
- **Make the base ref configurable, and treat that as the escape hatch.** A
  release branch, a long-lived integration line, and the occasional deliberately
  stacked proposal are real. One override for the base, documented, keeps the
  gate from being disabled wholesale — which is the alternative, and it is what
  happens the first time the gate is wrong and there is no narrower way out.
- **Scope the branches it consults.** Comparing against every remote ref makes
  the check quadratic on a busy repository and drags in tags, integration
  history and archived work. Consult the ref namespaces proposals actually live
  in, and exclude the branch's own remote counterpart — a push to update an
  existing proposal must not be refused for matching itself, which is the
  obvious bug and the one that gets the gate uninstalled on day one.
- **Absent means loud.** A push-stage hook is not installed by cloning, so the
  default state of this gate across contributors is *off*. The install must be
  part of the declared setup command rather than a paragraph in a contributing
  guide, and something must be able to report which contributors are missing
  it ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)); an
  advisory gate nobody has installed is a file in the repository, not a control.

## Where it sits in the ladder, and who it is for

This gate is **local-only and by nature bypassable**, and unlike most of this
subject's checks it has no server-side twin that could be authoritative: the
integration pipeline sees the merge result and cannot reconstruct which
proposal a commit was meant for. What can be enforced centrally is the weaker
consequence — a required-linear-history or up-to-date-with-base rule, which
catches the unbased branch and not the cross-contaminated one.

That makes the gate's honest position the **early, advisory** rung: it catches
the mistake at the cheapest moment, in the working copy, before a reviewer has
spent anything, and it does not pretend to be the enforcement. Its value scales
with the number of independent contributors and collapses toward zero on a
single-owner repository, where there are no other proposal branches to be
polluted by and the whole class cannot occur. Check the contributor count before
installing it: this is a gate that earns its place on a repository with many
forks and many concurrent proposals, and is pure ceremony on one without them.
