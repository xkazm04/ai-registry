---
source: github:calesthio/OpenMontage
kind: vendor repository (open engine, agent-as-control-plane)
url: https://github.com/calesthio/OpenMontage
title: "OpenMontage - agentic video production system"
author: calesthio
commit: cd9f3c1f03368be87b140af494914b8ee4e3c7a4
words: 943274
landing_page_words: 5357
extracted: 12
accepted: 3
declined: 0
leads: 3
already_covered: 0
untriaged: 9
applied: 3
shipped: 0
dispatched: 0
run_id: openmontage-0831
siblings: 4
---

# OpenMontage - an agent-orchestrated video production system

Operator-supplied, domain `media-generation`, widened mid-run to a second wave over
`software-engineering` on the operator's instruction ("the web app can have coding
techniques we can learn from"). Four sibling runs were live at claim
(`genesis-agi`, `tanks-0831`, `intake-archify`, `omniroute-0831`), six by Phase 5;
none held any subject this run touched.

## The read fraction

Landing page **5,357** words against **943,274** in-tree - a **176x** ratio.
`.agents/skills/` alone is 506,542 words across 994 files.

The clone needed a short path (`C:/om31`) and `core.longpaths`: the first attempt under
the scratchpad prefix silently dropped 2,159 files, including the entire
`.agents/skills/` tree, and reported a successful clone. **A `git status --short`
showing `D` entries immediately after a fresh clone is the tell**, and a run that did
not look would have mined a tree with its densest half missing while believing it had
everything.

Swept in yield order: `lib/` (the instruments), `docs/` operating documents,
`tests/contracts/` and `tests/eval/`, `schemas/artifacts/`, `skills/meta/`, README last.

## Class reading

Vendor repository over an open engine, with one distinguishing property: **the agent is
the control plane and there is no runtime orchestrator**. Python supplies tools and
persistence; every creative decision, stage transition and review policy lives in
Markdown skills and YAML manifests. That makes the prose files executable in a sense the
class usually does not have, and it is why the two strongest findings came from tests
over Markdown rather than from code.

Expected yield stated before triage: high, corroborating corpus-internally at low fetch
cost. Actual: 3 landed, **1 of 3 fetches spent**.

## Accepted

**1. `delivery-promise-lock`** -> `media-generation/production-ops/production-pipeline-phasing`

`lib/delivery_promise.py` classifies what a production promises before provider
selection, locks it, and validates the assembled cut against it. The sharp half is the
metric: `_SLIDE_GRAMMAR_TYPES` is carved out of `_REAL_MOTION_TYPES`, so a composition of
animated text panels scores 0% motion despite moving on every frame. Generalized to the
rule that **the cheapest way to satisfy a quality ratio is to reclassify cheap output
into its numerator**, so the excluded set is enumerated adversarially.

Home chosen on the enumeration hunt. The golden path already says a *probe* that drops a
dimension leaves it "unsettled, never approved" - correct, and it does not cover the case
where the **delivery** drops it, which has no later phase to settle in.
`generative-provider-routing/non-silent-elimination` holds the same shape one level down
(per-request, per-vendor field honouring) and was read before choosing.

**2. `critique-carries-its-fix`** -> `media-generation/production-ops/review-iteration-loops`

`skills/meta/reviewer.md` demotes a `critical` finding carrying no `proposed_fix` to a
fourth severity, `investigation` - non-blocking, surfaced, obligating nothing.

Corroborated against the primary the source cites, and the fetch **corrected it**. The
paper is real (arXiv 2604.21718, *Building a Precise Video Language with Human-AI
Oversight*), but its axes are **precision, recall and constructiveness** - not the
source's "Accurate, Complete, Constructive" - and the "CMU/Harvard" attribution is not
supported by the listing. The technique is written against the paper's terms, which are
strictly better: precision and recall are a retrieval pair that trade off, which is
exactly the reviewer's problem, and the source's renaming hides that.

This pick **contradicts** `game-production/craft-judgment/subsystem-review-doctrine`'s
`severity-by-consequence`, which forbids folding fixability into severity and keeps
confidence as a separate axis. Both are right. The discriminator is written into the
technique in prose, no cross-bundle link: **does the consumer decide, or act?** A human
triage queue can hold an unactionable critical indefinitely; an automated next stage
converts one into a fabricated fix.

**3. `capability-coverage-contract`** -> `software-engineering/llm-agent/prompt-and-context/agent-instruction-files`

`instruction-freshness` audits soundness - everything the file *names* exists. The other
direction fails silently and nothing owned it: **everything that exists should be
named**, or the capability is simply never reached for, with no error anywhere.

Found as an asymmetry inside the source itself.
`tests/contracts/test_agent_instruction_integrity.py` hardcodes five instruction paths and
three capability tokens - the named form, which rots on the next addition. The docstring
of `tests/contracts/test_agent_skill_pointers.py` states the corrective outright: *"The
registry is iterated rather than named so a newly added tool is covered the moment it is
discovered."* Both forms in one tree is what makes the distinction evidence rather than
preference.

## Applied (Phase 7.5)

