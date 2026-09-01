---
layer: application
type: application
subject: i18n
technique: token-label-separation
stack: react
verified_on: 2026-09-01
verified_against: react@19
---

# Two kinds of miss — a repo that degrades tokens and omits records

This codebase runs no translation catalog: display strings are English
literals and the "catalog" is a family of per-category `Record<Token,
string>` label maps. That makes it a clean specimen of the technique's
*resolution* half, because the miss path is written out at every call site
instead of being hidden inside a library's `t()`. Both branches of the
token-vs-content split exist here, and one file carries both.

## The token half: the identifier, in three degradations

Every category map resolves through `?? <something legible>`, and the
"something" is chosen by how much the neighbouring layout already explains:

- **Raw id**, where the surrounding label names the category outright —
  `src/lib/llm/config.ts:197-199`, whose comment states the policy in one
  line: "unknown ids fall back to the raw id". Same shape at
  `src/app/usage/usagePanels.tsx:17` ("Unknown ids fall back to accent +
  the id"), `src/components/org/shared/goalView.tsx:150`, and
  `src/features/shared/skills/ApiTokensPanel.tsx:160`.
- **Case-normalized id**, where the token lands in a dense table cell —
  `src/components/org/shared/uiConstants.ts:22-25` humanizes `ai-native` to
  "Ai Native", and its header says why: "rather than a blank cell or the
  raw slug, so a fleet table can never show an empty/garbled posture."
- **A generic label for the category**, where the identifier would be a
  provider name the reader has no use for —
  `src/components/report/ReportClientStatus.tsx:60-65` falls an unknown
  inference provider back to `GENERIC_SCORE_LABEL` ("Scoring against the
  rubric"), which is still a true statement of what the step is doing.

All three are the technique's sanctioned degradation, and all three work
for the same reason: the token is never the only thing on the row. The
non-string case is pinned as a regression:
`src/components/report/reportFallbacks.test.ts:11-14` fixes a neutral tint
for a drifted `posture.id` in `PostureQuadrant.tsx:72`, because an unknown
id there resolved to `undefined` and the "you are here" dot *vanished* —
the visual equivalent of an empty string. (The pin holds the *decision*,
not the component: its header cites `PostureQuadrant.tsx:62` and the
neutral `#475569`, while the live guard is at `:72` and now falls back to
`#94a3b8` — the mirrored-constant technique the test file admits to at
`:17-20` costs exactly this drift.)

## The content half: omit the record, then the empty state

`src/components/report/PassportDeclined.tsx` holds both branches twenty
lines apart, which is the clearest statement of the split in the repo:

- `:42-47` — the graded artifact rows are built from a stored passport blob
  that may predate the graded ladders. Rows whose grade is absent are
  **filtered out**, and if none survive the whole block returns `null`
  (`:47`). The comment at `:38-41` gives the reasoning: "Read defensively
  and render nothing — a missing artifact set must not take the whole
  report down with it."
- `:56` — a row that *did* survive renders `GRADE_LABEL[grade] ?? grade`.
  The label map may miss; the record may not.

So the same component omits when the *record* is missing and prints the
identifier when only the *label* is missing. `:13` does the outer version
of the same move — an empty `declined` list renders no section at all
rather than an empty heading.

The paired empty state is enforced where omission would otherwise leave a
broken shape rather than a shorter list:
`src/components/report/RadarChart.tsx:42-50` returns a labeled "No
dimension data" placeholder for a zero-length dimension set (pinned by
`reportFallbacks.test.ts:6-9`, which records the failure it replaces:
`angleFor()` divides by `n`, so `n === 0` collapsed every vertex to `NaN`).
The counter-case is deliberate and documented at
`src/components/report/ExpectedLiftBasis.tsx:10-15`: when there is no
publishable distribution the component renders **nothing** — "not 'no data
yet', not '+0', not a greyed placeholder" — because "a row that says 'no
measured lift' reads as a finding nobody made." Omission and empty state
are one decision with two answers, and the answer follows from whether the
surrounding surface still makes sense without the record.

## Where the split is not yet honoured

Two gaps, both consistent with what the technique predicts:

- **No miss is instrumented.** Every `??` above degrades silently. The
  technique's reactive half — report the token and category to telemetry in
  production — has no implementation here, so the maps drift against their
  vocabularies until a human notices a raw slug in a screenshot. The
  proactive half exists only as hand-written per-domain tests.
- **A total `Record` type is not a total resolver.**
  `src/components/onboarding/tour/tasks.ts:136` reads `TASK_COPY[step.id]`
  and dereferences `copy.title` unguarded, which typechecks because
  `TASK_COPY` is declared `Record<GettingStartedStepId, TaskCopy>`
  (`:57`). But `step.id` arrives from `GET /api/org/getting-started` at
  runtime (`:17-24`), so a server that mints a new step id ahead of the
  client throws inside `buildDrawerItems` (`:187`) and takes the whole
  onboarding drawer down. This is exactly the technique's "where the
  vocabulary is open at the edges, the map cannot be total by
  construction" clause: the compiler was asked to guarantee a property the
  wire does not have. The content-side fix is the content-side rule — drop
  the unknown step from the list and let the drawer be shorter.
