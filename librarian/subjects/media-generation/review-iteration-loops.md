---
domain: media-generation
subject: review-iteration-loops
last_touched: 2026-08-31
touched_by: intake
dry_streak: 0
---

# review-iteration-loops

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-26 - `/intake`, from a vendor announcement + primary docs

Gained `partial-regeneration-seams` (7 -> 8 techniques). Source:
[[2026-08-26-composer-song-editor]].

The subject's edit-plan discipline was complete for discrete media and said so
("beats not named by any operation are byte-identical") - the enumeration that
invited the question. Continuous media (audio, video, image regions) add a
boundary neither region owns: the physical seam between kept and regenerated
material, where per-region gates pass and the artifact fails. Three structures,
all converged on by current section-editing tooling: kept regions held by
reference (never re-emitted), per-seam continuity as a declared setting, and
an anchor region whose edits are global restyles in local clothing.
Corroborated by primary vendor schema docs plus training-data convergence with
image inpainting masks.

## Open leads

- The seam technique states "gate the applied result at the seams" but no
  scripted seam check exists anywhere in the fleet yet; the consumer tree
  that renders cues (see [[2026-08-26-composer-song-editor]]) has no
  section-edit path at all so far. When it grows one, the seam check is the
  application to write.

## 2026-08-27 - /intake run 25 ([[2026-08-27-video-workflow-batch-2]])

- `partial-regeneration-seams` gained **the edit pass is itself lossy**: generative edits re-encode and soften what they touch; chains accumulate smoothing and speckle artifacts (copy-of-a-copy). Three moves practitioners converge on independently: every edit applies to the stored original (kept-by-reference extended to the chain), composite the edited region over the original's pixels, and mechanical deletions take the deterministic tool. Three independent practitioners across runs 24 and 25.
- Currency: one platform ships native partial video editing (hover a region, regenerate only it, pay only that region) - the subject's seam frame reaching video as a product surface. The per-seam gate discipline is what the product does not yet show; watch for it.

## 2026-08-27 - /intake run 27 ([[2026-08-27-video-editing-batch]])

- `edit-plan-over-regeneration` gained **the plan lands as annotations in the working surface**: proposals rendered as native markers with notes, approved in place (surviving markers ARE the approved plan), applied by a deterministic script. Propose/approve/apply with the mechanical step containing no judgment - refuse-before-apply built into the workflow's shape.
- `anchored-variation-slate` gained the post-pick rule: **generate to see, rebuild natively** - when the production tool can express the winner, the slate's product is the decision and the render never enters the deliverable. First-party pricing from a 10-year editor: the direct-adopt loop costs quota, fiddly round-trips, and half-hour misses.

## 2026-08-28 - /intake run 35 ([[2026-08-28-media-generation-batch-4]])

- `partial-regeneration-seams` gained **the two operations time-based media has and a still does not**. The technique's "mechanical changes take the deterministic tool" bullet was written for pixels - remove on a clean ground, crop, cover. A clip adds **excise an interval** and **reverse one**, and the defect's own *extent* chooses among them: bounded interval -> excise; interval whose motion runs backwards -> reverse; bounded region clear of the subject -> reframe; whole clip -> the only row that earns a new sample. The economics are `cost-per-usable-output` arriving one stage later: a re-roll does not fix a defect, it re-enters the lottery that produced it, and the cheapest usable output is often a rejected render with ninety per cent of its duration intact.
- The boundary is what makes reversal a rule rather than a trick: **time-symmetric motion only** - a barrier, a mechanism, drifting smoke, a swinging weight - and never gait, a mouth on screen, flame, dissipating smoke, or anything spilling, shattering or burning. Reversal takes the whole span, including the elements that were already correct.
- Gate disposition landed with it: a clip whose only failing defect has an editorial remedy is **accepted with a named repair**, and the repair travels as provenance - nobody downstream can see from a clean timeline that a shot is holding a crop it must not lose or a reversal it must not re-cut through.
- Same technique, second amendment: **a multi-panel sheet has no addressable region.** A one-panel fix re-renders every panel and the model re-decides the others while it is there, so the composite the technique already prefers becomes compulsory - and the step nobody performs is to **diff the panels you did not ask about**.
- Frontmatter gained the two law citations the new material genuinely rests on (`cost-per-usable-output`, `refusal-is-a-state`).

## 2026-08-31 - intake, OpenMontage (critique-carries-its-fix)

Gained `critique-carries-its-fix` from [[../../sources/2026-08-31-openmontage]].

The subject's existing techniques all govern feedback arriving **from** a creator -
`note-taxonomy-focus-scope-order` reads the register, `scope-vs-preference-signals`
resolves precedence. Nothing governed findings the pipeline generates **about its own
work** and hands to an automated stage. That was the missing direction.

Corroborated by the primary the source cites, and the fetch corrected the source: the
axes are **precision, recall and constructiveness** (arXiv 2604.21718), not the
"Accurate / Complete / Constructive" the source renamed them to, and the CMU/Harvard
attribution is unsupported. Written against the paper's terms, which are better - the
first two are a retrieval pair that trade off, which is exactly the reviewer's problem
and the thing the renaming hides.

**Carries a cross-bundle boundary.** `game-production/craft-judgment/subsystem-review-doctrine`
holds `severity-by-consequence`, which forbids folding fixability into severity and
keeps confidence on its own axis. This technique folds constructiveness into severity.
Both are correct, and the discriminator is stated in prose on this side with no
cross-bundle link: **does the consumer decide, or act?** A human queue can hold an
unactionable critical; an automated stage converts one into a fabricated fix. A later
run meeting this shape should recognise it rather than re-litigate it.

Applied to `gravity` as an **experiment**, verdict **better**. Its extract loop already
implements the rule's strong form independently - the critique schema requires the fix,
a shrug or an echo is rejected, and the loop ends rather than iterating on an
unactionable critique. The gap was downstream accounting: four settle causes collapse
into one boolean, and an abandoned replica takes the same progress credit as a
completed one.

### Still open

Whether the demotion's routing claim holds where both consumers exist. That tree has
one consumer of a settled replica; a pipeline surfacing investigations to a human
alongside blocking findings would exercise the half nothing has tested.
