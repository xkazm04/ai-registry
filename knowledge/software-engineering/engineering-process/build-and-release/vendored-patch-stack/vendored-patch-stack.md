---
layer: golden-path
type: golden-path
subject: vendored-patch-stack
status: forged
use_when: [maintaining local changes against a third-party source tree that keeps moving, an upstream release has landed and the local patch set no longer applies, choosing how a fork will carry its divergence before the first patch is written, an upstream bump costs more triage every time it is attempted]
techniques:
  - one-reset-authority
  - patch-set-authority
  - least-invasive-carrier
  - collapse-patch-axes-that-share-hunks
  - reject-triage-is-a-port-not-a-merge
---

# The vendored patch stack

A project that must change somebody else's source, and cannot wait for that
somebody to accept the change, ends up carrying a **patch stack**: a body of
local divergence held against an upstream that keeps moving underneath it. This
subject owns the machinery that keeps such a stack alive — how the modified tree
is materialized and destroyed, which artifact is authoritative when the tree and
the divergence disagree, what shape the divergence is stored in, and what the
recurring work of an upstream bump actually is.

It begins where the decision to fork ends. Whether the fork was justified, what
must be recorded about it, which upstream commit the copy came from, who is
obliged to retire each local change and on what condition — that is the
provenance question, and it is owned by
[the vendored-fork ledger](../../../security/code-provenance/supply-chain/techniques/vendored-fork-ledger.md)
under supply chain security. Cite it and do not restate it: the ledger says *which* changes
you are carrying and *why each one still exists*; this subject says how the
carrying is done without the cost compounding. The two neighbouring subjects in
this category draw their lines just as sharply. Packaging owns producing
artifacts from a tree that already built; the release pipeline owns promoting
and gating them. Everything here happens before either has anything to work on,
and none of it is visible in the artifact that results.

## The opening trade decides the shape of everything else

Before the first local change is written, a stack picks one of two carries, and
the choice is not a detail of tooling. It determines which artifact is true,
what a reset means, whether added files are a hazard, and what an upstream bump
feels like.

**Extract and patch.** The upstream is pinned as an immutable release artifact —
a version identifier and a signed archive — and the divergence is a set of patch
files applied in a declared order to a freshly extracted tree. The tree is a
*build output*: created by a pipeline step, destroyed by a pipeline step, never
committed anywhere. The patch set is the source. Nothing about the tree needs to
be preserved, which is the whole benefit: the stack's entire state is the pinned
version plus a directory of text files, and a machine that has never seen the
project can reproduce it exactly.

**Track a downstream branch.** The upstream is pinned as a commit in its own
version-control history, and the divergence lives as commits on top of it in a
working checkout. The tree is a *workspace*: you edit it, you can bisect it, the
version-control tool answers every question about what changed. An upstream bump
is a rebase, and the tool that performs it already understands moved code.

Neither is wrong, and mature stacks of both kinds exist at large scale. What is
wrong is holding both at once — the failure the rest of this subject keeps
returning to. Extract-and-patch stacks acquire a habit of editing the extracted
tree "just to test something" and then hand-copying the result back into a patch
file. Downstream-branch stacks acquire a directory of exported patch files that
nobody regenerates. In both, two artifacts now describe the divergence, neither
is authoritative, and the disagreement between them is discovered at the worst
possible moment, which is the middle of an upstream bump.

So the first decision is: **name the authoritative representation and make the
other one derived, with a command that recomputes it.** That rule is developed
in [patch-set-authority](./techniques/patch-set-authority.md), and every
technique below reads differently depending on which way it was answered.

## The tree has one destroyer

A vendored tree is expensive to materialize — a network fetch, a signature
check, an extraction, sometimes a dependency bootstrap that takes longer than
the build. It is also, in the downstream-branch carry, simultaneously a
version-control checkout, which means two different tools each believe they know
what it means to reset it, and they mean different things. The version-control
tool's reset restores tracked content and is blind to the generated files the
build needs; the build system's removal target discards generated files and is
blind to local edits. Running the wrong one is not a slow path, it is a wrong
state, and the state is silent because a partially-restored tree usually still
builds.

The rule is that exactly one command destroys the tree, it is graded by what it
preserves, and every other command that could plausibly destroy it is an error
inside that directory —
[one-reset-authority](./techniques/one-reset-authority.md).

## Not every change should be carried as a patch

The most consequential craft in this subject is upstream of the patch mechanism
entirely: **a change carried as an in-place edit to upstream source is the most
expensive form of divergence there is, and most changes do not have to be one.**
Ranked by what they cost at the next bump, the carriers are: keep the behaviour
in your own code and call into upstream; use an override mechanism upstream's
own resolution already honours, so a file of yours wins without upstream's file
changing; make a minimal, mechanical edit at the seam and put the logic
elsewhere; and, last and reluctantly, edit upstream's logic in place. Replacing
a whole upstream file with a copy is not on the ladder at all — it is the worst
option wearing the disguise of the cleanest one, because the copy stops
receiving upstream's changes and nothing reports that it has gone stale.

