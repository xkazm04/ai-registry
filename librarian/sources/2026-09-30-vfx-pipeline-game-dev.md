---
source: youtube:ZksPNRPupWs
kind: video
url: https://www.youtube.com/watch?v=ZksPNRPupWs
title: Easiest Way to Create VFX for Your Game With AI
author: Stefan 3D AI
words: 3413
extracted: 11
accepted: 0
declined: 0
leads: 3
already_covered: 4
untriaged: 4
dispatched: 0
applied: 0
shipped: 0
run_id: in-zksp-0930
siblings: 0
fetches: 0
---

# A game-VFX build walkthrough that owns no subject yet

**Class:** practitioner build-walkthrough, first-party, demo-shaped, with a course plug
(00:10:58-00:11:23, not a candidate). The creator is building their own game and shows one
character (a plant-themed unit) end to end: 3D generation in parts, manual texture fixes, a rig
built with a coding agent, animation, then effects. The demo half (the finished character in
engine, 00:16:03-00:18:36) carries no boundary; the operating half (why each step is ordered as
it is) is the only yield. The caption track garbles product and model names ("GPT-6", "Astra",
"C dance", "Mik Samo"); none of them is relied on. Duration about 19 minutes, one video,
no clone, no fetches.

**Expected yield, said before the table:** one to three catches and possibly a lead. That is
what it gave. No fleet project declares game-production, so no seam exists to apply against.

## Triage

Rule per row: upper-layer shapes ran the Phase 5 score; currency and leads ran under the
corroboration table.

| # | Lane | Shape | Eff | Candidate | Anchor | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | technique | M | Render several cheap interactive concepts, with timings, and pick a direction BEFORE the expensive implementation; use a second agent to implement the chosen one; skip the stage for effects with one obvious form | 00:02:33-00:03:26, 00:05:57 | none owns it; the nearest text is a passing line in strict-output-schema-with-derived-dependents, and delivery-promise-lock's "cheapest artifact" is a different rule (an exclusion set for a proportion gate) | new-technique | partial | 2/2/2 | untriaged (needs corroboration) |
| 2 | K | subject | XL | Game VFX as a subject: layered effects (3D object on an armature plus engine effects), an up-front effect list per significant action, a library of effects kept as a vocabulary | 00:00:51-00:01:17, 00:09:17-00:09:42, 00:06:22 | no subject in game-production models effects | new-subject | real gap | - | lead (V2 and E4) |
| 3 | K | technique | S | Keep parts and materials separate (leaves, branches, body) so they can be animated, recoloured and kept transparent later | 00:10:07-00:10:58 | image-to-3d-input-gating/part-cut-planning cuts parts for generation quality; the forces here (later rigging, recolour, alpha) are a boundary case it does not state | amendment | partial | 1/2/1 | untriaged |
| 4 | K | technique | S | A clean unwrap lets a colour map be edited or corrected by an image model afterwards | 00:08:27-00:08:52 | mesh-finishing-for-engine-readiness (pack-existing-vs-smart-unwrap, texture-pass-must-consume-the-bake) | none | likely catch | - | already covered |
| 5 | K | technique | S | A reference pack is a VOCABULARY for effects the author cannot name; send a link, ask "like this, other colour"; never copy | 00:04:16-00:05:07 | character-identity-continuity/reference-shows-only-invariants; visual-style-locking/style-onboarding-from-sample | none | likely catch | - | already covered |
| 6 | K | technique | S | Coding agent authored a commanded root motion that two video models could not | 00:13:57-00:14:22 | motion-quality-gating (a lint after the fact); video-assembly/generated-shot-sourcing | new-technique | partial | 2/2/1 | lead |
| 7 | T | script | M | A pose-setting plugin: set a pose at a frame and send it back to the agent as feedback, in place of prose | 00:14:22-00:14:47 | none | new-technique | thin | - | untriaged |
| 8 | K | technique | S | Generate video only to preview how an effect will read together with the character | 00:13:31-00:13:57 | media-generation/visual-generation storyboard-grid-conditioning | none | likely catch | - | already covered |
| 9 | K | technique | S | Enumerate the effects list first, per significant action | 00:03:26-00:03:51 | production-coverage-measurement, catalog-pipeline-authoring/seed-entities-and-walker-coverage | none | likely catch | - | already covered |
| 10 | T | practice | S | An isolated effects playground plus a manual trigger for conditional effects (a guard that needs five nearby units) | 00:01:17-00:01:42, 00:17:45-00:18:11 | none read | new-technique | thin | - | untriaged |
| 11 | - | currency | S | The mesh provider's newest model returns four meshes per call | 00:08:02-00:08:27 | applications cite the provider in generative-provider-auditing/pin-a-model-per-asset-class and others | resets-clock | - | - | lead (dated fact, model name garbled) |

