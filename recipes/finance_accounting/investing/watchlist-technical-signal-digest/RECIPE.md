---
name: watchlist-technical-signal-digest
version: 0.1.0
status: seed
domain: finance_accounting
path: finance_accounting/investing
---

# Watchlist technical signal digest

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Indicator readings on a watchlist produce a verdict per ticker and no
reasoning, so nobody can tell afterwards whether the method worked or whether one lucky
call carried it. The failure underneath that is quieter: most indicators are computed
from the same closing prices, so when three of them agree they have restated one number
three times, and the reader experiences that redundancy as conviction.

**Input.** Price history, volume and indicator readings for each watchlist ticker over
the closed period, recent news for each, and the existing simulated record of calls.

**Core action.** State a call only when evidence that is genuinely independent supports
it, say plainly when apparent agreement is only the same price series counted again, and
never fabricate a figure for a ticker the sources could not cover.

**Output.** A short digest of defensible calls with their evidence and their
disagreements attached, and a simulated record that holds every call the method made
rather than only the ones a person liked.

## Activities

1. Fetch price history, volume, indicators and news per watchlist ticker for the closed
period *(observe)*
2. Weigh the readings, counting evidence derived from the same price series once rather
than several times *(decide)*
3. Decide where independent evidence supports a call and where the agreement is only
redundancy *(decide)*
4. State each call with its evidence and its disagreements, and mark uncovered tickers
as data unavailable *(act)*
5. Log every call the method made, before anyone has looked at it *(act)*
6. Put the digest in front of a human before anything becomes a tracked position
*(deliver)*
7. Fold the reviewed decisions into the running simulated record, marked as accepted
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Every call the reader sees traces back to real data for that ticker, and the reader
can tell how much independent evidence is actually behind it.**

- Every signal states the readings behind it and where they disagree
- Readings computed from the same price series are presented as one line of evidence,
  not as several agreeing ones, because a confluence of correlated indicators is a
  restatement rather than a confirmation
- A call resting on price-derived readings alone says so, rather than borrowing
  confidence from how many of them pointed the same way
- A ticker with no data in either the primary or fallback source is marked data
  unavailable, never given a synthesised signal
- A period whose conditions the readings are known to handle badly, such as a range with
  no trend for a trend-following measure, is reported as such rather than producing
  calls the method has no business making

**The simulated record stays honest enough to be evidence about the method rather than
about the reader.**

- Every call the method made is recorded, whether or not the reviewer accepted it, and
  acceptance is recorded separately, so the record can answer what the method did and
  what the reader did with it as two different questions
- Losing calls remain in the record
- The record states that it excludes the cost of actually trading, because a paper
  result that ignores spread and execution is a better result than the method would have
  produced
- The first digest says it is opening a record and reports no track record, rather than
  presenting an early run of calls as evidence
- A period with nothing worth saying produces a short digest rather than manufactured
  signals

**Nothing the digest produces reaches the world as an order or as advice.**

- Every reviewed decision becomes a simulated position and nothing else, and the recipe
  holds no path by which a call reaches a broker
- The digest is written as what the readings say, with their limits, rather than as what
  the reader should do
- No position size, price target or timing instruction appears, because none of them
  follow from the evidence this work has

## Guidance

Agreement is not confirmation when the agreeing indicators are computed from the same
prices: that is one piece of evidence counted three times, and it feels like conviction,
which is why it is worse than no signal. Look for evidence from somewhere else, and
report disagreement rather than hiding it. Record every call the method made, not only
the ones a person liked, or the track record measures the reviewer. A quiet period
produces a short digest. Nothing here is an instruction to trade.

## Where this is worth adopting

- A reader holding a dozen names who wants one considered read per period instead of
  watching charts daily, and who cares more about not being talked into a trade than
  about not missing one.
- Someone who has been running a signal digest for months and cannot say whether it has
  helped, because only the calls they agreed with were ever written down.
- A reader who keeps seeing three indicators line up and treating that as strong
  evidence, for whom the most valuable output is the sentence saying those three are the
  same number.
- A sideways stretch in the market, where a trend-following method produces its worst
  calls and the useful behaviour is to say the conditions do not suit the readings
  rather than to keep publishing.
- A watchlist that has quietly grown past what the data source can cover in one pass,
  where partial coverage would otherwise be indistinguishable from a quiet period.

## Connector types

`finance`, `research`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[alpha_vantage](examples/alpha_vantage.md) for `finance`.

## Recommended trigger

`time`. One of the few genuine calendar obligations in this lane. Period indicators are
only defined once the period has closed, so an earlier digest reports a partial bar and
the call it produces is not the call the data supports. Align the period to the trading
week rather than to a chosen weekday.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which tickers are on the list and why each earned its place, because a call is only
  actionable against a position or an intent the reader actually has
- The reader's horizon and risk appetite, because the same reading is worth acting on
  over months and noise over days
- What evidence the reader considers independent of price, since that is the whole
  difference between a call and a restatement, and the answer differs between someone
  who follows fundamentals and someone who follows flow
- Whether this is research only, because the recipe must know it is never placing an
  order and the adopter must have said so rather than assumed it

## Dependencies

- A market data plan whose per-minute and per-day request limits cover the watchlist:
  this recipe makes several calls per ticker per period, so a small free quota limits
  the watchlist size rather than the reader doing it
