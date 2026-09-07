---
name: web-content-performance-review
version: 0.2.0
status: seed
domain: sales_marketing
path: sales_marketing/web-analytics
---

# Web content performance review

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A table of metrics with no interpretation is not a read on anything, and the
interpretation usually offered attributes a move to the content when the three cheaper
explanations, a change in collection, a change in who arrived, and a change in demand,
were never ruled out.

**Input.** The property's metrics for the period and how complete their collection was,
the rolling baseline each page is normally measured against, the same period a year
earlier where the history reaches that far, and the anomalies already raised and still
open.

**Core action.** Rule out the explanations that have nothing to do with the page before
attributing a move to it, then judge what is left against that page's own baseline with
a band that widens as volume falls, and end in a proposal or an explicit nothing.

**Output.** A read naming what moved, what was eliminated before the move was attributed
to the page, and the size of the gap against the baseline it deviated from, ending
either in a proposal that states what it expects to change or in a recorded finding that
there is nothing worth doing.

## Activities

1. Read the period's metrics and how complete the collection was *(observe)*
2. Eliminate a collection change, a mix shift and a demand shift before blaming the page
*(decide)*
3. Compare what is left against that page's own rolling baseline *(decide)*
4. Rank what is worth attention and set routine variance aside *(decide)*
5. Say what the movement means rather than restating it *(act)*
6. Deliver the read ending in a proposal or an explicit nothing, and record that it ran
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**A move is attributed to the page only after the explanations that have nothing to do
with the page have been ruled out.**

- Each attributed move names what was checked and eliminated: the collection, the
  composition of the traffic, and the underlying demand.
- An aggregate move is checked against the segments inside it, and a total that moved
  while every segment held is reported as a change in the mix rather than a change in
  performance.
- A move is stated against the baseline it deviated from and the size of the gap, rather
  than as a percentage against the previous period alone.
- A page too quiet to be judged is reported as too quiet rather than ranked, because at
  a few dozen views a large percentage is counting noise.
- An adopter who answers an attribution with something only they knew, that they changed
  the page themselves that week or that the collection was reconfigured, has supplied
  the rule out this read could not perform, so it is recorded against that period rather
  than against that report and any later read of the same window starts from it, because
  the alternative is re-attributing the same move to the page every time the window is
  opened again.

**Numbers turn into a next step, or into a recorded decision that there is none.**

- Each read ends in either a proposal or an explicit finding that nothing is worth
  doing, and both are written where the next read can see them.
- A proposal names what it expects to change and roughly by how much, so the claim can
  be checked against reality later.
- A quiet period leaves a record that the read happened and found nothing, rather than
  leaving no record at all.
- A first read establishes the baselines and says so, instead of reporting a delta
  against no history.

## Guidance

Own what the numbers mean for what to do next, not the production of a report. Before
attributing a move to a page, spend the cheap checks: did collection change, did the mix
of who arrived change, did demand change. Impressions falling alongside clicks is a
different problem from clicks falling while impressions hold, and the two want opposite
work. A page too quiet to judge is reported as too quiet, never ranked. Anything worth
acting on becomes a proposal that says what it expects to move.

## Where this is worth adopting

- A team where the weekly numbers arrive as a table and the meeting is spent deciding
  what the table means, so the same argument about whether a drop is seasonal is had
  from scratch every time.
- A content library large enough that nobody opens every page, where the pages quietly
  dying are exactly the ones nobody thinks to look at.
- A site whose traffic is mostly search driven, where a change in what sits above the
  listing on the results page moves clicks without anyone on the team having changed
  anything.
- A solo operator who will act on at most one thing this week and needs the read to end
  in that one thing rather than in twelve ranked observations.
- The quarter after an analytics migration, when half the apparent drops are collection
  artefacts and attributing any of them to the content would point the next quarter of
  work in the wrong direction.

## Connector types

`database`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[postgres](examples/postgres.md) for `database`, [duckdb](examples/duckdb.md) for
`database`.

## Recommended trigger

`self_paced`. The read is worth doing when the data has plausibly moved: enough new
volume to judge, a change that shipped and should now be visible, or an anomaly still
open and unexplained. A fixed clock guarantees a read in periods that earned none, which
is how a review becomes a table nobody opens. A period whose data has not finished
landing is extended rather than read twice.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which store holds these metrics and what a normal period looks like inside it, because
  a read with no learned normal is a threshold guess wearing the clothes of analysis.
- What the operator counts as success for this content, since the same traffic drop is a
  problem on one page and irrelevant on another.
- Which pages carry enough traffic to be judged at all, so a long tail of pages with a
  dozen views does not dominate the ranking with counting noise.
- What the adopter themselves changed during the period, in the site and in the
  collection, because a move they already caused is the first thing to rule out and the
  only place that knowledge lives is with them.

## Dependencies

None.
