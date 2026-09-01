---
source: reallusion-ai-studio
kind: web
url: https://ai.reallusion.com/ai-studio/
title: "3D-Guided AI Image & Video Gen | Reallusion AI Studio"
author: Reallusion (vendor)
class: vendor release announcement (product landing page, v1.1)
words: 1263
extracted: 7
accepted: 1
declined: 0
leads: 0
already_covered: 5
untriaged: 3
dispatched: 0
applied: 1
shipped: 0
run_id: reallusion-aistudio
siblings: 3
---

# Reallusion AI Studio (vendor landing page, 2026-09-01)

Operator asked for broader web research alongside the page, on the premise
that this product breaks through work we are trying to reach in the
game-development domain. **The premise is right and the conclusion is the
opposite of the obvious one: the corpus already holds almost all of it,
including the parts the vendor page presents as its differentiators.** Five
of seven candidates resolved to already-covered against techniques that
state the same rules with more care — including the one this run first wrote
up as a verified hole. Both rows the operator picked as real gaps fell.

Three siblings live at claim (`intake-6ytluv` on
`game-production/asset-production/regeneration-vs-repair-economics` and
`content-pipeline/generative-artifact-gating`; `intake-echx` on
`production-governance/generative-provider-auditing`;
`intake-yt-lnlmxsuqggc` on `llm-observability/quality-scoring/…`). None held
a media-generation subject, so no `content` lock was ever contended. The
artifact churn in `catalog.json` and `knowledge/game-production/index.json`
at commit time was entirely `intake-6ytluv`'s uncommitted work; both were
left uncommitted rather than baked into this run's `HEAD`.

**Class calibration.** A vendor release announcement is reliable for its
numbers and nothing else; expected yield was stated at 1–3 candidates before
the triage table, mostly currency and leads. Actual: one golden-path scope
clause, zero leads, five catches, three untriaged. That is the class behaving
exactly as documented — and the run's most useful product is a method lesson
about how an absence gets verified, not anything the source said (candidate 5).

## What the fetch budget bought

Two searches and one successful fetch (three attempts; the arXiv PDF exceeded
the fetch size limit and the CVPR mirror returned 403 — the `/abs/` page
carried what was needed). Spent entirely on locating the *general* technique
class behind the vendor's framing:

