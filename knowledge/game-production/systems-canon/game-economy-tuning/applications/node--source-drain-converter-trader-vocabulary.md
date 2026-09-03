---
layer: application
type: application
subject: game-economy-tuning
technique: source-drain-converter-trader-vocabulary
stack: node
status: forged
verified_on: 2026-09-02
verified_against: node@24
---

# A two-kind vocabulary, and everything it cannot say

PoF's economy simulator is a working faucet/sink model with a population of agents, a
Gini computation, alerts and a sensitivity sweep. It is also the clearest available
demonstration of what a two-name vocabulary costs, because every one of its gaps is a
node whose kind the type system cannot express. Citations resolved 2026-09-02 against the
working tree on `master`.

## The type is the whole limitation

`src/types/economy-simulator.ts:5`:

```ts
export type EconomyEventType = 'faucet' | 'sink';
```

and the comment above `EconomyFlow` at `:7` — "A gold source (faucet) or drain (sink) in
the economy". Two kinds, one resource. There is no converter kind, no trader kind, and no
pool as a first-class node; the only stock in the model is a field on the agent. Every
entry in `src/lib/economy/definitions.ts` must therefore be filed as one of two things,
and several of them are neither.

## Reclassifying the default model

Against the five names, the fifteen default entries sort differently than they are typed.

`loot-vendor-sell` (`definitions.ts:87`, `type: 'faucet'`, `baseAmount: 8`,
`frequencyPerHour: 25`) is a **converter**: items are consumed, currency is created. It is
typed as a plain source, which funds a gold faucet from an item pool nobody meters. Its
input leg is not merely unmetered — it does not exist in code. Items accumulate at
`simulation-engine.ts:212` into `agent.inventory`, under a comment at `:202` that names
the intent exactly ("accumulate in inventory for vendor sale tracking"), and no flow ever
reads that map again. The pool is write-only and the converter's output leg fires at a
flat 25 occurrences an hour whether the pool holds ten thousand items or none. This is
the decoupled converter of the technique, live: a monotonically divergent item pool and
an unfunded currency source, both invisible to a net-flow band that passes.

`vendor-gear-buy` (`:147`), `crafting-cost` (`:158`) and `enchant-cost` (`:169`) are
converters in the other direction — currency consumed, an item or an item state produced.
Typed as sinks, their gold leg is correct and their output leg is absent, so the model
can never answer what the crafting economy does with what it makes. By the technique's own
rider the enchant node is the honest exception: an affix reroll produces nothing
countable, so it is a pure drain of its input and one leg is right. The canon says the
same thing in prose at `src/lib/catalog/pipelines/currencies.ts:114` — "Consuming an orb
IS the sink — no separate drain needed" — which is the correct call, arrived at by
reasoning the type system does not support.

`death-penalty` (`:202`, `baseAmount: 0`) is the model's only stock-dependent flow, and it
is a special case branch inside the sink loop at `simulation-engine.ts:180-187`:
`const penalty = Math.round(agent.gold * 0.05)`. A drain whose rate is a fraction of the
pool it drains is a balancing loop, and it is the only one in the model. Nothing declares
it as such; its polarity, gain (0.05 per firing, times a death chance of
`0.15 - level * 0.003`) and latency (one simulated hour) are readable only by opening the
branch.

## Two unnamed nodes the walk finds

The affordability guard at `simulation-engine.ts:196` — `if (agent.gold + goldEarned -
goldSpent >= cost)` — makes every sink's realized throughput depend on the gold pool.
That is a second balancing loop, undeclared, and it biases the net-flow verdict
systematically rather than randomly: poor agents skip drains, so the measured drain total
is always at or below the specified one.

`simulation-engine.ts:234` — `if (agent.gold < 0) agent.gold = 0` — is an unnamed
**source**. It creates currency whenever the arithmetic would go negative, which the
affordability guard mostly prevents and the death penalty at `:183` can bypass, since that
branch adds to `goldSpent` without an affordability check. Small, real, and of exactly the
kind that a report listing "unclassified nodes: 1" would surface and a faucet/sink sum
never will.

## What the canon already gets right

`src/lib/catalog/canon/canon-seed.ts:22` states the converter rule as law before the
model has a kind for it: "Premium and soft currencies never inter-convert freely",
restated at `currencies.ts:107` with the mechanism — "Soft and orb currencies are separate
ledgers". That is the technique's coupling rule, correctly held in prose. The deviation is
that nothing between the law and the simulation can represent the node the law is about,
so the law is enforced by authors remembering it rather than by a shape that cannot be
filled in wrong.

## The transplantable repair

Widen `EconomyEventType` to the five names, make `EconomyFlow` carry the resource on each
leg rather than assuming gold, promote `inventory` from a field on the agent to a declared
pool with a cap, and have the simulation refuse to produce a balance verdict while any
node is unclassified. The first three are mechanical; the fourth is the one that changes
behaviour, because it converts today's confident number into an honest "unaudited" until
the item leg exists.
