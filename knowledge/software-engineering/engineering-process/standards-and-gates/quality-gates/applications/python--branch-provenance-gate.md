---
layer: application
type: application
subject: quality-gates
technique: branch-provenance-gate
stack: python
verified_on: 2026-09-06
verified_against: python@3.12
applied: simulation
ab_verdict: better
proof: structural-only
---

# Python — the gate a fork count makes necessary

How a widely forked open-weights runtime stands against
[branch-provenance-gate](../techniques/branch-provenance-gate.md). The version
witness is the tree's `pyproject.toml` interpreter band (`>=3.11,<3.13`); the
tree was read at a pinned commit and not run.

## The seam

The repository has thousands of forks and a contribution guide, and its only
push-stage hook is this gate — not a formatter, not a test runner, not a
type check. That ordering is the interesting part: of every check a project of
this size could put at the push, the one it paid for is the one about where the
commits came from.

The hook implements both of the technique's questions. It refuses a push whose
branch is not descended from the integration ref, and then, for each commit the
branch adds beyond that ref, it asks whether the commit is already an ancestor
of another remote proposal branch — consulting the namespaces proposals actually
live in and skipping the branch's own remote counterpart. Its error text names
the offending commit and the branch it was found on, and prescribes the repair:
recreate from the integration ref and cherry-pick only the intended commits.

The tree's own comment states the force in the technique's terms — preventing
cross-polluted proposal branches that reuse commits from other remote branches.

## What the tree confirms

**The escape hatches are the ones the technique argues for, and no more.** The
base ref is overridable by environment variable, and an unresolvable base ref
exits clean rather than blocking — the fresh-clone case. Both are present, and
there is no blanket disable, which is the alternative a gate acquires the first
time it is wrong with no narrower way out.

**Excluding the branch's own counterpart is not optional.** The hook skips it
explicitly. Without that line, every push updating an existing proposal is
refused for matching itself, which is the technique's named day-one bug.

**Scoping the consulted refs is real, not theoretical.** The hook enumerates
three specific proposal namespaces rather than all remote refs, which on a
repository with this fork count is the difference between a graph query and a
scan.

## The structural fact, and the technique's honest limit visible in the tree

The hook is not installed by cloning. Nothing in the tree's contribution guide
or its setup scripts configures the hooks path, so the default state of this
gate across every contributor is **off** — and there is no report of who is
missing it. The gate is therefore advisory in the strongest sense: it protects
the contributors who happen to have wired it, and the cross-polluted proposals
it exists to stop arrive from the ones who have not.

That is this technique's absent-means-loud rule failing in the field, in the
tree that otherwise implements the technique most completely, and it is worth
recording precisely because the rest of the hook is careful. A check this
well-reasoned that ships uninstalled is a file in the repository.

## Why better, and why no fleet project carries this row

`better` on a structural proof: the gate's two questions are answerable only
against the remote's other branches, so no content gate and no integration
pipeline can substitute for it, and the arms are the presence or absence of a
check for a defect class that is otherwise caught by a reviewer noticing. The
comparison needs no run because the alternative is not a weaker check, it is
none.

**The managed fleet has no seam for this and the absence was measured, not
assumed.** A committer count across the fleet first suggested one project had
five contributors; reading the identities showed four of them were synthetic
test authors used by that project's own harnesses, leaving a single human. Every
fleet project is single-owner, and this technique's own closing rule says its
value collapses toward zero there — with no other proposal branches, the defect
class cannot occur. The row is unapplied by the technique's own scope test
rather than by a gap in effort, and it returns when a fleet repository takes
commits from a second non-synthetic committer identity.
