---
layer: application
type: application
subject: interview-run-of-show
technique: duration-band-and-clamping
stack: node
status: forged
---

# The timing contract as a pure, CI-enforced module

`app/_lib/run-of-show.ts` is the whole duration band in one dependency-free module. Its
header comment states the contract before any code runs: the plan is pinned to a
documented 15–30 minute band, its shape is `intro (fixed) + one block per CV-derived
question + wrap (fixed)`, and an optional open-discussion block absorbs slack "so a
SPARSE question set still fills the minimum rather than handing the interviewer a
7-minute plan labelled as a real interview."

## The constants are the contract

```
MIN_DURATION_MIN = 15        // run-of-show.ts:31
MAX_DURATION_MIN = 30        // run-of-show.ts:32
INTRO_MIN = 3                // :35   fixed opening
WRAP_MIN = 4                 // :37   fixed closing
MAX_QUESTIONS = 6            // :40
RELAXED_QUESTION_LIMIT = 5   // :43
Q_MINUTES_RELAXED = 4        // :46
Q_MINUTES_TIGHT = 3          // :47
```

Every one of them carries a doc comment saying *why*, and the tightening flip at `:43`
carries the arithmetic that forces it, written out in the module header at line 8:
`6 × 4 + 7 = 31 > 30`. Six questions at the relaxed rate plus the seven fixed minutes
would breach the ceiling, so past five questions the per-question value drops to three.

## The clamp is a proven no-op downward

`buildRunOfShow` (`:92`) slices to `MAX_QUESTIONS` at `:100`, picks `qMinutes` at `:102`,
pushes the intro, one block per question, then computes:

```ts
const withWrap = cursor + WRAP_MIN;
const target = clamp(withWrap, MIN_DURATION_MIN, MAX_DURATION_MIN);
const deficit = target - withWrap;
if (deficit > 0) push(deficit, s.openTopic, s.openGoal, []);   // :131-135
```

The comment at `:126-130` names both sparse cases explicitly — "0 questions → 7 min,
1 question → 11 min" — and states the invariant that makes the clamp safe: "The
MAX_QUESTIONS cap + the per-question flip keep the upper bound ≤ MAX, so we only ever
pad here, never trim." The final `clamp` at `:140` is then annotated as "a defensive
no-op that keeps the contract explicit" — exactly the shape the technique argues for: a
band whose downward branch can never fire because the other constants already bound it.

The open block is pushed *before* `WRAP_MIN` (`:136`), so the ordering is
intro → questions → open discussion → wrap, and the closing is never the block that
absorbs drift.

## Purity is what makes the band enforceable

The header at `:11-13` states the reason the module has no DB or CLI imports: "the
timing contract is unit-testable in isolation (`run-of-show.test.ts`) and the bounds are
enforced in CI." The interviewer-facing prose was originally a `Record<"en"|"cs", …>`
table inside this file — the `F5` note at `:56-66` records that a German or French
recruiter "silently got the English plan" — and the fix passed the strings in as a
`RosStrings` parameter rather than importing a catalog loader, specifically to keep the
module pure. The band survived a localization refactor because it had no dependencies to
drag along.

## The truthful floor on the scheduling side

`app/_lib/interview-planned-minutes.ts` holds the other half: the number the scheduling
surfaces promise. `plannedInterviewMinutes` (`:53`) is documented as computing the
duration "WITHOUT its side effects: it never generates missing prep, so it is safe to
call when minting a scheduling link. An entry whose prep doesn't exist yet reports the
quick screen — the truthful floor — rather than a promise the brief may not keep."

Its precedence chain is `debrief > generic student > grounded prep > quick screen`, and
the debrief length at `:26-28` is `Math.min(25, 8 + 3 * followupCount)` — roughly three
minutes per minted question on top of an open walkthrough, capped "to stay a screen",
and single-sourced so the brief and the schedule estimate cannot disagree.

The module's own existence is a second lesson: the header at `:4-15` records that
importing this estimate from `interview-run.ts` dragged the voice layer, prep generator
and transcript pipeline into routes that only mint a link — 116 modules where ~55 do the
work — so the leaf was extracted and re-exported. A duration promise that is expensive to
compute is a promise something will eventually skip computing.

## The same craft, hand-written: the scripted round

`pipeline/jobfit/interview-script.json:1` declares `"durationMin": 22` over six phases,
each with a minute range, a goal, a written-out probe, a listen-for and the competencies
it feeds — the phase-level version of the same budget. Its ranges are `3–4, 4–5, 4–5,
3–4, 3–4, 3–4`, which sum to 20 at the lower bounds and 26 at the upper against a stated
22: the ranges-sum-below-the-total arithmetic the technique's slack rule exists for.

Two of its phases are worth reading as craft. "Coachability injection" (`:31-39`) scripts
a deliberate mid-problem hint and instructs "Score the uptake, not the answer", with the
two anchor points inline ("integrate and build on it (5) vs acknowledge and ignore (2)").
"Calibration & direction" (`:49-57`) probes the self-rating rather than accepting it:
"Rate your SQL 1–10. What would someone one point above you know that you don't?"

## Deviations

- The band's tight per-question value is **3 minutes** (`Q_MINUTES_TIGHT`, `:47`), below
  the ~4-minute floor the technique sets for a competency probe with a follow-up. It is
  defensible for a 15–30 minute screening round and is not defensible as a general
  value; the standard stays at four.
- The scripted round in `interview-script.json` has **no fixed opening or closing block
  at all**: its first phase is "Anchor on their ground" and its last is "Calibration &
  direction", so the framing, the candidate's questions and the next-steps statement have
  no minutes. It also has no named slack absorber, leaving the 20-to-22 residue
  unassigned. The generated plan gets both right; the hand-written script does not, and
  the standard stays.
- `MAX_QUESTIONS = 6` drops surplus questions from the CV-derived set (`:100`,
  `.slice(0, MAX_QUESTIONS)`) without recording that anything was dropped. The brief
  path does this better — see the prose cap in `interview-run.ts:109-112` — and the plan
  path should adopt it.
