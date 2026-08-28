---
subject: visual-style-locking
domain: media-generation
last_touched: 2026-08-28
dry_streak: 0
---

# visual-style-locking

First note: [[2026-08-26-stop-building-ai-slop]] - /intake run 22. Subject predates the notes.

## State

6 techniques. `style-onboarding-from-sample` now names the layer it does not model.

## 2026-08-26 - /intake run 22

- Mostly a **catch**: the subject already held the correct procedure for onboarding someone else's work (sample seeds a description, never a conditioning input; regenerate on your own canonical subjects; the block plus the sheet, not the sample, are the deliverable) and the source recommended its exact inverse.
- Amendment to `style-onboarding-from-sample`, section "When the appeal is the structure, this technique does not apply", plus one decision rule. The technique separates a sample's *style* from its *subject*; the unmodelled third layer is **structure** - layout, zone arrangement and proportion, navigation architecture, reveal order. Keeping the structure and restyling the surface reads as compliance with this technique while the identifying layer passes through untouched.
- Corroborated by one fetch: the identifying unit is the **combination**, so swapping the single cheapest axis does not clear the set, and the functionality carve-out is the honest discriminator (functional vs identifying, settled at brief time, not delegable to the generator or the restyle).

## Open leads

- The registry has no subject on generating a *product surface* from another product's surface; this landed in media-generation because the reference-governance vocabulary lives here. If a software-engineering run hits the same shape, the discriminator to state is that this technique governs references for generated imagery, not codegen from a shipped competitor UI. Return when such a run appears.

## 2026-08-26 - /intake run 23 ([[2026-08-26-joyai-echo]]) - boundary, no change here

Considered as the home for `identity-split-from-state` and did not take it. The
rule is that a verbatim-restated block may hold nothing that varies, which is a
statement about this subject's central mechanism - but its bite only appears
when the constant stops being a *look* and starts being a *subject*, because a
style has no moods and never forced the question. The block anatomy lives in
[[image-prompt-composition]] and that is where the correction landed, against
its "three blocks, three scopes" enumeration.

Worth recording rather than forgetting: **this subject's rules were forged
against a constant with no mutable attributes, and quietly depend on that.**
Anything here phrased as "restate it in full" should be re-read that way if a
future run brings a constant that changes.

## 2026-08-27 - /intake run 24 ([[2026-08-27-video-workflow-batch]])

- Amendment on `approved-reference-sheet`: **when the sheet holds a subject, not a style** - "varied subjects, one style" inverts to one-subject-varied-views, the identity-bearing surface appears exactly once at maximum scale (erase the face from the full-body panel; a small face is a low-resolution identity reproduced faithfully; two faces make the motion model pick unpredictably), neutral ground raises usable yield. Two independent creators in one batch converged on the decapitated-panel move.
- Amendment on `style-block-restated-every-call`: **the block is a default, and an override is scoped and recorded** - per-scene look changes override only the named slot, only for their scope, recorded where the block is recorded; a default edit propagates to every non-overriding shot. When an LLM is the compiler, the discipline takes document form: one connected shot list, style block at head, shots named for addressable edits. This answers the note above about constants with mutable attributes for the *style* case: the constant does not mutate - it is shadowed, per scope, on the record.
- Cross-repo, same run: the react application re-verified against a real tree (verified_on moved to 2026-08-27). Two structural facts landed in it: the tree takes the *no-override* side of the new amendment and its shape says why (a one-video plate cut has no scene that earns its own register - no style field exists on the scene spec); and the both-channels contract leaked at exactly one caller because the image half rides an optional field no type forces - the production path generated text-only against an approved sheet until this run closed it. The leak shape (compiler owns the text half by construction; nothing owns the attachment) is worth watching for in any two-channel contract.

## 2026-08-27 - /intake run 26 ([[2026-08-27-video-workflow-batch-3]])

- `style-onboarding-from-sample` gained the plural-capture gate: **a sample set must agree before it teaches**. The readback describes what the frames share; a mixed set captures a hybrid nobody chose with clean-looking lineage. Check the block against each sample, evict outliers at collection time - curating the set is the first edit of the style.

## 2026-08-28 - /intake run 35 ([[2026-08-28-media-generation-batch-4]])

- `style-onboarding-from-sample` gained **the house-style decomposition**, one run after it gained the plural-capture gate. The technique captures the look of a frame; a *house style* - a recognisable body of published work somebody wants more of - has separable stages that fail independently, and each is learnable only from evidence of a different kind. *What gets shown and when* is a correspondence, invisible in any single frame, learnable only from finished work paired with its timed transcript. *How it looks* is the existing procedure. *How it moves* has no readback at all, because nothing in the pipeline reads a frame sequence back into the grammar.
- **The third stage is the finding and it generalises past this instance: where no channel can read the evidence, the stage is neither skipped nor guessed - it is hand-authored, and a decomposition supplied before the writing starts is what makes hand-authoring tractable.** Split the frame into asset classes (text, primary subject, ground, secondary dressing, camera) and state each one's behaviour; a practitioner who cannot write "the house motion style" in the abstract can answer five narrow questions whose union is the block.
- Two consequences carried: **the capture method is a property of the evidence, not of the operator's convenience** - the temptation is to run every stage through the readback because one stage worked, which yields a confident block about a stage nothing actually read; and a hand-authored stage is a hypothesis with a named author, so it is the least validated part of the style and the first thing the reference sheet should be read against.
- Adjacent and NOT landed: whether a style ratified on stills is ratified for motion at all. The lock lifecycle (drafted -> proofed -> locked) proofs on renders, and `style-block-restated-every-call` already owns restating the contract at the still-to-motion hop - but *ratification* is a different question and the run did not earn it. Return if a second source describes a style that passed on stills and broke in motion.
