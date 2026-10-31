---
domain: game-production
subject: aaa-craft-rubric-authoring
last_touched: 2026-10-31
touched_by: architecture-review
dry_streak: 0
---

# aaa-craft-rubric-authoring

## Architecture review - 2026-09-09

Read all 14 documents. Corrected overlap arithmetic, evidence sufficiency,
ceiling policy, calibration and source-applicability claims. All four applications
retain explicit reverify decisions.

Consumer implementation claims and historical measurements remain reverify work.
The digest binds the reviewed working-tree content, not a new runtime witness.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/aaa-craft-rubric-authoring",
  "date": "2026-09-09",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:52b4f1406ea51e0f",
  "disposition": "clarify",
  "coverage": "All 14 owned documents read and assessed. Source checks are scoped below. No consumer code, engine run, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "Repeating score 1 changes the lowest-two mean from 2.5 for [1,4,4] to 1 for [1,1,4,4]; only an exact minimum has this duplication invariance.",
    "A filmstrip can omit a between-frame defect and cannot establish curve contents.",
    "A current product reference can change without a rubric edit unless the specimen is pinned.",
    "A type-specific ceiling can be reached while a release bar remains unmet.",
    "Existing scan paths can be empty or bypassed by indirect imports; path existence is not complete isolation proof."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/abs/2306.05685",
      "scope": "Primary abstract: position, verbosity and self-enhancement bias in evaluated conversational judges; no game-craft replication."
    },
    {
      "url": "https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html",
      "scope": "3:1 scope and exceptions for required visual information; no game-art or consumer UI certification."
    },
    {
      "url": "https://tech.ebu.ch/publications/r128",
      "scope": "Publication target -23 LUFS; does not identify or validate the unnamed platform specification in the historical application."
    }
  ],
  "documents": {
    "aaa-craft-rubric-authoring.md": {
      "disposition": "clarify",
      "reason": "Qualify fixed-reference grading, empirical prescriptions, calibration and diagnostic claims."
    },
    "techniques/capped-disqualifiers.md": {
      "disposition": "clarify",
      "reason": "Treat cap counts as convention and distinguish missing measurements, detection uncertainty and applicability."
    },
    "techniques/ceiling-as-a-market-assumption.md": {
      "disposition": "clarify",
      "reason": "Separate observed quality from policy ceiling; remove permanent capability forecasts and causal distribution claims."
    },
    "techniques/checkable-against-the-stored-artifact.md": {
      "disposition": "clarify",
      "reason": "Define sufficient evidence packages, sampling limits, disagreement diagnosis and authorized routing."
    },
    "techniques/criterion-set-coverage-audit.md": {
      "disposition": "clarify",
      "reason": "Remove unsourced effect size and prevent partial coverage disclosure from authorizing release."
    },
    "techniques/criterion-with-a-cited-source.md": {
      "disposition": "clarify",
      "reason": "Qualify criterion-count heuristics, permit multiple sources and retain healthy requirements."
    },
    "techniques/deliberately-overlapping-criteria.md": {
      "disposition": "clarify",
      "reason": "Correct lowest-k duplicate sensitivity; qualify evidence for overlap and require adjudicated finding merges."
    },
    "techniques/lens-versioning-as-invalidation.md": {
      "disposition": "clarify",
      "reason": "Preserve historical standing and bind editorial changes, active runs and pilot observations to exact snapshots."
    },
    "techniques/named-benchmark-anchors-per-level.md": {
      "disposition": "clarify",
      "reason": "Require pinned exemplars and replace process-label anchors and unsupported distribution diagnostics."
    },
    "techniques/question-form-criteria-for-open-judgment.md": {
      "disposition": "clarify",
      "reason": "Qualify artifact-only viewer inference, disagreement attribution and separate-call/cap guarantees."
    },
    "applications/node--deliberately-overlapping-criteria.md": {
      "disposition": "reverify",
      "reason": "Reverify code isolation, overlap calibration and contrast applicability; historical witness unchanged."
    },
    "applications/process--ceiling-as-a-market-assumption.md": {
      "disposition": "reverify",
      "reason": "Reverify ceiling forecasts, duplicate policy sources and inconsistent A2/A3 display example."
    },
    "applications/process--checkable-against-the-stored-artifact.md": {
      "disposition": "reverify",
      "reason": "Reverify contradictory routing example and limits of filmstrip evidence."
    },
    "applications/process--criterion-with-a-cited-source.md": {
      "disposition": "reverify",
      "reason": "Reverify unnamed loudness source, talks and implementation; scope external judge research."
    }
  }
}
```

## Architecture review - 2026-09-10 (re-review after the compression revert)

Read all 14 documents at current bytes. The 2026-09-09 record described documents that
no longer exist in that form: the compression half was reverted and the corrective half
kept, so most of what that record listed as `clarify` work is now *present in the text* —
the ceiling-policy hedges, the calibration qualifications, the duplication-invariance
arithmetic and the source-applicability caveats are all in the current documents. I
therefore retract that record's blanket `clarify` on the nine techniques: they were
clarified, and re-issuing the same disposition would be reviewing a diff rather than a
subject.

The lowest-k arithmetic in `deliberately-overlapping-criteria` checks out
([1,4,4] has a lowest-two mean of 2.5, [1,1,4,4] of 1, and only an exact minimum is
invariant to a repeated score), so that correction is sound as written.

Two findings survive, and both are ones a reviewer can settle from the corpus alone.
**The criterion-count band has three different values inside one subject.** The golden
path says "Seven to twelve is a starting convention"; `criterion-with-a-cited-source`
says "Nine to twelve criteria is an authoring convention"; and
`process--criterion-with-a-cited-source` reads nine per lens as "at the top of the band",
which is true under neither of the other two. This subject carries
`one-authority-per-quantity` on three of its own techniques; the band is a quantity with
three owners here. **And the pilot-step language still crosses two grains** — the golden
path's step 8 calls a known-good/known-bad pair a smoke check and then points at a
held-out set for calibration, while `capped-disqualifiers` and
`lens-versioning-as-invalidation` both speak of "the pilot" as the thing that promotes a
cap and as the period during which verdicts are calibration observations. Those are
compatible readings but nothing names the boundary.

I read source for the four applications rather than executing anything, against the
`pof` working tree at `pof` (read-only; no build, no test run, no
model call). That resolved three items the previous record left open.

`src/lib/craft/lens-map.ts` **contradicts the routing claim the application quotes.**
`TEXT_CLASSES` is `['text-config','graph-data']` at line 54 and `lensForStep` consults the
catalog override sets only for those (line 84) — but line 88 is a separate branch,
`if (deliverable === 'audio' && VOICEOVER_AUDIO_CATALOGS.has(catalogId)) return 'voiceover'`,
which is a media-class override reached without any text class. So the module's own header
sentence "Overrides never apply to media classes, so a lens can never be dodged by
re-labelling", which `process--checkable-against-the-stored-artifact` reproduces as an
implementation fact, is falsified by the same module. The registry's own golden path and
`checkable-against-the-stored-artifact` already hedge this correctly ("a text-only
override allowlist is one implementation policy"); it is the application that repeats an
overstated repo comment. That is the change worth making, and it is a change to what the
application claims about the repo, not to the standard.

`src/lib/status/craft.ts:160` carries the comment `/** Spoken form for aria/tooltip:
"A3 AA · at ceiling — <because>". */` beside a badge suffix `^` that renders a mesh at its
roof as `A2^`. The A2/A3 mismatch flagged on 2026-09-09 is therefore *upstream*: the
application quotes the repo faithfully and the inconsistency lives in the repo's doc
comment. That closes the question of whose defect it is without closing the defect.

`src/lib/craft/lenses/audio.md:38` does name the source the previous record called
unidentified: "Sony's platform-wide recommendation is −24 LKFS (±2 LU) with true peak
≤ −1 dBTP". A web check corroborates a Sony ASWG recommendation at −24 LKFS ±2 LU with
true peak ≤ −1 dBTP, and that LKFS and LUFS are the same unit. So the figure is traceable
and the application's "does not identify precisely" is now a statement the application
could stop making. What does not change is the point the document is making with it: EBU
R128's −23 LUFS programme target is a different delivery medium, so applicability still
has to be argued per criterion.

What I did not evaluate: no consumer code executed, no model judged, no rubric piloted,
no historical incident replayed, no maturity or witness date refreshed. The four
applications' line-number citations were not re-checked against current `pof` bytes
except where quoted above.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/aaa-craft-rubric-authoring",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:112b068540a8ca2e",
  "disposition": "clarify",
  "coverage": "All 14 owned documents read at current bytes. Source read (not executed) for the four applications against the pof working tree; one web check on the Sony loudness figure. Not evaluated: any consumer code run, any model judgment, any pilot or calibration, any historical incident replay, any witness-date refresh.",
  "counterexamples": [
    "A rubric author following this subject cannot derive one criterion-count band: the golden path says seven to twelve, the technique says nine to twelve, and the application calls nine 'at the top of the band'.",
    "lens-map.ts routes cutscene audio to the voiceover lens through a branch that never consults TEXT_CLASSES, so 'overrides never apply to media classes' is false in the very implementation the subject cites as its worked example.",
    "A ceiling rendered as an achievement badge (A2^) beside a spoken form naming a different level (A3 AA) is a display the subject's own rendering rule does not cover.",
    "The subject tells an author to pilot against a known-good/known-bad pair and simultaneously that such a pair is only a smoke check; nothing states which grain promotes a disqualifier."
  ],
  "sources": [
    {
      "url": "http://gameaudiopodcast.com/ASWG-R001.pdf",
      "result": "Corroborates a Sony ASWG average-loudness recommendation of -24 LKFS (+/-2 LU) with true peak <= -1 dBTP, so the audio lens's figure is traceable to a named specification. Read via search summary, not fetched in full; establishes nothing about whether that recommendation governs this project's stored stems."
    },
    {
      "url": "https://tech.ebu.ch/publications/r128",
      "result": "The -23 LUFS programme target is a broadcast delivery figure, which is why -24 LKFS cannot be treated as universal. Does not adjudicate any game-audio criterion."
    },
    {
      "url": "https://arxiv.org/abs/2306.05685",
      "result": "Position, verbosity and self-enhancement bias in evaluated conversational judges. Motivates local calibration; validates no criterion-count threshold and no claim about game-craft rubrics."
    }
  ],
  "documents": {
    "aaa-craft-rubric-authoring.md": {
      "disposition": "clarify",
      "reason": "Criterion-count band (seven to twelve) disagrees with the technique's nine to twelve and with the application's reading of nine; pick one owner. Pilot-versus-smoke-check grain is unnamed."
    },
    "techniques/capped-disqualifiers.md": {
      "disposition": "keep",
      "reason": "Cap-as-level, non-stacking and the missing-measurement state are all stated correctly; the 2026-09-09 corrections are present in the text."
    },
    "techniques/ceiling-as-a-market-assumption.md": {
      "disposition": "keep",
      "reason": "Three-way classification, dated arguable ceilings and the achievement-versus-invalidation precedence read correctly; retracts the earlier clarify, which has been applied."
    },
    "techniques/checkable-against-the-stored-artifact.md": {
      "disposition": "keep",
      "reason": "Evidence-package sufficiency, the absent-evidence rule and the correctly hedged override policy are all present."
    },
    "techniques/criterion-set-coverage-audit.md": {
      "disposition": "keep",
      "reason": "Independence of the enumeration, the unmeasured rendering rule and the channel's non-scoring routing are stated without an unsourced effect size."
    },
    "techniques/criterion-with-a-cited-source.md": {
      "disposition": "clarify",
      "reason": "States nine to twelve where the golden path states seven to twelve; one of the two must give, and this subject's own one-authority law makes it a defect rather than a nuance."
    },
    "techniques/deliberately-overlapping-criteria.md": {
      "disposition": "keep",
      "reason": "Lowest-k duplication arithmetic verified as written; merge-by-identity, adjudicated severity and the exclusion trade are all stated with their costs."
    },
    "techniques/lens-versioning-as-invalidation.md": {
      "disposition": "keep",
      "reason": "Editorial-versus-semantic split, run-start pinning and the two invalidation axes read correctly."
    },
    "techniques/named-benchmark-anchors-per-level.md": {
      "disposition": "keep",
      "reason": "Pinned specimens, the process-label rejection and the distribution caveat are present; no remaining unsupported diagnostic."
    },
    "techniques/question-form-criteria-for-open-judgment.md": {
      "disposition": "keep",
      "reason": "Four-part form, the not-answerable state and the qualified separate-call claim are all correct as written."
    },
    "applications/node--deliberately-overlapping-criteria.md": {
      "disposition": "reverify",
      "reason": "Display-only isolation still rests on a path-scan whose non-vacuity was not established; overlap pairs remain authored rather than piloted. Cited revision 9aa31407 not re-executed."
    },
    "applications/process--ceiling-as-a-market-assumption.md": {
      "disposition": "clarify",
      "reason": "The A2 badge / A3 spoken-form mismatch is now located in src/lib/status/craft.ts:160 rather than in this document; say so, and keep the permanent-ceiling forecasts marked as dated product assumptions."
    },
    "applications/process--checkable-against-the-stored-artifact.md": {
      "disposition": "clarify",
      "reason": "lens-map.ts line 88 routes an audio catalog to the voiceover lens without consulting TEXT_CLASSES, so the quoted 'overrides never apply to media classes' claim is falsified by the module it cites."
    },
    "applications/process--criterion-with-a-cited-source.md": {
      "disposition": "clarify",
      "reason": "The loudness source is identifiable — the lens names Sony's -24 LKFS (+/-2 LU) recommendation, corroborated externally — so the 'does not identify precisely' hedge can be replaced by the citation while keeping the applicability caveat."
    }
  }
}
```

