---
layer: technique
type: technique
subject: keyword-metric-reliability
technique: volume-as-order-of-magnitude
status: forged
laws: [label-convention-as-convention, never-invent-proof, not-measured-is-not-zero]
shared_with: []
use_when: [sorting or scoring keywords by volume, a client asks how much traffic a page will bring, summing volumes across a cluster]
---

# Volume as order of magnitude

A tool's search volume is a sort key with a unit painted on it. The unit is what makes
it dangerous: "2,400 a month" reads as a count, and a count invites arithmetic - sums,
forecasts, conversion-rate multiplications - none of which the number can carry.

## What the number is

The dominant ad platform, from which almost every keyword-data vendor's volume descends,
publishes a twelve-month average for a *family* of close variants (plurals, spacing,
common misspellings), rounded into a bucket, for one country. Three consequences follow
directly and each has been measured:

- **It is bucketed.** A published audit of 101,897 keywords found 1,462 distinct
  volume values - about seventy keywords per value. Between neighbouring buckets the
  number cannot distinguish demand at all.
- **It is biased in both directions.** The same audit put the median calibrated volume
  at roughly half the reported figure; a second study of 33,377 ranking terms over
  sixteen months found aggregate over-reporting of 163% against the site's own console
  impressions while 63% of individual terms were *under*-reported by more than 20%.
  There is no scalar to multiply by. A keyword-data vendor's own accuracy claim against
  console impressions is about 60%.
- **It is the family, reported onto every member.** The platform gives "plumber" and
  "plumbers" the same figure because they are the same family; a vendor that de-groups
  them shows two numbers for one demand.

## Procedure

1. **Pull the right country and say so.** The database defaults to the largest market.
   State the country on screen and in the map header; a map on the wrong country's
   data is perfect-looking and worthless.
2. **Sort, do not sum.** Use volume to order keywords against each other within one
   pull. "Roughly ten times bigger" is supportable; a total is not.
3. **Take the largest member as the family's figure**, never the sum of members. When a
   cluster needs a size, it is the root's bucket, labelled as a bucket.
4. **Estimate traffic from the ranking page, not the keyword.** The page at position one
   ranks in the top ten for a median of about four hundred other queries in a published
   study of ranking pages. If a traffic figure is genuinely required, derive it from what
   the currently ranking page earns across everything it ranks for, and label it an
   estimate with that method named.
5. **Feed scores ranks or logarithms.** Where a composite score must include volume,
   use the rank position or a log transform so that a head term at nine thousand does
   not set a denominator that flattens everything under a hundred to zero.
6. **Mark the source class.** Platform figure, vendor de-grouped figure, own console
   impressions, or estimate - beside the number, not in a footer.

## Decision rules

- When a client or a generated report needs a traffic number, refuse the keyword volume
  as the answer and supply a page-level estimate with its method, because a volume
  bucket presented as visits is an invented proof
  ([never invent proof](../../../_laws.md#never-invent-proof)).
- When two keywords differ by less than one bucket step, treat them as tied; the tool
  cannot rank them, so something else must - intent, proximity, revenue per job.
- When a keyword's volume is missing, it is not zero; render "not reported" and let the
  provider-default rule decide where it sorts
  ([not measured is not zero](../../../_laws.md#not-measured-is-not-zero)).
- When volume is compared across two pulls or two vendors, compare ranks, never
  figures: a vendor's de-grouping or a bucket boundary moves the number without any
  change in demand.
- When the business serves one city, never show a national figure as its addressable
  demand; say plainly that the country figure is an upper bound and the local share is a
  slice of it.

## What the console adds, and what it does not

A site's search-performance console reports impressions for queries the site already
ranks for. It is the best available reality check on a volume figure for those terms and
worthless for terms the site does not rank on. It also inflates on terms that
rank-tracking tools query automatically. Use it to calibrate the ordering of terms the
site owns; do not call it true search volume.

## Convention, labelled

The hundred-a-month volume floor is practitioner convention; no study fixes it. It
exists because a page under that figure rarely pays for itself, and it is overridden by
the local-revenue rule and by a near-zero-difficulty term with high intent - each time
with the reason stated.

## When not to use this

Do not apply an ordinal-only reading to a metric that is actually cardinal: the site's
own console clicks and impressions are counts and may be summed, trended and
forecast within their own limits. Do not treat zero-volume terms as opportunities
because a case study said they convert; the only measured test of that claim found
about eleven impressions per term, and the two real exceptions are brand-new trending
topics and high-value commercial phrases the platform has not yet bucketed. Do not
spend the ordinal signal where the rule below it says to ignore volume entirely -
local service-by-city grids rank by revenue, and volume only breaks ties there.
