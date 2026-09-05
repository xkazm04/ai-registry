---
layer: golden-path
type: golden-path
subject: engine-string-representation
status: forged
use_when: [designing the string value of an interpreter or embedded language engine, a runtime's memory profile is dominated by short immutable text, choosing between a slice that shares its owner and a rope that defers concatenation, identifiers and property names must compare in constant time across a compiler and its runtime]
techniques:
  - inline-vtable-thin-handle
  - narrowest-encoding-at-construction
  - compile-time-static-string-table
  - zero-copy-slice-string
  - dual-encoding-symbol-interner
---

# Engine string representation

A language engine's string is not the host language's string. The host's string is a
buffer that grows, is owned by one place, and is compared rarely; the engine's string is
an immutable value that is created by the million, shared by everything that touches it,
compared and hashed on every property access, sliced without end, and mostly seven
characters of plain text. A runtime that represents the second thing with the first pays
for it in the one resource an embedded engine is judged on, which is resident memory per
guest object, and in the one operation it performs more than any other, which is
deciding whether two names are the same name.

This subject is the representation of that value: the handle, the allocation behind it,
the encoding of the units inside it, the classes of string that never allocate at all,
the substring that never copies, and the symbol table that lets a compiler stop looking
at characters altogether. It begins where a sequence of code units becomes a value the
guest can hold and ends where that value is inspected, compared, hashed, sliced or
dropped. It does not own the text operations the language defines on top of it
(searching, case mapping, normalisation, formatting), the parser that produced the
identifier, or the object model that keys its property tables by it - only the fact
that those consumers get a handle they can compare as a pointer or an integer and a
length they can read as a field.

## Where this stops, and the neighbour starts

[Import-normalization](../../../integration/acquisition-and-ingest/import-normalization/import-normalization.md)
also owns a representation of text, and the two are easy to confuse because both talk
about an intermediate form that consumers speak instead of the raw input. That subject's
representation is *durable* and *foreign*: a serialised artifact produced by software you
do not control, translated once into your model, persisted, reviewed and committed, with a
loss ledger for what the translation could not carry. This subject's representation is
*ephemeral* and *internal*: the engine's own value type, minted and dropped inside one
process, never persisted, never reviewed, with no loss at all because it is the authority
on its own contents. The rule for a reader holding both is the destination of the bytes.
If they are going into a store that outlives the process and a human will look at them
first, the neighbour; if they are going into a register, a property key or a hash bucket
and will be gone by the next collection, here. A sibling subject in this subcategory,
object-shape-representation, owns the property tables and inline caches that *key on*
the handle this subject mints; the seam is that this subject guarantees the handle
compares cheaply and the sibling decides what to do with the comparison.

## The five facts that shape the design

A principal practitioner starts from a distribution, not from an abstraction. Measured
over any real guest program, engine strings are overwhelmingly short, overwhelmingly
plain one-byte text, overwhelmingly repeated - the same property name minted at ten
thousand sites - and overwhelmingly consumed by equality and hashing rather than by
character access. The fifth fact is that they are immutable: the language defines no
operation that changes a string in place, only operations that produce a new one. Every
decision below follows from one of these, and the naive representation - a
growable, uniquely owned, two-byte buffer with its length carried in the handle - gets
all five wrong at once.

Immutability is the one that pays for the rest. An immutable string's length never
changes after construction, so it can be a field read directly rather than a call
through an indirection; its encoding never changes, so it can be decided once; its
contents never change, so its hash can be cached forever and two handles to equal
content can be freely substituted for each other; and a view into it can never be
invalidated, so a substring can share the owner's bytes instead of copying them. Give
up immutability and every one of these becomes a synchronisation problem.

## A thin handle over an allocation that describes itself

The handle the rest of the engine carries should be one pointer wide. A value type that
holds a string in a union or a tagged word cannot afford two words for it, and a call
frame that pushes strings by the hundred cannot afford the second word either. The way
to get there without giving up polymorphism over string kinds is to put the dispatch
table *inside the allocation* as its first field, so the handle is a pointer to
something that begins by saying what it is. Length, encoding and kind are fields of the
allocation fixed at construction; the operations that vary by kind (release, slice,
iterate) go through the inline table; the operations that do not vary (compare, hash,
length) read fields directly and never dispatch.
[Inline-vtable-thin-handle](./techniques/inline-vtable-thin-handle.md) owns the layout
and the two rules that keep it honest: equality is by content and never by address,
because equal strings are minted at unrelated sites and only the interner is entitled to
promise one address per content, and the hash is computed over the code units in a
form that is the same for both encodings, so a one-byte string and a two-byte string
holding the same text hash identically and can share a bucket.

## The encoding is a construction-time fact

The language's observable unit is a sixteen-bit code unit; the language's actual text
is almost all representable in eight. An engine that stores everything in the wide form
doubles its string memory to preserve the possibility of a wide character that almost
never arrives. An engine that stores everything in the narrow form cannot represent the
language. The resolution is to choose per string, once, at construction: scan the
units, and if every one fits in a byte, store bytes; otherwise store the wide form. The
flag that records the choice lives in the allocation beside the length, the choice is
never revisited, and every consumer that needs the units asks the flag rather than
assuming. [Narrowest-encoding-at-construction](./techniques/narrowest-encoding-at-construction.md)
owns the scan, the flag and the concatenation rule that follows from it - a
concatenation is narrow only if both operands are narrow, and a slice inherits its
owner's encoding rather than rescanning. The interner applies the same rule at intern
time and records the same flag on the symbol, so a symbol can be turned back into a
string handle without re-examining its text.

## Names that never allocate

A fixed, knowable set of strings is minted more often than all others combined: the
property names the specification defines on every built-in, the reserved words, the
handful of strings that literals in a runtime produce. These should exist once, in a
table compiled into the engine, and every construction path should look there before
allocating. The lookup must be cheap enough that it costs nothing on the miss, which is
the common case for user text, and the table must be usable in constant contexts so
that the engine's own code can name a well-known string without a runtime step.
[Compile-time-static-string-table](./techniques/compile-time-static-string-table.md)
owns the table, the constant-time search available at compile time, the hash cache
built lazily for the runtime path, and the pre-check that gates the whole lookup on the
input's length being no longer than the longest entry - so text that could not possibly
be in the table pays one integer compare and moves on. The empty string is the most
important entry in this table and is the value every degenerate operation returns.

## A substring is a view, and a rope is a different bet

Slicing is the operation that separates engine strings from host strings in practice.
Guest programs slice constantly - parsing their own input, splitting on a delimiter,
taking a prefix - and each slice that copies is an allocation and a memory doubling. An
immutable owner makes the copy unnecessary: a slice is a small allocation that holds the
owner strongly plus a start and a length, reads its units through the owner and inherits
the owner's encoding. [Zero-copy-slice-string](./techniques/zero-copy-slice-string.md)
owns the view and its one real cost, which is retention: a one-character slice keeps a
megabyte owner alive for as long as it lives, and a runtime that hands slices to
long-lived structures must either flatten on that boundary or accept the retention
knowingly. That technique also states when a slice is the wrong tool and the rope is
the right one. A rope defers *concatenation* by holding both operands as children and
flattening when a consumer asks for contiguous units; it wins when a program builds a
long string by repeated appending, and it loses on every short string because the node
overhead and the pointer chase outweigh a copy of a few bytes. The engines that use both
switch on length: flat below a threshold, a lazily flattened tree above it, and a slice
of either. A design that has to choose one should choose the slice, because the
short-string case is the common case and a slice never needs flattening.

## The compiler compares integers

Everything above serves the runtime. The compiler has a stronger option, because it sees
every identifier before any of them is used: intern each one into a symbol table and
hand out a small integer, so that from lexing to code generation a name is compared,
hashed and stored as an integer and the characters are consulted only to print an error.
[Dual-encoding-symbol-interner](./techniques/dual-encoding-symbol-interner.md) owns the
table and the three things a naive interner gets wrong. It keeps one interner per
encoding with their indices aligned, so a symbol is one integer regardless of which
encoding its text arrived in, and a sentinel marks the narrow side's slot when the text
exists only in the wide form. It seats the well-known names at fixed symbols below every
dynamic one, produced by a perfect hash at build time, so the reserved words and the
built-in property names are contiguous integer ranges and a "is this a reserved word"
check is a range compare. And it leaves the zero symbol unused so the optional symbol
costs nothing extra to represent.

## What the naive reading gets wrong

The naive engine reaches for the host language's string type and wraps it. It gets a
two-word handle, a heap allocation per value, an encoding it cannot halve, a length it
must ask for through a call, and a substring that copies. Each of these is individually
survivable and together they are why an embedded runtime is measured at three times the
memory of one that did the work.

The second naive reading is that interning solves everything - intern every string and
compare addresses. It does not. Interning costs a hash lookup and a table entry per
distinct string, and guest text is not distinct: a program that builds strings in a loop
would fill the table with values seen once. Intern what the compiler sees, which is
bounded by the source; give the runtime content equality with a cached hash, which is
bounded by nothing and needs to be.

The third is that the encoding flag is an optimisation that can be bolted on later. It
cannot, because every consumer that reads units has to know which width it is reading,
and a consumer written against one width is a latent corruption on the other. Decide
the dual encoding on the first day the string type exists, and make the flag a field
the constructor sets rather than a property something computes.

The fourth is that the static table is a cache. It is not; a cache is filled at runtime
and can miss, and the table is a compiled-in authority for a closed vocabulary that
never misses on its own members ([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).
The names in it are the names the specification fixes, the compiler's fixed symbols are
the same names in the same order, and a runtime that keeps a second list in a different
order has two vocabularies where it needed one.
