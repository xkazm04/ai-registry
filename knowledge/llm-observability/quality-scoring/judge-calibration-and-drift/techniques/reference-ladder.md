---
layer: technique
type: technique
subject: judge-calibration-and-drift
technique: reference-ladder
status: forged
laws: [the-judge-is-both-untrusted-and-under-test, statistical-verdicts-or-no-verdict]
shared_with: []
use_when: [a judge or a similarity metric scores a candidate against a reference, a candidate scores better than the reference itself could, a candidate a human calls closest still scores low, adopting a perceptual metric as a gate, the reference and the candidate come from different production processes]
---

# Reference ladder

The concern is a judge or a metric that scores a candidate *against a reference*:
how close a render is to its target image, how faithful a rewrite is to a source,
how near an output is to an approved example. The score arrives as a number on the
instrument's scale. The trap is reading it on that scale. A score of 2 out of 5, or
a distance of 0.18, says nothing until two other readings from the same instrument
in the same comparison sit beside it. The first is what it says about something
known to be worse. The second is the best any candidate could plausibly get. The
technique is to **measure both before the instrument scores anything that
matters, and read every score as a position between them.**

## The two rungs

- **Floor: a known-worse candidate against the reference.** Use the
  previous accepted version, or a deliberately degraded copy. It anchors the
  bottom of the range the comparison actually uses, which is rarely the bottom
  of the instrument's scale.
- **Ceiling: a second reference against the first.** Use two references made in
  the same style for the same target, but different pieces of work, scored
  against each other. This is the score of a perfect candidate as far as the
  instrument can tell. Do not use **the reference scored against itself**. A
  metric returns its identity value on identical inputs, and a model judge
  recognizes the identical picture, so that reading is degenerate and measures
  nothing about the comparison.

The ladder is computed once per instrument and reference set, and recomputed when
either changes. It is not re-run per candidate. Reading a candidate against it
is free.

## Three readings the ladder makes possible

**The ceiling can sit below the target.** A judge comparing a candidate to a
reference from a different production process scores the properties that
process has and the candidate's process never will. Examples are a photographic
reference against a real-time render, or a human-written reference against a
templated output. One fleet's render, which the person reviewing it called the
closest yet, held at 2 of 5 for weeks. The judge's stated reasons named
qualities of the photographic reference that the real-time target could not
have. Without a ceiling that reads as a render defect. With one, the question
becomes whether 2 is near the top of this instrument's reachable range. If it
is, the judge has stopped measuring progress and needs a different reference
class or a different instrument.

**A reading outside floor..ceiling disqualifies the instrument for that
candidate.** A candidate that scores better than reference-against-reference has
not beaten the reference. The instrument is rewarding something the candidate
shares with the reference that is not fidelity. A palette distance rewards
matching colour statistics, and a learned similarity rewards matching texture
statistics. In the same fleet, both metrics put the current frame past the
ceiling, while the human review and a pairwise judge said it was still short.
Both metrics were disqualified *for that frame*, so they were not celebrated. A
reading below the floor is the same finding in the other direction, provided
the floor really is worse. Either way, report the reading as "outside the
instrument's range" and do not count it.

**Inside the range, report the position, not the raw score.** Something like
"a third of the way from the old render to reference-against-reference" can be
compared across instruments and across weeks. A raw score cannot be compared
when two instruments put their floors and ceilings in different places. Rank
two candidates on an instrument only when both readings fall inside its ladder,
and only when the gap between them is larger than the instrument's
[repeatability-floor](./repeatability-floor.md). Both rungs are draws too. When
the ladder is built, score each rung as many times as a candidate will be
scored, so the rungs carry the same noise as the readings placed against them.

## Where this sits beside the rest of the subject

- [judge-selection-by-spread](./judge-selection-by-spread.md) uses known-good and
  known-bad sets to *choose* a judge for a task. The ladder uses known-worse and
  reference pairs to *read* a reference-anchored score. A judge can pass
  selection and still have a ceiling below the target on one reference class.
- [golden-set-agreement-measurement](./golden-set-agreement-measurement.md)
  calibrates against human labels. The ladder needs no labels, only material
  whose order is known by construction. That is cheap, and it is also less
  than calibration: it gives the instrument a range, not a verdict on whether
  the instrument agrees with people.
- The same design was reached independently for identity embeddings in
  generated video (character-identity-continuity's identity-ruler-calibration).
  That case also uses rungs from material with a known answer, and a failed
  ordering of the rungs discards the instrument rather than the expectation. A
  benchmark's null and reference controls (agent-benchmark-design) apply the
  same logic to pass/fail checks.

## Decision rules

- Measure the floor and the reference-against-reference ceiling before any
  reference-anchored score gates, ranks or reaches a report.
- When the rungs come out in the wrong order (floor above ceiling), or with no
  gap between them, discard the instrument for this comparison. No threshold
  repairs it.
- Treat a reading outside floor..ceiling as out of range for that candidate:
  report it as such and never count it as a win or a loss.
- When the best candidate sits near the ceiling and the ceiling sits well below
  the scale's top, change the reference class or the instrument. Do not keep
  iterating the candidate against a cap.
- Recompute the ladder when the instrument, its prompt or rubric, or the
  reference set changes.

## When not to use it

When there is no reference, the score is absolute, and the subject's agreement
and spread techniques govern it. When only one reference exists and no second
one of the same style can be had, the ceiling cannot be built honestly. Say the
instrument is uncalibrated at the top, and prefer a pairwise comparison against
the reference, which needs no ceiling. Do not make a second reference by
perturbing the first: that measures the instrument's tolerance for the
perturbation, not the distance between two correct answers.
