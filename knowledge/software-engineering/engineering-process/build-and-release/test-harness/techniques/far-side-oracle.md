---
layer: technique
type: technique
subject: test-harness
technique: far-side-oracle
status: forged
laws: [gate-sees-target, failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [the product's whole claim is an effect on a system it does not own, in-product readback can only confirm the product tried, a lane needs an observer the build does not produce]
---

# The far-side oracle

Most live-app lanes close their loop inside the product: the harness drives the
real build, the operation stashes a result somewhere the control surface can
query, the harness reads it back. That loop is correct whenever the claim under
test is about the product's own state.

One class of product breaks it. When the product's entire purpose is to **effect
a change on a system it does not own** — a remote-control appliance driving
another machine's input devices, a provisioning tool mutating cloud
infrastructure, a driver stack presenting a virtual peripheral to a host, a
browser-automation library, a hardware bridge — the in-product readback is a
tautology. It confirms the product *emitted* something. Whether anything
*arrived* is a fact that exists only on the far side, and no amount of
instrumentation on the near side can witness it. A lane built entirely of
near-side readbacks reports green while the effect has not landed for weeks,
which is the empty-success lie
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success))
with the whole product boundary between the assertion and the truth.

> **Put the oracle where the effect lands, not where it was sent from.**

## The oracle is a deployable agent, and the lane deploys it

The far side is not part of your build, so nothing about it can be assumed. The
practical shape is a small daemon — a few hundred lines, no dependencies,
cross-compiled — that the lane itself pushes to the far host, starts, and health-
checks before any test runs. It exposes a flat read-only HTTP surface over the
substrate facts the tests need, and the deployment step is a first-class part of
the lane's setup rather than an environment prerequisite in a wiki.

Three properties earn their keep:

- **It reports substrate, not product vocabulary.** The agent surfaces raw
  operating-system observations — kernel input events with their codes and
  values, the device enumeration, the mount table, the process list — never a
  re-implementation of the product's own model of what it did. An oracle that
  speaks the product's language has inherited the product's misconceptions, and
  will agree with a bug.
- **It is separately built and separately versioned.** The agent targets the far
  host's architecture, which is usually not the product's. Building it in the
  product's own pipeline couples two unrelated toolchains; building it in the
  lane's setup step keeps the coupling where it belongs.
- **Its absence skips, and never fails.** Whether a far host exists is a property
  of the environment, not of the change under test. The lane declares its
  requirement (a host address, a credential) and skips loudly when it is unset,
  so the same suite runs on a developer's laptop and on the one machine that has
  the hardware. A hard failure here trains people to ignore the lane.

## What the far side makes measurable that nothing else does

The reason to pay for this is not only fidelity; it is that the far side is where
the interesting quantities live, and they are usually resource quantities rather
than functional ones. The near side can tell you a session was established. Only
the far side can tell you that establishing it forty times left forty devices
registered in the host's kernel.

That makes the lane the natural home for leak and lifecycle claims, and it brings
their discipline with it. An assertion that a counter "does not grow" is almost
always wrong, because legitimate operation grows it; the useful assertion is
against a **derived budget** — the per-event cost, times the number of events the
window legitimately permits, plus a stated margin — with each factor named
separately so a failure says which one was violated
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). A
threshold written as one bare number is unmaintainable the first time the
per-event cost changes, because nobody can tell whether the number was a
measurement or a guess.

## The boundary with the near-side lane

Both lanes exist; they answer different questions and neither substitutes.
Near-side readback proves the product's internal contract — the message was
formed, the channel was open, the state machine advanced — and it is cheap enough
to run per-commit. The far-side lane proves the claim the product is sold on, and
it is slow, environment-bound, and scheduled accordingly. Write the split into
the lane configuration with the reason attached, because the far-side lane's cost
makes it a standing target for consolidation, and consolidating it away restores
exactly the blind spot it was built to remove
([gate-sees-target](../../../../_laws.md#gate-sees-target)).
