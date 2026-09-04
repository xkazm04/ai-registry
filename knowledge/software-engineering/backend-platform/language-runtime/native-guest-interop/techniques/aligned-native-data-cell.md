---
layer: technique
type: technique
subject: native-guest-interop
technique: aligned-native-data-cell
status: forged
laws: [limits-are-derived, gate-sees-target]
shared_with: []
use_when: [a host type is about to be stored as the payload of a collected guest object, the collector reads a cell header through a type-erased pointer at a fixed offset, choosing between a thin cell pointer and a fat pointer to a trait object for host payloads]
---

# Aligned native data cell

## The concern

A collected heap reads every cell through one erased pointer type, and it
reads the cell's header — mark bit, root count, the routine that traces the
payload, the routine that drops it — at a fixed offset from that pointer. The
offset is a constant the collector was compiled with. It stays correct only
while every payload begins at the same alignment as the header, because a
payload whose natural alignment is wider forces the compiler to pad between
header and payload, and the erased pointer's idea of where the payload starts
is now wrong by the width of that padding. The bug is invisible on the machine
that wrote it and appears as corrupted collector metadata on the architecture
where a host type's alignment happens to be wider.

## The procedure

The host payload never enters the cell directly. It is wrapped in a cell type
with three declared properties.

Its field layout is fixed: the compiler is forbidden to reorder or repack the
fields, so the header sits first and the payload follows at a position the
collector can compute. A layout the compiler is free to optimise is a layout
that differs between compiler versions and between the debug and release
builds of the same version.

Its alignment is *forced*, not inherited. The cell declares the header's
alignment as its own — eight bytes is the value that fits every pointer, every
sixty-four-bit integer and every double on every mainstream architecture — so
that a payload with a smaller alignment is padded up to it and the payload
offset stays constant across every host type the cell will ever hold.

Its construction carries a compile-time assertion that the payload type's
alignment does not exceed the forced alignment. This is the rule's teeth. A
runtime check would fire only when a wide-aligned type was actually stored,
which is to say in production on the one platform where it mattered; the
compile-time assertion fires at the moment somebody writes the type, in the
build that introduced it.

The assertion has to be *reached* to fire. A generic assertion on a type
parameter is evaluated only when something instantiates it, so the cell's
payload field is private and the cell is marked non-exhaustive, leaving the
constructor as the only way to build one — and the constructor is where the
assertion is forced. A cell that could be built by struct literal would let a
payload in without ever evaluating the check.

A host type whose alignment exceeds the bound is not rejected by the design.
It is boxed by rule: the cell holds a pointer to the payload rather than the
payload, the pointer's alignment is known, and the wide-aligned allocation
lives outside the collector's cells where its alignment is the allocator's
problem. The rule is stated in the assertion's own message, so that the author
who hits it is told the escape rather than left to weaken the bound — and the
escape is itself asserted, once, at the library level: the boxed pointer's
alignment is checked against the same bound, so the advice is proven sound on
every target the library builds for.

The erased form of the cell — the shape every handle has before a downcast —
is not a trait object. It is the same cell instantiated with a zero-field
placeholder payload, laid out so that it is a valid prefix of every concrete
instantiation. The handle stays thin, the offset of every field the collector
and the object model read is identical across all instantiations, and the
downcast is a pointer reinterpretation guarded by a type-identity check
rather than a vtable dispatch.

## Decision rules

When the header's alignment is chosen, derive it from the widest field the
header itself holds and write that derivation beside the constant, because a
bound picked by feel is raised by feel and the cell layout it guarded is not
re-checked when it is raised
([limits-are-derived](../../../../_laws.md#limits-are-derived)).

When a payload type's alignment is checked, check the type the cell will
actually hold, at compile time, in the constructor the host author calls —
not a wrapper type, not a representative example, not a test that stores one
sample payload — because a check on a proxy passes exactly when the proxy and
the payload diverge ([gate-sees-target](../../../../_laws.md#gate-sees-target)).

When the assertion fails for a legitimate host type, box the payload; never
raise the forced alignment for one type, because every cell in the heap pays
the padding for the widest alignment any cell ever needed.

When choosing how the cell refers to its payload's behaviour — how the
collector finds the tracing and dropping routines and the payload's type
identity — put a pointer to that table in the header the collector already
reads and keep the cell pointer thin. A fat pointer to a trait object carries
the vtable beside the data pointer: the handle doubles in size, every guest
value that holds one grows with it, and the collector has two places to
consult for what a payload is. The header is the one authority on that
question, and the type-identity check that guards every downcast reads it
from there.

## When not to use it

A host type that is only ever *referred to* from guest code — an identifier
that resolves through a host-side table, a handle that is an integer the host
interprets — needs no cell at all, and wrapping it is padding without benefit.
Store the integer as a guest number and keep the host table on the host side.

A runtime whose collector does not erase cell pointers — one that generates
per-type tracing code and reads no shared header — has no fixed offset to
protect, and forcing alignment there is superstition. The technique exists
because of the erased pointer; without it the payload's natural alignment is
correct.