## Intake - 2026-09-16 (find-me-a-freaking-job)

- `lens-versioning-as-invalidation` gained the section "Injected context: evidence or steering". A repository source deliberately kept reviewer rejections out of its verdict validity key, which inverts the file's "if it could change a grade, bump" for inputs meant to act forward-only. The discriminator is whether a finding can rest on the input.
- Applied to pof as an experiment, verdict better. Of 143 bound panel verdicts with siblings, 131 had a sibling updated since judgment: full binding stales 131, per-dimension (coherence weakest) 13, as built 0. The application is `applications/node--lens-versioning-as-invalidation.md`.
- Independent convergence: the same source shows stale scores faded rather than blanked, which matches "display stale-under-current-policy separately from never judged".
- Owed in pof: a digest of the sibling projection on each verdict. Until then drift is measured from modification times, which overstates it.

## Architecture review - 2026-10-31

Re-review at `b005a97cb`. The four clarify items the 2026-09-10 record owed are all
still in the text. Since then the subject gained four `pof` applications and the
injected-context section of `lens-versioning-as-invalidation`. ASWG-R001 was opened
in full this run. It names the loudness source the cited-source application left
unidentified, and it narrows that source's scope: whole title, home platform, at
least 30 minutes of measurement. The `pof` checkout is not on this machine, so the
2026-09-10 consumer readings (lens-map line 88, craft.ts:160) are carried as that
record's evidence and are not re-witnessed here.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/aaa-craft-rubric-authoring",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:30e56086d6ef6162",
  "disposition": "clarify",
  "coverage": "All 18 current documents read in full at baseline. The 14 carried from the 2026-09-10 record were checked by diff against 44c899658: only capped-disqualifiers (write-door rule) and lens-versioning-as-invalidation (injected-context section) changed; four applications were added. One primary source (ASWG-R001) opened and quoted; internal arithmetic recomputed. Not evaluated: the pof consumer (absent on this machine), any model judgment, pilot or private run. No verification date refreshed.",
  "counterexamples": [
    "A rubric author cannot derive one criterion-count band: the golden path says seven to twelve, the cited-source technique nine to twelve, and its application calls nine 'the top of the band' (carried from 2026-09-10, still present at baseline).",
    "The routing application lists cutscene audio routed to the voiceover lens while quoting a header that says overrides never apply to media classes; both cannot be implementation facts.",
    "ASWG-R001's -24 LKFS is a whole-title, home-platform, 30-minute-minimum measurement; a criterion checking it against one stored stem is an adaptation, not the specification.",
    "'Nothing in the class reaches its ceiling -> investigate production, not the rubric' contradicts the golden path's own rule that a distribution alone does not identify its cause.",
    "Full binding cleared 131 of 143 verdicts, passes included; calling that '92% of the standing condemnations' mislabels the population."
  ],
  "sources": [
    {
      "url": "http://gameaudiopodcast.com/ASWG-R001.pdf",
      "result": "Opened and read 2026-10-31 (pages 1-6). Sony Worldwide Studios Audio Standards Working Group, Recommendation ASWG-R001 v1.10, August 2013: 'the Average Loudness Level of audio content within a title developed for home-based SCE platforms should be normalized to a Target Level of -24 (±2) LKFS'; portable platforms -18 (±2) LKFS; maximum true peak 'should not exceed -1 dBTP'; content 'should be measured as a whole' for 'a minimum of 30 minutes'. Identifies the source the application left unnamed, and narrows its scope to whole-title home-platform measurement rather than per-file stems."
    },
    {
      "source": "Internal arithmetic, node--lens-versioning-as-invalidation and techniques/lens-versioning-as-invalidation",
      "result": "131/143 = 91.6%, so '92%' is a share of the 143 bound verdicts (fails and passes), not of 'the standing condemnations'; 131 + 21 = 152 and 131 - 13 = 118 check out."
    },
    {
      "source": "Internal arithmetic, process--capped-disqualifiers",
      "result": "47 caps at A1 and 3 at A2 over A1-A4: above-cap gauges 47x3 + 3x2 = 147, at-or-below 47 + 6 = 53, total 200 = 50 x 4. Consistent."
    },
    {
      "source": "pof consumer checkout",
      "result": "Not available on this machine. No application citation, line number or private run was re-checked; the 2026-09-10 pof readings are carried as that record's evidence, not re-witnessed."
    }
  ],
  "documents": {
    "aaa-craft-rubric-authoring.md": {
      "disposition": "clarify",
      "reason": "Owed since 2026-09-10 and still present: the seven-to-twelve band has rival owners in the technique and application, and 'pilot' versus 'smoke check' grains are unnamed while two techniques promote caps and end pre-release on 'the pilot'."
    },
    "techniques/capped-disqualifiers.md": {
      "disposition": "clarify",
      "reason": "The new write-door rule (since 2026-09-10) is sound. 'Before you have piloted a lens against known-good and known-bad artifacts' reads as the pair the golden path calls only a smoke check; name the held-out set."
    },
    "techniques/ceiling-as-a-market-assumption.md": {
      "disposition": "clarify",
      "reason": "'Reading the ceiling as an instrument' asserts causes ('Investigate production, not the rubric'; 'the ceiling is set too low') that the golden path's closing section says a distribution cannot identify. Hedge to leads."
    },
    "techniques/checkable-against-the-stored-artifact.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep; override policy already hedged as same-shape rather than text-only."
    },
    "techniques/criterion-set-coverage-audit.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep."
    },
    "techniques/criterion-with-a-cited-source.md": {
      "disposition": "clarify",
      "reason": "Owed since 2026-09-10: 'Nine to twelve' rivals the golden path's seven to twelve; defer to the golden path as the band's one owner."
    },
    "techniques/deliberately-overlapping-criteria.md": {
      "disposition": "keep",
      "reason": "Unchanged; lowest-k arithmetic re-checked ([1,4,4] -> 2.5, [1,1,4,4] -> 1)."
    },
    "techniques/lens-versioning-as-invalidation.md": {
      "disposition": "clarify",
      "reason": "The steering/evidence section added 2026-09-16 is the strongest addition, but 'silencing 92% of the standing condemnations' mislabels 131 of 143 bound verdicts (fails and passes)."
    },
    "techniques/named-benchmark-anchors-per-level.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep."
    },
    "techniques/question-form-criteria-for-open-judgment.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep."
    },
    "applications/node--deliberately-overlapping-criteria.md": {
      "disposition": "clarify",
      "reason": "Repeats the 'overrides restricted to TEXT_CLASSES' header as the routing fact while a sibling application lists an audio-to-voiceover override; display-only isolation remains reverify (revision 9aa31407 not re-executed)."
    },
    "applications/node--lens-versioning-as-invalidation.md": {
      "disposition": "clarify",
      "reason": "Arithmetic consistent, but 'arm C would have cleared the whole condemnation layer' and '118 ... that no sibling edit can falsify' overstate what the table and its own weakest-dimension caveat support. Private store not re-run."
    },
    "applications/process--capped-disqualifiers.md": {
      "disposition": "reverify",
      "reason": "New since 2026-09-10. Arithmetic checks (147 above cap, 53 at or below, 200 total). Shipped commit 8481218a and its tests are in a private tree that was not reopened."
    },
    "applications/process--ceiling-as-a-market-assumption.md": {
      "disposition": "reverify",
      "reason": "The A2^ badge / 'A3 AA' spoken-form mismatch is still unlocated in the text; the 2026-09-10 reading placed it in the consumer's doc comment, but the consumer could not be reopened this run to confirm before editing."
    },
    "applications/process--checkable-against-the-stored-artifact.md": {
      "disposition": "clarify",
      "reason": "Owed since 2026-09-10: the quoted 'overrides never apply to media classes' contradicts the same document's cutscene-audio-to-voiceover override; state the module's real rule as same-medium refinement."
    },
    "applications/process--criterion-set-coverage-audit.md": {
      "disposition": "reverify",
      "reason": "New since 2026-09-10; internally consistent and honest about the unrun enumeration half. Shipped commit 23196728 not reopened."
    },
    "applications/process--criterion-with-a-cited-source.md": {
      "disposition": "clarify",
      "reason": "Owed since 2026-09-10: name the loudness source (now opened: ASWG-R001) and its scope, and fix 'top of the band' against the golden path's band."
    },
    "applications/process--named-benchmark-anchors-per-level.md": {
      "disposition": "clarify",
      "reason": "New since 2026-09-10. 'Twenty-nine of thirty ... name at least one titled product except one' double-counts the exception; counts otherwise consistent (10 x 4 = 40, 30 upper). Commit eef0b7e4 not reopened."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied every clarify item from the record above in the subject's own voice. Grounds:
ASWG-R001 opened this run, the subject's own text, and arithmetic. Edited applications
are recorded `keep`, with their consumer evidence noted as not re-witnessed. The three
untouched applications keep `reverify`, because their evidence is in a tree this machine
cannot open. The ceiling application's A2/A3 mismatch stays owed for the same reason.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/aaa-craft-rubric-authoring",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:294445ba9734200c",
  "disposition": "reverify",
  "coverage": "All 18 current documents read in full at baseline. The 14 carried from the 2026-09-10 record were checked by diff against 44c899658: only capped-disqualifiers (write-door rule) and lens-versioning-as-invalidation (injected-context section) changed; four applications were added. One primary source (ASWG-R001) opened and quoted; internal arithmetic recomputed. Not evaluated: the pof consumer (absent on this machine), any model judgment, pilot or private run. Ten documents edited after the first record and re-read; the rest byte-unchanged. No verification date refreshed.",
  "counterexamples": [
    "A rubric author cannot derive one criterion-count band: the golden path says seven to twelve, the cited-source technique nine to twelve, and its application calls nine 'the top of the band' (carried from 2026-09-10, still present at baseline).",
    "The routing application lists cutscene audio routed to the voiceover lens while quoting a header that says overrides never apply to media classes; both cannot be implementation facts.",
    "ASWG-R001's -24 LKFS is a whole-title, home-platform, 30-minute-minimum measurement; a criterion checking it against one stored stem is an adaptation, not the specification.",
    "'Nothing in the class reaches its ceiling -> investigate production, not the rubric' contradicts the golden path's own rule that a distribution alone does not identify its cause.",
    "Full binding cleared 131 of 143 verdicts, passes included; calling that '92% of the standing condemnations' mislabels the population."
  ],
  "sources": [
    {
      "url": "http://gameaudiopodcast.com/ASWG-R001.pdf",
      "result": "Opened and read 2026-10-31 (pages 1-6). Sony Worldwide Studios Audio Standards Working Group, Recommendation ASWG-R001 v1.10, August 2013: 'the Average Loudness Level of audio content within a title developed for home-based SCE platforms should be normalized to a Target Level of -24 (±2) LKFS'; portable platforms -18 (±2) LKFS; maximum true peak 'should not exceed -1 dBTP'; content 'should be measured as a whole' for 'a minimum of 30 minutes'. Identifies the source the application left unnamed, and narrows its scope to whole-title home-platform measurement rather than per-file stems."
    },
    {
      "source": "Internal arithmetic, node--lens-versioning-as-invalidation and techniques/lens-versioning-as-invalidation",
      "result": "131/143 = 91.6%, so '92%' is a share of the 143 bound verdicts (fails and passes), not of 'the standing condemnations'; 131 + 21 = 152 and 131 - 13 = 118 check out."
    },
    {
      "source": "Internal arithmetic, process--capped-disqualifiers",
      "result": "47 caps at A1 and 3 at A2 over A1-A4: above-cap gauges 47x3 + 3x2 = 147, at-or-below 47 + 6 = 53, total 200 = 50 x 4. Consistent."
    },
    {
      "source": "pof consumer checkout",
      "result": "Not available on this machine. No application citation, line number or private run was re-checked; the 2026-09-10 pof readings are carried as that record's evidence, not re-witnessed."
    }
  ],
  "documents": {
    "aaa-craft-rubric-authoring.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: step 8 now names 'the pilot' as the calibration period over the held-out set, which promotes caps and ends pre-release; the pair stays a smoke check. Seven to twelve stays the band's one owner."
    },
    "techniques/capped-disqualifiers.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'piloted a lens against a held-out set of known-good and known-bad artifacts'."
    },
    "techniques/ceiling-as-a-market-assumption.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the three distribution readings are stated as leads to investigate, with selection, evidence and examiner drift named as alternative causes, matching the golden path."
    },
    "techniques/checkable-against-the-stored-artifact.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep; override policy already hedged as same-shape rather than text-only."
    },
    "techniques/criterion-set-coverage-audit.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep."
    },
    "techniques/criterion-with-a-cited-source.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'Nine to twelve' replaced by a pointer to the golden path's seven-to-twelve convention."
    },
    "techniques/deliberately-overlapping-criteria.md": {
      "disposition": "keep",
      "reason": "Unchanged; lowest-k arithmetic re-checked ([1,4,4] -> 2.5, [1,1,4,4] -> 1)."
    },
    "techniques/lens-versioning-as-invalidation.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: full binding 'cleared all 131, 92% of the 143 bound verdicts, passes and condemnations alike'."
    },
    "techniques/named-benchmark-anchors-per-level.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep."
    },
    "techniques/question-form-criteria-for-open-judgment.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-10 keep."
    },
    "applications/node--deliberately-overlapping-criteria.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the TEXT_CLASSES claim is now attributed to the header, with the cutscene-audio same-medium override noted. Display-only isolation still needs the consumer at 9aa31407. Consumer evidence remains unre-witnessed; verified_on unchanged."
    },
    "applications/node--lens-versioning-as-invalidation.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: arm C now reads '131 of the 143 bound verdicts, passes and condemnations alike', arm B '118 condemnations whose weakest dimension does not read sibling context'. The private store was not re-run."
    },
    "applications/process--capped-disqualifiers.md": {
      "disposition": "reverify",
      "reason": "New since 2026-09-10. Arithmetic checks (147 above cap, 53 at or below, 200 total). Shipped commit 8481218a and its tests are in a private tree that was not reopened."
    },
    "applications/process--ceiling-as-a-market-assumption.md": {
      "disposition": "reverify",
      "reason": "The A2^ badge / 'A3 AA' spoken-form mismatch is still unlocated in the text; the 2026-09-10 reading placed it in the consumer's doc comment, but the consumer could not be reopened this run to confirm before editing."
    },
    "applications/process--checkable-against-the-stored-artifact.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the header's 'never apply to media classes' is now stated as broader than the routing the document lists, with cutscene audio as a same-medium override. Line citations not re-checked against the consumer. Consumer evidence remains unre-witnessed; verified_on unchanged."
    },
    "applications/process--criterion-set-coverage-audit.md": {
      "disposition": "reverify",
      "reason": "New since 2026-09-10; internally consistent and honest about the unrun enumeration half. Shipped commit 23196728 not reopened."
    },
    "applications/process--criterion-with-a-cited-source.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the loudness entry names ASWG-R001 v1.10 with quoted figures; the review boundary records its home-platform, whole-title, 30-minute scope; 'top of the band' now reads as inside the seven-to-twelve convention. Consumer lens files not reopened."
    },
    "applications/process--named-benchmark-anchors-per-level.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the double-counted exception sentence now reads 'Twenty-nine of the thirty ... The exception is the production-process A3 bullet'. Commit eef0b7e4 not reopened. Consumer evidence remains unre-witnessed; verified_on unchanged."
    }
  }
}
```
