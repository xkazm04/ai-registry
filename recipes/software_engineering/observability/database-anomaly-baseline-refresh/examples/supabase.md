# Supabase as the `database` connector

What was learned mapping this recipe onto Supabase specifically. Nothing here is part of the
recipe: bind a different database and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**The REST surface truncates the window silently, and a truncated window is a wrong
baseline.** PostgREST applies a default row limit, so a read of thirty days of orders comes
back as the first page of them with no error and no marker. A baseline computed on that page
is computed on an ordered, non-random slice of the window, which is worse than no baseline
because it looks like one. Either aggregate in the database and return the summary, or page
until exhaustion and assert the count matches an independent count before computing anything.

**Aggregate rather than pull.** The distributions this recipe needs are medians, spreads and
rates, and PostgreSQL can compute them with `percentile_cont` and friends far more cheaply
than a client can compute them over transferred rows. Doing the arithmetic in SQL also removes
the truncation problem above, which is the main reason to prefer it.

**Row level security makes a partial read look like a complete one.** A role restricted by a
policy sees a subset and gets no indication of it, so the refreshed baseline describes whoever
the policy lets through rather than the business. Establish at adoption which role the refresh
runs as and whether it bypasses policy, and prove it by comparing a count against one taken
with a known-complete view.

**Timestamps are `timestamptz` and the session time zone decides the buckets.** If the refresh
runs under a different session time zone from the detection that reads the baseline, hour of
day buckets are offset and every daily pattern is learned an hour or two out of place. Fix the
zone explicitly in both, and record it beside the baseline.

**Soft deletes drift the denominator.** Where rows carry a `deleted_at` rather than being
removed, a rate computed without the filter shifts as the table accumulates, so the baseline
walks even when behaviour has not changed. Decide once whether the baseline is over live rows
or all rows, and record which.

## What transfers to any database connector

- Prove the window was read completely before computing anything from it.
- Compute the distribution where the data is, not where the code is.
- Under any row filtering, prove the reader can see everything before treating a result as the population.
- Pin the time zone and the deletion semantics beside the baseline, since both move it silently.
