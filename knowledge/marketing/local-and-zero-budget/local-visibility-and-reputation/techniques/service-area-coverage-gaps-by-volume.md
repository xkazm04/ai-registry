---
layer: technique
type: technique
subject: local-visibility-and-reputation
technique: service-area-coverage-gaps-by-volume
status: forged
laws: [not-measured-is-not-zero, label-convention-as-convention, the-results-page-is-the-verdict]
shared_with: []
use_when: [deciding which local page to build next, reporting a coverage ratio, reading a service-by-area matrix]
---

# Service-area coverage gaps by volume

The unit of local coverage is a pair: one service the business sells, in one area it
serves. This technique enumerates the pairs, marks each with whether a page exists and
where it ranks, computes an honest coverage ratio, and orders the uncovered pairs by the
search volume sitting in them so that the next page built is the one with demand behind
it. It produces one answer to one question - *which gap first* - and refuses to answer
it with an average.

## Procedure

1. **Build the matrix.** Rows are the services from the business's own catalogue,
   columns are the areas it actually serves. A cell is a target only if the business
   sells that service in that area; an untracked cell is *not a target*, not a gap.
   The matrix is built from the business's resolved services and localities, never from
   a generic sample of a trade - a heating business's demo matrix grounding a
   locksmith's diagnosis is the classic way this goes wrong.
2. **Mark each target.** `has page` - a page whose title or heading carries the
   service and the area, verified by reading the page, not by the site having a
   services hub or a contact page. `rank` - the position of that page for the pair's
   query, or *null* when it was never observed. Null stays null; it is not zero and it
   is not "unranked".
3. **Attach volume.** The monthly volume of the pair's query, from the market's own
   country database, used as an ordinal. Where no lookup ran, the volume is "not
   measured" and the pair sorts after every measured one - it does not sort as zero.
4. **Compute the three figures.** *Coverage* = targets with a page / targets.
   *Gap volume* = the sum of volume across targets without a page. *Covered but weak* =
   targets with a page whose rank is known and worse than ten.
5. **Order the gaps.** Uncovered targets, highest volume first. The first row is the
   recommendation; the rest are the queue.
6. **Present with the weak rule beside the ratio.** A coverage of 90% next to twelve
   covered-but-weak pairs is a different business from 90% with none, and the reader
   must see both.

## Decision rules

- **When a target has no page, recommend the highest-volume such target first, because
  it is the largest uncovered demand** and a page is the only thing that can capture
  it. One gap, named exactly as it appears in the data, with its volume; not a list of
  everything missing.
- **When a target has a page ranking worse than ten, count it as weak, not covered,
  because a page nobody reaches is coverage on paper.** The boundary at ten is the
  first-page convention and is labelled so; the bands one-to-three, four-to-ten and
  eleven-plus are the same convention. The pack boundary at three is documented
  behaviour and is the only one that is not.
- **When the rank is null, exclude the target from the weak count and say how many were
  excluded** - an unobserved position is not a weak one.
- **When the recommendation needs a page, hand the pair to the page-writing subject and
  stop.** Whether that page can be written without becoming a doorway is
  `local-page-doorway-prevention`'s question; this technique answers only *which pair*.
- **When two gaps tie on volume, prefer the one whose service already has a page in
  a neighbouring area,** because the business has proven it can rank for that service;
  this is practitioner convention.

## What the coverage ratio may and may not claim

The ratio counts pages, not visibility. It is the honest answer to "how much of what we
sell has a page" and nothing more. A local score that averages coverage with other
ratios - a listing's category fill, its services fill, its products fill - is a
composite of conventions and must be labelled as one; the single most useful thing
the averaging loses is exactly the weak count, which is why this technique keeps it as
its own figure.

Volume ordering is the one thing an ordinal supports. Summing gap volume into "12,400
searches a month uncovered" is a magnitude a reader will treat as a forecast; report
it, because it orders one business's gaps against each other honestly, but never as
expected traffic and never across two markets' databases.

## When NOT to use

- **A single-location business selling one service.** The matrix is one cell; the
  question is not "which gap" but whether the listing is right, which is
  `business-profile-and-citations`.
- **When the areas are not real service areas.** A list of cities chosen for their
  volume rather than for the business's actual reach produces a gap queue that leads
  straight into doorway pages. The areas come from the business, and the doorway
  subject's drive-time and material gates apply before any page is built.
- **When no volume lookup has run.** Ordering by "not measured" is not ordering. Run
  the lookup, or present the gaps unordered and say so.
- **For the page's ranking, once built.** Whether the page reaches the pack is the
  per-engine visibility technique's question, not a coverage question.
