---
layer: application
type: application
subject: selection-score-calibration
technique: label-leakage-taxonomy
stack: node
---

# The leakage descriptor and the structural bar (Node/TypeScript)

The repo realizes the taxonomy as three collaborating pure modules: a descriptor
factory (`app/_lib/calibration.ts:344`), a verdict decision table
(`app/features/insights/analytics/calibrationVerdict.ts:71`), and the label
contract the arms are computed over (`app/_lib/db/pipeline.ts:367`). All three
are import-free or near-import-free by design so they run under bare
`node --test`.

## The descriptor is keyed on (source × outcome axis)

`calibrationLeakage(source, outcome)` (`calibration.ts:408`) returns
`{ level, code, note, ceiling }` — the level for the machine, the code for
localized copy, the note and ceiling for the reader:

- `pipeline` → `level: "high"`, code `score-caused-label`: "the screening wave
  auto-rejects on match_score, so this curve largely validates the score against
  its own decisions. The Brier score is biased optimistic by an amount nothing
  here estimates."
- `analysis` → `level: "medium"`, code `reviewer-saw-score`: the disposition is
  human, "but the recruiter saw the score while deciding, so the two are still
  correlated by anchoring, not independent."
- `holdout` → `level: "low"`, code `no-automated-leakage` — and it still carries
  a ceiling: "the human reviewer still saw the score, so this is not a fully
  score-blind trial; and the arm only covers the below-floor range, so it
  measures 'when we said reject, were we right?' — not the whole curve."

The second dimension is the interesting one. `pipeline × hired` is a *fourth*
cell with its own code, `score-caused-rejects` (`calibration.ts:412-420`), because the causal
story genuinely differs — a hire is a chain of human decisions the score does not
make, so the positive label was not score-caused. The comment states the rule the
standard names: that is "a point in its favour and it is STATED. It is not a
licence to downgrade the level", because the negative half still contains every
auto-rejection. `level` stays `"high"`, and the file says why: "a 'less circular'
arm is still a circular one."

## The bar is a decision table, not copy

`verdictFor` (`calibrationVerdict.ts:71`) returns
`trustworthy | weak | untrustworthy | unknown | circular`, and the leakage check
sits **above** the skill ladder (`:78`, before the `skill >= GOOD_SKILL` branch)
so no Brier score, however good, can route a `level: "high"` arm to
`trustworthy`. The header comment gives the reason to keep it there — "copy
regresses and a decision table does not" — and pins it with
`calibrationVerdict.test.ts`.

The module's own existence is the craft lesson. The bar used to live inside
`sections/QualityInstrument.tsx`, where the unit runner could not import it, so
it was asserted by a source-level test that read the file as text: "a guarantee
asserted by grep is exactly the shape of defect this whole drain was about —
machinery that is correct and unenforced" (`:6-10`). Extracting it into a module
free of React and `next-intl` is what turned the guarantee into an executing one.

The same function carries the degenerate-cohort rule: `calibrationSkill` returns
`skill: null` when `baseBrier` is 0, and `verdictFor` maps that to `"unknown"`
(`:75-77`) — "that is 'cannot tell you', not 'weak'."

## The arms are computed over one label contract

`pipelineCalibrationPairs` (`pipeline.ts:418`) is the single producer, and its
header (`:367-384`) is the contract: prediction is the entry's **stored**
`match_score` (the number the screen gate actually thresholds); outcome 1 is
"advanced beyond the screen gate … whatever happened later: a candidate rejected
AT interview or declining an offer still validated 'this score advances past
screening'"; outcome 0 is closed out as `rejected` while still at
Accepted/Screened; pending entries and the non-merit terminals
(`declined`/`role_closed`/`rematched`) are excluded because they are "not a
screen verdict"; and "unscored entries never enter (no fabricated 0)", enforced
by `match_score IS NOT NULL` in the query itself (`:442`).

Both positive-label sets are derived from stage *role*, never from a name:
`calibrationAdvancedStages` slices the axis at `screeningGateIndex`, and
`calibrationHiredStages` is `stagesWithRole("terminal", axis)` — "Role-derived,
never the literal 'Hired' — rename the column and the same people still count"
(`:409-416`). The holdout arm reuses the identical rule via an `onlyEntryIds`
filter, so "the inclusion rule is IDENTICAL to the contaminated curve's — the
only difference is which entries are eligible" (`pipeline.ts:420-426`).

## Deviations from the standard

- **Rendering is not enforced by the descriptor.** The ceiling is returned as a
  string and it is on each surface to display it beside the figure; nothing stops
  a future panel from computing a Brier and omitting the note. The `level`
  enforcement is real because `verdictFor` consumes it; the *note* enforcement is
  convention.
- **There is no `unclassifiable` level.** `CalibrationSource` is a closed three-
  value union, so an arm with ambiguous provenance has no home and would have to
  be forced into one of the three — the standard's "downgrade when provenance is
  unclear" rule has no representation here.
- **The analysis arm is measured against a pair the pipeline flow never writes** —
  the header at `pipeline.ts:367` records that the original reliability curve ran
  on `analyses.score × recruiter disposition` at "live n=0 with a full pipeline on
  disk", while the score that actually gated candidates was never calibrated at
  all. Worth remembering as the failure that motivated the contract: an arm can
  be perfectly classified and still be empty.
