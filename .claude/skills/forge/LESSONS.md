# Lessons - forge

Append-only reflection lane. One entry per run that taught something, newest last.
Format: `## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-08-19 - gravitone-gcloud + politicas + grant-writing-nonprofits (the founding run)

- Scale observed: 8 scouts over 120 contexts, then 46 subject-forgers, cap 10 concurrent,
  ~5 hours wall-clock. Every forger came back gate-clean on first report; the per-forger
  "run the gate yourself, ignore other subjects' failures" rule is what made a 46-agent
  wave reviewable at all.
- The two-phase order held its promise measurably: forgers consistently reported 5-7
  "upward lessons" per subject — incident-anchored rules the expert draft lacked — while
  zero subjects read as a description of one codebase. Keep the order non-negotiable.
- Repos that hand-extract their own craft (doctrine files, prompt libraries, incident
  comments above pure functions) yield an order of magnitude more than repos where the
  knowledge is implicit in behavior. Scout reports should say which kind they found —
  it predicts forge quality per subject.
- The densest artifact in one repo (a 703-line review-gate library) was absent from its
  context map entirely. Scouts must be told the map is a starting partition, not a fence.
- Topping the pool one agent per completion notification beat fixed batches: the cap held
  exactly, and no slot idled waiting for the slowest sibling.
- **Verify the instrument before reporting a content gap.** The index builder counted
  `use_when` with a string-only check while the parser returns lists as arrays, so a
  corpus at 267/267 coverage was reported as 0/267 — and a whole "backfill pass" was
  planned (and six agents dispatched) against a gap that did not exist. The fix was one
  line in the counter, not 267 edits. Same failure family as every carried-forward-metric
  incident: the tool answered a different question than the one asked, plausibly.
- Shared-checkout discipline mattered twice: a sibling session's in-flight file sat
  pre-staged in the registry's index during the first commit (isolated read-tree-HEAD
  index kept it untouched), and the follow-up ran in a git worktree from the start —
  strictly simpler. Default to the worktree.

## 1.0.0 - 2026-08-20 - llm-observability (LightTrack)

- When the new domain neighbors an existing bundle (five colliding subjects with
  the builder-side llm-agent category), the fix that held was structural: a
  boundary contract in the bundle's index.md plus every golden path naming its
  neighbor subject in prose. Zero duplication across 16 subjects; adopt as
  standing doctrine for any adjacent-domain forge.
- The deepen skill's demand matrix falsified one of this forge's consolidation
  calls within hours (a folded-out subject was a live-demand coverage hole).
  Lesson for Phase 1: when folding a scout candidate out, record it as a lead
  with its demand evidence — consolidation is a hypothesis, not a verdict.

## 1.0.0 - 2026-08-20 - game-production (a game-production studio app)

- Scale observed: 4 scouts over 38 contexts, then 40 subject-forgers, cap 10, topped up one
  per completion. Result: 40 subjects / 237 techniques / 108 applications / 11 laws, the
  second-largest bundle in the registry. Every forger returned gate-clean on first report,
  as in the founding run. 40 subjects from ONE repo is viable — but only because this repo
  hand-extracts its own craft (a 253-line systems-law file, 10 cited craft rubrics, a
  42-entry engine-pitfall corpus with per-entry provenance). Predict subject count from how
  much doctrine the repo has already written down, not from its size.
- **`use_when` on techniques: 237/237 on first pass.** The founding run needed a backfill
  pass; stating the requirement in the brief AND in the frontmatter template fixed it
  outright. Keep both. (The `software-engineering` bundle is still at 0/629 — verified by
  direct grep, not the builder, per the founding run's instrument lesson. It predates the
  rule. That is a real gap and a standing lead, not a forge-run defect.)
- **Name the neighbouring subject owners inside every dispatch prompt**, each with "reference
  in prose, do NOT write their techniques", plus one line on where the seam runs. Across 40
  concurrent forgers this produced zero duplicated techniques and a large number of correctly
  named seams. This is the fan-out-safe form of Phase 1 dedup: the director's consolidation
  only holds if each forger is told what its neighbours own. Adopt as standing practice.
- **Length drift is the failure mode of a rich dispatch prompt.** Wave 1 golden paths ran
  222-350 lines against a corpus band of 130-205 (median 170, measured over the three most
  recent bundles). Adding the measured band, the median and a cut-order to the wave brief
  brought every later subject into range. Do it in wave 0 next time — state the corpus
  numbers, not just the brief's 120-220.
- **Trim under a "never cut a rule, number, incident or failure mode" constraint, and believe
  the agent when it stops short.** Three trim agents took 331→267, 304→248, 267→216 and each
  independently refused to reach target, showing its arithmetic. Two thirds of the overrun was
  restatement; the last third was real density. A bundle this dense may simply not fit the
  corpus band, and shaving prose is the wrong lever — promoting a section to its own technique
  is the right one.
- **The richest artifact was outside the context map again** (~1,400 lines of acceptance,
  systems-law and quality-gate doctrine in a docs folder no context listed). Second run in a
  row. The scout brief's "the map is a starting partition, not a fence" line is load-bearing;
  never drop it.
- The two-phase order paid in BOTH directions this run. Forgers reported upward lessons on
  every subject, and several found the repo beating the expert draft (a server-seen marker
  that makes additive hydration reconcilable, where the draft said reconciliation was
  impossible). Several others held the standard against a repo that fell short and wrote the
  deviation up in an application. Both are healthy; require the report to name which happened.
- **Windows shell hazard, cost ~20 minutes:** writing a JS regex literal through a bash
  heredoc mangles `\b` into a literal backspace (0x08). The gate still passed, so the damage
  was silent. Edit regex literals with the Edit tool or byte-level Python, and `cat -A` the
  result.
- Consolidation-as-hypothesis (adopted from the 2026-08-20 llm-observability run) was
  honoured: 5 folded-out candidates recorded as leads with demand evidence, incl. one genuine
  coverage hole nothing claimed (a localization-hazard taxonomy with quantified expansion
  risk).

  The five leads, for whoever forges or deepens this bundle next:
  - `gameplay-tag-hygiene` — folded into `ability-authoring-to-engine` as two techniques.
    Demand evidence: a declared-vs-referenced overlap audit plus the identifier-dialect seam
    is a standalone concern in any system with a tag or capability vocabulary.
  - `session-health-direction` — build health across playtest sessions. Scouted as thin
    (taxonomies hand-extracted, scoring only implicit in behaviour). Would forge weakly today.
  - `headless-dcc-scripting-bridge` — folded into `mesh-finishing-for-engine-readiness` as
    `headless-dcc-capability-limits`. Scouted as thin outside the gotcha entries.
  - `simulation-metric-legibility` — the plain-language metric glossary; folded into
    `combat-pacing-and-dramatic-arc` as `plain-language-fight-report`.
  - `localization-hazard-taxonomy` — quantified text-expansion risk per language. NOT folded
    anywhere; no subject claimed it. A genuine coverage hole if a consumer asks for it.
