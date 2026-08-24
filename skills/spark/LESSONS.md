# Lessons - spark

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets. Merged from every copy of this skill on 2026-08-22 when it moved into the registry lane.

## 1.0 - 2026-08-22 - ascent
- Order metaphor/shape questions before presentation questions; a presentation answer given before the metaphor changed had to be re-asked.
- Brief builders: "new files are committed before guard tests run — never edit a guard test to pass pre-commit." One builder widened a doc-sync guard's file enumeration to untracked files; reverted by the Director.
- A new org-scoped table makes the erase/retention path a mandatory touched context; targeting missed it, a builder's question caught it.
- Parallel static-design + live-prototype experiments (5 metaphors) are a strong input for the visual-metaphor wave; the operator chose from the static canvas, so treat prototypes as comparison, not seed.

## 1.0.0 - 2026-08-23 - ai-registry
- Lane-conformance audit (docs/skills-lane.md "the body is generic"): the 1.0.0 body hardcoded ONE repo's specifics - a literal Obsidian vault path, that repo's gate commands (`npm run check`, `check:i18n:strict`, `cargo clippy`, `npm run test:rust`), `context-map.json` as an unconditional requirement, and three host rituals (an active-runs ledger, a decision-capture command, an i18n translate pipeline) stated as method steps. A second repo could not run the skill without either editing the body or silently failing the steps. 1.1.0 moves all of it behind a `## Project overlay` (repo `.claude/spark/config.md` -> vault `config.md` -> defaults) and turns the host rituals into overlay-declared `## Rituals` hooks the loop runs only when declared. Method, roles, waves, liveness rules, worktree/commit doctrine and the retro are unchanged.
