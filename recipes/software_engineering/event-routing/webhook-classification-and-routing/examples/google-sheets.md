# A spreadsheet as the `spreadsheet` destination

What was learned mapping this recipe's fan-out onto a spreadsheet. Nothing here is part
of the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**Appending a row is the one destination shape that cannot be made idempotent by the
destination.** Every other kind of write in this recipe has some natural key to hang
identity on. An append has none: send it twice and there are two rows, and no amount of
care at the receiver helps once the append has been issued. The consequence is specific,
and it is the reason this file exists: for a spreadsheet destination the repeat check has
to happen before the write, and the sender's delivery identity has to be written into a
column so the check can be made against the sheet itself rather than against a local
record that a restart can lose.

**A sheet is not a queue and it is the wrong place to hold what could not be delivered.**
It is tempting to use a tab as the durable fallback because it is already bound. It fails
the recipe's own criterion that the fallback be watched by age of oldest item, since
nothing about a spreadsheet reports that, and it usually loses the headers that
authenticated the payload because the columns were designed for the business fields.

**Column layout is a contract nobody versions.** The transform step shapes a payload into
a row against whatever columns exist today. Somebody inserting a column shifts every
later field by one, silently, for every event after that point. Where the connector can
address columns by header name rather than by position, use that; where it cannot, the
adoption owns the risk and should say so.

**Rate and size limits bite at exactly the wrong moment.** A burst of events is when
appends are most numerous and most likely to be throttled, and a throttled append at the
end of a fan-out means the event partly landed. Decide at adoption whether a partial
fan-out is retried in full or only for the destination that failed, because retrying in
full against a spreadsheet duplicates the rows that succeeded.

## What transfers to any destination connector

- Ask what identity the destination can hold, because a destination with no natural key
  makes the receiver responsible for the whole guarantee.
- A destination is not a queue; the fallback has to be something that reports its own age.
- A partial fan-out needs a stated retry policy, per destination, before the first retry.
