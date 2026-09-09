---
layer: application
type: application
subject: goal-pacing-and-forecast
technique: goal-in-force-per-month
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Goal in force per month - a pure goal timeline and a complete-months-only track record

Verified against `C:\Users\kazda\kiro\systedo-case` at commit
`2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08), `package.json` engines
`node: 24.x`. The timeline lives in `src/lib/metrics/goal-history.ts` (76 lines,
framework-free) and the scorer that reads it in `monthlyAttainmentHistory()` at
`src/lib/metrics/pacing.ts:255-288`; both run under `node --test` via
`test-unit/metrics-goal-history.test.mjs` and `test-unit/metrics-attainment-history.test.mjs`.

## The incident is the module's first paragraph

`goal-history.ts:1-7` opens with the failure the technique exists to prevent, in the
tree's own words: "The monthly revenue goal was a single constant measured against
EVERY month ... so a goal that was raised in June retroactively re-judged January as a
miss." The fix is described in the same breath - "an append-only list of dated changes,
each `{ effectiveMonth, goal }`, so every month is scored against the goal that was
actually in force THAT month" - and the module is deliberately shaped so the store
persists the list and the scorer resolves it through one canonical shape
(`GoalChange`, `goal-history.ts:12-17`).

## Each procedure step is one function

- **Sanitise before use.** `sanitizeGoalHistory()` (`goal-history.ts:24-38`) drops
  non-objects, malformed months (regex `^\d{4}-(0[1-9]|1[0-2])$`, `:19`) and
  non-finite or non-positive goals, collapses duplicates to the last entry per month
  via a `Map` overwrite (`:33`, "later duplicate overwrites -> last-per-month wins"),
  and sorts ascending. `metrics-goal-history.test.mjs:64-73` feeds it an invalid
  month, a negative goal, a duplicate month and a shapeless object and expects exactly
  one clean entry back.
- **Resolve per month, fall back before the first change.** `goalForMonth()`
  (`goal-history.ts:46-53`) walks the sorted list and keeps the last entry whose
  `effectiveMonth <= month`, starting from `fallback`. The test at `:28-38` pins the
  four cases the technique names: before the first change (fallback), at the change,
  between changes, after the last change, and an empty history.
- **Record idempotently by value.** `recordGoalChange()` (`goal-history.ts:63-76`)
  sanitises, rejects malformed input by returning the clean list unchanged, and returns
  the list unchanged when `goalForMonth(clean, effectiveMonth, NaN) === goal` - the
  same value already in force is a no-op, so repeated saves never grow the log
  (`test:49-55`). A genuine change filters out that month's entry and pushes the new
  one, so a within-month correction replaces rather than appends (`test:57-62`), and
  out-of-order recording sorts in (`test:40-47`).

## The scorer reads the timeline and refuses partial months

`monthlyAttainmentHistory()` (`pacing.ts:255-288`) groups daily points by month, keeps
only months whose point count reaches the calendar day count
(`pacing.ts:270-273`), takes the last `n` (default 6), and scores each against
`goalForMonth(history, key, goal)` (`pacing.ts:279`). The doc comment at `pacing.ts:243-254`
carries both rules with their reasons: a partial leading or in-progress month "would
otherwise read as a fake miss", and months before the first recorded change fall back
to the constant "so the pre-memory behaviour ... is reproduced exactly".

`metrics-goal-history.test.mjs:77-90` is the technique's proof case: March, April and
May with a goal raised to 40 000 effective May against a standing 35 000 yields goals
`[35 000, 35 000, 40 000]` and hits `[false, true, false]` - April stays a hit against
the goal that existed in April. `:92-102` shows that omitting `history` or passing `[]`
produces identical results to the pre-timeline scorer, and `:104-117` walks three
changes across three months. `metrics-attainment-history.test.mjs:40-51` proves the
complete-months rule: a partial March, a complete April and an in-progress May yield a
one-month record.

## The goal travels to the reader

Each `MonthAttainment` carries its own `goal` and `attainment` (`pacing.ts:229-241`),
and the card renders it per bar: `src/components/dashboard/GoalPacing.tsx:265-295` puts
the month, the attainment percentage and hit/miss in the hover title and in a
screen-reader-only span, so the strip remembers the goal it scored against.

## What the tree does not do

The timeline has no author or timestamp - it is a list of effective values, exactly as
the technique scopes it - and there is no per-scope timeline: only the blended revenue
goal has a memory, while the paid-portfolio efficiency target is a constant in
`src/lib/targets.ts:11` with no history at all. A raised paid target would therefore
re-judge earlier campaign-console periods the same way the revenue goal once did; the
standard in the technique (each scope has its own timeline) stands as the gap. The
back-dated-change rule - tell the owner which months moved - has no surface either; a
back-dated entry silently re-scores, which the technique names as the one legitimate
cause of the failure and asks to be announced.
