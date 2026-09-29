---
layer: application
type: application
subject: cost-metering
technique: whole-prompt-denominator
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@22
---

# A hit fraction divided by the uncached remainder, then clamped (TypeScript, agent runtime)

The stack version is the one the tree's `engines` field pins (`>=22.13.0 <23`); the
commit read was `ae87280a`. The realization is a task-oriented agent runtime whose
router may move a conversation from an expensive model to a cheaper one, and which
keeps the expensive model when the cache it would abandon is worth more than the
saving. The rule is sound. The number it runs on is the defect.

## The convention the tree chose, and the consumer that ignored it

Both response normalizers convert a provider's usage into one canonical block, and
both make `inputTokens` the **uncached remainder**:

- the remainder-plus-additions provider passes its input field straight through
  (`src/model/response/normalizeUsage.ts:8 "const inputTokens = readNumber(raw.input_tokens);"`);
- the whole-prompt provider is *converted to the same shape* by subtracting the cache
  classes (`src/model/response/normalizeUsage.ts:43 "promptTokens - (cacheReadTokens ?? 0) - (cacheWriteTokens ?? 0)"`).

That is a defensible shape — the tree's cost meter adds the three classes back up and
is correct. The router's cache-aware switch reads the same block as though
`inputTokens` were the whole prompt:

`src/router/RouterRuntime.ts:236 "Math.min(1, Math.max(0, observedCacheReadTokens / observedInputTokens))"`

so the "observed hit fraction" is `read / fresh`, which exceeds one whenever more than
half the prompt came from cache, and the clamp then reports it as one. The switch rule
itself (`src/router/RouterRuntime.ts:264 "const shouldSwitch = prefillCost + Number.EPSILON <"`)
is right; it compares the incumbent's cache-discounted cost with the newcomer's full
prefill. It compares them on a fraction that is always too high.

## Executed: the real router, a stubbed judge, a fixed usage block

The router's own `decide` was run with a judge stub that returns "simple" on turn two,
after a first turn on the expensive tier and one observed usage block, on a 100,006-token
history. The tree's default price table gives the expensive model an input rate five
times the cheap one's and a cache-read rate a tenth of its own input rate. Switching
is correct when staying costs more than the cheap model's full prefill, which is when
the true fraction is below about 0.89.

| cache read / fresh (k tokens) | true fraction | tree's fraction | action | correct under the tree's rule |
| --- | --- | --- | --- | --- |
| 20 / 80 | 0.20 | 0.25 | switch | switch |
| 40 / 60 | 0.40 | 0.67 | switch | switch |
| 47 / 53 | 0.47 | 0.89 | switch | switch |
| 48 / 52 | 0.48 | 0.92 | **kept expensive** | switch |
| 50 / 50 | 0.50 | 1.00 (clamped) | **kept expensive** | switch |
| 85 / 15 | 0.85 | 1.00 (clamped) | **kept expensive** | switch |
| 90 / 10 | 0.90 | 1.00 (clamped) | kept expensive | keep |

Cost of staying on the expensive model at 50/50, from the same table: about 0.825
against 0.30 for the cheap model's full prefill — 2.75 times as much — while the tree
computed 0.15 and concluded staying was cheaper. **The band from a true fraction of
about 0.47 to about 0.89 is decided the wrong way, always in the same direction: toward
the expensive model.** The bias is one-sided and largest in exactly the sessions whose
cache works best, so the routing feature's saving shrinks as the caching improves.

## The rule is also simpler than the corpus's

The "correct" column above is correct **under the tree's own rule**, and that rule is
looser than [cache-continuity](../../../orchestration/model-routing/techniques/cache-continuity.md)'s
arithmetic: it prices the newcomer at its plain input rate, with no write premium for the
prefix it must now build, and it has no return-trip term for the day the conversation goes
back. Under the corpus's arithmetic a downgrade for an easy question is expensive in far
more of the band, so the tree's rule over-switches on its own terms and the denominator
defect pushes it the other way. The two errors do not cancel: one is a modelling
simplification, the other is a wrong number, and only the second is a bug in the sense of
disagreeing with the tree's own stated design.

## What the tree does about it

Nothing catches it. The clamp is what makes it silent: an unclamped value of 1.5 at
50/50 would have failed any sanity check. The switch is on by default (an explicit false is the only off-switch,
`src/router/RouterRuntime.ts:225 "if (cacheAware?.enabled === false || !current) {"`), so an ordinary deployment
carries the defect. The tree has no test that feeds a usage block with cache reads
greater than fresh input into the switch.

A second inconsistency sits beside it: the stats collector prices a cache-read token at
zero when no price is configured (`src/router/stats/TokenStatsCollector.ts:288 "(pricing.cacheRead ?? 0)"`)
and the routing table falls back to the *input* price for the same token
(`src/router/utils/modelPricing.ts:98 "pricing.cacheRead ?? pricing.input ?? 0"`).
Two meters, two prices for one token, on the same request.

## The repair, and what this realization cannot do

The repair is one line: divide by `inputTokens + cacheReadTokens + cacheWriteTokens`,
and replace the clamp with an assertion that the result is at most one. It was not
applied to this tree; it is not one of ours. The row is `unapplied` with the return
condition *a fleet project routes across model tiers with a cache-aware switch*.

This realization is arithmetic over a table. It does not say whether the wrong decisions
cost real money: that depends on how often a session sits in the band and on the tree's
own price table being right, which was not checked. It also cannot say whether the
provider's cache was actually still warm when the switch was priced.
