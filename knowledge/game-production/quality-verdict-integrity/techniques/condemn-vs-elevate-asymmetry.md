---
layer: technique
type: technique
subject: quality-verdict-integrity
technique: condemn-vs-elevate-asymmetry
status: forged
laws: [no-gate-self-certifies, a-verdict-is-bound-to-its-content, unmeasured-is-not-a-pass]
shared_with: []
use_when: [deciding whether a verdict of uncertain provenance still applies, designing a gate that consumes stored verdicts, choosing whether a batch grader may skip work]
---

# Condemn-vs-elevate asymmetry

A stored verdict is consumed for three different purposes, and each purpose gets
its own admissible set of provenance standings. Condemnation is the loosest,
elevation is stricter, reuse is strictest. Getting these three sets right — and
in that order — is what makes an automated quality layer safe to build gates on.

## The three sets

| Purpose | Question | Admissible standings |
| --- | --- | --- |
| **Condemn** | may this recorded failure hold the artifact back? | `current`, `unknown` |
| **Elevate** | may this recorded pass let the artifact through? | `current` only |
| **Reuse** | may we skip re-grading because this verdict covers it? | `current` only, and only when the standard is also in force |

`unknown` appears in exactly one column, and that is the whole technique. A
recorded failure whose binding cannot be confirmed is still evidence that
something was wrong; dropping it is the optimistic lie the layer exists to
prevent. A recorded pass whose binding cannot be confirmed is not evidence that
anything is right, because "unconfirmable" and "produced under conditions we
cannot reconstruct" are the same state, and the party who benefits from the
doubt would be the producer — which
[no gate self-certifies](../../_laws.md#no-gate-self-certifies) forbids.

Reuse is stricter than condemnation because its failure mode is worse than
either of the others. A retained condemnation costs a reviewer ten minutes on
something that turns out to be fine. A wrong skip produces an artifact that was
never graded and reads as graded, permanently, with no artefact anywhere in the
system recording the omission. The cost ledger is explicit: a wasted re-grade is
one model draw; a wrong skip is the credibility of every green label.

## The procedure

1. **Classify** the verdict's standing (see the classification technique).
2. **Look up** the standing in the set for the purpose at hand. Never write the
   comparison inline — export the sets as named constants so a reader can see
   that `unknown` is in one and not the others, and so the sets cannot drift
   between consumers.
3. **When condemning on a non-`current` standing, say so in the outcome.** The
   reason string carries the caveat: this verdict is applied, its binding cannot
   be confirmed, it still needs a re-grade.
4. **When declining to condemn, still attach the verdict.** See below.
5. **When declining to reuse, record why.** A skipped item and a graded item
   must be distinguishable in a run's output; so must a re-graded item and the
   reason it could not be skipped. Both outcomes get a reason string, always
   populated.

## Attach the verdict even when it is not applied

The subtlest half of the asymmetry. When every failing verdict for an artifact
is `stale` or `superseded`, the condemnation does not apply — but the artifact
is now *unjudged*, and unjudged must never render as judged-and-passed. The
correct output attaches the verdict anyway, with:

- its standing,
- its score and the grader that issued it,
- and a **plain-language note stating what it does and does not prove here** —
  "a failure is on record; it judged content this artifact no longer holds; it
  is not applied; this artifact is unjudged, not judged-and-passed."

That note is not a UI nicety. It is the sentence that stops a reader from
completing the inference the data cannot support, and it is the difference
between a visible gap (survivable) and an invisible one (not).

## Decision rules

- **When provenance is unprovable, fall to the conservative side** — and make
  the direction of the fall structural, not a reviewer's judgment call at each
  site.
- **When the artifact has already failed or been deferred by another layer,
  leave it alone.** A verdict downgrades a *pass*; it does not overwrite a
  finding another authority already made, and it does not upgrade anything.
- **When a verdict comes from a grader that does not cover this kind of
  artifact, it does not speak for it.** A human's verdict always may.
- **Never let a pass elevate past a missing measurement.** If the thing that
  would have measured it did not run, the outcome is not-measured, not pass.
- **Never soften the asymmetry to reduce reviewer load.** The load is the
  signal: if unconfirmable condemnations are drowning reviewers, the fix is to
  re-grade them, not to stop believing them.

## When not to use this

- **When the two directions genuinely have symmetric cost**, the asymmetry is
  unnecessary complexity — but verify that claim rather than assuming it. It is
  almost never true where a human reviews one side and nobody reviews the other.
- **When a condemnation carries a destructive consequence** — deleting content,
  cancelling a build, reverting work — do not condemn on `unknown`. The
  asymmetry is calibrated for a consequence that costs attention. When the
  consequence costs work, the honest move is to hold and report rather than to
  act; a refusal is a result, and a better one than a destroyed artifact.
- **When the store contains a large legacy population with no bindings at all**,
  applying the condemn-on-`unknown` rule at once will flag a backlog nobody can
  work through. Adopt it anyway, but state the backlog as a number and burn it
  down; do not exempt legacy rows, because an exemption is permanent and the
  backlog is not.
