---
layer: application
type: application
subject: talking-avatar
technique: neural-motion-retargeting
stack: python
status: forged
verified_on: 2026-10-18
verified_against: python@3.12
---

# Decoding an audio-to-motion model's keypoints into rig parameters

The athena-portable avatar spike (branch `worktree-spark-athena-avatar`, commits
`b5d30c79` and `fbd9c59b`, 2026-10-17/18) drove a 2D rig with motion from JoyVASA
(MIT), an audio-to-motion model whose expression output is 21x3 implicit-keypoint
deltas with no semantic names. The pipeline is "t4-hybrid"; it won the operator's
blinded ranking on two non-human portraits. Figures: one RTX 4090 desktop, CPU
for decode and retarget.

## The decoder

Fitted once, then a matrix multiply:
`spikes/avatar/t4-hybrid/t4/calibrate.py:1 "Learn a render-free semantic decoder"`.
Ridge per channel, validated leave-one-clip-out
(`spikes/avatar/t4-hybrid/t4/calibrate.py:112 "def cv_r2(X, y, groups, lam):"`), with
pose signs measured against an image-space proxy rather than assumed
(`spikes/avatar/t4-hybrid/t4/calibrate.py:161 "sign_to_rig"`). Result over 15
clips: `spikes/avatar/t4-hybrid/README.md:21 "Leave-one-clip-out R² over 15 clips: blink 0.84, brow 0.90, jaw 0.75"`.

The anchor-frame trap, as it happened:
`spikes/avatar/t4-hybrid/README.md:98 "Decoder features relative to frame 0"` —
held-out R² went to -0.41 for brow while in-sample looked fine; the fix was a
dataset-mean anchor and absolute features
(`spikes/avatar/t4-hybrid/t4/calibrate.py:96 "exp[N,21,3] -> N x 63, absolute"`).

## The retarget

- Head low-pass at 2 Hz, zero-phase: `spikes/avatar/t4-hybrid/t4/retarget.py:119 "JoyVASA's raw pose carries a ~1-1.5 Hz bobble at syllable rate"`.
- Ease-in for the start transient: `spikes/avatar/t4-hybrid/t4/retarget.py:125 "JoyVASA's first ~0.3 s is a start transient"`.
- Lids split into a capped partial curve and sparse crisp blinks re-synthesised at
  60 fps: `spikes/avatar/t4-hybrid/t4/retarget.py:68 "JoyVASA's lid events are mostly slow partial drops"`;
  mapped one-to-one they gave `spikes/avatar/t4-hybrid/README.md:100 "This gave 45-74 blinks per minute."`.
- Jaw as emphasis with mean 1 over speech: `spikes/avatar/t4-hybrid/t4/retarget.py:147 "neural jaw as a per-syllable *emphasis* factor with mean 1 over speech"`.
- Question gesture from the text, because the model does not make it:
  `spikes/avatar/t4-hybrid/t4/retarget.py:155 "JoyVASA does not answer the question shape"`.
- A per-character profile: `spikes/avatar/t4-hybrid/t4/retarget.py:209 "glow = t1's glow-being rigs (b04-owl, d08-origami)"`,
  whose lid cap is explained at `spikes/avatar/t4-hybrid/README.md:75 "Lid drops capped at 0.2."`.

## What it bought

On the `question` line, procedural (t1) against retargeted (t4), same rig, same
timeline: `spikes/avatar/t4-hybrid/README.md:82 "| t1 | 0.54, 0.66, 1.27 | 2.1 | 549 | 1/5 |"`
against `spikes/avatar/t4-hybrid/README.md:83 "| t4 | 0.48, 0.54, 1.35 | 4.2 | 336 | 3/5 |"`
— about the same amplitude, 40 % less jerk, nods on 3 of 5 stressed syllables
instead of 1. Head-to-envelope coupling over four seeds was not clearly better
than procedural (0.08-0.28 against -0.04 to 0.30), so the learned head is drift,
not lip-sync.

## The shipped port

The retarget landed in athena-portable's face helper (`main` at `d5bb49cd`,
2026-10-18), ported rather than imported:
`src/athena/channels/voice/face_helper/motion.py:3` "Ported from the spike's t4-hybrid track (``t4/{neural_motion,retarget}.py``). JoyVASA samples",
with the decoder kept beside it as data
(`src/athena/channels/voice/face_helper/motion.py:41` "DECODER = Path(__file__).resolve().parent" — the
fitted matrix, not its fitting command), the glow profile as constants
(`src/athena/channels/voice/face_helper/motion.py:32` "HEAD_GAIN = 0.55",
`src/athena/channels/voice/face_helper/motion.py:34` "LID_MAX = 0.2",
`src/athena/channels/voice/face_helper/motion.py:38` "BLINK_GAP_S = 2.2"), and the
model kept warm with a throwaway second first
(`src/athena/channels/voice/face_helper/main.py:138` "# loader's and the GPU kernels' first-use cost (measured: about 7 s), a warm one not.").
The text-driven question tilt did not come along:
`src/athena/channels/voice/face_helper/motion.py:17` "borrowed from the text: this track is predicted from the audio alone. Runs in the face helper's".

## Deviations

- **"Not live" was wrong, and is corrected.** The spike wrote
  `spikes/avatar/t4-hybrid/README.md:103 "the motion latency is at least 4 s"`,
  and this record first read it as "the hybrid serves pre-synthesised utterances
  only". The voice renders whole sentences before playback, so motion is computed
  per finished sentence while the previous one plays: on the shipped path,
  0.57-0.75 s per ~2.5 s sentence warm, every motion event in time (RTX 4090,
  2026-10-18, n = 6 sentences; see
  [python--per-sentence-face-sidecar](./python--per-sentence-face-sidecar.md)).
  The window bounds latency only for streamed audio. Generating it still needs
  the model on the accelerator (peak 1.3 GB in the spike).
- The calibration script's own docstring still says features are "relative to the
  clip's first frame" (`spikes/avatar/t4-hybrid/t4/calibrate.py:6 "relative to the clip's first frame"`)
  while the code fits absolute features — a stale comment beside the fix it
  documents.
- **The shipped track drops the question tilt.** The technique takes text-level
  gestures from the text; the product's motion is audio-only and its procedural
  layer does not add the tilt back, so a question ends without it.
- **The fitting command did not ship with the decoder.** The product carries the
  fitted matrix; refitting it means going back to the spike branch, which the law
  on derivations naming their recomputation asks to avoid.
- The procedural baseline it beat is a sum of sines
  (`spikes/avatar/web/src/motion.js:154 "slow sway (sum of incommensurate sines)"`),
  which the procedural-presence-motion technique advises against; part of t4's
  margin is that baseline's jerk.
