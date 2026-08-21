---
layer: technique
type: technique
subject: llm-era-work-sample-design
technique: authorship-verifying-debrief-questions
status: forged
laws: [inference-must-look-like-inference, uncertainty-resolves-toward-the-candidate, say-only-what-the-record-holds]
shared_with: []
use_when: [running the live conversation after a submission, writing follow-up questions for a work sample, deciding where a work sample is actually scored]
---

# Authorship-verifying debrief questions

The debrief is where the work sample is scored. Not "also scored" — scored. The
submission is a record of decisions to be interrogated; the interrogation is the
measurement. A process that grades the artifact and then holds a friendly
walkthrough has kept the old instrument and added a ritual.

The debrief cannot ask "did you write this". It asks questions whose answers
require having *understood* the decisions, and it reads the shape of the
answers. Three question forms do almost all the work.

## The three forms

- **The why.** "Why this approach here?" A defensible answer references the
  constraints the brief actually stated. A delegated answer describes what the
  code does, restates the approach in different words, or offers a generic
  virtue ("it's cleaner and more maintainable") that would fit any approach.
- **The rejected alternative.** "What else did you consider, and what made you
  drop it?" This is the hardest form to reconstruct after the fact, because the
  rejected path leaves no trace in the artifact. A person who decided can name
  the alternative *and its specific cost*. A person who received an answer has
  nothing to draw on but plausible-sounding generic alternatives, which is
  audible: the alternatives are textbook and the reasons are symmetrical.
- **The counterfactual.** "What would have changed this decision?" — volume ten
  times higher, the constraint relaxed, a different consumer downstream. This
  probes whether the decision was made against a model of the problem or simply
  arrived. It is also the most fair of the three: it is answerable by anyone who
  understands the design, regardless of who typed it.

Add a fourth when a mid-flight change was used: **what the change cost.** "What
did you keep, what did you throw away, and what would you have done in the first
hour knowing this?" It compounds all three forms into one question rooted in
something that happened during the exercise.

## Procedure

1. **Prepare from the submission, not from a template.** Pick two or three
   planted probes the candidate actually reached, plus the log entry that best
   contradicts the work. Anchor each question to *which defensible option they
   shipped* at that probe — a question about a decision they visibly made is
   unanswerable by anyone who did not make it, while a question about the
   subject area is answerable by anyone. Generic follow-ups produce generic
   answers.
2. **Cap the set at about six questions.** Enough to triangulate across
   several probes; past that the debrief becomes an interrogation, and the
   candidate-experience cost buys no additional signal because the same weak
   pattern has already shown up three times.
3. **Open on the candidate's own claim.** Quote a decision from their log or
   their work, then ask the why. Starting from their words removes the
   interrogation framing and gives them a fair footing.
4. **Follow the chain.** Why, then the rejected alternative, then the
   counterfactual, on the same decision. The gap between forms is where a
   reconstructed answer breaks down; jumping between topics lets it hide.
5. **Ask them to extend.** A small change made live, discussed aloud, on their
   own submission. It surfaces whether they can navigate their own artifact —
   whether they know where things are — without becoming a live-coding round.
6. **Record observations, not conclusions.** "Could not name a rejected
   alternative for the retry decision" is an observation. "Did not write the
   code" is a conclusion the conversation does not support.
7. **Keep the interviewer's own notes internal.** What to listen for and what
   counts as a red flag are prepared in advance and never shown to the
   candidate — disclosed, they are an answer key, and the exercise stops being
   comparable across a cohort.

## Decision rules

- **When the answers are fluent but generic across every probe, that is a weak
  result, recorded as a weak result** — not as an accusation.
  [say-only-what-the-record-holds](../../../_laws.md#say-only-what-the-record-holds):
  the record holds "could not substantiate the reasoning when asked", and that
  is enough to decide on. It does not hold "the submission was not theirs".
- **When the evidence is ambiguous, resolve toward the candidate.** A nervous
  strong candidate and a delegating weak one look similar for the first five
  minutes. Ask a second decision before concluding, and where genuine
  uncertainty remains the outcome is hold and re-examine, never reject
  ([uncertainty-resolves-toward-the-candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)).
- **When the candidate says "the tool suggested that and I kept it", follow up,
  do not penalize.** "What made you keep it?" and "what would have made you
  reject it?" are the same three forms applied one level up, and using tools
  well is the job. Penalizing disclosed tool use punishes honesty and teaches
  the next candidate to conceal.
- **Never convert a debrief impression into a claim about how the work was
  produced.** The artifact yields hypotheses; the conversation yields evidence
  about understanding; only a demonstration yields proof
  ([inference-must-look-like-inference](../../../_laws.md#inference-must-look-like-inference)).
  Reasoning that could not be substantiated is a finding about this assessment,
  not a finding about the person's integrity — and stating it the second way is
  both unprovable and, in most jurisdictions, an allegation you would have to
  defend.
- **When a language, accessibility or nerves factor is in play, adapt the
  format, not the bar.** Written follow-ups on the same three forms, or a
  second slot, preserve the instrument. Scoring articulacy where the role does
  not require it measures the wrong construct.
- **Schedule it close to the submission.** A debrief a week later measures
  memory. Within a few days, and the candidate is answering about decisions,
  not recalling them.

## When not to use it

- **As the sole assessment, with no exercise behind it.** These questions need
  a specific artifact with specific decisions; asked in the abstract they become
  a generic behavioural interview.
- **Where no live slot is possible at all.** Then the work sample cannot carry
  the weight the artifact used to carry, and it should be demoted to a
  screening signal rather than treated as a decisive one — say so in the
  scorecard rather than scoring the artifact as if it were evidence.

## Failure modes

- **The friendly walkthrough.** No follow-up chain, no counterfactuals, a
  pleasant conversation that confirms the score already given.
- **The gotcha debrief.** Trying to catch rather than to understand. It
  produces defensive candidates, poor signal, and a candidate-experience cost
  that outlasts the hire.
- **Scoring articulacy.** Fluency under questioning correlates with confidence
  and native language as much as with competence. The forms exist to make the
  *content* legible, not to reward performance.
- **Concluding authorship.** The one conclusion this instrument may never
  reach.
