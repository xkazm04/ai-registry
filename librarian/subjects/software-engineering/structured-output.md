---
subject: structured-output
domain: software-engineering
last_touched: 2026-08-25
touched_by: external-reconcile
dry_streak: 0
---

# structured-output

First touch: [[2026-08-22-7]], external reconcile against `vercel/ai`
@ `ed857f5` (ai 7.0.77). Gained `node--schema-validation-and-repair`
(uncovered) - second stack; single-stack debt cleared. Hint confirmed; the
extraction-strategies alternative was tested and found to be one strategy, not
a ladder.

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
