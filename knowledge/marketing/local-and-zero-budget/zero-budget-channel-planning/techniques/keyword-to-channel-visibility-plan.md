---
layer: technique
type: technique
subject: zero-budget-channel-planning
technique: keyword-to-channel-visibility-plan
status: forged
laws: [never-invent-proof, provenance-is-binary-and-labelled, not-measured-is-not-zero]
shared_with: []
use_when: [joining a keyword list, a content library and a channel plan into one weekly plan, deciding which channels may be paired with a target query, labelling a plan row's provenance]
---

# Keyword-to-channel visibility plan

A business trying to get found without paying holds three lists in three places:
the search queries it wants to rank for, the briefs and drafts it has written, and
the free channels it plans to show up on. Nothing joins them, so the owner holds
the join in their head - and usually does not. The visibility plan is one artifact
that packages the three: one row per channel, in the channel plan's own fit order,
carrying the query the channel's content should aim at and the brief or draft that
already covers it, with a single next step and a provenance label per row.

## The spine is the channel plan

A row *is* a channel. That choice is what makes the empty case honest: a business
with no saved queries and no saved content gets back exactly the channel-only plan
- same channels, same order, same first actions - with the query and content legs
explicitly null rather than filled with something invented. Nothing is derived
from nothing.

## The one heuristic, stated plainly

There is no stored link between a query and a channel; the plan is *proposing*
one. The proposal is a deterministic deal: target queries, in a fixed order, are
handed one by one onto the channels that can carry content - communities, social
and owned content - in fit order. **A listing gets no query, and neither does an
outreach channel.** "Register on the national directory" is not a piece of
writing; pairing it with a keyword would be advice the data does not support. This
is by construction, not by instruction: the kind taxonomy decides which rows may
receive a query, and a directory row's query is null before any dealing happens.

The order of the queue is: queries that already have content written for them
first (in-flight work), then by opportunity, then by measured volume, then by name
so the deal is deterministic. A channel the business has marked done is dealt
nothing, because the plan would be proposing work on something the owner closed.

## The one real join

Channel-to-content, by contrast, is not a guess. A saved brief names the primary
keyword it was written against, so content is matched to the query it was briefed
for. A piece whose keyword is in no saved list is still a query the owner chose;
it is promoted into the queue with zero opportunity and zero volume - the numbers
are unmeasured, and unmeasured is rendered as absent, not invented - so written
work never falls out of the plan because the keyword was never saved. An entry
with no primary keyword has no join and is dropped rather than attached to a
guess. Where a query has both a brief and a published draft, the draft wins,
because it is further along and "publish" is the more useful instruction.

## The step ladder

Each row carries exactly one step, and every value is an action the product can
route to: publish (a draft exists), finish the draft (a brief exists), write a
brief (a query is dealt but nothing covers it), first action (no query, or the
channel is not about writing), done. Rows sort by that ladder - closest to a
published page first, done last - with a stable sort so equal-step rows keep the
channel plan's fit order. That stability is what makes the no-query, no-content
plan identical to the channel-only plan. The card shows three rows: a plan for
this week, not a second copy of the channel table. Three is a convention.

## Provenance travels per leg

Each leg says where it came from - seeded (a fixture number), generated (a pinned
plan, a scan's keyword seed, a generated brief) or the owner's own (a decision on
a channel, a keyword list saved from a real pull) - and the row rolls up to the
strongest present, so a row that is partly the owner's work never reads as pure
sample. The label describes the *numbers* a reader would otherwise trust: a
keyword list saved off the sample generator stays seeded however deliberately it
was kept, because its volumes were fabricated; a list from the scan is generated,
because it is a model's reading of the homepage with every metric zeroed; a list
from a measured pull is the owner's. Negatives are exclusions, never targets, and
are dropped from the queue.

Measured clicks, when present, are stamped onto the matching row through the same
null-on-nothing rule the channel table uses, so the two surfaces can never
disagree about whether a channel is measured; they do not enter the ordering.

## Decision rules

- When a channel's kind is listing or outreach, deal it no query, because the
  channel cannot carry a page.
- When content exists for a query, match by the brief's declared primary keyword
  and never by similarity, because the declared keyword is a fact the owner made.
- When a query has no measured metric, carry zero and label the leg's provenance,
  never estimate a volume to make the sort look informed.
- When any leg of a row is the owner's own, label the row as the owner's, because
  a reader who sees "sample" on their own decision stops trusting every label.
- When a project type lacks any of the three modules, do not render the plan at
  all, because a row linking to a page that does not exist is worse than no row.

## When not to use

Do not use the visibility plan as the keyword map; it deals a bounded queue of
queries, it does not cluster them or judge their intent, and those belong to the
search subjects. Do not use it to schedule social posts - the step is "create
the next piece", and the calendar is another module's. And do not read the
query-to-channel pairing as a finding: it is a proposal, it says so in its own
honesty band, and a business that pairs differently has not contradicted any
data.
