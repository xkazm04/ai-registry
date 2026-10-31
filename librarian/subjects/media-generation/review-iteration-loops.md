---
domain: media-generation
subject: review-iteration-loops
last_touched: 2026-10-15
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

Applied to `gravity` as **code**, verdict **better**, **shipped** as `b256f24`. Its extract loop already
implements the rule's strong form independently - the critique schema requires the fix,
a shrug or an echo is rejected, and the loop ends rather than iterating on an
unactionable critique. The gap was downstream accounting: four settle causes collapse
into one boolean, and an abandoned replica takes the same progress credit as a
completed one.

The ship **corrected the experiment that proposed it**, and the technique is better for
it. The A/B's second measure - that an abandoned replica takes a completed one's progress
credit - looked like the defect and is not one: that consumer asks "will more work happen
here", for which an abandoned replica is genuinely finished, and the repo's own probe
already asserts the count is right. Committing it would have reintroduced a stall an
earlier fix had removed. The real cost was one layer on, where a replica's best frame is
promoted into the durable style catalogue as an exemplar with no record that the loop had
given up on it. The technique gained a **third consumer type** from the correction: one
that asks only whether more work remains, and is right to collapse every cause into a
boolean. Expect the cause to be needed at the door where findings become durable evidence,
not at the one where they become schedule.

### Still open

Whether the demotion's routing claim holds where both consumers exist. That tree has
one consumer of a settled replica; a pipeline surfacing investigations to a human
alongside blocking findings would exercise the half nothing has tested.

## 2026-10-15 - /deepen media-generation

- Golden path's divergence section gained **pricing**: loop economics ("two drafts, one retry") starve the phase before a direction is chosen; volume is the instrument there, cut an animatic early and generate against the cut; volume without a concept keeps the median (a 70k-clip campaign received as generic).
- NEW application `process--anchored-variation-slate`: practitioner anchors (all named outside references, none prompt-craft terms) and keep ratios, each graded; several figures single-source and flagged.

## Impact

- gravitone: 2 judged deviations stale; personas: 1 not-applicable stale. Maps regenerated and committed (dbad5b0, c5e4bf0890).

## Architecture review - 2026-10-31

