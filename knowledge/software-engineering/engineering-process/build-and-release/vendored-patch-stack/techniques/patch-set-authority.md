---
layer: technique
type: technique
subject: vendored-patch-stack
technique: patch-set-authority
status: forged
laws: [one-authority-per-vocabulary, derivation-names-recomputation, gate-sees-target]
shared_with: []
use_when: [deciding whether the patched tree or the patch files are the source of truth, a regenerated patch turned out to be missing part of the change, someone hand-edited a diff to make it apply, an upstream bump found the tree and the patch set describing different divergence]
---

# Patch-set authority

Two artifacts describe the same divergence: the **patched tree** and the **patch
set**. Exactly one of them is source and the other is derived. Which one is
which is a free choice — both regimes are in production at large scale — but
leaving it unanswered is not a third option, it is the failure mode, and it is
the most common one in this subject.

The unanswered state does not announce itself. It looks like a stack where
patches are usually regenerated but occasionally touched up by hand, or a stack
where the tree is usually disposable but has one directory somebody maintains in
place. Both keep working for as long as nobody bumps upstream. At the bump the
two artifacts are compared for the first time, they disagree, and there is no
rule available for deciding which one to believe — which is
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
applied to the divergence itself.

## The two regimes

**Tree-authoritative.** The working tree is where changes are made. A command
derives the patch set from it. The patch set is a build output that happens to
be committed, and it is committed for the same reasons any generated artifact is
— so reviewers can read the divergence, and so a machine without the workspace
can reproduce it.

Its obligation follows directly from
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation):
the regeneration command is named, invokable, and run by something other than a
maintainer's memory. Its prohibition is equally direct: **a hand-edited diff is
an artifact no tree ever produced.** It may apply cleanly and still describe a
change that was never compiled, never run, and never reviewed in the context it
lands in. Correctness of a diff is not a property of the diff.

**Patch-authoritative.** The patch files are the source. They are written and
reviewed as text, they carry the divergence between releases, and the tree is
materialized from a pinned upstream archive plus the set, then thrown away. No
regeneration command exists, and hand-editing a patch is not a violation — it is
the normal authoring path.

This regime is often mistaken for the sloppy version of the first one. It is
not; it is a coherent choice with a real advantage, which is that the stack's
entire state is a pinned version plus a directory of reviewable text, with no
workspace to keep consistent. What it gives up is the round trip, so it has to
buy the same assurance a different way (below).

## What each regime must gate

The regimes fail differently, so their checks are different, and adopting the
wrong check is how a stack gets a green that means nothing.

**Tree-authoritative: regeneration is not a mirror.** The command that derives
patches from the tree sees a *subset* of the divergence, and the parts it misses
differ by direction:

- **Additions are missed** where the derivation asks the version-control tool
  for changes to files it already tracks. A newly created file is not one of
  those, so a change that adds source is regenerated as though the addition were
  not part of it. The resulting patch applies perfectly. The failure surfaces at
  link or run time, arbitrarily far from the regeneration, which is what makes
  it expensive.
- **Removals are missed** in the opposite way. Reverting an edit in the tree
  removes the difference the derivation was computing, so there is nothing for
  it to write, and the stale patch describing the reverted change stays on disk
  and keeps being applied.

The mechanical fix for the first is to derive from both the staged and unstaged
sets of changes rather than one of them. The fix for the second is that removing
a change is an explicit deletion of its artifact, never an edit to the tree.
Neither fix is checkable by inspection, and this is why the acceptance test is
not "regeneration succeeded" but a **round trip**: materialize a clean tree from
the pinned upstream and the patch set alone, and compare it to the workspace.
Zero difference is the pass. That test reads the target rather than the
derivation's exit code
([gate-sees-target](../../../../_laws.md#gate-sees-target)), and it catches both
directions plus every hand-edit at once.

**Patch-authoritative: application is not the whole check.** With no round trip
available, the gate is that the set still lands on the pinned upstream, and it
has two halves that stacks routinely collapse into one. The first half is
mechanical — apply the set to a freshly materialized tree and fail on the first
patch that does not land, without continuing. A pipeline that applies the
remaining patches after one has failed produces a tree that is neither upstream
nor patched, and that tree will often still build. The second half is that the
patched tree passes the verifications the ledger records for each change,
because a text patch landing says nothing about whether the behaviour it was
written for is present.

## Both regimes: additions do not belong in the diff

The addition hazard above has a stronger answer than fixing the derivation, and
it is the one both mature regimes converge on independently: **a file the fork
adds is not carried as a diff against nothing.** It is a file in the project's
own tree, placed into the vendored tree by an explicit step, or resolved from
there by a mechanism upstream already honours. That removes an entire class of
regeneration bug, makes the added file reviewable as a file rather than as a
diff header, and — decisively — makes it a first-party source file that the
project's own tooling can see. See
[least-invasive-carrier](./least-invasive-carrier.md), which generalizes this
into the ranking it belongs to.

## Decision rules

- Name the authoritative artifact once, in writing, beside the patch set. A
  stack that cannot answer the question in one sentence is in the unanswered
  state whatever its tooling suggests.
- Tree-authoritative: the derived patch set names its regeneration command, and
  the round trip from a clean tree is the acceptance test, not the regeneration's
  exit status.
- Patch-authoritative: hand-authoring is normal; the gate is that the whole set
  applies to a freshly materialized pinned tree, halting on the first failure,
  and that the recorded verifications then pass.
- Never carry an added file as a patch against an empty original when the stack
  can carry it as a file.
- A change removed from the divergence is removed by deleting its artifact, in
  both regimes.

## When not to use it

A stack with one patch and no expectation of a second does not need a declared
regime; it needs the ledger entry next door and nothing else here. The cost of
this technique is a gate and a written decision, and both are worth it from the
point where a maintainer cannot recall every patch by name — which arrives
sooner than teams expect, usually around the first upstream bump performed by
somebody who did not author the patches.
