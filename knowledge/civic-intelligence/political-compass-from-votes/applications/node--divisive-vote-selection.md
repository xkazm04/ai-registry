---
layer: application
type: application
subject: political-compass-from-votes
technique: divisive-vote-selection
stack: node
status: forged
---

# Divisive vote selection — pure selection module (politicas)

The politicas repo implements the whole draw — gates, divisiveness ranking,
and the theme-balanced round-robin — as one pure, fixture-tested function,
`selectQuestions` in `features/votetrack/kompas/select.ts`, with the loader
reduced to a thin IO shell. The module header (lines 1–38) states the rule in
the same order the code runs it, and the UI renders it verbatim.

## The gates, as shipped

- **Validity by construction** (lines 6–12, 109–120): since 2026-08-11 the
  input is the record's own per-valid-vote index (`VoteIndexEntry[]` from
  `record/derive.ts`), so voided roll calls are absent before selection ever
  runs — the header explicitly warns that anyone bypassing the index must
  re-apply the validity filter themselves.
- **Procedural exclusion** (lines 45, 142–145): themes `procedura` and `jine`
  are excluded by name via `EXCLUDED_THEMES`, counted into `droppedByTheme`.
- **Participation floor** (lines 44, 146–155): `MIN_POSITIONAL = 120`
  positional ballots. The two rejection states are kept apart:
  `withoutBallots` (no tally held — the floor never judged it) vs
  `droppedByPositional` (measured and failed), lines 93–99 documenting
  exactly the "we have no ballots ≠ too few voted" distinction.
- **Confidence floor, last, missing ≠ low** (lines 47–66, 156–164):
  `MIN_TAG_CONFIDENCE = 0.7` over the classifier's self-reported tag
  confidence. A `null`/absent confidence is *kept* and counted into
  `withoutConfidence` — the doc comment names the repo's own precedent that
  reading a missing value as zero is banned. The gate deliberately runs last
  so `droppedByConfidence` means "taken by this rule", not a mixture (comment
  at lines 156–157).

## The counted-loss incident

Lines 14–19 record the incident that produced the accounting discipline:
until 2026-08-11 only the confidence threshold was counted — theme exclusion
and participation dropped candidates *silently*, on the one surface whose
whole promise is that the rule is checkable. The fix made every gate emit a
counter in `SelectionResult` (lines 86–107), evaluated in declared order so
the tallies describe loss, not overlap. Untagged votes are also handled per
the boundary in the technique: line 139–141 skips them without counting them
as gate victims ("the rule doesn't decide about them, it knows nothing about
them" — coverage reports their volume instead).

## Ranking and determinism

Divisiveness is `margin = |yes − no| / (yes + no)`, 3dp (line 166), ranked
ascending within each theme with the disclosed tie-break cascade — more
positional ballots, newer date, higher registry id (lines 175–184). Theme
order and the round-robin draw (lines 186–197) belong to the sibling
theme-balanced-drawing technique but live in the same pure module, so one
fixture suite (`select.test.ts`) pins the entire draw. Every constant the UI
prints (`QUESTIONS_CAP`, `PER_THEME_CAP`, `MIN_POSITIONAL`,
`MIN_TAG_CONFIDENCE`) is exported from this module — the rendered rule
interpolates live values rather than restating them.
