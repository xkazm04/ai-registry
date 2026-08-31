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
| 2026-08-31 | structural-centrality-lane | retrieval | personas | experiment | better | read-only A/B over the live 1,630-node corpus. Arm A (rank by the curated `importance` field): 5 distinct levels over the 510-node query-independent tier, 478 of 510 (93.7%) holding the schema default, so the tier's top-N is an arbitrary N drawn from one tie block. Arm B (graph derived from item content, no stored edges): 3,523 derived edges against 0 stored, 44 distinct levels, 0/10 top-10 overlap with arm A - arm A's own winner sits at centrality rank 470 of 510. Extends the 2026-08-27 finding on the same tree: the relation store is not merely unread, it is empty, and the curated path never started rather than decayed. Second finding not sought: the default-valued importance column is an `unknown-is-not-a-value` instance, which became a section of the technique rather than a footnote of the application. No product code changed. Return condition: retrieval *quality* needs a labelled query set this tree lacks for the companion path, and per-query personalization is unmeasured - only the uniform restart was exercised |
| 2026-08-31 | ranking-budgets amendment | retrieval | personas | experiment | better | read-only A/B over 1,105 episode nodes. Arm A (the budget as implemented - a count of 20 items, cost modelled per item and uniform): a fixed 20-item window renders between 1,560 and 39,212 chars, a 25.1x spread at constant budget, over items spanning 2 to 4,918 chars. Arm B (bisect over prefix length, measuring the rendered artifact per probe): bounds the quantity the consumer actually spends. The non-additive term is measurable - tier framing costs 83 chars paid once per non-empty tier, 17.9% of the block over the 20 smallest items and 0.14% over the 20 largest, a 128x swing in fixed-cost share that no per-item accounting can see. The tree gets the harder half right (a shared budget rather than per-lane quotas, documented as a scar it earned). No product code changed. Return condition: run as `code` when the companion path has an eval slice that can see answer quality, not only rendered size |
| 2026-08-31 | reliability-aggregation | eval-harness | personas | experiment | better | A/B in the project's own test runner over one trial set, two prompt versions x 3 scenarios x 3 trials: arm A (shipped mean-composite ranking) returns the spiky version as winner (73 vs 70), arm B (same trials, all-of-N added) returns the steady one - the leaderboard winner flips. Spiky is the technique's third reading (any-of-N 0.67, all-of-N 0.33). Probe deleted, no product code changed. Second finding not sought: an unscored metric averages to 0 and sorts as poor performance. Return condition: adoption needs a pass predicate this grid does not declare - the cheap intermediate (per-scenario spread beside the mean, no threshold) is the change filed first |
| 2026-08-31 | absent-status-passthrough | fleet-orchestration | personas | simulation | better | three cases from the tree. Case 1 already conforms and is the evidence: the auto-kill gate takes an optional state and fails closed on absence - but the optional is a map lookup's return type, not a modelled unknown, so the discipline holds only where the type system imposed it. The 8-member state vocabulary has no 'not stated', and the light-sleep path (which frees a live process) guards on a non-optional field. Bounded: the process scan feeds an operator list, not a reaper, and the reaping ticker never probes. Mode is simulation because the missing vocabulary member is both the defect and the reason it is invisible. Instrument named: adding the member makes transitions out of it countable before any gate changes |
| 2026-08-31 | critique-carries-its-fix | review-iteration-loops | gravity | experiment | better | tree already implements the rule's strong form independently (schema requires the fix, a shrug or echo is rejected, the loop ends rather than iterating). Gap is downstream accounting: settle predicate returns a bare boolean, 1 of 4 causes recoverable, abandoned replica takes full round-cap credit - 3 units never performed across 3 replicas. Return when a settle-cause field exists on the round record and the real share of unactionable settles can be counted |
| 2026-08-31 | capability-coverage-contract | agent-instruction-files | gravity | experiment | better | soundness 19/19 both directions, completeness 7 of 19 named in the planning surfaces; enumerated form writable today because the registry is generated. Second weaker seam checked and rejected rather than counted (deployment capability matrix 0 of 5, but read by product surfaces not by an agent choosing means). Return when the repo declares which unnamed skills are deliberate curation - until then an omission and a decision are the same artifact |
| 2026-08-31 | delivery-promise-lock | production-pipeline-phasing | gravity | simulation | better | `structural-only`: the promise exists and is locked before the means - the hard half, done independently - but carries no rules and is validated nowhere; three consumers only. Phase-state vocabulary uses one token for 'not required' and 'not obtained' and it ranks best in the worst-news merge. Return when a cut assembles mixed motion and slide grammar, which makes the anti-substitution ratio measurable rather than simulated |
| 2026-08-31 | operation-assertion-gates | quality-gates | personas | experiment | not-better | tree already refuses an empty scope in 4 of 4 checkers tested (arm B exit 1-2, never 0), so the rule moves nothing here; technique gained the tree-based-rule condition from this seam. Return when the 21 custom lint rules gain fixture tests and the per-rule suppression count can be re-read |
| 2026-08-31 | vendored-fork-ledger | supply-chain | - | - | unapplied | no seam in the fleet: none of the 7 managed projects carries a patched or vendored dependency (no manifest-level source override in any tree). Return when a project forks a dependency instead of waiting for upstream |
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
| 2026-08-31 | dual-anchor-scoring | reference-parity-gating | personas | experiment | not-better | a second anchor over the SAME representation is not a second authority - arm B flagged 2 of 4 specs and both were its own parser's artifacts. Seam class is 'gate over a text artifact whose only cheap second measurement re-reads the same document'; do not re-run a static second anchor here. Return when the golden-output eval layer exists and supplies a behavioural anchor. |

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

