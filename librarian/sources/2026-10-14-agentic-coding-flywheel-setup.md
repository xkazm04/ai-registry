---
source: https://github.com/Dicklesworthstone/agentic_coding_flywheel_setup
kind: repository
url: https://github.com/Dicklesworthstone/agentic_coding_flywheel_setup
title: "The Agent Flywheel - one practitioner's published operating method for agent swarms, read against the audits of the projects it was run on"
author: Jeffrey Emanuel (first-party practitioner; about 212 public repositories forming one integrated agent-swarm stack)
commit: 5b02310cb13ff2c7721c0cb9fa0b8e23fe71042b
commit_date: 2026-10-14
evidence_trees: "frankengit 142adb9098d52ecdc2dd3a604270f28282bdfa24, frankensqlite be689fbc032e8b8cf30427b61141dcceb429a146, franken_engine 815ddcf8e16b4bda648d59d4126725ae02d3c571, apr a1d951f2874f0c361f2e867a4347e2294657ef74"
words: 239 landing / about 60,000 in-tree read across five pinned trees (about 20,300 by the design reader, about 40,000 delegated); 0 fetches
extracted: 27 (18 knowledge rows from 10 design entries and 14 claim candidates; 9 method rows from a 33-point peer study)
accepted: 3
declined: 0
leads: 1
already_covered: 8
untriaged: 6
dispatched: 0
applied: 6
shipped: 2
run_id: dle-r1-1014
siblings: 4
series: librarian/handoffs/2026-10-14-dicklesworthstone-series.md (round R1 of DLE-001..010)
rescan_when: "the published git-strategy lesson changes its no-worktree rule, or the batch-verification policy file (frankengit .beads/policy.yaml) gains an occupancy rule or is dropped, or frankengit's reality check is superseded at a newer revision; or 8 weeks elapse (2026-12-09)"
---

# The Agent Flywheel - intake 2026-10-14 (series round R1)

**Class:** first-party practitioner account in repository form, a build-walkthrough
hybrid. The published method (`agentic_coding_flywheel_setup`, pinned `5b02310c`) is the
tour half; the policy files, audits, task exports and negative-result ledgers of the
projects it was run on are the operating half. The landing page is 239 words (ingest
exit 3, thin, expected for a repository); everything below comes from clones. Four
evidence trees were read beside the method: `frankengit` (a git reimplementation built
by a swarm, with a revision-bound audit of its own process), `frankensqlite`,
`franken_engine` and `apr` (the author's plan-revision tool). Declared focus from the
last scorecard row: **ship**.

This is round R1 of a ten-round series on one practitioner who runs agent fleets at a
scale and breadth close to the operator's own. The charter, rounds and A/B form live in
[the series handoff](../handoffs/2026-10-14-dicklesworthstone-series.md). The operator's
bar for adopting anything into our own method is **measured A/B only**.

## License and what this run did not do

Since 2026-02-22 the author's repositories carry "MIT License (with OpenAI/Anthropic
Rider)", which names Anthropic and parties acting for its benefit as restricted, counts
automated analysis and indexing as use, and terminates the license on breach unless the
author grants express written permission. The Director paused ingestion and put the
question to the operator before reading further. The operator ruled **full intake, risk
accepted by the operator**. The run obeyed the charter's mitigations:

- No verbatim code or prose of the author's in any tracked file. Mechanisms are restated
  in our words. The one exception is the citation anchor this design record requires: a
  `path:line` plus a quoted substring of at most ten words, so `check-anchors.mjs` can
  verify it.
- Clones lived at a short scratch path and were deleted at run end, together with the
  scout copies made before the license was read.
- **Intake's "task row against the source tree" step was skipped**: a modified copy of a
  tree is a derivative work. Nothing was pushed, proposed or filed to the author's
  repositories.
- One rule in his templates (a borrowed HTTP user-agent, which three of his own consumers
  retracted on 2026-10-14) is recorded as a contradiction and never adopted.

## Design record

Anchor root: the run's clone directory holding five pinned clones; every anchor's first
segment names the clone (`acfs` @ `5b02310cb13f`, `frankengit` @ `142adb9098d5`,
`frankensqlite` @ `be689fbc032e`, `franken_engine` @ `815ddcf8e16b`, `apr` @ `a1d951f2874f`).
85 of 85 anchors verified by the Director with `check-anchors.mjs` (exit 0). Depth-1
clones: no git history was read; practice over time comes from in-tree records (task
exports, the reality check, ledgers). Evidence column: D = the author states it,
P = a policy file, contract, audit or export shows it practised.

### Planning

**E1. Plan-space front-loading, triangulated, iterated to convergence.**
- decision: most effort goes into one large markdown plan before any code; competing
  plans from several models are merged, then revised in fresh sessions until revisions
  converge.
- forces: a plan fits in a context window and a codebase does not; planning tokens are
  cheap and every plan fix is reused downstream; one model's bias needs a check.
- buys: whole-system reasoning settles architecture before work is split. Test:
  architecture debates reopened during implementation.
