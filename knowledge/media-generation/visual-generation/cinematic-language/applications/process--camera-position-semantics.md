---
layer: application
type: application
subject: cinematic-language
technique: camera-position-semantics
status: forged
stack: process
verified_on: 2026-09-01
refresh_by: 2027-03-01
---

# Seven seed-matched A/B cycles on one image stack — what this subject's rules actually measured, August–September 2026

Most of this subject's claims arrive from craft doctrine. Seven of them
were run instead: a shot compiler's prompt was the baseline arm, the
same prompt with the rule's clause added was the challenger arm, and the
two were generated on the *same seed* so the only difference in the pair
is the sentence. That instrument is what the rows below cite. It lives
in gravity's dojo lane (`gravitone-gcloud`, HEAD `51c0eea`).

## The instrument

- **Generator:** Flux 2 dev (fp8 mixed) through a local ComfyUI graph —
  `pipeline/foundry/forge.py:187`, driven per pair by
  `pipeline/foundry/dojo_pairs.py:87`. Seed-matched, 1280×720, 20 steps.
  One model family; nothing here is a cross-model result unless a row
  says so.
- **Two judges, independently.** A local vision model (`qwen3.8:27b`)
  produces a structured *readback* of each frame — shot size, camera
  angle, composition, light sources, what is dark — and a blind
  chokepoint pick; a hosted judge (`gemini-3.6-flash`) picks the same
  pairs separately. Both stacks are declared at
  `.claude/dojo/config.md:23-25`.
- **The human decides.** Judge agreement is evidence, not the verdict;
  every row below carries a hand APPROVED.
- **The readback is the only direct measurement.** Pick rate says which
  frame a judge preferred; the readback says whether the described
  effect *appeared*. Where a claim is about a nameable property, the
  readback is the stronger number — see the diagonal row.

## The rows

| date | claim under test | n pairs | chokepoint pick rate | hosted judge | agreement | human |
|---|---|---|---|---|---|---|
| 2026-08-30 | camera angle written as attitude, not mechanics | 4 | 0.50 | 4/4 challenger | 0.50 | APPROVED |
| 2026-08-30 | a lighting clause naming what stays dark | 4 | **1.00** | 4/4 challenger | 1.00 | APPROVED |
| 2026-08-30 | optics as described effect, never notation | 4 | 0.75 | 3/4 challenger | 0.67 | APPROVED |
| 2026-08-30 | genre as layer rows + an imperfection budget | 4 | 0.75 | 4/4 challenger | 0.75 | APPROVED |
| 2026-08-30 | performance as 3–5 prop-anchored beats | 4 | **1.00** | 4/4 challenger | 1.00 | APPROVED |
| 2026-08-31 | diagonal as a third placement value | 3 | 0.67 | 3/3 challenger | 1.00 | APPROVED |
| 2026-08-31 | one environmental light layer in wides | 3 | 0.67 | 3/3 challenger | 0.67 | APPROVED |

Sources, in order: `foundry-out/training/2026-08-30-camera-attitude/cycle.json:111`,
`.../2026-08-30-what-stays-dark/cycle.json:111`,
`.../2026-08-30-lens-as-effect/cycle.json:111`,
`.../2026-08-30-genre-as-contract/cycle.json:111`,
`.../2026-08-30-counted-beats/cycle.json:111`,
`.../2026-08-31-study-diagonal/cycle.json:96`,
`.../2026-08-31-study-light-layers/cycle.json:96`. Human verdicts are the
`verdicts.json` and `findings.md` beside each (e.g.
`.../2026-08-31-study-diagonal/findings.md:7`).

## The diagonal row is carried by its readback, not its pick rate

The claim came from a corpus study before it came from an A/B: 159
annotated A-tier frames across six sources, in which `diagonal` is the
most common extreme-wide composition (10/31 extreme-wide, 23/155
overall) while the shot compiler's placement vocabulary held only
`{crosshair, thirds}` — `.../2026-08-31-study-diagonal/cycle.json:15`.

The pick rate is a modest 0.67 (2 of 3, one tie). The measurement that
matters is the composition field of the readback, which names the
property directly — `.../2026-08-31-study-diagonal/readbacks.json`:

| pair | baseline composition | challenger composition |
|---|---|---|
| setup, extreme wide | `off-center-negative-space` (:11) | **`diagonal`** (:61) |
| rung, wide | `symmetrical` (:113) | `centered` (:163) |
| peak, extreme wide | `symmetrical` (:221) | **`diagonal`** (:271) |

0 of 3 → 2 of 3. The one failure is also the one tie, and its recorded
reason is that the challenger's only diagonal was a colour-grade split
line rather than a line of action carrying the subjects
(`cycle.json:53-55`) — a hint that the clause needs a *subject on the
line*, which is how the amended technique now phrases it.

## The lighting row is a refinement, and one pair went the other way

63 frames from an animated feature trailer, annotated locally: 89% name
two or more in-world light sources where the gated rule prescribed
exactly one (`.../2026-08-31-study-light-layers/cycle.json:15`). The
challenger kept the dominant source and the darkness clause and added
one named environmental layer. Two of three pairs went to the
challenger; the third went to the *baseline* on the chokepoint while the
hosted judge went challenger — and the recorded reason is that the
*baseline* frame had itself grown an overcast-sky layer
(`cycle.json:72-74`) — agreement 0.67. That is why the technique carries
this as a shot-size-scoped refinement and
caps the layer count at one, rather than as a reversal of
subtract-to-one.

## The counter-evidence worth keeping

In the optics run, three of four intents landed and **long-lens
compression did not** — the pair tied, with both readbacks reporting an
indeterminate lens and explicitly no background-compression cue
(`.../2026-08-30-lens-as-effect/cycle.json:34-35`). One model, one pair,
one date. It is recorded in the technique as a measured limit rather
than a general law, because that is exactly the size of the evidence.

## What transferred off this model

Only the two unanimous rules were re-run elsewhere. On a hosted image
model (Nano Banana 2, no seed available, so k=2 repeats per arm instead
of a seed match), *what stays dark* and *counted performance beats* both
held at 0.75 pick rate for about $1.62 — `.claude/dojo/config.md:233`.
The five non-unanimous rows, the diagonal and the light layer among
them, remain single-stack results. Read every table number above as
"true of one diffusion model family on these dates" until a second stack
says otherwise.
