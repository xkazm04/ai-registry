# Lessons - domain-knowledge-forge

Append-only reflection lane. One entry per run that taught something, newest last.
Format: `## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-08-19 - gravitone-gcloud + politicas + grant-writing-nonprofits (the founding run)

- Scale observed: 8 scouts over 120 contexts, then 46 subject-forgers, cap 10 concurrent,
  ~5 hours wall-clock. Every forger came back gate-clean on first report; the per-forger
  "run the gate yourself, ignore other subjects' failures" rule is what made a 46-agent
  wave reviewable at all.
- The two-phase order held its promise measurably: forgers consistently reported 5-7
  "upward lessons" per subject - incident-anchored rules the expert draft lacked - while
  zero subjects read as a description of one codebase. Keep the order non-negotiable.
- Repos that hand-extract their own craft (doctrine files, prompt libraries, incident
  comments above pure functions) yield an order of magnitude more than repos where the
  knowledge is implicit in behavior. Scout reports should say which kind they found -
  it predicts forge quality per subject.
- The densest artifact in one repo (a 703-line review-gate library) was absent from its
  context map entirely. Scouts must be told the map is a starting partition, not a fence.
- Topping the pool one agent per completion notification beat fixed batches: the cap held
  exactly, and no slot idled waiting for the slowest sibling.
- **Verify the instrument before reporting a content gap.** The index builder counted
  `use_when` with a string-only check while the parser returns lists as arrays, so a
  corpus at 267/267 coverage was reported as 0/267 - and a whole "backfill pass" was
  planned (and six agents dispatched) against a gap that did not exist. The fix was one
  line in the counter, not 267 edits. Same failure family as every carried-forward-metric
  incident: the tool answered a different question than the one asked, plausibly.
- Shared-checkout discipline mattered twice: a sibling session's in-flight file sat
  pre-staged in the registry's index during the first commit (isolated read-tree-HEAD
  index kept it untouched), and the follow-up ran in a git worktree from the start -
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
  with its demand evidence - consolidation is a hypothesis, not a verdict.
