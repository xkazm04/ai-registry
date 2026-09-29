---
layer: application
type: application
subject: work-sample-timeboxing-and-cost
technique: clamp-a-proposed-timebox
stack: node
verified_on: 2026-09-29
verified_against: node@24
---

# One rule at every writer, and the two seams the rule still leaves

Written from the tree at kp `60aab8088` (2026-09-29). The 2026-08-20 version of this
page recorded two deviations, the approve route accepting 80 hours and the model
defaulting to 4.0. Both are closed, in one shared module, and the clamp is now the
technique's own example of doing it at every writer. What is left are two smaller
seams, one executed.

## The rule moved onto the model

`pipeline/jobfit/devcase/models.py:257-262` holds the policy numbers: `MAX_TIMEBOX_HOURS
= 2.0`, `MIN_TIMEBOX_HOURS = 0.5`, `DEFAULT_TIMEBOX_HOURS = 1.5`. `clamp_timebox_hours`
(`:265-274`) is the one rule: bound to `[0.5, 2.0]`, and anything that does not parse or
is not finite falls to the **default**, not to a bound. A `field_validator` on the case
(`:313-320`) applies it to every Python construction path, so a designer, a stored-case
rehydration or a fixture cannot hold an over-policy number. The old `= 4.0` default at
`:213` is now `DEFAULT_TIMEBOX_HOURS` (`:307`).

The Python designer calls the same function on the model's own estimate
(`pipeline/jobfit/devcase/design.py:499-508`). The `NaN` guard is still there and the
comment now says why the bound is elsewhere ("one rule, shared with the CaseScenario
validator and (via codegen) with the TS approve route"). The dependent scoping still
derives from the clamped value: the mid-flight update's fire time is clamped into
`[5, tb*60 - 15]` (`:518`), so it can land inside the exercise.

The TypeScript side imports the bound instead of retyping it. Codegen writes
`DEVCASE_MAX_TIMEBOX_HOURS = 2.0` into `app/_lib/taxonomy.generated.ts:48`;
`app/_lib/devcase-timebox.ts` wraps it as `clampTimeboxHours` (`:21`), `timeboxClamp`
(`:39`) and `timeboxHoursForDisplay` (`:52`). A unit test pins that the two languages
agree (`app/_lib/devcase-timebox.test.ts:19`), and another that no UI file carries a
timebox literal (`app/features/tools/devcases/devcase-timebox-ui.test.ts`); the UI's own
`?? 4` fallback was the stale default that test now forbids.

## The seam that was open now records its clamp

`app/api/devcase/lifecycle/[id]/approve/route.ts:15` imports the shared clamp and
`coerceCaseEdits` (`:22-56`) applies it to the reviewer's edit. The route's comment
states the decision the technique makes: **clamp rather than reject**, because a 10 means
"give them longer" and dropping the edit "is the very failure the 409 branch was written
to fix". The clamp is described, not just performed: `timeboxClamp` returns
`{ code: "timebox_clamped", from, to }`; the route writes it to the audit trail as a
parseable line (`timebox_clamped from=8 to=2`, `:132`) and returns it in the response
(`:136`), and the review panel renders the same object inline as the reviewer types. The
number the reviewer typed, the number the candidate gets, and the record of the
difference all come from one producer.

## Executed: what the shared module does with each kind of bad input

The module was run from the committed tree (imports rewritten to a local path, nothing
else changed):

| input | `clampTimeboxHours` | `timeboxHoursForDisplay` | clamp event |
| --- | --- | --- | --- |
| 8, 80, `"8"`, 2.5 | 2 | 2 | `from` -> 2 |
| 0, -3 | 0.5 | 0.5 | `from` -> 0.5 |
| 1, 1.5, 2 | unchanged | unchanged | none |
| missing, `null`, `NaN`, `Infinity`, `"abc"` | `null` | **2** | none |
| `""` | 0.5 | 0.5 | `from 0 to 0.5` |

Two things in it are worth reading against the technique.

- **An unusable value resolves to the ceiling at the display layer.** The Python record
  resolves it to the default, 1.5. `timeboxHoursForDisplay(undefined)` returns 2, on
  purpose (`devcase-timebox.ts:47-53`, "the largest thing any candidate can actually be
  handed", pinned by a test). It is the worst case shown to a reviewer, a defensible
  reading, and it is the two-numbers-from-one-source defect the technique's step 8
  names: the candidate page (`app/devcase/apply/[token]/page.tsx:69`, `:149`) and the
  overrun measure (`app/api/devcase/session/[id]/submit/route.ts:104`) both use it. How
  a case reaches a candidate with no timebox at all was not traced here, so the reach is
  unmeasured.
- **The two languages disagree on five of fourteen inputs.** The Python `clamp_timebox_hours`
  was run over the same values: `None`, `NaN`, `"abc"`, `""` and `Infinity` all resolve to
  1.5. The TypeScript display path resolves the first, second, third and fifth to 2 and
  reads `""` as a zero, which clamps to the floor with a recorded event (`from 0 to 0.5`),
  where the technique would call it a proposal with no intent. The approve route only
  passes numbers (`:46`), so the reviewer path is not affected. Everything in band or over
  it agrees.

## The seams the rule still leaves

- **Only the approve route records the clamp.** The designer's clamp (`design.py:508`)
  and the model validator (`models.py:320`) return the bounded number and say nothing,
  so the pattern the technique names as most worth counting, the generator echoing a
  longer take-home than the prompt allowed, is exactly the one that leaves no trace.
- **The invited number is not kept with the invitation.** The candidate page reads the
  case's current `timeboxHours` at every render (`page.tsx:149`) and the validator
  re-clamps on every rehydration. No per-invitation snapshot was found in the paths
  read. Cases approved before the shared bound existed keep whatever number they were
  stored with, and the display clamp is what stands between them and a candidate. That
  is the technique's "record, not the surface" rule holding for new cases and resting on
  the backstop for old ones.

## What is easy to miss

The clamped number is still the only one that travels. Every candidate-facing reader
resolves the timebox through one module, and the brief's "~2h" and the work surface's
clock (`LiveWorkSurface.tsx:362-363`) are the same value by construction. The elapsed
minutes are measured in the same route from the same function
(`submit/route.ts:104-107`), which is why the mismatch above matters: a case with no
timebox reads as two hours to the candidate and is measured against two hours, while the
record would have said an hour and a half.
