# Alpha Vantage as the `finance` connector

What was learned mapping this recipe onto Alpha Vantage specifically. Nothing here is part
of the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**Pre-calculated indicators make redundancy cheap, which is why this connector invites the
exact mistake the recipe is about.** Each indicator is its own call returning finished
numbers, so adding a fourth and a fifth reading costs one line of code each and no
understanding. All of them are computed from the same closing prices this connector also
serves. The mapping therefore has to hold the list of which readings share a source, because
the connector will not tell you: every response looks like an independent measurement.

**A pre-calculated indicator hides its parameters, and the parameters are the method.** The
window lengths are arguments to the call, and two runs with different arguments are two
different methods producing one shared record. Pin them at adoption and record them beside
every call, otherwise the simulated record mixes methods and cannot be evidence about any of
them.

**Volume is the cheapest genuinely independent reading available here.** It comes back with
the price series rather than as another call, and it is not derived from the closes the
oscillators are built on. Where the recipe asks for evidence from somewhere else, this is
the one that costs nothing extra on this connector, which makes it the natural first answer.

**The quota is the real watchlist limit, and it fails as partial coverage rather than as an
error.** Price history, two or three indicators and news are separate calls, so a ten name
list is roughly forty calls a period. Against a free tier measured in tens of requests a day
at a few per minute, that does not fit, and the shortfall arrives as empty responses rather
than as a failure. This is exactly the condition the data-unavailable criterion exists to
catch, and it is worth verifying the plan at adoption rather than at the first digest.

**The news endpoint returns a sentiment score, not events.** For this recipe's purposes a
score computed over recent coverage is closer to a second opinion about price than to
independent evidence, so treat it as weaker than it looks when it agrees with the technicals.

## What transfers to any market data connector

- Keep an explicit list of which readings share an underlying series; no data source will
  tell you, and every response looks independent.
- Pin indicator parameters at adoption and record them with each call, or the track record
  is the average of several methods.
- Find out how the source signals an exhausted quota; on this recipe silent emptiness and a
  genuine absence of data lead to the same verdict for opposite reasons.