- rejects: incremental skeleton plans.
- where: `acfs/docs/methodology/THE_FLYWHEEL_APPROACH_TO_PLANNING_AND_BEADS_CREATION.md:229 "doing global reasoning while global reasoning is still possible"`;
  `acfs/docs/methodology/THE_FLYWHEEL_APPROACH_TO_PLANNING_AND_BEADS_CREATION.md:461 "synthesize them into a single superior plan"`; `acfs/docs/methodology/THE_FLYWHEEL_APPROACH_TO_PLANNING_AND_BEADS_CREATION.md:1747 "One Comprehensive Plan, Not Incremental Skeletons"`.
- stage: plan. evidence: D. Practised convergence is scored on the REVIEWER's outputs,
  not the plan: `apr/apr:4221 "Compare OUTPUT files (GPT responses), not spec files"`.
- corpus: PARTIAL - `heterogeneous-model-panels` (proposers + synthesizer), `plan-review`,
  `fresh-posture-self-challenge`. Unmodelled: "the plan fits in context" as the force,
  iterate-to-convergence as the stop rule (the corpus warns convergence after exchange
  reads as conformity).

**E2. Task records as executable memory.**
- decision: the plan becomes self-contained task records carrying context, dependencies
  and test obligations, polished several rounds and audited against the plan in both
  directions; afterwards the plan is a historical artifact.
- forces: agents lose context to compaction; no agent holds the whole plan; any agent
  must take any task cold.
- buys: execution never reopens the plan. Test: a fresh agent completes a task from its
  body alone.
- rejects: handing every agent the full plan.
- where: `acfs/docs/methodology/THE_FLYWHEEL_APPROACH_TO_PLANNING_AND_BEADS_CREATION.md:1753 "the plan becomes a historical artifact"`;
  `acfs/docs/methodology/THE_FLYWHEEL_APPROACH_TO_PLANNING_AND_BEADS_CREATION.md:917 "compaction matters less because each bead is self-contained"`;
  `acfs/docs/methodology/THE_FLYWHEEL_APPROACH_TO_PLANNING_AND_BEADS_CREATION.md:2282 "Every material plan element maps to one or more beads"`.
- stage: plan -> task records. evidence: D+P (1,398 records in the method tree's own
  export with context / what-to-do / acceptance bodies).
- corpus: PARTIAL - `remediation-handoff` (one self-contained artifact). Unmodelled:
  decomposition into a dependency graph; the two-way coverage audit.

### Task lifecycle

**E3. The task id is the join key.**
- decision: one id serves as the mail thread id, subject prefix, lease reason and
  commit reference.
- forces: coordination is split over three tools; agents die mid-task; recovery
  rebuilds the story from artifacts.
- buys: thread, claim and commits join mechanically. Test: share of commits and leases
  resolving to a live task.
- rejects: per-tool identifiers.
- where: `acfs/acfs/onboard/lessons/22_swarm_coordination.md:43 "Use the Bead ID everywhere else in the session"`;
  `acfs/docs/methodology/THE_FLYWHEEL_CORE_LOOP.md:732 "the coordination thread, and the work claim all line up"`;
  `acfs/AGENTS.md:534 "for traceability"`.
- stage: claim + commit. evidence: D, partly P - citation rate rose late
  (`frankengit/docs/REALITY_CHECK_AND_BRIDGE_PLAN.md:134 "rose from 35% to 87%"`); the
  lesson's own example commit omits the id (`acfs/acfs/onboard/lessons/22_swarm_coordination.md:217 "fix(checkout): validate checkout sessions"`).
- corpus: **NONE** - `resolution-trailers` keys only commit -> finding; `intent-ledgers`
  keys on the session; `remediation-handoff` warns against reading its artifact as a
  ticket. HOME IF NEW (instrument): backend-platform/work-execution; by stage,
  orchestration. Untriaged as K5 below.

**E4. Code-first waves with central batch verification.**
- decision: implementers write code + tests, run at most a syntax gate, move the task to
  a pending-verification state; one orchestrator runs the union verification per wave
  and alone closes, with evidence bound to a revision; policy forbids self-close and caps
  work-in-progress and verification debt.
- forces: parallel builds saturate the host; a self-reported pass is the worker's own
  paperwork; closures get pumped.
- buys: nothing closes on the implementer's word. Test: every close has a verifier other
  than the assignee and a SHA.
- rejects: the published method's self-close after self-review
  (`acfs/acfs/onboard/lessons/22_swarm_coordination.md:199 "Close the Bead only after the change is implemented"`).
- where: `frankengit/.beads/policy.yaml:2 "Only the batch-verify orchestrator closes work"`;
  `frankengit/.beads/policy.yaml:7 "forbid_self_close_after_in_progress"`;
  `frankengit/.beads/policy.yaml:38 "verification_debt:"`; `frankengit/AGENTS.md:331 "Agents do NOT run"`;
  `frankengit/AGENTS.md:340 "MUST name the commit SHA it was observed"`.
- stage: verify + close. evidence: P in one tree only; `franken_engine/AGENTS.md:223 "No self-certification: work is closed by an independent verifier"`
  but its policy gates one label only; frankensqlite and apr have implementers close.
- corpus: PARTIAL - `hitl-approval` (the producing identity cannot approve);
  `parallel-dispatch` named the debt bound and said nothing enforces it on any observed
  door - this policy file is such a door (corrected by K2). Unmodelled until K2: the
  verifier as a role with a queue, and how that role fails.

**E5. Fungible generalists, no leader, graph-routed self-selection.**
- decision: identical generalist agents pick the next task from graph metrics, mark it
  immediately, launch staggered; no coordinator agent.
