---
layer: technique
type: technique
subject: supply-chain
technique: vendored-fork-ledger
status: forged
laws: [creation-names-reaper, gate-sees-target]
shared_with: []
use_when: [patching a third-party dependency instead of waiting for upstream, a vendored copy of a library has drifted from any known upstream commit, deciding what must be recorded before a local patch is allowed to land, an upstream release lands and nobody knows which local patches it obsoletes]
---

# The vendored-fork ledger

Every guard in this subject watches a **crossing**: third-party code entering
the trust boundary through dependency resolution, where a policy file can read
the resolved graph and refuse. Forking that dependency — copying its source into
the repository and patching it — does not violate any of those guards. It ends
them. The code is now first-party by every mechanical test: the resolved graph
no longer names an upstream version for it, advisory matching has nothing to
match, and update automation has no update to propose. Nothing fails. The
dependency simply stops being watched, and the silence is indistinguishable from
compliance.

This is the state the two neighbouring techniques do not cover.
[dependency-policy-gates](./dependency-policy-gates.md) targets the resolved
lockfile, and a fork's entry there points at a local path;
[update-automation-review](./update-automation-review.md) governs a proposal
that, for a fork, is never generated. Forking is a legitimate and often
necessary move — upstream is slow, the fix is small, the release is blocking —
but it converts a *governed* dependency into an *ungoverned* subdirectory, and
the conversion has to be paid for deliberately.

## The obligation a fork creates

A local patch is a resource with no owner and no expiry. Per
[creation-names-reaper](../../../../_laws.md#creation-names-reaper), the question
"what removes this?" must be answered at creation time, because nobody re-asks
it later — and the observed end state of an unanswered fork is a vendored tree
several upstream releases stale, carrying patches whose fixes shipped upstream
two years ago, that nobody dares touch because nobody can say what they were
for.

So the price of the fork is a **ledger**: one committed document, beside the
vendored source, that makes the fork's entire divergence legible. Two files do
the work — a record of *which upstream commit* the vendored copy was taken from,
and an index of *what was changed on top of it*, with each change stored as a
discrete patch artifact rather than smeared into the vendored source.

Each entry in the index carries:

- **Why the patch exists**, in terms of the behaviour the project needs and
  upstream does not provide. This is the field that lets a future reader
  evaluate the patch against a new upstream release without reverse-engineering
  a diff.
- **The local tracking item**, so the patch joins the project's own work
  history rather than floating outside it.
- **The upstream conversation** — the pull request or discussion, *including
  when there is none.* "Not opened" is a real and common answer, and writing it
  is what distinguishes a deliberate decision to carry a patch privately from
  an intention nobody executed. An index where this field is silently absent
  cannot tell the two apart.
- **The base commit** the patch was authored against, which is what makes
  reapplication after a re-vendor a mechanical operation instead of a judgment.
- **The files it touches**, so the blast radius is readable without opening the
  patch.
- **The verification** — the exact commands that prove the patched behaviour is
  present. Not a description of the test; the invocation.
- **The removal condition**, stated as a falsifiable event: *upstream exposes an
  equivalent interface*, *upstream adopts this as the default*, *and the
  named regression passes without the patch*. "Remove when no longer needed" is
  the same non-answer that `revisit later` is elsewhere in this corpus — it
  discharges nothing and no reviewer can call it overdue.

## The ledger is a claim, so a gate must read the tree

A prose index of patches is a statement about the relationship between two trees,
and like every such statement it drifts the moment somebody edits the vendored
source directly instead of adding a patch. The index still reads correctly; it
is simply no longer true. Per
[gate-sees-target](../../../../_laws.md#gate-sees-target), the gate has to read the
thing, not the description of it.

Two mechanical checks are sufficient and both are cheap enough for the
merge rung:

1. **Every patch artifact on disk appears in the index, and every indexed entry
   has an artifact.** This is an inventory check in both directions, and it must
   be both — a diff-shaped check sees a modified patch and is blind to a new,
   unindexed one.
2. **Every active patch reverse-applies cleanly against the vendored tree.**
   This is the check that carries the technique. Reverse-application succeeding
   proves the vendored source actually contains exactly the change the entry
   claims: the patch set *is* the divergence from the recorded upstream commit,
   with nothing hand-edited in and nothing silently dropped. An index that
   passes the first check and fails this one is describing a tree that no longer
   exists.

Neither check needs the network, so both belong on the blocking rung with the
rest of the project's own gate rather than on the scheduled lane where feed-
driven supply-chain checks live.

## Re-vendoring is a walk over the ledger

The payoff arrives at the next upstream update, and the procedure is fixed by
the index rather than improvised: pull the new upstream commit, then visit every
active entry and decide one of two things. If the new source contains the
behaviour the entry's *reason* describes, delete the patch and the entry, and
re-run that entry's recorded verification to prove the behaviour survived its
own removal. If it does not, reapply the patch onto the new base and update the
recorded base commit.

That second run of the verification is the step teams skip, and it is the one
that matters: deleting a patch because upstream "looks like it fixed that" is a
guess, and the entry exists precisely so the guess can be replaced with the
command that settles it.

## Pin the version you are overriding

A dependency the project overrides with local source must be pinned to an
**exact** version in the manifest, not a compatible range. The override replaces
a specific upstream artifact; a range lets resolution move the thing being
replaced underneath the replacement, which produces a fork whose base is
whatever resolved last. This is the one place where the usual argument for
ranges — automatic patch-level uptake — is inverted, because automatic uptake is
exactly what the fork has opted out of.

## Decision rules

- A local patch does not land without a ledger entry, and the entry does not
  land without a removal condition phrased as an event.
- Record the upstream conversation's *absence* explicitly; a blank field and a
  deliberate decision not to upstream are different states.
- Store changes as discrete patch artifacts against a recorded base commit,
  never as edits smeared into the vendored source.
- Gate on both directions of the inventory and on clean reverse-application; run
  both on the blocking rung.
- On re-vendoring, walk every entry and re-run the recorded verification for any
  patch you delete.
- Pin the overridden dependency to an exact version.
- When the ledger's entries outnumber what the team can walk at an upstream
  update, the fork has stopped being a patch set and become a maintained
  derivative — say so and staff it, or upstream the patches.
