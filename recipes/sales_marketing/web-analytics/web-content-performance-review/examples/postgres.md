# Postgres as the `database` connector

What was learned mapping this recipe onto Postgres specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**"A page" does not exist until URL normalisation is decided.** In a raw request or
event table the same page arrives as several distinct strings: with and without a
trailing slash, with campaign parameters attached, under a locale prefix, and under a
canonical host and a redirecting one. Rank on the raw string and the top ten is mostly
one page appearing four times while its real total sits below the inclusion floor.
Establish the normalisation at adoption, apply it identically to the current period and
to the baseline, and be aware that changing it later is itself a collection change: every
page's history moves, and this recipe would attribute that to the content. Record the
normalisation version alongside the baseline so a later read can see when it changed.

**The mix shift check needs the dimensions to already be on the row.** Ruling out a
composition change means comparing the aggregate against the same aggregate split by
source, device and country, and those columns have to exist on the fact rows at query
time. If they live only on a session table that is joined in, the join loses the rows
that failed to attribute, which is exactly the population whose growth causes the mix
shift in the first place. Prefer a left join and report the unattributed bucket as its
own segment rather than dropping it.

**A `LEFT JOIN` against the baseline is the difference between a drop and an absence.**
Inner-joining the period against the baseline silently removes any page that had traffic
before and none now, which is the single most important finding this recipe produces.
Join outward from the baseline, and treat a null current period as zero with a reason
attached rather than as a missing row.

**Backfills rewrite history under the baseline.** If the pipeline ever reprocesses a past
window, the rolling baseline computed last week and the one computed today differ for the
same dates, and every verdict shifts with them. Either recompute the baselines whenever a
backfill lands and say the read did so, or pin them; silently mixing the two is how a
review stops being reproducible.

## What transfers to any database connector

- Decide URL normalisation before anything else, apply it to the baseline too, and treat
  a change to it as a collection change rather than a content change.
- Ruling out a mix shift requires the segmenting dimensions on the fact row; a join that
  drops unattributed rows hides the very population that causes the shift.
- Join outward from the baseline, so a page that went to zero appears rather than
  vanishing.
- Ask whether history is ever rewritten. A baseline over a rewritable source is only
  reproducible if the read says which version of history it used.
