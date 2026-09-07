---
source: youtube:oBCAYESUmZ8
kind: youtube
url: https://www.youtube.com/watch?v=oBCAYESUmZ8
title: "Can Claude Fable Build a Medieval House Interior?"
author: Building Aeon
words: 2666
class: first-party practitioner account (build-walkthrough form)
domain: game-production
extracted: 12
accepted: 1
declined: 0
already_covered: 3
leads: 1
untriaged: 7
dispatched: 1
applied: 0
shipped: 0
fetches: 1/3
run_id: intake-obcayes
siblings: 0
skill_version: 2.7.0
---

# A medieval interior - and the third disagreement at the import edge

Second source from this channel in two days, same class: a creator narrating an
environment build they actually did, in build-walkthrough form. 2,666 words on a real
subtitle track; the container was checked before the class was named (prose, one
`en-orig` track, a word count proportionate to a 12:42 video - not a decoded blob).
**Expected yield said before the table: LOW** - one landing at most, several catches,
no subject. It came in at *one subject*, which is a miss in the calibration's favour and
worth saying plainly: the video did not carry a subject, the **corpus's own boundary
statements** did, and the video was only what made anyone read them.

**Declared focus (round 37) applied.** (1) The connected tree's recorded-experiment lane
was read at Phase 1 beside the worklist, as the focus asked, not stumbled on at 7.5:
`foundry-out/runs/` in the media-generation project holds two dojo cycles, both **2D
imaging** (colour roles, oil blacks). So the lane exists and is the wrong shape for a 3D
source - a fact worth having in ten seconds rather than after a wasted apply hunt. (2)
The board-address item passes trivially for the third consecutive run: **0 siblings live
for the whole run**, so "did a claim and an index address agree" is asserted and still
untested. It stays open. (3) The calibration item is the only one that bit: it is now
written into shipped content rather than only practised - the conformance test in the
forged subject *must straddle the midpoint*, because the midpoint is the fixed point of
the inversion it exists to catch.

## The source class did what the class predicts

The demo half (concept art, texture generation, prop batches, an agent assembling a shell
through a tool bridge) is the half the creator is proudest of, and it is where the
boundary is missing - it shows the solution and hides the problem. Everything this run
kept came from the operating half: the sentences describing what happened *to* them.

The single most productive sentence in 2,666 words was an aside about cleanup:
*"some of the lighting is a little bit off, some of the textures look a little washed out
and shiny."* The creator diagnosed that as a look problem and wrote a project-local fixer
script for it. It is not a look problem.

## Triage table

Scored under v2.5's gate. `G/R/C` = gain / risk / cost; a score never overturns a veto.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | subject | XL | Conform the SURFACE at the import edge, not just the transform | gp/asset-production (four neighbours, no owner) | new-subject | real gap | E4 | **escalated -> accepted -> forged** |
| 2 | K | amendment | S | Planar assets reconstruct as invented volume | image-to-3d-input-gating/text-is-never-geometry | none | likely catch | - | already covered |
| 3 | K | technique | M | Judge in the delivery context, not a neutral render | mg/visual-generation/generated-output-grading | new-technique | partial | - | untriaged (promoting question asked; did not promote) |
| 4 | K | lead | - | A handoff carries geometry and discards intent | mg law `style-is-restated-not-remembered` | new-law | real gap | - | lead |
| 5 | K | technique | M | Name the hierarchy before export flattens semantics | (no owner found) | new-technique | real gap | - | folded into 1's open question + 4 |
| 6 | K | technique | S | Derive the prop manifest from one concept image | mg/image-prompt-composition | none | thin | - | untriaged |
| 7 | K | amendment | S | Author tiling where the UVs are, not on engine primitives | gp/tiling-texture-acceptance | none | likely catch | - | untriaged |
| 8 | K | technique | M | An enclosed interior needs its own grade | (near-empty map) | new-technique | thin | - | untriaged |
| 9 | K | amendment | S | A batch has a reject rate; triage is a stage | gp/regeneration-vs-repair-economics | none | likely catch | - | already covered |
| 10 | K | - | S | Structure automates, arrangement does not | gp/generated-mesh-acceptance | none | likely catch | - | already covered |
| 11 | K | technique | S | A screenshot advisor loop for parameter tuning | (thin) | none | thin | - | untriaged |
| 12 | - | currency | S | A model's access window changed mid-project | - | none | thin | - | dropped (`strip: nothing`) |

**Row 1 was never auto-accepted.** It reached the table as a technique, and the two file
reads that were supposed to place it disqualified both homes. A subject is an `E4`
escalation under v2.5, so the run stopped and asked; the operator chose to forge in
session. Everything else scored below the accept threshold or resolved to a catch, and
**nothing was declined** - the untriaged rows carry their anchors and no judgment.

## Row 1 - how a technique became a subject

