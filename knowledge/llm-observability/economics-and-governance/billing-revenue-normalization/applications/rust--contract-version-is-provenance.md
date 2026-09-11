---
layer: application
type: application
subject: billing-revenue-normalization
technique: contract-version-is-provenance
stack: rust
verified_on: 2026-09-11
verified_against: rust@1.96.1
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# The asymmetry in LightTrack's revenue row (Rust)

LightTrack normalizes billing-provider webhooks into `RevenueEvent`
(`crates/core/src/revenue.rs`), the record this subject's whole pipeline exists
to produce. It is a careful implementation: it is the realization behind this
subject's FX-book and signature applications, and it keeps the provider's own
minor-unit figure precisely so a row is repriceable rather than re-ingestible.

The structural fact is what the record carries, and it was not designed to prove
anything:

- `fx_book_version: Option<String>` (`revenue.rs:81`) — the version of the rate
  book that produced the conversion, so an auditor can check out the book that
  priced any row.
- There is **no field for the provider's contract version.** A tree-wide search
  for the delivery header and the payload's own version field returns nothing in
  `crates/`.

That is the technique's fourth decision rule standing in real code. Provenance
discipline was applied thoroughly and it stopped exactly at the boundary of what
the operator controls. The rate book is versioned because this repository
maintains it; the field semantics are versioned by the provider, on a clock this
repository does not set, and they went unrecorded. Nobody decided that — it fell
out of where the authorship boundary sits, which is why it is better evidence
for the technique than a tree built to demonstrate it.

## The consumer cannot fix its own exposure

`crates/billing/src/polar.rs` is a pure webhook **consumer**. It verifies the
signature and normalizes the payload; it makes no API calls, so it has no
request to pin. The contract its parser is exposed to is selected when the
webhook endpoint is registered — and that registration happens in *different
repositories entirely*, by the applications that own the provider account.

This is the technique's ownership split at its most extreme: the correctness of
this crate's field mapping rests on a value chosen by code in another tree, by
another team's deploy, and nothing in either tree records the dependency. The
crate's own documentation is unusually thorough about the provider's wire
behaviour — it reconstructs the base64 key handling, the two-webhook refund
fan-out, the `order.paid`-after-capture ordering — and all of that is
contract-version-dependent knowledge written as if the contract were fixed.

## Why the verdict is unmeasurable rather than better

The technique's downstream clause says a consumer that cannot set the version
still records it. That is implementable here and would be a small change: one
optional field on `RevenueEvent` and one header read. It was not applied in this
run, and the reason is the honest one — **there is no instrument in this tree
that would show a difference.** The crate's tests assert normalization against
fixtures with no version in them, and no gate reads a field nobody writes. Adding
the field would make the diff green and would have measured nothing.

The instrument that would make it measurable: a normalization test parameterized
over two fixtures of the same event type captured under different contracts,
asserting that the mapped record distinguishes them. That fixture pair does not
exist and cannot be fabricated honestly — it needs two real deliveries from
either side of a rotation.

**Return condition:** when a rotation produces a second-contract delivery in any
fleet deployment, capture it beside the existing fixture and the arm becomes
runnable. The recording change upstream in KP is what will make that capture
possible, since it is now the only place in the fleet that logs the observed
contract version.

## What this realization cannot do

Nothing here can pin, and nothing here can refuse. A payload arriving under a
contract this crate was not written for parses defensively and produces a
plausible record — the mapping reads fields optionally throughout, which is
correct for robustness and is exactly what makes a contract change silent. The
defensive parse and the missing version field compound: the first guarantees no
error, the second guarantees no evidence.
