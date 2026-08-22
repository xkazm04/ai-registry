---
layer: technique
type: technique
subject: prompt-fitness-and-evolution
technique: unjudged-is-null-not-zero
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [aggregating quality scores with incomplete judging, designing a fitness or coverage statistic, deciding what an unscored artifact contributes]
---

# Unjudged is null, not zero

## The concern

Judging lags generation. At any moment some fraction of a prompt version's artifacts carry
no current verdict. What that fraction contributes to the fitness figure is a decision, and
there are only two candidate answers: zero, or nothing. Zero is wrong, it is wrong in a
direction, and it is the most common way a fitness dashboard lies.

An artifact nobody scored and an artifact scored badly are different epistemic states. A
score of zero asserts a measurement that was never taken.

## Why zero is not merely conservative

The instinct is that zero is the safe, pessimistic choice. It is not conservative; it is
*biased*, and the bias tracks the thing under test.

Judging backlog is proportional to generation volume. Generation volume is proportional to
traffic. Traffic goes to the variant that is winning. So the arm producing the most artifacts
carries the most unjudged rows and takes the largest artificial penalty — a self-correcting
mechanism that corrects toward the wrong answer. Worse, backlog is transient: the same
comparison run twice, hours apart, yields different conclusions from identical evidence.
Anything whose value depends on when the query ran is not a measurement.

The symmetric error is quieter and worse: treating unjudged as a pass, or letting it be
absorbed into a green aggregate. Silence must never propagate upward as compliance.

## Procedure

1. **Represent the absence as a distinct value** — null, or an explicit `unjudged` label.
   Never a sentinel number. A sentinel of `-1` or `0` will eventually be averaged by code
   that does not know it is a sentinel.
2. **Exclude it from both numerator and denominator.** The mean is over judged artifacts;
   the denominator shrinks.
3. **Report the unjudged count beside the aggregate**, at every level it propagates through.
   A gap that is visible is survivable.
4. **Gate on coverage separately.** State a minimum judged fraction below which the figure is
   provisional and no conclusion may be drawn from it. Two numbers, two jobs: the mean says
   how good, the coverage says how much you know.
5. **Distinguish the reasons for absence.** Never judged, judging failed, verdict stale
   against changed content, and rubric superseded are four states. They aggregate as `not
   currently measured`, but they demand different remedies, and collapsing them at the source
   destroys the ability to fix any of them.

## Decision rules

- **When judged coverage is below the stated threshold, publish the coverage and withhold
  the conclusion.** Do not publish a mean with a footnote and expect the footnote to be read.
- **When an aggregate rolls up to a status colour, unjudged maps to its own state**, not to
  pass and not to fail. A dashboard with only red and green will represent ignorance as one
  of them, and it will pick green.
- **When comparing two arms, compare judged coverage first.** Materially different coverage
  between arms voids the comparison until the lagging arm is caught up.
- **When a verdict exists but is bound to superseded content, it is not current.** Report it
  as evidence about the past; it does not enter the mean.
- **When someone asks for "one number", give them the mean and the coverage as a pair.** The
  request for a single number is a request to discard the basis, and a number without its
  basis is not information.

## When NOT to use it

There is no case where an unjudged artifact should score zero in a *quality* aggregate. But
two adjacent statistics are legitimately different and get confused with this one:

- **Completion or coverage metrics** ask "what fraction has been judged?" — there, an
  unjudged artifact correctly counts as zero *of judged*, because absence is exactly what is
  being counted. Different question, different denominator.
- **A ship gate** may legitimately treat unjudged as blocking. That is not scoring it zero;
  it is refusing to certify what was never examined, which is the same principle applied at
  a decision point rather than in an average.
