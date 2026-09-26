---
layer: application
type: application
subject: bounded-enumeration
technique: declare-the-inconsistency
stack: rust
status: forged
verified_on: 2026-09-26
verified_against: rust@1
applied: experiment
ab_verdict: better
---

# A records walk over `updated_at` in Pumper: measured, stated, and backstopped by an immutable feed

Pumper at `aed8915` (a Rust/axum data service over SQLite through sqlx 0.8,
toolchain pinned at 1.96.1) has two keyset walks, and the difference between
them is the condition this subject's seek guarantee needs. The change feed
and the per-key history page on `(created_at, tiebreak)`. A revision's
`created_at` is written once, so the rule in the technique holds there. The
record list and the export page on `(updated_at, key)` descending, and
`updated_at` moves on every change, so the "no entry that existed for the
whole iteration is skipped" guarantee does not hold on that walk.

## The walk that skips

`crates/core/src/datasets.rs` `list_records_view` is the one function
behind every records read shape. With a position it seeks `updated_at < t OR
(updated_at = t AND key < k)` and orders `updated_at DESC, key DESC`. Those
are the same tuple in the same direction, which is correct. The cursor-paged
form of `GET /datasets/{app}/{ds}` calls it once per request.
`crates/server/src/routes/datasets.rs` `stream_export` calls it in a loop of
1000-row batches for all three export formats. The docs said the export
streams and is "not buffered or capped". The SDK's README said a cold start
"streams a filtered snapshot". Neither said the batches are independent
reads.

The measurement is
`records_walk_misses_a_record_updated_mid_walk_and_the_change_feed_recovers_it`
in `crates/core/tests/datasets.rs`, run against the real temp-dir store:

- Four records.
- Page one returns the two newest.
- A control read from that position still returns `b, a`.
- The oldest record, `a`, is then updated.
- The walk finishes with `d, c, b`.
- `a` moved above the position, into the range already emitted, and appears
  on no page.
- The change feed read since the highest `updated_at` the walk saw returns
  exactly `a`.

36/36 in that test file pass.

## Why the product was already safe, and the reader was not

`clients/typescript/src/sync.ts` does a cold start through the export, then
sets its watermark to the highest `updated_at` it saw. Every later run reads
`/changes?since=` from that watermark, and that feed carries the jumped record.
So the SDK's mirror converges on its next run. That was not a design anyone
had written down; it is a consequence of the watermark choice. A consumer
that wrote its own client against the same two sentences in the docs, and
reconciled against the export (tombstone what the walk did not return),
would delete a live record that had only been updated. That is the quiet,
one-sided failure the technique names.

The seam change is one bullet in `docs/features/datasets.md` § Querying &
export, beside the parameter list:

- A records walk is not a snapshot.
- A record updated mid-walk jumps ahead of the position.
- Do not reconcile against a walk.
- The change feed since the walk's highest `updated_at` is the completeness
  path.
- The feed and history have no such gap, because `created_at` never changes.

The test pins that bullet. A verdict of better: the gap was real and
measured, and it had been unstated on the surface a consumer reads.

## What the tree adds to the technique

- **The guarantee is a property of the sort key, not of seeking.** Order a
  walk by a column that writes move, and a newest-first walk misses the moved
  row. An oldest-first walk sees it twice, and under steady writes may never
  reach the end. Pumper's two walks, side by side, show the line.
- **The consistent alternative need not be a transaction.** Pumper's is an
  immutable change feed replayed from a watermark the first walk produced.
  It is bounded per page, like every other read here. The "different
  operation" the technique asks for is the feed, not a snapshot.
