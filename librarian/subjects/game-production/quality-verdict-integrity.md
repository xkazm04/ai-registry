---
domain: game-production
subject: quality-verdict-integrity
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# quality-verdict-integrity

## Architecture review - 2026-09-10

Read and assessed all 10 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Decisions identify repairs and remaining work.
Earlier observations remain historical evidence, not refreshed runtime witnesses;
the qualifications below govern this review.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/quality-verdict-integrity",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:2a3fb8d54d6fcc74",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed. Eleven techniques across this tranche were repaired. Remaining semantic findings, golden-path reconciliation and historical application witnesses are explicit reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh.",
  "counterexamples": [
    "Human confirmation is reference-label provenance, not guaranteed ground truth. Sample size and agreement threshold need uncertainty and intended-population weighting; chance correction is not universally stricter. Hold out calibration targets from tuning and retain raw-score errors when relevant.",
    "Unknown failures may justify a reversible hold, not a confirmed current defect. Costs are not universally ten minutes versus one model draw; human verdicts also need scope and binding. Re-grading priorities and missing observations require explicit policy.",
    "Select within rubric family and applicable content/configuration, not a global newest version that can hide valid current evidence. Whitespace can change model input. The claimed forty-times noise divides 16.9 by mean drift 0.4 rather than dispersion 3.1; neither ratio alone establishes statistical significance."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/craft-judgment/quality-verdict-integrity/quality-verdict-integrity.md",
      "scope": "Local golden path and every owned technique/application read in full. Embedded code and reported observations assessed as historical evidence; consumer implementation was not independently refreshed."
    }
  ],
  "documents": {
    "quality-verdict-integrity.md": {
      "disposition": "reverify",
      "reason": "Reverify timestamps as proof of changed content, strict ordering of condemnation/reuse costs, missing context bindings, newest-present rubric selection and historical effect-size arithmetic. The content-binding technique is repaired; sibling projection and standing policy still need reconciliation."
    },
    "techniques/calibration-against-confirmed-labels-only.md": {
      "disposition": "reverify",
      "reason": "Human confirmation is reference-label provenance, not guaranteed ground truth. Sample size and agreement threshold need uncertainty and intended-population weighting; chance correction is not universally stricter. Hold out calibration targets from tuning and retain raw-score errors when relevant."
    },
    "techniques/condemn-vs-elevate-asymmetry.md": {
      "disposition": "reverify",
      "reason": "Unknown failures may justify a reversible hold, not a confirmed current defect. Costs are not universally ten minutes versus one model draw; human verdicts also need scope and binding. Re-grading priorities and missing observations require explicit policy."
    },
    "techniques/content-hash-binding.md": {
      "disposition": "clarify",
      "reason": "Repaired target plus criterion-relevant context binding, request-snapshot races, scheme compatibility, collision-risk choice, source/derivative identity and metadata-only timestamp updates."
    },
    "techniques/rubric-version-supersession.md": {
      "disposition": "reverify",
      "reason": "Select within rubric family and applicable content/configuration, not a global newest version that can hide valid current evidence. Whitespace can change model input. The claimed forty-times noise divides 16.9 by mean drift 0.4 rather than dispersion 3.1; neither ratio alone establishes statistical significance."
    },
    "techniques/sibling-context-projection.md": {
      "disposition": "reverify",
      "reason": "Required context can exceed caps; omitted reference material must not yield a complete judgment. Low nonempty rate may be correct for standalone artifacts. Ungraded siblings can be necessary evidence when uncertainty is labeled; context also needs binding and instruction/data separation."
    },
    "techniques/stale-superseded-unknown-classification.md": {
      "disposition": "reverify",
      "reason": "A later write may only change bookkeeping and does not prove stale content. Supported old serializers can compare schemes through explicit compatibility. Missing current hash, rubric or context can also produce unknown; keep reason dimensions even if one display state has precedence."
    },
    "applications/node--condemn-vs-elevate-asymmetry.md": {
      "disposition": "reverify",
      "reason": "The historical isStanding predicate includes unknown, so using it for a quality mean conflates holds with measured quality. Judge-class filtering and human exceptions need scope checks; preserve failed required gates when another layer is deferred. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/node--content-hash-binding.md": {
      "disposition": "reverify",
      "reason": "The historical 32-bit FNV digest is not a universal acceptance-cache recommendation. The displayed binding omits changing sibling context, and updatedAt can be metadata-only. Published machine-specific checkout roots need removal; allowlists also require validation. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/process--calibration-against-confirmed-labels-only.md": {
      "disposition": "reverify",
      "reason": "Three provisional targets do not establish human calibration, as the application acknowledges. The effect sizes and control mean/standard deviation do not alone establish significance; newest-present selection requires rubric-family and current-content scope. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    }
  }
}
```

## Architecture review - 2026-09-10 (after the compression revert)

Read all ten documents at 44c89965. The entry above carries the same date but the
old baseline and a digest computed against bytes that no longer exist; this entry
supersedes it against the reverted tree. Its findings were terse to the point of
being unusable as work orders, so I re-derived each one rather than carrying it.

**The statistics claim is wrong and it contradicts itself inside one paragraph.**
`techniques/rubric-version-supersession.md` reports a 21-cell A/B: control +0.4
(sd 3.1), contaminated +16.9, blind-siblings +4.3. It then draws two conclusions
from the same three numbers using two different denominators. First: "the harness
noise is about three points, so a four-point effect is real" - noise floor = 3.1,
the dispersion. Second, one clause later: "the contamination was forty times the
noise floor". 16.9/0.4 = 42, so the second sentence has silently switched the noise
floor to the control arm's *mean drift*. A mean drift of +0.4 is a bias estimate,
not a noise floor; against dispersion the contamination is about 5.5x, not 40x. The
conclusion (contamination invalidated the prior corpus) survives either way - 5.5
standard deviations is decisive - which is why this is `clarify`. But the document
teaches a method, and the method as written licenses dividing an effect by whatever
small number is nearby. The golden path repeats the effect size ("roughly seventeen
points") without the ratio and is not affected.

A second, softer version of the same problem: comparing a mean effect to a
per-observation standard deviation is the wrong test even when it happens to reach
the right answer. With 21 cells and sd 3.1 the standard error is about 0.7, so
+4.3 clears it comfortably; the document's own rule ("noise is 3, so 4 is real")
would have rejected a real 2-point effect and accepted a spurious 3.5-point one.
Worth stating the comparison it actually intends.

**The calibration threshold has no basis, in a technique that cites the law about
bases.** `calibration-against-confirmed-labels-only.md` states "agreement at or
above 0.85" in one bullet and, in the next clause, recommends chance-corrected
statistics as "the stricter and better instrument". Chance-corrected agreement is
always numerically below raw agreement, so 0.85 raw and 0.85 chance-corrected are
very different bars - on a three-band set with one dominant band the gap is easily
0.2. The document never says which one 0.85 is, and the application shows it landing
in a consumer as a bare `CALIBRATION_THRESHOLD = 0.85`. The number needs its basis
attached, which is the same law (`a-number-carries-its-unit-and-basis`) the
technique already lists in its frontmatter.

**The self-preference claim is over-extended.** The same technique says "graders
measurably prefer output from their own family". I checked the literature this
rests on. Panickssery et al., NeurIPS 2024, establishes self-preference at the
*model* level - an evaluator scores its own generations higher than human
annotators do, and self-recognition capability correlates linearly with the size of
the bias. It does not establish a family-level effect, which is a different and
larger claim (that a model prefers a sibling's output it did not produce). The
practical advice - use a different family where possible - is sound and cheap; the
warrant offered for it reaches further than the evidence. I read search summaries
and the paper's abstract-level findings; I did not read the full paper or reproduce
any experiment.

**A boundary the selection rule cannot express.** `rubric-version-supersession.md`
defines selection as "only verdicts at the newest version present for that
artifact", which presumes one totally ordered version line. Its own when-not-to-use
section then recommends versioning the standard per artifact class. Two class-scoped
rubric versions are not comparable, so "the newest version present" is undefined for
an artifact graded under both - and the failure is silent, because whichever integer
is larger wins. Either the selection predicate is scoped per rubric identity or the
per-class advice needs withdrawing; the document currently offers both.

What I checked and found sound: the four-standing vocabulary and its evaluation
order (standard, then comparability, then comparison, then dating) are internally
consistent and the migration argument for degrading to `unknown` rather than `stale`
is correct and load-bearing; the three-set asymmetry table is consistent between the
golden path, the technique and the application; 314/816 is 38.5% and 240/816 is
29.4%, both stated accurately; the non-cryptographic digest argument holds for the
accident-detection threat model it declares.

All three applications remain `reverify`. They cite a PoF checkout by file and line
with `verified_on` dates of 2026-08-20 and 2026-08-30 and no commit pinned in two of
them; no checkout was made, no test run, no judge draw executed, and the A/B whose
numbers the corpus reasons from was not reproduced.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/quality-verdict-integrity",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:523a7830a1ecdb06",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read in full at 44c89965. Every quantitative claim re-derived by hand (314/816, 240/816, 16.9/0.4 versus 16.9/3.1, standard error at n=21, raw versus chance-corrected agreement bounds, 32-bit digest collision probability). One literature check on the self-preference claim. Explicitly NOT evaluated: any PoF checkout, the judge harness, the 21-cell A/B, any model draw, the calibration run, or the incidents the applications narrate.",
  "counterexamples": [
    "The corpus's own A/B: 16.9/0.4 = 42x only if the noise floor is the control arm's mean drift. Against the dispersion the same paragraph calls the noise floor (sd 3.1) it is 5.5x. Both ratios are in one paragraph.",
    "0.85 raw agreement and 0.85 chance-corrected agreement are different bars - on an unbalanced three-band set they can differ by more than 0.2 - and the technique states the figure without saying which.",
    "Per-class rubric versioning, which the technique recommends, makes 'the newest version present for that artifact' undefined: two class-scoped version integers are not on one ordered line.",
    "A fingerprint recorded under a scheme NEWER than the one in force (a rollback, or a mixed-version deploy) is equally incomparable, but the classification technique defines unknown's second cause as a 'superseded scheme' only.",
    "The layer's integrity guarantee is explicitly accident-only ('nothing here defends against an adversary'), while the law it invokes - no gate self-certifies - is about a party with an incentive. A producer that can compute the shared non-cryptographic digest is inside the threat model the law assumes and outside the one the technique declares.",
    "A condemnation retained on `unknown` costs 'ten minutes' only where the consequence is review. The technique bounds the destructive case in its when-not-to-use section, but the golden path states the ten-minute ledger unconditionally."
  ],
  "sources": [
    {
      "url": "https://proceedings.neurips.cc/paper_files/paper/2024/hash/7f1f0218e45f5414c79c0679633e47bc-Abstract-Conference.html",
      "result": "Establishes self-preference bias at the model level - an LLM evaluator scores its own generations above what human annotators give them - and a linear correlation between self-recognition ability and bias strength. It does NOT establish a model-family-level preference, which is what the technique asserts. Abstract-level findings and search summaries read; the full paper was not read and no experiment was reproduced."
    }
  ],
  "documents": {
    "quality-verdict-integrity.md": {
      "disposition": "keep",
      "reason": "Every figure it quotes checks out (seventeen points, three in ten, a third of the corpus) and it correctly declines to repeat the 40x ratio. The unconditional ten-minute cost ledger is the only soft spot and the technique already bounds it."
    },
    "techniques/content-hash-binding.md": {
      "disposition": "keep",
      "reason": "The procedure, the singular exclusion rule, the scheme prefix and the refusal to default a missing digest are internally consistent and the two-polarity incident is the strongest evidence in the subject. The non-cryptographic argument holds for the accident threat model it names."
    },
    "techniques/stale-superseded-unknown-classification.md": {
      "disposition": "clarify",
      "reason": "Defines unknown's second cause as a fingerprint 'recorded under a superseded scheme', which misses the equally incomparable newer-scheme case a rollback or mixed deploy produces. The four standings, the evaluation order and the migration argument are right and stay."
    },
    "techniques/condemn-vs-elevate-asymmetry.md": {
      "disposition": "keep",
      "reason": "The three admissible sets, the ordering of their strictness, and the attach-when-not-applied rule are consistent with the golden path and the application. The destructive-consequence and legacy-backlog carve-outs already bound the cost ledger properly."
    },
    "techniques/rubric-version-supersession.md": {
      "disposition": "clarify",
      "reason": "Two defects. The '40x the noise floor' figure divides by the control arm's mean drift (0.4) while the preceding sentence uses the dispersion (3.1) as the noise floor; against dispersion it is 5.5x. And selection by 'newest version present' presumes one ordered version line, which the same document's per-class versioning advice removes."
    },
    "techniques/sibling-context-projection.md": {
      "disposition": "keep",
      "reason": "314 of 816 is 38.5%, stated accurately; the contamination-versus-context effect sizes match the source technique; the projection ordering, the caps and the emptiness-rate instrumentation are the actionable core and none of it failed a check."
    },
    "techniques/calibration-against-confirmed-labels-only.md": {
      "disposition": "clarify",
      "reason": "States 0.85 without saying whether it is raw or chance-corrected while recommending chance correction in the adjacent clause, and asserts family-level grader self-preference where the evidence supports the model level. The confirmed-versus-seed distinction, the standings and the write-nothing rule are sound."
    },
    "applications/node--content-hash-binding.md": {
      "disposition": "reverify",
      "reason": "Every claim is a file-and-line citation into a PoF checkout that was not made, with verified_on 2026-08-30 and no commit pinned. The v1-to-v2 scheme history and the produceDirection incident are narrated, not observed here."
    },
    "applications/node--condemn-vs-elevate-asymmetry.md": {
      "disposition": "reverify",
      "reason": "Same unverified checkout. Its recorded deviation - that PoF counts an `unknown` verdict into a reported average where the technique says only `current` may contribute to a quality figure - is correctly identified and should stay as the deviation, not be reconciled by weakening the standard."
    },
    "applications/process--calibration-against-confirmed-labels-only.md": {
      "disposition": "reverify",
      "reason": "Carries the 21-cell A/B numbers the corpus reasons from, verified_on 2026-08-20, unreproduced. The self-reported deviation (three provisional targets against a stated floor of ~20) is honest and stays; the arithmetic finding above lands in the technique, not here."
    }
  }
}
```
