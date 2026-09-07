---
name: pull-request-test-verdict
version: 0.2.0
status: seed
domain: software_engineering
path: software_engineering/code-review
---

# Pull request test verdict

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A change reaches the main branch on the strength of somebody's belief that the
tests would pass, and the one time that belief is wrong is the time it matters;
meanwhile a red run is argued about for an hour because nobody can say whether the
change broke it, the suite is unreliable, or it was already broken before.

**Input.** A proposed change together with the branch it will land on, an isolated
checkout to exercise the merged result in, and the project's own branching and merge
policy.

**Core action.** Run what will actually land, in isolation from anyone else's working
tree, then attribute any failure to the change, to the suite's own instability, or to a
breakage already on the target, and let that attributed result decide between approving,
asking for changes, and handing it on with the failure named.

**Output.** A verdict recorded where the merge decision is made, naming what was run,
against what, and what it returned, with no approval or merge over a suite that failed,
never ran, or never touched the change.

## Activities

1. Check out what will actually land, merged with its target, in a scratch tree nobody
else is using *(act)*
2. Run the project's own suite there *(act)*
3. Attribute any failure to the change, to the suite's own instability, or to a breakage
already on the target *(decide)*
4. Decide between approving, asking for changes, and handing it on with the failure
named *(decide)*
5. Record the verdict where the merge decision is made, and apply it as far as policy
allows *(deliver)*
6. Remove the scratch tree, whether the run passed or failed *(act)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**No change reaches the main branch without what will actually land having been run.**

- Every proposed change carries a verdict naming what was run, which commit it was run
  against, and what the result was
- The result rests on the change merged with its target rather than on the branch alone,
  or the verdict says explicitly that it does not and why
- A failing or unrun suite never produces an approval
- Testing a change never disturbs the working tree anyone else is using

**A failure is reported with its cause identified, not as a bare red.**

- The same suite is run against the target as it stands before a failure is attributed
  to the change
- A failure that reproduces on the target is reported as a pre-existing breakage and
  escalated, rather than held against the change
- A re-run is treated as a diagnostic and its outcome recorded; a test that passed only
  on a second attempt is reported as unstable and never reported as a pass
- An attribution a person reverses, most often a failure called unstable that turned out
  to be the change, is written back to whatever this project keeps as its record of
  which tests are trusted, so the next verdict on that test opens from the corrected
  reading instead of re-deriving instability from another re-run

**A verdict says what the run proves, and does not imply more.**

- The verdict says whether any test actually exercised the changed code, so a green run
  over an untouched area is not read as evidence about it
- A change that could not be exercised by the suite is handed on with that stated,
  rather than approved on the suite's silence
- A skipped or filtered portion of the suite is named rather than counted as passed

## Guidance

Test what will land, not what was written: a change green on its own branch can break
the target because the target moved. A red suite has three causes and the verdict is
worthless until it says which, so run the same suite on the target before blaming the
change. A re-run is a diagnostic, never a route to green; a test that passed on the
second attempt is a finding. Green says the suite passed, not that the change was
exercised.

## Where this is worth adopting

- A team on a busy main branch, where changes are proposed faster than they merge and
  the ones that break on landing were all green on their own branches an hour earlier.
- A repository with a suite that fails intermittently, where everybody re-runs until it
  goes green and nobody can say how many real failures have been retried away.
- A single maintainer approving contributions from outside, who needs the change
  exercised somewhere other than their own working tree before they will look at it.
- A project where the main branch is sometimes already broken, and every proposed change
  collects the same failure until somebody notices it was never theirs.
- A team adding automated implementation help, where the pace of proposed changes has
  outrun the human capacity to run each one and the verdict is the bottleneck that
  decides everything else.

## Connector types

`source_control`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[github](examples/github.md) for `source_control`, [gitlab](examples/gitlab.md) for
`source_control`.

## Recommended trigger

`event`. A change being proposed is a real external event and the verdict is only useful
before it lands, so this work wakes on the proposal rather than sweeping for untested
changes. A change whose target has moved since the verdict was given needs the event to
be treated as recurring, not as answered once.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Where changes arrive from, since a hosted proposal and a local branch need different
  handling and only one of them has a target branch the work can read
- How far this work may act on its own verdict, from commenting only through to enabling
  a merge
- The project's branching and merge policy, because the verdict is only meaningful
  against it and a policy that already tests the merge result changes what this work
  needs to do
- Which parts of the suite this project treats as reliable, since a project that already
  knows its unstable tests can have them attributed rather than rediscovered on every
  change
- How long the suite takes, because that decides whether the verdict can be given while
  the change is still fresh or arrives after somebody merged it anyway

## Dependencies

- git with worktree support, since the isolation the first outcome depends on is a
  second checkout rather than a stash
- the project's own test suite, installed and runnable in that checkout
