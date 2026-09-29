---
layer: application
type: application
subject: recruiting-cost-and-automation-economics
technique: date-every-derived-money-figure
stack: react
status: forged
verified_on: 2026-09-29
verified_against: react@19
---

# One blended figure, two panels, one date

The SQL application of this technique shows the query doing its part: the blended
cost per hire carries the date of its oldest spend entry, and the two are null
together. This is the other half, the surface, and it finds the date reaching the
reader in one place and not in another.

`app/features/insights/analytics/sections/EconomicsBoard.tsx` renders two panels one
above the other that both print the same field, `data.costPerHireCzk`:

- `AnalyticsComputeCostPanel` receives `costPerHireAsOf={data.costPerHireAsOf ?? null}`
  (`EconomicsBoard.tsx:361`) and prints it under the figure only when both are
  present (`AnalyticsComputeCostPanel.tsx:121-124`, "spendAsOfOldest"), with the
  comment that the manual leg "says when it was last entered; 'oldest' because a
  blend is only as current as its stalest input".
- `AnalyticsAutomationPanel` receives `costPerHireCzk` and not the date
  (`EconomicsBoard.tsx:345-350`, the `AutomationPanel` props). Its leadership readout prints the same number as a
  headline tile, "Cost per hire", with the subtitle "all-time"
  (`AnalyticsAutomationPanel.tsx:149-151`, `messages/en.json` `insights.roi.rdCostPerHire`,
  `rdAllTime`). Nothing on the tile says how old the entry it divides is, and the panel's CSV export
writes the bare figure too (`:108`).

The tile sits in the panel titled "ROI: what the automation saved", whose reader is
the leadership audience the technique names. The technique's rule is that the date
renders next to the figure, wherever the figure renders. The query-side fix made
that possible and the compute panel realises it; the automation panel never received
the date. A derived figure passed as a bare number through a component
boundary sheds its date, because a prop that carries only the value has no place to
put one. The remedy the technique implies is to pass the pair as one object, so the
date cannot be dropped by omission.

## Adjacent: hours and currency in one headline

The same panel opens with "about {hours} recruiter-hours, about {czk} CZK"
(`insights.roi.headline`), and the basis line states the rate. The golden path's
position is that hours are shown as hours because converting them to currency
asserts that the time was reallocated, and that assertion needs an owner. Here the
rate has an owner (the panel exposes it as an editable input) and the reallocation
does not, so the currency figure carries a claim nobody has signed. The 2026-09-29
simulation on the per-action application, which finds gross and net nearly equal at
the prices the tree records, is not a defence of the conversion: it addresses the
cost side, not whether the hours became money.

## Deviation

Two, both left standing: the undated tile above, and the absence of the pair
type that would make a dropped date a compile error. The technique's rule 3 is met
in one panel and unmet in the other for the same figure.
