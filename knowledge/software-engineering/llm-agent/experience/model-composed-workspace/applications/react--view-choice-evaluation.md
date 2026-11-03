---
layer: application
type: application
subject: model-composed-workspace
technique: view-choice-evaluation
stack: react
status: forged
verified_on: 2026-11-03
verified_against: react@19.3
---

# The wallet's board evaluation: forty labelled questions through the real door

The money-safety wallet (repository `paypal`) lets a model choose what its board
shows: which answer panels, which proposals, or none. Its design note asked for a
measure before shipping
(`docs/design/conversational-home.md:37 "Measure that separately (an eval over a fixed set of intents)"`),
and commit `2d8a554b42f361528c55957432bfb1bad17e9483` (main) lands it in
`apps/desktop/client/src/lib/assistant/eval/`. Every anchor was read at that
commit; paths are relative to the repository root, and the client pins
`apps/desktop/client/package.json:21 "react"` at 19.3.

## The labelled set, with negatives - confirmed

A case is a question, the board it is asked against and the expected form
(`apps/desktop/client/src/lib/assistant/eval/cases.ts:53 "export type EvalCase = {"`).
Forty cases over three boards - a busy Friday, a brand-new wallet, a quiet day
(`apps/desktop/client/src/lib/assistant/eval/cases.ts:27 "export const BOARDS = {"`),
each built fresh per case so a run cannot leak into the next
(`apps/desktop/client/src/lib/assistant/eval/cases.test.ts:62 "builds a fresh board per case"`).
`apps/desktop/client/src/lib/assistant/eval/README.md:11 "Twelve cases are negatives: eight whose"`
honest answer is a sentence, four where a panel is right and an act is not. The
shape is guarded - at least a quarter negatives, of both kinds
(`apps/desktop/client/src/lib/assistant/eval/cases.test.ts:24 "toBeGreaterThanOrEqual(0.25)"`),
every panel kind, every act as a positive and as a must-not, and comparative
questions that expect two panels.

**Upward lesson: the same words against different data.** "What needs me?" is
asked three times: the list on the busy board, setup on day one
(`apps/desktop/client/src/lib/assistant/eval/cases.ts:119 "Same words as needs-what-needs-me, different data"`),
and a sentence on the quiet one
(`apps/desktop/client/src/lib/assistant/eval/cases.ts:154 "nothing waits, so the honest answer is one sentence, not an empty list"`).
The set asserts such a pair exists
(`apps/desktop/client/src/lib/assistant/eval/cases.test.ts:45 "asks the same words against different boards"`).
A set keyed on the question alone cannot see that the data shape decides the form.

## Scored through the real door - confirmed

Every outcome passes the validator the board uses, before anything else is
scored (`apps/desktop/client/src/lib/assistant/eval/score.ts:88 "validateReply(outcome.raw, known)"`),
with the deal ids of the case's own board as the known set
(`apps/desktop/client/src/lib/assistant/eval/arm.ts:31 "dealIds: new Set(digest.deals.map((d) => d.id))"`).
Schema-valid means the door dropped nothing
(`apps/desktop/client/src/lib/assistant/eval/score.ts:90 "const schema_valid = outcome.ok && readable && v.dropped.count === 0;"`),
and everything after is scored on what the owner would see. An engine failure is
`apps/desktop/client/src/lib/assistant/eval/score.ts:7 "scored as an unreadable reply"`,
never skipped.

## Two trigger rates on their own denominators - confirmed

False trigger is a panel where the answer is a sentence, an act the case did not
expect, or anything on its must-not list
(`apps/desktop/client/src/lib/assistant/eval/score.ts:138 "const false_trigger = panel_when_prose || unexpected_acts.length > 0 || must_not_hits.length > 0;"`),
over every case (`apps/desktop/client/src/lib/assistant/eval/score.ts:215 "false_trigger: of((s) => s.false_trigger),"`).
Missed trigger is over the cases that expect something
(`apps/desktop/client/src/lib/assistant/eval/score.ts:221 "missed_trigger: of((s) => s.missed_trigger, (_, c) => expectsSomething(c)),"`),
and exact choice over the cases that label panels
(`apps/desktop/client/src/lib/assistant/eval/score.ts:214 "c.expect.panels !== 'any'"`).
Proved at `apps/desktop/client/src/lib/assistant/eval/score.test.ts:114 "reports each rate over its own denominator"`.
The table adds false triggers by cause and a confusion table of expected by shown
kind (`apps/desktop/client/src/lib/assistant/eval/score.ts:245 "the five figures, the false-trigger breakdown, the confusion counts, the failures"`).

## Two arms, one loop - confirmed

The engine is injected, so
`apps/desktop/client/src/lib/assistant/eval/arm.ts:3 "run the same loop, the same door and the same scorer"`.
The scripted arm runs in the unit runner and asserts only that the harness runs
and every reply is schema-valid
(`apps/desktop/client/src/lib/assistant/eval/scripted.eval.test.ts:3 "Choice accuracy is MEASURED and printed, never asserted"`).
The live arm calls the dev bridge's own path - same prompt, schema, budget cap
and timeout (`apps/desktop/client/scripts/evalBoard.ts:90 "const r = await runClaude(question, digest, bin);"`) -
and writes results outside the repository
(`apps/desktop/client/scripts/evalBoard.ts:4 "Writes a results JSON OUTSIDE the repository"`);
if every call fails it refuses to report
(`apps/desktop/client/scripts/evalBoard.ts:101 "nothing was scored and no result was written"`).

