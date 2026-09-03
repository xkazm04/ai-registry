---
layer: technique
type: technique
subject: supply-chain
technique: toolchain-floor-drift
status: forged
laws: [gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [claiming support for an older toolchain or runtime, a build broke on a machine nobody changed, deciding how long a compatibility window should be]
---

# Toolchain floor drift

A project that claims to support an older compiler, runtime or language version
has made a promise about a number it does not control. The **declared** floor
sits in its own manifest. The **effective** floor is the maximum of the declared
floors across the entire transitive dependency graph — and that graph's floors
move on the world's clock, without any change to the project, without a version
bump anyone reviews, and without a line in any changelog the team reads.

## Why the floor rises on its own

Two ecosystem behaviours combine, and each is individually reasonable:

- **Dependencies declare a minimum toolchain version**, which is good practice
  and the thing that makes compatibility checkable at all.
- **That declared minimum is routinely raised in a patch or point release**,
  which many ecosystems treat as ordinary maintenance rather than a breaking
  change — the argument being that the package's own interface did not change.

The consequence is that a resolver honouring a permissive version range will,
on some ordinary day, select a patch release of a package three levels down
whose floor is now higher than the project's claim. Nothing in the project
changed. The claim is now false, and it was falsified by a third party's
maintenance decision.

**How it is discovered is the second half of the problem.** It surfaces as a
build failure on the one machine or lane still running the old toolchain,
usually during an unrelated change, presenting as a mystery — the failing
change did not touch dependencies, and the same commit built yesterday. Teams
that hit this repeatedly learn to treat the old-toolchain lane as flaky, which
converts a real supply-chain signal into noise and then removes it.

## The floor is a claim, and an unbuilt claim is prose

The controlling rule is the general one about what a check actually observes
([gate-sees-target](../../../../_laws.md#gate-sees-target)):

> A pipeline that builds only on the current toolchain has never once observed
> the floor the project advertises. Every green result it produces is evidence
> about a version nobody claimed to support.

So the first requirement is mechanical, not procedural:

1. **Build at the declared floor, in the pipeline, on every change.** One lane,
   pinned to the exact minimum version claimed. This is the only artifact that
   converts the claim from prose into a fact, and it is cheap.
2. **Resolve as a consumer would.** The lane must let the resolver pick versions
   the way a fresh consumer's would, not build from a committed resolution that
   pins away the whole problem. A locked build is the right default for
   reproducibility and it is precisely the wrong instrument here: it makes the
   lane green for as long as the lock is untouched, and the breakage then
   arrives at the consumer instead. Run both — locked for reproducibility,
   resolved for the floor.
3. **Treat a floor rise as a dependency change**, because it is one, and route
   it through the same review as any other incoming third-party change
   ([update-automation-review](./update-automation-review.md)). The diff is not
   in the manifest, which is what makes it easy to wave through.
4. **State the floor in the policy file**, where the rest of the standing
   acceptance rules live
   ([dependency-policy-gates](./dependency-policy-gates.md)). A minimum
   toolchain is an acceptance criterion in exactly the same sense as a license
   or an advisory threshold: a resolution that violates it is a resolution the
   project does not accept.

## Choosing a window deliberately

Support windows are usually inherited rather than decided — a number chosen
once, then defended indefinitely against a cost that grows silently.

One measurement is worth carrying, with its protocol attached as any travelling
number must be
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): across
the hundred most-downloaded packages of one large ecosystem, most-recent major
releases, compatibility determined by binary search over every compiler release
and checked by an actual build, **a given compiler version remains viable for
roughly two years for a project that takes dependencies at all.** Beyond that
window the graph's collective floor has typically overtaken it, and holding the
older version stops being a matter of discipline and becomes a matter of
maintaining private resolutions.

Read it as an order of magnitude rather than a constant — it is one ecosystem,
one snapshot, one method, and the author of the experiment stated plainly that
it involved no lockfile manipulation and probably contains mistakes. What it
supports is the shape of the decision, not a specific date:

- **A window of about two years costs approximately nothing**, because the
  ecosystem is already holding it for you.
- **Substantially longer is a real, recurring engineering commitment** —
  private resolutions, held-back dependencies, a second graph to maintain — and
  should be chosen with that cost visible, and re-derived on a schedule rather
  than inherited.
- **The cost is not linear in the window.** It is near-zero inside the
  ecosystem's own window and rises sharply past it, so the interesting decision
  is whether to cross that edge at all.

Zero dependencies is the other end of the same axis, and it is the only posture
that makes the floor fully controllable: a project with no third-party graph has
an effective floor equal to its declared one, permanently. That is a real option
for small, long-lived, high-assurance components and a poor one nearly
everywhere else, but it is worth naming as the boundary condition — every
dependency admitted is a transfer of control over the support window.

## When this does not apply

- **Applications that ship their own runtime.** If the toolchain travels inside
  the artifact, there is no consumer resolving against an older one, and the
  floor is an internal build detail rather than a promise.
- **Ecosystems with no declared-minimum convention.** The mechanism needs a
  machine-readable floor to drift; where none exists the problem is real but
  presents as ordinary incompatibility, without the silent-rise property.
- **Where the floor is pinned by something stricter anyway** — a certified
  runtime, a distribution's packaged version, a platform requirement. Then that
  constraint is the floor and this one is subordinate to it.
