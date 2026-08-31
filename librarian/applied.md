# Applied ledger

One row per Phase 7.5 A/B test run by `/intake` (see
[`.claude/skills/intake/SKILL.md`](../.claude/skills/intake/SKILL.md)). A technique
with no row here has never been tested against a managed project and is, for this
registry's purposes, a wiki page. `/intake apply <technique>` reads this file to find
the oldest unapplied technique. Slugs, modes, verdicts and dates only - never a
project's paths; the seam lives in the project's own `.ai/applied.jsonl`.

Modes: `code` (A/B in the tree behind a flag or branch) / `experiment` (a harness over
the same inputs, product code unchanged) / `simulation` (three real cases from the tree
or its history walked under both policies, with what would falsify the prediction).
Verdicts: `better` / `not-better` (a rejection - the technique gains a condition) /
`unmeasurable` (must name the instrument).

| Date | Technique | Subject | Project | Mode | Verdict | Return condition / note |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-08-31 | self-paced-intake | admission-queue | personas | simulation | better | emit the per-drain batch size and read its distribution; the tree counts dropped records but not batch sizes, so proof is structural-only |
| 2026-08-30 | prose-rule-drift | quality-gates | ascent | experiment | better | 27 drift violations across 4 projects found by a checker nothing invokes; fix filed, not shipped - awaiting operator confirmation to touch the tree |
| 2026-08-30 | failure-attribution (8th owner) | eval-harness | - | - | unapplied | when a managed project runs an agent loop whose termination policy can cut a run short; no project currently owns one |
| 2026-08-30 | measurement-revision | eval-harness | - | - | unapplied | when a project revises a published measurement; nothing in the fleet has re-run a circulated result |
| 2026-08-30 | brief-carries-the-session (review brief) | fleet-orchestration | - | - | unapplied | not tested this run - no simulation was run, so no verdict is claimed. Return when a review dispatch can be run twice against one artifact, one arm carrying the producer narrative and one withholding it; the read is whether the verdicts differ |
| 2026-08-30 | task-envelope (specificity ladder) | prompt-assembly | - | - | unapplied | when a managed project dispatches to a weaker-tier model; the fleet routes to one tier today |
| 2026-08-29 | session-registry | fleet-orchestration | personas | code | better | branch `apply/session-registry` reviewed and merged 2026-08-29 |
| 2026-08-29 | fail-loud-classification-default | hitl-approval | personas | code | better | branch `apply/fail-loud-classification-default` reviewed and merged 2026-08-29 |
| 2026-08-29 | incident-promotion | self-healing | personas | code | better | branch `apply/incident-promotion` reviewed and merged 2026-08-29 |
| 2026-08-29 | editor-interop | markdown-vault | personas | experiment | better | ship as the project's next change |
| 2026-08-29 | safe-mode-guarding | sql-console | personas | code | better | branch `apply/safe-mode-guarding` reviewed and merged 2026-08-29 |
| 2026-08-29 | template-anatomy | templates-scaffolding | personas | code | better | branch `apply/template-anatomy` reviewed and merged 2026-08-29 |
| 2026-08-29 | rotation-and-remediation | credential-vault | personas | code | better | branch `apply/rotation-and-remediation` reviewed and merged 2026-08-29 |
| 2026-08-29 | empty-and-degraded-chart-states | data-viz | personas | code | better | branch `apply/empty-and-degraded-chart-states` reviewed and merged 2026-08-29 |
| 2026-08-29 | unpriced-span-accounting | trace-rollup-and-attribution | personas | code | better | branch `apply/unpriced-span-accounting` reviewed and merged 2026-08-29 |
| 2026-08-29 | derived-trace-rollup | trace-rollup-and-attribution | personas | code | better | branch `apply/derived-trace-rollup` reviewed and merged 2026-08-29 |
| 2026-08-29 | first-run-and-quiet-silence | session-resume | personas | code | better | branch `apply/first-run-and-quiet-silence` reviewed and merged 2026-08-29 |
| 2026-08-29 | field-defaults-and-bounds | draft-editing | personas | code | better | branch `apply/field-defaults-and-bounds` reviewed and merged 2026-08-29 |
| 2026-08-29 | stop-reason-ledgers | agent-chaining | personas | code | better | branch `apply/stop-reason-ledgers` reviewed and merged 2026-08-29 |
| 2026-08-29 | event-registry | realtime-events | personas | code | better | branch `apply/event-registry` merged 2026-08-29 together with the repair it demanded: 7 names folded into the registry with payload types, the onboarding listener re-pointed at a producer that exists |
| 2026-08-29 | three-state-outcomes | health-checks | personas | code | better | branch `apply/three-state-outcomes` reviewed and merged 2026-08-29 |
| 2026-08-29 | queue-ordering-and-identity | triage-queues | personas | code | better | branch `apply/queue-ordering-and-identity` reviewed and merged 2026-08-29 |
| 2026-08-29 | suite-partitioning | test-harness | personas | code | better | branch `apply/suite-partitioning` reviewed and merged 2026-08-29 |
| 2026-08-29 | sink-abstraction | usage-analytics | personas | code | better | branch `apply/sink-abstraction` reviewed and merged 2026-08-29 |
| 2026-08-29 | activation-and-funnel-honesty | usage-analytics | personas | code | better | branch `apply/activation-and-funnel-honesty` reviewed and merged 2026-08-29 |
| 2026-08-29 | tombstone-propagation | sync-replication | personas | experiment | better | ship as the project's next change |
| 2026-08-29 | diff-honesty | diff-comparison | personas | code | better | branch `apply/diff-honesty` reviewed and merged 2026-08-29 |
| 2026-08-29 | persistence-and-migration | client-state | personas | code | better | branch `apply/persistence-and-migration` reviewed and merged 2026-08-29 |
| 2026-08-29 | async-race-guards | client-state | personas | code | better | branch `apply/async-race-guards` reviewed and merged 2026-08-29 |
| 2026-08-29 | project-identity-and-joins | multi-project | personas | simulation | better | ship as the project's next change |
| 2026-08-29 | scale-conversion-of-numbers | content-research-grounding | gravity | code | better | branch `apply/scale-conversion-of-numbers` reviewed and merged 2026-08-29 |
| 2026-08-29 | precision-limit-propagation | evidence-bound-visuals | gravity | code | better | branch `apply/precision-limit-propagation` reviewed and merged 2026-08-29 |
| 2026-08-29 | edit-plan-over-regeneration | review-iteration-loops | gravity | code | better | branch `apply/edit-plan-over-regeneration` reviewed and merged 2026-08-29 |
| 2026-08-29 | evidence-grading-ladder | content-research-grounding | gravity | experiment | not-better | when facts[] carries sources[] on the load-bearing rows - or when a gate refuses a `source` string holding more than one publication-shaped token. The seam class is 'render-surface change over an unmigrated data layer'; do not re-run the chip test until the data moves. |
| 2026-08-29 | prompt-dialect-matching | image-prompt-composition | gravity | experiment | unmeasurable | pipeline/build-style-trials.mts re-run dialect-matched - the repo's own 6-style x 5-beat grid, 60 graded cells per policy, scored usable = on-brief AND free of text. The existing 60-cell trial that demoted the caption-class provider ran one dialect's prompt across both classes, so it is the same instrument with the confound removed. |
| 2026-08-30 | engagement-paced-cadence | cost-metering | ascent | simulation | better | upgrade to experiment when the episode store can be queried: count consecutive declared-silence episodes per org; the cheap-probe lever needs no cron change |
| 2026-08-30 | tiered-history-projection | prompt-assembly | ascent | simulation | not-better | technique gained its adoption gate from this seam; return when stored conversations routinely exceed the flat tail (countable from the persisted turns) |

