---
domain: game-production
subject: wiring-contract-doctrine
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# wiring-contract-doctrine

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/wiring-contract-doctrine",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:31d9837f6d8cacd2",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "An existing event ID OnHit is five characters and can be more precise than a thirty-character vague sentence.",
    "A verification sentence containing L4 and no actual test run is still only a plan.",
    "Five input-action assets unrelated to movement do not establish that the required movement bindings exist."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/content-pipeline/wiring-contract-doctrine",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "wiring-contract-doctrine.md": {
      "disposition": "reverify",
      "reason": "Useful authoring-time grants/triggers/dependencies, but four fields are not a proof that every runtime reachability condition is modeled. Static typed references can detect some orphans yet cannot prove conditional paths executable. Consumer count and declaration-to-codepath ratios do not measure coverage, and binary assets are not necessarily manual-only. Keep planned checks distinct from observations."
    },
    "techniques/contract-injection-into-prompts.md": {
      "disposition": "reverify",
      "reason": "Prompt injection can help but does not guarantee lower rejection rates or uniquely change output distributions; checker feedback can guide repair. Keep validation rather than dropping it under budget pressure. Post-hoc wiring repair can be valid if references and behavior are rechecked. Elision must not omit required acceptance constraints, and shared constants alone do not ensure semantic agreement."
    },
    "techniques/cross-catalog-link-resolution.md": {
      "disposition": "reverify",
      "reason": "Declare edge direction and reachable roots, including conditions, instead of ambiguous backward traversal. Required cycles can be generated in phases; existence does not establish player reachability. Fixing a typo/alias is another remedy beyond producing or dropping a target. Binary/external assets can resolve through typed providers; missing catalogs require unknown, and deferred content can still be erroneously referenced by a shipping path."
    },
    "techniques/four-field-wiring-contract.md": {
      "disposition": "reverify",
      "reason": "Four concerns are useful schema choices, not an exhaustive theorem. Runtime services/resources need registration and consumption semantics rather than literal grants. Binary production capability must be checked, not inferred from format. Empty dependencies can be valid; named planned verification is not performed evidence, and extra metadata does not inherently weaken conjunction."
    },
    "techniques/no-gray-box-rule.md": {
      "disposition": "reverify",
      "reason": "Scope done to requirements: compilation can complete a compile-only task, while assigned visuals/behavior are themselves structurally checkable. Invisible triggers and static scenery can legitimately lack one of those assignments. Uniform green does not prove compilation-only checking, and structural precision/recall claims need measured evidence."
    },
    "techniques/placeholder-rejection.md": {
      "disposition": "clarify",
      "reason": "Repaired minimum character count as specificity proof and generic one-word/none rejection. Requires typed references, explicit blocked/not-applicable states, ambiguity handling and a planned action/expected result while preserving distinction from executed evidence."
    },
    "techniques/verification-must-name-a-tier.md": {
      "disposition": "clarify",
      "reason": "Repaired one-observation-only and highest-tier-as-completion rules. Multiple independent checks may belong to one artifact; track required evidence kinds and actual outcomes, bind them to content and distinguish proposed test from performed observation."
    },
    "applications/node--placeholder-rejection.md": {
      "disposition": "reverify",
      "reason": "Historical Node/PoF locations, counts and verification date were not rerun. The displayed regex is prefix-based rather than whole-field and its word boundary mishandles punctuation markers; MIN_PROSE can reject valid short IDs. String(d) accepts null, numbers and objects, so malformed dependency elements can pass. Tier token presence does not validate meaning; equal grep counts do not prove one-to-one composition."
    },
    "applications/node--verification-must-name-a-tier.md": {
      "disposition": "reverify",
      "reason": "Historical Node/PoF references and verification date were not rerun. Substring/name heuristics can match the wrong class; five unrelated input assets do not prove the required input set exists. An unavailable/stale manifest is not a missing feature. The shown multi-observation contract is legitimate and contradicts the single-observation technique; actual runtime results are absent."
    },
    "applications/process--contract-injection-into-prompts.md": {
      "disposition": "reverify",
      "reason": "Historical process/PoF locations and verification date were not rerun. The displayed affix contract uses multiple observations, contrary to the one-check instruction, and descriptive dependencies need actual typed resolution. Importing MIN_PROSE shares one number rather than the complete checker semantics; caps and claimed tests were not rerun. Prompt text is not evidence that binary production is impossible or wiring executed."
    }
  }
}
```

## Architecture review - 2026-09-10 (re-review after the compression revert)

Read all 10 documents at current bytes. The earlier 2026-09-10 record on this note put
almost every document at `reverify` against a digest that the revert then invalidated;
this entry supersedes it, and it retracts the blanket `reverify` for the two Node
applications specifically, because their load-bearing counts are checkable and I checked
them.

Read (not executed) against the `pof` working tree at `C:\Users\kazda\kiro\pof`:
`src/lib/catalog/pipelines/*.ts` carries **137** `wiringContract:` blocks across **33**
pipeline files, and **137** occurrences of `wiringContractSound(` — one per declared
block, exactly as `node--placeholder-rejection` reports.
`src/lib/catalog/acceptance/wiringCheckers.ts:38` is `export const MIN_PROSE = 12` and
line 40 is the placeholder regex the application quotes verbatim. So the incident's
central measurement — declarations authored versus declarations consumed, now equal — is
confirmed at source.

The finding is in the narration around those numbers. The application says "The count is
real and has grown", then reports 137 today against a header quoting 137 across 30
pipelines, then argues that 167 was a forge-time miscount because nothing under
`src/lib/catalog/pipelines/` changed since 2026-08-20. Those three sentences cannot all
be true: a count that is 137 in the header and 137 today has not grown, and a file set
that grew from 30 to 33 pipelines is not an unchanged path. The measurement is right and
the story told about it is wrong, which is the kind of defect that survives review
precisely because the number checks out.

A second, smaller mismatch sits across the doctrine's own layers.
`techniques/placeholder-rejection.md` step 4 says to set the specificity floor "well
below" the shortest genuine answer, "roughly a third", and then cites the production case
as thirty characters with a floor of twelve. Twelve is two fifths of thirty, not a third,
and `node--placeholder-rejection` describes the same relation from the other end as "2.5x
headroom". Neither framing is wrong about the numbers; the technique's rule of thumb
does not generate its own worked example, and a reader deriving a floor from "a third"
would get ten.

Everything else in the subject held up. The four fields are argued from four distinct
break points rather than asserted; the empty-versus-malformed distinction on
`dependencies` is stated identically in the technique and in the checker; the
`contract-injection-into-prompts` claim that the prompt and the checker share one source
is realised in `pof` as an actual `import { MIN_PROSE }` rather than a paraphrase, which
is the strongest available form of that discipline. The golden path's "name every
consumer" test — at least a grader, a surface and a prompt — is the most transplantable
thing here and I found nothing to dispute in it.

Two honest deviations remain deviations, correctly labelled: `wiringContractSound`
returning `pass` for an absent contract, and `linkCheckers.ts` returning `pass` when no
context is supplied. Both are cases where the repo's behaviour is looser than the
standard and the application says so rather than softening the standard. I would not
change either document for that.

What I did not evaluate: nothing was executed — no build, no test, no checker run, no
engine session. The `verification-rules.ts` manifest thresholds, the deferred `L3` path
and the `ARPG-LAWS.md` citations were not re-read at source, so
`node--verification-must-name-a-tier` and `process--contract-injection-into-prompts`
retain reverify on their own citations.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/wiring-contract-doctrine",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:6f9e2fa312b961ba",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read at current bytes. Source read (not executed) in the pof working tree for the wiring-contract counts, MIN_PROSE and the placeholder regex. Not evaluated: any build, test run, checker execution, engine session, or the verification-rules/ARPG-LAWS citations.",
  "counterexamples": [
    "A reader deriving the specificity floor from the technique's 'roughly a third' of a thirty-character shortest answer gets ten, not the twelve the same paragraph and the application both cite.",
    "The doctrine's completeness test asks for at least three consumers of a contract but gives no reading for a system with exactly two, which is the state a rollout compromise routinely leaves behind.",
    "A step that is genuinely wired but declares no contract passes wiringContractSound identically to a step that is not wired at all, so the 137 composed checks cannot separate 'wired, undeclared' from 'not wired' — the golden path names this and the shipped checker still permits it."
  ],
  "sources": [
    {
      "path": "C:/Users/kazda/kiro/pof/src/lib/catalog/pipelines/*.ts",
      "result": "Read, not executed. Establishes 137 wiringContract: blocks across 33 pipeline files and 137 occurrences of wiringContractSound(, confirming the application's authored-equals-consumed measurement. Establishes nothing about whether any of those checks passes at runtime, and contradicts the same document's 'the count is real and has grown' narration."
    },
    {
      "path": "C:/Users/kazda/kiro/pof/src/lib/catalog/acceptance/wiringCheckers.ts",
      "result": "Read, not executed. Confirms MIN_PROSE = 12 at line 38 and the placeholder regex at line 40 verbatim. Does not establish that twelve is the right floor, nor that it was derived the way the technique says it should be."
    }
  ],
  "documents": {
    "wiring-contract-doctrine.md": {
      "disposition": "keep",
      "reason": "The six-month narrative, the reachability-is-a-graph-property argument and the name-every-consumer test are internally consistent and match the shipped realisation."
    },
    "techniques/four-field-wiring-contract.md": {
      "disposition": "keep",
      "reason": "Four fields derived from four distinct breaks in the chain; the declared-empty versus malformed rule matches the checker exactly."
    },
    "techniques/verification-must-name-a-tier.md": {
      "disposition": "keep",
      "reason": "Owns only the join to the ladder and says so; the labelling-not-coverage claim is argued, not asserted."
    },
    "techniques/placeholder-rejection.md": {
      "disposition": "clarify",
      "reason": "Step 4's 'roughly a third' does not generate the worked case it cites in the same paragraph (thirty-character shortest answer, floor of twelve); state the ratio the corpus actually uses."
    },
    "techniques/contract-injection-into-prompts.md": {
      "disposition": "keep",
      "reason": "The filter-cannot-improve-its-input argument, the per-field split and the cap-with-elision rule are all sound and all realised at source."
    },
    "techniques/cross-catalog-link-resolution.md": {
      "disposition": "keep",
      "reason": "Three outcomes rather than two, the orphan buckets and the unrunnable-check-is-unmeasured rule are stated correctly and are what the shipped checker deviates from."
    },
    "techniques/no-gray-box-rule.md": {
      "disposition": "keep",
      "reason": "The precision/recall asymmetry argument is the strongest claim in the subject and is stated without overreach."
    },
    "applications/node--placeholder-rejection.md": {
      "disposition": "clarify",
      "reason": "137 blocks / 33 files / 137 composed checks and MIN_PROSE = 12 all confirmed at source, but the surrounding narration says the count 'has grown' while reporting the same 137, and calls the pipelines path unchanged while reporting 30 to 33 files."
    },
    "applications/node--verification-must-name-a-tier.md": {
      "disposition": "reverify",
      "reason": "The manifest rules, the 5/2 Enhanced Input thresholds and the entityRuntimeDeferred path were not re-read at source and no engine run witnessed them."
    },
    "applications/process--contract-injection-into-prompts.md": {
      "disposition": "reverify",
      "reason": "The prompt caps, the three-consumer claim and the ARPG-LAWS/canon-seed citations were not re-read; the MIN_PROSE import discipline is confirmed only from the checker side."
    }
  }
}
```