The candidate started as *"the import step owes a material conformance pass"* and was
drafted against `mesh-finishing-for-engine-readiness`. Reading that golden path's closing
section killed the placement: it disclaims the import edge (*"correcting that is an
import-edge decision with its own authority"*) and disclaims material judgment. The draft
moved to `generated-asset-world-scale`, which holds `unit-convention-at-the-engine-edge`
and is where the corpus routes import-edge questions - and **that** golden path closes
with *"what belongs here is only whether the output can be the right size."*

Two subjects, two explicit disclaimers, and four neighbours each naming a different one of
the others. That is the corpus stating a boundary twice and leaving the far side empty.

The stronger half came from the enumeration hunt. `unit-convention-at-the-engine-edge`
opens by asserting the edge disagrees about **"two things at once"** - unit and axis - and
that *"both disagreements produce an asset that looks plausible and is wrong by a fixed
factor."* There is a third disagreement, and **it is not round**. That is not a detail; it
is the reason it survives. The technique's own diagnostic ("a factor of exactly a hundred
is a diagnosis, not a fix") cannot see it, so a surface error is never classified as a
boundary error at all. Extending that technique would have falsified its standing
sentence, which is the v2.5 rewrite test firing correctly: the gate said the finding was
too big to be a paragraph in that file, and it was right.

**One fetch of three** was spent, on the interchange format's own specification, and it
turned recollection into normative fact - and explained the source better than the source
did. "Washed out" and "shiny" are two different failures:

- **Colour space is declared per texture role**, not per asset: base colour and emissive
  are sRGB, metallic-roughness / normal / occlusion are linear. One blanket policy is
  wrong about three maps of five whichever way it goes. That is "washed out".
- **The gloss axis is inverted between conventions**, not scaled - and both the metallic
  and roughness factors **default to 1.0**, so a material that omits them is fully
  metallic, and a roughness of 1.0 copied into a smoothness slot is a mirror. That is
  "shiny", and the two compound.
- **The midpoint is the fixed point of that inversion**: a material at 0.5 comes through
  correct under the bug. This is why a spot check clears it, and it is the reason the
  forged subject's conformance swatch must straddle the midpoint.
- Third property, same mechanism: alpha mode defaults to opaque and double-sided to false,
  which is exactly why the creator's windows *"weren't transparent by default"*. Nothing
  was lost in export - a default was applied to a property nobody stated, and they went
  looking in the modelling tool.

The fixer script is the finding's own confirmation. A project-local script that "makes
imports look right", run by habit, **is the conversion edge written after the import
instead of inside it** - so every delivery re-acquires the defect and the day someone
skips the script it ships. The creator diagnosed the symptom correctly and the cause not
at all, which is the most reusable thing this source produced.

## Row 2 - a catch worth recording, with one honest edge

The carpet is the video's clearest generator failure: *"every single time it created a
very complex, weirdly shaped object."* It is **already covered**.
`text-is-never-geometry` already lists *woven detail* in its family and already carries
the remedy ("apply the symbol as texture afterward", "where the shape genuinely must be
geometric, author it"). A reader holding that technique handles the rug.

The honest edge, recorded so a later run can pick it up rather than re-derive it: the
technique explains its family with *"each of these encodes information at a scale or in a
physical mode that volume reconstruction does not represent"*, and that sentence does not
explain this failure. A flat sheet encodes nothing the reconstruction cannot represent -
its form is trivial. It fails in the opposite direction, by **invented volume**: the
generator's prior refuses to produce something that simple. Same remedy, different
mechanism. Not enough to land on one account; enough to write down.

## Row 4 - the lead (law altitude, not landed)

Every instance this source produced is one shape: **an inter-tool handoff carries the
geometry and discards the intent.** Tiling intent, part names, material convention,
transparency, the grade. The corpus already holds a law of exactly this shape in another
bundle - `media-generation#style-is-restated-not-remembered` - and this run found the
asset-pipeline twin of it.

Filed as a lead, not written, because a law needs convergence **across runs** and this is
one run and one author. **Return condition:** a second independent source, or a second
intake run, reaching "a boundary preserves the artifact and drops the properties that were
never in the artifact" from different material. If that arrives, the landing is the root
at law altitude with the instances cited into it, not another technique.

## Untriaged (extracted, anchored, nobody verified)

No judgment attached to any of these; they are here so a later run does not re-derive them.

- **Judge in the delivery context** [10:09] - *"I always like to pull it back over into
  Unity to see how it's actually going to look with the lighting and the volume settings."*
  The promoting question was executed (one file read of `generated-output-grading` for
  neutral-render / viewing-condition language) and returned nothing, so the row did not
  promote to `real gap`. The question a later run should ask, sharper: does the grading
  subject fix the critic's render conditions as *neutral*, and if so, is a neutral rig the
  right surface for an asset whose delivery context has a strong grade?
- **The prop manifest from one concept image** [02:56] - deriving the scene's asset list as
  a contact sheet from the single reference, then generating in small batches.
- **Tiling authored where the UVs are** [02:31] - the tiling fight on engine primitives that
  ended by moving the shell into the authoring tool. Probably covered by
  `texel-density-and-uv-tiling`; unverified.
- **An enclosed interior needs its own grade** [11:27] - a separate profile with overrides,
  because the exterior's global grade does not carry inside. Mapped near-empty.
- **A screenshot advisor loop** [11:52] for engine parameter tuning.

## Apply (Phase 7.5) - unapplied, and why

**No fleet project has this seam, and the absence was measured rather than assumed.** The
fleet is web applications plus a 2D imaging studio; none carries an asset import edge. The
media-generation project was searched with its own instrument, asserted against a known
positive first (71 files for the control term), and the surface query returned exactly one
file - which, read rather than counted, is an *audio* prompt containing the word
"metallic". A count concealing a same-word match is precisely the failure this registry has
already paid for, so the row is `unapplied`, not `simulation`: three invented cases would
be an opinion with a table around it.

**Return condition:** when a managed project grows an asset import path - a delivery
crossing a format boundary into a renderer - the swatch technique is the first thing to
run against it, because it is a test rather than an opinion and it fails loudly.

## Siblings

0 live on the board for the whole run. Nothing contended, nothing waited.

## rescan_when

Not a repository source; no upstream to watch. The channel is a recurring first-party
account in this domain and the next video is stated on-record as *"AI-powered NPCs"*,
which maps to `game-production/systems-canon/agent-behaviour-authoring` rather than to
asset production - a different neighbourhood, worth mining when it lands.
