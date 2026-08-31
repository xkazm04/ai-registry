---
layer: application
type: application
subject: module-design
technique: borrowed-surface
stack: rust
status: forged
verified_on: 2026-08-31
verified_against: rust@1
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Rust — a scrubbing wrapper that forwards the surface it was built to restrict

A live tree carrying [borrowed-surface](../techniques/borrowed-surface.md) in its
form-one shape, and carrying it in the exact state the technique predicts: the
invariant has already left the type, one caller has already reimplemented it by
hand, and a comment is already doing the work the compiler was supposed to do.

## The wrapper and its job

A private newtype wraps a decrypted credential field map. Its entire purpose is
one invariant — **no plaintext value is discarded without being scrubbed first**
— and it enforces that invariant in exactly two places: a `Drop` impl that
zeroizes every value when the wrapper goes out of scope, and a `replace` method
that scrubs the outgoing values before swapping in a freshly-decrypted map. The
doc comment on `replace` states the reasoning precisely: a re-read inside the
refresh lock must not leave a stale decrypted copy un-zeroized on the heap.

It also implements the mutable-forwarding operator to the inner map. That is one
declaration, and it is the whole finding: every mutating method the standard
hash map has — insert, remove, clear, retain, drain, the in-place accessors —
becomes reachable on the wrapper, and **not one of them knows about the
invariant**. The two guarded methods are the door; the forwarded surface is the
bypass, which is [one-validation-door](../../../../_laws.md#one-validation-door)
at the type level.

## The structural fact: the invariant is held by a comment

This is the part worth recording, because nobody designed it and the tree proves
it anyway. Sweeping every use of the wrapper in the module finds **exactly one**
mutation through the forwarded surface — an `insert` that overwrites the access
token after an OAuth refresh. It is correct. It is correct because the author
noticed, and wrote four lines to catch the displaced value and zeroize it, above
a comment explaining why:

> Scrub the previous (now-expired) access_token value we're overwriting so it
> isn't left un-zeroized on the heap.

That comment is the technique's thesis in the tree's own words. The guard is not
in the type; it is in the author's memory, reproduced at the call site. The
invariant holds today because there is exactly one such call site and its author
remembered. It stops holding the day a second one is added — and the second one
will not be reviewed against a rule that is written down nowhere, because the
wrapper's name promises the scrub is automatic.

There is a second, quieter confirmation in the same file. The function that
introduces the wrapper carries a comment noting that it "derefs to the underlying
map, so the rest of this function reads/mutates it exactly as before." The
forwarding was adopted deliberately, to avoid touching the surrounding code —
which is exactly the trade the technique names: the wrapper was bought for an
invariant and the surface was borrowed to keep the diff small.

## The paired comparison

The product crate does not build in this environment — its bundler build script
fails on a permission-manifest mismatch before the compiler reaches any of this
code — so the arms were run on a faithful reduction of the pattern (the newtype,
`Deref`, `Drop`, `replace`, the same field types) rather than on the tree. Both
arms received **the same probe line**: a plausible future edit that discards a
decrypted value.

```rust
fields.remove("access_token");
```

| Arm | Wrapper shape | Compiler on the identical probe |
| --- | --- | --- |
| **A** | forwarding operator present (the tree as it stands) | **compiles clean** — the token is dropped un-zeroized and nothing objects |
| **B** | forwarding removed; scrubbing operations exposed instead | **`error[E0596]`** — cannot borrow as mutable |

Verdict **better**, and the measurable is the one the technique names: the number
of reachable code paths that can drop a plaintext value without scrubbing it
goes from *every mutator the wrapped type has* to *zero*, and the enforcement
moves from a comment to the type checker. Arm B needs two inherent methods to
restore what the module actually uses, which is the technique's own test — a
wrapper that needs a handful of forwarded operations rather than a dozen is one
whose surface should have been named.

## What this application cannot claim

The product change is **not committed**, and the reason is a limit of the
environment rather than a judgment about the change: with the crate's build
script failing, arm B cannot be shown to compile *in the tree*, and a change to
credential-handling code that has not been compiled where it will live is not
a landing. The instrument that would settle it is a working build of that crate;
until then this is an experiment result and the tree keeps its comment.

Note also what the A/B does **not** show. It does not show a live defect — the
one existing bypass is correctly hand-scrubbed, and the wrapper's `Drop` still
catches the general case. What it shows is that the tree's correctness here is
*unenforced*, and that removing three lines converts a convention back into a
boundary at the cost of two small methods.