- forces: agents crash and compact constantly; any special role is a single point of
  stall.
- buys: losing an agent costs throughput only. Test: kill any agent mid-wave and the wave
  completes.
- rejects: specialist or leader agents (`acfs/docs/methodology/THE_FLYWHEEL_APPROACH_TO_PLANNING_AND_BEADS_CREATION.md:2295 "relying on a special reviewer, architect, or coordinator agent"`).
- where: `acfs/docs/methodology/THE_FLYWHEEL_APPROACH_TO_PLANNING_AND_BEADS_CREATION.md:1262 "every agent is fungible and a generalist"`; `acfs/docs/methodology/THE_FLYWHEEL_APPROACH_TO_PLANNING_AND_BEADS_CREATION.md:1440 "uses graph-theory routing (bv) to choose the task that"`.
- stage: spawn + claim. evidence: D, contradicted by practice
  (`acfs/docs/operations/swarm-assignment-scopes.md:8 "--roles implementation:2,review,testing"`;
  `frankengit/AGENTS.md:460 "only the batch orchestrator closes a bead"`).
- corpus: PARTIAL - `shared-research-record` (no dispatcher, herding);
  `fleet-orchestration` recommends the opposite (a dispatcher carves disjoint scopes).
  Unmodelled: generalist-vs-specialist trade, ready-set claim semantics.

### Checkout and commit discipline

**E6. One shared checkout on main; advisory leases and guards instead of isolation.**
- decision: all agents edit one working tree and push to main; conflicts are handled by
  expiring advisory leases, a pre-commit lease guard and a destructive-command guard.
- forces: merging N branches cascades conflicts; branch contexts go stale; semantic
  conflicts survive textual merges and surface at once on one branch; rigid locks
  deadlock when the holder dies.
- buys: every agent sees the latest state. Test: time from a signature change to its
  callers adapting.
- rejects: branch-per-agent and worktrees (`acfs/acfs/onboard/lessons/21_git_strategy.md:21 "Branch-per-agent creates merge hell."`).
- where: `acfs/acfs/onboard/lessons/21_git_strategy.md:9 "All agents commit directly to"`; `acfs/acfs/onboard/lessons/21_git_strategy.md:33 "Logical conflicts survive textual merges."`;
  `acfs/docs/methodology/THE_FLYWHEEL_APPROACH_TO_PLANNING_AND_BEADS_CREATION.md:1337 "A rigid locking system would deadlock when an agent crashes"`.
- stage: work + commit. evidence: D; P for implementers only
  (`frankengit/AGENTS.md:309 "Swarm agents share ONE checkout on"`); self-scoped by the
  author (`acfs/docs/methodology/COMPLETE_X_POSTS_ABOUT_PLANNING_AND_BEADS.md:181 "This is especially true in the early stages"`).
- corpus: **CONTESTED** - `concurrent-vcs` models the same setting and chooses the
  opposite ("Multi-file work gets a worktree"; "A ledger without isolation is etiquette").
  `sub-file-claim-scope` models the lease mechanics. Resolved as K1.

### Verification

**E7. Claim contracts that can fail.**
- decision: a public claim gets a contract fixing exact wording, gates, required
  adversarial placements and which transferability classes may be claimed; the claim is
  forbidden if any gate fails or any row is missing.
- forces: retry storms, topology luck or a weak baseline manufacture wins; a missing row
  must not read as a pass.
- buys: wording is bound to the evidence class it earned. Test: delete a metric row and
  the claim fails.
- rejects: headline wins hiding losing placements (`frankensqlite/leapfrog_exit_criteria.toml:18 "must fail when throughput gains are produced by retry storms"`).
- where: `frankensqlite/leapfrog_exit_criteria.toml:6 "The claim is intentionally fail-able"`;
  `frankensqlite/leapfrog_exit_criteria.toml:31 "claim_forbidden_when_any_fail = true"`;
  `frankengit/VERIFY_SPEC.md:18 "are structured terminal outcomes, not success"`.
- stage: verify. evidence: P, one file (four sibling contract files are now inert
  pointers); absent from the published method.
- corpus: PARTIAL - `quality-gates`, `completion-claim-verification`,
  `claim-verification-and-provenance` each carry a part; none makes a claim's wording a
  contracted object refused before it is written. Untriaged as K10.

**E8. A reality check bound to a SHA, revised in place.**
- decision: a dated document compares stated design with what the code does, bound to an
  inspected SHA and toolchain, superseded in place with change marks, and says it is not
  a certificate.
- forces: a busy swarm drifts from the goal; status prose drifts from code.
- buys: a later reader knows what was checked, at which revision, and what was not.
- rejects: the method's one-shot status prompt (`acfs/docs/methodology/THE_FLYWHEEL_CORE_LOOP.md:1175 "Where are we on this project?"`).
- where: `frankengit/docs/REALITY_CHECK_AND_BRIDGE_PLAN.md:18 "This supersedes the 2026-09-23 snapshot in place."`;
  `frankengit/docs/REALITY_CHECK_AND_BRIDGE_PLAN.md:21 "Source was inspected at"`; `frankengit/docs/REALITY_CHECK_AND_BRIDGE_PLAN.md:24 "Nothing in it closes, reopens or verifies a bead."`.
