---
layer: technique
type: technique
subject: public-procurement-analysis
technique: threshold-proximity-signals
status: forged
laws: [lead-not-finding, one-definition-one-import]
shared_with: []
use_when: [designing procurement red-flag heuristics, triaging a firm's contract corpus for review, investigating suspected contract splitting]
---

# Threshold proximity signals

The concern: procurement law changes regime at value thresholds — above them,
open competition, publication duties, review rights; below them, discretion. That
discontinuity creates an incentive to land contract values just underneath, and the
best-documented gaming pattern is **artificial splitting**: dividing what should be
one procurement into several awards that each duck the threshold. A registry makes
the resulting value distribution observable, so proximity to thresholds becomes a
computable review signal. The whole craft is in keeping it a *signal*.

## The base signal

For each contract amount `a` and each legal threshold `L` in the jurisdiction's
regime, flag `a` as near-threshold when `0 < a ≤ L` and `a ≥ L × (1 − b)` for a
declared band `b` (around 10% is a workable default). Then aggregate per entity:
the count of near-threshold awards for a firm or a buyer. Decision rules:

- **Thresholds and the band are singular definitions.** Encode the jurisdiction's
  threshold list and the band width once, imported by every consumer — triage
  scripts, review surfaces, and copy alike. Restated literals drift, and in this
  domain a measured drift between two copies of a heuristic favored named firms.
  Thresholds also change by statute over time; the definition point is where the
  effective-date logic lives.
- **One near-threshold award means nothing.** Real prices cluster below round
  numbers for innocent reasons, and thresholds are round numbers. The signal is the
  *cluster*: several awards in the band, same supplier or same buyer, within a
  bounded period.
- **Compare against the value basis.** A tax-exclusive amount just under a threshold
  and a tax-inclusive one are near *different effective lines*; run the proximity
  test on whichever basis the statute defines the threshold in, and route
  mixed-basis corpora through the composition discipline first.
- **Per-entity counts and population-level density tests are complements.** The
  field's statistical instrument is a manipulation (density-discontinuity) test
  over the value histogram, which grades each buyer's *probability* of bunching;
  the per-entity band count is the triage view of the same fact. Where both are
  computable, run both — a buyer high on both is a stronger lead than either
  alone, and the density test resists the round-number innocence that defeats a
  single proximity flag.

## Corroborating signals

Field methodology converges on the same reinforcing patterns; compute them alongside
proximity rather than instead of it:

- **Temporal clustering** — multiple related awards from one buyer within days of
  each other, each under the threshold, especially with similar subjects and
  durations. Same-day or same-week bunches of functionally related purchases are
  the strongest splitting indicator.
- **Supplier concentration** — the split pieces repeatedly landing with the same
  supplier, where the combined value would have forced open competition.
- **Growth by amendment** — an award just under a threshold whose amended value
  later exceeds it (this needs the version history; see
  contract-version-supersession). The initial award dodged the regime the final
  value would have triggered.
- **Sequential structuring** — a run of awards to one vendor each just under an
  internal approval or review limit, the small-purchase analogue of splitting.
- **Procedure-type shift** — awards in the band disproportionately using
  noncompetitive procedure types. Population-scale studies validate the pairing:
  buyers with a high probability of bunching below thresholds are measurably
  less likely to run competitive procedures, more likely to award locally, and
  more likely to repeat the same winner.

## What the signal is not

Every one of these has innocent generators: genuine lot division encouraged by
policy to include smaller bidders, budget-year spending rhythms, framework call-off
mechanics, and honest estimation under a known ceiling. Therefore:

- The output of this technique is a **ranked review queue with the evidence
  attached** (the amounts, the threshold, the dates, the co-cluster members) —
  never a published accusation and never an input to a score that renders publicly
  as if it were a finding.
- Copy about a flagged cluster states the observable fact only: "N awards within
  10% below the competition threshold, within one quarter, same supplier." Whether
  that is splitting is a conclusion only document-level human review — subjects,
  functional relatedness, procurement plans — can reach.
- Run the detector symmetrically over the whole population of buyers and suppliers,
  or its very selectivity becomes an editorial act.

## When not to use

Below-threshold contracts are often exempt from publication, so the registry shows a
*censored* distribution: the awards most likely to be split pieces may be exactly
the ones not published. Where coverage below the threshold is thin, per-firm
proximity counts are floors and bunching analysis of the value histogram is biased —
say so, and prefer buyer-side sources (spend data, order ledgers) for the
below-threshold tail. Do not run threshold logic across jurisdictions or years
without re-resolving which thresholds were in force for each award.
