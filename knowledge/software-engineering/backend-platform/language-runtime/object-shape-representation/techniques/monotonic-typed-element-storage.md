---
layer: technique
type: technique
subject: object-shape-representation
technique: monotonic-typed-element-storage
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [choosing how an engine stores integer-keyed properties so that a dense array of small integers does not pay a boxed value per element, deciding what happens on the first element that does not fit the current storage kind, deciding whether an array that was widened may ever be narrowed again, an engine's own tests must assert which storage kind an array is in]
---

# Monotonic typed element storage

The specification describes an array as an object whose keys happen to be
integers, and a program's array is a dense vector of one scalar kind that is
indexed, pushed to and iterated. An engine that represents the first cannot
run the second at the speed the program expects, and an engine that
represents only the second cannot run the specification. This technique owns
the representation that serves both: a **ladder of storage kinds**, entered at
the narrowest rung, climbed on the first element that does not fit, and never
descended.

## The ladder, and why each rung is where it is

From narrowest to widest:

1. **Dense small integers.** A vector of 32-bit integers. The common array of
   real programs - indices, counts, identifiers, pixel values - fits here, and
   an element read is a typed vector index with no unboxing.
2. **Dense floats.** A vector of 64-bit floats. The first non-integer number
   widens to it; integers are exactly representable, so the copy is lossless.
3. **Dense boxed values.** A vector of the engine's tagged value. The first
   element that is not a number - a string, an object, a boolean - widens to
   it; every number is representable as a boxed number, so the copy is
   lossless.
4. **Sparse values.** A map from index to boxed value. The first write that
   would leave a hole - an assignment far past the current length, a delete
   in the middle - widens to it; every dense element becomes a map entry, so
   the copy is lossless.
5. **Sparse descriptors.** A map from index to a full property descriptor.
   The first element defined with non-default attributes - an accessor at an
   index, a non-writable element, a non-enumerable one - widens to it; every
   value entry becomes a plain writable descriptor, so the copy is lossless.

The ordering is the ordering of representability: each rung can hold
everything the rung below it can, which is what makes every widening a copy
that loses nothing and needs no check. The rungs are not a lattice with
independent axes - "holey integers" is not a rung - because every axis
multiplied into the rung count multiplies the cases every element operation
must handle, and a hole in a vector of integers has no integer to be.

New objects start at the narrowest rung, empty. The decision is cheap because
an empty vector of integers costs nothing until the first element, and a
program that never indexes an object pays nothing for its element storage at
all.

## Widen on the first element that does not fit; never narrow

The trigger is the write. On every element store the engine asks whether the
value fits the current rung; if it does, store it; if it does not, widen to
the first rung that fits it, copying every existing element, then store. The
check is per rung and closed-form: a small integer fits rung one; a number
fits rung two; anything fits rung three; a write inside the current length
fits any dense rung and a write past it does not; a plain writable value fits
rung four and a descriptor does not.

The widening is **one-way**. An array that widened to floats and then had
every float overwritten with an integer stays at floats; an array that
widened to sparse and was then filled in stays sparse. Narrowing would require
proving, on every store, that every element now fits a narrower rung, and the
proof is a scan of the whole array on the hot path to save a width the program
may widen back on the next store. The asymmetry is the point: widening costs
one copy per rung, at most four in an array's life, and narrowing would cost
a scan per store forever. An engine that offers a narrowing pass as a
collection-time optimisation is making a different trade, and it must then
solve the problem that every cache keyed on the storage kind is invalidated by
a pass the program did not trigger.

## The integer-float boundary is decided by round-trip, not by type

The one subtlety in the ladder is the first rung's boundary. A dynamic
language typically has one number type, and a program that writes `2.0` into
an array of integers has written a float by syntax and an integer by value.
The rule is that a number is stored as an integer when it **round-trips
exactly** through the integer type - converting to the integer and back yields
the same float, including the sign of zero and excluding the non-finite
values - and the array stays at rung one. A program that fills an array with
whole-number results of float arithmetic, which is most numeric code, does
not widen a vector it will read back as integers, and a program that writes
a genuine fraction widens on that write and not before.

The check is a comparison, not a parse, and it runs on every store into rung
one; it is the one place the ladder spends per-store work to avoid a widening,
and it is worth it because rung one is the rung most arrays live and die in.

## Elements are not the shape

Element storage is a field on the object beside the shape, with its own kind
tag, and a widening changes that tag and nothing else. The shape describes
named properties and their slots; it says nothing about indexed elements and
is not consulted for them. The design that fuses the two - an element-kind
transition in the shape tree, so that an array of integers and an array of
floats have different shapes - makes every widening a shape transition, and
therefore an invalidation of every inline cache on every named property of
the object, for a change that touched no named property. Keep the two
representations orthogonal; an access instruction that reads a named
property checks the shape, and one that reads an index checks the kind tag,
and neither checks the other.

## The rung is observable, and the tests read it

Which rung an array is in is invisible to the program, by design, and it is
exactly what the engine's own tests must assert: that a literal of integers
starts dense-integer, that a fractional store widens to floats and an integer
store afterwards does not narrow, that a delete widens to sparse, that an
accessor at an index widens to descriptors. A test that could only observe
these facts through a host-side debugger is written in the host language
against the engine's internals and dies at the first refactor of those
internals. The rule is that the storage kind is exposed to the guest as a
**pure query** behind an engine-development flag - a function that returns
the rung's name and changes nothing - so that the tests are written in the
language the engine implements and read as specifications of behaviour. The
counter that is the rung's length carries its predicate with it: a length on
a dense rung counts elements that exist, a length on a sparse rung is the
highest index plus one and counts nothing
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)),
and the query must report which it is returning.

## Decision rules

- Start every object's element storage at the narrowest rung, empty, because
  an empty typed vector costs nothing and most objects are never indexed.
- On every element store, widen to the first rung the value fits, copying
  every element, and never narrow, because widening is bounded by the rung
  count and narrowing is a scan per store.
- Store a number at the integer rung when it round-trips exactly through the
  integer type, and widen to floats only on a value that does not, because
  whole-number floats are the common case in numeric code.
- Widen to the sparse rung on the first write that would leave a hole and to
  the descriptor rung on the first non-default attribute; do not add a
  "holey" axis to the dense rungs.
- Keep the element kind in its own tag beside the shape and never in the
  shape tree, because a widening must not invalidate named-property caches.
- Expose the current rung to the guest as a pure query behind a flag, and
  write the engine's own storage tests in the guest language against it.

## When not to use it

A language whose arrays are statically typed - a vector of integers is
declared as one and cannot hold a float - has one rung per declared type and
no ladder. A language whose specification has no descriptor semantics on
indices and no holes has three rungs at most and the ladder collapses to a
typed vector that boxes on demand. The five-rung form pays when the
specification makes every index a full property and programs treat arrays as
vectors, which is the situation of every dynamic language with a
prototype-based object model.
