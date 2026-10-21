---
subject: simulated-audience-testing
domain: media-generation
last_touched: 2026-10-21
dry_streak: 0
---

# simulated-audience-testing

First note. Forged 2026-10-19 from Shadowrunr OS, the overlord checkout.
Both applications read the Rust `shadowrunr-sim` crate, so the scan ranked
the subject "single stack (rust)".

## State

6 techniques, 3 applications: rust x2 (overlord @ 4025231) and typescript
x1 (overlord @ 82c2c29). Depth rung L2 to L3. The new application rests on
a count over the 10 local tournaments' results, which is a measure, not a
reading. `check-currency --volatile` finds tournament figures (costs,
rates, a 20x multiple) the project measured itself, and durations it wrote
itself. No vendor-set quantity is stated, so there was no volatile fact to
re-source.

## 2026-10-21 - /deepen, single-stack dispatch (Curator)

- **Widen: second stack found and applied.** Overlord's TypeScript console
  reads `tournament.results` on its Simulator heatmap. Its main column,
  "Fails / provoked", summed every rule's checks in a cell and drew a 95%
  bound over the total. Each rule is judged once per run, so checks in one
  run share its host, seed and room. Over the 10 local tournaments, 107 of
  107 cells drew a bound whose n exceeded their judged runs. The worst was
  2 judged runs drawn as n = 95 with a 0-3.2% fail band, beside a "thin"
  chip. The Rust report it says it mirrors states no cell bound. Fixed in
  overlord 82c2c29: the cell counts rule fails over evaluated checks, adds
  Not evaluable, void judge and failed, and bounds only per rule. Count
  after: 0. Applied row: code, better. New `typescript` application.
- **Rule flipped (condition added):** `cheapest-passing-tier-selection`
  gained "a total over rules is counted, not bounded, unless run identity
  reaches the code that draws the interval". It also names a view
  downstream of a careful report as where this breaks. The golden path's
  clustering paragraph carries one sentence pointing there.
- **Counter-evidence (the tree, and training data on the statistics).** The
  rule of three (95% upper bound ~3/n at zero events) and a score interval
  over the normal approximation near 0 or 1 are textbook and held. Against
  the Rust application: the per-rule bound is sound on clustering, because
  a rule's n is runs (`results.rs:32`); its recorded deviation is the
  quality bound over facts (`summary.rs:66`), which still stands at HEAD.
  The sim crate has moved since 4025231 (10 commits touch the cited files).
  The Rust citations were not re-checked, so their `verified_on` stays.
- No web lane ran, and no convergence was claimed. The subject states no
  vendor-set facts, and the run's claims rest on the tree and its data.

## Impact

overlord: 2 pairs on this subject, both judged `deviation` against
revision 1 and now stale (2). `sim-runner-judging`: the winner needs only
one judged run and breaks ties on latency, not cost. `sim-instruments`:
the calibration's population proportions carry no source or assumption
label. Neither is touched by this run's fix. The console contexts are not
joined to the subject. systedo-case: 1 pair (`audience-goals-ltv`),
unjudged.

## Banked

- Re-read the Rust applications at overlord HEAD and move `verified_on`
  once the 4025231 citations are re-checked. Return: the next pass on this
  subject, or a `/conform --stale` on `sim-runner-judging`.
- Quality bounds are pooled over facts in the report, and the console draws
  them. Return: the report carries per-run quality, so a bound can be drawn
  over runs.
- The console's Simulator pages are not joined to this subject in the map.
  Return: the matcher joins console contexts by what they read.
