---
layer: technique
type: technique
subject: engine-string-representation
technique: narrowest-encoding-at-construction
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [the language's code unit is wider than the text most programs actually contain, choosing where the encoding of a string is decided and recorded, an interner and a runtime string type must agree on how a symbol's text is stored]
---

# Narrowest encoding at construction

The language defines its string as a sequence of sixteen-bit code units, and the
programs written in it are mostly identifiers, keys, paths and messages whose every
unit fits in eight bits. A representation that stores the wide unit unconditionally
halves the number of strings that fit in a cache line and doubles the memory of every
string-heavy guest object. A representation that stores the narrow unit unconditionally
cannot hold the language. The technique is the decision between them made per string,
once, at the moment the string is constructed, and recorded as a flag in the allocation
that every reader consults.

## The scan and the flag

Construction from a sequence of units scans them once. If every unit is below 256, the
string is stored as bytes and the flag says narrow; otherwise it is stored as wide units
and the flag says wide. The scan is linear in the input and is folded into the copy
that construction performs anyway, so it is not an extra pass in the common case. The
flag lives in the header beside the length and is fixed for the allocation's life.

Two properties follow and both are load-bearing. The encoding is a fact about the
*content*, not a policy about the *site*: the same text produces the same flag no matter
which constructor minted it, so a consumer can rely on narrow meaning "no unit above
255" without knowing the string's provenance. And the encoding is never revisited: there
is no re-encoding on append, no promotion on first wide access, no demotion when a wide
string's high units turn out to be absent. An immutable string has no later moment at
which the decision could change, and a representation that allowed one would have to
guard every reader against a flag that moved underneath it.

## Every reader asks the flag

The failure mode of dual encoding is a reader written against one width. A unit iterator
that assumes two-byte storage reads garbage from a narrow string; a byte-level compare
that assumes one-byte storage reports two equal wide strings as unequal because it
compared half their units. The discipline is that no code touches the unit storage
without branching on the flag, and the way to make the discipline structural is to
expose the storage only through an enumeration over the two encodings, so a reader
that wants the units must match both arms and the compiler refuses a reader that
handles one.

Where a reader genuinely needs a width-independent view, provide an iterator over
code-unit values that widens narrow units on the fly, and pay the branch once at
iterator construction rather than per unit. Where a reader needs code points rather
than units, the decoder over the wide arm must handle surrogate pairs and unpaired
surrogates as the language specifies; the narrow arm has no pairs and its decoder is
the identity.

## Derived strings inherit or re-scan by rule

A concatenation's encoding is narrow if and only if both operands are narrow, and this
is known from the flags without scanning either operand. A slice inherits its owner's
encoding without scanning, because a sub-range of a narrow string is narrow and a
sub-range of a wide string is stored wide even when its units happen to fit in a byte;
re-scanning a slice to see whether it could be narrowed would cost a pass on the most
frequent construction path and would break the invariant that a slice reads through its
owner's storage. A string built by a transformation (case mapping, replacement) is
re-scanned, because the transformation may have introduced or removed a wide unit and
the result is a fresh allocation anyway.

The decision rule: when the derived string shares storage with an existing one, inherit
the flag; when it owns fresh storage, scan the fresh units.

## The interner records the same flag

A compiler's symbol table stores identifier text so that a symbol can be turned back
into a string at runtime - for reflection, for error messages, for the property key a
name becomes. If the interner stores text in one fixed encoding, every symbol-to-string
conversion re-scans and may re-encode, and the runtime's narrow-string economy is lost
exactly on the property names that dominate it. So the interner applies the same
construction-time rule: it scans at intern time, stores the narrow form when it fits,
and records the flag on the symbol so that resolving a symbol produces a string handle
with the right encoding and no scan. One rule, stated once, applied in two places that
must agree ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

## Decision rules

- When the language's unit is wider than the common text, scan at construction and
  store the narrowest encoding that holds every unit, because memory per string is the
  cost an embedded engine is measured on.
- Record the encoding as a header field fixed for the allocation's life; never
  re-encode, promote or demote, because an immutable string has no safe moment to do so.
- Expose unit storage only through a two-armed enumeration so that a reader handling
  one width does not compile.
- A concatenation is narrow only if both operands are; a slice inherits its owner's
  flag; a fresh allocation from a transformation is re-scanned.
- The interner scans and records the same flag at intern time, so symbol-to-string
  resolution never re-examines text.

## When not to use it

A language whose unit is already one byte gains nothing and should store one encoding.
A language whose text is genuinely wide in the common case - a runtime whose inputs are
dominated by scripts outside the narrow range - pays the scan on every construction and
wins on few strings; measure the narrow fraction on real programs before adopting, and
adopt only above a clear majority. A runtime that must expose raw storage to a host
without a width branch (a fixed-width foreign interface) should pick one encoding at the
boundary and convert there, not remove the flag from the core type.
