---
layer: technique
type: technique
subject: engine-string-representation
technique: dual-encoding-symbol-interner
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [a compiler must compare identifiers in constant time from lexing through code generation, interned text arrives in two encodings and a symbol must be one integer regardless, reserved words and well-known names must be testable as integer ranges]
---

# Dual-encoding symbol interner

The compiler sees every identifier before the runtime sees any, and it sees them
bounded by the source text. That bound is what makes interning affordable where it is
not affordable for the runtime's dynamic strings: intern each distinct identifier once
into a table, hand back a small integer, and from that point on a name is compared,
hashed, stored in a scope and emitted into bytecode as an integer. The characters are
consulted to print an error, to build a property key at runtime, and for nothing else.
The technique is the table and the three refinements that separate a working interner
from a naive one: two encodings behind one index space, a fixed prefix of well-known
symbols, and a symbol type whose absence costs nothing.

## Two interners, one index space

Identifier text arrives in the encoding the source was read in, and per the
construction-time rule it should be stored narrow when it fits. A single interner
storing one encoding either widens everything or cannot hold wide names. The resolution
is two interners, one per encoding, whose indices are kept aligned: symbol *n* names
entry *n* in whichever interner holds the text, and the other interner holds a sentinel
at *n*. Interning narrow text pushes to the narrow side and a sentinel to the wide side;
interning wide text does the reverse. Resolution reads the narrow side first and, on the
sentinel, the wide side.

The sentinel is a value that no real text can be, and it must be checked rather than
read as text ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)): a
narrow-side slot that reads as an empty string for a symbol whose text is wide would
resolve every wide identifier to nothing, silently. Reserve a slot value outside the
text domain, and make resolution match on it. If the empty string is the sentinel, the
empty string must be interned into the fixed prefix before any dynamic text, so that no
dynamic lookup can ever match the sentinel by content.

The interner's two encodings need not be the runtime's two. The runtime's narrow form is
a one-byte unit; a compiler's narrow side is often the host language's own variable-width
text so that source can be interned without transcoding. When that is so, the sentinel
marks a stronger condition than "does not fit": it marks text that has *no valid form* on
the narrow side at all, such as an unpaired surrogate the wide encoding permits and the
variable-width one rejects. And because the narrow side then says nothing about whether
the text fits the runtime's one-byte form, the interner records that as a separate flag
per symbol at intern time - the construction-time rule from the runtime, applied once,
so that resolving a symbol to a runtime string never re-scans its units.

The alignment invariant is the one to test: after every intern, both interners have the
same length. An interner whose sides drift by one produces symbols that resolve to the
wrong text, and the failure appears as a property lookup returning a different property
than the source named.

## A fixed prefix of well-known symbols

The specification's names - reserved words, the built-in property names, the strings
the language produces on coercion - are known at build time, so they should be interned
at build time into a fixed prefix of the symbol space, in a fixed order, from the same
list the runtime's static string table is built from
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Dynamic symbols start at an offset past the prefix. Two things follow. A well-known
name has the same symbol in every compilation and every context, so bytecode that
names it can be compared across contexts and a runtime that resolves it does not
consult the dynamic table at all. And because the prefix is ordered by kind, the
reserved words occupy one contiguous range and "is this symbol a reserved word" is two
integer compares, as is "is this symbol a well-known property name".

The prefix is a perfect hash at build time: a lookup from text to symbol over the fixed
set that never collides and is evaluated by the compiler, so that interning a
well-known name at runtime is a table probe with no dynamic insertion. Text that is not
in the prefix falls through to the dynamic interner, which never returns a symbol below
the offset. A dynamic interner that can mint a symbol inside the prefix range has broken
every range compare downstream.

## The zero symbol is unused

Compilers carry optional symbols everywhere - the name of an anonymous function, the
label a break may or may not target, the binding a scope may or may not shadow. If the
symbol is a plain integer, an optional symbol is a discriminant plus an integer, and
every structure that holds one grows. Leave symbol zero unused, define the symbol type
as a non-zero integer, and the language's optional type can use zero as its absent case
with no extra word. The prefix then starts at one, the sentinel discussion above does
not apply to symbol zero because no text is ever interned there, and a zero read from
uninitialised storage is caught as absent rather than resolved as the first well-known
name.

## What the interner does not do

It does not intern runtime strings. A program that builds a string per loop iteration
would fill the table with texts seen once, and the table has no eviction because
symbols are held in bytecode that may run again. The runtime compares its dynamic
strings by content with a cached hash; the interner serves the compiler and the fixed
prefix. Where a runtime string must become a symbol - a computed property name looked
up in a scope - the crossing happens at that site, through the interner's ordinary
insertion, and is bounded by the number of such sites the program actually executes.

## Decision rules

- When identifiers must compare in constant time across a compiler, intern them into
  small integers and keep the text for errors and property keys only.
- Keep one interner per encoding with aligned indices and a sentinel outside the text
  domain on the side that does not hold the text; test that both sides have the same
  length after every intern.
- Build a fixed prefix of well-known symbols from the runtime's static table list, via a
  build-time perfect hash, ordered so that each kind is a contiguous range; start
  dynamic symbols past the prefix and never mint below it.
- Leave symbol zero unused so the optional symbol is free; start the prefix at one.
- Never intern runtime-built strings wholesale; cross from string to symbol only at the
  sites that need a scope lookup.

## When not to use it

A single-pass interpreter with no separate compilation phase and no scope resolution
compares names rarely enough that content equality with a cached hash suffices. A
language with one encoding needs one interner and no sentinel. A language with no fixed
vocabulary - no reserved words, no specification-defined property names - has no prefix
to build, and the perfect hash is machinery without an input.
