---
layer: application
type: application
subject: voice-io
technique: speech-timing-timeline
stack: python
status: forged
verified_on: 2026-10-18
verified_against: python@3.12
---

# Exact phoneme timelines from a hidden duration output, in a companion's avatar spike

Athena is a local companion whose voice daemon speaks through a Kokoro model run by
the `sherpa-onnx-offline-tts` executable. The avatar spike that gives it a talking
face needed a per-phoneme timeline for that voice, and built one offline in Python;
the citations below are resolved against commit `45f87304` on branch
`worktree-spark-athena-avatar`, paths relative to that worktree's root. The stack
witness is `spikes/avatar/voice/pyproject.toml:5` "requires-python = ".
Every number below was measured on 2026-10-17/18 on one desktop with an RTX 4090,
but on the CPU execution provider of onnxruntime (no GPU), with the thread counts
stated beside each figure.

This is the tree that taught the technique, including its two sharpest rules —
the tiling check and the linear time map — and one of them was learned from a bug.

## The model's own durations, which the host discarded

The engine exposes no timings, yet the model graph already computes them:
`spikes/avatar/voice/avatar_voice/engine.py:4` "That ONNX graph already has a second output",
and the host ignores it, `spikes/avatar/voice/avatar_voice/engine.py:6` "reads only output 0. So:". The spike runs the same
model in onnxruntime and takes audio and durations together, with a tiling check on every call
that is the technique's structural proof:

- `spikes/avatar/voice/avatar_voice/engine.py:148` "int(dur.sum()) * FRAME != audio.shape[0]"
- `spikes/avatar/voice/avatar_voice/engine.py:149` "duration output does not tile the audio"

Because the decoder draws noise, the spike's WAV is its own render, and it is shown to be the
same voice against the host's own spread: `spikes/avatar/voice/README.md:37` "sherpa A vs sherpa B is **0.919 dB**, sherpa A vs ours **0.916 dB**"
(one sentence, log-mel DTW distance). The production route the spike recommends keeps the
host's audio byte-for-byte and adds a durations-only cut of the graph,
`spikes/avatar/voice/README.md:148` "Durations-only subgraph: 56 MB, 2260 of 5039 nodes, 1.08 s load, **72 ms** per sentence warm"
(one 3.85 s sentence, 4 intra-op threads). Its exactness rests on noise independence,
`spikes/avatar/voice/docs/wire-proposal.md:86` "durations do not depend on the decoder's noise (identical across seeds)".

## One frontend, captured from the run

Tokens come from the host's own run with a debug flag, not from a second grapheme-to-phoneme
pass: `spikes/avatar/voice/avatar_voice/engine.py:10` "No second G2P, so no G2P disagreement."
The README records the two alternatives rejected for the same reason,
`spikes/avatar/voice/README.md:46` "it would add a second G2P that can disagree with the".

## The time map, and the bug that made it linear

The host's only post-process is silence compression, replayed with an explicit map. The first
map snapped every position in a cut to the cut point; with the offset correction applied, the
onset /d/ of "Do" moved into the cut leading pause and vanished:

- `spikes/avatar/voice/README.md:110` "Bug found in Director review: the /d/ of"
- `spikes/avatar/voice/avatar_voice/engine.py:220` "shifted into the cut leading pause - to zero length"
- `spikes/avatar/voice/avatar_voice/engine.py:170` "never collapses to zero length"
- `spikes/avatar/voice/avatar_voice/engine.py:223` "np.interp(np.asarray(raw, dtype=np.float64), xs, ys)"

The offset is applied in model-output time, before the map, with both ends pinned:
`spikes/avatar/voice/avatar_voice/engine.py:157` "edges = np.clip(edges - int(round(LEAD_S * SAMPLE_RATE)), 0, audio.shape[0])"
and `spikes/avatar/voice/avatar_voice/engine.py:158` "edges[0], edges[-1] = 0, audio.shape[0]".

## The measured offset

