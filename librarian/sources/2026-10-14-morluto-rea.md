---
source: github:morluto/rea
kind: repository (practitioner/vendor; local-only reverse-engineering CLI/MCP, 3,764 files)
url: https://github.com/morluto/rea
title: REA - agent-facing reverse engineering tool, its skills and its efficiency experiments
author: morluto
words: 2264 landing / ~27,000 swept in-tree (AGENTS, CONTRIBUTING, 3 skills + 6 references, testing, mcp-contracts, experiments/analysis-efficiency, one spec set)
commit: 7c962cc70bcebf6201da9c5db5b7c0edd2564ae7
operator_question: are its coding techniques and research approaches useful for the intake skill itself
extracted: 9
accepted: 0
declined: 0
leads: 2
already_covered: 6
untriaged: 1
dispatched: 0
run_id: rea-1014
siblings: 5
rescan_when: the experiments/analysis-efficiency thread (#2016) publishes a model-token result that contradicts the bytes-are-not-tokens rule; or 8 weeks elapse (2026-12-09)
---

# morluto/rea - read for intake's own method

Class: practitioner repository whose operating documents are the yield. Sweep order
followed Phase 2b: AGENTS.md, CONTRIBUTING, the three `.agents/skills`, `docs/testing.md`,
`docs/mcp-contracts.md`, `experiments/analysis-efficiency/*`, one spec set; README last.
Code was not read beyond locating `source_complete`. Zero fetches. Routing count: 2
design decisions with no corpus home, below the forge trigger of 3; no handoff.

Expected yield stated before triage: low. The tree's subject (binary analysis) is not a
registry domain, and its process documents restate disciplines this method already carries.

## Triage

| # | Candidate | Anchor | Read | Outcome |
|---|---|---|---|---|
| 1 | Run the child, then read its report: a profiling wrapper can exit 0 after the measured command failed | .agents/skills/rea-ci-tests-audit/references/measurement-and-ci.md "Inspect both the child result and its report" | catch | LESSONS (pipe masks exit; backgrounded exit status) already say it |
| 2 | Perturb a suspicious green test in an isolated copy and require the gate to notice | .agents/skills/rea-ci-tests-audit/SKILL.md "perturb the relevant behavior" | catch | `test-harness/mutation-lane-with-a-triaged-baseline`; intake LESSONS zero-perturbation row |
| 3 | An empty changed-test selection means nothing selected, not verified | docs/testing.md "An empty changed selection means no tests were selected" | catch | `test-harness/derived-selection-must-be-measured` |
| 4 | A fewer-tests or early-rejection run is not a suite speedup; compare equivalent completed work | .agents/skills/rea-ci-tests-audit/references/measurement-and-ci.md "A run with fewer tests" | catch | `gate-scope-is-not-report-scope`, `paired-ab-tie` memory |
| 5 | Page exhaustion of a partial source does not establish absence (`source_complete` kept apart from paging) | docs/mcp-contracts.md "Exhausting a page from a partial source" | catch at law level | laws `unknown-is-not-a-value`, `never-present-absence-as-an-answer`; the paging-specific form is lead A |
| 6 | Report only checks that ran; label source-derived conclusions; `NOT_ENOUGH_INFO` for a missing answer | CONTRIBUTING.md "never report an unrun check as" | catch | AGENTS.md of this registry already states it; the sentinel is lead B |
| 7 | Count the whole task: schemas, discovery, retries, not only the reply | AGENTS.md "Count the whole task," | lead A candidate | see leads |
| 8 | Requested configuration label is not observed behavior (`direct` label, client used three exec calls) | experiments/analysis-efficiency/model-context.md "Despite the requested" | lead | see leads |
| 9 | Spend column for intake runs | none in source; this run's own reading | untriaged | see below |

## Leads

- **A. Delivery view versus its complete source.** An opt-in summary or paged view keeps the
  complete path as the default, links to a retained parent, and carries `source_complete`
  separately from page exhaustion; byte reduction is a delivery number, never a token claim,
  and the repo's own cohorts show reply bytes falling while observed model input rose.
  Home if new: `software-engineering/llm-agent/prompt-and-context` (nearest: `context-hierarchy`,
  which has per-node summary tiers but no complete-default rule). Return condition: a second
  independent source, or a fleet project that ships a summary view, so the rule has a tree.
  Not landed: corroboration was tree prose only (V2), code not opened.
- **B. Requested versus observed arm.** A comparison whose arm label names a configuration is
  an observation of the label until the transcript confirms the client did that. Nearest
  home: `llm-observability` or `test-harness` (`verification-inherits-driver-reach`).
  Return condition: one fleet A/B whose arm label and observed behavior diverge.

## Untriaged (nobody verified; anchors kept)

- Intake could carry a spend cell (fetches, workers, wall minutes, tokens marked unknown) in
  the scorecard so a stage's yield reads against its cost. rea's rule is "state unmeasured
  costs". Not scored: the scorecard rows are already the longest cells in the repo, and a
  cost column that is mostly "unknown" is the failure the source warns about.

## Method findings for intake (judgment lane, no gate)

1. **Nothing in this tree changes the skill.** Its process documents are the same disciplines
   intake already carries, in a smaller vocabulary; the six catches are the result. A
   repository that maintains its own skills is a class worth naming: `.agents/skills` is
   practitioner method, and the useful read is a diff against ours, which took one pass.
2. **One transferable shape is the follow-up index.** `experiments/analysis-efficiency/README.md`
   opens with one line per follow-up, each stating its own negative ("compact captures do
   not justify another production mechanism"). A running thread whose negatives sit in the
   index line is cheaper to rescan than ours, whose negatives live inside note bodies.
   Intake's `rescan_when` plus the decline ledger already approximates it; no edit.
3. **Their agent-trial design is the closest external match to our Phase 7.5 floor/target rule**:
   tokens and time as targets, correctness, provenance and compatibility as acceptance
   conditions on every optimization. Same structure as v2.11; independent convergence,
   recorded here, no edit.

## Phases not run

Apply (7.5), direction pass (7.6) and gate (7.7) were not run: no technique landed, and no
fleet project was opened. Scorecard apply and ship cells are zero for that reason.
