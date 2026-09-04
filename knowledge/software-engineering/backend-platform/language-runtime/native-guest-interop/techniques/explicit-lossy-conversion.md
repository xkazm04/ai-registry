---
layer: technique
type: technique
subject: native-guest-interop
technique: explicit-lossy-conversion
status: forged
laws: [unknown-is-not-a-value, verdict-survives-boundary]
shared_with: []
use_when: [implementing conversions from a guest value into host numeric and string types, deciding which host widths get a fallible conversion with a runtime exactness check and which are refused outright, converting a wide host integer into a guest number that cannot hold it exactly]
---

# Explicit lossy conversion

## The concern

A guest number is, in most embedded languages, a double: fifty-three bits of
integer precision, no distinction between the integer three and the float
three, and a set of specified conversions to narrower widths that *wrap* or
*clamp* rather than fail — modular reduction to a signed thirty-two-bit width,
saturation for an array index, truncation toward zero for a length. Those
conversions are exactly right inside the language, where the script author
expects them. They are exactly wrong behind a host conversion trait, because
the host author reading a fallible conversion reads it as *exact or error*,
and a lossy implementation behind that spelling returns *wrapped and
successful*: the value that did not fit arrives as a confident wrong number,
and no error was raised at the one point the host author trusted the type
system to say no.

## The procedure

The rule is **exact or error, at every width the trait is implemented for**,
and there are two ways to keep it. Which one a width gets depends on whether
the set of values that convert exactly is the set a caller would expect.

For the integer widths, the exact set is obvious — integral, in range — and
every width gets an implementation that *checks exactness at run time*. A
value carrying the guest's integer tag converts through a range-checked
narrowing that fails on overflow. A value carrying a double converts through
a round trip: cast to the target width, cast back, and accept only if the
result is bit-identical to the input. The round trip is what makes the check
complete without enumerating cases: a fractional part, a value out of range,
a not-a-number, an infinity, and a negative zero all fail to survive it, and
each fails with a typed error naming the target width. No width is refused by
omission here, because omitting the eight-bit width would not make anyone
safer — it would push the author to a manual cast that wraps.

For a narrower floating width, the exact set is *not* the set a caller
expects. Most fractional doubles do not survive a round trip through a
thirty-two-bit float, so an exact-or-error implementation would refuse nearly
every value a script produces, and a lossy one would round in silence. That
width is **refused by omission**: there is no fallible conversion to it, the
trait's documentation says so and says why, and it names the two explicit
paths — convert to the double width and cast, spelling the loss at the call
site; or call the language's own coercion, which is lossy by design and is
named as such. The compiler pushes the author to the choice.

The same discipline runs in the other direction. A host-to-guest conversion
that cannot fail is implemented for the widths a double holds exactly — every
integer up to thirty-two bits, both float widths — and the sixty-four-bit and
wider integers get a *fallible* conversion that returns a typed error outside
the safe-integer range rather than rounding. A runtime with an
arbitrary-precision guest integer may offer that as a third, explicit path;
it is never the silent default for a wide width, because the guest's number
and its big integer are different types with different arithmetic.

## Decision rules

When a width has a clean exact subset, implement the fallible conversion with
a runtime exactness check and a typed refusal — never a wrapping or
saturating success — because a conversion that succeeds lossily has laundered
*does not fit* into a definite value at the boundary the caller trusted
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

When a width's exact subset would surprise the caller — a narrower float, a
fixed-point type — refuse the implementation outright and document, on the
trait, the explicit cast and the named coercion the author should choose
between, because the omission is the mechanism that makes the loss visible in
the author's own code.

When a conversion refuses, refuse with a typed error the caller can branch on
— which target width, and that the value did not fit — rather than a generic
conversion failure, because the host code that receives it is often itself a
native function whose job is to turn that refusal into a guest type error
with the same content, and a classification that arrives as prose cannot be
re-thrown as a typed verdict
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).

When the round-trip check is written, write it once as a generic helper and
let every integer width share it, because a per-width range check
hand-written eleven times is eleven chances for one width's bound to be
half-open where the others are closed — and the boundary value of the
safe-integer range is exactly the value a caller will test.

When a host string type cannot hold every guest string — a guest string of
unpaired surrogates, a host string that is well-formed by construction — the
conversion is fallible and says so; a conversion that substitutes a
replacement character has made a lossy choice behind an exact spelling.

## When not to use it

A runtime whose guest numbers *are* host integers — a statically typed guest
with integer widths matching the host's — has exact conversions at every width
and nothing to check or refuse; implement them all directly.

Code that is deliberately implementing the language's specified conversion for
a built-in — the runtime's own array-index or bit-operation paths — is the
named coercion the technique points to, and should carry the language's
semantics without apology. The technique governs the host-facing trait, not
the runtime's internal arithmetic.
