---
layer: technique
type: technique
subject: document-text-extraction
technique: band-calibration-by-construction
status: forged
laws: [gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [choosing the threshold that separates two bands, a confidence number nobody has validated, building a fixture corpus for an extractor, a precision curve that is flat across every threshold]
---

# Band calibration by construction

A band set routes a region to an action, and every boundary in it is a number
somebody chose. The band table can be perfectly designed and the thresholds
still wrong, and a wrong threshold is silent in both directions: too low admits
regions that needed re-acquiring, too high re-acquires regions that were fine
and spends the budget that made banding worthwhile.

Choosing those numbers needs labelled regions — cases where the correct band is
known independently. The whole technique is in that word *independently*.

## Ground truth is built, not measured

The available corpus is documents whose true extraction quality nobody knows.
Labelling them by running the extractor and reading its output produces labels
derived from the system under test, which calibrates the threshold against the
extractor's own opinion and will agree with itself at any setting.

The corrective is to **construct the fixtures so the label is a property of how
they were made.** Damage a known-good document in a known way and by a known
amount, and the correct band follows from the construction rather than from an
inspection: a document truncated to a stated fraction, a page replaced with an
image of itself, a file with its text layer stripped, a zero-byte file, a
document in a script the reader is not configured for. Each carries its label
because you built the defect.

This costs less than it sounds. A generator that damages a small set of clean
documents in a dozen parameterized ways produces a corpus with exact labels and
regenerates it when the reader changes.

**The generator itself needs a check, and it is the step most likely to be
skipped.** A fixture that does not contain the damage it claims produces a
confidently wrong label, and every number downstream inherits it. Have the
generator verify its own output — that the truncated file really is truncated,
that the script sample really survives a round trip — and fail the fixture rather
than shipping it. A recall figure computed against a fixture corpus whose
generator was emitting the wrong glyphs is not a low number to investigate; it is
not a number at all.

## Name the fixtures after failures

Fixture names are the enumeration of what the author believed could go wrong, so
write them as failures rather than as inputs. A corpus whose members are named
for the damage they carry is a readable list of the reader's known adversaries,
and a gap in it is visible. A corpus of file names is not.

## Read the curve, not the point

Sweep the threshold across its range and read precision and recall at each step.
Pick the lowest threshold meeting the precision target the band's *action*
requires — a band that triggers an expensive re-acquisition can afford lower
precision than one that admits a region into a quotation path.

Two readings of the curve matter more than the number it produces:

- **A flat curve is a broken measurement, not a robust one.** If precision does
  not move as the threshold sweeps, the score is not carrying the information the
  band needs, and the usual cause is a default value flowing through unassessed
  regions and dominating the aggregate. Investigate the instrument before
  accepting any threshold off a flat curve.
- **No threshold meeting the target is a result.** Report the best precision
  achieved and collect more or better fixtures. Locking a number that did not
  meet its target, because a number was due, ships a band boundary that is known
  not to work and buries the knowledge in a constant.

Carry the predicate with whatever you publish
([count-carries-predicate](../../../_laws.md#count-carries-predicate)): a
threshold means nothing without the corpus it was fitted on, its size, and the
damage classes it contained. A threshold fitted on one document family is a
claim about that family.

## Recalibration is triggered by the reader, not by the calendar

The thresholds are properties of a *specific* reader against a specific corpus.
Changing the reader, its version, or its configuration invalidates them, and the
failure is silent because the old numbers keep producing bands. Bind the
calibration to the reader's identity and re-run the sweep when it changes, the
way any derived value names what recomputes it. A calibration with no recorded
provenance is a constant nobody can audit.

## Decision rules

- Label fixtures by construction; never by running the system under test.
- Make the fixture generator verify that its own damage is present, and fail the
  fixture rather than emit an unverified one.
- Name fixtures after the failure they carry.
- Sweep the threshold and read the curve; pick the lowest point meeting the
  precision the band's action requires.
- Treat a flat precision curve as an instrument defect and find the cause before
  choosing a threshold.
- When no threshold meets the target, report that and collect more fixtures
  rather than locking a number.
- Bind every threshold to the reader identity and corpus it was fitted on, and
  re-run on reader change.

## What this technique does not own

The band set itself, what each band licenses, and the rule that a score and a
band derive from one measurement are
[extraction-yield-bands](./extraction-yield-bands.md). Which reader runs next
once a region is condemned is
[recognition-boundary-and-escalation](./recognition-boundary-and-escalation.md),
and choosing between its result and the original is
[escalation-adjudication](./escalation-adjudication.md). This technique owns only
how the numbers separating the bands are chosen and when they are re-chosen.
