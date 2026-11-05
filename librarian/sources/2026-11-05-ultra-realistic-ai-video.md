---
source: https://www.youtube.com/watch?v=RJKZCbeqIjc
kind: youtube
url: https://www.youtube.com/watch?v=RJKZCbeqIjc
title: "Master Ultra Realistic AI Video in 10 minutes"
author: "Mira AI"
words: 1880
extracted: 11
accepted: 0
declined: 1
leads: 3
already_covered: 8
untriaged: 0
currency: 0
dispatched: 0
applied: 0
shipped: 0
run_id: intake-RJKZCbeqIjc
siblings: 0
---

Class: second-hand practitioner review with a first-party half. It is a sponsored aggregator walkthrough (affiliate link, every generation inside one hosted app), but the creator did make the clip they show. Expected yield: catches, maybe one currency signal and one lead. That held: 8 catches, 3 leads, 1 decline after a blind render verdict, nothing landed. This is the second run on this channel (see 2026-10-25-blockout-to-video-real-estate). Both were tutorials where the corpus already covered the workflow and the one mechanism tested did not survive the render proof.

0 siblings live. Fetch budget: 3 of 3 spent through one fetch worker on the vendor's own pages for the video model's reference limits and draft tier. The vendor tutorial page body did not extract, so every figure stays a relay.

Declared focus from the scorecard: **test: render proof**. It applies to this source, which is render-bound, and it ran (Phase 6b, local).

## Candidates

| # | Claim | Anchor | Read | Rule | G/R/C | Outcome |
|---|---|---|---|---|---|---|
| 1 | Generated skin comes out too pale and too shiny. Warm it and cut the shine locally without touching texture, on top of grain and softened blacks | 08:13 | partial: default-look-attractor step 6 already says to finish outside the model with one grade and one grain pass, and its attractor list names "glossy skin". A skin-local correction is the part the corpus does not state | Phase 5 (amendment) | 1/2/1 | **declined** (operator blind verdict: tie on both finishing pairs, so not-better; the premise also failed on this stack) |
| 2 | Describe what a real camera would capture ("low sun from the left, long soft shadows") instead of "cinematic" or "golden hour" | 05:13 | likely catch | - | - | already covered (default-look-attractor step 2; lighting-as-dramatic-instrument). Rendered as example 3 |
| 3 | Make a reference sheet for every element, down to props, not only the character | 03:04 | likely catch | - | - | already covered (reference-shows-only-invariants; approved-reference-sheet; multi-view-master-reference) |
| 4 | Video realism is capped by the keyframe stills; spend the time on stills | 04:47 | likely catch | - | - | already covered (generated-shot-sourcing: image-anchored conditioning) |
| 5 | Prompt imperfections (pores, freckles, an uneven face) for a real-looking person | 03:31 | likely catch | - | - | already covered (default-look-attractor step 2 "capture register with its imperfections"; genre-visual-contracts imperfection budget). Rendered as example 2 |
| 6 | Give an LLM a short creative brief and ask for five concepts with hooks | 01:48 | likely catch | - | - | already covered (ad-concept-development) |
| 7 | Preview at a cheap draft tier, then promote the same generation to delivery resolution | 06:30, 07:45 | likely catch | - | - | already covered (resolution-as-stage-property: draft ladder, "does a draft's verdict survive promotion") |
| 8 | Timeline prompting: say what happens at each second of a multi-shot clip | 06:56 | likely catch | - | - | already covered (process--generated-shot-sourcing application: per-second timestamp control) |
| 9 | Finish with grain and softened blacks so the clip is "indistinguishable from a real video" | 00:32, 08:13 | likely catch | - | - | already covered. The finish is default-look-attractor step 6. The stated motive meets footage-claims-a-camera, whose discriminator (produced vs captured register) holds: this piece is a produced register (symmetrical top-down, golden hour), so it claims a photographer, not a witness |
| 10 | The video model takes up to 50 references; a 480p draft tier can be upgraded in place to 1080p | 03:04, 06:30 | n/a | corroboration table (currency) | - | **lead**: a fourth relay on the 50-reference figure (the application already records 30/10/10 vs 50 as unreconciled) and a new relay on the draft tier. The vendor page did not extract. Not written into the application, since no citation was re-resolved |
| 11 | An automated "AI film crew" can prompt and review every shot before it is generated | 09:29 | thin | corroboration table (lead) | - | **lead**: the source only advertises another video. Return when that video is mined |

Admission: auto=0/1/0 (row 1 scored 1/2/1 and cannot clear +2; the render proof was run anyway because the declared focus and the media rule both ask for it). fp=0.

## Render proof (Phase 6b, local, operator-triaged)

Stack: Flux2-dev fp8 in local ComfyUI, 1024 square, 24 steps, euler, guidance 4, seeds 101 and 202. Finishing passes in numpy on the generated plates. The predictions were written before any render existed.

Prompt arms: P0 = the source's register words ("ultra realistic cinematic photo, golden hour lighting ... realistic, cinematic, beautiful"); P1 = the light described physically (low sun from frame left, nose shadow across the right cheek, focus, lens); P2 = P1 plus matte, uneven skin, pores, freckles and a blemish.

