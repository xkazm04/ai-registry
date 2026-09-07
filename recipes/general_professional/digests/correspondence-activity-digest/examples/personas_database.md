# The built-in database as the `database` connector

What was learned mapping this recipe onto the consuming application's own local store.
Nothing here is part of the recipe: swap the connector and this file stops applying while
the recipe does not change.

## What the mapping has to decide

**Bind the store, never the channels.** This digest is entirely a read over what triage
and drafting already wrote. Pointing it at the mail or chat connectors would make it
re-read messages it has no reason to see, and would give it a second, differently-timed
version of the truth to disagree with. The rule that transfers: a readout over a pipeline
reads the pipeline's records, not the pipeline's inputs.

**Oldest-item age has to be a query, not a scan.** The headline number this recipe asks
for is the age of the oldest item still waiting on a human, per channel. That is cheap
only if the pending rows carry an indexed timestamp and a channel column; without them
the digest degrades into counting, which is the exact number the recipe says not to lead
with. Establish at adoption that the pending queue can be ordered by arrival time within
a channel.

**A channel with no rows is invisible unless the channel list is stored separately.**
The recipe requires a zero to be reported as a zero, and a query over the activity table
cannot produce a row for a channel that produced nothing this period. The set of
configured channels has to be its own record, read first, with the measurements joined
onto it. This is the single most common way this recipe silently stops holding: the digest
looks complete, the dead channel simply has no line.

**The previous readout is a row, not a message.** Trends and baselines need the last
period's figures, and reading them back out of the delivered digest means parsing prose
somebody may have edited. Write the measurements as a record at delivery time, and let the
delivered message be a rendering of it.

## What transfers to any database connector

- A readout over a pipeline binds the pipeline's own store, never the sources the pipeline
  reads from.
- The metric the recipe leads with must be indexable, or the recipe quietly reverts to the
  metric that is.
- Zeros come from the configured list joined to the measurements. A measurement table
  alone cannot report an absence.
- Store the period's figures as data at delivery, so the next period compares against
  numbers rather than against a rendered sentence.
