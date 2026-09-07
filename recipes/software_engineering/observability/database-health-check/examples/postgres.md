# PostgreSQL as the `database` connector

What was learned mapping this recipe onto PostgreSQL specifically. Nothing here is part of
the recipe: swap the engine and this file stops applying while the recipe does not change.

## What the mapping has to decide

**Bloat is an estimate, and it should be reported as one.** The widely copied bloat queries
work from `pg_stats` column widths and tuple counts, so they infer wasted space rather than
measure it. They can be wrong by a wide margin on tables with variable length or heavily
toasted columns. Report bloat with its method attached, and do not let an estimated figure
compete for rank with a counted one such as transaction age.

**Index usage counters are cumulative and reset without notice.** `pg_stat_user_indexes`
gives `idx_scan` since the last statistics reset, so an index that looks unused may simply be
younger than the counter. Read the reset timestamp from `pg_stat_database` in the same pass
and refuse to call an index unused unless the window behind it is longer than the slowest
query path in the application, which typically means a month rather than a week.

**Some of the most important checks cannot be answered from inside the database at all.**
Whether the last backup restored, whether the disk holding the WAL has room, and whether the
replica is actually serving reads are outside the SQL surface. They are the checks most worth
having, so name them as unchecked rather than omitting them, otherwise the report implies
coverage it does not have.

**Transaction ID and multixact age are the checks that most deserve the top of the list.**
`age(datfrozenxid)` against `autovacuum_freeze_max_age`, and the equivalent for multixacts,
measure headroom to a limit the engine enforces by refusing writes. This is a ratio with a
hard ceiling, which is exactly the shape this recipe ranks on, and it should outrank anything
whose worst case is slowness.

**A long running transaction is a health finding even when nothing looks wrong yet.**
An idle in transaction session in `pg_stat_activity` holds back the freeze horizon and stops
vacuum reclaiming anywhere in the cluster, so a single forgotten session is upstream of
several other findings. Report it as the cause rather than reporting its three symptoms.

## What transfers to any database connector

- An estimated figure and a counted one should never be ranked against each other silently.
- A counter with an unknown start is not evidence of absence.
- The checks that cannot be answered from inside are usually the ones that matter most; name
  them rather than letting their absence read as coverage.
- When one finding is upstream of three others, report the cause and suppress the symptoms.