- stage: review. evidence: P; stale against its own tree's HEAD (contradiction 9).
- corpus: MODELED - `docs-sync` (corrected in place with dates and measurements; names
  the commit of the last full pass). Catch (K17).

### Memory of failure

**E9. Incidents become standing rules, then mechanical guards.**
- decision: a dated incident becomes an instruction-file rule; where instructions fail it
  becomes a guard or a lint over the instruction corpus.
- forces: agents repeat failures; prose does not stop execution.
- where: `frankensqlite/AGENTS.md:413 "On Feb 10 2026, an agent set"`; `acfs/AGENTS.md:37 "You have a horrible track record of deleting"`;
  `acfs/scripts/lib/policy_lint.sh:5 "Detects drift in AGENTS.md, templates, onboarding lessons"`.
- stage: memory. evidence: D+P; propagation manual and lagging (contradictions 6-7).
- corpus: MODELED - `agent-instruction-files` (line-earning; a rule that must always
  hold does not belong in prose). Catch (K18).

**E10. A ledger of rejected ideas, read before work.**
- decision: every abandoned, reverted or rejected lever gets an entry with evidence and a
  retry condition; reading it is mandatory before performance work.
- forces: amnesiac fungible agents re-derive the same failed lever.
- where: `frankensqlite/AGENTS.md:159 "Before starting performance work, read"`;
  `frankensqlite/docs/progress/perf-negative-results.md:3 "This ledger records performance ideas that were measured and rejected."`;
  `frankengit/AGENTS.md:166 "Preserve disproven hypotheses in"`.
- stage: memory, read at work start. evidence: P only; absent from the published method;
  too large to read as written (contradiction 8).
- corpus: MODELED - `shared-research-record` (failures are results),
  `typed-contribution-vocabulary`. Catch, plus the retry-condition field (K7, untriaged).

### Routing count

| system | entries | NONE |
| --- | --- | --- |
| planning | E1, E2 | 0 (2 partial) |
| task lifecycle | E3, E4, E5 | 1 (E3) |
| checkout + commit | E6 | 0 (1 contested) |
| verification | E7, E8 | 0 |
| memory of failure | E9, E10 | 0 |

Shared HOME IF NEW: `backend-platform/work-execution` printed for the queries behind
E3-E5, of which only E3 is NONE. **Neither clause fires; no forge handoff.** The task
lifecycle cluster reaches three only on a loose reading, and its stage home would be
orchestration (claim/verify), not job queues, which is at its child cap. The method
lands as techniques and amendments inside existing subjects.

### Where the source contradicts its own record (the operating half)

1. **No leader, yet one verifier owns every close, and the seat emptied.** The tree's own
   audit: `frankengit/docs/REALITY_CHECK_AND_BRIDGE_PLAN.md:10 "a verification loop with nobody in it"`;
   `frankengit/docs/REALITY_CHECK_AND_BRIDGE_PLAN.md:12 "so the tracker refuses new claims"`; after a verifier was appointed,
   `frankengit/docs/REALITY_CHECK_AND_BRIDGE_PLAN.md:734 "No bead IcyIbis authored has been independently verified."` The published
   method still has implementers close (lesson 22 line 199).
2. **Compile before every commit, versus code-first waves.** `acfs/acfs/onboard/lessons/21_git_strategy.md:114 "run before every commit"`
   vs `frankengit/AGENTS.md:331 "Agents do NOT run"`; the audit:
   `frankengit/docs/REALITY_CHECK_AND_BRIDGE_PLAN.md:16 "73 of its 77 commits declare they were not compiled"`; the same agent file
   both forbids and mandates direct-main commits (`frankengit/AGENTS.md:238 "Never modify the default branch directly"` vs line 309),
   and the audit says `frankengit/docs/REALITY_CHECK_AND_BRIDGE_PLAN.md:325 "Both cannot be the rule."`
3. **No worktrees, versus isolation at every seat that must be trusted** - the
   orchestrator lane, the auditor's detached worktree, fleet integration checks
   (`frankengit/AGENTS.md:358 "the orchestrator's lane uses its own worktree and target"`;
   `frankengit/docs/REALITY_CHECK_AND_BRIDGE_PLAN.md:22 "in an isolated detached worktree"`;
   `acfs/docs/operations/swarm-fleet-collection.md:116 "in an isolated worktree before any"`).
   The shared checkout holds for implementers only, which is `concurrent-vcs`'s position.
4. **Fungible and leaderless, yet roles appear** (a git-operations agent, role slots in
   the assigner, builder and reviewer hosts).
5. **Convergence measures the reviewer, not the plan**
   (`apr/apr:4498 "0.35 * $output_signal + 0.35 * $change_signal"`); the README says
   word overlap (`apr/README.md:748 "Uses word-level overlap to detect stabilization."`),
   the code uses line overlap; inference, not executed: the similarity can exceed 1.0.
6. **"Cannot drift", but did** - project files point to a suite-wide file for the
   reward-hacking catalogue and work-graph rules, while the installer seeds that file
   from a template that has neither section (`acfs/install.sh:7704 "install_asset"`);
   the catalogue's names differ between homes.
7. **A retracted rule still ships** - three consumers retracted the borrowed HTTP
   user-agent on 2026-10-14 (`frankengit/AGENTS.md:484 "identify yourself honestly"`);
   the template still carries it and a test asserts it. Reported, never adopted.
