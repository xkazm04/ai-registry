---
layer: technique
type: technique
subject: vendored-patch-stack
technique: one-reset-authority
status: forged
laws: [creation-names-reaper, one-authority-per-vocabulary]
shared_with: []
use_when: [a vendored upstream tree is also a version-control checkout, deciding what a clean build of a patched third-party tree means, a build failed in a way that only re-extracting the upstream tree fixed, a maintainer wiped a vendored tree and lost work or an expensive download]
---

# One reset authority

A vendored upstream tree is a **created resource with an expensive
constructor**: a pinned version resolved, an archive fetched over the network, a
signature verified, an extraction, a rename, a patch pass, and often a
dependency bootstrap that dwarfs all of it. Per
[creation-names-reaper](../../../../_laws.md#creation-names-reaper), the thing
that destroys it has to be named at the moment it is created — and for this
particular resource "named" has to mean *exactly one command*, because the
tree's second identity supplies a competing answer for free.

That second identity is the problem this technique exists for. Where the stack
carries its divergence as a branch in the upstream's own history, the vendored
tree is simultaneously a build workspace and a version-control checkout, and the
two tools each believe they know what resetting it means:

- The **version-control** reset restores tracked content to a recorded state. It
  is blind to generated files, downloaded toolchains, object directories and
  build caches that live inside the tree and that the build depends on — and its
  companion clean operation, which does see untracked files, will happily delete
  them all.
- The **build system's** removal target discards generated output. It is blind
  to source edits, so it leaves a half-ported patch in place and reports
  success.

Neither is wrong about its own domain. Both are wrong about the tree, because
the tree is in both domains at once. The failure is silent in the direction that
matters: a partially restored tree usually still builds, so the wrongness
surfaces later as a defect that reproduces on one machine and nowhere else.

## The rule

**Exactly one command in the project destroys the vendored tree, it lives with
the build system, and every other command that could plausibly destroy it is
documented as an error inside that directory.** The set of reset operations is a
closed vocabulary with one authoritative definition
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary));
a build target and a maintainer's version-control habit are two hand-maintained
copies of it, and they will drift at the moment someone needs them to agree.

"Documented as an error" is weak on its own, and where the tooling permits it,
the strong form is available and cheap: make the destructive alternatives fail
in that directory rather than merely be discouraged. A guard that has to be
remembered protects the maintainer who read the document and nobody else.

## The reset is graded, and the grades are named by what they preserve

A single destroy-everything command is the wrong shape, because the layers of
the resource have wildly different reconstruction costs and the expensive layer
is almost never the one that is wrong. Three grades cover the real cases, and
the discipline is that each one is a named target whose definition says which
layer it preserves:

1. **Discard build output, keep the patched tree.** The common case. The source
   is right and the object graph is stale.
2. **Discard the patched tree, keep the fetched upstream artifact.** The case
   after a patch changes: the tree is re-extracted and re-patched from the
   archive already on disk. This is the grade most stacks are missing, and its
   absence is what pushes people to the destructive one.
3. **Discard everything including the fetched artifact.** Reserved for a change
   of pinned version or a suspicion about the download itself.

Default to the cheapest grade that can possibly be correct, and make the
expensive grades opt-in by name rather than by flag, so nobody reaches the
network because they typed one character too many. The naming matters more than
the count: a grade called "clean" and a grade called "really clean" are a
vocabulary nobody can use correctly under pressure, whereas grades named for the
layer they discard are self-describing.

## Re-materialization is the test, and it belongs in the pipeline

The claim that the tree is disposable is a claim, and like every claim about a
tree it decays. It decays the same way every time: someone fixes something by
hand in the vendored tree, the fix works, and the fix exists nowhere but in that
directory. Nothing reports this. Every local build stays green for as long as
nobody resets.

So the practice that keeps the property true is that **something builds from a
fully re-materialized tree on a schedule the team actually feels** — every
change if the materialization is cheap, nightly if it is not. The value is not
the build; it is that the interval between a hand-edit and its discovery stays
short enough that whoever made it still remembers what it was.

## Boundaries

This is about the destruction and re-creation of the tree, not about what the
tree should contain. Which artifact is authoritative when the tree and the patch
set disagree is [patch-set-authority](./patch-set-authority.md), and the reason
a stack can afford to throw the tree away at all is that that question was
answered first.

It is also not the provenance question. What version the tree was materialized
from, and whether that version is still one the project is allowed to ship,
belongs to the fork ledger in the supply-chain subject. This technique assumes
the pin exists and governs only the lifecycle of the thing built from it.

## When not to use it

When the tree is genuinely cheap to reconstruct — a small archive, no bootstrap,
seconds rather than minutes — the graded ladder is ceremony. Collapse it to one
target that discards everything, and keep only the rule that the target is the
sole authority. The grades exist to protect an expensive layer; where no layer is
expensive, they only add a vocabulary to get wrong.

And do not extend this to the project's own source tree. The reason the vendored
tree needs a single destroyer is that it is *derived* and nobody should have
state in it. A first-party tree is the opposite: the state in it is the point,
and a command that destroys it on one word is a hazard rather than a convenience.
