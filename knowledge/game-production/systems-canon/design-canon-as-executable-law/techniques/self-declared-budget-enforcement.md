---
layer: technique
type: technique
subject: design-canon-as-executable-law
technique: self-declared-budget-enforcement
status: forged
laws: [one-authority-per-quantity, a-budget-shapes-the-output]
shared_with: []
use_when: [an artifact states its own cap or band, grading a measured value with no canon rule to cite, catching internal contradiction in generated content]
---

# Self-declared budget enforcement

The named concern: **an artifact that states its own limit and then violates it.** A
budget entry writes a memory ceiling and a measured footprint above it. A loudness entry
writes a target band and a measured level outside it. A detail ladder writes three tiers
whose costs go up as detail goes down. In every case the artifact contains both the rule
and the evidence, and nothing compared them.

This is the cheapest high-yield check in the whole discipline, and it is routinely missed
because it looks like it needs a canon rule to hang on. It does not. The artifact's own
declaration is the law for that artifact.

## Why the declared budget is so often unenforced

The historical path is always the same. A step is authored to declare a cap and a measured
value. A checker is written to grade the measured value — against a literal copied out of
the design prose, because that is what "grading against the design" felt like. So the
number the artifact *declares* is decorative: an entry can state a ceiling of eight and a
measurement of eleven, and pass, because the checker was comparing eleven to a constant
from somewhere else entirely.

Two quantities, two authorities, and the one the author actually wrote is the one nobody
consulted. Read **both sides from the artifact** and the step can no longer contradict
itself.

There is a second reason this matters more than its simplicity suggests. A budget handed
to a generative process is an instruction about the intended size of the thing, not merely
a ceiling — a process spends what it is given. Grading the delivered value against the
budget *this artifact requested* is therefore the only check that closes the loop between
what was asked for and what came back. Grading only against a class-wide ceiling lets
every part of a large thing claim the whole thing's allowance.

## The three forms

**Value within declared cap.** A measured quantity must not exceed a ceiling the same
artifact states. Report utilization as a percentage of budget in the pass message, not
just the verdict — a pass at ninety-eight percent of budget and a pass at thirty percent
are different information, and the first is what a reviewer wants to see.

**Value within declared band.** A measured quantity must sit inside a floor and ceiling the
same artifact states. This form has an extra obligation: **check the band itself first.**
A declared floor above its declared ceiling is an inverted band, and it is a finding in its
own right, reported as such — not silently failing every value, which sends the author
hunting for a problem with the measurement.

**Series descends (or ascends) in a declared order.** A ladder of detail tiers, a set of
health thresholds, a progression of costs. The check walks the named keys in the stated
order and fails on the first pair that does not respect the direction, naming both members
of the pair. This catches the transposition error — two tiers swapped — that no per-value
check can see, because every individual value is plausible.

A fourth form sits alongside them: **arithmetic reconciliation**, where a stated result
must match the sum, product or quotient of stated operands within a tolerance. Same
principle, and the same rule about the failure message: state the computed value, the
declared value, and the percentage they differ by.

## Procedure

1. **Scan the artifact schemas for pairs.** Any place a schema holds both a limit-shaped
   field and a measurement-shaped field is a candidate. Cap and measured. Min, max, and
   value. A named series with an implied direction. A total and its parts.
2. **For each pair, write the check that reads both sides from the artifact.** Parameterize
   by field path so one implementation serves every pair.
3. **Guard the declaration before grading the value.** A non-positive cap, an inverted
   band, a series with a missing member — each is its own finding with its own message.
4. **Return not-measured when either side is absent.** A missing cap is not a pass and is
   not a failure of the measurement.
5. **Put utilization in the pass message.** Percentage of budget consumed, or position
   within the band.
6. **Report these separately from design conformance.** They are internal consistency; they
   prove the artifact does not contradict itself, which is not the same as obeying the
   design.

## Decision rules

- **When an artifact declares a limit, grade against the declared limit, always — even if
  a canon rule states one too.** Both checks run. The canon check judges whether the
  declared budget was legitimate; this one judges whether the delivered value honoured it.
  Collapsing them loses the distinction between "asked for the wrong budget" and "blew the
  budget it asked for", which are different people's problems.
- **When the declared limit disagrees with the canon limit, that disagreement is the
  finding** — do not silently prefer either. An artifact declaring a ceiling above the
  class ceiling is a request for an exception, and it should surface as one.
- **When a budget for a part is derived from a budget for the whole, derive it — do not
  restate the whole's allowance.** Every part quoting the total's number is how a
  three-part thing ships at three times its budget with every part passing.
- **When the series direction is ambiguous, declare it in the check, not in the data.** A
  detail ladder descends; making that a per-artifact field lets a wrong artifact declare
  itself correct.
- **When a value equals its cap exactly, pass.** A cap is a ceiling, not a strict bound.
  Say which in the message so the boundary is never in question.

## When not to use this

- **When the artifact does not actually declare the limit.** Adding a declaration field
  purely so a check can read it produces a number authors copy from a template and never
  think about — and a copied default that nothing ever fails is worse than no field. Add
  the field only where the author genuinely makes that decision.
- **As a substitute for a canon rule.** Self-consistency is blind to magnitude: an artifact
  can be immaculately consistent about being far too strong. If a class of content needs a
  ceiling, the ceiling belongs in the canon and the artifact's declaration is graded
  against it.
- **Where the "measurement" is authored rather than measured.** If both the cap and the
  value are typed by the same person in the same sitting, the check verifies typing
  discipline, not reality. Real value arrives when the measurement comes from a tool and
  the budget from a human — that is when they can genuinely disagree.
- **Series checks over sets with no natural order.** Forcing a direction onto an unordered
  set produces failures that mean nothing and get muted, which teaches everyone to mute
  findings.