## Cases never change to pass a run - confirmed

`apps/desktop/client/src/lib/assistant/eval/cases.ts:6 "THE RULE: a case is never edited to make a run pass."`
A case changes only when the expected answer did, and its note says why
(`apps/desktop/client/src/lib/assistant/eval/README.md:95 "A case changes only when the product's expected answer"`).
The set's tests guard the set, not the score
(`apps/desktop/client/src/lib/assistant/eval/cases.test.ts:2 "they never look at what an engine answers"`).

## The first measured figures

As the README records them, 2026-11-03, 40 cases each
(`apps/desktop/client/src/lib/assistant/eval/README.md:52 "2026-11-03, arm scripted, 40 cases"`,
`apps/desktop/client/src/lib/assistant/eval/README.md:68 "arm claude-code (CLI 2.1.317, CLI default model, concurrency 3), 40 cases"`):

| Figure | Scripted arm | Live arm (CLI default model) |
|---|---|---|
| schema-valid | 40/40, 100.0% | 40/40, 100.0% |
| exact choice | 21/37, 56.8% | 25/37, 67.6% |
| false trigger | 7/40, 17.5% (panel when prose 7) | 8/40, 20.0% (panel when prose 8) |
| missed trigger | 12/31, 38.7% | 4/31, 12.9% |
| pass | 21/40, 52.5% | 28/40, 70.0% |

The live run took
`apps/desktop/client/src/lib/assistant/eval/README.md:78 "65 s wall time, median 4.4 s per call, reported cost $0.35 for the run."`
Every single-panel case, every act case and every no-act negative passed.

## The two failure classes, traced to the prompt

1. **All eight sentence-shaped questions got a panel**
   (`apps/desktop/client/src/lib/assistant/eval/README.md:82 "All eight sentence-shaped questions got a panel"`).
   The prompt orders it:
   `apps/desktop/client/src/lib/assistant/prompt.ts:17 "Start with a show op."`,
   and the honest-gaps rule adds
   `apps/desktop/client/src/lib/assistant/prompt.ts:24 "show the nearest panel"`.
   So `apps/desktop/client/src/lib/assistant/eval/README.md:85 "The product currently cannot answer in prose alone."`
2. **All four comparative questions got one panel**
   (`apps/desktop/client/src/lib/assistant/eval/README.md:86 "All four comparative questions got one panel"`),
   because the model is told a show
   `apps/desktop/client/src/lib/assistant/vocabulary.ts:86 "replaces the current one"`,
   copy that is
   `apps/desktop/client/src/lib/assistant/contract.ts:55 "pinned for the shell in assistant_contract.json"`.

Both are recorded as known gaps with a re-run owed
(`docs/features/conversational-home.md:73 "relax them after 2026-11-12 and re-run"`).
**Upward lesson:** when a failure class is uniform - eight of eight, four of four -
read the instruction before blaming the model's reading of the question. The
false-trigger rate here measures the prompt, and the fix is the opposite of
tightening the router.

## Deviations - the standard stays

1. **No field-relevance judge.** Only kind and identity fields are scored
   (`apps/desktop/client/src/lib/assistant/eval/README.md:33 "field relevance judged by a model calibrated against people, drift over whole sessions, and whether"`).
2. **No session drift measure.** Every case is one turn on a fresh board;
   acceptance early versus late, undone rearrangements and pin violations are
   not measured, though the board now has undo and pins to log.
3. **No seeded-error reliance test**
   (`apps/desktop/client/src/lib/assistant/eval/README.md:34 "people catch seeded wrong answers"`).
4. **The sentence is not scored**
   (`apps/desktop/client/src/lib/assistant/eval/README.md:34 "is not scored (the poem case shows why it"`):
   asked for a poem, the model wrote one
   (`apps/desktop/client/src/lib/assistant/eval/README.md:90 "asked for a poem, the model wrote one before"`).
   Schema-valid is weaker than the technique's validity, which refuses figures
   in model text; this door does not.
5. **The live predicate is incomplete.** The live arm names no model
   (`apps/desktop/client/src/lib/assistant/eval/README.md:47 "unset means the CLI default"`),
   so a later run on a changed default is not comparable; one run, no repeats,
   no split by kind of owner or task beyond the three boards.

## Upward lessons for the technique

- **Act cases are scored on the proposal alone.** Where an act is the answer, the
  panel is not labelled
  (`apps/desktop/client/src/lib/assistant/eval/cases.ts:15 "the consent box the host draws IS the answer's form"`).
- **Every shown panel is scored.** An extra panel beside the right one breaks
  exact choice (`apps/desktop/client/src/lib/assistant/eval/score.ts:119 "extra.length === 0"`).
- **A wrong identity is its own class**
  (`apps/desktop/client/src/lib/assistant/eval/score.ts:17 "A right kind with the wrong identity (another deal) is a wrong choice, not a missed trigger."`).
- **Any unlisted act is a false trigger; hand-offs only when named**
  (`apps/desktop/client/src/lib/assistant/eval/cases.ts:16 "Any act proposal NOT listed here is a false"`).
