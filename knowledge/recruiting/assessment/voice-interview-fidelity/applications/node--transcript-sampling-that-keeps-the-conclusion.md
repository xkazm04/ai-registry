---
layer: application
type: application
subject: voice-interview-fidelity
technique: transcript-sampling-that-keeps-the-conclusion
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
applied: unapplied
ab_verdict: unapplied
---

# Head+tail sampling on the scoring path

`app/_lib/interview-transcript.ts:5` is a module whose entire header is an argument
for this technique, written after the failure it describes. Read at kp `60aab8088`
on 2026-09-29, from the commit and not the working tree.

## The failure it replaced

The header records what was there before: two bare magic numbers (4000 / 6000)
"applied as silent front-slices, which meant the conclusion of the longest,
richest interviews could be dropped before the scorer ever saw it, with no marker
and no log." A front slice at a fixed character budget deletes the closing
read-back, and the corrupted earlier occurrences of every technology name become the
only version the scorer sees. Two correct mechanisms, silently cancelled by a
`.slice(...)`.

## The policy, now in two languages

`buildScorecardNotes` (`:180`) passes the transcript **whole** when it fits
`MAX_SCORECARD_NOTES_CHARS` and above it keeps the opening and the closing, dropping
the middle for an in-band marker (`omittedMarker`, `:167`) and cutting on turn
boundaries. `capTranscriptTurns` (`:97`) applies the same shape at the persistence
cap (`MAX_TRANSCRIPT_TURNS = 500`, `:48`). Every TypeScript consumer goes through the
one function.

New since the first verification: the Python scorecard has its own sampler,
`sample_scorecard_notes` (`pipeline/jobfit/automation.py:2398`), because the
scorecard is synthesized on the Python side and its quote-grounding check runs
against the *sampled* text. The budget is no longer a TypeScript literal. It is
defined once in Python (`MAX_SCORECARD_NOTES_CHARS = 6000`, `:2395`) and generated
into `app/_lib/contract-constants.generated.ts:11`, which the TypeScript imports
(`interview-transcript.ts:2`), and a test refuses a literal at the old home.

`ScorecardCoverage` still travels with the scorecard and is produced only when
sampling dropped turns, so its absence is the honest "the scorer read everything"
signal (`coverageFromNotes`, `:155`).

## The budget is the number to look at

6000 characters is roughly 1,500 tokens. The tree's own comment puts a 30-minute
screen at "the low hundreds of turns" (`interview-transcript.ts:45`). By arithmetic, and not by measurement,
an ordinary interview is several times the budget, so on this path sampling is the
normal case and the scorer reads a fraction of what was said. The coverage stamp
records the real ratio per scorecard, and the registry could not read those
figures, so how much of an interview the scorer actually sees is unmeasured here.
The budget is not a context limit; it is a choice, and nothing in the module argues
for the value.

## Confirmed and deviating

- **Confirmed** — whole below budget, head+tail above, in-band marker, turn-boundary
  cuts, structured warning on truncation, coverage propagated to the recruiter
  surface, one chokepoint per language, and the same policy at the persistence cap.
- **Confirmed, and a condition on the technique** — the director runs the read-back
  as the last block, after the candidate's questions (`director-brief.ts:93`), so a
  tail window catches it by construction. An anchor on the read-back would be
  insurance here, and is required only where the read-back can precede a long close.
- **Deviation, still open, and now a false comment** — the TypeScript split is
  symmetric (`headBudget = Math.ceil(budget / 2)`, `:207`; `headCount` at `:99`). The
  Python sampler is symmetric too (`head = budget // 2`, `automation.py:2420`), under
  a comment that reads "Bias to the tail" (`:2418`). The standard asks for a
  tail-heavier split; symmetric is defensible, and the comment claiming otherwise is
  wrong and will mislead whoever tunes it.
- **Deviation, still open** — nothing anchors the window on the read-back exchange.
  Both samplers cut on position only.
- **Deviation, moved and still open** — a competency whose only evidence sat in the
  dropped middle is not lowered to unassessed. What exists is the grounding step:
  a quote not found in the *sampled* text becomes `UNGROUNDED_EVIDENCE`
  (`automation.py:2262`) and the confidence band widens, but the commit message says
  "the rating is kept: this drops the citation, not the score". The read-side
  not-assessed filter (`interview-scorecard.ts:80`) recognises only a rating of 3
  carrying placeholder text, so a kept 5 or 2 with the placeholder counts as rated.
