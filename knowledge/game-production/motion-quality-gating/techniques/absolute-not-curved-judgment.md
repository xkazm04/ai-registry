---
layer: technique
type: technique
subject: motion-quality-gating
technique: absolute-not-curved-judgment
status: forged
laws: [grade-against-what-ships-not-on-a-curve, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [instructing a machine critic to grade craft, scores cluster in a narrow band, a batch review keeps promoting the least bad candidate]
---

# Absolute, not curved, judgment

A critic asked to evaluate motion will, unless explicitly forbidden, do one of three
things that all feel like judgment and are not: compare the artifact to its siblings,
assume the artifact was made competently and reverse-engineer a justification, or
evaluate the artifact against its own internal consistency. Each produces a fluent,
well-reasoned score with no external referent. This technique is the set of refusals
that has to be written into the instrument, in words, because none of them is the
default behaviour of any rater.

## The three refusals, stated as instructions

**Do not grade on a curve.** The comparison class is work that shipped in this genre,
not the other candidates in this batch. A curve guarantees that something passes every
run regardless of quality, which is the exact failure a gate exists to prevent. The
symptom is a gate whose pass rate is stable while the generator's quality visibly
changes — a curve reports the shape of the batch, never its level.

**Do not assume the input is competent.** A critic that reasons "the spacing is even,
which the animator presumably chose for a stylised look" has substituted a theory of
the author for an observation of the artifact. State plainly that the input may be
machine-generated, may be a first pass, may be placeholder, and that no benefit of the
doubt is extended.

**Do not judge it relative to itself.** Internal consistency is cheap and uniformly
mediocre work has plenty of it. The question is never "is this coherent" but "is this
the standard of the thing it will sit next to in a shipped product".

## Correctness is the floor, and it must score as the floor

The single sentence that does the most work in an absolute instrument is the one that
denies functional work a passing grade. A motion that reaches the right pose, plays
without popping, and reads as stiff, weightless, evenly-spaced or robotic is a low
score — not a middling one — even though nothing about it is broken. Say exactly that:
a functional motion that does not read as believable scores low.

Without it, every rater collapses toward the middle, because the middle is where an
uncertain rater is safe and "it works, it's just not great" is the most defensible
sentence in the language. The result is a gate that grades placeholder content as
adequate and fills a build with motion nobody would ship and nobody flagged.

## Decision rules

- **When the instrument's instructions are edited, re-score everything that will be
  compared against the new outputs.** Scores from two wordings of the ruler are two
  quantities. Version the instrument and carry the version with the score.
- **When a batch produces no passes, that is a result, not a malfunction.** The first
  instinct on an all-fail run is to soften the bar. Check the sampler and the intent
  description first; a zero-pass batch is usually true.
- **When the critic is given the design intent, give it as what the motion *should*
  read as, never as a claim that it does.** "A heavy overhead strike that telegraphs
  before it lands" is a target the critic measures against. "A polished heavy strike"
  is an assumption of competence smuggled into the prompt.
- **When a score must be defended, require observations, not adjectives.** Demand a
  small number of concrete notes citing what changed between specific sampled frames.
  An instrument that cannot point at the evidence is producing an impression, and an
  impression cannot be argued with or audited.
- **When two artifacts must be ordered, order them by their absolute scores.** Ranking
  is a legitimate consumer of absolute scores; it is not a legitimate way to produce
  them.

## When not to use it

- **In A/B comparison of two variants of the same shot,** where the question genuinely
  is which of these two, and both are already known to be above the bar. Relative
  judgment is the right instrument for a preference; it is the wrong one for a gate.
- **Where a measurement exists.** A latency budget, a memory ceiling, a frame count —
  state the number and check it. An absolute craft ruler is for the qualities that
  resist measurement, and using it where a measurement exists throws away precision.
- **For internal scaffolding with no shipped analogue.** Blocking passes, temporary
  proxies and previs have no market referent. Grade those against their stage's
  purpose, and keep them out of the shipping ruler's statistics entirely — mixing them
  in is how a quality trend line goes flat and stops informing anyone.

## The failure this prevents

A batch of twenty generated clips is reviewed, one scores highest, it ships. Repeat
weekly. Nobody ever asks whether the highest of twenty is good, because the report
never contained a level — only an ordering. Six months in, the build is full of motion
that won its batch, the quality trend is flat because the metric is a rank, and the
first honest external look at the product describes it as feeling cheap. Every
individual decision was defensible; the instrument was the defect.
