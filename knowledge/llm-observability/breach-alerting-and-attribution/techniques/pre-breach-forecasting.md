---
layer: technique
type: technique
subject: breach-alerting-and-attribution
technique: pre-breach-forecasting
status: forged
laws: [estimation-announces-itself, statistical-verdicts-or-no-verdict]
shared_with: []
use_when: [operators want warning before a budget breaches, forecasting margin crossover per customer, wiring a scheduled forecast sweep without doubling alert volume]
---

# Pre-breach forecasting

The live breach alert arrives after the money is spent. The forecast alert
arrives while the operator can still do something: "this project is on track
to breach its monthly cost budget in about six days"; "this customer is on
track to turn unprofitable next week." The technique is a deliberately small
projection model plus a set of disciplines that keep its alerts honest,
non-duplicative, and impossible to confuse with measurements.

## The model: an operator's eyeball, made precise

Resist the reflex toward sophisticated forecasting. The right model is the one
an operator could verify by looking at the chart: a **recency-weighted level**
(an exponentially weighted average of the daily series — the smoothed "what
we're spending per day now") plus a **least-squares linear slope** (the
day-over-day trend), projected as `value(t) = level + slope · t`, floored at
zero because spend cannot go negative. No hidden state, no training, no
seasonality machinery. Its two virtues are exactly what an alert needs:
**explainable** — the message can say "projected ~X/day, currently Y" and the
operator can check it mentally; and **argument-proof** — nobody tunes
hyperparameters until the forecast says what they want, which is the knob-free
posture the verdict disciplines of this domain demand. Upgrade only when a
measured false-alert rate justifies it, and keep the explanation property.

## Projection semantics follow the window

A single daily-series trend answers different questions for different budget
windows, and conflating them produces confident nonsense:

- **Daily budget** → project the **daily value**: the ETA is the first day the
  projected per-day figure reaches the threshold.
- **Monthly budget** → project **cumulative exhaustion of remaining
  headroom**: sum the projected days forward until they consume
  `threshold − current`. Ignoring what the rolling window will drop off makes
  this estimate conservative — it errs early, which is the correct direction
  for a warning.
- **Hourly budget** → **refuse to forecast.** A daily series cannot see
  sub-daily structure; an hourly ETA derived from it is fabricated precision.
  No ETA is an answer; a made-up one is not.

Exclude the already-breached: an ETA of zero means the condition is *current*,
which is the live alert's jurisdiction. A forecast that re-announces the
present is a duplicate wearing a different event type, and it will double-page
the operator for one incident.

## Margin crossover: the second forecast

Per-customer profitability erodes on a different geometry. Subscription
revenue is flat across the window; cost trends. So the margin forecast holds
revenue-per-day constant, fits the trend on the **cost** series, and reports
the day the projected daily cost overtakes daily revenue — the moment the
customer starts bleeding day-to-day, ahead of the cumulative margin actually
going negative. Two edges need care. A crossover ETA of zero is a *real
signal* here (still cumulatively profitable, already bleeding daily — the
imminent-flip warning) and must not be dropped by the same zero-filter the
budget path uses. And an already-unprofitable customer is a **present fact,
not a forecast** — report it as its own alert ("already unprofitable and cost
still rising"), phrased as fact, only while the cost trend still rises;
kicking a customer who is already recovering is noise.

## Advisory phrasing is part of the contract

Every forecast number that leaves the system announces itself as a
projection: "on track to", "about N days", "projected ~X/day" — never a
timestamp, never a bare figure indistinguishable from a measurement. Severity
can still be tiered mechanically (an ETA within a few days pages harder than
one within the horizon), but the text keeps its epistemic status visible. An
operator who once catches a forecast presented as fact discounts every alert
the system sends afterward.

## The methodology-free dedup key

Forecast alerts dedup like breach alerts, with one extra discipline: the key
is built from *what is predicted* — project, alert kind, subject (the rule or
the customer) — and **deliberately carries no trace of how the forecast was
produced**. A scheduled sweep and an operator's on-demand forecast query for
the same subject must share one cooldown; if the production path leaks into
the key, enabling the sweep silently doubles every operator's alert volume,
and the feature that was supposed to add safety adds noise. Corollary: build
sweep and query on one shared forecast-to-alert mapping function, so the two
paths cannot drift into producing differently-keyed alerts for the same
prediction.

## When not to use this

Do not forecast on series shorter than a few points — a slope fitted through
two days is an anecdote; suppress the alert rather than caveat it. Do not
forecast metrics the enforcement layer does not cap (a projection with no
threshold has no ETA and no action). And do not let forecast alerts trigger
*enforcement* — projection is advisory by constitution; the cap acts on
measured spend only.
