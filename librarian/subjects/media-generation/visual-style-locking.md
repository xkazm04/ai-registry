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

## 2026-09-09 - the middle case between reading motion and hand-authoring it ([[2026-09-09-ai-video-editing-channel]])

Two videos from one creator (a **channel corpus**, so no within-batch
convergence) on driving a code-compiled video editor with an agent. Five catches,
one landing, and the landing came from a sentence this subject asserts rather
than from anything either video claimed.

`style-onboarding-from-sample` enumerates three capture stages and reaches a hard
verdict on the third: *a sequence of frames is not evidence anything in the
pipeline can currently read as motion*, so the motion signature is hand-authored
from a decomposition. Both sources do exactly that readback and report it
working, which looked at first like the corpus being out of date.

**It is not.** The one fetch this run spent went to the vendor's vision surface
and settled it in the subject's favour, with a mechanism neither side had: there
is **no video input** - only an image block - and where an animated container is
accepted at all, **only its first frame is used**. Nothing reads a sequence *as*
motion, exactly as written. What practitioners actually do is a third branch the
enumeration did not contain - **sampling** stills into one request - and its
fidelity is bounded by a hard per-request image cap plus a dimension cliff that
makes density and resolution trade against each other rather than add.

New technique `motion-sampled-under-a-frame-budget`, not an amendment: every
sentence of the parent stays true, its hand-authoring floor is explicitly kept as
the floor, and what the sources located is a mechanism the subject never had. A
pointer paragraph now sits in the parent so the enumeration names its own middle
case.

**The apply step refuted the technique and it was corrected in the same run** -
the second consecutive round in which the fleet has corrected a landing whose ink
was still wet. The seam was the only frame-sampling code in the fleet, a
filmstrip sampler feeding captured animation frames to a vision judge, and it
already knew the sharper rule: *the sampling is part of the instrument* - a judge
scoring timing on a strip whose spacing the sampler made uneven is grading the
sampler. Two things followed, both now in the technique:

- **A larger sample is routinely the worse instrument.** An even-as-possible pick
  is uniform only when `(available - 1)` is divisible by `(kept - 1)`; 31
  count-inversion pairs across nine ordinary capture lengths have a smaller cap
  uniform where a larger one is not. Where `available - 1` is prime there is no
  middle uniform pick at all - so a default cap that produces mixed gaps is often
  the only kind of number available, not a careless one.
- **Declaring the sampling is the mitigation**, and it is cheap: publish
  kept-of-available rather than a bare count, publish the gaps, tell the reader
  the removed frames are the sampler's doing and not the motion's, and report an
  unmeasured denominator as unknown rather than as a complete capture.

Board: the subject was **CONTENDED** from Phase 4 by a sibling mining a different
video. Not a stop - the write was an append (one new technique, one line on the
golden path, one pointer paragraph), so V5 did not fire; their tree state was
checked first and both spine edits took the `content` lock. `research-map`
refused to run over a third sibling's half-built bundle, so the map ran from a
detached worktree of `HEAD`.

## 2026-09-14 - intake-4D8Zr (youtube:-4D8ZrryVTA)

- Amended `motion-sampled-under-a-frame-budget` with "When the extractor can run instruments, the budget binds only the naming": route timing and palette to instruments, measurement settles values not categories, declare which values were measured. Evidence: planted-truth clip, tool-using extractors across three engines 5/5 cuts in 4 of 5 runs and 11/11 colours in all 5; vision-only arms 1/5 cuts and 0/2 holds.
- New application `python--motion-sampled-under-a-frame-budget` (code, better, ab-paired): two style readers disagreed on the palette category for 6/6 sources; a measurement over the same frames settled 4. Bundle `stacks:` gained `python`.
- Owed: a render pair of a recipe written from the measured palette against the readback (lead in the source note).

## Architecture review - 2026-10-31

