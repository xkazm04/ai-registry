---
layer: application
type: application
subject: generated-speech-acceptance
technique: listening-board
stack: process
status: forged
verified_on: 2026-09-30
---

# A listening board for a cloning bake-off, and the verdict that overruled the top score

The board was built for one decision in Personas, a local-first desktop app
whose companion speaks her replies: which open-weights engine, if any, should
give her a custom voice cloned from a short clip, and which should speak live.
Four engines were run on one machine (RTX 4090 24 GB and, with the card
unused, a Ryzen 7 7800X3D, Windows 11) on **2026-09-29**, and the owner
listened on the same day and decided on **2026-09-30**. The speed side of the
bake-off lives in the software-engineering bundle's voice subject; this
application is the acceptance side. Numbers are quoted from the project's own
results file with their conditions.

## What the board carried

- **Grouped by line.** Three lines, each with every engine adjacent: a
  greeting ("Good morning. I've read the overnight runs already."), a
  two-sentence reply, and a 200-character summary with two numbers, a name and
  a closing question. One table per line for cloned voices, one for preset and
  designed voices.
- **Anchors as audio.** At the top of every cloned table: the reference every
  engine cloned (10.75 s of one male speaker from a public video, music removed
  by source separation, mono 24 kHz, -22.6 LUFS), and a held-out sentence of the
  same speaker, 3.85 s, never given to any engine. The reference was a private,
  local test of a character voice and is not a voice anyone would ship.
- **Everything audible.** Every generated clip, including a first run
  discarded from the timings because downloads were running and the
  per-sentence spawned runtime's takes, sits in an "also recorded" table
  labelled with why it is there — the report's own phrase is "so that nothing
  measured is unheard".
- **Device takes side by side**, GPU and CPU columns per engine, with the
  explicit note that for the sampling engines the CPU take is a separate take,
  not a copy.
- **One clip at a time**; proxies computed on the original WAV renders, the
  board playing 192 kbps mono MP3 copies at the native rate.
- **Numbers under each player**: real-time factor, first-audio time, speaker
  similarity (cloned voices only), word error rate.
- **A listen-for list** of six items: timbre or timing too; the gravel in the
  smallest model; numbers, name and final rise on the long line; GPU against
  CPU; one preset's misread; designed voices against a stock preset.

Two deviations from the technique, recorded rather than smoothed: the board was
**labelled, not blind**, and the report records **no loudness matching of the
takes** (only the reference was normalised). The verdict below is therefore a
labelled listening, carrying whatever brand and loudness bias that implies.

## What the scorers said

Speaker similarity is the cosine of ECAPA-TDNN speaker embeddings
(`speechbrain/spkrec-ecapa-voxceleb`) against the cloned reference;
intelligibility is Whisper large-v3-turbo with Whisper's English normaliser on
both sides, scored with jiwer. Means over the lines run; three warm runs per
line on the GPU.

| Anchor or cloner | Similarity |
| --- | --- |
| held-out same-speaker sentence (the ceiling) | 0.86 |
| stock preset voices of other speakers (the floor) | ~0.06 (range 0.01–0.15) |
| VoxCPM2 2B | 0.82 (0.86 on the reply line) |
| Qwen3-TTS 0.6B Base | 0.81 |
| Qwen3-TTS 1.7B Base | 0.75 |
| Chatterbox Turbo 350M | 0.69 |
| Chatterbox Nano 110M | 0.63 |

- **Every clone said every word:** 0% word error rate on every line, every
  cloner, both devices. The misses elsewhere were small and specific: one
  preset voice turned "12 of them passed" into "she tore of them past" (the one
  real misread); the CPU takes of one engine slipped once each on "flagged";
  and a 6% on the voice-design engine's reply line was the recogniser writing
  "time out" for "timeout" — a normaliser artefact, not a synthesis error.
- **Similarity has a referent.** The voices designed from a description scored
  0.01–0.09 against the cloning reference, as they should: they were never
  asked to match it, and the report shows them as "–" in the similarity column
  rather than as low scores.
- **The run's own resolution statement:** three runs, three lines and one
  reference voice rank engines whose differences are several-fold, and cannot
  separate two engines within about 10%. It said so of the two Qwen3-TTS sizes
  (0.81 against 0.75, "treat them as equal").

The engine tester recommended the top score, VoxCPM2, for cloning, and noted
under the listen-for list that it copies the reference's delivery as well as
its timbre — about a second of silence and then a slow greeting, 5.1 s where
the other engines took about 3 s. (The Qwen3-TTS 0.6B take also borrowed the
pauses on the greeting; the 1.7B did not.)

## What the listener decided

The owner listened to the board and named, per use:

- **Cloned voice:** Qwen3-TTS 1.7B and 0.6B — not the top-scoring VoxCPM2 —
  with the reservation that their GPU time suits video and audio content
  generation rather than live conversation.
- **Preset or designed voice, CPU-focused:** Kokoro with the `af_heart` preset,
  and the verdict that **its output quality is the same on the CPU, on the GPU
  and through the sherpa-onnx runtime** — the device-variant listening that
  licensed a user-facing GPU/CPU toggle chosen for speed alone.
- **Chatterbox Nano:** rejected on time, not on sound.

Read against the technique:

- **The top score was overruled, and the gap was a tie.** VoxCPM2 led
  Qwen3-TTS 0.6B by 0.01, inside what the run itself said it could resolve. The
  listener broke the tie, and the board is what made that a recorded verdict
  rather than a disagreement with a number.
- **Cause not traced.** The owner's verdict gave no reason for preferring
  Qwen3-TTS beyond the speed reservation. The copied pacing is the audible
  difference the report flagged, and the Qwen3-TTS 0.6B take shares some of it,
  so it is not written down as the cause.
- **Per use, not overall.** The same listener chose a cloner for prepared
  content and a stock voice for live replies. A single "best engine" line would
  have lost the decision's shape.
- **One listener.** This is the owner's product decision and a preference, not
  an opinion score; no panel was run.

The owner's final decision on 2026-09-30 kept the stock preset as the default
live voice and deferred cloning in the product "until the market develops".
The board did its job as acceptance evidence: it is why that decision rests on
a listening rather than on the highest similarity score.
