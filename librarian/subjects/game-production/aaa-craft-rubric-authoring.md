---
domain: game-production
subject: aaa-craft-rubric-authoring
last_touched: 2026-09-10
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
`pof` working tree at `C:\Users\kazda\kiro\pof` (read-only; no build, no test run, no
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
