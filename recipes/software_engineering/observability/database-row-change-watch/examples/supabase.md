# Supabase database webhooks as the change stream

What was learned mapping this recipe onto Supabase's row change delivery. Nothing here is
part of the recipe: bind a different change source and this file stops applying while the
recipe does not change.

## What the mapping has to decide

**Not every database connector can push row changes at all, and this one does it two
different ways.** Database webhooks fire from a trigger on the table and post to an endpoint;
realtime subscriptions push over a socket to a connected client. They have different failure
modes and only one of them survives the watcher being offline. Establish which is bound before
promising anything about a gap, because a socket subscription that reconnects has simply lost
the changes in between and will not tell you.

**A webhook payload carries `old_record` and `record`, and both are snapshots of the row at
trigger time.** By the time the watch reads them the row may have changed twice more. Use the
payload to know which row to look at and then read the row; using it as the state is how a
watch reports an entitlement as revoked after it was restored.

**The trigger fires per row, not per statement.** A single `DELETE` touching a thousand rows,
or a cascade from one parent delete, produces a thousand deliveries with nothing in them
naming the statement that caused it. There is no transaction id in the default payload, so
collapsing has to be inferred: same table, same operation, arriving inside a short span, is
the usable proxy, and it should be stated as a proxy rather than as the transaction.

**A failing endpoint does not stop the writes.** The trigger posts and moves on, so a watcher
that is down loses changes silently and the application notices nothing. If the gap matters,
the watch needs its own catch-up read over the table since its last known position, and that
read needs a monotonic column to work from.

**Row level security does not apply to the trigger, but it does apply to the catch-up read.**
The webhook sees every row because it runs inside the database; a client reconnecting and
querying for what it missed sees only what its policy allows. The two paths can therefore
disagree about whether anything happened, which reads as the stream having gone quiet.

## What transfers to any change stream connector

- Ask whether the stream survives the consumer being offline before relying on it.
- A change payload names the row; it does not establish the row's current state.
- Where the source cannot name the originating statement, say that the collapse is a proxy.
- The live path and the catch-up path must have the same visibility, or silence is ambiguous.
