---
layer: application
type: application
subject: music-video-production
technique: track-map-before-treatment
stack: next
status: forged
verified_on: 2026-10-05
verified_against: next@16.3.3
---

# A baked envelope on the visualizer rung: two of the map's four layers

`gravitone` (`gravitone-gcloud`, branch `main`, commit `1ee97c8f`, read
2026-10-05) is a content-creation studio built on Next.js
(`package.json:36` "16.3.3"). Its music-video discipline takes one uploaded
track, bakes an analysis of it once, and renders a poster with audio-reactive
effects frame by frame. It sits on the **visualizer rung** of
form-follows-what-the-track-gives, and it is the only tree in the fleet with a
music-video discipline. This binds as `next` rather than `node` because the
analysis module depends on the browser's Web Audio offline renderer and runs only
in a browser or a headless browser page:

- `lib/audioEnvelope.ts:32-33` "compositor and a headless Playwright page both already carry a Web Audio"

The finding in one line: the tree carries the **energy** layer of the track map in
full and a **tempo** with its octave siblings, which is everything its rung needs;
it carries no section boundaries, no bar grid and no vocal activity map, which is
what any rung above it would need first.

## Confirmed: analysed once, on the master's own samples

The technique's premise — analyse the locked track once, into a record every later
stage reads — is the module's opening line, and its reason is the seek-stable
property the visualizer rung inherits. The duration comes from the decoder, not a
header:

- `lib/audioEnvelope.ts:1` "THE BAKED AUDIO ENVELOPE — one deterministic pass over an uploaded track"
- `lib/audioEnvelope.ts:7` "effects are baked against `envelope[frameIndex]`"
- `lib/audioEnvelope.ts:16` "REAL DURATION, NEVER ESTIMATED."
- `lib/audioEnvelope.ts:365` "const durationS = buffer.length / buffer.sampleRate;"

The record is persisted beside the track and read by later phases, so the map is
one record and not a recomputation per consumer; a track that does not decode
stops the step rather than producing an empty map:

- `app/_phases/research/useMusicVideoSource.ts:123` "await write({ sourceAssetId: pair.asset.id, envelope: env });"
- `app/_phases/_shared/stepStore.ts:240` "envelope?: import("
- `lib/audioEnvelope.ts:77` "an HONEST failure, never swallowed into a flat/empty envelope."

## Confirmed: the energy layer, per frame

Three bands and spectral flux, normalized per track, on one index axis. The
compositor reads them by frame index and nothing else — the bloom from the
flash-limited low band, the dust from the high band. For a visualizer this is the
whole map: the motion is a function of energy at the frame's time.

- `lib/audioEnvelope.ts:60` "bands: { low: number[]; mid: number[]; high: number[] };"
- `lib/audioEnvelope.ts:64` "flux: number[];"
- `app/_phases/frames/music-video/compositor.ts:394` "const low = boundedLow[frameIndex] ?? 0;"
- `app/_phases/frames/music-video/compositor.ts:410` "const shimmer = 0.4 + 0.6 * (highBand[frameIndex] ?? 0);"

## Confirmed: tempo as candidates with octave siblings

The technique's rule is stated in the module header with its reason, kept in the
type, and honoured on the research surface, which shows all three candidates and
states a zero-onset track rather than printing a default:

- `lib/audioEnvelope.ts:21` "TEMPO IS CANDIDATES, NOT A NUMBER."
- `lib/audioEnvelope.ts:22` "found octave errors — a tempo read at"
- `lib/audioEnvelope.ts:23` "half or double the true value — are endemic to onset-interval tempo"
- `lib/audioEnvelope.ts:73` "tempo: { baseBpm: number; halfBpm: number; doubleBpm: number; confidence: number };"
- `app/_phases/research/MusicVideoResearch.tsx:67-69` "mv.envelope.tempo.halfBpm"
- `app/_phases/research/MusicVideoResearch.tsx:72` "no onsets found — confidence 0"

What the tree does not do is the technique's second half: **record which level the
production uses**. The three candidates are displayed and nothing selects one.
Nothing downstream needs to yet — no consumer outside the module and that display
reads the tempo or the onsets (a `git grep` for the onset and tempo fields across
`app`, `lib` and `pipeline` returned only the display) — so this is the correct
amount of map for its rung, and the first thing to add on the next one.

