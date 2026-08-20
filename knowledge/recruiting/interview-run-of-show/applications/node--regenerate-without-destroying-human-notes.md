---
layer: application
type: application
subject: interview-run-of-show
technique: regenerate-without-destroying-human-notes
stack: node
status: forged
---

# The inverted merge, and the allowlist bug it replaced

`app/_lib/interview-prep-run.ts` regenerates the prep pack for a pipeline entry. Its
merge is three characters of code and a paragraph of reasoning:

```ts
export function mergeRegeneratedPrep(
  prevPayload: Record<string, unknown> | null | undefined,
  generated: Record<string, unknown>
): Record<string, unknown> {
  return { ...(prevPayload ?? {}), ...generated };   // interview-prep-run.ts:91-95
}
```

The doc comment at `:82-89` states the inversion and names what it replaced: "preserve
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
function is kept pure and dependency-free (`:89`) precisely so this can be asserted under
`node --test`.

The human-write path is single-sourced on the other side too:
`interview-prep.ts:96` notes "ONE write path for all human prep inputs", and the human
scorecard is stored under a reserved payload key tagged `source: "human"` (`:131`), with
`created_at` explicitly untouched (`:119-121`) so a human edit does not move the "N
minutes ago" stamp on the artifact.

## De-duplication against the whole plan

`importedQuestionsForBrief` (`interview-run.ts:76-99`) is the de-dupe. It trims, drops
blanks and non-strings, and — the part the technique generalises — takes an
`alreadyAsked` set seeded from the chronology blocks, so "a woven question never
double-renders" (`:72-75`). It accepts both the legacy plain-string entries and the
`{ question, blockRef? }` objects, with the comment at `:82-85` explaining why: skipping
the object form "would silently drop exactly the questions the recruiter planned most
deliberately."

## The cap is stated in prose when it binds

`MAX_BRIEF_IMPORTED_QUESTIONS = 8` (`interview-run.ts:69`), and
`composeImportedRunOfShowLine` (`:106-115`) does not truncate silently:

```ts
const cap = imported.length > shown.length
  ? ` (the first ${shown.length} of ${imported.length} — ask the rest only if time allows)`
  : "";
```

The interviewer is told how many were held back and what to do about them. The
zero-additions case is byte-identical to a brief with no imports at all (`:104-105`, and
the test at `interview-run.test.ts:30-36` covering absent, empty and blanks-only) — the
"empty regeneration perturbs nothing" invariant, pinned.

## Deviations

- **No change report.** The merge preserves human content but returns only the merged
  payload; nothing tells the interviewer what was added, replaced or held back on this
  regeneration. Step six of the procedure is unimplemented.
- **Deletion is not a state.** A question the interviewer removed from the pack is not
  recorded as removed, so a later regeneration is free to re-propose it as new. The
  de-dupe only guards against what is currently present.
- **The merge is shallow.** `{ ...prev, ...generated }` replaces a generator-owned object
  wholesale, so a human edit made *inside* a generator-owned structure — an annotation on
  a chronology block, say — is not protected. The key-level inversion is right; the
  field-level one inside those keys is not yet there.
