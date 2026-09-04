---
layer: technique
type: technique
subject: engine-string-representation
technique: inline-vtable-thin-handle
status: forged
laws: [derivation-names-recomputation]
shared_with: []
use_when: [a string handle must fit one machine word inside a tagged value or a stack slot, several string kinds share one handle type and must dispatch without a fat pointer, deciding whether string equality may compare addresses]
---

# Inline vtable, thin handle

The handle the engine passes around is one pointer. Not a pointer and a length, not a
pointer and a dispatch table, not a small-string union with a discriminant - one
pointer, so that a tagged value word, a register slot and a property key can each hold a
string without growing. Everything the handle used to carry beside the pointer moves
into the allocation it points at, and the allocation begins with the one thing that
lets a single handle type stand for several string kinds: a table of the operations
that vary by kind, stored inline as the first field.

## The layout

The allocation has a fixed header and a kind-specific body. The header holds, in
order, the inline dispatch table (a pointer to a static table of the operations for
this kind, or the table itself when it is small enough to inline), the reference count,
the length in code units, and the encoding flag. The body is whatever the kind needs: a
run of one-byte units, a run of two-byte units, a strong handle to an owner plus a
range, or nothing at all when the string is static and its bytes live in the binary.

Placing the dispatch table first is what makes the handle thin. A handle to a
polymorphic object normally carries the table beside the pointer, because the pointee
is opaque; here the pointee is not opaque, its first word is the table, and the
handle reads it through one dereference. The cost is that every string kind must agree
on the header layout, which is a discipline the constructor enforces once rather than a
cost paid per use. Assert the handle's size against a bare pointer at build time, so
that a field added to the handle in a careless refactor fails to compile rather than
doubling every value slot silently.

The sequence kinds are best written once, parameterised by an encoding type that is
uninhabited - a marker with no values - so the encoding is fixed by the type of the
allocation and the kind tag in the header is derived from it, never set by hand. A
reference count that overflows should abort the process, not wrap: a wrapped count
frees a string that is still held, and a checked increment costs one compare on the
clone path.

## What dispatches and what does not

The rule for which operations go through the table is whether the answer depends on the
kind. Releasing the allocation does (a slice releases its owner; a static string releases
nothing). Iterating units does (a slice reads through its owner at an offset). Producing
a sub-range does (a slice of a slice should point at the root owner, not at the slice).
Everything else does not. Length is a header field, read directly, because the string is
immutable and the length was fixed at construction; making it a call would spend an
indirect branch on the most-read property of the type. The encoding flag is a header
field for the same reason. The reference count is a header field because the collector
or the release path touches it far more often than any kind-specific code does.

The decision rule: when an operation's result is fixed at construction and identical for
every kind, store it in the header and read it as a field; when it depends on where the
units live, dispatch. A designer who dispatches length "for uniformity" has made the
common path pay for the rare one.

## Equality is by content, never by address

Two handles that point at the same allocation are equal, and that fast path is worth
taking first. Two handles that point at different allocations may still be equal,
because equal strings are minted at unrelated sites - a literal in one function, a
concatenation in another, a slice in a third - and nothing but a global interner could
promise one address per content. The runtime does not intern its dynamic strings (the
compiler interns identifiers, which is a different table with a different cost model), so
equality must fall through to a length compare, then an encoding-aware unit compare.
Comparing a one-byte string with a two-byte string is a widening compare, unit by unit;
it is not a byte compare, and an implementation that reaches for a byte compare is
correct only while both sides share an encoding.

Address equality as the *only* test is the bug that appears in every engine that
started with an interned-everything design and later added dynamic strings: the old
sites still compare addresses, and two equal strings from different constructors are
reported unequal. State the rule once and enforce it in the type: the equality operator
is content equality, and the address fast path is an implementation detail inside it.

## The hash is a cached derivation

A property key is hashed on every lookup, and rehashing an immutable string each time is
waste. Cache the hash in the header, computed on first request and stored beside the
length. Two rules keep the cache honest. The hash function is defined over the sequence
of code-unit values, not over the bytes of the stored representation, so a one-byte and
a two-byte string with the same text produce the same hash and compare equal in the
same bucket - otherwise the encoding flag leaks into the object model as two keys for
one name. And the cached value names the function that recomputes it, so that a change
to the hash function is a change in one place
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).

Store the cache as an optional slot rather than a zero-means-unset word, or reserve one
hash value as the unset sentinel and remap it; a text whose real hash is zero must not
be rehashed on every access because the cache reads as empty.

## Decision rules

- When the handle must fit a tagged word or a stack slot, make it one pointer and move
  the dispatch table into the allocation's first field, because the second word is
  paid on every value that holds a string.
- When an operation's result is fixed at construction and the same for every kind,
  store it in the header and read it as a field; dispatch only what depends on where
  the units live.
- Equality is content equality with an address fast path inside it, never address
  equality alone, because only an interner can promise one address per content and the
  runtime's dynamic strings are not interned.
- Hash over code-unit values, never over stored bytes, so the two encodings of one text
  share a hash; cache the hash in the header and make the recomputation a named function.

## When not to use it

A runtime whose strings are mutable cannot use this layout: the length and encoding
fields are only safe as direct reads because they never change, and a mutable buffer
would have to guard every read. A runtime with exactly one string kind and no slices
needs no dispatch table at all and should use a plain header of count, length and
flag. And a host-language string type that is already one word wide and immutable can
be wrapped rather than replaced - the technique buys nothing when the host already
paid for it.