8. **A read-before-work ledger nobody can read** - 648 entries, 187,061 words, no index,
   ordering flips mid-file.
9. **The reality check is stale against its own tree** (written at `2b7f35ac` on 09-27;
   HEAD `142adb9` on 10-14).
10. **Claims bypassed** (`frankengit/docs/REALITY_CHECK_AND_BRIDGE_PLAN.md:437 "Commits landed against open, unassigned beads without claiming them"`).
11. **No self-certification without enforcement** - by last-commenter proxy, 353 of
    1,092 closures in one tree and 148 of 453 in another were by the assignee
    (worker-computed from exports; not re-run by the Director).
12. **Closure on evidence vs self-attestation** - 252 of 1,390 closed records with an
    empty or one-word reason, all December-March, none after April (practice improved);
    the landing checklist trusts the agent's own gates-passed flag
    (`acfs/scripts/lib/landing_plane.sh:12 "LANDING_GATES_PASSED"`).

## Triage (Phase 5, v2.5 scored)

Expected yield said before the table: decision rules with conditions; mostly catches
against a mature agent-operations corpus; corroboration corpus-internal and from our own
record, so 0 fetches expected.

| # | lane | shape | eff | title | prior art | impact | read | G/R/C | decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| K1 | K | amendment | M | Isolation has a cost; the regime where a shared tree wins | concurrent-vcs/physical-isolation + invariants | corrects-claim | real gap | 3/1/2 | accept |
| K2 | K | technique | M | The verifier seat is a capacity resource | fleet-orchestration/completion-claim-verification, parallel-dispatch | new-technique | real gap | 4/0/2 | accept |
| K3 | K | amendment | S | Host contention is an environmental fault class | harness-fault-attribution/clear-the-environment-first | corrects-claim | real gap | 3/0/1 | accept |
| K4 | M/T | practice | M | A process artifact names its reader and retirement | none (law creation-names-reaper covers resources only) | none | partial | - | lead (law) + method backlog |
| K5 | K | amendment | S | Key coordination on the work item, not the session | concurrent-vcs/intent-ledgers, remediation-handoff/resolution-trailers | new-technique | partial | 2/1/1 | untriaged (G-R 1) |
| K6 | K | amendment | S | Worklists herd within claim latency | shared-research-record (bound on its no-herding claim) | corrects-claim | partial | 2/1/1 | untriaged (inference) |
| K7 | K | amendment | S | Every rejected idea carries its retry condition | shared-research-record/typed-contribution-vocabulary | new-technique | partial | 1/0/1 | untriaged (G-R 1) |
| K8 | K | technique | M | Code the evasion patterns with stable names | deterministic-run-verification (evasions list) | new-technique | partial | 2/2/2 | untriaged (names only, no definitions in the trees) |
| K9 | K | - | S | Bind every pass claim to its commit | deterministic-run-verification (stale-claim rule) | none | likely catch | - | already covered |
| K10 | K | - | M | Claim contracts that can fail | quality-gates, completion-claim-verification | none | partial | 2/2/2 | untriaged; corrected premise: the one code consumer checks the flag's shape only |
| K11 | K | - | S | Plan convergence by iterated review | plan-review, fresh-posture-self-challenge | none | likely catch | - | already covered (confirmation: the reviser's score is textual and measures the reviewer) |
| K12 | K | amendment | S | Stagger launches so claims land first | job-coordination | resets-clock | thin | 1/2/1 | untriaged (D only) |
| K13 | K | - | S | A self-speedup is maintenance | agent-benchmark-design (incumbent in the same invocation) | none | likely catch | - | already covered |
| K14 | T | - | S | Incomplete evidence gets its own exit code | AGENTS.md verify rule, scripts/lib/exit-codes.mjs | none | likely catch | - | already covered |
| K15 | K | - | S | A read-only instruction is not enforcement | unattended-run-isolation/os-enforced-run-boundary | none | likely catch | - | already covered |
| K16 | K | - | S | One build target per parallel agent | concurrent-vcs/shared-resource-arbitration | none | likely catch | - | already covered |
| K17 | K | - | S | Reality check bound to a SHA, revised in place | docs-sync | none | likely catch | - | already covered |
| K18 | K | - | S | Incidents become rules, then guards | agent-instruction-files/line-earning | none | likely catch | - | already covered |

Method rows (our own skills and tooling; operator bar: measured A/B only):

| # | practice | A/B form | outcome |
| --- | --- | --- | --- |
| M1 | Exclusive claims refused before the edit (atomic claim) | code: race harness, 32 trials per arm, double grants counted | better, shipped `bdb7dbf2` |
| M2 | Commit-time guard against paths the run never wrote | experiment: replay over transcripts + git history, seeded | better at path level, target missed; instrument shipped `e148ad7d` |
| M3 | Independent re-verification of `better` verdicts (tier 1) | experiment: transcript check that the named gate ran after the change, planted rows | not-better as a falsifier (floor met); kept on a local branch for DLE-010, not landed |
| M4 | Named reward-hacking clause in builder briefs | bait fixtures, 24 builder sessions | harvest backlog |
| M5 | One fresh review of the brief before fan-out | 8 historical briefs with recorded defects | harvest backlog (needs vault paths) |
| M6 | Verification-debt veto with an occupancy escalation | replay + 2-week live arm | harvest backlog |
| M7 | Process artifacts name reader + retirement (K4) | replay over the three recorded unread artifacts | harvest backlog |
| M8 | Reconcile intake's pathspec rule with the index-only recipe (B2) | our defect - proposal to the intake owner | proposal |
| M9 | CONTRIBUTING branch+PR vs intake direct-to-main; spark vs perfect on the index (B4) | - | proposal |

auto = 3 accepted / 14 not accepted (6 untriaged, 8 already covered) / 0 escalated; K4
routed out of the bundle lane. **fp = 0**: all three auto-accepted rows survived Phase 6,
though K3's worker overrode the brief's direction (below), which is a correction, not a
death.

## Accepted (landed)

- **K1** `concurrent-vcs/physical-isolation`, amendment "What isolation costs, and the
  regime where a shared tree wins": isolation's integration price (stale context,
  semantic conflicts that merge cleanly and surface late), a discriminator for when a
  shared tree is the better trade at a seat (many writers, small additive changes, guards
  that engage on their own, every shared state valid at every instant), the conditions
  under which the bright line holds anyway (feature work, packages that run for hours,
  any seat whose output is evidence), and a failure-mode table. The golden-path invariant
  "Multi-file work gets a worktree" gained one exception sentence for the implementer seat
  of a tree shared on purpose with the guards in place. Applications
  `process--physical-isolation--practitioner-swarm` (the source's fleet) and
  `process--physical-isolation--ai-registry` (the Phase 7.5 replay below). The replay
  refuted the drafted clause "the package runs for hours"; it now reads "a long package is
  a reason only when it is feature work", with the ledger precondition confirmed and a new
  rule that a set-merge never touches a generated file (a union merge left one of our
  indexes invalid JSON).
- **K2** `fleet-orchestration/verifier-seat-capacity`, new technique: the closer separated
  from the producer is a seat with a queue; count debt at the seat with its oldest age,
  pair a cap with an occupancy check that escalates instead of stalling, give the
  verifier's own work a second reader, and read self-grading from a verdict distribution
  that almost never says no. `parallel-dispatch` amended (its "no door observed enforcing
  the debt bound" was wrong: the policy file above is one) and
  `completion-claim-verification` amended by one paragraph. Application
  `process--verifier-seat-capacity--practitioner-swarm`.
- **K3** `harness-fault-attribution/clear-the-environment-first`, amendment: host
  contention (load, shared build locks, linker fan-out) is an environmental fault class; a
  failure that passes alone on a quieter host is **load-confounded** until a rerun at
  matched load decides; capture the load while the run is live. The golden path's
  singleton paragraph was aligned. The worker overrode the brief, which had asked for the
  failure to be filed as environmental on a solo pass; the solo rerun changes load,
  parallelism and the sample at once. Application
  `process--clear-the-environment-first--practitioner-swarm`.

**Deviation:** applications were written only for the three landings. The other design
entries are catches or untriaged and got none; intake's practice of one application per
design entry against the source tree was not followed, partly because the source-tree
task row is barred by the license.

## Applied (Phase 7.5)

| landing | project | mode | verdict | instrument / seam |
| --- | --- | --- | --- | --- |
| K1 physical-isolation (regime) | ai-registry | experiment | not-better | merge-tree replay of 1,129 registry commits (2026-09-01..10-14), each replayed onto a branch point 0.5/1/2 h earlier. Chosen to falsify the drafted "the package runs for hours" clause, and it did: isolation's paid conflicts per landing (after set-merging append-only ledgers) exceed the shared tree's recorded incidents (12, 1.06% per landing) at every lead, 1.4-2.6x at the most generous reading, 15-23x as specified. Same-day appends conflicted 479 of 480 times. The clause was rewritten before landing (duration is a reason only for feature work; set-merge never touches generated files). Conflicts are caught, incidents are silent; neither is priced |
| K2 verifier-seat-capacity | ai-registry | experiment | unmeasurable | occupancy replay over the harvest evaluation ledger: as run, the verifier seat was silent 47 days (2026-08-28 to 2026-10-14) while passes kept landing; a 7-day occupancy check would first have fired on 2026-09-04. A replay of the ledger cannot say whether an escalation would have been answered; the instrument is a live arm or a blind re-read |
| K3 clear-the-environment-first (load-confounded) | personas | experiment | unmeasurable | the app's merge gate clears a branch-only failure on a narrowed solo rerun; 12 such clearances 2026-10-05..09 in its records, none with host load recorded, so none can be classed. A code-mode change (stamp contention, require a matched full rerun) is proposed in the project, not made |
| M1 atomic claim | ai-registry | code | better | race harness, 32 trials x 8 concurrent claimers: double grants 30/32 (same source) and 29/32 (same subject) before, 0/32 after; 25/25 tests; uncontended median 149 -> 135 ms |
| M2 commit inventory guard | ai-registry | experiment | better (path level) | replay over 1,594 commits (1,415 mapped to the tool call that made them); see Method A/B |
| M3 verdict re-verify, tier 1 | ai-registry | experiment | not-better | 460 code/experiment `better` rows inside transcript retention; 4 of 4 planted rows caught, 0 of 332 evaluable real rows falsified; only 13.5% of code passes and 33.1% of experiment passes ran a gate whose exit status could fail; see Method A/B |

## Method A/B (WP3)

**M1 - claim reads, decides and writes under one gate.** The run board's claim read
the live siblings and wrote its own record in two steps, so two claimers starting
together both saw a clear board. Shipped `bdb7dbf2`: the read, the conflict decision and
the write happen inside one exclusive gate. Before/after over 32 trials of 8 concurrent
claimers: 30/32 and 29/32 trials granted a double claim (same source, same subject);
0/32 after. A mixed-version fleet stays compatible. The builder corrected the premise:
the twin claim recorded in memory was two spellings of one free-text source, which this
patch does not fix (source normalization is still free text). The test file is not run
by the tooling suite's runner (it sits outside `scripts/tests/`).

**M2 - a commit-time inventory guard, replayed before anyone enables it.** Shipped as
an instrument, not a hook (`e148ad7d`, `scripts/commit-inventory-replay.mjs`, 17
tests). Per non-merge commit it maps the tool call that made it, rebuilds the committing
session's write inventory from transcripts (subagents included) and flags committed
paths outside it; it asserts itself on a planted foreign path first.

| | A (no guard) | B (path guard) | B-strict (writes only) |
| --- | --- | --- | --- |
| commits refused | 0 | 7 real + 2 planted | 96 real + 2 planted |
| known sweep commits stopped | 0 of 4 | 3 of 4 | 3 of 4 |
| flagged that a reader judges clean | - | 3 of 1,415 = 0.21% | about 6.8% (fails the 2% floor) |

B found two sweeps nobody had recorded: `f534b8c2` (a `git add -u` in the shared
checkout took 11 files another session wrote 20 minutes earlier) and `001fbb4a` (a
`git add -A` took 34 files from sibling deepen runs under a skills commit). It caught a
deliberate commit of siblings' work "as found", correctly (a live guard needs a declared
override). The declared target - every known sweep - was **missed**: `595ac75b` carried a
sibling's rows inside three ledgers the run also wrote, a hunk-level sweep that no path
inventory can see. All three false flags were file lists computed at run time. Premises
corrected by the builder: the 2026-09-03 sweep's transcripts have rolled off (the oldest
retained line is 2026-09-14), so it was replayed as a planted replica; registry commits
are made from sessions launched in other project folders too, and reading the registry's
folder alone misses one of the known sweeps. **Disclosure:** the replay's shell parsing
was refined over six runs after reading flagged rows; the guard rule never changed, so
0.21% is a rate on this corpus, not a guarantee. Recommendation carried to the backlog: a
live guard should check an inventory the agent declares at commit time, plus a separate
check that a staged shared file equals HEAD plus only the run's own bytes.

