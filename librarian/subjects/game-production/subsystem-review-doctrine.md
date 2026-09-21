---
domain: game-production
subject: subsystem-review-doctrine
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# subsystem-review-doctrine

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/subsystem-review-doctrine",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:094826425ad01f6e",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "An unchanged defect is newly detected after a nondeterministic reviewer missed it; new observation does not identify the introducing commit.",
    "A partial scan of a module skips the failing check yet emits no finding; module-level scope filtering would falsely resolve it.",
    "An immutable constructor-initialized armor value has no later writer and still changes every damage calculation."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/craft-judgment/subsystem-review-doctrine",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "subsystem-review-doctrine.md": {
      "disposition": "reverify",
      "reason": "Grounding and explicit review scope are useful. Reverify uncited model-error prevalence and claimed trace yield. A newly observed finding is not proof of recent introduction; absence is not proof of repair. Grounded uncertainty and independently reviewable subsets are legitimate, and observable behavior described from source is not an executed witness."
    },
    "techniques/four-pass-ordering.md": {
      "disposition": "reverify",
      "reason": "Finding prerequisites should form an evidence dependency graph, not a compulsory global order. A profiler can establish measured cost before architectural interpretation, and local correctness can be proven without reviewing every structural issue. Separate observation from proposed optimization; invalidate dependent findings rather than all unrelated work."
    },
    "techniques/ground-truth-pass-before-proposals.md": {
      "disposition": "reverify",
      "reason": "Identity and member citations reduce invention but a model can invent specific behavior too. Reading a whole file does not confirm its external entities or execution. State source-inferred versus observed behavior, allow non-runtime entities and grounded conditional hypotheses, and do not convert missing access into an absence finding. Claimed effort savings need evidence."
    },
    "techniques/per-subsystem-check-sets.md": {
      "disposition": "reverify",
      "reason": "Checks can be derived from contracts and risk analysis before incidents. Repeated waivers do not prove a rule wrong, and rare catastrophic checks should not be retired on low firing frequency alone. Shared code-level checks can inspect component seams; a passing known check establishes only its measured scope."
    },
    "techniques/regression-diff-new-persisting-resolved.md": {
      "disposition": "clarify",
      "reason": "Repaired automatic recent-change attribution and absent-means-resolved. Adds comparable instrument and completed-check scope, unknown/not-reassessed outcomes, occurrence identity and affirmative resolution evidence."
    },
    "techniques/severity-by-consequence.md": {
      "disposition": "reverify",
      "reason": "Consequence and effort are useful independent axes, but an editor crash can destroy authoring work or block production. Tool error levels need not encode confidence. Weighted judged content can still be masked without a hard failure rule; state affected configurations, impact and realistic reachability instead of shipping-only harm."
    },
    "techniques/trace-one-interaction-end-to-end.md": {
      "disposition": "clarify",
      "reason": "Repaired read-without-writer as automatic no-op, binary artifact as necessarily absent/unautomatable, and duplicated representation as necessarily conflicting authority. Traces distinguish static inference from actual execution and optional terminal/listener behavior."
    },
    "applications/node--regression-diff-new-persisting-resolved.md": {
      "disposition": "reverify",
      "reason": "Historical Node/PoF locations and verification date were not rerun. Eighty-character normalized descriptions can collide or fail to match rewording; subsystem scope does not prove individual checks completed. The 25 percent content weight alone cannot prevent green on failed content; discrepancy enforcement needs consumer verification. Disappearing fingerprints are not confirmed fixes."
    },
    "applications/process--ground-truth-pass-before-proposals.md": {
      "disposition": "reverify",
      "reason": "Historical process prompt and verification date were not rerun. It explicitly lacks a machine-readable refusal and downstream gate, so the conclusion that one extra call removes all invented-entity findings is unsupported. Prompt order does not establish confirmed premises or runtime observation."
    },
    "applications/process--trace-one-interaction-end-to-end.md": {
      "disposition": "reverify",
      "reason": "Historical process trace prompt and verification date were not rerun. Default or constructor-assigned Armor may affect damage without a GE/table writer; binary assets may exist or be authored by supported editor automation. The displayed prompt specifies a method, not a completed witness; trace variants and combat design claims require separate verification."
    }
  }
}
```

## Architecture re-review after the compression revert - 2026-09-10

Read the golden path, all six techniques and all three applications at their reverted bytes,
then opened the PoF checkout at `C:/Users/kazda/kiro/pof` (HEAD `d823bffe`) to check the
three applications. Reading source, not executing it: no evaluator run, no model call, no
diff computed.

The entitlement rule - a review pass may only conclude what the passes before it confirmed -
is the organising idea and it earns that position: the four-pass ordering is derived from it
rather than asserted, the ordering is explicitly by premise graph rather than by cost, and
the grounding pass is given a required output and a refusal branch instead of an
unfalsifiable instruction to read the code. The observable-runtime-behaviour check is the
sharpest single item in the subject, and its justification - a plausible parent and plausible
members can be confabulated from priors, a specific observable behaviour is a much narrower
target - is correct and is what makes the pass more than ceremony. The three seam defects in
`trace-one-interaction-end-to-end` are each named with the reason no per-file check finds
them, and the read/write list is correctly identified as the step that surfaces two of the
three on its own.

The one finding I can defend is a sourcing gap in the golden path. Its opening argument rests
on this sentence: "Published measures of code-model grounding failures put invented interfaces
at a substantial and persistent fraction of all such errors, and the rate is worse in
ecosystems with loose, fast-moving interfaces than in tightly documented ones." No source is
named, in the golden path or in any technique. It is the only empirical claim in the subject
and it is doing real work - it is what converts "an assisted reviewer might fabricate" into
"an assisted reviewer will, at a measurable rate", which is the premise for treating the
grounding pass as load-bearing rather than optional. Either cite the measures or restate the
claim as observed practice on this fleet. I did not attempt to resolve it: no web access was
used this run, so I can neither confirm nor refute the figure, which is why this is a citation
finding rather than a claim finding.

Two things I checked and did not raise. The `regression-diff` technique's line-insensitive
identity across runs paired with line-sensitive deduplication within a run is not a
contradiction - the two answer different questions and the document says which. And the
severity table's reachability rule (an editor-only crash is not critical, a serialisation
convention violation that will corrupt saves is) is the correct application of consequence
over category and is exactly the example a reader needs.

The three applications hold at PoF HEAD. `EVAL_PASSES` is still
`['ground-truth','structure','quality','performance']` with a module-specific fifth pass
appended where defined; `GROUND_TRUTH_CHECKS` is still the four lines quoted, the fourth being
the refusal; the combat-trace pass still asks for the numbered call graph before the JSON
findings. The recorded deviations still stand: a Pass 0 refusal and a Pass 0 clean run are
both an empty array, so the pipeline cannot tell them apart, and nothing gates a later pass on
Pass 0 having confirmed anything. The regression-diff application's deviations - resolved is
one bucket with no deletion split, no promotion of long-persisting findings, no
instrument-change guard - were not re-checked line by line but nothing in the tree suggested
they had moved.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/subsystem-review-doctrine",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:1283ec821397f6bc",
  "disposition": "clarify",
  "coverage": "Golden path, six techniques and three applications read in full at reverted bytes. The two prompt-side applications' citations re-checked by reading the live PoF checkout (HEAD d823bffe). Not evaluated: the unsourced published-measures claim in the golden path (no web access used this run); any evaluator run, model call or diff computed; the regression-diff application's deviations beyond a surface check.",
  "counterexamples": [
    "The golden path's only empirical claim - that published measures put invented interfaces at a substantial and persistent fraction of code-model grounding errors, worse in loose ecosystems - names no source, and it is the premise that makes the grounding pass load-bearing rather than optional.",
    "The four-pass entitlement order and the check-set grouping rule together have no home for an entry whose premise spans passes: a convention violation in a serialisation layer is a quality-pass finding whose severity is decided by a reachability claim about the shipping configuration, which no pass establishes.",
    "The regression diff refuses to compare across a reviewer change and treats the run as a new baseline, but the same subject requires re-grounding after any code change; a pipeline that re-grounds on every run and occasionally changes its check set can produce a sequence of baselines with no diff between any two of them, and nothing names that state."
  ],
  "sources": [
    {"path": "C:/Users/kazda/kiro/pof/src/lib/evaluator/module-eval-prompts.ts", "result": "Confirms EVAL_PASSES, the four GROUND_TRUTH_CHECKS lines including the refusal branch, and the module-specific fifth pass appended only where tracePass is defined. Does not establish that any pass is gated on Pass 0's outcome - the dispatch is still a list, which is the deviation the application records."},
    {"path": "knowledge/game-production/craft-judgment/subsystem-review-doctrine/subsystem-review-doctrine.md", "result": "Establishes that the published-measures sentence carries no citation anywhere in the subject. Does not establish whether the underlying figure is right or wrong; no web source was consulted this run."}
  ],
  "documents": {
    "subsystem-review-doctrine.md": {"disposition": "clarify", "reason": "One repair: the appeal to published measures of code-model grounding failures names no source, and it is the subject's only empirical claim and the premise that makes the grounding pass load-bearing. Cite it or restate it as observed practice. Everything else - the entitlement rule, the subsystem-as-unit argument, the trace-outranks-checks claim, the severity-is-consequence rule and the six naive-reading failures - is sound and mutually consistent."},
    "techniques/four-pass-ordering.md": {"disposition": "keep", "reason": "The passes are presented as one instantiation of the entitlement rule with the rule taught first, and the ordering is justified by the premise graph rather than by cost. Both inversions are worked with their distinct failure signatures, and not-run versus clean being different values in the report is the operational half."},
    "techniques/ground-truth-pass-before-proposals.md": {"disposition": "keep", "reason": "Turning 'read the code first' from an unfalsifiable instruction into a pass with a required output and a refusal branch is the whole move, and the observable-runtime-behaviour check is correctly identified as the item carrying the pass's weight, with the reason. The note that the grounding statement itself contains findings is a real and non-obvious dividend."},
    "techniques/per-subsystem-check-sets.md": {"disposition": "keep", "reason": "The shape of an entry is stated as the transplantable craft rather than any list, entries are phrased as the expected condition so the finding is its negation, and the maintenance obligation names the slow failure that kills check sets. The test distinguishing a retired entry from one that stopped firing because it taught the team is the right question."},
    "techniques/regression-diff-new-persisting-resolved.md": {"disposition": "keep", "reason": "Line-insensitive identity across runs with line-sensitive deduplication within a run answers two different questions and says which. Scope restriction is correctly named the single most important correctness rule, the resolved-by-deletion split is a real inflation this closes, and no-prior-run versus prior-run-with-no-findings is distinguished in the data rather than in prose."},
    "techniques/severity-by-consequence.md": {"disposition": "keep", "reason": "Five explicit non-sources for severity, a ladder whose rows are stated as consequences rather than categories, and reachability as the gate that makes the editor-crash and serialisation-convention examples come out right. Effort as a separate axis, never averaging severities, and reporting disagreement between signals as outranking the composite are each correct."},
    "techniques/trace-one-interaction-end-to-end.md": {"disposition": "keep", "reason": "The three seam defects are each named with why no per-file check finds them, the six-step graph forces continuity so a step that cannot name its successor is the finding, and the two sweeps derive the authorability and no-op findings mechanically. The cost argument - last thing to cut, not first - follows from the defect class having no other detector."},
    "applications/node--regression-diff-new-persisting-resolved.md": {"disposition": "keep", "reason": "The fingerprint, the includeLine split, the scope filter and the hasPrevious distinction all match the technique item for item, and the three deviations it records - resolved as one bucket with no deletion split, no promotion path for long-persisting findings, no instrument-change guard - are stated without lowering the standard. The combined-health section is the right place to show severity roll-up meeting the diff."},
    "applications/process--ground-truth-pass-before-proposals.md": {"disposition": "keep", "reason": "Re-checked at PoF HEAD: EVAL_PASSES and the four GROUND_TRUTH_CHECKS lines are unchanged, including the refusal. Both recorded deviations still stand - a refusal and a clean run are both an empty array, and the passes are dispatched as a list rather than a dependency chain, so ordering is present and the gate between links is not."},
    "applications/process--trace-one-interaction-end-to-end.md": {"disposition": "keep", "reason": "The prompt maps onto the technique's six steps including the graph-before-findings output order and the two sweeps, and all three seam defects appear in one concrete instance. The stated deviation - the mechanism is general and only one module defines a trace - is accurate and the standard is correctly not lowered to match."}
  }
}
```
