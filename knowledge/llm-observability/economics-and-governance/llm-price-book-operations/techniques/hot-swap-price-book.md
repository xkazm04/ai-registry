---
layer: technique
type: technique
subject: llm-price-book-operations
technique: hot-swap-price-book
status: forged
laws: [server-owns-the-accounting-clock, no-retroactive-restatement]
shared_with: []
use_when: [applying a provider price change without a restart, designing the admin write path for prices, keeping the in-memory book consistent with the database]
---

# Hot-swap price book

Provider prices change on the provider's schedule, not on your deploy
schedule. A price cut announced at noon should not bill the afternoon at
morning rates because the new number sits in a config file waiting for the
next restart. The technique: the book is served from memory for speed, owned
by the database for truth, and **updated live through one admin write path
that rebuilds and atomically swaps the in-memory copy** — no restart, no
window where readers see a half-updated book.

## The write path, in order

1. **Authenticate and authorize as admin.** The price book multiplies into
   every cost figure the product asserts; write access to it is write access
   to the meaning of every dashboard and every cap. It sits behind the
   administrative permission, never a per-project one.
2. **Stamp the row server-side.** The effective date is the server's clock at
   write time, per
   [server-owns-the-accounting-clock](../../../_laws.md#server-owns-the-accounting-clock)
   — not a client-supplied field. A caller who could write "effective last
   month" would be writing fiction into provenance; backdating is exactly the
   restatement door this subject keeps shut.
3. **Upsert to the database first.** The database is the book of record; the
   in-memory copy is a cache of it. Persist, then refresh — never the
   reverse, or a crash between the two leaves memory ahead of truth and the
   restart silently reverts a price change the admin saw succeed.
4. **Rebuild the whole book from a full re-read, then swap behind a write
   lock.** Not a single-key patch into the live map: reconstructing from the
   authoritative row set makes the in-memory state a pure function of the
   database, so no sequence of upserts, deletes, and races can accumulate
   drift between them. The swap is one pointer assignment under the lock;
   readers before it see the old book entire, readers after it the new book
   entire.

The read side stays cheap: resolution takes a shared read lock (or an atomic
snapshot pointer) per event batch. Price lookups sit on the ingest hot path;
the design goal is that a swap is rare-and-total precisely so that reads can
be constant-and-lockless-ish.

## Forward-only, by construction

A hot swap changes what *future* events will be stamped with. It does not —
cannot, in a correct implementation — touch events already priced, because
cost is written onto the event at ingest and never recomputed
([no-retroactive-restatement](../../../_laws.md#no-retroactive-restatement)).
This is not an implementation accident to document; it is the property that
makes live repricing *safe*. If a swap restated history, every price
correction would silently rewrite last week's reports, and admins would
rightly fear touching the book. Because it is forward-only, the worst a bad
write does is misprice traffic from now until the next write — bounded,
observable, and fixable by the same endpoint.

The swap therefore pairs with its own audit affordances: the write returns
the stored row (with its server-stamped effective date) so the admin sees
exactly what took effect and when, and the list endpoint reads back the
database, not the memory copy — comparing the two is the drift check.

## Decision rules

- **One write door.** Seeding at boot and admin upserts converge on the same
  persistence and the same rebuild-and-swap; a second path that "just pokes
  the map" for convenience is how memory and database learn to disagree.
- **Full rebuild over incremental patch, until measured otherwise.** Price
  books are small — hundreds of rows, not millions. Correct-by-construction
  beats clever until a profiler says the rebuild hurts, and it will not.
- **Deletes go through the same swap.** Retiring a row (a deprecated model)
  is a book change like any other; a delete that only touches the database
  leaves the ghost priced in memory until restart.
- **In a multi-node deployment, the swap needs a propagation story** —
  read-through with short TTL, a notification channel, or scheduled refresh.
  Choose one and state the staleness bound; an undeclared per-node lag means
  two nodes stamp the same minute's traffic at different prices, which is a
  reconciliation mystery nobody will trace to a rollout.

## When not to use it

- **When restarts are free and frequent** — a serverless or
  redeploy-per-change environment can treat the database as the only copy and
  skip the in-memory swap machinery entirely; the technique exists for
  long-lived processes on hot ingest paths.
- **For anything beyond prices.** The pattern is tempting as a general
  config-reload mechanism, but the price book earns its atomic-swap rigor
  from its accounting role; hauling arbitrary config through the same door
  dilutes the admin-permission boundary that guards it.