The constant names its measurement and its recomputation:
`spikes/avatar/voice/avatar_voice/engine.py:36` "8 stop-rich sentences, score peak at -55 ms, 7/8 sentences within"
— n = 8 sentences, 7 of 8 peaking between -45 and -65 ms
(`spikes/avatar/voice/README.md:42` "7/8 sentences between -45 and -65"). The sweep runs on raw
model output, `spikes/avatar/voice/avatar_voice/calibrate.py:11` "part of speech; vowels the loudest). The best d is the lead. Raw model audio, before",
scoring vowel-loud against stop-quiet spans rather than the closure-and-frication pair, which
the separate verification sweep uses. Nasals are excluded from the closure score, which is an
upward lesson the technique took: `spikes/avatar/voice/README.md:102` "PP on /m/ is not scored: a nasal murmur is voiced".

## Verification that fails the render

The token check compares the engine's printed tokens with the timeline, by code independent of
the builder (`spikes/avatar/voice/avatar_voice/verify.py:54` "character by character, independently of the grouping code, so a dropped or collapsed token"),
treats zero length as failure (`spikes/avatar/voice/avatar_voice/verify.py:75` "= False"), and turns into
a non-zero exit (`spikes/avatar/voice/avatar_voice/verify.py:138` "for r in out.values()) else 1").
Replayed against the old snap map it fails at the first character,
`spikes/avatar/voice/README.md:118` "question at char 0". Seeding the decoder's two random ops
gives byte-identical renders, `spikes/avatar/voice/README.md:20` "two runs give byte-identical WAVs and JSON".

## Transport: designed, not built

`spikes/avatar/voice/docs/wire-proposal.md` designs one event per sentence before its first
chunk (`spikes/avatar/voice/docs/wire-proposal.md:27` "One event per sentence, sent **before that sentence's first PCM chunk**"),
in sample offsets because the client player shifts every later sample on an underrun
(`spikes/avatar/voice/docs/wire-proposal.md:23` "every underrun. A timeline in *sample offsets of the generation's PCM stream* does not."),
with the client holding silence between chunks (`spikes/avatar/voice/docs/wire-proposal.md:67` "Between chunks (during an underrun) hold `sil`"),
adding output latency (`spikes/avatar/voice/docs/wire-proposal.md:70` "Add `context.outputLatency`"), and leaving anticipation to the renderer
(`spikes/avatar/voice/docs/wire-proposal.md:107` "Shifting the timeline to anticipate articulation in the daemon. The daemon reports the truth,").
Backends without timings send nothing and the avatar falls back to amplitude
(`spikes/avatar/voice/docs/wire-proposal.md:58` "Piper and other backends simply never yield one, and the avatar falls back to amplitude").

## Deviations

- **The live event is a design only.** `spikes/avatar/voice/docs/wire-proposal.md:3` "Nothing in `src/` or `apps/` was changed."
  No producer or consumer of per-sentence timings exists in the daemon or the desktop client.
- **Client tolerance is not shipped.** Today an unknown event kind raises,
  `spikes/avatar/voice/docs/wire-proposal.md:53` "`event_from_dict` raises on an unknown kind"; the proposal names the
  same-release requirement but nothing enforces it yet.
- **The end check is looser than the claim.** The validator allows 40 ms at the end,
  `spikes/avatar/voice/avatar_voice/render.py:136` "n_samples / SR) > 0.04:",
  while the README reports the timelines end to the sample (`spikes/avatar/voice/README.md:89` "the audio end (to the sample)"); the measurement is
  right, the gate would not catch a regression under 40 ms.
- **The token check is skippable.** It runs only on a full render with check images,
  `spikes/avatar/voice/avatar_voice/render.py:182` "if not args.no_check and not args.only:", so a subset render ships unverified.
- **The timeline does not record its source.** Timeline v1 carries version, rate and segments
  but no field saying engine durations versus aligner (`spikes/avatar/CONTRACT.md:45` "## Timeline (version 1)"),
  and stores seconds rather than samples (`spikes/avatar/CONTRACT.md:59` "Times are seconds from the first audio sample.");
  acceptable for the offline file, and the wire design moves to samples.
