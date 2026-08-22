---
layer: technique
type: technique
subject: test-harness
technique: negative-control-tests
status: forged
laws: [failure-not-empty-success, gate-sees-target]
shared_with: []
use_when: [adding tests that license a refactor, covering a recovery or crash path the normal suite never executes, a suite has been green since it was written]
---

# Negative-control tests

A test that has never been observed failing is an **unvalidated instrument**.
It passes; that is all anyone knows. It may be asserting a tautology, asserting
against a stub, or never reaching its assertion at all — and every one of those
states is spelled `ok` in the report, indistinguishable from real coverage
([failure must be spelled differently from empty
success](../../../../_laws.md#failure-not-empty-success)).

A negative control is the deliberate run where the test **must** fail: break
the thing under test, watch the assertion fire, restore. It is the same move
that proves a gate is alive, applied to the other population. Gates get seeded
failures; tests get negative controls.

## The procedure

1. **Name the protection.** The behaviour the test exists to defend — the
   recovery arm, the boundary check, the projection matching the store.
2. **Remove it, minimally.** Delete the recovery call, drop the guard, mutate
   one identifier. One edit, in the production path, not in the test.
3. **Run and read the failure.** Two things are being checked, not one: that
   the test fails, and that its message names the defect well enough to act
   on. A test that fails with an unhelpful message will cost its debugging
   time later, when nobody remembers what it covers.
4. **Restore and record.** Note in the test's own comment which mutation was
   used to prove it. The next reader inherits a validated instrument instead
   of a hopeful one, and can re-run the proof cheaply.

## Choose a mutation the system cannot absorb

The step that most often fails silently is step 2, and its failure looks like
success: **the test passes under the mutation, and that is read as noise
rather than as a finding.**

The instructive case: a probe asserting that a stored record's fields match the
projection reading them was proved by altering one field name's capitalisation
— and it still passed, because the store matches names case-insensitively. The
mutation was normalized away by the very layer under test. Nothing was learned,
and had the check stopped there, a probe that could not fail would have been
certified as one that could.

The rule: **a mutation must be one the system has no way to normalize,
default, or absorb.** Rename to something absent, not to a variant. Delete a
required element rather than reordering it. Where a layer is known to be
lenient — case folding, coercion, silent defaulting, tolerant parsing — assume
it will eat any subtle mutation, and make a coarse one.

## Never quiet the harness's failure channel

The most expensive way to lose a negative control is to make the whole harness
mute. Tests that exercise crash and recovery paths produce noisy output by
design — traces, dumps, error lines — and the reflex is to install a
process-wide handler that suppresses it.

Do not. A process-global crash handler **replaces the harness's own capture**,
so a genuinely failing assertion inside such a test produces a harness that
dies with no output at all: no assertion message, no location, no report.
Observed exactly this way while proving a set of recovery tests could fail. The
tests looked clean precisely because they had been quieted, and the quieting
was invisible in their source.

Two rules follow:

- **Noise from an intentionally failing path is the sound of the control
  working.** Leave it, and say in a comment why it is there — otherwise a
  future tidying pass silences it again.
- If output genuinely must be reduced, reduce it **inside the test body**,
  scoped to the call. Never by replacing a process-global reporting hook, and
  never in shared setup, where the change reaches every test in the suite and
  the harness stops being able to tell you anything at all
  ([the gate must see its target](../../../../_laws.md#gate-sees-target)).

## Where the technique earns its cost

Not on every assertion — the cost is one extra edit-run-revert cycle per test,
and spending it uniformly is waste. Spend it where a passing test is doing the
most load-bearing work:

- **Paths the ordinary suite never executes.** Crash barriers, recovery arms,
  failure branches. Adopting a shared helper for these moves many call sites
  onto code the suite has never run; the negative controls are then the only
  thing standing behind that move.
- **Tests written to license a refactor.** "It is safe because the tests
  cover it" is a claim about the tests, and the claim is worth what its
  negative control is worth.
- **Probes asserting a correspondence** between two artifacts that drift —
  a declaration against a store, a schema against a reader. These are the
  ones most likely to be tautological by construction.
- **Any suite green since the day it was written**, when a decision now
  depends on it.

## When not to use it

Where the assertion's failure is already observed routinely — a test that
goes red on ordinary mistakes during development has been continuously
proving itself, and a ceremonial control adds nothing. And where the mutation
cannot be made without a change large enough to invalidate the comparison
(the removal cascades, and what you observe failing is a different system),
prefer a fixture built to be broken over a mutation of the live path.
