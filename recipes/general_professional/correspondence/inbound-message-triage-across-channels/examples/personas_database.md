# The built-in database as the `database` connector

What was learned mapping this recipe onto the consuming application's own local store.
Nothing here is part of the recipe: swap the connector and this file stops applying while
the recipe does not change.

## What the mapping has to decide

**Duplicate rejection belongs in a constraint, not in application logic.** A unique index
over the pair of channel and the source's own message identifier makes the recipe's
"logged once" property cheap and, more importantly, makes it true under concurrency and
under the deliberate re-read the overlap window causes. Implemented as a lookup before an
insert it is a race, and the race is entered on every pass by design, because the overlap
guarantees the same rows are seen twice.

**The identifier is per channel, not global.** Two channels can hand out the same string,
so the constraint has to be on the pair. A single-column unique index on the message
identifier will silently swallow a real message from the second channel that happens to
collide, and the loss looks exactly like a message that was never sent.

**The cursor table and the message table have an ordering obligation between them.** The
position may only be written after the messages up to it are committed. If both live in
one store, one transaction gives that for free and it is worth spending the transaction.
If the cursor is kept anywhere else, the ordering becomes a rule somebody has to remember,
and forgetting it is silent data loss rather than an error.

**The configured channel list has to be its own table.** The coverage report distinguishes
attempted from read from failed, and a query over collected messages cannot produce a row
for a channel that returned nothing. Read the channel list first and join the results onto
it, or a dead channel simply has no line in the report and the pass looks complete.

**Confidence is a column, not a note.** The recipe hands classification confidence
downstream so the acting step can set its own bar. Stored as prose inside a payload it
cannot be filtered on, and the next thing anybody writes is a boolean beside it, which
restores exactly the collapse the recipe was avoiding.

## What transfers to any database connector

- Enforce idempotency with a constraint the database holds, because the overlap window
  means duplicates are the normal case rather than the exception.
- Scope a foreign identifier by its source. Identifiers are unique where they came from,
  nowhere else.
- Persist the position after the payload, and prefer a single transaction that makes the
  ordering impossible to get wrong.
- Coverage reporting needs the list of things that should have been read, stored
  separately from what was.
- Anything a downstream step must weigh has to be a field it can query.
