---
layer: application
type: application
subject: recruiting-cost-and-automation-economics
technique: date-every-derived-money-figure
stack: sql
status: forged
---

# The blended cost-per-hire carries its oldest input's date

Channel spend in this repo is a single stored figure per channel:
`channel_spend(channel, amount_czk, updated_at, workspace_id)`, written by
`setChannelSpend` (`app/_lib/db/channels.ts:188`) and read back as
`listChannelSpendDetail` (`:208`), which returns the amount **and** its
`updatedAt` as one record. Every money column downstream is that one number
divided by a count, and the comment on the row type says so
(`app/_lib/db/analytics.ts:188-191`):

> when a human last entered `spendCzk`. The three money columns on this row
> are derived from that ONE stored number, so they carry its date: a six-week-
> old entry must read as six weeks old, not as this period's cost.

That is propagation-by-input at the row level. The interesting case is the
blend.

## Oldest wins, because a blend is only as current as its stalest input

`analytics.ts:613-618` computes the leadership cost-per-hire as total spend
over hires, and then computes its vintage:

```
const spendDates = [...spendByChannel.values()].map((s) => s.updatedAt).filter(Boolean).sort();
const costPerHireAsOf = costPerHireCzk != null && spendDates.length > 0 ? spendDates[0] : null;
```

`spendDates[0]` after an ascending sort is the **oldest**, and the comment
gives the reason in the technique's own terms: "a blend is only as current as
its stalest input, so the OLDEST wins: quoting the newest would let one fresh
row launder a set of fossils." The date is null exactly when the figure is
null, so the pair can never separate.

The date survives to the reader rather than dying in the payload:
`EconomicsBoard.tsx:356-359` passes `costPerHireAsOf` into the compute-cost
panel with the same sentence repeated at the call site. That is the
technique's rule 3 — the date renders next to the figure, not in a tooltip.

## Two refusals the same query makes, and why they belong to dating

**Lifetime numerator, windowed denominator.** `analytics.ts:570-571` guards
both per-channel cost columns with `!cutoffIso` — in any windowed view they
are `null` and the surface renders an em dash. The comment states the size of
the error avoided: spend is a single lifetime figure with no window, so
dividing it by a windowed applicant or hire count inflated cost-per-applicant
and cost-per-hire "by ~(lifetime / window), worst for the most mature
accounts". The blended figure at `:613` takes the same guard. This is the
golden path's rule that a windowed denominator under an unwindowed numerator
is not an approximation but a different quantity — and note which way the
repo resolved it: withhold the figure until spend is recorded per period,
rather than pro-rating the numerator by a guess.

**Every stored figure that divides is reachable.** `analytics.ts:538-549`
seeds a `byChannel` row for any channel with recorded spend even when no
candidates are attributed to it, and the second of its two stated reasons is
the technique's corollary about ownership of inputs:

> The spend editor lives on these rows, so a channel with no row is a stored
> figure that STILL divides into the blended cost-per-hire and STILL cannot be
> corrected — which is the fossil defect surviving the fix that was supposed
> to close it. Every stored spend row must be reachable from the surface that
> spends it.

An input that ages but cannot be refreshed is a permanent staleness source; a
dated figure whose date can never advance is only half the control.

## The currency line the surface will not cross

Two ledgers meet on this board and neither is converted into the other. The
channel spend is in the application's currency; the model-usage ledger prices
in a different one, and `analytics.ts:73-76` records the constraint plainly —
the tile is "labelled in USD, never fake-converted". The section's closing
comment (`EconomicsBoard.tsx:365-376`) states the rule for the whole surface:
"Nothing here converts, sums or compares the [one] ledger against the [other]
spend", and places the link to the billing breakdown *under the compute panel
specifically* so it can never read as a total of both. Where a reader wants
the combined view, they get a navigation exit and a sentence saying which of
the two ledgers that destination actually breaks down — the answer by
navigation rather than arithmetic that the companion technique asks for.

The same comment records the metric that was *declined*, and it is the
cleanest example in the repo of refusing a figure whose denominator cannot be
defended (`EconomicsBoard.tsx:370-372`, restated in
`docs/features/analytics/README.md:166-168`): a per-decision cost column stays
out because the usage ledger's `request_id` is never joined to a pipeline
event, so "an unlabelled per-decision figure would be the LLM slice reading as
the whole cost of the decision". The available number was computable and
would have looked authoritative on a decision row; the missing join meant it
would have been *mislabelled* rather than approximate, and a mislabelled money
figure anchors every conversation that follows it. The board adds a
navigation exit instead — "this adds a navigation exit, not a number".

Two further honesty controls on the same ledger are worth recording because
they are dating's neighbours on the confidence ladder. `computeCostWindow`
(`analytics.ts:874-915`) sums over priced rows only and returns
`unpricedCalls` separately, so that a null-cost row cannot render as zero
spend — "so `$0` ≠ `nothing spent`". And `workspaceCount` (`:669`) exists
because the usage table has no workspace column: the numerator is
account-wide while the denominator is one workspace's hires, so the per-hire
figure is suppressed entirely when more than one workspace shares the ledger.
A scope mismatch and a clock mismatch are the same defect on different axes,
and both are answered here by withholding rather than by qualifying.

## The upstream exclusion every one of these figures inherits

`analytics.ts:13-19` defines `notSim`, a `NULL`-safe predicate applied to
every cohort and event query in the analytics aggregate, so that simulated
demonstration rows — real pipeline rows carrying a marked job title — can
never move a leadership metric: "hired this week", the funnel, ROI, or
cost-per-hire. It is a query-level structural exclusion, not a flag a caller
remembers to pass, and it keeps the simulation's own reads unfiltered by going
through a different path. That is the golden path's requirement exactly:
fabricated evidence for a money claim is excluded at the source, because an
exclusion that is optional anywhere is absent somewhere.

## Deviation

No staleness horizon is defined. The figure is dated and the date reaches the
reader, but nothing declares when a spend entry is too old to divide with, and
nothing degrades or withholds past a threshold. The technique's rules 4 and 5
are unimplemented; a two-year-old entry renders with a two-year-old date and
otherwise full confidence, which relies on the reader doing the arithmetic on
the date themselves.
