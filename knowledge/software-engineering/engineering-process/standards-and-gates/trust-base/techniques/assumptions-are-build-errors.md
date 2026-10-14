---
layer: technique
type: technique
subject: trust-base
technique: assumptions-are-build-errors
status: forged
laws: [gate-sees-target]
shared_with: []
use_when: [a proof or a type-level argument depends on a platform fact such as word size or endianness, the verified side and the unverified side both mention the same environmental fact, a package is built on targets the proof was never run on]
---

# Assumptions are build errors

A proof is valid against an environment. It assumes a word is 64 bits wide, that
a byte is eight bits, that integer conversion between two widths loses nothing,
that a particular time source is monotonic. The assumption is usually made in one
place, in the prover's own dialect, and it is true on the machine where the proof
ran. The package is then built on other machines. The proof is not re-run there,
the assumption may be false, and nothing says so.

This is a separate concern from placing a data invariant between values, which
asks where a rule about *data* is enforced. This technique is about the
**environment the verdicts are valid in**, and its rule is that an assumption a
proof makes must also be a fact the build refuses to build without.

## Two statements of one fact

An environmental assumption exists twice and the two statements must not diverge.

- **On the verified side**, the proof states the fact: a declaration fixing the
  width, an assumption clause, a precondition that every harness carries. This
  is what lets the checker prove conversions lossless instead of assuming them
  case by case.
- **On the unverified side**, the build asserts the same fact before anything
  compiles: a compile-time assertion that fails the build with a message naming the
  proof as the reason. This turns "the proof is valid here" from a belief into a
  condition of producing the artifact.

Either alone is insufficient. Without the build assertion, the proof's premise is
untested on every other target. Without the verified-side statement, the
assertion is a good intention the checker does not rely on, and the proof carries
a hidden per-site assumption in the worst case.

## Make the two the same predicate

The failure the pair is meant to prevent is divergence, so check for it
literally. Read the two predicates side by side. If the verified side says the
width equals a specific number and the build asserts only that it is *at least*
another width, the sets of platforms they admit differ. The build accepts a
target the proof never considered, and the proof's premise is then a fact about a
narrower set than the build enforces. Close the gap in one of two ways: assert
the exact predicate the proof states, or weaken the proof's statement to the
predicate the build enforces and re-check that the proof still goes through. Do
not leave a comment arguing that the difference is harmless; the next target
makes the argument false.

## What the build side must satisfy

- **It runs on every build the artifact can come from**, not only the verification
  lane. A check that exists only in the lane that already knows the platform is a
  gate that observes a proxy instead of the target
  ([gate-sees-target](../../../../_laws.md#gate-sees-target)).
- **Its failure message names the proof.** "Proofs here require a 64-bit word" tells
  the engineer on a new target what to do, which is to port the proofs, not to
  silence the check.
- **It fires at compile time**, so an unsupported target never produces a binary
  that was never validated, rather than failing in a test run nobody does on that
  target.
- **It is listed with the other assumptions.** Keep one short inventory of the
  environmental facts the proofs rest on, so that adding a target means reading
  one list.

## Decision rules

- **If a proof states a platform fact, the build asserts it, in the same words.**
- **If the fact cannot be expressed as a compile-time check** (a clock property, a
  filesystem guarantee), it is a runtime precondition: assert it at startup,
  fail loudly, and record it in the same inventory.
- **If the fact is a hand-written restatement of derived behaviour** (an ordering the
  prover re-specifies by hand because it cannot read the language's derived one),
  the second statement is a test that compares the two, kept in lockstep with the
  declaration it guards. It is the weakest form, because a person must update it,
  and it is still strictly better than prose.
- **If a build target is added, treat each listed assumption as a question, not
  a default.** The assertion will answer it for width-like facts; the others need a
  person.
- **Do not write an assumption only into a comment.** Prose that is not enforced
  is a trust-base member with no witness.

## When not to use it

- **When the fact is a property of the language rather than the platform.** A
  guarantee the language specifies for every target needs no build assertion.
- **When the proof does not rest on the fact.** Do not assert environment features
  the proof never used; an assertion that fails for irrelevant reasons teaches
  people to remove assertions.
