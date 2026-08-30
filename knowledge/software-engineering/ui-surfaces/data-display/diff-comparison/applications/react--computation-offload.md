---
layer: application
type: application
subject: diff-comparison
technique: computation-offload
stack: react
verified_on: 2026-08-30
verified_against: react@19
---

# Computation offload — the execution-comparison worker, and the seven surfaces that never got one

*Re-verified against the project tree at `a2ef6400e` on 2026-08-30: every
citation below still resolves at the stated line.*

The repo has **four hand-written diff kernels and zero diff libraries**
(measured 2026-08-17 in
`docs/concepts/golden-paths/version-diff-view.md` §0 — no `diff` /
`jsdiff` / `jsondiffpatch` in `package.json`, no `similar` in any
`Cargo.toml`). Exactly one of the eight client comparison surfaces runs
its kernel off the main thread. That one is the worked example; the other
seven are the transplant gap.

## The one that does it: `ComparisonDiff` → worker client → worker

`src/features/agents/sub_executions/components/list/ComparisonDiff.tsx`
never calls a diff function directly. It calls
`computeLineDiffOffThread` / `computeJsonDiffOffThread` from
`src/features/agents/sub_executions/libs/comparisonDiffWorkerClient.ts`,
which posts to `src/features/agents/sub_executions/workers/comparisonDiff.worker.ts`.
The client is a compact instance of most of the technique:

- **Request identity** — `nextRequestId++` per call
  (`comparisonDiffWorkerClient.ts:150,188`); responses route through
  `pendingLine` / `pendingJson` maps keyed by id, so a response for a
  request the surface abandoned finds no pending entry and is dropped
  (`:63-79`). `cancel()` is `pendingLine.delete(id)` — the surface's
  effect cleanup calls it (`ComparisonDiff.tsx:80,171`), which is the
  reaper the technique demands, wired to unmount / pair change.
- **Failure spelled as failure** — the worker wraps computation in
  `try/catch` and posts `{ kind: 'error' }` (`comparisonDiff.worker.ts:54-60`),
  a distinct message shape, not an empty result; the client also handles
  worker crash (`onerror`, `:93-109`) by rejecting every pending promise
  and terminating the worker so the next call re-spawns.
- **Fingerprinted cache** — cache keys are `${len}:${fnv1a}` of each
  side's content (`:35-47`), so an edited pair misses the cache. This is
  the "content fingerprint, not pair identity" clause.
- **Synchronous fallback** — when `Worker` is unavailable the client
  computes inline (`:139-148`, `:181-186`), which is the fast path in
  spirit though gated on capability rather than size.
- **Chunked streaming** — the worker posts `line-chunk` every 50 entries
  (`chunkSize: 50`, `:162`) so the first rows paint before the tail is
  computed.

## Where it departs from the technique — each measured

- **The caches never evict** (`lineCache` / `jsonCache`, `:27-28`). Two
  module-level `Map`s keyed by content hash, no size bound, no LRU —
  `creation-names-reaper` unanswered. Every distinct pair viewed in a
  session stays resident until reload.
- **The streaming append is quadratic.** `setDiff((prev) => [...prev,
  ...chunk])` (`ComparisonDiff.tsx:67`) copies the accumulated array once
  per chunk — O(n²/50). At the sizes that justify a worker this is the
  render-side cost the technique's "the render is inside the budget"
  section names.
- **The render is inline and unvirtualized.** The row-building `reduce`
  runs inside JSX on every render (`ComparisonDiff.tsx:109-139`), one
  three-column grid `div` per line, in a `max-h-64` scroller.
- **No budget on the kernel** — the worker will process any input; the
  degradation ladder is absent. In fairness, the line kernel is
  set-membership (linear), so the missing budget bites the render, not the
  algorithm.

## The fallback is a second kernel, not a second call site

The sibling semantic-level application records that this client's
*normalization* is duplicated between the worker and its synchronous
fallback. The 2026-08-30 re-verification found the duplication goes one
level deeper, and that depth is an offload concern rather than a level
one: the **algorithm** is written twice too. `comparisonHelpers.ts:53-71`
(`diffLines`, what the fallback calls when `Worker` is unavailable,
`:141-144`) and `comparisonDiff.worker.ts:12-42` (`computeLineDiff`) are
the same two-loop walk, independently typed, with chunk emission spliced
into one of them.

The two copies also put the normalization seam in different places — the
worker splits and filters inside itself (`:13-14`), the fallback splits
and filters at the call site before handing pre-split arrays to a kernel
that does not normalize at all. So "extract one shared function" is not
available as a deletion; whichever side is kept, the other's boundary has
to move. That is the ordinary cost of a fallback written as a
reimplementation instead of as the same kernel invoked on a different
thread, and it is the shape to avoid when transplanting: the fallback
should be *the same function called synchronously*, with the offload
wrapper owning only scheduling, identity, and chunking.

Nothing asserts the two agree. They currently do, which is why this is
recorded as a seam and not a defect — the divergence arrives with the
first edit to either, and it will present as "the diff is different on
this machine", because which copy runs depends on whether the browser
handed the surface a worker.

## The guarded kernel that never went off-thread

`src/features/agents/sub_lab/shared/labPrimitives.ts` is the *other* half
of the technique's mechanics — the budget half — done right, on the main
thread: `MAX_DP_CELLS = 250_000` (`:25`), `diffWithStrip` (`:68`) strips
the shared prefix and suffix before the DP, and `diffStrings` (`:113`)
degrades token-LCS → line-LCS → all-removed-plus-all-added. Replayed on a
one-word edit in a 1,000-word prompt: 1.1 ms, two non-`same` entries — the
strip absorbs the whole cost and the guard never fires
(`version-diff-view.md` §7 D3). The lesson recorded there is the one that
matters for the technique: the degradation's precondition is a *rewrite*,
not an edit.

The two disciplines — this file's budget, the worker client's offload —
live in different feature folders and were never composed. The three
remaining kernels (`PromptDiffModal.tsx:34`, unbounded `(m+1)×(n+1)` under
a comment saying "typically <100 lines"; `conflictDiff.ts:19`, no ceiling,
decision pushed to callers; `DiffViewer.tsx:30`, `diffStrings` called
inside a JSX map body, unmemoized) have neither. Replayed at 4,000 lines a
side, the unguarded modal takes 610 ms on the render thread and emits
8,000 `<pre>` elements (`version-diff-view.md` §7 D4).

## Transplant note

The pieces of a complete offload exist in this repo — request identity
and failure shape in the worker client, budgets and strip in the lab
primitives, streaming in the worker — but no single surface has all of
them, and the shared primitive that would carry them (a `DiffPane` that
owns kernel selection, offload, budget, memo, and virtualization) does not
exist. That primitive is the fix the legacy census declined to gate on
(§9, "no shared primitive exists to route to").
