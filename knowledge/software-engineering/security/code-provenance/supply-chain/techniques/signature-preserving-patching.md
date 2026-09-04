---
layer: technique
type: technique
subject: supply-chain
technique: signature-preserving-patching
status: forged
laws: [gate-sees-target, verdict-survives-boundary]
shared_with: []
use_when: [choosing between modifying a dependency at start-up and modifying it during the build, a shipped build is quarantined by endpoint protection and nothing in the code changed, modified modules fail platform verification while the installer passes, deciding whether a patching mechanism survives the channel the product ships through]
---

# Signature-preserving patching

Two rungs of the [patching-mechanism-ladder](./patching-mechanism-ladder.md) do
the same job. Modifying a dependency's compiled modules in memory as the
process starts, and rewriting the same modifications into those modules during
the build, can express the same change with the same behaviour at execution. A
team comparing them on the code will find nothing to choose between, pick the
one that is faster to wire up — start-up modification, always — and discover
the difference months later, from users, in the form of blocked installs.

The decision is not made in the code. It is made at the **distribution
channel**, and the channel is not present on the machine where the choice is
taken.

## What start-up modification costs at the channel

Neither cost is a correctness cost. Both are properties of the destination.

**The mechanism is indistinguishable from the attack it resembles.** A process
that opens another module, rewrites its executable code in memory and continues
running is a near-exact description of the injection family that the platform's
heuristic malware detection exists to catch. There is no way to write the
modification more carefully so that it stops matching, because the pattern
being matched *is* the mechanism. The consequences are asymmetric in a way that
makes them hard to plan around: a heuristic verdict is versioned by a third
party, so a release you did not change can begin failing on a signature update
you never saw; the failure lands on the user's machine as a quarantine or a
blocked install rather than in your pipeline; and you cannot reproduce it from
your side, because your machines are the ones with the exception already in
place.

**The modification cannot inherit the application's signature.** Signing covers
bytes at rest. A module rewritten after the process starts is not the module
that was signed, and there is no mechanism by which a signature computed at
build time extends over code that came into existence at run time. On the
platforms that verify inner modules independently — the ones packaging's
[signing-and-trust](../../../../engineering-process/build-and-release/packaging/techniques/signing-and-trust.md)
enumerates by trust class — the chain breaks precisely at the module you
changed, and the enclosing artifact's valid signature does not repair it.

## Rewriting during the build makes the modification ordinary

Move the same modifications into a build step that rewrites the compiled
modules before packaging, and everything downstream becomes boring. The outputs
are ordinary statically-modified binaries. They enter the signing pipeline like
every other output and carry the application's signature, including on the
platforms that check inner modules. There is nothing at start-up for a
behavioural heuristic to observe, because nothing happens at start-up. And the
step is unattended and reproducible, so the pipeline can run it without a human
in the loop and the artifact it produces is the artifact that was tested.

The platform's trust machinery itself — identity classes, the per-cell decision
about which platforms ship signed, the requirement that inner binaries be
covered — belongs to
[signing-and-trust](../../../../engineering-process/build-and-release/packaging/techniques/signing-and-trust.md)
and is not restated here. The chain a product *produces* for its own carried
data — integrity, provenance and admissibility of an artifact a consumer will
verify — is [signed artifacts &
provenance](../../signed-artifacts/signed-artifacts.md), a different chain with
a different verifier. **The discriminator this technique owns is neither: it is
that the choice of patching mechanism decides whether there is anything left
for either chain to sign.**

## The rule, stated generally

> A patching mechanism is chosen against the distribution channel, not only
> against the code.

Two mechanisms can be functionally identical and only one of them ships. The
channel's constraints — platform signature verification, provenance
attestation, store review, managed-fleet policy, endpoint protection — are
properties of the destination, invisible to every test that runs on a
developer's machine, and they are evaluated after the artifact has left. That
is what makes them a *design* input rather than a release-checklist item: by
the time the channel says no, the mechanism is load-bearing in the build and
the cost of changing it is a rewrite.

The rule generalizes past desktop distribution. Any channel that inspects what
it accepts — a runtime that refuses modules whose attestation does not match, a
managed environment whose policy blocks processes that make memory executable,
a review step that reads shipped binaries — imposes the same veto on the same
rung, for the same reason: the modification is not in the thing the channel
examines.

## The audit corollary

The property that makes the build-time rewrite ship is the same property that
makes it auditable, and this is the part worth carrying even where no channel
enforces anything.

A modification applied during the build is *in the artifact you signed*. Anyone
holding the artifact can extract it, compare it against the unmodified upstream
module, and see the change as a fact about the file. A start-up modification is
applied to memory after the artifact was verified: what shipped and what runs
differ, and the only account of the difference is the source that installs the
modifications — a description of the change rather than the change, which is
exactly the substitution
[gate-sees-target](../../../../_laws.md#gate-sees-target) warns about. Reviewing
the shipped artifact answers "what was modified?" for one mechanism and cannot
answer it for the other.

The signature makes the same point one level up. A signature is a verdict about
a set of bytes, computed once, that must reach the loader acting on it as a
claim about the code that will execute
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
Start-up modification does not invalidate the signature; it does something
worse, leaving a *valid* signature over modules that no longer determine
behaviour. The verdict arrives intact at the boundary and has quietly stopped
meaning what the verifier reads it to mean — which is the failure mode nobody
detects, because nothing reports an error.

## When start-up modification is still the right rung

The rule bites at a channel. Where there is no channel, it does not bite:

- **Tooling that never leaves the machine it was built on** — a local harness,
  a profiling shim, a debugging aid — has no signing pipeline to satisfy and no
  fleet policy to survive. Start-up modification is cheaper and the argument
  above is inapplicable, not overruled.
- **Test-time instrumentation** that is present in a test run and absent from
  every shipped artifact is in the same position, and the boundary must be real:
  a mechanism that "is only used in tests" but is linked into the release build
  is a shipped mechanism.
- **A modification that genuinely must be decided after start** — per user, per
  configuration, per host — cannot be expressed as a static rewrite. The honest
  structure is then to rewrite the *switch* into the artifact during the build
  and decide it at run time, rather than to synthesize code at run time; the
  branch is auditable and signed even though the choice is not made until
  execution.

## Decision rules

- Decide the mechanism against the channel at the moment the mechanism is
  chosen. Naming the destination — its verification, its policy, its endpoint
  protection — is part of the design, not of the release.
- Where both mechanisms express the change, apply it during the build. Equal
  function, unequal shipability, and the difference is not recoverable later.
- Treat "the modified modules do not carry the application's signature" as a
  blocking property of the mechanism, never as a signing bug to be worked
  around downstream.
- Never respond to a heuristic detection by tuning the modification. The
  mechanism is what is being matched; only changing the mechanism changes the
  verdict.
- Require that the shipped artifact answer "what was modified in this
  dependency?" on its own. If the answer lives only in code that runs at
  start-up, the artifact is not auditable by anyone who holds it.
