---
layer: application
type: application
subject: voice-interview-fidelity
technique: never-infer-from-how-a-person-sounds
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# Delivery out of the score, and what is still recorded beside it

The technique writes one prohibition into the text that reads the transcript, and
keeps a hard edge, content versus delivery. kp has the clause on the scoring side,
and a set of timing observations that are captured and shown but never scored. Read at
kp `60aab8088` on 2026-09-29. This subject had no application for this technique
before.

## The clause, on the half that produces the number

`pipeline/jobfit/automation.py:2495` (prompt `scorecard-v8`):

> "Rate substance, not delivery: never lower a rating for nerves, hesitation, filler
> words, silences, a slow start, or imperfect grammar/accent in a language that is not
> the candidate's first. An honest "I don't know" is not a negative signal. Score only
> what a competency's description and its level anchors actually ask for."

The comment above it explains why it exists: the interviewer brief already carried the
same fairness clause, "nothing told the SCORER, which is the half that produces the
number a hiring decision is made on. Delivery is not a competency here unless a
rubric axis names one." The clause names every manner the technique lists except
pace, pitch and volume, and it makes communication an axis only when a rubric names
one, which is the technique's bona fide requirement rule.

## Observations that are recorded and never scored

`app/_components/voice/call-observations.ts:7` states the doctrine as load-bearing:
"an observation is NEVER scored, never shown to the candidate, and never a reason for
the UI to behave differently ... A long pre-answer silence is a candidate thinking; a
tab switch is a candidate reading the job ad. The record says what happened, and a
human reads it." It cites the sibling subject's rule that observed process is
supporting and not load-bearing. `answerTiming` returns `null` for a missing input and
never a zero, so an unmeasured pre-answer gap cannot read as an instant answer.

`app/_lib/interview-telemetry.ts:23` also records `talkRatio` (candidate share of
words), `longestResponseGapSec` and a hint `responseSec`. Their comment glosses the
longest gap as "the time-to-recovery proxy: a long stall after a hard probe is signal
the scorecard can't see".

## Confirmed, deviating

- **Confirmed** — the prohibition is written into the scoring prompt, in the
  affirmative form, next to the constraints that cannot afford a violation, with the
  "I don't know" half.
- **Confirmed** — the timing observations are excluded from the score by doctrine,
  and their absence is null, not zero.
- **Open edge, not a verdict** — the technique's line is *entry into an assessment*,
  and for a human decision a recruiter's view of `talkRatio`, gap lengths and
  pre-answer silences is part of the assessment. The recorded gloss ("a long stall
  after a hard probe is signal") is a reading of delay as information about the
  candidate, which the technique says a hesitation is not. The doctrine says only that
  "a human reads it"; whether the display carries any caveat was not checked, and
  whether recruiters weight these figures was not measured.
- **Not traced** — how the director consumes the `answer_timing` events; the
  observation doctrine says never, and the consuming code was not read.
- **Not checked** — the interviewer-side half of the technique's edge: whether the
  agent's own endpointing cuts off slow or hesitant speakers before the transcript
  ever exists. kp's voice path moved to a semantic end-of-turn setting on
  2026-09-18 (per the registry's own applied ledger), and that is the relevant
  control; it was not re-read here.