First architecture review of the subject, against `5a08b4610`. All 12 documents
were read in full. Two load-bearing claims were checked against primary sources.
The vendor vision page confirms the motion technique's platform premise (image
blocks only, animations reduced to their first frame, a stricter per-image
dimension limit above 20 images) but its programmatic cap is now 100 or 600 by
model, not "low hundreds". The claim, carried in the golden path and the control
arm, that self-supervised image embeddings separate style better than
text-aligned ones is contradicted by the one style-retrieval benchmark opened:
CLIP outscored DINO there, and a descriptor trained for style beat both. The
golden path's technique list also omits the seventh technique its own front
matter names. Both react applications cite files that the consuming tree's
rebuild removed; the doctrine survives there in moved modules, but the anchors
no longer resolve. No verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/visual-style-locking",
  "date": "2026-10-31",
  "baseline": "5a08b4610",
  "digest": "sha256-b2:281e1e4a619b1b07",
  "disposition": "clarify",
  "coverage": "All 12 current documents read in full (golden path, 7 techniques, 4 applications). Two primary sources opened: the vendor vision documentation and a style-similarity benchmark paper. The motion technique's stride arithmetic was recomputed. The consuming tree named by the react applications was inspected at its current HEAD for the cited files only. Not evaluated: the game-production and content pipelines behind the next and python applications, any render or runtime witness.",
  "trigger": "Pending: the subject had no architecture-review record.",
  "intended_benefit": "A batch of generated frames reads as one publication because the style is a ratified two-channel artifact restated on every call and measured against a control.",
  "failure_if_ignored": "Per-shot look drift, reference images read as content, silent stand-in styles, and consistency claims ratified by flattering samples.",
  "boundary": "Generation calls that mint new frames of a styled set. Not one-off images, not minimal edits of an existing render, not codegen from another product's shipped surface.",
  "counterexamples": [
    "A general text-aligned embedding (CLIP) outscored a self-supervised one (DINO) on style retrieval in a published benchmark, so 'self-supervised separates style better' does not hold as a default; a style-trained descriptor beat both.",
    "A 9-of-10 pick has gaps of 1 and 2 while a 4-of-10 pick has a uniform stride of 3: a larger sample is the less regular instrument.",
    "An agent that decodes the file measures cut timing and palette over every frame, so the frame budget binds only the naming, not the values.",
    "A one-video plate cut has no scene that earns its own register, so a tree with no style override is correct for its shape rather than missing a feature."
  ],
  "sources": [
    {
      "url": "https://platform.claude.com/docs/en/build-with-claude/vision",
      "result": "Read 2026-10-31. 'The maximum number of images for each message or request is: 20 for each message on claude.ai; 100 for each request on the API, for models with a 200k-token context window; 600 for each request on the API, for all other models.' 'If a single API request contains more than 20 images, a stricter per-image dimension limit applies to every image in that request.' 'Animations are unsupported, and only the first frame is used.' Supports the motion technique's premise and its quality cliff; refutes 'low hundreds' for the programmatic cap."
    },
    {
      "url": "https://arxiv.org/html/2404.01292v1",
      "result": "Read 2026-10-31 (Measuring Style Similarity in Diffusion Models). Table 1 style retrieval mAP@1: CLIP ViT-B/16 73.7 DomainNet / 52.2 WikiArt; DINO ViT-B/16 69.4 / 44.0; DINO ViT-B/8 72.2 / 46.9; the paper's style descriptor best in all but one case. The abstract notes existing tools 'focus on retrieving images of similar semantic content'. Refutes the self-supervised-over-text-aligned claim as stated."
    },
    {
      "source": "Arithmetic in techniques/motion-sampled-under-a-frame-budget.md",
      "result": "Recomputed: (10-1)/(4-1)=3, uniform; (10-1)/(9-1) is not an integer, gaps 1 and 2; with available-1 prime the divisors of available-1 admit only kept=2 or kept=available; 14-1=13 is prime. Consistent."
    },
    {
      "source": "Consuming tree of the react applications, at its 2026-10-31 HEAD",
      "result": "lib/themes.ts and app/library/Playground.tsx no longer exist. Ratchet helpers (statusOf, lockBlocker) now live in a domain package; compilePrompt is still in lib/stylePrompt.ts; the provider adapter still prepends the STYLE REFERENCES role statement and the no-negative-field clause at different line numbers; docs/imaging.md still records 67% vs 33%. Anchors stale, doctrine present."
    }
  ],
  "documents": {
    "visual-style-locking.md": {
      "disposition": "clarify",
      "reason": "(1) The techniques list omits motion-sampled-under-a-frame-budget, which the front matter names; add its bullet. (2) 'self-supervised image embeddings separate style better than text-aligned ones, which reward shared content' is contradicted by the benchmark opened this run; restate as: general embeddings of either kind are trained toward content, and a descriptor trained for style is the better instrument."
    },
    "techniques/style-block-restated-every-call.md": {
      "disposition": "keep",
      "reason": "Procedure, override scoping and the dated boundary (references plus a restated core; text as the portable floor) are internally consistent and correctly scoped."
    },
    "techniques/approved-reference-sheet.md": {
      "disposition": "keep",
      "reason": "Window versus send count, approved-only references and the identity-sheet inversion are coherent; no unstable vendor figure is asserted."
    },
    "techniques/style-onboarding-from-sample.md": {
      "disposition": "keep",
      "reason": "Capture, coherence gate, house-style decomposition, the structure boundary and the pointer to the sampling middle case agree with each other and with the motion technique."
    },
    "techniques/draft-proofing-locked-ratchet.md": {
      "disposition": "keep",
      "reason": "Derived status, the lock gate, the one-way ratchet and named misses form a consistent state machine."
    },
    "techniques/rejections-as-negative-evidence.md": {
      "disposition": "keep",
      "reason": "Rejection never a reference, never counted against the window; consistent with the sheet technique."
    },
    "techniques/consistency-control-arm.md": {
      "disposition": "clarify",
      "reason": "Same embedding claim as the golden path ('self-supervised image embeddings separate style better than text-aligned image-text embeddings'); contradicted by the benchmark. The three-arm design and judging rules stand."
    },
    "techniques/motion-sampled-under-a-frame-budget.md": {
      "disposition": "clarify",
      "reason": "Premise confirmed by the vendor page, arithmetic recomputed. 'low hundreds on a programmatic one' should read one hundred to six hundred, depending on the model's context window."
    },
    "applications/next--motion-sampled-under-a-frame-budget.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (10-of-14 indices and gaps check out); the private tree and its probe were not reopened."
    },
    "applications/python--motion-sampled-under-a-frame-budget.md": {
      "disposition": "reverify",
      "reason": "Tables are internally consistent and limits are stated; the private pipeline and its selftest were not re-run."
    },
    "applications/react--draft-proofing-locked-ratchet.md": {
      "disposition": "reverify",
      "reason": "Every cited anchor (lib/themes.ts, app/library/Playground.tsx, app/library/presets.ts) is gone from the consuming tree after its rebuild; the ratchet now lives in a domain package with a changed status vocabulary. Needs re-anchoring against the current modules."
    },
    "applications/react--style-block-restated-every-call.md": {
      "disposition": "reverify",
      "reason": "Doctrine still present (compilePrompt, the STYLE REFERENCES role clause, the negative-as-prose clause, the 67% vs 33% probe), but Playground.tsx and MAX_REFS are gone and line anchors moved. Needs re-anchoring."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the three clarify items the earlier 2026-10-31 record named. The
vendor vision page and the style-retrieval benchmark were both opened this run.
The four applications were not touched and keep `reverify`, which is now the
overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/visual-style-locking",
  "date": "2026-10-31",
  "baseline": "5a08b4610",
  "digest": "sha256-b2:4e94305fcfba9d02",
  "disposition": "reverify",
  "coverage": "All 12 current documents decided. The three clarify items owed by the first 2026-10-31 record (golden path, consistency-control-arm, motion-sampled-under-a-frame-budget) were applied from sources opened this run and the edited passages re-read. Other documents are byte-unchanged and keep their dispositions. No private tree or runtime was reopened and no verification date was refreshed.",
  "trigger": "Pending: the subject had no architecture-review record.",
  "intended_benefit": "A batch of generated frames reads as one publication because the style is a ratified two-channel artifact restated on every call and measured against a control.",
  "failure_if_ignored": "Per-shot look drift, reference images read as content, silent stand-in styles, and consistency claims ratified by flattering samples.",
  "boundary": "Generation calls that mint new frames of a styled set. Not one-off images, not minimal edits of an existing render, not codegen from another product's shipped surface.",
  "counterexamples": [
    "A general text-aligned embedding (CLIP) outscored a self-supervised one (DINO) on style retrieval in a published benchmark, so 'self-supervised separates style better' does not hold as a default; a style-trained descriptor beat both.",
    "A 9-of-10 pick has gaps of 1 and 2 while a 4-of-10 pick has a uniform stride of 3: a larger sample is the less regular instrument.",
    "An agent that decodes the file measures cut timing and palette over every frame, so the frame budget binds only the naming, not the values.",
    "A one-video plate cut has no scene that earns its own register, so a tree with no style override is correct for its shape rather than missing a feature."
  ],
  "sources": [
    {
      "url": "https://platform.claude.com/docs/en/build-with-claude/vision",
      "result": "Read 2026-10-31. 'The maximum number of images for each message or request is: 20 for each message on claude.ai; 100 for each request on the API, for models with a 200k-token context window; 600 for each request on the API, for all other models.' 'If a single API request contains more than 20 images, a stricter per-image dimension limit applies to every image in that request.' 'Animations are unsupported, and only the first frame is used.' Supports the motion technique's premise and its quality cliff; refutes 'low hundreds' for the programmatic cap."
    },
    {
      "url": "https://arxiv.org/html/2404.01292v1",
      "result": "Read 2026-10-31 (Measuring Style Similarity in Diffusion Models). Table 1 style retrieval mAP@1: CLIP ViT-B/16 73.7 DomainNet / 52.2 WikiArt; DINO ViT-B/16 69.4 / 44.0; DINO ViT-B/8 72.2 / 46.9; the paper's style descriptor best in all but one case. The abstract notes existing tools 'focus on retrieving images of similar semantic content'. Refutes the self-supervised-over-text-aligned claim as stated."
    },
    {
      "source": "Arithmetic in techniques/motion-sampled-under-a-frame-budget.md",
      "result": "Recomputed: (10-1)/(4-1)=3, uniform; (10-1)/(9-1) is not an integer, gaps 1 and 2; with available-1 prime the divisors of available-1 admit only kept=2 or kept=available; 14-1=13 is prime. Consistent."
    },
    {
      "source": "Consuming tree of the react applications, at its 2026-10-31 HEAD",
      "result": "lib/themes.ts and app/library/Playground.tsx no longer exist. Ratchet helpers (statusOf, lockBlocker) now live in a domain package; compilePrompt is still in lib/stylePrompt.ts; the provider adapter still prepends the STYLE REFERENCES role statement and the no-negative-field clause at different line numbers; docs/imaging.md still records 67% vs 33%. Anchors stale, doctrine present."
    }
  ],
  "documents": {
    "visual-style-locking.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the motion-sampled-under-a-frame-budget bullet to the techniques list; the embedding clause now says general-purpose embeddings, text-aligned or self-supervised, are trained toward content and a descriptor trained for style is the better instrument."
    },
    "techniques/style-block-restated-every-call.md": {
      "disposition": "keep",
      "reason": "Procedure, override scoping and the dated boundary (references plus a restated core; text as the portable floor) are internally consistent and correctly scoped."
    },
    "techniques/approved-reference-sheet.md": {
      "disposition": "keep",
      "reason": "Window versus send count, approved-only references and the identity-sheet inversion are coherent; no unstable vendor figure is asserted."
    },
    "techniques/style-onboarding-from-sample.md": {
      "disposition": "keep",
      "reason": "Capture, coherence gate, house-style decomposition, the structure boundary and the pointer to the sampling middle case agree with each other and with the motion technique."
    },
    "techniques/draft-proofing-locked-ratchet.md": {
      "disposition": "keep",
      "reason": "Derived status, the lock gate, the one-way ratchet and named misses form a consistent state machine."
    },
    "techniques/rejections-as-negative-evidence.md": {
      "disposition": "keep",
      "reason": "Rejection never a reference, never counted against the window; consistent with the sheet technique."
    },
    "techniques/consistency-control-arm.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: replaced 'self-supervised embeddings separate style better than text-aligned ones' with the benchmark's finding (text-aligned outscored self-supervised on style retrieval, a style-trained descriptor beat both; prefer a style descriptor)."
    },
    "techniques/motion-sampled-under-a-frame-budget.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'low hundreds on a programmatic one' now reads 'one hundred to six hundred on a programmatic one, depending on the model's context window', per the vendor page."
    },
    "applications/next--motion-sampled-under-a-frame-budget.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (10-of-14 indices and gaps check out); the private tree and its probe were not reopened."
    },
    "applications/python--motion-sampled-under-a-frame-budget.md": {
      "disposition": "reverify",
      "reason": "Tables are internally consistent and limits are stated; the private pipeline and its selftest were not re-run."
    },
    "applications/react--draft-proofing-locked-ratchet.md": {
      "disposition": "reverify",
      "reason": "Every cited anchor (lib/themes.ts, app/library/Playground.tsx, app/library/presets.ts) is gone from the consuming tree after its rebuild; the ratchet now lives in a domain package with a changed status vocabulary. Needs re-anchoring against the current modules."
    },
    "applications/react--style-block-restated-every-call.md": {
      "disposition": "reverify",
      "reason": "Doctrine still present (compilePrompt, the STYLE REFERENCES role clause, the negative-as-prose clause, the 67% vs 33% probe), but Playground.tsx and MAX_REFS are gone and line anchors moved. Needs re-anchoring."
    }
  }
}
```

## Architecture review - 2026-10-31 (after re-verification)

This record follows the re-verification of applications at gravitone-gcloud@fd09c06; the two react applications changed since the previous record.

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/visual-style-locking",
  "date": "2026-10-31",
  "baseline": "a1e825611",
  "digest": "sha256-b2:dcb6f8bd5346d9ad",
  "disposition": "clarify",
  "coverage": "All 12 documents decided. Since the previous record, the two react applications changed (verified_on 2026-10-31, re-anchors, dated re-check sections); both were read in full and key anchors spot-checked at fd09c06 (style.ratchet.ts PROOF_CAP/SEND_REFS/PINNED_REFS, statusOf, lockBlocker; frames/look.ts:32-34; stylePrompt.ts:61-63). Techniques and the golden path are byte-unchanged since the previous record and keep their dispositions; the two motion applications keep reverify.",
  "trigger": "Pending: the subject had no architecture-review record.",
  "intended_benefit": "A batch of generated frames reads as one publication because the style is a ratified two-channel artifact restated on every call and measured against a control.",
  "failure_if_ignored": "Per-shot look drift, reference images read as content, silent stand-in styles, and consistency claims ratified by flattering samples.",
  "boundary": "Generation calls that mint new frames of a styled set. Not one-off images, not minimal edits of an existing render, not codegen from another product's shipped surface.",
  "counterexamples": [
    "A general text-aligned embedding (CLIP) outscored a self-supervised one (DINO) on style retrieval in a published benchmark, so 'self-supervised separates style better' does not hold as a default; a style-trained descriptor beat both.",
    "A 9-of-10 pick has gaps of 1 and 2 while a 4-of-10 pick has a uniform stride of 3: a larger sample is the less regular instrument.",
    "An agent that decodes the file measures cut timing and palette over every frame, so the frame budget binds only the naming, not the values.",
    "A one-video plate cut has no scene that earns its own register, so a tree with no style override is correct for its shape rather than missing a feature.",
    "A one-way ratchet can hold and tighten while the project-creation gate it served disappears: a project binding an unlocked style still draws it and only the receipt says 'not locked' (gravitone-gcloud@fd09c06)."
  ],
  "sources": [
    {
      "source": "gravitone-gcloud at fd09c06 (read, not executed)",
      "result": "packages/domain/src/style.ratchet.ts:52-59 PROOF_CAP = 14, SEND_REFS = 4, PINNED_REFS = 2; :127-131 statusOf derived from evidence and lock; :185 lockBlocker; packages/producers/src/frames/look.ts:32-34 'A style with a block that is not locked yet is still drawn in (the project chose it), and the receipt says \"not locked\"'; lib/stylePrompt.ts:61-63 compilePrompt unchanged. Supports both re-check sections."
    }
  ],
  "documents": {
    "visual-style-locking.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the motion-sampled-under-a-frame-budget bullet to the techniques list; the embedding clause now says general-purpose embeddings, text-aligned or self-supervised, are trained toward content and a descriptor trained for style is the better instrument."
    },
    "techniques/style-block-restated-every-call.md": {
      "disposition": "keep",
      "reason": "Procedure, override scoping and the dated boundary (references plus a restated core; text as the portable floor) are internally consistent and correctly scoped."
    },
    "techniques/approved-reference-sheet.md": {
      "disposition": "keep",
      "reason": "Window versus send count, approved-only references and the identity-sheet inversion are coherent; no unstable vendor figure is asserted."
    },
    "techniques/style-onboarding-from-sample.md": {
      "disposition": "keep",
      "reason": "Capture, coherence gate, house-style decomposition, the structure boundary and the pointer to the sampling middle case agree with each other and with the motion technique."
    },
    "techniques/draft-proofing-locked-ratchet.md": {
      "disposition": "keep",
      "reason": "Derived status, the lock gate, the one-way ratchet and named misses form a consistent state machine."
    },
    "techniques/rejections-as-negative-evidence.md": {
      "disposition": "keep",
      "reason": "Rejection never a reference, never counted against the window; consistent with the sheet technique."
    },
    "techniques/consistency-control-arm.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: replaced 'self-supervised embeddings separate style better than text-aligned ones' with the benchmark's finding (text-aligned outscored self-supervised on style retrieval, a style-trained descriptor beat both; prefer a style descriptor)."
    },
    "techniques/motion-sampled-under-a-frame-budget.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'low hundreds on a programmatic one' now reads 'one hundred to six hundred on a programmatic one, depending on the model's context window', per the vendor page."
    },
    "applications/next--motion-sampled-under-a-frame-budget.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (10-of-14 indices and gaps check out); the private tree and its probe were not reopened."
    },
    "applications/python--motion-sampled-under-a-frame-budget.md": {
      "disposition": "reverify",
      "reason": "Tables are internally consistent and limits are stated; the private pipeline and its selftest were not re-run."
    },
    "applications/react--draft-proofing-locked-ratchet.md": {
      "disposition": "clarify",
      "reason": "re-verified 2026-10-31 against gravitone-gcloud@fd09c06; the dated section's findings hold on spot-check. But it reports that two claims the body still states as the realization are reversed in the current tree ('locked is the state a project may be created against' and 'No stand-in theme is ever substituted by the resolver itself'), while the intro still says the studio 'implements the full lifecycle in one module, lib/themes.ts' and verified_on now reads 2026-10-31. Owed: frame the v1 sections as history in the intro, or restate the realization as the ratchet held and the creation gate and no-substitution rule not realized."
    },
    "applications/react--style-block-restated-every-call.md": {
      "disposition": "keep",
      "reason": "re-verified 2026-10-31 against gravitone-gcloud@fd09c06: adapter anchors re-numbered; the dated section says the knowledge-base anchors, labelling clause, exclusion translation and docs/imaging.md measurement hold, names Playground.tsx and MAX_REFS as removed, and points to the successor window constants (spot-checked at style.ratchet.ts:52-59) and the compiler (stylePrompt.ts:61-63). Its finding is confirmed, not reversed."
    }
  }
}
```
