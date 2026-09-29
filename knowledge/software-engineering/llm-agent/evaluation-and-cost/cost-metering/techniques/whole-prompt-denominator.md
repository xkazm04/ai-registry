---
layer: technique
type: technique
subject: cost-metering
technique: whole-prompt-denominator
status: forged
laws: [count-carries-predicate, one-validation-door]
shared_with: []
use_when: [a bill or a hit ratio is computed from provider usage fields, a provider reports cached tokens and you subtract them from an input field, a cache-hit fraction above one is clamped to one, one service mixes providers whose input field means different things, a contract fixture was generated from the extractor it is meant to check]
---

# The whole-prompt denominator

Every consumer of a usage block does arithmetic on three numbers that providers
do not agree the meaning of: the input count, the tokens read from a prompt
cache, and the tokens written to it. **Pick one shape, name it in the schema,
and convert to it once, at the door where the provider's response enters.**
Anything computed downstream of that door — a bill, a hit ratio, a switch
decision — is then computed on a denominator that is the same for every
provider.

The shape that survives every downstream use: **`input` is the whole prompt the
provider counted, and cached tokens are a subset of it.** A subset can be
subtracted to find the fresh remainder, divided by the whole to find a hit
fraction, and priced at its own rate. An addition cannot be used any of those
ways without knowing which convention produced it.

## The two wire conventions

- **Whole-prompt-plus-detail.** The prompt count already includes the cached
  tokens, and the cached count arrives as a detail beside it. Subtracting the
  detail from the count gives the fresh remainder. This is the shape to
  normalise *to*.
- **Remainder-plus-additions.** The input field is only the tokens after the
  last cache breakpoint. Cache reads and cache writes are reported beside it,
  and the whole prompt is the sum of all three. Passing this input field on as
  though it were the whole is the defect this technique exists to name.

A service that ingests events from clients written against both must state which
shape its schema means and make each client extractor convert. A convention
documented on the receiving type and obeyed by none of the extractors is a
convention in name only; the receiving side cannot repair it, because by then a
whole prompt and a remainder are the same integer.

## What goes wrong, in two places

**A bill.** The price book bills `input − cached` at the input rate and `cached`
at the cached rate. Feed it a remainder-plus-additions block: fresh 24, read
2,048, written 1,500. The subtraction saturates at zero, so the 24 fresh tokens
vanish; the 1,500 written tokens are never seen; and all 2,048 read tokens are
billed at the cheap cached rate. **The error grows with cache success**, so a
customer whose cache works well is billed least accurately, and the shortfall
reads as savings.

**A ratio.** A hit fraction is `read / whole`. Divide by the remainder instead
and the ratio exceeds one whenever more than half the prompt was read from cache.
The dangerous part is what follows: a routine `min(1, …)` clamp turns that
impossible value into "fully cached". On a 100,000-token prompt with 50,000 read
and 50,000 fresh, the true fraction is one half. Priced from that tree's own table, staying on the current model
costs about 2.75 times a switch; the clamped ratio made staying look half as
costly as a switch, and the decision went the wrong way with no error anywhere. **A clamp on a ratio that cannot exceed one is a
smell, not a safeguard** — it is the place a wrong denominator is hidden.

## The rules

1. **Convert at the extractor, once.** The extractor for each provider computes
   `input = fresh + read + written` where the field is a remainder, and leaves it
   alone where the field already includes the cache. No downstream code branches
   on provider to interpret the number.
2. **Derive the fixture from the documentation, not from the extractor.** A
   contract fixture whose expected value was produced by running the extractor
   certifies the extractor's bug. Write the expected `input` by hand from the
   provider's stated total formula, and add a fixture for each convention that
   carries cache reads *and* writes, because a block with only reads hides the
   missing term.
3. **Never clamp a ratio before asserting it.** Assert `0 ≤ ratio ≤ 1` in a test,
   and treat a value above one as evidence that the denominator is wrong, not as
   a value to be saturated.
4. **Write is its own unit class.** The whole-prompt count puts written tokens in
   the input, so a price book with no write rate bills them at the input rate.
   Providers price a write above a plain input token; the residual is an
   under-bill, small and one-directional, and it belongs in the price book as a
   rate ([unit-classes-are-open](./unit-classes-are-open.md),
   [price-tables](./price-tables.md)) and in the doc as a stated limitation until
   then.
5. **Two meters, one convention.** When a product keeps its own meter and mirrors
   events to a service, compute both from the same normalised block. A product
   meter that is correct and a mirror that is not disagree by exactly the cache
   volume, which is the number a reader least expects to differ.

## The check that finds it

Feed one block through every extractor and price the result by hand:
`fresh × input rate + read × cached rate + written × input rate + output × output
rate`. Any extractor whose cost differs from the hand total by more than rounding
has the defect, and the size of the gap is proportional to the cache volume, so a
fixture with a large read count makes it obvious where a small one makes it
invisible.

## Boundaries

- This rule fixes the *count*. Which model to route to, and whether a cache is
  worth keeping warm, are [cache-continuity](../../../orchestration/model-routing/techniques/cache-continuity.md)'s
  decisions; they inherit a correct fraction from here.
- A provider that reports no cache fields at all has an unknown cached count, not
  a zero one; keep it null ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
- Reasoning tokens are a different subset problem: providers count them inside
  output, where they are billed, so they are reported and never added.