**M3 - independent re-verification of self-graded `better` verdicts, tier 1.**
Tier 1 asks the cheapest falsifiable question of a self-graded `better` row in
`librarian/applied.md`: in the session that made the change, did the gate the row relies
on run after the last edit, and pass? The builder located each row's authoring session
from transcripts (including sessions launched in other project folders that edited the
registry), found the last edit into the named project, and looked for a gate after it.

| mode (in retention) | n | gate ran after the change | no gate | no transcript | ambiguous |
| --- | --- | --- | --- | --- | --- |
| code | 333 | 245 (73.6%) | 0 | 14 | 74 |
| experiment | 127 | 87 (68.5%) | 0 | 12 | 28 |

Seeded floor met: of four planted rows (a real edit followed by no gate, a fan-out session
ending on an edit, a real technique on a day nothing discussed it, an invented
technique), all four came back not verified, though the fan-out plant came back
`ambiguous` rather than pinned. On the real ledger tier 1 falsified **nothing**, so it
does not explain the gap between producer grades and the blind lane, and by the series'
A/B form it does not land. What it did show is where the signal is: read strictly, only
45 of 333 code passes (13.5%) and 42 of 127 experiment passes (33.1%) ran a gate whose
exit status could have failed. The rest were masked (`| tail`, `; echo exit=$?`, `||`),
so the pass is whatever the session read off the output. In 16 code rows every masked
pass printed failure text in its own output. Some are surely arm-A or red-before-green
runs, which tier 1 cannot tell apart. Those 16 and the 200 masked passes are where tier 2
starts. Premises corrected by the builder: the oldest retained transcript is 2026-09-15
(202 of the 662 rows are out of reach), and the brief's 396 counted plain cells only.
**Disclosure:** the classifier was corrected about twenty times against real rows, in
both directions; the trap was re-run after the last fix. The instrument is kept on a
local branch (`ab/verdict-reverify`), named in the charter's DLE-010 round as its
starting point.