## Backtest waves

| Date | Projects | Pairs judged | Technique C / D / N-A / U | Proposals | Note |
| --- | --- | --- | --- | --- | --- |
| 2026-08-29 | personas, gravity | 150 | 193 / 364 / 503 / 37 | 64 | [[backtests/2026-08-29-personas-gravity-wave-1]] |
| 2026-08-30 | verifier-coverage-review-agenda | unattended-build-loop | pof | experiment | better | file the reporting change (per-feature reached rung, per-gate verdict count, unjudged list in the completion summary) as pof's next harness change; re-run as `code` when the visual gate can start on this machine |

A backtest verdict is not an A/B row: `conformant` says the project already realizes
the technique (the seam exists and holds), `deviation` names the seam where an A/B is
owed. Rows in the table above are minted from deviations, one project per technique.

## Unapplied backlog (owed, oldest first)

- `oracle-frozen-during-repair` (quality-gates) - landed 2026-08-29 by intake; candidate
  seams: any managed project running agent repair tasks with hooks in `.claude/settings.json`.
- `gate-laddering` amendment (asking controls at stage boundaries) - 2026-08-29.
- `eval-economics` amendment (configuration in the golden-set trigger) - 2026-08-29.
- `self-healing` two-ladders amendment and `failure-diagnosis` rule - 2026-08-29.
