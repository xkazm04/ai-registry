---
name: gross-margin-and-cogs-reporting
version: 0.1.0
status: seed
domain: finance_accounting
path: finance_accounting/revenue
---

# Gross margin and cost of goods sold reporting

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Margin moves for two kinds of reason and only one of them is the business. A
support salary that drifted from operating expense into cost of goods sold, freight
coded to the wrong line, an allocation basis quietly rebuilt during the year: each of
these moves margin by points with no economic event behind it, and the report still
foots to the ledger. Intragroup sales compound it, adding revenue and cost together at a
markup so the percentage stays plausible while the absolute numbers describe a
transaction the group had with itself. Leaders then price, discount and forecast against
that.

**Input.** Period revenue by whatever cut the business actually decides on, the costs
charged against it with their account coding and the history of how that coding has
changed, the intragroup sales, purchases and unsold inventory that still holds an
internal markup, the chargebacks and shared costs awaiting allocation, the comparative
period, and the allocation basis in force for each.

**Core action.** Decide which costs are genuinely attributable to delivering what was
sold in the period and which sit outside that line, eliminate the intragroup revenue,
cost and unrealized margin that would otherwise count the group's internal activity as
trade, and then attribute the movement in margin between real economics, mix,
classification and timing. The mistake worth guarding against is explaining a change in
coding as though it were a change in the business.

**Output.** A margin and cost of goods sold view by segment or product line that
reconciles to the ledger, shows eliminations and allocations rather than burying them,
and attributes each material point of movement to a named cause. Where the analysis
found that a change was a reclassification rather than an economic event, the report
says so plainly, and where cost could not be attributed it appears as unallocated
instead of being spread to make the schedule foot.

## Activities

1. Take the period revenue and the costs charged against it with their coding
*(observe)*
2. Judge which costs are attributable to delivering what was sold and which are not
*(decide)*
3. Decide what intragroup revenue, cost and unrealized margin must come out *(decide)*
4. Allocate chargebacks and shared costs to the segments that caused them *(act)*
5. Attribute the movement between economics, mix, classification and timing *(decide)*
6. Publish a margin view that ties to the ledger and shows what was removed and
reallocated *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**What sits inside cost of goods sold is decided on a stated basis, and a change in that
basis is never reported as a change in performance.**

- The boundary between cost of goods sold and operating expense is recorded as a rule
  with its treatment of the arguable cases, so the same question resolves the same way
  next period and by a different preparer.
- When the boundary or the allocation basis changes, the comparative period is restated
  on the new basis, or the movement analysis separates the effect of the change from the
  effect of the business and quantifies both.
- A cost that moved between lines during the period is identified as a reclassification
  in the movement explanation rather than surfacing as an unexplained margin improvement
  in one line and a deterioration in another.

**Reported revenue, cost and margin describe transactions with the outside world.**

- Elimination removes the intragroup margin still sitting in inventory that has not left
  the group, not only the matching revenue and cost lines, since a matched pair with
  unsold stock behind it overstates both margin and assets.
- Intragroup balances that do not agree between the two entities are reported as a
  mismatch to be resolved rather than eliminated at one side's figure, because
  eliminating the smaller number leaves the difference in profit.
- Where a transfer price is set for reasons other than economics, the segment view says
  what the reported margin depends on, so a business unit is not judged on a price the
  group chose for it.

**Every material point of margin movement is attributed to something a reader can act on
or discount.**

- Mix is separated from rate: a margin that fell because the sales blend shifted toward
  a lower margin line reads differently from one that fell because pricing or unit cost
  moved, and the report distinguishes them.
- Cost that cannot be attributed is shown as unallocated rather than spread pro rata to
  clear a total, since a pro rata spread invented to make a schedule foot produces
  segment margins that look precise and are fiction.
- A first period with no comparable, or a segment created mid year, is reported as
  having no basis for a movement figure instead of showing a change against a partial or
  absent prior period.
- Where a movement is caused by an accrual, an estimate or a cutoff rather than by
  activity, it is labelled as timing and the period it is expected to reverse in is
  stated.

## Guidance

Margin moves for two reasons and only one of them is the business. Before explaining a
change, prove that the cost boundary and the allocation basis are the same on both sides
of the comparison; otherwise the story you tell about pricing is a story about coding.
Elimination is not a revenue and cost adjustment alone: margin sitting in inventory that
has not left the group is unearned. Show what was removed and what stayed unallocated
rather than smoothing either away.

## Where this is worth adopting

- A group with entities that sell to each other at a markup, where consolidated results
  have been assembled by adding up local reporting packs and nobody has traced what
  remains in unsold intercompany stock.
- A business heading into a pricing or discounting decision, where the margin by product
  line it is about to price against was built on an allocation basis nobody has
  questioned in two years.
- A company whose reported margin improved several points in a period when the
  operations team is certain nothing changed, and the explanation has to distinguish a
  coding move from a real gain before anyone celebrates it.
- A services or software business whose cost of delivery sits mostly in people, so the
  boundary between cost of goods sold and operating expense is a judgment that is remade
  by whoever codes the payroll journal.
- A month where large chargebacks or rebates landed against a period other than the one
  whose revenue caused them, and the segment margins will be wrong in both periods
  unless the timing is stated.

## Connector types

`finance`, `spreadsheet`, `database`, `bi`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it. No connector-specific knowledge has been written for this
recipe yet.

## Recommended trigger

`event`. This report is a reading of a ledger, and it is only worth what the ledger is
worth at the moment it was read. Produced on a fixed date while accruals, eliminations
and reclassifications are still posting, it delivers margins that change after they have
been circulated, which costs more credibility than the delay would have. The event that
should drive it is the period reaching close, and a material post close adjustment is a
second event that obliges the report to be reissued rather than left standing.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- This adopter's rule for what belongs in cost of goods sold including how it treats the
  arguable cases, because the boundary is a policy choice rather than a fact and a
  recipe that guesses it will produce a defensible number for a different company.
- The group structure and which counterparties are internal, since elimination cannot be
  inferred from transaction data that names entities the recipe has no reason to
  recognise as related.
- The allocation bases in force for shared cost and chargebacks and who owns them, given
  that segment margin is largely a consequence of those bases and changing one silently
  rewrites history.
- Which cut of the business decisions are actually made on, because a margin report by a
  dimension nobody prices or invests against is read once and never again.
- What movement is large enough to be worth explaining here, which depends on the size
  and volatility of this business rather than on any general figure.

## Dependencies

None.
