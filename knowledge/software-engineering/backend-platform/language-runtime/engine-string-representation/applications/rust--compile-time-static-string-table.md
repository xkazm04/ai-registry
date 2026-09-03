---
layer: application
type: application
subject: engine-string-representation
technique: compile-time-static-string-table
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.91
---

# Rust: the static string table in Boa's `boa_string` crate

Boa (github:boa-dev/boa, commit `665f03924a54e5162be227e7e909612e36f6e35a`, workspace
version 0.22.0 at `Cargo.toml:29`) pins its toolchain at `Cargo.toml:30`
(`rust-version = "1.91.0"`), which is the witness for `verified_against`. The engine's
well-known strings live in `core/string/src/common.rs`, a 962-line file that is almost
entirely one constant array, and the construction paths in `core/string/src/lib.rs`
consult it before allocating. The design document `docs/string.md:39-40` describes the
intent; the tree realises it with three of the technique's mechanisms exactly and departs
from it in two places worth naming.

## The table, the constant search and the derived gate

`RAW_STATICS` at `common.rs:235` is a `const` slice of `StaticString` values, 692 entries
at this commit, and its first entry (`common.rs:236`) is the empty string. Every entry is
constructed with `JsStr::latin1(...)` - the table is single-encoding by construction, and
the compile-time search at `common.rs:49-52` makes that an invariant with an
`unreachable!()` on the wide arm rather than a comment.

The constant search is `find_static_js_string` at `common.rs:30-60`: a `const fn` linear
scan with a hand-written `const_eq` over bytes, ending in a `panic!` when the candidate is
absent. It is invoked only from the `well_known_statics!` macro at `common.rs:9-20`, which
expands each named constant to `const { JsString::from_static(Self::find_static_js_string("...")) }`
(`common.rs:14-16`) - so `StaticJsStrings::LENGTH` is a pointer resolved at compile time
and a misspelt name is a compile error at the declaration site, which is the technique's
"constant contexts" rule verbatim.

The runtime path is `get_string` at `common.rs:66-73`. It gates on `MAX_STATIC_LENGTH`
first (`common.rs:67-69`) and only then probes `RAW_STATICS_CACHE`, a `LazyLock<FxHashMap>`
built on first use from the array (`common.rs:231-232`). `MAX_STATIC_LENGTH` itself is a
`const` block that walks `RAW_STATICS` and takes the maximum length (`common.rs:217-228`)
- the gate is computed from the list, which is the derived-limit shape the technique
asks for: add a longer entry and the gate moves with it.

The construction paths route through the table as the technique requires:
`from_js_str` at `lib.rs:743-748` probes then falls to `from_slice_skip_interning`;
`From<&str>` at `lib.rs:819-836` probes on both of its narrow arms; `From<JsStr>` at
`lib.rs:839-844` probes; `slice` at `lib.rs:586-596` returns `StaticJsStrings::EMPTY_STRING`
for a degenerate range; and `Default` at `lib.rs:765-770` is the static empty. The
introspection surface confirms the effect from the guest side:
`$boa.string.storage("push")` reports `"static"` (`docs/boa_object.md:351-359`).

## Structural fact: three static vocabularies, none derived from another

The technique's first decision rule is that the runtime table and the compiler's fixed
symbols come from one list. This tree keeps three:

1. `RAW_STATICS` in `core/string/src/common.rs:235` - 692 entries, the runtime table.
2. The interner's fixed prefix in `core/interner/src/sym.rs:76-158` - 71 literals fed to
   the `static_syms!` macro, whose expansion (`core/macros/src/lib.rs:209-230`) produces
   two ordered sets and a block of `Sym` constants and says in its own doc comment that
   the three "must always be in sync" (`core/macros/src/lib.rs:213-214`).
3. Per-site literals: `js_string!("...")` in `core/engine/src/string.rs:57-60` expands a
   literal to a fresh `const LITERAL: StaticString` at that call site, not to a lookup in
   `RAW_STATICS`. Two sites writing `js_string!("length")` mint two static allocations
   with equal content and different addresses, as does `StaticJsStrings::LENGTH`.

`core/string/Cargo.toml` does not depend on `boa_interner` or `boa_macros`, and the
interner's 71-entry list is not generated from the runtime's 692-entry one, so a name
added to one list is absent from the other until someone notices. The third vocabulary
is why the tree's `PartialEq` at `lib.rs:906-910` is content equality with no address
shortcut: address equality would report `js_string!("length") != StaticJsStrings::LENGTH`.
The engine's own test at `core/engine/src/string.rs:194-216` asserts the content-and-hash
equivalence across encodings, and the static-table hit for a wide-encoded `"length"`
(`string.rs:213-216`) - confirming that the cache hashes code-unit values
(`core/string/src/str.rs:425-439`), which is what lets a one-encoding table serve
two-encoding inputs.

## Deviation: concatenation probes after allocating

`concat_array` at `lib.rs:640-706` computes the result's encoding from its operands
(`lib.rs:643-645`), allocates the sequence (`lib.rs:649-655`), copies every piece in
(`lib.rs:663-700`), and only then probes the table with
`StaticJsStrings::get_string(&string.as_str()).unwrap_or(string)` at `lib.rs:705`. On a
hit the freshly allocated sequence is dropped. The technique's rule is to probe the
input units before allocating; here the concatenation of `"proto"` and `"type"` allocates,
matches `"prototype"`, and frees. The length gate at `common.rs:67` still makes the miss
cheap, so the cost is confined to hits, which are exactly the strings the table was built
to keep off the allocator.

## Deviation: number formatting skips the table

The `From<integer>` and `From<float>` impls at `lib.rs:790-810` call
`from_slice_skip_interning` directly, so a numeric-to-string conversion never consults the
table even when the result is a table member (single digits are in `RAW_STATICS`). The
standard says every construction path checks; this one, by name, skips.
