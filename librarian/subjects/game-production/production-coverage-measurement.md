---
domain: game-production
subject: production-coverage-measurement
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# production-coverage-measurement

## Architecture review - 2026-09-10

Read and assessed all 10 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Decisions identify repairs and remaining work.
Earlier observations remain historical evidence, not refreshed runtime witnesses;
the qualifications below govern this review.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/production-coverage-measurement",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:bbb5d06bababe940",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed. Eleven techniques across this tranche were repaired. Remaining semantic findings, golden-path reconciliation and historical application witnesses are explicit reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh.",
  "counterexamples": [
    "Stable IDs can retain identity while content or environment changes. Check both missing old entries and newly added unreviewed entries. Preserve historical evidence when expiring a current claim; an empty expected set may be legitimate.",
    "A medium ceiling is a scoped capability hypothesis, not a permanent quality fact. New above-ceiling evidence should challenge it. Differences between ordinal rungs are not measured effort, and unmeasured quality is not measured zero.",
    "Derived code can be wrong and literals can implement an authoritative contract. Identical outputs for two inputs may reflect an intentional plateau. Human selection does not prove comprehensive review."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/production-governance/production-coverage-measurement/production-coverage-measurement.md",
      "scope": "Local golden path and every owned technique/application read in full. Embedded code and reported observations assessed as historical evidence; consumer implementation was not independently refreshed."
    }
  ],
  "documents": {
    "production-coverage-measurement.md": {
      "disposition": "reverify",
      "reason": "Reverify automation equated with readiness, permanent medium ceilings, ordinal ladder arithmetic and coverage inferred from observed inventory without expected scope. The headless technique is repaired; the golden path and readiness ladder still mix these quantities."
    },
    "techniques/audited-fact-drift-detection.md": {
      "disposition": "reverify",
      "reason": "Stable IDs can retain identity while content or environment changes. Check both missing old entries and newly added unreviewed entries. Preserve historical evidence when expiring a current claim; an empty expected set may be legitimate."
    },
    "techniques/craft-ladder-and-medium-ceilings.md": {
      "disposition": "reverify",
      "reason": "A medium ceiling is a scoped capability hypothesis, not a permanent quality fact. New above-ceiling evidence should challenge it. Differences between ordinal rungs are not measured effort, and unmeasured quality is not measured zero."
    },
    "techniques/engine-credibility-classes.md": {
      "disposition": "reverify",
      "reason": "Derived code can be wrong and literals can implement an authoritative contract. Identical outputs for two inputs may reflect an intentional plateau. Human selection does not prove comprehensive review."
    },
    "techniques/headless-operability-gate.md": {
      "disposition": "clarify",
      "reason": "Repaired independent artifact and automation standing, manual shippable work, unattended GUI versus no-window requirements, unknown capability and highest-satisfied-rung computation."
    },
    "techniques/readiness-ladder.md": {
      "disposition": "reverify",
      "reason": "The ladder mixes produced-but-failing and off-ladder rules, and quality enters supposedly independent rungs. Highest passed checks do not imply all prerequisites passed; deferred potential must not render as achieved readiness."
    },
    "techniques/source-provenance-marks.md": {
      "disposition": "reverify",
      "reason": "Provenance origin is not confidence or freshness. Authored demotions can be mistaken or manipulate priority; retain competing evidence rather than treating every self-demotion as established truth. Aggregates may need input-specific provenance."
    },
    "applications/node--engine-credibility-classes.md": {
      "disposition": "reverify",
      "reason": "The historical two-entity identical-output observation does not alone prove a stub; inspect the computation and expected sensitivity. Name-based fixture filtering can exclude production rows, and counts.pass > 0 is only existential coverage. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/process--readiness-ladder.md": {
      "disposition": "reverify",
      "reason": "The historical deferred R4 presentation must distinguish proposed from achieved. An audit run is not a release witness, and manual execution does not by itself negate observed artifact readiness. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/react--source-provenance-marks.md": {
      "disposition": "reverify",
      "reason": "The historical glyph/tooltip treatment requires keyboard and touch evidence as well as color distinctions. Missing craft chips can hide unknown standing; an authored-demotion mark remains a provenance claim, not corroboration. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    }
  }
}
```

## Architecture re-review - 2026-09-10 (after the compression revert)

Read all ten documents at their reverted bytes and re-read every consumer symbol the
three applications cite (`C:/Users/kazda/kiro/pof`, `master`) as source. Reading source is
not executing it: no status build, grader, audit or test was run.

The model this subject describes is the sturdiest thing in my group, and the reason is
that its central claim is falsifiable and it is stated as a plumbing requirement rather
than a diagram. The two-axis argument — automation honesty and craft distance are
independent — is carried by two states that occur constantly (a fully automated
placeholder, a hand-made unautomated excellence), and the golden path then insists the
orthogonality be enforced where it can fail: "make it structurally impossible for a craft
score to reach the code that computes readiness", with the leakage mechanism named
("surely that means it works"). `craft-ladder-and-medium-ceilings` repeats the same
requirement as a decision rule and adds "pin the separation with a test". That is a claim
someone can check, and I checked what I could: the consumer keeps grading in
`statusModel.ts` and the ladder projection in `readiness.ts`, whose header states "no
grading logic lives here and none moved".

The rest of the model holds together under adversarial reading. The rungs pass the
strictly-more test the technique demands of them, and rung 1 exists for a stated reason —
without it a placeholder pass lands at 2 and the middle of the ladder inflates. Rung 5 is
deliberately unreachable from grading logic alone, which is the structural-evidence-never-
implies-behavioural-evidence rule applied at the top of the scale rather than argued in
the abstract. The waiting/blocked treatment is the sharpest piece: neither is a rung, both
are states, a waiting item renders at its would-be rung but hollow and excluded from every
count of reached rungs, and a blocked item keeps what actually passed. The generalisation
that falls out — "anywhere a report reaches for a maximum, check what it is maximising
over" — is the most transplantable sentence in the subject and it is grounded in a
specific incident rather than asserted.

`engine-credibility-classes` is where I looked hardest for over-claim, because "declare
the class and let the class decide" is exactly the shape of rule that quietly becomes a
permission system. It does not: the axis is stated as falsifiability from outside ("could
anything beyond the artifact's own source have made the check fail?"), the byte-identity
probe is given as a mechanical way to settle a producer's class when reasoning about the
code fails, and the technique explicitly refuses the authorization reading in its "when
not to use it". The unknown-earns-nothing rule is stated with its blast radius, including
the part that is easy to miss — the fallback also swallowed *audited* producers whose
recorded spelling had drifted.

`source-provenance-marks` and `audited-fact-drift-detection` are two halves of one idea
and they do not contradict each other anywhere I could find. The one-way self-demotion
asymmetry is argued from first principles ("nothing games a report by looking worse on
it") rather than asserted, and the never-reattach-an-orphan-by-fuzzy-match rule is stated
with the reason a fabricated provenance is worse than a lost one. `headless-operability-gate`
correctly bites only at the gate-proven rungs and demotes rather than fails, with the
prefix-the-reason rule preserving whatever the item already earned.

The applications re-read accurately against the live consumer. `EngineClass` still
enumerates exactly ten classes at `statusModel.ts:156`; `TRUSTED_CLASSES` at `:243` is
still `{llm, code, human}` with `hand-authored` deliberately outside it; `UNAUDITED_ENGINE`
at `:171` is still a real name so the cell can say the engine is unknown, and the
resolution path still ends at it rather than at a trusted default. `LADDER` is still the
single source of rung order and `readinessOf` still requires `grade === 'verified'` **and**
`realization.ue === 'proven'` for R5. The only drift is positional — `LADDER` has moved
from the document's `:26` to `:47`, `readinessOf` from `:128` to `:135` — which is the
same citation-style problem I found in every subject in this group. The claim I could not
check is the "~344-step production map" figure, which depends on data I did not enumerate.

I found nothing here that justifies a content change, and I am explicitly declining to
file compression as a finding.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/production-coverage-measurement",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:f5c545d4ace70164",
  "disposition": "keep",
  "coverage": "All 10 owned documents read at reverted bytes. Consumer symbols cited by the three applications re-read against the live tree at C:/Users/kazda/kiro/pof (statusModel.ts EngineClass, TRUSTED_CLASSES, UNAUDITED_ENGINE, EngineSource; readiness.ts LADDER, READINESS_NAME, readinessOf). Not evaluated: no status page was built or rendered, no grader, spec linter or audit was executed, and no test asserting the craft/readiness separation was run; the '~344-step' population figure and the measured percentages quoted in node--engine-credibility-classes (106 of 110, 95 audited steps, 43.8%) were not re-derived from data; the ceiling assignments per medium are dated market assumptions and were not re-checked against the current model market.",
  "counterexamples": [
    "readiness-ladder: an item whose declared gate ran, failed, and was then re-declared against a different gate. The (rung, state) model gives 'blocked at whatever passed' and 'waiting at the would-be rung' but not both at once, so an item that is simultaneously condemned by one check and awaiting another renders as one of the two and the reader cannot see the other.",
    "engine-credibility-classes: a derivational producer whose external input happens to be constant across the entities it was probed on - a verifier that reads a manifest identical for two entities. The byte-identity probe returns identical outputs and misfiles it as hand-typed constants, which is the conservative direction but is a false demotion the technique does not name.",
    "craft-ladder-and-medium-ceilings: an item whose medium's ceiling class is 'permanent' and whose distance-to-roof is therefore zero, in a project where that medium is most of the work. The distance-to-roof headline reads as almost no climb remaining while the project is nowhere near shippable craft, and the technique's only defence is the instruction to quote the basis - which is exactly the sentence a headline drops.",
    "audited-fact-drift-detection: a rename that swaps two live items' addresses rather than orphaning one. Every address still resolves, the drift check reports zero orphans and proves it ran against non-empty sources, and both items are now graded by the other's audited facts. The technique's instrument-assertion rule catches a blind check, not a confidently wrong one."
  ],
  "sources": [
    {
      "path": "C:/Users/kazda/kiro/pof src/lib/status/statusModel.ts:156-171, :243-248, :299-319",
      "result": "Confirmed EngineClass enumerates exactly the ten classes the application lists, that TRUSTED_CLASSES is {llm, code, human} with hand-authored deliberately excluded, and that the unmatched resolution path returns UNAUDITED_ENGINE rather than a trusted default. Did not re-derive the measured percentages the module header records, and did not execute the grader."
    },
    {
      "path": "C:/Users/kazda/kiro/pof src/lib/status/readiness.ts:26-70, :123-137, :167",
      "result": "Confirmed LADDER is the single ordered source (now at :47, not the document's :26), that R5 requires grade === 'verified' AND realization?.ue === 'proven' (now :135, not :128), and that the OK colour token is reserved for R4/R5. Did not render the page or run the ramp-distinguishability test the technique asks for."
    }
  ],
  "documents": {
    "production-coverage-measurement.md": {
      "disposition": "keep",
      "reason": "Re-read in full against the six techniques it indexes. Every load-bearing rule appears in both places in the same terms - orthogonality enforced in the plumbing, a declared gate is not progress, achievement not ambition, unknown earns nothing, unmeasured rather than wrong when a fact moves, never average across a ladder, a parent bounded by its children. No drift between the golden path and the techniques, and no claim found that is wrong, unsupported or ambiguous at a boundary."
    },
    "techniques/audited-fact-drift-detection.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The failure shape is stated precisely (the report gets quieter and more confident at the same time, because fallbacks are more generous than the audits they replace), the never-fuzzy-match rule is argued from the asymmetry between a lost and a fabricated provenance, and the assert-the-instrument rule distinguishes reporting blind from reporting clean. Its blind spot for an address swap is a counterexample, not a defect in a stated claim."
    },
    "techniques/craft-ladder-and-medium-ceilings.md": {
      "disposition": "keep",
      "reason": "Re-read in full. Level 0 as a real level rather than a zero score, the three ceiling classes with a stated reason field, the at-roof-renders-as-achievement argument, the clamp-to-zero rule for an item above a lowered ceiling, and the stale-then-at-ceiling-then-gauged precedence are each stated with the failure they prevent. The rubric-version invalidation is the right answer to a tightened standard producing no board movement."
    },
    "techniques/engine-credibility-classes.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The falsifiability-from-outside axis is argued against the intuitive who-did-the-work axis with a concrete pair (human selection versus a human-typed constant), the byte-identity probe is a mechanical settlement rather than a judgement call, and the unknown-earns-nothing rule carries its full blast radius including drifted spellings of audited producers. The technique explicitly refuses the authorization reading."
    },
    "techniques/headless-operability-gate.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The gate is correctly scoped to bite only at the gate-proven rungs, demotion rather than failure preserves the information that the work exists, the prefix-the-reason rule prevents a silent re-colour, the undeclared-is-not-operable default is the right direction, and genuinely-interactive steps get a recorded reason rather than a permanent red. The tie to the compiling-is-not-wiring law is argued, not just cited."
    },
    "techniques/readiness-ladder.md": {
      "disposition": "keep",
      "reason": "Re-read in full. Each adjacent rung pair survives the strictly-more test, rung 1's existence is justified by the middle-inflation it prevents, rung 5's unreachability from grading logic is the structural-never-implies-behavioural rule at the top of the scale, and the (rung, state) split with would-be placement is the cleanest treatment of waiting and blocked I have read. The maximise-over-achievements-not-intentions rule generalises beyond this subject."
    },
    "techniques/source-provenance-marks.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The four values plus the loud unsourced case, the one-way self-demotion asymmetry argued from 'nothing games a report by looking worse on it', the glyph-plus-word-never-hue rule with three distinct reasons (accessibility, monochrome travel, and a hue budget already spent on the readiness ramp), and the resolve-provenance-in-the-same-function-as-the-value rule are all stated with their reasons and consistent with the golden path."
    },
    "applications/node--engine-credibility-classes.md": {
      "disposition": "keep",
      "reason": "Re-read against the live consumer: EngineClass still enumerates exactly the ten listed classes at :156, TRUSTED_CLASSES at :243 is still {llm, code, human} with hand-authored outside it, and the resolution path still ends at UNAUDITED_ENGINE rather than a trusted default. The measured figures the record quotes (106/110 byte-identical, 95 audited steps, the ~344-step population) were not re-derived and remain historical measurements; verified_on is not refreshed."
    },
    "applications/process--readiness-ladder.md": {
      "disposition": "keep",
      "reason": "Re-read against the live consumer: LADDER is still the single source of rung order, the six names and meanings match, and readinessOf still requires grade === 'verified' AND realization?.ue === 'proven' for R5. Line numbers have drifted (LADDER :26 to :47, readinessOf :128 to :135) while every symbol name resolves. The three-part incident the header records was not independently reconstructed and verified_on is not refreshed."
    },
    "applications/react--source-provenance-marks.md": {
      "disposition": "keep",
      "reason": "The vocabulary object, the loud undefined handling, the glyph-plus-word discipline and the one-way self-demotion comment are consistent with the technique and with the module's stated design. The two render sites were not opened in this pass - I verified the statusModel side rather than the React components - so the claim that both read the same object and cannot drift stands on the earlier reading. No page was rendered and verified_on is not refreshed."
    }
  }
}
```
