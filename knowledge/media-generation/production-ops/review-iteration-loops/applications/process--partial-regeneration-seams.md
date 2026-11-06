---
layer: application
type: application
subject: review-iteration-loops
technique: partial-regeneration-seams
stack: process
status: forged
verified_on: 2026-11-06
refresh_by: 2027-02-06
applied: experiment
ab_verdict: unmeasurable
proof: ab-paired
---

# Process: a one-chord notation edit against a new seed, on YuE2

A local run on 2026-11-06 tested a claim from a tutorial: change one chord in the
notation, run again, and "Everything else stays exactly the same". The model was YuE2 3B
(`yue2_3b_int8_convrot`) in ComfyUI 0.42.1, with KSampler dpm_2, sgm_uniform, cfg 1 and 32
steps, on a 64 GB unified-memory box.

## What was compared

A is the original take. B is the same seed and settings with one chord changed. The
control is the same notation at a new seed. Sound is the mean absolute log-mel difference
per bar, and notes is 1 minus chroma cosine per bar, both compared at the same clock time.

| Pair against the original | Sound | Notes | Sound before edit | Sound after edit | Length |
|---|---|---|---|---|---|
| Song 1, one chord (`Bb/D` to `Gm/D`), same seed | 1.07 | 0.291 | 1.08 | 1.07 | 118.64 vs 119.88 s |
| Song 1, same notation, new seed | 1.02 | 0.143 | 1.13 | 0.99 | 119.68 s |
| Song 2, one chord (`F` to `Bb`), same seed | 0.68 | 0.059 | 0.62 | 0.71 | 152.08 vs 150.64 s |
| Song 2, same notation, new seed | 0.65 | 0.048 | 0.61 | 0.67 | 152.68 s |

Repeating the identical settings was sample-identical on both songs, so these differences
do not come from noise in the run.

## What it says

For audio, the tutorial's sentence is false on two of two songs: the edit behaved like a
new seed. The authors say the mechanism outright. Their paper, section 2.5, has a revised
score "supplied as a fixed prefix" from which the model "regenerates the downstream
semantic tokens and acoustic latents to produce a new full-song performance". That also
explains the bars before the edit: the score precedes all audio tokens, so an edit late in
the score still changes the first audio token onward.

## What it does not settle

- **Whether the notes survive.** Section 5.2 of the paper opens "Although YuE2 regenerates
  the entire song after a score edit, the requested change can be local", and reports
  90.16% to 94.34% agreement with unedited melody and harmony across local edits, on 192
  prompts and two seeds per condition. Locally, note distance after the edit was close to a
  new seed on song 2 and twice a new seed on song 1. A time shift inflates this metric and
  song 1's length moved by 1.24 s, so the local figure may overstate the change. The two
  results do not contradict each other, and neither was resolved here.
- **Which take is better.** These distances say two files differ. No person has listened
  to these pairs, so the verdict is `unmeasurable`. The instrument that would decide it is
  a blind listening pair on a same-seed edit against its control.
- **Other models.** This is one model at n=2 songs. A renderer that keeps audio by
  reference or addresses sections is a different case.

The technique's "When not to use this" clause says to edit a symbolic source and re-render
the whole because the render is disposable. This run did not change that clause: whether
it should exclude an approved performance is a scope decision, recorded as a proposal in
the source note.
