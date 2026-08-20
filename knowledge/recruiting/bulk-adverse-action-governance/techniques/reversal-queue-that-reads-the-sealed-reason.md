---
layer: technique
type: technique
subject: bulk-adverse-action-governance
technique: reversal-queue-that-reads-the-sealed-reason
status: forged
laws: [every-decision-names-its-actor, say-only-what-the-record-holds, no-adverse-outcome-is-solely-automated]
shared_with: []
use_when: [designing a reconsider or reinstate path for automated rejections, deciding what an audit record shows after a reversal, keeping a bulk adverse action reversible]
---

# Reversal queue that reads the sealed reason

## The concern

A bulk adverse action is only defensible if it can be undone, and "can be undone" is not a
property of a database that supports updates. It is a property of a *standing mechanism*:
a queue that automated rejections enter by construction, a surface where a human reviews
them against the reason that was actually sealed, and a reinstatement path whose
attribution is correct. Without that mechanism, reversal is a support ticket and an
engineer with write access, which means in practice it does not happen and the audit trail
is worse afterwards than before.

The right to have an adverse automated decision reconsidered by a human is also the part
of oversight doctrine that survives every jurisdiction: whatever else differs, a person
subject to a consequential automated outcome is expected to be able to contest it and have
it looked at again. A queue is the operational form of that expectation.

## What enters the queue

**Only automated adverse outcomes.** A rejection a human deliberately made is a decision,
and enqueuing it for reconsideration both misrepresents it and drowns the queue — the
queue's entire value is that its contents share a property: a mechanism decided them.

Concretely, entry is determined by the *actor* on the sealed decision, not by the stage,
the reason, or how the record happens to have been created. If the actor is the automated
process, it enters. If the actor is a named human, it does not. If the actor cannot be
determined, it enters — authority may be
[downgraded toward the automated process, never upgraded](../../_laws.md#every-decision-names-its-actor),
and an unattributable adverse outcome is the one most in need of a second look.

## The procedure

1. **Seal the reason at decision time**, in the closed reason vocabulary, byte-pinned. The
   reason is audit text: it is what the candidate may be told, what the reviewer will read
   months later, and what a claim will quote. It is not a display string to be reworded in
   a later release.
2. **Enqueue on write**, in the same transaction as the rejection. A queue populated by a
   downstream job is a queue that is empty exactly when a job is broken.
3. **Present the sealed reason back, verbatim.** Do not re-derive, do not re-score, do not
   summarize. A re-derivation answers "what would we decide today", which is a different
   and self-serving question; the reviewer needs to know what was actually said about this
   person ([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)).
   Show the score as it stood, the boundary that applied, and the wave the person was part
   of — a reversal is often the discovery that a whole wave was wrong.
4. **Reinstate as a new decision.** Seal it to the reversing human, with its own timestamp
   and its own reason. It never inherits the machine's actor, and it never overwrites the
   original attribution.
5. **Keep the original record, marked reversed.** Deleting it removes the adverse action
   from exactly the pattern analysis that exists to find adverse actions, and makes the
   reversal rate — the single best health metric a bulk pipeline has — uncomputable.
6. **Return the person to a real stage**, not to a limbo state, and make the outbound
   communication severable so a reversal landing before delivery cancels the letter
   rather than chasing it.
7. **Serve the candidate the same sealed reason.** Whatever the person is told about
   their rejection is derived from the sealed record — redacted for what they may see,
   never freshly generated at read time. A reason regenerated when the candidate opens
   their status page is a new claim about them, made by a model, unreviewed by anyone,
   and possibly different from the one the audit trail holds.

A committed rejection whose outbound notification failed to queue is its own state and
must be addressable **per row**, not merely counted: that candidate is out of the funnel
and has been told nothing. An aggregate "three notifications failed" is unactionable;
three named rows are a task.

## Decision rules

- **When the reversal window is open, keep the outbound step last and severable.** The
  gap between commit and delivery is the cheapest reversal there will ever be; design it
  to be non-zero on purpose.
- **When a reversal is granted, ask whether the wave was wrong, not just the case.** One
  reinstatement is a case. Three from the same wave, or several sharing a reason code, is
  a rule defect, and the correct response is to re-preview the remainder of the wave
  rather than to process reversals individually.
- **When a candidate contests but the outcome stands, record the reconsideration
  anyway** — with the reviewing human's identity. "Reviewed and upheld by a named person"
  is a materially different record from "never looked at", and it is the record that
  demonstrates the oversight was real rather than
  [nominal](../../_laws.md#no-adverse-outcome-is-solely-automated).
- **When the queue grows faster than it is worked, stop the automated waves.** An unworked
  reversal queue is proof that the reversibility the wave relies on for its defensibility
  does not exist.
- **Never let a reinstatement re-enter the same automated wave logic unchanged.** A person
  reinstated by a human and re-rejected by the next run of the same rule is the most
  damaging sequence this system can produce; exclude reinstated candidates from automated
  adverse action for the remainder of the requisition.

## Metrics the queue makes possible

The reversal rate per wave, per reason code, and per role family is the closest thing a
bulk pipeline has to an error rate — and unlike an offline evaluation it is measured on
the actions actually taken. Watch it by reason code: a single code with a rising reversal
rate localizes the defect to one rule. Watch it by role family: a rate that differs
sharply across families is a fairness signal well before any disparity test has enough
sample to speak.

## When not to use it

- **Not for reversing human decisions by default.** Provide a path, but do not queue them
  — a deliberate human rejection reopened without new information is a different workflow
  with different politics.
- **Not as an excuse to loosen the gate.** "It is reversible" is not a reason to widen a
  window, lower a floor, or skip a preview. Reversal is the safety net under a decision
  that was already made carefully; a net does not license jumping.
