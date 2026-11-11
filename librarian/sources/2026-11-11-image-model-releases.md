---
source: batch
kind: batch
url: "https://bfl.ai/blog/flux-3-image-klein, https://www.pangram.com/blog/introducing-pangram-image-1-0, https://www.testingcatalog.com/openai-launches-images-2-6-with-gifs-and-image-reference/"
title: "Image model releases, /shift batch of 3 web articles"
author: "3 voices: Black Forest Labs (vendor post and API reference), Pangram (vendor post), TestingCatalog (AI-drafted news relay of OpenAI)"
words: "1140 for the Pangram post (research-ingest); the other two were not counted"
extracted: 27
accepted: 0
declined: 0
leads: 9
already_covered: 6
untriaged: 4
currency: 4
dispatched: 0
applied: 0
shipped: 0
run_id: shift-image-model-releases
siblings: 1
fetches: 14
---

# Image model releases, mined under /shift, 2026-11-10 and 2026-11-11

Plan `plan-web-20261110`, cluster `image-model-releases`, board run `shift-image-model-releases`.
The question: which image engine serves Gravitone's stills and boards, now that Codex image_gen is
the main engine and Flux 2 is removed fleet-wide (operator, 2026-11-08)? Three web articles, one
miner each, one lander. No GPU, no download, no image generated, no sign-up. Phase 7.7: gate=skipped.
Currency and leads ran under the corroboration table. Only rows that could reach an upper layer
carry a score.

**Expected yield, stated first:** currency, leads and catches. The vendor-fact ledger already held a
Klein row (11-06) and a GPT Image 2.6 row (11-08). That held: four currency clauses extend those two
rows, and nothing reaches an upper layer.

**Voices:** three, with no relay between them. They converge on nothing that lands. Two of them
(the BFL post and OpenAI's guide) speak to edit locality, and they point in opposite directions
(below).

## Answer to the theme

- **Main engine, Codex image_gen: no change it can address.** OpenAI's 2.6 features (complexity,
  markup edits, SVG, animated GIF) are documented "through the Image API". The installed codex-cli
  0.166.0 `image_gen` tool takes four arguments: a prompt, a transparent-background flag, local
  reference image paths, and a count of recent images. The lander re-read that list from the binary.
  What could reach Gravitone is a model swap behind the hosted tool. The relay says 2.6 is "rolling
  out globally in ChatGPT and Codex", but the primary returned 403 to the miner, and nothing on the
  client names the model.
- **Local backup: no change.** P-H3-Image stays the candidate. Flux 3 Klein is a possible later
  backup only if that proof fails and the operator lifts the Flux rule for Flux 3 by name. Nothing
  was downloaded, and nothing is proposed for a run.
- **Pangram Image 1.0 is a detector, not a generator.** It changes neither seat.

## What landed

Currency, in `generative-provider-routing/applications/process--vendor-fact-ledger.md`. The two
existing rows were extended in place and `verified_on` does not move:

- **Klein row:** 5.6B, as the vendor counts it (generator only, text encoders excluded; the 11-06
  repack page read 5.5B). The hosted route: request, async polling, cost in credits, the post's
  "starts at $0.009 per 1K image" and the API reference's silence on price. The upsampler always
  runs beside a seed documented "for reproducibility". Steps, references, pixel cap. The bounding-box
  control is JSON inside `prompt`, with no typed region field. "Pixel restoration" has no request
  parameter. The latency table timed the arms at different boundaries.
- **GPT Image 2.6 row:** the `complexity` drift caveat with its `high` default, the mask's
  "may not follow its exact shape" disclaimer, the markup layer's limits, and the Codex tool's
  four-argument surface.

The lander re-read every quoted clause in raw page text on 2026-11-11, one fetch per page. The
miners had read through a summarising reader. All quotes held to the word, and "$0.009 per 1K image"
is the post's own wording, with the unit left as the post leaves it.

## Triage

