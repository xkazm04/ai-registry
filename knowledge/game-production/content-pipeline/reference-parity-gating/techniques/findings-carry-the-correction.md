---
layer: technique
type: technique
subject: reference-parity-gating
technique: findings-carry-the-correction
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis, no-gate-self-certifies]
shared_with: []
use_when: [designing what a parity gate emits besides a score, a producer keeps iterating without converging, deciding whether to cap gate iterations, a gate report has to be translated by a human before anyone can act on it]
---

# The row payload is the product; the score is for sorting

A gate that emits a number tells a producer it failed. A gate that emits *where*, *by how
much*, and *in which direction* tells it what to change. That difference decides whether an
automated loop converges or grinds, and it is almost entirely a question of what the report
carries.

The claim is stronger than "add detail to the output". **The findings are the primary
payload and the score is derived from them**, not the reverse. A score computed first and
explained afterwards produces explanations that drift from the number; findings computed
first and summed into a score cannot.

## What a row carries

Each scored row publishes its worst offenders as **located, signed deviations in real
units**. For a per-position profile comparison that means, per offender: the position along
the comparison axis, the reference values at that position, the candidate values at that
position, and the error. Roughly a dozen offenders per row is enough to direct a fix
without becoming a data dump.

Read aloud, such an entry is an instruction — *at this station the lower front sits 0.58 m
too deep* — and a producer acts on it without a human translating a score into a task. That
is the test to apply to any proposed payload: **can the consumer act on one entry without
opening the artifact and without asking anyone what the number meant?** If not, the payload
is a diagnostic, not a work order.

Three properties keep it honest:

- **Real units, not normalised percentages.** The score is normalised because scores must
  be comparable; the work order is not, because a producer edits in metres. Carry both and
  label which is which, per [a number carries its unit and its
  basis](../../../_laws.md#a-number-carries-its-unit-and-basis).
- **Signed, not absolute.** "Off by 0.58" leaves the direction to be guessed, and half of
  those guesses double the error.
- **A position that resolves to something the producer can address.** A deviation at an
  index into an internal array is not actionable; the same deviation at a coordinate in the
  artifact's own frame is.

## The loop terminates because the gate defines done

Once findings are work orders, the procedure is: read the rows, fix the worst component,
re-run, repeat until every component clears the bar. That terminates, and it needs **no
iteration cap** — a cap would substitute a budget decision for a quality one, and its usual
effect is to ship whatever the artifact looked like when the counter ran out.

This inverts a common instinct about automated loops, and the inversion is conditional
rather than universal. An uncapped loop is safe *because* every iteration consumes a
specific, located instruction and the score cannot improve except by satisfying one. A loop
whose gate emits only a scalar has no such guarantee and does need a cap, because it can
wander indefinitely without approaching anything. **The cap is a symptom of an
uninformative gate**, and removing the cap is only correct after the payload is fixed.

## Boundaries the payload must respect

A finding must be traceable to the measurement, never to the producer. Every offender is
computed from both artifacts through the same pipeline, and no entry is populated from
anything the candidate declared about itself, per [no gate
self-certifies](../../../_laws.md#no-gate-self-certifies).

A row that could not be measured emits **not measured**, distinctly from a row that
measured clean — a missing offender list must never be indistinguishable from an empty one,
which is [unmeasured is not a pass](../../../_laws.md#unmeasured-is-not-a-pass) applied to
the payload rather than to the verdict.

And some entries are not orders. Deviations at positions where the sampling itself is
ambiguous — a feature landing exactly on a boundary between samples, where antialiasing
decides the read — are noise, and issuing them as work orders sends producers to chase
nothing. Mark them, exclude them from the order list, and hold authored features clear of
sample boundaries so the class stays rare.

## Procedure

1. **Compute findings first**, then derive the score from them. Keep both in one document
   so no consumer can quote one without the other.
2. **Give every finding a location in the artifact's own frame**, a signed magnitude in
   real units, and both sides' values at that location.
3. **Cap the list per row** at roughly a dozen — enough to direct a round, few enough to
   read.
4. **Mark ambiguous entries as non-orders** and exclude them from the count that drives
   iteration.
5. **Emit not-measured distinctly** from measured-clean, everywhere in the payload.
6. **Remove the iteration cap only once the payload is actionable**, and state the
   termination condition as the bar rather than as a count.
7. **Write the report by tool only.** A hand-edited row is not a correction; it is the
   destruction of the only property that made the record worth reading.

## Decision rules

- **When a producer asks what to fix, the gate has already failed** — the answer should
  have been in the last report.
- **When findings are added after the score exists, expect drift.** Recompute the score
  from the findings instead, or the two describe different artifacts within a few releases.
- **When a loop is not converging, read the payload before adding a cap.** A cap makes a
  wandering loop cheaper, not better.
- **When an entry cannot be acted on without opening the artifact, it belongs in the
  diagnostic section**, not the work order.
- **When a report is disputed, the terms and the offender list are the evidence.** A gate
  that cannot show its work loses every dispute to whoever is more confident.

## When not to use this

- **Where the defect is categorical rather than positional.** "Wrong number of shells",
  "unsupported encoding" — a defect code and a remedy are the right payload, and a
  positional offender list is noise.
- **Where emitting locations leaks something.** A payload that reproduces enough of a
  protected reference to reconstruct it is a distribution decision, not a reporting one.
- **Where the consumer is a router rather than a producer.** A routing layer needs the code
  and the severity; handing it a work order it cannot act on invites it to parse prose.
