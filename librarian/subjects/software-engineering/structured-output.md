---
subject: structured-output
domain: software-engineering
last_touched: 2026-09-23
touched_by: intake
dry_streak: 0
---

# structured-output

First touch: [[2026-08-22-7]], external reconcile against `vercel/ai`
@ `ed857f5` (ai 7.0.77). Gained `node--schema-validation-and-repair`
(uncovered) - second stack; single-stack debt cleared. Hint confirmed; the
extraction-strategies alternative was tested and found to be one strategy, not
a ladder.

## 2026-09-04 - /intake run (stencil harness playbook)

- New technique `constrained-decoding-is-a-shared-budget`. The golden path's "When generation can be constrained" bullet is a **per-call quality decision** with the correct standing caution that it guarantees syntax and syntax was never the contract. It has no notion that the capacity is **finite and shared**: providers cap how many strict schemas a request may carry, so enough independently authored contributions push a request past the ceiling and the provider then rejects *every* request - including ones needing no constraint. The request that breaks is not the one that asked for too much, which makes it near-undiagnosable from the symptom.
- Second half: **the dialect belongs to the route, not the model.** The golden path's third-copy rule assumes one wire schema per contract; the same model routed through a native host, a proxy or a self-hosted server may need different renderings. One definition, one rendering per route, produced by the assembling layer - never a pre-rendered grammar carried by a contribution. Where a route's support is unestablished the answer is *unknown*, not *unsupported*.
- Shedding must be **visible to the shed party**: a contribution whose constraint was dropped has been moved back onto the tolerant ladder and needs to know, or it parses believing syntax was guaranteed.
- **Applied `code` to a fleet evaluation engine and shipped, verdict `better`, `ab-paired`.** The dialect half was already built correctly there (one schema rendered into three provider dialects, with an overridable API base making the several-routes force live); the budget half has **no seam** - one claimant only, recorded as the case where the rule is genuinely unnecessary. **The structural fact nobody designed:** the result type already degrades the *sibling* guarantee in-band - a three-state determinism enum read at 66 sites, explicitly weaker when sampling knobs were rejected and retried without them - while schema enforcement rode on a stderr line. Measurable: call sites able to distinguish an enforced schema from a prose fallback from the value they hold, **A=0 -> B=all**. Both blocking gates green, 127 engine tests pass.

## Open leads (banked, convergence rule applies)

- A budget of one is better spelled as a non-recursive call than a counter -
  make the retry structurally incapable of a second attempt.
- The repaired candidate must not overwrite the original in the failure
  outcome: the give-up payload carries BOTH pre- and post-repair candidates.
- Provider-side grammar constraint does not replace the door.
- A validator-optional schema abstraction is a silent-strictness hazard:
  never silently SKIP, the sibling of never silently coerce. (THIRD SIGHTING
  of the opt-in-guard family - with the webhook gateway's no-key-no-dedup and
  the protocol SDK's opt-in security checks. Cycle-3 candidate.)

## Cross-subject proposals

- The parallel repair hook for tool calls (repairToolCall) - same technique
  shape, different artifact; possible shared_with case.
- The four-state partial-parse verdict vocabulary (undefined-input /
  successful-parse / repaired-parse / failed-parse) -> streaming-output.
- Consider naming "structural completion of a truncated prefix" as a distinct
  extraction strategy beside candidate-search ladders.

## Applied to the technique layer

- 2026-08-22-8: **never silently skip** (opt-in-guard family) applied to `schema-validation-and-repair`; the technique also now cites the new `verdict-survives-boundary` law ([[2026-08-22-8]]).
- 2026-08-22-10: `schema-validation-and-repair` now cites BOTH promoted laws - `absent-guard-is-loud` and `unknown-is-not-a-value` - as the only technique anchoring each family in one file ([[2026-08-22-10]]).

## 2026-08-25 - /intake run 13 ([[2026-08-25-awesome-llm-apps]])

- `schema-validation-and-repair` gained "The schema can carry the epistemic contract": cross-field validators reject the incoherent quadrants (answered-without-citations; refused-with-citations), generalised to any artifact whose fields jointly assert what none asserts alone. Sighting: a tutorial tree enforcing it with tests, plus the fleet's own enum-armed review-resolution schema as convergence. (Edit itself reached HEAD via a sibling session's commit f0463ff, which swept the in-flight file - content correct, attribution noted here.)

