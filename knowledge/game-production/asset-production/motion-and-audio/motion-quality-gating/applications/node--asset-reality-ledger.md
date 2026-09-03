---
layer: application
type: application
subject: motion-quality-gating
technique: asset-reality-ledger
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# The animation reality ledger in PoF

`src/lib/animation/reality-ledger.mjs` reconciles four views of a generated UE5
project's animation system "so the 'out of reality' gap is observable" (module
docstring, lines 1-27):

1. **REFERENCED** — `/Game/...` asset paths the generated C++ loads.
2. **EXISTING** — `.uasset` files actually on disk under the project's `Content/`.
3. **VALID** — referenced+existing assets that are usable: "montages that aren't empty
   shells; via `AssetManifest`, that have sections/notifies".
4. **RUNTIME** — fallback signals scraped from a session: `"No playable montage"`,
   `"PlayMontage failed"`.

The findings are the gaps between views, and each is a distinct row type in the
`Ledger` typedef: `MissingRow` (referenced, absent), `EmptyShellRow` (present, hollow),
`OrphanRow` (present, referenced by nobody), and `runtimeFallbacks`. `ReferencedRow`
carries `referencedBy: string[]`, so every defect names who asked for it.

## The hollow-asset heuristic (`reality-ledger.mjs:32` and `:69-71`)

```
export const EMPTY_SHELL_BYTES = 6000;
export function isLikelyEmptyShell(kind, sizeBytes, threshold = EMPTY_SHELL_BYTES) {
  return kind === 'montage' && sizeBytes > 0 && sizeBytes < threshold;
}
```

Two disciplines are visible in that one predicate. It is **per kind** — the comment on
line 62 says only montages are judged, because "sequences are large, skeletons vary" —
and it is **labelled a heuristic** that yields to real content inspection: "used only
when no `AssetManifest` validity info is available". `classifyKind` (line 42) resolves
the kind with path-segment signals *before* name-prefix signals ("a montage under
`/Maps/` is still a map ref"), first match wins. `ANIMATION_KINDS` (line 35) declares
which kinds' absence means the animation system is broken, which is what drives the
`green | red` summary status rather than a percentage.

The pure core `reconcile` "takes plain arrays so it is unit-testable without a
filesystem; thin fs adapters feed it from a real project" — collectors hold no judgment.

## The structural lint alongside it

`src/lib/animation/montage-analysis.ts` supplies the per-asset checks the ledger does
not cover. `HIGH_MEM_FACTOR = 1.8` against the same-category median, gated by
`MIN_PEERS = 2` so a median over a single peer cannot fire (lines 32-34, 67-78); the
finding message carries the value, the factor, the category and the median, not just a
verdict. `ROOT_MOTION_CATEGORIES = ['attack','locomotion','movement','traversal','dodge']`
(line 36) drives the `no-root-motion` warning whose message names the consequence:
"movement may rely on code, causing desync". `LONG_BLEND_SEC = 0.5` flags a blend-in
that reads as unresponsive. `asMontage` (line 48) returns `null` when the required
numeric fields are absent rather than coercing them to zero, and `montageMetrics`
guards `fps > 0` before dividing.

## The removed fabrications

`src/components/modules/core-engine/sub_animation/_shared/data.ts:738-753` is the
matching lesson on the timing side. `computeResponsiveness` "used to be a module-load
constant (`RESPONSIVENESS_RESULTS`) folded over fixture arrays, and printed
'Attacking: 383ms — Sluggish' against a project it had never read". Three fabrications
were deleted with it: a synthetic "from idle" row built from a literal `0.05s` blend
plus a literal `1/60s` input lag, and a fallback that invented `0.3s` for a state with
no montage. "Both manufactured numbers, so both are gone — with no timings this returns
nothing."

The surviving numbers state their provenance. `ResponsivenessResult` carries
`derivedFrom` ("plain statement of which read values produced these seconds") and
`sourcePath`. `GENRE_NORMS` (line 617) is declared "a RUBRIC, not a measurement" that
"describe[s] the genre, never this project": locomotion `0.05`, attacking `0.20`,
dodging `0.15`, hit-reaction `0.10` seconds. `timingsFromManifest` (line 686) returns
`withoutDuration` and `unclassified` lists so the panel "can say what it could not read
instead of quietly dropping it", and `stateFromMontageName` returns `null` on no match
"because a wrong state would put a real duration on a wrong transition".

One deviation the standard does not bend for: `DEFAULT_GENRE_NORM = 0.2` (line 625) is
applied to any state with no entry in `GENRE_NORMS`. A silent fallback budget is the
defaulting failure in another costume; it should be reported as ungauged, or at minimum
labelled as a fallback wherever the resulting grade appears.
