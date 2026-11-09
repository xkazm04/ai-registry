# Lessons - daybreak

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-11-09 - ai-registry
- Measured while building, before any fleet run: a read-only Codex refusal exits 0, so an exit code never proves work happened; the runner compares git status as well.
- An unknown Codex model name does not fail either; it logs a metadata error and falls back. The runner now reports `modelUnknown`.
- The first runner discarded the `turn.completed` usage figures, which are the only source of the Codex token count this skill exists to spend. Check that every ledger field has a producer before the first run.
- A builder reported a machine-local file as absent when it was present, and skipped two live checks because of it. Re-run a builder's "could not test" items yourself.