The ladder is not a style preference. It is the only lever that moves the cost
of every future bump at once, and a stack that never climbs it will eventually
be unable to take upstream releases at all.
[least-invasive-carrier](./techniques/least-invasive-carrier.md) carries the
decision procedure and the check that an override actually took effect.

## The set has a shape, and the shape is a cost

A patch set is not a bag. It has a granularity, an order, and an axis, and those
three choices decide how much triage each upstream bump costs.

The axis is the one people get wrong. It is tempting to organize the divergence
the way the team thinks about it — one group per feature, another cross-cutting
group for a concern that touches everything — because that is how the work was
scoped. Upstream's changes do not arrive on that axis. They arrive **per file**,
because that is the unit a source tree and its history are made of. A patch set
split by feature has patches that touch the same file, which means they conflict
with each other as well as with upstream, they require a total order to be
correct at all, and a rejected hunk cannot be attributed to one change without
reading all of them. A patch set split by upstream file has none of those
properties: the patches are disjoint by construction, the order is irrelevant,
and every reject names exactly one change.

The rule, and the narrow conditions under which a second axis earns its cost,
are in
[collapse-patch-axes-that-share-hunks](./techniques/collapse-patch-axes-that-share-hunks.md).

## The recurring work is porting, not merging

Everything above exists to make one recurring event affordable: upstream
releases, the stack is rebased onto it, and some fraction of the divergence no
longer lands. That event is where the whole subject is paid for or is not.

The naive reading of a failed hunk is that it is a merge conflict, to be settled
by looking at three texts and choosing. It is not. The line numbers in a
rejected hunk are wrong by construction — the code they addressed has moved,
been renamed, been split, or stopped existing — so the surrounding context is
not evidence about where the change belongs. The work is to reconstruct what the
change was *for*, find the place in the new code where that intent now applies,
and re-express it there. That is a port, and it needs the reason the change
exists, which is the field the ledger next door was built to hold.

There is a second, quieter failure at the same moment: a patch that applies at
an offset, or with relaxed context matching, is reported as success by most
tooling. It is not success. It means the anchor the patch aimed at has moved,
and the tool guessed. Distinguishing *applied*, *applied after guessing*, and
*rejected* as three outcomes rather than two is what keeps a hunk from landing
in a plausible wrong place —
[reject-triage-is-a-port-not-a-merge](./techniques/reject-triage-is-a-port-not-a-merge.md).

## Deferring a bump makes the next one cost more than the ones you skipped

The economics are superlinear and this is the argument that decides staffing.
Each skipped upstream release adds its own refactors to the pile, but it also
lets the *contexts* the patches anchor on drift further, so hunks that would each
have been a mechanical reoffset against one release become semantic ports
against five. Meanwhile the reason each patch exists ages out of anybody's
memory, so the reconstruct-the-intent step gets harder in the same period that
the number of hunks needing it grows. A stack that takes every upstream release
pays a small predictable tax; a stack that takes one release a year pays an
unbounded one and eventually declares the bump impossible, which is how a patch
stack silently converts into an abandoned derivative running old code.

So the bump cadence is a decision to make deliberately and write down, not an
outcome to discover. If the team cannot take upstream's cadence, that is a
finding about staffing or about the size of the divergence, and the response is
to climb the carrier ladder until the divergence fits the cadence — never to
quietly skip releases.

## The upgrade procedure is written down, and its audience is not this subject

A bump happens rarely enough that nobody remembers how, and it is performed
under time pressure by whoever is available. So the procedure is a committed,
executable sequence — the exact commands, in order, with the decision points
named — and not tribal knowledge. That much belongs here.

What does *not* belong here is the craft of writing that document for a
particular kind of reader. Maintenance runbooks are increasingly authored for
machine execution, and the rules for that — how a procedure is phrased so an
automated reader cannot skip a step, where the confirmations go, what the
document must state about its own staleness — are properties of the document,
not of patch stacks. That question belongs to the machine-authored documentation
subject, and a stack that needs it should read this subject for *what the
procedure must contain* and that one for *how to write it down*.

## Failure modes of the naive reading

- **"The patch set is just the diff, we can regenerate it any time."** Only if a
  command exists that does it and something proves the result is complete.
  Regeneration is not a mirror: it misses divergence in different directions
  depending on the mechanism, and the missing part still applies cleanly.
- **"The tree is checked out, so I can work in it."** In one carry that is
  exactly right and in the other it is the single most common way to lose work
  and to poison a build.
- **"We will clean up the patch set before the next bump."** The patch set is
  never cleaner than it is right now; the bump is what makes it worse. The
  restructuring is done immediately after a bump, when the intent of every patch
  has just been reconstructed and is briefly cheap to write down.
- **"It applied, so it worked."** Applying is a statement about text. The
  evidence that a change survived a bump is its recorded verification passing
  against the built tree, and nothing weaker.
