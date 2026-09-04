---
layer: technique
type: technique
subject: invariant-placement
technique: constraint-deletion-is-silent
status: forged
laws: [deletion-is-not-repair, failure-not-empty-success, gate-sees-target]
shared_with: []
use_when: [raising an invariant above the call site, deciding what test protects a structural guarantee, a refactor that made a restricted value copyable, a negative fixture that breaks on every toolchain upgrade]
---

# Constraint deletion is silent

Every other kind of guarantee announces its own removal. Delete a runtime
check and something eventually throws; delete a gate and the pipeline stops
reporting; delete a test and the count drops. A **structural** invariant is the
one class that vanishes without a signal, and the reason is a property of the
whole altitude rather than a defect of any particular encoding:

> Removing a structural constraint makes strictly **more** programs valid.
> Every program that compiled still compiles. Every test that passed still
> passes. Nothing is red, and nothing was ever going to be.

Someone loosens a restricted value so it can be duplicated, because one call
site was awkward. Someone widens a construction path so a second caller can
reach it. Someone replaces a distinct kind of value with the raw one it wrapped
during a merge conflict. In each case the guarantee that justified the design
is gone, the suite is green, coverage did not move, and the review diff looks
like a simplification — which is exactly what
[deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair) warns
about at the one altitude where the deletion leaves no visible hole. It is
[failure spelled as empty success](../../../../_laws.md#failure-not-empty-success)
with no instrument to assert, because there was no instrument.

## The obligation: a negative artifact per raised invariant

This is the seeded-violation discipline from
[gate liveness](../../quality-gates/techniques/gate-liveness.md), applied where
the "gate" is the language's own checker. A gate is proven alive by feeding it
a known-bad input and watching it refuse. So is an encoding.

**When an invariant is raised above the call site, an artifact is written in
the same change that asserts a known-bad construction is rejected.** Not a test
that the good path works — that one already exists and proves nothing about the
constraint. An artifact whose *pass* condition is a refusal.

The mechanism varies by toolchain and the choice does not matter much; what
matters is that the artifact exists, runs on the binding rung, and fails when
the constraint is removed. The common forms:

- a fixture compiled in a mode where failure to compile is the expected result,
  collected by the ordinary suite runner;
- a build target expected to fail, with the runner asserting the failure;
- for the door altitude, which is checkable at run time, an ordinary test that
  the constructor refuses the known-bad input — the cheapest case, and the one
  people skip because it feels obvious.

Three properties make the artifact worth its maintenance:

1. **One artifact per invariant, named for the invariant.** A single "these
   things must not compile" bundle degrades into a bundle that fails for the
   wrong reason and gets suppressed wholesale.
2. **Seen red at birth.** Delete the constraint locally, watch the artifact
   fail, restore it. An artifact that has never been observed failing is
   indistinguishable from one that cannot fail — the same reasoning that makes
   a passing rule no evidence until something has made it fail
   ([vacuous-by-evaluation](../../quality-gates/techniques/vacuous-by-evaluation.md)).
3. **On the binding rung.** These artifacts run in a different mode from the
   ordinary suite and are therefore easy to leave out of the pipeline
   invocation. A negative suite that only ever runs on one engineer's machine
   is not a check of anything
   ([gate-sees-target](../../../../_laws.md#gate-sees-target) applied to the
   invocation: the rung must actually read the artifact).

## The trade this artifact makes with the tests it replaced

Raising an invariant *retires* tests — where a shape makes the invalid state
unrepresentable, generating invalid inputs against it tests the language rather
than the system
([negative-space generation](../../../build-and-release/test-input-generation/techniques/negative-space-generation.md)).
That retirement is real value and it is the reason this technique exists: the
retired tests were the thing that would have gone red. The negative artifact is
the small, deliberate remainder kept back from the retirement — one assertion
where there were fifty, holding the property that the fifty were incidentally
holding.

State the exchange when you make it. A change that deletes a validation suite
"because the shape now guarantees it" and adds no negative artifact has
converted a measured guarantee into an unmeasured one and reported it as
cleanup.

## When not to use it

**When the artifact pins exact diagnostic text.** The tempting form of a
compile-failure fixture stores the checker's rendered message and compares
against it verbatim. It is precise, it reads beautifully, and it makes the
toolchain's own wording a load-bearing part of your test suite. Every upgrade
that improves an error message breaks the fixture; nothing is wrong; someone
regenerates the expected output without reading it, and after two or three
rounds of that the regeneration is reflexive and the fixture proves nothing —
it now asserts that the checker says whatever the checker says. Worse, the
regeneration habit will silently absorb the day the message changes because the
*constraint* changed.

The repair, in order of preference:

- assert **that** the construction is rejected and, where the toolchain offers
  one, assert the stable error identifier — never the rendered prose;
- where only text is available, match a minimal invariant substring rather than
  the full rendering, and keep the fixture count small enough that a
  regeneration is read rather than accepted;
- where neither is possible, keep the artifact anyway and treat every
  regeneration as a review item with a named reviewer, because an unreviewed
  regeneration is the deletion this technique exists to catch, arriving through
  the door marked maintenance.

**When the invariant is not actually structural.** If the rule is enforced by a
runtime check, it already has a failing test available, and a negative
compile-time artifact for it is theatre.

## Decision rules

- No invariant rises above the call site without a negative artifact in the
  same change.
- The artifact's pass condition is a refusal; it is watched failing once before
  it is trusted.
- One artifact per invariant, named for the invariant, running on the binding
  rung.
- Assert the refusal and a stable identifier; never the rendered message.
- A change that retires validation tests on the strength of a shape states the
  exchange and names the artifact that replaces them.
- Treat a fixture regeneration as a review item, never as maintenance.
