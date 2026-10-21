---
subject: show-segment-format-design
domain: media-generation
last_touched: 2026-10-21
dry_streak: 0
---

# show-segment-format-design

First note. Forged 2026-10-19 from Shadowrunr OS, the overlord checkout.
Both applications read the Rust segment runtime, so the scan ranked the
subject "single stack (rust)".

## State

5 techniques, 3 applications: rust x2 (overlord @ 4025231) and typescript
x1 (overlord @ 5258d9c). Depth rung L2 to L3. The new application rests on
a test in the tree that walks the table declarations, which is a measure,
not a reading. `check-currency --volatile` finds only self-authored
durations ("48-hour", "ten seconds") and a year. No vendor-set quantity is
stated, so there was no volatile fact to re-source.

## 2026-10-21 - /deepen, single-stack dispatch (Curator)

- **Widen: second stack found and applied.** Overlord's TypeScript console
  prints each segment table on its Segments page from the daemon's
  `segments.tables`. That call was a hand-written projection, frozen at
  the rules a table had when it was written. A daemon test that walks the
  four TOML declarations found 26 declared key paths in 9 rule blocks
  missing from the payload: SEG-01's cold open and per-state rules,
  screens on every table, SEG-02A's arc, search limit and Plebiscite
  length. Fixed in overlord 5258d9c: the projection destructures every
  struct without `..`, and the card prints each rule. Count after: 0.
  Applied row: code, better. New `typescript` application.
- **Rule flipped (condition added):** `segment-as-state-table` gained "a
  view of the table that anyone but the runtime reads is generated from
  the declaration and checked against it, key by key". The golden path
  names "the frozen view" as a failure mode.
- **Counter-evidence (the tree, against the subject's own files).** The
  console's handover sentence restated the rule apart from the
  interpreter: it left out that the audience path waits for the cold
  open, and it drew the grace period only after the ceiling, though the
  grace follows either path. Fixed in the same commit. Against the Rust
  application: two of its deviations ("no floor", "ops per segment, not
  per state") narrowed in b1b5774 (2026-10-20), after its 4025231 read.
  The cold open now has a floor, and the cold-open state narrows the ops.
  The Rust application gained a dated pointer. Its 4025231 citations were
  not re-checked, so its `verified_on` stays.
- No web lane and no blind training-data lane ran, and no convergence was
  claimed. The subject states no vendor-set facts, and the run's claims
  rest on the tree.

## Impact

overlord: 3 pairs on this subject. `segments-runtime` carries a
`deviation` verdict judged against revision 1, now stale (1). Its
evidence names commands per segment, missing guest allowances and premise
decks, and a segment with no exit. Part of that has moved since
(per-state ops for the cold open). `console-segments-page` and
`stage-kit-overlays` are unjudged. systedo-case: 2 pairs, none judged.

## Banked

- Re-read the Rust applications at overlord HEAD and move `verified_on`
  once the 4025231 citations are re-checked. Return: the next pass on this
  subject, or a `/conform --stale` on `segments-runtime`.
- The view shows the compiled-in table, not the run's effective one (a
  config override can skip the cold open). Return: the daemon exposes the
  per-run table.
