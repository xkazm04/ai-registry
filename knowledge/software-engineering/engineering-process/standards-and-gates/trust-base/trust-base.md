---
layer: golden-path
type: golden-path
subject: trust-base
status: forged
use_when: [a prover or type checker is in the toolchain and some code is marked as trusted, a hand-written assertion overrides what the compiler would infer, a proof depends on a platform or environment fact, adding verification tooling to a package other teams consume, reviewing what a green proof actually covers]
techniques:
  - trusted-leaf-gets-an-outside-test
  - leaf-spec-states-what-callers-read
  - marker-impl-names-its-exclusion
  - soundness-argument-names-its-dependencies
  - assumptions-are-build-errors
  - verifier-footprint-stays-contained
---

# Trust base

A checked language gives a guarantee for everything inside the checker's view.
A theorem prover proves the bodies it can read, and a borrow checker or type
checker accepts the programs whose safety it can derive. Both stop at the same
edge, and past it they take a person's word. That word has a few standard
spellings: a function body the prover is told to skip while its stated contract
is believed; a hand-written assertion that a type may cross a thread boundary;
a raw pointer dereference under an `unsafe` marker; an `assume`; a fact about the
word size of the machine. Each is a place where somebody overrode or extended
the checker, and the set of all such places is the **trust base**. Everything
the checker reports green is green *modulo* that set, and the report does not
say so.

This subject owns the set: what is admitted to it, how its size is held down,
how each member records the contract it asserts, and what independent evidence
stands behind it from outside the checker. It is not a subject about proof or
about unsafe code as such. It is about the one fact both share, that a
guarantee has a perimeter and the perimeter is made of human claims.

## Why this is its own concern

