---
name: congressional-stock-disclosure-coverage
version: 0.1.0
status: seed
domain: finance_accounting
path: finance_accounting/investing
---

# Congressional stock disclosure coverage

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Disclosure filings arrive on their own schedule and in bursts, so anyone
watching them by hand either checks constantly or misses them entirely. The subtler
problem is that a filing is not news: the rules allow weeks between a trade and its
disclosure and a minority of filings arrive far later than that, in batches, so a report
ordered by when filings appeared describes a week that never happened.

**Input.** Public disclosure filings since the last covered date, each carrying both the
date of the trade and the date it was filed, the reader's declared sectors and holdings,
and the record of which filings were already reported.

**Core action.** Advance a cursor over filings rather than rescanning a fixed window,
place every filing on the date the trade happened rather than the date it surfaced,
match against the declared sectors and holdings, and treat an unusual concentration in
one sector as the finding rather than any single filing.

**Output.** A report covering a stated window with no gap since the previous one, naming
the filings that plausibly matter, how old each trade was when it became public, and any
sector pattern behind them measured over when the trading actually happened.

## Activities

1. Advance the cursor over filings published since the last covered date *(observe)*
2. Read each filing's transaction date and its reporting lag alongside the date it was
filed *(observe)*
3. Match filings against the declared sectors and holdings *(decide)*
4. Judge sector concentration over when the trades happened rather than when they were
filed *(decide)*
5. Report matched filings with their lag and disclosed ranges, and any sector pattern
*(act)*
6. State the window covered, name any window an outage left uncovered, and reopen an
earlier window that late filings have changed *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Disclosures touching the reader's holdings and sectors are seen without them watching
the filings.**

- Each report covers a stated window with no gap since the previous one
- A filing already reported is not reported again
- A source outage is reported as an uncovered window rather than passed off as no
  activity
- A window in which nothing matched is reported as a quiet window, so the reader can
  tell a quiet period from a broken scan
- Findings are filtered to the declared watchlist and sectors rather than reporting
  every filing

**An unusual concentration of trading in one sector is called out as the finding, not
buried under the individual filings that make it up.**

- Sector movement is measured over the dates the trades happened, so a batch of late
  filings arriving together is never reported as a burst of activity in the week it
  appeared
- Sector movement is reported against a rolling baseline rather than in absolute counts
- Where amounts are disclosed only as ranges, the report says which end of the range any
  total was built from, or counts filings instead of summing money
- Usefulness feedback from the reader tightens the next pass's filters rather than being
  logged and ignored

**The reader is never left believing this report gave them a head start it cannot
give.**

- Every reported filing carries how long after the trade it became public, because that
  number, not the report's freshness, is what decides whether the information is still
  worth anything
- A window already reported as covered is reopened and amended when late filings land in
  it, rather than being treated as final
- The report describes what was disclosed and does not recommend buying or selling
  anything, because a public record arriving weeks late is not a basis for a trade and
  presenting it as one is the failure this recipe most has to avoid

## Guidance

Filings arrive on their own schedule and in bursts, so the job is completeness across
time rather than a report on a chosen day. A filing records something that already
happened, so carry each trade's age and let nobody read the report as an early warning.
Measure concentration over when the trades happened, not when they were filed, or one
late batch invents a pattern. Filter to the declared sectors: volume is not relevance.
This surfaces a public record; it does not advise.

## Where this is worth adopting

- A reader who already holds positions in two or three sectors and wants to know when
  public officials have been trading in them, without adopting the daily habit of
  checking two separate disclosure systems.
- A journalist or researcher building a picture of activity in one industry over time,
  for whom the filing dates are noise and the transaction dates are the data.
- Someone who tried this by hand, found the volume unusable, and needs the filter to be
  the reader's own declared sectors rather than whatever the aggregators decided was
  interesting.
- A reader who has been reading disclosure headlines as trading signals and would be
  better served by a report that puts the reporting lag next to every line and lets them
  see for themselves how old the news is.
- An adopter who cares about both chambers and does not yet know that they file into
  different systems, where the value of the recipe is partly that it says which of the
  two it is actually covering.

## Connector types

None. This work needs no external connector: the tools the agent already has are enough.

## Recommended trigger

`self_paced`. A fixed weekly cadence was habitual and actively wrong for the work:
filings arrive in bursts, so a fixed window either rescans nothing or splits a burst
across two reports. Act when new filings are plausibly available, and sooner when the
uncovered window since the last successful scan has grown.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which sectors and holdings make a filing relevant, because unfiltered disclosure
  volume is large enough to be useless
- Which chamber and which filing types are in scope, because the two chambers publish
  into different systems with different shapes, and an adopter who expects both will
  otherwise get one without being told
- What the reader will do with a match, because a filing that changes nothing they hold
  is trivia rather than a signal, and because the honest answer is often that they will
  do nothing
- How far back the reader wants late filings to be able to amend an already reported
  window, because that choice is the difference between a report that is stable and one
  that is accurate

## Dependencies

None.
