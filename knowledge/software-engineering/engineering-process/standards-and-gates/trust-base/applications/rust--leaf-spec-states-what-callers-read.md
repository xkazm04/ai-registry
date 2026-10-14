---
layer: application
type: application
subject: trust-base
technique: leaf-spec-states-what-callers-read
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.88
---

# A membership-only contract with its omission written beside it, in a requirements-traceability tool

Witness: the `duvet-coverage` package of the duvet tree at commit
`44f43e87683ae6077c64f4aa8fd519910c981fb6` (`rust-version = "1.88"`, edition 2021),
verified with a date-pinned Verus release. Anchors resolved against the read-only
clone on the date above.

## The contract and the sentence beside it

`vec_from_btreeset` converts a `BTreeSet<u64>` into a `Vec<u64>` and is marked
`duvet-coverage/src/execution_propagation.rs:33 "#[verifier::external_body]"`. Its two
`ensures` clauses say that every set member is in the vector and every vector element
is in the set. The comment above it states the omission in the technique's terms: the
spec is `duvet-coverage/src/execution_propagation.rs:27 "*membership-only*"` and
"deliberately says nothing about the result's length or element uniqueness".

It then names the caller set and why the omission is safe today: the sole caller, the
`di` loop in `execution_set`, `duvet-coverage/src/execution_propagation.rs:29 "reads only membership"`.
The caller is
`duvet-coverage/src/execution_propagation.rs:186 "let de_vec: Vec<u64> = vec_from_btreeset(&directly_executed);"`,
inside the verified module, and the function carries no `pub`, so its caller set is
findable by searching one file.

The comment closes with the rule from the technique, in the author's words: "if a
caller ever depends on length/uniqueness, strengthen this spec rather than
assuming it". It also states the risk precisely: "a partial spec on an
`external_body` fn is exactly where a future refactor can silently weaken
guarantees".

## Why a verified caller cannot silently read more

The caller is inside the checker's view. A new loop that needs uniqueness would fail
to verify against a membership-only contract, so the omission is self-enforcing for
the verified module, which is the first half of the technique's caller analysis. The
comment's value is in what it tells the author whose proof fails: strengthen the
clause rather than add an assumption at the call.

## Deviations from the standard

- The claim that the sole caller reads only membership is a count without its search
  predicate. The comment does not say how callers were found; the private function
  and a single-file search make it checkable, but a reader has to redo it.
- Strengthening the clause would also require extending an outside test, and
  `vec_from_btreeset` has none (see the sibling application on outside tests), so the
  second half of the rule, "extend both witnesses in the same change", has no test to
  extend today.
