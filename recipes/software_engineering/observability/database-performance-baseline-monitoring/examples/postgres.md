# PostgreSQL as the `database` connector

What was learned mapping this recipe onto PostgreSQL specifically. Nothing here is part of
the recipe: swap the engine and this file stops applying while the recipe does not change.

## What the mapping has to decide

**Most of the interesting numbers are cumulative counters, not gauges.** `pg_stat_database`
gives transactions, block hits and reads as totals since the counters were last reset, so a
baseline built on the raw column learns a ramp and every restart or `pg_stat_reset()` reads
as a cliff. Differentiate against the previous sample and record the reset timestamp
alongside, otherwise a routine restart produces a critical.

**Query timing needs an extension that may not be installed.** `pg_stat_statements` is where
per statement mean and total time live, and it is a `shared_preload_libraries` entry rather
than something the recipe can enable at adoption. Establish whether it exists before
promising a slow query signal, and note that its own contents are also cumulative and are
reset by `pg_stat_statements_reset()`.

**Replication lag has three different answers and they disagree on purpose.**
`pg_stat_replication` carries `write_lag`, `flush_lag` and `replay_lag`, which measure
different points in the pipeline. The one that matters for a read replica serving users is
`replay_lag`; picking `write_lag` because it is first in the row understates the lag a reader
actually sees. On an idle primary all three go stale rather than to zero, so an idle system
must not be read as a lagging one.

**Connection count is a saturation signal only against `max_connections`.** The absolute
number means nothing across instances; the fraction does, and PgBouncer or any pooler in
front changes what the database's own count is measuring. Record the pooler's presence at
adoption or the baseline is over a number nobody is actually varying.

**Transaction ID age is the one metric where a fixed threshold is right.** Wraparound is a
hard engine limit, not a behaviour of this workload, so `age(datfrozenxid)` climbing toward
the autovacuum freeze ceiling is a threshold breach and should not be softened into a
deviation from normal. It is the exception the rest of this recipe is written against.

## What transfers to any database connector

- Ask of every metric whether it is a counter or a gauge before it enters a baseline.
- Saturation signals need their own denominator recorded, not just their numerator.
- A metric that reflects an engine limit rather than this workload keeps its fixed threshold.
- An idle system and a broken collector look the same from a single sample; distinguish them.