All three against `gravity`, which declares both domains. Seams in that project's
`.ai/applied.jsonl` (created this run).

- `critique-carries-its-fix` - **experiment**, **better**. The tree already implements the
  rule's strong form: the critique schema requires the fix, `usableFix()` rejects a shrug
  or an echo, and the loop *ends* rather than iterating on an unactionable critique -
  reached independently, which makes it evidence. The gap is downstream: the settle
  predicate returns a bare boolean, so 1 of 4 causes is recoverable, and an abandoned
  replica takes the same progress credit as a completed one - 3 units of work never
  performed across 3 replicas. The project's own 2026-08-29 progress-strip commit
  justifies that accounting by the target-met case explicitly; the other three causes ride
  it unexamined.
- `capability-coverage-contract` - **experiment**, **better**. Soundness 19/19 both
  directions; completeness **7 of 19**. A weaker second seam was checked and rejected
  rather than reported: the deployment capability matrix is 0 of 5 named but is read by
  product surfaces, not by an agent choosing among means.
- `delivery-promise-lock` - **simulation**, **better**, `structural-only`. The project's
  `discipline` field *is* the promise and is locked before the template - the hard half,
  done independently. It carries no rules: three consumers only (asset path, style filter,
  brief prose), and nothing at `cut` validates against it. Second structural fact:
  `PhaseState` uses `empty` for both "not required" and "not obtained", and `empty` ranks
  **best** in the worst-news-first merge.

## Untriaged - extracted, reached the table, nobody picked

Recorded with anchors so a later run does not re-derive them. **Unverified; not declined.**

| # | Candidate | Anchor | Nearest prior art |
|---|---|---|---|
| 2 | Plan-stage risk scored on dimensions that predict the *expensive* output's failure; verdict bands `strong/acceptable/revise/fail`, `fail` blocks compose | `lib/slideshow_risk.py`, 6 dimensions | `phase-order-and-graduation` (cheap-probe rule) |
| 3 | Repetition check counts the longest *run* of identical shot sizes, not equal adjacent pairs - the code carries the corrected comment | `lib/variation_checker.py` | `cinematic-language/scene-grammar-progression` |
| 5 | Taste profile as numeric dials (`visual_variance`, `motion_intensity`, `information_density`) plus `anti_patterns`, carried proposal to review in the artifact schema | `skills/meta/taste-direction.md`, `tests/contracts/test_taste_governance_contracts.py` | `creator-voice-and-tone` |
| 6 | Verify time alignment against a *model* of the renderer's frame math rather than by rendering; assert narration cues within tolerance | `lib/verify_scene_pacing.py` | `video-assembly/drift-correction` |
| 7 | "Never claim a file was reviewed unless a real probe ran" as a contract on a required pre-planning artifact | `lib/source_media_review.py` docstring | law `unmeasured-is-not-pass` |
| 9 | Which architectural layer may hold a decision, policed at PR review - flag changes that move creative or policy decisions into code, or hide routing from users | `docs/PR_REVIEW_GUIDE.md` section "Agent-First Architecture" | `mcp-tools/orchestration-to-tool-migration` |
| 10 | Budget governance as estimate, reserve, reconcile with entry statuses and warn/cap modes | `tools/cost_tracker.py` | `cost-metering/preflight-estimation` |
| 11 | Tool metadata declaring `not_good_for`, `resource_profile`, `user_visible_verification` as user-facing contract | `docs/ARCHITECTURE.md` BaseTool table | `mcp-tools/tool-schema-design` |
| 12 | Golden-scenario replay with deterministic vs stochastic eval modes and a per-scenario tolerance | `tests/eval/replay_harness/harness.py` | `eval-harness/scenario-design` |

## Leads

- **The retrieval framing for our own review lanes.** The precision/recall/constructiveness
  decomposition is not media-specific, and this registry runs several review lanes that
  score findings without naming which axis they are tuned for. *Return when* a second
  independent source reaches the same decomposition for code or document review, at which
  point it is a candidate above technique level rather than a media-generation technique.
- **A three-layer skill topology.** The source separates project-owned skills (`skills/`)
  from external technology skills (`.agents/skills/`, 90 of them, mostly vendor-shaped) and
  wires tools to them by an `agent_skills` pointer field. Our own `skills/` lane has no such
  split. *Return when* a managed project accumulates enough vendor-specific instruction
  material that the distinction would change where a file lands.
- **A cited paper that drifted inside an instruction file.** `reviewer.md` authorizes its
  central rule on a real paper whose axis names it silently renamed and whose institutions
  it invented. This is `instruction-freshness`'s failure mode occurring in the same tree
  that tests its instruction files for fictitious symbols - the tests check function names,
  not citations. *Return when* a second sighting appears; two would make "citations are
  claims and drift like counts" an amendment to `instruction-freshness` rather than an
  anecdote.

## Catches worth recording

The corroboration fetch is the run's most reusable output. A source that cites a primary
to authorize a rule is not thereby authorized - and here the primary both *confirmed the
substance* and *corrected the framing*, which is the best available outcome. The rule
generalizes: when a source cites a paper for its central claim, the fetch is not optional
politeness, it is the extraction.