### 2026-08-31 - intake, genesis-agi (memory focus)

- `lane-reconciliation` (agent-memory) x goat - **experiment** - **better**. A: shipped
  write path, 2 of 4 category fixtures diverge record-vs-cache-lane and lose the write on
  reload, 0 detected. B: + read-only reconcile predicate, same 2 diverge, 2 detected,
  0 false positives. Return condition: re-run as `code` when the operator confirms the
  project lane - the fix is one shared key derivation, or an observable no-op path on the sync.
- `probe-without-write-back` (agent-memory) x goat - **experiment** - **better**. Call-site
  enumeration over a rank-feeding counter. A (count on the read path, suppress per caller):
  3 machine caller classes reach the counter, 3 flags required, new readers default to
  counting. B (shipped: uncounted read + explicit fire-once write): 0, 0, default correct.
  The tree's shape fed a new section back into the technique.
- `three-state-outcomes` per-class amendment (health-checks) x goat - **experiment** -
  **not-better**. Zero edits required to reach arm B: the tree's lint ratchet already carries
  a distinct cannot-run exit, refuses partial re-baselining, and asserts a non-empty
  population before trusting counts. Not a rejection - independent corroboration from a tree
  with no connection to the source. Return condition: re-test when a checker here grows a
  finding class whose enumeration can truncate mid-scan rather than fail outright.
- Seams NOT recorded in the project's `.ai/applied.jsonl` for any of the three: that is a
  project-tree write and the operator confirmed no project. Owed on the next confirmed run.
- `evidence-without-verdict` (machine-authored-documentation) x politicas - **code** -
  **better**, shipped. Seam: a design-quality detector's visual engine returned a finding or
  `null` from five places; four meant "could not measure" and one meant "measured and clean",
  and the caller collapsed them with `finding ? [finding] : []`. Three edits - a
  pass/fail/unresolved return, an advisory `contrast-coverage` rule so the denominator rides
  the findings array without becoming a failure, and a tally across both arms.
  Paired proof, both arms running the real exported `runVisualContrastFallback` over one
  stubbed page, 8 candidates: real findings 2 vs 2 and byte-identical, unmeasured candidates
  visible to a reader 0 -> 3, coverage line matching ground truth exactly (5 of 8 measured,
  3 unresolved with the correct reason breakdown). The change alters what the detector can
  say, not what it detects. Committed to the project's default branch, +92/-9, not pushed.
  **Three structural facts, none designed.** (1) The report had no skipped record type at
  all, so the conflation was forced by the record shape rather than chosen at the call site -
  a denominator cannot be added at a call site. (2) The vocabulary already existed one layer
  up: the browser-side analyzer speaks `unresolved` with reasons and its caller dropped them
  at the module boundary - `verdict-survives-boundary`, not an absent vocabulary. (3) The
  same repository implements `checked-vs-skipped-denominators` **exemplarily in a different
  gate** - its doc-sync hook prints four named skip classes at zero and says of its own
  informational block that it cannot fail a build. A discipline is adopted by a gate, not by
  a codebase, and the gate next door does not inherit it.
  And the defect demonstrated itself on this commit: the 77-second `eslint-staged` pre-commit
  hook passed by *not looking* - `.claude/skills/**` is an ignore pattern, so eslint exits 0
  with "File ignored". The detector that gates this project's design quality sits outside
  every one of the project's own gates, which makes the paired proof load-bearing rather
  than decorative.
  Return condition: the live-page rate - how often a selector actually goes stale - is the
  measurement this change makes possible and does not supply; the first real scan after
  `puppeteer` lands produces it. Open: `--no-advisory` still suppresses the coverage line,
  and 31 of the detector's 39 conflation sites are in four untouched engines.

