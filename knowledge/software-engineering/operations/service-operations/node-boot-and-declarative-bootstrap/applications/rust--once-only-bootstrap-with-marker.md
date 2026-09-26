---
layer: application
type: application
subject: node-boot-and-declarative-bootstrap
technique: once-only-bootstrap-with-marker
stack: rust
status: forged
verified_on: 2026-09-26
verified_against: rust@1.96
applied: code
ab_verdict: better
---

# A first-start seed with neither a marker nor a transaction: `tracklight`'s price book

tracklight's API seeds its model price book on first start and treats the database as the
source of truth afterwards. It is a small bootstrap. There is no privileged credential, and
the effect is a set of rows in one table. It sits exactly between the two shapes that
[once-only-bootstrap-with-marker](../techniques/once-only-bootstrap-with-marker.md) now
separates: effects that one transaction can hold, detected by emptiness. Before this pass it
had neither the transaction nor a marker.

## What it gets right

**First start is detected by state, not by a flag.** `if store.list_prices()?.is_empty()`
(`crates/api/src/main.rs:377`) seeds from `pricing.json`, or from the compiled-in book when the
file is absent or does not parse, and says which in the log. There is no `SEED=1` for an
operator to leave set.

**The seeded objects belong to the operator afterwards.** Rates are edited through
`PUT /v1/prices/:provider/:model` (`main.rs:607`) and are never reasserted from the file on a
later start. That is the technique's rule for objects edited through the API afterwards,
"apply once". The book has no delete route, so the emptiness check cannot be re-triggered by
an operator retiring rows.

## The collapse, observed on the real binary

The seed was a loop of `store.upsert_price(&row)?`, one statement per row. A failure on row
*k* exited the process with rows 1 to *k-1* stored, and the next start saw a non-empty book
and never seeded again. That is the collapse of *ran and did not finish* into *ran and
finished*, which is the failure the marker exists to prevent. To observe the next start, a
real seeded SQLite file (18 rows, written by the binary itself) was cut to its first 5 rows,
and the unmodified binary was started on it. It logged no seed and reported
`priced_models=5`, and it would do so on every later start. The 13 missing models are priced
at nothing until someone notices their cost is absent.

## The fix: the transaction is the marker

The store trait gains `seed_prices(&[ModelPriceRow])`, which writes the whole book as one
unit. SQLite runs it in one transaction (`crates/store/src/sqlite/prices.rs:49`), and so does
Postgres (`crates/store-pg/src/prices.rs:47`). A failure rolls back to an empty book, so the
same emptiness check seeds again on the next start. No marker key is needed, because no state
between "empty" and "complete" can survive. The Firestore backend keeps the row-by-row
default, and with it the hazard. Its REST client writes one document per call. The trait's
doc comment says so. The override there is a batched write that commits every row at once,
or failing that a marker.

The test `a_seed_that_fails_part_way_leaves_the_book_empty`
(`crates/store/src/sqlite/tests.rs:2925`) runs both arms on real SQLite. It makes row 2
fail through the store itself (a NaN rate binds as NULL and the NOT NULL rate column refuses
it). The transactional seed leaves 0 rows. The loop it replaced leaves 1. tracklight's
blocking gates (fmt, clippy `-D warnings`, the whole workspace's tests) passed with the
change at `53ff57f`.

## Not applicable

The technique's credential section has no counterpart here: the seed runs with the process's
own store handle, and it mints and holds no privileged credential.
