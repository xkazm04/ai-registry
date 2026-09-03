---
layer: technique
type: technique
subject: engine-string-representation
technique: compile-time-static-string-table
status: forged
laws: [one-authority-per-vocabulary, limits-are-derived]
shared_with: []
use_when: [a closed set of names is minted far more often than all other strings combined, the engine's own code must name a well-known string in a constant context, deciding what the lookup before allocation may cost on the miss path]
---

# Compile-time static string table

The specification fixes a closed vocabulary of names: the property names every built-in
object carries, the reserved words, the strings that type coercion produces. Those
names are minted more often than all other strings put together, and a runtime that
allocates a fresh string for each minting is allocating the same few hundred texts
without end. The technique is a table of those texts compiled into the engine as static
allocations, a lookup that every construction path performs before allocating, and the
two mechanisms that make the lookup free to consult from constant code and cheap to
consult on the miss.

## The table is a static authority, not a cache

Each entry is a string allocation whose bytes live in the binary, whose reference count
is a no-op, and whose release does nothing. A handle to it is a handle like any other;
nothing downstream knows it is static, which is the point. The table is built at compile
time from one list of texts, and that list is the single authority for the vocabulary
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)): the
compiler's fixed symbols, the runtime's well-known handles and any introspection that
reports "did this string allocate" all derive from it. Two lists - one for the interner,
one for the runtime - drift on the day someone adds a name to one of them.

The empty string is the first entry and the most important. Every degenerate operation -
a slice of zero length, a concatenation of two empties, a conversion of nothing -
returns the static empty rather than allocating one, and a runtime that allocates an
empty string has mis-designed its base case.

## Constant search for constant contexts

The engine's own code needs to name a well-known string at a site where no runtime step
may occur: a static initialiser, a constant table of built-in method names, a match arm.
For those sites the table offers a search that the compiler evaluates: a linear scan
over the entries with a content compare, executed at build time, so the site holds a
handle to the entry and no lookup survives into the binary. A linear scan is acceptable
because it runs once per site at build time and never at runtime. A name that is not in
the table is a compile error at the site, which is the right outcome: the site asked
for a well-known string and named one that is not well known.

## Lazily built hash cache for the runtime path

The runtime path is the other case: text arrives from a literal, a concatenation or a
host, and the engine must decide whether it is a table member before allocating. A
linear scan here would be paid on every construction. So the table also carries a hash
index, built on first use rather than at startup because most contexts never construct
a string that is a table member from dynamic text, and a startup that builds an index
nobody reads is startup that every embedder pays. The index maps content hash to entry
and confirms by compare.

## The length gate

Even a hash lookup costs a hash of the input, and most dynamic text is not in the table.
The pre-check that makes the miss free is a length compare: the table records the length
of its longest entry, and any input longer than that cannot be a member and skips the
lookup entirely. The gate is derived from the table's own contents, computed from the
list at build time rather than written as a constant beside it
([limits-are-derived](../../../../_laws.md#limits-are-derived)), so adding a longer
entry moves the gate and cannot leave it stale. On a typical vocabulary the longest
well-known name is a few dozen units, and everything a guest program builds by
concatenation clears it in one integer compare.

The decision rule for the whole path: on construction from dynamic text, compare
length against the gate; below it, hash and probe the index; on a hit return the static
handle; on a miss allocate. Above the gate allocate without hashing. The path is the
same for both encodings, and a wide input whose text matches a narrow table entry hits
that entry, because the index hashes code-unit values and not stored bytes. The check
runs *before* the allocation, on the input units; a path that allocates the result and
then probes the table has paid the allocation and a release on every hit, which is the
cost the table exists to remove. Concatenation is the path most likely to get this
wrong, because its input is several pieces and the natural place to probe is the
assembled result - probe the assembled units in a stack buffer when their total is under
the gate, and skip the probe entirely when it is not.

## Decision rules

- When a closed vocabulary of names dominates minting, compile it into a static table
  from one list and derive the interner's fixed symbols from the same list, because two
  lists drift on the day one of them grows.
- Offer a compile-time search for constant sites and a lazily built hash index for the
  runtime path; never a runtime linear scan.
- Gate the runtime lookup on the longest entry's length, computed from the list, so the
  miss path costs one compare and the gate cannot go stale.
- Return the static empty string from every degenerate operation; never allocate an
  empty.
- Check the table on every construction path, including the interner's symbol-to-string
  resolution and slicing's degenerate ranges - a path that skips the check allocates
  well-known names silently.

## When not to use it

A runtime whose construction paths are few and whose well-known names are handled by an
interner at every site has already solved the problem in the compiler and may not need
the runtime table; the table earns its place where strings are minted from dynamic text
the compiler never saw. A vocabulary that is not closed - user-configurable names, a
host-supplied set - cannot be compiled in and should go to the interner instead. And a
table so large that its hash index is a measurable share of the binary has stopped
being a well-known set; trim it to what is actually minted, measured on real programs.