Finishing arms on one plate: A = one global warm grade + grain (corpus default-look-attractor step 6); B = A + skin-qualified warmth and highlight soft-knee (the source's skin tip, one variable); C = B + lifted blacks (the source's full recipe, shown, not scored).

| plate | RAW skin >0.90 | A skin >0.85 | B skin >0.85 | A warmth R-B | B warmth | A texture | B texture | face L/R |
|---|---|---|---|---|---|---|---|---|
| P0 s101 | 0.55% | 2.67% | 0.65% | .304 | .337 | 5.54 | 5.38 | 0.84 |
| P0 s202 | 0.13% | 0.57% | 0.13% | .334 | .363 | 5.17 | 5.14 | 1.01 |
| P1 s101 | 0.00% | 0.02% | 0.01% | .310 | .335 | 5.59 | 5.58 | 1.07 |
| P1 s202 | 0.00% | 0.01% | 0.00% | .272 | .297 | 4.03 | 4.05 | 1.19 |
| P2 s101 | 0.00% | 0.08% | 0.01% | .362 | .398 | 7.42 | 7.35 | 1.12 |
| P2 s202 | 0.01% | 0.25% | 0.01% | .320 | .353 | 7.16 | 7.00 | 1.50 |

Texture is the Laplacian variance x1e4 inside the skin mask, measured before grain. Lifting the blacks (C) lowers it by about 9%, which is the (1 - toe)^2 scaling and not lost detail.

- **Premise (declared): failed.** Raw P1 skin above 0.90 luma was 0.00% on both seeds, against a 1% bar. On this stack generated skin is not shiny once the light is described physically. The shine appears only under the register words (P0), and P0's share above 0.85 is partly sunlit background that the mask caught. So the gloss the source fixes in post travels with the prompt's register, which is the corpus's own attractor list, rather than with the model.
- **Target:** B cut the shine that was there (P0 s101: 2.67% to 0.65% above 0.85) and warmed the skin on every plate. **Floor held:** B's texture stayed within 3% of A.
- **Boundary the source omits:** a hue-box skin qualifier also selects the golden-hour meadow (mask on P0 s101 covers about 42% of the frame), and that is exactly the scene the source recommends. A skin-local pass needs a face matte, not a hue key, in warm light.
- **Falsifier (P2):** imperfection words gave the highest skin texture (7.4/7.1 vs 5.5/4.0 for P1) and near-zero shine without any post. In-model prompting already does what row 1 asks of the grade.
- **Example 3 (catch check):** the countable expectation (face frame-left/frame-right luma ratio above 1.3 for P1 on both seeds) **failed** (1.07 / 1.19). The ratio is weak because the mask leaks into the background. The director's pre-read is that P1 does read as harder, directional light with grass-shadow stripes, but that is opinion.
- **Scenario legibility:** on 0 of 6 frames was the butterfly on the nose tip with the eyes crossed. The action half of the brief is outside what this stack composes at 1024 square. The skin question does not depend on it.

Blind sheet: 4 pairs (g1, g2 finishing; s1 imperfection words; l1 light wording), discrimination recorded per pair in the run's manifest. The finishing pairs differ by 1.4 and 1.3 /255 mean absolute pixel difference over a deterministic 0 floor. **Operator verdict (2026-11-05, blind, revealed by render-triage):** g1 tie, g2 tie (skin-local pass not visibly better than the global grade alone: `not-better` for row 1); s1 tie (imperfection words not visibly more real); l1 picked the physical-light arm over the register-word arm. That is a blind confirmation at n=1 seed of default-look-attractor step 2, a claim the corpus already makes: verdict `better`, mode `render`, recorded as a catch with evidence, not a landing.

## Leads (return conditions)

- Register words carry the gloss (render-originated): on one model at n=2, skin shine tracked the prompt's register words and disappeared with physical light description. The operator saw no difference in the finishing pairs, so the sheen may not matter visually at this level. Still, this bears on default-look-attractor's failure mode "inverting in the prompt what the grade should fix", which holds for colour cast and grain but may not hold for skin sheen. Return when a second local model (LTX still frame or H3 first frame) shows the same split.
- Video model reference limit and draft tier (row 10): return when the vendor's own page is read in a browser; then reconcile the application's 30/10/10 vs 50 line and move its verified_on.
- Automated shot-review crew (row 11): return when the creator's follow-up video is mined.

Decline (row 1, operator-verified): a skin-local warmth and shine pass on top of the global grade. Reason: blind tie on two plates, and the shine it fixes was absent once the light was described physically. Reconsider only with a face-matte qualifier on a plate that actually shows sheen.

Operator note after the reveal (2026-11-05): "physical light improved the realism on photos". It confirms the l1 pick beyond the one blind pair. It is still a catch: default-look-attractor step 2 already says this.

Cleanup (2026-11-05, after operator sign-off): render-triage clean removed 17 paths (35.2 MB) incl. ComfyUI output/intake-RJKZCbeqIjc; the run scratch folder (~44.5 MB incl. review page) and the ingest temp files were deleted by run id. Scratch `intake-RJKZCbeqIjc/` and ComfyUI `output/intake-RJKZCbeqIjc/` (6 PNGs) are to be deleted by run id after sign-off.
