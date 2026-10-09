---
layer: technique
type: technique
subject: llm-dialogue-quality-control
technique: candidates-under-rotating-constraints
status: forged
laws: [a-budget-shapes-the-output, grade-against-what-ships-not-on-a-curve]
shared_with: []
use_when: [deciding how many candidates a dialogue slot gets, generated candidates all read as rewordings of one line, spending a generation budget across a script]
---

# Candidates under rotating constraints

The named concern: give each dialogue slot many candidates, made to differ in the shape of the
line rather than only in its wording, so that the selection step has something specific to
select.

## Why one sample is not enough, and why temperature is not the answer

A single sample is drawn near the model's idea of the typical line for the situation, and the
typical line is the generic one. Asking for more samples at a higher temperature varies the
words while keeping the shape: twenty rewordings of one sentence, with the same length, the
same move and the same emotional statement. A judge choosing among them is choosing the best
paraphrase of the median. Diversity that helps lives in **structure** — what move the line
makes, how long it is, what it leaves unsaid, where it starts — and the generator only varies
structure when it is told to.

## The constraint deck

Build a deck of constraints per slot class, each a positive instruction about the line's shape.
Useful axes:

**Length.** Under four words; one sentence; two short sentences; an interrupted fragment.
**Content.** One concrete noun required; no adjectives; a number in the line; open on a verb.
**Move.** Answer with a question; refuse; change the subject; concede and take something back;
make an offer; say something true about the other person. **Where the meaning sits.** In an
object, a task the speaker is doing, a name the speaker uses or avoids, a number, a silence
written as an action. **Entry point.** Start mid-thought; start with the other person's last
word; start with a verb. **Register pressure.** Colder than usual; warmer than the speaker
would admit; more formal under strain.

Each candidate draws one or two constraints, and the deck rotates so that the slot's batch
covers different axes rather than repeating the favourite one. Record the constraint with the
candidate. The constraint is withheld from the judge, so the judge cannot reward or punish the
recipe; it is kept in the record, so that over many slots the line learns which constraints
produce lines that survive, and the deck is reweighted toward them.

Generate one slot per call, and the batch in **at least two calls with different
constraints**. A call asked for a plain numbered list of ten anchors on its first item and
drifts back toward it, and a call asked to fill several slots at once fills a list rather than
answering a situation.

## Asking for the unlikely end

The exception to the anchoring problem is a call that asks for the spread on purpose. Asking
the model for several candidates together with how likely each one is, and for some drawn from
the low-probability end — "twelve options, four of them lines this speaker would say that most
writers would not think of" — has been measured to raise the diversity of creative output
substantially over plain sampling. It works because it names the distribution the model would
otherwise collapse, and it gives the selection step the surprising candidates that a
typicality-biased generator never volunteers. Reserve a fixed share of every important slot's
batch for that band, and do not let the judge know which candidates came from it. Keep each
such call to a handful of candidates and reach the batch over several calls: the measured
method's own authors report that quality degrades when one call is asked for too many. And its
gain is measured as distance between meanings, not as variety of shape, so it complements the
constraint deck rather than replacing it.

## How many

Ten to twenty for a line that matters, fewer for a line that does not. The count is part of the
slot's specification, scaled to how often and how prominently the player meets the line: a
line at the turn of the story, heard once and remembered, earns twenty; a high-frequency bark,
which the player will hear many times and which must survive repetition, earns enough to fill
its variant pool plus a margin; a filler acknowledgement earns three. A flat count across a
script spends the budget evenly on lines of uneven weight, which is the budget misread as a
ceiling rather than an instruction, against
[a budget shapes the output, it does not only cap it](../../../../_laws.md#a-budget-shapes-the-output).

Before judging, remove near-duplicates — candidates that share most of their words, or the
same move with the same length — and report how many distinct candidates the judge actually
received. Twenty candidates that collapse to four distinct ones are four candidates.

## Selection is against the standard, not the batch

A wide batch tempts a team to ship its best member. The best of twenty generic lines is still
generic, and the judge scores against shipped dialogue a lead would keep, not against the other
nineteen, which is
[grade against what ships, not on a curve](../../../../_laws.md#grade-against-what-ships-not-on-a-curve).
When no candidate clears the bar, the slot goes back to specification — the situation, the want,
the voice entry — rather than to a bigger batch, because twenty more samples from an
underspecified prompt are twenty more answers to the wrong question.

## Decision rules

- **When the candidates for a slot share one length and one move, rotate the constraints**,
  not the temperature.
- **When a slot's whole batch fails the bar, fix the specification before regenerating.**
- **When near-duplicates are removed, judge only if enough distinct candidates remain**; below
  that, regenerate with unused constraints.
- **When a constraint's candidates rarely survive judging across many slots, retire it** from
  that slot class's deck — after a person has read a sample of what it produced, because a
  judge's survival rate alone retires the constraints that resist the judge's own taste, and
  the deck then drifts toward the typical line it exists to escape. A shape constraint is also
  scored against a budget it was told to miss, so read its losses as possibly the rubric's.
- **When a slot is a bark that repeats, generate for the variant pool**, then judge the pool
  as a set for internal repetition.

## When not to use this

Lines that are fixed by function — a rule stated to the player, a control prompt — need one
clear wording, not a batch. A slot already filled by a person's line does not need candidates
to compete with it.

## Evidence status

That sampling many candidates and selecting improves generated output over a single sample is
well supported in published work on model generation and reranking, mostly outside dialogue.
That preference tuning biases models toward typical completions, and that asking for a
verbalized distribution of candidates raises measured creative-writing diversity to roughly
one and a half to two times plain sampling, comes from a primary measured paper; its diversity
is mean pairwise distance between response embeddings, it reports larger gains in more capable
models, and it was never compared with constraint rotation. That lists generated in one call converge on
their first item, and that constraint rotation yields more structural diversity than
temperature, are practitioner reports without a controlled measurement here. One recorded
dialogue run of 456 candidates in four constraint batches had the concrete-object and
unlikely-angle batches supply 33 of 45 slot winners and the length-only batch 5, with batch
means within 0.15 of each other; the winners were chosen by judges of the generator's family,
so it says which shapes those judges rewarded, not which shapes play. The ten-to-twenty count and the scaling by slot weight are a
practitioner heuristic. None of this has been tested in a played game.
