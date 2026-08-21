---
layer: application
type: application
subject: production-coverage-measurement
technique: readiness-ladder
stack: process
status: forged
verified_on: 2026-08-20
---

# The R-ladder as a defined production scale

`src/lib/status/readiness.ts` is the written definition of PoF's readiness ladder: the
rung order, the name and one-line meaning per rung, the states that are deliberately not
rungs, and the colour ramp derived from the order. It is a pure projection over the
already-derived `StepCell` — the header states that "no grading logic lives here and none
moved", so consolidating the display cannot move a verdict.

## The rungs (`readiness.ts:26`, `:50`, `:59`)

`LADDER` is `['R0','R1','R2','R3','R4','R5']` and is documented as "the ONLY place rung
order is written down"; `RAMP` and `rank` derive from it, and a test pins them together so
a future edit cannot desync the ramp.

| rung | `READINESS_NAME` | `READINESS_MEANING` |
| --- | --- | --- |
| R0 | NOT WIRED | No artifact at all — nothing has ever been produced for this step. |
| R1 | HOLLOW | Nothing real behind it: a pass on placeholder data, no engine that can produce it, or produced but not passing. |
| R2 | DRAFTED | Real output exists but only shape-level checks ran, and the engine class needs a gate to prove quality. |
| R3 | REVIEWED | Passes, from an engine class that scales to quality without a gate — or a judge passed it below the shippable band. |
| R4 | PROVEN | A real L3/L4 gate passed (headless-reproducible), or a strict judge scored it at the shippable bar. |
| R5 | SHIPPED | Proven quality AND proven running in the engine — the only rung that means production. |

R5 is the one rung that reads outside `CellGrade`: `readinessOf` (`:128`) requires
`grade === 'verified'` **and** an audited `realization.ue === 'proven'` fact, deliberately
promoting the realization audit from decoration to a readiness input for this display
projection only. Acceptance, `gradeArtifact` and the checkers never see it.

## Waiting and blocked are states, not rungs

`ReadinessState` (`:35`) is `'reached' | 'waiting' | 'blocked'`, and the header is explicit
that these are "two states that are deliberately NOT rungs (a gate that was declared but
never run is not progress; a failure is not a level)."

A `deferred` grade returns `{ level: 'R4', state: 'waiting' }` — placed at the would-be
rung and rendered hollow "so it can never read as progress". A `blocked` cell's level
comes from `blockedWouldBeLevel` (`:113`): R1 if nothing passed, otherwise the R2/R3 split
`deriveCell` would apply to a plain pass — the rung whatever *did* pass earned it, kept
"only so blocked cells sort and filter sanely".

## The incident that produced the ladder (`readiness.ts:1`)

The module header records why the two-encoding design was collapsed into one. `/status`
painted two competing colour languages on every cell — background encoding `CellGrade`
(credibility), a 3px left stripe encoding the acceptance tier L0–L4 (which *kind* of check
was reached):

- `TIER_VAR.L4` and `GRADE_VAR.verified` were the same green, so green meant "declares a
  visual gate" on the stripe and "a gate actually passed" in the fill;
- the stripe read `bestPassTier ?? tier` — and that fallback took the max tier of **any**
  artifact regardless of status, so a declared-but-deferred L4 painted a green stripe on
  an amber cell, **rewarding ambition instead of achievement**;
- `TIER_VAR.L1` and `TIER_VAR.L2` are literally the same hex on the Blueprint floor
  (`--lab-ink` === `--lab-accent`), so the 5-step ramp had 4 distinguishable steps.

All three are the generalized decision rules in the technique: one encoding per cell,
maximise over achievements not intentions, and assert the ramp is distinguishable.

## Every grade explains itself

`GRADE_BECAUSE` (`:93`) carries one honest line per grade, surfaced by `readinessLabel`
(`:191`) as `"R4 PROVEN · waiting — <because>"`:

- `unwired` — no artifact has ever been recorded for this step
- `unpowered` — the checker passed on placeholder data; nothing in the stack can actually produce this
- `pending` — an artifact exists but does not satisfy its own checker yet
- `ungated` — output exists and passes shape checks, but its engine class needs a gate to prove quality
- `trusted` — passes, from an engine class that scales to quality without a gate
- `verified` — a real gate passed, or a strict judge scored it at the shippable bar
- `deferred` — the gate that would prove this is declared but has not been run
- `attention` — a checker or a judge condemned this output

## Colour discipline

`RAMP` (`:159`) reserves the OK token for R4/R5 only; R1–R3 are one `--lab-ink` weight
ramp at 8/18/32% fill, "so there is no hue argument in the middle of the scale". Blocked
uses `BLOCKED_TOKEN` outside the ramp on purpose. Colour never carries a rung alone:
`readinessCode` (`:185`) prints `R4⋯` / `R3✕` from `STATE_GLYPH`, citing WCAG 1.4.1 and
the repo's glyph-plus-word-over-hue convention.
