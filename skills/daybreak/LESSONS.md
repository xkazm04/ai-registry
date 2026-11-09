# Lessons - daybreak

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-11-09 - ai-registry
- Measured while building, before any fleet run: a read-only Codex refusal exits 0, so an exit code never proves work happened; the runner compares git status as well.
- An unknown Codex model name does not fail either; it logs a metadata error and falls back. The runner now reports `modelUnknown`.
- The first runner discarded the `turn.completed` usage figures, which are the only source of the Codex token count this skill exists to spend. Check that every ledger field has a producer before the first run.
- A builder reported a machine-local file as absent when it was present, and skipped two live checks because of it. Re-run a builder's "could not test" items yourself.

## 1.1.0 - 2026-11-09 - paypal
- Director audit of one real census context (4 files), two runs of gpt-6.1-sol at medium. Run 1, with an `other` kind and a loose definition of a part: 7 parts, 3 wrong, all falsely outbound (a helper, a game screen, a button). Every quote was exact, so anchoring proves location and says nothing about judgment.
- Run 2, closed kinds and a stricter definition: 1 part, and its relation was wrong. It called DataGrid `consumes`, while run 1 had correctly reported that infinite-mode filters never reach the server. The same context flipped between runs. Treat a single census relation as a sample, and expect the inbound count to be low. One context cannot tell whether the stricter brief caused the miss, so the pilot audit decides, before any fleet spend.
- Cost measured on those runs: 159k and 222k input tokens (about 80% cached) for 4 files, roughly a minute each.
