---
layer: application
type: application
subject: generative-artifact-gating
technique: grade-the-selected-candidate
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Node — grading the selected candidate in a catalog acceptance layer

The reference realization lives in `pof`, a Next.js catalog/lab app whose ~344 authored
steps each declare a `produce()` and an acceptance checker. The generative steps are the
`gallery` archetype: each writes a candidate batch and records which candidate is selected.

## The bug this replaced

`src/lib/catalog/acceptance/dataCheckers.ts` exposes `selected(field)`. Its entire body was
`typeof v === 'number' && v >= 0` — an existence check over an integer. A gallery step went
green the instant `produce()` wrote `{ selected: 0 }`, whether or not a generator had ever
run. The file header of `src/lib/catalog/acceptance/galleryArtifact.ts:19-26` records the
measurement that exposed it:

> 44 of the 47 registered gallery steps were provably insensitive to any change in their own
> content (numeric-scaling and string-replacement mutation over the live registry both left
> the verdict untouched).

That is the mutation probe run over the whole registry rather than a sample, and the number
is the fraction of the fleet's green that meant nothing.

## The two halves, single-sourced

`galleryArtifact.ts` deliberately holds both faces of the contract in one file:

- `gallerySeed(field, candidates, selectIndex = 0)` — what a step's `produce()` stub writes.
- `gradeGallerySelection(data, field, label)` — what its acceptance reads.

The header states the reason exactly: *"They live together because the second is only
honest if it can rely on the shape of the first."* `gradeGallerySelection` is pure over
`data`, so the lab path, the server re-grade and the headless produce→accept loop all
return the same verdict.

## The verdict ladder, as implemented

`gradeGallerySelection` (`galleryArtifact.ts:121-203`) walks the five states in order:

| Condition | Result | Tier |
| --- | --- | --- |
| `data[field]` is not a non-negative number | `pending`, "none selected" | L1 |
| `readHistory(data).batches.length === 0` | `deferred` — "the index alone proves nothing" | L4 |
| `selectedCandidate(history)` is null | `fail` — "the graded selection points at nothing" | L1 |
| candidate's `payload[field]` ≠ `idx` | `fail` — "the graded value is not the selected candidate's" | L1 |
| `candidateAsset(cand)` returns a reference | `pass`, naming the asset | L1 |
| otherwise (swatch only) | `deferred` — placeholder preview, run the generator | L4 |

The tier choice is argued in the header: the swatch and no-history deferrals report at
**L4 (visual)** because what is missing is a visual asset — a generator run, not a config
edit. That keeps the project's Rule 5 intact (a cleanly-produced step is `pass` or
`deferred`, never `fail`/`pending`), so a `fail` in this checker always means a genuinely
broken artifact.

## Origin decided structurally, not heuristically

`candidateAsset()` (`galleryArtifact.ts:96-111`) is where placeholder and asset are told
apart. It accepts `imageUrl`, `payload.glbUrl`, `payload.imageUrl`, `payload.assetUrl`,
`payload.assetPath`, and a `swatch` of the form `url(…)`. The disjointness is by
construction, and the comment says so: a placeholder swatch is *always* a computed
`linear-gradient(…)`, never a `url(…)`, "so the two can never be confused". Nothing is
inferred from a filename or a size.

## The stub that refuses to manufacture a pass

`gallerySeed` seeds exactly the batch the lab's own first Produce click would create
(`genericGalleryCandidates`) and auto-selects a candidate, so the stub artifact has the
same shape the lab persists — and it *invents no asset*: every seeded candidate is a
swatch, so a seeded artifact grades `deferred` with a reason rather than a manufactured
pass. Two details carry the technique:

- `GALLERY_STUB_DIRECTION = '(produce stub — no generator has run for this step)'` — the
  stand-in is self-describing in the raw data, not only in the UI.
- `GALLERY_STUB_AT = '2026-01-01T00:00:00.000Z'`, fixed rather than `Date.now()`, because
  the stub must be pure: the same entity always yields the same artifact, "which is what
  the spec linter and the content-hash both rely on".

## Provenance in the same store

`src/components/layout-lab/steps/shared/genHistory.ts:82-90` defines
`SelectionSource = 'none' | 'auto' | 'human' | 'unrecorded'` and classifies from a tri-state
`autoSelected?: boolean` — `undefined` means *unrecorded*, "never a fabricated human".
`appendBatch` sets `autoSelected: true` when it auto-picks the new batch's first candidate
(`:199-208`); `selectCandidate` clears it (`:216-222`), and clicking the machine's own pick
still counts, since it is an explicit confirmation. The comment is explicit that recording
provenance deliberately does not change acceptance — requiring a click would break the e2e
walker — it only stops the step claiming a human chose. `MAX_KEPT_BATCHES` caps the history
at 12, with the batch owning the selected candidate exempt from `pruneHistory`, so the cap
can never evict the selection out from under the grader.
