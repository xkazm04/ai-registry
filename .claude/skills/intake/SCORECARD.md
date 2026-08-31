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
| 1.1.0 | 2026-08-30 | headlong-agent-microharness | 1 | 8 | 2 | 2 | 0c/0e/2s | 0 (record-only commit in ascent) | Ship 0: both simulations - the B arms need the production episode/turn store, which no local gate can see (declared focus 'start the gate first' was checked and failed honestly: vitest/tsc cannot observe spend cadence or history reach). One not-better verdict fed its condition back into the technique - the apply stage producing corpus content is the lane working as designed. |
| 1.2.0 | 2026-08-30 | operator-control-plane | 1 | 22 | 5 | 5 | 1e/0c/0s (4 unapplied, no seam) | 0 (fix filed, not shipped - triage pick named no project, so Phase 8 confirmation was never given) | **Declared focus hit.** Previous row's focus was 'pick the seam by instrument reachability first': `prose-rule-drift` -> ascent chose a seam whose instrument is IN the tree (a checker in the shared tooling lane, locally runnable, no production state) and it converted first try - arm A 0 violations, arm B **27 across four projects**, one invocation apart. Ship is still 0, but for the first time not because the instrument was unreachable: the change is a one-line gate wiring in someone else's repo and the operator has not confirmed the lane. **The run's largest output was a method fix, not content**: the source was triaged off 2,639 words of rendered landing page over a 168,969-word tree, the operator caught it, and SKILL.md 1.2.0 now requires a repository source to be mined from a clone (Phase 2b). Fourteen past repo sources audited by the new tell; three had the defect; two re-runs dispatched and both returned - one **refuted a prior run's accepted finding at its premise**. |
| 1.2.0 | 2026-08-31 | tigerbeetle | 1 (421 landing / 111,264 in-tree = 0.4% read fraction, recorded) | 15 | 4 | 1 | 0c/0e/1s | 0 (project edit never confirmed; operator steered the run to diagnosis) | **Declared focus hit**: the previous row asked that a repository source record its read fraction, and this row carries it. Landed 1 of 15 by operator choice, not by yield - the run's largest output was a corpus finding. First triage returned twelve process rows and **zero architecture rows from a database**; the operator rejected the framing and the audit found a **construction frontier** the bundle has never stated: it builds at the application layer and consumes everything below. Two method defects named - Phase 2b's operating-document examples are all process-flavored (I opened TIGER_STYLE.md and skipped ARCHITECTURE.md, the largest doc in the tree), and the strip test is biased toward process because architecture claims arrive wrapped in domain terms that read as proper nouns. |

## Weakest stage, as of the latest row

**research** - with 23 of 24 branches merged the apply and ship stages both convert,
and the wave that produced them consumed no external source at all: it ran on the
backtest's deviations. The funnel's front is now the one not being fed - the next run
should be a real `/intake <url>` whose landings are applied in the same run, so the
whole pipeline is exercised end to end rather than in two halves. Secondary, unchanged:
every Rust seam fell to experiment or simulation for want of a warm cargo gate.

**ship** (2026-08-30 second reading) - ship is still the losing stage, and two
consecutive runs now name the same cause with different faces: the B arm's
instrument lives in production state (a recorded-run store, an episode store)
that no locally startable gate can reach. The corrective is not "start the gate"
- it is to prefer, at Phase 7.5 seam selection, a seam whose instrument is IN
the tree (a fixture, a recorded log, a replayable script) over a sharper seam
whose instrument is remote. Next run's declared focus: pick the seam by
instrument reachability first, effect size second, and record the trade.

**apply/ship (2026-08-30 third reading)** - the seam-reachability corrective
worked and should be kept: one `experiment` row converted on the first attempt
because its instrument was a script in the tree rather than a store in
production. Ship remains 0 for a **different** reason than the last two runs -
not an unreachable instrument but an unconfirmed lane, which is a cheaper
blocker and one only the operator can clear.

The stage the funnel is now losing most at is **extract**, and this run makes the
mechanism visible for the first time. Fifteen candidates reached the table and every
one was process; the source's densest document was never opened, and the eight
architecture claims that eventually surfaced did so only because the operator rejected
the triage. Extract is not losing rows to carelessness - it is losing a whole *class* of
row, silently, because two filters compound: Phase 2b's operating-document examples read
as process, and the strip test reads domain vocabulary as proper nouns. Neither failure
produces a declined row, so neither is visible in any count.
| 1.3.0 | 2026-08-31 | genesis-agi | 1 | 13 | 3 | 3 | 0c/3e/0s | 0 (no project confirmed) | Ship 0: operator directive named a focus, not a project, and Phase 8 step 2 gates any project-tree write - so a real reachable defect found in goat with a paired measurement is filed, not fixed, and the three seam records are owed. Declared focus MET: the source note names opened and unopened documents by name, and the honest sample is ~15% of the memory subsystem with the two largest files skipped. First run where BOTH `better` verdicts amended the corpus from the A/B tree rather than the source - the apply stage acting as a second source, not a checkbox. |

Next run's declared focus: **ship.** The funnel has lost its last stage on all five
source-driven runs since the apply lane landed, and four of five name the same cause -
the triage pick named no project, so Phase 8's confirmation was never given. This is a
method defect, not a capability one (see the redesign proposal in `LESSONS.md`, 1.3.0).
Until the invocation can carry a standing project authorisation, a run that reaches a
`better` verdict must at minimum name, in its scorecard row, the exact one-sentence
confirmation it would have needed - so the cost of the missing affordance is counted
rather than restated as a shrug.