| # | Row | Source | Outcome | G/R/C | Rule |
|---|---|---|---|---|---|
| B1 | Klein is also a hosted API route | BFL API ref | **currency, landed** | - | corroboration |
| B2 | 5.6B, generator only | BFL post | **currency, landed** | - | corroboration |
| B3 | Upsampler always on, seed "for reproducibility" | BFL API ref | lead, `reconsider?` K3 of 11-06 | 3/2/1 | Phase 5 |
| B4 | "Preserves unedited regions exactly" | BFL post | lead, joins K2 of 11-06 | 1/2/1 | Phase 5 |
| B5 | Region control is JSON inside the prompt | BFL API ref | lead, `input-channel-parity` channel enumeration | 1/2/1 | Phase 5 |
| B6 | Latency arms timed at different boundaries | BFL post footnote | untriaged | 1/2/1 | Phase 5 |
| B7 | INT8 at 8 GB, vendor hardware chart | BFL post | lead, operator only | - | corroboration |
| B8 | Licence and self-hosted tiers | BFL post, open-weights page | catch (ledger holds the revenue split) | - | - |
| B9 | Elo over prior models | BFL post | nothing (internal evaluations) | - | - |
| B10 | References, tiers, steps, price | BFL API ref, post | **currency, landed** (with B1) | - | corroboration |
| P1 | Product is a detector | Pangram post | theme answer, no change | - | - |
| P2 | A pixel classifier's positive weighs only at its false-positive rate | Pangram post | untriaged | 1/4/1 | Phase 5 |
| P3 | Our stills will be flagged whatever their metadata | inference | catch, `provenance-signal-asymmetry` § "Your own output" | - | - |
| P4 | Synthetic-mirror eval holds content constant | Pangram post | untriaged | 1/2/1 | Phase 5 |
| P5 | "99.96% accuracy" over 100 real and 1,200 generated | Pangram post | catch (see below) | - | - |
| P6 | Input floor 512 to 256 px | Pangram post | lead, dated fact | - | corroboration |
| P7 | $0.25 per image, $0.05 Flash, $0.05 per video second | Pangram API page | lead, dated fact (no ledger covers detectors) | - | corroboration |
| P8 | State of the art, DF26 98.7% | Pangram post | nothing | - | - |
| O1 | Sunburst, Flare, complexity, SVG, markup | relay, OpenAI guide | catch (ledger 2.6 row) | - | - |
| O2 | Higher complexity "can ... introduce unwanted changes" | OpenAI guide | **currency, landed** | - | corroboration |
| O3 | A hosted agent's image tool is narrower than the model's API | codex binary, guide | untriaged | 2/0/1 | Phase 5 |
| O4 | The receipt label cannot say which model drew a still | gravitone, read only | catch, `model-identity`; gravitone proposal | - | - |
| O5 | Mask "may not follow its exact shape" | OpenAI guide | lead, a dissenting voice on K2 | 1/2/1 | Phase 5 |
| O6 | "50% faster" | relay only | nothing measurable on this route | - | - |
| O7 | Animated GIF storyboards | relay | lead, operator only (would be a direction) | - | - |
| O8 | Saved image references | relay | catch (the Codex route already takes reference stills) | - | - |
| O9 | Gravitone's other OpenAI route pins 2.5 Flare | gravitone, read only | lead | - | corroboration |

`auto=0/7/0 fp=0` on the seven scored rows. None reaches +3 and none is escalated. The lander's
re-read changed no score.

**P5 is the miner's arithmetic, not the vendor's figure.** The post states "99.96% accuracy" and
names no metric. Plain accuracy cannot reach it over 1,300 or 1,200 items. Balanced accuracy, with
every real photo right and one generated image missed, gives 99.958%. If that reading holds, the
real arm is 100 photos, and zero false positives in 100 bounds the rate only below about 3%. The
vendor's API page carries a headline "1 in 10,000 False positive rate" beside "20+ Languages", which
reads as the text detector's figure. No image false-positive rate or threshold is published. Image
and video request shapes are absent from the public API page.

## Leads, with return conditions

- **B3 (K3 of 11-06, reconsidered).** BFL is a second host that always rewrites the prompt, but its
  seed claim points the other way from Krea's ("for reproducibility" against "does not guarantee
  identical results"). It does not converge with K3, which stays a lead. Return: one repeat probe on
  a host with forced rewriting. A hosted Flux route is off limits, so this stays banked.
