---
layer: application
type: application
subject: bounded-enumeration
technique: after-plus-limit-not-cursor
stack: rust
status: forged
verified_on: 2026-09-26
verified_against: rust@1
applied: simulation
ab_verdict: better
---

# A `ts|tiebreak` token in Pumper: the position is the delivered row's sort tuple

Pumper at `aed8915` (Rust/axum over SQLite through sqlx 0.8) calls its
position parameter `cursor` and documents it as opaque. It is neither a key
nor opaque: it is `<timestamp>|<tiebreak>`, the sort tuple of the last row
the page delivered, in plain text. Every paged list in the tree is ordered
by a timestamp. None is in key order, so a bare `after` key could not say
where a page ends. This application records what the technique's
"never a cursor" rule becomes when the order is not the key's own order.

## The position is the sort tuple, built from what was delivered

`crates/server/src/routes/error.rs` `keyset_cursor` builds the next position
from `items.last()`, the last row of the returned page. It returns one only
when the page came back full. The record list encodes
`(updated_at, key)`. The change feed and history encode
`(created_at, rowid)` and `(created_at, revision)`, built inside the store
(`crates/core/src/datasets.rs` `RevisionPage`) because the tiebreak differs
per feed.

The feed's `rowid` is not a field of the delivered revision, so the caller
holds a position component it was never shown as data. That is harmless:
Pumper has no per-key read filter, so there is no hidden row the rowid could
name. It does mark where the technique's no-leak argument actually rests. A
token is not a leak because it is a token. It leaks when it is computed from
a row the caller was not given.

## The seek predicate and the ORDER BY must be one tuple

`history_page` once ordered by `revision DESC` while its predicate cut by
`created_at` first. A revision stamped out of step with its number (a
backdating import, clock skew within a batch) then fell on the wrong side
of the page boundary and was skipped or repeated. The fix led both on
`created_at` with `revision` as the tiebreak. It is pinned by
`history_page_survives_clock_skew_without_skip_or_repeat`, which scrambles
five stamps and walks one row per page. This is the technique's
"strictly greater" rule stated for tuples: the comparison is over the whole
ordered tuple, in the ORDER BY's own column order, with a unique last
column.

## A malformed position is refused, a blank one starts

`parse_cursor` returns `None` for both a blank value and one it cannot
split, so garbage reads as "first page". On the change feed and history,
the two surfaces a mirror walks, that collapse was a livelock. A corrupted
token rewound the walk to the newest revision with a 200. Every page
deduplicated against what was already applied, and the run reported `ok`
forever. `parse_cursor_arg` now answers 400 naming the expected shape. A
blank value still means "start", because on these routes the parameter's
presence is what selects the paged response shape. Browse routes (`/jobs`,
`/watches`, the record list) keep the lenient parse on purpose: a human sees
the restart, and it costs nothing.

## Simulation: the conditioned rule over every paged site in the tree

The rule under test: a position may be a token when the order is not the
key order, provided every component comes from the last delivered row and a
malformed token is refused where a program walks. The old absolute was
"never a cursor".

- **Fourteen sites in `crates/server/src/routes` emit a next position.**
  Every one encodes a timestamp plus a unique tiebreak (`created_at|id`,
  `updated_at|key`, `updated_at|host`, `created_at|rowid`,
  `created_at|revision`). None is in key order. The absolute flags all
  fourteen.
- **The conditioned rule flags none of them** for the token itself. None
  has a bare key that could express the position, and each is built from
  the last row delivered.
- **On the malformed-token clause**, it flags a lenient parse only where a
  program walks the route. Those are the change feed and history, exactly
  the two routes the tree moved to the strict parse after the livelock. The
  nine remaining lenient `parse_cursor` call sites serve browse routes, and
  they pass.

What would falsify this: a paged route whose token is built from an
examined-but-filtered row. The tree has none, because nothing filters per
key.

Verdict: better. The condition removes fourteen false positives, and it
keeps the one failure the tree actually shipped.