- `speculative-work-admission` (admission-queue) x goat - **code** - **better**, shipped.
  Seam: the prefetch manager enqueued speculative arrivals into a 50-deep queue drained at
  the live concurrency limit, so under congestion a promoted prefetch lands after its value
  window. A/B on the real queue, 86-arrival scroll session, swept across the project's own
  network tiers: 3g 52 dispatches/18 useful -> 30/30 with zero waste; 2g 17/5 -> 10/8; 4g a
  no-op because the queue never saturates. More useful prefetches for less bandwidth - not a
  trade, because the waiting line was converting useful work into waste. The third arm is the
  finding: skipping ALL sources served 0/6 hover prefetches at both congested tiers, so the
  high-intent exemption is load-bearing and the technique gained a boundary section from it.
  Return condition: re-measure with the project's own hitRate/unused counters from a throttled
  browser session - the useful/wasted split rests on a modelled value window.
- `quality-axis-separation` (model-routing) x gravity - **simulation** - **better**.
  Three cases from the tree, decisive one from its recorded history: a frame-planning route
  whose first implementation used "nine roles, nine canned compositions" and produced "exactly
  the deck it deserved" - fast, deterministic, schema-valid, semantically worthless. A single
  outcome-fed quality score rates that maximal. Structural fact: the router has no quality term
  at all (static posture x turn-class ladder), so the failure is unreachable there - but the
  sink seam already exists as the typed descent trail, correct and feeding nothing, which is the
  state in which the shortcut is cheapest. Return condition: becomes measurable when the ladder
  gains a live-measurement ranker.
- `resource-denominated-bounds` (admission-queue) x goat - **simulation** - **unmeasurable**.
  Count bounds (maxSize 50 / maxConcurrent 3) where the scarce resource is bandwidth; the
  project already derives the count from its network tier, which is load-aware-admission done
  right. Whether payload cost varies enough to justify byte denomination is unknown here.
  Instrument named: per-source response size in the prefetch analytics; if p95/p50 exceeds ~10x,
  re-test byte-denominated admission against the count bound.
- `priority-and-fairness` amendment (admission-queue) - **unapplied, no seam**. No managed
  project shards capacity on a caller-minted key: goat's prefetch origins are internal and
  attested (which the amendment says is the safe case), gravity's router has no per-origin
  capacity, pumper's model access is a single-tenant chokepoint. Return condition: when a
  project grows a multi-tenant admission gate that runs before authentication.
- `unreadable-region-refusal` (document-text-extraction) - **personas, `code`, `better`,
  proof `ab-paired`.** Seam: the text-layer chunker counted pages with no text layer into
  a column and discarded which pages they were, at the moment it knew. Same binary ships a
  vision-model recognition command that takes a file. Arms: the same twelve-page input
  (four unreadable) through the project's own chunker test target, before and after.
  Regions detected 4 in both arms; regions **nameable to a caller** 0 of 4 -> 4 of 4;
  digest text `4 page(s) are scanned` -> `pages 2, 5-7 of 12`; readable pages still
  indexed in both. Chunker tests 8 -> 12, all passing. No schema change - the ranges ride
  an existing nullable metadata column the ingest was not writing. Return condition: the
  saving is **available, not realized** - nothing yet calls the recognition path with the
  region list, so re-test the cost arm when it does.
- `screen-then-confirm-detection`, `extraction-yield-bands`,
  `recognition-boundary-and-escalation`, `structural-amplification-caps`
  (document-text-extraction) - **unapplied this run.** Landed with the subject; the run's
  budget is one project per finding and it was spent on the seam above, which is the only
  one of the five with a live instance in the fleet. Return condition: `/intake apply`,
  oldest first - the recognition-boundary technique has the same seam and is the next one
  owed a row.
- `taxonomy-design` fourth-axis amendment and `swallowed-error-prevention` leniency
  amendment (error-handling) - **unapplied, no seam.** No managed project runs a
  recover-by-default reader over untrusted containers: the fleet's parsers either fail the
  whole document (the chunker above) or parse trusted internal shapes. The amendment's
  claim is about components that absorb by design, and nothing in the fleet absorbs by
  design. Return condition: when a project grows a lenient reader over foreign binary
  input, or adopts a third-party one whose recovery policy it must audit.
