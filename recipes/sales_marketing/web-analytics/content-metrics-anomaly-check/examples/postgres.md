# Postgres as the `database` connector

What was learned mapping this recipe onto Postgres specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**Two timestamps, and only one of them is the window.** A metrics table almost always
carries the time the thing happened and the time the row landed, and they are not the
same column. The window belongs to the event time, or the comparison is against a
different slice of the world every run. The freshness check belongs to the landing time:
`max(inserted_at)` against now is the only cheap way to tell "the period is down" from
"the period has not arrived yet", and this recipe treats those as different verdicts.
Establish both column names at adoption, because a store that carries only one of them
cannot support the freshness half at all and the adoption should say so rather than
quietly skipping it.

**Compute the band per weekday, not per date.** The obvious query groups the lookback by
day and takes `stddev_samp` over it. That folds the weekly shape into the variance, and
the band it produces is wide enough that a genuine outage sits inside it. Group the
lookback by day of week first, so Tuesday is compared against Tuesdays, and the band
narrows to something that can actually fire. This is the single most common way a
seasonally aware check degrades into a threshold that never triggers.

**Materialize the expectation, do not recompute it.** If the expectation is a subquery,
it moves every time the check runs, so a deviation raised yesterday no longer names the
number it was raised against and nobody can reconstruct why. Write the expectation and
its band into a row alongside the verdict. This is also what makes "already open" a
cheap lookup rather than a re-derivation.

**Retention is a ceiling on the lookback.** A rolling baseline cannot be longer than the
table retains rows, and with partition dropping or a TTL job the ceiling moves without
anybody noticing. The baseline then shortens itself, the band widens, and the check
quietly goes silent while looking healthy. Read the retention at adoption and cap the
lookback below it.

## What transfers to any database connector

- Window on the timestamp the event happened; check freshness on the timestamp the row
  landed. A store with only one of them cannot separate an outage from a lag.
- Group the variance by day of week, never by date, or the weekly shape inflates the band
  until nothing ever fires.
- Write the expectation down next to the verdict. A recomputed expectation makes an open
  deviation unauditable a day later.
- Ask what the source retains before choosing how long the baseline is, and cap below it.
