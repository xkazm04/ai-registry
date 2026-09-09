---
layer: technique
type: technique
subject: honest-proof-and-illustrative-data
technique: proof-from-live-computation
status: forged
laws: [never-invent-proof, not-measured-is-not-zero]
shared_with: []
use_when: [adding a quantified proof band to a landing page, choosing where a marketing figure comes from, reviewing a page whose numbers were typed from a screenshot]
---

# Proof from live computation

A quantified figure on a marketing surface is produced by the product's own
computation, at render time, on a dataset the product also serves - never typed
into copy from a screenshot, a spreadsheet or a memory of last quarter's build.
The proof band calls the same snapshot builder the dashboard calls, on the same
fixture, over the same window, and formats through the same formatters. What a
visitor sees on the homepage and what they see thirty seconds later in the demo
are the same numbers because they are the same call.

The reason is not tidiness. A typed figure is a claim about a past state of the
product, and nothing tells the author when it stops being true. A computed
figure is a claim about the current state, and it stops being true only when the
product does - at which point it changes with it.

## Procedure

1. **Locate the computation the product already trusts.** The dashboard's
   snapshot builder, the report's metrics builder, the module's grounding
   builder. The marketing surface imports it; it does not reimplement "what the
   product knows about a business" on the marketing side, because a
   reimplementation drifts and its drift is invisible.
2. **Pin the fixture and the instant.** The demo dataset is a fixed, seeded
   series; a catalogue read that defaults to the current clock is pinned to a
   fixed instant, because a prerendered marketing tree with a live clock drifts
   from the demo and can fail at build. The pin is a stated property of the
   fixture, not a hidden default.
3. **Choose the window in the copy, not in the code.** "Last 90 days on the demo
   account" is a claim the headline makes; the builder is called with that window
   and the headline reads it, so the two cannot disagree.
4. **Format through the product's formatters.** Currency, multiple, signed
   percent and target percent come from the same locale-aware chokepoint the app
   uses, so the band is localized the way the product is and rounds the way the
   product rounds.
5. **Show outcome shapes, not vanity shapes.** Four tiles that a buyer of this
   product would look for in the product - a spend-efficiency ratio, its inverse
   against the stated target, revenue attributed, revenue delta against the prior
   period. A figure the product does not itself surface has no business on the
   band.
6. **Label per the badge technique.** Computation makes the number current; it
   does not make it earned. The demo label is mandatory and sits beside it.

## Consistency of the fictional dataset

A computed proof band is only as convincing as the dataset under it, and a
fictional dataset must be internally consistent or the product's arithmetic
looks broken. Generate it from one daily time series with a seeded generator, so
it is reproducible, and derive every headline from the identities the product
itself uses: conversion value is conversions times order value; cost is revenue
times the cost-to-revenue ratio; conversions are visits times conversion rate.
Channel breakdowns are shares projected onto the chosen period, so the channel
table always sums to the headline. A dataset whose tiles and tables disagree is
the one demo failure a buyer cannot forgive, because it is the one that says the
product cannot add.

The narrative of the series is allowed to be flattering - visits and revenue
grow, conversion rate improves, the cost ratio falls, which is exactly what a
client expects after an account changes hands - because it is disclosed as
fiction. It is not allowed to be inconsistent.

## Decision rules

- When a figure can be computed from something the product already serves,
  compute it there, because a typed copy of a computed value is a stale copy
  from the moment it is written.
- When the marketing surface would need its own builder to produce the figure,
  stop and import the product's builder instead, because a marketing-side
  reimplementation of the product's grounding will narrate a step the product
  does not perform.
- When the same figure appears on two surfaces (homepage band, demo, share
  card), route both through one call on one fixture, because two calls on two
  fixtures will disagree during the one week someone edits one of them.
- When a prior-period comparison has no prior window in the fixture, render the
  delta as absent, not as zero or as a full-window read; a demo is held to
  [not measured is not zero](../../../_laws.md#not-measured-is-not-zero) like any
  other surface.
- When the product's computation changes, the band changes with no marketing
  edit; if a marketing edit is needed to keep the band right, the band was
  typed somewhere.

## When NOT to use

- **Earned results.** A real customer's outcome is not "computed live" from a
  fixture; it is a consented, dated, typical-result-qualified quotation. This
  technique is for what the product computes, not for what a customer achieved.
- **Figures the product never surfaces.** A count of "hours saved" that no
  module computes is a marketing invention however it is rendered; deriving it
  live from a formula written for the landing page is still typing it.
- **Static share surfaces that cannot call the builder.** Where an image or card
  must be pre-rendered without access to the computation, render it from the
  same fixture at build with the label baked in, and accept that it is a
  build-time snapshot - and say so if the numbers on it and on the page can
  diverge.

## Footing

That a computed figure is preferable to a typed one is practitioner convention
with an obvious mechanism, not a measured effect. That an internally
inconsistent demo damages trust is a repeated observation in buyer-persona
testing, not a published measurement.