## Peer study (his operating method against ours)

A worker compared 33 points of his practice with ours: adopt 3, adapt 9, keep ours 13,
different forces 8. The defects it found in **our** method, re-checked by the Director
where marked:

- **B1 - we certify our own verdicts.** `librarian/applied.md` code mode reads about 396
  better to 4 not-better, graded by the session that made the change (Director recount:
  396-398 / 4 by row verdict; 443 / 5 counting bold cells). Intake's scorecard records
  fp=0 in 168 of 169 rows (worker count). Our only blind lane, the harvest evaluations,
  reads 4 positive to 6 null, and five of the six nulls were settled today. His appointed
  verifier's first pass over 28 submitted items closed 11 and sent 17 to rework (the
  audit's heading says ten closed; its list names eleven, which the total requires). Part of the gap is selection (code mode is chosen when the change is small),
  but a channel that almost never says no measures something other than the change. M3
  is the first instrument against it.
- **B2 - the commit rule forbids its own recovery.** Intake's Phase 10 pathspec commit
  and its anti-pattern list contradict the index-only recipe our memory records for a
  shared file carrying a sibling's hunk. Proposal M8 to the intake owner.
- **B3 - our concurrent-vcs invariants contradict intake's shared-checkout mode.** K1
  names the regime; the registry is in neither (shared, without the guards). The K1
  replay priced it on our own history: by count, worktrees would have cost more, so the
  shared checkout stays for additive runs and the remedy is the guards (M1 shipped, M2's
  replay shipped, a declared-inventory guard is the next arm).
