---
layer: technique
type: technique
subject: interview-round-design
technique: phase-to-competency-mapping
status: forged
laws: [absence-of-evidence-is-not-evidence, a-verdict-is-bound-to-what-it-judged, inference-must-look-like-inference]
shared_with: []
use_when: [specifying what a round actually does minute by minute at the competency level, checking a round can produce the ratings its scorecard expects, designing an early-career interview]
---

# Phase-to-competency mapping

A round is not one undifferentiated conversation; it is a short ordered sequence of
**phases**, and the mapping from phases to competencies is what makes a round auditable
before anyone runs it. The mapping answers, in advance: does this round actually produce
every rating its scorecard asks for, and is any rating produced by nothing?

## The six fields a phase carries

Each phase is specified with six fields, and a phase missing any of them is
underspecified in a way that shows up later as an unratable competency:

1. **Goal** — what this phase is for, in one sentence, in terms of what the process
   learns. Not the topic; the learning.
2. **Probe** — the actual opening move. Written out, not gestured at. If the round is
   machine-conducted this is the instruction; if human-conducted it is the question the
   interviewer starts from and may follow up around.
3. **What to listen for** — the observable behaviours that distinguish a strong reading
   from a weak one. This is the bridge to the rubric: what is listened for here must be
   the same behaviour the scorecard's anchors describe, or the round and the instrument
   are measuring different things. The strongest form of this field names two points on
   the scale inline — what a top reading looks like and what a weak one looks like — so
   the assessor carries a miniature anchor pair into the moment rather than reconstructing
   the rubric from memory afterwards.
4. **Duration** — a target in minutes. Durations are the honesty check on the whole
   design: a round specified with six phases and forty minutes will drop the last two,
   every time, and the competencies they feed will silently go unrated.
5. **Competencies fed** — the named axes this phase produces evidence for, from the
   role's assessment plan. Usually one or two. A phase claiming five is a phase that
   will produce a general impression labelled five ways.
6. **Grounding** — whether the phase runs on shared material (the same for every
   candidate) or on candidate-specific material. This flag is what makes comparability
   enforceable; the shared-material technique owns the rule it enforces.

## The two checks the mapping exists to run

**Coverage.** Take the scorecard's competency list and the phase table, and join them.
Every competency the scorecard will ask for must be fed by at least one phase. A
competency the round cannot feed does not become a guessed rating: it is recorded as
unassessed, per
[absence-of-evidence-is-not-evidence](../../../_laws.md#absence-of-evidence-is-not-evidence).
Better still, it is removed from that round's scorecard and assigned to a round that
can actually produce it — which is the loop-level fix and the reason this mapping and
the ownership map are the same conversation.

**Feasibility.** Sum the durations. Add the opening, the closing, and the candidate's
questions. If the total exceeds the round's length, the design has already decided which
competencies go unrated; it just has not admitted which. Cut phases deliberately rather
than letting the clock cut them.

The arithmetic has a subtlety worth stating, because it is where published plans start
lying. Phase durations are usually written as ranges ("three to four minutes"), and a
plan built from the lower bounds sums to less than the round's advertised length. That
slack has to be assigned somewhere explicit — absorbed by a named phase, usually the
last — so that the round's stated duration and the end of its final phase never
disagree. A plan whose header says twenty-two minutes and whose blocks end at nineteen
is a plan that will be run for three unplanned minutes by whoever is holding the clock,
which is the least designed part of the conversation getting the most improvisation.

## The uptake phase: score the response to the intervention, not the answer

One phase type is worth specifying in detail because it is the highest-yield phase in
most loops and the easiest to run wrongly: the phase that introduces a **deliberate
intervention** mid-problem — a hint, a correction, or a gentle piece of pushback on
something the candidate just said.

The specification that makes it work: *the thing being rated is the uptake, not the
answer.* Whether the candidate ultimately gets the problem right is weakly informative
and already covered by the phases before it. What this phase measures is what happens
when new information arrives from someone who might know better: do they integrate it,
do they defend, do they collapse and abandon a position that was actually correct, do
they ask what the hint implies. That behaviour is the closest thing an interview
produces to a preview of working with the person, and it typically feeds two
competencies at once — something like coachability and something like reasoning under
correction.

Three conditions:

- **The intervention is scripted, not improvised.** It is the same hint, delivered at
  the same point, for every candidate. An improvised hint given only to candidates who
  are struggling turns the phase into a measurement of who needed help.
- **The instruction says explicitly what is scored.** "Score the uptake" written into
  the phase spec, because the default human and machine behaviour is to score the answer,
  and the phase's whole value is in overriding that default.
- **It goes on shared material.** An intervention only means the same thing if the thing
  being intervened in is the same thing.

## Early-career loops need more phases, not fewer

Where the candidate's record is thin, the conversation has to carry more of the
evaluation, and the mapping is the mechanism. A senior loop can allocate several
competencies to "we read the record and probed it"; an early-career loop cannot, because
the record does not hold enough to ground a verdict. Its phases therefore trend toward:
a shared problem to reason through, a designed intervention, one grounded discussion of
something the candidate actually built, and an explicitly personal phase for motivation.
The result is a round with more, shorter, more tightly specified phases than an
experienced-hire round — which is the opposite of the intuition that junior interviews
should be lighter.

The corollary is a boundary: the readings this mapping produces are *evidence from a
conversation*, and where a phase is really producing a hypothesis about a person rather
than an observation, it must be labelled as one, per
[inference-must-look-like-inference](../../../_laws.md#inference-must-look-like-inference).
The potential-assessment subject owns the craft of reading a thin record; this technique
owns making sure the round is structured well enough to give that craft something real
to read.

## Versioning

A phase table is an instrument. When it changes — a phase dropped, a probe rewritten, a
competency reassigned — ratings produced under the old table do not silently become
ratings under the new one, per
[a-verdict-is-bound-to-what-it-judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged).
Stamp the version onto the round record at the moment the round is run, so a later
comparison across a cohort can tell whether it is comparing like with like, and so that
a revision does not retroactively mark an old rating as off-script.

## When not to use this

- **Unstructured by design.** A genuinely exploratory conversation — a first contact
  with a passive candidate, a coffee with a referral — should not be phase-mapped,
  because it is not producing comparable ratings. If it starts producing them, map it.
- **Rounds with a single competency and a single activity.** A live work sample with one
  axis does not need a phase table; it needs a rubric. Do not manufacture phases to fill
  a template.
- **Panel rounds where phases are people.** When a round is several assessors in
  sequence, the unit of specification is the assessor's assignment, not a phase — the
  same six fields apply, with "who runs it" replacing duration as the first constraint.
