---
layer: technique
type: technique
subject: attribution-and-incrementality
technique: triangulate-attribution-incrementality-and-mix-model
status: forged
laws: [platform-reported-is-not-causal, provenance-is-binary-and-labelled, not-measured-is-not-zero]
shared_with: []
use_when: [a surface shows more than one measurement of the same channel, an annual channel split or a prospecting budget is being decided, a mix model's output is about to be shown beside attributed numbers]
---

# Triangulate attribution, incrementality and a mix model

Three instruments measure a channel and each is wrong in its own way. Attribution is
daily, granular and biased toward whichever touches the model favours. Incrementality
is causal, narrow and expensive: one channel, one period, one market. A marketing mix
model is broad and cheap once built, needs two or more years of weekly data, and
returns an interval its priors shaped. None is the truth. The technique is to let each
correct the others, state each one's error beside its number, and say which instrument
each decision is trusting.

## The division of labour

- **Attribution** runs the day. Budget shifts between performance campaigns on one
  platform, search-term mining, bid changes - decisions inside a platform's own touch
  set, where the platform's attribution is the only read with enough granularity and
  the bidding runs on it anyway.
- **Incrementality** settles existence questions. Whether prospecting should exist,
  whether retargeting adds anything, what fraction of the biggest channel is real -
  one holdout each, re-run when the channel or the market changes materially.
- **The mix model** sets the annual shape. Channel shares, diminishing returns,
  seasonality and the baseline the business earns with no spend at all - the
  questions no single test answers and attribution cannot see.

Each hands the others a correction. A holdout's lift becomes a calibration point for
the model's channel coefficient - the open-source mix-model libraries take it as a
prior or as an optimisation target, and practitioners now validate a model against
lift tests as a matter of course. The model's channel shares sanity-check the
attribution split: a channel the model credits with a fifth of sales and attribution
credits with half is a channel whose attributed column is overstated, and the holdout
goes there next. The attribution column stays the operating read, discounted by the
incrementality factor the holdout produced.

## Procedure

1. Label every channel figure with its instrument: attributed (which platform, which
   model, which window), incremental (which test, which period, which interval), or
   modelled (which model, which data span, which interval). The label sits at the
   number.
2. Never average across instruments. Three numbers for one channel are three facts
   about it; a mean of them is a fourth number no instrument produced.
3. State the error with each: attribution's is its model bias, unknown in size until a
   holdout measures it; incrementality's is its interval and its narrowness in time;
   the model's is its interval and the dependence on priors, disclosed.
4. Write down, per decision class, which instrument decides. The rule above is a
   default; the important thing is that it is written and that a surface generating a
   recommendation names the instrument it used.
5. Feed each holdout into the model as a calibration point with its date, and re-read
   the attribution-versus-model gap after each recalibration to choose the next
   holdout.
6. Below the data the model needs - fewer than roughly two years of weekly outcomes,
   or a channel with too little spend variation to identify a response - do not fit
   one; report "not modelled" and rely on the other two, because a model fitted on
   too little data returns its priors and calls them a finding.

## Decision rules

- When two instruments disagree about a channel, show both and route the next holdout
  there, because the disagreement is the finding and the holdout is the arbiter.
- When a surface is about to blend instruments into one figure, refuse and show them
  side by side, because the blend erases the provenance that makes any of them usable.
- When a decision is about existence - keep or kill a channel - trust the holdout over
  the attribution column, because the column cannot see what would have happened
  without the channel.
- When a decision is inside one platform's touch set, trust the attribution column,
  because no other instrument has its granularity and the cost of a holdout there is
  not repaid.

## What is convention here

The assignment of decision classes to instruments is practitioner convention and the
technique says so. The two-year data need for a mix model is convention drawn from
the open-source libraries' own guidance. That the three instruments have different
errors and that averaging them fabricates a number is not convention.

## When NOT to use

Do not build a triangulation for a single-channel business; one platform, one
attribution column and one occasional holdout is the whole apparatus, and a mix model
with one channel identifies nothing. Do not fit a mix model to a business younger
than its data need; the technique's honesty rule is to say "not modelled". Do not use
the model's channel shares to move money week to week - the model is annual in
resolution and a weekly decision on it is noise with a credible interval.
