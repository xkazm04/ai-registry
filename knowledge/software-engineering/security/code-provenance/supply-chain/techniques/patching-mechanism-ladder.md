---
layer: technique
type: technique
subject: supply-chain
technique: patching-mechanism-ladder
status: forged
laws: [gate-sees-target]
shared_with: []
use_when: [a dependency needs a change upstream will not ship in time, choosing between forking a library and hooking it at runtime, a small fix is wanted in a large framework nobody wants to fork, deciding how to carry a local modification so the rest of the dependency graph still resolves]
---

# The patching-mechanism ladder

Upstream will not take the change, or will take it in six months, and the
release is next week. This is the ordinary case, and the divergence it produces
has a price already stated: a committed record of the upstream commit, one
indexed entry per change, and a removal condition phrased as an event
([vendored-fork-ledger](./vendored-fork-ledger.md)). What that record does not
decide is the question a team hits first — **by what mechanism** the change is
carried at all.

Teams answer it by habit: whoever forked last time forks again, and whoever has
a hooking library in the build reaches for the hooking library. The mechanism
is not a matter of taste. It is determined by the dependency's shape — how much
of it you will diverge from, whether you can compile it from source — and then
vetoed, at the last step, by the channel the product ships through
([signature-preserving-patching](./signature-preserving-patching.md)).

## Four rungs, from most divergence to least

**1. Fork the source and carry it.** Take the upstream tree into the project as
a pinned nested checkout and build your version of it. This is the rung for a
large framework you will diverge from substantially and permanently: many
files, a structural change, an ongoing relationship rather than a patch. It is
also the most expensive rung by a wide margin, because you have acquired the
whole tree's maintenance surface to carry a change that touches part of it, and
because the resolved graph stops naming an upstream version for that code
entirely — every mechanical guard over it ends at once.

**2. Mirror-project shadowing.** Keep the upstream tree in the repository
**unmodified**, and author a parallel build definition beside it that includes
the upstream sources file by file, substituting only the files you changed. The
mirror is then wired to masquerade as the ordinary package reference, so the
rest of the dependency graph resolves against it exactly as it would against
the published package — nothing downstream learns that a substitution happened,
and no consumer of the dependency has to be told.

The property that earns this rung is that **the divergence is exactly the
substitution list**. There is no diff to compute against upstream and no
hand-edit to detect, because the upstream files were never touched: the set of
shadowed files *is* the patch set, readable in one file. It fits the common
middle case — a handful of changed files in a dependency you can compile from
source, a change too invasive for an extension point and far too small to
justify rung 1.

**3. Runtime hooking.** Leave the shipped dependency binaries untouched and
rewrite behaviour in memory as the process starts, through a hooking library.
This is a source-free rung: it is available when you have only compiled
artifacts, cannot rebuild the dependency, and the change is a bounded set of
function bodies. It is the cheapest rung to reach for and the one with the
largest hidden bill, which the sibling technique charges.

**4. Build-time binary rewriting.** Express the same modifications as rung 3,
but apply them to the compiled binaries during the build, producing ordinary
statically-modified artifacts. Also source-free, and available in every
situation where rung 3 is available — the binaries you would have hooked at
start-up are inputs your build already holds.

## Choosing the rung

- **Can you compile the dependency from source?** No — you are on rung 3 or 4,
  and the sibling technique decides which. Yes — rungs 1 and 2 are open and are
  almost always better, because they keep the modification in source form where
  it can be read.
- **How many files do you diverge from, and will that number grow?** A handful
  and stable: shadow. A structural divergence you expect to deepen release over
  release: fork, and staff it as a derivative rather than pretending it is a
  patch set.
- **Prefer the rung that leaves the most of upstream mechanically comparable to
  what upstream published.** That comparability is what makes the next
  re-vendoring a walk rather than an archaeology project, and it is the
  property rung 1 destroys first.
