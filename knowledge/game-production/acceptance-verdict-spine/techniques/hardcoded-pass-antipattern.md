---
layer: technique
type: technique
subject: acceptance-verdict-spine
technique: hardcoded-pass-antipattern
status: forged
laws: [no-gate-self-certifies, unmeasured-is-not-a-pass, compiling-is-not-wiring]
shared_with: []
use_when: [auditing a gate that has never failed, reviewing generated pipeline code, a checklist row is authored rather than computed]
---

# Hardcoded pass antipattern

The named concern: **a gate whose success is written into it rather than derived from
evidence** — success theatre. Naming it as a species matters because it arrives in
several disguises and each one looks locally reasonable.

## The signature

The diagnostic question is one line long: **has this check ever failed?**

A gate that has never once reported anything but success, across every unit and every
run since it was written, is either trivially satisfied or not a gate. Both cases
deserve a look, and the second is common.

## The disguises

- **The literal constant.** The producing code writes a success field directly into
  the artifact, and the checker reads it back. The round trip through storage makes it
  look like a derivation. It is a constant with extra steps.
- **The empty gate.** A check with no declared inputs. Nothing can block it, so
  nothing does.
- **The authored checklist.** A list of check names, each with a status typed by the
  person who wrote the pipeline, rendered as though computed.
- **The optimistic default.** A computed gate whose "no evidence found" branch returns
  success — usually written as a convenience during bring-up, when no evidence existed
  yet, and never revisited.
- **The producer's own claim, unchallenged.** The generator says it succeeded and the
  gate agrees ([no gate self-certifies](./../../_laws.md#no-gate-self-certifies)). The
  companion technique for the unresolvable case is `ungraded-marker-doctrine`.
- **Structural sufficiency.** The gate checks that the artifact exists and parses and
  calls that a pass. Real derivation, real evidence, wrong rung
  ([compiling is not wiring](./../../_laws.md#compiling-is-not-wiring)).

The last two are the interesting ones, because they are not laziness. They are
correct-looking code that answers a narrower question than the gate's name promises.

## Why it is generated, not just written

The antipattern is disproportionately common in machine-generated pipeline code, and
the reason is worth understanding. A generator asked to produce "a step that produces
an artifact and a check that accepts it" will satisfy the request in the shortest way
that type-checks and passes its own test. A literal success value does that. Nothing
in the request said the check had to be able to fail, and nothing in the test suite
noticed, because a test that asserts a gate passes on good input is satisfied by a
gate that always passes.

The countermeasure is a review dimension, not a lint rule: **acceptance integrity** —
is the gate honest — reviewed as a first-class dimension alongside whether the content
is any good and whether it is wired up. A reviewer who is only asked "is the content
good" will not look at the gate at all.

## Remediation

1. **Find the evidence the gate is supposed to be about.** If you cannot name it, the
   gate has no meaning and should be deleted rather than fixed.
2. **Declare the dependency explicitly** — see `gate-check-dependency-map`.
3. **Derive the verdict from resolved upstream verdicts**, never from raw data and
   never from the producer's claim.
4. **Preserve the not-measured status.** Removing a false pass by replacing it with a
   false failure trades one lie for another; a gate blocked only by things nobody has
   run is deferred.
5. **Prove it can fail.** Add a test that constructs a condemned upstream state and
   asserts the gate reports it, naming the blocker. This is the regression test that
   keeps the fix in place — a gate with no failing test is one refactor from
   reverting.

## Decision rules

- **When a check cannot fail on any input, it is not a check.**
- **When a gate's test suite contains no failing-path case, treat the gate as
  unverified** regardless of coverage numbers.
- **When bringing up a new gate before its evidence exists, default to
  not-measured, never to success.** The bring-up default is where most of these are
  born.
- **When reviewing generated pipeline code, read the accept path first.** It is the
  part most likely to be plausible and hollow, and the part least likely to be read.

## When NOT to use this

- **A constant is legitimate where the property is structurally guaranteed** — a check
  whose subject cannot exist in a failing state, because the type system or the
  constructor already excluded it. State the guarantee where the constant is written;
  an unexplained constant is indistinguishable from the antipattern.
- **Do not weaponise the never-failed signal against genuinely healthy checks.** The
  question is whether it *can* fail, established by a test, not whether it happens to
  have failed.
- **Do not turn this into a blanket ban on defaults.** Defaults are fine; optimistic
  defaults in an evidence path are not.
