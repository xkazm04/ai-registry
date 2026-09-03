---
layer: technique
type: technique
subject: learning-curve-and-teaching-design
technique: time-to-competence-measurement
status: forged
laws: [a-number-carries-its-unit-and-basis, a-verdict-is-bound-to-its-content, unmeasured-is-not-a-pass]
shared_with: []
use_when: [proving onboarding works rather than asserting it, tutorial completion is being reported as success, comparing two teaching approaches for the same mechanic]
---

# Time to competence measurement

The named concern: measure, per atom, how long it takes a stated fraction of a stated
population to reach a stated observable performance — and report that instead of tutorial
completion, which measures the tutorial.

## The criterion comes first

Nothing here works without a competence criterion written before the measurement is
designed. A criterion has four parts: the **action**, the **condition** it must be performed
under, the **rate** it must be achieved at, and the **absence of prompting**.

*Interrupts a channelled cast in three of four opportunities, in live combat, with no
on-screen cue present* is a criterion. *Used the interrupt at least once* is an event.
*Completed the interrupt tutorial* is neither — when a step is modal, its completion is
guaranteed by construction, so the metric describes the tutorial's ability to detain the
player and nothing about the player.

The absence-of-prompting clause is the part most often dropped and the part that carries the
measurement. Competence exercised while a cue is on screen is the cue's competence.

## Procedure

1. **Instrument opportunities, not just uses.** The denominator is the number of situations
   in which the atom was the right answer. Without it, a low use count cannot be told apart
   from a low opportunity count, and the two have unrelated causes.
2. **Emit a paired start and completion for every teaching beat**, each with its duration,
   so that a departure between beats is attributable to the beat the player did not finish
   rather than to the sequence as a whole.
3. **Evaluate the criterion continuously** from the introduction site onward, and record the
   first position at which the player satisfies it.
4. **Report the distribution, then the headline.** Time to competence at the median and at a
   high percentile — the high percentile is the population the teaching was built for, and it
   is invisible in a mean.
5. **State the basis alongside the number**: which population, which percentile, which build,
   which unit — elapsed play time, attempts, or opportunities. A figure without that block is
   not information
   ([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)),
   and attempts and minutes disagree by a large factor for exactly the atoms that matter.
6. **Bind the figure to the teaching that produced it.** When the introduction site, the rung
   or the spacing changes, the previous figure becomes evidence about the past
   ([a-verdict-is-bound-to-its-content](../../../_laws.md#a-verdict-is-bound-to-its-content)) —
   report it as stale rather than dropping it, because a visible gap is survivable and a
   silently carried-forward figure is not.
7. **Render the unmeasured as unmeasured.** An atom nobody has measured has no time to
   competence; it does not have an average one
   ([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)).

## Decision rules

- **When time to competence is long but the completion rate is high, the atom is
  under-practised.** Add rehearsal, not explanation. Players are getting there; they are
  getting there slowly.
- **When competence is never reached by most of the population, do not raise the rung
  first.** Check the criterion is measurable, then check the atom has a test site at all. An
  atom with no test provides no occasions to demonstrate competence, and the flat line is an
  instrumentation artefact rather than a teaching failure.
- **When two teaching approaches are compared, hold the criterion fixed and vary only the
  teaching.** Comparing time-to-competence figures produced against different criteria is
  the most common way an onboarding experiment concludes the opposite of the truth.
- **When the measured population is internal, halve nothing and conclude nothing.** The
  design team, the test team and any simulated player are competent at every atom by
  construction; an internal figure is a lower bound with no known relation to the real one.
- **When a step's completion rate is 100 percent, ask whether the step is modal** before
  reporting it as a success. A funnel through gates the player cannot fail measures gates.
- **When departure clusters between two beats, attribute it to the beat that was not
  finished**, and look at that beat's rung and its isolation before looking at difficulty.
- **When the atom is optional by design, measure adoption separately from competence.** A
  player who chose not to learn something and a player who could not are different
  populations, and the criterion cannot distinguish them without the opportunity denominator.

## When not to use this

- **Before there is a population.** Time to competence is a population statistic. With a
  handful of observed players you have observations, which are valuable and are not this
  number; reporting a percentile over six people is a decoration on an anecdote.
- **For atoms with no observable execution** — a piece of world knowledge, a tonal
  expectation, an understanding of what the game is about. The criterion cannot be written,
  so the measurement cannot exist, and forcing a proxy produces a number that will
  nevertheless be trusted.
- **As the only onboarding metric.** It says how fast competence arrived for those who
  stayed. It is silent about those who left before the atom was demanded, which is precisely
  the population that the corridor's floor and the departure attribution are for.
- **On a build whose teaching is still changing daily.** Each change invalidates the
  figures; measure at points where the teaching is stable enough that a figure will outlive
  its build.
