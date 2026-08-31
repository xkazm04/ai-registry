---
layer: technique
type: technique
subject: test-input-generation
technique: negative-space-generation
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [testing a parser validator or decoder, a suite built from the specification's happy path, deciding how to generate inputs the system must reject]
---

# Negative-space generation

Every system that accepts input partitions the representable space in two: the
inputs it must accept and the inputs it must reject. Both halves are behaviour,
both have code, and a generator has to be designed for each — because the two
halves have *opposite* generation problems and a single strategy cannot serve
them.

## The two failures, which are mirror images

**Testing only the positive space** is the common one and the comfortable one.
A suite written from the specification exercises what the specification
describes: well-formed inputs producing correct outputs. The rejection path —
usually the larger body of code, and always the one an adversary reaches first
— goes unexercised, and its defects are the expensive kind: a malformed input
accepted, a validator that reads past a length it never checked, an error path
that leaves state half-written.

**Sampling uniformly to reach the positive space** is the mirror failure, and
it is the one that looks like diligence. Where validity is structured — a
checksum, a length prefix, a tagged encoding, a schema, a signature — the valid
inputs are a vanishing fraction of the representable ones, and "vanishing" is
literal. One measured instance, cited with its predicate as any travelling
number must be
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
**uniformly random 64-bit values, tested against a structured route encoding,
produced zero valid inputs across 10⁸ attempts**, in roughly seven seconds of
generation. That generator exercised the validator's first reject branch a
hundred million times and the decode path not once — while reporting, in every
run, that it had tested the decoder.

The lesson generalises past encodings: **a generator that samples uniformly
over a structured space is a rejection-path test wearing an acceptance-path
name**, and it passes silently in the shape of
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success).

## Both halves are constructed

The correct posture is that neither half is sampled naively. Each is built.

**The positive half is built by construction.** Generate the input through the
same structural rules the system requires — assemble the record, then compute
the checksum; choose the variant, then emit its required fields; build the
sequence, then prefix its true length. This guarantees reachability and costs
almost nothing. Its price is the one this subject keeps returning to: a
constructor imposes constraints, and those constraints are now the boundary of
what the suite can reach, so the list required by
[generator-bounds-the-space](./generator-bounds-the-space.md) is not optional
here.

**The negative half is built by mutation, biased to the boundary.** An input
that is wrong in every respect is nearly worthless: it fails the first check
and exercises one branch. The valuable invalid input is the one that is *almost
valid* — correct in every respect but one:

- take a constructed valid input and corrupt exactly one field;
- flip one bit of a checksum, leaving the payload intact;
- set a length prefix one greater and one less than the true length;
- use a tag value adjacent to a legal one, and one just past the end of the
  legal range;
- truncate at each structural boundary in turn;
- keep every field legal but violate a relationship *between* two of them —
  the class most often missed, because per-field validation catches everything
  else.

The rule to carry: **generate invalid inputs by perturbing valid ones, not by
sampling the invalid space.** The invalid space is enormous and almost entirely
uninteresting; the thin shell around the boundary holds nearly all the defects.

## Deciding the verdict for a negative case

A rejection test needs a stronger oracle than "an error was returned," because
that assertion passes for a system that rejects everything, including a system
that has been rejecting everything since a refactor last month.

- **Assert the specific rejection**, not merely a failure — which check fired,
  which field was named. This distinguishes correct rejection from accidental
  rejection.
- **Assert the state after rejection.** The frequent real defect is not a
  wrong verdict but a partial write, a leaked handle, or a consumed input
  stream left mid-record.
- **Keep a positive control in the same suite.** A negative-space generator
  whose constructor silently broke now reports a perfect record of correct
  rejections and has tested nothing. Some inputs must be accepted for the
  suite's own result to mean anything.

## Round-tripping is not enough on its own

A round-trip property — encode then decode returns the original — is cheap,
strong, and it only ever visits the positive space, since its inputs are
constructed by the encoder. It cannot say anything about what the decoder does
with bytes the encoder would never emit, which is exactly the input an
adversary supplies. Round-tripping and negative-space generation are
complements; the presence of a thorough round-trip suite is a common reason
teams believe the decoder is well covered when its entire rejection surface is
untested.

## When not to use it

- **Where the system has no rejection contract** — an internal function whose
  preconditions are guaranteed by its only caller — invalid inputs test a
  behaviour that is undefined by design, and the resulting failures are noise.
  Assert the precondition instead.
- **Where a type or schema makes the invalid state unrepresentable**, the
  negative space has already been removed at a stronger layer, and generating
  against it is testing the language rather than the system.
