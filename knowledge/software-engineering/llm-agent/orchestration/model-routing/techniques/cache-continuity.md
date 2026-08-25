---
layer: technique
type: technique
subject: model-routing
technique: cache-continuity
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [deciding whether a continuing conversation may change tier mid-stream, a cheaper tier turned out to cost more, justifying a sticky-session rule, a speed or effort toggle flipped mid-conversation and spend jumped, choosing between routing per call and routing per conversation]
---

# Cache continuity

The class→tier table in this subject prices a call as if it arrived alone.
Most calls do not. They arrive as the next turn of a conversation whose
standing prefix — tools, system layers, the accumulated history — is
already sitting in the provider's prompt cache, keyed to the exact prefix
bytes **and to the model that wrote them**. That cache is an asset with a
price, and a routing decision that ignores it can make the cheaper tier the
more expensive call.

## The arithmetic, with a typical vendor's published ratios

Providers price cached prefixes in three multiples of a model's base input
rate: a cache **write** at roughly 1.25× (more for a long-lived entry), a
cache **read** at roughly 0.1×, and uncached input at 1×. Two facts follow
that intuition gets wrong:

- **Staying costs 0.1× on the incumbent.** One more turn on the model that
  holds the cache re-reads the whole prefix at a tenth of its base rate.
- **Switching costs 1.25× on the newcomer — and 1.25× again on the way
  back.** The new model has no entry for this prefix; the first call
  writes it in full. If the conversation then returns to the original
  tier, its entry may have expired, and the write is paid a second time.

So for a conversation carrying *C* cached tokens, staying on a tier priced
*p₁* costs about 0.1·p₁·C, and dipping to a tier priced *p₂* for one turn
costs about 1.25·p₂·C plus 1.25·p₁·C to come home. The cheaper tier wins
that comparison only when **1.25·p₂ < 0.1·p₁ — its base price must be under
an eighth of the incumbent's** — and that is before the return trip, which
alone exceeds the cost of staying. With the price gaps actually on offer
between frontier and mid tiers (three- to five-fold), a mid-conversation
downgrade for an easy question is never the cheap option. It is the
expensive one wearing a cheap label.

The same multiplier applies to anything else in the cache key. A speed
tier toggled mid-conversation, a tool roster that changed, an effort
setting that alters the system layer — each invalidates the prefix from
that level down, and the next call writes it at 1.25×. "Cheaper" or
"faster" per token says nothing about the bill for the turn that flips it
([count-carries-predicate](../../../../_laws.md#count-carries-predicate):
a price is not a price without the cache state it assumes).

## Decision rules

- **Route by class where the class has its own prompt family; never swap
  the model under a shared context.** A background aside or a headless
  micro-call that runs with its *own* small prompt has nothing cached to
  forfeit and should take the cheap tier freely. The same call issued
  *inside* the main conversation's context is a different call, and the
  incumbent model is the cheap answer.
- **Stickiness is a cost rule, and it needs no quality argument.** Pinning
  a conversation to one model is often defended with an unmeasured claim
  about quality loss on switching. The defence that survives review is
  the arithmetic above: within the cache lifetime, the incumbent is the
  cheapest model available for the next turn, by an order of magnitude.
  Record it as that; a cost rule can be re-measured when prices move, a
  quality folklore cannot.
- **Continuity has a horizon: the cache lifetime.** Past it the prefix is
  cold on every model, the incumbent's advantage is gone, and the class
  table applies again without penalty. A conversation resumed after a
  long idle is a first turn for pricing purposes. A router that knows the
  time since the last turn can apply this exactly; one that does not
  should assume warm, because the cost of a wrong "cold" is the 1.25×
  write and the cost of a wrong "warm" is nothing.
- **Treat any mid-conversation change to the cache key as a routing
  event, and price it.** Speed, effort, tools, model: the decision record
  should carry that the prefix was invalidated and why, so a spend
  spike traces to the toggle that caused it rather than to the model.
- **Prefer a small prompt family over a small model.** When a cheap
  answer is wanted mid-conversation, the cheaper move is usually a
  separate one-shot call with a purpose-built prompt of a few hundred
  tokens on the small tier — not the small tier reading the whole
  history. The saving is in what is *sent*, not in who reads it.

## What this does not say

Nothing here argues against routing by class — that stance stands. It
adds one term to the decision: the incumbent's cached prefix, which is
worth 0.9× of its base price on every warm turn and is forfeited in full
by any change to the key. Whether a switch also costs *quality* remains
unmeasured in this corpus, and this technique does not need it to.