## Deviation: the tempo cannot serve as a grid

Onsets are stored as frame indices, and the tempo is a histogram of single
consecutive-onset intervals measured in those frames, at a default of thirty
frames per second:

- `lib/audioEnvelope.ts:68` "onsetFrames: number[];"
- `lib/audioEnvelope.ts:320` "const ioiS = (onsetFrames[i] - onsetFrames[i - 1]) / fps;"
- `lib/audioEnvelope.ts:322` "let bpm = Math.round(60 / ioiS);"
- `lib/audioEnvelope.ts:361` "const fps = opts?.fps ?? 30;"

Arithmetic from those lines, not a run: at 30 frames per second a single interval
of n frames can only vote for round(1800 / n) BPM, so between 113 and 129 BPM the
only representable value is 120. A track at 124 BPM splits its votes between 120
and 129, and whichever wins is 3 to 4 percent off. A bar grid computed from that
number would be about two seconds adrift after 128 beats. This is exactly why the
technique says the grid is a list of detected beat times kept at audio resolution
and the tempo is derived from it, never the reverse. For the visualizer it costs
nothing, because nothing is placed on a grid; for any rung that cuts on bars it is
disqualifying. The frame-quantization half of this was an upward lesson: the draft
said "list of beats"; it now also says "at audio resolution".

## Deviation: no sections, no voices

The envelope's whole surface is one interface, and nothing in it carries a section
boundary, a downbeat or per-voice activity; the analysis reads one mono down-mix.
So the tree cannot answer the two questions every rung above the visualizer asks
first: where does the chorus start, and whose mouth may move here. Separating a
lead vocal is also outside the module's stated scope — it keeps itself free of
dependencies — so a vocal activity map would arrive as uploaded stems, not as
analysis here.

- `lib/audioEnvelope.ts:43` "export interface AudioEnvelope {"
- `lib/audioEnvelope.ts:184` "Down-mix every channel to one, averaged"
- `lib/audioEnvelope.ts:197` "No library dependency — this module stays free of anything"

## Upward lesson: a beat-driven effect is a flash

The tree caps beat-driven brightness changes at three per second, and applies the
cap once over the whole band array rather than per frame. The draft standard
lacked it; cut-rate-follows-the-section now treats a beat-rate cut between
contrasting shots as the same kind of event.

- `app/_phases/frames/music-video/compositor.ts:116` "WCAG 2.3.1's general photosensitivity guidance — no more than three"
- `app/_phases/frames/music-video/compositor.ts:133` "ONE PASS, ONE TIME, OVER THE WHOLE TRACK — not evaluated per rendered frame."

## Adjacent finding: the deliverable re-normalizes the master

Outside this technique but against the subject's delivery rule: the export
re-encodes and loudness-normalizes the uploaded track, in a single pass by design.
The comment's own premise — the destination platform re-normalizes on upload
regardless — is the subject's argument for leaving the master alone: if the
platform normalizes anyway, the local pass only changes the master.

**Measured 2026-10-05 (experiment, paired, n=1 synthetic fixture).** One
verse-and-chorus fixture at -18.4 LUFS and -2.4 dBTP went through the export's own
audio arguments and four alternatives, with integrated loudness read per section.
The master's verse-to-chorus contrast was 8.2 dB. The single-pass filter left
2.7 dB. Its two-pass linear mode, which the comment names as the upgrade path, left
3.0 dB, because linear mode falls back to dynamic when the target gain would breach
the peak ceiling. A plain copy kept 8.3 dB at -18.1 LUFS. One gain capped by peak
headroom kept 8.2 dB at -16.7 LUFS and -1.0 dBTP. The whole-track loudness range
moved only from 8.5 to 8.8 LU, so that figure does not see the damage. The fix
shipped as one measured gain on a gravitone branch (`970252f`, not merged: the local
checkout was 145 commits behind its remote, so the branch was cut from the remote
tip). Where the track is somebody else's, the subject's rule is still a copy of the
master. The peak-capped gain is only for a track the producer may level.

- `lib/musicVideoExport.ts:278` "384k"
- `lib/musicVideoExport.ts:279` "SINGLE-PASS loudnorm, not two-pass."
- `lib/musicVideoExport.ts:286` "which re-normalizes on upload regardless"
- `lib/musicVideoExport.ts:290` "loudnorm=I=-14:TP=-1:LRA=11"
