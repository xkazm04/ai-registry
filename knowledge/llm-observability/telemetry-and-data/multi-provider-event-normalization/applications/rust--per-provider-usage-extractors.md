---
layer: application
type: application
subject: multi-provider-event-normalization
technique: per-provider-usage-extractors
stack: rust
status: forged
verified_on: 2026-09-20
verified_against: rust@1.96
---

# Rust: LightTrack's extractor chain, and the one convention it inverts

LightTrack (read at commit `a3cdcf7`, 2026-09-20; toolchain pinned to
1.96.1 by `rust-toolchain.toml`) realizes the extractor discipline three
times — once per client language — from a single shared fixture file. The
Rust chain is the one where the whole path is visible in one language:
extractor, wire type, price book. It gets four of the technique's five
construction rules right, and inverts the fifth in a way that is *pinned by
a passing test*.

## One extractor per family, and the duals are the documentation

`clients/rust/src/extract.rs` is pure functions over `serde_json::Value`,
one per provider family, each returning the identical `Extracted` tuple
(`extract.rs:13-18`: `model`, `input_tokens`, `output_tokens`,
`cached_input_tokens`). The module header states the failure mode the split
prevents: extraction "was the most-triplicated code in the three SDKs and
the place drift was least visible: it fails by recording `model =
"unknown"` and zero tokens, which looks like a quiet call rather than a
broken reader" (`extract.rs:1-7`).

Each extractor's fallback chain carries knowledge no shape-sniffing walker
could hold, and each chain has a scar attached:

- **`extract_openai` (`extract.rs:25-45`)** tries `prompt_tokens` then
  `input_tokens`, `completion_tokens` then `output_tokens`, and — the
  interesting one — `prompt_tokens_details.cached_tokens` *then*
  `input_tokens_details.cached_tokens`. The comment records why the second
  location exists: the newer API "renamed the pair AND moved the cache
  counter… Reading only the older place reported every cached call as
  uncached, which the price book then charged at full input rate"
  (`extract.rs:37-39`). All three SDKs had handled the rename and none had
  handled the move.
- **`extract_gemini` (`extract.rs:68+`)** reads both camelCase and
  snake_case spellings of the same fields, because one SDK's REST shape and
  another's object-to-dict conversion disagree — reading only camelCase
  "recorded `unknown` and zeroes… a silent hole in the usage ledger, not an
  error anyone would see". It also sums the answer and thinking counters
  into output, since a thinking model's tokens "are billed at the output
  rate, so reading the answer alone priced a call that thought for
  thousands of tokens as a short one".

`cached_input_tokens` is `Option<u64>` and the type comment says why:
"`cached` is `None` for *unknown*, which is not the same as `0`"
(`extract.rs:11`) — nullable-never-zero, in the tuple.

## The cross-language fixture is the real contract

`clients/contract/fixtures/extractors.json` holds captured provider
responses with the four expected values, and "each SDK's extractor must
return the same four values from the same bytes". This is the right shape:
the per-language triplication is real, so the invariant is asserted on
bytes rather than on three independent readings of three sets of docs.

## The convention, stated in the wire type

`TokenUsage` (`crates/core/src/event.rs:153-172`) now states the target
convention in one place, and names both directions of provider divergence
by provider. Its rule: `input` is the whole prompt the provider counted and
`cached_input` is the part of it served from cache — "a subset, never an
addition" — because the price book bills `input − cached_input` at the
input rate and `cached_input` at the cached rate, "so a sender that reports
cached tokens *beside* rather than *within* `input` under-bills every cache
hit". The doc closes by assigning the conversion: "it is each extractor's
job to convert to this shape before the event is sent". Until recently this
comment read only "provider-dependent"; writing the convention down is what
made the next paragraph checkable.

`PriceBook::cost_usd_mode` (`crates/core/src/pricing.rs:316-334`) is the
consumer that gives the convention teeth:
`let billable_input = usage.input.saturating_sub(cached);` then
`billable_input × input_rate + cached × cached_rate`, with the input rate
standing in when no cached rate is configured.

## Where it breaks: the exclusive-reporter extractors were never converted

The three Anthropic extractors pass the provider's exclusive figure straight
into the inclusive slot:

```rust
// clients/rust/src/extract.rs:46-56
pub fn extract_anthropic(resp: &Value) -> Extracted {
    let u = &resp["usage"];
    Extracted {
        model: s(&resp["model"]),
        input_tokens: u["input_tokens"].as_u64().unwrap_or(0),
        output_tokens: u["output_tokens"].as_u64().unwrap_or(0),
        // `cache_read_input_tokens` only. `cache_creation_input_tokens` is a different, billed thing.
        cached_input_tokens: u["cache_read_input_tokens"].as_u64(),
    }
}
```

`clients/python/lighttrack/client.py:87-92` and
`clients/typescript/src/index.ts:125-129` do the same thing. No addition,
in any of the three — and the sibling application
`process--per-provider-usage-extractors.md` states the required conversion
for this provider explicitly, from the semantic conventions.

The shared fixture does not catch it; it **pins** it.
`extractors.json:63-81` (`anthropic-messages-with-cache`) expects
`input_tokens: 24` beside `cached_input_tokens: 2048` from a response that
also carries `cache_creation_input_tokens: 1500`. Read through
`cost_usd_mode`, `24.saturating_sub(2048)` is `0`: the whole prompt prices
at the cached rate, the 24 genuinely uncached tokens are billed as cache
hits, and the 1500 premium-billed cache-creation tokens are not represented
in `TokenUsage` at all — `Extracted` has no field for them. Three separate
under-bills on one captured response, and every test is green, because the
fixture's `expect` block encodes the unconverted values as correct.

The invariant that would have caught it is one comparison on the fixture
itself: `cached_input_tokens (2048) > input_tokens (24)` is impossible
under the declared convention. Nothing asserts it —
`crates/api/src/events_validate.rs` validates the ingest payload and does
not compare the two counts, and `TokenUsage::total`
(`event.rs:175-179`) is `input + output`, so even the total carries no
check. This is the technique's boundary assertion, absent at the one
boundary in the tree where the record crosses from sender to store.

## Reading the gap

Three details make this a better lesson than a bug report. The convention
was documented *after* the extractors were written, so the extractors were
never wrong against a stated rule — they were written against no rule, which
is the state the technique exists to end. The contract fixture is a genuine
strength (three languages, one set of bytes) that became a lock, because an
expectation file records what the code does unless somebody derives it from
a stated invariant. And the direction of the error is the quiet one: the
under-bill lands hardest on the highest-cache-ratio traffic, which is the
traffic a cost tool is most expected to get right and the least likely to
generate a complaint.
