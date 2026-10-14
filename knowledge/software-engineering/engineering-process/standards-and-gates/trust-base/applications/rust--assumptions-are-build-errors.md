---
layer: application
type: application
subject: trust-base
technique: assumptions-are-build-errors
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.88
---

# A word-size assumption stated twice, and an ordering assumption guarded by a test, in a requirements-traceability tool

Witness: the `duvet-coverage` package of the duvet tree at commit
`44f43e87683ae6077c64f4aa8fd519910c981fb6` (`rust-version = "1.88"`, edition 2021),
proved with a date-pinned Verus release. Anchors resolved against the read-only
clone on the date above.

## The word-size fact on both sides

The proofs convert between `u64` line numbers and `usize` indices, and they need that
conversion to lose nothing. The package states the fact on the unverified side as a
compile-time assertion:
`duvet-coverage/src/lib.rs:43 "const _: () = assert!("` compares
`duvet-coverage/src/lib.rs:44 "core::mem::size_of::<usize>() >= core::mem::size_of::<u64>()"`
and fails with
`duvet-coverage/src/lib.rs:45 "duvet-coverage proofs require usize >= u64 (64-bit platform)"`.
The comment above it names the consequence of failure, that "the proofs' assume
statements are unsound". The assertion sits at crate level, so every build of the
package evaluates it, not only the verification lane.

The verified side states it in the prover's dialect inside the `verus!` block:
`duvet-coverage/src/lib.rs:64 "global size_of usize == 8;"`, with a comment that it
exists so the index casts are provably lossless instead of assumed, and that it
matches the runtime assertion above.

## Deviation: the two predicates differ

The comment says the two match, and the predicates are not the same. The build asserts
`usize >= u64` and the proofs state `usize == 8` bytes. A target with a wider word
passes the build assertion and falls outside the proofs' stated premise. No such
target is in use, so this costs nothing today, and it is exactly the divergence the
technique is designed to remove. The standard stays: assert the predicate the proof
states, or restate the proof's fact as the weaker one and re-check that the proofs
still go through. The prose at
`duvet-coverage/src/lib.rs:63 "built/verified on 64-bit targets."` is the substitute for the
missing exactness.

## An ordering assumption guarded by a test, not by the build

`LineClass = BTreeSet<LineProperty>` orders its members by the derived `Ord`, which the
prover cannot reason about. The proofs therefore reason against a hand-written ghost
function that re-specifies the order as `0..=7`. The comment above the enum is headed
`duvet-coverage/src/types.rs:14 "TRUST BASE:"` and says
`duvet-coverage/src/types.rs:18 "Nothing machine-checks that the hand-written discriminant"`
still equals the derived order, and that a reorder would leave the proofs verifying
against a stale order while the runtime set uses the new one. The guard is the test
named at `duvet-coverage/src/types.rs:21 "discriminant_matches_derived_ord"` and defined at
`duvet-coverage/src/types.rs:199 "fn discriminant_matches_derived_ord"`.

This is the technique's second case, a fact that cannot be a compile-time check, so
the second statement is an executable one in the ordinary test run. It is also an
upward lesson for the technique draft: the same two-statements discipline covers
facts about the language's derived behaviour, not only the platform, and the guard's
weakness is the one the comment admits, that the test must be updated in lockstep by
a person.
