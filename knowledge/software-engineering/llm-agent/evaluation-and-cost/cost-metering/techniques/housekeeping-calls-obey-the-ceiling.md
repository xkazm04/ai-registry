---
layer: technique
type: technique
subject: cost-metering
technique: housekeeping-calls-obey-the-ceiling
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [a context-compaction or summarization call runs inside a budgeted session, an exhausted ceiling meeting a call the session needs in order to continue, a nested run that emits its own stop signal, deciding whether skipping a housekeeping step is a failure]
---

# Housekeeping calls obey the ceiling

[budget-enforcement](./budget-enforcement.md) names retries and continuation
calls as *amplifiers*: spend paths that multiply cost during incidents and so
must re-pass the gate. A long-running agent session has a second amplifier
that does not look like one, because it is a service to the session rather than
work for the user: the call that summarizes history so the next turn fits the
context window. It is a full model call, often on the most expensive context in
the session, and it fires *because* the session has run long, which is also
when the ceiling is near.

Two opposite mistakes are both common. Exempt it ("internal, the user did not
ask for it") and the summarizer becomes the unmetered path that the ceiling was
supposed to have closed. Meter it but let the ceiling failure propagate as an
error and an exhausted budget turns into a broken session, a stack trace where
the operator expected a clean stop.

## The rule: check before, charge after, and treat refusal as a skip

- **Check the ceiling before the call, with the same check the main loop
  uses.** The housekeeping path reads the same tracker and the same
  `which-limit-tripped` result. A copy of the logic in the housekeeping module
  is a second gate that drifts.
- **Charge after, from the same computed cost the session bills.** The
  housekeeping call's usage and duration land on the run-wide pot and on the
  named ceilings of the actor whose history is being compacted, including when a
  dedicated, cheaper model performs the summarization. Cost the call once and
  feed that one figure to the ledger, the ceiling and the event, so what the
  ceiling counts cannot disagree with what is billed.
- **Refusal is an outcome named *skipped*, not *failed*.** The call was
  declined, nothing was spent, and the conversation is intact. Record it
  as its own result next to *applied* and *failed*, and surface a warning that
  names the limit. A skipped compaction under an exhausted ceiling is the
  system working; a failed one would page somebody for a condition that
  was configured.
- **A supplied result can still be applied for free.** If a caller or a hook
  has already produced the summary, applying it spends no tokens, so an
  exhausted ceiling does not block it. The check guards the *call*, not the
  *operation*.

## The nested run's stop signal is not content

When the housekeeping step is itself run as a nested agent loop (the shape that
lets a summarizer use the same machinery as any agent), that loop shares the
parent's pot per [one-pot-across-delegation](./one-pot-across-delegation.md),
and it can hit the ceiling and emit its own stop message into its own
transcript. The parent must read that signal as a *control* event, translate it
to the skipped outcome, and discard the message. If the child's synthetic
"stopped after reaching the limit" text is allowed to flow where a summary was
expected, it replaces the conversation with an apology. Test this specific
boundary: exhaust the ceiling during the nested call and assert the parent's
history is unchanged.

## What this does not cover

- It does not decide whether the main session should continue with a context
  it can no longer shrink. That is the next call's gate: the ceiling is
  already exhausted, so the next turn stops at the boundary. A session that
  cannot compact *and* cannot stop is the case
  [compaction-is-a-fixed-point](../../../prompt-and-context/prompt-assembly/techniques/compaction-is-a-fixed-point.md)
  warns about.
- It does not price the call in advance. Estimation before spend is
  [preflight-estimation](./preflight-estimation.md).

## Smells

- Compaction, evaluation or title-generation calls absent from the list of
  spend paths in the enumeration.
- A budget test that drives only the main loop.
- An exhausted ceiling that surfaces from the summarizer as an error event.
- A housekeeping module with its own copy of the limit comparison.
- A dedicated cheap model for summarization whose usage is recorded nowhere.
