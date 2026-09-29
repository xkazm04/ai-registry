---
layer: application
type: application
subject: cost-metering
technique: whole-prompt-denominator
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Two meters, one convention: the product's was right and its mirror was not (TypeScript, web app)

The product computes its own LLM cost in-process and mirrors each call as an event to
the cost service in the other Rust application above. Its own meter is correct:
`src/lib/llm/config.ts:370 "return Math.round(input + read * CACHE_READ_RATE + write * CACHE_WRITE_RATE);"`
takes fresh input plus the two cache classes. The mirror sent the same call to a service
that means something different by `input`, and disagreed with the meter by exactly the
cache volume — the fifth rule of the technique, in a second tree.

## Which adapters are which

Only two of the tree's provider adapters report a fresh-only input count with the cache
classes beside it; every other adapter reports a whole-prompt figure that already
includes cached tokens, and one deliberately omits cached tokens. The fix therefore does
not add the classes to every call: it folds them in only for the two fresh-only adapters
(`src/lib/llm/tracklight.ts:224 "const FRESH_ONLY_INPUT: ReadonlySet<ProviderName> = new Set<ProviderName>(["bedrock", "claude-cli"]);"`),
so a whole-prompt adapter that starts reporting cache fields later is not double counted.
The fold itself
(`src/lib/llm/tracklight.ts:240 "input += Math.trunc(ev.usage.cacheReadTokens ?? 0) + Math.trunc(ev.usage.cacheWriteTokens ?? 0);"`)
sits at the boundary where the event is built, once.

## The paired proof

One call: 24 fresh, 2,048 read, 1,500 written, 310 output, priced by the service's rule
`(input - cached) × in + cached × cached-rate + output × out` at that model's published
rates from the service's own price seed.

| Arm | Emitted usage | Mirrored cost | Product meter | Mirror / meter |
| --- | --- | --- | --- | --- |
| A, before | input 24, cached 2048 | 0.0052644 | 0.010962 | 48.0% |
| B, after | input 3572, cached 2048 | 0.0098364 | 0.010962 | 89.7% |
| B, plus the write premium | the same | 0.0109614 | 0.010962 | equal to rounding |

The remaining 10% is the cache-write premium the service has no rate for; the test
states that residual rather than hiding it. **Floor:** a no-cache call emits
`{"input":1200,"output":340}` before and after, asserted byte for byte; the whole-prompt
adapters keep `{"input":2000,"output":100,"cached_input":1500}`; and a call with a cache
read but no reported input emits only the cached count, never an invented input.
Tests, typecheck and lint on the touched files passed with no new failure (six new test
cases).

## Surprise worth keeping

An existing test had asserted the buggy value: a call with 8,000 cache reads expected an
emitted `input` of 12,000, the fresh count, and the test's expected value was the fixed
code's *predecessor's* output. It now expects 20,000. This is the technique's second rule
in the wild: **a fixture derived from the code it checks certifies the code.**

## Cannot say

The CLI adapter's model aliases resolve to service model ids, and the product's own
price lookup may not price the bare alias, so the two ledgers can still differ for
command-line calls for a reason unrelated to the denominator. Not verified either way.
