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
