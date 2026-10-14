---
layer: technique
type: technique
subject: trust-base
technique: marker-impl-names-its-exclusion
status: forged
laws: []
shared_with: []
use_when: [writing or reviewing a hand-written thread-transfer or shared-access assertion, a type holds interior mutability behind a lock or a publish flag, a manual marker impl survives a refactor of the type's fields, deciding what bounds the impl should demand]
---

# A marker impl names its exclusion

Languages with compile-time data-race checking decide thread safety per type by
inference: a type may cross a thread boundary if all its fields may, and be
shared if all its fields may. A hand-written assertion overrides that inference.
It is needed when a type holds an interior-mutable cell that is safe only because
of a protocol the compiler cannot see: a lock held around every access, a permit
that admits one poller, a flag written once with release ordering and read with
acquire. The assertion is a human claim that the protocol holds, and it replaces a
whole-type check with a single sentence.

Two disciplines make such a claim reviewable. The assertion must be **as small as
the irreducible claim**, and it must **say what makes it true**.

## Shrink the claim first

A manual assertion covers every field of its type, including those the compiler
could check. The assertion therefore silently over-claims whenever a field is
safe by its own type, and it keeps over-claiming as fields change. Before
writing the justification, reduce the claim:

1. **Delete the assertion and read the compiler's complaint.** The error names
   exactly the fields that block inference. Those are the irreducible set.
2. **Give each blocking field the bound the compiler is missing**, where the type
   owner can honestly promise it. A boxed future that must be transferable can be
   declared as transferable; a phantom marker that ignores a type parameter can be
   written as a function returning that parameter, which carries no ownership, so
   the compiler stops requiring the parameter's traits.
3. **Keep only the assertion the remaining field forces**, and only the one of the
   two markers (transfer, sharing) it forces. Often one of the two is then
   inferred.

In one measured codebase with ten manual impls, deleting three compiled with no
other change (a phantom marker over a type parameter, and a pair of impls on a map
wrapper that the field types already satisfied). Deleting the remaining impls on
one type isolated a single field, a boxed future lacking the transfer bound, that
the compiler rejected; adding the bound to that field and restoring only the
sharing impl was green. So the compiler could prove three of ten claims outright,
and the claim that stayed shrank from "this type is safe" to "the access protocol
around one cell is exclusive". That is a much easier sentence to review, and the
measurement is a sample of one codebase, not a rate.

## Name the exclusion at the impl

For the claim that remains, the comment sits **at the impl**, not at the
construction site or in a design document, and states three things.

- **The exclusion.** What guarantees no two threads touch the cell at once: the
  lock and where it is taken, the permit and who may hold it, or the publish flag
  and the ordering on its write and its read.
- **The window it covers**: what the cell is allowed to do before publication and
  that nothing reads it until the flag is observed.
- **The bound that carries it.** Which type parameters the impl demands, and why
  each: the value is created on one thread and read on many, so it needs both
  transfer and sharing; the future is moved to whichever thread polls, so it needs
  transfer but not sharing, since only the permit holder touches it.

An impl whose only comment is somewhere else in the file is an uncommented impl.
The reviewer reading the diff sees the impl line, not the file.

## Over-bounding is its own failure

The reflex when told to justify a claim is to tighten the bounds until the
justification is obviously true. Tightening past what the real instantiations can
meet is a defect. Requiring the future type to be shareable, when the exclusion
guarantees one poller at a time, rejects every future holding a cell or a
single-consumer receiver, and the type becomes unusable for the code it exists
for. The test that separates a necessary bound from an over-bound is whether the
exclusion *already provides* what the bound would add. If a permit guarantees
single access, a sharing bound on the guarded field is redundant and harmful; if
the value is handed out by shared reference to many readers, a sharing bound on it
is required, because nothing in the exclusion constrains readers after
publication.

## Decision rules

- **When the compiler can infer it, delete the assertion.** A manual impl that
  compiles without itself is a claim that may only add risk.
- **When one field blocks inference, give that field its bound and keep the
  smallest assertion.** Do not write the assertion for the whole type to cover one
  field.
- **Every remaining assertion carries its exclusion in a comment at the impl.** No
  comment means the claim is undocumented, and the review should treat it as
  blocking.
- **Prefer a bound that an instantiation can meet over a bound that makes the
  comment shorter.**

## When not to use it

- **When the type has no interior mutability and no raw pointers.** There is nothing
  to assert, and the compiler's inference is the right answer.
- **When the exclusion cannot be stated in a sentence.** A protocol that takes a
  page to explain is a design problem; restructure so the cell is behind a standard
  lock and the assertion disappears.
