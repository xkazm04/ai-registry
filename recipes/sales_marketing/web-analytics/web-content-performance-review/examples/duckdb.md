# DuckDB as the `database` connector

What was learned mapping this recipe onto DuckDB specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**The corpus is whatever files happen to be there, and a missing file reads as a real
zero.** Querying a glob of Parquet or CSV exports means the period under review is
defined by the filesystem rather than by a `WHERE` clause. An export that failed to run
produces a day with no rows, which is indistinguishable in the result set from a day with
no traffic, and this recipe would report it as the largest drop in the period. Derive the
set of days the window should contain from the calendar, check that each has a file, and
treat a gap as a collection failure rather than as data. That check is the whole
freshness half of this recipe when the store is files.

**Schema drift is per file, not per table.** Columns appear, get renamed and change type
between exports, and DuckDB will happily union files with a widened schema and fill the
absent column with nulls. A metric that was renamed six months ago becomes null across
the older half of the baseline, the baseline halves, and every current page reads as an
improvement. Pin an explicit column list and a type per column rather than reading `*`,
and fail loudly on a file that does not supply them.

**Cheap recomputation is a trap for this recipe, not a feature.** Because a full rescan of
the history costs seconds, the obvious design recomputes the rolling baselines on every
run. That makes the baseline move under the verdict: an anomaly raised yesterday no
longer names the number it was raised against, and "the same read reaches the same
verdict twice" stops holding. Persist the baselines the read produces into their own
table or file, and treat the ability to recompute as a repair path rather than the normal
one.

**It is catalogued as both `database` and `analytics`.** That is convenient and it hides a
decision: the same adoption can resolve both halves of a pairing to this one binding, at
which point a check meant to compare two independent sources is comparing a source
against itself. If a sibling recipe expects an independent second reading, say at adoption
which binding supplies which side.

## What transfers to any file backed store

- Derive the expected set of periods from the calendar, not from the files present. A
  missing file is a collection failure, not a zero.
- Pin the column list and types. Schema widening across a history silently truncates a
  baseline and turns the truncation into apparent improvement.
- Persist the baselines even when recomputing them is cheap, or verdicts stop being
  reproducible.
- A connector that satisfies two connector types can quietly become both sides of a
  comparison that only means something when the sides are independent.
