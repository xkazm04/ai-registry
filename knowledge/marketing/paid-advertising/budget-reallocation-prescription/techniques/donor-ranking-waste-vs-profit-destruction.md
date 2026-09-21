---
layer: technique
type: technique
subject: budget-reallocation-prescription
technique: donor-ranking-waste-vs-profit-destruction
status: forged
laws: [efficiency-is-not-profitability, one-target-one-threshold]
shared_with: []
use_when: [choosing which under-performing campaigns give up budget, deciding whether a supplied margin should change the order, pricing the gain a shift is expected to buy]
---

# Donor ranking: revenue waste versus profit destruction

A donor is a campaign that is enabled, spends above a noise floor, and returns
below target. Which of several donors gives first is decided by how much its spend
is destroying, and the metric for "destroying" depends on what the business has
told you.

## The two metrics

**Without a margin** the only target is a revenue ratio, and the honest metric is
revenue waste:

    waste = cost x (1 - roas / target)

Spend weighted by distance below the target. A campaign exactly at target wastes
nothing; one returning nothing wastes its whole cost. This is revenue-centric by
construction: it cannot know that a three-times return at a twenty percent margin
loses money while the same return at sixty percent prints it.

**With a margin** the donor ranks by profit destruction:

    destruction = cost - grossProfit(cost x roas, margin) = cost x (1 - roas x margin)

Spend weighted by distance below the profit break-even, which is the inverse of the
margin. The break-even and the gross-profit function come from the economics
neighbour and are reused, not re-derived, so the ranking cannot disagree with the
profit table the marketer is looking at.

The two metrics rank the same campaigns differently whenever margins are far from
the revenue target's implied one, and that re-ordering is the point. A margin is
threaded in to change which under-target spender is worst and to price the gain in
profit; it never changes who qualifies as a donor, never invents a move and never
drops one. The donor filter is the same under both metrics.

## Procedure

1. **Filter.** Enabled, cost at or above the noise floor, ratio below target. The
   noise floor is a convention - a small campaign with a bad ratio is noise until
   its spend is worth reading - and is stated as one.
2. **Score** every donor with the metric the supplied inputs allow. A margin is
   used only when it is a positive number no greater than one; a blank, zero or
   corrupt margin falls back to revenue waste rather than producing a ranking that
   is nonsense. Reject, do not coerce.
3. **Sort** descending. A zero-return campaign scores its full cost under either
   metric, so it lands first by construction; see the pause technique for what
   happens to it.
4. **Price each move** with the same inputs. Value gain on a shift is the amount
   times the difference of the two ends' ratios; profit gain, when a margin is
   present, is the gross profit on that value gain - one blended margin over both
   ends, because the prescription is a single-ledger model and per-channel margins
   are the neighbour's. A pause of a zero-return donor recovers its full spend as
   profit.
5. **Echo the margin** on the prescription ("at a 42% margin") so the reader knows
   which of the two rankings they are looking at.

## Decision rules

- When the business has supplied a margin, rank by profit destruction, because a
  revenue ranking can nominate a profitable campaign as the worst donor and leave a
  loss-maker untouched.
- When no margin is supplied, rank by revenue waste and say the ranking is
  efficiency-based, because pretending to a profit verdict without a margin is the
  error `efficiency-is-not-profitability` names.
- When the margin is outside (0, 1], treat it as absent, because a margin typed as
  a whole-number percentage or left blank must not silently flip every ranking.
- When two donors tie on destruction, prefer the one with the larger spend, because
  the same shortfall on more money is the one a reader would act on first.
- Use one target constant for the donor filter, the recipient filter and the
  waste formula, because a ranking built on a different threshold than the table
  produces the two-cell contradiction `one-target-one-threshold` forbids.

## Recipients

Recipients are the mirror: enabled, at or above target, best ratio first. A
recipient is chosen once per prescription. The recipient's *average* ratio is what
the linear projection uses, and it is an upper bound on the next unit's return -
see the projection technique for how that optimism is labelled and calibrated.
Whether a recipient can actually spend more (budget-capped versus auction-capped)
is a pacing read the prescription should request from the neighbour before it
promises the recipient anything.

## When NOT to use

- On sample or illustrative data: a ranking over demonstration rows is a demo, not
  a prescription, and must never reach an approval screen.
- On campaigns whose funnel role is prospecting and whose last-click ratio is
  therefore under-credited: they read as donors under both metrics and are not.
  The triage neighbour owns funnel roles; a ranking should exclude what it flags.
- When the target has a narrower scope than the portfolio being ranked - a paid
  target applied to blended rows, or the reverse - because the shortfall is being
  measured against the wrong line.
- When mixed currencies are present: a waste figure summed across currencies is
  the fabrication `not-measured-is-not-zero` forbids; scope to one.
