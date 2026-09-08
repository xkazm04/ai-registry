---
layer: technique
type: technique
subject: cost-metering
technique: unit-classes-are-open
status: forged
laws: [count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [a provider ships a mode that reports token counters you do not read, an efficiency change whose unit saving exceeds its cost saving, spend dashboards falling faster than the invoice]
---

# Unit classes are open

[usage-ledgers](./usage-ledgers.md) makes raw units direction-split — input
and output, separately — a non-negotiable column, and it is right to. What
that column shape also does, silently, is assert that consumption has exactly
two directions. It does not. Metered inference increasingly reports units in
classes that are neither: navigation or planning units a model spends deciding
what to look at, tool-invocation units for content the model fetched mid-call,
cache-write units distinct from cache-read, units for internal turns the
caller never composed. The direction split is a *convention the row must map
onto*, not an inventory of what the provider counts.

The distinction this technique defends is between an axis that is checked and
an axis that is assumed. Two axes of a spend row are already defended by this
subject, both by the same pattern — a lookup that can miss, and a loud
declared behaviour when it does:

- the **model** axis, where an unrecognized model prices at a conservative
  declared default and increments a staleness counter, never at zero
  ([price-tables](./price-tables.md));
- the **spend-class** axis, where a call fitting no class lands in a counted
  bucket rather than being dropped ([usage-ledgers](./usage-ledgers.md)).

The **unit** axis has neither, and it fails in a way the other two cannot.
An unknown model is a *lookup miss*: something asked a question and got no
answer, so something can count the miss. An unmodeled unit class is not a
miss, because **nothing looks it up.** The extractor reads the keys it was
written to read, the deserializer defaults every field it was not given, and
the row is written, accepted and costed. No counter increments. No gate trips.
The only symptom is that the number is smaller.

## A class either nests or it is residual — and it says which

The rule that makes a two-column row survive an open vocabulary: every class
the provider reports is either **declared as a subset of one direction** or
**captured in a counted residual**. There is no third disposition, and the
absent third disposition — folding an unrecognized class into whichever
direction looks plausible — is the defect this technique exists to prevent,
because it is indistinguishable from correctness on inspection.

- **Nesting is a claim about billing, and it is written down once.** "This
  class is part of what the provider counted as input, priced at the input
  rate" is a statement that can be wrong, and stating it in one place is what
  makes it checkable. Providers disagree with each other about whether their
  own subsets are reported *within* the parent count or *beside* it, so the
  normalization to the row's convention is the extractor's job and the
  convention is the row's, not any provider's. A class reported beside a
  parent and nested as though it were within it double-counts; the mirror
  error under-counts. Both look fine.
- **Residual is for a class whose nesting nobody has established yet**, which
  is the normal state on the day a provider ships a mode. It is a counted
  bucket with the class's own name on it, and — this is the part that makes it
  worth building rather than a TODO — **its presence changes what the row's
  cost means.** A row carrying residual units is a row whose cost is a floor.

## An unpriced row reports a floor, not a default

The subject's existing instinct on the model axis is a conservative declared
default: price the unknown at something deliberately high so it cannot hide.
On the unit axis, prefer the stronger discipline: **store no cost at all, and
propagate the floor.** A row with unmodeled units gets a null cost rather than
a partial one, and every derived number computed over a window containing such
rows — totals, margins, per-feature breakdowns, and the remaining-budget
figure a gate reads — is labelled a floor until the class is priced.

The reason to prefer the floor to the default here is that the two axes fail
at different scales. A mispriced model distorts the rows for that model. A
mispriced unit class distorts every row on every model that reports it, which
on the day a provider ships a mode is a large and *growing* fraction of
traffic. A conservative default invents a number; a floor states a bound and
says what would close it. A ceiling read against a partial unit set
[is not seeing its target](../../../../_laws.md#gate-sees-target), and it is
better for a gate to know it is reading a bound.

The operator's half of the loop is the same shape the model axis already has:
a list of unmodeled classes seen, **ranked by the traffic behind them**, so
the top row is the class worth resolving first. A residual nobody surfaces is
a silent drop with extra steps.

## Efficiency is scored in currency, with two arms

The consequence that reaches beyond accounting, and the one worth the most:
**a change that reduces units is not a change that reduces cost, and the gap
between the two numbers is the measurement.**

Units are not fungible. Directions are priced differently — routinely by
close to an order of magnitude — and the classes above are priced differently
again. So an optimization that *relocates* consumption from an expensive class
to a cheap one, or from a class your ledger reads to one it does not, produces
a unit-denominated saving that is partly or wholly an accounting artifact.
Elimination and relocation are indistinguishable in a unit count. They are
trivially distinguishable in currency.

This is what a unit-denominated efficiency claim conceals, including a
vendor's own: when a supplier reports a large reduction in units and a
materially smaller reduction in cost for the same workload — and states that
the new mode carries no surcharge — the spread between those two figures is
not noise and not rounding. It is the size of the relocation, and it is the
only published description of what the mode actually does. Read the spread.

So the discipline for any spend-reducing change, whether it is a routing
decision, a caching strategy, or a provider mode switched on:

- **Name the currency delta as the measurable, before the change.** A unit
  delta may travel beside it and may not stand in for it.
- **Run both arms on the same inputs through the same price table**, at
  whatever scale is available — one workload replayed twice is enough, and is
  worth more than a large single-arm before/after against a shifting mix.
- **Carry the arm's class set with its number.** A saving measured while one
  arm reports classes the other does not is
  [a count without its predicate](../../../../_laws.md#count-carries-predicate),
  and the honest report of that comparison is that it could not be made yet.
- **A null result is a result.** Units down, cost flat is the single most
  useful sentence this measurement produces, because it names the change as a
  relocation and sends the next question to the price table.

## Smells

- A total-units helper that sums exactly two fields, in a system whose
  providers report more than two.
- An extractor whose provider branch reads a fixed key list, with no branch
  for a key it did not expect and no count of keys it ignored.
- Deserialization that defaults every unit field, so a payload carrying a
  class the reader does not know is accepted as a smaller, well-formed one.
- A defended model axis beside an undefended unit axis: a ranked ledger of
  unpriced models, and nothing that can name an unpriced class.
- An efficiency result quoted in units, or quoted in currency with only one
  arm.
- A cost figure over a window containing unmodeled units, rendered as a
  number rather than as a floor.
