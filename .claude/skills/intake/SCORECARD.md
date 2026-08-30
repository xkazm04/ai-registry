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
| 1.1.0 | 2026-08-30 | tesana-loop-mode-game-builds | 1 | 13 | 1 | 1 | 0c/1e/0s | 0 (record-only commit in pof) | Ship 0: the `better` change touches three harness files and the gate that would see it (visual-check) cannot start on this machine, so it is filed as the project's next change rather than committed unpaired. First end-to-end `/intake <url>` run since the apply lane landed: research -> extract -> test -> apply all converted on one source. |

## Weakest stage, as of the latest row

**research** - with 23 of 24 branches merged the apply and ship stages both convert,
and the wave that produced them consumed no external source at all: it ran on the
backtest's deviations. The funnel's front is now the one not being fed - the next run
should be a real `/intake <url>` whose landings are applied in the same run, so the
whole pipeline is exercised end to end rather than in two halves. Secondary, unchanged:
every Rust seam fell to experiment or simulation for want of a warm cargo gate.

**ship** (2026-08-30 reading of the last ten rows) - every stage converted on this
run except ship, and ship fell for the same reason as the wave before it: the gate
that would see the change is unreachable on this machine (then `cargo check`, now a
visual gate whose dev server never starts). Next run's declared focus: before
Phase 7.5 picks a mode, start the gate the technique's B arm needs and record
whether it can run; a `code` landing on a warm gate is what moves this column.
