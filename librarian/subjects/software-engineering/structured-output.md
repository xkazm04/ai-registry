---
subject: structured-output
domain: software-engineering
last_touched: 2026-09-04
touched_by: external-reconcile
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
