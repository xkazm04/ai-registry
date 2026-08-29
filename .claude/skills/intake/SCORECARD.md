# Scorecard - intake

One row per run. The five stages are the pipeline this skill exists to master:
**research -> extract -> test -> apply -> ship.** `apply` is written as
`<code>c/<experiment>e/<simulation>s`. A zero in `apply` or `ship` carries its reason
in the last column. After appending, read the last ten rows and name the stage the
funnel loses most at under the table; that stage is the next run's declared focus.

| Version | Date | Source | Research | Extract | Test | Landed | Apply | Ship | Zero reason / focus moved? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.15.0 | 2026-08-29 | ai-native-sdlc-and-ci-on-call | 2 | 15 | 8 | 5 | 0c/0e/0s | 0 | Phase 7.5 did not exist; run landed five and applied none. Backfill owed: `oracle-frozen-during-repair`, and the four amendments. |
| 1.0.0 | 2026-08-29 | apply wave 1 (backtest deviations, personas + gravity) | 0 (no source - apply-only run) | 0 | 0 | 0 | 24c/4e/1s | 23 of 24 branches merged (same day, director-reviewed diff + project gates: tsc, 188 vitest, 312 playwright-node) | First run of the apply lane. 29 rows: 27 better / 1 not-better / 1 unmeasurable. One branch held: its gate is deliberately red until a repair lands. |

## Weakest stage, as of the latest row

**research** - with 23 of 24 branches merged the apply and ship stages both convert,
and the wave that produced them consumed no external source at all: it ran on the
backtest's deviations. The funnel's front is now the one not being fed - the next run
should be a real `/intake <url>` whose landings are applied in the same run, so the
whole pipeline is exercised end to end rather than in two halves. Secondary, unchanged:
every Rust seam fell to experiment or simulation for want of a warm cargo gate.
