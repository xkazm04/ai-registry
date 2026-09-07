# Supabase as the `database` connector

What was learned compiling this digest from Supabase specifically. Nothing here is part of the
recipe: bind a different database and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**Count in the database, not in the client.** A digest is a set of grouped counts, and pulling
rows to count them is both slow and subject to the REST layer's row limit, which truncates
without erroring. An aggregate returned as a single row is exact and cheap; a page of rows
counted client side is a number that quietly caps out and then reports a flat period.

**The period boundary is a time zone decision and it is invisible when it is wrong.**
Timestamps are stored with a zone, but the boundaries of "last week" are the adopter's local
week. Compute the boundaries explicitly in the adopter's zone rather than letting the session
default decide, otherwise the digest silently includes or excludes an evening's activity at
each end and the period-over-period comparison inherits the error twice.

**Row counts on large tables are estimates unless you ask for them exactly.** The planner's
estimate is fast and approximately right, an exact count is a scan. For a digest, the movement
matters more than the absolute, so an estimate is usually the right trade, but the digest must
say which it used or two readers comparing it against a dashboard will disagree.

**Soft deleted rows are still rows.** Where the schema marks deletion with a column rather than
removing the row, a count without that filter grows monotonically and reports growth that is
not happening. Decide once per table whether the digest counts live rows or all rows, and keep
that decision beside the query rather than in the reader's head.

**The anomaly record is a separate source with its own failure.** If it lives in another table
or another service, its absence is not zero anomalies; it is an unread source, which is exactly
the distinction this recipe is built on and the place it is easiest to lose.

## What transfers to any database connector

- Aggregate at the source; a client side count is capped by whatever page size you did not set.
- Fix the period boundaries in the reader's time zone and state them.
- Say whether a count is exact or estimated, because the reader will compare it with something.
- Decide once whether deleted rows count, and record the decision with the query.
