---
layer: application
type: application
subject: motion-quality-gating
technique: filmstrip-sampling-discipline
stack: node
status: forged
---

# Filmstrip resolution in PoF

`src/lib/anim-critique/filmstrip.ts` is forty-four lines and it is half the motion
critic's instrument. It is pure — it takes a list of capture filenames and returns an
ordered list — which is what makes the three sampling rules testable in isolation from
the model.

## One naming family (`filmstrip.ts:36-40`)

A capture directory routinely holds two families at once: the observation capture
writes `frame_NN.png` (plus `frame_NN_side.png` for the side camera) and the L4
scenario capture writes `shot_NN.png`. `FRAME_RE` (line 11) matches both, then line 37
picks exactly one:

```
const prefix = parsed.some((x) => x.m[1].toLowerCase() === 'frame') ? 'frame' : 'shot';
```

The module docstring states the reason: "we pick ONE source (`frame_` preferred) rather
than interleaving them". Interleaving would hand the critic two takes as one motion.
The camera is a third family and is filtered first (line 34) — `cam: 'main'` drops the
`_side` frames, `cam: 'side'` keeps only those — so a strip is one take from one camera.

## Numeric order (`filmstrip.ts:39`)

`.sort((a, b) => Number(a.m[2]) - Number(b.m[2]))` on the captured index group, with the
docstring calling out the exact hazard: "numeric-sorted (so `frame_10` follows
`frame_2`, not `frame_1`)". A lexical sort here would shuffle time and the critic would
report it as bad animation.

## Even subsample keeping first and last (`filmstrip.ts:21-28`)

```
for (let i = 0; i < n; i++) {
  out.push(arr[Math.round((i * (arr.length - 1)) / (n - 1))]);
}
```

The `(n - 1)` denominator with an `(arr.length - 1)` numerator is what pins both
endpoints: `i = 0` maps to index `0`, `i = n - 1` maps to the last index. That is the
start pose that `anticipation` is scored against and the settle that `followThrough` is
scored against — the two dimensions in `prompt.ts` that a naive "every nth frame" would
silently remove the evidence for. The guards on line 22 handle the degenerate cases
(`n >= arr.length` returns everything; `n <= 1` returns a single frame) rather than
producing a division by zero.

## Where the count travels

`buildCritiquePrompt` in `src/lib/anim-critique/prompt.ts:32` writes the resolved frame
count into the prompt text — "You are looking at N frames sampled in time order" —
so the sample size is part of the request and therefore part of the score's basis.

## The sibling sampler

`src/lib/visual-gen/footage-gate.ts:57-70` (`buildFfmpegSampleArgs`) does the same job
for a video clip ahead of a markerless-capture solve, sampling N frames evenly across a
duration read by `ffprobe` (`parseFfprobeDuration`, line 48, returns `null` on garbage
or zero rather than defaulting). Its prompt (line 23) states the disqualifier that is
specific to motion: "both feet must stay two distinct, separate shapes in every frame;
feet that fuse or merge into one mass are DISQUALIFYING, because foot contact drives
root motion", while "hands may degrade into blobs — note it as a defect but do NOT fail
the clip for hands alone". The file names itself "the mirror of input-gate", the
image-to-3D pre-gate — same argument shape, different disqualifiers, each derived from
what its own downstream stage depends on.
