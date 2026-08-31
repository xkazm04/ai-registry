---
layer: technique
type: technique
subject: delivery-analytics
technique: post-landing-repair-density
status: forged
laws: [count-carries-predicate, identity-survives-reuse, unknown-is-not-a-value]
shared_with: []
use_when: [deciding whether a landed feature should ship or be pulled, a team fixes forward and produces no revert signal at all, ranking landed work by risk after a freeze instant, reading a machine-generated risk ranking before circulating it]
---

# Post-landing repair density

A revert is the *terminal* failure signal: it exists only once someone has
already decided. The signal available **before** that decision, out of the same
material and needing the same nothing, is the **stream of repairs a landed
change required after it landed**. Nobody undid the feature — they fixed it,
repeatedly, and every fix is an artifact with a date and a link.

This is the signal that reads the population
[revert-linkage](./revert-linkage.md) explicitly cannot: a team that fixes
forward emits no undo events, and its change history is not therefore quiet
about quality. It is quiet about *undo*. The repairs are still there.

## The measurement

**Fix the instant first.** A repair count is meaningless without the moment it
counts from, because every change accumulates fixes forever
([a count carries its predicate](../../../../_laws.md#count-carries-predicate)).
A freeze, a release cut, a promotion to a stable branch — any declared instant
after which the change was supposed to be finished — turns an unbounded number
into a comparable one. Without it there is no denominator and no comparison.

**The unit is the feature, not the file and never the author.** A feature is
identified by the commits that landed it, and the repairs are the later changes
that reference or touch that landing
([identity survives reuse](../../../../_laws.md#identity-survives-reuse)). File
granularity splits one feature across a subsystem and merges unrelated work
that shares a file; author granularity turns a delivery measurement into a
performance review, which is a different activity under different rules
(see people-analytics-ethics).

**Class the repairs; do not only count them.** The count is the weakest thing
the stream carries. A feature with two dozen low-severity deparse and
formatting fixes is in better shape than one with a handful of fixes that are
each a security boundary, a wrong-user-identity check, an out-of-bounds write,
or an invalid state transition in a recovery path. Rank on the worst class
present and the shape of the distribution, and let the raw count break ties.

**Normalize by the surface that was repaired.** Seven fixes concentrated in a
single small module is a denser and more alarming signal than seventeen spread
across a large subsystem that was always going to need settling. Density is
fixes over surface touched, and a raw ranking without it systematically
flatters small, badly-behaved changes.

## What the signal licenses, and what it does not

This is the discriminator, and it is the whole reason to write the technique
down rather than to eyeball a fix list:

- **Licensed: an inference about undiscovered defects.** A dense stream of
  serious repairs in a critical area is evidence that the area still holds
  defects nobody has found yet. The repairs are a sample of a population, and a
  sample that keeps producing severe members is not usually exhausted. This is
  the argument that justifies pulling the change.
- **Not licensed: an argument from scope erosion.** "The feature has been cut
  back so far that we would not have accepted it in this form" is a real
  observation and a *different* one. It is a judgment about whether the
  remaining feature is worth having, not evidence about defects, and treating
  it as a pull argument makes the perfect the enemy of the good. Keep the two
  arguments separate in the write-up or they will be conflated in the
  discussion.

The honest register for the licensed inference is probabilistic: past repair
history is not a guarantee of future defects, but it is not a
contraindication either.

## Circulating the ranking

The ranking is an **agenda item, not a verdict**, and the gap between those two
readings is where this technique does its damage. A list of features ordered by
how alarming they are, sent to a group, is read by some recipients as a
proposal to act — and the distance from "worth discussing" to "I will prepare
the revert" can be under half an hour, at which point participants who have not
been watching the thread cannot tell whether a decision was taken or a
conversation started. Say which one it is in the message that carries the
ranking, and say what the next step actually is.

When the ranking is machine-generated — a model asked to read the repair
history and order the features — two rules apply. **A human filters before
circulation**: the model's severity judgments are worth having and its
editorial asides about the people involved are not, and an unfiltered ranking
imports a tone nobody chose into a decision about someone's work. And the
generated ranking is a *draft finding* that is verified against the underlying
commits before anyone acts, not a result.

## Severity cannot be read off the subject line

The classing step is where an automated version of this measurement fails, and
it fails in the direction that does most damage: **toward alarm**. A keyword
classifier over commit subjects cannot tell a repair from a hardening, and the
vocabulary of the two is identical. A commit that *adds* a guard against a
crash, a change that makes spans survive a crash, and a commit that fixes an
actual crash all carry the same words; a change that introduces security
tooling and one that fixes a security defect share a type prefix. Measured on a
real repository, three of the four highest-ranked units were promoted by
exactly these confusions, and every correction came from opening the commit.

So the count and the density are mechanical and the **class is not**. Generate
the ranking automatically, then read the repairs at the top of it before the
ranking is shown to anyone — the same human filter the circulation rule already
requires, applied one step earlier. A severity distribution nobody opened is a
keyword histogram wearing a risk label, and it will nominate the team that
writes the most careful commit messages about hardening its own code.

## When not to use this

Do not read absence of repairs as evidence of health. A feature nobody has
exercised produces no repair stream for the same reason an unused code path
produces no bug reports, and reporting that as clean converts "we have not
looked" into a claim
([unknown is not a value](../../../../_laws.md#unknown-is-not-a-value)). Report
the exposure alongside the density, or report neither.

Do not make it a target. A repair-density goal is met by landing fewer visible
fixes, not by shipping fewer defects — the team learns to fold repairs into
unrelated changes, and the signal that was the cheapest evidence available
becomes the first thing suppressed.

Do not rank people with it. The stream measures a change's settling cost, which
is dominated by the ambition and the surface area of what was attempted; the
engineers who take on the frightening work will always top the ranking, and a
measurement that punishes them produces a team that stops attempting it.
