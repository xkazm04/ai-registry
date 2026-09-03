---
layer: technique
type: technique
subject: deterministic-prefix-caching
technique: unknown-callable-is-nondeterministic
status: forged
laws: [unknown-is-not-a-value, absent-guard-is-loud]
shared_with: []
use_when: [a transform chain accepts bare functions or third-party callables, deciding whether a lambda in the chain may sit inside the cached prefix, a cache that is wrong for exactly one pipeline]
---

# Unknown callable is nondeterministic

A transform chain that accepts any callable is convenient and correct: an author drops
in a lambda to squeeze a dimension, a function from a utility module to rename keys, a
class from another library to decode a format the pipeline does not know. The chain
runs them in order and does not care what they are. The cache must care, because the
question it asks of each stage — is your output a pure function of your input? — can
only be answered by a stage that speaks the pipeline's interface. A bare callable does
not, and the rule is that **anything in the chain that does not implement the
pipeline's transform interface ends the cacheable prefix.** The scan treats it exactly
as it treats a stage carrying the randomizable marker: the seam is here, and the head
stops before it.

## Why the tempting alternative is wrong

The alternative is to assume purity. Most bare callables in real chains are pure — a
squeeze, a cast, a key rename — and a mechanism that ended the prefix at every one of
them would cache less than it could for the common case. The argument for assuming
purity is that it is usually right.

It is the wrong argument, because the cost of the two errors is not symmetric. A prefix
that ends early at a pure lambda costs a recompute of the stages after it, every pass —
a measurable slowdown, visible in the epoch time, that an author can fix in one line by
moving the lambda or wrapping it. A prefix that runs through an impure lambda — one
that draws a random number, reads a file that changes, calls a service — produces a
cache whose entries were computed under a randomness the author expected to be live.
Augmentation freezes for that pipeline only. No test in the pipeline library sees it,
because the library's own stages all carry the marker; the failure lives entirely in
the one user's chain and presents as a model that overfits their data. The first error
is loud and cheap; the second is silent and expensive. The rule chooses the loud one.

Underneath that asymmetry is the law: unknown must not render as a definite value. A
callable the scan cannot interrogate is "unknown", and treating it as "pure" launders
the unknown into a confident claim at the exact boundary — the cache — where confidence
misleads most. The scan does not know, so the scan says so, by ending the prefix.

## The opt-in

An author who knows their lambda is pure and wants it inside the prefix has a path,
and the path goes through the interface rather than around the rule. Wrap the callable
in the pipeline's own adapter stage — a thin transform that holds a function and
implements the interface — and the adapter, which does not carry the randomizable
marker, sits inside the head. The author has now declared purity in the one place the
scan reads, and the declaration is theirs: if the function was not pure, the frozen
augmentation is a consequence of a statement they made, not of a default the
mechanism assumed. That is the difference between a guard the author switched off
deliberately and a guard that was never there.

The adapter must not be applied automatically. A chain constructor that wraps every
bare callable in the adapter on the author's behalf has reinstated the assumption of
purity with an extra step, and the guard is absent again. The wrap is a visible edit
to the chain, made by the person who can vouch for the function.

## Procedure

1. In the boundary scan, test each stage for the transform interface before testing
   it for the marker. A stage that fails the interface test is the seam.
2. Log the seam's position and the reason — "randomizable marker" or "not a transform"
   — at dataset construction, at a level the author will see once. A prefix that ends
   at index one because of a lambda at index one is a fact the author needs and cannot
   otherwise discover without reading the scan.
3. Document the adapter beside the rule, with the sentence that makes the contract
   explicit: wrapping a callable is a declaration that it is deterministic.
4. Never extend the interface test with a list of "known pure" third-party classes.
   That list is a second authority on what is deterministic, maintained by people who
   did not write the classes, and it is wrong the first time one of them changes.

## Decision rules

When a chain contains a bare callable and the epoch is slower than expected, the first
question is where the seam landed; move or wrap the callable, do not relax the rule.
When a third-party stage is used routinely, write a first-class adapter for it once —
a stage in the pipeline's interface, marked random if it is — rather than wrapping it
as an anonymous function at every call site. When the pipeline's interface gains a new
capability marker, the bare-callable rule does not change: a callable that cannot be
asked about one capability cannot be asked about any.

## When not to use it

A pipeline that does not accept bare callables at all — every stage must implement the
interface, enforced at construction — has no unknowns for this rule to cover, and the
interface check in the scan is a no-op that costs nothing. Keep it anyway; the
enforcement at construction and the check in the scan are two guards on one property,
and the second is what protects the cache when the first is loosened. A pipeline with
no cache has no prefix to end, and the rule is moot until one is added.
