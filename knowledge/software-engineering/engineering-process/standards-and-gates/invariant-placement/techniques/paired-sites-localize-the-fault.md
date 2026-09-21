---
layer: technique
type: technique
subject: invariant-placement
technique: paired-sites-localize-the-fault
status: forged
laws: [gate-sees-target, failure-not-empty-success, absent-guard-is-loud, derivation-names-recomputation]
shared_with: []
applied: code
ab_verdict: better
use_when: [an invariant spans a write and a later read of the same value, a corruption is detected but nobody can say which side produced it, adopting an assertion-density standard, writing a precondition from a doc comment, a check that the shipping build profile removes, deciding what a compiled-out check still costs]
---

# Paired sites localize the fault

One invariant, asserted at one site, tells you it is broken. The same invariant
asserted at **two** sites — where the value is produced and again where it is
consumed — tells you *which side* broke it, and that is a different and usually
more valuable thing. The pair rarely detects more than the single site does. It
narrows the suspect list, and it does so at the moment the evidence still
exists.

The shape is worth separating from density, because the two are routinely sold
together and only one of them survives measurement. A rule of the form *n checks
per routine* is a count whose predicate is "checks", and it says nothing about
whether they check anything
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)); it is
satisfiable directly, by writing checks, which is
[a proxy counting its own satisfiers](../../metric-gates/techniques/proxy-metric-counts-its-own-satisfiers.md).
Pairing is not a count. It is a placement claim about one named relationship, and
it is checkable: either the second site re-derives what the first site wrote, or
it does not.

## The two halves do not have the same standing

This is the part that decides whether the pair helps or hurts, and it is not in
the advice as usually given.

**The read side is derived from the code and cannot be over-broad.** Reconstruct
the written form from the parsed parts and compare it to the bytes received. That
check has no opinion of its own; it fails exactly when the decode is not the
inverse of the encode. It is
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
applied to a check rather than to a stored value — the assertion *is* the named
recomputation path.

**The write side is a hand-written precondition, and it is usually copied out of
the prose beside it.** That is where it goes wrong. A doc comment describes the
guarantee the author intended; the consumer implements a narrower requirement.
Asserting the comment refuses inputs the code handles correctly, and a refusal of
a legal input is not a caught defect — it is a new one, in the more expensive
direction, because it fires in whatever build runs checks and it fires on
traffic that was fine.

Measured, on a real write/read pair: the comment said both components of a
composite key were separator-free "by construction, so decoding is exact." The
consumer splits **once**, at the first separator, so only the *leading*
component has to be separator-free; a composite trailing component round-trips
exactly. The precondition written from the comment refused it. The precondition
written from the consumer accepted it and still caught the real defect — a
separator in the leading component, which silently truncates it and moves the
remainder into the next field, so a paged read resumes at the wrong position and
nothing reports an error.

The rule that falls out: **write the read-side check first, from the consumer,
and derive the write-side precondition from what the read-side check actually
needs.** A precondition that cannot be traced to a line in the consumer is a
paraphrase of a comment and should be deleted or narrowed until it can.

### Assert both directions, or the pair is satisfied by refusing everything

The pair needs two claims that pull against each other, for the same reason a
tiering rule does
([path-class-confounded-with-size](../../../../engineering-assessment/reporting-and-remediation/delivery-analytics/techniques/path-class-confounded-with-size.md)):

- the illegal construction is **refused, and the refusal names the component**;
- the legal-but-surprising construction is **accepted**.

Stated singly, the first is satisfied by a precondition that refuses everything
interesting and the second by having no precondition at all. Both belong in the
suite, and the first one belongs there as an explicit negative artifact —
deleting a precondition makes strictly more programs valid, so without it every
existing test still passes
([constraint-deletion-is-silent](./constraint-deletion-is-silent.md)).

## The pair introduces a third thing, and the shipping profile is the only build that refuses it

A read-side check almost always needs a value captured *before* the operation it
is about: the count before the insert, the length before the split, the
generation before the bump. That binding exists for the check and for nothing
else, which makes it look like something to remove from the build that does not
run checks. Removing it is where the technique's real price sits, and it is a
price of the call-site altitude that nothing else in this subject charges.

**A checking construct the shipping build strips still requires its operands to
compile.** Stripping is about *execution*, not about compilation. So a
build-gated snapshot leaves the check reading a name that no longer exists, and
the module stops compiling — in the optimized profile only. The profile that
runs the checks is the one profile where the binding is present, so **the lane
that runs the suite is structurally unable to see this class**, and the failure
surfaces wherever the optimized profile is first built: a benchmark run, a
container image, a release tag.

Two obligations, and they are different obligations:

- **Never gate the snapshot.** It is dead code in the shipping build and the
  optimizer drops it, so it costs nothing to leave declared. The neighbouring
  rule — gate the check, never the assignment beside it — is about behavioural
  parity between the tested and shipped programs; this one is about the shipped
  program existing at all, and it applies to a binding that has no behaviour to
  preserve.
- **Compile the shipping profile on the blocking rung.** Not at release time, and
  not on a scheduled lane. A check that only the optimized build can refuse, with
  no optimized build before merge, is an
  [absent guard](../../../../_laws.md#absent-guard-is-loud): the default is that
  nobody compiled it, and the fleet converges on the default.

This is also the sharper reading of *keep the checks on in production*, which is
two questions wearing one sentence. Whether a check **runs** in the shipped build
is a severity decision, and it is settled elsewhere — by who supplies the value
that trips it. Whether a check is **present**, in the sense of compiling, is not a
decision at all: it is a property of the build matrix, and a repository can pass
every check it owns in the one profile it never ships.

## What a paired site is not

- **Not a substitute for the outside test.** The single external round-trip test
  detected the same real defect. What it could not do was say which side was
  guilty: it reported a mismatched pair at the consumer, and a reader has to work
  backwards from two values to a producer. The pair's message named the component
  and the site. Detection was equal; attribution was not.
- **Not available across a process or language boundary.** Two sites in two
  deployables are not a pair of checks, they are a contract, and it should be
  published and tested as one.
- **Not for a value that arrives from outside.** Where the trip-wire can be
  chosen by whoever supplies the input, the read-side check is input validation
  and must be handled as a value rather than asserted; the severity ladder
  inverts there, and that inversion belongs to
  [inside-out invariants](../../../build-and-release/test-input-generation/techniques/inside-out-invariants.md).
- **Not two sites in one routine.** If the write and the read are adjacent, one
  check sees both and the second adds a line without adding an observation point.

## Decision rules

- One named relationship per pair, written down as a sentence before either check
  is coded. An unwritten relationship cannot be paired.
- Read side first, derived from the consumer; write side second, derived from what
  the read side needs.
- The refusal message names the component, not the condition. A message that
  names the condition is a puzzle; one that names the component is a repair
  instruction.
- Every write-side precondition ships with two tests: the illegal construction
  refused by name, and the legal-but-surprising construction accepted.
- Leave the pre-operation snapshot unconditional, always.
- Put an optimized-profile compile on the same rung as the ordinary one, and treat
  its absence as the finding.
