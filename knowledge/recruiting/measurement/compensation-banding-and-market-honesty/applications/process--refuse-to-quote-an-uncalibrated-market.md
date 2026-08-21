---
layer: application
type: application
subject: compensation-banding-and-market-honesty
technique: refuse-to-quote-an-uncalibrated-market
stack: process
status: forged
verified_on: 2026-08-20
---

# A market as a frozen configuration record, with an empty band list as a legal value

`pipeline/jobfit/market_config.py` is the technique implemented literally. Its
docstring (`:1-16`) names the disease it cures: "the salary plausibility ceiling
(`salary_band`), the currency/period a bare pay figure defaults to (`pipeline`),
and the city an ad without a location is assumed to be in
(`jobs.DEFAULT_POLICY`) were all hardcoded CZK/Praha literals scattered across
three modules." `MarketConfig` (`:25`) is a frozen dataclass gathering them so
"a market is defined once, and the consumers read the active config instead of
re-typing a locale constant."

The fields that matter to this subject, from the field docs at `:29-79`:

- `plausibility_ceiling` — "the largest plausible SINGLE gross figure in
  `currency` per `period`; a band above it is almost certainly a data error (a
  yearly figure read as monthly, a stray zero) and is flagged for review."
- `salary_step` — the rounding grain, with the reason it cannot be a constant:
  "Flat 5 000 for a CZK/month market reads a 47,300–61,800 range as 45k–60k; a
  EUR/month market must round on a far finer grain (rounding €4,200 to the
  nearest €5,000 would erase the figure)."
- `company_adjustment_max` / `company_adjustment_min` — "the defensible clamp on
  the cumulative company-compensation multiplier", 1.20 / 0.75 for the Czech
  market, market-calibrated and therefore re-homing with the market.
- `benchmark_source_id` — "provenance; ties back to `salary_benchmarks.json`",
  so the config record and the corpus are joined rather than parallel.
- `region_label` — the country-qualified phrase the grounded-salary prompt
  needs, because "a bare `default_location` ('Praha') is not the
  country-qualified phrase the prompt needs".

## The empty default and the stranded-literal defect

`seniority_default_bands` (`:64-79, :95`) carries both halves of the lesson in
one field doc. The defect first:

> "These were CZK/month magnitudes hardcoded in `automation.draft_offer` yet
> stamped with the ACTIVE market's currency, so a re-homed deploy drafted a
> candidate-facing '95,000 EUR gross monthly' — wrong by ~25×."

Right code, wrong magnitudes: a well-formed, confident, candidate-facing figure
whose number belonged to one country and whose unit belonged to another. Then
the rule:

> "**Empty is a valid, honest configuration**: a market for which we hold no
> benchmark bands must produce NO number at all (recommended `None` + a 'no
> band configured' rationale routed to the human offer_review gate) rather than
> an invented one."

The field's default is the empty read-only mapping (`:92-95`), and the comment
there states the failure it prevents: "a market that has not been given bands
fails safe (no invented figure) instead of inheriting another market's
magnitudes." A market cannot be constructed *into* the unsafe state by
omission — omission is the safe state.

## The demonstration market declares itself

`BERLIN_MARKET` (`:141`) is the technique's demonstration-market rule in
practice. It changes currency (`EUR`), period, ceiling (`30_000`), location and
rounding grain (`salary_step=500`, with the comment explaining that CZK's 5 000
"would erase a real euro figure") — proving the seam is real. Every stand-in
value is labelled `NON-PRODUCTION placeholders` inline (`:148`, `:155`), and the
module docstring says it plainly at `:11-14`: a second sample "NOT a claim that
we hold real German benchmark data".

Its bands are `DELIBERATELY EMPTY` (`:161-166`), with the reasoning spelled out
where the next maintainer will meet it:

> "We hold no real German benchmark bands … and the honest answer to 'what
> should we offer?' for a market we have not calibrated is 'we don't know' —
> NOT the Czech CZK magnitudes wearing a EUR label. `draft_offer` therefore
> returns `recommended=None` with a 'no band configured' rationale and the
> draft still routes to the human `offer_review` gate, where a recruiter sets
> the real number."

That last clause is the refusal's named next actor: the refusal does not end
the workflow, it hands it to the offer-review gate. `ACTIVE_MARKET` (`:172`) is
the single switch point every consumer reads.

## The corresponding refusal in the lookup

`pipeline/jobfit/taxonomy.py:545` (`role_band`) is the read side and refuses
symmetrically: it "Returns `None` when the family is unknown, the seniority key
is missing, or the band entry is short / non-numeric (tolerated by skipping
rather than raising)". No nearest-family fallback, no interpolation onto an
unknown key — an uncalibrated cell returns nothing, and
`pipeline/jobfit/winnability.py:116` then renders `marketBand: None` and a
`belowMarket` that is `None` rather than `False`, so the silence survives to
the surface instead of being converted into a reassuring negative.
