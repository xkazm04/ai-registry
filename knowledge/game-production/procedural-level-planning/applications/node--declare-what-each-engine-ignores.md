---
layer: application
type: application
subject: procedural-level-planning
technique: declare-what-each-engine-ignores
stack: node
status: forged
---

# Declaring the discarded inputs in a shared procgen spec

The Path of Fire tooling repo (`C:\Users\kazda\kiro\pof`) realizes this technique in two
cooperating modules: `src/lib/level-design/algo-params.ts` (the per-algorithm parameter
table) and `src/lib/level-design/procgen-spec.ts` (the one spec/result model every procgen
surface answers to).

## The incident that produced the rule

`algo-params.ts:1-18` states it as a post-mortem: three of the four preview algorithms
ignored the parameters the wizard offered — `cellularGrid` and `perlinGrid` discarded
`AlgoParams` outright, `wfcGrid` never dereferenced it, and `roomCountMin` was read by
**nothing**. Dragging "Min Rooms", "Max Rooms" and "Corridor Width" visibly did nothing for
three algorithms, "with no hint that it wouldn't".

The rule adopted in response is the one this subject teaches, in the repo's own words: a
parameter either affects every algorithm it is shown for, or it is disabled for that
algorithm **with the reason on screen**.

## The table

`ALGO_PARAM_SUPPORT` (`algo-params.ts:26-35`) is `Record<algorithm, Record<paramKey, string
| null>>`. `null` means the generator reads it; a **string is the reason it is inert, and
it is the exact text the slider shows**. The reasons are written in the algorithm's own
terms, not as "not supported" — `CELLULAR_REASON` (`:21`) reads: *"Cellular automata carves
organic caves from a random fill — it has no room list and no corridors to size. Grid size
and seed shape the result."*

That the reason string is user-visible payload is what makes the table worth maintaining.
`paramDisabledReason()` (`:37`) is the single accessor both the wizard's sliders and the
generator dispatch call, so the greyed control and the ignored value cannot become two
opinions.

## The check that stops the table drifting

`src/__tests__/lib/level-design/procgen-params-honest.test.ts` walks `ALGO_PARAM_SUPPORT`
against the **real** generators: a claim of support must be backed by an actual change in
the seeded grid, and a claim that a parameter is inert must be backed by a **byte-identical**
grid. This is the differential test the technique calls for, in both directions — the table
cannot drift from the code either way. A second suite,
`procgen-wizard-honest-params.test.tsx`, asserts the same facts reach the authoring surface.

## The ignored set as data

`procgen-spec.ts:1-30` carries the doctrine as a header comment: *"A shared type is not a
shared layout."* Three engines are declared in `PROCGEN_ENGINES` (`:84-107`), each with a
`reads: readonly ProcgenSpecField[]` listing the spec fields its generator consults —
browser preview reads five of seven, the engine-side generator reads only `roomBand` and
`seed`, the codegen path reads all seven.

`specFieldsIgnoredBy(engine, spec)` (`:110`) inverts that set, and narrows further for the
preview by delegating to `ignoresRoomParams()` so the per-algorithm table stays the single
source. `describeIgnoredFields()` (`:137`) renders one line per dropped input **with its
current value** — "Corridor width (3)" — so a disclosure names what is being thrown away
rather than merely that something is.

`layoutAgreement(a, b)` (`:153`) answers the pairwise question, including a generator
against itself: same engine and `determinism: 'deterministic'` → agree, with the reason;
same engine and `determinism: 'unenforced'` (the path where the CLI authors the generator
freehand) → **disagree**, because two runs of one spec need not match. Every cross-engine
pair is `false` with a structural reason.

## The lossy projection is itemised

`ueDungeonParamsFromSpec()` (`:224-250`) projects the spec onto the two fields the engine
panel can hold, and pushes a `notes[]` entry for **each** lossy step: the band collapsed to
a single target ("Room band 8-15 collapsed to 12 — ARPGLevelGenerator takes one
TargetRoomCount, not a range"), the clamp to the panel's accepted range, and the int32 →
uint32 seed cast. The cast is documented as lossless (`| 0` on the engine side recovers the
identical int32) and is reported anyway. The comment names the goal: *"a handoff that
silently reshapes the request is the overclaim this model exists to stop."*

## Never reconstruct an unrecorded spec

`ProcgenResult` (`:249-260`) carries `spec: ProcgenSpec | null` alongside `specSource:
'declared' | 'unrecorded'`. `browserPreviewResult()` (`:262`) sets `declared` because the
tool holds the spec; `ueRunResult()` (`:281`) sets `unrecorded` and leaves `spec` null, with
the reason stated in the comment: the ledger row holds only a room count and a seed, so
inventing an algorithm or grid size "would fabricate the very inputs this model is meant to
make explicit."

## Where the repo falls short of the standard

`ProcgenSpec` (`:44-58`) carries algorithm, parameters and both seed forms — `seedLabel` as
typed and `seedValue` resolved once via `hashSeed()`, "ALWAYS present — never re-derived at
a call site" — but it carries **no generator version**. The four-term seed contract this
subject teaches therefore holds only for three terms here: an improvement to any of the four
preview algorithms silently changes what an old seed produces, and nothing in the stored
result would reveal it. The standard stands; the gap is real and worth closing with a version
field on the spec and a mismatch warning at regeneration time.
