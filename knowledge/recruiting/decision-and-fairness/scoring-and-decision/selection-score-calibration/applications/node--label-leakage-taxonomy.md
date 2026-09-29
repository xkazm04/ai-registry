---
layer: application
type: application
subject: selection-score-calibration
technique: label-leakage-taxonomy
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# The leakage descriptor and the structural bar (Node/TypeScript)

Read against kp at `006bf7a0a`. The 2026-08-20 version of this note cited `calibration.ts:344`
and `pipeline.ts:367-442`; the descriptor is now at `calibration.ts:463` and the label
contract at `db/pipeline.ts:600-720`, and the reading below is of the current code.

The repo realises the taxonomy as three collaborating pure modules: a descriptor factory
(`app/_lib/calibration.ts:463`), a verdict decision table
(`app/features/insights/analytics/calibrationVerdict.ts:71`), and the label contract the arms
are computed over (`app/_lib/db/pipeline.ts:651`, `:698`). All three are import-free or
near-import-free by design so they run under bare `node --test`.

## The descriptor is keyed on (source × outcome axis)

`calibrationLeakage(source, outcome)` returns `{ level, code, note, ceiling }` — the level
for the machine, the code for localised copy, the note and ceiling for the reader.
`CalibrationSource` (`:409`) is the closed union `pipeline | analysis | holdout`:

- `pipeline` → `level: "high"`, code `score-caused-label`: "the screening wave auto-rejects on
  match_score, so this curve largely validates the score against its own decisions. The Brier
  score is biased optimistic by an amount nothing here estimates."
- `analysis` → `level: "medium"`, code `reviewer-saw-score`: the disposition is human, "but the
  recruiter saw the score while deciding, so the two are still correlated by anchoring, not
  independent."
- `holdout` → `level: "low"`, code `no-automated-leakage`, and it still carries a ceiling: "the
  human reviewer still saw the score, so this is not a fully score-blind trial; and the arm
  only covers the below-floor range, so it measures 'when we said reject, were we right?' —
  not the whole curve."

The second dimension is the interesting one. `pipeline × hired` is a *fourth* cell with its own
code, `score-caused-rejects` (`:468-`), because the causal story genuinely differs — a hire is
a chain of human decisions the score does not make, so the positive label was not
score-caused. The comment states the rule the standard names: that is "a point in its favour
and it is STATED. It is not a licence to downgrade the level", because the negative half still
contains every auto-rejection. `level` stays `"high"`: "a 'less circular' arm is still a
circular one."

## The bar is a decision table, not copy

`verdictFor` (`calibrationVerdict.ts:71`) returns
`trustworthy | weak | untrustworthy | unknown | circular`, and the leakage check sits **above**
the skill ladder (`:78`, before the `skill >= GOOD_SKILL` branch), so no Brier score, however
good, can route a `level: "high"` arm to `trustworthy`. The header gives the reason it lives
there — "copy regresses and a decision table does not" — and `calibrationVerdict.test.ts` pins
it. The module's own existence is the craft lesson: the bar used to sit inside a React section
the unit runner could not import, so it was asserted by a test that read the file as text,
"machinery that is correct and unenforced"; extracting it made the guarantee executable.

The same function carries the degenerate-cohort rule: `calibrationSkill` returns `skill: null`
when the reference error is 0, and `verdictFor` maps that to `"unknown"` (`:75-77`) — "cannot
tell you", not "weak".

## The arms are computed over one label contract

`pipelineCalibrationPairs` (`db/pipeline.ts:651`) is the single producer, and its header
(`:600-620`) is the contract: prediction is the entry's **stored** `match_score`; outcome 1 is
"at or past the screen gate … whatever happened later"; outcome 0 is closed out as `rejected`
while still at Accepted/Screened; pending entries and the non-merit terminals
(`declined`/`role_closed`/`rematched`) are excluded; "unscored entries never enter (no
fabricated 0)", enforced by `match_score IS NOT NULL` in the query (`:676`).

There is now a second axis in the same producer, and the negatives differ. `opts.outcome ===
"hired"` swaps the positive set to `stagesWithRole("terminal", axis)` (`:649`) and reads the
current position only ("an undone hire is not a hire"), and its negative is rejected
*anywhere* without reaching the terminal. `calibrationOutcome` (`:698`) is the one label rule
for the curve and the band drill. Both positive sets are derived from stage *role*, never a
name: `calibrationAdvancedStages` (`:639`) slices at `screeningGateIndex`. The holdout arm
reuses the identical rule through `onlyEntryIds`.

## Deviations from the standard

- **The ceiling is enforced for "high" only.** The standard gives each level a ceiling that
  composes: high can never be trustworthy, medium is at most suggestive, low is trustworthy
  for the range it spans. `verdictFor` implements the first and has no representation of the
  second or third: there is no "suggestive" in the `Verdict` union, and a `medium` arm falls
  through to the skill ladder and can be called `trustworthy` at skill 0.2. Today the branch
  is unreachable, because `QualityInstrument.tsx:116` and `:121` feed `verdictFor` only the
  `pipeline` and `holdout` arms and the `analysis` arm is never judged, so the gap is latent.
  It becomes live the day a surface judges the analysis arm. The `holdout` arm's "for the range
  it spans" caveat is the descriptor's string, not a value the verdict can carry.
- **Rendering is not enforced by the descriptor.** The ceiling is returned as a string and it
  is on each surface to display it beside the figure; nothing stops a future panel computing
  a Brier and omitting the note. The `level` enforcement is real because `verdictFor`
  consumes it; the *note* enforcement is convention.
- **There is no `unclassifiable` level.** `CalibrationSource` is a closed three-value union, so
  an arm with ambiguous provenance has no home and would have to be forced into one of the
  three; the standard's "downgrade when provenance is unclear" rule has no representation.
- **The analysis arm was measured against a pair the pipeline flow never writes.** The header of
  the pipeline producer records that the original reliability curve ran on
  `analyses.score × recruiter disposition` at "live n=0 with a full pipeline on disk", while
  the score that actually gated candidates was never calibrated at all. An arm can be
  perfectly classified and still be empty.
