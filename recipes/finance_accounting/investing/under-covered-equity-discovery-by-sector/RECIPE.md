---
name: under-covered-equity-discovery-by-sector
version: 0.1.0
status: seed
domain: finance_accounting
path: finance_accounting/investing
---

# Under-covered equity discovery by sector

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Screens produce names that clear a mechanical filter and nothing more, so the
output looks like research while carrying no thesis anyone could argue with. Thin
coverage on its own is not a filter at all, because most small companies have no analyst
following them, and the thinness that makes a name overlooked is the same thinness that
makes it hard to get out of.

**Input.** The reader's declared sectors, coverage and ownership breadth for the
candidate pool, technical and liquidity data for each candidate, recent news, and the
thresholds as the reader's earlier verdicts have moved them.

**Core action.** Require all three legs together, thin coverage, a technical case, and a
dated catalyst, treat two out of three as a rejection rather than a weaker
recommendation, and treat a leg the data could not measure as absent rather than as
satisfied.

**Output.** A small number of candidates, each stating its coverage, its technical case,
its catalyst and what it would cost to trade, plus the stated reason every rejected name
was rejected.

## Activities

1. Assemble the candidate pool from the declared sectors *(observe)*
2. Read coverage and ownership breadth, technicals, liquidity and recent news for each
candidate *(observe)*
3. Require thin coverage, a technical case and a dated catalyst together, counting a leg
that could not be measured as absent *(decide)*
4. Check that a survivor is thin enough to be overlooked without being too thin to leave
*(decide)*
5. Surface the survivors with all three legs and their liquidity stated *(act)*
6. Record why each rejected candidate was rejected *(deliver)*
7. Move the thresholds from the reader's repeated verdicts *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Names worth a second look surface before they are widely covered, with the reason they
qualified.**

- Each candidate states its coverage, its technical case and its catalyst, not just one
  factor
- Thin coverage is established from how many analysts follow the name and how narrowly
  it is held, not from market capitalisation or share price, which are weak substitutes
  that select half the market
- A catalyst is a dated identifiable event, not a favourable sentiment reading, because
  a sentiment score is a summary of coverage rather than a reason for anything to change
- A candidate whose coverage, technicals or catalyst could not be read is rejected for
  insufficient data and never promoted as a find
- Rejected candidates carry a stated reason so the thresholds can be tuned
- Repeated verdicts from the reader move the thresholds rather than being logged and
  ignored

**The reader can see the cost of the thinness that made the name interesting in the
first place.**

- Every surfaced candidate carries its traded volume and the spread it trades at,
  because a name nobody covers is usually a name nobody trades and that is the same fact
  seen from the other side
- A candidate too thinly traded for the reader's stated size is either excluded or
  surfaced with that stated plainly, rather than presented as if it could be bought at
  the price on the screen

**A quiet period produces nothing, and what is produced is a shortlist to research
rather than a call to make.**

- A pass that finds no three-legged candidate reports none
- No name is surfaced on two legs described more enthusiastically
- Each candidate is stated as a name to look into, with the evidence and the gaps in it,
  and not as a recommendation to buy, hold or sell
- Nothing in the output implies a price target, a position size or a timing judgment,
  since none of those are things this work has the evidence to support

## Guidance

A candidate needs all three legs: thin coverage, a technical case, and a dated catalyst.
Two out of three is a rejection, not a weaker recommendation, and a leg the data could
not measure is absent rather than satisfied. Thin coverage and thin liquidity are the
same thinness, so say what it would cost to get out. Report why candidates were filtered
out, because that is how the reader learns whether the filter is set right. Stay inside
the declared sectors. This surfaces names to research; it recommends nothing.

## Where this is worth adopting

- A reader who follows two or three industries closely enough to judge a thesis
  themselves, and wants the search narrowed to names their own knowledge can evaluate
  rather than a general market screen.
- Someone who has run screeners before and stopped, because the output was fifty names a
  week with nothing distinguishing them and no record of what had already been looked at
  and dismissed.
- An investor whose stated size is small enough that thinly traded names are actually
  available to them, which is the condition under which this work pays and the condition
  most screens never check.
- A quiet stretch in the covered sectors, where the value of the recipe is that it
  returns nothing rather than manufacturing a weekly list to justify itself.
- A reader who wants a record of why names were rejected, because after three months
  that record is the only evidence available about whether the thresholds are set
  anywhere near right.

## Connector types

`finance`, `research`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[alpha_vantage](examples/alpha_vantage.md) for `finance`.

## Recommended trigger

`self_paced`. A weekly cadence was habitual. Look when something plausibly changed in
the covered sectors, a catalyst, a coverage change, or a move against a quiet baseline,
and accept that a period with nothing to say produces nothing.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which sectors the reader actually follows and why, because the candidate pool is
  defined by this and nothing else, and a generic pool produces confident irrelevance
- What they mean by under-covered in their own terms, because coverage thresholds differ
  enormously by market and the recipe should not pick one silently
- The size the reader would actually trade in, because that number decides whether a
  thinly traded candidate is an opportunity or an unusable one, and no screen can guess
  it
- Where analyst coverage and ownership breadth can be read, because market data sources
  commonly do not carry either, and a coverage leg with no source silently becomes a
  two-leg test
- Whether this is research only, because the recipe must know it is never placing an
  order and the adopter must have said so rather than assumed it

## Dependencies

- A market data plan whose request limits cover the candidate pool: several calls per
  candidate per pass means a small free quota caps the pool rather than the thresholds
  doing it
- A source for analyst coverage or ownership breadth, which is usually not the same
  source as price and indicators, because without it the recipe's first leg cannot be
  measured at all
