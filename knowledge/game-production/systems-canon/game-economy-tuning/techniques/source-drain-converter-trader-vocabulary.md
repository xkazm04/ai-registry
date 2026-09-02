---
layer: technique
type: technique
subject: game-economy-tuning
technique: source-drain-converter-trader-vocabulary
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis, one-authority-per-quantity]
shared_with: []
use_when: [building the node map of an economy before tuning it, an economy inflates and no faucet accounts for it, giving a generator or a checker a vocabulary it can reason about]
---

# Naming every node: source, drain, converter, trader, pool

The named concern: **whether every place a resource can change hands in this game has
been given a functional name.** Not a description of what it means in fiction — a name
for what it does to the quantity of resource in the world. Five names cover it, and the
discipline is that no sixth is invented and none of the five is skipped.

A **source** creates units of a resource from nothing. A **drain** destroys units,
returning them to nothing. A **converter** consumes units of one resource and produces
units of another at a stated rate — it is a drain and a source fused into one node, and
the total quantity of resource in the world changes when it fires. A **trader**
exchanges units between two holders at an agreed rate — nothing is created and nothing
is destroyed, only relocated. A **pool** holds units and does nothing else; it is the
stock that the four flow kinds move in and out of, and it is where accumulation
actually lives.

The load-bearing rule follows directly: **a quantity in the economy that cannot be named
as one of the five has not been audited, and an automated check cannot reason about it.**
An unclassified node reports as *unclassified*, and an economy containing one reports as
*unaudited* — never as balanced. This is the same discipline the unestimated frequency
gets, for the same reason: a hole with a plausible face passes.

## Why two names are not enough

The naive vocabulary has two words, faucet and sink, and it is the reason a great many
economies cannot explain their own inflation. Two words force every transformation and
every exchange to be filed as one or the other, and both filings are wrong in a way that
hides magnitude.

A crafting bench that consumes ore and produces bars is not a drain. It is a converter,
and filing it as a drain of ore silently deletes the bars it makes — the bar economy
then appears to have a source nobody authored. A vendor sale that turns loot into
currency is not a source of currency; it is a converter whose input leg is the item
economy, and filing it as a plain source funds a currency faucet from a pool nobody is
metering. A player-to-player exchange is not a drain of anything; it is a trader, and
filing it as a drain reports units as destroyed that are still in the world, which makes
an inflating economy look balanced.

The distinction between a converter and a trader is the one most often collapsed and the
most expensive to collapse. **A converter changes the total; a trader does not.** If two
holders end a transaction with the same combined quantity they started with, it is a
trader no matter how much fiction surrounds it, and it belongs in no faucet-versus-drain
sum. If the world holds more or fewer units afterwards, it is a converter, and both its
legs have to appear in the two economies it touches — the input side as a drain there,
the output side as a source here. A converter recorded on only one side is an unfunded
faucet, and an unfunded faucet is inflation with no author.

## Procedure

1. **List every mechanism that touches a resource**, from the implementation and the
   content, not from the design document. Reward payouts, purchases, fees, crafting
   steps, salvage, decay, caps, refunds, respec, death penalties, conversions between
   currency classes, and every exchange between actors.
2. **Assign each one exactly one of the five names**, and where a mechanism resists,
   split it rather than widen a name. A vendor that both buys and sells is two nodes.
   A crafting step that consumes a currency and an item and produces an item is one
   converter with two input legs; write both.
3. **Write down what each node touches and at what rate**, with the unit and the basis
   attached: which resource, in which direction, how many units per occurrence, and how
   often per hour of play. A rate without its resource named is not a rate.
4. **Name every pool and state its cap.** A cap is not decoration: a pool at its cap
   converts every further inflow into destruction, which is an implicit drain with real
   throughput and no entry. Either give the overflow an entry or state that the pool is
   uncapped and accept what that means.
5. **Close the books per resource.** For each resource, the sources plus the converter
   output legs pointing at it must be balanced against the drains plus the converter
   input legs consuming it. Traders appear in neither sum and are listed separately, so
   that a reader can see they were considered and excluded on purpose.
6. **Report the unclassified.** A node nobody could name is the finding. It is more
   valuable than any number computed afterwards, because every number afterwards was
   computed without it.

## What a generator and a checker each need

A generator authoring an economy must be told the node kind before it is told a number,
because the kind determines which fields are even meaningful: a trader has an exchange
rate and no throughput contribution, a converter has two rates and two resources, a pool
has a cap and no rate at all. Handing a generator one flat shape with a magnitude field
produces plausible entries whose kind is a guess, and the guess is invisible afterwards.

A checker needs the same thing for a harder reason: **it cannot infer a node's kind from
its numbers.** A converter and a source look identical from the receiving side. Unless
the kind is declared, every automated balance verdict is computed over a set the checker
believes is complete and is not — which is a verdict that is confidently wrong rather
than honestly absent. Declare the kind as a required field of the node, in the node's own
shape, so an unclassified node is visible at authoring time.

One authority per resource follows from the same place. Each resource has exactly one
node map that answers "where does this come from and go", and a second table maintained
beside it for a different consumer is a second answer to the same question. When the two
disagree — and they will — nothing in the system can tell which one is wrong.

## Decision rules

- **When a node cannot be named, do not name it a drain to move on.** File it as
  unclassified and let the report carry it. A wrong classification is worse than a
  missing one because it is arithmetically absorbed.
- **When a mechanism moves units between holders, it is a trader, and it never enters a
  balance sum.** The most common enumeration error in this craft is counting a transfer
  as a drain; naming the kind is what makes the error impossible rather than merely
  discouraged.
- **When a converter's two legs live in different economies, both economies are now
  coupled and neither can be balanced alone.** Either the conversion is rate-limited and
  its throughput specified like any other entry, or the two resources are balanced as one
  economy.
- **When a pool has a cap, the overflow is a drain — give it an entry.** An uncapped pool
  with net-positive inflow is a runaway store, and the report should say so before anyone
  tunes a coefficient at it.
- **When a transformation's output is a state change rather than countable units, it is a
  pure drain of its input.** An operation that consumes a unit to reroll or upgrade an
  existing object creates nothing enumerable; recording it as a converter invents an
  output resource and double-counts. The test is whether the thing produced can be held,
  counted and spent — if it cannot, the node has one leg.
- **When a source's output has no matching input anywhere, ask whether it is really a
  converter whose input leg was never written.** Salvage, vendor sales and quest turn-ins
  are the usual suspects, and each of them is funded by something the model is not
  watching.
- **When the same node is described twice for two consumers, delete one.** Two node maps
  for one resource is two answers to the same question, and the disagreement will be
  discovered by a player, not by the team.

## When not to use this

- **On an economy with one resource, one source and one drain.** The vocabulary's payoff
  is disambiguation, and there is nothing to disambiguate; naming two nodes with five
  words is ceremony.
- **On resources that are not conserved.** Experience and reputation accumulate
  monotonically and have no meaningful drains or traders; they are progression curves and
  the shape tests own them.
- **As a balance verdict.** A complete, correctly-named node map says the economy has
  been audited, not that it is healthy. It is what makes a balance verdict possible; it
  is not one.
