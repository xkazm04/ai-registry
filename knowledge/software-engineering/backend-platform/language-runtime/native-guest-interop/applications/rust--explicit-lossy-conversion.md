---
layer: application
type: application
subject: native-guest-interop
technique: explicit-lossy-conversion
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.91
---

# Explicit lossy conversion, in the Boa engine

Verified against `boa-dev/boa` at commit `665f03924a54e5162be227e7e909612e36f6e35a`,
workspace version 0.22.0; the toolchain witness is `Cargo.toml:30`,
`rust-version = "1.91.0"`. The guest-to-host trait is `TryFromJs` in
`core/engine/src/value/conversions/try_from_js.rs` and the host-to-guest
trait is `TryIntoJs` in `core/engine/src/value/conversions/try_into_js.rs`.
Every line below was re-opened on the date above.

## The width that is refused by omission

The trait's own documentation at `try_from_js.rs:11-34` is the technique's
second procedure verbatim. `f64` is implemented "because JavaScript numbers
are IEEE-754 double-precision values, so that conversion is exact" (lines
15-16); `f32` "is intentionally **not** implemented ... Converting a JS
number to `f32` can lose precision, and Rust prefers that loss to be
explicit" (lines 18-20). The two explicit paths are both named: convert to
`f64` first and cast with `as f32` (lines 20-27, with a worked example), or
use `JsValue::to_f32` for JavaScript-style coercion, "also lossy by design"
(lines 32-33). The `f64` implementation at lines 187-199 accepts the
integer-tagged representation and the float representation and refuses
everything else with a type error.

## The widths that are implemented with a runtime exactness check

The handoff spec for this subject said "refuse the lossy width and make the
caller cast". The tree does that for one width only. Every integer width —
`i8, u8, i16, u16, i32, u32, i64, u64, usize, i128, u128` — is implemented
by the macro `impl_try_from_js_integer!` at `try_from_js.rs:212-243`
(instantiation at line 243). An integer-tagged value converts through
`i.try_into()` with the overflow error carried into a type error naming the
target width (lines 217-225). A double converts through `from_f64` at lines
201-210, which is the round-trip check exactly:
`<f64 as AsPrimitive<T>>::as_(v).as_().to_bits() == v.to_bits()` (line 206)
— cast to the target, cast back, compare bits. The test at lines 245-273
shows what the round trip refuses: a fractional part
(`4.000_000_000_000_001`, line 259), `NaN` (263), and both infinities
(267-271) all return an error, while `4.0` converts at every width (249-256).
The `to_bits` comparison also refuses negative zero, which no test names.

So the standard this tree argues for is *exact or error at every width*, with
omission reserved for the width whose exact subset would surprise; that is
the rule the technique now states, and the handoff's phrasing was the
narrower reading of the `f32` paragraph alone.

## The other direction

`TryIntoJs` at `try_into_js.rs:36-48` implements the infallible path by
delegation to `From` for `i8, u8, i16, u16, i32, u32, f32, f64` (line 48).
The wide widths are fallible against the safe-integer range:
`MAX_SAFE_INTEGER_I64 = (1 << 53) - 1` and `MIN_SAFE_INTEGER_I64 =
-MAX_SAFE_INTEGER_I64` (lines 76-77), with `err_outside_safe_range` (79-83)
as the typed refusal and implementations for `i64, u64, isize, usize, i128,
u128` at lines 88-147. There is no silent path to a `BigInt` for a wide
integer; the caller who wants one converts explicitly.

## Structural fact

The six wide-width implementations were written by hand rather than through
one helper, and their bounds disagree at the top of the range. `i64` (line
91) and `isize` (line 111) test
`(MIN_SAFE_INTEGER_I64..MAX_SAFE_INTEGER_I64).contains(&value)` — a
half-open range, so `2^53 - 1`, the maximum safe integer itself, is
**refused**. `u64` (line 101), `usize` (line 121), `i128` (line 131) and
`u128` (line 141) test with `<` against the same constant, so the same value
is **accepted**. The value `9007199254740991` therefore converts from `u64`
and `i128` and fails from `i64` and `isize`. No test in the file exercises
the boundary. This is the failure the technique's fourth decision rule names
— eleven hand-written range checks are eleven chances for one to be half-open
— found in the tree that motivated the rule; the guest-to-host direction,
which shares one `from_f64` helper across all eleven widths, has no such
disagreement.
