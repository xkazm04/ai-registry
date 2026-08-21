---
layer: technique
type: technique
subject: prompt-fitness-and-evolution
technique: join-judge-verdicts-to-prompt-version
status: forged
laws: [a-verdict-is-bound-to-its-content, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [computing a fitness figure for a prompt version, attributing quality scores to a revision, reporting whether a prompt change helped]
---

# Join judge verdicts to prompt version

## The concern

Fitness for a prompt version is a statistic over the quality verdicts on the artifacts that
version produced. The join — verdict to artifact to version — is where the number is either
earned or fabricated. This technique is the join and the reporting contract around it.

## The join, stated exactly

For a prompt version `v`:

1. Select artifacts whose provenance stamp is exactly `v`. Not "created during v's
   deployment window" — stamped `v`.
2. Apply the population filter: drop synthetic fixtures, seeded content, human-edited
   artifacts and anything whose stamp is `unknown`. Count what you dropped.
3. Attach each artifact's current verdict. A verdict bound to a superseded content
   fingerprint is not current — it is evidence about a previous state of that artifact and
   does not enter the mean.
4. Artifacts with no current verdict contribute `null`, not zero. They leave the numerator
   and the denominator both.
5. Compute the aggregate over what remains, and carry its basis with it.

## What the figure must carry

A bare mean is not a result. The reported figure carries, always:

- **`judged`** — how many artifacts contributed a score.
- **`unjudged`** — how many were in the population but carried no current verdict.
- **`excluded`** — how many were filtered out, by reason.
- **`rubric identity`** — scores from two rubric revisions are two units and do not average.
- **`the aggregate itself`**, with its scale.

A mean of 78 over 9 judged artifacts out of a population of 41 is a different claim from a
mean of 78 over 40 of 41, and only one of them should change anyone's mind. Where the
denominator is not reported, the reader supplies the flattering one.

## Decision rules

- **When coverage is below a stated threshold, report the figure as provisional and refuse
  to conclude on it.** Half the population unjudged is not a fitness measurement; it is a
  judging backlog wearing one. Set the threshold before you look at the number.
- **When two versions are compared, compare them under one rubric revision.** If the rubric
  changed mid-experiment, the arms are incomparable and the honest move is to rejudge the
  earlier arm under the new rubric or discard the comparison. Rubric supersession mechanics
  belong to the verdict-integrity discipline; consume their rule rather than reimplementing
  it.
- **Bump the rubric revision when the judged INPUT changes, not only when the rubric text
  changes.** A payload projection fix leaves the criteria word-for-word identical and still
  makes every prior verdict non-comparable — the instrument changed even though the ruler's
  markings did not. Treating "we did not edit the rubric" as "scores remain comparable" is
  how a corrected harness silently averages with an uncorrected one.
- **When an artifact was produced outside any experiment, it belongs to no arm.** Output from
  the standing production prompt carries no variant label; inventing one to fill the column
  attributes scores to an experiment that never ran. It still counts toward the *version*
  fitness, which is a different bucket.
- **When an artifact was regenerated, the verdict follows the content, not the artifact
  identity.** Re-stamping without re-judging leaves a version credited with a score for
  content it did not produce.
- **When a version produced fewer artifacts than the comparison's minimum trial count, it has
  no fitness figure** — not a low one.
- **When aggregating across artifact classes, weight deliberately or not at all.** An
  unweighted mean over classes with different difficulty tracks the mix of classes as much as
  the prompt; if the mix differs between arms, the comparison is measuring the mix. Either
  hold the class mix fixed across arms or report per class.

## Where the join goes wrong

**Joining on time.** Deployment windows overlap with retries, backfills, queued work and
concurrent arms. The failure is silent and worst during an experiment.

**Joining through a mutable pointer.** If the artifact row carries "current prompt version"
that a later deployment updates in place, the history is destroyed and every historical
fitness figure re-computes to the present. The stamp is immutable once written.

**Averaging verdicts of different standing.** A verdict that has gone stale against changed
content, a verdict from a superseded rubric, and a current verdict are three epistemic
states. Only the third is a score; the first two are records.

**Reporting the aggregate without the rubric.** A score is meaningless without the basis it
was scored on — the same artifact under a rubric that penalises leaked instruction text and
one that does not can differ by more than the effect any prompt revision will produce.

## When NOT to use it

- **Do not use fitness as a gate on an individual artifact.** It is a statistic about a
  version; whether one artifact ships is decided by that artifact's own verdict.
- **Do not use it to compare prompts across different jobs.** Fitness is comparable within a
  prompt family judged by one rubric on one artifact class. Across families it is two numbers
  with different bases sharing a name.