## 2026-09-06 - /intake run (praisonai)

- New technique `constraint-and-tool-channel-exclusion`. The golden path's "When
  generation can be constrained" bullet said *use it*, qualified only by "syntax
  was never the contract"; [[2026-09-04-1]] added the capacity qualification
  (several claimants, finite budget). Neither could see the case where the
  constraint is granted **uncontested to the only claimant and disables something
  else**: on providers that emit tool calls through the content channel, a grammar
  over that channel makes the tool-call token unemittable, so the model fills the
  schema from nothing. HTTP 200, a validating object, an invention. Measured
  two-arm reproduction in [[../../sources/2026-09-06-praisonai]]. The golden-path
  bullet now carries the precondition.
- **This is the run's only row that refutes something the corpus asserts**, and the
  refutation is of an omission rather than of a claim - the mechanism was right and
  a precondition was missing.
- **Second sighting of the shed-visibility rule, in a second project.** The
  2026-09-04 run landed "shedding must be visible to the shed party" inside
  `constrained-decoding-is-a-shared-budget` and shipped a `code` change to a fleet
  evaluation engine whose measurable was *call sites able to distinguish an
  enforced schema from a prose fallback*, `A=0 -> B=all`. This run found the same
  defect shape in an unrelated project (kp's document-analysis seam) with the same
  measurable and the same result, `A=0 of 1 -> B=1 of 1`. Two independent projects,
  two runs, one rule. **That is convergence and it is the strongest evidence this
  subject has produced for the shed-visibility half** - named here so a third
  sighting is recognised as a promotion candidate rather than a repeat.
[[2026-09-06-ace-step-1-5]] (intake, research-model release) added
`enumerable-domain-decoding`. The promoting question was executed against this
subject's own golden path and it answered in one sentence: constrained decoding
"guarantees syntax, and syntax was never the contract... a quantity out of range
... is exactly as dangerous well-formed as malformed." Two of that sentence's
three examples are enumerable domains and one is not, and the technique draws the
line: a domain is enforceable in the decoder when it can be materialised and
compiled to a token-prefix tree in the context it will be emitted in. The
validation door does not move - referential existence, cross-field consistency
and truncation all survive - but it stops being the only thing between the model
and a corrupt field. Application is the inverse case, a fleet pipeline with 17
imperative repairs and 1 declared domain across 153 exported fields.

[[2026-09-16-langextract]] (intake, vendor repository) added `graded-span-grounding`: the model returns text and the system computes where it is. Four design entries from one alignment step (closed grade, occurrence assignment for repeats, coverage plus density, examples through the same aligner) landed as one technique, not a triple. The rule that locating and admitting take different bars came from the fleet, not the source. ascent's exact claim verifier checked raw history while its prompt showed a bulleted, fence-defused view: 0/147 faithful copies verified, 147/147 after inverting the transports, fabrications 0/267 in both. The source's fuzzy aligner, run as the alternative, accepted a span straddling two commits on punctuation tokens. Applications: the source tree (python) and ascent (node, applied, better, shipped). Backlog: kp has a scorecard comment on evidence rendered as a verbatim quote, not yet read.

### 2026-09-17 - `/harvest backlog` wave 2, amendment to graded-span-grounding

New section: a resolved citation is only as primary as the file it lands on. From [[2026-09-01-awesome-game-security]] and [[2026-08-22-inside-deepwiki]]. Other bundles hold the general rule that a derived artifact is never primary evidence; the discriminator on this side is that the derived location is produced by the system under test itself (a projection, a generated index, a summary cache), so its tier is decidable mechanically from a header or a body hash, and the rule belongs in the verifier rather than in an editorial ladder. Measured on ascent's claim verifier: a guidance file and its own generated projection awarded 6 points as two agreeing documents, in sync or drifted; 0 after, with independent agreement still scoring. The exclusion is to agreement only.

## 2026-09-23 - [[2026-09-23-1]]

Lead drain (run lib-0923), L288 AMEND to `enumerable-domain-decoding`: a per-candidate door with a +/-k step bound does not preserve the spread between candidates. One sighting - no technique.

**Impact** (stale verdicts before this landing, from the map rebuilt at the run start): systedo-case 1.

## 2026-10-31 - architecture review

First architecture-review record. Two records: the review against the bytes at
dispatch, then a re-record after three clarify items were applied (golden-path
technique list and schema-plus-tools scoping, the tool-channel quantifier, and the
drifted counter-example anchors). Still owed: the extraction ladder's rung 4/5 order,
a garbled phrase in artifact-lifecycle, and a full re-read of the companion
dispatcher application after its module split.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/structured-output",
  "date": "2026-10-31",
  "baseline": "5a08b4610",
  "digest": "sha256-b2:d51aec71411ccb2b",
  "disposition": "clarify",
  "coverage": "All 20 current documents (golden path, 12 techniques, 8 applications) read in full. Source checks are narrower than corpus reading: one provider structured-outputs page, two pinned upstream files, one consumer checkout's anchors.",
  "trigger": "Pending architecture review; no prior record.",
  "intended_benefit": "Turn model text into exactly one of validated artifact or described failure, never a half-parsed, default-valued or silently unconstrained one.",
  "failure_if_ignored": "Legal-looking corrupt state: default-constructed artifacts, validated-but-unanswered responses, fabricated answers where a tool call was suppressed.",
  "boundary": "Starts at the settled record from streaming-output; ends at a validated proposal handed to hitl-approval; trust framing belongs to prompt-safety.",
  "counterexamples": [
    "A provider that carries tool calls in a separate structured field composes an output schema with tools; refusing that combination at assembly blocks a working turn.",
    "A single-claimant system has no constraint budget to manage; shedding machinery there is a mechanism for a failure it cannot have.",
    "A payload whose only defect is a trailing comma is recovered as a marked partial by rung 4 before rung 5's deterministic repair could make it complete.",
    "A human-authored settings document may legitimately default when absent; extraction never may."
  ],
  "sources": [
    {
      "url": "https://platform.claude.com/docs/en/build-with-claude/structured-outputs",
      "result": "Read. 'These limits apply to the combined total across all strict schemas in a single request' supports the shared-budget technique; 'When combined, Claude can call tools with guaranteed-valid parameters AND return structured JSON responses' refutes a universal schema-plus-tools exclusion and supports the technique's per-provider scoping."
    },
    {
      "url": "https://github.com/vercel/ai/blob/ed857f5/packages/ai/src/generate-object/parse-and-validate-object-result.ts",
      "result": "Read pinned file; confirms the single structural retry, narrow catch and null-repair give-up claimed by the node application."
    },
    {
      "url": "https://github.com/google/langextract/blob/70cfb988/langextract/resolver.py",
      "result": "Read pinned file; fuzzy defaults 0.75 and 1/3, U+241F delimiter and order-preserving occurrence DP confirmed."
    },
    {
      "url": "https://pub.towardsai.net/ollama-0-34-4-lets-qwen-think-before-json-then-blocks-the-tool-call-5-of-6-parsers-tested-8313c8dfb089",
      "result": "Secondary practitioner report, not primary: a later local server version blocks tool calls under a format grammar for 5 of 6 parsers. Consistent with version-dependence; not relied on for any edit."
    },
    {
      "source": "Consumer desktop checkout at baseline of this run",
      "result": "ai_artifact_flow anchors hold; deliberation unwrap_or_default sites moved to :618 and :1503; companion dispatcher split into a module directory."
    }
  ],
  "documents": {
    "structured-output.md": {
      "disposition": "clarify",
      "reason": "(1) 'The techniques' list omits enumerable-domain-decoding and constraint-and-tool-channel-exclusion, both declared in frontmatter. (2) The schema-plus-tools precondition is stated as universal ('refused at assembly'), but its own technique scopes it to providers that emit tool calls in the content channel, and primary provider docs show a provider where the two compose."
    },
    "applications/node--graded-span-grounding.md": {
      "disposition": "keep",
      "reason": "Dated paired account with its own limits stated (small model arm, no locating seam). Consumer tree not reopened this run; verified_on unchanged."
    },
    "applications/node--schema-validation-and-repair.md": {
      "disposition": "keep",
      "reason": "Re-read the pinned upstream repair wrapper: single retry through the non-repairing inner function, catch limited to NoObjectGeneratedError caused by JSONParseError/TypeValidationError, null repairText rethrows the original. Remaining line anchors and deviation claims not re-checked; verified_on unchanged."
    },
    "applications/python--constraint-and-tool-channel-exclusion.md": {
      "disposition": "keep",
      "reason": "Self-dated server observation with a re-verification posture; a secondary report on a later server version (format-after-thinking blocks tool calls for most parsers, one harmony-format parser keeps them) is consistent with 'changes between versions'. Private pipeline half not re-executed."
    },
    "applications/python--enumerable-domain-decoding.md": {
      "disposition": "keep",
      "reason": "Structural-only account explicitly framed with its falsifier (clamp fire rate). Private tree not reopened; verified_on unchanged."
    },
    "applications/python--graded-span-grounding.md": {
      "disposition": "keep",
      "reason": "Pinned upstream resolver re-read: fuzzy threshold 0.75 and density 1/3, U+241F unit-separator delimiter, order-preserving occurrence DP all present (line anchors approximate, not re-run through the anchor checker)."
    },
    "applications/rust--artifact-lifecycle.md": {
      "disposition": "clarify",
      "reason": "Confirmed anchors in the shared flow hold (extractor :93, clear_id_if :297/:351/:384, catch_unwind inside :139-167, cancel identity :271); the deliberation counter-example anchors :516/:1372 drifted to :618/:1503. The 91% / $44.94 census figure is a dated measurement not re-run."
    },
    "applications/rust--constrained-decoding-is-a-shared-budget.md": {
      "disposition": "keep",
      "reason": "Dated paired account; single-claimant finding correctly bounds the technique. Private engine not reopened; verified_on unchanged."
    },
    "applications/rust--op-grammar-allowlisting.md": {
      "disposition": "reverify",
      "reason": "The cited dispatcher.rs no longer exists: the module is now split into a dispatcher/ directory (catalog, dispatch, envelope, tests, ...), so every line anchor is stale. Core symbols still exist (ALLOWED_ACTIONS in catalog, dispatch_with_sys, repair_op_json in envelope, 'rejected unknown action', the show_ship_milestone absence test). The catalog now declares ops through an op! table, which may retire deviation 2 (no single authority for menu/allowlist/arms); needs a full re-read before the deviation is kept or dropped."
    },
    "techniques/answer-coverage-gating.md": {
      "disposition": "keep",
      "reason": "Denominator-carrying gate is distinct from the validation door; zero-denominator, coercion-laundering and fallback-attribution rules are internally consistent with schema-validation-and-repair and output-budget-signal."
    },
    "techniques/artifact-lifecycle.md": {
      "disposition": "clarify",
      "reason": "Machine, single-flight, identity and convergent finalization hold. Still owed: 'host teardown reaps runningly' is a garbled phrase whose intended wording could not be confirmed, so it was not edited."
    },
    "techniques/constrained-decoding-is-a-shared-budget.md": {
      "disposition": "keep",
      "reason": "Primary provider documentation confirms request-scoped shared limits: 'These limits apply to the combined total across all strict schemas in a single request' (20 strict tools, 24 optional parameters, 16 union-typed parameters, plus internal compiled-grammar limits returning 400). The per-route dialect and unknown-vs-unsupported rules stand."
    },
    "techniques/constraint-and-tool-channel-exclusion.md": {
      "disposition": "clarify",
      "reason": "'On most providers' tool calls share the content channel is an unsupported quantifier contradicted by at least one major hosted provider's docs; the technique's own closing section already scopes it per provider. Mechanism and refusal rule keep."
    },
    "techniques/display-vs-machine-channels.md": {
      "disposition": "keep",
      "reason": "Two bans, extractor-owned span removal, four-quadrant per-channel failure table and three retentions are consistent with the golden path."
    },
    "techniques/enumerable-domain-decoding.md": {
      "disposition": "keep",
      "reason": "Token-ID prefix tree in emission context is a sound mechanism; the 2k spread-shrink arithmetic (two candidates each moving k toward each other) checks. The between-candidates section is long for its one-sighting status (2026-09-23 note) but is scoped and measured."
    },
    "techniques/extraction-observability.md": {
      "disposition": "keep",
      "reason": "Per-flow counters with predicates, version-tagged baselines, size-capped expiring samples, instrument-the-door meta-rule."
    },
    "techniques/extraction-strategies.md": {
      "disposition": "clarify",
      "reason": "Still owed: rung 4 (longest-valid-span, partial) sits before rung 5 (deterministic meaning-preserving syntax repair), so a payload with only a trailing comma would be recovered as a marked partial before a repair that would yield a complete artifact; this conflicts with the ladder's own cheapest-and-most-reliable-first rule. Reordering is a design change, not applied."
    },
    "techniques/graded-span-grounding.md": {
      "disposition": "keep",
      "reason": "Figures agree with the node application (140+7=147 faithful, 137+130=267 fabrications; coverage 0.8 / density 0.36). Fuzzy defaults and delimiter/occurrence-DP claims re-read in the pinned upstream resolver."
    },
    "techniques/op-grammar-allowlisting.md": {
      "disposition": "keep",
      "reason": "Closed grammar with one authority, one dispatch door, no execution path for unknown ops, scoped reference validation and replay rules."
    },
    "techniques/output-budget-signal.md": {
      "disposition": "keep",
      "reason": "Measure-not-guard, null-not-zero, conservative unknown ceilings with assumed marks, high-percentile fleet reading; scoped exclusions (authoritative length stop reason) stated."
    },
    "techniques/schema-validation-and-repair.md": {
      "disposition": "keep",
      "reason": "Door depth, declared/absent/invalid asymmetry, never coerce/skip/partially accept, ordinal repair stopping rule and give-up semantics are coherent and cite the right laws."
    }
  }
}
```

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/structured-output",
  "date": "2026-10-31",
  "baseline": "5a08b4610",
  "digest": "sha256-b2:abe3ad815f0563b3",
  "disposition": "clarify",
  "coverage": "All 20 current documents (golden path, 12 techniques, 8 applications) read in full. Source checks are narrower than corpus reading: one provider structured-outputs page, two pinned upstream files, one consumer checkout's anchors.",
  "trigger": "Pending architecture review; no prior record.",
  "intended_benefit": "Turn model text into exactly one of validated artifact or described failure, never a half-parsed, default-valued or silently unconstrained one.",
  "failure_if_ignored": "Legal-looking corrupt state: default-constructed artifacts, validated-but-unanswered responses, fabricated answers where a tool call was suppressed.",
  "boundary": "Starts at the settled record from streaming-output; ends at a validated proposal handed to hitl-approval; trust framing belongs to prompt-safety.",
  "counterexamples": [
    "A provider that carries tool calls in a separate structured field composes an output schema with tools; refusing that combination at assembly blocks a working turn.",
    "A single-claimant system has no constraint budget to manage; shedding machinery there is a mechanism for a failure it cannot have.",
    "A payload whose only defect is a trailing comma is recovered as a marked partial by rung 4 before rung 5's deterministic repair could make it complete.",
    "A human-authored settings document may legitimately default when absent; extraction never may."
  ],
  "sources": [
    {
      "url": "https://platform.claude.com/docs/en/build-with-claude/structured-outputs",
      "result": "Read. 'These limits apply to the combined total across all strict schemas in a single request' supports the shared-budget technique; 'When combined, Claude can call tools with guaranteed-valid parameters AND return structured JSON responses' refutes a universal schema-plus-tools exclusion and supports the technique's per-provider scoping."
    },
    {
      "url": "https://github.com/vercel/ai/blob/ed857f5/packages/ai/src/generate-object/parse-and-validate-object-result.ts",
      "result": "Read pinned file; confirms the single structural retry, narrow catch and null-repair give-up claimed by the node application."
    },
    {
      "url": "https://github.com/google/langextract/blob/70cfb988/langextract/resolver.py",
      "result": "Read pinned file; fuzzy defaults 0.75 and 1/3, U+241F delimiter and order-preserving occurrence DP confirmed."
    },
    {
      "url": "https://pub.towardsai.net/ollama-0-34-4-lets-qwen-think-before-json-then-blocks-the-tool-call-5-of-6-parsers-tested-8313c8dfb089",
      "result": "Secondary practitioner report, not primary: a later local server version blocks tool calls under a format grammar for 5 of 6 parsers. Consistent with version-dependence; not relied on for any edit."
    },
    {
      "source": "Consumer desktop checkout at baseline of this run",
      "result": "ai_artifact_flow anchors hold; deliberation unwrap_or_default sites moved to :618 and :1503; companion dispatcher split into a module directory."
    }
  ],
  "documents": {
    "structured-output.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added technique-list entries for enumerable-domain-decoding and constraint-and-tool-channel-exclusion; scoped the schema-plus-tools precondition to providers that emit tool calls in the content channel, noting that separate-field providers compose the two."
    },
    "applications/node--graded-span-grounding.md": {
      "disposition": "keep",
      "reason": "Dated paired account with its own limits stated (small model arm, no locating seam). Consumer tree not reopened this run; verified_on unchanged."
    },
    "applications/node--schema-validation-and-repair.md": {
      "disposition": "keep",
      "reason": "Re-read the pinned upstream repair wrapper: single retry through the non-repairing inner function, catch limited to NoObjectGeneratedError caused by JSONParseError/TypeValidationError, null repairText rethrows the original. Remaining line anchors and deviation claims not re-checked; verified_on unchanged."
    },
    "applications/python--constraint-and-tool-channel-exclusion.md": {
      "disposition": "keep",
      "reason": "Self-dated server observation with a re-verification posture; a secondary report on a later server version (format-after-thinking blocks tool calls for most parsers, one harmony-format parser keeps them) is consistent with 'changes between versions'. Private pipeline half not re-executed."
    },
    "applications/python--enumerable-domain-decoding.md": {
      "disposition": "keep",
      "reason": "Structural-only account explicitly framed with its falsifier (clamp fire rate). Private tree not reopened; verified_on unchanged."
    },
    "applications/python--graded-span-grounding.md": {
      "disposition": "keep",
      "reason": "Pinned upstream resolver re-read: fuzzy threshold 0.75 and density 1/3, U+241F unit-separator delimiter, order-preserving occurrence DP all present (line anchors approximate, not re-run through the anchor checker)."
    },
    "applications/rust--artifact-lifecycle.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: deliberation anchors :516/:1372 -> :618/:1503. Census figure remains a dated measurement; verified_on unchanged."
    },
    "applications/rust--constrained-decoding-is-a-shared-budget.md": {
      "disposition": "keep",
      "reason": "Dated paired account; single-claimant finding correctly bounds the technique. Private engine not reopened; verified_on unchanged."
    },
    "applications/rust--op-grammar-allowlisting.md": {
      "disposition": "reverify",
      "reason": "The cited dispatcher.rs no longer exists: the module is now split into a dispatcher/ directory (catalog, dispatch, envelope, tests, ...), so every line anchor is stale. Core symbols still exist (ALLOWED_ACTIONS in catalog, dispatch_with_sys, repair_op_json in envelope, 'rejected unknown action', the show_ship_milestone absence test). The catalog now declares ops through an op! table, which may retire deviation 2 (no single authority for menu/allowlist/arms); needs a full re-read before the deviation is kept or dropped."
    },
    "techniques/answer-coverage-gating.md": {
      "disposition": "keep",
      "reason": "Denominator-carrying gate is distinct from the validation door; zero-denominator, coercion-laundering and fallback-attribution rules are internally consistent with schema-validation-and-repair and output-budget-signal."
    },
    "techniques/artifact-lifecycle.md": {
      "disposition": "clarify",
      "reason": "Machine, single-flight, identity and convergent finalization hold. Still owed: 'host teardown reaps runningly' is a garbled phrase whose intended wording could not be confirmed, so it was not edited."
    },
    "techniques/constrained-decoding-is-a-shared-budget.md": {
      "disposition": "keep",
      "reason": "Primary provider documentation confirms request-scoped shared limits: 'These limits apply to the combined total across all strict schemas in a single request' (20 strict tools, 24 optional parameters, 16 union-typed parameters, plus internal compiled-grammar limits returning 400). The per-route dialect and unknown-vs-unsupported rules stand."
    },
    "techniques/constraint-and-tool-channel-exclusion.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'On most providers' -> 'On some providers'; a tool call is 'not always' metadata beside the response."
    },
    "techniques/display-vs-machine-channels.md": {
      "disposition": "keep",
      "reason": "Two bans, extractor-owned span removal, four-quadrant per-channel failure table and three retentions are consistent with the golden path."
    },
    "techniques/enumerable-domain-decoding.md": {
      "disposition": "keep",
      "reason": "Token-ID prefix tree in emission context is a sound mechanism; the 2k spread-shrink arithmetic (two candidates each moving k toward each other) checks. The between-candidates section is long for its one-sighting status (2026-09-23 note) but is scoped and measured."
    },
    "techniques/extraction-observability.md": {
      "disposition": "keep",
      "reason": "Per-flow counters with predicates, version-tagged baselines, size-capped expiring samples, instrument-the-door meta-rule."
    },
    "techniques/extraction-strategies.md": {
      "disposition": "clarify",
      "reason": "Still owed: rung 4 (longest-valid-span, partial) sits before rung 5 (deterministic meaning-preserving syntax repair), so a payload with only a trailing comma would be recovered as a marked partial before a repair that would yield a complete artifact; this conflicts with the ladder's own cheapest-and-most-reliable-first rule. Reordering is a design change, not applied."
    },
    "techniques/graded-span-grounding.md": {
      "disposition": "keep",
      "reason": "Figures agree with the node application (140+7=147 faithful, 137+130=267 fabrications; coverage 0.8 / density 0.36). Fuzzy defaults and delimiter/occurrence-DP claims re-read in the pinned upstream resolver."
    },
    "techniques/op-grammar-allowlisting.md": {
      "disposition": "keep",
      "reason": "Closed grammar with one authority, one dispatch door, no execution path for unknown ops, scoped reference validation and replay rules."
    },
    "techniques/output-budget-signal.md": {
      "disposition": "keep",
      "reason": "Measure-not-guard, null-not-zero, conservative unknown ceilings with assumed marks, high-percentile fleet reading; scoped exclusions (authoritative length stop reason) stated."
    },
    "techniques/schema-validation-and-repair.md": {
      "disposition": "keep",
      "reason": "Door depth, declared/absent/invalid asymmetry, never coerce/skip/partially accept, ordinal repair stopping rule and give-up semantics are coherent and cite the right laws."
    }
  }
}
```