- **Check for a supported extension point before entering the ladder at all.**
  A dependency that exposes a documented hook, a policy interface, or a
  replaceable component is not being patched when you use it; none of this
  applies, and reaching for rung 3 over an interface the library offers is
  paying the ladder's price for nothing.
- **The ladder has a rung zero: upstream the change and pin the release.** When
  upstream will take it on a timeline you can survive, every rung above is a
  cost you chose to pay.

## Why the alternatives to shadowing are rejected on posture, not on capability

Rung 2 has three obvious alternatives that all *work*, and the shape of their
rejection is the transferable part:

- **Publish the customized build to a feed only your team can reach.** This
  delivers the patch perfectly and quietly contradicts a project's stated
  posture: anyone who clones the repository can no longer build it, because the
  build now depends on an access-controlled artifact that is not in the
  repository — a project whose claim is "you can build this yourself" has made
  that claim false without changing a word of it. The private feed is also a
  supply-chain component in its own right, with custody, availability and
  provenance obligations nobody scoped.
- **Publish the customized build to the public feed.** This is pollution of a
  commons. The name implies a relationship with upstream that does not exist,
  it occupies namespace with a build no other consumer wants, and every
  resolver in the ecosystem acquires one more near-namesake to disambiguate —
  a permanent cost imposed on everyone to spare one team a build definition.
- **Mount the entire upstream source into the workspace and build it.** This
  works on the first day and bills continuously: every developer and every
  pipeline run pays the compile time of the whole upstream tree, forever, to
  serve the handful of files that differ. It also puts the whole tree under
  everyone's editor, which is precisely the condition that produces the
  hand-edit smeared into vendored source that the ledger's reverse-apply check
  exists to catch.

None of the three was rejected for failing to deliver the change. All three
deliver it. They were rejected on **posture, commons and continuous cost** —
discriminators entirely outside the code — and that is the general lesson of
this ladder: past a certain rung the mechanisms are functionally equivalent, so
the decision is made by properties of the project and its channel, never by the
patch.

## What each rung leaves visible to the guards

The mechanism decides what a policy gate can still see, which makes this a
[gate-sees-target](../../../../_laws.md#gate-sees-target) question rather than an
ergonomics one. Rung 1 removes the dependency from the resolved graph, so
advisory matching, license checks and update proposals all have nothing to
match — the guards end rather than fail, which is the state
[vendored-fork-ledger](./vendored-fork-ledger.md) exists to price. Rungs 2, 3
and 4 leave the manifest still naming the upstream version, and that is a real
and underrated advantage: the advisory feed keeps working, an update proposal
still arrives, and the project still learns when the code it modified is
recalled.

But it buys that at the cost of a second divergence in the other direction. At
those three rungs the resolved graph describes upstream code while the product
ships modified behaviour, and no mechanical reader of the graph can tell. The
graph is now a proxy that is *correct about provenance and wrong about
behaviour*. So the inventory of modifications must be a first-class committed
artifact at every rung — and the rungs where the upstream tree is left pristine
are exactly the rungs where it feels like no fork happened, which is why they
are the rungs where the record is skipped.

## Decision rules

- Choose from the dependency's shape first — source availability, then the size
  and expected growth of the divergence — and prefer rung 2 over rung 1
  whenever that divergence is enumerable.
- Reaching for a rung because the tooling is already in the build is not a
  reason; write down the shape argument or take rung zero.
- Never adopt a mechanism whose delivery cost falls on people outside the
  project — a namespace, a commons, or every future build — when one exists
  whose cost falls inside it.
- Every rung owes the same record. The mechanism changes where the divergence
  physically lives — patch artifacts beside a vendored tree, a substitution
  list beside a mirror, an inventory of hooked entry points, a rewriting recipe
  in the build — and changes nothing about the obligation to keep one.
- Re-run the choice when the divergence grows. A shadow list that has been
  growing every release is telling you the shape changed and rung 1 is now the
  honest answer.