- **B4 and O5 (K2 of 11-06).** Three vendors on edit locality, all prose: Krea 3 and BFL say the rest
  stays exact, and OpenAI says a mask may miss its shape. Return: the rewritten held row below.
- **B5.** A structured control carried inside the prompt string is prose-channel delivery with a
  typed look. Return: a second vendor documents the same shape, or a parity trial hits it.
- **B7, operator only.** Return: P-H3-Image fails its proof **and** the operator lifts the Flux rule
  for Flux 3 by name. The facts to weigh then: the US$5M revenue split, the 8 GB INT8 build, the
  vendor's DGX Spark row, and no evidence of a Windows ARM64 run.
- **P6, P7.** Return: a fleet project evaluates a detector.
- **O7, operator only.** Return: the Codex tool gains an output-format argument, or the operator
  opens an Image API route. Board-to-animatic would be a new capability, so it is a direction.
- **O9.** Return: a dated read of the integrator's model list showing 2.6 Flare. That route stays
  prefer-only by the operator's rule.

## Untriaged

- B6 - latency arms timed at different boundaries - BFL post latency footnote. 1/2/1.
- P2 - a pixel classifier's positive carries a false-positive rate a producer's mark does not -
  Pangram post "Robustness", and no image false-positive rate published. 1/4/1: it would rewrite the
  "Detected" row of `provenance-signal-asymmetry`, so it stays the operator's call even when
  corroborated.
- P4 - synthetic-mirror evaluation holds content constant across real and generated pairs - Pangram
  post "Frontier Image Detection". Run a concept-level map before homing it.
- O3 - enumerate a hosted surface's own arguments before routing a model feature to it - the codex
  binary's `ImagegenArgs`, and the 11-08 ledger row seen from the docs side. 2/0/1. Return: a second
  vendor's agent shows the same split.

## Held row rewritten

`shift-currency-edit-1` was built on Flux 2. It was refused on its floor 2026-11-07, and Flux 2 was
removed 2026-11-08, so it could not run. It is rewritten in place onto the main engine, with
`device: cpu` and a new run id, `shift-currency-edit-2-codex`:

- **Route.** A prose-region edit through reference images. It calls gravitone's low-level Codex draw
  directly, because the provider declares no reference support and the scout draw refuses one.
  Markup and mask are not on the Codex route.
- **Positive control first.** An identity edit ("return this image unchanged"). If Codex does not
  return the input's pixel size, the row closes unmeasurable, because resampling changes every
  pixel by itself. Otherwise that difference is the route's floor.
- **Pairs.** A colour edit and a label edit. Arm a is the edit as returned. Arm b composites the
  original pixels back outside the region. The operator's blind pick decides, with a per-character
  proofread.
- **`render.use`.** The row had none, so one is named: whether gravitone's still-fix path owns a
  composite-back step.

## Proposals

- **Gravitone, read only here, not edited.**
  - Record the Codex CLI version beside the fixed `codex-image-gen` label on each Codex image receipt.
    Otherwise a still drawn before and after a hosted model swap cannot be told apart. This is the
    `model-identity` rule at a real seam. The receipt should still say it does not name the server
    model.
  - The Codex provider declares `supportsReferences: false`, while its low-level draw attaches up to
    three reference stills. The router cannot send what the draw can. Which one is intended was not
    judged.
- **Operator FYI.** Nothing changes for Codex image_gen as main, or for P-H3-Image as the backup
  candidate. Do not run our stills through the detector: no seam would use the result.

## Fetches and what was not verified

Miners spent 9, all through a summarising reader, and one returned 403 (OpenAI's announcement). The
lander made 5 raw reads, one each: the BFL post and API reference, OpenAI's image-generation guide,
and the Pangram post and API page. The lander also re-read the Codex binary's strings and gravitone's
Codex modules, read only. Not verified: OpenAI's announcement (403), so the Codex rollout, "50%
faster" and the weekly-volume figure rest on the relay alone; whether a Codex CLI after 0.166.0 adds
tool arguments; Pangram's chart values and the 12 generators it names; BFL's open-weights tier page.
