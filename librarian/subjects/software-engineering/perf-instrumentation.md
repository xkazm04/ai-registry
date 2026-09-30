---
subject: perf-instrumentation
domain: software-engineering
last_touched: 2026-09-30
dry_streak: 0
---

# perf-instrumentation

First touch: 2026-09-30, a dispatched `/deepen` run (never swept by the librarian).

## State

6 -> 7 techniques, 2 -> 3 applications (all `react`/`rust`, one tree). Single-stack debt not retired.

Landed:

- `in-flight-visibility` (new technique) - a ring written at settlement is a
  survivor distribution; hangs enter late and clipped to the deadline, and a
  stalled loop suppresses its own samples (coordinated omission). Holds the
  in-flight gauge, oldest-open age and intended-start timing.
- `perf-data-lifecycle` amendment - percentiles do not compose; baselines
  store raw records, a mergeable histogram or refuse to combine.
- `ring-buffer-metrics` amendment - the "not a sketch" line now states when a
  sketch is right; golden path carries both.

Refuted nothing: nearest-rank, flags-over-heuristics and the observer-effect claims were not contested by the two lanes run (counter-evidence on merge/survivorship, one search each; the training-data-only lane was not run separately, so convergence is the two sources plus prior knowledge, not a blind lane).

## Leads

- Application for `startup-phasing` is rust only; other stacks absent.
- Suspend/sleep behaviour of monotonic clocks per platform was not checked; unverified, not banked as a claim.

## Impact

Joined pairs: goat 1, kp 1, pof 2, systedo-case 1; none stale (0 verdicts judged against a moved subject). Fleet `.ai/registry-map.json` files were regenerated locally and not committed by this run.