- [GEN3C](https://arxiv.org/abs/2503.03751) (CVPR 2025) — geometry-proxy
  conditioning, with the load-bearing sentence: the model "neither has to
  remember what it previously generated nor does it have to infer the image
  structure from the camera pose", so it "can focus all its generative power
  on previously unobserved regions". The capacity-reallocation argument, not
  merely a control argument.
- [3DScenePrompt](https://arxiv.org/pdf/2510.14945), SpatialCrafter,
  SymphoMotion — the same family; static-geometry memory projected to
  arbitrary viewpoints as conditioning.
- [CharacterGen](https://www.researchgate.net/publication/382417025_CharacterGen_Efficient_3D_Character_Generation_from_Single_Images_with_Multi-View_Pose_Canonicalization)
  and the multi-view identity literature — the field's answer to a
  state-laden reference is **canonicalization** into a re-renderable A-pose
  artifact.

## Candidates

### 1 — Described-effects is a property of the channel, not the model — ACCEPTED, radically downsized

Picked as a technique-sized real gap; **landed as a single scope clause on
the `cinematic-language` golden path.**

`cinematic-language` opens with two governing facts, the second of which is
"models read described effects, not equipment or numbers… never focal
lengths", stated flat. The vendor's whole pitch ("From prompt guessing to
camera control") is that this is false where a 3D channel exists, and GEN3C
gives the mechanism.

**But `movement-motivation`, one level below that golden path, already owns
this completely** — a full section titled "When the camera is an input, the
prose stops describing it", carrying the discriminator ("Does anything other
than the prose set the camera?"), the compromise symptom, the misdiagnosis as
under-direction, and the narrow silence (first-frame viewpoint kept, meaning
moved upstream, off-screen material kept). And the bundle law
`typed-input-owns-its-channel` states the general rule above both.

So the finding is not the rule; it is a **navigational defect**. The golden
path's opening is where a reader decides whether the subject addresses their
pipeline, and it asserts unqualified what its own technique inverts. Someone
building a 3D-guided pipeline could read the opening and correctly conclude
the subject is for text-conditioned work — skipping the one technique they
most need. One clause fixes it and points at `movement-motivation`. Landed at
that size and reported at that size.

*Worth recording as a pattern inversion:* this corpus's documented failure
mode is that "golden paths routinely hedge better than their techniques do".
Here it ran the other way — the technique hedged and the golden path did not.

### 2 — Mint the identity reference rather than choosing it — ALREADY COVERED

Picked as a missing stage-zero: `character-identity-continuity` reasons from
"an image cannot be scrubbed, only composed", which is true of a captured
photograph and false of a reference rendered from a parametric source. The
vendor productizes exactly the second (AI Actor Creator; multi-angle sheets
from a 3D character or a few reference images).

`reference-shows-only-invariants` **already assumes minting, not choosing** —
"the next person re-mints the reference", "Mint the variants as one batch
from one sitting, the way any set of references that must agree with each
other is minted" — and already enumerates every render-time decision the
proposed technique would have carried: expression at rest, a stated gaze, a
canonical three-quarter head angle, even light, a mid-tone (not white) field,
invariant wardrobe only. It also holds the coupling probe and the loose /
partial / hard-coupled trichotomy, which is strictly more than the source has.

The residue is a footnote and was not landed: the technique's "size the
variant vocabulary rather than maximize it" argument is priced against a
photographic *sitting*, where each variant has a real marginal cost. From a
re-renderable source that cost approaches zero — and the conclusion survives
anyway, on the inheritance risk the technique already states, so the
recommendation does not move.

### 3 — Synthesized views: inadmissible as evidence, admissible as anchor — ALREADY COVERED, and my framing was wrong

Proposed as a cross-bundle discriminator: game-production's
`multi-view-master-reference` forbids synthesized views ("elaborated guesses
derived from the master, not evidence… never gate a synthesised view as if it
were an independent observation") because reconstruction measures a real
subject; media-generation should invert it, because an identity anchor has no
ground truth to be wrong about.

**The inversion is not clean and the corpus already has the correct version.**
`reference-shows-only-invariants` says a variant "minted *from* the neutral
reference inherits whatever that reference got wrong, silently and
everywhere" — the same inheritance rule, in the right vocabulary for this
side, without overclaiming that the absence of ground truth makes the
derivation free. My proposed discriminator would have licensed exactly what
that sentence warns about. Recorded as a catch, not written.

### 4 — Multi-actor identity binding by trigger name — ALREADY COVERED

"Control multiple actors using trigger names in prompts" plus a face-match
assignment step. `image-prompt-composition/reference-role-map` owns this
whole and better: every attachment gets one named role declared in a map,
each controls one thing and nothing else, subjects named by map label
throughout the beats, so the marginal reference adds one map line rather than
one more ambiguity.

### 5 — ALREADY COVERED, after a bad absence check that nearly became a lead

This was written up as the run's one verified hole — "nobody in the corpus is
addressed to the author of the typed input" — on the strength of an uncapped
grep. **It was wrong, and the way it was wrong is the most useful thing this
run produced.**

The premise was sound: `typed-input-owns-its-channel` says the craft "does not
evaporate; **it moves upstream, to whoever authors the typed input**", and
`movement-motivation` adds that this person "needs the same grammar". Both
name a destination. The claim was that nothing occupies it.

`scene-grammar-progression` occupies it, as a three-member **schematic
family**, under the general rule *"when the claim is spatial, annotate the
image instead of describing it — because the drawing and the space share a
coordinate system and the prose does not"*:

- **Positions** — the location plate with positions marked and sizes stated
  as ratios to a person, attached on every take.
- **Routes** — a path drawn directly on the image, followed literally.
- **Camera pose, the blocking frame** — "a neutral stand-in scene (a plain
  room, a mannequin figure, staged in any simple 3D viewer)… walk the camera
  to the spot, export the frame, and attach it with its role scoped hard —
  *camera reference only: match this angle, height and lens feel; ignore the
  placeholder's content entirely*."

That third member is the vendor's entire "3D previs to AI cinematography"
pitch, landed on 2026-08-27 (run 26), and it carries an operating detail the
vendor page does not: **the scope line is load-bearing**, because it is what
keeps the stand-in's emptiness from leaking into the shot.

**Why the absence check failed, and it is not "I searched too narrowly".** The
queries were `previsualization`, `blocking pass`, `proxy render`, `depth map`
— all of them *vendor and pipeline* vocabulary. This corpus names things in
craft terms and strips product language by gate, so those words cannot appear
even where the concept is fully owned. The result was a genuine zero that
measured the purity gate rather than the corpus — the same failure the method
already documents for banned proper nouns, arriving through a door it does not
yet name: **industry jargon is as invisible here as a product name, and a
source's own vocabulary is the worst possible query for an absence.** The
catch came from reading the subject's `librarian/` note, not from any grep.

What remains is thin and already banked: every member of the schematic family
is a **still, 2D-attachable artifact**, while the vendor's and GEN3C's regime
is a *time-varying* proxy render — a guidance frame per frame rather than one
attached frame. Run 24 already banked that as this subject's open lead
("Return when a connected project drives a generator with a camera path
rather than prose"). This run adds a second sighting, the mechanism from
GEN3C (the proxy reallocates model capacity — it "neither has to remember what
it previously generated nor infer the image structure from the camera pose"),
and a concrete trigger: gravity's `FrameClip.motion` is "authored here,
rendered nowhere", so the day it gains an executor, that lead's return
condition is met by a tree we own.

## Untriaged (extracted, reached the table, nobody verified them)

Recorded with anchors so a later run does not re-derive them. **Nobody looked
at these — they are not declines.**

| # | Candidate | Anchor | Note |
| --- | --- | --- | --- |
| 4 | Reference-slot budget spans modalities; clip-length ceiling moved | "Seedance supports up to 10 reference inputs… including images, videos, and voices"; "30-second, cinematic video" | Currency against `image-prompt-composition/prompt-budget-limits` and `reference-role-map`. Vendor's own numbers about one product's model roster |
| 6 | Upscale as a terminal, non-generative stage | "Generating high-resolution AI media often involves higher costs, longer processing times, and multiple iterations… upscale from 720p or 1080p to 4K at a fraction of the cost" | Read as likely-covered by `cost-per-usable-output` and `generative-provider-routing`; not checked |
| 7 | Per-channel authority in a hybrid authored/generated pipeline | "Use AI-driven full-body animation **or keep your original 3D motion intact**" | The general shape — motion, camera, identity and voice each independently delegable or retained — may be a real technique. One source, no corroboration attempted |

## Applied

One row, `simulation` / `unmeasurable`, against **gravity** — see
`librarian/applied.md` and
`media-generation/visual-generation/cinematic-language/applications/react--movement-motivation.md`.

The structural fact is the artifact worth keeping: gravity's `SceneSpec`
answers the law's discriminating question **twice, oppositely, inside one
type**. `elements` carry position as numbers clamped 0–100 because the
project's own vector layer executes them; `motion` in the same struct is a
free string because — in the tree's own words — it is "authored here,
rendered nowhere". Nobody designed that as a demonstration of
`typed-input-owns-its-channel`; it fell out of which half had a renderer.

Ship 0, **`declined: no change warranted`**. The clause confirms gravity's
current design rather than asking it to change, and the boundary half is
unexercisable there until the motion channel gains an executor. Both gravity
and pof were authorized; neither needed a commit.
