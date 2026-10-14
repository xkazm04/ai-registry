---
layer: technique
type: technique
subject: trust-base
technique: verifier-footprint-stays-contained
status: forged
laws: []
shared_with: []
use_when: [adding a prover or specification library to a package that other teams depend on, deciding whether to pin a verifier-coupled dependency exactly, the verified subset of the language is constraining code outside the verified part, choosing collection types for code a prover will reason about]
---

# The verifier's footprint stays contained

Verification tooling is a dependency like any other, and it has an unusual
profile: most of what it brings is **ghost**, code that exists to be checked and
is erased before anything runs. A team that adds the tooling the ordinary way
publishes all of it, pulls the verifier's release cadence into every consumer's
build, and lets the verifier's restricted language subset shape code that needs
none of its restrictions. Each is a growth of the trust base in the broad sense:
more that downstream users must accept without having asked for any proof.

Hold the footprint down on two axes, the **package graph** and the **source
tree**.

## The package graph: smallest mandatory piece

Separate what a build must have from what only a verification run needs.

- **The mandatory piece is whatever performs ghost erasure.** If the specification
  syntax lives in a macro that rewrites proof code away, that macro must exist on
  every build, because without it the proof syntax does not compile. It is a
  build-time tool, compiled and discarded, and it never links into a consumer's
  binary. Keep the mandatory set at that one piece.
- **Everything else sits behind an off-by-default feature.** The specification
  library, the builtins and any lemma library are needed only to check proofs.
  Gate their imports on that feature so a plain build erases every reference to
  them and the published graph contains none of them. The test is concrete: resolve
  the dependency graph of a default build and confirm none of the verification-only
  packages appear in it.
- **Make the feature mean one thing.** It enables verification and nothing else, and
  the umbrella package forwards it to the verified package so a single switch turns
  the whole check on.

## Exact pins are published constraints

Tooling released in lockstep with its libraries, often as dated pre-releases,
tempts an exact version requirement: a floating requirement can resolve newer
libraries than the installed verifier and fail for reasons unrelated to the code.
The pin is correct for the package itself and expensive for everybody else, and
the manifest should say both.

- An exact requirement on a pre-release version **cannot unify** with any other
  requirement on the same package in a consumer's tree. Two dependents that pin
  different dates cannot be built together at all.
- A withdrawn upstream release makes every published version that pins it
  **unbuildable from a fresh index**, however good the code is.

Name those costs in a comment next to the pin, so the next maintainer weighs them
before widening the mandatory set.

**When is an exact pin worth its unification cost?** When all three hold: the
pinned package is the minimal mandatory piece (one build-time macro, not a runtime
library), the version must match an external tool whose release is discrete and
versioned, and the project does not commit a lockfile that would otherwise
reproduce the resolution. If the pinned package is a runtime dependency, or if
more than the one macro needs pinning, move the rest behind the feature or reconsider
whether the proofs belong in the published package at all. Otherwise prefer a
compatible range and let the verification lane pin.

## One value for the version

The verifier's version appears in three places: the install step in CI, the pins
in the manifest, and sometimes a toolchain file. Make it **one value consumed by
the others**. The CI job states the verifier version once, and reads the
language toolchain the verifier requires from the verifier's own report instead of
duplicating it, so a version bump is a single edit and cannot leave a stale
toolchain behind. Keep a comment in the manifest naming the CI variable the pins
must match; two places that must agree and nothing saying so is a divergence
scheduled for the next upgrade.

## The source tree: one module of plain data

The verifier accepts a subset of the language, commonly without shared ownership
types, async, I/O or dynamic dispatch. Left unmanaged, those restrictions leak:
a type is shaped to fit the prover, and code with no connection to any proof
inherits the limitation.

**Put the verified logic in one module (or package) made of plain data, with the
host adapting at the edge.** The module holds sequences, ordered maps, integers and
enums, imports nothing with I/O, and exposes a plain-data interface. A thin adapter
on the host side converts between the host's rich types and the module's plain
ones. The dependency points one way: the host depends on the verified module, never
the reverse, so the verified module can be checked alone.

**Draw the line where the subset's constraints would otherwise leak, not where the
algorithm is most important.** An important algorithm that needs no restricted
construct can stay in the host; a modest helper that forces the host to change a
type shape belongs behind the line. The location is the boundary of the verifier's
constraints, and it is a statement about leakage.

**Choose ordered collections for the verified core.** Hash-based collections add
nondeterministic iteration order and a hashing machinery the prover handles poorly;
ordered ones give reproducible iteration, reproducible test output, and simpler
proofs over loops. At the sizes a per-file model sees, the lookup cost difference is
irrelevant. Treat this as a boundary line for the module, not a technique: the
trigger to revisit it is a measured size that makes lookup cost matter, not taste.

## Decision rules

- **If the verification-only dependency would reach a default build, gate it.**
- **Never widen the mandatory set for convenience.** Each addition is a new exact-pin
  victim for every consumer.
- **Name the cost beside every exact pin**, including what a yank does.
- **State the verifier version once.**
- **Draw the module line at leakage.**

## When not to use it

- **When nothing is published.** An application that no one depends on has no
  downstream unification cost; the discipline reduces to one source of truth for the
  verifier version.
- **When the whole package already lives within the verifier's subset.** A separate
  module then buys nothing; the adapter is unnecessary.
