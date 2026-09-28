---
layer: application
type: application
subject: ai-interviewer-brief-authoring
technique: one-question-per-turn-and-wait
stack: node
verified_on: 2026-09-26
verified_against: node@24
---

# One question per turn: the rule, three detectors, and the fixtures that pass

## The rule

`PERSONA_ONE_QUESTION` (`app/_lib/student-interview.ts:161`) is the second line of
the shared persona block every builder composes:

```
"Ask exactly ONE question per turn and wait for the answer before asking the next
— never bundle a second question or a follow-up into the same turn. This matters
most with nervous, terse, or quiet candidates: keep each prompt short and single,
and give them room to answer."
```

A constraint on content, stated affirmatively, with the wait written out — the
half the technique says gets dropped. The comment above it (`:159-160`) records
why it exists: "the model tends to bundle two asks per turn". The rambling and
off-topic rules the technique pairs with it live in the condensed craft
paragraph (`:175-176`): "set a concrete expectation up front and politely cut in
at natural pauses every time it recurs; close off an off-topic question in one
line, then return to yours". Interruption is authorised, and authorised every
time, which is the technique's answer to its own second quiet failure.

## The detectors

Three checks read the rule off transcripts, and all three count question marks:

- `_is_double_barreled` in `pipeline/jobfit/eval/interview_eval.py:516-520` — two
  or more "?" — documented as "a lower bound, not an exhaustive count", with the
  one-"?" compound named as a known miss;
- `oneQuestion` in `app/_lib/interview-sim/detectors.ts:934-942`, a rule verdict
  in the simulator, whose note says the same ("a lower bound: a one-"?" compound
  is a known miss");
- the `doubleBarrelledTurns` counter at `detectors.ts:252`.

Labelled lower bounds are the honest form of a cheap check, and this tree labels
all three. What no check counts is askable propositions.

## What the lower bound lets through

Run over the tree's committed golden transcripts
(`pipeline/jobfit/eval/interview_golden.json`, hand-written "to satisfy every
invariant" for the CI reliability path), 2026-09-26: all eight interviewer turns
carry exactly one "?". Setting aside the two openings and two closings, which the
technique exempts as frame, three of the remaining four stack —

- "Why event-sourcing there rather than a simpler transactional table — what did
  it buy you, and what broke first when you introduced it?" (three propositions);
- "Let's keep going: what did you build, and what part did you decide yourself?"
  (two);
- "why that structure over a simpler one, and what would you change now?" (two).

The fourth — "Say the volume went 100x on a peak day … What changes first in that
design?" — is the technique's one-question-with-a-premise, done right. Each of the
three has one "?", so all three detectors pass them. The first
is the multi-part question the technique opens with, almost word for word.

## Deviation

The fixtures that define a passing interview violate the rule the brief states
first, and the checks built on them agree that they pass. The standard's position:
a question-mark count stays labelled as a lower bound — as it is here — and the
canonical passing fixtures are held to the stricter count, because they are what
every later detector is calibrated against. Not fixed in the tree.
