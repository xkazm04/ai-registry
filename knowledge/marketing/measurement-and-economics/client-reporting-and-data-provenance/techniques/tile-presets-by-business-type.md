---
layer: technique
type: technique
subject: client-reporting-and-data-provenance
technique: tile-presets-by-business-type
status: forged
laws: [not-measured-is-not-zero, one-target-one-threshold]
shared_with: []
use_when: [choosing which headline metrics a client report shows, onboarding a workspace and declaring its business type, a report renders tiles that are zero or meaningless for the client's business]
---

# Tile presets by business type

The top row of a client report is a fixed number of tiles - four to six, by
convention - and the choice of which metrics fill them is the most consequential
editorial decision in the report. The reader looks at the tiles first, forms a
verdict, and reads the narrative to confirm it. A tile set that fits the business
makes the month legible in a glance; a tile set that does not renders zeros and
ratios the business has no source for, and the reader's verdict is that nothing
happened.

The technique is to fix the tile set **per business type, declared once**, as a named
preset that carries the metric list, its order, and the good direction of each metric,
with a per-workspace override for the businesses the preset gets wrong.

## The presets

The business types that recur in small and mid-size marketing, and what each one
actually lives on:

- **E-commerce.** Revenue, orders, average order value, the cost-to-revenue ratio (or
  its inverse, return on ad spend), and ad spend. Revenue and orders are up-is-good;
  the cost ratio is down-is-good; spend has no direction of its own and is shown
  without a verdict.
- **Lead generation.** Leads, cost per lead, the share of leads that qualified, and
  spend. There is no revenue in the ad accounts, so no revenue tile and no return on
  ad spend; a preset that shows one has fabricated a zero. Cost per lead is
  down-is-good; qualified share is up-is-good.
- **Local service.** Calls, direction requests, profile views, website visits from
  the business listing, and spend if any. The "conversion" is a phone that rang;
  calls are the headline, not clicks.
- **App.** Installs, cost per install, a retention figure at a fixed day, and spend.
  Retention is a cohort metric and matures; the tile shows the most recent cohort
  that has reached its day, not the current one.

Each preset also names a **primary outcome** - the one tile the narrative leads with -
because a recap that opens with spend for an e-shop or with clicks for a plumber has
buried the story.

## Procedure

1. **Declare the type at workspace creation**, as a required field, not inferred from
   which accounts happen to be linked. A business with an e-commerce store and a lead
   form is asked which it is; the answer is the preset, and the other channel is a
   secondary tile, not a second preset.
2. **Encode the preset as data**: an ordered list of metric keys, each with its good
   direction and its plain-language label. The direction lives here and nowhere
   else, so the delta colour, the verdict word and the narrative all read one table
   ([one target, one threshold](../../../_laws.md#one-target-one-threshold)).
3. **Resolve each tile against the synced rows.** A tile whose metric has no synced
   source for this workspace is dropped from the rendered set and the next preset
   metric moves up. It is not rendered at zero and it is not rendered blank without a
   label ([not measured is not zero](../../../_laws.md#not-measured-is-not-zero));
   if the preset is left with fewer tiles than the row holds, the row is shorter.
4. **Make the delta line opt-in per tile.** A revenue or lead count compares cleanly
   to the prior window; a ratio tile - return on ad spend, click-through rate, cost
   per click - compares only against a baseline the report would have to
   reconstruct, and a preset that pairs the ratio with a change figure has invented
   the comparison. Such a tile shows the single figure and no arrow; the practitioner
   learns this the first time a client asks why click-through "fell 40 %" in a month
   when one platform's impressions arrived and the other's did not.
5. **Allow an override per workspace** - swap, add or remove a tile - and record that
   it was overridden, so a reviewer can tell a preset from a hand-built set.
6. **Version the preset.** A tile added to the e-commerce preset next quarter changes
   every e-commerce client's report; the change is deliberate and dated, and a
   previously generated report keeps the preset it was generated under.

## Decision rules

- When the business type is not declared, refuse to render the top row rather than
  default to e-commerce, because a default preset on an undeclared workspace is the
  universal-tile-set failure by another route.
- When a preset metric has a synced source but no rows in the report period, render
  the tile in the "not for this period" state, not at zero; the distinction is the
  live-means-synced-rows technique's and the preset defers to it.
- When a business has two models - a store and a showroom that takes calls - show
  the declared primary preset and add the secondary's headline as one tile, because
  two full presets in one row is a report about two businesses.
- When a metric's good direction depends on the business (a rising cost per lead is
  bad for a lead-gen client and irrelevant to a local one that runs no ads), the
  direction is declared in the preset that shows it, never in a global metric table
  the preset imports - the same metric key may carry a different verdict in a
  different preset, though in practice it rarely does.
- When a tile is only meaningful on synced data - a click-efficiency pair the
  illustrative dataset never carries - the preset appends it on the live branch only,
  because on the illustrative branch it would render a zero that the disclosure
  label does not excuse.
- When a preset would show a ratio whose denominator the business cannot supply -
  return on ad spend without revenue, cost per install without spend - the ratio is
  not in the preset. A preset is reviewed by asking of each tile "what row does this
  come from for this business type"; a tile with no answer is removed.

## Convention, stated as such

The four business types above and the four-to-six tile budget are practitioner
convention, not documented behaviour of any platform. A workspace that serves a fifth
type - a subscription business, a marketplace seller - adds a preset rather than
forcing the nearest one. The retention day for the app preset is likewise a
convention, chosen for the business, and the tile says which day it is.

## When not to use this

Do not use a preset for an internal dashboard read by the marketer running the
account. The marketer needs every metric and switches between them; the preset is
for the reader who needs four. Applying the client preset to the operator's view
hides what the operator needs to diagnose.

Do not use the preset to decide *whether* a number is real. The preset chooses which
metrics to show and what direction is good; provenance, freshness and the verdict on
a delta are decided by their own techniques and subjects, and a preset that starts
encoding "show this tile only when live" has absorbed a concern it will get wrong.

Do not infer the business type from the tiles that have data. That reasoning runs
backwards: a lead-gen client whose ad account happens to carry a revenue column from
a misconfigured conversion action is not an e-shop, and a preset inferred from the
column would report imaginary revenue.
