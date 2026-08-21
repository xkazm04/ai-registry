---
layer: technique
type: technique
subject: frame-direction
technique: per-beat-rejection
status: forged
laws: [unmeasured-is-not-pass, refusal-is-a-state]
shared_with: []
use_when: [validating machine-generated scene specs, designing the acceptance gate for a direction pass, deciding what a validator may and may not enforce]
---

# Per-beat rejection

Validate a machine-directed run **one beat at a time**, and let each beat
fail alone. A scene the parser refuses is dropped and reported with its
reason on its own row; every other scene is applied. Fifteen good scenes are
worth having even when the sixteenth never arrived — a run-level gate that
throws away thirty frames because one motion field was too short converts a
one-beat defect into a total loss, and teaches the operator to stop running
the gate.

## The granularity argument

Per-beat rejection changes the economics on both sides of the gate:

- **For the generator**, the cost function becomes proportionate: a defect it
  is unsure about costs one beat, but sixteen careless ones cost the run.
  That asymmetry is a pressure toward care without a pressure toward
  paralysis.
- **For the operator**, every rejection arrives with its reason attached to
  the beat it belongs to, written to be read on that beat's own row — so the
  report does not repeat what the row already says, and a fix is a targeted
  re-direction of one beat, not a rerun.
- **For the artifact**, a rejected beat keeps whatever it had before —
  usually the template output the direction pass exists to replace. Degraded
  is the honest fallback; blank is not. The gate's job is to prevent a worse
  frame from replacing a mediocre one, never to remove frames.

## Three distinct verdicts, kept distinct

A per-beat report separates outcomes that a coarser gate would blur:

- **Applied** — the scene passed every check and replaced its predecessor.
- **Rejected** — the generator tried this beat and got it wrong; the reason
  is attached. This includes scenes claiming a beat that does not exist —
  an invented timestamp has no row to sit on and is reported as such.
- **Missing** — the generator never *mentioned* the beat. Kept disjoint from
  rejected on purpose: a beat that was tried and failed has a precise reason,
  and reporting it as missing too would replace that reason with a vaguer one
  and count the same defect twice.

Collapsing missing into rejected, or either into a run-level failure count,
loses exactly the information the operator needs to decide whether to re-run,
re-prompt, or accept.

## Enforce only what is measured

The second half of the technique is validator restraint. Enforce the defects
that are defects *by construction or by measurement*:

- a subject or motion that asks the generative layer for text — the
  unconditional defect, cheaply caught with a vocabulary match before an
  expensive render proves it;
- a figure that cites no fact, or cites a fact not present in the source
  notebook — the integrity gate, enforced rather than requested;
- a motion that merely restates the subject — a still is not a move;
- fields too short to be what they claim to be (a nine-character
  "composition" is not one);
- structural invariants: unknown element kinds, unknown text roles, thread
  operations without their prerequisite establish.

And refuse to enforce what nothing has measured: no verb whitelists for
motion, no duration or easing vocabulary checks, no compositional taste. A
validator built on an impression rejects good direction with total
confidence — the false rejection is invisible precisely because the gate
looks rigorous. What is *not* checked should be as deliberate, and as
documented, as what is.

## Decision rules

- Report the **first** defect per beat and move on. A cascade of five errors
  on one malformed scene is one root cause wearing five costumes.
- Clamp and default what is safely clampable (out-of-range coordinates,
  overlong labels); reject what changes meaning (uncited figures, text in
  plates). Repairing a meaning-level defect silently is worse than rejecting
  it — the gate would be laundering the defect as a pass.
- Every refusal is a routing decision, not a dead end: the rejection row is
  the input to the next direction pass, aimed at exactly the beats that
  failed.

## When not to use this

Per-beat granularity presumes beats are independent enough to apply
piecemeal. When scenes are coupled — a thread's establish rejected while its
change passed — naive per-beat application can admit a change that now refers
to nothing; the validator must treat prerequisite-bearing operations as a
unit or re-check thread integrity after the partial apply. And for a
first-ever run with no predecessor content, "rejected keeps the old frame"
degenerates to "rejected keeps a blank" — there, batch the fixes before
applying anything, because the honest-fallback argument no longer holds.
