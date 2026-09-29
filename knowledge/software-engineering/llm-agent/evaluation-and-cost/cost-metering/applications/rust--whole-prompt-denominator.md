---
layer: application
type: application
subject: cost-metering
technique: whole-prompt-denominator
stack: rust
status: forged
verified_on: 2026-09-29
verified_against: rust@1.96
applied: code
ab_verdict: better
proof: ab-paired
---

# A convention stated on the receiver and obeyed by no extractor (Rust, LLM-cost service)

The realization is an LLM observability service with three thin client libraries
(Python, TypeScript, Rust) that extract token usage from a provider response and send an
event, and a price book that turns the event into a cost. The tree is a strong example
of the technique's first rule failing in a specific and instructive way: **the
convention is written down correctly, on the receiving type, and every sender ignores
it.**

## The convention, and the price book that relies on it

`crates/core/src/event.rs:155 "/// **The convention, stated once:** `input` is the WHOLE prompt the provider counted, and"`
goes on to say cached tokens are a subset, never an addition, and that converting is
"each extractor's job". The price book relies on exactly that:
`crates/core/src/pricing.rs:325 "let billable_input = usage.input.saturating_sub(cached);"`.
It also selects the prompt-length pricing tier from the same field
(`crates/core/src/pricing.rs:323 "let p = self.resolve(provider, model, usage.input, mode)?;"`),
so a remainder passed as `input` picked the wrong tier for a large cached prompt as well
as the wrong bill.

## What the extractors did

For the remainder-plus-additions provider, all three extractors passed the provider's
input field as `input` and its cache-read count as `cached_input`. With a usage block of
24 fresh, 2,048 read and 1,500 written tokens, the price book computed `24 - 2048`,
saturated it to zero, dropped the 24 fresh tokens, never saw the 1,500 written ones, and
billed all 2,048 read tokens at the cached rate. The contract fixture pinned it: its
expected `input_tokens` was 24, produced by running the extractor. The client
documentation's table stated the same convention as the contract.

The correct sum already existed in the same repository, in the engine that wraps a
command-line tool's output
(`crates/engine/src/invocation/envelope.rs:30 "f("input_tokens") + f("cache_read_input_tokens") + f("cache_creation_input_tokens")"`),
which is the technique's second observation: the tree knew the formula in one place and
had not asked the extractors to share it.

## The paired proof

A scratch harness fed every fixture through all three extractors and then the price
book, with one fixed set of rates. Hand total for the cache fixture: `(24 + 1500) × in +
2048 × cached + 310 × out`.

| Arm | Extractor | input | cached_input | cost | hand total | delta |
| --- | --- | --- | --- | --- | --- | --- |
| A, before | Python, TypeScript, Rust | 24 | 2048 | 0.0052644 | 0.0098364 | -46.5% |
| B, after | Python, TypeScript, Rust | 3572 | 2048 | 0.0098364 | 0.0098364 | 0% |

**Floor:** diffing the two arms' full outputs showed only the three cache-fixture rows
changed. Every OpenAI-shaped and Gemini-shaped row was identical across all extractors,
including costs, and the no-cache Anthropic fixture (cached stays null, not zero) was
unchanged. The Python (43 tests) and TypeScript (43) suites and the Rust client crates
passed before and after, and the price-book module's 13 tests passed.

The fix is one sum per extractor
(`clients/rust/src/extract.rs:58 "input_tokens: u["input_tokens"].as_u64().unwrap_or(0) + read.unwrap_or(0) + write,"`),
the fixture's expectation moved to 3,572 with its explanation rewritten
(`clients/contract/fixtures/extractors.json:80 "input_tokens": 3572`), and the client
README now states the whole-prompt convention. The change is committed, not pushed.

## What it does not fix, and did not check

- **Cache writes still under-bill.** With no write rate in the price book, written
  tokens bill at the input rate. The fixture and the README say so; the price book gaining
  a write rate ([unit-classes-are-open](../techniques/unit-classes-are-open.md)) is the
  remaining step.
- **Recorded events keep their old `input`.** Cost is computed per event, so history is
  not recomputed retroactively.
- **The OTLP ingest path was not audited.** It maps the two semantic-convention usage
  attributes straight through, and an instrumentation that sends the provider's remainder
  shape through that path would hit the same undercount.
- The seed price book did not contain the fixture's model, so the proof used a book with
  the same rates; on the seed's own newer model the delta closed the same way.
