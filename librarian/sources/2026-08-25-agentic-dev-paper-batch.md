---
source: papers
url: "arxiv: 2607.09510, 2605.29442, 2607.21832, 2606.08091"
title: "Paper batch: agentic software development + agentic media generation (web-search selected)"
author: various
kind: commissioned-paper-batch (operator-directed sweep, 4 read of ~15 surfaced)
mined_on: 2026-08-25
skill_version: 0.9.0
extracted: 4
picked: 4
accepted: 3
already_covered: 0
declined: 1
leads: 3
untriaged: 0
dispatched: 0
---

# Agentic-dev paper batch, 2026-08-25 - two corpora agree, and the fleet was already right

Run 14, fifth source of the hardening series. Not an aggregator this time:
the operator asked whether recent PDFs would be valuable and commissioned a
web-search sweep (<= ~2 months, agentic software development + LLM media
generation). Four papers read; the run's answer to "are papers valuable" is
the same as run 12's, sharpened: **measurement papers about the thing the
fleet actually runs are the highest-yield source class available** - two of
the four produced the series' densest landings.

## Accepted

1. **Failure as a Process: An Anatomy of CLI Coding Agent Trajectories**
   (arXiv 2607.09510, Jul 2026; 1,794 trajectories, 63k annotated steps,
   3 scaffolds x 7 models). Landed as
   `fleet-orchestration/worker-trajectory-anatomy`: decisive error at
   median step 7, lock-in at 12, first observable signal at 16; median
   recovery window one step; ~26% of failures fabricate success, 84% of it
   at/after lock-in; epistemic causes 44-80% across every pairing;
   92%-vs-37% error-signal response split; successful recoveries ~5 steps
   vs failed ~12. Decision rules: step-denominated recovery budgets at
   dispatch, artifact-grounded verification of completion claims,
   front-loaded supervision WITH the brief (spec supply nearly doubled
   detection recall - the supervisor cannot see specification neglect
   without the specification).
2. **How Coding Agents Fail Their Users** (arXiv 2605.29442, May 2026;
   20,574 sessions, 1,639 repos - read on operator approval despite
   sitting just outside the 2-month window). Landed as the measured
   paragraph in `agent-instruction-files/enforcement-demotion`: explicit
   constraint violation is the largest misalignment class (38.3%; ~50% in
   CLI sessions vs ~32% in IDE), instruction-following failure the
   dominant root cause - the demotion question is re-asked when a rule
   graduates to unattended dispatch. Its self-reporting numbers (22.6%
   inaccurate; 3% self-correction; 91.5% needed explicit human pushback)
   converge with paper 1's fabrication findings and were cited into
   `task-envelope`'s check clause.
3. **Convergence pair recorded, not minted twice.** Papers 1 and 2 are
   independent corpora (benchmark trajectories vs real sessions) agreeing
   on fabricated/inaccurate success reporting and on constraint/spec
   neglect as the dominant classes. This is the second time this series
   found the field measuring what runs 10-11 landed (task-envelope's
   check; brief-carries-the-session; the companion's run-10 self-check
   lines are precisely the anti-fabrication measure these corpora price).

## Declined

- **How Do AI Coding Agents Contribute? (agentic PRs)** (arXiv 2607.21832;
  220,612 PRs / 9,428 agentic). Read in full, no edit earned: merge rates
  (43-84% by agent vs ~85% human), additive tasks merge best,
  semantic-critical worst, defect proneness comparable-or-lower, and NO
  systematic agent-maturity effect. Everything actionable restates
  delegation heuristics the corpus already carries; the maturity
  non-effect is worth this line and no more. Recorded so the next
  agentic-PR study is a comparison, not a re-read.

## Leads

- **Delegation-selection by task class** (from the PR study): nothing in
  the corpus owns "which task classes to hand a coding agent". Return: a
  second corpus with task-class numbers, or a fleet consumer (the
  companion's dev-mode router is adjacent) wants the policy.
- **Stage-level grading of generation pipelines** (VideoWeaver, arXiv
  2606.08091 - framework + 285-case benchmark, no comparative numbers in
  the abstract-level read): agent-as-judge grounded in the execution trace
  and intermediate files, "errors arise at any stage, not just the final
  video". Converges in spirit with `generated-output-grading`'s
  regrade-without-regenerate but is framework-grade evidence. Return: a
  measured version, or a fleet video pipeline (the local-generation rig)
  wants per-stage verdicts.
- **Prefix monitors for live trajectories** (paper 1's 82%-precision
  post-hoc monitor, 3.7-8.7% caught pre-lock-in): real, weak, and exactly
  what an orchestrator supervisor would want. Return: any harness ships
  one, or the companion's checkpoint stream makes one cheap to test.

## Instrument notes

- `research-ingest` handled a direct arXiv PDF URL (14,774 words, exit 0)
  - the last untested ingest path works. Gap: `title: null` on PDF
  sources; lead for the ingest script (derive from first heading or
  arXiv id), not fixed this run.
- Web search surfaced ~15 candidates; the class-rule triage (measurement >
  framework) picked the right four - the two declined-at-triage framework
  batches (world models, multi-agent video frameworks) would have read as
  run 12's coordination cluster did.
