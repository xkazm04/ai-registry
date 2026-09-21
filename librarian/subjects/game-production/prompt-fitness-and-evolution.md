---
domain: game-production
subject: prompt-fitness-and-evolution
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# prompt-fitness-and-evolution

## Architecture review - 2026-09-10

Read and assessed all 10 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Decisions identify repairs and remaining work.
Earlier observations remain historical evidence, not refreshed runtime witnesses;
the qualifications below govern this review.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/prompt-fitness-and-evolution",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:3a8fec9638692627",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed. Eleven techniques across this tranche were repaired. Remaining semantic findings, golden-path reconciliation and historical application witnesses are explicit reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh.",
  "counterexamples": [
    "Define the estimand before exclusion. Synthetic prompts can be legitimate controlled benchmark inputs, and abandoned outputs or retries may be failures relevant to first-attempt fitness. Keeping only the last success creates survivorship bias; a high excluded share alone does not invalidate a correctly scoped remaining population.",
    "Join exact artifact and evaluation identities, including relevant context and harness. A minimum trial floor does not erase a descriptive mean. Coverage alone does not remove selection bias; distinguish verdict-weighted and artifact-weighted means.",
    "A bundled rewrite can be compared as a package, although individual changes are not separately attributable. A taxonomy does not make a causal experiment, and three losses do not establish a strategy class cannot work. Preserve ancestry across architectural rewrites."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/production-governance/prompt-fitness-and-evolution/prompt-fitness-and-evolution.md",
      "scope": "Local golden path and every owned technique/application read in full. Embedded code and reported observations assessed as historical evidence; consumer implementation was not independently refreshed."
    },
    {
      "url": "https://itl.nist.gov/div898/software/dataplot/refman2/auxillar/exacbici.htm",
      "scope": "Official search evidence warns that normal binomial limits may be inaccurate with small samples or few failures; supports rejecting a universal three-trial z-test guarantee."
    },
    {
      "url": "https://arxiv.org/abs/1810.08240",
      "scope": "Original-author abstract search evidence describes time-uniform confidence sequences. Supports distinguishing sequential inference from repeated fixed-sample thresholds; no experimental dataset was rerun."
    }
  ],
  "documents": {
    "prompt-fitness-and-evolution.md": {
      "disposition": "reverify",
      "reason": "Reverify small-sample z confidence, optional stopping, retries and abandoned outputs excluded by outcome, categorical ban on rewrite comparisons and causal magnitude/direction of historical harness effects. The inference technique is repaired; application behavior was not changed."
    },
    "techniques/exclude-synthetic-fixtures-from-fitness.md": {
      "disposition": "reverify",
      "reason": "Define the estimand before exclusion. Synthetic prompts can be legitimate controlled benchmark inputs, and abandoned outputs or retries may be failures relevant to first-attempt fitness. Keeping only the last success creates survivorship bias; a high excluded share alone does not invalidate a correctly scoped remaining population."
    },
    "techniques/join-judge-verdicts-to-prompt-version.md": {
      "disposition": "reverify",
      "reason": "Join exact artifact and evaluation identities, including relevant context and harness. A minimum trial floor does not erase a descriptive mean. Coverage alone does not remove selection bias; distinguish verdict-weighted and artifact-weighted means."
    },
    "techniques/min-trials-and-confidence-banded-conclusion.md": {
      "disposition": "clarify",
      "reason": "Repaired sample-size claims, sparse-binomial inference, repeated testing, adaptive allocation, unit of independence, missing outcomes, equivalence and manual-confidence fabrication."
    },
    "techniques/mutation-taxonomy.md": {
      "disposition": "reverify",
      "reason": "A bundled rewrite can be compared as a package, although individual changes are not separately attributable. A taxonomy does not make a causal experiment, and three losses do not establish a strategy class cannot work. Preserve ancestry across architectural rewrites."
    },
    "techniques/stamp-prompt-version-into-provenance.md": {
      "disposition": "reverify",
      "reason": "Version configurations and per-call context separately. A real regeneration under a new configuration needs the new stamp; copying stored output retains the original. Prompt-length correlation can reflect input difficulty, and shared vocabulary in output is not proof of provenance leakage."
    },
    "techniques/unjudged-is-null-not-zero.md": {
      "disposition": "reverify",
      "reason": "Null preserves missingness but complete-case means can still be biased. Backlog need not track winning traffic, and query-time variation can reflect new evidence. Unequal coverage needs investigation or a justified sampling design, not an automatic universal invalidation."
    },
    "applications/node--join-judge-verdicts-to-prompt-version.md": {
      "disposition": "reverify",
      "reason": "The historical join key omits content and context from its displayed form; verify standing filters and rubric selection. Averaging multiple judges per artifact weights heavily judged artifacts more. Historical 816-artifact deltas require the retained paired data and direction labels. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/process--min-trials-and-confidence-banded-conclusion.md": {
      "disposition": "reverify",
      "reason": "The displayed z-to-confidence map has a discontinuity: just below 1.28 gives about 0.64, then 0.8. Repeated stopping and epsilon-greedy assignment lack calibrated inference here; a point gap below 0.05 does not prove equivalence, and the capped manual number is not measured confidence. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/process--mutation-taxonomy.md": {
      "disposition": "reverify",
      "reason": "A TypeScript union with a switch lacking default is not automatically exhaustive under every return type/compiler setting. Exact baseline capture is useful; multi-axis transforms remain comparable as packages and historical quality gains are not a newly verified causal result. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    }
  }
}
```

## Architecture re-review - 2026-09-10 (after the compression revert)

Read all ten documents at their reverted bytes and re-read the consumer the three
applications cite (`C:/Users/kazda/kiro/pof`, `master`) as source. Reading source is not
executing it: no A/B test, judging pass, fitness query or model call was run.

The subject's spine is sound and unusually well argued. The five obligations are stated
as obligations of an experiment rather than as advice, the join-not-inference argument
names the exact windows where timestamp reconstruction fails (retries, backfills,
concurrent arms) and observes that it fails hardest during the window an experiment lives
in, and the contamination trap is the best passage in my group: three things wrong at
once, with the subtlest — that a systematic bias survives averaging, so more trials make
you more confident in a biased number — stated last and correctly. The move that makes it
more than a war story is "prove a harness defect the same way you would prove a prompt
change: run it as an arm", with the control arm establishing the noise floor (+0.4, sd
3.1) against the contaminated arm (+16.9). The projection-fails-in-both-directions
correction (+4.3 for the blind-siblings defect) is what stops the lesson from becoming
"project less". `unjudged-is-null-not-zero` argues the bias direction rather than
asserting it, and adds the point that makes it decisive: a figure whose value depends on
when the query ran is not a measurement.

The finding worth acting on is in the stopping rule, and it is a live contradiction
between two adjacent statements in `min-trials-and-confidence-banded-conclusion`. The band
table says a standard score at or above 1.28 is `weak`, licensing "a lead, not a result —
extend the run". The termination paragraph immediately below says "conclude when the
banded confidence reaches a stated level — 0.8 is a reasonable operating point". Under the
table's own mapping, 0.8 *is* the weak band: the rule terminates the run at exactly the
threshold the table forbids concluding on. This is not a reading I imposed — the consumer
implements both sentences literally and the contradiction is visible in two lines:
`ab-testing.ts:252` maps `zScore >= 1.28` to `confidence = 0.8`, and `:256` sets
`shouldConclude = confidence >= 0.8`. `process--min-trials-and-confidence-banded-conclusion`
then reports the conclude-at-0.8 rule approvingly in one section and warns that "a z of
1.28 on three trials per arm is a lead worth extending, not a result worth shipping on" in
the next, without reconciling them.

The second finding is the instrument itself. The technique calls its thresholds "standard
score" values and pairs them with a three-trials-per-arm floor. The consumer's
`evaluateTest` computes a pooled two-proportion z-test (`ab-testing.ts:249`), and at three
Bernoulli trials per arm the normal approximation behind those critical values does not
hold — the usual sufficiency condition is violated by an order of magnitude. Read instead
as a difference of means, the correct critical value at four degrees of freedom is about
2.78, not 1.96. The technique's honesty section addresses *sample size* ("only a large
effect clears even the weak band") but never that the thresholds themselves are the wrong
ones for the sample; the effect is that the bands are systematically permissive at the
floor, which is the opposite of the coarse-filter behaviour the section promises. The term
"banded confidence" is also used as a termination parameter without ever being defined
separately from the band table.

Everything else re-verified. `MIN_TRIALS_PER_VARIANT = 3` is still at `ab-testing.ts:15`;
`forceConclude` still refuses below the floor with the per-arm shortfall in the message
(`:297-305`) and still caps its reported confidence at `Math.min(0.7, ...)` (`:317`) below
every automatic band; the indifference margin and the declared secondary axis are still at
`:261`; `pickVariant` is still epsilon-greedy with `epsilon = 0.2` (`:164-171`), which the
application correctly flags as a deviation whose bearing on the pooled z-test's
independence assumption must be reported rather than left in the serving layer.
`judge-fitness.ts` still returns `avgScore`/`passRate` as null rather than zero, still
merges rather than overwrites `_provenance`, and still applies `isSyntheticEntity` inside
`aggregateFitness` on both sides of the join so a hand-fed caller cannot produce a
different number from the rendered one. Line-number citations have drifted substantially
here — the confidence mapping the document cites at `:113-117` is now at `:252-256`, and
`forceConclude` has moved from `:150` to `:297` — while every symbol name still resolves.

`mutation-taxonomy` I read adversarially and left alone. Its "adding and removing are
separate strategies" argument is the mechanism that makes a clause retirable, and its
application is candid that the shipped eight-member set mixes axes and is therefore a
partial realization — which is the honest way to record a deviation without lowering the
standard.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/prompt-fitness-and-evolution",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:1e4c8d8d453819e9",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read at reverted bytes. The cited consumer (C:/Users/kazda/kiro/pof src/lib/prompt-evolution/ab-testing.ts and judge-fitness.ts) was read as source and its confidence mapping, termination rule, trial floor, override cap, indifference margin and allocation policy were confirmed against the documents' claims. Not evaluated: no A/B test, judging pass, fitness aggregation or model call was executed; the measured figures the applications quote (240/816, 314/816, 342/780, control +0.4 sd 3.1, contaminated +16.9, blind-siblings +4.3, the 40s-to-90 rewrite result) were not re-derived from data and remain historical measurements; the rubric files and the quality prompt module were not re-read.",
  "counterexamples": [
    "min-trials-and-confidence-banded-conclusion: an arm at 3/3 successes against an arm at 1/3. The pooled two-proportion z is about 1.9, which the table bands as 'moderate - adopt provisionally' and the termination rule concludes on, yet Fisher's exact test on that table gives p of roughly 0.2. The instrument adopts a variant on evidence that would not clear any conventional threshold, and the technique's honesty section does not cover it because the failure is in the critical values, not the sample size.",
    "min-trials-and-confidence-banded-conclusion: a comparison that reaches z = 1.28 on trial four. The band table says extend the run; the termination rule says conclude at confidence 0.8, which is that band. The two sentences give opposite instructions for the same state and the document offers no precedence between them.",
    "unjudged-is-null-not-zero: a judge that fails systematically on the artifact class a mutation targeted - long outputs timing out, say. Excluding unjudged from both numerator and denominator then silently drops exactly the population under test, and the coverage figure the technique requires beside the mean is equal across arms because the failures are proportional to volume. The technique's step 5 asks for the reason for absence but nothing in the procedure compares the reason distribution between arms.",
    "exclude-synthetic-fixtures-from-fitness: a prompt whose real production traffic is genuinely small relative to a smoke harness that exercises it. The 25% exclusion alarm fires and the technique says treat the figure as unusable and investigate the store - correct, but it leaves a prompt with no usable fitness figure at all and no stated path other than fixing the store, which may not be the prompt owner's to fix."
  ],
  "sources": [
    {
      "path": "C:/Users/kazda/kiro/pof src/lib/prompt-evolution/ab-testing.ts:15, :249-261, :297-317",
      "result": "Confirmed the trial floor of 3, the pooled two-proportion z-test, the exact confidence mapping (z>=1.96 -> 0.95, >=1.65 -> 0.9, >=1.28 -> 0.8), the termination rule shouldConclude = confidence >= 0.8, the 0.05 indifference margin with a declared secondary axis, the forceConclude refusal below the floor and its Math.min(0.7, ...) confidence cap. This establishes that the technique's own termination threshold coincides with the band it says must not conclude. It does not establish how often the coincidence changes an outcome in practice; no test was executed."
    },
    {
      "path": "C:/Users/kazda/kiro/pof src/lib/prompt-evolution/judge-fitness.ts:35-79, :109-152",
      "result": "Confirmed the null-not-zero return shape, the merge-not-overwrite provenance stamp with an explicit version winning over the current pack version, and isSyntheticEntity applied inside aggregateFitness on both sides of the join. Did not run the aggregation or query the database, so the quoted 43.8% and 780/7 figures remain historical."
    }
  ],
  "documents": {
    "prompt-fitness-and-evolution.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The five obligations, the join-not-inference argument with its named failure windows, the contamination trap including the survives-averaging point, the run-the-harness-defect-as-an-arm move with its control noise floor, and the both-directions projection rule are all stated with their reasons and consistent with the techniques. Its 'what a small comparison can and cannot claim' section is deliberately conservative and does not inherit the band contradiction, because it states no threshold of its own."
    },
    "techniques/exclude-synthetic-fixtures-from-fitness.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The asymmetry argument is the load-bearing half and is correct - fixture volume tracks how a harness is wired, never prompt quality, so contamination lands on one side of a comparison and reads as productivity. Mark-at-creation over classify-at-analysis, the exclusion-count-beside-the-figure rule, the ratio alarm, and the refusal to exclude by outcome are each stated with the failure they prevent."
    },
    "techniques/join-judge-verdicts-to-prompt-version.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The five-step join is stated exactly, the required basis fields make the denominator travel with the mean, and the bump-the-rubric-when-the-INPUT-changes rule is the non-obvious correction that stops a corrected harness averaging with an uncorrected one. The three failure modes (joining on time, joining through a mutable pointer, averaging verdicts of different standing) are each distinct and each named with its consequence."
    },
    "techniques/min-trials-and-confidence-banded-conclusion.md": {
      "disposition": "clarify",
      "reason": "Two problems. (1) The band table maps a standard score of 1.28 to 'weak - a lead, not a result - extend the run' while the termination paragraph concludes at 'banded confidence 0.8', which under the table's own mapping is that band; the consumer implements both literally (ab-testing.ts:252 and :256). State one rule. (2) The thresholds are normal critical values applied at a three-trials-per-arm floor over a pooled two-proportion test, where the normal approximation does not hold and the mean-difference equivalent at 4 df is about 2.78 rather than 1.96 - so the bands are systematically permissive at exactly the sample size the section calls a coarse filter. 'Banded confidence' is also used as a termination parameter without a definition separate from the table."
    },
    "techniques/mutation-taxonomy.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The closure requirement, one-strategy-per-variant, the add/remove symmetry that makes a clause retirable, the taxonomy-defined-in-one-place rule, and the void-the-comparison rule when anything beyond the named strategy differs (including model settings and retrieval configuration) are consistent with the golden path and with stamp-prompt-version-into-provenance's definition of the assembled configuration. The class-level reading section states the transferable payoff honestly as a tendency."
    },
    "techniques/stamp-prompt-version-into-provenance.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The assembled-configuration definition, the structurally-separate envelope, the declared projection as a set rather than a subtraction, the replay rule that refuses to default to the current version, merge-not-overwrite, and honest backfill are each stated with the specific corruption they prevent. The two verification checks (substring, and length-versus-score correlation within one version) are cheap, falsifiable and correctly scoped to run when the projection changes."
    },
    "techniques/unjudged-is-null-not-zero.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The bias direction is argued rather than asserted (backlog tracks volume tracks traffic tracks the winning arm), the transience point is decisive ('anything whose value depends on when the query ran is not a measurement'), the symmetric error of absorbing unjudged into a green aggregate is named, and the four reasons for absence are kept distinct at the source. The 'when NOT to use it' section correctly separates coverage metrics and ship gates from quality aggregates."
    },
    "applications/node--join-judge-verdicts-to-prompt-version.md": {
      "disposition": "keep",
      "reason": "Re-read against the live consumer: the null-not-zero shape, the merge-not-overwrite stamp with an explicit version beating the current pack version, and isSyntheticEntity applied inside aggregateFitness on both sides of the join all still hold, as does the verdicts-versus-judgedArtifacts two-unit distinction. Line-number citations have drifted while symbol names resolve. The quoted measurements (43.8%, 240/816, 314/816, the A/B medians) were not re-derived and verified_on is not refreshed."
    },
    "applications/process--min-trials-and-confidence-banded-conclusion.md": {
      "disposition": "clarify",
      "reason": "It reports the consumer's conclude-at-0.8 termination rule approvingly in 'The bands' and then warns two sections later that a z of 1.28 on three trials per arm is 'a lead worth extending, not a result worth shipping on', without noting that the first rule concludes at exactly that z. It also reproduces the technique's normal critical values over a three-trial pooled proportion test without flagging that the approximation does not hold there. Its line numbers have drifted furthest in this group (:113-117 is now :252-256, :150 is now :297); every symbol still resolves. verified_on is not refreshed."
    },
    "applications/process--mutation-taxonomy.md": {
      "disposition": "keep",
      "reason": "The eight-member union, the no-default-arm switch that makes the enumeration and the implementation inseparable, the seeded-baseline lineage capture, and the mutationType-versus-style split are consistent with the technique. Its 'deviation from the standard' section is the model for how to record a partial realization - it names the mixed axes, states what the taxonomy cannot express, and explicitly does not lower the standard. The cited files were not re-read in this pass and verified_on is not refreshed."
    }
  }
}
```
