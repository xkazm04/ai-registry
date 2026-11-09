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
- Ascent pilot on 1.1.0 failed its audit at 5 of 15 wrong. Registry-map paths are capped at 12 per context, so it read 470 of 2547 source files (18%). Scope a census from `git ls-files`, never from the map.

## 1.2.0 - 2026-11-09 - ascent
- Full-tree census of ascent: 113 chunks, 2615 of 2615 scoped files returned to Codex, 1237 parts, 4 dropped for a quote not in the file. Coverage is solved. The audit still failed, 5 of 15 wrong (33.3%), so no ledger record and no leads.
- The error moved. By audited relation: `reinvents` 4 of 5 wrong, `no-standard` 1 of 5, `consumes` 0 of 5. Reading every file stopped the misses and exposed over-claiming: a standard gets applied to something it does not govern.
- The main shape is a list judged by the table standard: 86 of 440 `reinvents` are `list-or-feed` against `table`, and 98 name a pagination or row-window rule. The audited wrong ones were a terminal formatter, a bare layout primitive, a briefing card and a demo feed. The table golden path itself says a list is not a table. Asking for a named missed rule does not stop this, because the rule is real and only its applicability is wrong.
- Adjudication moves parts in one direction: it looks for a standard to attach, and 121 of 235 moved. It also kept a retry wrapper as `no-standard` while the retry-backoff subject covers it, so it does not reliably find the standard either.
- Measured cost: census 145.0M input tokens, 132.1M cached, 0.59M output, about 1.3M per chunk. Adjudication 36.5M input, 33.9M cached, 0.09M output. An adjudication batch costs about 2.3M because Codex searches the registry for each one: it is not a small add-on. Forecast the two passes together.
- A coverage probe built from a file's longest line under-reported 80% when that line held non-ASCII that the Windows console mangled. Match a share of the file's ASCII lines instead.
- Added the rejudge pass on the same scan: 440 `reinvents` gave 131 upheld with a rule quoted from the standard, 12 follow it, 256 not governed, 41 upheld without a verifiable quote. It took 19.9M input tokens (17.6M cached), 0.66M per batch against adjudication's 2.3M, because each batch was sorted by subject and named its standard files instead of searching. Give Codex the addresses.
- All four list-as-table errors from the failed audit came back `not-governed`. That is the control, not the proof, since the brief was written from them. A freshly salted sample audited 4 of 15 wrong (26.7%), a pass by one row. By relation: `reinvents` 1 of 5, `no-standard` 1 of 5, `consumes` 2 of 5.
- The over-attachment problem is now in `consumes`: a chart citing the delivery-analytics metric standard with no accessible table, a `useMemo` hook citing `table`. A `consumes` with a subject and no `builtOn` got no second look, so its count is the least trustworthy number in the report.
- `apply-rejudge` sends an unverifiable upheld accusation to `no-standard`, which is wrong: the audit found one where the standard clearly governs and a race really exists. Those 41 need their own state. `not-governed` also inflates the outbound count, 411 of which most are local code the registry should not absorb. Do not read outbound as a backlog.
- 69 rows repeat another row's file and name, because a part's callers and its definition fall in different chunks. Deduplicate before counting.