The tempting reading of a verified or memory-safe codebase is binary: either a
property is proved or it is not. The accurate reading is a ledger. A proof that
`execution reaches every directly hit line` holds exactly as far as the leaf
that *defines* "directly hit" does what its contract says, and the checker will
not tell you when that leaf changes, because the checker was told not to look.
The failure mode is specific and worth stating plainly: **every proof stays
green while the thing they are proofs about changes meaning.** A trusted body
edited to filter on the wrong value, a marker assertion still written after the
field that made it true was replaced, a platform assumption carried to a target
where it is false. The checker reports success in all three, and
[failure spelled as empty success](../../../_laws.md#failure-not-empty-success)
is the law this inherits: the instrument must be shown able to fail on the
thing it claims to guard.

Three properties make a trust base manageable, and the techniques below are
organised around them. It must be **small**, because every member is a place a
reviewer must trust by reading rather than by checking. Each member must be
**legible**, stating exactly the contract it asserts and exactly what that
contract leaves out, because a claim whose terms are unwritten cannot be
reviewed. And each member must have **evidence from outside the checker**,
because the checker is the thing being overridden and cannot also be the
witness.

## What a trust base is not

Four neighbours own nearby ground, and the dividing rule for each is the same:
this subject begins where a person asserts something the checker did not derive,
and ends at the decision about what to assert, enforce or measure.

- **Choosing what to prove and what it costs.** Which functions earn a symbolic
  proof, why the size of an input space is the wrong cost variable, and how to
  record a timeout are
  [proof cost follows the circuit](../../build-and-release/test-input-generation/techniques/proof-cost-follows-the-circuit.md).
  That subject decides what lands *inside* the checker's view. This one starts
  when something is deliberately left outside it. A function that is expensive to
  prove is a proof-cost question; the decision to trust its body and prove its
  callers against a written contract is a trust-base question.
- **Where a runtime invariant is enforced.** Raising a rule to the data's shape,
  to a construction door, to a gate or to the call site is
  [invariant placement](../invariant-placement/invariant-placement.md). Its
  concern is data invariants *between values*; ours is the *environment and
  the overrides* the checker's verdicts are valid in. A rule that two fields must
  agree is placement. A rule that a pointer width is 64 bits is ours.
- **Gate design and waivers.** How a check is made unable to pass vacuously, how
  its severity is set and how a waiver names its finding are
  [quality gates](../quality-gates/quality-gates.md). A trusted body is not a
  waiver: a waiver suppresses a finding the checker produced, a trusted body
  prevents the checker from producing any.
- **Dependency policy in general.** How packages are declared, pinned,
  audited and patched is [supply chain](../../../security/code-provenance/supply-chain/supply-chain.md)
  and [dependency declaration](../../codebase-stewardship/dependency-declaration/dependency-declaration.md).
  The one slice this subject keeps is the verifier's own footprint in what the
  package publishes. Test-suite structure is
  [test harness](../../build-and-release/test-harness/test-harness.md); this
  subject asks only what the outside test of a trusted member must assert.

## The three jobs, ranked by what they remove

A trust base can be treated in three ways, and they are not equal. The ranking
is by how much of the base each one deletes.

**Remove.** The best member is one that no longer needs trust. A hand-written
thread-safety assertion whose fields the compiler can in fact check should be
reduced until it covers only the fields it cannot, and a platform assumption
should become a fact the build refuses to proceed without. Removing is
[marker-impl-names-its-exclusion](./techniques/marker-impl-names-its-exclusion.md)
(shrink the claim to the irreducible field before justifying it),
[assumptions-are-build-errors](./techniques/assumptions-are-build-errors.md), and
[verifier-footprint-stays-contained](./techniques/verifier-footprint-stays-contained.md),
which holds the perimeter of the tooling itself down. Three of the six
techniques are removals, and they come first in any audit because a deleted
member costs nothing to keep correct.

**Test.** What cannot be removed can sometimes be checked from outside. A
trusted body has an executable form, and an executable form can be run against
an independent oracle with randomised input.
[trusted-leaf-gets-an-outside-test](./techniques/trusted-leaf-gets-an-outside-test.md)
turns the unchecked axiom into a checked property. Testing removes no member
from the base, but it converts "trusted" into "trusted and observed", which is
the only state where drift is caught.

**Document.** What can be neither removed nor tested still has a contract that
a reviewer can read. [leaf-spec-states-what-callers-read](./techniques/leaf-spec-states-what-callers-read.md)
and [soundness-argument-names-its-dependencies](./techniques/soundness-argument-names-its-dependencies.md)
are the writing disciplines: say what the callers consume, say what is
omitted, say which other declaration the argument stands on, and say it at both
ends. Documentation is last in rank because it only converts an invisible
dependence into a visible one; a documented member is still a member. It is also
the cheapest, and the one a team underinvests in because nothing fails when it
is skipped.

## Admission and the audit

Treat admission to the base as a decision with a price and make it explicit. A
member is admitted when the checker cannot see through the construct, the
alternative of rewriting to something it can see costs more than the claim is
worth, and the member is small enough to read in full. Each admitted member
carries, at the site, the same four things: the contract it asserts, what that
contract omits, what other declaration its truth depends on, and where the
outside evidence lives. When the fourth is missing, the member is trusted and
unobserved.

An audit reads the base the way a reviewer would. Count the members and note
what fraction carries a written justification at all, and where the
undocumented ones cluster; they tend to sit in the modules nobody wanted to
explain. The count says where to start, and says nothing about whether the notes
that exist are accurate; a note stating a fact that stopped being true is worse
than none, which is why the techniques below attach each claim to the
declaration that makes it true rather than to prose alone. State the counting
predicate with the number: "escape sites with a note within five lines" is a
different count from "sites whose note names its dependency"
([count-carries-predicate](../../../_laws.md#count-carries-predicate)).

Two cautions on the audit. First, a lint for undocumented unsafe blocks covers
the block form only; the marker assertions and the dependent declarations they
rest on are outside it, so a clean lint run is a statement about one spelling of
the base. Second, the base grows by accretion. Each member was reasonable
when added; the perimeter is the sum, and no one decision made it large. Set a
review trigger on the count rather than on any single addition.

## What the golden path does not claim

It does not say a trust base is bad. A kernel of reviewed, tested, documented
trust is the ordinary condition of every verified system, and a project with a
base of three small members is in a stronger position than one that proved
everything by assuming a model of its environment. It does not rank the
checker's guarantee below an audit; the checker is more reliable than a reader
at what it can see. And it does not offer a notation. The mechanisms differ by
language and the discipline does not: keep the set small, make each member say
what it asserts, and give it a witness the checker is not.

## The techniques

- [trusted-leaf-gets-an-outside-test](./techniques/trusted-leaf-gets-an-outside-test.md)
  — a property test against an independent oracle asserting both directions of
  the contract the checker consumes, tied to the requirement the leaf grounds,
  and the floor for what makes an oracle independent when the body is one line.
- [leaf-spec-states-what-callers-read](./techniques/leaf-spec-states-what-callers-read.md)
  — a contract is what callers consume; omissions are written beside it, and the
  rule when a caller needs more is to strengthen the contract and its test.
- [marker-impl-names-its-exclusion](./techniques/marker-impl-names-its-exclusion.md)
  — a hand-written thread-safety assertion shrinks to the irreducible field,
  bounds everything the compiler can check, names the exclusion that makes the
  rest true, and avoids bounds the real types cannot meet.
- [soundness-argument-names-its-dependencies](./techniques/soundness-argument-names-its-dependencies.md)
  — an escape hatch that is sound only because of a declaration elsewhere says
  so at its site, and the other declaration says it is load-bearing.
- [assumptions-are-build-errors](./techniques/assumptions-are-build-errors.md)
  — a platform fact a proof assumes is also asserted by the build, with the same
  predicate on both sides, so the two cannot diverge unnoticed.
- [verifier-footprint-stays-contained](./techniques/verifier-footprint-stays-contained.md)
  — proof tooling reaches the published graph only as the smallest mandatory
  piece, the verified subset lives in one plain-data module behind a thin
  adapter, and the verifier's version is one value.
