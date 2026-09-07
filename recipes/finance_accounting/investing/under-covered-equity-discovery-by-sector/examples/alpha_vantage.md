# Alpha Vantage as the `finance` connector

What was learned mapping this recipe onto Alpha Vantage specifically. Nothing here is part
of the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**Two of the three legs are easy here and the first one is not available at all.** Technical
indicators come back pre-calculated, so the technical leg is one call rather than a
calculation over price history, and a news endpoint covers the catalyst leg's raw material.
Analyst coverage and ownership breadth, which is what "under-covered" actually means, are
not something this connector returns. So a mapping that binds only this connector has a
recipe whose first leg cannot be measured, and the recipe's own rule then applies: an
unmeasurable leg is absent, so every candidate is rejected. That is the correct behaviour
and it is also useless, which is why the coverage source is a separate dependency rather
than an afterthought.

**The news endpoint returns sentiment, and sentiment is not a catalyst.** A favourable
score is a summary of how the name is being written about, which on an under-covered name
is a handful of articles and sometimes one. The recipe asks for a dated identifiable event.
Extracting that from the endpoint's items is the mapping's own work, and treating the score
itself as the catalyst leg is the shortcut this connector most invites and the one that
quietly turns a three-leg test into a two-leg one.

**Request volume caps the pool, not the thresholds.** At roughly three calls per candidate
per pass, a free-tier quota measured in tens of requests a day limits a pass to a handful of
names. The damaging part is that the limit is reached silently mid-pass: the remaining
candidates come back empty and, under the recipe's own rule, are rejected for insufficient
data. A pass that hit its quota has to say so, otherwise it reports a thorough search that
covered six names.

**Coverage of very small names is uneven.** The names this recipe is looking for are exactly
the ones most likely to have gaps in indicator or news data here. Absence is therefore weak
evidence of anything, and must not be read as "no catalyst".

## What transfers to any market data connector

- Check which of the recipe's legs the connector can actually supply before adopting it; a
  connector that covers two legs well is a connector that produces a two-leg test.
- A sentiment score is a summary of coverage, not an event. If the catalyst leg is meant to
  be an event, the mapping has to extract one.
- Find out how the source behaves when a quota is exhausted, because on this recipe an empty
  response and a genuine absence lead to the same verdict for opposite reasons.
