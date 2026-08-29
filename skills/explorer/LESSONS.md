# Lessons - explorer

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-08-24 - ai-registry

- **Re-seated onto the lane's overlay contract (1.0.0 -> 1.1.0).** The body called itself "personas-specific", hardcoded `C:/Users/kazda/Documents/Obsidian/personas`, and Phase 0 `exit 1`-ed when that root was absent. On the second machine the same vault lives under a different user, so the sweep died before it picked an area. A daily-cadence skill that cannot start on the machine you are sitting at is not a daily skill.
- **The taxonomy was the deepest coupling, not the vault path.** The vault path is one line; `codebase-context.md` was woven through Q1's area menu, the Phase 2a resolver, the sampling strategy's entry points, the widening rule, and the coverage name set. All of it now resolves through `## Context sources` / `## Area menu` with `context-map.json` then `CLAUDE.md` as the fallback chain, and a missing source narrows the sweep instead of stopping it.
- **The i18n and design-token rules were personas law masquerading as method.** "13 other locales", `tokenLabel()`, `resolveErrorTranslated()`, `Design.md \u00a78`, the 10k-warning lint baseline: real, load-bearing, and true of exactly one repo. They moved to the overlay's `## Repo law` and `## Baseline exclusions`; the body keeps the *shape* of the rule (a string-adding item in a many-locale repo is not a paper cut) without naming anyone's files.
- **What stayed is the wander.** Ten items, the premise-verification gate, the per-category hunting lists, `passes.md` memory, the claim board, risk-ascending execution and the one-invocation stage-verify-commit discipline are method. Re-seating changed where the run gets its facts, not how it wanders.

## 1.2.0 - 2026-08-29 - kp

- **On a cold vault, Phase 2b has no signal — go looking for a neighbouring loop's ledger.**
  With `coverage.md` empty every context scores max staleness, the yield-density tie-breaker is
  undefined, and the rule falls through to "smallest file count", which is arbitrary. kp happened
  to carry a *different* skill's artifact — a reconstructed per-context coverage table from its
  scan-sweep — naming the three contexts that whole sweep left with zero fix commits. Picking from
  that list found four real bugs on the first try. Most repos that run one quality loop run
  several; their ledgers are the cheapest cold-start prior available, and Phase 2b currently does
  not think to look for one.
- **Reading the CONSUMER, not the anchor, is what kills a bad item.** Three candidates died at the
  premise gate this run, and none of them died at its own `file:line` — the arithmetic really did
  produce the wrong number, the delimiter really was fragile. They died one call site away: the
  component gated the figure out of the render, the SQL genuinely interpolated the exported
  constant. Phase 5's gate says re-read the anchor; the anchor is where a pattern-matched suspicion
  looks *most* convincing. The verification that pays is following the value to where a human sees
  it.
- **Diff a test's title against its assertions.** The run's highest-severity finding was sitting
  inside a passing test whose name stated the correct behaviour, whose assertion stated the
  opposite, and whose comment explained the discrepancy and moved on. A green suite had documented
  the bug for however long. Worth adding to the `quality` hunting list: a test title that
  contradicts its own assertion is a defect with a signpost on it.
- **When an area has a good idiom, the finding is usually "here is where it wasn't applied".** Two
  of four items were the same class — a printable delimiter or sentinel composing a key over
  values that arrive from outside the process (a URL param, free-text intake) — and in both cases
  the correct idiom already existed one file away. Cheap heuristic for a healthy area: find the
  module that solved a problem well, then grep for the places that solved it again by hand.
- **The knowledge-sync read slid to the end of the run.** Phase 1 puts the registry subject read
  before proposing; this run wandered straight into code and only resolved the governing subjects
  when it came time to file leads. Nothing was lost here, but the consult line then records a read
  that did not inform a single proposal — which is exactly the signal the registry is counting. The
  ordering needs to be load-bearing in the phase, not advisory.

## 1.2.0 - 2026-08-29 - ascent

- **The stage-verify-commit discipline was one-directional (1.2.0 -> 1.3.0).** The skill teaches how not to sweep a concurrent session's work into your commit, and says nothing about the inverse, which is what actually happened: a parallel skill ran a broad `git add` between an edit and its commit, absorbed the change into ITS commit, and the explorer's own `git commit -- <path>` then found nothing to commit and silently committed that session's staged work instead. Added step 5 — verify with `git log -1 -- <path>` that the change landed in YOUR commit, and if it did not, record the foreign sha rather than re-applying a fix that is already in the tree.
- **Prior-pass annotations are a "swept, move on" marker, and reading them first would save a third of the wander.** In a repo where earlier scans leave finding-numbered comments (`database-client-schema #1`, `data-retention 07-16 #2`), the annotated files produced ZERO surviving candidates and the un-annotated ones produced 9 of 10 items. Phase 4a picks files by size and entry-point status; a cheap grep for prior-finding markers would rank them better. Not applied — it needs a marker convention the method cannot assume, and `passes.md` plus prior sweeps already cover the explorer's own history. Worth trying as a Phase 4a hint if a second repo shows the same shape.
- **The highest-value finding came from cross-reading two files, and no category lens asks for that.** The run's one high-severity pair was a UI promising a behaviour its server resolver does not have; each file is internally consistent, and both had been read by earlier passes. The per-category hunting lists in 4b are all single-artifact questions. A ninth prompt — "what does this surface CLAIM the code below it does, and does the default agree?" — is where the defect lived. Recorded rather than applied: one observation is not yet a rule.
- **`standard:` earned its read exactly once in ten items.** Matching techniques on `use_when` before reading was right; the nine `standard: none` items were honestly none. The clause's cost is proportional to the read, so resist reading a golden path for a subject the item does not touch.
