---
layer: application
type: application
subject: llm-call-telemetry-model
technique: token-usage-quadruple
stack: node
status: forged
verified_on: 2026-09-04
verified_against: node@22.15
proof: structural-only
---

# One userspace counts the cache-write bucket, the other drops it, and the parity test does not exist

The version witness is `mise.toml`, pinning `nodejs = "22.15.0"` and
`rust = "1.95"` — the two runtimes below are both pinned in that one file. Read
at commit `7801005`.

An agent harness computes cost in **two** userspaces, because the model call can
be made from either a Rust executor or a TypeScript one. Its design document
states the rule this technique also states, and states it with the right reason:
the two cache buckets are kept separately *because reads and writes bill at
different rates*, so a collapsed number cannot be re-derived.

The Rust path implements it. The TypeScript path — which is the default harness —
does not: its provider-usage adapter reads the cache-**read** token field and
never reads the cache-**creation** field. The number is discarded at the
boundary, before any pricing runs. Downstream, the cost function's cache-creation
parameter is dead on that path, and the persisted usage record carries no
time-to-first-token or duration either, both of which the design document lists
and the Rust path populates.

The consequence is the one the technique predicts in its own words — *folding
writes into input under-prices exactly the traffic engineered for reuse* — with
the aggravating detail that here the writes are not folded into input, they are
dropped to zero. Cache-write tokens bill at a premium over base input precisely
because they are the investment half of the reuse trade, so the traffic a team
deliberately restructured to save money is the traffic whose cost is most
understated. And because the field is discarded at ingest rather than at pricing,
it is not recoverable later: re-pricing the stored record cannot recover a
quantity that was never written down, which defeats the store's own stated design
property that cost is re-derivable from tokens.

## The claimed test that would have caught it

This is the part worth recording beyond the defect. The design document's testing
section specifies the exact coverage that fails here: assert the persisted usage
event carries the expected cost *"through a Rust executor and through the
TypeScript path, so coverage is pinned on both userspaces."*

Searching every TypeScript test file in the tree for an assertion on the
persisted cost field returns **zero**. The Rust suite asserts it in three places
plus a serialization round-trip. The TypeScript side has only a pure-math test
over a fixture that never touches a persisted event — and none of its cases
passes a cache-creation value, so the one formula term whose absence causes this
defect is untested in the language where it is missing.

So the parity the document claims is pinned is pinned on one side. A reader of
that document has been told the risk is covered.

## The rule this sharpens

The technique already requires the four counters to be distinct fields. This
instance argues for a second obligation wherever a telemetry schema has **more
than one emitter**: the schema is not the contract, the *emitters* are, and a
field is only as real as the least complete one. A shared type carrying the
right shape is not enforcement — the Rust type here declares the cache-creation
field and the TypeScript emitter simply never populates it, which compiles
cleanly and is invisible at every layer above.

The mechanical check is a per-emitter conformance test over the same recorded
provider response, asserting the same persisted record — not a unit test of the
pricing function, which is where both userspaces here do have coverage and where
the defect is not. Where a design document claims cross-emitter parity, that
claim is itself the thing to verify first: it is cheap to check and it is the
sentence a reviewer will otherwise trust.
