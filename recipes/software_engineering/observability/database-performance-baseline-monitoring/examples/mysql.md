# MySQL as the `database` connector

What was learned mapping this recipe onto MySQL specifically. Nothing here is part of the
recipe: swap the engine and this file stops applying while the recipe does not change.

## What the mapping has to decide

**The replication lag column is not a lag measurement.** `Seconds_Behind_Source` in
`SHOW REPLICA STATUS` is computed from the timestamp of the event currently being applied,
so it reports zero whenever the applier has nothing queued, jumps when a long transaction
starts replaying, and goes NULL when the replication thread stops. A baseline over it learns
mostly zeroes and then reads a genuine stall as missing data. Prefer a heartbeat row written
on the source and read on the replica, and treat the built in column as a hint.

**`performance_schema` is where the timings are and it may be off or partly instrumented.**
It carries the statement digests this recipe wants for a slow query signal, but which
consumers and instruments are enabled is per install and some managed providers ship it
narrowed. Check what is actually enabled at adoption rather than assuming the tables are
populated; an empty digest table is indistinguishable from a quiet database.

**Threads_connected against `max_connections` is the saturation signal, and
`Threads_running` is the one that actually predicts trouble.** Connected threads sit idle in
pools all day; running threads climbing is what precedes the stall. Baseline both and treat
them as different metrics rather than two views of one.

**Status counters reset on restart, silently.** `SHOW GLOBAL STATUS` counters are since
server start, so a restart resets them to zero without any marker in the series. Read
`Uptime` alongside every sample and treat a decrease in it as a reset boundary rather than
letting the baseline absorb the cliff.

**InnoDB buffer pool hit ratio is a derived number with a bad reputation for a reason.** It
tends toward ninety nine percent on almost any healthy system and stays there while latency
degrades, so it is a poor deviation signal. Buffer pool pages free and read requests per
second move earlier and are worth the baseline instead.

## What transfers to any database connector

- A provider supplied convenience column is often a proxy with a different failure mode than
  the thing it names; find out what it actually computes before basing a verdict on it.
- Uptime, or any equivalent, belongs in every sample so counter resets are visible.
- A ratio that saturates near its ceiling on healthy systems cannot detect degradation.
- Idle and broken must be distinguishable from the sample itself, not from context.
