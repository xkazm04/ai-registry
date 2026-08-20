---
layer: technique
type: technique
subject: candidate-ai-disclosure-and-explanation
technique: allowlist-of-candidate-visible-decisions
status: forged
laws: [say-only-what-the-record-holds]
use_when: [exposing a decision history to the candidate it concerns, adding a new decision kind to a system with a public surface, deciding whether a process event is a decision]
shared_with: []
---

# The allowlist of candidate-visible decisions

The operator record accumulates decision kinds over years: screening verdicts,
stage moves, holds, reversals, bulk policy applications, experiment
assignments, queue events, administrative corrections. A candidate-facing
decision history reads from that same store. The question is which kinds cross.

The answer is an **allowlist keyed on decision kind**, never a denylist, and the
default for an unlisted kind is hidden.

## Why the direction matters

Under a denylist, the risk sits on the wrong side of a developer's attention. A
new decision kind is added to an enum for an internal feature; it is now
immediately visible to every candidate, in whatever internal vocabulary its
author chose, with whatever internal fields it carries. Nothing breaks, no test
fails, and the leak is discovered by a candidate.

Under an allowlist, a new kind ships hidden. Making it visible requires someone
to write candidate-appropriate copy for it — and the act of writing that copy is
the review. If nobody can express the decision in terms that make sense to the
person it was about, it was never fit to show. The copy is the admission ticket.

The same rule governs the *fields* of an admitted kind: the projection names the
fields it emits rather than spreading the internal record and removing the
dangerous ones. Spread-and-remove fails open on every schema addition.

## What qualifies for admission

A decision kind belongs on the allowlist when all three hold:

1. **It produced an effect on this person.** A stage change, a verdict, a hold,
   a decline, a reversal. If nothing about their standing changed, it is process
   telemetry.
2. **It can be stated truthfully without a second person's data.** If the
   decision is only intelligible by reference to another applicant's record or
   an operator's identity, it cannot be shown as-is.
3. **Candidate-facing copy exists for it.** Not a humanised enum name — a
   sentence written for the person.

## The instructive exclusion

An experiment holdout that *spared* someone from automated screening fails the
first test, and its exclusion is the clearest illustration of the rule. Nothing
was decided about them; they were not acted on. Surfacing "you were randomly
excluded from automated screening" invites a person to contest an event that had
no effect on them, discloses experiment mechanics that belong to the
organisation's validation practice, and implies a judgment where none was made.
Being spared at random is not a decision that produced an outcome.

Contrast a bulk policy application that declined a cohort: that is squarely
admissible, must be shown, and is exactly the kind of decision the explanation
duty exists for.

## Decision rules

- **Unlisted kind, no render.** Not a placeholder, not "other decision", not a
  humanised identifier. Absent.
- **Admitting a kind requires copy, and the copy is reviewed by whoever owns the
  candidate register** — not by the engineer adding the enum value.
- **Enumerate emitted fields explicitly.** Never derive the candidate object by
  subtraction from the operator object.
- **The allowlist lives next to the projection**, not in a configuration a
  feature flag can widen at runtime. Widening it is a code change with a review.
- **Test the negative, and pin the shape.** The valuable test is not that
  admitted kinds render; it is that an unrecognised kind produces nothing, and
  that the emitted object has *exactly* the declared fields. A leak test that
  asserts the closed field set catches the schema addition an allowlist on kinds
  alone would let through.
- **Gate the whole projection on consent, not just its fields.** Where the
  retention basis has expired or the record has been anonymised, the history is
  empty — the surface returns nothing rather than an allowlisted subset.
- **No humanised-identifier fallback in the renderer.** A kind that reaches the
  view without candidate copy must not degrade to its underscored identifier
  with the underscores replaced by spaces; that fallback quietly re-creates the
  denylist behaviour the allowlist exists to prevent, one label at a time.

## When not to use this

- **Not for the internal audit surface.** Operators and auditors need the
  complete history, including the excluded kinds; narrowing there destroys the
  record's purpose. The allowlist governs the public token boundary only.
- **Not as a substitute for access control.** An allowlist decides *what shape*
  crosses the boundary; it does not decide *who* is on the far side. Both are
  required, and the identity check belongs to the general engineering practice.
- **Not as a way to hide adverse decisions.** Excluding a decline because it is
  awkward to explain inverts the technique into concealment. The three
  admission tests are about effect and expressibility, never about comfort.
