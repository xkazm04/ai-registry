---
layer: application
type: application
subject: talking-avatar
technique: per-sentence-face-sidecar
stack: python
status: forged
verified_on: 2026-10-18
verified_against: python@3.12
---

# A stdlib voice daemon and a face helper in another interpreter

Athena is a local companion whose voice daemon is stdlib-only Python and speaks
through Kokoro run by the `sherpa-onnx-offline-tts` executable. Its face
(ADR `docs/adr/0120-athena-has-a-face.md`) landed on `main` at commits
`350419a0..d5bb49cd`, 2026-10-18; every citation below is resolved against
`d5bb49cd`, paths relative to the athena-portable repository root. The face's
heavy half — a durations-only cut of Kokoro's graph for the mouth timeline, and
JoyVASA (torch) for motion — runs in a *face helper* in an interpreter the person
configures. This is the tree that taught the technique.

## The process boundary

- The daemon never imports the helper:
  `src/athena/channels/voice/face.py:6` "**One helper, another interpreter.** The helper (:mod:`athena.channels.voice.face_helper`) needs",
  and loads it by path under a name of its own:
  `src/athena/channels/voice/face.py:97` "#: The bootstrap the other interpreter runs: the helper package loaded from its directory under a".
- Capabilities first, motion later:
  `src/athena/channels/voice/face_helper/main.py:5` "15 s); motion loads after the hello, on its own thread, and a load that fails is reported as".
  The probe's three states: `src/athena/channels/voice/face.py:319` "Absent (not set up, missing, or starting), broken (and why), or ready with its powers.".
- The cheap answer never waits behind motion:
  `src/athena/channels/voice/face_helper/main.py:15` "time in arrival order and skips a cancelled one. The mouth shapes never wait behind motion: they".
- The helper is reaped by its input closing:
  `src/athena/channels/voice/face_helper/main.py:21` "exits when its stdin closes, which is how it never outlives the daemon.".
- The protocol owns the real streams, and the Windows pipe trap is named with its
  measurement: `src/athena/channels/voice/face_helper/main.py:55` "waits until the read returns. With the protocol reading the only stdin, JoyVASA's load sat"
  and `src/athena/channels/voice/face_helper/main.py:56` "there until the daemon happened to send a sentence (measured: minutes). The pipe is moved off".

## Deadlines and backoff

- `src/athena/channels/voice/face.py:14` "**The face never holds the voice.** Every wait on the helper has a deadline, a write goes through".
- The mouth timeline's wait: `src/athena/channels/voice/face.py:82` "VISEMES_TIMEOUT_S = 1.0"; two misses and
  it is broken: `src/athena/channels/voice/face.py:87` "MAX_MISSES = 2"; the doubling backoff:
  `src/athena/channels/voice/face.py:89` "BACKOFF_S: tuple[float, float] = (2.0, 60.0)".
- Motion is never waited for before audio; after the last audio the line waits no
  longer than it is still heard, under a ceiling:
  `src/athena/channels/voice/face.py:93` "MOTION_TAIL_S = 2.0" and
  `src/athena/channels/voice/kokoro.py:645` "deadline = min(heard_by, time.monotonic() + MOTION_TAIL_S)".
- A timeline that does not end on the sentence's last sample is not used:
  `src/athena/channels/voice/kokoro.py:575` "if visemes is not None and visemes[-1][2] == len(pcm) // 2:".

## Byte-identical voice

- No helper, same path: `src/athena/channels/voice/kokoro.py:607` "While the helper is not ready this *is* :meth:`synthesize` - the same arguments, the same",
  held by `tests/channels/test_voice_face.py:250` "def test_with_no_helper_the_line_is_the_same_process_the_same_args_and_the_same_bytes(".
- With the helper, the engine's silence cut is switched off and replayed in the
  daemon: `src/athena/channels/voice/face.py:69` "--tts-silence-scale=1"
  and `src/athena/channels/voice/face.py:134` "sherpa's ``GeneratedAudio::ScaleSilence`` over 16-bit PCM, and the time map it implies.";
  held by `tests/channels/test_voice_face.py:160` "def test_the_replayed_cut_is_sherpas_sample_for_sample(seed: int) -> None:"
  and `tests/channels/test_voice_face.py:287` "def test_the_cut_audio_with_a_helper_is_the_audio_without_one(".
- The audio is decided before the helper is asked:
  `src/athena/channels/voice/kokoro.py:548` "The audio is decided first and never depends on the helper: whatever the helper does -".

## Measured on the product path

One run by the operator on 2026-10-18, RTX 4090 desktop, real Kokoro and the real
helper, one 3-sentence 7.2 s line, 2 rounds (n = 6 sentences); recorded here, not
yet as a file in the repository:

