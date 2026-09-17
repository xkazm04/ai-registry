---
source: youtube:2CQwma8ZKNQ
kind: first-party practitioner build-walkthrough (hybrid: demo half + operating half)
url: https://www.youtube.com/watch?v=2CQwma8ZKNQ
title: Character sheets locally, two custom node workflows
author: Muse Collective (Andy)
words: 4701
extracted: 14
accepted: 2
declined: 0
leads: 4
already_covered: 6
untriaged: 5
applied: 0
shipped: 0
dispatched: 0
run_id: intake-2CQwma8ZKNQ
siblings: 1
rescan_when: n/a (not a repository source)
---

# Character sheets rendered locally instead of through a hosted chat model

A creator rebuilds, as local custom nodes, a character-sheet workflow they had
previously run through a hosted API, and walks through two model routes for it. The
class is a **build-walkthrough**, so the two halves have opposite reliability and were
routed separately: the demo half (what the nodes do, how they are installed) yields
nothing, and the operating half (what went wrong while using it) carries everything
below. Expected yield for the class, said before the triage table: **one or two
boundary cases and some dated facts**; what landed is two currency corrections, and
that is the calibrated result rather than a shortfall.

Board: 1 live sibling at start (`intake-supermemory`, holding
`software-engineering/llm-agent/prompt-and-context/agent-memory`) - no overlap with
this run's homes.

Declared focus from the last scorecard row was **extract, via the untriaged backlog**:
grep the banked untriaged tables for this source's terms before scoring. Done, and it
returned a hit - see "The backlog check" below. It did not converge.

## Triage table

Scored rows are upper-layer targets; the two `currency` rows are governed by the
corroboration table instead (a source may authorize a currency signal alone), which is
why they carry no G/R/C.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | amendment | S | Mint a turnaround as per-view calls, assemble last | `review-iteration-loops/partial-regeneration-seams` | new-technique | partial | 2/2/1 | **lead** - render-bound; pair refused by the discrimination gate |
| 2 | K | amendment | S | Check lateral asymmetries in subject space, not screen space | `image-to-3d-input-gating/multi-view-master-reference` | new-technique | partial | 1/0/1 | untriaged (G-R=1) |
| 3 | K | currency | S | Klein's license splits by size: 4B Apache-2.0, 9B non-commercial | `generative-provider-routing/vendor-fact-ledger` | corrects-claim | real gap | - | **accepted** (primary fetched) |
| 4 | K | currency | S | The local row has a host-RAM ceiling, not only a VRAM one | `generative-provider-routing/capability-to-vendor-plan` | dates-application | real gap | - | **accepted** (engine source read) |
| 5 | K | technique | M | Weight a layout reference below an identity reference | `image-prompt-composition/reference-role-map` | new-technique | partial | 2/2/2 | untriaged |
| 6 | - | catch | - | A detail-restoration pass doubles cost and re-decides the face | `partial-regeneration-seams`, `character-identity-continuity` | none | likely catch | - | already covered |
| 7 | - | catch | - | Re-roll the whole run when many panels are wrong | `partial-regeneration-seams` (defect-extent table) | none | likely catch | - | already covered |
| 8 | - | catch | - | Each edit pass drifts the character further | `partial-regeneration-seams` ("the edit pass is itself lossy") | none | likely catch | - | already covered |
| 9 | - | catch | - | Background removed, composited onto a flat white ground | `reference-shows-only-invariants` (mid-tone field) | none | likely catch | - | already covered, and the corpus argues the opposite ground |
| 10 | - | catch | - | Every panel must be confirmed before the sheet is assembled | `content-acceptance-tiering/derived-vs-toggled-acceptance`, `hitl-approval` | none | likely catch | - | already covered |
| 11 | - | catch | - | A layout template image conditions the panel structure | `video-assembly/storyboard-grid-conditioning` | none | likely catch | - | already covered |
| 12 | K | lead | S | An edit-LoRA over a base model is less reliable than a native edit model | - | none | thin | - | lead |
| 13 | K | lead | S | The distilled sibling washes out exposure and cannot edit it back | - | none | thin | - | lead |
| 14 | K | lead | S | Per-view prompt wording is the tuned artifact, shipped hidden but editable | - | none | thin | - | untriaged |

## The backlog check (this run's declared focus)

`librarian/sources/2026-08-31-3d-documentary-ai.md:152` banked **"Multi-view panel
sheet in one generation"** as an already-covered catch, under
`storyboard-grid-conditioning`. This source is an independent second reader of the same
decision and reaches the **opposite** practice: five separate calls, because one call
"was virtually impossible" to get to usable quality and resolution for five full-length
views [00:14:11].

