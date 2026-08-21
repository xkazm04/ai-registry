---
layer: technique
type: technique
subject: llm-era-work-sample-design
technique: mid-flight-requirement-change
status: forged
laws: [a-candidates-process-never-stalls-on-your-constraints, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [an exercise can be completed in one pass, designing the second phase of a work sample, simulating stakeholder reality inside an assessment]
---

# Mid-flight requirement change

A brief that never moves can be satisfied in one pass. Introduce a change to
the requirements *while the work is underway* and the exercise acquires a
dependency between two phases: the second phase cannot be done without knowing
what the first phase committed to. That dependency is what a single generation
pass cannot absorb, and it is also the most faithful simulation of the actual
job that fits inside two hours.

## The two properties that make it work

Both are easy to lose, and losing either turns the change into theatre.

- **It must plausibly come from a stakeholder.** A named person with a reason —
  a volume forecast revised, a downstream consumer with a need nobody surfaced,
  a compliance constraint that landed. Phrased the way that person would phrase
  it, in their vocabulary, with their level of technical precision (usually
  low). An obviously artificial "new requirement!" announcement tells the
  candidate they are inside a test and moves them into performance mode, where
  they optimize for looking adaptable rather than being it.
- **It must genuinely affect work already underway.** If the change can be
  satisfied by appending a function, it measures nothing. It has to make an
  earlier decision either wrong or expensive, so the candidate faces a real
  fork: adapt what exists, or discard and redo. Both are defensible; the
  reasoning is the signal.

## Procedure

1. **Design the change against a specific earlier decision.** Pick a probe from
   the first phase and write the change so that one of its defensible options
   becomes costly under the new constraint. Now the candidate's own earlier
   choice determines what the change costs them — which is exactly what happens
   at work.
2. **Write it in a stakeholder's voice.** Include the business reason. Do not
   include the implication for the code; discovering that is the exercise.
3. **Time it to land after commitment, before exhaustion.** About a third of
   the way into the intended budget is the working default: late enough that
   real decisions exist to revisit, early enough that adapting is still
   answerable inside the timebox. Too early and there is nothing to invalidate;
   past the halfway mark and the candidate has no room to respond, so you
   measure their clock rather than their judgment. Fire it on elapsed *session*
   time — from when they actually started — not on a fixed hour of the day.
4. **State the budget consequence explicitly.** Say whether the time budget
   moves. Most designs should extend it slightly or accept a narrower result —
   never silently expect the same scope plus the change, which converts an
   adaptation test into an unpaid overtime test.
5. **Write the internal note beside it** — what good adaptation looks like and
   what poor adaptation looks like — at design time, and never disclose it. The
   change text the candidate sees is in the stakeholder's voice; the grading
   criterion lives next to it, unseen, exactly as with a probe.
6. **Record what the candidate did with it** as a first-class observation:
   adapt or redo, what they preserved, what they abandoned, whether they went
   back and told anyone.
7. **Carry it into the debrief.** "What did this change cost you, and what
   would you have done differently in the first hour if you had known?" is the
   single highest-yield question in the whole exercise.

## Decision rules

- **When the change can be satisfied by adding, rewrite it.** Additive changes
  measure typing.
- **When the change would invalidate everything, soften it.** Total invalidation
  produces despair, not signal, and disproportionately punishes the candidate
  who got furthest. Aim to invalidate one significant decision, not the design.
- **When a candidate ignores the change, that is data, not a scoring accident.**
  Note it and ask about it live. Some ignore it through time pressure, some
  through a deliberate and defensible scope call — those are different people
  and only the debrief tells them apart.
- **When delivery of the change fails — your channel, your outage, your
  scheduling — do not let it cost the candidate.** Extend the budget or score
  the exercise on the first phase alone, with the second phase recorded as not
  measured. The candidate's process never stalls on your constraints
  ([a-candidates-process-never-stalls-on-your-constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)),
  and a change that arrived ten minutes before the deadline was not the
  instrument you designed.
- **When you revise the change text, the verdicts recorded under the old text do
  not transfer.** A verdict binds to what it judged
  ([a-verdict-is-bound-to-what-it-judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged));
  candidates who saw a different change were assessed on a different instrument,
  and comparing them straight across is a comparison the record cannot support.
  Version the exercise and compare within a version.

## When not to use it

- **Asynchronous exercises with no supervision window.** If you cannot know when
  the candidate started, a timed injection lands randomly — for some people
  before they opened the task, for others after they finished. Either move to a
  session with a known start, or trigger the change on a progress signal the
  candidate produces, not on the wall clock.
- **Very short exercises.** Under an hour there is no "already underway".
- **Where the candidate has explicitly negotiated a fixed scope** as an
  accommodation, or where a scheduling constraint makes a second phase
  impossible. Substitute the equivalent question in the debrief — "the volume
  assumption turns out to be ten times higher; walk me through what changes" —
  which recovers most of the reasoning signal, though not the behavioural one.

## What it does not do

It does not prove authorship. A candidate can pass the change to the same
tooling that produced the first phase, and if the change is small enough, get
away with it. What it does is force *reconciliation* between the change and
decisions already committed, which is the point at which someone who never
understood the first phase starts producing answers that do not fit — visible
immediately in the debrief, where the question becomes what the change cost and
why.
