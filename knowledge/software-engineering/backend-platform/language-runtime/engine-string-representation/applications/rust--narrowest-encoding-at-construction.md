---
layer: application
type: application
subject: engine-string-representation
technique: narrowest-encoding-at-construction
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.91
---

# Rust: Latin-1 versus UTF-16 selection across Boa's string and interner crates

Boa (github:boa-dev/boa, commit `665f03924a54e5162be227e7e909612e36f6e35a`) pins
`rust-version = "1.91.0"` at `Cargo.toml:30`, the witness for `verified_against`. The
runtime string `JsString` in `core/string/` stores either Latin-1 (`u8`) or UTF-16 (`u16`)
units, decided at construction; the compiler's interner in `core/interner/` records the
same fact per symbol. This application traces where the decision is made, where it is
inherited, and the one constructor that does not make it.

## The encoding is a type, and the kind tag is derived from it

`core/string/src/type.rs:35-39` declares `pub enum Latin1 {}` - an uninhabited marker -
and `type.rs:46-57` implements `InternalStringType` for it with `KIND = JsStringKind::Latin1Sequence`.
`SequenceString<T>` at `core/string/src/vtable/sequence.rs:19-27` is parameterised by
that marker and writes `T::KIND` into the inline vtable at construction
(`sequence.rs:43`), with `len` beside it (`sequence.rs:42`); the vtable definition at
`core/string/src/vtable/mod.rs:34-36` states the immutability rationale for `len` being a
field rather than a call. `JsStr::is_latin1` at `core/string/src/str.rs:80` reads the
variant, and the guest can ask through `$boa.string.encoding` (`docs/boa_object.md:361-368`).

## Where the scan happens

`From<&str>` at `core/string/src/lib.rs:819-836` is the construction-time scan in full: an
ASCII fast path (`lib.rs:822-826`), then a `chars().all(|c| c as u32 <= 0xFF)` scan that
stores Latin-1 bytes when it passes (`lib.rs:828-833`), and a UTF-16 encode otherwise
(`lib.rs:834-835`). Both narrow arms probe the static table before allocating.

Concatenation inherits by rule: `concat_array` at `lib.rs:640-655` starts with
`latin1_encoding = true`, clears it on the first operand whose `is_latin1()` is false
(`lib.rs:643-645`), and allocates `SequenceString<Latin1>` or `SequenceString<Utf16>`
accordingly - no re-scan of units, exactly the "narrow iff both operands are narrow" rule.
The copy loop at `lib.rs:677-698` widens Latin-1 bytes into a UTF-16 result when needed
and marks the reverse arm `unreachable!()` (`lib.rs:695-697`). The builder in
`core/string/src/builder.rs:625-628` applies the same per-segment predicate.

A slice inherits without scanning: `SliceString::new` at `core/string/src/vtable/slice.rs:30-47`
takes `owned.as_str().get_unchecked(start..end)` (`slice.rs:32`), which carries the
owner's variant, and copies the owner handle (`slice.rs:43`) for retention.

## The interner records the flag once, and the compiler consumes it

`Interner` at `core/interner/src/lib.rs:251-258` holds `utf8_interner`, `utf16_interner`
and `latin1_flags: Vec<bool>` (`lib.rs:257`). `get_or_intern` at `lib.rs:387-425` interns
on both sides, asserts the indices agree (`lib.rs:416`), and pushes
`utf16.iter().all(|&c| c <= 0xFF)` onto the flags (`lib.rs:418`); `get_or_intern_static`
does the same at `lib.rs:463`. `is_latin1` at `lib.rs:571-581` answers `true` for every
symbol in the fixed prefix and reads the flag for dynamic ones. The compiler is the
consumer: `Sym::to_js_string` at `core/engine/src/bytecompiler/mod.rs:100-108` resolves
the UTF-16 text and, when `interner.is_latin1(*self)` (`mod.rs:102`), narrows it to bytes
and constructs a Latin-1 `JsString` - no scan at conversion. The changelog entry that
introduced this reads "detect Latin1-encodable strings at intern time instead of per-c…"
(`CHANGELOG.md:311`), which is the technique's interner rule stated as the fix it was.

Note that the interner's narrow side is UTF-8, not Latin-1: the sentinel `""` at
`lib.rs:401-412` marks a symbol whose UTF-16 text has no valid UTF-8 form (an unpaired
surrogate), while `latin1_flags` records whether it fits one byte. Three facts about one
symbol's text are kept in three places, index-aligned.

## Deviation: the `&[u16]` constructor never narrows

`From<&[u16]>` at `lib.rs:812-816` calls `from_js_str(JsStr::utf16(s))`, and
`from_slice_skip_interning` at `lib.rs:709-739` matches on the variant and allocates
`SequenceString<Utf16>` for the UTF-16 arm (`lib.rs:731-735`) without scanning for
`<= 0xFF`. A caller holding sixteen-bit units that all fit a byte gets a wide string. The
only construction path that scans is the one that starts from Rust `&str`
(`lib.rs:819-836`); the technique's rule is that the scan is a fact about content, not
about which constructor was called. The interner compensates for the compiler's
identifiers (the path above), but a host that hands the engine UTF-16 directly pays double
memory for narrow text.

## Deviation: no cached hash

`Hash for JsString` at `lib.rs:885-890` delegates to `JsStr::hash`, which walks every
unit on every call (`core/string/src/str.rs:425-439`, writing each Latin-1 byte as a
`u16` so the two encodings hash alike). There is no hash field in `JsStringVTable`
(`vtable/mod.rs:19-39`) and no cache anywhere in `core/string/src`. The header holds
`len` and `kind` as construction-time facts; the hash, which is equally fixed for an
immutable string, is recomputed per lookup.