| Quantity | Result |
| --- | --- |
| mouth timeline per sentence | 41-94 ms |
| JoyVASA motion per ~2.5 s sentence, warm | 0.57-0.75 s |
| first audio delayed by the face | < 0.1 s (the mouth timeline only) |
| motion events arrived | all |
| timeline end against sentence end | exactly on the last sample, every sentence |

So the 4 s analysis window never waited on the clock: each sentence's motion was
computed from its finished audio while the sentence before it played. This
corrects the spike-era claim that the hybrid was "offline per utterance" with
"at least 4 s" of latency.

## Measured without the accelerator, and the default

The follow-up measurement (`main` at `0d1baaec`, `spikes/avatar-measure/`,
2026-10-18, the same Ryzen 7 7800X3D + RTX 4090 desktop) ran the shipped
`Motion.frames` on the CPU and on the 4090. The box was shared and
`spikes/avatar-measure/README.md:18 "kept it at 92-100 % busy for the whole run"`,
so every CPU figure is relative between configurations, not a specification;
each row records its load. It does not repeat the product-path run above, so
that run stays the operator's record; its isolated 4090 bench agrees in size
(`spikes/avatar-measure/README.md:99 "0.67 (0.65-0.86)"` s for a 3.26 s sentence,
n = 9).

- **Motion on CPU only**, warm, one 3.26 s sentence, n = 9 per cell: 3.02 s at 4
  threads (RTF 0.93), 1.78 s at 8 (0.55), 1.35 s at 16 (0.41), against 0.67 s on
  the 4090 (0.21) — rows at `spikes/avatar-measure/README.md:94-99 "RTX 4090"`. Cost is one
  step per 4 s window
  (`spikes/avatar-measure/README.md:30 "**Cost is a step function of 4 s windows.**"`).
- **Live coverage**, Kokoro rendering on the same CPU, 3 lines of 5 sentences:
  2 % / 44 % / 67 % / 82 % for 4 / 8 / 16 threads / the 4090
  (`spikes/avatar-measure/README.md:40 "said 2-44 % of speech got neural motion."`),
  and 80 % at 4 threads with a lean load and 10 DDIM steps
  (`spikes/avatar-measure/README.md:45 "Together: 80 % of speech covered live and 96 % when Kokoro runs ahead, against CUDA's 82 % and"`).
- **Small machine**: unmeasured. The pinned-core proxy was withdrawn under the
  background load (`spikes/avatar-measure/README.md:121 "**The pinned rows are not a laptop measurement and not even a good proxy on this box.**"`).
- **Mouth timelines stay cheap everywhere**, n = 21:
  `spikes/avatar-measure/README.md:138 "2-core proxy. They are linear in tokens, and the daemon's 1 s deadline holds with margin. No action"`.
- **Default-on rule (proposed)**: the helper probes one 4 s window during its
  warm-up and turns motion on when
  `spikes/avatar-measure/README.md:229 "Neural motion is on by default when the helper's own probe measures **W ≤ 1.0 s**"`,
  choosing steps from {50, 25, 10}, leaving two cores to the voice
  (`spikes/avatar-measure/README.md:241 "threads to the physical core count minus 2, leaving room for Kokoro's 2."`),
  and reporting `{"motion": true, "steps": K, "window_s": W_K}` in `caps`
  (`spikes/avatar-measure/README.md:248 "The daemon's"`). Not shipped at `0d1baaec`.

## Deviations

- The 1.0 s mouth-timeline wait is spent ahead of playback for every sentence but
  the first (`src/athena/channels/voice/face.py:80` "this the sentence plays without them, and the wait is spent on a render running ahead of"),
  so only a line's first audio can be delayed by it; the < 0.1 s measured delay
  is the warm case, and a cold or slow helper can cost a first sentence up to the
  full second.
- The product-path measurement above is not committed with the code; until it is,
  the figures are the operator's record, n = 6 sentences on one machine.
- **The helper cannot run motion without CUDA** (recorded 2026-10-18, a fix is in
  progress). It builds the motion model's config without forcing the CPU
  (`src/athena/channels/voice/face_helper/motion.py:86` "inference = InferenceConfig(**{k: v for k, v in kw.items() if hasattr(InferenceConfig, k)})"),
  and the wrapper then picks `cuda:0` whenever MPS is absent:
  `spikes/avatar-measure/README.md:25 "**The shipped helper cannot run motion on a CPU at all.**"`
  — on a machine without CUDA the load fails and the helper reports
  `caps motion:false`. Every CPU figure above came from a bench that set
  `flag_force_cpu`; the product path reaches none of them until
  `spikes/avatar-measure/README.md:28 "a one-line fix: "` lands. The technique's rule — test the load with the
  accelerator hidden — is what found it.
