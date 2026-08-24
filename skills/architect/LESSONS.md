# Lessons - architect

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-08-24 - ai-registry

- **Re-seated onto the lane's overlay contract (1.0.0 -> 1.1.0).** The body declared itself "personas-specific", hardcoded `C:/Users/kazda/Documents/Obsidian/personas` in four places, and made Phase 0 `exit 1` when that vault was absent. On a second machine the vault is at a different root, so the skill did not degrade — it aborted before Phase 1. That is the failure mode the lane doctrine's "the body is generic" rule exists to prevent: a body that cannot run is not a shared library item, it is one machine's script.
- **The overlays already existed; nothing read them.** `.claude/perfect/config.md` had been carrying personas' gates, repo law and context-source provenance for rounds, and `/perfect` resolved a vault from a candidate list. `/architect` sat beside it in the same repo reading none of that and holding its own frozen copy of the same facts. The gap was not missing configuration — it was a body that never asked.
- **Phase 0 now creates rather than aborts.** `VAULT` resolves from an overlay candidate list, first existing wins, and falls back to `<repo>/.architect/` which it creates. Every other project-specific value moved to `.claude/architect/config.md` with a default: context sources (default `context-map.json`, else `CLAUDE.md`), area menu, gates, repo law, docs/lint/test-guard codification vehicles, smoke, the coverage name set.
- **What stayed in the body is the craft.** The nine themes, the five scan angles, the four-way triage, the ADR contract, the aging-strong-pattern review, the commit-on-top discipline and the staged-index verification are all method, not project. Re-seating touched where the run gets its facts, never how it thinks.
