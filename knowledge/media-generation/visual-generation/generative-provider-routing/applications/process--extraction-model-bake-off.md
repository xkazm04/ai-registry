---
layer: application
type: application
subject: generative-provider-routing
technique: extraction-model-bake-off
status: forged
stack: process
verified_on: 2026-08-25
refresh_by: 2026-11-25
---

# The local tier wins an extraction capability — frame annotation, August 2026

The extraction-model-bake-off technique says to score candidates against a
truth set you own, keep agreement in its own column, and treat determinism as
a first-class axis. This application is the run that produced those rules.

**The job.** Annotate film frames with cinematographic structure — shot size,
camera angle, lens register, depth of field, lighting key/direction/quality,
contrast, the three depth layers, objects, genre register — to build a craft
corpus at scale. The routing question: does that require a metered API, or
does it run on one consumer GPU?

**The rig.** RTX 4090 (24 GB), 63 GB RAM, Windows 11. Ollama **0.32.15** —
0.32.5 refused the two newest model manifests outright with HTTP 412 and a
"requires a newer version" message, so the runtime upgrade was a precondition,
not a nicety. Every candidate was constrained to one identical JSON schema
(Ollama `format`, Gemini `responseSchema`) carrying the controlled
vocabularies from the cinematic-language subject, and one identical prompt.
Two frames — one generated locally for the cinematic-language trials (so its
brief is known) and one cut from a stylised 3D-animated series — three repeats
each at temperature 0.

## Measured

| model | tier | truth | self-consistency | structural faults | s/frame | VRAM |
|---|---|---|---|---|---|---|
| **qwen3.8:27b** | local | **94%** | **100%** | 3 | **7.0** | 22.3 GB |
| gemma4:12b | local | 81% | 100% | 0 | 13.5 | 9.8 GB |
| gemini-3.7-flash | API | 81% | 82% | 0 | 7.4 | — |
| muse-glimmer:30b | local | 75% | 95% | 0 | 7.2 | 18.3 GB |
| ornith-1.5:9b | local | 31% | 100% | 15 | 8.2 | 10.6 GB |
| gemma4:31b (ollama.com) | hosted | 0% | — | total | 5.4 | — |

**The local winner beat the API yardstick on accuracy, reproducibility and
speed at once.** Its only graded miss was one adjacent step on the shot-size
ladder — the same miss the API model made, on the one field a human hesitates
over too. A bulk annotation corpus is therefore local GPU work; the metered
tier has no remaining argument for this capability.

## The four findings that became rules

1. **The yardstick scored 81%, not 100%.** Ranking by agreement with it would
   have scored the eventual winner *down* for being right where the reference
   was wrong. It also reported a "diffuse overcast sky" as a light source in a
   night scene containing no sky.
2. **The API model drifted at temperature 0; the local models did not.** Over
   three identical calls it flipped `camera_angle` (eye-level → low-angle),
   `lens_impression` (wide-angle → normal), `lighting_quality` and `texture` —
   82% stable. Three of the four local candidates were 100% stable. For corpus
   labelling this inverts the ranking: a systematic bias is subtracted once,
   run-to-run noise never is.
3. **Structured output is a tier property.** Local Ollama honoured the schema
   exactly. The *same family* on ollama.com ignored `format` entirely and
   returned a fenced markdown block with an invented nested shape — a total
   structural failure at 0%, not a quality difference. `qwen3.5:397b` on the
   hosted tier returned 403 for this account.
4. **Small does not mean unusable, and large does not mean free.** The 7.6 GB
   model tied the API on truth at 9.8 GB resident, leaving headroom to annotate
   *while* the GPU generates. The 94% winner occupies 22.3 GB of 24 and owns
   the card alone. That is a real scheduling constraint, not a footnote.

## Calibration — what this run does not establish

The truth set is **two frames and 3–5 graded fields each**. That is enough to
separate 94% from 31% and to expose the determinism gap, and it is *not* enough
to call a 6-point gap between neighbours. Fields left ungraded on purpose
(shot size and camera angle on the stylised frame, texture on both) are the
ones where careful humans disagree; they are routed to adjudication, and each
ruling becomes truth for later runs. The genre-register vocabulary is written
for live action and scattered on animation — expected, and a known edge.

Two further limits are structural rather than statistical. A still cannot
report camera *movement*, so the schema does not ask; movement needs a clip or
a frame pair. And fixed-interval frame sampling is cut-blind — it will sample
one locked-off shot repeatedly and miss an insert entirely, so a shot-boundary
detector is what a corpus actually wants.

## Where the harness lives

`gravitone-gcloud/pipeline/vlm-probe/` — `extract_frames.py` → `probe.py` →
`score.py`, Python, stdlib only. Frames and result rows are gitignored: the
frames are third-party content held locally for evaluation, the rows are
regenerable evidence, and the finding is what gets committed — here, not there.
