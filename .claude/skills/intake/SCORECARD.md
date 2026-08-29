# Scorecard - intake

One row per run. The five stages are the pipeline this skill exists to master:
**research -> extract -> test -> apply -> ship.** `apply` is written as
`<code>c/<experiment>e/<simulation>s`. A zero in `apply` or `ship` carries its reason
in the last column. After appending, read the last ten rows and name the stage the
funnel loses most at under the table; that stage is the next run's declared focus.

| Version | Date | Source | Research | Extract | Test | Landed | Apply | Ship | Zero reason / focus moved? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.15.0 | 2026-08-29 | ai-native-sdlc-and-ci-on-call | 2 | 15 | 8 | 5 | 0c/0e/0s | 0 | Phase 7.5 did not exist; run landed five and applied none. Backfill owed: `oracle-frozen-during-repair`, and the four amendments. |
| 1.0.0 | 2026-08-29 | apply wave 1 (backtest deviations, personas + gravity) | 0 (no source - apply-only run) | 0 | 0 | 0 | 24c/4e/1s | 24 branches, 0 merged | First run of the apply lane. 29 rows: 27 better / 1 not-better / 1 unmeasurable. Ship column counts branches the operator has not merged; ship is now the weakest stage. |

## Weakest stage, as of the latest row

**ship** - the funnel for the apply wave is 29 tested -> 27 better -> 24 branches -> 0
merged. Apply converts now (the debt was 5 owed, 29 paid in one wave); nothing after
it does, because the operator has not read 24 branches. Next run's focus: ship - either
merge the branches after review or record why not, and stop minting branches faster
than they are read. Secondary: 24 of 29 rows are code mode on the TypeScript side;
every Rust seam fell to experiment or simulation because no bounded cargo gate was
reachable - a warm Rust gate is the instrument the next wave needs.
