---
layer: technique
type: technique
subject: keyword-metric-reliability
technique: local-terms-rank-by-revenue-not-volume
status: forged
laws: [label-convention-as-convention, never-invent-proof]
shared_with: []
use_when: [building a service-by-city keyword grid, a local term falls under the volume floor, deciding which city pages to build first]
---

# Local terms rank by revenue, not volume

City-level search demand sits precisely in the band where volume bucketing destroys the
signal. Genuinely different demand for two services in one town is reported as ten and
ten, or zero and twenty, and a sort of those figures is a sort of rounding noise. The
corrective is not a better volume source. It is to stop ordering local terms by demand
and order them by what a job is worth.

## Why the volume column fails here specifically

The platform's buckets are coarse at the bottom of the scale - the small values are
spaced so that a term at real demand 8 and a term at real demand 24 can share a figure
or straddle a boundary arbitrarily. A national head term at four thousand is a
different bucket from one at two thousand; a city term at fifteen is indistinguishable
from one at thirty. The volume floor convention - a hundred a month before a page is
worth building - was written with national terms in mind and would cut most of a local
business's money pages if applied literally. Forty searches a month for an emergency
term can out-earn four thousand informational visits, and nothing in the export
expresses that.

## Procedure

1. **Build the full grid** of services the business sells by the cities it serves, from
   the business, not from the export. Every cell is a candidate page; the export does
   not decide which cells exist.
2. **Attach revenue per job to each service row.** The figure comes from the owner -
   average ticket, margin if known - and its definition is the profit-economics
   subject's; here it is only a sort key. A missing figure is an open question to the
   owner, never an estimate typed in
   ([never invent proof](../../../_laws.md#never-invent-proof)).
3. **Attach a plausible job count per city** where the owner can give one (where the
   trucks already go, where the calls come from). Where they cannot, the row carries
   revenue per job alone.
4. **Rank rows by revenue per job, then by job count, and let volume break ties only.**
   Two cells with equal revenue and no job count fall back to the volume ordering,
   which is the only place the export's local figures do any work.
5. **State every floor exception explicitly.** A local term kept under the volume floor
   is flagged on the map with its reason ("ultra-high intent, near-zero difficulty,
   revenue rank 2"), never let through silently.
6. **Verify intent on the results page per cell class**, not per cell: the map pack
   and ads on the service-plus-city query are the commercial signal; that read belongs
   to the intent subject and is done once per service.

## Decision rules

- When a term is local and under the volume floor, do not cut it on volume; rank it by
  revenue per job and decide there, because the floor is a national convention and the
  local bucket cannot carry the decision
  ([label convention as convention](../../../_laws.md#label-convention-as-convention)).
- When two local terms differ in volume by one bucket step or less, treat them as tied
  and let revenue decide.
- When the owner has no revenue figure for a service, the row sorts unranked with the
  question open, not at the bottom on a guessed number and not at the top on a bucketed
  volume.
- When a city page is proposed for a city the business does not actually serve, the
  revenue rank is irrelevant - the page is a doorway candidate and the doorway subject's
  gate applies before any ordering.
- When a national volume is presented for a local business, say it is the country figure
  and that the addressable share is a slice; never show it as demand.

## What the ordering buys

A map ordered by revenue builds the pages that pay first, which matters for a business
that will judge the work by calls in the first quarter. It also produces the honest
answer to "why is this low-volume page above that high-volume one" - a sentence about
what a job is worth, which the owner can check, instead of a sentence about a search
number they cannot.

## Convention, labelled

Revenue-per-job ordering is practitioner convention; it has not been measured against
volume ordering in a controlled comparison. It is adopted because the alternative -
sorting by a column that cannot distinguish the rows - is measurably noise, not because
the ordering itself has a study behind it. The hundred-a-month floor it overrides is
likewise convention.

## When not to use this

Do not apply revenue ordering to a national business, where the city axis does not
exist and volume buckets are wide enough to order head terms and their long tail. Do not
apply it to category-level terms in a shop, where the bucket differences are real and
the money terms are modifier-driven. Do not use it to justify building a city page for
every town within driving distance - the cap on city spokes and the local-material gate
belong to the doorway-prevention subject and apply before this ordering runs. And do not
let revenue per job override intent: a high-ticket service whose service-plus-city query
returns ten guides is a blog topic in that city, not a money page.
