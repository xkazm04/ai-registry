---
layer: application
type: application
subject: interview-run-of-show
technique: regenerate-without-destroying-human-notes
stack: node
status: forged
verified_on: 2026-09-29
---

# The inverted merge, and the allowlist bug it replaced

`app/_lib/interview-prep-run.ts` regenerates the prep pack for a pipeline entry; the merge
it applies now lives in `app/_lib/interview-prep.ts:188-195` (re-exported by the run
module, so accept and direct commit apply one rule). It is a few lines of code and a
paragraph of reasoning:

```ts
export function mergeRegeneratedPrep(
  prevPayload: Record<string, unknown> | null | undefined,
  generated: Record<string, unknown>
): Record<string, unknown> {
  const carried = { ...(prevPayload ?? {}) };
  delete carried.pendingPlan;                        // interview-prep.ts:188-195
  return { ...carried, ...generated };
}
```

The doc comment at `interview-prep.ts:184-187` states the inversion and names what it replaced: "preserve
EVERY previous key by default, overwrite ONLY the keys the generator produced
(`generated`). This is the integrity fix for the old hardcoded 3-key allowlist
(`humanScorecard`, `userProgress`, `interviewer`), which silently destroyed any
human-authored payload key not on the list — a future recruiter-notes field, a
re-scoring annotation, anything new. Now the default is preservation and the generator's
ownership is the explicit exception, so an unknown human key survives a Regenerate
**structurally**."

This is the upward lesson the technique took from the repo. The intuitive fix — enumerate
the human keys and protect them — is the bug, because the enumeration goes stale the day
someone adds a new place for a human to write, and it goes stale silently.

## The invariant is pinned by test, not by review

`interview-prep-run.test.ts:22` is the test that makes it structural:

> "mergeRegeneratedPrep: an UNKNOWN human key survives a regeneration (the allowlist
> bug)"

It seeds a payload with `humanScorecard`, `userProgress`, `interviewer` *and*
`recruiterNotes: "call the reference before the loop"` — "a future human-authored key
nobody wrote an allowlist entry for" (`:29`) — and asserts at `:40` that it survives.
The companion test at `:53-58` pins the other half: generator-owned keys such as
`focusAreas` are replaced wholesale, while the human key is still preserved. The merge
function is kept pure and dependency-free precisely so this can be asserted under
`node --test`.

The human-write path is single-sourced on the other side too:
`interview-prep.ts:125` notes "ONE write path for all human prep inputs", and the human
scorecard is stored under reserved payload keys (`humanScorecards`, a list filed per
author and stage, with `humanScorecard` as its headline mirror, `:151-171`) tagged
`source: "human"`, with `created_at` explicitly untouched (`:123-125`) so a human edit
does not move the "N minutes ago" stamp on the artifact.

## De-duplication against the whole plan

`importedQuestionsForBrief` (`interview-kit-booking.ts:100`, moved out of `interview-run.ts`) is the de-dupe. It trims, drops
blanks and non-strings, and — the part the technique generalises — takes an
`alreadyAsked` set seeded from the chronology blocks, so "a woven question never
double-renders" (`:95-99`). It accepts both the legacy plain-string entries and the
`{ question, blockRef? }` objects, with the comment at `:106-110` explaining why: skipping
the object form "would silently drop exactly the questions the recruiter planned most
deliberately."

## The cap is stated in prose when it binds

`MAX_BRIEF_IMPORTED_QUESTIONS = 8` (`interview-agenda.ts:121`), and
`composeImportedRunOfShowLine` (`interview-run.ts:99-108`) does not truncate silently:

```ts
const cap = imported.length > shown.length
  ? ` (the first ${shown.length} of ${imported.length} — ask the rest only if time allows)`
  : "";
```

The interviewer is told how many were held back and what to do about them. The
zero-additions case is byte-identical to a brief with no imports at all (`:97-98`, and
the test at `interview-run.test.ts:31-37` covering absent, empty and blanks-only) — the
"empty regeneration perturbs nothing" invariant, pinned.

## Deviations

- **The change report exists for one path, not all.** A prep-modal Regenerate on a pack
  that already has a committed plan is now *staged* (`commitGeneratedPrep`,
  `interview-prep-run.ts:84-103`): the generator's keys are parked under
  `payload.pendingPlan` (`stageInterviewPrepPlan`, `interview-prep.ts:205`), the plan and
  `created_at` do not move, and the modal renders `computePlanDiff`
  (`schedulePrepPlanDiff.ts:64`) - blocks added, removed, retimed, reworded, woven
  questions that would fall back to unassigned, ticks that would detach or move - above
  the still-usable plan. Replace or Keep is an idempotent PATCH (`resolvePendingPlan`,
  `interview-prep.ts:224`): with nothing pending it writes nothing, and a candidate
  without a committed plan is never swapped in. That is step six done *before* the write
  and as an offer, which the technique's decision rule asks for. The other two callers -
  the Decisions-queue accept and the voice first generation - pass no `stage` and go
  through `mergeRegeneratedPrep` directly, so a plan there is still replaced with no
  report. They are unstaged by design (the commit message says so), but the design
  reason is that nobody is looking at a modal, not that the interviewer's edits are
  safe: the tick map is keyed by index and detaches when the blocks move.
- **Deletion is not a state.** A question the interviewer removed from the pack is not
  recorded as removed, so a later regeneration is free to re-propose it as new. The
  de-dupe only guards against what is currently present.
- **The merge is shallow.** `{ ...prev, ...generated }` replaces a generator-owned object
  wholesale, so a human edit made *inside* a generator-owned structure — an annotation on
  a chronology block, say — is not protected. The key-level inversion is right; the
  field-level one inside those keys is not yet there.
