---
layer: application
type: application
subject: trust-base
technique: soundness-argument-names-its-dependencies
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.88
---

# A hash read back through a pointer cast, sound by three distant facts, in a requirements-traceability tool

Witness: the `duvet-core` package of the duvet tree at commit
`44f43e87683ae6077c64f4aa8fd519910c981fb6` (`rust-version = "1.88"`, edition 2021).
Anchors resolved against the read-only clone on the date above.

## The site

`Contents` stores file bytes with a content hash appended, in one allocation:
`duvet-core/src/contents.rs:9 "pub struct Contents(Arc<[u8]>);"`. Reading the hash back
reinterprets the trailing bytes, in
`duvet-core/src/contents.rs:39 "let hash = unsafe { &*(ptr.add(len) as *const Hash) };"`,
with the data slice built beside it by
`duvet-core/src/contents.rs:40 "core::slice::from_raw_parts(ptr, len)"`.

## The three facts the cast needs, and where each one lives

1. **Layout.** The cast is sound only if the hash type is a plain byte array with no
   padding, which is what `duvet-core/src/hash.rs:7 "#[repr(transparent)]"` on the
   tuple struct below it declares. Remove that attribute and the cast still compiles
   and reads a layout the language does not promise.
2. **Constructor.** The trailing bytes exist because every `Contents` is built by
   `duvet-core/src/contents.rs:61 "data.extend_from_slice(&*Hasher::hash(&data));"`
   in `From<Vec<u8>>`, and the other conversions funnel into it (`From<&[u8]>` reserves
   room for the hash and calls `vec.into()`). The field is private, so there is no
   other construction path in the module.
3. **Length.** `duvet-core/src/contents.rs:38 "let len = self.0.len() - HASH_LEN;"`
   cannot underflow only because the constructor always appended the hash. A
   hand-built `Contents` of fewer bytes would underflow in release.

## Deviation: the argument is written nowhere

Neither end of any of the three edges is annotated. The two `unsafe` blocks in `parts`
have no note, and the representation attribute carries no remark that a cast in
another file depends on it. This is the case the technique targets: the attribute is a
one-line cleanup candidate because nothing says it is load-bearing.

The same package shows the discipline in a weaker form elsewhere, which makes the
contrast fair. At
`duvet-core/src/file.rs:177 "Safety: this validity was checked at creation on SourceFile"`
a note sits above `from_utf8_unchecked`. It names the dependency (validity
established at creation) in one direction only. The constructor it points to does not
say a reader depends on it, so the site has the first end of the edge and not the
second.

## Lint coverage of this site, checked against the linter's source (2026-10-14)

The restriction lint `undocumented_unsafe_blocks` in Rust's clippy is documented as
checking "unsafe blocks and impls without a `// SAFETY: ` comment". Read against the
lint's source on the beta branch (`clippy_lints/src/undocumented_unsafe_blocks.rs`,
`check_item`): it visits trait impls whose trait is `unsafe` (so hand-written
`Send`/`Sync` impls are covered), skips inherent impls, requires the comment on the
lines directly preceding the item (attributes in between are accepted by default via
`accept-comment-above-attributes`, and a comment above the enclosing statement by
`accept-comment-above-statement`), and its companion `unnecessary_safety_comment`
flags notes on safe code. Rust-for-Linux enables it and denies unsafe code without a
note. The first version of this subject said impls were outside the lint's reach and
listed "can a lint enforce comments on impls" as open; it can, for presence. What
stays manual is unchanged: whether the note names its exclusion and its dependency.
Consequence for the deviation above: the eight undocumented impls in the witness
would each be a lint finding under that configuration, which makes the lint the
cheapest first step of the remedy rather than a partial one. Sources read through
search snippets and the source file fetch; I did not run the lint on the witness tree.
