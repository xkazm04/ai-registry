---
layer: technique
type: technique
subject: early-career-potential-assessment
technique: domain-distance-grading
status: forged
laws: [inference-must-look-like-inference, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [bounding how much prior-field experience counts toward a new field, resisting a semantic-similarity score you cannot justify, explaining to a career changer why their credit was capped]
---

# Domain distance grading

How much should four years in hospitality count toward a role in logistics? The
question is real and unavoidable the moment you credit transferred experience, and the
tempting answer — a similarity number from an embedding, a taxonomy distance, a model's
confidence — is a fabricated precision. Nobody has outcome data linking occupation pairs
to hiring success at the granularity those numbers imply.

The technique is to answer coarsely and say so: **three or four named bands, each with
a written definition and a fixed multiplier, assigned by a rule you can read aloud.**
This is the honest alternative to pretending you can measure semantic domain similarity
you have no data for.

## The bands

- **Adjacent** — the domains share tools, vocabulary, customers or a regulatory frame,
  and a practitioner moving between them recognizes most of the working day. Credit at
  or near full strength.
- **Moderate** — the domains share a mode of work (client-facing, shift-based,
  analytical, safety-critical) but not the subject matter. Credit at roughly half to
  two-thirds.
- **Far** — no shared substance; only genuinely universal meta-skills survive the move.
  Credit small but non-zero, because reliability, communication and working under
  pressure do transfer, and zeroing them is the error this whole subject exists to
  correct.
- **Unknown** — the pair is not classified. Treat as a distinct state, not as *far*;
  route to review if it is load-bearing for the outcome.

Three graded bands are enough. A fourth adds arguing without adding accuracy, and every
extra band is a new place for an unexamined judgment to hide.

## The procedure

1. **Classify at the level of the band, not the pair.** Do not build a matrix of every
   occupation against every other; assign each domain to a small family and grade
   family-to-family. The matrix is unmaintainable and the incremental accuracy is
   imaginary.
2. **Write the definition beside the multiplier.** A band without a prose test is a
   number someone will tune until the results look nicer.
3. **Render the band, never a decimal.** The candidate-facing and recruiter-facing
   output says "adjacent field", not "0.72 similarity". A decimal invites the reader to
   treat a judgment as a measurement, which is
   [inference dressed as measurement](../../_laws.md#inference-must-look-like-inference).
   Internally a multiplier is fine; externally the band is the truth of what you know.
4. **Record the basis with the grade** — which two domains were compared, by which rule,
   under which version of the band table
   ([a-claim-carries-its-sample-and-its-basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
   A capped credit that a candidate asks about must be answerable.

## Prefer grading upward to discounting downward

The obvious implementation multiplies transferred credit by a band factor. There is a
better one, and it avoids a trap worth naming: the transferred credit has *already* been
priced by provenance and by the meta-skill mapping. Multiplying it again by a distance
band double-discounts the same fact, and the second discount is the one built on the
coarsest judgment in the system.

So use the bands asymmetrically. An **adjacent** prior field is real target-domain
foundation that a binary "switching" flag cannot see — let it *raise* a floor on the
foundation dimension, because a practitioner from a neighbouring field genuinely arrives
with more than a beginner. A **far** field changes no number at all; it changes the
*narrative*, telling the reader that the bridge runs through meta-skills rather than
through domain knowledge. Distance grading then earns its place as a bonus lane and a
narrative honesty device rather than as a second penalty — which also keeps it clear of
the symmetry rule, since a band that can only add is not a discount scoped to a
population.

## Decision rules

- **When the band is unknown, do not default to far.** Defaulting to the harshest band
  makes every unclassified occupation — disproportionately, occupations from other
  countries and other languages — silently penalised. Unknown routes to review or, where
  no review exists, takes the middle band and is labelled provisional.
- **When a candidate's prior domain is closer than your bands can express, let a human
  override — and record the override.** A named person raising a band is a legitimate,
  auditable decision; a model raising it because the text felt similar is not.
- **When you are tempted to add decimals, add a band or add nothing.** Precision that
  outruns your evidence is a liability in exactly the moment it matters: when someone
  asks how the number was derived.
- **Never let distance grading zero out a credit.** Its job is to bound generosity, not
  to become a second rejection mechanism. If the far band's multiplier is small enough
  that it functions as a filter, it is a filter.
- **Grade the domain, not the person.** The band describes the relationship between two
  fields of work. It is never a statement about the candidate's adaptability, and must
  not be worded as one in any candidate-facing text.

## When not to use it

- **Not where real outcome data exists.** If you have enough hires from a given prior
  field to measure how they performed, use that — with its sample size stated — instead
  of a band. Bands are the honest fallback for the common case where you do not.
- **Not for in-domain candidates.** Distance grading applies only to credit that is
  being transferred across fields; running it on a same-field candidate can only produce
  a spurious discount.
- **Not as a routing signal.** Distance bounds the value of evidence; it does not decide
  which population a candidate belongs to, and it must not feed back into that decision.
- **Not for hard requirements.** A must-have capability is held or not held. Distance
  grades transferred meta-skills, never the presence of a specific required competency.
