# Scorecard - intake

One row per run. The five stages are the pipeline this skill exists to master:
**research -> extract -> test -> apply -> ship.** `apply` is written as
`<code>c/<experiment>e/<simulation>s`. A zero in `apply` or `ship` carries its reason
in the last column. After appending, read the last ten rows and name the stage the
funnel loses most at under the table; that stage is the next run's declared focus.

| Version | Date | Source | Research | Extract | Test | Landed | Apply | Ship | Zero reason / focus moved? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.15.0 | 2026-08-29 | ai-native-sdlc-and-ci-on-call | 2 | 15 | 8 | 5 | 0c/0e/0s | 0 | Phase 7.5 did not exist; run landed five and applied none. Backfill owed: `oracle-frozen-during-repair`, and the four amendments. |

## Weakest stage, as of the latest row

**apply** - the funnel is 2 -> 15 -> 8 -> 5 -> 0 -> 0. Every stage before apply is
converting; nothing after landing is. Next run's focus: apply. Its row must show a
non-zero apply column or the reason it could not, and `/intake apply
oracle-frozen-during-repair` is the first backfill.