First architecture review. Overall the subject holds: the ten techniques agree
with the golden path and with each other. The changes owed were evidence
scoping in the anchored slate (a text-concept study cited as if it measured
media, a single study called the oldest reliable result, choice overload stated
as universal), a misattributed Kalshi anchor, a holiday-campaign reception
told one-sidedly, and a golden-path technique list missing one entry. Two react
applications cite a consumer layout that has since moved and stay `reverify`.
Three application files carried concurrent uncommitted edits from another
session at review time; the first record's digest includes them, and this
review did not touch them. The first record is the decision before applying;
the second is after the clarify items were applied.

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/review-iteration-loops",
  "date": "2026-10-31",
  "baseline": "0f30830bc",
  "digest": "sha256-b2:15b0ff05d7134042",
  "disposition": "reverify",
  "trigger": "pending: no architecture-review record existed for this subject",
  "intended_benefit": "Keep reviewed work's approvals, verdicts and attribution intact through revision; answer notes with the smallest edit set.",
  "failure_if_ignored": "Regeneration presented as revision voids approvals, gate verdicts and ledgers while each new version looks fine.",
  "boundary": "Applies once a human has reviewed a version; the divergence phase before a pick and unreviewed drafts are explicitly outside the edit-plan ratchet.",
  "coverage": "All 17 documents read in full (golden path, 10 techniques, 6 applications). Load-bearing external claims checked against primary or first-party sources; consumer citations spot-checked at the current shallow clone only.",
  "counterexamples": [
    "A reviewer with a settled brief and an execution complaint gains nothing from a slate; it reopens design.",
    "A medium rendered from a symbolic source (score, parameter file) should be edited at the source and fully re-rendered; seam splicing solves the wrong side.",
    "A human triage queue must see unfixable findings at full consequence severity; demotion is only right on the machine path.",
    "A 70,000-clip campaign topped an audience ad-testing panel while being panned by critics: volume without a concept is not uniformly read as generic.",
    "Choice-overload harm is near zero on average across studies; a larger slate does not degrade choices when options are simple and preferences settled."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/abs/2604.21718",
      "result": "Abstract: critique quality 'in precision, recall, and constructiveness' 'directly governs downstream performance'. Supports critique-carries-its-fix's axes and attribution."
    },
    {
      "url": "https://arxiv.org/html/2405.02345v1",
      "result": "Ma et al.: 4,000 GPT-4 text design solutions, 5 topics; 8 temperature/top-P settings at a base prompt and 8 prompt techniques at fixed parameters; LLM outputs 'never exceeded the diversity of human crowdsourced design solutions'. Supports the finding; refutes 'sixteen ways of asking' and silent extension to rendered media."
    },
    {
      "url": "https://protolab.ucsd.edu/?p=3561",
      "result": "Dow et al. 2010 (TOCHI 17:4) via abstract listings: 33 participants, parallel condition outperformed on click-through and expert ratings with more diverse prototypes. Supports the claim at single-study strength, not 'oldest reliable result'."
    },
    {
      "url": "https://www.kellogg.northwestern.edu/faculty/research/detail/2015/when-product-assortment-leads-to-choice-overload-a-conceptual",
      "result": "Chernev, Bockenholt & Goodman 2015: effect significant 'when moderating variables are taken into account', four moderators incl. complexity and preference uncertainty; counter to Scheibehenne et al. 2010's near-zero mean. Refutes the unconditional overload sentence."
    },
    {
      "url": "https://threadreaderapp.com/thread/1932893260399456513",
      "result": "'300-400 generations to get 15 usable clips. One person, 2-3 days'; 'They love GTA VI. I grew up in Florida.'; no 'Florida man'. Supports the volume figure, refutes the news-genre anchor."
    },
    {
      "url": "https://system1group.com/ad-of-the-week/ai-or-no-ai-coke-gets-the-christmas-love",
      "result": "System1 Test Your Ad panel gave the 2025 'Holidays Are Coming' 5.9 stars, its maximum. With WSJ-via-reprint 70,000 clips, refutes 'received as generic' as the whole reception."
    },
    {
      "url": "https://elevenlabs.io/docs/api-reference/music/create-composition-plan/llms.txt",
      "result": "Per-chunk context_adherence (low/medium/high, default high) and source_from for kept sections. Supports partial-regeneration-seams."
    },
    {
      "source": "Consumer tree gravitone-gcloud at fd09c06 (shallow clone)",
      "result": "Read store.ts commitCycle, RECALIBRATE-PROMPT.md, lib/script/recalibrate.ts, lib/foundry/extract. Pinned commits 78fe0aa and 0e05c50 not resolvable."
    }
  ],
  "documents": {
    "review-iteration-loops.md": {
      "disposition": "clarify",
      "reason": "Doctrine is coherent and every technique is wired in, but the closing 'The techniques' list omits critique-carries-its-fix (frontmatter lists it). The 2025 holiday-campaign example says the spot was 'received as generic, because a selector with no concept... keeps the median'; reception was split (press largely negative, System1 panel 5.9 stars), and the campaign remade a strong existing concept, so the causal clause is not supported."
    },
    "techniques/anchored-variation-slate.md": {
      "disposition": "clarify",
      "reason": "Amplitude-vs-anchor mechanism is sound. Three evidence sentences overreach their sources: (1) the design-diversity study (Ma et al., arXiv 2405.02345) is text concepts from GPT-4, with 8 sampling settings and 8 prompt techniques varied separately, so 'sixteen ways of asking' miscounts what was asked; (2) 'oldest reliable result' for parallel prototyping rests on one 33-participant study (Dow et al. 2010); (3) choice overload is stated as universal, but meta-analyses find a near-zero mean effect that appears under moderators (complexity, preference uncertainty)."
    },
    "techniques/edit-plan-over-regeneration.md": {
      "disposition": "keep",
      "reason": "Operation vocabulary, byte-identity test, fixed-budget rule, re-gate-after-apply and the annotation form are internally consistent with refusal-as-valid-outcome and the golden path; boundary (unreviewed drafts, dead evidence base) is explicit."
    },
    "techniques/partial-regeneration-seams.md": {
      "disposition": "keep",
      "reason": "Kept-by-reference and per-section adherence confirmed against the vendor's current music composition-plan docs (per-chunk context_adherence low/medium/high, chunks referencing saved-song audio). Editorial-remedy table and reversal boundary are craft claims, bounded and stated with their limits."
    },
    "techniques/note-taxonomy-focus-scope-order.md": {
      "disposition": "keep",
      "reason": "Closed vocabulary with minimal operations, three-point connector re-check on moves, and aggregation rules agree with the sibling techniques; boundary routes evidence doubts to the follow-up channel."
    },
    "techniques/refusal-as-valid-outcome.md": {
      "disposition": "keep",
      "reason": "Enumerated refusal grounds, unchanged-as-verdict, named conflict winner and refuse-before-apply are consistent; the uncertain-guard override receipt is a correctly bounded exception."
    },
    "techniques/scope-vs-preference-signals.md": {
      "disposition": "keep",
      "reason": "Precedence rule with both-direction enforcement and the scope-to-scope recency carve-out is coherent; no unstable external claims."
    },
    "techniques/attribution-share-accounting.md": {
      "disposition": "keep",
      "reason": "Sum-to-runtime identity, computed seconds, declared attribution, three usage states and amend-not-rederive are internally consistent; the 2x/3x inflation case is a cited consumer measurement, not a general rate."
    },
    "techniques/follow-up-that-can-kill-a-fact.md": {
      "disposition": "keep",
      "reason": "Subtractive effect vocabulary, terminal unanswered state and kill propagation through the edit machinery are coherent and scoped away from rendering notes."
    },
    "techniques/critique-carries-its-fix.md": {
      "disposition": "keep",
      "reason": "Primary source re-read: arXiv 2604.21718 (Lin et al., CVPR 2026) abstract states critique quality 'in precision, recall, and constructiveness' 'directly governs downstream performance'. The per-axis ablation claim ('removing any one') goes slightly past what the abstract shows but matches the stated ablations. 1,080 wpm arithmetic checks. Consumer boundary is explicit."
    },
    "techniques/gate-record-outlives-the-media.md": {
      "disposition": "keep",
      "reason": "Keep/destroy split, copy-before-cull ordering, discharge marker and reading-end reconciliation are coherent. The 17/7/8/4/5 reconciliation counts are internally consistent (3 rows and frames agree on both sides)."
    },
    "applications/node--critique-carries-its-fix.md": {
      "disposition": "keep",
      "reason": "A concurrent uncommitted edit (not this review's) re-checked it at the consumer's fd09c06 and records moved paths and a now-existing reader of the mark; verdict unaffected. Not edited by this review."
    },
    "applications/node--gate-record-outlives-the-media.md": {
      "disposition": "keep",
      "reason": "A concurrent uncommitted edit (not this review's) records that commitCycle now writes the ledger before the cull. Independently confirmed this run at fd09c06: step (2) ledger write precedes step (3) cull, commented 'delete run media / thumbs only AFTER ledger write succeeded!'. Not edited by this review."
    },
    "applications/process--anchored-variation-slate.md": {
      "disposition": "clarify",
      "reason": "Kalshi row attributes a 'Florida man' news-genre anchor; the maker's thread names GTA VI ('They love GTA VI. I grew up in Florida.') and '10 wild characters', never 'Florida man'. The 70,000-clip row omits that System1's panel rated the spot 5.9 stars (its maximum), which matters to the 'volume without a concept' reading."
    },
    "applications/process--edit-plan-over-regeneration.md": {
      "disposition": "keep",
      "reason": "A concurrent uncommitted edit (not this review's) re-pinned the line ranges; this run confirmed 'THE RULE: EDIT, DO NOT REGENERATE' at line 13, 'Your output is a list of edits, not a script.' at 34, 'refused wholesale' at 109 and the tell at 172 in the consumer's current prompt."
    },
    "applications/react--edit-plan-over-regeneration.md": {
      "disposition": "reverify",
      "reason": "Citations pinned to 78fe0aa, which this shallow clone cannot resolve; app/_phases/script/ no longer exists and editPlan.ts lives at lib/script/editPlan.ts. A later probe named chain-break-reaches-the-reviewer suggests the 'no surface renders chainBreaks' limit has since closed. Evidence needed: full-history clone to confirm the pin, then a currency note on the surfaced chain breaks."
    },
    "applications/react--refusal-as-valid-outcome.md": {
      "disposition": "reverify",
      "reason": "No commit pinned; app/_phases/script/recalibrate.ts moved to lib/script/recalibrate.ts and cited line numbers drifted (guardNotes now at 83, inertNotes at 45). The quoted 'bypass' header text survives. Evidence needed: re-cite every line range against a pinned current commit."
    }
  }
}
```

Applied the same day: the three clarify items above, each from a primary source
opened in this run.

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/review-iteration-loops",
  "date": "2026-10-31",
  "baseline": "0f30830bc",
  "digest": "sha256-b2:c8e5daa9280bf290",
  "disposition": "reverify",
  "trigger": "pending: no architecture-review record existed for this subject",
  "intended_benefit": "Keep reviewed work's approvals, verdicts and attribution intact through revision; answer notes with the smallest edit set.",
  "failure_if_ignored": "Regeneration presented as revision voids approvals, gate verdicts and ledgers while each new version looks fine.",
  "boundary": "Applies once a human has reviewed a version; the divergence phase before a pick and unreviewed drafts are explicitly outside the edit-plan ratchet.",
  "coverage": "All 17 documents read in full (golden path, 10 techniques, 6 applications). Load-bearing external claims checked against primary or first-party sources; consumer citations spot-checked at the current shallow clone only.",
  "counterexamples": [
    "A reviewer with a settled brief and an execution complaint gains nothing from a slate; it reopens design.",
    "A medium rendered from a symbolic source (score, parameter file) should be edited at the source and fully re-rendered; seam splicing solves the wrong side.",
    "A human triage queue must see unfixable findings at full consequence severity; demotion is only right on the machine path.",
    "A 70,000-clip campaign topped an audience ad-testing panel while being panned by critics: volume without a concept is not uniformly read as generic.",
    "Choice-overload harm is near zero on average across studies; a larger slate does not degrade choices when options are simple and preferences settled."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/abs/2604.21718",
      "result": "Abstract: critique quality 'in precision, recall, and constructiveness' 'directly governs downstream performance'. Supports critique-carries-its-fix's axes and attribution."
    },
    {
      "url": "https://arxiv.org/html/2405.02345v1",
      "result": "Ma et al.: 4,000 GPT-4 text design solutions, 5 topics; 8 temperature/top-P settings at a base prompt and 8 prompt techniques at fixed parameters; LLM outputs 'never exceeded the diversity of human crowdsourced design solutions'. Supports the finding; refutes 'sixteen ways of asking' and silent extension to rendered media."
    },
    {
      "url": "https://protolab.ucsd.edu/?p=3561",
      "result": "Dow et al. 2010 (TOCHI 17:4) via abstract listings: 33 participants, parallel condition outperformed on click-through and expert ratings with more diverse prototypes. Supports the claim at single-study strength, not 'oldest reliable result'."
    },
    {
      "url": "https://www.kellogg.northwestern.edu/faculty/research/detail/2015/when-product-assortment-leads-to-choice-overload-a-conceptual",
      "result": "Chernev, Bockenholt & Goodman 2015: effect significant 'when moderating variables are taken into account', four moderators incl. complexity and preference uncertainty; counter to Scheibehenne et al. 2010's near-zero mean. Refutes the unconditional overload sentence."
    },
    {
      "url": "https://threadreaderapp.com/thread/1932893260399456513",
      "result": "'300-400 generations to get 15 usable clips. One person, 2-3 days'; 'They love GTA VI. I grew up in Florida.'; no 'Florida man'. Supports the volume figure, refutes the news-genre anchor."
    },
    {
      "url": "https://system1group.com/ad-of-the-week/ai-or-no-ai-coke-gets-the-christmas-love",
      "result": "System1 Test Your Ad panel gave the 2025 'Holidays Are Coming' 5.9 stars, its maximum. With WSJ-via-reprint 70,000 clips, refutes 'received as generic' as the whole reception."
    },
    {
      "url": "https://elevenlabs.io/docs/api-reference/music/create-composition-plan/llms.txt",
      "result": "Per-chunk context_adherence (low/medium/high, default high) and source_from for kept sections. Supports partial-regeneration-seams."
    },
    {
      "source": "Consumer tree gravitone-gcloud at fd09c06 (shallow clone)",
      "result": "Read store.ts commitCycle, RECALIBRATE-PROMPT.md, lib/script/recalibrate.ts, lib/foundry/extract. Pinned commits 78fe0aa and 0e05c50 not resolvable."
    }
  ],
  "documents": {
    "review-iteration-loops.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added critique-carries-its-fix to 'The techniques' list; holiday-campaign sentence now states the split reception (press negative, top audience-panel score) instead of the unsupported causal clause."
    },
    "techniques/anchored-variation-slate.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: design-diversity study scoped to text concepts from one model with settings and techniques varied separately ('sixteen configurations, eight of them ways of asking'); parallel prototyping cited as the 2010 33-designer study; choice overload qualified as conditional on complexity and preference uncertainty."
    },
    "techniques/edit-plan-over-regeneration.md": {
      "disposition": "keep",
      "reason": "Operation vocabulary, byte-identity test, fixed-budget rule, re-gate-after-apply and the annotation form are internally consistent with refusal-as-valid-outcome and the golden path; boundary (unreviewed drafts, dead evidence base) is explicit."
    },
    "techniques/partial-regeneration-seams.md": {
      "disposition": "keep",
      "reason": "Kept-by-reference and per-section adherence confirmed against the vendor's current music composition-plan docs (per-chunk context_adherence low/medium/high, chunks referencing saved-song audio). Editorial-remedy table and reversal boundary are craft claims, bounded and stated with their limits."
    },
    "techniques/note-taxonomy-focus-scope-order.md": {
      "disposition": "keep",
      "reason": "Closed vocabulary with minimal operations, three-point connector re-check on moves, and aggregation rules agree with the sibling techniques; boundary routes evidence doubts to the follow-up channel."
    },
    "techniques/refusal-as-valid-outcome.md": {
      "disposition": "keep",
      "reason": "Enumerated refusal grounds, unchanged-as-verdict, named conflict winner and refuse-before-apply are consistent; the uncertain-guard override receipt is a correctly bounded exception."
    },
    "techniques/scope-vs-preference-signals.md": {
      "disposition": "keep",
      "reason": "Precedence rule with both-direction enforcement and the scope-to-scope recency carve-out is coherent; no unstable external claims."
    },
    "techniques/attribution-share-accounting.md": {
      "disposition": "keep",
      "reason": "Sum-to-runtime identity, computed seconds, declared attribution, three usage states and amend-not-rederive are internally consistent; the 2x/3x inflation case is a cited consumer measurement, not a general rate."
    },
    "techniques/follow-up-that-can-kill-a-fact.md": {
      "disposition": "keep",
      "reason": "Subtractive effect vocabulary, terminal unanswered state and kill propagation through the edit machinery are coherent and scoped away from rendering notes."
    },
    "techniques/critique-carries-its-fix.md": {
      "disposition": "keep",
      "reason": "Primary source re-read: arXiv 2604.21718 (Lin et al., CVPR 2026) abstract states critique quality 'in precision, recall, and constructiveness' 'directly governs downstream performance'. The per-axis ablation claim ('removing any one') goes slightly past what the abstract shows but matches the stated ablations. 1,080 wpm arithmetic checks. Consumer boundary is explicit."
    },
    "techniques/gate-record-outlives-the-media.md": {
      "disposition": "keep",
      "reason": "Keep/destroy split, copy-before-cull ordering, discharge marker and reading-end reconciliation are coherent. The 17/7/8/4/5 reconciliation counts are internally consistent (3 rows and frames agree on both sides)."
    },
    "applications/node--critique-carries-its-fix.md": {
      "disposition": "keep",
      "reason": "A concurrent uncommitted edit (not this review's) re-checked it at the consumer's fd09c06 and records moved paths and a now-existing reader of the mark; verdict unaffected. Not edited by this review."
    },
    "applications/node--gate-record-outlives-the-media.md": {
      "disposition": "keep",
      "reason": "A concurrent uncommitted edit (not this review's) records that commitCycle now writes the ledger before the cull. Independently confirmed this run at fd09c06: step (2) ledger write precedes step (3) cull, commented 'delete run media / thumbs only AFTER ledger write succeeded!'. Not edited by this review."
    },
    "applications/process--anchored-variation-slate.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: Kalshi anchor corrected to GTA VI plus the maker's Florida (no 'Florida man'); 70,000-clip row gains System1's 5.9-star panel score. verified_on unchanged (not every citation re-checked)."
    },
    "applications/process--edit-plan-over-regeneration.md": {
      "disposition": "keep",
      "reason": "A concurrent uncommitted edit (not this review's) re-pinned the line ranges; this run confirmed 'THE RULE: EDIT, DO NOT REGENERATE' at line 13, 'Your output is a list of edits, not a script.' at 34, 'refused wholesale' at 109 and the tell at 172 in the consumer's current prompt."
    },
    "applications/react--edit-plan-over-regeneration.md": {
      "disposition": "reverify",
      "reason": "Citations pinned to 78fe0aa, which this shallow clone cannot resolve; app/_phases/script/ no longer exists and editPlan.ts lives at lib/script/editPlan.ts. A later probe named chain-break-reaches-the-reviewer suggests the 'no surface renders chainBreaks' limit has since closed. Evidence needed: full-history clone to confirm the pin, then a currency note on the surfaced chain breaks."
    },
    "applications/react--refusal-as-valid-outcome.md": {
      "disposition": "reverify",
      "reason": "No commit pinned; app/_phases/script/recalibrate.ts moved to lib/script/recalibrate.ts and cited line numbers drifted (guardNotes now at 83, inertNotes at 45). The quoted 'bypass' header text survives. Evidence needed: re-cite every line range against a pinned current commit."
    }
  }
}
```
