---
layer: application
type: application
subject: runtime-observation-evidence
technique: unverifiable-is-not-fail
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# The UE Visual Gate's four-way verdict

Realized in `src/lib/harness/ue-visual-gate.ts:1` in the PoF repo — the "game-runs"
ground-truth check that boots the built game headlessly, captures one rendered frame, and
judges it.

## Why the gate exists

The header states the gap it closes: "Every other UE gate proves the C++ COMPILES
(`ue-compile`) or that automation tests PASS (`ue-test`). None of them observes that the
built game actually BOOTS AND RENDERS." That is `structural-proof-is-never-sufficient` as an
engineering justification for a whole gate.

## The verdict table

`ue-visual-gate.ts:15-25` — reproduced because every clause carries weight:

- No UE env (`POF_UE_EDITOR_CMD` / `POF_UE_UPROJECT`) → `unverifiable` — "honest 'unknown',
  never a silent pass".
- Env present but no frame produced (headless boot failed / timed out) → `unverifiable` —
  "an environmental capture failure is not a code failure".
- Frame produced but BLACK / near-empty → `fail` — "the game booted but rendered nothing — a
  real observed failure".
- Frame produced and non-empty → `pass` (floor). A VLM `fail` overrides the floor, but
  **"a judge OUTAGE never downgrades a captured frame (the frame is kept for eyeball
  review)"**.

The mechanical condemnation needs no judge at all: `inspectFrame`
(`ue-visual-gate.ts:84-131`) applies a byte floor (default 12 KB — "a solid-black 1280×720
PNG compresses to a few KB, while a real rendered frame is hundreds of KB (proven capture:
439 KB)") AND, when `pngjs` is present, a non-black pixel fraction (default 1% of sampled
pixels above luminance 8). Both must hold — "a large-but-black frame is still caught by the
pixel pass, a small real frame is caught by the byte pass" — and the gate degrades to the
byte heuristic alone when the pixel library is absent rather than becoming unverifiable.

## Advisory and de-duped

The gate is opt-in (`ueVisual`) and `required:false` — "never blocks the loop" — and is
de-duped per `(statePath, iteration)` so the streaming pool boots the game once per
iteration and every concurrent area shares that frame. Both are the technique's cost rules:
an expensive, environmentally-fragile observer reports rather than gates, and a heavy run is
shared by cycle identity.

## Deferred and skipped are different words

`docs/catalog/L3-L4-RUNNER.md` (drain-report section) records the correction directly:
`deferred` + `deferrals[]` are "gates that RAN and could not decide (judge outage, or a test
planned but not registered), each with the runner's own reason", rendered beside the fail
list — and "`deferred` and `skipped` are labelled as the different things they are ('N
deferred' / 'N skipped'); the old copy called SKIPPED gates 'still deferred', which was
wrong twice." This four-value vocabulary was an upward lesson; the expert draft had three.

## Refusing the substituted subject

The same doc (`L3-L4-RUNNER.md:64-68`) records the resolver bug and its fix. The autonomous
L4 resolver "used to force EVERY frame onto `/Game/Maps/VerticalSlice`, so the VLM judged a
generic lit slice regardless of the entity being verified." The fix is precedence — explicit
operator map → the scenario's declared map → the lit fallback — plus honest deferral: "a
**declared** map that produces no frame (missing / unlit) → the gate stays `deferred` with a
reason naming the map — it is **not** silently re-rendered on VerticalSlice (which would
judge the wrong scene)." A fallback target is legal only when nothing specific was requested.
Upward lesson, and the source of the golden path's "substituted subject" failure mode.

Two repo laws stated at the same site belong to the run discipline rather than the verdict
one: **"capture needs a LIT map"** (`L3-L4-RUNNER.md:67` — a dark map renders a black frame
the judge cannot judge), and **"never kill by image name; kill only what you spawned, by
PID"** (`L3-L4-RUNNER.md:69` — the capture runner previously followed its PID-scoped
`taskkill /PID <pid> /T /F` with a machine-wide `/IM UnrealEditor.exe` sweep "that killed the
operator's live editor and any concurrent session's editor on the shared UE tree").

## Where the exit code is not the verdict

`L3-L4-RUNNER.md` ("Why judged by markers, not exit code"): headless `UnrealEditor-Cmd`
"exits non-zero on a benign shutdown null-deref (`PillarsOfFortuneBridge` teardown)", so
`parseAbslogVerdict` matches emitted markers (`Result={Success}` / `Result={Failure}`,
plus `[gate] RESULT=PASS/FAIL` from project Python gates) instead. The mirror decision is in
`src/lib/harness/ue-gates.ts:1`, which explains preferring UnrealBuildTool over the editor's
in-editor `CompileAllBlueprints`: UBT is "a deterministic, headless, from-source compile
whose EXIT CODE is a reliable pass/fail signal — unlike the editor (`-run=...`), which can
crash on headless shutdown even after a clean run"; and so "the compile gate is UBT
(exit-code judged); the automation-test gate runs the editor and is judged by ABSLOG
CONTENT, never exit code."