**They do not converge, and the discriminator is panel count against panel size** -
which is exactly what `storyboard-grid-conditioning` already states as its legibility
ceiling ("past the model's legibility ceiling the panels shrink until their content
stops surviving"). The earlier source ran three panels; this one wanted five full
figures plus a close-up. So the backlog check cost one grep and returned a
non-convergence with a named discriminator, which is recorded here so the third reader
does not re-derive it.

## Render proof (Phase 6b) - the pair was REFUSED, and the refusal is the result

Row 1 is render-bound: it changes what a generator is told. Instruments probed first -
ComfyUI 0.33.0 at `:8188`, Flux 2 dev fp8 with `ReferenceLatent`, all present.

- **Reference**: one original character, three deliberate lateral asymmetries (braid
  behind her left ear, watch on her left wrist, satchel strap over one shoulder).
  Pre-read: usable, asymmetries legible.
- **Arm A** (the corpus as it stands - a sheet minted as one image): one call,
  2560x1024, both seeds.
- **Arm B** (the source's approach): five calls at 704x1408, one per view, same
  reference, assembled to the same canvas.
- **Seed control**: each approach re-rendered at a second seed.

```
between (A vs B)      63.46
within_A (s7 vs s8)   70.67     <- the approach against ITSELF
within_B (s7 vs s8)   19.93
ratio                  0.90     refused (needs >= 1.5)
```

**Arm A is less like itself at a second seed than it is like the other arm.** Both A
renders returned **six** panels for a five-view brief, and not the same six: seed 7 gave
a close-up, two fronts, one profile and two backs (one of the five requested view kinds
missing); seed 8 gave a close-up, a front, both profiles and two backs. The single call
does not reproduce its own panel inventory.

Per `references/render-proof.md` a refused pair is redesigned, never shown, and **no
verdict exists**, so nothing perceptual landed. The pair was not put in front of the
operator, and no triage look was spent.

Director's pre-read, recorded as opinion and not as evidence: arm B filled every
requested slot at higher per-figure detail but its views disagreed with each other - the
satchel vanished in two of five views and both "profiles" faced the same way - while arm
A kept the accessories coherent and broke the panel plan instead. Neither arm dominates
on a count, which is the second reason row 1 did not land as an amendment.

What the renders *did* corroborate is a sentence the corpus already has:
`partial-regeneration-seams` says a single-image sheet has no addressable region and
"the model re-decides the others while it is there". Two seeds of arm A are a direct
instance, at n=2. A catch, not a landing.

Renders deleted at Phase 9 by run id: **39.9 MB** (22.4 MB run scratch, 17.5 MB ComfyUI
output, plus the staged input).

## What landed

**Row 3 - the license splits by model size.** The ledger said "Klein (Apache-2.0,
consumer GPU)" for the whole family. The source says the 9B may not be used
commercially [00:25:18]; the primary (1 of 3 fetches spent) confirms it: 4B under
Apache 2.0, 9B under the FLUX Non-Commercial License. A routing plan that reads the
old line picks the larger local model for commercial work. The correction is inline and
dated; `verified_on` was deliberately **not** moved, because only this one entry was
re-resolved and the field claims the whole document.

**Row 4 - host memory is part of the local tier's hardware class.** The source's
operating half reports being pushed onto 32 GB by a failed RAM module and having to cap
the engine's pinned-memory reservation to keep a large video model runnable
[00:10:13-00:11:58]. Read in the engine's own source rather than taken from the video:
`comfy/model_management.py:1585` caps pinned host memory at 40% of system RAM on
Windows, with `--disable-pinned-memory` the only stock switch. The local-tier
application sized its proof on VRAM alone; it now carries the host-RAM ceiling with the
numbers for both host classes.

## Untriaged - recorded with anchors, judged by nobody

- **Lateral asymmetries must be compared in subject space** [00:32:49]. The model "keeps
  putting things like the jewelry the wrong way around and the belt". The corpus's view-set
  consistency check (`multi-view-master-reference`, step 5 "detail agreement") compares
  features across views without saying that a back view legitimately mirrors every
  lateral feature on screen - so a screen-space comparison flags the correct back view
  and passes the mirrored one. Scored 1/0/1 and banked.
- **Weight a layout reference below an identity reference** [00:29:22]. Two conditioning
  strengths, the identity image deliberately stronger than the template that supplies
  only the layout. `reference-role-map` declares roles; nothing found states that roles
  imply unequal authority.
- **The per-view prompt wording is the tuned artifact** [00:18:35]. "It took ages to sort
  of get that wording right" - shipped hidden but editable.
- **Auto model selection picks the largest variant present** [00:12:27], with a
  "balanced" setting for the middle one - a loader-level policy the operator inherits
  without choosing.
- **A detail pass on "person" is reliably worse than on "face"** [00:25:02].

## Leads

- **An edit-LoRA over a base model is less reliable than a native edit model** for
  identity-preserving view synthesis [00:33:39]. Return condition: when a second
  independent source measures the two on one brief, or when a local pair can be built
  where the two are the only variable.
- **A distilled sibling washes out exposure, and an edit instruction cannot bring it
  back** [00:26:36, 00:28:25]. Return condition: when a run needs a distilled tier for a
  volume stage and can measure exposure against the full model.
- **Per-view minting versus one-call minting of a view sheet** (row 1). Return
  condition: a pair whose within-arm variance does not swamp the between-arm distance -
  which here means holding arm A's panel inventory fixed (a layout template image, as
  the source itself uses) so the two approaches differ in one thing rather than two.
- **The local tier's host-RAM ceiling as a routing input** - the fleet has no project
  that runs local image generation, so there is no seam to test it against. Return
  condition: when a managed project grows a local-render path.

## Why ship is 0

Nothing landed that a managed project consumes. The two accepted rows are dated facts
in the registry's own vendor ledger and local-tier proof; the seam hunt over the one
fleet project with a local inference path (a text-to-speech service) found no
image-generation or host-memory seam. The row that *did* have a live seam - the render
pipeline on this machine - produced a refused pair and no verdict.