Counts: 11 extracted, 0 accepted, 4 already covered (4, 5, 8, 9), 3 leads (2, 6, 11), 4 untriaged
(1, 3, 7, 10). `auto=0/5/1`, `fp=0` (rejected: 1, 3, 6, 7, 10; escalated: 2 as an XL, E4). Untriaged means nobody verified the row; it is not a decline.

## Why nothing landed

Every technique candidate rests on the creator's account alone (RISK 2, no primary, no tree),
and none reaches GAIN 3. Row 1 is the only one worth a second look: it is a real stage (the
concept stage before the medium that is expensive to change) with three separable specifics
(timings in the concept, a second agent for the build, a skip condition for one-form effects).
It scored 2/2/2 and fails the +2 threshold on the corroboration blocker alone. The promotion
read does not apply, because the blocker is source prose, not an unchecked worker report.
Row 2 is the subject the corpus lacks, and one 19-minute account is thin evidence for a subject.

## Leads and their return conditions

- **Game VFX subject (row 2, with rows 1 and 10 folded in).** Return when a second first-party
  source describes an effects pipeline, or when a fleet project declares game-production and has
  an effects seam to measure. At that point write the XL spec with rows 1, 2 and 10 as its
  proposed techniques.
- **Commanded motion authored by code, not generated (row 6).** Return when a second source or
  a project's own run shows a video model failing a commanded movement, or when a project
  grows a motion seam. Discriminator to test then: does the movement have to follow a
  command, or only look plausible?
- **Mesh provider's multi-mesh model (row 11).** A `/deepen` dispatch candidate for
  generative-provider-auditing. Not applied here: no citation was re-checked, so no
  `verified_on` moved.
- **The creator's workspace repo with VFX and animation skills** (00:18:36-00:19:26). The
  description did not carry a link and no fetch was spent guessing. Return when the link is
  known; it would be a repository-class source mined by clone.

## Phase 7.5 and 7.6

No landing, so no apply rows are owed. The seam hunt (ascent, gravitone, goat, each with a
positive control) found no game effects seam: the hits were binary image files and a web app's
UI particle theme. `directions=n/a` (no design record, a video). One scored-and-rejected read:
the corpus holds no interactive-concept technique, so a technique on row 1 would be new, not
duplicate; it was withheld for evidence, not for overlap.

## Earlier notes from this author

Two earlier runs mined the same channel (`2026-09-01-stefan3d-free-ai-level`, `2026-09-16-gpt6-two-game-builds`). Both mention effects only in passing (one row already covered by `placeholder-is-not-an-asset`), neither banks an effects candidate, and a third video from one author is one voice, not convergence. The VFX lead therefore starts from this note alone.

## Reading notes for the next run over this source class

- A game-dev walkthrough is a portfolio of steps in one medium; almost every step maps to an
  existing subject in asset-production. The unowned ground is the effect layer itself.
- The strongest quote for the concept stage is the creator's own reason: implementing
  costs more than looking at a concept, and a concept shows the timings. That is a force,
  not a claim, so it is the part worth testing.