- **B4 - CONTRIBUTING (branch + PR) disagrees with intake (direct to main), and spark
  disagrees with perfect on who touches the index.** Proposal M9.
- **B5 - the run-board claim was not atomic.** Fixed by M1.
- **B6 - nobody owns verification debt.** Harvest evaluations queued 2026-08-28 waited
  47 days; five were settled today by a sibling lane, six remain. K2's occupancy check
  is the shape; M6 is its A/B.
- **B7 - process artifacts created with no consumer** (harvest rows never read back, a
  scorecard focus unread for months). K4 / M7.
- **B8 - our ledgers are too large to read**: intake LESSONS about 159,000 words,
  SCORECARD about 165,000, `applied.md` about 266,000. His negative-results ledger has
  the same defect at 187,000 words (contradiction 8).
- **B9 - context-reset redelivery is taught and practised nowhere.**

Points kept as ours, with the reason: no leaderless fungible fleet (our Director is the
verifier of last resort), no stash ever, replay a guard before enabling it (his guards
were enabled without a replay we could find), incumbent measured in the same invocation,
agreement is not evidence, repetition is not validation.

## Leads

- **K4 -> law lead** `creation-names-reaper` extended from resources to process
  artifacts: a ledger, report or queue names its reader and its retirement at creation,
  or it is not created. Practised in his instructions
  (`frankengit/AGENTS.md:364 "may be created only if it names a concrete consumer"`);
  our counter-cases are B7. Return condition: M7's replay over the three recorded
  unread artifacts says the rule would have prevented at least two of them.

## Already covered

K9 (bind a pass to its commit: `deterministic-run-verification`), K11 (iterated plan
review: `plan-review`, with a confirmation that the reviser's convergence score measures
the reviewer), K13 (a self-speedup is maintenance: `agent-benchmark-design`), K14
(incomplete evidence has its own exit code: our exit contract), K15 (a read-only
instruction is not enforcement: `os-enforced-run-boundary`), K16 (one build target per
parallel agent: `shared-resource-arbitration`), K17 (`docs-sync`), K18
(`agent-instruction-files`).

## Untriaged (nobody verified these; they carry no judgment)

| # | candidate | home it would amend | anchor |
| --- | --- | --- | --- |
| K5 | Key coordination on the work item, not the session: one id joins thread, lease, commit and closeout | concurrent-vcs/intent-ledgers or remediation-handoff/resolution-trailers | `acfs/acfs/onboard/lessons/22_swarm_coordination.md:43 "Use the Bead ID everywhere else in the session"` |
| K6 | A shared worklist herds when claim latency exceeds the launch interval | shared-research-record (bound on its no-herding claim) | `acfs/docs/methodology/THE_FLYWHEEL_APPROACH_TO_PLANNING_AND_BEADS_CREATION.md:1266 "they may all pick the same bead"` |
| K7 | Every rejected idea carries the condition under which it is worth retrying | shared-research-record/typed-contribution-vocabulary | `frankensqlite/AGENTS.md:163 "condition under which it is worth retrying"` |
| K8 | Name the evasion patterns with stable codes so audits can cite them (names only in these trees; the definitions live in a skill outside them) | deterministic-run-verification | `frankengit/AGENTS.md:384 "follow-up laundering RH-9"` |
| K10 | A public claim is a contract that can fail: wording bound to gates, a missing row fails it | quality-gates or completion-claim-verification | `frankensqlite/leapfrog_exit_criteria.toml:6 "The claim is intentionally fail-able"` |
| K12 | Stagger launches so each claim lands before the next agent reads the board | job-coordination | `acfs/docs/methodology/THE_FLYWHEEL_APPROACH_TO_PLANNING_AND_BEADS_CREATION.md:1268 "between each agent launch"` |

## Directions

None proposed. The operator ruled peer study and applies only for personas, with no
direction proposals this round. The personas seam found by K3 (a merge gate clearing a
branch-only failure on a quieter solo rerun) is recorded in that project's own
`.ai/applied.jsonl` as an unmeasurable experiment with the proposed change.

## Corrections and catches about the source class

- A practitioner's published method and his own audits disagree in twelve places; the
  audits are the better evidence, and several of them price his own choices. Read the
  operating half before the tour half.
- His strongest practices sit in one tree each (the batch-verification policy, the claim
  contract) and are absent from the published method; a reader of the method alone would
  miss them, and a reader of one tree would overgeneralize them.
- The run-board twin-claim incident was not what the record said (M1's builder), and the
  2026-09-03 sweep can no longer be replayed from transcripts (M2's builder): our own
  memory notes carry premises that decay.
