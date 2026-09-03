---
layer: application
type: application
subject: adaptive-music-authoring
technique: music-acceptance-beyond-decode-checks
stack: node
status: forged
verified_on: 2026-09-02
---

# The music acceptance ladder in a catalog pipeline

A game-production web application (Next.js + better-sqlite3, driving an Unreal Engine 5.8
project) carries a ten-step music pipeline in `src/lib/catalog/pipelines/music.ts`,
registered at line 32 as `catalogId: 'music'`. Citations are resolved against commit
`9aa31407`; `package.json` declares no `engines` field, so no runtime version is claimed
here. The pipeline is the most complete instance of the ladder in the tree, and it is
useful precisely because it is honest about the rungs it does not have.

## What the pipeline declares

The ten steps are Concept Brief, Stems & Layers, Transitions, Loop & Markers, Mix &
Loudness, Trigger Binding, Streaming Budget, Icon 2D Art, Test Gate, UE Packaging. Four of
them carry material this subject cares about.

**Loop & Markers** (label at line 306) produces a `gridSpec` of 96 BPM, 4/4,
`barDurationMs: 2500`, `stemLoopBars: 8`, `stemLoopMs: 20000`, plus a `loopPoints` row per
stem with `loopStartMs: 0`, `loopEndMs: 20000` and a per-stem `loopCrossfadeMs`. Its
`loopAuthoring` notes (lines 399-403) state the two rules this subject insists on: *"All
stems delivered at exactly 20 000 ms"* and *"Stems authored in the same project session
(same tempo map, same sample clock) to guarantee grid alignment."* That is rung 1 —
identical sample counts and one tempo map — written into the artifact rather than assumed.

**Mix & Loudness** (line 417) targets `integratedLUFS: -16.0` inside a declared band of
-14 to -18, with `truePeakMax: '−1.0 dBTP (all stems individually and combined)'`. Its
acceptance is the sharpest checker in the pipeline: `withinAbsolute('integratedLUFS', …,
-16.0, 2.0)` gates the signed value, and `valueWithinDeclaredBand('loudness',
'displayMagnitude', 'lufsBandFloor', 'lufsBandCeil', …)` asserts that the number the chart
*draws* sits inside the band the artifact itself declares — so the bars and the verdict
cannot disagree. That second checker is a content-invariant, and it is the pattern worth
transplanting: it catches the case where a display value and a graded value drift apart.

**Streaming Budget** (line 572) derives the whole budget from one number. The comment above
it records why: *"Judge-fleet fix 2026-07-07: the old figures (0.58 MB @ a claimed 128
kbps) implied ~232 kbps — bitrate, size and peak now derive from ONE number (192 kbps)."*
Raw size, compressed size, resident total and streaming peak are all computed from that
single declared bitrate, and the peak is stated with its basis: *"4 stems simultaneously
active (combat-high) × 192 kbps = 768 kbps."*

**Test Gate** (line 640) is the pipeline's rung 3, 5 and 6 combined, and its checklist is
correct in substance — *"all 6 stem loop points are click-free over 100 loop iterations in
PIE audio profiler"*, *"integrated LUFS measured at −16 ±2 LUFS in the MetaSound profiler
(50 consecutive loops)"*, *"combat-exit crossfade completes over 4 bars (≈10 s) with no
audible click"*. Loop-under-repetition is measured over a hundred cycles, not one, which is
the rule.

## What the ladder actually reaches today

The Test Gate's acceptance is `entityRuntimeDeferred('VSMusicTransitionTest', 'Combat
transition crossfades on cue in PIE')`. In `src/lib/catalog/acceptance/deferred.ts:7-9`
that resolves to `{ tier: 'L3', status: 'deferred', detail: 'runtime pending' }` with a
machine-parseable reason naming the functional test that would settle it. Nothing above
rung 1 has run.

This is the right failure. The line reports *deferred with a stated reason*, not passed —
the pipeline does not manufacture green out of an absent runtime. The per-entity form of
that helper exists because of a real incident recorded at
`src/lib/catalog/acceptance/deferred.ts:14-15`: a pipeline-level hardcoded test name let
one entity's gate be proven by another entity's test (*"Force Push passed on the Fireball
test; Knockback on the Burning test — 2026-07-22"*), which is the verdict-binding rule
learned the expensive way.

The gap that remains is rung 2. Every number in the pipeline is author-typed — the
`Mix & Loudness` step says so in its own metadata, `engine: 'Hand-authored'` at line 418
with the comment *"produce() returns author-typed constants; every checker re-reads them"* —
and `Loop & Markers` accepts on `fieldsPopulated(…)` (line 404), which confirms the loop
declaration exists and says nothing about the audio. No step recovers a tempo, an onset
grid or a loudness figure *from* a rendered stem and compares it to what was declared. Until
one does, the loudness checker is comparing an asserted value with an asserted band, and the
whole upper ladder rests on a producer's own claim.

## Three deviations worth naming

**Loop boundaries are declared in milliseconds.** `loopStartMs`, `loopEndMs`,
`barDurationMs`, `stemLoopMs` — the sample domain appears only once, in an authoring note
(*"960 samples of silence padding at 48 kHz if needed"*). At 48 kHz and 20 000 ms the
conversion is exact, so the pipeline gets away with it; a tempo or a rate that did not
divide evenly would round, and the rounding is the click. The standard stays: samples, at
the file's own rate, alongside that rate.

**Long crossfades stand in for tail folding.** The per-stem `loopCrossfadeMs` scales with
the length of each stem's tail — 10 ms for brass stabs, 30 ms for percussion, 80 ms for the
high-string cluster, 200 ms for the slow pad, annotated *"needs a generous crossfade to
maintain harmonic continuity at the loop point."* That is the concealment fix, and it dips
level at the seam once per cycle. Nothing in the pipeline renders past the loop end and
folds the decay back over the head, and nothing declares a pre-roll region. The standard
stays.

**A block-based compressed format is packaged, and the boundary is never re-measured.**
Streaming Budget specifies Vorbis quality 6 for the packaged game with PCM in the editor,
while Loop & Markers embeds loop points in the uncompressed delivery's cue chunk. No step
decodes the packaged asset and re-measures the boundary against it. The pipeline's own
Test Gate is where that would be caught, and it is deferred.

## The generation edge, which the tree gets right

The adjacent generation layer refuses to produce music at all, and the refusal is the model
to copy. `src/lib/audio-gen/providers/elevenlabs.ts:36` declares `capabilities: ['sfx',
'ambient']`, and lines 42-44 give the reason verbatim: *"PoF only calls
/v1/sound-generation, which synthesises sound effects. ElevenLabs music is a separate
product and endpoint that PoF does not integrate, so a music request here would return an
SFX clip filed as music."* `src/lib/audio-gen/capabilities.ts:5-12` records that this
contract used to be decoration the route never consulted, so mislabelled clips were billed
and cached under the requested kind.

Two shapes in that layer are still the naive reading of this subject, and both are in
`src/lib/audio-gen/types.ts`. `loop?: boolean` at lines 18-19 is documented as *"Metadata
only — applied at UE import (USoundWave.looping). Not sent to providers"* — a file is
marked loopable by a request flag rather than by anything measured at its boundary. And
`durationMs` at lines 26-28 is *"Approximate ms — set from durationSeconds if known,
otherwise 0"* — a duration asserted from the request rather than read from the returned
bytes. Both are rung-0 facts wearing rung-1 clothes, and both are exactly what rung 2
exists to catch.
