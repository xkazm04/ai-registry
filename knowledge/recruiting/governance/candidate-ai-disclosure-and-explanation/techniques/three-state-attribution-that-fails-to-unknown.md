---
layer: technique
type: technique
subject: candidate-ai-disclosure-and-explanation
technique: three-state-attribution-that-fails-to-unknown
status: forged
laws: [every-decision-names-its-actor, absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate]
use_when: [labelling who made a decision on a candidate-facing surface, deciding how to render a decision whose actor is missing, reconciling an attribution promise with what the record proves]
shared_with: []
---

# Three-state attribution that fails to unknown

Every consequential decision shown to a candidate carries exactly one of three
labels: **a person decided**, **the automated process decided**, or **not
determined**. Two states are not enough, and the third is not a rendering
nicety — it is the state that keeps the other two honest.

Misattributing accountability is the one failure this surface may never have,
because the entire point of showing attribution is to answer who is answerable.

## The asymmetry

Attribution may be **downgraded** from human to automated when the record is
unclear. It may never be **upgraded**.

The asymmetry follows from what each error costs. Saying "the automated process
decided" about a decision a person actually made understates human diligence and
may invite a review request the organisation can easily satisfy — the record
will show the person. Saying "a person decided" about a decision nobody can
prove a person made is a false statement about accountability, made to the
person most likely to test it, in the exact register a regulator will
scrutinise. It is also the direction every convenient default drifts, because
"a member of our team" is the phrase that writes itself.

So: resolve toward the machine when in doubt, and toward *unknown* when even
that cannot be established. Both directions fail away from the flattering claim.

## What each state requires

- **A person decided** requires an actor identity in the sealed record — an
  operator reference, not merely a session, a request or an interactive context.
  Interactivity is not identity: a decision taken during a human's session but
  written by a policy pass is an automated decision.
- **The automated process decided** requires that the record positively marks
  the actor as the process. This is the honest state for a threshold
  application, a batch policy pass, a scheduled expiry.
- **Not determined** covers a null actor, an unrecognised actor type, a record
  written before attribution was captured, and any migrated history. It renders
  as an explicit "we cannot determine who made this decision" — never as blank,
  never as a default person, never omitted from the list.

A null actor rendering as a default person is the specific bug this technique
exists to prevent, and it is almost always introduced by a display helper that
falls back to a friendly string when a lookup misses.

## Reversal binds to the reverser

When a human overturns an automated decision, the resulting record attributes to
the human who overturned it and never inherits the machine's attribution. The
original automated decision stays in the history with its own attribution
intact; the reversal is a new decision with a new actor. Collapsing the two —
retroactively marking the original as human-decided because a human later looked
— destroys the very fact the surface exists to report.

## Decision rules

- **The sealed actor is authoritative; the kind map is a fallback.** Where the
  record's own actor string carries a machine or person prefix, that is what was
  sealed and it wins. Only a legacy or foreign actor with no prefix falls back to
  the shared kind-to-actor map, and an unmapped kind stays unknown rather than
  defaulting either way. Two tiers, in that order — never the map first, because
  the map encodes what a kind *usually* means, and the record encodes what
  happened.
- **Derive the label from one shared function**, so the operator view and the
  candidate view cannot disagree. Divergent implementations drift within a
  quarter, and the divergence surfaces as an operator badge contradicting a
  candidate's explanation.
- **No fallback string may name or imply a person.** If a lookup misses, the
  answer is the unknown state.
- **Unknown is rendered, not hidden.** Suppressing undetermined rows to keep the
  history tidy converts an honest gap into a silent one and quietly restates
  [absence-of-evidence-is-not-evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)
  as a pass.
- **Reconcile attribution against the disclosure promise in test.** If the
  submission notice says no adverse outcome is decided automatically, assert
  that no adverse decision kind can render with automated attribution. That
  test, not the copy, is what makes the promise true.

## When not to use this

- **Not a substitute for actor capture.** Three-state rendering is the last line
  of defence; the fix for widespread unknowns is to seal the actor at decision
  time, which belongs to the audit-and-traceability practice.
- **Not for naming the individual.** The states answer *whether* a human
  decided. Which human is an internal fact and stays internal.
- **Not for non-decisions.** Process events that never reached the candidate
  surface do not need an attribution label because they do not appear.
